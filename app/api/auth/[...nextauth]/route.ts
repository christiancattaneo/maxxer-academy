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
    async signIn({ user, account, profile }) {
      const email = (user.email || "").toLowerCase().trim();
      const googleEmail = ((profile as Record<string, unknown>)?.email as string || "").toLowerCase().trim();
      
      // Debug: log what Google actually returns
      console.log("[nextauth] signIn attempt:", JSON.stringify({
        userEmail: email,
        googleEmail,
        name: user.name,
        provider: account?.provider,
        adminMatch: ADMIN_EMAILS.includes(email),
        domainMatch: email.endsWith("@alpha.school") || email.endsWith("@superbuilders.school") || email.endsWith("@2hourlearning.com"),
      }));

      // Check both user.email and profile.email (Google Workspace can differ)
      const emailToCheck = email || googleEmail;
      
      if (ADMIN_EMAILS.includes(emailToCheck)) return true;
      if (
        emailToCheck.endsWith("@alpha.school") ||
        emailToCheck.endsWith("@superbuilders.school") ||
        emailToCheck.endsWith("@2hourlearning.com")
      )
        return true;
      
      console.log("[nextauth] REJECTED:", emailToCheck);
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
