const router = require("express").Router();
const Freelance = require("../model/freelance");
const Project = require("../model/project");
const Category = require("../model/category");
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
      tarif: {
        value: tarif.value,
        currency: tarif.currency,
      },
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
      .populate("competences")
      .populate("userId");
    res.send({ status: true, data: freelance });
  } catch (error) {
    next(error);
  }
});

// get freelance according to a userId
router.get("/get/user", userExtractor, async (req, res, next) => {
  try {
    const freelance = Freelance.findOne({ userId: req.user.id })
      .populate("categories")
      .populate("competences")
      .populate("userId");
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

// set multiple categories to a freelance
router.post("/set/cat", userExtractor, async (req, res, next) => {
  const { categories } = req.body; // an array of category ids
  console.log("categories added to freelance: ", req.body.categories);

  // const cat = await Category.findById({ $in: categories });

  // if (cat.length < categories.length) {
  //   error("and id in the categories array is not found");
  //   return res.status(404).json({
  //     status: false,
  //     data: "category not found, please choose and try again ...",
  //   });
  // }
  try {
    const freelance = await Freelance.findOne({ userId: req.user.id });
    console.log("freelance categories: ", freelance.categories);

    let ans;
    categories.forEach((c) => {
      freelance.categories.forEach((m) => {
        if (m == c) return (ans = true);
      });
    });
    if (ans) {
      return res.status(404).json({
        status: false,
        data: "a category already exists for this freelancer, please select another one or remove it",
      });
    }

    freelance.categories = freelance.categories.concat(...categories);
    await freelance.save();
    res.send({
      status: true,
      data: freelance,
    });
  } catch (error) {
    next(error);
  }
});

// set multiple competences to a freelance
router.post("/set/com", userExtractor, async (req, res, next) => {
  const { competences } = req.body; // an array of competence ids
  console.log("competences added to freelance: ", req.body.competences);

  // const com = await Competence.findById({ $in: competences });

  // if (com.length < competences.length) {
  //   error("and id in the competences array is not found");
  //   return res.status(404).json({
  //     status: false,
  //     data: "competence not found, please choose and try again ...",
  //   });
  // }
  try {
    const freelance = await Freelance.findOne({ userId: req.user.id });
    console.log("freelance competences: ", freelance.competences.length);

    let ans;
    competences.forEach((c) => {
      freelance.competences.forEach((m) => {
        if (m == c) return (ans = true);
      });
    });
    if (ans) {
      return res.status(404).json({
        status: false,
        data: "a competence already exists for this freelancer, please select another one or remove it",
      });
    }

    freelance.competences = freelance.competences.concat(...competences);
    await freelance.save();
    res.send({
      status: true,
      data: freelance,
    });
  } catch (error) {
    next(error);
  }
});

// delete a category from freelance
router.delete("/del/cat", userExtractor, async (req, res, next) => {
  const { category } = req.body;
  try {
    // check if category exists for this freelance
    const freelance = await Freelance.findOne({ userId: req.user.id });
    let ans = false;
    freelance.categories.forEach((c) => {
      if (c.toString() == category) return (ans = true);
    });
    console.log("answer: ", ans);

    if (!ans)
      return res.status(404).json({
        status: false,
        data: "category doesn't exists for this mission, please select another one or remove it",
      });

    freelance.categories = freelance.categories.filter(
      (m) => m.toString() != category
    );
    await freelance.save();
    res.send({
      status: true,
      data: freelance,
    });
  } catch (error) {
    next(error);
  }
});

// delete a competence from freelance
router.delete("/del/com", userExtractor, async (req, res, next) => {
  const { competence } = req.body;
  try {
    // check if category exists for this freelance
    const freelance = await Freelance.findOne({ userId: req.user.id });
    let ans = false;
    freelance.competences.forEach((c) => {
      if (c.toString() == competence) return (ans = true);
    });
    console.log("answer: ", ans);

    if (!ans)
      return res.status(404).json({
        status: false,
        data: "competence doesn't exists for this mission, please select another one or remove it",
      });

    freelance.competences = freelance.competences.filter(
      (m) => m.toString() != competence
    );
    await freelance.save();
    res.send({
      status: true,
      data: freelance,
    });
  } catch (error) {
    next(error);
  }
});

// get freelances collaborating in a particular project
router.get(
  "/get/collab-pro/:project_id",
  userExtractor,
  async (req, res, next) => {
    const { project_id } = req.params;
    try {
      const project = await Project.findById(project_id);
      const ids = project.collaborators.map((c) => c);
      const freelance = await Freelance.findById({ $in: ids }).populate(
        "userId"
      );
      res.send({
        status: true,
        data: freelance,
      });
    } catch (error) {
      next(error);
    }
  }
);

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
