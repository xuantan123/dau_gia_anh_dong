// migrations/2024xxxxxx-create-login.js
'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Login', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      role: {
        type: Sequelize.ENUM('user', 'author'), // Phân chia vai trò trong bảng Login
        allowNull: false,
      },
      verified: { 
        type: Sequelize.BOOLEAN,
        defaultValue: false,
    },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now'), // Tự động tạo thời gian
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now'), // Tự động tạo thời gian
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Login');
  },
};
