const router = require("express").Router();
const Rating = require("../model/rating");
const { userExtractor } = require("../utils/middleware");

router.post("/:target_id", userExtractor, async (req, res, next) => {
  const { value } = req.body;
  const { target_id } = req.params;
  if (!value)
    return res.status(409).json({ status: false, data: "some inputs missing" });
  try {
    const rate = new Rating({
      value,
      emitBy: req.user.id,
      emitFor: target_id,
      createdAt: new Date(),
    });
    await rate.save();
    res.send({
      status: true,
      data: rate,
    });
  } catch (error) {
    next(error);
  }
});

// get rating of a particular target
router.get("/target/:target_id", userExtractor, async (req, res, next) => {
  const { target_id } = req.params;
  try {
    const rate = await Rating.find({ emitFor: target_id });
    res.send({
      status: true,
      data: rate,
    });
  } catch (error) {
    next(error);
  }
});

// get all ratings
router.get("/", async (req, res, next) => {
  let { page = 1, limit = 10 } = req.query;
  (page = parseInt(page)), (limit = parseInt(limit));

  try {
    const ratings = Rating.find()
      .skip((page - 1) * limit)
      .limit(limit);
    const count = Rating.countDocuments();
    const data = {
      page,
      limit,
      totalItems: ratings.length,
      totalPages: Math.ceil(count / limit),
      content: ratings,
    };
    res.send({
      status: true,
      data,
    });
  } catch (error) {
    next(error);
  }
});

// delete a rate
router.delete("/:id", userExtractor, async (req, res, next) => {
  const { id } = req.params;
  try {
    await Rate.findByIdAndDelete(id);
    res.send({
      status: true,
      data: "deletion successfull",
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
