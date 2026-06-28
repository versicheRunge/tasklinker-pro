// send-push — Supabase Edge Function
//
// Sends a Web Push notification to one user or all users.
//
// Deploy: supabase functions deploy send-push --no-verify-jwt
//
// Required Supabase secrets:
//   VAPID_SUBJECT   — e.g. mailto:admin@youragency.de
//   VAPID_PUBLIC_KEY
//   VAPID_PRIVATE_KEY
//
// POST body:
//   { user_id?: string, title: string, body?: string, url?: string, tag?: string }
//   Omit user_id to send to all subscribed users.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });

  try {
    const body = await req.json();
    const { user_id, title, body: msgBody, url = "/", tag = "tasklinker" } = body;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const query = supabase.from("push_subscriptions").select("*");
    if (user_id) query.eq("user_id", user_id);

    const { data: subs } = await query;
    if (!subs?.length) return json({ sent: 0 });

    const vapidPublic = Deno.env.get("VAPID_PUBLIC_KEY")!;
    const vapidPrivate = Deno.env.get("VAPID_PRIVATE_KEY")!;
    const vapidSubject = Deno.env.get("VAPID_SUBJECT") ?? "mailto:admin@tasklinker.app";

    const payload = JSON.stringify({ title, body: msgBody, url, tag });
    let sent = 0;

    for (const sub of subs) {
      try {
        await sendWebPush(
          { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
          payload,
          { subject: vapidSubject, publicKey: vapidPublic, privateKey: vapidPrivate }
        );
        sent++;
      } catch (e: any) {
        // Remove stale subscriptions (410 Gone)
        if (e.status === 410 || e.status === 404) {
          await supabase.from("push_subscriptions").delete().eq("id", sub.id);
        }
      }
    }

    return json({ sent });
  } catch (e: any) {
    return json({ error: e.message }, 500);
  }
});

// ─── Web Push implementation ─────────────────────────────────────────────────

interface Subscription { endpoint: string; p256dh: string; auth: string; }
interface VapidKeys { subject: string; publicKey: string; privateKey: string; }

async function sendWebPush(sub: Subscription, payload: string, vapid: VapidKeys) {
  const audience = new URL(sub.endpoint).origin;
  const vapidToken = await buildVapidJwt(audience, vapid);

  // Encrypt payload
  const encrypted = await encryptPayload(payload, sub.p256dh, sub.auth);

  const resp = await fetch(sub.endpoint, {
    method: "POST",
    headers: {
      Authorization: `vapid t=${vapidToken.token},k=${vapid.publicKey}`,
      "Content-Type": "application/octet-stream",
      "Content-Encoding": "aes128gcm",
      TTL: "86400",
    },
    body: encrypted,
  });

  if (!resp.ok && resp.status !== 201) {
    const err: any = new Error(`Push failed: ${resp.status}`);
    err.status = resp.status;
    throw err;
  }
}

async function buildVapidJwt(audience: string, vapid: VapidKeys) {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ typ: "JWT", alg: "ES256" }));
  const payload = b64url(JSON.stringify({ aud: audience, exp: now + 43200, sub: vapid.subject }));
  const sigInput = `${header}.${payload}`;

  const keyBytes = b64urlDecode(vapid.privateKey);
  const key = await crypto.subtle.importKey(
    "pkcs8",
    toPkcs8(keyBytes),
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, key, enc(sigInput));
  return { token: `${sigInput}.${b64urlBytes(new Uint8Array(sig))}` };
}

