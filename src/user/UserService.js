const User = require('./User');
const bcrypt = require('bcrypt');
const saltRound = 10;

const save = async (body) => {
  const hash = await bcrypt.hash(body.password, saltRound);
  const user = { ...body, password: hash };
  await User.create(user);
};

const findByEmail = async (email) => {
  return await User.findOne({ where: { email: email } });
};

module.exports = { save, findByEmail };
