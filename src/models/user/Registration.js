const { Model, DataTypes } = require('sequelize');
const db = require('../index');

class Registration extends Model {
  static associate(models) {
    // Mối quan hệ với bảng Info
    Registration.belongsTo(models.Login, {
      foreignKey: 'userId',
      as: 'user', // Alias để dễ dàng truy cập
    });
    // Mối quan hệ với bảng Auction
    Registration.belongsTo(models.Auction, {
      foreignKey: 'auctionId',
      as: 'auction', // Alias để dễ dàng truy cập
    });
  }
}

Registration.init({
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Login', 
      key: 'id', 
    },
    onUpdate: 'CASCADE', 
    onDelete: 'CASCADE', 
  },
  auctionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Auctions', 
      key: 'id', 
    },
    onUpdate: 'CASCADE', 
    onDelete: 'CASCADE', 
  },
}, {
  sequelize: db.sequelize,
  modelName: 'Registration',
  tableName: 'Registrations',
  timestamps: true, 
});

module.exports = Registration;
