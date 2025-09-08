import mongoose from "mongoose";

const greenSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  duration: { type: Number }, 
  location: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number], 
      required: true,
    },
  },
  source: { type: String },
  activityId: { type: String },
});

greenSessionSchema.index({ location: "2dsphere" });

const GreenSession =
  mongoose.models.GreenSession || mongoose.model("GreenSession", greenSessionSchema);

export default GreenSession;
