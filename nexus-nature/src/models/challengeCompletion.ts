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
            type:String,
            enum: ["point"],
            default: "point"
        },
        coordinates: {
            type:[Number],

        }
    }
});

const ChallengeCompletion =  mongoose.model("ChallengeCompetion", ChallengeCompletionSchema);

export default ChallengeCompletion;
