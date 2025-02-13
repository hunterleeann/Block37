const express = require("express");
const app = express();
app.use(express.json());
const PORT = 3032;
app.use(require("morgan")("dev"));
const bcrypt = require("bcrypt");
const JWT_SECRET = process.env.JWT_SECRET || "1234";
const jwt = require("jsonwebtoken");
const { prisma } = require("./common");

const {
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
} = require("./db");

const setToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: "8h" });
};

const isLoggedIn = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.slice(7);
  if (!token) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }
  try {
    const { id } = jwt.verify(token, JWT_SECRET);
    const customer = await getCustomer(id);
    if (!customer) {
      return res.status(401).json({ error: "Unauthorized: Invalid token" });
    }
    req.customer = customer;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ error: "Unauthorized: Invalid or expired token" });
  }
};

// const isLoggedIn = async (req, res, next) => {
//   const authHeader = req.headers.authorization;
//   const token = authHeader?.slice(7);
//   if (!token) return next();
//   try {
//     const { id } = jwt.verify(token, JWT_SECRET);
//     const customer = await getCustomer(id);
//     req.customer = customer;
//     next();
//   } catch (error) {
//     next(error);
//   }
// };

app.post("/api/auth/register", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const response = await createNewUser(email, hashedPassword);
    const token = setToken(response.id);
    res.status(201).json(token);
  } catch (error) {
    next(error);
  }
}); 

app.post("/api/auth/login", async (req, res, next) => { 
  try {
    const { email, password } = req.body;
    const customer = await getUser(email);
    const match = await bcrypt.compare(password, customer.password);
    if (match) {
      const token = setToken(customer.id);
      res.status(201).json(token);
    } else {
      res.status(403).json({ message: "Username and Password do not match" });
    }
  } catch (error) {
    next(error);
  }
});

app.get("/api/auth/me", isLoggedIn, async (req, res, next) => {
  //Doesn't verify user is logged in.
  try {
    res.status(200).send(req.customer);
  } catch (error) {
    next(error);
  }
});

// app.get("/api/items", async (req, res, next) => { //creates items
//   try {
//     const response = await createItem();
//     res.status(200).send(response);
//   } catch (error) {
//     next(error);
//   }
// });

app.get("/api/items", async (req, res, next) => {
  //works
  try {
    const response = await getItems();
    res.status(200).send(response);
  } catch (error) {
    next(error);
  }
});

app.get("/api/items/:id", async (req, res, next) => {
  //works
  try {
    const { id } = req.body;
    const selectedItem = await getItem(id);
    res.status(200).send(selectedItem);
  } catch (error) {
    next(error);
  }
});

app.post("/api/items/:itemId/reviews", isLoggedIn, async (req, res, next) => {
  //works BUT CHECK
  try {
    const { itemId, text, score } = req.body;
    //const { id } = req.params;
    const userId = req.customer.id;
    if (!userId) {
      return res
        .status(401)
        .json({ error: "Unauthorized: User not logged in" });
    }
    const review = await itemReviews(itemId, userId, text, score);
    res.status(201).json(review);
  } catch (error) {
    next(error);
  }
});
app.get("/api/items/:itemId/reviews", async (req, res, next) => {
  //works BUT CHECK
  try {
    const { itemId } = req.body;
    //   const { text } = req.body;
    const response = await getItemReview(itemId);
    res.status(200).send(response);
  } catch (error) {
    next(error);
  }
});

//get /api/comments/me
app.get("/api/reviews/me", isLoggedIn, async (req, res, next) => {
  //works BUT CHECK
  try {
    const { userId } = req.body;
    //   const { text } = req.body;
    const response = await userReviews(userId);
    res.status(200).send(response);
  } catch (error) {
    next(error);
  }
});

app.get("/api/items/:itemId/reviews/:reviewId", async (req, res, next) => {
  try {
    //const { id } = req.body;
    const { itemId, reviewId } = req.params;
    const response = await getItemRevId(reviewId, itemId);
    res.status(200).send(response);
  } catch (error) {
    next(error);
  }
});

//PUT /api/users/:userId/reviews/:reviewId 🔒
app.put(
  "/api/users/:userId/reviews/:reviewId",
  isLoggedIn,
  async (req, res, next) => {
    try {
      const { userId, reviewId } = req.params;
      const { score, text } = req.body;

      const existingReview = await prisma.Review.findUnique({
        where: { id: reviewId },
      });

      if (!existingReview) {
        return res.status(404).json({ message: "Review not found" });
      }

      if (req.customer.id !== existingReview.userId) {
        return res.status(403).json({
          message: "You do not have permission to update this review",
        });
      }
      const updatedReview = await updateComment(reviewId, score, text);

      res.status(200).send(updatedReview);
    } catch (error) {
      next(error);
    }
  }
);

//POST /api/items/:itemId/reviews/:reviewId/comments 🔒
app.post(
  "/api/items/:itemId/reviews/:reviewId/comments",
  async (req, res, next) => {
    try {
      //const { id } = req.body;
      const { itemId, reviewId } = req.params;
      const response = await getItemRevId(reviewId, itemId);
      res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  }
);

//DELETE /api/users/:userId/reviews/:reviewId 🔒
app.delete(
  "/api/users/:userId/reviews/:reviewId",
  isLoggedIn,
  async (req, res, next) => {
    try {
      // const { reviewId } = req.body;
      const { userId, reviewId } = req.params;

      const response = getCustomer(id);
      await deleteReview(userId, reviewId);
      // const customer = await getCustomer(id);
      if (req.customer.id != response.userId) {
        const delRev = await deleteReview(userId, reviewId);
        return res.status(403).json({
          message: "You do not have permission to update this review",
        });
      }
      res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  }
);

// Todo: GET /api/items/:itemId/reviews/:reviewId - done
//PUT /api/users/:userId/reviews/:reviewId 🔒 - done
//POST /api/items/:itemId/reviews/:reviewId/comments 🔒
//GET /api/comments/me 🔒
//PUT /api/users/:userId/comments/:commentId 🔒
//DELETE /api/users/:userId/comments/:commentId 🔒 
//DELETE /api/users/:userId/reviews/:reviewId 🔒 - done

app.listen(PORT, async () => {
  console.log(`I am listening on port number ${PORT}`);
});
