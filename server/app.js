global.express = require("express");
const cors = require("cors");
const app = express();
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");

const port = 3005;

// middleware
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", req.headers.origin);
  res.header("Access-Control-Allow-Credentials", true);
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, access_token_rrm"
  );
  next();
});
app.use(cookieParser());
app.use(express.json());
app.use(cors());
app.use('/uploads',express.static("uploads"));
app.use(
  morgan("dev", {
    skip: function (req, res) {
      return req.originalUrl.includes("/static/");
    },
  })
);
app.use(cors());

// routes
const loginRouter = require("./routes/auth");
const queryRouter = require("./routes/querys");

app.use("/api/v1/auth", loginRouter);
app.use("/api/v1/query", queryRouter);

// listen
try {
  let options = {};
  let connUri = 'mongodb://127.0.0.1/shopping';
  mongoose.set("strictQuery", false);
  mongoose.connect(connUri)
  .then(()=> console.log("Database connection established"))
  .catch((err)=> console.log("Error connecting to database",err))
  app.listen(port, console.log(`Server on port ${port}`));
} catch (error) {
console.log(error);
}
