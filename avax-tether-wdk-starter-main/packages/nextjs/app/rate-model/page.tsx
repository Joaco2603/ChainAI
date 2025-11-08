"use client";

import { useState, useEffect } from "react";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";
import { Address } from "~~/components/scaffold-eth";

interface ModelInfo {
  owner: string;
  dockerImageUrl: string;
  averageRating: bigint;
  ratingCount: bigint;
  timesSelected: bigint;
  isActive: boolean;
}

export default function RateModelPage() {
  const [selectedModelId, setSelectedModelId] = useState<number>(0);
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Read total models
  const { data: totalModels } = useScaffoldReadContract({
    contractName: "ModelRegistry",
    functionName: "totalModels",
  });

  // Read model info
  const { data: modelInfo } = useScaffoldReadContract({
    contractName: "ModelRegistry",
    functionName: "getModelInfo",
    args: [BigInt(selectedModelId)],
  });

  // Write contract
  const { writeContractAsync: rateModel } = useScaffoldWriteContract("ModelRegistry");

  const handleRate = async () => {
    if (selectedRating === 0) {
      notification.error("Please select a rating");
      return;
    }

    setIsSubmitting(true);

    try {
      await rateModel({
        functionName: "rateModel",
        args: [BigInt(selectedModelId), selectedRating],
      });

      notification.success(`✅ Successfully rated model with ${selectedRating} stars!`);
      setSelectedRating(0);
    } catch (error: any) {
      console.error("Error rating model:", error);
      if (error.message?.includes("AlreadyRated")) {
        notification.error("You have already rated this model");
      } else if (error.message?.includes("ModelInactive")) {
        notification.error("This model is inactive");
      } else {
        notification.error(error.message || "Failed to rate model");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const averageRating = modelInfo ? Number(modelInfo[2]) / 100 : 0;
  const ratingCount = modelInfo ? Number(modelInfo[3]) : 0;

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4">⭐ Rate AI Models</h1>
        <p className="text-xl text-gray-400">Help the community by rating model performance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Model Selector */}
        <div className="lg:col-span-1">
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Select Model</h2>
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">Model ID</span>
                  <span className="label-text-alt">
                    Total: {totalModels ? totalModels.toString() : "0"}
                  </span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={selectedModelId}
                  onChange={e => setSelectedModelId(Number(e.target.value))}
                  disabled={!totalModels || Number(totalModels) === 0}
                >
                  {totalModels &&
                    Array.from({ length: Number(totalModels) }, (_, i) => (
                      <option key={i} value={i}>
                        Model #{i}
                      </option>
                    ))}
                </select>
              </div>

              {/* Quick Stats */}
              {modelInfo && (
                <div className="stats stats-vertical shadow mt-4">
                  <div className="stat">
                    <div className="stat-title text-xs">Avg Rating</div>
                    <div className="stat-value text-2xl">{averageRating.toFixed(2)}</div>
                    <div className="stat-desc">{ratingCount} ratings</div>
                  </div>
                  <div className="stat">
                    <div className="stat-title text-xs">Times Selected</div>
                    <div className="stat-value text-2xl">{modelInfo[4].toString()}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Model Details & Rating */}
        <div className="lg:col-span-2">
          {modelInfo ? (
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h2 className="card-title flex items-center justify-between">
                  <span>Model #{selectedModelId}</span>
                  <div className="badge badge-lg badge-success">
                    {modelInfo[5] ? "Active" : "Inactive"}
                  </div>
                </h2>

                {/* Model Info */}
                <div className="space-y-4 mt-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-400">Owner</label>
                    <div className="mt-1">
                      <Address address={modelInfo[0]} />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-400">Docker Image</label>
                    <div className="bg-base-300 p-3 rounded-lg mt-1">
                      <code className="text-sm break-all">{modelInfo[1]}</code>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-gray-400">Average Rating</label>
                      <div className="text-3xl font-bold mt-1">{averageRating.toFixed(2)} ⭐</div>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-400">Total Ratings</label>
                      <div className="text-3xl font-bold mt-1">{ratingCount}</div>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-400">Times Used</label>
                      <div className="text-3xl font-bold mt-1">{modelInfo[4].toString()}</div>
                    </div>
                  </div>
                </div>

                <div className="divider">Rate This Model</div>

                {/* Star Rating */}
                <div className="flex flex-col items-center gap-4">
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        className="btn btn-ghost btn-lg p-2"
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        onClick={() => setSelectedRating(star)}
                        disabled={isSubmitting}
                      >
                        <span className={`text-5xl transition-all ${(hoveredRating || selectedRating) >= star ? "text-yellow-400 scale-110" : "text-gray-600"}`}>
                          {(hoveredRating || selectedRating) >= star ? "⭐" : "☆"}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="text-center">
                    {selectedRating > 0 && (
                      <p className="text-lg font-semibold">
                        You selected: {selectedRating} star{selectedRating > 1 ? "s" : ""}
                      </p>
                    )}
                  </div>

                  <button
                    className="btn btn-primary btn-wide btn-lg"
                    onClick={handleRate}
                    disabled={isSubmitting || selectedRating === 0 || !modelInfo[5]}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="loading loading-spinner"></span>
                        Submitting...
                      </>
                    ) : (
                      "Submit Rating"
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body items-center text-center">
                <p className="text-xl text-gray-400">No models registered yet</p>
                <a href="/upload-model" className="btn btn-primary mt-4">
                  Register First Model
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
