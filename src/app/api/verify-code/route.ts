import dbConnect from "@/src/lib/dbConnect";
import UserModel from "@/src/models/User";
// import { z } from "zod";
// import { verifySchema } from "@/src/schemas/verifySchema";


// can do using do POST method as well but GET is more appropriate for this case since we are just verifying the code and not creating or updating any resource.
export async function POST(request: Request) {

    await dbConnect();

    try {

        const { username, code } = await request.json();

        console.log("\nReceived request body:", { username, code });

        const decodedUsername = decodeURIComponent(username);

        const user = await UserModel.findOne({
            username: decodedUsername,
        })

        if (!user) {
            return Response.json(
                {
                    success: false,
                    message: "User not found."
                },
                { status: 404 }
            );
        }

        const isCodeValid = user.verificatinCode === code;
        const isCodeExpired = new Date() > user.verifyCodeExpires;

        if (isCodeValid && !isCodeExpired) {
            user.isVerified = true;
            await user.save()

            return Response.json(
                {
                    success: true,
                    message: "Verification successful."
                },
                { status: 200 }
            );
        } else if (isCodeExpired) {
            return Response.json(
                {
                    success: false,
                    message: "Verification code has expired."
                },
                { status: 400 }
            );
        } else {
            return Response.json(
                {
                    success: false,
                    message: "Invalid verification code."
                },
                { status: 400 }
            );
        }


    } catch (error) {
        console.error("Error in GET /api/verify-code:", error);
        return Response.json(
            {
                success: false,
                message: "An error occurred while processing the request."
            },
            { status: 500 } // server error status code`
        );
    }
}