//Sequelize model instance
const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const Model = Sequelize.Model;

class User extends Model {}

User.init(
  //attributes
  {
    username: {
      type: Sequelize.STRING,
    },
    email: {
      type: Sequelize.STRING,
    },
    password: {
      type: Sequelize.STRING,
    },
  },
  {
    sequelize,
    modelName: 'user',
  }
);

module.exports = User;
