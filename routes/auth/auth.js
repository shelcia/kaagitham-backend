const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");

//VALIDATION OF USER INPUTS PREREQUISITES
const Joi = require("joi");

const registerSchema = Joi.object({
  name: Joi.string().min(3).required(),
  email: Joi.string().min(6).required().email(),
  password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().min(6).required().email(),
  password: Joi.string().min(6).required(),
});

//SIGNUP USER
router.post("/register", async (req, res) => {
  // console.log(req.body);

  //CHECKING IF USER EMAIL ALREADY EXISTS
  const emailExist = await User.findOne({ email: req.body.email });
  if (emailExist) {
    res.status(200).send({ message: "Email already exists", status: "400" });
    return;
  }

  //HASHING THE PASSWORD

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  //ON PROCESS OF ADDING NEW USER

  const token = jwt.sign({ email: req.body.email }, process.env.TOKEN_SECRET);

  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: hashedPassword,
    token: token,
  });

  try {
    //VALIDATION OF USER INPUTS

    const { error } = await registerSchema.validateAsync(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    else {
      //NEW USER IS ADDED

      await user.save();
      res.status(200).send({
        status: "200",
        message: {
          token: user.token,
          name: user.name,
          documents: user.documents,
          id: user._id,
        },
      });
    }
  } catch (error) {
    res.status(200).send({ status: "400", message: "Internal Servor error" });
  }
});

//SIGNIN USER

router.post("/login", async (req, res) => {
  try {
    //CHECKING IF USER EMAIL EXISTS

    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      res.status(200).send({ status: "400", message: "Incorrect Email- ID" });
      return;
    }

    //CHECKING IF USER PASSWORD MATCHES

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validPassword) {
      res.status(200).send({ status: "400", message: "Incorrect Password" });
      return;
    }

    //VALIDATION OF USER INPUTS

    const { error } = await loginSchema.validateAsync(req.body);
    if (error) {
      res
        .status(200)
        .send({ status: "400", message: error.details[0].message });
      return;
    } else {
      res
        .status(200)
        .header("auth-token", user.token)
        .send({
          status: "200",
          message: {
            token: user.token,
            name: user.name,
            documents: user.documents,
            id: user._id,
          },
        });
    }
  } catch (error) {
    res.status(200).send({ status: "400", message: "Internal Servor error" });
  }
});

module.exports = router;
