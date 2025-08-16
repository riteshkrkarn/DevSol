import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  LAMPORTS_PER_SOL,
  SystemProgram,
  PublicKey,
  Transaction,
} from "@solana/web3.js";
import React, { useState } from "react";

const SendTokens = () => {
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "success" or "error"

  const wallet = useWallet();
  const { connection } = useConnection();

  async function handleSendTokens() {
    if (!wallet.connected || !toAddress || !amount) {
      setMessage("Please connect wallet and fill all fields");
      setMessageType("error");
      return;
    }

    try {
      setIsLoading(true);
      setMessage("");
      const transaction = new Transaction();
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: wallet.publicKey,
          toPubkey: new PublicKey(toAddress),
          lamports: parseFloat(amount) * LAMPORTS_PER_SOL,
        })
      );

      const signature = await wallet.sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature);

      setMessage(
        `Transaction successful! Signature: ${signature.slice(0, 20)}...`
      );
      setMessageType("success");
      setToAddress("");
      setAmount("");
    } catch (error) {
      console.error("Transaction failed:", error);
      setMessage("Transaction failed: " + error.message);
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">
        Send SOL
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Recipient Public Key
          </label>
          <input
            type="text"
            value={toAddress}
            onChange={(e) => setToAddress(e.target.value)}
            placeholder="Enter recipient's public key"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Amount (SOL)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount in SOL"
            step="0.01"
            min="0"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>

        <div className="relative">
          <button
            onClick={handleSendTokens}
            disabled={!wallet.connected || isLoading || !toAddress || !amount}
            className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-2 px-4 rounded transition duration-200 group"
            title={
              !wallet.connected
                ? "Please connect your wallet first"
                : !toAddress
                ? "Please enter recipient's public key"
                : !amount
                ? "Please enter amount to send"
                : ""
            }
          >
            {isLoading ? "Sending..." : "Send SOL"}

            {/* Tooltip */}
            {(!wallet.connected || !toAddress || !amount) && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-10">
                {!wallet.connected
                  ? "Please connect your wallet first"
                  : !toAddress
                  ? "Please enter recipient's public key"
                  : "Please enter amount to send"}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
              </div>
            )}
          </button>
        </div>

        {message && (
          <div
            className={`p-3 rounded-md text-sm ${
              messageType === "success"
                ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border border-green-300 dark:border-green-700"
                : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border border-red-300 dark:border-red-700"
            }`}
          >
            {message}
          </div>
        )}

        {!wallet.connected && (
          <p className="text-sm text-red-600 dark:text-red-400 text-center">
            Please connect your wallet first
          </p>
        )}
      </div>
    </div>
  );
};

export default SendTokens;
