// calendar-proxy — Supabase Edge Function
//
// GET  → reads events from Google Calendar (requires calendar.events scope)
// POST → creates an event on Google Calendar
//
// Deploy: supabase functions deploy calendar-proxy --no-verify-jwt
//
// Required agency_settings rows:
//   gcal_service_account  — full service account JSON (server-side only)
//   gcal_calendar_id      — e.g. xxx@group.calendar.google.com
//
// Calendar sharing: service account email needs "Make changes to events" permission.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: rows } = await supabase
      .from("agency_settings")
      .select("key, value")
      .in("key", ["gcal_service_account", "gcal_calendar_id"]);

    const cfg: Record<string, string> = {};
    rows?.forEach((r: any) => { cfg[r.key] = r.value; });

    if (!cfg.gcal_service_account || !cfg.gcal_calendar_id) {
      return json({ error: "Kalender nicht konfiguriert" }, 400);
    }

    let sa: any;
    try {
      sa = JSON.parse(cfg.gcal_service_account);
    } catch {
      return json({ error: "Ungültiges Service-Account-JSON" }, 400);
    }

    if (sa.type !== "service_account" || !sa.private_key || !sa.client_email) {
      return json({ error: "JSON enthält kein gültiges Service-Account" }, 400);
    }

    const accessToken = await getAccessToken(sa);
    const calId = encodeURIComponent(cfg.gcal_calendar_id);

    // ── POST: create event ──────────────────────────────────────────────────
    if (req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      const { action, event } = body;

      if (action === "createEvent" && event) {
        const evResp = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/${calId}/events`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(event),
          }
        );
        const evData = await evResp.json();
        if (!evResp.ok) {
          return json({ error: evData?.error?.message ?? `HTTP ${evResp.status}` }, evResp.status);
        }
        return json(evData);
      }

      if (action === "deleteEvent" && body.eventId) {
        const delResp = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/${calId}/events/${body.eventId}`,
          { method: "DELETE", headers: { Authorization: `Bearer ${accessToken}` } }
        );
        return new Response(null, { status: delResp.status, headers: CORS });
      }

      return json({ error: "Unbekannte action" }, 400);
    }

    // ── GET: read events ────────────────────────────────────────────────────
    const now = new Date();
    const tMin = new Date(now.getFullYear(), now.getMonth() - 2, 1).toISOString();
    const tMax = new Date(now.getFullYear(), now.getMonth() + 6, 0).toISOString();

    const evResp = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${calId}/events` +
        `?timeMin=${tMin}&timeMax=${tMax}&singleEvents=true&orderBy=startTime&maxResults=500`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    const evData = await evResp.json();
    if (!evResp.ok) {
      return json({ error: evData?.error?.message ?? `HTTP ${evResp.status}` }, evResp.status);
    }

    return json(evData);
  } catch (e: any) {
    return json({ error: e?.message ?? "Interner Fehler" }, 500);
  }
});

// ─── Google Service Account JWT auth ────────────────────────────────────────

async function getAccessToken(sa: any): Promise<string> {
  const now = Math.floor(Date.now() / 1000);

  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = b64url(
    JSON.stringify({
      iss: sa.client_email,
      // calendar.events scope allows both reading and creating/editing events
      scope: "https://www.googleapis.com/auth/calendar.events",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    })
  );

  const sigInput = `${header}.${payload}`;

  const pem = (sa.private_key as string)
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s+/g, "");

  const keyBuf = Uint8Array.from(atob(pem), (c) => c.charCodeAt(0));

  const key = await crypto.subtle.importKey(
    "pkcs8",
    keyBuf,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const sigBuf = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(sigInput)
  );

  const jwt = `${sigInput}.${b64urlBytes(new Uint8Array(sigBuf))}`;

  const tokenResp = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  const tokenData = await tokenResp.json();
  if (!tokenData.access_token) {
    throw new Error(
      `Token-Fehler: ${tokenData.error_description ?? tokenData.error ?? JSON.stringify(tokenData)}`
    );
  }
  return tokenData.access_token;
}

// ─── helpers ────────────────────────────────────────────────────────────────

function b64url(str: string) {
  return btoa(str).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}
function b64urlBytes(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}
function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}
