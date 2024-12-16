const { Model, DataTypes } = require('sequelize');
const db = require('../index');
import Info from '../../models/Login/Info';

class AuctionResult extends Model {
  static associate(models) {
    AuctionResult.belongsTo(models.Auction, {
      foreignKey: 'auctionId',
      as: 'auction',
      onDelete: 'CASCADE',
    });
  }
}

AuctionResult.init({
  auctionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Auctions',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  winnerAddress: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'Info',
      key: 'walletAddress',
    },
    onDelete: 'CASCADE',
  },
  highestBid: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  loginId:{
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  sequelize: db.sequelize,
  modelName: 'AuctionResult',
  tableName: 'AuctionResults',
});

module.exports = AuctionResult;
