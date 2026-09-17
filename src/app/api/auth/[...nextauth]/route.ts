import NextAuth from "next-auth";
import { authOptions } from "./options";

// fuction name must be handler, otherwise next auth will not work.
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };