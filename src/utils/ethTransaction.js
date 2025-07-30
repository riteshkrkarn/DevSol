import { ethers } from "ethers";

// For testing, you can use a public endpoint or set up your own
const provider = new ethers.providers.JsonRpcProvider(
  "https://eth-mainnet.g.alchemy.com/v2/demo"
);

export const sendEthTransaction = async (
  fromWallet,
  toAddress,
  amount,
  gasPrice = null
) => {
  try {
    // Validate inputs
    if (!fromWallet || !fromWallet.wallet) {
      throw new Error("Invalid sender wallet");
    }

    if (!toAddress || !ethers.utils.isAddress(toAddress)) {
      throw new Error("Invalid recipient address");
    }

    if (!amount || amount <= 0) {
      throw new Error("Invalid amount");
    }

    // Connect wallet to provider
    const wallet = fromWallet.wallet.connect(provider);

    // Convert amount to wei
    const amountWei = ethers.utils.parseEther(amount.toString());

    // Get gas price if not provided
    let txGasPrice = gasPrice;
    if (!txGasPrice) {
      txGasPrice = await provider.getGasPrice();
    }

    // Create transaction object
    const transaction = {
      to: toAddress,
      value: amountWei,
      gasPrice: txGasPrice,
    };

    // Estimate gas
    const gasLimit = await provider.estimateGas(transaction);
    transaction.gasLimit = gasLimit;

    // Send transaction
    const tx = await wallet.sendTransaction(transaction);

    // Wait for confirmation
    const receipt = await tx.wait();

    // Calculate fee
    const fee = ethers.utils.formatEther(tx.gasPrice.mul(receipt.gasUsed));

    return {
      success: true,
      hash: tx.hash,
      receipt: receipt,
      amount: amount,
      fee: parseFloat(fee),
      gasUsed: receipt.gasUsed.toString(),
    };
  } catch (error) {
    console.error("Ethereum transaction error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export const getEthGasPrice = async () => {
  try {
    const gasPrice = await provider.getGasPrice();
    return ethers.utils.formatUnits(gasPrice, "gwei");
  } catch (error) {
    console.error("Error getting Ethereum gas price:", error);
    return "20"; // Default gas price in gwei
  }
};

export const estimateEthGas = async (fromAddress, toAddress, amount) => {
  try {
    const amountWei = ethers.utils.parseEther(amount.toString());

    const transaction = {
      from: fromAddress,
      to: toAddress,
      value: amountWei,
    };

    const gasEstimate = await provider.estimateGas(transaction);
    return gasEstimate.toString();
  } catch (error) {
    console.error("Error estimating Ethereum gas:", error);
    return "21000"; // Default gas limit
  }
};

export const validateEthAddress = (address) => {
  try {
    return ethers.utils.isAddress(address);
  } catch {
    return false;
  }
};
