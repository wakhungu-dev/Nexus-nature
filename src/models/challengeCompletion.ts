import mongoose from "mongoose";

const ChallengeCompletionSchema = new mongoose.Schema({
    userId: {
        type:mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    challengeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'Challenge',
        required: true
    },
    notes: {
        type:String,
    },
    imageUrl: {
        type: String
    },
    location: {
        type: {
            type: String,
            enum: ["Point"],
            default: "Point"
        },
        coordinates: {
            type: [Number],
        }
    },
    completedAt: {
        type: Date,
        default: Date.now
    }
});

const ChallengeCompletion = mongoose.models.ChallengeCompletion || mongoose.model("ChallengeCompletion", ChallengeCompletionSchema);

export default ChallengeCompletion;
