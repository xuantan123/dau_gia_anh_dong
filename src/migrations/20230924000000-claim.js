'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    const {DataTypes} = Sequelize;
    await queryInterface.createTable('Claim', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
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
          },
          createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: Sequelize.fn('NOW') 
          },
          updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: Sequelize.fn('NOW') 
          }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Claim');
  }
};
