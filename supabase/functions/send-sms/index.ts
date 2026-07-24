// @ts-nocheck
// Supabase Edge Function: send-sms
// ─────────────────────────────────────────────────────────────────────────────
// This function is invoked as a webhook by Supabase Auth whenever it needs to
// send an SMS (i.e., when signInWithOtp is called from the app).
//
// Set it up in Supabase Dashboard:
//   Authentication → Hooks → Send SMS → Edge Function → "send-sms"
//
// Required Supabase Secrets (set via: supabase secrets set KEY=value):
//   TWILIO_ACCOUNT_SID — Your Twilio Account SID (starts with AC)
//   TWILIO_AUTH_TOKEN  — Your Twilio Auth Token
//   TWILIO_FROM_NUMBER — Your Twilio Phone Number or Messaging Service SID
// ─────────────────────────────────────────────────────────────────────────────

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

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

        // ─── Twilio credentials from Supabase Secrets ──────────────────────
        const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
        const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
        const fromNumber = Deno.env.get('TWILIO_FROM_NUMBER');

        if (!accountSid || !authToken || !fromNumber) {
            console.error('Twilio credentials not fully configured');
            return new Response(
                JSON.stringify({ error: 'SMS service credentials missing' }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const twilioApiUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
        const basicAuth = btoa(`${accountSid}:${authToken}`);

        // Construct url-encoded form body as required by Twilio
        const bodyParams = new URLSearchParams();
        bodyParams.append('To', phone);
        bodyParams.append('From', fromNumber);
        bodyParams.append('Body', `Your Universal Chat verification code is: ${otp}. It expires in 5 minutes. Do not share this code.`);

        // ─── Send SMS via Twilio ───────────────────────────────────────────
        const response = await fetch(twilioApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${basicAuth}`,
            },
            body: bodyParams.toString(),
        });

        const result = await response.json();

        if (!response.ok) {
            console.error('Twilio API error:', result);
            return new Response(
                JSON.stringify({ error: 'Failed to send SMS', details: result }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
        }

        console.log(`OTP sent successfully to ${phone} via Twilio`, result);

        return new Response(
            JSON.stringify({ success: true, messageId: result.sid }),
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
