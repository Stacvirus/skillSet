const router = require("express").Router();
const Freelance = require("../model/freelance");

// create freelance table
router.post("/", async (req, res, next) => {
  const { tarif, city } = req.body;
  if (!tarif || !city)
    return res
      .status(400)
      .json({ status: false, data: "some inputs are missing" });

  try {
    const freelance = new Freelance({
      tarif,
      city,
      rating: 0,
    });
    await freelance.save();
    res.send({ status: true, data: freelance });
  } catch (error) {
    next(error);
  }
});
