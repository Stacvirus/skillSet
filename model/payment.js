const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema = new Schema({
  emitBy: { type: Schema.Types.ObjectId, ref: "User" },
  emitFor: { type: String, required: true }, // represents a freelance or a training or any other paid service
  value: { type: Number, required: true },
  method: { type: String, enum: ["MOMO", "OM", "PAYPAL", "BANK"] },
  createdAt: { type: Date, immutable: true },
});

schema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Payment", schema);
