const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema = new Schema({
  value: { type: Number, required: true },
  emiteBy: { type: Schema.Types.ObjectId, ref: "User" },
  emiteFor: { type: String, required: true }, // represent the id of rating target like freelance or training
  createdAt: { type: Date, immutable: true },
});

schema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Rating", schema);
