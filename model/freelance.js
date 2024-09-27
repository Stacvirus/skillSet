const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema = new Schema({
  tarif: { type: Number, required: true },
  rating: Number,
  city: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  categories: [{ type: Schema.Types.ObjectId, ref: "Category" }],
  experiences: [{ type: Schema.Types.ObjectId, ref: "Experience" }],
  competences: [{ type: Schema.Types.ObjectId, ref: "Competence" }],
  comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
  invitations: [{ type: Schema.Types.ObjectId, ref: "Invitation" }],
});

schema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Freelance", schema);
