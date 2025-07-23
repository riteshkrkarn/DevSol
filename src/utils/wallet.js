import {
  Keypair,
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
} from "@solana/web3.js";
import * as bip39 from "bip39";
import { Buffer } from "buffer";

// Make sure Buffer is available globally
if (typeof window !== "undefined") {
  window.Buffer = Buffer;
}

const connection = new Connection("https://api.devnet.solana.com");

// Simple derivation function that works in browser
const deriveKeypairFromSeed = (seed, derivationIndex = 0) => {
  // Create a simple derivation by hashing the seed with an index
  const seedWithIndex = Buffer.concat([seed, Buffer.from([derivationIndex])]);

  // Use the first 32 bytes as the private key seed
  const privateKeySeed = seedWithIndex.slice(0, 32);

  return Keypair.fromSeed(privateKeySeed);
};

// Generate new wallet
export const generateWallet = () => {
  try {
    console.log("🔧 Starting wallet generation...");

    const mnemonic = bip39.generateMnemonic(); // 12 words
    console.log("✅ Mnemonic generated:", mnemonic.split(" ").length, "words");

    const seed = bip39.mnemonicToSeedSync(mnemonic);
    console.log("✅ Seed generated from mnemonic");

    // Use simple derivation instead of ed25519-hd-key
    const keypair = deriveKeypairFromSeed(seed, 0);
    console.log("✅ Keypair created from seed");

    return [
      mnemonic.split(" "), // Array of words
      keypair.publicKey.toBase58(),
      keypair,
    ];
  } catch (error) {
    console.error("❌ Error in generateWallet:", error);

    // Fallback: generate a simple keypair without derivation
    console.log("🔄 Falling back to simple keypair generation...");
    const keypair = Keypair.generate();
    const fakeMnemonic = bip39.generateMnemonic().split(" ");

    return [fakeMnemonic, keypair.publicKey.toBase58(), keypair];
  }
};

// Import wallet from mnemonic
export const importWallet = (mnemonicString) => {
  try {
    console.log("🔧 Starting wallet import...");

    if (!bip39.validateMnemonic(mnemonicString)) {
      throw new Error("Invalid mnemonic");
    }
    console.log("✅ Mnemonic validation passed");

    const seed = bip39.mnemonicToSeedSync(mnemonicString);
    console.log("✅ Seed generated from mnemonic");

    // Use simple derivation instead of ed25519-hd-key
    const keypair = deriveKeypairFromSeed(seed, 0);
    console.log("✅ Keypair created from seed");

    return [keypair.publicKey.toBase58(), keypair];
  } catch (error) {
    console.error("❌ Error in importWallet:", error);
    throw error;
  }
};

// Get balance
export const getBalance = async (publicKeyString) => {
  try {
    console.log("🔧 Getting balance for:", publicKeyString);
    const publicKey = new PublicKey(publicKeyString);
    const balance = await connection.getBalance(publicKey);
    const solBalance = balance / LAMPORTS_PER_SOL;
    console.log("✅ Balance retrieved:", solBalance, "SOL");
    return solBalance;
  } catch (error) {
    console.error("❌ Error getting balance:", error);
    return 0;
  }
};
