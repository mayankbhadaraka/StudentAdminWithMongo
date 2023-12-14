const jwt = require("jsonwebtoken");

const onlyAdminAuth = (req, res, next) => {
  try { 
    if (!req.headers.authorization) {
      return res.status(404).json({ msg: "Admin Token Not found" });
    }

    const access_token = req.headers.authorization;
    try {
      jwt.verify(access_token, "this_is_admin_key");
    } catch (error) {
      return res.status(401).json({ msg: "Token Invalid" });
    }
  } catch (error) {
    console.log(error);
    return res.status(401).json({ msg: "Token Invalid" });
  }
  next();
};

module.exports = { onlyAdminAuth };
