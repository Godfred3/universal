import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuthContextType {
    session: Session | null;
    user: User | null;
    isLoading: boolean;
    /** Step 1: Sends OTP via Hubtel edge function */
    signInWithPhone: (phone: string) => Promise<{ error: Error | null }>;
    /** Step 2: Verifies the 6-digit OTP entered by the user */
    verifyOtp: (phone: string, token: string) => Promise<{ error: Error | null }>;
    /** Signs out the current user */
    signOut: () => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Restore session on app launch
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setIsLoading(false);
        });

        // Listen for auth state changes (login, logout, token refresh)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setIsLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    /**
     * Step 1 — Send OTP
     * Calls the Supabase Edge Function `send-sms` which uses Hubtel to deliver
     * the OTP. Supabase generates the token internally; Hubtel sends the SMS.
     */
    const signInWithPhone = async (phone: string): Promise<{ error: Error | null }> => {
        const { error } = await supabase.auth.signInWithOtp({ phone });
        if (error) return { error: new Error(error.message) };
        return { error: null };
    };

    /**
     * Step 2 — Verify OTP
     * Supabase validates the token against the one it generated for the phone number.
     */
    const verifyOtp = async (phone: string, token: string): Promise<{ error: Error | null }> => {
        const { error } = await supabase.auth.verifyOtp({
            phone,
            token,
            type: 'sms',
        });
        if (error) return { error: new Error(error.message) };
        return { error: null };
    };

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{ session, user, isLoading, signInWithPhone, verifyOtp, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
