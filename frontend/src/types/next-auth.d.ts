import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      firstname?: string;
      lastname?: string;
      is_complete: boolean;
    } & DefaultSession["user"];
    accessToken?: string;
  }

  interface User extends DefaultUser {
    id: string;
    email: string;
    firstname?: string;
    lastname?: string;
    is_complete: boolean;
    accessToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id?: string;
    email?: string;
    firstname?: string;
    lastname?: string;
    is_complete?: boolean;
    accessToken?: string;
  }
}
