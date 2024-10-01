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
const missionRouter = require("./controller/missions");
const ratingRouter = require("./controller/ratings");
const projectgRouter = require("./controller/projects");
const taskRouter = require("./controller/tasks");
const notifRouter = require("./controller/notifications");
const invitationRouter = require("./controller/invitations");
const supportRouter = require("./controller/support");
const fileRouter = require("./controller/files");

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
app.use(`${BASE_URI}/freelances`, freelanceRouter);
app.use(`${BASE_URI}/comments`, commentRouter);
app.use(`${BASE_URI}/categories`, categoryRouter); // e.g frontEnd, backend, UI/UX ...
app.use(`${BASE_URI}/missions`, missionRouter);
app.use(`${BASE_URI}/competences`, competenceRouter); // e.g java, javaScript, figma ...
app.use(`${BASE_URI}/ratings`, ratingRouter);
app.use(`${BASE_URI}/projects`, projectgRouter);
app.use(`${BASE_URI}/tasks`, taskRouter);
app.use(`${BASE_URI}/notifications`, notifRouter);
app.use(`${BASE_URI}/invitations`, invitationRouter);
app.use(`${BASE_URI}/contact-suppport`, supportRouter);
app.use(`${BASE_URI}/files`, fileRouter);

app.use(unknownEndpoint);
app.use(errorHandler);

module.exports = app;
