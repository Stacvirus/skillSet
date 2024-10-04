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
router.get("/get-all", async (req, res, next) => {
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
router.get("/get/user/:user_id", userExtractor, async (req, res, next) => {
  console.log("user id: ", req.user.id);

  try {
    const missions = await Mission.find({
      emitBy: req.user.id || req.params.user_id,
    })
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
router.get("/get/freelance", userExtractor, async (req, res, next) => {
  //const { freelance_id } = req.params;

  try {
    //const freelance = await Freelance.findOne({ userId: req.user.id });
    const missions = await Mission.find({})
      .populate("emitBy")
      .populate("categories");

    const postule = missions.filter((m) => m.candidates.includes(req.user.id));

    // missions.forEach((m) => {
    //   m.candidates.forEach((c) => {
    //     if (c == freelance.id) postule = postule.concat(m);
    //   });
    // });

    res.send({
      status: true,
      data: postule,
    });
  } catch (error) {
    next(error);
  }
});

// engage a mission to a freelance
router.post(
  "/engage/:freelance_id/:mission_id",
  userExtractor,
  async (req, res, next) => {
    const { freelance_id, mission_id } = req.params;
    // verify the existence of the chosen freelance
    // const freelance = await Freelance.findById(freelance_id);
    // if (!freelance)
    //   return res
    //     .status(404)
    //     .json({ status: false, data: "freelancer not found, retry again ..." });

    try {
      //updating the mission table
      const options = {
        status: "CLOSED",
        engage: freelance_id,
      };
      const mission = await Mission.findByIdAndUpdate(mission_id, options, {
        new: true,
      });

      res.send({
        status: true,
        data: mission,
      });
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

  if (cat.length < categories.length) {
    error("and id in the categories array is not found");
    return res.status(404).json({
      status: false,
      data: "please make sure all inputed categories actually exists ...",
    });
  }
  try {
    const mission = await Mission.findById(mission_id);

    if (mission.emitBy.toString() != req.user.id.toString())
      return res.status(403).json({
        status: false,
        data: "unAuthorized action",
      });

    let ans;
    categories.forEach((c) => {
      ans = mission.categories.includes(c);
      if (ans) return;
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

// delete a category from mission
router.delete(
  "/del-cat/:mission_id/:cat_id",
  userExtractor,
  async (req, res, next) => {
    const { mission_id, cat_id } = req.params;
    try {
      // check if category exists in this mission
      const mission = await Mission.findById(mission_id);
      const ans = mission.categories.includes(cat_id);
      console.log("answer: ", ans);

      if (!ans)
        return res.status(404).json({
          status: false,
          data: "category doesn't exists for this mission, please select another one or remove it",
        });

      mission.categories = mission.categories.filter((c) => c != cat_id);
      await mission.save();
      res.send({
        status: true,
        data: mission,
      });
    } catch (error) {
      next(error);
    }
  }
);

// enable a freelance to postulate to a mission
router.post("/postulate/:mission_id", userExtractor, async (req, res, next) => {
  const { mission_id } = req.params;
  // verify the existence of the mission
  const mission = await Mission.findById(mission_id);
  if (!mission)
    return res.status(404).send({
      status: false,
      data: "mission not found, please choose another mission",
    });

  // check the existence of the freelance
  // const freelance = await Freelance.findOne({ userId: req.user.id });
  // if (!freelance)
  //   return res.status(404).send({
  //     status: false,
  //     data: "freelance not found, please choose another user",
  //   });
  try {
    mission.candidates = mission.candidates.concat(req.user.id);
    await mission.save();
    res.send({
      status: true,
      data: "process finished successfully",
    });
  } catch (error) {
    next(error);
  }
});

// update a mission
router.put("/:id", userExtractor, async (req, res, next) => {
  const { id } = req.params;
  const { title, description, budget } = req.body;
  if (!title && !description && !budget)
    return res.status(408).json({
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
