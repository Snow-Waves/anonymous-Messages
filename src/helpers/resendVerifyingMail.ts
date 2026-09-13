import { resend } from '../lib/resend';

import VerificationEmail from '../../emails/verifyingTemplate';
import { ApiResponseType } from '../types/apiResponseType';

// the function that is sending the verification email to the user, why its returning a reponse with messages ???
// mUst have to return a response even if it throws an error.
export const resendVerifyingMail = async (email: string, username: string, verificationCode: string): Promise<ApiResponseType> => {
    try {
        await resend.emails.send({
            from: 'Acme <onboarding@resend.dev>',
            to: email,
            subject: 'Verify your email address',
            react: VerificationEmail({ username, otp: verificationCode }),
        });

        return {
            success: true,
            message: 'verification email sent successfully',
        }

    } catch (error) {
        console.error('Error sending verification email:', error);
        return {
            success: false,
            message: 'Failed to send verification email.',
        }
    }
}