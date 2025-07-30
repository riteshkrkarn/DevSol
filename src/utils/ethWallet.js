import { ethers } from "ethers";
import * as bip39 from "bip39";
import { Buffer } from "buffer";

if (typeof window !== "undefined") {
  window.Buffer = Buffer;
}

const INFURA_API_KEY = import.meta.env.VITE_INFURA_API_KEY;
const provider = new ethers.JsonRpcProvider(
  `https://sepolia.infura.io/v3/${INFURA_API_KEY}`
);

export const generateWallet = () => {
  try {
    const mnemonic = bip39.generateMnemonic();
    const hdWallet = ethers.HDNodeWallet.fromPhrase(mnemonic);
    const wallet = hdWallet.derivePath("m/44'/60'/0'/0/0");

    return [mnemonic.split(" "), wallet.address, wallet];
  } catch {
    const wallet = ethers.Wallet.createRandom();
    const fakeMnemonic = bip39.generateMnemonic().split(" ");

    return [fakeMnemonic, wallet.address, wallet];
  }
};

export const importWallet = (mnemonicString) => {
  if (!bip39.validateMnemonic(mnemonicString)) {
    throw new Error("Invalid mnemonic");
  }

  const hdWallet = ethers.HDNodeWallet.fromPhrase(mnemonicString);
  const wallet = hdWallet.derivePath("m/44'/60'/0'/0/0");

  return [wallet.address, wallet];
};

export const generateWalletFromMnemonic = (
  mnemonicString,
  derivationIndex = 0
) => {
  if (!bip39.validateMnemonic(mnemonicString)) {
    throw new Error("Invalid mnemonic");
  }

  const hdWallet = ethers.HDNodeWallet.fromPhrase(mnemonicString);
  const wallet = hdWallet.derivePath(`m/44'/60'/0'/0/${derivationIndex}`);

  return {
    publicKey: wallet.address,
    wallet: wallet,
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

export const getBalance = async (address) => {
  try {
    const balance = await provider.getBalance(address);
    const ethBalance = ethers.formatEther(balance);
    return parseFloat(ethBalance);
  } catch {
    return 0;
  }
};

export const getMultipleBalances = async (addresses) => {
  const balances = {};

  for (const address of addresses) {
    try {
      const balance = await getBalance(address);
      balances[address] = balance;
    } catch {
      balances[address] = 0;
    }
  }

  return balances;
};

export const sendTransaction = async (fromWallet, toAddress, amount) => {
  const walletWithProvider = fromWallet.connect(provider);
  const tx = await walletWithProvider.sendTransaction({
    to: toAddress,
    value: ethers.parseEther(amount.toString()),
  });

  return tx.hash;
};
