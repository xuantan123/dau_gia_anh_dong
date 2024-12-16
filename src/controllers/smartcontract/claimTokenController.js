import { ethers } from "ethers";
import contractABI from "../../config/contract.json";
import Claim from "../../models/smartcontract/Claim";

export const claimToken = async (req, res) => {
  const { receiver, progress } = req.body;
  const amount = 100;

  // Kiểm tra địa chỉ và điều kiện
  if (!ethers.isAddress(receiver)) {
    return res.status(400).json({ message: "Invalid recipient address" });
  }
  if (progress < 40) {
    return res
      .status(405)
      .json({ message: "You have not watched 40% of the video" });
  }

  try {
    const lastClaim = await Claim.findOne({
      where: { receiver },
      order: [["createdAt", "DESC"]],
    });

    if (lastClaim) {
      const now = new Date();
      const lastClaimDate = new Date(lastClaim.createdAt);
      const diff = (now - lastClaimDate) / (1000 * 60 * 60 * 24); 
      if (diff < 1) {
        return res.status(400).json({
          errorCode : 1,
          message: "You can only claim once per day",
        });
      }
    }

    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const contractAddress = process.env.CONTRACT_ADDRESS;
    const contract = new ethers.Contract(contractAddress, contractABI, wallet);

    const parsedAmount = ethers.parseUnits(amount.toString(), 18);
    const tx = await contract.mint(receiver, parsedAmount, {
      gasLimit: 100000,
      gasPrice: ethers.parseUnits("200", "gwei"),
    });

    await tx.wait();

    await Claim.create({
      receiver: receiver,
      amount: amount.toString(),
      txHash: tx.hash,
      createdAt: new Date(),
    });

    res.status(200).json({ 
      errorCode : 0 ,
      message: "Claim Token successful!" 
    });
  } catch (error) {
    console.error("Lỗi:", error);
    res.status(500).json({ 
      errorCode : 5,
      message: "An error occurred", 
      error: error.message });
  }
};
