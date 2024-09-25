const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const { MONGODB_URI, BASE_URI } = require("./utils/config");
const app = express();
const { info, error } = require("./utils/logger");
const { logger, errorHandler, unknownEndpoint } = require("./utils/middleware");

const userRouter = require("./controller/users");

mongoose
  .connect(MONGODB_URI)
  .then((res) => info("connected to mongodb on: ", MONGODB_URI))
  .catch((err) => error(err.message));

app.use(cors());
app.use(express.json());
app.use(logger);

app.get(BASE_URI, (req, res) => {
  res.send("<h1>welcome to skill sync</h1>");
});

app.use(`${BASE_URI}/auth`, userRouter);

app.use(unknownEndpoint);
app.use(errorHandler);

module.exports = app;
