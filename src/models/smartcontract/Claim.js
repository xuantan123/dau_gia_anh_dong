import { Model, DataTypes } from 'sequelize';
import db from "../index";

class Claim extends Model {
  static associate(models) {
    
  }
}

Claim.init({
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
  modelName: 'Claim',
  tableName: 'Claim', 
  timestamps: true,  
});

export default Claim;
