import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  try {
    const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '')
    const today = new Date().toISOString().split('T')[0]
    const { data: scenario, error } = await supabase.from('scenarios').select('*').eq('play_date', today).single()
    if (error || !scenario) {
      return new Response(JSON.stringify({ error: 'No scenario available for today' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
    const url = new URL(req.url)
    const userId = url.searchParams.get('user_id')
    let alreadyPlayed = false
    let userResult = null
    if (userId) {
      const { data: existing } = await supabase.from('play_results').select('*, outcome_rules(outcome_text, reaction_emoji)').eq('user_id', userId).eq('scenario_id', scenario.id).single()
      if (existing) { alreadyPlayed = true; userResult = existing }
    }
    return new Response(JSON.stringify({ scenario, already_played: alreadyPlayed, user_result: userResult }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
