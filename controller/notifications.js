const router = require("express").Router();
const Notification = require("../model/notification");
const { userExtractor } = require("../utils/middleware");

// the target here represent the issue of the notification: "project", "mission" ...
router.post("/:target_id/:user_id", async (req, res, next) => {
  const { target_id, user_id } = req.params;
  const { title, description } = req.body;
  if (!title || !description)
    return res.status(408).json({
      status: false,
      data: "some inputs are missing",
    });

  try {
    const notif = new Notification({
      title,
      description,
      targetId: target_id,
      emitTo: user_id,
      createdAt: new Date(),
    });
    await notif.save();
    res.send({
      status: true,
      data: notif,
    });
  } catch (error) {
    next(error);
  }
});

// get notifs for a particular user
router.get("/get/user", userExtractor, async (req, res, next) => {
  try {
    const notifs = await Notification.find({ emitTo: req.user.id });
    res.send({
      status: true,
      data: notifs,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
