const router = require("express").Router();
const Project = require("../model/project");
const Freelance = require("../model/freelance");
// const Project = require("../model/project");
const { userExtractor } = require("../utils/middleware");

// get all project
router.get("/", userExtractor, async (req, res, next) => {
  let { page = 1, limit = 10 } = req.query;
  page = parseInt(page);
  limit = parseInt(limit);
  try {
    const projects = await Project.find()
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("mission");
    const counts = await Project.countDocuments();
    const data = {
      page,
      limit,
      totalItems: projects.length,
      totalPages: Math.ceil(counts / limit),
      content: projects,
    };
    res.send({
      status: true,
      data,
    });
  } catch (error) {
    next(error);
  }
});

// get a project by id
router.get("/:id", userExtractor, async (req, res, next) => {
  const { id } = req.params;
  try {
    res.send({
      status: true,
      data: await Project.findById(id).populate("mission"),
    });
  } catch (error) {
    next(error);
  }
});

// get projects handled by a particular freelance
router.get("/get/freelance", userExtractor, async (req, res, next) => {
  try {
    const freelance = await Freelance.findOne({ userId: req.user.id });
    const projects = await Project.find().populate("mission");
    const ans = projects.filter((p) => p.mission.engage == freelance.id);
    res.send({
      status: true,
      data: ans,
    });
  } catch (error) {
    next(error);
  }
});

// get projects created for a particular user (client)
router.get("/get/user", userExtractor, async (req, res, next) => {
  try {
    const projects = await Project.find().populate("mission");
    const ans = projects.filter(
      (p) => p.mission.emitBy.toString() == req.user.id.toString()
    );
    res.send({
      status: true,
      data: ans,
    });
  } catch (error) {
    next(error);
  }
});

// get projects by it status: "COMPLETE", "PENDING", "CANCELED" by passing a query param status
router.get("/get/status", userExtractor, async (req, res, next) => {
  let { status } = req.query;
  let { page = 1, limit = 5 } = req.query;
  page = parseInt(page);
  limit = parseInt(limit);
  status = status.toUpperCase();
  try {
    const projects = await Project.find({ status })
      .populate("mission")
      .skip((page - 1) * limit)
      .limit(limit);
    const count = await Project.find({ status }).length;
    const data = {
      page,
      limit,
      totalItems: count,
      totalPages: Math.ceil(projects.length / limit),
      content: projects,
    };
    res.send({
      status: true,
      data,
    });
  } catch (error) {
    next(error);
  }
});

// todo: set a freelance as a collaborator
router.post(
  "/set/collab/:project_id",
  userExtractor,
  async (req, res, next) => {
    const { project_id } = req.params;
    try {
      const project = await Project.findById(project_id);
      const freelance = await Freelance.findOne({ userId: req.user.id });

      const ans = project.collaborators.includes(freelance.id);
      if (ans)
        return res.status(401).json({
          status: false,
          data: "freelance already added as collaborator",
        });
      project.collaborators = project.collaborators.concat(freelance.id);
      await project.save();
      res.send({
        status: true,
        data: project,
      });
    } catch (error) {
      next(error);
    }
  }
);

// todo: get project for which a freelance is collaborating
router.get("/get/collab", userExtractor, async (req, res, next) => {
  try {
    const freelance = await Freelance.findOne({ userId: req.user.id });
    const projects = await Project.find().populate("mission");
    const ans = projects.filter((p) => p.collaborators.includes(freelance.id));
    res.send({
      status: true,
      data: ans,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
