"use client";

import Link from "next/link";
import type { NextPage } from "next";
import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";
import { useWdk } from "~~/contexts/WdkContext";

const Home: NextPage = () => {
  const { address, currentNetwork, isInitialized } = useWdk();

  return (
    <>
      <div className="flex items-center flex-col grow pt-10">
        <div className="px-5 max-w-4xl mx-auto">
          <h1 className="text-center">
            <span className="block text-2xl mb-2">Welcome to</span>
            <span className="block text-5xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              ChainAI
            </span>
            <span className="block text-lg mt-2 text-base-content/70">
              Decentralized AI Model Registry on Avalanche
            </span>
          </h1>

          <div className="flex justify-center items-center space-x-2 flex-col mt-8">
            {isInitialized && address ? (
              <>
                <p className="my-2 font-medium">Connected Address:</p>
                <Address address={address as `0x${string}`} />
                <p className="text-sm text-base-content/70 mt-2">Network: {currentNetwork.displayName}</p>
              </>
            ) : (
              <div className="text-center">
                <p className="my-2 font-medium text-base-content/70">Connect your wallet to get started</p>
              </div>
            )}
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body items-center text-center">
                <div className="text-5xl mb-4">🚀</div>
                <h2 className="card-title">Upload Model</h2>
                <p className="text-sm">Register your AI model Docker images on-chain</p>
                <div className="card-actions">
                  <Link href="/upload-model" className="btn btn-primary btn-sm">
                    Get Started
                  </Link>
                </div>
              </div>
            </div>

            <div className="card bg-base-200 shadow-xl">
              <div className="card-body items-center text-center">
                <div className="text-5xl mb-4">⭐</div>
                <h2 className="card-title">Rate Models</h2>
                <p className="text-sm">Rate AI models based on performance (1-5 stars)</p>
                <div className="card-actions">
                  <Link href="/rate-model" className="btn btn-primary btn-sm">
                    Rate Now
                  </Link>
                </div>
              </div>
            </div>

            <div className="card bg-base-200 shadow-xl">
              <div className="card-body items-center text-center">
                <div className="text-5xl mb-4">🎯</div>
                <h2 className="card-title">Run Inference</h2>
                <p className="text-sm">Select models using weighted algorithm</p>
                <div className="card-actions">
                  <Link href="/prompt" className="btn btn-primary btn-sm">
                    Try It
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12">
            <div className="alert alert-info">
              <div className="w-full">
                <h3 className="font-bold text-lg mb-4">🎮 How It Works</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-semibold mb-2">For Developers:</p>
                    <ul className="space-y-1 list-disc list-inside">
                      <li>Register AI models with Docker URLs</li>
                      <li>Models compete based on ratings</li>
                      <li>Top models get more usage</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold mb-2">For Users:</p>
                    <ul className="space-y-1 list-disc list-inside">
                      <li>Rate models (1-5 stars)</li>
                      <li>70% chance: Top model selected</li>
                      <li>30% chance: Random for diversity</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grow bg-base-300 w-full mt-16 px-8 py-12">
          <div className="flex justify-center items-center gap-12 flex-col md:flex-row">
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <BugAntIcon className="h-8 w-8 fill-secondary" />
              <p>
                Debug your smart contracts using the{" "}
                <Link href="/debug" passHref className="link">
                  Debug Contracts
                </Link>{" "}
                tab.
              </p>
            </div>
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <MagnifyingGlassIcon className="h-8 w-8 fill-secondary" />
              <p>
                Explore transactions with the{" "}
                <Link href="/blockexplorer" passHref className="link">
                  Block Explorer
                </Link>{" "}
                tab.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
