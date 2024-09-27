const router = require("express").Router();
const User = require("../model/user");
const bcrypt = require("bcrypt");
const { tokenBuilder, userExtractor } = require("../utils/middleware");

const multer = require("multer");
const { HOST, PORT } = require("../utils/config");
const storage = multer.diskStorage({
  destination: (req, file, fn) => {
    fn(null, "./public/images/profiles");
  },
  filename: (req, file, fn) => {
    fn(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 2 * 5 },
});

router.post("/sign-up", upload.single("profile"), async (req, res, next) => {
  console.log(req.body);

  const { body } = req;
  const { firstName, lastName, email, password, phone, role } = body;
  // input verification
  if (!firstName || !lastName || !email || !password || !phone || !role) {
    return res
      .status(401)
      .json({ status: false, data: "some inputs are missing" });
  }
  // user already exist verification
  const isExist = await User.findOne({ $or: [{ phone }, { email }] });
  if (isExist) {
    return res.status(409).json({ status: false, data: "user already exist!" });
  }

  // profile image handling
  let profileImage;
  req.file != null
    ? (profileImage = req.file.filename)
    : (profileImage = "default_profile_image");

  try {
    const user = new User({
      ...body,
      password: await bcrypt.hash(password, 10),
      createdAt: new Date(),
      profileImage: `${HOST}:${PORT}/images/profiles/${profileImage}`,
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
router.delete("/users/:user_id", userExtractor, async (req, res, next) => {
  const { user_id } = req.params;
  if (req.user.id.toString() != user_id || req.user.role != "ADMIN") {
    return res
      .status(403)
      .json({ status: false, message: "unAuthorize action" });
  }

  try {
    await User.findByIdAndDelete(user_id);
    res.send({ status: true, message: "successful deletion" });
  } catch (error) {
    next(error);
  }
});

// update profile image
router.put(
  "/users/profile/",
  upload.single("profile"),
  userExtractor,
  async (req, res, next) => {
    if (!req.file) {
      return res
        .status(401)
        .json({ status: false, message: "profile image not passed" });
    }
    const profileImage = `${HOST}:${PORT}/images/profiles/${req.file.filename}`;
    try {
      const user = await User.findByIdAndUpdate(req.user.id, {
        profileImage,
      });

      res.send(user);
    } catch (error) {
      next(error);
    }
  }
);
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
