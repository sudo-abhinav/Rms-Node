import dotenv from "dotenv"
dotenv.config()

   
const APIKEY = process.env.EMAIL_API_KEY;

export async function verifyEmail(email: string): Promise<{ value: boolean; error: string | null }> {

    const apiUrl = `https://api.getprospect.com/public/v1/email/verify?email=${encodeURIComponent(email)}&APIKEY`;
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        const isValid = data.status === 'valid';
        return {
            value: isValid,
            error: isValid ? null : `Invalid email: ${data.status}`
        };
    } catch (error) {
        return {
            value: false,
            error: `API call failed: ${(error as Error).message}`
        };
    }
}


