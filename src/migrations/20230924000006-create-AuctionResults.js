'use strict';

const { type } = require("express/lib/response");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('AuctionResults', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      auctionId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Auctions',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      winnerAddress: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      highestBid: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      loginId:{
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('AuctionResults');
  },
};
