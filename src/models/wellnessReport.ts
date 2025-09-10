import mongoose from "mongoose";

const WellnessReportSchema = new mongoose.Schema({
userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  weekStart: { type: Date, required: true },
  weekEnd: { type: Date, required: true }, 
  totalMinutes: { type: Number, default: 0 },
  sessionCount: { type: Number, default: 0 },
  challengesCompleted: { type: Number, default: 0 },
  avgSessionDuration: { type: Number, default: 0 },
  favoriteLocation: { type: String },
  achievementUnlocked: { type: Boolean, default: false },
  comparisonToPrevious: {
    minutesChange: { type: Number, default: 0 }, 
    trend: { type: String, enum: ['UP', 'DOWN', 'SAME'] }
  },
  generatedAt: { type: Date, default: Date.now }
})

const WellnessReport = mongoose.models.WellnessReport || mongoose.model("WellnessReport", WellnessReportSchema);

export default WellnessReport;