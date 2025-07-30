import {
  Keypair,
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
} from "@solana/web3.js";
import * as bip39 from "bip39";
import { Buffer } from "buffer";

if (typeof window !== "undefined") {
  window.Buffer = Buffer;
}

const connection = new Connection("https://api.devnet.solana.com");

const deriveKeypairFromSeed = (seed, derivationIndex = 0) => {
  const seedWithIndex = Buffer.concat([seed, Buffer.from([derivationIndex])]);
  const privateKeySeed = seedWithIndex.slice(0, 32);
  return Keypair.fromSeed(privateKeySeed);
};

export const generateWallet = () => {
  try {
    const mnemonic = bip39.generateMnemonic();
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    const keypair = deriveKeypairFromSeed(seed, 0);

    return [mnemonic.split(" "), keypair.publicKey.toBase58(), keypair];
  } catch {
    const keypair = Keypair.generate();
    const fakeMnemonic = bip39.generateMnemonic().split(" ");

    return [fakeMnemonic, keypair.publicKey.toBase58(), keypair];
  }
};

export const importWallet = (mnemonicString) => {
  if (!bip39.validateMnemonic(mnemonicString)) {
    throw new Error("Invalid mnemonic");
  }

  const seed = bip39.mnemonicToSeedSync(mnemonicString);
  const keypair = deriveKeypairFromSeed(seed, 0);

  return [keypair.publicKey.toBase58(), keypair];
};

export const generateWalletFromMnemonic = (
  mnemonicString,
  derivationIndex = 0
) => {
  if (!bip39.validateMnemonic(mnemonicString)) {
    throw new Error("Invalid mnemonic");
  }

  const seed = bip39.mnemonicToSeedSync(mnemonicString);
  const keypair = deriveKeypairFromSeed(seed, derivationIndex);

  return {
    publicKey: keypair.publicKey.toBase58(),
    keypair: keypair,
    derivationIndex: derivationIndex,
  };
};

export const getNextDerivationIndex = (existingWallets) => {
  if (existingWallets.length === 0) return 0;
  const maxIndex = Math.max(
    ...existingWallets.map((w) => w.derivationIndex || 0)
  );
  return maxIndex + 1;
};

export const getBalance = async (publicKeyString) => {
  try {
    const publicKey = new PublicKey(publicKeyString);
    const balance = await connection.getBalance(publicKey);
    const solBalance = balance / LAMPORTS_PER_SOL;
    return solBalance;
  } catch {
    return 0;
  }
};

export const getMultipleBalances = async (publicKeys) => {
  const balances = {};

  for (const publicKeyString of publicKeys) {
    try {
      const balance = await getBalance(publicKeyString);
      balances[publicKeyString] = balance;
    } catch {
      balances[publicKeyString] = 0;
    }
  }

  return balances;
};
