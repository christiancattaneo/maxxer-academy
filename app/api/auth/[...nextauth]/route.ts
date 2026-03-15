import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const ADMIN_EMAILS = [
  "christian.cattaneo@superbuilders.school",
  "nat.eliason@alpha.school",
  "cameron.sorsby@alpha.school",
  "nclawson4@gmail.com",
];

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      const email = (user.email || "").toLowerCase();
      if (ADMIN_EMAILS.includes(email)) return true;
      if (
        email.endsWith("@alpha.school") ||
        email.endsWith("@superbuilders.school")
      )
        return true;
      return false;
    },
    async session({ session }) {
      if (session.user?.email) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session as any).isAdmin = ADMIN_EMAILS.includes(
          session.user.email.toLowerCase()
        );
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
});

export { handler as GET, handler as POST };
