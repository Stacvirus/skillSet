const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema = new Schema({
  tarif: {
    value: { type: Number, required: true },
    currency: { type: String, default: "XAF" },
  },
  rating: Number,
  city: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  categories: [{ type: Schema.Types.ObjectId, ref: "Category" }],
  competences: [{ type: Schema.Types.ObjectId, ref: "Competence" }],
});

schema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Freelance", schema);
