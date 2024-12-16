import { Model, DataTypes } from 'sequelize';
import db from "../index";

class TransferTransaction extends Model {
  static associate(models) {
    
  }
}

TransferTransaction.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,  
  },
  receiver: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  amount: {
    type: DataTypes.DECIMAL,
    allowNull: false,
  },
  txHash: {
    type: DataTypes.STRING,
    allowNull: false,
  }
}, {
  sequelize: db.sequelize,
  modelName: 'TransferTransaction',
  tableName: 'TransferTransaction', 
  timestamps: true,  
});

export default TransferTransaction;
