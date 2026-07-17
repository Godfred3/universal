// Supabase Edge Function: send-sms
// ─────────────────────────────────────────────────────────────────────────────
// This function is invoked as a webhook by Supabase Auth whenever it needs to
// send an SMS (i.e., when signInWithOtp is called from the app).
//
// Set it up in Supabase Dashboard:
//   Authentication → Hooks → Send SMS → Edge Function → "send-sms"
//
// Required Supabase Secrets (set via: supabase secrets set KEY=value):
//   HUBTEL_CLIENT_ID     — Your Hubtel app Client ID
//   HUBTEL_CLIENT_SECRET — Your Hubtel app Client Secret
//   HUBTEL_SENDER_ID     — The sender name shown on SMS (e.g. "UniversalChat")
// ─────────────────────────────────────────────────────────────────────────────

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const HUBTEL_API_URL = 'https://smsc.hubtel.com/v1/messages/send';

serve(async (req: Request) => {
    try {
        const payload = await req.json();

        // Supabase Auth webhook payload structure
        const phone: string = payload.user?.phone ?? payload.phone;
        const otp: string = payload.token ?? payload.otp;

        if (!phone || !otp) {
            return new Response(
                JSON.stringify({ error: 'Missing phone or otp in payload' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // ─── Hubtel credentials from Supabase Secrets ─────────────────────
        const clientId = Deno.env.get('HUBTEL_CLIENT_ID');
        const clientSecret = Deno.env.get('HUBTEL_CLIENT_SECRET');
        const senderId = Deno.env.get('HUBTEL_SENDER_ID') ?? 'UniversalChat';

        if (!clientId || !clientSecret) {
            console.error('Hubtel credentials not configured');
            return new Response(
                JSON.stringify({ error: 'SMS service not configured' }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const basicAuth = btoa(`${clientId}:${clientSecret}`);

        // ─── Send SMS via Hubtel ──────────────────────────────────────────
        const response = await fetch(HUBTEL_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${basicAuth}`,
            },
            body: JSON.stringify({
                From: senderId,
                To: phone,
                Content: `Your Universal Chat verification code is: ${otp}. It expires in 5 minutes. Do not share this code.`,
            }),
        });

        const result = await response.json();

        if (!response.ok) {
            console.error('Hubtel API error:', result);
            return new Response(
                JSON.stringify({ error: 'Failed to send SMS', details: result }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
        }

        console.log(`OTP sent successfully to ${phone}`, result);

        return new Response(
            JSON.stringify({ success: true, messageId: result.MessageId }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        console.error('Unexpected error in send-sms function:', error);
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
});
