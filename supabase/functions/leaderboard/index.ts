import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  try {
    const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '')
    const url = new URL(req.url)
    const limit = parseInt(url.searchParams.get('limit') ?? '20')
    const userId = url.searchParams.get('user_id')
    let scenarioId = url.searchParams.get('scenario_id')
    if (!scenarioId) {
      const today = new Date().toISOString().split('T')[0]
      const { data: s } = await supabase.from('scenarios').select('id').eq('play_date', today).single()
      scenarioId = s?.id ?? null
    }
    if (!scenarioId) return new Response(JSON.stringify({ error: 'No scenario found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    const { data: results } = await supabase.from('play_results').select('survival_days, iq_delta, time_taken_seconds, chosen_items, user_id, users(display_name, avatar_emoji)').eq('scenario_id', scenarioId).eq('is_guest', false).order('survival_days', { ascending: false }).order('time_taken_seconds', { ascending: true }).limit(limit)
    const leaderboard = (results ?? []).map((r: any, i: number) => ({ rank: i + 1, display_name: r.users?.display_name ?? 'Anonymous', avatar_emoji: r.users?.avatar_emoji ?? '🧑', survival_days: r.survival_days, iq_delta: r.iq_delta, time_taken_seconds: r.time_taken_seconds, chosen_items: r.chosen_items }))
    const { count: total } = await supabase.from('play_results').select('*', { count: 'exact', head: true }).eq('scenario_id', scenarioId).eq('is_guest', false)
    let userRank = null
    if (userId) {
      const { data: ur } = await supabase.from('play_results').select('survival_days, time_taken_seconds').eq('scenario_id', scenarioId).eq('user_id', userId).single()
      if (ur) {
        const { count: bc } = await supabase.from('play_results').select('*', { count: 'exact', head: true }).eq('scenario_id', scenarioId).eq('is_guest', false).or(`survival_days.gt.${ur.survival_days},and(survival_days.eq.${ur.survival_days},time_taken_seconds.lt.${ur.time_taken_seconds})`)
        userRank = (bc ?? 0) + 1
      }
    }
    return new Response(JSON.stringify({ leaderboard, user_rank: userRank, total_players: total ?? 0 }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
