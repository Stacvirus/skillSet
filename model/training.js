const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema = new Schema({
  title: { type: String, required: true },
  rating: Number,
  period: Number,
  cost: Number,
  status: { type: String, enum: ["FREE", "PAID"] },
  description: { type: String, required: true },
  format: { type: String, enum: ["VIDEO", "TEXT"] },
  competences: [{ type: Schema.Types.ObjectId, ref: "Competence" }],
  categories: [{ type: Schema.Types.ObjectId, ref: "Category" }],
  files: [{ type: Schema.Types.ObjectId, ref: "File" }],
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, immutable: true },
  updatedAt: Date,
});

schema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Training", schema);
