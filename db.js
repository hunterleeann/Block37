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

const getItems = async () => {
  const response = await prisma.Item.findMany({});
  return response;
};

const getItem = async (id) => {
  const response = await prisma.Item.findFirstOrThrow({
    where: {
      id,
    },
  });
  return response;
};

const getItemReview = async (itemId) => {
  const response = await prisma.Review.findMany({
    where: {
      itemId,
    },
  });
  return response;
};

const itemReviews = async (itemId, userId, text, score) => {
  const response = await prisma.Review.create({
    data: {
      score,
      text,
      item: {
        connect: { id: itemId },
      },
      user: {
        connect: { id: userId },
      },
    },
  });
  return response;
};

const userReviews = async (userId) => {
  const response = await prisma.Review.findMany({
    where: {
      userId,
    },
  });
  return response;
};

const getItemRevId = async (reviewId, itemId) => {
  const response = await prisma.Review.findFirstOrThrow({
    where: {
      id: reviewId,
      itemId: itemId,
    },
  });
  return response;
};

//Comments ROUTE: POST /api/items/:itemId/reviews/:reviewId/comments 🔒

const getComment = async (itemId, id) => {
  const response = await prisma.Review.findMany({
    where: {
      id,
    },
  });
  return response;
};

//PUT /api/users/:userId/reviews/:reviewId 🔒
const updateComment = async (reviewId, score, text) => {
    return await prisma.Review.update({
      where: { id: reviewId },
      data: { score, text },
    });
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

//POST /api/items/:itemId/reviews/:reviewId/comments 🔒 


//DELETE /api/users/:userId/reviews/:reviewId 🔒
const deleteReview = async (userId, reviewId) => {
    return await prisma.review.delete({
        where: {id: reviewId, 
            userId: userId, 
        },
    }); 
}; 

module.exports = {
  createNewUser,
  getUser,
  getCustomer,
  createItem,
  getItems,
  itemReviews,
  getItemReview,
  getItem,
  userReviews,
  getItemRevId,
  updateComment,
  deleteReview, 
};
