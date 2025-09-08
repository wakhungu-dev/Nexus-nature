import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  stravaId: { type: String }, 
  preference: {
    weeklyGoal: { type: Number, default: 0 },
    notification: { type: Boolean, default: false },
  },
});


const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;
