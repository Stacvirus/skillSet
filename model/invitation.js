const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema = new Schema({
  message: { type: String, required: true },
  response: {
    type: String,
    enum: ["ACCEPT", "REFUSED", "PENDING"],
    default: "PENDING",
  },
  emitTo: { type: Schema.Types.ObjectId, ref: "User" }, // this user is suppose to have a freelance account
  emitBy: { type: Schema.Types.ObjectId, ref: "User" }, // this user is suppose to have a freelance account
  emitFor: { type: Schema.Types.ObjectId, ref: "Project" },
  isRead: { type: Boolean, default: false },
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
