const { Model, DataTypes } = require('sequelize');
const db = require('../index');

class Login extends Model {
  static associate(models) {
    Login.hasOne(models.Info, {
      foreignKey: 'loginId',
      as: 'info', 
      onDelete: 'SET NULL',
    });
    Login.belongsToMany(models.Auction, {
      through: models.Registration,
      foreignKey: 'userId',
      as: 'registeredAuctions',
    });
  }
}

Login.init({
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('user', 'author'),
    allowNull: false,
  },
  verified: { 
    type: DataTypes.BOOLEAN,
    defaultValue: false,
},
}, {
  sequelize: db.sequelize,
  modelName: 'Login',
  tableName: 'Login',
});

module.exports = Login;
