const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema = new Schema({
  content: { type: String, required: true },
  tag: { type: String, enum: ["BAD", "AVERAGE", "GOOD"] },
  emitBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  emitFor: { type: String, required: true }, // represent the id of comment target like project or training
  createdAt: { type: Date, immutable: true },
});

schema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Comment", schema);
