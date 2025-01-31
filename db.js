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

const getUser = async (email) => {
  const response = prisma.User.findFirstOrThrow({
    where: {
      email,
    },
  });
  return response;
};

const getCustomer = async (id) => {
    const response = await prisma.User.findFirstOrThrow({
      where: {
        id,
      },
    });
    return response;
  };

// const createNewReview = async (text, score) => {
//     const response = await prisma.Review.create({
//       data: {
//         text,
//         score,
//       },
//     });
//     return response;
//     x;
//   };

module.exports = { createNewUser, getUser, getCustomer };
