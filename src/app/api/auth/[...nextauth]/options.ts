import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
// import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";
import dbConnect from "@/src/lib/dbConnect";
import UserModel from "@/src/models/User";

export const authOptions: NextAuthOptions = {
    providers: [
        // authentication providers
        CredentialsProvider({
            id: "credentials",
            name: "Credentials",
            // The credentials is used to generate a suitable form on the sign in page. NextAuth will create a form with the fields specified in credentials. You can specify whatever fields you are expecting to be submitted.
            credentials: {
                email: { label: "Email", type: "text " },
                password: { label: "Password", type: "password" },
            },

            // Need to design a costum authorize method to check the user credentials and return the user object if valid, or null if invalid.
            async authorize(credentials: any): Promise<any> {
                await dbConnect();
                try {
                    const user = await UserModel.findOne({
                        // mongoose query to find the user by email or username
                        $or: [
                            { email: credentials.identifier },
                            { username: credentials.identifier },
                        ]
                    });

                    if (!user) {
                        throw new Error("User not found");
                    }

                    if (!user.isVerified) {
                        throw new Error("User is not verified");
                    }

                    // check if the password is correct
                    const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

                    if (!isPasswordValid) {
                        throw new Error("Invalid password");
                    } else {
                        return user;
                    }

                } catch (err) {
                    // here we must throw an error if the user is not found, otherwise next-auth will return null and the user will be redirected to the sign in page with an error message.
                    throw new Error("User not found");
                }

            }
        })
    ],
    // next auth automatically creates pages for sign in, sign out, error, verify request and new user. You can override the default pages by specifying the path to your custom pages in the pages object.
    pages: {
        signIn: '/signin',
    },
    session: {
        strategy: "jwt",
    },
    // adapter: PrismaAdapter(prisma),
    secret: process.env.NEXTAUTH_SECRET_KEY,

    callbacks: {
        async jwt({ token, user}) { //the user built in in next auth. 
            if (user){
                //making the token powerful.
                token._id = user._id?.toString();
                token.username = user.username;
                token.isVerified = user.isVerified;
                token.isAcceptingMessages = user.isAcceptingMessages;
            }
            // must have to return the token, otherwise the session callback will not be called and the user will not be signed in.
            return token
        },
        async session({ session, token }) {
            
            // Must have to agument  the jwt token to the session object, otherwise the session object will not have the user id and username.
            if (token) {
                session.user._id = token._id;
                session.user.username = token.username;
            }
            return session
        },
        
    }
};