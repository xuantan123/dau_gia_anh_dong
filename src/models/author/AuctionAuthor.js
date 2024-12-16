const { Model, DataTypes } = require('sequelize');
const db = require('../index');

class Auction extends Model {
  static associate(models) {
    Auction.belongsToMany(models.Login, {
      through: models.Registration,
      foreignKey: 'auctionId',
      as: 'registeredUsers'
    });
    Auction.hasOne(models.AuctionResult, {
      foreignKey: 'auctionId',
      as: 'result',
      onDelete: 'CASCADE',
    });
    Auction.hasMany(models.Bid, {
      foreignKey: 'auctionId',
      as: 'bids',
      onDelete: 'CASCADE',
    });
  }
}

Auction.init({
  productName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: DataTypes.TEXT,
  imageUrl: DataTypes.STRING,
  startingPrice: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: false,
  },
  endTime: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  startTime: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  loginId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Login', 
      key: 'id',
    },
    onDelete: 'CASCADE', 
  },
}, {
  sequelize: db.sequelize,
  modelName: 'Auction',
  tableName: 'Auctions',
});

module.exports = Auction;
