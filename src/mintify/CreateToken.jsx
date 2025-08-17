import React from "react";
import { useState } from "react";
import {
  getMinimumBalanceForRentExemptMint,
  TOKEN_PROGRAM_ID,
  MINT_SIZE,
  createInitializeMint2Instruction,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
} from "@solana/spl-token";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import {
  Keypair,
  Transaction,
  SystemProgram,
  PublicKey,
} from "@solana/web3.js";

const CreateToken = () => {
  const [tokenAccount, setTokenAccount] = useState("");
  const [mintAddress, setMintAddress] = useState("");
  const [initialSupply, setInitialSupply] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [mintAmount, setMintAmount] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const { connection } = useConnection();
  const wallet = useWallet();

  async function createToken(initialSupply) {
    const mintKeypair = Keypair.generate();
    const mintLamports = await getMinimumBalanceForRentExemptMint(connection);

    // Get associated token address
    const associatedTokenAddress = await getAssociatedTokenAddress(
      mintKeypair.publicKey,
      wallet.publicKey
    );

    const transaction = new Transaction().add(
      // Create mint account
      SystemProgram.createAccount({
        fromPubkey: wallet.publicKey,
        newAccountPubkey: mintKeypair.publicKey,
        space: MINT_SIZE,
        lamports: mintLamports,
        programId: TOKEN_PROGRAM_ID,
      }),
      createInitializeMint2Instruction(
        mintKeypair.publicKey,
        9,
        wallet.publicKey,
        wallet.publicKey,
        TOKEN_PROGRAM_ID
      ),
      // Create associated token account
      createAssociatedTokenAccountInstruction(
        wallet.publicKey, // payer
        associatedTokenAddress, // ata
        wallet.publicKey, // owner
        mintKeypair.publicKey, // mint
        TOKEN_PROGRAM_ID
      )
    );

    // Add mint to instruction if initial supply > 0
    if (initialSupply > 0) {
      transaction.add(
        createMintToInstruction(
          mintKeypair.publicKey, // mint
          associatedTokenAddress, // destination
          wallet.publicKey, // authority
          initialSupply * Math.pow(10, 9), // amount
          [],
          TOKEN_PROGRAM_ID
        )
      );
    }

    const recentBlockHash = await connection.getLatestBlockhash();
    transaction.recentBlockhash = recentBlockHash.blockhash;
    transaction.feePayer = wallet.publicKey;
    transaction.partialSign(mintKeypair);

    // Send transaction
    const signature = await wallet.sendTransaction(transaction, connection);
    await connection.confirmTransaction({
      signature,
      blockhash: recentBlockHash.blockhash,
      lastValidBlockHeight: recentBlockHash.lastValidBlockHeight,
    });

    console.log("Token created:", signature);

    // Set state
    setMintAddress(mintKeypair.publicKey.toBase58());
    if (initialSupply > 0) {
      setTokenAccount(associatedTokenAddress.toBase58());
    }

    return mintKeypair.publicKey;
  }

  async function mintTokenToAccount(mintAddress, recipientAddress, amount) {
    const mint = new PublicKey(mintAddress);
    const recipient = new PublicKey(recipientAddress);

    // Get associated token address
    const recipientTokenAddress = await getAssociatedTokenAddress(
      mint,
      recipient
    );

    // Check if account exists
    const accountInfo = await connection.getAccountInfo(recipientTokenAddress);

    const transaction = new Transaction();

    // Only add create instruction if account doesn't exist
    if (!accountInfo) {
      transaction.add(
        createAssociatedTokenAccountInstruction(
          wallet.publicKey, // payer
          recipientTokenAddress, // ata
          recipient, // owner
          mint // mint
        )
      );
    }

    // Add mint instruction
    transaction.add(
      createMintToInstruction(
        mint, // mint
        recipientTokenAddress, // destination
        wallet.publicKey, // authority
        amount * Math.pow(10, 9) // amount
      )
    );

    const recentBlockHash = await connection.getLatestBlockhash();
    transaction.recentBlockhash = recentBlockHash.blockhash;
    transaction.feePayer = wallet.publicKey;

    // Send transaction
    const signature = await wallet.sendTransaction(transaction, connection);
    await connection.confirmTransaction({
      signature,
      blockhash: recentBlockHash.blockhash,
      lastValidBlockHeight: recentBlockHash.lastValidBlockHeight,
    });

    console.log(`Minted ${amount} tokens to ${recipient.toBase58()}`);
    console.log(`Token Account: ${recipientTokenAddress.toBase58()}`);
    console.log(`Transaction: ${signature}`);
    return signature;
  }

  const handleCreateToken = async () => {
    if (!wallet.connected || !initialSupply) {
      setMessage("Please connect wallet and enter initial supply");
      setMessageType("error");
      return;
    }

    try {
      setIsCreating(true);
      setMessage("");

      // Pass initialSupply to createToken
      await createToken(parseFloat(initialSupply));

      setMessage("Token created successfully!");
      setMessageType("success");
    } catch (error) {
      console.error("Token creation failed:", error);
      setMessage("Token creation failed: " + error.message);
      setMessageType("error");
    } finally {
      setIsCreating(false);
    }
  };

  const handleMintToAccount = async () => {
    if (!recipientAddress || !mintAmount) {
      setMessage("Please enter recipient address and amount");
      setMessageType("error");
      return;
    }

    try {
      setIsMinting(true);
      setMessage("");
      const signature = await mintTokenToAccount(
        mintAddress,
        recipientAddress,
        parseFloat(mintAmount)
      );
      setMessage(
        `Successfully minted ${mintAmount} tokens! Signature: ${signature.slice(
          0,
          20
        )}...`
      );
      setMessageType("success");
      setRecipientAddress("");
      setMintAmount("");
    } catch (error) {
      console.error("Minting failed:", error);
      setMessage("Minting failed: " + error.message);
      setMessageType("error");
    } finally {
      setIsMinting(false);
    }
  };
  return (
    <div className="space-y-6">
      {/* Create Token Section */}
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">
          Create Token
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Initial Supply
            </label>
            <input
              type="number"
              value={initialSupply}
              onChange={(e) => setInitialSupply(e.target.value)}
              placeholder="Enter initial supply"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>

          <div className="relative">
            <button
              onClick={handleCreateToken}
              disabled={!wallet.connected || isCreating || !initialSupply}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-2 px-4 rounded transition duration-200 group"
              title={
                !wallet.connected
                  ? "Please connect your wallet first"
                  : !initialSupply
                  ? "Please enter initial supply"
                  : ""
              }
            >
              {isCreating ? "Creating..." : "Create Token"}

              {/* Tooltip */}
              {(!wallet.connected || !initialSupply) && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-10">
                  {!wallet.connected
                    ? "Please connect your wallet first"
                    : "Please enter initial supply"}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                </div>
              )}
            </button>
          </div>

          {!wallet.connected && (
            <p className="text-sm text-red-600 dark:text-red-400 text-center">
              Please connect your wallet first
            </p>
          )}
        </div>
      </div>

      {/* Mint to Account Section - Only show when token account is created */}
      {mintAddress && tokenAccount && (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">
            Mint to Account
          </h2>

          <div className="mb-4 p-3 bg-green-100 dark:bg-green-900 rounded-md">
            <p className="text-sm text-green-800 dark:text-green-200">
              <strong>Mint Address:</strong> {mintAddress}
            </p>
            {tokenAccount && (
              <p className="text-sm text-green-800 dark:text-green-200">
                <strong>Your Token Account:</strong> {tokenAccount}
              </p>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Recipient Address
              </label>
              <input
                type="text"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                placeholder="Enter recipient's public key"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Amount to Mint
              </label>
              <input
                type="number"
                value={mintAmount}
                onChange={(e) => setMintAmount(e.target.value)}
                placeholder="Enter amount to mint"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>

            <div className="relative">
              <button
                onClick={handleMintToAccount}
                disabled={isMinting || !recipientAddress || !mintAmount}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-2 px-4 rounded transition duration-200 group"
                title={
                  !recipientAddress
                    ? "Please enter recipient address"
                    : !mintAmount
                    ? "Please enter amount to mint"
                    : ""
                }
              >
                {isMinting ? "Minting..." : "Mint Tokens"}

                {/* Tooltip */}
                {(!recipientAddress || !mintAmount) && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-10">
                    {!recipientAddress
                      ? "Please enter recipient address"
                      : "Please enter amount to mint"}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message Display */}
      {message && (
        <div
          className={`p-3 rounded-md text-sm mb-4 ${
            messageType === "success"
              ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border border-green-300 dark:border-green-700"
              : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border border-red-300 dark:border-red-700"
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
};

export default CreateToken;
