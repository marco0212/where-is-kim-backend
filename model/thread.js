import mongoose from "mongoose";

const schema = mongoose.Schema({
  record: { type: mongoose.Types.ObjectId, ref: "Record" },
  text: {
    type: String,
    required: true,
  },
  comments: [
    {
      author: { type: mongoose.Types.ObjectId, ref: "User", required: true },
      text: { type: String, required: true },
    },
  ],
  likes: [
    {
      author: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    },
  ],
});

export default mongoose.model("Thread", schema);
