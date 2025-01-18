import { prismaClient } from "@/app/lib/db";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  callbacks: {
    // Returns a boolean value indicating whether the user should be signed in or not
    async signIn(params) {
      if (!params.user.email) {
        return false;
      }
      try {
        // If email is valid, create a new user in the database
        // There is a uniqueness constraint on email, so there will be no duplicates
        await prismaClient.user.create({
          data: {
            email: params.user.email,
            provider: "Google",
          },
        });
      } catch (e) {
        return false;
      }
      return true;
    },
  },
});

export { handler as GET, handler as POST };
