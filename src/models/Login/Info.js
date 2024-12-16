// models/Info.js
const { Model, DataTypes } = require('sequelize');
const db = require('../index');
import AuctionResult from '../author/AuctionResult';

class Info extends Model {
  static associate(models) {
    Info.belongsTo(models.Login, {
      foreignKey: 'loginId',
      as: 'login', 
    });
    
    Info.hasMany(models.Bid, {
      foreignKey: 'bidderId',
      as: 'bids',
      onDelete: 'CASCADE',
    });
    Info.hasMany(models.Auction, {
      foreignKey: 'authorId',
      as: 'auctions',
      onDelete: 'CASCADE',
    });
  }
}

Info.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  fullname: DataTypes.STRING,
  dateOfBirth: DataTypes.DATE,
  gender: DataTypes.BOOLEAN,
  country: DataTypes.STRING,
  walletAddress: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: true,
  },
  loginId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'Login',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
}, {
  sequelize: db.sequelize,
  modelName: 'Info',
  tableName: 'Info',
});

module.exports = Info;
