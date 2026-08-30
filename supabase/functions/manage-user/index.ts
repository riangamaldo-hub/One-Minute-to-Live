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
    const parts = url.pathname.split('/').filter(Boolean)
    const userId = parts[parts.length - 1] !== 'manage-user' ? parts[parts.length - 1] : null
    if (req.method === 'GET' && userId) {
      const { data: user, error } = await supabase.from('users').select('*').eq('id', userId).single()
      if (error || !user) return new Response(JSON.stringify({ error: 'User not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      const { count: totalPlays } = await supabase.from('play_results').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('is_guest', false)
      const { data: best } = await supabase.from('play_results').select('survival_days').eq('user_id', userId).eq('is_guest', false).order('survival_days', { ascending: false }).limit(1).single()
      return new Response(JSON.stringify({ user: { ...user, total_plays: totalPlays ?? 0, best_survival_days: best?.survival_days ?? 0 } }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
    if (req.method === 'POST') {
      const { id, display_name, avatar_emoji } = await req.json()
      if (!id || !display_name) return new Response(JSON.stringify({ error: 'id and display_name required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      const { data: user, error } = await supabase.from('users').upsert({ id, display_name, avatar_emoji: avatar_emoji ?? '🧑' }, { onConflict: 'id' }).select().single()
      if (error) throw error
      return new Response(JSON.stringify(user), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
