const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  budget: { type: Number, required: true },
  status: { type: String, enum: ["OPEN", "CLOSED"] },
  categories: [{ type: Schema.Types.ObjectId, ref: "Category" }],
  candidates: [{ type: Schema.Types.ObjectId, ref: "Freelance" }],
  emitBy: { type: Schema.Types.ObjectId, ref: "User" },
  engage: { type: Schema.Types.ObjectId, ref: "Freelance" },
  createdAt: { type: Date, immutable: true },
});

schema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Mission", schema);
