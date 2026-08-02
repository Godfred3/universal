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
    isAuthorized: boolean;
    signInWithEmail: (email: string, password: string) => Promise<{ authorized: boolean; error: Error | null }>;
    signUpWithEmail: (email: string, password: string, details: SignUpDetails) => Promise<{ code: string | null; error: Error | null }>;
    authorizeAccount: (code: string) => Promise<{ authorized: boolean; error: Error | null }>;
    generateAuthorizationCode: () => Promise<{ code: string | null; error: Error | null }>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        let active = true;

        supabase.auth.getSession().then(({ data, error }) => {
            if (error) console.warn('[auth] could not restore session', error);
            if (active) {
                setSession(data.session);
                setIsAuthorized(false);
                setIsLoading(Boolean(data.session));
            }
        });

        const { data: listener } = supabase.auth.onAuthStateChange((event, nextSession) => {
            setSession(nextSession);
            if (!nextSession) {
                setIsAuthorized(false);
                setIsLoading(false);
            } else if (event === 'SIGNED_IN') {
                setIsLoading(true);
            }
        });

        return () => {
            active = false;
            listener.subscription.unsubscribe();
        };
    }, []);

    useEffect(() => {
        let active = true;
        const userId = session?.user.id;

        if (!userId) {
            return () => { active = false; };
        }

        supabase
            .from('profiles')
            .select('is_authorized')
            .eq('id', userId)
            .maybeSingle()
            .then(({ data, error }) => {
                if (error) console.warn('[auth] could not load authorization state', error);
                if (active) {
                    setIsAuthorized(data?.is_authorized === true);
                    setIsLoading(false);
                }
            });

        return () => { active = false; };
    }, [session?.user.id]);

    const signUpWithEmail = async (email: string, password: string, details: SignUpDetails) => {
        const { data, error } = await supabase.auth.signUp({
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
        if (error) return { code: null, error };
        if (!data.session) {
            return { code: null, error: new Error('Account creation needs email confirmation disabled in Supabase Auth.') };
        }
        const { data: code, error: codeError } = await supabase.rpc('issue_account_authorization_code');
        return { code: typeof code === 'string' ? code : null, error: codeError };
    };

    const signInWithEmail = async (email: string, password: string) => {
        const { data: signInData, error } = await supabase.auth.signInWithPassword({
            email: email.trim().toLowerCase(),
            password,
        });
        if (error || !signInData.user) return { authorized: false, error };

        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('is_authorized')
            .eq('id', signInData.user.id)
            .maybeSingle();
        if (profileError) return { authorized: false, error: profileError };

        const authorized = profile?.is_authorized === true;
        setIsAuthorized(authorized);
        setIsLoading(false);
        return { authorized, error: null };
    };

    const generateAuthorizationCode = async () => {
        const { data, error } = await supabase.rpc('issue_account_authorization_code');
        return { code: typeof data === 'string' ? data : null, error };
    };

    const authorizeAccount = async (code: string) => {
        const { data, error } = await supabase.rpc('verify_account_authorization_code', { submitted_code: code });
        if (!error && data === true) setIsAuthorized(true);
        return { authorized: data === true, error };
    };

    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    };

    return (
        <AuthContext.Provider
            value={{ session, user: session?.user ?? null, isLoading, isAuthorized, signInWithEmail, signUpWithEmail, authorizeAccount, generateAuthorizationCode, signOut }}
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
