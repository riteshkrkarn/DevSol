import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronDown,
  ChevronUp,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  Sun,
  Moon,
  ArrowLeft,
} from "lucide-react";
import SecretPhraseGrid from "../components/SecretPhraseGrid.jsx";
import { Buffer } from "buffer";
import { generateWallet, importWallet, getBalance } from "../utils/wallet.js";

window.Buffer = Buffer;

const App = () => {
  console.log("🚀 App component initialized");
  const navigate = useNavigate();

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
  const [walletMessage, setWalletMessage] = useState({ type: "", text: "" });
  const [mnemonicSuccess, setMnemonicSuccess] = useState("");
  const [darkMode, setDarkMode] = useState(false);

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
      setWalletMessage({
        type: "success",
        text: "Wallet generated successfully!",
      });
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
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              SolVault
            </span>
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Secure Solana Wallet Generator
          </p>
        </div>

        {/* Input Section */}
        <div className="group relative overflow-hidden rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-2xl p-4 sm:p-6 mb-6 bg-white dark:bg-gray-800 transition-all duration-300 transform hover:-translate-y-1">
          {/* Gradient Background on Hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />

          <div className="relative flex flex-col sm:flex-row gap-3">
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
                  setMnemonicSuccess("Mnemonic set from input successfully!");
                }
              }}
              className="flex items-center justify-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white rounded-lg transition-colors font-medium whitespace-nowrap shadow-lg"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Generate</span>
            </button>
          </div>

          {/* Mnemonic Success Message */}
          {mnemonicSuccess && (
            <div className="mt-3 text-green-600 dark:text-green-400 text-sm font-medium">
              {mnemonicSuccess}
            </div>
          )}
        </div>

        {/* Main Card */}
        <div className="group relative overflow-hidden rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-2xl mb-6 bg-white dark:bg-gray-800 transition-all duration-300 transform hover:-translate-y-1">
          {/* Gradient Background on Hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-blue-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />

          {/* Header Section */}
          <div className="relative p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
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
                className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-all duration-200 border border-gray-200 dark:border-gray-600 w-full sm:w-auto"
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
        <div className="flex justify-center mb-6">
          {/* Solana Wallet Generator - Expanded */}
          <div className="group relative overflow-hidden w-full max-w-2xl rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-2xl p-4 sm:p-6 bg-white dark:bg-gray-800 transition-all duration-300 transform hover:-translate-y-1">
            {/* Gradient Background on Hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-blue-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />

            <div className="relative">
              <h2 className="text-lg sm:text-xl font-semibold mb-4 text-center text-gray-900 dark:text-white">
                Solana Wallet Generator
              </h2>
              <div className="flex justify-center mb-4">
                <button
                  onClick={() => {
                    generateNewWallet();
                  }}
                  className="flex items-center justify-center gap-2 px-8 py-3 bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white rounded-lg transition-colors font-medium shadow-lg"
                >
                  <RefreshCw className="w-5 h-5" />
                  <span>Generate Solana Wallet</span>
                </button>
              </div>
              {walletMessage.text && (
                <div
                  className={`mb-4 text-sm font-medium text-center ${
                    walletMessage.type === "success"
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {walletMessage.text}
                </div>
              )}
              {/* Wallet Details Card */}
              {showSolanaWallet && (publicKey || privateKey) && (
                <div className="mt-4">
                  {/* Balance */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 mb-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        Balance
                      </h3>
                      <button
                        onClick={async () => {
                          if (publicKey) {
                            const newBalance = await getBalance(publicKey);
                            setBalance(newBalance);
                          }
                        }}
                        className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 text-gray-600 dark:text-gray-300 rounded text-xs transition-colors border border-gray-200 dark:border-gray-600"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Refresh
                      </button>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                      {balance} SOL
                    </p>
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
                            await navigator.clipboard.writeText(publicKey);
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
                        {publicKey}
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
                          onClick={() =>
                            setPrivateKeyVisible(!privateKeyVisible)
                          }
                          className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 text-gray-600 dark:text-gray-300 rounded text-xs transition-colors border border-gray-200 dark:border-gray-600"
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
                          className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 text-gray-600 dark:text-gray-300 rounded text-xs transition-colors border border-gray-200 dark:border-gray-600"
                        >
                          <Copy className="w-3 h-3" />
                          Copy
                        </button>
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                      <p className="text-gray-900 dark:text-white font-mono text-sm break-all">
                        {privateKeyVisible ? privateKey : "•".repeat(64)}
                      </p>
                    </div>
                  </div>
                  {/* Warning */}
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mt-4">
                    <p className="text-amber-800 dark:text-amber-200 text-sm flex items-center gap-2">
                      <span>⚠️</span>
                      Never share your private key with anyone. Anyone with
                      access to it can control your wallet.
                    </p>
                  </div>
                </div>
              )}
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
    </div>
  );
};

export default App;
