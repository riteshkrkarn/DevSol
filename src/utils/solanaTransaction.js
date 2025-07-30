import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";

const connection = new Connection("https://api.devnet.solana.com");

export const sendSolanaTransaction = async (
  fromWallet,
  toAddress,
  amount,
  fee = 0.000005 // Default fee in SOL
) => {
  try {
    // Validate inputs
    if (!fromWallet || !fromWallet.keypair) {
      throw new Error("Invalid sender wallet");
    }

    if (!toAddress || typeof toAddress !== "string") {
      throw new Error("Invalid recipient address");
    }

    if (!amount || amount <= 0) {
      throw new Error("Invalid amount");
    }

    // Convert amount to lamports
    const lamports = Math.floor(amount * LAMPORTS_PER_SOL);
    const feeLamports = Math.floor(fee * LAMPORTS_PER_SOL);

    // Create recipient public key
    const recipientPubkey = new PublicKey(toAddress);

    // Get recent blockhash
    const { blockhash } = await connection.getLatestBlockhash();

    // Create transaction
    const transaction = new Transaction({
      recentBlockhash: blockhash,
      feePayer: fromWallet.keypair.publicKey,
    });

    // Add transfer instruction
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: fromWallet.keypair.publicKey,
        toPubkey: recipientPubkey,
        lamports: lamports,
      })
    );

    // Sign transaction
    transaction.sign(fromWallet.keypair);

    // Send transaction
    const signature = await connection.sendRawTransaction(
      transaction.serialize(),
      {
        skipPreflight: false,
        preflightCommitment: "confirmed",
      }
    );

    // Wait for confirmation
    const confirmation = await connection.confirmTransaction(
      signature,
      "confirmed"
    );

    return {
      success: true,
      signature: signature,
      confirmation: confirmation,
      amount: amount,
      fee: fee,
    };
  } catch (error) {
    console.error("Solana transaction error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export const getSolanaTransactionFee = async () => {
  try {
    const { feeCalculator } = await connection.getRecentBlockhash();
    return feeCalculator.lamportsPerSignature / LAMPORTS_PER_SOL;
  } catch (error) {
    console.error("Error getting Solana fee:", error);
    return 0.000005; // Default fee
  }
};

export const validateSolanaAddress = (address) => {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
};
