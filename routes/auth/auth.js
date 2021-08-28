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
  //CHECKING IF USER EMAIL ALREADY EXISTS
  const emailExist = await User.findOne({ email: req.body.email });
  if (emailExist) {
    res.status(400).send("Email already exists");
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
      res.status(200).send({ message: "User Created", token: token });
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

//SIGNIN USER

router.post("/login", async (req, res) => {
  //CHECKING IF USER EMAIL EXISTS

  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    res.status(400).send("Incorrect Email- ID");
    return;
  }

  //CHECKING IF USER PASSWORD MATCHES

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword)
    return res.status(400).send({ message: "Incorrect Password" });

  try {
    //VALIDATION OF USER INPUTS

    const { error } = await loginSchema.validateAsync(req.body);
    if (error)
      return res.status(400).send({ message: error.details[0].message });
    else {
      res.status(200).header("auth-token", user.token).send({
        token: user.token,
        name: user.name,
        documents: user.documents,
        id: user._id,
      });
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
