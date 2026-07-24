// Supabase is disabled for demo mode so the app can run with dummy auth data.
// Re-enable by restoring the import and removing the no-backend fallback.
// import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState } from 'react';

// ─── Demo data ─────────────────────────────────────────────────────────────────
const DEMO_USER = {
    id: 'demo-user',
    aud: 'authenticated',
    role: 'authenticated',
    email: 'demo@example.com',
    app_metadata: { provider: 'demo' },
    user_metadata: { name: 'Demo User', phone: '+10000000000' },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
} as User;

const DEMO_SESSION = {
    access_token: 'demo-access-token',
    token_type: 'bearer',
    expires_in: 3600,
    refresh_token: 'demo-refresh-token',
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    provider_token: null,
    provider_refresh_token: null,
    user: DEMO_USER,
} as Session;

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuthContextType {
    session: Session | null;
    user: User | null;
    isLoading: boolean;
    /** Step 1: Sends OTP via Twilio edge function */
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
        // Demo session only, no database required.
        setSession(DEMO_SESSION);
        setUser(DEMO_USER);
        setIsLoading(false);
    }, []);

    /**
     * Step 1 — Send OTP
     * Calls the Supabase Edge Function `send-sms` which uses Twilio to deliver
     * the OTP. Supabase generates the token internally; Twilio sends the SMS.
     */
    const signInWithPhone = async (_phone: string): Promise<{ error: Error | null }> => {
        return { error: null };
    };

    /**
     * Step 2 — Verify OTP
     * Demo mode bypasses actual verification.
     */
    const verifyOtp = async (_phone: string, _token: string): Promise<{ error: Error | null }> => {
        return { error: null };
    };

    const signOut = async () => {
        setSession(null);
        setUser(null);
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
