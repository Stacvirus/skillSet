const User = require("../model/user");
const { SECRET, EMAIL, PASSWORD } = require("./config");
const { info, error } = require("./logger");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

function logger(req, res, next) {
  info("METHOD: ", req.method);
  info("PATH: ", req.path);
  info(
    "BODY: ",
    req.body.password ? { ...req.body, password: "####" } : req.body
  );
  info("------------------");
  next();
}

function errorHandler(err, req, res, next) {
  error(err.name, err.message);

  if (err.name === "CastError") {
    return res.status(400).send({ status: false, data: "malformatted id" });
  } else if (err.name === "ValidationError") {
    return res.status(400).json({ status: false, data: err.message });
  } else if (
    err.name === "MongoServerError" &&
    err.message.includes("E11000 duplicate key error")
  ) {
    return res.status(409).json({
      status: false,
      data: "expected `email or phone` to be unique",
    });
  } else if (err.name === "JsonWebTokenError") {
    return res
      .status(401)
      .json({ status: false, data: "token missing or invalid" });
  } else if (err.name === "TokenExpiredError") {
    return res.status(401).json({ status: false, data: "token expired" });
  } else if (err.name === "MulterError") {
    return res.status(401).json({ status: false, message: err.message });
  }

  next(err);
}

function unknownEndpoint(req, res) {
  res.status(404).json({ status: false, data: "unknown endpoint" });
}

function tokenBuilder(id, email, role) {
  return jwt.sign({ id, email, role }, SECRET, { expiresIn: "6H" });
}

async function tokenExtractor(req, res, next) {
  const auth = req.get("authorization");
  if (auth && auth.startsWith("Bearer ")) {
    req.token = auth.replace("Bearer ", "");
  }
  next();
}

async function userExtractor(req, res, next) {
  try {
    req.user = await User.findById(jwt.verify(req.token, SECRET).id);
  } catch (error) {
    next(error);
  }
  next();
}

// mail transporter config
function transporter() {
  nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: EMAIL,
      pass: PASSWORD,
    },
  });
}

module.exports = {
  logger,
  errorHandler,
  unknownEndpoint,
  tokenBuilder,
  tokenExtractor,
  userExtractor,
  transporter,
};
