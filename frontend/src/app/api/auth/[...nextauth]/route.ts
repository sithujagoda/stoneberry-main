import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

const getApiUrl = () => process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        try {
          const res = await fetch(`${getApiUrl()}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password
            })
          });

          const resData = await res.json();
          if (!res.ok || !resData.success) {
            throw new Error(resData.error || "Invalid email or password");
          }

          const tokenData = resData.data;
          // Return a structured user object for the jwt callback
          return {
            id: String(tokenData.user.id),
            email: tokenData.user.email,
            firstname: tokenData.user.firstname || "",
            lastname: tokenData.user.lastname || "",
            is_complete: tokenData.user.is_complete,
            accessToken: tokenData.access_token
          };
        } catch (error: any) {
          throw new Error(error.message || "Failed to connect to authentication server");
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || ""
    })
  ],
  callbacks: {
    async jwt({ token, user, account, trigger, session }) {
      // Runs on sign-in
      if (account && user) {
        if (account.provider === "google") {
          try {
            // Split name into first and last name for google profile
            const nameParts = user.name?.split(/\s+/) || [];
            const firstname = nameParts[0] || "";
            const lastname = nameParts.slice(1).join(" ") || "";

            // Register/login Google profile with backend
            const res = await fetch(`${getApiUrl()}/api/auth/social-login`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: user.email,
                provider: "google",
                firstname: firstname,
                lastname: lastname
              })
            });

            const resData = await res.json();
            if (res.ok && resData.success) {
              const tokenData = resData.data;
              token.accessToken = tokenData.access_token;
              token.is_complete = tokenData.user.is_complete;
              token.firstname = tokenData.user.firstname;
              token.lastname = tokenData.user.lastname;
              token.id = String(tokenData.user.id);
            }
          } catch (error) {
            console.error("Error linking Google login to backend database:", error);
          }
        } else if (account.provider === "credentials") {
          // Credentials user returned from authorize()
          token.accessToken = (user as any).accessToken;
          token.is_complete = (user as any).is_complete;
          token.firstname = (user as any).firstname;
          token.lastname = (user as any).lastname;
          token.id = user.id;
        }
      }

      // Handle session updates (e.g. updating is_complete or name after onboarding)
      if (trigger === "update" && session) {
        if (session.is_complete !== undefined) token.is_complete = session.is_complete;
        if (session.firstname !== undefined) token.firstname = session.firstname;
        if (session.lastname !== undefined) token.lastname = session.lastname;
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          ...session.user,
          id: token.id as string,
          email: token.email as string,
          firstname: token.firstname as string,
          lastname: token.lastname as string,
          is_complete: token.is_complete as boolean
        };
        (session as any).accessToken = token.accessToken;
      }

      return session;
    }
  },
  pages: {
    signIn: "/login",
    error: "/login"
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60 // 24 hours (syncs with backend token expiration)
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
