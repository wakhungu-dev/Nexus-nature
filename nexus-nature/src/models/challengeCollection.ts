import mongoose from "mongoose";

const ChallangeSchema = new mongoose.Schema({
    title:String,
    description:String,
    category: String,
    locationBased:Boolean,
    coordinates: [Number]
})
const Challenge = mongoose.models.Challenge || mongoose.model("Challenge", ChallangeSchema);

export default Challenge;