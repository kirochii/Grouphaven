import { supabase } from './supabase';

export async function signInWithEmail(inputEmail: string, inputPassword: string) {
    if (!supabase) {
        return false;
    }

    const { error } = await supabase.auth.signInWithPassword({
        email: inputEmail.trim().toLowerCase(),
        password: inputPassword,
    })

    if (error) {
        await signOut();
        return false;
    } else {
        const { data, error: authError } = await supabase.auth.getUser();

        if (authError || !data?.user) {
            await signOut();
            return false;
        }

        const { data: userData, error } = await supabase
            .from("admin")
            .select('admin_id')
            .eq("admin_id", data.user.id)
            .single();

        if (error || !userData) {
            await signOut();
            return false;
        }

        return true;
    }
}

export async function signOut() {
    if (!supabase) {
        return false;
    }

    const { error } = await supabase.auth.signOut();

    if (error) {
        return false;
    } else {
        return true;
    }
}

export async function checkSession() {
    if (!supabase) {
        return false;
    }

    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
        return false;
    }

    return true;
}