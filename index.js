const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const app = express();
const PORT = process.env.PORT || 4050;

//IMPORT ROUTES

const authRoute = require("./routes/auth/auth");
const documentRoute = require("./routes/common/document");

dotenv.config();

//CONNECTION TO DATABASE

mongoose.connect(
  process.env.DB_CONNECT,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  },
  () => console.log("connected to db")
);

//MIDDLEWARE

app.use(express.json(), cors());

//ROUTE MIDDLEWARE

app.use("/api/auth", authRoute);
app.use("/api/document", documentRoute);

app.get("/", (req, res) => {
  res.send(`<p>Hey! It's working</p>`);
});

app.listen(PORT, () => console.log(`server up and running at  ${PORT}`));
