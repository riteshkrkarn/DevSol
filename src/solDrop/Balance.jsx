import React, { useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Eye, EyeOff, RefreshCw } from "lucide-react";

const Balance = () => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [balance, setBalance] = useState(0);
  const [showBalance, setShowBalance] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function getBalance() {
    if (!wallet.publicKey) return;

    setIsLoading(true);
    try {
      const balanceInLamports = await connection.getBalance(wallet.publicKey);
      const balanceInSOL = balanceInLamports / LAMPORTS_PER_SOL;
      setBalance(balanceInSOL);
    } catch (error) {
      console.error("Error fetching balance:", error);
      setBalance(0);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (wallet.publicKey) {
      getBalance();
    }
  }, [wallet.publicKey]);

  const toggleBalanceVisibility = () => {
    setShowBalance(!showBalance);
  };

  const refreshBalance = async () => {
    await getBalance();
  };

  return (
    <div className="space-y-3">
      {/* Balance Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Wallet Balance
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleBalanceVisibility}
            className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 text-gray-600 dark:text-gray-300 rounded text-xs transition-colors border border-gray-200 dark:border-gray-600"
          >
            {showBalance ? (
              <EyeOff className="w-3 h-3" />
            ) : (
              <Eye className="w-3 h-3" />
            )}
            {showBalance ? "Hide" : "Show"}
          </button>
          <button
            onClick={refreshBalance}
            disabled={isLoading}
            className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 text-gray-600 dark:text-gray-300 rounded text-xs transition-colors border border-gray-200 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw
              className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* Balance Display */}
      {showBalance && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
          <div className="text-center">
            {isLoading ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Loading...
              </p>
            ) : (
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {balance.toFixed(4)} SOL
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Balance;
