import dbConnect from "@/src/lib/dbConnect";
import UserModel from "@/src/models/User";
import bcrypt from "bcryptjs";
import { resendVerifyingMail } from "@/src/helpers/resendVerifyingMail";


export const POST =  async (request: Request) => {
    await dbConnect();
    try{
        //requesting data from the frontend
        const {username, email, password} = await request.json()

        // checking if the user already exists and is verified
        const existingVerifiedUserByUsername = await UserModel.findOne({
            username,
            isVerified: true
        })

        if (existingVerifiedUserByUsername) {
            return Response.json(
                {
                    success: false,
                    message: "User already exist. Please log in instead."
                },
                // status code for bad request (must have to be 400)
                {status: 400}
            )
        }

        const existingVerifiedUserByEmail = await UserModel.findOne({email})
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit code
        

        if (existingVerifiedUserByEmail) {
            if (existingVerifiedUserByEmail.isVerified) {
                return Response.json({
                success: false,
                message: "User already exist. Please log in instead.",
            }, { status: 400 });

            }else{ // user exists but not verified, so we can resend the verification code
                const hashedPassword = await bcrypt.hash(password, 10);
                existingVerifiedUserByEmail.password = hashedPassword;
                existingVerifiedUserByEmail.verificatinCode = verificationCode;
                const expiryDate = new Date(Date.now() + 60 * 60 * 1000); // Set expiry time to 1 hour from now
                existingVerifiedUserByEmail.verifyCodeExpires = expiryDate;
                await existingVerifiedUserByEmail.save();
            }


        } else {
            // this means user donot exist and we can create a new user
            // hashing the password before saving it to the database
            const hashedPassword = await bcrypt.hash(password, 10);
            const expiryDate = new Date();
            expiryDate.setHours(expiryDate.getHours() + 1); // Set expiry time to 1 hour from now
            

            await new UserModel({
                username,
                email,
                password: hashedPassword,
                verificatinCode: verificationCode,
                verifyCodeExpires: expiryDate,
                isVerified: false,
                isAcceptingMessages: true,
                messages: []
            }).save()
        }

        // sending the verification code to the user email
        const emailResponse = await resendVerifyingMail(email, username, verificationCode);

        console.log("Email response:", emailResponse);

        if (!emailResponse.success) {
            return Response.json({
                success: false,
                message: emailResponse.message,
            }, { status: 500 });
        }
        return Response.json({
                success: true,
                message: emailResponse.message,
            }, { status: 500 });

    }
    catch (error) {
        console.error("Error in sign-up route:", error);
        return Response.json(
            { 
                success: false,
                message: "Internal Server Error",
             }, { status: 500 });

    }
}

