import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    firstName?: string | null;
    lastName?: string | null;
    emailVerified?: boolean;
  }

  interface Session {
    user: {
      id: string;
      firstName?: string | null;
      lastName?: string | null;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      emailVerified?: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    firstName?: string | null;
    lastName?: string | null;
    emailVerified?: boolean;
  }
}
