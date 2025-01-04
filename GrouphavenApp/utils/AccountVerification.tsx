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
