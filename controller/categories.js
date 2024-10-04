const router = require("express").Router();
const Category = require("../model/category");
const { userExtractor } = require("../utils/middleware");

router.post("/", userExtractor, async (req, res, next) => {
  const { name } = req.body;
  if (!name)
    return res
      .status(401)
      .json({ status: false, data: "some inputs are missing" });

  try {
    const category = new Category({
      name,
      createdAt: new Date(),
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

// update a category
router.put("/:id", userExtractor, async (req, res, next) => {
  const { id } = req.params;
  try {
    const cat = await Category.findByIdAndUpdate(id, req.body, { new: true });
    res.send({
      status: true,
      data: cat,
    });
  } catch (error) {
    next(error);
  }
});

// delete a category
router.delete("/:id", userExtractor, async (req, res, next) => {
  const { id } = req.params;
  try {
    await Category.findByIdAndDelete(id);
    res.send({
      status: true,
      data: "deletion successfull",
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
