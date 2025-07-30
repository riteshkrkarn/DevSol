import React, { useState, useEffect } from "react";
import { Send, Copy, RefreshCw, ArrowLeft, Sun, Moon } from "lucide-react";
import { ethers } from "ethers";
import {
  sendSolanaTransaction,
  validateSolanaAddress,
  getSolanaTransactionFee,
} from "./utils/solanaTransaction.js";
import {
  sendEthTransaction,
  validateEthAddress,
  getEthGasPrice,
  estimateEthGas,
} from "./utils/ethTransaction.js";

const Transaction = ({
  selectedWallet,
  walletsOfType = [],
  darkMode,
  toggleDarkMode,
  onBack,
}) => {
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [transactionStatus, setTransactionStatus] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [transactionResult, setTransactionResult] = useState(null);
  const [gasPrice, setGasPrice] = useState("");
  const [estimatedFee, setEstimatedFee] = useState("");
  const [activeWalletId, setActiveWalletId] = useState(
    selectedWallet
      ? selectedWallet.id
      : walletsOfType[0]
      ? walletsOfType[0].id
      : ""
  );

  const activeWallet =
    walletsOfType.find((w) => w.id === activeWalletId) || selectedWallet;

  // Update activeWalletId when selectedWallet changes
  useEffect(() => {
    if (selectedWallet && selectedWallet.id !== activeWalletId) {
      setActiveWalletId(selectedWallet.id);
    } else if (walletsOfType.length > 0 && !activeWalletId) {
      setActiveWalletId(walletsOfType[0].id);
    }
  }, [selectedWallet, walletsOfType, activeWalletId]);

  // Load gas price on component mount
  useEffect(() => {
    if (activeWallet) {
      loadGasPrice();
    }
  }, [activeWallet]);

  const loadGasPrice = async () => {
    try {
      if (activeWallet.type === "Solana") {
        const fee = await getSolanaTransactionFee();
        setGasPrice(fee.toFixed(6));
      } else {
        const gasPrice = await getEthGasPrice();
        setGasPrice(gasPrice.toFixed(2));
      }
    } catch (error) {
      console.error("Failed to load gas price:", error);
    }
  };

  const validateAddress = (address) => {
    if (!address) return false;

    if (activeWallet.type === "Solana") {
      return validateSolanaAddress(address);
    } else {
      return validateEthAddress(address);
    }
  };

  const estimateFee = async () => {
    if (!recipientAddress || !amount || !validateAddress(recipientAddress)) {
      return;
    }

    try {
      if (activeWallet.type === "Solana") {
        const fee = await getSolanaTransactionFee();
        setEstimatedFee(fee.toFixed(6));
      } else {
        const gasEstimate = await estimateEthGas(
          activeWallet.publicKey,
          recipientAddress,
          amount
        );
        const gasPriceValue = parseFloat(gasPrice) || 20;
        const estimatedFeeEth = (gasEstimate * gasPriceValue) / 1e9;
        setEstimatedFee(estimatedFeeEth.toFixed(6));
      }
    } catch (error) {
      console.error("Failed to estimate fee:", error);
    }
  };

  const handleSendTransaction = async () => {
    if (!activeWallet) {
      setTransactionStatus("No wallet selected");
      return;
    }

    if (!recipientAddress || !amount) {
      setTransactionStatus("Please fill in all fields");
      return;
    }

    if (!validateAddress(recipientAddress)) {
      setTransactionStatus("Invalid recipient address");
      return;
    }

    const numAmount = parseFloat(amount);
    if (numAmount > activeWallet.balance) {
      setTransactionStatus("Insufficient balance");
      return;
    }

    setLoading(true);
    setTransactionStatus("Sending transaction...");

    try {
      let result;

      if (activeWallet.type === "Solana") {
        result = await sendSolanaTransaction(
          activeWallet,
          recipientAddress,
          numAmount,
          parseFloat(gasPrice)
        );
      } else {
        result = await sendEthTransaction(
          activeWallet,
          recipientAddress,
          numAmount,
          ethers.utils.parseUnits(gasPrice, "gwei")
        );
      }

      if (result.success) {
        setTransactionStatus("Transaction sent successfully!");
        setTransactionResult(result);
        setRecipientAddress("");
        setAmount("");
      } else {
        setTransactionStatus(`Transaction failed: ${result.error}`);
      }
    } catch (error) {
      setTransactionStatus(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error("Failed to copy text:", error);
    }
  };

  if (!activeWallet) {
    return (
      <div className="min-h-screen p-4 sm:p-6 lg:p-8 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              No Wallet Available
            </h1>
            <p className="text-gray-600 mb-6">
              Please create a wallet first before sending transactions.
            </p>
            <button
              onClick={onBack}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Wallets
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto">
        {/* Header with MultiVault title, wallet selector, and dark mode toggle */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              MultiVault
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {/* Wallet selection dropdown */}
            {walletsOfType.length > 0 && (
              <select
                value={activeWalletId}
                onChange={(e) => setActiveWalletId(e.target.value)}
                className="px-4 py-2 rounded-lg border-2 border-black dark:border-white bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              >
                {walletsOfType.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.publicKey.slice(0, 6)}...
                    {w.publicKey.slice(-4)})
                  </option>
                ))}
              </select>
            )}
            {/* Dark mode toggle */}
            <button
              onClick={toggleDarkMode}
              className="rounded-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 shadow transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Transaction Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Send {activeWallet.type === "Solana" ? "SOL" : "ETH"}
          </h2>

          {/* Wallet Info */}
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              From Wallet
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Name:
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {activeWallet.name}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Address:
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono text-gray-900 dark:text-white truncate max-w-xs">
                    {activeWallet.publicKey}
                  </span>
                  <button
                    onClick={() => copyToClipboard(activeWallet.publicKey)}
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Balance:
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {activeWallet.balance}{" "}
                  {activeWallet.type === "Solana" ? "SOL" : "ETH"}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Recipient Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Recipient Address
              </label>
              <input
                type="text"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                placeholder={`Enter ${
                  activeWallet.type === "Solana" ? "Solana" : "Ethereum"
                } address`}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-700 dark:text-white ${
                  recipientAddress && !validateAddress(recipientAddress)
                    ? "border-red-500 dark:border-red-400"
                    : "border-gray-300 dark:border-gray-600"
                }`}
              />
              {recipientAddress && !validateAddress(recipientAddress) && (
                <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                  Invalid address format
                </p>
              )}
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Amount ({activeWallet.type === "Solana" ? "SOL" : "ETH"})
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                step="0.000001"
                min="0"
                max={activeWallet.balance}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-700 dark:text-white"
              />
              {amount && parseFloat(amount) > activeWallet.balance && (
                <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                  Insufficient balance
                </p>
              )}
            </div>

            {/* Gas Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {activeWallet.type === "Solana" ? "Fee" : "Gas Price"} (
                {activeWallet.type === "Solana" ? "SOL" : "Gwei"})
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={gasPrice}
                  onChange={(e) => setGasPrice(e.target.value)}
                  step="0.000001"
                  min="0"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-700 dark:text-white"
                />
                <button
                  onClick={loadGasPrice}
                  className="px-3 py-2 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-lg text-gray-700 dark:text-gray-300"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Estimated Fee */}
            {estimatedFee && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Estimated Fee:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {estimatedFee}{" "}
                    {activeWallet.type === "Solana" ? "SOL" : "ETH"}
                  </span>
                </div>
              </div>
            )}

            {/* Send Button */}
            <button
              onClick={handleSendTransaction}
              disabled={
                isLoading ||
                !recipientAddress ||
                !amount ||
                !validateAddress(recipientAddress) ||
                parseFloat(amount) <= 0 ||
                parseFloat(amount) > activeWallet.balance
              }
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {isLoading ? "Sending..." : "Send Transaction"}
            </button>

            {/* Transaction Status */}
            {transactionStatus && (
              <div
                className={`p-3 rounded-lg ${
                  transactionStatus.includes("success") ||
                  transactionStatus.includes("sent")
                    ? "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200"
                    : transactionStatus.includes("failed") ||
                      transactionStatus.includes("Error")
                    ? "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200"
                    : "bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200"
                }`}
              >
                {transactionStatus}
              </div>
            )}

            {/* Transaction Result */}
            {transactionResult && transactionResult.success && (
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                  Transaction Successful!
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-700 dark:text-green-300">
                      Transaction Hash:
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs truncate max-w-xs text-green-700 dark:text-green-300">
                        {activeWallet.type === "Solana"
                          ? transactionResult.signature
                          : transactionResult.hash}
                      </span>
                      <button
                        onClick={() =>
                          copyToClipboard(
                            activeWallet.type === "Solana"
                              ? transactionResult.signature
                              : transactionResult.hash
                          )
                        }
                        className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700 dark:text-green-300">
                      Amount:
                    </span>
                    <span className="text-green-700 dark:text-green-300">
                      {transactionResult.amount}{" "}
                      {activeWallet.type === "Solana" ? "SOL" : "ETH"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700 dark:text-green-300">
                      Fee:
                    </span>
                    <span className="text-green-700 dark:text-green-300">
                      {transactionResult.fee}{" "}
                      {activeWallet.type === "Solana" ? "SOL" : "ETH"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transaction;
