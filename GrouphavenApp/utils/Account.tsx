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

export async function getUserProfile() {
    const { data, error: authError } = await supabase.auth.getUser();

    if (authError || !data?.user) {
        return null;
    }

    const { data: userData, error } = await supabase
        .from("users")
        .select(`
            name, avatar_url, bio, is_verified, dob, tagline,
            gender, city, photo_1, photo_2, photo_3, photo_4, photo_5, photo_6
        `)
        .eq("id", data.user.id)
        .single();

    if (error) {
        return null;
    }

    return userData;
}

export function calculateAge(dob: string): number {
    if (!dob) return 0;

    const birthDate = new Date(dob);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();

    // Adjust age if the birth month/day hasn't occurred yet this year
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        age--;
    }

    return age;
}

export function getLocation(value: string): string | null {
    const CITIES = [
        { label: 'Kuala Lumpur', value: 'kuala_lumpur' },
        { label: 'Seberang Jaya', value: 'seberang_jaya' },
        { label: 'Klang', value: 'klang' },
        { label: 'Ipoh', value: 'ipoh' },
        { label: 'George Town', value: 'george_town' },
        { label: 'Petaling Jaya', value: 'petaling_jaya' },
        { label: 'Kuantan', value: 'kuantan' },
        { label: 'Shah Alam', value: 'shah_alam' },
        { label: 'Sungai Petani', value: 'sungai_petani' },
        { label: 'Johor Bahru', value: 'johor_bahru' },
        { label: 'Kota Bharu', value: 'kota_bharu' },
        { label: 'Melaka', value: 'melaka' },
        { label: 'Kota Kinabalu', value: 'kota_kinabalu' },
        { label: 'Seremban', value: 'seremban' },
        { label: 'Sandakan', value: 'sandakan' },
        { label: 'Kuching', value: 'kuching' },
        { label: 'Kluang', value: 'kluang' },
        { label: 'Muar', value: 'muar' },
        { label: 'Pasir Gudang', value: 'pasir_gudang' },
        { label: 'Kuala Terengganu', value: 'kuala_terengganu' },
        { label: 'Sibu', value: 'sibu' },
        { label: 'Taiping', value: 'taiping' },
        { label: 'Kajang', value: 'kajang' },
        { label: 'Miri', value: 'miri' },
        { label: 'Teluk Intan', value: 'teluk_intan' },
        { label: 'Kulai', value: 'kulai' },
        { label: 'Alor Setar', value: 'alor_setar' },
        { label: 'Bukit Mertajam', value: 'bukit_mertajam' },
        { label: 'Lahad Datu', value: 'lahad_datu' },
        { label: 'Segamat', value: 'segamat' },
        { label: 'Tumpat', value: 'tumpat' },
        { label: 'Keningau', value: 'keningau' },
        { label: 'Batu Pahat', value: 'batu_pahat' },
        { label: 'Batu Gajah', value: 'batu_gajah' },
        { label: 'Tuaran', value: 'tuaran' },
        { label: 'Bayan Lepas', value: 'bayan_lepas' },
        { label: 'Port Dickson', value: 'port_dickson' },
        { label: 'Bintulu', value: 'bintulu' },
        { label: 'Tawau', value: 'tawau' },
        { label: 'Simanggang', value: 'simanggang' },
        { label: 'Labuan', value: 'labuan' },
        { label: 'Cukai', value: 'cukai' },
        { label: 'Butterworth', value: 'butterworth' },
        { label: 'Putrajaya', value: 'putrajaya' },
        { label: 'Taman Johor Jaya', value: 'taman_johor_jaya' },
        { label: 'Kangar', value: 'kangar' },
        { label: 'Others', value: 'others' },
    ];

    const city = CITIES.find(city => city.value === value);
    return city ? city.label : null;
}