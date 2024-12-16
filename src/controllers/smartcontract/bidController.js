const { ethers } = require('ethers');
const { allowanceToken } = require('../../controllers/smartcontract/approveController'); // Nhập hàm allowanceToken
import abiBid from "../../config/contractBid.json"; // Thay thế bằng ABI của smart contract bạn
import abi from "../../config/contract.json";
import Bid from "../../models/author/BidAuthor";
import AuctionResult from "../../models/author/AuctionResult";
import Info from '../../models/Login/Info';
import Login from "../../models/Login/Login";
import Auction from "../../models/author/AuctionAuthor";
import nodemailer from 'nodemailer';
import { where } from "sequelize";
import { login } from "../Login/LoginController";


// Cấu hình provider và contract
const contractAddress = process.env.CONTRACT_ADDRESS;
const contractAddressBid = process.env.ContractAuction;
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const privateKey = process.env.PRIVATE_KEY;
const wallet = new ethers.Wallet(privateKey, provider);
const auctionContract = new ethers.Contract(contractAddressBid, abiBid, wallet); // Kết nối với contract bid
const tokenContract = new ethers.Contract(contractAddress, abi, wallet); // Kết nối với contract token

export const placeBid = async (req, res) => {
    const { auctionId, bidAmount, bidderId } = req.body;
   
    // Kiểm tra dữ liệu yêu cầu
    if (!auctionId || !bidAmount || !bidderId) {
        return res.status(400).send('Thiếu thông tin auctionId hoặc bidAmount');
    }

    try {
        // Lưu thông tin vào MySQL (không thực hiện giao dịch với contract)
        const newBid = await Bid.create({
            amount: bidAmount, // Số lượng giá thầu
            auctionId: auctionId, // ID của cuộc đấu giá
            bidderId: bidderId, // ID của người đặt giá thầu
        });

        return res.status(200).send({
            message: 'Đặt giá thầu thành công',
            bidId: newBid.id // Trả về ID của bid mới tạo
        });

    } catch (error) {
        console.error('Lỗi khi đặt giá thầu:', error);
        return res.status(500).send({
            message: 'Có lỗi xảy ra khi đặt giá thầu.',
            error: error.message
        });
    }
};
export const getAuctionDetails = async (req, res) => {
    const { auctionId } = req.params;

    if (!auctionId) {
        return res.status(400).send('Thiếu auctionId.');
    }

    try {
        // Fetch auction details from the database using Sequelize
        const auctionDetails = await Auction.findOne({ where: { id: auctionId } });

        if (!auctionDetails) {
            return res.status(404).send('Cuộc đấu giá không tồn tại.');
        }

        return res.status(200).send({
            auctionId: auctionDetails.id.toString(),
            productName: auctionDetails.productName,
            description: auctionDetails.description,
            imageUrl: auctionDetails.imageUrl,
            startingPrice: auctionDetails.startingPrice.toString(),
            startTime : auctionDetails.startTime,
            endTime: auctionDetails.endTime.toString(),
            active: auctionDetails.active,
        });
    } catch (error) {
        console.error('Lỗi khi lấy chi tiết cuộc đấu giá:', error);
        return res.status(500).send({
            message: 'Có lỗi xảy ra khi lấy chi tiết cuộc đấu giá.',
            error: error.message
        });
    }
};

// Hàm kết thúc cuộc đấu giá
export const endAuction = async (req, res) => {
    const { auctionId } = req.params;

    if (!auctionId) {
        return res.status(400).send('Thiếu auctionId.');
    }

    try {
        const tx = await auctionContract.endAuction(auctionId);
        const receipt = await tx.wait();

        if (receipt.status !== 1) {
            return res.status(500).send('Kết thúc cuộc đấu giá thất bại.');
        }

        return res.status(200).send({
            errorCode : 0,
            message: 'Kết thúc cuộc đấu giá thành công',
            txHash: tx.hash
        });
    } catch (error) {
        console.error('Lỗi khi kết thúc cuộc đấu giá:', error);
        return res.status(500).send({
            errorCode: 5,
            message: 'Có lỗi xảy ra khi kết thúc cuộc đấu giá.',
            error: error.message
        });
    }
};

export const getBids = async (req, res) => {
    const { auctionId } = req.params;

    if (!auctionId) {
        return res.status(400).send('Thiếu auctionId.');
    }

    try {
        const bids = await auctionContract.getBids(auctionId);

        const formattedBids = bids.map(bid => ({
            amount: ethers.formatUnits(bid.amount, 18),
            bidder: bid.bidder,
        }));

        return res.status(200).send(formattedBids);
    } catch (error) {
        console.error('Lỗi khi lấy danh sách giá thầu:', error);
        return res.status(500).send({
            message: 'Có lỗi xảy ra khi lấy danh sách giá thầu.',
            error: error.message
        });
    }
};
export const getAmountBidByBidder = async (req, res) => {
    const { bidderId } = req.params;

    if (!bidderId) {
        return res.status(400).send('Thiếu bidderId.');
    }

    try {
        
        const bids = await Bid.findAll({
            where: {
                bidderId: bidderId, 
            }
        });

        if (bids.length === 0) {
            return res.status(404).send('Không tìm thấy bất kỳ bid nào cho bidderId này.');
        }

        const totalAmount = bids.reduce((sum, bid) => sum + parseFloat(bid.amount), 0);

        return res.status(200).send({
            message: 'Lấy thông tin bids thành công.',
            totalAmount: totalAmount, 
            bids: bids.map(bid => ({
                auctionId: bid.auctionId, 
                bidAmount: bid.amount,           
            }))
        });

    } catch (error) {
        console.error('Lỗi khi lấy thông tin bids:', error);
        return res.status(500).send({
            message: 'Có lỗi xảy ra khi lấy thông tin bids.',
            error: error.message
        });
    }
};
export const getAmountBidByAuctionId = async (req, res) => {
    const { auctionId } = req.params;

    if (!auctionId) {
        return res.status(400).send('Thiếu AuctionId.');
    }

    try {
        const auction = await Auction.findOne({
            where: { id: auctionId },
            attributes: ['startingPrice'], 
        });

        if (!auction) {
            return res.status(404).send('Không tìm thấy Auction với auctionId này.');
        }

        const startingPrice = parseFloat(auction.startingPrice || 0);

        const bids = await Bid.findAll({
            where: { auctionId: auctionId },
        });

        if (bids.length === 0) {
            return res.status(404).send('Không tìm thấy bất kỳ bid nào cho auctionId này.');
        }

        const totalAmount = bids.reduce((sum, bid) => sum + parseFloat(bid.amount), 0);
        const totalAmountAndStartingPrice = totalAmount + startingPrice;

        return res.status(200).send({
            message: 'Lấy thông tin bids thành công.',
            startingPrice: startingPrice,
            totalAmount: totalAmount,
            totalAmountAndStartingPrice: totalAmountAndStartingPrice,
            bids: bids.map(bid => ({
                auctionId: bid.auctionId,
                bidAmount: bid.amount,
            })),
        });
    } catch (error) {
        console.error('Lỗi khi lấy thông tin bids:', error);
        return res.status(500).send({
            message: 'Có lỗi xảy ra khi lấy thông tin bids.',
            error: error.message,
        });
    }
};
// Hàm lấy người đặt giá cao nhất
export const getCurrentHighestBidder = async (req, res) => {
    const { auctionId } = req.params;

    if (!auctionId) {
        return res.status(400).send('Thiếu auctionId.');
    }

    try {
        const highestBidderAddress = await auctionContract.getCurrentHighestBidder(auctionId);
        return res.status(200).send({
            auctionId: auctionId,
            highestBidder: highestBidderAddress
        });
    } catch (error) {
        console.error('Lỗi khi lấy địa chỉ ví của người đặt giá cao nhất:', error);
        return res.status(500).send({
            message: 'Có lỗi xảy ra khi lấy địa chỉ ví của người đặt giá cao nhất.',
            error: error.message
        });
    }
};

