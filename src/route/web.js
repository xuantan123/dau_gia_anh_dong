import express from 'express';
import { upload } from '../middleware/multerConfig.js';
import { register , login , verifyEmailCode , getLoginInfoById} from '../controllers/Login/LoginController.js';
import { createInfo , updateInfo , deleteInfo , getFullnameById , getFullnameByLoginId} from '../controllers/Login/InfoCotroller.js';
import { claimToken  } from "../controllers/smartcontract/claimTokenController.js";
import { transferToken } from "../controllers/smartcontract/transferController.js";
import { approveToken , allowanceToken , banlanceOfbyAddress } from "../controllers/smartcontract/approveController.js";
import { createAuctionItem , getProductsByAuthorId , deleteProduct , editProduct , checkAuctionStatus  } from "../controllers/author/auctionProduct.js";
import { placeBid ,  getAuctionDetails  , getBids , getCurrentHighestBidder , getCurrentHighestBid , getAuctionResult , getWinnerEmail , getAmountBidByBidder , getAmountBidByAuctionId, endAndSaveAuction , ProductHistory} from '../controllers/smartcontract/bidController.js';
import { registerUserForAuction , getRegisteredAuctions , deleteRegisterById } from "../controllers/user/registrationController.js";
import { uploadImageAPI } from '../controllers/author/ProcessingImage.js';
import { getCompletedAuctionDetails } from '../controllers/user/checkAuctionResult.js';

const router = express.Router();

const initWebRoutes = (app) => {
    
    router.post('/api/register', register);
    router.post('/api/verify-code', verifyEmailCode);
    router.post('/api/login', login);
    router.get('/api/getLoginbyId/:id',getLoginInfoById);
    router.post('/api/createInfo', createInfo);
    router.put('/api/updateInfo/:id', updateInfo);
    router.delete('/api/deleteInfo/:id', deleteInfo);
    router.get('/api/info/fullname/:id', getFullnameById);
    router.get('/api/info/:loginId',getFullnameByLoginId);

    router.post('/api/claim', claimToken );
    router.post('/api/transfer', transferToken);
    router.post('/api/approve', approveToken);
    router.post('/api/allowance', allowanceToken);
    router.get('/api/balanceOf/:addressAccount',banlanceOfbyAddress);
    
    router.post('/api/upload-image', upload.single('image'), uploadImageAPI);

    router.post('/api/create',upload.single('image'), createAuctionItem);
    router.get('/api/auction/status', checkAuctionStatus);
    router.get('/api/products/author/:loginId', getProductsByAuthorId);
    router.delete('/api/delete/:id', deleteProduct);
    router.put('/api/edit/:id', editProduct);

    router.post('/api/bid',placeBid);
    router.get('/api/auctions/:auctionId', getAuctionDetails);
    router.post('/api/auctions/:auctionId/end',endAndSaveAuction);
    router.get('/api/productHistory/:loginId',ProductHistory);
    router.get('/api/auctions/:auctionId/bids', getBids);

    router.get('/api/auctions/:auctionId/current-highest-bidder', getCurrentHighestBidder);
    router.get('/api/auctions/:auctionId/current-highest-bid', getCurrentHighestBid);

    router.get('/api/getAmountBidByBidder/:bidderId',getAmountBidByBidder);
    router.get('/api/getAmountBidByAuctionId/:auctionId',getAmountBidByAuctionId);
    router.get('/api/auction/:auctionId/result', getAuctionResult);
    router.get('/api/getEmailByWinnerAddress/:auctionId', getWinnerEmail);
    router.post('/api/registerUser', registerUserForAuction);
    router.get('/api/:userId/auctions', getRegisteredAuctions);
    router.delete('/api/deletregister/:id',deleteRegisterById);
    
    router.get('/api/completed-auction',getCompletedAuctionDetails);
    

    router.get('/', (req, res) => {
        res.send('Welcome to the API');
    });

    app.use("/", router);
};

export default initWebRoutes;
