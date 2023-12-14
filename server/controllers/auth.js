const { DataSchema, ImageSchema } = require("../models/auth");
const { isEmail } = require("validator");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const studentModel = require("../models/student");
const adminAuthModel = require("../models/adminAuth");
const joi = require("joi");

const login = async (req, res) => {
  try {
    const { pass, email } = req.body;

    if (!pass || !email) {
      return res.status(406).json({ error: "Credentials not provided" });
    }

    if (!isEmail(email)) {
      return res.status(406).json({ error: "Email Address not correct" });
    }

    // const validation = joi.object({
    //   email: joi.string().email().required(),
    //   pass: joi.string().required(),
    // });

    // const { error } = validation.validate(req.body, { abortEarly: false });
    // if (error) {
    //   res.status(400).json({ code: 1, msg: error.details[0] });
    // }

    const adminAuthData = await adminAuthModel.findOne({
      email: email,
      pass: pass,
    });
    if (!adminAuthData) {
      return res.status(400).json({ error: "User or Password doesnt match" });
    }
    const token = jwt.sign(
      {
        user_email: req.body.email,
        user_pass: req.body.pass,
      },
      "this_is_admin_key"
    );

    res.json({
      data: { user: adminAuthData.user, email: adminAuthData.email },
      access_token: token,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Error" });
    console.log("52", error);
  }
};

var object = {};

const register = async (req, res, next) => {
  let { user, pass, email, user_id } = req.body;
  try {
    if (!user || !pass || !email || !user_id) {
      return res.status(406).json({ error: "Credentials not provided" });
    }
  } catch (error) {
    return res.status(406).json({ error: "Credentials not provided" });
  }
  
  if (!isEmail(email)) {
    return res.status(406).json({ error: "Email Address not correct" });
  }
  
  const user_idVerify = await studentModel.findById(user_id);
  if (!user_idVerify) {
    return res.status(400).json({ error: "user_id is not correct" });
  }

  const authData = await DataSchema.findOne({ email: email });
  if (authData) {
    return res.status(400).json({ error: "Email already in use" });
  }

  const salt = await bcryptjs.genSalt();
  const hashPass = await bcryptjs.hash(pass, salt);

  // file upload
  const file = req.file;
  let data = "";

  if (file) {
    object = {
      fileName: file.filename,
      mimeType: file.mimetype,
      path: file.path,
      size: file.size,
    };
    data = await DataSchema.create({
      user: user,
      pass: hashPass,
      email: email,
      user_id: user_id,
      imgData: object,
    });
  } else {
    data = await DataSchema.create({
      user: user,
      pass: hashPass,
      email: email,
      user_id: user_id,
    });
  }

  res.json({
    userData: data,
  });
};

module.exports = { login, register };
