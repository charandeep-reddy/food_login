import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                await connectDB();
                const user = await User.findOne({ email: credentials?.email });
                if (!user) {
                    throw new Error("User not found");
                }
                const passwordsMatch = await bcrypt.compare(credentials!.password, user.password);
                if (!passwordsMatch) {
                    throw new Error("Invalid password");
                }
                return { id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin };
            },
        }),
    ],

    callbacks: {
        async session({ session, token, user }) {
            if (session?.user) {
                session.user.id = token.sub;
                session.user.isAdmin = token.isAdmin;
            }
            return session;
        },

        async jwt({ token, user }) {
            if (user) {
                token.isAdmin = (user as any).isAdmin;
            }
            return token;
        },
    },
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/login",
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };