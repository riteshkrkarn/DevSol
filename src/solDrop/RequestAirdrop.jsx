import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import React, { useEffect } from "react";

const RequestAirdrop = ({ onAirdropSuccess }) => {
  const wallet = useWallet();
  const { connection } = useConnection();
  const [amount, setAmount] = React.useState("");
  const [publicKey, setPublicKey] = React.useState("");
  const [message, setMessage] = React.useState({ type: "", text: "" });
  const [isLoading, setIsLoading] = React.useState(false);

  // Update public key when wallet connects
  useEffect(() => {
    if (wallet.publicKey) {
      setPublicKey(wallet.publicKey.toString());
    } else {
      setPublicKey("");
    }
  }, [wallet.publicKey]);

  async function requestAirDrop(amount) {
    if (!wallet.publicKey || !amount) return;

    setIsLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const walletPublicKey = wallet.publicKey;
      const signature = await connection.requestAirdrop(
        walletPublicKey,
        amount * LAMPORTS_PER_SOL
      );

      await connection.confirmTransaction(signature);
      console.log("Airdrop requested successfully");

      setMessage({
        type: "success",
        text: `Successfully airdropped ${amount} SOL to your wallet!`,
      });

      // Call the success callback if provided
      if (onAirdropSuccess) {
        onAirdropSuccess();
      }
    } catch (error) {
      console.error("Error requesting airdrop:", error);
      setMessage({
        type: "error",
        text: "Failed to request airdrop. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Public Key Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Public Key
        </label>
        <input
          type="text"
          value={publicKey}
          onChange={(e) => setPublicKey(e.target.value)}
          placeholder="Your wallet public key"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>

      {/* Amount Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Amount (SOL)
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount in SOL"
          min="0"
          step="0.1"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>

      {/* Success/Error Message */}
      {message.text && (
        <div
          className={`text-sm font-medium text-center p-3 rounded-lg border ${
            message.type === "success"
              ? "text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
              : "text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Request Airdrop Button */}
      <button
        onClick={() => requestAirDrop(amount)}
        disabled={!wallet.publicKey || !amount || isLoading}
        className="w-full py-3 px-6 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white rounded-lg font-medium shadow-lg transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100"
      >
        {isLoading ? "Processing..." : "Request Airdrop"}
      </button>
    </div>
  );
};

export default RequestAirdrop;
