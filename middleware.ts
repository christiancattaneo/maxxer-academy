export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/tools/:path*", "/api/tools/:path*"],
};
