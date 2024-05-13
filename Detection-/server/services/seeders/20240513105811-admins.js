// 'use strict';

// /** @type {import('sequelize-cli').Migration} */
// module.exports = {
//   async up (queryInterface, Sequelize) {
//     /**
//      * Add seed commands here.
//      *
//      * Example:
//      * await queryInterface.bulkInsert('People', [{
//      *   name: 'John Doe',
//      *   isBetaMember: false
//      * }], {});
//     */
//   },

//   async down (queryInterface, Sequelize) {
//     /**
//      * Add commands to revert seed here.
//      *
//      * Example:
//      * await queryInterface.bulkDelete('People', null, {});
//      */
//   }
// };


"use strict";

/**  @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("admins", [
      {
        id: 1,
        first_name: "Samip",
        last_name: "Pokhrel",
        email: "samippokhrel@gmail.com",
        password:
          "$2b$05$LxvsJSgp/exgm5buGLQbIO7KXhFHYCFZ1BdiH0REYwBybEIcWmD2K", //Nepal@12345
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("admins", null, {});
  },
};