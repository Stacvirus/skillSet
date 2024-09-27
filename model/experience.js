const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, enum: ["REMOTE", "IN-OFFICE", "HYBRID"] },
  competences: [{ type: Schema.Types.ObjectId, ref: "Competence" }],
  createdBy: { type: Schema.Types.ObjectId, ref: "Freelance" },
  createdAt: { type: Date, immutable: true },
  start: Date,
  end: Date,
});

schema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Experience", schema);
