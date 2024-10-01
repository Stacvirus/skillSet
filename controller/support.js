const { EMAIL } = require("../utils/config");
const { transporter, userExtractor } = require("../utils/middleware");
const router = require("express").Router();

router.post("/", userExtractor, async (req, res, next) => {
  const { mail, message, subject } = req.body;
  try {
    const mailOptions = {
      from: mail,
      to: EMAIL,
      subject,
      html: `
      <p>complain comming from a user: </br>
        names: ${req.user.firstName}, ${req.user.lastName}
        role: ${req.user.role}
      </p>
      <p>${message}</p>
    `,
    };
    await transporter.sendMail(mailOptions);
    res.send({
      status: true,
      data: "mail send successfully",
    });
  } catch (error) {
    res.status(405).json({
      status: false,
      data: error.message,
    });
  }
});

module.exports = router;
