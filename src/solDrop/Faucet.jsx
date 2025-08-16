import React, { FC, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ConnectionProvider,
  WalletProvider,
  useWallet,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { UnsafeBurnerWalletAdapter } from "@solana/wallet-adapter-wallets";
import {
  WalletModalProvider,
  WalletDisconnectButton,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
// import { clusterApiUrl } from "@solana/web3.js";
import "@solana/wallet-adapter-react-ui/styles.css";
import { Wallet, Sun, Moon, ArrowLeft } from "lucide-react";
import RequestAirdrop from "./RequestAirdrop";
import Balance from "./Balance";

// Component that uses wallet context
const WalletContent = () => {
  const wallet = useWallet();
  const [hasCompletedAirdrop, setHasCompletedAirdrop] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      {/* Wallet Connection */}
      <div className="flex justify-center">
        <WalletMultiButton className="!bg-gradient-to-r !from-blue-500 !to-cyan-600 hover:!from-blue-600 hover:!to-cyan-700 !rounded-lg !font-medium !shadow-lg" />
      </div>

      {/* Request Airdrop Component */}
      <RequestAirdrop onAirdropSuccess={() => setHasCompletedAirdrop(true)} />

      {/* Balance Component - Only show when wallet is connected or airdrop completed */}
      {(wallet.publicKey || hasCompletedAirdrop) && (
        <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
          <Balance />
        </div>
      )}
    </div>
  );
};

const Faucet = () => {
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();

  // Sync dark mode with passed prop
  useEffect(() => {
    // Initialize dark mode
    const isDark = document.documentElement.classList.contains("dark");
    setDarkMode(isDark);
  }, []);

  // Toggle dark mode and update html class
  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const newMode = !prev;
      if (newMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      return newMode;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors p-4 sm:p-6 lg:p-8">
      {/* Dark Mode Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={toggleDarkMode}
          className="rounded-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 shadow transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
          aria-label="Toggle dark mode"
        >
          {darkMode ? (
            <Sun className="w-6 h-6 text-white" />
          ) : (
            <Moon className="w-6 h-6 text-black" />
          )}
        </button>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8 relative">
          {/* Back Button */}
          <button
            onClick={() => navigate("/")}
            className="absolute left-0 top-0 flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors border border-gray-300 dark:border-gray-600"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </button>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 text-gray-900 dark:text-white">
            <span className="bg-gradient-to-r from-blue-500 to-cyan-600 bg-clip-text text-transparent">
              SolDrop
            </span>
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Get free SOL tokens for testing
          </p>
        </div>

        {/* Main Content */}
        <div className="flex justify-center">
          <div className="group relative overflow-hidden w-full max-w-md rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-2xl p-6 bg-white dark:bg-gray-800 transition-all duration-300 transform hover:-translate-y-1">
            {/* Gradient Background on Hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />

            <div className="relative">
              <ConnectionProvider endpoint={"https://api.devnet.solana.com"}>
                <WalletProvider wallets={[]} autoConnect>
                  <WalletModalProvider>
                    <WalletContent />
                  </WalletModalProvider>
                </WalletProvider>
              </ConnectionProvider>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 w-full z-40 py-2 text-center border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
        <p className="text-sm">
          Built for learning purposes • Always verify on mainnet
        </p>
      </div>
    </div>
  );
};

export default Faucet;
