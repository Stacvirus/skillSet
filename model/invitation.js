const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema = new Schema({
  message: { type: String, required: true },
  response: { type: String, enum: ["ACCEPT", "REFUSED"], default: "PENDING" },
  emitTo: [{ type: Schema.Types.ObjectId, ref: "Freelance" }],
  emitBy: [{ type: Schema.Types.ObjectId, ref: "Freelance" }],
  emitFor: { type: Schema.Types.ObjectId, ref: "Project" },
  isRead: Boolean,
  createdAt: { type: Date, immutable: true },
});

schema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Invitation", schema);
