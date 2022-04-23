const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  data: {
    type: String,
  },
  owner: {
    type: Array,
    required: true,
  },
  shared: {
    type: Array,
  },
  comments: {
    type: Array,
  },
  lastSaved: {
    type: Date,
    default: Date.now(),
  },
  editHistory: {
    type: Array,
  },
});

const Document = mongoose.model("Document", documentSchema);
module.exports = Document;
