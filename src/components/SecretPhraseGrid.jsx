import React from "react";
import {
  ChevronDown,
  ChevronUp,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
} from "lucide-react";

const SecretPhraseGrid = ({ seedPhrase = [], isVisible }) => {
  // Early return if seedPhrase is empty or undefined
  if (!seedPhrase || seedPhrase.length === 0) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
        <div className="col-span-full text-center text-gray-500 py-8">
          No secret phrase available. Please generate or enter one.
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
      {seedPhrase.map((word, index) => (
        <div
          key={index}
          className="bg-gray-50 border border-gray-200 rounded-lg p-2 sm:p-3 hover:bg-gray-100 transition-colors duration-200"
        >
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-xs font-mono w-6 flex-shrink-0">
              {(index + 1).toString().padStart(2, "0")}
            </span>
            <span className="text-gray-900 font-mono text-sm break-all">
              {isVisible ? word : "•".repeat(word.length)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SecretPhraseGrid;
