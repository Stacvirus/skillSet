require("dotenv").config();
console.log(process.env.NODE_ENV);

const PORT = process.env.PORT;
const MONGODB_URI =
  process.env.NODE_ENV == "DEV"
    ? process.env.MONGODB_URI
    : process.env.MONGODB_URI_DEV;
const BASE_URI = process.env.BASE_URI;
const SECRET = process.env.SECRET;
const HOST = process.env.HOST;
const EMAIL = process.env.EMAIL;
const PASSWORD = process.env.PASSWORD;

module.exports = {
  PORT,
  MONGODB_URI,
  BASE_URI,
  SECRET,
  HOST,
  EMAIL,
  PASSWORD,
};
