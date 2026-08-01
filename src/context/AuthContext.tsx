import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState } from 'react';

type SignUpDetails = {
    fullName: string;
    phone: string;
    gender: string;
    username?: string;
};

interface AuthContextType {
    session: Session | null;
    user: User | null;
    isLoading: boolean;
    signUpWithEmail: (email: string, password: string, details: SignUpDetails) => Promise<{ error: Error | null }>;
    verifyEmailOtp: (email: string, token: string) => Promise<{ error: Error | null }>;
    resendEmailOtp: (email: string) => Promise<{ error: Error | null }>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let active = true;

        supabase.auth.getSession().then(({ data, error }) => {
            if (error) console.warn('[auth] could not restore session', error);
            if (active) {
                setSession(data.session);
                setIsLoading(false);
            }
        });

        const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
            setSession(nextSession);
            setIsLoading(false);
        });

        return () => {
            active = false;
            listener.subscription.unsubscribe();
        };
    }, []);

    const signUpWithEmail = async (email: string, password: string, details: SignUpDetails) => {
        const { error } = await supabase.auth.signUp({
            email: email.trim().toLowerCase(),
            password,
            options: {
                data: {
                    full_name: details.fullName,
                    phone: details.phone,
                    gender: details.gender,
                    ...(details.username ? { username: details.username } : {}),
                },
            },
        });
        return { error };
    };

    const verifyEmailOtp = async (email: string, token: string) => {
        const { error } = await supabase.auth.verifyOtp({
            email: email.trim().toLowerCase(),
            token,
            type: 'signup',
        });
        return { error };
    };

    const resendEmailOtp = async (email: string) => {
        const { error } = await supabase.auth.resend({
            type: 'signup',
            email: email.trim().toLowerCase(),
        });
        return { error };
    };

    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    };

    return (
        <AuthContext.Provider
            value={{ session, user: session?.user ?? null, isLoading, signUpWithEmail, verifyEmailOtp, resendEmailOtp, signOut }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
}
