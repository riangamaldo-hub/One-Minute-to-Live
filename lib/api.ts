import { FUNCTIONS_URL, SUPABASE_ANON_KEY } from '@/lib/supabase';
import type {
  TodayScenarioResponse,
  SubmitPlayParams,
  SubmitPlayResponse,
  LeaderboardResponse,
  UserUpsert,
  User,
} from '@/types/game';

const headers = {
  'Content-Type': 'application/json',
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
};

export async function getTodayScenario(userId?: string): Promise<TodayScenarioResponse> {
  const url = userId
    ? `${FUNCTIONS_URL}/today-scenario?user_id=${encodeURIComponent(userId)}`
    : `${FUNCTIONS_URL}/today-scenario`;
  console.log('[API] getTodayScenario', { userId, url });
  const response = await fetch(url, { headers });
  if (!response.ok) {
    const text = await response.text();
    console.error('[API] getTodayScenario error', response.status, text);
    throw new Error(`Failed to fetch scenario: ${response.status}`);
  }
  const data = await response.json();
  console.log('[API] getTodayScenario success', { scenarioId: data.scenario?.id, alreadyPlayed: data.already_played });
  return data;
}

export async function submitPlay(params: SubmitPlayParams): Promise<SubmitPlayResponse> {
  console.log('[API] submitPlay', params);
  const response = await fetch(`${FUNCTIONS_URL}/submit-play`, {
    method: 'POST',
    headers,
    body: JSON.stringify(params),
  });
  if (!response.ok) {
    const text = await response.text();
    console.error('[API] submitPlay error', response.status, text);
    throw new Error(`Failed to submit play: ${response.status}`);
  }
  const data = await response.json();
  console.log('[API] submitPlay success', data.result);
  return data;
}

export async function getLeaderboard(userId?: string): Promise<LeaderboardResponse> {
  const url = userId
    ? `${FUNCTIONS_URL}/leaderboard?user_id=${encodeURIComponent(userId)}`
    : `${FUNCTIONS_URL}/leaderboard`;
  console.log('[API] getLeaderboard', { userId });
  const response = await fetch(url, { headers });
  if (!response.ok) {
    const text = await response.text();
    console.error('[API] getLeaderboard error', response.status, text);
    throw new Error(`Failed to fetch leaderboard: ${response.status}`);
  }
  const data = await response.json();
  console.log('[API] getLeaderboard success', { totalPlayers: data.total_players, userRank: data.user_rank });
  return data;
}

export async function upsertUser(user: UserUpsert): Promise<User> {
  console.log('[API] upsertUser', { id: user.id, displayName: user.display_name });
  const response = await fetch(`${FUNCTIONS_URL}/manage-user`, {
    method: 'POST',
    headers,
    body: JSON.stringify(user),
  });
  if (!response.ok) {
    const text = await response.text();
    console.error('[API] upsertUser error', response.status, text);
    throw new Error(`Failed to upsert user: ${response.status}`);
  }
  const data = await response.json();
  console.log('[API] upsertUser success', { id: data.id });
  return data;
}
