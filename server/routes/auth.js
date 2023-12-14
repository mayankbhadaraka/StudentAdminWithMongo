const express = require("express");
const router = express.Router();
const { login, register, uploadMongodb } = require("../controllers/auth");
const upload = require("../middlewares/multer");

router.route("/login").post(login);
router.route("/register").post(upload.single("profile"), register);


module.exports = router;
