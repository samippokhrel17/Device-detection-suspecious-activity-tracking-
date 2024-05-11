"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("admin", [
      {
        user_id: 1,
        firstName: "Samip",
        lastName: "Pokhrel",
        email: "samippokhrel@gmail.com",
        password:
          "$2b$05$LxvsJSgp/exgm5buGLQbIO7KXhFHYCFZ1BdiH0REYwBybEIcWmD2K", //Nepal@12345
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("admin", null, {});
  },
};