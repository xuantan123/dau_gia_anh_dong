'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('SignUpUser', [
      {
        nickname : 'Tan phan',
        email: 'admin@example.com',
        password:'123456',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  }, 

  down: async (queryInterface, Sequelize) => {
    
  }
};
