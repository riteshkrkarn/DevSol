import React, { useState } from "react";
import { Wallet, Droplets, Coins, Sun, Moon, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();

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

  const tools = [
    {
      title: "SolVault",
      description: "Generate secure Solana wallets with BIP39 mnemonic phrases",
      icon: <Wallet className="w-8 h-8" />,
      gradient: "from-purple-500 to-blue-600",
      href: "/vault",
    },
    {
      title: "Solana Faucet",
      description: "Get free testnet SOL tokens for development and testing",
      icon: <Droplets className="w-8 h-8" />,
      gradient: "from-blue-500 to-cyan-600",
      href: "/faucet",
    },
    {
      title: "TransactionSol",
      description: "Send SOL tokens securely on the Solana network",
      icon: <Send className="w-8 h-8" />,
      gradient: "from-orange-500 to-red-600",
      href: "/transaction",
    },
    {
      title: "Mintify",
      description: "Create and mint custom SPL tokens on the Solana blockchain",
      icon: <Coins className="w-8 h-8" />,
      gradient: "from-green-500 to-emerald-600",
      href: "/mintify",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
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

      <div className="container mx-auto px-4 pt-4 pb-2">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6">
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              DevSol
            </span>
          </h1>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Your Complete Solana Development Toolkit
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Build, test, and deploy on Solana with our essential developer
            tools. Generate wallets, get testnet tokens, and mint custom tokens
            - all in one place.
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto mb-10">
          {tools.map((tool, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              {/* Gradient Background */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${tool.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
              />

              {/* Content */}
              <div className="relative p-8">
                {/* Icon */}
                <div
                  className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${tool.gradient} text-white mb-6`}
                >
                  {tool.icon}
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {tool.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                  {tool.description}
                </p>

                {/* Button */}
                <button
                  onClick={() => navigate(tool.href)}
                  className={`w-full py-3 px-6 rounded-lg font-semibold text-white bg-gradient-to-r ${tool.gradient} hover:shadow-lg transform hover:scale-105 transition-all duration-200`}
                >
                  Launch {tool.title}
                </button>
              </div>
            </div>
          ))}
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

export default Landing;
