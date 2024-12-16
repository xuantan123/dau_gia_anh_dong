const { Model, DataTypes } = require('sequelize');
const db = require('../index');

class Bid extends Model {
  static associate(models) {
    Bid.belongsTo(models.Auction, {
      foreignKey: 'auctionId',
      as: 'auction',
    });
    Bid.belongsTo(models.Info, {
      foreignKey: 'bidderId',
      as: 'bidder',
    });
  }
}

Bid.init({
  amount: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: false,
  },
  auctionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Auctions',
      key: 'id',
    },
  },
  bidderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Info',
      key: 'id',
    },
  },
  txHash: DataTypes.STRING,
}, {
  sequelize: db.sequelize,
  modelName: 'Bid',
  tableName: 'Bids',
});

module.exports = Bid;
