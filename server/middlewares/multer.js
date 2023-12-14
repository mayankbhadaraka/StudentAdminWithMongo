const multer = require("multer");
const fs = require("fs");

const fileFilter = (req, file, cb) => {
  if (!file) {
    console.log("skipped");
    cb(null, false);
    return;
  }

  cb(null, true);
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (req.body.email) {
      if (!fs.existsSync("./uploads/" + req.body.email)) {
        fs.mkdirSync("./uploads/" + req.body.email, { recursive: true });
      }
      return cb(null, "./uploads/" + req.body.email);
    } else if (req.body.studentID) {
      if (!fs.existsSync("./uploads/" + "marksheet/" + req.body.studentID)) {
        fs.mkdirSync("./uploads/" + "marksheet/" + req.body.studentID, {
          recursive: true,
        });
      }
      return cb(null, "./uploads/" + "marksheet/" + req.body.studentID);
    }
  },
  filename: function (req, file, cb) {
    cb(null, req.body.subjectID + ".jpg");
  },
});

var upload = multer({ fileFilter: fileFilter, storage: storage });

module.exports = upload;