// Hàm lấy giá cao nhất hiện tại
export const getCurrentHighestBid = async (req, res) => {
    const { auctionId } = req.params;

    if (!auctionId) {
        return res.status(400).send('Thiếu auctionId.');
    }

    try {
        const highestBidAmount = await auctionContract.getCurrentHighestBid(auctionId);
        return res.status(200).send({
            auctionId: auctionId,
            highestBid: ethers.formatUnits(highestBidAmount, 18) 
        });
    } catch (error) {
        console.error('Lỗi khi lấy giá cao nhất hiện tại:', error);
        return res.status(500).send({
            message: 'Có lỗi xảy ra khi lấy giá cao nhất hiện tại.',
            error: error.message
        });
    }
};

export const getAuctionResult = async (req, res) => {
    const { auctionId } = req.params;

    if (!auctionId) {
        return res.status(400).send('Thiếu auctionId.');
    }

    try {
        const result = await auctionContract.auctionResult(auctionId);

        const auctionResult = await AuctionResult.create({
            auctionId: result.auctionId.toString(),
            winnerAddress: result.winner,
            highestBid: ethers.formatUnits(result.highestBid,18)
        });

        return res.status(200).send({
            auctionId: auctionResult.auctionId,
            winner: auctionResult.winnerAddress,
            highestBid: auctionResult.highestBid.toString() 
        });
    } catch (error) {
        console.error('Lỗi khi lấy kết quả đấu giá:', error);
        return res.status(500).send({
            message: 'Có lỗi xảy ra khi lấy kết quả đấu giá.',
            error: error.message
        });
    }
};

export const endAndSaveAuction = async (req, res) => {
    const { auctionId } = req.params;

    if (!auctionId) {
        return res.status(400).send('Thiếu auctionId.');
    }

    try {
        const tx = await auctionContract.endAuction(auctionId);
        const receipt = await tx.wait();

        if (receipt.status !== 1) {
            return res.status(500).send('Kết thúc cuộc đấu giá thất bại.');
        }
        const result = await auctionContract.auctionResult(auctionId);
        const winnerInfo = await Info.findOne({ where: { walletAddress: result.winner } });

        if (!winnerInfo) {
            return res.status(404).send('Không tìm thấy thông tin người thắng cuộc.');
        }


        const auctionResult = await AuctionResult.create({
            auctionId: result.auctionId.toString(),
            winnerAddress: result.winner, 
            highestBid: ethers.formatUnits(result.highestBid, 18),
            loginId : winnerInfo.id
        });

        return res.status(200).send({
            errorCode: 0,
            message: 'Kết thúc đấu giá và lưu kết quả thành công.',
            // auctionResult: {
            //     auctionId: auctionResult.auctionId,
            //     winner: auctionResult.winnerAddress,
            //     highestBid: auctionResult.highestBid,
            //     loginId: auctionResult.loginId,
            // },
            // txHash: tx.hash
        });
    } catch (error) {
        console.error('Lỗi khi kết thúc và lưu kết quả đấu giá:', error);
        return res.status(500).send({
            errorCode : 5,
            message: 'Có lỗi xảy ra khi kết thúc và lưu kết quả đấu giá.',
            error: error.message
        });
    }
};

export const ProductHistory = async (req, res) => {
    const { loginId } = req.params;

    if (!loginId) {
        return res.status(400).send('Thiếu LoginID.');
    }

    try {
        const auctionResults = await AuctionResult.findAll({
            where: { loginId },
            attributes: ['id', 'auctionId', 'winnerAddress', 'highestBid', 'loginId'], // Chỉ lấy các thuộc tính cần thiết từ AuctionResult
        });

        if (auctionResults.length === 0) {
            return res.status(404).send('Không tìm thấy kết quả đấu giá cho loginId đã cung cấp.');
        }

        const auctionIds = auctionResults.map(result => result.auctionId);

        const auctions = await Auction.findAll({
            where: {
                id: auctionIds,
            },
            attributes: ['id', 'productName','description'],  
        });

        const auctionsMap = auctions.reduce((acc, auction) => {
            acc[auction.id] = {
                productName: auction.productName,
                description: auction.description,
            };
            return acc;
        }, {});

        const resultsWithProductName = auctionResults.map(result => ({
            // id: result.id,
            // auctionId: result.auctionId,
            // winnerAddress: result.winnerAddress,
            highestBid: result.highestBid,
            productName: auctionsMap[result.auctionId]?.productName || null, 
            description: auctionsMap[result.auctionId]?.description || null,
        }));

        return res.status(200).send({
            errorCode: 0,
            message: 'Lịch sử kết quả đấu giá thành công.',
            data: resultsWithProductName,
        });
    } catch (error) {
        console.error('Lỗi khi lấy kết quả đấu giá:', error);
        return res.status(500).send({
            errorCode: 1,
            message: 'Có lỗi xảy ra khi lấy kết quả đấu giá.',
            error: error.message,
        });
    }
};
const sendEmail = async (to, subject, text) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER, 
            pass: process.env.EMAIL_PASS, 
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: to,
        subject: subject,
        text: text,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email đã được gửi thành công!');
    } catch (error) {
        console.error('Lỗi khi gửi email:', error);
    }
};


