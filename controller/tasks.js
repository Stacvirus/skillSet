const router = require("express").Router();
const Task = require("../model/task");
const Freelance = require("../model/freelance");
const { userExtractor } = require("../utils/middleware");

router.post(
  "/:collab_id/:project_id",
  userExtractor,
  async (req, res, next) => {
    const { collab_id, project_id } = req.params;
    const { title, description } = req.body;
    if (!title || !description)
      return res.status(408).json({
        status: false,
        data: "some inputs are mission",
      });
    try {
      const task = new Task({
        title,
        description,
        asignTo: collab_id,
        asignFor: project_id,
        createAt: new Date(),
      });
      await task.save();
      res.send({
        status: true,
        data: task,
      });
    } catch (error) {
      next(error);
    }
  }
);

// get task for particular project
router.get(
  "/get/project/:project_id",
  userExtractor,
  async (req, res, next) => {
    const { project_id } = req.params;
    try {
      const tasks = await Task.find({ asignFor: project_id });
      res.send({
        status: true,
        data: tasks,
      });
    } catch (error) {
      next(error);
    }
  }
);

// mark as done
router.put("/mark/:id", userExtractor, async (req, res, next) => {
  const { id } = req.params;
  try {
    const task = await Task.findByIdAndUpdate(
      id,
      { isDone: true },
      { new: true }
    );
    res.send({
      status: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
});

// update details of a task
router.put("/:id", userExtractor, async (req, res, next) => {
  const { id } = req.params;
  const { title, description } = req.body;
  if (!title && !description)
    return res.send({
      status: true,
      data: "please fill atleast one input",
    });

  try {
    const options = {};
    title && (options.title = title);
    description && (options.description = description);
    const task = await Task.findByIdAndUpdate(id, options, { new: true });
    res.send({
      status: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
});

// delete a task
router.delete("/:id", userExtractor, async (req, res, next) => {
  const { id } = req.params;
  try {
    await Task.findByIdAndDelete(id);
    res.send({
      status: true,
      data: "deletion successfull",
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
