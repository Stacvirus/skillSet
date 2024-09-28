const router = require("express").Router();
const Freelance = require("../model/freelance");
const Mission = require("../model/mission");
const Project = require("../model/project");
const Category = require("../model/category");
const { userExtractor } = require("../utils/middleware");
const { error } = require("../utils/logger");

router.post("/", userExtractor, async (req, res, next) => {
  const { title, description, budget } = req.body;
  if (!title || !description || !budget)
    return res
      .status(401)
      .json({ status: false, data: "some inputs are missing" });

  try {
    const mission = new Mission({
      title,
      description,
      budget: {
        value: budget.value,
        currency: budget.currency,
      },
      status: "OPEN",
      emitBy: req.user.id,
      createdAt: new Date(),
    });
    await mission.save();
    res.send({
      status: true,
      data: mission,
    });
  } catch (error) {
    next(error);
  }
});

// get all missions
router.get("/", async (req, res, next) => {
  let { page, limit } = req.query;
  (page = parseInt(page)), (limit = parseInt(limit));
  try {
    const missions = await Mission.find()
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("emitBy");
    const countUsers = await Mission.countDocuments();
    const data = {
      page,
      limit,
      totalItems: missions.length,
      totalPages: Math.ceil(countUsers / limit),
      content: missions,
    };
    res.send({
      status: true,
      data,
    });
  } catch (error) {
    next(error);
  }
});

// get mission by id
router.get("/:id", userExtractor, async (req, res, next) => {
  const { id } = req.params;
  try {
    const mission = await Mission.findById(id)
      .populate("emitBy")
      .populate("candidates")
      .populate("categories");
    res.send({
      status: true,
      data: mission,
    });
  } catch (error) {
    next(error);
  }
});

// get missions emited by a particular user
router.get("/user/:user_id", userExtractor, async (req, res, next) => {
  const { user_id } = req.params;
  try {
    const missions = await Mission.find({ emitBy: user_id })
      .populate("emitBy")
      .populate("candidates")
      .populate("categories");
    res.send({
      status: true,
      data: missions,
    });
  } catch (error) {
    next(error);
  }
});

// get missions where a freelance have postulated
router.get(
  "/freelance/:freelance_id",
  userExtractor,
  async (req, res, next) => {
    const { freelance_id } = req.params;
    try {
      const missions = await Mission.find({})
        .populate("emitBy")
        .populate("candidates")
        .populate("categories");
      const postule = missions.filter((m) => {
        return m.candidates.filter((c) => c.id.toString() == freelance_id);
      });
      res.send({
        status: true,
        data: postule,
      });
    } catch (error) {
      next(error);
    }
  }
);

// engage a mission to a freelance
router.post(
  "/engage/:freelance_id/:mission_id",
  userExtractor,
  async (req, res, next) => {
    const { freelance_id, mission_id } = req.params;
    // verify the existence of the chosen freelance
    const freelance = await Freelance.findById(freelance_id);
    if (!freelance)
      return res
        .status(404)
        .json({ status: false, data: "freelancer not found, retry again ..." });

    try {
      //updating the mission table
      const options = {
        status: "CLOSED",
        engage: freelance_id,
      };
      const mission = await Mission.findByIdAndUpdate(mission_id, options, {
        new: true,
      });
      //create the corresponding project
      const project = new Project({
        rating: 0,
        status: "PENDING",
        mission: mission_id,
        createdAt: new Date(),
      });
      res.send({
        status: true,
        data: { project, mission },
      });
      await project.save();
    } catch (error) {
      next(error);
    }
  }
);

// get missions won by a particular freelancer
router.get("/winner/:freelance_id", userExtractor, async (req, res, next) => {
  const { freelance_id } = req.params;
  try {
    const missions = await Mission.find({ engage: freelance_id })
      .populate("emitBy")
      .populate("candidates")
      .populate("categories");
    res.send({
      status: true,
      data: missions,
    });
  } catch (error) {
    next(error);
  }
});

// set multiple categories to a mission
router.post("/set-cat/:mission_id", userExtractor, async (req, res, next) => {
  const { mission_id } = req.params;
  const { categories } = req.body;
  console.log("categories", req.body.categories);

  const cat = await Category.findById({ $in: categories });
  console.log("categories found: ", cat);

  if (cat.length < categories.length) {
    error("and id in the categories array is not found");
    return res.status(404).json({
      status: false,
      data: "category not found, please choose and try again ...",
    });
  }
  try {
    const mission = await Mission.findById(mission_id);

    let ans;
    categories.forEach((c) => {
      mission.categories.forEach((m) => {
        if (m == c) return (ans = true);
      });
    });
    if (ans) {
      return res.status(404).json({
        status: false,
        data: "category already exists for this mission, please select another one or remove it",
      });
    }

    mission.categories = mission.categories.concat(...categories);
    await mission.save();
    res.send({
      status: true,
      data: mission,
    });
  } catch (error) {
    next(error);
  }
});

// delete a category form mission
router.delete("/del-cat/:mission_id", userExtractor, async (req, res, next) => {
  const { mission_id } = req.params;
  const { category } = req.body;
  try {
    // check if category exists in this mission
    const mission = await Mission.findById(mission_id);
    let ans = false;
    mission.categories.forEach((c) => {
      if (c.toString() == category) return (ans = true);
    });
    console.log("answer: ", ans);

    if (!ans)
      return res.status(404).json({
        status: false,
        data: "category doesn't exists for this mission, please select another one or remove it",
      });

    mission.categories = mission.categories.filter(
      (m) => m.toString() != category
    );
    await mission.save();
    res.send({
      status: true,
      data: mission,
    });
  } catch (error) {
    next(error);
  }
});

// update a mission
router.put("/:id", userExtractor, async (req, res, next) => {
  const { id } = req.params;
  const { title, description, budget } = req.body;
  if (!title || !description || budget)
    return res.status(409).json({
      status: false,
      data: "all inputs are missing, please enter atleast one ...",
    });
  const options = {};
  title && (options.title = title);
  description && (options.description = description);
  budget && (options.budget = budget);
  try {
    const mission = await Mission.findByIdAndUpdate(id, options, { new: true });
    res.send({
      status: true,
      data: mission,
    });
  } catch (error) {
    next(error);
  }
});

// delete a mission
router.delete("/:id", userExtractor, async (req, res, next) => {
  const { id } = req.params;
  try {
    await Mission.findByIdAndDelete(id);
    res.send({
      status: true,
      data: "deletion successfull",
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
