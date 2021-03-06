const router = require("express").Router();

const Document = require("../../models/Document");
const User = require("../../models/User");

//VIEW THE DOC

router.get("/:id", async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    res.status(200).send({ status: "200", message: document });
  } catch (err) {
    res.status(200).send({ status: "500", message: "Internal Server Error" });
  }
});

router.get("/user/:id", async (req, res) => {
  try {
    const result = await User.findById(req.params.id);
    res.status(200).send({ status: "200", message: result });
  } catch (err) {
    res.status(200).send({ status: "500", message: "Internal Server Error" });
  }
});

//CREATE NEW DOCUMENT

router.post("/", async (req, res) => {
  try {
    const user = await User.findById(req.body.id);

    const body = {
      title: "",
      data: "",
      owner: [{ name: user.name, email: user.email }],
      shared: [],
      comments: [],
      editHistory: [],
    };

    const doc = new Document(body);
    await doc.save();
    const updatedDocs = [...user.documents, doc._id];
    await user.set({ documents: updatedDocs });
    await user.save();
    res.status(200).send({ status: "200", message: { id: doc._id } });
  } catch (err) {
    res.status(200).send({ status: "500", message: "Internal Server Error" });
  }
});

router.put("/:id", async (req, res) => {
  // console.log("rrrr", req.params.id);
  // console.log(req.body);

  try {
    const doc = await Document.findByIdAndUpdate(req.params.id, {
      data: req.body.data,
      title: req.body.title,
    });
    res.status(200).send({ status: "200", message: "Saved Successfully" });
  } catch (err) {
    res.status(200).send({ status: "500", message: "Internal Server Error" });
  }
});

module.exports = router;
