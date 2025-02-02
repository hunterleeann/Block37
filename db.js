const { prisma } = require("./common");

const items = [
  { name: "Blue Book " },
  { name: "Red Book " },
  { name: "Green Book " },
  { name: "Orange Book " },
  { name: "Sports Book " },
  { name: "Book " },
];

const createNewUser = async (email, password) => {
  const response = await prisma.User.create({
    data: {
      email,
      password,
    },
  });
  return response;
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

const createItem = async () => {
  const response = await prisma.Item.createMany({
    data: items,
  });
  return response;
};

const getItems = async (id) => {
  const response = await prisma.Item.findFirstOrThrow({
    where: {
      id,
    },
  });
  return response;
};

const itemReviews = async (itemId) => {
    const response = await prisma.Review.findFirstOrThrow({
      where: {
        itemId,
      },
    });
    return response;
  };

const getItemReview = async (id, text, score) => {
  const response = await prisma.review.findFirstOrThrow({
    data: {
      text,
      score,
      where: {
        item: {
          connect: { id },
        },
      },
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

module.exports = {
  createNewUser,
  getUser,
  getCustomer,
  createItem,
  getItems,
  itemReviews,
  getItemReview,
};
