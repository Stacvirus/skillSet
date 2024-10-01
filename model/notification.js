const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  targetId: { type: String, required: true }, // represents the target of the notification it can be mission project invitation ...
  emitTo: { type: Schema.Types.ObjectId, ref: "User" },
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

module.exports = mongoose.model("Notification", schema);
