import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  try {
    const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '')
    const { scenario_id, chosen_items, time_taken_seconds, user_id } = await req.json()
    if (!scenario_id || !Array.isArray(chosen_items) || chosen_items.length !== 3) {
      return new Response(JSON.stringify({ error: 'scenario_id and chosen_items (array of 3) required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
    const sortedItems = [...chosen_items].sort()
    const { data: rules } = await supabase.from('outcome_rules').select('*').eq('scenario_id', scenario_id)
    let matchedRule = null
    for (const rule of (rules ?? [])) {
      const rc = [...rule.item_combo].sort()
      if (rc.every((item: string, i: number) => item === sortedItems[i])) { matchedRule = rule; break }
    }
    const survivalDays = matchedRule?.survival_days ?? 5
    const iqDelta = matchedRule?.iq_delta ?? -10
    const outcomeText = matchedRule?.outcome_text ?? 'A bold but unconventional choice. You survived longer than expected... barely.'
    const reactionEmoji = matchedRule?.reaction_emoji ?? '😅'
    const outcomeRuleId = matchedRule?.id ?? null
    if (user_id) {
      await supabase.from('play_results').upsert({ user_id, scenario_id, chosen_items: sortedItems, outcome_rule_id: outcomeRuleId, survival_days: survivalDays, iq_delta: iqDelta, time_taken_seconds: time_taken_seconds ?? 60, is_guest: false }, { onConflict: 'user_id,scenario_id' })
      const { data: user } = await supabase.from('users').select('survival_iq, streak_count, last_played_date').eq('id', user_id).single()
      if (user) {
        const today = new Date().toISOString().split('T')[0]
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
        await supabase.from('users').update({ survival_iq: Math.max(0, user.survival_iq + iqDelta), streak_count: user.last_played_date === yesterday ? user.streak_count + 1 : 1, last_played_date: today }).eq('id', user_id)
      }
    }
    const { data: allResults } = await supabase.from('play_results').select('survival_days').eq('scenario_id', scenario_id).eq('is_guest', false)
    const total = allResults?.length ?? 0
    const below = allResults?.filter((r: { survival_days: number }) => r.survival_days < survivalDays).length ?? 0
    const percentile = total > 0 ? Math.round((below / total) * 100) : 50
    const { data: better } = await supabase.from('play_results').select('id').eq('scenario_id', scenario_id).eq('is_guest', false).gt('survival_days', survivalDays)
    return new Response(JSON.stringify({ result: { survival_days: survivalDays, iq_delta: iqDelta, outcome_text: outcomeText, reaction_emoji: reactionEmoji, percentile, rank: (better?.length ?? 0) + 1, total_players: total } }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
