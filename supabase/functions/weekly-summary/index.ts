// weekly-summary — Supabase Edge Function
//
// Sends a weekly push notification to every user with a summary of:
//   - Offene WVL diese Woche
//   - Überfällige Aufgaben
//   - Wer ist diese Woche im Urlaub
//
// Deploy: supabase functions deploy weekly-summary --no-verify-jwt
//
// Schedule via Supabase Dashboard → Edge Functions → Schedules
// or via SQL: see migration 025_weekly_summary_cron.sql

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const today = new Date();
  const weekEnd = new Date(today);
  weekEnd.setDate(today.getDate() + 7);

  const todayStr    = today.toISOString().slice(0, 10);
  const weekEndStr  = weekEnd.toISOString().slice(0, 10);

  // All users with push subscriptions
  const { data: subs } = await supabase
    .from("push_subscriptions")
    .select("user_id")
    .then(r => ({ data: [...new Set(r.data?.map((s: any) => s.user_id) ?? [])] }));

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  let totalSent = 0;

  for (const userId of subs as string[]) {
    // WVL this week
    const { data: wvl } = await supabase
      .from("cases")
      .select("id, title, customer_name, follow_up_date")
      .eq("assignee_id", userId)
      .eq("archived", false)
      .neq("status", "completed")
      .gte("follow_up_date", todayStr)
      .lte("follow_up_date", weekEndStr);

    // Overdue tasks
    const { data: tasks } = await supabase
      .from("user_tasks")
      .select("id, title, due_date")
      .eq("user_id", userId)
      .eq("completed", false)
      .lt("due_date", todayStr)
      .not("due_date", "is", null);

    // Vacations this week (team-wide)
    const { data: vacations } = await supabase
      .from("calendar_events")
      .select("title, user_id")
      .eq("type", "absence")
      .lte("start_time", weekEndStr)
      .gte("end_time", todayStr);

    const wvlCount   = wvl?.length ?? 0;
    const taskCount  = tasks?.length ?? 0;
    const vacCount   = vacations?.length ?? 0;

    if (wvlCount === 0 && taskCount === 0) continue; // nothing to report

    const lines: string[] = [];
    if (wvlCount > 0)  lines.push(`📋 ${wvlCount} Wiedervorlage${wvlCount > 1 ? "n" : ""} diese Woche`);
    if (taskCount > 0) lines.push(`⚠️ ${taskCount} überfällige Aufgabe${taskCount > 1 ? "n" : ""}`);
    if (vacCount > 0)  lines.push(`🏖 ${vacCount} Kolleg${vacCount > 1 ? "en" : "e"} im Urlaub`);

    await fetch(`${supabaseUrl}/functions/v1/send-push`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
      },
      body: JSON.stringify({
        user_id: userId,
        title: "📊 Wochenübersicht TaskLinker",
        body: lines.join(" · "),
        url: "/",
        tag: "weekly-summary",
      }),
    });
    totalSent++;
  }

  return new Response(JSON.stringify({ ok: true, sent: totalSent }), {
    headers: { ...CORS, "Content-Type": "application/json" },
  });
});
