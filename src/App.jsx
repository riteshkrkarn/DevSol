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
import { generateWallet, importWallet, getBalance } from "./utils/wallet.js";
import sunIcon from "./assests/sun.svg";
import moonIcon from "./assests/moon.svg";

window.Buffer = Buffer;

const App = () => {
  console.log("🚀 App component initialized");

  const [isOpen, setIsOpen] = useState(false);
  const [seedPhrase, setSeedPhrase] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [inputPhrase, setInputPhrase] = useState("");
  const [balance, setBalance] = useState(0);
  const [publicKey, setPublicKey] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [privateKeyVisible, setPrivateKeyVisible] = useState(false);
  // Add state for wallet detail expansion
  const [showSolanaWallet, setShowSolanaWallet] = useState(false);
  const [showEthWallet, setShowEthWallet] = useState(false);
  const [walletMessage, setWalletMessage] = useState({ type: "", text: "" });
  const [mnemonicSuccess, setMnemonicSuccess] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [wallets, setWallets] = useState([]); // {type: 'Solana'|'Ethereum', publicKey: string}
  const [dropdownOpen, setDropdownOpen] = useState(false);

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
    console.log("🔄 Toggling collapse from", isOpen, "to", !isOpen);
    setIsOpen(!isOpen);
  };

  const toggleVisibility = () => {
    console.log("👁️ Toggling visibility from", isVisible, "to", !isVisible);
    setIsVisible(!isVisible);
  };

  const copyToClipboard = async () => {
    console.log("📋 Attempting to copy seed phrase to clipboard");
    try {
      const phraseText = seedPhrase.join(" ");
      console.log("📋 Copying text:", phraseText.substring(0, 50) + "...");
      await navigator.clipboard.writeText(phraseText);
      setCopied(true);
      console.log("✅ Successfully copied to clipboard");
      setTimeout(() => {
        console.log("🔄 Resetting copied state");
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error("❌ Failed to copy text:", err);
    }
  };

  const generateNewWallet = () => {
    // Only generate wallet if mnemonic is present
    if (!seedPhrase || seedPhrase.length === 0) {
      setWalletMessage({
        type: "error",
        text: "Please generate a mnemonic first.",
      });
      setShowSolanaWallet(false);
      return;
    }
    setWalletMessage({ type: "", text: "" });
    try {
      const phrase = seedPhrase.join(" ");
      const [publicKey, keypair] = importWallet(phrase);
      setPublicKey(publicKey);
      setPrivateKey(Buffer.from(keypair.secretKey).toString("hex"));
      getBalance(publicKey)
        .then((balance) => {
          setBalance(balance);
        })
        .catch(() => {
          setBalance(0);
        });
      setCopied(false);
      setPrivateKeyVisible(false);
      setShowSolanaWallet(true); // Only expand Solana wallet
      setShowEthWallet(false); // Collapse ETH wallet
      setWalletMessage({
        type: "success",
        text: "Wallet generated successfully!",
      });
      setWallets((prev) => [...prev, { type: "Solana", publicKey }]);
    } catch {
      setPublicKey("");
      setPrivateKey("");
      setBalance(0);
      setShowSolanaWallet(false);
      setWalletMessage({
        type: "error",
        text: "Failed to generate wallet. Please check your mnemonic.",
      });
    }
  };

  // Clear wallet message if mnemonic is cleared
  React.useEffect(() => {
    if (!seedPhrase || seedPhrase.length === 0) {
      setMnemonicSuccess("");
      setWalletMessage({ type: "", text: "" });
    }
  }, [seedPhrase]);

  return (
    <div
      className={`min-h-screen p-4 sm:p-6 lg:p-8 ${
        darkMode ? "bg-black" : "bg-white"
      }`}
    >
      {/* Wallets Dropdown and Dark Mode Toggle */}
      <div className="fixed top-4 right-4 z-50 flex flex-row items-center gap-4">
        {/* Wallets Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen((open) => !open)}
            className={`flex items-center gap-2 p-3 rounded-full text-base font-medium border transition-colors
              ${
                darkMode
                  ? "bg-gray-800 text-white border-gray-700 hover:bg-gray-700"
                  : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
              }
            `}
          >
            Wallets {ArrowIcon}
          </button>
          {dropdownOpen && (
            <div
              className={`absolute right-0 mt-2 w-56 rounded-lg shadow-lg border ${
                darkMode
                  ? "bg-black border-white text-white"
                  : "bg-white border-black text-black"
              }`}
            >
              <ul className="max-h-60 overflow-y-auto divide-y divide-gray-200 dark:divide-white/10">
                {wallets.length === 0 && (
                  <li className="px-4 py-2 text-sm opacity-60">
                    No wallets yet
                  </li>
                )}
                {wallets.map((w, i) => (
                  <li
                    key={w.publicKey + i}
                    className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-200 dark:hover:bg-white/10 flex flex-col"
                    onClick={async () => {
                      await navigator.clipboard.writeText(w.publicKey);
                      setDropdownOpen(false);
                    }}
                  >
                    <span className="font-semibold">{w.type}</span>
                    <span className="truncate text-xs opacity-80">
                      {w.publicKey}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        {/* Dark Mode Toggle Button */}
        <button
          onClick={toggleDarkMode}
          className={`rounded-full p-2 border ${
            darkMode ? "border-white bg-black" : "border-black bg-white"
          } shadow transition-colors`}
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
          <h1
            className={`text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 ${
              darkMode ? "text-white" : "text-black"
            }`}
          >
            SolVault
          </h1>
          <p
            className={`text-sm sm:text-base ${
              darkMode ? "text-white" : "text-black"
            }`}
          >
            Secure Solana Wallet Generator
          </p>
        </div>

        {/* Input Section */}
        <div
          className={`rounded-xl sm:rounded-2xl border shadow-lg p-4 sm:p-6 mb-6 ${
            darkMode ? "bg-black border-white" : "bg-white border-black"
          }`}
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={inputPhrase}
              onChange={(e) => {
                console.log(
                  "📝 Input changed:",
                  e.target.value
                    ? `"${e.target.value.substring(0, 30)}..."`
                    : "empty"
                );
                setInputPhrase(e.target.value);
              }}
              placeholder="Enter your secret phrase (leave blank to generate)"
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <button
              onClick={() => {
                // Only generate mnemonic now
                if (!inputPhrase.trim()) {
                  const [mnemonic] = generateWallet();
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
              <span>Generate</span>
            </button>
          </div>
        </div>

        {/* Main Card */}
        <div
          className={`rounded-xl sm:rounded-2xl border shadow-lg overflow-hidden mb-6 ${
            darkMode ? "bg-black border-white" : "bg-white border-black"
          }`}
        >
          {/* Header Section */}
          <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <h2
                  className={`text-lg sm:text-xl font-semibold ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Secret Phrase
                </h2>
                <span
                  className={`px-2 py-1 text-xs rounded-full border ${
                    darkMode
                      ? "bg-gray-800 text-white border-gray-700"
                      : "bg-gray-100 text-gray-600 border-gray-200"
                  }`}
                >
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
              <div
                className={`rounded-lg p-4 border ${
                  darkMode ? "bg-black border-white" : "bg-white border-black"
                }`}
              >
                <h3
                  className={`font-medium mb-3 ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
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
          <div
            className={`w-full sm:w-[420px] rounded-xl sm:rounded-2xl border shadow-lg p-4 sm:p-6 ${
              darkMode ? "bg-black border-white" : "bg-white border-black"
            }`}
          >
            <h2
              className={`text-lg sm:text-xl font-semibold mb-4 ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Solana Wallet
            </h2>
            <button
              onClick={() => {
                generateNewWallet();
              }}
              className="flex items-center justify-center gap-2 px-6 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors font-medium mb-4"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Generate Solana Wallet</span>
            </button>
            {walletMessage.text && (
              <div
                className={`mb-4 text-sm font-medium ${
                  walletMessage.type === "success"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {walletMessage.text}
              </div>
            )}
            {/* Wallet Details Card */}
            {showSolanaWallet && (publicKey || privateKey) && (
              <div className="mt-4">
                {/* Balance */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-4">
                  <div className="flex items-center justify-between">
                    <h3
                      className={`font-medium ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      Balance
                    </h3>
                    <button
                      onClick={async () => {
                        if (publicKey) {
                          const newBalance = await getBalance(publicKey);
                          setBalance(newBalance);
                        }
                      }}
                      className="flex items-center gap-1 px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded text-xs transition-colors border border-gray-200"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Refresh
                    </button>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {balance} SOL
                  </p>
                </div>
                {/* Public Key */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <h3
                      className={`font-medium ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      Public Key
                    </h3>
                    <button
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(publicKey);
                        } catch (err) {
                          console.error("Failed to copy public key:", err);
                        }
                      }}
                      className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors border ${
                        darkMode
                          ? "bg-gray-800 text-white border-gray-700 hover:bg-gray-700"
                          : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
                      }`}
                    >
                      <Copy className="w-3 h-3" />
                      Copy
                    </button>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <p className="text-gray-900 font-mono text-sm break-all">
                      {publicKey}
                    </p>
                  </div>
                </div>
                {/* Private Key */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <h3
                      className={`font-medium ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      Private Key
                    </h3>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setPrivateKeyVisible(!privateKeyVisible)}
                        className="flex items-center gap-1 px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded text-xs transition-colors border border-gray-200"
                      >
                        {privateKeyVisible ? (
                          <EyeOff className="w-3 h-3" />
                        ) : (
                          <Eye className="w-3 h-3" />
                        )}
                        {privateKeyVisible ? "Hide" : "Show"}
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(privateKey);
                          } catch (err) {
                            console.error("Failed to copy private key:", err);
                          }
                        }}
                        className="flex items-center gap-1 px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded text-xs transition-colors border border-gray-200"
                      >
                        <Copy className="w-3 h-3" />
                        Copy
                      </button>
                    </div>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <p className="text-gray-900 font-mono text-sm break-all">
                      {privateKeyVisible ? privateKey : "•".repeat(64)}
                    </p>
                  </div>
                </div>
                {/* Warning */}
                <div
                  className={`rounded-lg p-4 border mt-4
  ${
    darkMode
      ? "bg-white border-black text-black"
      : "bg-amber-50 border-amber-200 text-amber-800"
  }`}
                >
                  <p className="text-sm flex items-center gap-2">
                    <span>⚠️</span>
                    Never share your private key with anyone. Anyone with access
                    to it can control your wallet.
                  </p>
                </div>
              </div>
            )}
          </div>
          {/* ETH Wallet Generator (UI only) */}
          <div
            className={`w-full sm:w-[420px] flex flex-col justify-center items-center rounded-xl sm:rounded-2xl border shadow-lg p-4 sm:p-6 ${
              darkMode ? "bg-black border-white" : "bg-white border-black"
            }`}
          >
            <h2
              className={`text-lg sm:text-xl font-semibold mb-4 ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Ethereum Wallet
            </h2>
            <button
              className="flex items-center justify-center gap-2 px-6 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors font-medium mb-4"
              onClick={() => {
                setShowEthWallet(true);
                setShowSolanaWallet(false);
                // Optionally: setWalletMessage({ type: '', text: '' });
              }}
            >
              <RefreshCw className="w-4 h-4" />
              <span>Generate Ethereum Wallet</span>
            </button>
            {/* Placeholder for ETH wallet details */}
            {showEthWallet && (
              <div className="mt-4 text-gray-500 text-sm transition-all duration-300">
                Wallet details will appear here after generation.
              </div>
            )}
          </div>
        </div>

        {/* Sticky Footer */}
        <div
          className={`fixed bottom-0 left-0 w-full z-40 py-2 text-center border-t ${
            darkMode
              ? "bg-black border-white text-white"
              : "bg-white border-black text-black"
          }`}
        >
          <p className="text-sm">
            Built for learning purposes • Always verify on mainnet
          </p>
        </div>
      </div>
    </div>
  );
};

export default App;
