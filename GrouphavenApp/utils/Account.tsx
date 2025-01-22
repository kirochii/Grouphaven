import { supabase } from './supabase';
import * as SecureStore from 'expo-secure-store';

export async function addUser(name: string, dob: Date, gender: string | null, city: string | null) {
    const userId = await SecureStore.getItemAsync('userId');

    if (gender === null) {
        gender = '';
    }

    if (city === null) {
        city = ''
    }

    const { error } = await supabase
        .from('users')
        .insert({ id: userId, name: name, dob: dob, gender: gender, city: city })
}