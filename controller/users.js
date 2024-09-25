const router = require("express").Router();
const User = require("../model/user");
const bcrypt = require("bcrypt");
const { tokenBuilder } = require("../utils/middleware");

router.post("/sign-up", async (req, res, next) => {
  const { body } = req;
  const { firstName, lastName, email, password, phone, role } = body;
  // input verification
  if (!firstName || !lastName || !email || !password || !phone || !role) {
    return res
      .status(400)
      .json({ status: false, data: "some inputs are missing" });
  }
  // user already exist verification
  const isExist = await User.findOne({ $or: [{ phone }, { email }] });
  if (isExist) {
    return res.status(409).json({ status: false, data: "user already exist!" });
  }

  try {
    const user = new User({
      ...body,
      password: await bcrypt.hash(password, 10),
      createdAt: new Date(),
    });
    await user.save();
    const token = tokenBuilder(user.id, email, role);
    res.send({ status: true, data: { token, user } });
  } catch (error) {
    next(error);
  }
});

router.get("/users", async (req, res, next) => {
  try {
    res.send(await User.find({}));
  } catch (error) {
    next(error);
  }
});

module.exports = router;