async function encryptPayload(payload: string, p256dhB64: string, authB64: string): Promise<Uint8Array> {
  const p256dh = b64urlDecode(p256dhB64);
  const auth = b64urlDecode(authB64);

  // Server ephemeral ECDH key pair
  const serverKey = await crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, ["deriveBits"]);
  const serverPublicRaw = new Uint8Array(await crypto.subtle.exportKey("raw", serverKey.publicKey));

  // Client public key
  const clientKey = await crypto.subtle.importKey("raw", p256dh, { name: "ECDH", namedCurve: "P-256" }, false, []);

  // ECDH shared secret
  const sharedBits = new Uint8Array(await crypto.subtle.deriveBits({ name: "ECDH", public: clientKey }, serverKey.privateKey, 256));

  // Salt
  const salt = crypto.getRandomValues(new Uint8Array(16));

  // PRK (HKDF extract)
  const ikm = await hkdf(auth, sharedBits, info("WebPush: info\0", p256dh, serverPublicRaw), 32);
  const cek = await hkdf(salt, ikm, "Content-Encoding: aes128gcm\0", 16);
  const nonce = await hkdf(salt, ikm, "Content-Encoding: nonce\0", 12);

  const aesKey = await crypto.subtle.importKey("raw", cek, "AES-GCM", false, ["encrypt"]);
  const plaintext = enc(payload);
  const padded = new Uint8Array(plaintext.length + 1);
  padded.set(plaintext);
  padded[plaintext.length] = 2; // padding delimiter

  const ciphertext = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce }, aesKey, padded));

  // aes128gcm record: salt(16) + rs(4) + keylen(1) + serverPublicKey(65) + ciphertext
  const rs = new Uint8Array(4);
  new DataView(rs.buffer).setUint32(0, 4096, false);
  const result = new Uint8Array(16 + 4 + 1 + 65 + ciphertext.length);
  let offset = 0;
  result.set(salt, offset); offset += 16;
  result.set(rs, offset); offset += 4;
  result[offset++] = 65;
  result.set(serverPublicRaw, offset); offset += 65;
  result.set(ciphertext, offset);
  return result;
}

async function hkdf(salt: Uint8Array | string, ikm: Uint8Array, info: Uint8Array | string, len: number): Promise<Uint8Array> {
  const saltBytes = typeof salt === "string" ? enc(salt) : salt;
  const infoBytes = typeof info === "string" ? enc(info) : info;
  const key = await crypto.subtle.importKey("raw", ikm, "HKDF", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "HKDF", hash: "SHA-256", salt: saltBytes, info: infoBytes }, key, len * 8);
  return new Uint8Array(bits);
}

function info(label: string, clientKey: Uint8Array, serverKey: Uint8Array): Uint8Array {
  const enc_ = new TextEncoder().encode(label);
  const out = new Uint8Array(enc_.length + 1 + 2 + clientKey.length + 2 + serverKey.length);
  let o = 0;
  out.set(enc_, o); o += enc_.length;
  out[o++] = 0; // \0 already in label string
  new DataView(out.buffer).setUint16(o, clientKey.length, false); o += 2;
  out.set(clientKey, o); o += clientKey.length;
  new DataView(out.buffer).setUint16(o, serverKey.length, false); o += 2;
  out.set(serverKey, o);
  return out;
}

function toPkcs8(rawPrivate: Uint8Array): Uint8Array {
  // Wrap raw 32-byte P-256 private key in PKCS#8 DER envelope
  const oidP256 = new Uint8Array([0x06, 0x08, 0x2a, 0x86, 0x48, 0xce, 0x3d, 0x03, 0x01, 0x07]);
  const oidEc  = new Uint8Array([0x06, 0x07, 0x2a, 0x86, 0x48, 0xce, 0x3d, 0x02, 0x01]);
  const ecKey  = new Uint8Array([0x30, 0x31, 0x02, 0x01, 0x01, 0x04, 0x20, ...rawPrivate, 0xa0, 0x0a, ...oidP256]);
  const algId  = new Uint8Array([0x30, oidEc.length + oidP256.length + 4, ...oidEc, 0x30, oidP256.length + 2, ...oidP256]);
  // Fix: use proper AlgorithmIdentifier
  const algSeq = new Uint8Array([0x30, oidEc.length + 2 + oidP256.length + 2,
    ...oidEc, 0x30, oidP256.length, ...oidP256]);
  const octet = new Uint8Array([0x04, ecKey.length, ...ecKey]);
  const inner = new Uint8Array([...algSeq, ...octet]);
  return new Uint8Array([0x30, inner.length + 4, 0x02, 0x01, 0x00, ...inner]);
}

const enc = (s: string) => new TextEncoder().encode(s);
const b64url = (s: string) => btoa(s).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
const b64urlBytes = (b: Uint8Array) => btoa(String.fromCharCode(...b)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
const b64urlDecode = (s: string) => {
  const pad = "=".repeat((4 - (s.length % 4)) % 4);
  return Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/") + pad), c => c.charCodeAt(0));
};
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), {
  status, headers: { ...CORS, "Content-Type": "application/json" },
});
