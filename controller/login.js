const router = require("express").Router();
const User = require("../model/user");
const bcrypt = require("bcrypt");
const { tokenBuilder } = require("../utils/middleware");

router.post("/login", async (req, res, next) => {
  const { body } = req;
  const { email, password } = body;
  if (!email || !password) {
    return res
      .status(500)
      .json({ status: false, data: "some inputs missiong" });
  }

  try {
    const user = await User.findOne({ email: email });
    console.log("user: ", user);

    const isCorrect =
      user == null ? false : await bcrypt.compare(password, user.password);

    if (!(user && isCorrect)) {
      return res.status(401).json({ data: "wrong user credentials" });
    }
    const token = tokenBuilder(user.id, email, user.role);
    res.send({ status: true, data: { token, user } });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
