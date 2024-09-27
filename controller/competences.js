const router = require("express").Router();
const Competence = require("../model/competence");

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

module.exports = router;
