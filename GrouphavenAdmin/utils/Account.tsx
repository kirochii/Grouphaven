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

export async function getUser() {
    if (!supabase) {
        return false;
    }

    const { data, error } = await supabase
        .from('verification_request')
        .select(`
            request_id,
            photo_url,
            id,
            users(*)
        `)
        .eq('request_status', 'pending')
        .order('request_date', { ascending: true })
        .limit(1);

    if (!data || error) {
        return false;
    }

    return data;
}

export async function approveUser(request_id: String, user_id: String) {
    const today = new Date().toISOString().split('T')[0];

    if (!supabase) {
        return false;
    }

    const { data: adminData, error: authError } = await supabase.auth.getUser();

    if (authError || !adminData?.user) {
        return false;
    }

    const { error } = await supabase
        .from('verification_request')
        .update({
            request_status: 'approved',
            verification_date: today,
            admin_id: adminData.user.id,
        })
        .eq('request_id', request_id);

    if (error) {
        return false;
    }

    const { error: userError } = await supabase
        .from('users')
        .update({
            is_verified: true,
        })
        .eq('id', user_id);

    if (userError) {
        return false;
    }

    return true;
}

export async function rejectUser(request_id: String) {
    if (!supabase) {
        return false;
    }

    const today = new Date().toISOString().split('T')[0];

    if (!supabase) {
        return false;
    }

    const { data: adminData, error: authError } = await supabase.auth.getUser();

    if (authError || !adminData?.user) {
        return false;
    }

    const { error } = await supabase
        .from('verification_request')
        .update({
            request_status: 'rejected',
            verification_date: today,
            admin_id: adminData.user.id,
        })
        .eq('request_id', request_id);

    if (error) {
        return false;
    }

    return true;
}