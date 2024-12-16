import {ethers} from "ethers";
import auctionABI from "../config/contractBid.json";

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL); 

const privateKey = process.env.PRIVATE_KEY; 
const wallet = new ethers.Wallet(privateKey, provider); 

const auctionContract = new ethers.Contract(process.env.ContractAuction, auctionABI, wallet);

module.exports = auctionContract;
