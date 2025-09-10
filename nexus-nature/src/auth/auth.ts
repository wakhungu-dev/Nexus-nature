import NextAuth, { getServerSession as getSession } from "next-auth";
import authConfig from "./auth.config";

export const { auth, handlers, signOut, signIn } = NextAuth(authConfig);
export const getServerSession = async () => getSession(authConfig);