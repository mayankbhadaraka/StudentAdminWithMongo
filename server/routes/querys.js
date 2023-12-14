const express = require("express");
const router = express.Router();
const { onlyAdminAuth } = require("../middlewares/auth");
const upload = require("../middlewares/multer");

const {
  studentData,
  subjectData,
  sendmarks,
  paginatedData,
} = require("../controllers/querys");

router
  .route("/sendmarks")
  .post(onlyAdminAuth, upload.single("marksheet"), sendmarks);
router.route("/studentdata").get(studentData);
router.route("/subjectdata").get(subjectData);
router.route("/paginatedData").get(paginatedData);

module.exports = router;
