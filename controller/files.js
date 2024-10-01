const router = require("express").Router();
const File = require("../model/file");
const { PORT, HOST } = require("../utils/config");
const { userExtractor } = require("../utils/middleware");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, fn) => {
    fn(null, "./public/files");
  },
  filename: (req, file, fn) => {
    fn(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage: storage,
  limit: {
    fileSize: 1024 * 1024 * 5,
  },
});

router.post(
  "/",
  upload.single("file"),
  userExtractor,
  async (req, res, next) => {
    if (!req.file)
      return res.status(408).send({
        status: false,
        data: "please enter a file",
      });
    try {
      const file = new File({
        fileName: req.file.filename,
        path: req.file.path,
        size: req.file.size,
        mimeType: req.file.mimetype,
        downloadLink: `${HOST}:${PORT}/files/${req.file.filename}`,
        uploadedBy: req.user.id,
        createdAt: new Date(),
      });
      await file.save();
      res.send({
        status: true,
        data: file,
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
