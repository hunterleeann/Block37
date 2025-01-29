const express = require("express");
const app = express();
app.use(express.json());
const PORT = 3000;
app.use(require("morgan")("dev"));
const bcrypt = require("bcrypt");
const JWT_SECRET = process.env.JWT_SECRET || "1234";
const jwt = require("jsonwebtoken");

const setToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: "8h" });
};
