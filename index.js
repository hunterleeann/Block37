const express = require("express");
const app = express();
app.use(express.json());
const PORT = 3032;
app.use(require("morgan")("dev"));
const bcrypt = require("bcrypt");
const JWT_SECRET = process.env.JWT_SECRET || "1234";
const jwt = require("jsonwebtoken");

const { createNewUser, getUser, getCustomer } = require("./db");

const setToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: "8h" });
};

const isLoggedIn = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.slice(7);
  if (!token) return next();
  try {
    const { id } = jwt.verify(token, JWT_SECRET);
    const customer = await getCustomer(id);
    req.customer = customer;
    next();
  } catch (error) {
    next(error);
  }
};

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

app.listen(PORT, async () => {
  console.log(`I am listening on port number ${PORT}`);
});
