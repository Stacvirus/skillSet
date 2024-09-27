const router = require("express").Router();
const Comment = require("../model/comment");

router.get("/", async (req, res, next) => {
  console.log("in comment router");
  res.send("hello world!");
});

module.exports = router;
