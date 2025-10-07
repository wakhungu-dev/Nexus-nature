// import { userController } from '@/controller/userController';
// import { IUser } from '@/models/UserModel';
import { userController } from '@/controller/userControler';
import NextAuth, { NextAuthOptions, Session } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

export interface SessionWithUser extends Session {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
}

// Define the user type that matches what your userController returns
interface DatabaseUser {
  _id: string ; // MongoDB ObjectId
  email: string;
  name: string;
  image?: string;
}

const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_ID as string,
      clientSecret: process.env.NEXT_PUBLIC_GOOGLE_SECRET as string,
    }),
  ],
  callbacks: {
    signIn: async ({ user }) => {
      if (!user) return false;

      // Check if the user already exists in the database
      const existingUser = await userController.getUserByEmail(user.email as string);

      if (!existingUser) {
        // If not, create a new user
        await userController.createUser({
          email: user.email,
          name: user.name,
          image: user.image,
        });
      } else {
        // If user exists, update their information
        await userController.updateUser(existingUser._id as string, {
          name: user.name,
          image: user.image,
        });
      }

      return true;
    },

    session: async ({ session, token }) => {
      console.log('session callback called');
      console.log('session:', session);
      console.log('token:', token);

      if (!token?.email) return session;

      console.log('looking for user with email:', token.email);

      // Fetch the user from the database based on the token email
      const dbUser = await userController.getUserByEmail(token.email as string) as DatabaseUser;
      console.log('db user:', dbUser);

      // If user exists in the database, update the session user object
      if (dbUser) {
        (session as SessionWithUser).user = {
          ...session.user,
          id: dbUser._id?.toString() || '', // Safe access with optional chaining
          email: dbUser.email,
          name: dbUser.name,
          image: dbUser.image,
        };
      }

      console.log('session after callback:', session);
      return session as SessionWithUser;
    },
  },

  pages: {
    signIn: '/auth/signin',  // Ensure this matches your sign-in page route
  },

  session: {
    strategy: 'jwt',  // Use JWT tokens for session handling
  },

  secret: process.env.NEXTAUTH_SECRET,  // Add a secret for your NextAuth configuration (if you don't have one)
};

const handler = NextAuth(authOptions);

export { handler as POST, handler as GET };