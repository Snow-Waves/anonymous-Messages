import dbConnect from "@/src/lib/dbConnect";
import UserModel from "@/src/models/User";
import { z } from "zod";
import { usernameValidation } from "@/src/schemas/signUpSchema";

const UsernameQuerySchema = z.object({
    username: usernameValidation
});

export async function GET(request: Request) {

    await dbConnect();

    try {
        const { searchParams } = new URL(request.url);

        // url e.g.: /api/check-username-unique?username=someUsername
        const queryParams = {
            username: searchParams.get("username") || ""
        }

        // validation of the query params
        const validationResult = UsernameQuerySchema.safeParse(queryParams);

        console.log("\nValidation result:", validationResult);

        if (!validationResult.success) {
            return Response.json(
                {
                    success: false,
                    message: "Invalid query parameters.",
                    errors: z.treeifyError(validationResult.error).properties?.username?.errors
                },
                { status: 400 }
            )
        }

        // If validation is successful, extract the username
        const { username } = validationResult.data;

        // Check if the username already exists in the database
        const existingVerifiedUser = await UserModel.findOne({ username, isVerified: true });

        if (existingVerifiedUser) {
            return Response.json({
                success: false,
                message: "Username is already taken"
            },
                { status: 400 })
        }

        return Response.json({
            success: true,
            message: "Username is available"
        },
            { status: 200 })



    } catch (error) {
        console.error("Error checking username uniqueness:", error);
        return Response.json(
            {
                success: false,
                message: "An error occurred while checking username uniqueness.",
            },
            { status: 500 }
        )
    }
}