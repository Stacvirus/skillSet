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
  let { page = 1, limit = 10 } = req.query;
  page = parseInt(page);
  limit = parseInt(limit);
  try {
    const items = await User.find()
      .skip((page - 1) * limit)
      .limit(limit);
    const countUsers = await User.countDocuments();
    const data = {
      page,
      limit,
      totalItems: items.length,
      totalPages: Math.ceil(countUsers / limit),
      content: items,
    };
    res.send({
      status: true,
      data,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/users/:user_id", async (req, res, next) => {
  const { user_id } = req.params;
  try {
    res.send(await User.findById(user_id));
  } catch (error) {
    next(error);
  }
});

// update only non essential datas like first and last Names,
router.put("/users/details/:user_id", async (req, res, next) => {
  const { user_id } = req.params;
  try {
    res.send(await User.findByIdAndUpdate(user_id, req.body));
  } catch (error) {
    next(error);
  }
});

// delete a user but its table still exist in the db

// const userData = require("../data/users.json");

// const insertArtisans = async () => {
//   await User.deleteMany();
//   try {
//     const docs = await User.insertMany(userData);
//     return Promise.resolve(docs);
//   } catch (error) {
//     return Promise.reject(error);
//   }
// };

// insertArtisans()
//   .then((docs) => console.log(docs))
//   .catch((err) => console.log(err));

module.exports = router;
