const router = require("express").Router();
const Competence = require("../model/competence");
const { userExtractor } = require("../utils/middleware");

router.post("/", async (req, res, next) => {
  const { name } = req.body;
  if (!name)
    return res
      .status(401)
      .json({ status: false, data: "some inputs are missing" });

  try {
    const competence = new Competence({
      name,
      createdAt: new Date.now(),
    });
    await competence.save();
    res.send({ status: true, data: Competence });
  } catch (error) {
    next(error);
  }
});

router.get("/", async (req, res, next) => {
  try {
    res.send({
      status: true,
      data: await Competence.find({}),
    });
  } catch (error) {
    next(error);
  }
});

// update a category
router.put("/:id", async (req, res, next) => {
  const { id } = req.params;
  try {
    const cat = await Competence.findByIdAndUpdate(id, req.body, { new: true });
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
    await Competence.findByIdAndDelete(id);
    res.send({
      status: true,
      data: "deletion successfull",
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
