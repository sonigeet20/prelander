import { getServerSession } from "next-auth";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const authConfig = {
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: String(credentials.email) },
          });

          if (!user) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            String(credentials.password),
            user.password,
          );

          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
  },
  session: {
    strategy: "jwt" as const,
    maxAge: 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET || "dev-secret-key-change-in-production",
};

export const { signIn, signOut } = NextAuth(authConfig);

// Wrapper to get server session
export const auth = async () => {
  try {
    return await getServerSession(authConfig);
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Auth call failed:", error);
    }
    return null;
  }
};



