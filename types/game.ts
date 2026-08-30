export interface ScenarioItem {
  id: string;
  name: string;
  emoji: string;
  description: string;
}

export interface Scenario {
  id: string;
  day_number: number;
  play_date: string;
  title: string;
  flavor_text: string;
  timer_seconds: number;
  item_options: ScenarioItem[];
}

export interface PlayResult {
  survival_days: number;
  iq_delta: number;
  outcome_text: string;
  reaction_emoji: string;
  percentile: number;
  rank: number;
  total_players: number;
}

export interface LeaderboardEntry {
  rank: number;
  display_name: string;
  avatar_emoji: string;
  survival_days: number;
  iq_delta: number;
  time_taken_seconds: number;
  chosen_items: string[];
}

export interface TodayScenarioResponse {
  scenario: Scenario;
  already_played: boolean;
  user_result: {
    survival_days: number;
    iq_delta: number;
    time_taken_seconds: number;
    chosen_items: string[];
    outcome_rules?: {
      outcome_text: string;
      reaction_emoji: string;
    };
  } | null;
}

export interface SubmitPlayParams {
  scenario_id: string;
  chosen_items: string[];
  time_taken_seconds: number;
  user_id?: string;
  display_name?: string;
  avatar_emoji?: string;
  avatar_data?: AvatarData;
}

export interface SubmitPlayResponse {
  result: PlayResult;
}

export interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[];
  user_rank: number | null;
  total_players: number;
}

export interface UserUpsert {
  id: string;
  display_name: string;
  avatar_emoji?: string;
}

export interface User {
  id: string;
  display_name: string;
  avatar_emoji: string;
  survival_iq: number;
  streak_count: number;
  last_played_date: string | null;
  total_plays?: number;
  best_survival_days?: number;
}

export interface AvatarData {
  gender: 'male' | 'female';
  skinTone: string;
  hairStyle: number;
  hairColor: string;
  eyeStyle: number;
  noseStyle: number;
  mouthStyle: number;
  eyebrowStyle: number;
  eyelashStyle: number;
  facialHairStyle: number;
  shirtStyle: number;
  pantsStyle: number;
  shoeStyle: number;
}
