import { supabase } from './supabase';

export async function signUpNewUser(inputEmail: string, inputPassword: string) {
    const { data, error } = await supabase.auth.signUp({
        email: inputEmail,
        password: inputPassword,
        options: {
            emailRedirectTo: 'https://grouphaven.netlify.app/',
        },
    })
}

export async function resendConfirmationEmail(inputEmail: string) {
    const { error } = await supabase.auth.resend({
        type: 'signup',
        email: inputEmail,
        options: {
            emailRedirectTo: 'https://grouphaven.netlify.app/'
        }
    })
}

export const maskEmail = (email: string) => {
    if (!email || !email.includes("@")) return email; // Return original if invalid

    const [localPart, domain] = email.split("@"); // Split email into parts
    const maskedLocalPart =
        localPart.length > 2
            ? localPart.slice(0, 2) + "*".repeat(localPart.length - 2)
            : "*".repeat(localPart.length);

    return `${maskedLocalPart}@${domain}`;
};

export async function checkEmailConfirmation(email: string) {
    // Call the PostgreSQL function
    const { data, error } = await supabase
        .rpc('check_email_confirmation', { p_email: email })

    return data;
}


// Validate Email format
export const validateEmail = (email: string) => {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return regex.test(email);
};

// Validate Password format (8 to 15 characters, at least one lowercase, one uppercase, one digit, and one special character)
export const validatePassword = (password: string) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/;
    return regex.test(password);
};

// Validate Confirm Password match
export const validateConfirmPassword = (password: string, confirmPassword: string) => {
    return password === confirmPassword;
};