const { Op } = require('sequelize');
import Auctions from '../../models/author/AuctionAuthor'; 
import AuctionResult from '../../models/author/AuctionResult';
import Info from '../../models/Login/Info'; 

export const getCompletedAuctionDetails = async (req, res) => {
  try {
    const currentTime = Date.now(); 

    const completedAuctions = await Auctions.findAll({
      where: {
        active: false, 
        endTime: {
          [Op.lt]: currentTime, 
        },
      },
      attributes: ['id', 'productName','loginId','startTime','endTime'], 
    });

    if (!completedAuctions.length) {
      return res.status(404).json({
        success: false,
        message: 'No completed auctions found.',
      });
    }

    const auctionDetails = await Promise.all(completedAuctions.map(async (auction) => {
      const auctionResult = await AuctionResult.findOne({
        where: { auctionId: auction.id },
        attributes: ['winnerAddress', 'highestBid'],
      });

      if (!auctionResult) {
        return null;
      }

      const winnerInfo = await Info.findOne({
        where: { walletAddress: auctionResult.winnerAddress },
        attributes: ['walletAddress', 'fullname'],
      });

      return {
        productName: auction.productName,
        auctionId: auction.id,
        startTime : auction.startTime,
        endTime : auction.endTime,
        winnerAddress: auctionResult.winnerAddress,
        highestBid: auctionResult.highestBid,
        winnerFullName: winnerInfo ? winnerInfo.fullname : null,
        winnerWalletAddress: winnerInfo ? winnerInfo.walletAddress : null,
      };
    }));

    const filteredAuctionDetails = auctionDetails.filter(auction => auction !== null);

    return res.status(200).json({
      success: true,
      data: filteredAuctionDetails,
    });
  } catch (error) {
    console.error('Error fetching completed auctions:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to fetch completed auctions.',
      error: error.message,
    });
  }
};
