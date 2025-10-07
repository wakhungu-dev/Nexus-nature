import mongoose, { Document } from "mongoose";
import { z } from "zod";
import bcrypt from 'bcryptjs';

// Zod schema for validation
export const UserZodSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name cannot exceed 100 characters"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  stravaId: z.string().optional(),
  preference: z.object({
    weeklyGoal: z.number().min(0, "Weekly goal must be positive").default(0),
    notification: z.boolean().default(false),
  }).default({
    weeklyGoal: 0,
    notification: false,
  }),
}).strict();

// TypeScript type from Zod schema
export type UserType = z.infer<typeof UserZodSchema>;

// Mongoose document interface
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  stravaId?: string;
  preference: {
    weeklyGoal: number;
    notification: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
  validateUpdate(updateData: unknown): z.ZodSafeParseResult<UserType>;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Mongoose model interface
export interface IUserModel extends mongoose.Model<IUser> {
  validateUserData(userData: unknown): z.ZodSafeParseResult<UserType>;
}

// Mongoose schema
const UserSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
  },
  email: { 
    type: String, 
    required: true,
    unique: true,
  },
  password: { 
    type: String, 
    required: true,
  },
  stravaId: { 
    type: String, 
    required: false 
  },
  preference: {
    weeklyGoal: { 
      type: Number, 
      default: 0,
    },
    notification: { 
      type: Boolean, 
      default: false 
    },
  },
}, {
  timestamps: true,
});

// Pre-save validation and password hashing
UserSchema.pre('save', async function(next) {
  try {
    // Hash password if it's modified
    if (this.isModified('password')) {
      this.password = await bcrypt.hash(this.password, 12);
    }
    
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Static method for validating data before creating user
UserSchema.statics.validateUserData = function(userData: unknown) {
  return UserZodSchema.safeParse(userData);
};

// Instance method for validating updates
UserSchema.methods.validateUpdate = function(updateData: unknown) {
  return UserZodSchema.partial().safeParse(updateData);
};

// Instance method to compare passwords
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = (mongoose.models.User as IUserModel) || mongoose.model<IUser, IUserModel>("User", UserSchema);

export default User;

// Export validation functions for use in API routes
export const validateUser = (userData: unknown) => {
  return UserZodSchema.safeParse(userData);
};

export const validateUserUpdate = (updateData: unknown) => {
  return UserZodSchema.partial().safeParse(updateData);
};

// For registration (validates plain password)
export const validateUserRegistration = (userData: unknown) => {
  return UserZodSchema.safeParse(userData);
};

// For login validation (only email and password)
export const LoginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export const validateLogin = (loginData: unknown) => {
  return LoginSchema.safeParse(loginData);
};