export const getWinnerEmail = async (req, res) => {
    const { auctionId } = req.params;

    if (!auctionId) {
        return res.status(400).send('Thiếu auctionId.');
    }

    try {
        // Lấy kết quả từ smart contract
        const result = await auctionContract.auctionResult(auctionId);
        const winnerAddress = result.winner;
        const highestBid = result.highestBid;

        // Tìm kiếm trong bảng Info để lấy loginId dựa trên walletAddress
        const winnerInfo = await Info.findOne({ where: { walletAddress: winnerAddress } });

        if (!winnerInfo) {
            return res.status(404).send({ message: 'Không tìm thấy thông tin người thắng.' });
        }

        // Tìm kiếm email của người thắng trong bảng Login dựa trên loginId
        const winnerLogin = await Login.findOne({ where: { id: winnerInfo.loginId } });

        if (!winnerLogin) {
            return res.status(404).send({ message: 'Không tìm thấy thông tin đăng nhập của người thắng.' });
        }

        // Lấy thông tin đấu giá từ bảng Auction
        const auctionInfo = await Auction.findOne({ where: { id: auctionId } }); // Giả sử bạn có bảng Auction

        if (!auctionInfo) {
            return res.status(404).send({ message: 'Không tìm thấy thông tin đấu giá cho auctionId.' });
        }

        const highestBidInTokens = ethers.formatUnits(highestBid, 18);
        // Gửi email thông báo cho người thắng
        const subject = '🎉 Chúc mừng bạn đã thắng cuộc đấu giá trên nền tảng của chúng tôi! 🎉';
        const text = `
            Xin chào,

            Chúng tôi rất vui mừng thông báo rằng bạn đã là người chiến thắng trong cuộc đấu giá! Dưới đây là thông tin chi tiết:

            🔹 **Thông tin sản phẩm:**
                - Tên sản phẩm: ${auctionInfo.productName}
                - Mô tả: ${auctionInfo.description}
                - Giá khởi điểm: ${auctionInfo.startingPrice} tokens
                - Hình ảnh sản phẩm: ${auctionInfo.imageUrl ? auctionInfo.imageUrl : "Không có sẵn"}

            🔹 **Thông tin đấu giá:**
                - Số tiền thắng đấu giá: ${highestBidInTokens} tokens
                - Thời gian kết thúc: ${new Date(auctionInfo.endTime * 1000).toLocaleString('vi-VN')}

            Nếu bạn có bất kỳ thắc mắc nào, vui lòng liên hệ với chúng tôi qua email.

            Trân trọng,

            Đội ngũ hỗ trợ nền tảng Celestial.
        `;

        await sendEmail(winnerLogin.email, subject, text);
        
        return res.status(200).send({
            auctionId: auctionId,
            winnerEmail: winnerLogin.email,
            message: 'Email thông báo đã được gửi đến người thắng.',
        });
    } catch (error) {
        console.error('Lỗi khi lấy email của người thắng:', error);
        return res.status(500).send({
            message: 'Có lỗi xảy ra khi lấy email của người thắng.',
            error: error.message,
        });
    }
};