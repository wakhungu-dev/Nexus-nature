import NextAuth from "next-auth";
import authConfig from "./auth.config";

const nextAuth = NextAuth(authConfig);

export const { auth, handlers, signOut, signIn } = nextAuth;
export const getServerSession = auth;