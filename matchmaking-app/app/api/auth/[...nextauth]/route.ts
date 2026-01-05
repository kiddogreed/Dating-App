import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: {},
        password: {}
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user) throw new Error("User not found");

        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) throw new Error("Invalid password");

        // Returned object becomes JWT token
        return {
          id: user.id,
          email: user.email,
          name: user.name
        };
      }
    })
  ],

  session: {
    strategy: "jwt"
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;     // ⭐ Fix: include user.id in token
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;  // ⭐ Fix: extend session with id
      }
      return session;
    }
  },

  pages: {
    signIn: "/login"
  }
});

export { handler as GET, handler as POST };
