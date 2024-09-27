const router = require("express").Router();
const Category = require("../model/category");

router.post("/", async (req, res, next) => {
  const { name } = req.body;
  if (!name)
    return res
      .status(401)
      .json({ status: false, data: "some inputs are missing" });

  try {
    const category = new Category({
      name,
      createdAt: new Date.now(),
    });
    await category.save();
    res.send({ status: true, data: category });
  } catch (error) {
    next(error);
  }
});

router.get("/", async (req, res, next) => {
  try {
    res.send({
      status: true,
      data: await Category.find({}),
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
