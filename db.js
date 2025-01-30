const { prisma } = require("./common");

const createNewUser = async (email, password) => {
  const response = await prisma.User.create({
    data: {
      email,
      password,
    },
  });
  return response;
  x;
};

module.exports = { createNewUser };
