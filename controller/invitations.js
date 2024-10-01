const router = require("express").Router();
const Invitation = require("../model/invitation");
const Freelance = require("../model/freelance");
const { userExtractor } = require("../utils/middleware");

router.post("/:project_id/:user_id", userExtractor, async (req, res, next) => {
  const { project_id, user_id } = req.params;
  const { message } = req.body;
  if (!message)
    return res.send({ status: false, data: "please enter a message" });

  try {
    const invitation = new Invitation({
      message,
      emitTo: user_id,
      emitBy: req.user.id,
      emitFor: project_id,
      createdAt: new Date(),
    });
    await invitation.save();
    res.send({
      status: true,
      data: invitation,
    });
  } catch (error) {
    next(error);
  }
});

// get invitations emited to a particular freelance
router.get("/get/freelance", userExtractor, async (req, res, next) => {
  try {
    //const freelance = await Freelance.findOne({ userId: req.user.id });
    const invitations = await Invitation.find({
      emitTo: req.user.id,
    }).populate("emitBy");
    res.send({
      status: true,
      data: invitations,
    });
  } catch (error) {
    next(error);
  }
});

// get invitations issued for a particular project
router.get(
  "/get/project/:project_id",
  userExtractor,
  async (req, res, next) => {
    const { project_id } = req.params;
    try {
      const invitations = await Invitation.find({
        emitFor: project_id,
      }).populate("emitTo");
      res.send({
        status: true,
        data: invitations,
      });
    } catch (error) {
      next(error);
    }
  }
);

// update and invitation
router.put("/:id", userExtractor, async (req, res, next) => {
  const { id } = req.params;
  const { message } = req.body;
  const { emitTo, emitFor } = req.query;
  if (!message && !emitTo && !emitFor)
    return res.status(408).json({
      status: false,
      data: "please fill atleast one input",
    });
  try {
    const options = {};
    message && (options.message = message);
    emitTo && (options.emitTo = emitTo);
    emitFor && (options.emitFor = emitFor);
    const invitation = await Invitation.findByIdAndUpdate(id, options, {
      new: true,
    });
    res.send({
      status: true,
      data: invitation,
    });
  } catch (error) {
    next(error);
  }
});

// respond to an invitation
router.put("/respond-to/:id", userExtractor, async (req, res, next) => {
  const { resp } = req.query;
  const { id } = req.params;
  try {
    const invitation = await Invitation.findByIdAndUpdate(
      id,
      { response: resp.toUpperCase() },
      { new: true }
    );
    res.send({
      status: true,
      data: invitation,
    });
  } catch (error) {
    next(error);
  }
});

// delete an invitation
router.delete("/:id", userExtractor, async (req, res, next) => {
  const { id } = req.params;
  try {
    await Invitation.findByIdAndDelete(id);
    res.send({
      status: true,
      data: "deletion successfull",
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
