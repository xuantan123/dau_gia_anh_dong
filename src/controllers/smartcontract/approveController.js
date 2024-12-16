const { ethers } = require('ethers');
import abi from "../../config/contract.json";


const contractAddress = process.env.CONTRACT_ADDRESS;
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

const privateKey = process.env.PRIVATE_KEY; 
const wallet = new ethers.Wallet(privateKey, provider);
const tokenContract = new ethers.Contract(contractAddress, abi, wallet);

export const approveToken = async (req, res) => {
    const { spender, amount } = req.body;

    console.log('Tham số nhận được:', req.body);

    if (!spender || !amount) {
        return res.status(400).send('Thiếu tham số');
    }

    try {
        const amountInUnits = ethers.parseUnits(amount.toString(), 18);

        tokenContract.once("Approval", (owner, spender, value) => {
            console.log(`Sự kiện Approval: Owner: ${owner}, Spender: ${spender}, Amount: ${value.toString()}`);
        });

        const tx = await tokenContract.approve(spender, amountInUnits);
        console.log('Giao dịch phê duyệt:', tx);

        const txHash = tx.hash;
        const receipt = await tx.wait();

        if (receipt.status !== 1) {
            return res.status(500).send({
                message: 'Giao dịch thất bại',
                txHash: txHash
            });
        }

        return res.status(200).send({
            message: 'Phê duyệt thành công',
            txHash: txHash, 
            owner: tx.from, 
            spender: spender, 
            value: amountInUnits.toString() 
        });

    } catch (error) {
        console.error('Lỗi khi phê duyệt token:', error);

        // Xử lý các loại lỗi khác nhau
        if (error.code === ethers.errors.INSUFFICIENT_FUNDS) {
            return res.status(500).send('Không đủ số dư để thực hiện giao dịch.');
        } else if (error.code === ethers.errors.NETWORK_ERROR) {
            return res.status(500).send('Lỗi mạng, vui lòng kiểm tra lại kết nối.');
        } else if (error.code === ethers.errors.NONCE_EXPIRED) {
            return res.status(500).send('Nonce đã hết hạn, vui lòng thử lại.');
        } else if (error.code === ethers.errors.CALL_EXCEPTION) {
            return res.status(500).send('Lỗi liên quan đến giao dịch, vui lòng thử lại.');
        } else if (error.code === ethers.errors.FILTER_NOT_FOUND) {
            return res.status(500).send('Filter không tồn tại hoặc đã hết hạn.');
        } else {
            return res.status(500).send({
                message: 'Có lỗi xảy ra trong quá trình phê duyệt token',
                error: error.message
            });
        }
    }
};
// Hàm lấy thông tin allowance
export const allowanceToken = async (req, res) => {
    const { owner, spender } = req.body;

    console.log('Tham số nhận được:', req.body);

    // Kiểm tra các tham số bắt buộc
    if (!owner || !spender) {
        return res.status(400).send('Thiếu tham số');
    }

    try {
        // Gọi hàm allowanceOf từ hợp đồng
        const allowanceAmount = await tokenContract.allowance(owner, spender);
        
        // Chuyển đổi allowanceAmount về đơn vị hiển thị
        const allowanceInUnits = ethers.formatUnits(allowanceAmount, 18);

        return res.status(200).send({
            message: 'Lấy thông tin allowance thành công',
            owner: owner,
            spender: spender,
            allowance: allowanceInUnits // Số lượng allowance đã được lấy
        });

    } catch (error) {
        console.error('Lỗi khi lấy allowance token:', error);

        // Xử lý các loại lỗi khác nhau
        return res.status(500).send({
            message: 'Có lỗi xảy ra trong quá trình lấy allowance',
            error: error.message
        });
    }
};

export const banlanceOfbyAddress = async(req,res) => {
    const addressAccount = req.params.addressAccount;

    if(!addressAccount){
        return res.status(400).send('Thiếu tham số');
    }

    try{
        const balanceOf = await tokenContract.balanceOf(addressAccount);

        const balanceOfUnits = ethers.formatUnits(balanceOf,18);

        return res.status(200).send({
            errorCode : 0 ,
            message: 'Lấy thông tin balance thành công',
            addressAccount : addressAccount,
            balanceOf: balanceOfUnits 
        });

    } catch(error){
        return res.status(500).send({
            errorCode : 5 ,
            message: 'Có lỗi xảy ra trong quá trình lấy balance',
            error: error.message
        });
    }
}