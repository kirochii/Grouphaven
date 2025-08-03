import { supabase, supabaseAdmin } from './supabase';
import * as SecureStore from 'expo-secure-store';
import { StreamChat } from 'stream-chat';

export async function signUpNewUser(inputEmail: string, inputPassword: string) {
    const { data, error } = await supabase.auth.signUp({
        email: inputEmail,
        password: inputPassword,
        options: {
            emailRedirectTo: 'https://grouphaven.netlify.app/',
        },
    })

    if (error) {
        return { success: false, error };
    }

    return { success: true, data };
}

export async function signInWithEmail(inputEmail: string, inputPassword: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email: inputEmail.trim().toLowerCase(),
        password: inputPassword,
    })

    if (error) {
        return { success: false, error };
    } else {
        await SecureStore.setItemAsync('userId', data.user.id);
        return { success: true, userId: data.user.id }; // Return user ID
    }
}

export async function signOut() {
  // Sign out from Supabase
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Supabase sign-out error:', error.message);
  }

  // Remove userId from SecureStore
  await SecureStore.deleteItemAsync('userId');

  // Disconnect from Stream Chat
  try {
    const client = StreamChat.getInstance(process.env.EXPO_PUBLIC_STREAM_API_KEY!);
    await client.disconnectUser();
  } catch (err) {
    console.warn('Stream Chat disconnect failed:', err);
  }
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
    const trimmedEmail = email.trim();
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return regex.test(trimmedEmail);
};

// Validate Password format
export const validatePassword = (password: string) => {
    const trimmedPassword = password.trim();
    const regex = /^[A-Za-z\d@$!%*?&]{8,15}$/;
    return regex.test(trimmedPassword);
};

// Validate Confirm Password match
export const validateConfirmPassword = (password: string, confirmPassword: string) => {
    const trimmedPassword = password.trim();
    return trimmedPassword === confirmPassword;
};

export async function userExist(id: string) {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id);

    if (data && data.length > 0) {
        return true;
    } else {
        return false;
    }
}

export async function resetPassword(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://grouphaven.netlify.app/recovery',
    })
}

export async function changeCurrentPassword(password: string) {
    const { data, error } = await supabase.auth.updateUser({
        password: password
    });

    if (error) {
        return { success: false, message: error.message };
    }

    return { success: true, data };
}

export async function changeCurrentEmail(email: string) {
    const { data, error } = await supabase.auth.updateUser({
        email: email
    })

    if (error) {
        return { success: false, message: error.message };
    }

    return { success: true, data };
}

export async function deleteUser(userId: string) {
    const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);
    if (deleteError) {
        return { success: false, message: deleteError.message };
    }

    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (authError) {
        return { success: false, message: authError.message };
    }

    return { success: true };
}