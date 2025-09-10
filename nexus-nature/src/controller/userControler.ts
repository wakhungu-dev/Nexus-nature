// import { dbConnect } from "@/lib/mongoose/db-connect";
// import { UserModel } from "@/models/UserModel";

import mongoDbConnection from "@/lib/mongodb";
import UserModel from "@/models/userCollection";


class UserController {
  db: typeof UserModel;
  constructor() {
    // this.dbInit();
    this.db = UserModel;
  }
  async dbInit() {
    await mongoDbConnection();
  }
  async getUsers() {
    try {
      await this.dbInit();
      const users = await this.db.find();
      return users;
    } catch (error) {
      throw error;
    }
  }
  async getUserById(id: string) {
    try {
      await this.dbInit();
      const user = await this.db.findById(id);
      return user;
    } catch (error) {
      throw error;
    }
  }
  async createUser(data: unknown) {
    try {
      await this.dbInit();
      const newUser = new this.db(data);
      const user = await newUser.save();
      return user;
    } catch (error) {
      throw error;
    }
  }
  async updateUser(id: string, data: Record<string, unknown>) {
    try {
      await this.dbInit();
      const user = await this.db.findByIdAndUpdate(id, data, { new: true });
      return user;
    } catch (error) {
      throw error;
    }
  }
  async deleteUser(id: string) {
    try {
      await this.dbInit();
      const user = await this.db.findByIdAndDelete(id);
      return user;
    } catch (error) {
      throw error;
    }
  }

  async getUserByEmail(email: string) {
    try {
      await this.dbInit();
      const user = await this.db.findOne({ email });
      return user;
    } catch (error) {
      throw error;
    }
  } 

}
 export const userController = new UserController();