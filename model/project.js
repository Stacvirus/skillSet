const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema = new Schema({
  rating: { type: Number },
  status: {
    type: String,
    enum: ["PENDING", "COMPLETE", "CANCELED"],
    default: "PENDING",
  },
  mission: { type: Schema.Types.ObjectId, ref: "Mission", required: true },
  collaborators: [{ type: Schema.Types.ObjectId, ref: "Freelance" }],
  leader: { type: Schema.Types.ObjectId, ref: "Freelance" },
  createdAt: { type: Date, immutable: true },
});

schema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Project", schema);
