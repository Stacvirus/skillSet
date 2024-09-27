const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema = new Schema({
  user: [{ type: Schema.Types.ObjectId, ref: "User" }],
  training: [{ type: Schema.Types.ObjectId, ref: "Training" }],
  isFinish: Boolean,
  createdAt: { type: Date, immutable: true },
});

schema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Suscription", schema);
