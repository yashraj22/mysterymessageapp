import { resend } from "@/app/lib/resend";
import VerificationEmail from "../emails/VerificationEmail";
import { ApiResponse } from "@/app/types/ApiResponse";

export async function sendVerificationEmail(
    email : string,
    username : string,
    verifyCode : string
) : Promise<ApiResponse> {
    try {
        const data = await resend.emails.send({
            from: 'Acme <onboarding@resend.dev>',
            to: email,
            subject: 'Verification code',
            react: VerificationEmail({ username , otp : verifyCode }),
          });
        return {
            success : true,
            message : "Successfully verification email sent"
        }
    } catch (emailError) {
        console.error("Error sending verification email" , emailError);
        return {
            success : false,
            message : "Failed to send verification email"
        }
    }
}