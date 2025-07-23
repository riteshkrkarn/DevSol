import React, { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
} from "lucide-react";
import SecretPhraseGrid from "./components/SecretPhraseGrid.jsx";
import { generateMnemonic as generateBip39Mnemonic } from "bip39";
import { Buffer } from "buffer";
import { generateWallet, importWallet, getBalance } from "./utils/wallet.js";

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
  const [privateKeyVisible, setPrivateKeyVisible] = useState(false); // Add state for private key visibility

  console.log("📊 Current state:", {
    isOpen,
    seedPhraseLength: seedPhrase.length,
    isVisible,
    copied,
    inputPhrase: inputPhrase ? `"${inputPhrase.substring(0, 20)}..."` : "empty",
    balance,
    publicKey: publicKey ? `${publicKey.substring(0, 10)}...` : "empty",
    privateKey: privateKey ? "***hidden***" : "empty",
  });

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
    console.log("🔧 generateNewWallet called");
    console.log("📝 Input phrase:", inputPhrase ? `"${inputPhrase}"` : "empty");

    try {
      if (inputPhrase.trim()) {
        console.log("📥 Importing wallet from user input");
        const [publicKey, keypair] = importWallet(inputPhrase.trim());
        const seedWords = inputPhrase.trim().split(/\s+/); // Use regex to handle multiple spaces

        console.log("✅ Import successful:", {
          seedWordsCount: seedWords.length,
          publicKey: publicKey.substring(0, 20) + "...",
          keypairExists: !!keypair,
        });

        setSeedPhrase(seedWords);
        setPublicKey(publicKey);
        setPrivateKey(Buffer.from(keypair.secretKey).toString("hex"));

        // Fetch balance for imported wallet
        getBalance(publicKey)
          .then((balance) => {
            console.log("📊 Balance fetched for imported wallet:", balance);
            setBalance(balance);
          })
          .catch((err) => {
            console.error("❌ Error fetching balance:", err);
            setBalance(0);
          });
      } else {
        console.log("🎲 Generating new random wallet");
        const [mnemonic, publicKey, keypair] = generateWallet();

        console.log("✅ Generation successful:", {
          mnemonicLength: mnemonic.length,
          publicKey: publicKey.substring(0, 20) + "...",
          keypairExists: !!keypair,
        });

        setSeedPhrase(mnemonic);
        setPublicKey(publicKey);
        setPrivateKey(Buffer.from(keypair.secretKey).toString("hex"));
        setBalance(0); // New wallets start with 0 balance
      }

      // Reset UI states
      setCopied(false);
      setPrivateKeyVisible(false);
      setIsOpen(true); // Automatically open the seed phrase section
      setInputPhrase(""); // Clear the input field after generation/import

      console.log("🔄 Reset UI states and cleared input");
    } catch (error) {
      console.error("❌ Error in generateNewWallet:", error);
      // Reset states on error
      setSeedPhrase([]);
      setPublicKey("");
      setPrivateKey("");
      setBalance(0);
    }
  };

  console.log("🎨 Rendering App component");

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-2">
            SolVault
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Secure Solana Wallet Generator
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-lg p-4 sm:p-6 mb-6">
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
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
            />
            <button
              onClick={() => {
                console.log("🔲 Generate button clicked");
                generateNewWallet();
              }}
              className="flex items-center justify-center gap-2 px-6 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors font-medium whitespace-nowrap"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Generate</span>
            </button>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-lg overflow-hidden mb-6">
          {/* Header Section */}
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  Secret Phrase
                </h2>
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full border border-gray-200">
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
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-amber-800 text-sm">
                  ⚠️ Store your secret phrase safely. Anyone with access to it
                  can control your wallet. You can generate them or import by
                  typing your own. Also copy them.
                </p>
              </div>

              {/* Controls */}
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={toggleVisibility}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors border border-gray-200 hover:border-gray-300"
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
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors border border-gray-200 hover:border-gray-300"
                >
                  <Copy className="w-4 h-4" />
                  <span className="text-sm">{copied ? "Copied!" : "Copy"}</span>
                </button>
              </div>

              {/* Secret Phrase Grid - Using the imported component */}
              <SecretPhraseGrid seedPhrase={seedPhrase} isVisible={isVisible} />

              {/* Additional Info */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="text-gray-900 font-medium mb-3">
                  Security Tips:
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-600 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-gray-400 mt-0.5">•</span>
                    <span>Never share your secret phrase with anyone</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-gray-400 mt-0.5">•</span>
                    <span>Store it offline in a secure location</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-gray-400 mt-0.5">•</span>
                    <span>Consider writing it down on paper</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-gray-400 mt-0.5">•</span>
                    <span>Verify each word before saving</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wallet Details Card */}
        {(publicKey || privateKey) && (
          <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-lg overflow-hidden mb-6">
            {/* Header Section */}
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  Wallet Details
                </h2>
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full border border-gray-200">
                  SOL
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Balance */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-gray-900 font-medium">Balance</h3>
                  <button
                    onClick={async () => {
                      if (publicKey) {
                        console.log("🔄 Refreshing balance...");
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
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-gray-900 font-medium">Public Key</h3>
                  <button
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(publicKey);
                        console.log("✅ Public key copied to clipboard");
                      } catch (err) {
                        console.error("❌ Failed to copy public key:", err);
                      }
                    }}
                    className="flex items-center gap-1 px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded text-xs transition-colors border border-gray-200"
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
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-gray-900 font-medium">Private Key</h3>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        console.log(
                          "👁️ Toggling private key visibility from",
                          privateKeyVisible,
                          "to",
                          !privateKeyVisible
                        );
                        setPrivateKeyVisible(!privateKeyVisible);
                      }}
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
                          console.log("✅ Private key copied to clipboard");
                        } catch (err) {
                          console.error("❌ Failed to copy private key:", err);
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
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-amber-800 text-sm">
                  ⚠️ Never share your private key with anyone. Anyone with
                  access to it can control your wallet.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-6 sm:mt-8">
          <p className="text-gray-500 text-sm">
            Built for learning purposes • Always verify on mainnet
          </p>
        </div>
      </div>
    </div>
  );
};

export default App;
