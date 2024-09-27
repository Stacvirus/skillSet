const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema = new Schema({
  fileName: { type: String, required: true },
  path: { type: String, required: true },
  size: { type: String, required: true },
  mimeType: { type: String, required: true },
  downloadLink: { type: String, required: true },
  uploadedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, immutable: true },
});

schema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("File", schema);
