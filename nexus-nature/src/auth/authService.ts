// import { pwdConfirm, pwdHasher } from "@/libs/bcrypt/password";
// import { Guardian } from "@/models/Guardian";
// import { Teacher } from "@/models/Teacher";
// import { User } from "@/models/User";
// import { dbCon } from "@/libs/mongoose/dbCon";
// import { mongoDbConnection } from "@/lib/mongodb";

import mongoDbConnection from "@/lib/mongodb";
import User from "@/models/userCollection";

class AuthService {
  constructor() {
    // call dbcon
    (async () => await mongoDbConnection())();
  }
  async findByEmail(email: string) {
    // This returns the correct subclass automatically!
    return await User.findOne({ email });
  }

  async loginWithCredentials(email: string, password: string) {
    const user = await this.findByEmail(email);
    if (
      !user ||
      !user.password ||
      !(
        pwdConfirm(password, process.env.USER_DEFAULT_PASSWORD!) ||
        (await pwdConfirm(password, user.password))
      )
    ) {
      return null;
    }

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      image: user.image,
    };
  }

  async registerWithCredentials(data: {
    name: string;
    email: string;
    password: string;
    role: "user" ;
  }) {
    const existing = await this.findByEmail(data.email);
    if (existing) throw new Error("Email already registered");

    const hashed = await pwdHasher(
      data.password || process.env.USER_DEFAULT_PASSWORD! || "123456"
    );

    // Create using the discriminator
    
  }

  async loginWithGoogleProfile(profile: {
    id: string;
    name: string;
    email: string;
    image?: string;
  }) {
    let user = await this.findByEmail(profile.email);

    if (!user) {
      user = await User.create({
        name: profile.name,
        email: profile.email,
        image: profile.image,
        role: "user",
        authProvider: "google",
        googleId: profile.id,
      });
    }

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      image: user.image,
    };
  }
}

export const authService = new AuthService();