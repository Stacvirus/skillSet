const router = require("express").Router();
const Freelance = require("../model/freelance");
const User = require("../model/user");
const { userExtractor } = require("../utils/middleware");

// create freelance table
router.post("/:user_id", async (req, res, next) => {
  const { tarif, city } = req.body;
  const { user_id } = req.params;
  if (!tarif || !city)
    return res
      .status(400)
      .json({ status: false, data: "some inputs are missing" });

  try {
    const freelance = new Freelance({
      tarif,
      city,
      rating: 0,
      userId: user_id,
    });
    await freelance.save();
    res.send({ status: true, data: freelance });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", userExtractor, async (req, res, next) => {
  const { id } = req.params;
  try {
    const freelance = await Freelance.findById(id)
      .populate("categories")
      .populate("competences");
    res.send({ status: true, data: freelance });
  } catch (error) {
    next(error);
  }
});

// get freelance according to a userId
router.get("/user/:user_id", userExtractor, async (req, res, next) => {
  const { user_id } = req.params;
  try {
    const freelance = Freelance.findById(user_id)
      .populate("categories")
      .populate("competences");
    res.send({ status: true, data: freelance });
  } catch (error) {
    next(error);
  }
});

// update freelance details
router.put("/:id", userExtractor, async (req, res, next) => {
  // only the tarif and city can be modified
  const { city, tarif } = req.body;
  const { id } = req.params;
  if (!city && !tarif) {
    return res.status(401).json({
      status: false,
      data: "all inputs are mission, please field atleast one",
    });
  }
  const options = {};
  city && (options.city = city);
  tarif && (options.tarif = tarif);

  try {
    const freelance = await Freelance.findByIdAndUpdate(id, options, {
      new: true,
    });
    res.send({ status: true, data: freelance });
  } catch (error) {
    next(error);
  }
});

// delete freelance account and user table
router.delete("/:id", userExtractor, async (req, res, next) => {
  const { id } = req.params;
  try {
    const freelance = await Freelance.findById(id);
    await Freelance.findByIdAndDelete(id);
    await User.findByIdAndDelete(freelance.userId);
    res.send({
      status: true,
      data: "deletion successful",
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
