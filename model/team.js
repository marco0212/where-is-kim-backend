import mongoose from "mongoose";

const schema = mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true,
  },
  display_name: {
    type: String,
    unique: true,
    required: true,
  },
  thumbnail_pic: {
    type: String,
  },
  created_by: {
    type: mongoose.Types.ObjectId,
    ref: "Team",
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
    required: true,
  },
  location: {
    type: { address: String, latitude: String, longitude: String },
    required: true,
  },
  work_on_time: {
    type: String,
    required: true,
  },
  work_off_time: {
    type: String,
    required: true,
  },
  participants: [{ type: mongoose.Types.ObjectId, ref: "User" }],
  admins: [{ type: mongoose.Types.ObjectId, ref: "User" }],
  threads: [{ type: mongoose.Types.ObjectId, ref: "Thread" }],
  records: [{ type: mongoose.Types.ObjectId, ref: "Record" }],
});

export default mongoose.model("Team", schema);
