const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const { MONGODB_URI, BASE_URI } = require("./utils/config");
const app = express();
const { info, error } = require("./utils/logger");
const {
  logger,
  errorHandler,
  unknownEndpoint,
  tokenExtractor,
} = require("./utils/middleware");

const userRouter = require("./controller/users");
const loginRouter = require("./controller/login");
const freelanceRouter = require("./controller/freelances");
const commentRouter = require("./controller/comments");
const categoryRouter = require("./controller/categories");
const competenceRouter = require("./controller/competences");

mongoose
  .connect(MONGODB_URI)
  .then((res) => info("connected to mongodb on: ", MONGODB_URI))
  .catch((err) => error(err.message));

app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.use(logger);
app.use(tokenExtractor);

app.get(BASE_URI, (req, res) => {
  res.send("<h1>welcome to skill sync</h1>");
});

app.use(`${BASE_URI}/auth`, userRouter);
app.use(`${BASE_URI}/auth`, loginRouter);
app.use(`${BASE_URI}/freelance`, freelanceRouter);
app.use(`${BASE_URI}/comment`, commentRouter);
app.use(`${BASE_URI}/category`, categoryRouter); // e.g frontEnd, backend, UI/UX ...
app.use(`${BASE_URI}/competence`, competenceRouter); // e.g java, javaScript, figma ...

app.use(unknownEndpoint);
app.use(errorHandler);

module.exports = app;
