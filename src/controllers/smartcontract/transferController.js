import { ethers } from "ethers";
import contractABI from "../../config/contract.json";
import TransferTransaction from "../../models/smartcontract/tranferTransaction"; // Nhập model cho transaction

const transferToken = async (req, res) => {
  const { receiver, amount } = req.body;

  // Kiểm tra địa chỉ người nhận và số lượng
  if (!ethers.isAddress(receiver)) {
    return res.status(400).json({ message: "Địa chỉ người nhận không hợp lệ" });
  }
  if (!amount || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ message: "Số lượng phải là một số dương" });
  }

  try {
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    const contractAddress = process.env.CONTRACT_ADDRESS; 

    // Tạo đối tượng hợp đồng
    const contract = new ethers.Contract(contractAddress, contractABI, wallet);

    // Chuyển đổi số lượng sang định dạng uint256
    const parsedAmount = ethers.parseUnits(amount.toString(), 18);

    // Gọi hàm transfer
    const tx = await contract.transfer(receiver, parsedAmount, {
      gasLimit: 100000,
      gasPrice: ethers.parseUnits('20', 'gwei')
    });

    // Chờ giao dịch hoàn thành
    await tx.wait();

    // Lưu thông tin giao dịch vào cơ sở dữ liệu
    await TransferTransaction.create({
      sender: wallet.address,  // Địa chỉ người gửi
      receiver: receiver,
      amount: amount.toString(),
      txHash: tx.hash,
    });

    res.status(200).json({ message: "Chuyển tiền thành công!", tx });
  } catch (error) {
    console.error("Lỗi:", error);
    res.status(500).json({ message: "Có lỗi xảy ra", error: error.message });
  }
};

export { transferToken };
