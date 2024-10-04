const router = require("express").Router();
const Comment = require("../model/comment");
const { userExtractor } = require("../utils/middleware");

router.get("/", async (req, res, next) => {
  console.log("in comment router");
  res.send("hello world!");
});

router.post("/:target_id", userExtractor, async (req, res, next) => {
  const { target_id } = req.params;
  const { content, tag } = req.body;
  if (!content || !tag)
    return res
      .status(409)
      .json({ status: false, data: "some inputs are missing" });

  try {
    const comment = new Comment({
      content,
      tag,
      emitBy: req.user.id,
      emitFor: target_id,
      createdAt: new Date(),
    });
    await comment.save();
    res.send({
      status: true,
      data: comment,
    });
  } catch (error) {
    next(error);
  }
});

// get comments for a particular target: project, training
router.get("/target/:target_id", async (req, res, next) => {
  const { target_id } = req.params;
  try {
    const comments = await Comment.find({ emitFor: target_id }).populate(
      "emitBy"
    );
    res.send({
      status: true,
      data: comments,
    });
  } catch (error) {
    next(error);
  }
});

// get comments comming from a particular user
router.get("/user/:user_id", userExtractor, async (req, res, next) => {
  const { user_id } = req.params;
  try {
    const comments = await Comment.find({
      emitBy: user_id || req.user.id,
    }).populate("emitBy");
    res.send({
      status: true,
      data: comments,
    });
  } catch (error) {
    next(error);
  }
});

// modify a comment
router.put("/:id", userExtractor, async (req, res, next) => {
  const { id } = req.params;
  const { content, tag } = req.body;

  if (!content && !tag)
    return res.status(409).json({
      status: false,
      data: "all inputs are missing, please fill atleast one",
    });
  const options = {};
  content && (options.content = content);
  tag && (options.tag = tag);
  try {
    const comment = await Comment.findByIdAndUpdate(id, options, { new: true });
    res.send({
      status: true,
      data: comment,
    });
  } catch (error) {
    next(error);
  }
});

// delete a comment
router.delete("/:id", userExtractor, async (req, res, next) => {
  const { id } = req.params;
  try {
    await Comment.findByIdAndDelete(id);
    res.send({
      status: true,
      data: "deletion successfull",
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
