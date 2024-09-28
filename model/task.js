const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  asignTo: { type: Schema.Types.ObjectId, ref: "Freelance" },
  asignFor: { type: Schema.Types.ObjectId, ref: "Project" },
  isDone: Boolean,
  createdAt: { type: Date, immutable: true },
});

schema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Task", schema);
