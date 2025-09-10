import mongoose from "mongoose";

const ChallengeSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    difficulty: { 
        type: String, 
        enum: ["Easy", "Medium", "Hard"], 
        required: true 
    },
    category: { type: String, required: true },
    locationBased: { type: Boolean, default: false },
    coordinates: [Number],
    createdAt: { type: Date, default: Date.now }
});

const Challenge = mongoose.models.Challenge || mongoose.model("Challenge", ChallengeSchema);

export default Challenge;