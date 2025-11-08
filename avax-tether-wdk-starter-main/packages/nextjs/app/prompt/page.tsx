"use client";

import { useState } from "react";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

export default function PromptPage() {
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedModelId, setSelectedModelId] = useState<number | null>(null);
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");

  // Read total models
  const { data: totalModels } = useScaffoldReadContract({
    contractName: "ModelRegistry",
    functionName: "totalModels",
  });

  // Read top models
  const { data: topModels } = useScaffoldReadContract({
    contractName: "ModelRegistry",
    functionName: "getTopModels",
    args: [5n],
  });

  // Write contract - select model
  const { writeContractAsync: selectModel } = useScaffoldWriteContract("ModelRegistry");

  // Read selected model info
  const { data: selectedModelInfo } = useScaffoldReadContract({
    contractName: "ModelRegistry",
    functionName: "getModelInfo",
    args: selectedModelId !== null ? [BigInt(selectedModelId)] : undefined,
  });

  const handleSelectModel = async () => {
    setIsSelecting(true);
    setResponse("");

    try {
      const result = await selectModel({
        functionName: "selectModel",
      });

      // Parse the transaction receipt to get the selected model ID
      notification.success("✅ Model selected successfully!");

      // For now, we'll just notify success. In production, you'd parse the event
      // and get the actual selected model ID from the ModelSelected event
      notification.info("Check the transaction to see which model was selected");
    } catch (error: any) {
      console.error("Error selecting model:", error);
      notification.error(error.message || "Failed to select model");
    } finally {
      setIsSelecting(false);
    }
  };

  const handleSendPrompt = async () => {
    if (!prompt.trim()) {
      notification.error("Please enter a prompt");
      return;
    }

    if (selectedModelId === null) {
      notification.error("Please select a model first");
      return;
    }

    // Simulate API call to model
    setResponse("Processing...");

    // In production, this would call your backend API
    setTimeout(() => {
      setResponse(
        `Mock response from Model #${selectedModelId}:\n\nThis is a simulated response. In production, this would call the actual Docker container endpoint of the selected model with your prompt.`,
      );
    }, 1500);
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4">🎯 AI Model Inference</h1>
        <p className="text-xl text-gray-400">
          Select a model using our weighted algorithm and run inference
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Model Selection */}
        <div className="lg:col-span-1 space-y-6">
          {/* Model Selector */}
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Select Model</h2>
              <p className="text-sm text-gray-400">
                70% chance: Top model
                <br />
                30% chance: Random model
              </p>

              <button
                className="btn btn-primary btn-block mt-4"
                onClick={handleSelectModel}
                disabled={isSelecting || !totalModels || Number(totalModels) === 0}
              >
                {isSelecting ? (
                  <>
                    <span className="loading loading-spinner"></span>
                    Selecting...
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    Select Model
                  </>
                )}
              </button>

              {selectedModelId !== null && selectedModelInfo && (
                <div className="mt-4 p-4 bg-success/20 rounded-lg border border-success">
                  <p className="font-semibold text-success">Selected: Model #{selectedModelId}</p>
                  <p className="text-xs mt-2 break-all">{selectedModelInfo[1]}</p>
                </div>
              )}
            </div>
          </div>

          {/* Top Models Leaderboard */}
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-lg">🏆 Top Models</h2>

              {topModels && topModels[0] && topModels[0].length > 0 ? (
                <div className="space-y-2">
                  {topModels[0].slice(0, 5).map((modelId: bigint, index: number) => {
                    const rating = topModels[1][index];
                    return (
                      <div key={index} className="flex items-center justify-between p-3 bg-base-300 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="badge badge-primary">{index + 1}</div>
                          <span className="font-semibold">Model #{modelId.toString()}</span>
                        </div>
                        <div className="text-sm">
                          ⭐ {(Number(rating) / 100).toFixed(2)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-400">No models rated yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Right: Prompt Interface */}
        <div className="lg:col-span-2">
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Run Inference</h2>

              {/* Prompt Input */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">Your Prompt</span>
                </label>
                <textarea
                  className="textarea textarea-bordered h-32 text-base"
                  placeholder="Enter your prompt here... (e.g., Analyze the sentiment of this text: 'I love this product!')"
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  disabled={selectedModelId === null}
                />
              </div>

              <button
                className="btn btn-primary btn-block mt-4"
                onClick={handleSendPrompt}
                disabled={selectedModelId === null || !prompt.trim()}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                Run Inference
              </button>

              {/* Response */}
              {response && (
                <>
                  <div className="divider">Response</div>
                  <div className="bg-base-300 p-6 rounded-lg">
                    <pre className="whitespace-pre-wrap text-sm">{response}</pre>
                  </div>
                </>
              )}

              {/* Info Box */}
              {selectedModelId === null && (
                <div className="alert alert-warning mt-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="stroke-current shrink-0 h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <span>Please select a model first using the button on the left</span>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="stats stats-vertical lg:stats-horizontal shadow mt-6 w-full">
            <div className="stat">
              <div className="stat-title">Total Models</div>
              <div className="stat-value text-primary">{totalModels ? totalModels.toString() : "0"}</div>
            </div>

            <div className="stat">
              <div className="stat-title">Selection Algorithm</div>
              <div className="stat-value text-sm">70/30 Weighted</div>
            </div>

            <div className="stat">
              <div className="stat-title">Status</div>
              <div className="stat-value text-success text-sm">Active</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
