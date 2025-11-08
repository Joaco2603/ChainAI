"use client";

import { useState } from "react";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

export default function UploadModelPage() {
  const [dockerImageUrl, setDockerImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { writeContractAsync: registerModel } = useScaffoldWriteContract("ModelRegistry");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!dockerImageUrl.trim()) {
      notification.error("Please enter a Docker image URL");
      return;
    }

    setIsSubmitting(true);

    try {
      const tx = await registerModel({
        functionName: "registerModel",
        args: [dockerImageUrl],
      });

      notification.success("✅ Model registered successfully!");
      setDockerImageUrl("");
    } catch (error: any) {
      console.error("Error registering model:", error);
      notification.error(error.message || "Failed to register model");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4">
          🚀 Upload Your AI Model
        </h1>
        <p className="text-xl text-gray-400">
          Register your Docker-packaged AI model on the blockchain
        </p>
      </div>

      <div className="card bg-base-200 shadow-xl">
        <div className="card-body">
          {/* Info Box */}
          <div className="alert alert-info mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="stroke-current shrink-0 w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <div>
              <h3 className="font-bold">Docker Image Requirements</h3>
              <ul className="text-sm mt-2 space-y-1">
                <li>• Must be publicly accessible</li>
                <li>• Example: docker.io/your-username/model-name:tag</li>
                <li>• Model should expose an inference endpoint</li>
              </ul>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text text-lg font-semibold">Docker Image URL</span>
              </label>
              <input
                type="text"
                placeholder="docker.io/chainai/sentiment-analysis:v1.0.0"
                className="input input-bordered w-full text-lg font-mono"
                value={dockerImageUrl}
                onChange={e => setDockerImageUrl(e.target.value)}
                disabled={isSubmitting}
              />
              <label className="label">
                <span className="label-text-alt text-gray-400">
                  Include the full registry path and version tag
                </span>
              </label>
            </div>

            <div className="card-actions justify-end mt-8">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setDockerImageUrl("")}
                disabled={isSubmitting}
              >
                Clear
              </button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting || !dockerImageUrl.trim()}>
                {isSubmitting ? (
                  <>
                    <span className="loading loading-spinner"></span>
                    Registering...
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
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    Register Model
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Examples Section */}
          <div className="divider mt-8">Examples</div>
          <div className="grid grid-cols-1 gap-3">
            <div className="bg-base-300 p-4 rounded-lg">
              <code className="text-sm">docker.io/chainai/sentiment-analysis:v1.0.0</code>
              <p className="text-xs text-gray-400 mt-2">Sentiment Analysis Model</p>
            </div>
            <div className="bg-base-300 p-4 rounded-lg">
              <code className="text-sm">ghcr.io/username/text-generation:latest</code>
              <p className="text-xs text-gray-400 mt-2">Text Generation Model</p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>
          💡 After registration, your model will be available for selection and rating by the community.
        </p>
      </div>
    </div>
  );
}
