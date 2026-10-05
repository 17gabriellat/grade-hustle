import { supabase } from './supabase.js';

// Fungsi untuk memulai login dengan Google
export async function signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.origin
        }
    });

    if (error) {
        console.error("Error during Google Sign In:", error.message);
    }
}

// Fungsi untuk logout
export async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error("Error signing out:", error.message);
    } else {
        window.location.reload();
    }
}

// Mengecek apakah user sedang login dan mengembalikan data user
export async function getCurrentUser() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session && session.user) {
        // Ambil info onboarding dari tabel public.users
        let { data: userData, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

        // Jika belum ada di tabel users (mungkin trigger database belum di-setup)
        if (!userData) {
            const { data: newUser, error: insertError } = await supabase
                .from('users')
                .insert([
                    {
                        id: session.user.id,
                        email: session.user.email,
                        display_name: session.user.user_metadata?.full_name || 'Mahasiswa',
                        is_onboarded: false
                    }
                ])
                .select()
                .single();
            
            if (!insertError) {
                userData = newUser;
            }
        }

        return { sessionUser: session.user, dbUser: userData };
    }
    return null;
}
