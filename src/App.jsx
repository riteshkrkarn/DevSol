import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronUp,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  Plus,
  Trash2,
  Send,
} from "lucide-react";
import SecretPhraseGrid from "./components/SecretPhraseGrid.jsx";
import { generateMnemonic as generateBip39Mnemonic } from "bip39";
import { Buffer } from "buffer";
import {
  generateWallet as generateSolanaWallet,
  importWallet as importSolanaWallet,
  getBalance as getSolanaBalance,
  generateWalletFromMnemonic as generateSolanaWalletFromMnemonic,
  getNextDerivationIndex as getNextSolanaDerivationIndex,
  getMultipleBalances as getMultipleSolanaBalances,
} from "./utils/solanaWallet.js";
import {
  generateWallet as generateEthWallet,
  importWallet as importEthWallet,
  getBalance as getEthBalance,
  generateWalletFromMnemonic as generateEthWalletFromMnemonic,
  getNextDerivationIndex as getNextEthDerivationIndex,
  getMultipleBalances as getMultipleEthBalances,
} from "./utils/ethWallet.js";
import Transaction from "./Transaction.jsx";
import sunIcon from "./assests/sun.svg";
import moonIcon from "./assests/moon.svg";

window.Buffer = Buffer;

const App = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [seedPhrase, setSeedPhrase] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [inputPhrase, setInputPhrase] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // New wallet management states
  const [wallets, setWallets] = useState([]);
  const [selectedWalletId, setSelectedWalletId] = useState(null);
  const [tempWallet, setTempWallet] = useState(null);
  const [solanaWalletMessage, setSolanaWalletMessage] = useState({
    type: "",
    text: "",
  });
  const [ethWalletMessage, setEthWalletMessage] = useState({
    type: "",
    text: "",
  });
  const [mnemonicSuccess, setMnemonicSuccess] = useState("");
  const [currentWalletType, setCurrentWalletType] = useState("Solana"); // "Solana" or "Ethereum"
  const [showTransactionPage, setShowTransactionPage] = useState(false);
  const [transactionWalletType, setTransactionWalletType] = useState(""); // "Solana" or "Ethereum" for transaction

  // Load wallets from localStorage on component mount
  useEffect(() => {
    const savedWallets = localStorage.getItem("solvault-wallets");
    if (savedWallets) {
      const parsedWallets = JSON.parse(savedWallets);
      setWallets(parsedWallets);
      // Select first wallet if none selected
      if (parsedWallets.length > 0 && !selectedWalletId) {
        setSelectedWalletId(parsedWallets[0].id);
      }
    }
  }, []);

  // Save wallets to localStorage whenever wallets change
  useEffect(() => {
    localStorage.setItem("solvault-wallets", JSON.stringify(wallets));
  }, [wallets]);

  // Arrow icon for dropdown
  const ArrowIcon = (
    <svg
      className="w-5 h-5 ml-2 inline"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );

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

  const toggleCollapse = () => {
    setIsOpen(!isOpen);
  };

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  const copyToClipboard = async () => {
    try {
      const phraseText = seedPhrase.join(" ");
      await navigator.clipboard.writeText(phraseText);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  // Generate new wallet (temporary, not stored)
  const generateNewWallet = (type) => {
    if (!seedPhrase || seedPhrase.length === 0) {
      const message = {
        type: "error",
        text: "Please generate a mnemonic first.",
      };
      if (type === "Solana") {
        setSolanaWalletMessage(message);
      } else {
        setEthWalletMessage(message);
      }
      return;
    }

    if (type === "Solana") {
      setSolanaWalletMessage({ type: "", text: "" });
    } else {
      setEthWalletMessage({ type: "", text: "" });
    }

    try {
      const phrase = seedPhrase.join(" ");
      const filteredWallets = wallets.filter((w) => w.type === type);
      const nextIndex =
        type === "Solana"
          ? getNextSolanaDerivationIndex(filteredWallets)
          : getNextEthDerivationIndex(filteredWallets);

      const walletData =
        type === "Solana"
          ? generateSolanaWalletFromMnemonic(phrase, nextIndex)
          : generateEthWalletFromMnemonic(phrase, nextIndex);

      const newWallet = {
        id: Date.now().toString(),
        name: `${type} Wallet ${filteredWallets.length + 1}`,
        type: type,
        publicKey: walletData.publicKey,
        privateKey:
          type === "Solana"
            ? Buffer.from(walletData.keypair.secretKey).toString("hex")
            : walletData.wallet.privateKey,
        derivationIndex: walletData.derivationIndex,
        balance: 0,
        isSelected: false,
      };

      setTempWallet(newWallet);
      setSelectedWalletId(newWallet.id);
      const successMessage = {
        type: "success",
        text: `${type} wallet generated successfully! Click 'Store' to save it.`,
      };
      if (type === "Solana") {
        setSolanaWalletMessage(successMessage);
      } else {
        setEthWalletMessage(successMessage);
      }
    } catch (error) {
      const errorMessage = {
        type: "error",
        text: `Failed to generate ${type} wallet. Please check your mnemonic.`,
      };
      if (type === "Solana") {
        setSolanaWalletMessage(errorMessage);
      } else {
        setEthWalletMessage(errorMessage);
      }
    }
  };

  // Select a wallet
  const selectWallet = (walletId) => {
    setSelectedWalletId(walletId);
  };

  // Delete a wallet
  const deleteWallet = (walletId) => {
    setWallets((prev) => prev.filter((w) => w.id !== walletId));
    if (selectedWalletId === walletId) {
      const remainingWallets = wallets.filter((w) => w.id !== walletId);
      setSelectedWalletId(
        remainingWallets.length > 0 ? remainingWallets[0].id : null
      );
    }
  };

  // Get selected wallet (either temp or stored)
  const selectedWallet =
    tempWallet || wallets.find((w) => w.id === selectedWalletId);

  // Clear selectedWalletId when tempWallet is cleared and no stored wallet matches
  useEffect(() => {
    if (!tempWallet && selectedWalletId) {
      const storedWallet = wallets.find((w) => w.id === selectedWalletId);
      if (!storedWallet) {
        setSelectedWalletId(null);
      }
    }
  }, [tempWallet, selectedWalletId, wallets]);

  // Refresh balance for selected wallet
  const refreshBalance = async () => {
    if (selectedWallet) {
      try {
        const balance =
          selectedWallet.type === "Solana"
            ? await getSolanaBalance(selectedWallet.publicKey)
            : await getEthBalance(selectedWallet.publicKey);

        if (tempWallet) {
          // Update temp wallet balance
          setTempWallet((prev) => ({ ...prev, balance }));
        } else {
          // Update stored wallet balance
          setWallets((prev) =>
            prev.map((w) => (w.id === selectedWalletId ? { ...w, balance } : w))
          );
        }
      } catch (error) {
        console.error("Failed to refresh balance:", error);
      }
    }
  };

  // Refresh all wallet balances
  const refreshAllBalances = async () => {
    const publicKeys = wallets.map((w) => w.publicKey);
    const balances = await getMultipleBalances(publicKeys);

    setWallets((prev) =>
      prev.map((wallet) => ({
        ...wallet,
        balance: balances[wallet.publicKey] || 0,
      }))
    );
  };

  // Clear wallet message if mnemonic is cleared
  React.useEffect(() => {
    if (!seedPhrase || seedPhrase.length === 0) {
      setMnemonicSuccess("");
      setSolanaWalletMessage({ type: "", text: "" });
      setEthWalletMessage({ type: "", text: "" });
    }
  }, [seedPhrase]);

  // Show transaction page if requested
  if (showTransactionPage) {
    const walletsOfType = wallets.filter(
      (w) => w.type === transactionWalletType
    );
    const transactionWallet =
      selectedWallet && selectedWallet.type === transactionWalletType
        ? selectedWallet
        : walletsOfType[0];
    return (
      <Transaction
        selectedWallet={transactionWallet}
        walletsOfType={walletsOfType}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        onBack={() => {
          setShowTransactionPage(false);
          setTransactionWalletType("");
        }}
      />
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-gray-900">
      {/* Wallets Dropdown and Dark Mode Toggle */}
      <div className="fixed top-4 right-4 z-50 flex flex-row items-center gap-4">
        {/* Wallets Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen((open) => !open)}
            className="flex items-center gap-2 p-3 rounded-full text-base font-medium border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Wallets ({wallets.length}) {ArrowIcon}
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    setTempWallet(null); // Clear any existing temp wallet
                    setSelectedWalletId(null); // Clear selected wallet ID
                    generateNewWallet("Solana");
                    setDropdownOpen(false);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <Plus className="w-4 h-4" />
                  Generate New Wallet
                </button>
              </div>
              <ul className="max-h-60 overflow-y-auto divide-y divide-gray-200 dark:divide-gray-700">
                {wallets.length === 0 && (
                  <li className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                    No wallets yet
                  </li>
                )}
                {wallets.map((wallet) => (
                  <li
                    key={wallet.id}
                    className={`px-4 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between ${
                      selectedWalletId === wallet.id
                        ? "bg-blue-50 dark:bg-blue-900/20"
                        : ""
                    }`}
                    onClick={() => {
                      selectWallet(wallet.id);
                      setDropdownOpen(false);
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm truncate text-gray-900 dark:text-white">
                          {wallet.name}
                        </span>
                        {selectedWalletId === wallet.id && (
                          <span className="text-blue-600 dark:text-blue-400 text-xs">
                            ●
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                        {wallet.publicKey.slice(0, 8)}...
                        {wallet.publicKey.slice(-6)}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {wallet.balance}{" "}
                        {wallet.type === "Solana" ? "SOL" : "ETH"}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteWallet(wallet.id);
                      }}
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        {/* Dark Mode Toggle Button */}
        <button
          onClick={toggleDarkMode}
          className="rounded-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 shadow transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
          aria-label="Toggle dark mode"
        >
          <img
            src={darkMode ? sunIcon : moonIcon}
            alt={darkMode ? "Light mode" : "Dark mode"}
            className="w-6 h-6"
          />
        </button>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 text-gray-900 dark:text-white">
            MultiVault
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Secure Multi-Chain Wallet Generator
          </p>
        </div>

        {/* Input Section */}
        <div className="rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg p-4 sm:p-6 mb-6 bg-white dark:bg-gray-800">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Show message when mnemonic is set from input */}
            <input
              type="text"
              value={inputPhrase}
              onChange={(e) => {
                setInputPhrase(e.target.value);
                if (e.target.value.trim()) {
                  setMnemonicSuccess("Mnemonic set from input successfully!");
                } else {
                  setMnemonicSuccess("");
                }
              }}
              placeholder="Enter your secret phrase (leave blank to generate)"
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <button
              onClick={() => {
                // Only generate mnemonic now
                if (!inputPhrase.trim()) {
                  const [mnemonic] = generateSolanaWallet();
                  setSeedPhrase(mnemonic);
                  setInputPhrase("");
                  setCopied(false);
                  setMnemonicSuccess("Mnemonic generated successfully!");
                } else {
                  setSeedPhrase(inputPhrase.trim().split(/\s+/));
                  setInputPhrase("");
                  setCopied(false);
                  setMnemonicSuccess(""); // Don't show message here, only on input change
                }
              }}
              className="flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition-colors font-medium whitespace-nowrap"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Generate Mnemonic</span>
            </button>
          </div>
        </div>

        {/* Main Card */}
        <div className="rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden mb-6 bg-white dark:bg-gray-800">
          {/* Header Section */}
          <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                  Secret Phrase
                </h2>
                <span className="px-2 py-1 text-xs rounded-full border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                  BIP39
                </span>
              </div>
              <button
                onClick={toggleCollapse}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-200 border border-gray-200 hover:border-gray-300 w-full sm:w-auto"
              >
                <span className="text-sm font-medium">
                  {isOpen ? "Hide" : "Show"}
                </span>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            </div>
            {mnemonicSuccess && (
              <div className="mt-3 text-green-600 text-sm font-medium">
                {mnemonicSuccess}
              </div>
            )}
          </div>

          {/* Collapsible Content */}
          <div
            className={`transition-all duration-500 ease-in-out ${
              isOpen ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
            }`}
            style={{
              overflow: "hidden",
            }}
          >
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Warning */}
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <p className="text-amber-800 dark:text-amber-200 text-sm">
                  ⚠️ Store your secret phrase safely. Anyone with access to it
                  can control your wallet. You can generate them or import by
                  typing your own. Also copy them.
                </p>
              </div>

              {/* Controls */}
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={toggleVisibility}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors border border-gray-200 dark:border-gray-600"
                >
                  {isVisible ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                  <span className="text-sm">{isVisible ? "Hide" : "Show"}</span>
                </button>

                <button
                  onClick={copyToClipboard}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors border border-gray-200 dark:border-gray-600"
                >
                  <Copy className="w-4 h-4" />
                  <span className="text-sm">{copied ? "Copied!" : "Copy"}</span>
                </button>
              </div>

              {/* Secret Phrase Grid - Using the imported component */}
              <SecretPhraseGrid seedPhrase={seedPhrase} isVisible={isVisible} />

              {/* Additional Info */}
              <div className="rounded-lg p-4 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <h3 className="font-medium mb-3 text-gray-900 dark:text-white">
                  Security Tips:
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-600 dark:text-gray-400 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-gray-400 dark:text-gray-500 mt-0.5">
                      •
                    </span>
                    <span>Never share your secret phrase with anyone</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-gray-400 dark:text-gray-500 mt-0.5">
                      •
                    </span>
                    <span>Store it offline in a secure location</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-gray-400 dark:text-gray-500 mt-0.5">
                      •
                    </span>
                    <span>Consider writing it down on paper</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-gray-400 dark:text-gray-500 mt-0.5">
                      •
                    </span>
                    <span>Verify each word before saving</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wallet Generator Section */}
        <div className="flex flex-col sm:flex-row gap-6 mb-6 items-start">
          {/* Solana Wallet Generator */}
          <div className="w-full sm:w-1/2 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg p-4 sm:p-6 bg-white dark:bg-gray-800">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Solana Wallet
            </h2>
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => {
                  setTempWallet(null);
                  setSelectedWalletId(null);
                  setSolanaWalletMessage({ type: "", text: "" });
                  setEthWalletMessage({ type: "", text: "" });
                  generateNewWallet("Solana");
                }}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Generate</span>
              </button>
              <button
                onClick={() => {
                  if (tempWallet && tempWallet.type === "Solana") {
                    // Store the temporary wallet
                    setWallets((prev) => [...prev, tempWallet]);
                    setTempWallet(null);
                    setSolanaWalletMessage({
                      type: "success",
                      text: "Solana wallet stored successfully!",
                    });
                  } else {
                    setSolanaWalletMessage({
                      type: "error",
                      text: "Please generate a Solana wallet first!",
                    });
                  }
                }}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
              >
                <Plus className="w-4 h-4" />
                <span>Store</span>
              </button>
            </div>
            {/* Solana Wallet Message */}
            {solanaWalletMessage.text && (
              <div
                className={`mb-4 text-sm font-medium ${
                  solanaWalletMessage.type === "success"
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {solanaWalletMessage.text}
              </div>
            )}

            {/* Selected Solana Wallet Details */}
            {selectedWallet && selectedWallet.type === "Solana" && (
              <div className="mt-4">
                {/* Balance */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 mb-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      Balance
                    </h3>
                    <button
                      onClick={refreshBalance}
                      className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 text-gray-600 dark:text-gray-300 rounded text-xs transition-colors border border-gray-200 dark:border-gray-600"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Refresh
                    </button>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                    {selectedWallet.balance} SOL
                  </p>
                </div>

                {/* Wallet Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {selectedWallet.name}
                    </h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Index: {selectedWallet.derivationIndex}
                    </span>
                  </div>
                </div>

                {/* Public Key */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      Public Key
                    </h3>
                    <button
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(
                            selectedWallet.publicKey
                          );
                        } catch (err) {
                          console.error("Failed to copy public key:", err);
                        }
                      }}
                      className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 text-gray-600 dark:text-gray-300 rounded text-xs transition-colors border border-gray-200 dark:border-gray-600"
                    >
                      <Copy className="w-3 h-3" />
                      Copy
                    </button>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                    <p className="text-gray-900 dark:text-white font-mono text-sm break-all">
                      {selectedWallet.publicKey}
                    </p>
                  </div>
                </div>

                {/* Private Key */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      Private Key
                    </h3>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          // Toggle private key visibility
                          if (tempWallet) {
                            setTempWallet((prev) => ({
                              ...prev,
                              privateKeyVisible: !prev.privateKeyVisible,
                            }));
                          } else {
                            setWallets((prev) =>
                              prev.map((w) =>
                                w.id === selectedWalletId
                                  ? {
                                      ...w,
                                      privateKeyVisible: !w.privateKeyVisible,
                                    }
                                  : w
                              )
                            );
                          }
                        }}
                        className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 text-gray-600 dark:text-gray-300 rounded text-xs transition-colors border border-gray-200 dark:border-gray-600"
                      >
                        {selectedWallet.privateKeyVisible ? (
                          <EyeOff className="w-3 h-3" />
                        ) : (
                          <Eye className="w-3 h-3" />
                        )}
                        {selectedWallet.privateKeyVisible ? "Hide" : "Show"}
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(
                              selectedWallet.privateKey
                            );
                          } catch (err) {
                            console.error("Failed to copy private key:", err);
                          }
                        }}
                        className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 text-gray-600 dark:text-gray-300 rounded text-xs transition-colors border border-gray-200 dark:border-gray-600"
                      >
                        <Copy className="w-3 h-4" />
                        Copy
                      </button>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                    <p className="text-gray-900 dark:text-white font-mono text-sm break-all">
                      {selectedWallet.privateKeyVisible
                        ? selectedWallet.privateKey
                        : "•".repeat(64)}
                    </p>
                  </div>
                </div>

                {/* Warning */}
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mt-4">
                  <p className="text-amber-800 dark:text-amber-200 text-sm flex items-center gap-2">
                    <span>⚠️</span>
                    Never share your private key with anyone. Anyone with access
                    to it can control your wallet.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Ethereum Wallet Generator */}
          <div className="w-full sm:w-1/2 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg p-4 sm:p-6 bg-white dark:bg-gray-800">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Ethereum Wallet
            </h2>
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => {
                  setTempWallet(null);
                  setSelectedWalletId(null);
                  setSolanaWalletMessage({ type: "", text: "" });
                  setEthWalletMessage({ type: "", text: "" });
                  generateNewWallet("Ethereum");
                }}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Generate</span>
              </button>
              <button
                onClick={() => {
                  if (tempWallet && tempWallet.type === "Ethereum") {
                    // Store the temporary wallet
                    setWallets((prev) => [...prev, tempWallet]);
                    setTempWallet(null);
                    setEthWalletMessage({
                      type: "success",
                      text: "Ethereum wallet stored successfully!",
                    });
                  }
                }}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
              >
                <Plus className="w-4 h-4" />
                <span>Store</span>
              </button>
            </div>
            {ethWalletMessage.text && (
              <div
                className={`mb-4 text-sm font-medium ${
                  ethWalletMessage.type === "success"
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {ethWalletMessage.text}
              </div>
            )}

            {/* Selected Ethereum Wallet Details */}
            {selectedWallet && selectedWallet.type === "Ethereum" && (
              <div className="mt-4">
                {/* Balance */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 mb-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      Balance
                    </h3>
                    <button
                      onClick={refreshBalance}
                      className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 text-gray-600 dark:text-gray-300 rounded text-xs transition-colors border border-gray-200 dark:border-gray-600"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Refresh
                    </button>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                    {selectedWallet.balance} ETH
                  </p>
                </div>

                {/* Wallet Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {selectedWallet.name}
                    </h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Index: {selectedWallet.derivationIndex}
                    </span>
                  </div>
                </div>

                {/* Public Key */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      Address
                    </h3>
                    <button
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(
                            selectedWallet.publicKey
                          );
                        } catch (err) {
                          console.error("Failed to copy address:", err);
                        }
                      }}
                      className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 text-gray-600 dark:text-gray-300 rounded text-xs transition-colors border border-gray-200 dark:border-gray-600"
                    >
                      <Copy className="w-3 h-3" />
                      Copy
                    </button>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                    <p className="text-gray-900 dark:text-white font-mono text-sm break-all">
                      {selectedWallet.publicKey}
                    </p>
                  </div>
                </div>

                {/* Private Key */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      Private Key
                    </h3>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          if (tempWallet) {
                            setTempWallet({
                              ...tempWallet,
                              privateKeyVisible: !tempWallet.privateKeyVisible,
                            });
                          } else {
                            setWallets((prev) =>
                              prev.map((w) =>
                                w.id === selectedWalletId
                                  ? {
                                      ...w,
                                      privateKeyVisible: !w.privateKeyVisible,
                                    }
                                  : w
                              )
                            );
                          }
                        }}
                        className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 text-gray-600 dark:text-gray-300 rounded text-xs transition-colors border border-gray-200 dark:border-gray-600"
                      >
                        {selectedWallet.privateKeyVisible ? (
                          <EyeOff className="w-3 h-3" />
                        ) : (
                          <Eye className="w-3 h-3" />
                        )}
                        {selectedWallet.privateKeyVisible ? "Hide" : "Show"}
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(
                              selectedWallet.privateKey
                            );
                          } catch (err) {
                            console.error("Failed to copy private key:", err);
                          }
                        }}
                        className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 text-gray-600 dark:text-gray-300 rounded text-xs transition-colors border border-gray-200 dark:border-gray-600"
                      >
                        <Copy className="w-3 h-4" />
                        Copy
                      </button>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                    <p className="text-gray-900 dark:text-white font-mono text-sm break-all">
                      {selectedWallet.privateKeyVisible
                        ? selectedWallet.privateKey
                        : "••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Transaction Buttons */}
        {(selectedWallet || wallets.length > 0) && (
          <div className="flex flex-col items-center gap-4 mb-20">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Send Transactions
            </h3>

            {/* Wallet Selection for Transactions */}
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setTransactionWalletType("Solana");
                  setShowTransactionPage(true);
                }}
                disabled={
                  !wallets.some((w) => w.type === "Solana") &&
                  !(selectedWallet && selectedWallet.type === "Solana")
                }
                className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium shadow-lg"
              >
                <Send className="w-4 h-4" />
                <span>Send SOL</span>
              </button>

              <button
                onClick={() => {
                  setTransactionWalletType("Ethereum");
                  setShowTransactionPage(true);
                }}
                disabled={
                  !wallets.some((w) => w.type === "Ethereum") &&
                  !(selectedWallet && selectedWallet.type === "Ethereum")
                }
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium shadow-lg"
              >
                <Send className="w-4 h-4" />
                <span>Send ETH</span>
              </button>
            </div>

            {/* Wallet Info */}
            {transactionWalletType && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {transactionWalletType === "Solana"
                  ? "Select a Solana wallet to send SOL"
                  : "Select an Ethereum wallet to send ETH"}
              </div>
            )}
          </div>
        )}

        {/* Sticky Footer */}
        <div className="fixed bottom-0 left-0 w-full z-40 py-2 text-center border-t bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
          <p className="text-sm">
            Built for learning purposes • Always verify on mainnet
          </p>
        </div>
      </div>
    </div>
  );
};

export default App;
