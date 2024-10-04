require("dotenv").config();
const env_var = process.env.NODE_ENV;
console.log(env_var.trim() == "PROD", env_var);

const PORT = process.env.PORT;
let MONGODB_URI;
if (env_var.trim() == "PROD") {
  MONGODB_URI = process.env.MONGODB_URI;
} else {
  MONGODB_URI = process.env.MONGODB_URI_DEV;
}

const BASE_URI = process.env.BASE_URI;
const SECRET = process.env.SECRET;
const HOST = process.env.HOST;
const EMAIL = process.env.EMAIL;
const PASSWORD = process.env.PASSWORD;

console.log("mongodb uri: ", MONGODB_URI);

module.exports = {
  PORT,
  MONGODB_URI,
  BASE_URI,
  SECRET,
  HOST,
  EMAIL,
  PASSWORD,
};
