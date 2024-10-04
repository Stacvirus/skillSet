const router = require("express").Router();
const User = require("../model/user");
const bcrypt = require("bcrypt");
const {
  tokenBuilder,
  userExtractor,
  transporter,
} = require("../utils/middleware");

const multer = require("multer");
const { HOST, PORT, EMAIL } = require("../utils/config");
const { error } = require("../utils/logger");
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
    res.send({ status: true, data: await User.findById(user_id) });
  } catch (error) {
    next(error);
  }
});

// update only non essential datas like first and last Names,
router.put("/users/details/:user_id", async (req, res, next) => {
  const { user_id } = req.params;
  const options = {};
  const { firstName, lastName } = req.body;
  if (!firstName && !lastName)
    return res.status(401).json({
      status: false,
      data: "all inputs are missing, please fill atleast one of them",
    });

  firstName && (options.firstName = firstName);
  lastName && (options.lastName = lastName);
  try {
    const user = await User.findByIdAndUpdate(user_id, options, { new: true });
    res.send({
      status: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
});

// delete a user but its table still exist in the db
router.delete("/users/:user_id", userExtractor, async (req, res, next) => {
  const { user_id } = req.params;
  if (req.user.id.toString() != user_id && req.user.role != "ADMIN") {
    return res.status(403).json({ status: false, data: "unAuthorize action" });
  }

  try {
    await User.findByIdAndDelete(user_id);
    res.send({ status: true, data: "successful deletion" });
  } catch (error) {
    next(error);
  }
});

// update profile image
router.put(
  "/users/set-profile/:user_id",
  upload.single("profile"),
  userExtractor,
  async (req, res, next) => {
    const { user_id } = req.params;
    if (!req.file) {
      return res
        .status(401)
        .json({ status: false, data: "profile image not passed" });
    }
    if (req.user.id != user_id && req.user.role != "ADMIN")
      return res
        .status(403)
        .json({ status: false, data: "unAuthorized action" });
    const profileImage = `${HOST}:${PORT}/images/profiles/${req.file.filename}`;
    try {
      const user = await User.findByIdAndUpdate(
        user_id,
        {
          profileImage,
        },
        { new: true }
      );

      res.send({ status: true, data: user });
    } catch (error) {
      next(error);
    }
  }
);

// email verification phase
router.post("/pass-forgot", userExtractor, async (req, res, next) => {
  const { email, link } = req.body;
  const user = await User.findOne({ email });
  if (!user)
    return res
      .status(404)
      .json({ status: false, data: "user with email doesn't exists" });

  const mailOptions = {
    from: EMAIL,
    to: email,
    subject: "Mail verification",
    html: `
      <p>verify your email addresse to complete reset password action</p>
      <p>press <a href=${link}>here</a> to proceed</p>
    `,
  };
  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ status: true, data: "mail send successfully" });
  } catch (err) {
    error(err);
    res.status(405).json({ status: false, data: err.data });
  }
});

// reset password without old one verification
router.put("/pass-reset/:user_id", async (req, res, next) => {
  const { user_id } = req.params;
  try {
    await User.findByIdAndUpdate(
      user_id,
      {
        password: await bcrypt.hash(req.body.password, 10),
      },
      { new: true }
    );
    res.status(200).json({ status: true, data: "password reset successfully" });
  } catch (error) {
    next(error);
  }
});

// reset password if old is true
router.put("/pass-reset", userExtractor, async (req, res, next) => {
  const { user } = req;
  const { oldPass, newPass } = req.body;
  const isCorrect = await bcrypt.compare(oldPass, user.password);
  if (!isCorrect)
    return res.status(401).json({ status: false, data: "incorrect password" });

  try {
    const updatedUser = await User.findByIdAndUpdate(
      user.id,
      {
        password: await bcrypt.hash(newPass, 10),
      },
      { new: true }
    );
    const token = tokenBuilder(
      updatedUser.email,
      updatedUser.role,
      updatedUser.id
    );
    res.send({ status: true, data: { token, user: updatedUser } });
  } catch (error) {
    next(error);
  }
});

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
