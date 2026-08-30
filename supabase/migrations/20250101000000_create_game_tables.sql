CREATE TABLE IF NOT EXISTS scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_number INTEGER NOT NULL UNIQUE,
  play_date DATE NOT NULL UNIQUE,
  title TEXT NOT NULL,
  flavor_text TEXT NOT NULL,
  timer_seconds INTEGER NOT NULL DEFAULT 60,
  item_options JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS outcome_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id UUID NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
  item_combo TEXT[] NOT NULL,
  survival_days INTEGER NOT NULL,
  iq_delta INTEGER NOT NULL,
  outcome_text TEXT NOT NULL,
  reaction_emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_outcome_rules_scenario ON outcome_rules(scenario_id);

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name TEXT NOT NULL,
  avatar_emoji TEXT NOT NULL DEFAULT '🧑',
  survival_iq INTEGER NOT NULL DEFAULT 1000,
  streak_count INTEGER NOT NULL DEFAULT 0,
  last_played_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS play_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  scenario_id UUID NOT NULL REFERENCES scenarios(id),
  chosen_items TEXT[] NOT NULL,
  outcome_rule_id UUID REFERENCES outcome_rules(id),
  survival_days INTEGER NOT NULL,
  iq_delta INTEGER NOT NULL,
  time_taken_seconds INTEGER NOT NULL,
  is_guest BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, scenario_id)
);
CREATE INDEX IF NOT EXISTS idx_play_results_scenario ON play_results(scenario_id);
CREATE INDEX IF NOT EXISTS idx_play_results_user ON play_results(user_id);

ALTER TABLE scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE outcome_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE play_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "scenarios_public_read" ON scenarios FOR SELECT USING (true);
CREATE POLICY "outcome_rules_public_read" ON outcome_rules FOR SELECT USING (true);
CREATE POLICY "users_public_read" ON users FOR SELECT USING (true);
CREATE POLICY "users_self_insert" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "users_self_update" ON users FOR UPDATE USING (true);
CREATE POLICY "play_results_public_read" ON play_results FOR SELECT USING (true);
CREATE POLICY "play_results_insert" ON play_results FOR INSERT WITH CHECK (true);
CREATE POLICY "play_results_update" ON play_results FOR UPDATE USING (true);

DO $$
DECLARE
  s1_id UUID; s2_id UUID; s3_id UUID; s4_id UUID; s5_id UUID; s6_id UUID; s7_id UUID;
BEGIN

INSERT INTO scenarios (day_number, play_date, title, flavor_text, timer_seconds, item_options)
VALUES (1, CURRENT_DATE, 'Desert Island Crash', 'Your plane just crashed. You have 60 seconds to grab 3 items before the wreckage sinks.', 60,
'[{"id":"knife","name":"Swiss Army Knife","emoji":"🔪","description":"Multi-tool with blade, saw, and more"},{"id":"water","name":"Water Purifier","emoji":"💧","description":"Filters up to 1000L of water"},{"id":"fire","name":"Waterproof Matches","emoji":"🔥","description":"100 matches, works in rain"},{"id":"phone","name":"Satellite Phone","emoji":"📡","description":"Works anywhere on Earth"},{"id":"first_aid","name":"First Aid Kit","emoji":"🩹","description":"Full trauma kit"},{"id":"tarp","name":"Emergency Tarp","emoji":"⛺","description":"Shelter and signaling"}]'::jsonb
) RETURNING id INTO s1_id;

INSERT INTO outcome_rules (scenario_id, item_combo, survival_days, iq_delta, outcome_text, reaction_emoji) VALUES
(s1_id, ARRAY['fire','knife','water'], 12, 20, 'Classic survival trio. You built a fire, purified water, and fashioned a spear. Rescue found you on day 12, sunburned but smug.', '🏆'),
(s1_id, ARRAY['knife','phone','water'], 14, 25, 'You called for help immediately and survived on coconuts until day 14. The rescue team was impressed by your calm.', '📡'),
(s1_id, ARRAY['first_aid','knife','water'], 10, 15, 'Solid choices. You treated your wounds, stayed hydrated, and used the knife for everything. Day 10 rescue.', '🩹'),
(s1_id, ARRAY['knife','tarp','water'], 11, 18, 'Smart shelter + water combo. The tarp kept you dry through two storms. Rescued day 11.', '⛺'),
(s1_id, ARRAY['fire','knife','phone'], 13, 22, 'You called for help AND built a signal fire. Double rescue beacon. Day 13.', '🔥'),
(s1_id, ARRAY['fire','first_aid','knife'], 9, 12, 'Fire and first aid kept you alive but you ran out of clean water. Day 9 rescue, slightly delirious.', '😅'),
(s1_id, ARRAY['fire','knife','tarp'], 10, 15, 'Shelter + fire + knife. You were basically glamping. Day 10 rescue.', '🏕️'),
(s1_id, ARRAY['first_aid','knife','phone'], 12, 20, 'Called for help, patched yourself up, used the knife for food. Day 12 rescue.', '📞'),
(s1_id, ARRAY['knife','phone','tarp'], 11, 17, 'Shelter + communication + knife. You were comfortable enough to be picky about your rescue window.', '🏠'),
(s1_id, ARRAY['first_aid','knife','tarp'], 8, 10, 'Solid survival kit but no water source. You got lucky with rain. Day 8 rescue, mildly dehydrated.', '💦'),
(s1_id, ARRAY['fire','phone','water'], 13, 22, 'Hydrated, warm, and connected. You basically threw a beach party until rescue arrived day 13.', '🎉'),
(s1_id, ARRAY['fire','first_aid','water'], 9, 12, 'Healthy and hydrated but no shelter. Sunburn got you. Day 9 rescue.', '☀️'),
(s1_id, ARRAY['fire','tarp','water'], 11, 18, 'The holy trinity of comfort survival. Day 11 rescue, you were almost disappointed to leave.', '😎'),
(s1_id, ARRAY['first_aid','phone','water'], 12, 20, 'Called for help, stayed healthy, drank clean water. Day 12 rescue. Textbook.', '📚'),
(s1_id, ARRAY['phone','tarp','water'], 13, 22, 'Comfortable and connected. You live-tweeted your rescue. Day 13.', '📱'),
(s1_id, ARRAY['first_aid','tarp','water'], 8, 10, 'Healthy and sheltered but no fire or communication. Day 8 rescue, very hungry.', '🍽️'),
(s1_id, ARRAY['fire','first_aid','phone'], 11, 17, 'Signal fire + phone = double rescue beacon. Day 11 rescue.', '🚁'),
(s1_id, ARRAY['fire','phone','tarp'], 12, 20, 'Warm, sheltered, and connected. Day 12 rescue. You wrote a memoir outline.', '✍️'),
(s1_id, ARRAY['fire','first_aid','tarp'], 7, 8, 'Comfortable but no water source. Dehydration set in day 5. Day 7 rescue, barely.', '😰'),
(s1_id, ARRAY['first_aid','phone','tarp'], 6, 5, 'You called for help immediately but the battery died. Sheltered and patched up, you waited. Day 6 rescue.', '🔋');

INSERT INTO scenarios (day_number, play_date, title, flavor_text, timer_seconds, item_options)
VALUES (2, CURRENT_DATE + INTERVAL '1 day', 'Zombie Apocalypse Supermarket', 'The dead walk. You have 60 seconds in a ransacked supermarket before the horde arrives. Grab 3 things.', 60,
'[{"id":"bat","name":"Baseball Bat","emoji":"🏏","description":"Solid aluminum, great for skulls"},{"id":"canned_food","name":"Canned Food","emoji":"🥫","description":"12 cans of assorted beans and spam"},{"id":"rope","name":"Climbing Rope","emoji":"🪢","description":"30m, rated for 300kg"},{"id":"bike","name":"Mountain Bike","emoji":"🚲","description":"Fast escape, no fuel needed"},{"id":"map","name":"City Map","emoji":"🗺️","description":"Marks all hospitals and safe zones"},{"id":"radio","name":"Hand-Crank Radio","emoji":"📻","description":"Picks up emergency broadcasts"}]'::jsonb
) RETURNING id INTO s2_id;

INSERT INTO outcome_rules (scenario_id, item_combo, survival_days, iq_delta, outcome_text, reaction_emoji) VALUES
(s2_id, ARRAY['bat','bike','map'], 14, 25, 'You biked to the safe zone using the map while batting zombies out of the way. Arrived day 2, became a legend.', '🏆'),
(s2_id, ARRAY['bike','map','radio'], 13, 22, 'Radio told you where to go, map showed you how, bike got you there. Day 13 in a fortified shelter.', '📻'),
(s2_id, ARRAY['bat','canned_food','map'], 10, 15, 'You found the safe zone on day 3 and had enough food to barter your way in. Day 10 survivor.', '🗺️'),
(s2_id, ARRAY['bike','canned_food','map'], 12, 20, 'Fed and mobile with a destination. You made it to the military checkpoint on day 12.', '🚲'),
(s2_id, ARRAY['bat','bike','radio'], 13, 22, 'Radio guided you to safety while the bat cleared the path. Day 13, slightly exhausted.', '🎯'),
(s2_id, ARRAY['bat','bike','canned_food'], 11, 17, 'Fast, fed, and armed. You outran the horde and found a farmhouse. Day 11 survivor.', '🏡'),
(s2_id, ARRAY['bat','map','radio'], 9, 12, 'You knew where to go and had a weapon, but no transport. Walked 40km. Day 9, blisters everywhere.', '🦶'),
(s2_id, ARRAY['bat','map','rope'], 8, 10, 'Climbed to rooftops using the rope and navigated by map. Slow but safe. Day 8 rescue.', '🏗️'),
(s2_id, ARRAY['bat','canned_food','radio'], 9, 12, 'Fed and armed, the radio told you about a rescue convoy. You flagged it down on day 9.', '🚌'),
(s2_id, ARRAY['bat','canned_food','rope'], 7, 8, 'You barricaded a store with rope and ate canned beans for a week. Day 7 rescue, smelling terrible.', '🫘'),
(s2_id, ARRAY['canned_food','map','radio'], 10, 15, 'No weapon, but you knew where to go and had food for the journey. Day 10 arrival at safe zone.', '📡'),
(s2_id, ARRAY['bike','map','rope'], 11, 17, 'Biked to the safe zone, used rope to scale the perimeter wall. Day 11, dramatic entrance.', '🧗'),
(s2_id, ARRAY['bike','radio','rope'], 10, 15, 'Radio guided you, bike moved you, rope got you over obstacles. Day 10 survivor.', '🎪'),
(s2_id, ARRAY['canned_food','radio','rope'], 6, 5, 'You hid in a ceiling crawlspace eating beans and listening to static. Day 6 rescue, slightly insane.', '😵'),
(s2_id, ARRAY['bike','canned_food','radio'], 12, 20, 'Mobile, fed, and informed. You found the survivor camp on day 12 with food to spare.', '🏕️'),
(s2_id, ARRAY['canned_food','map','rope'], 7, 8, 'Navigated to a rooftop safe point using rope and map. Waited for rescue eating cold beans. Day 7.', '🥫'),
(s2_id, ARRAY['bat','radio','rope'], 8, 10, 'Armed and informed, you used rope to barricade a pharmacy. Day 8 rescue convoy found you.', '💊'),
(s2_id, ARRAY['map','radio','rope'], 7, 8, 'You knew where to go but had no weapon or transport. Climbed everything. Day 7, exhausted.', '🧭'),
(s2_id, ARRAY['bat','bike','rope'], 9, 12, 'Fast, armed, and able to scale obstacles. Found a survivor group on day 9.', '🤝'),
(s2_id, ARRAY['bike','canned_food','rope'], 8, 10, 'Mobile and fed, you used rope to cross a collapsed bridge. Day 8 at the safe zone.', '🌉');

INSERT INTO scenarios (day_number, play_date, title, flavor_text, timer_seconds, item_options)
VALUES (3, CURRENT_DATE + INTERVAL '2 days', 'Sinking Ship', 'The Titanic 2.0 is going down. You have 60 seconds before the deck tilts past 45 degrees. Grab 3 things.', 60,
'[{"id":"life_vest","name":"Life Vest","emoji":"🦺","description":"Keeps you afloat for 24 hours"},{"id":"flare","name":"Signal Flare","emoji":"🚨","description":"Visible for 30km, burns 60 seconds"},{"id":"rope","name":"Safety Rope","emoji":"🪢","description":"50m, rated for 500kg"},{"id":"knife","name":"Dive Knife","emoji":"🔪","description":"Cuts rope, nets, and seatbelts"},{"id":"water_bottle","name":"Water Bottle","emoji":"💧","description":"2L insulated, keeps water cold"},{"id":"whistle","name":"Emergency Whistle","emoji":"📯","description":"Heard for 2km, works when wet"}]'::jsonb
) RETURNING id INTO s3_id;

INSERT INTO outcome_rules (scenario_id, item_combo, survival_days, iq_delta, outcome_text, reaction_emoji) VALUES
(s3_id, ARRAY['flare','life_vest','rope'], 14, 25, 'You floated safely, tied yourself to debris, and fired the flare at the rescue helicopter. Day 14, hero of the sea.', '🚁'),
(s3_id, ARRAY['flare','life_vest','whistle'], 13, 22, 'Afloat, signaling visually and audibly. Coast guard found you in 6 hours. Day 13 in a warm hospital.', '🏥'),
(s3_id, ARRAY['flare','knife','life_vest'], 12, 20, 'Cut free from debris, floated safely, fired flare. Day 12 rescue. The knife saved your leg.', '🔪'),
(s3_id, ARRAY['life_vest','rope','whistle'], 11, 17, 'Tied yourself to a lifeboat, whistled until rescued. Day 11, voice permanently hoarse.', '📯'),
(s3_id, ARRAY['flare','life_vest','water_bottle'], 12, 20, 'Hydrated and visible. You floated for 3 days before the flare brought rescue. Day 12.', '💧'),
(s3_id, ARRAY['flare','rope','whistle'], 10, 15, 'No life vest but you tied yourself to a door and signaled constantly. Day 10 rescue, hypothermic.', '🥶'),
(s3_id, ARRAY['knife','life_vest','rope'], 11, 17, 'Cut free from the sinking ship, floated on debris, used rope to stay attached. Day 11 rescue.', '⚓'),
(s3_id, ARRAY['flare','knife','rope'], 9, 12, 'Cut free and signaled, but no flotation. You clung to a crate for 4 days. Day 9 rescue, barely.', '📦'),
(s3_id, ARRAY['knife','life_vest','whistle'], 10, 15, 'Cut free, floated safely, whistled for rescue. Day 10, the whistle was the MVP.', '🎵'),
(s3_id, ARRAY['life_vest','water_bottle','whistle'], 9, 12, 'Afloat, hydrated, and audibly signaling. Day 9 rescue. The water bottle kept you sane.', '🧠'),
(s3_id, ARRAY['flare','knife','whistle'], 8, 10, 'No flotation but you cut free and signaled aggressively. Day 8 rescue, very cold.', '❄️'),
(s3_id, ARRAY['knife','rope','whistle'], 7, 8, 'Cut free, tied to debris, whistled. No flotation made it rough. Day 7 rescue, hypothermic.', '🌊'),
(s3_id, ARRAY['flare','rope','water_bottle'], 9, 12, 'Tied to debris, hydrated, fired flare. Day 9 rescue. The rope was the real hero.', '🪢'),
(s3_id, ARRAY['knife','rope','water_bottle'], 6, 5, 'Cut free and tied to debris but no signaling. Rescue found you by accident on day 6.', '🍀'),
(s3_id, ARRAY['flare','water_bottle','whistle'], 10, 15, 'Signaling constantly and staying hydrated. Day 10 rescue. No flotation made it terrifying.', '😱'),
(s3_id, ARRAY['rope','water_bottle','whistle'], 7, 8, 'Tied to debris, hydrated, whistling. Day 7 rescue. No flare made it a long wait.', '⏳'),
(s3_id, ARRAY['knife','water_bottle','whistle'], 5, 2, 'Cut free but had no flotation or visual signal. Day 5 rescue, pure luck.', '🎲'),
(s3_id, ARRAY['life_vest','rope','water_bottle'], 8, 10, 'Afloat and tied to debris with water. No signaling made rescue slow. Day 8.', '🛟'),
(s3_id, ARRAY['flare','knife','water_bottle'], 8, 10, 'Cut free, hydrated, fired flare. No flotation but the flare brought fast rescue. Day 8.', '🚨'),
(s3_id, ARRAY['knife','life_vest','water_bottle'], 9, 12, 'Cut free, floated safely, stayed hydrated. No signaling but you were found. Day 9.', '🌅');

INSERT INTO scenarios (day_number, play_date, title, flavor_text, timer_seconds, item_options)
VALUES (4, CURRENT_DATE + INTERVAL '3 days', 'Nuclear Bunker', 'The sirens are wailing. You have 60 seconds to grab 3 things before the blast wave hits. Choose wisely.', 60,
'[{"id":"geiger_counter","name":"Geiger Counter","emoji":"☢️","description":"Detects radiation levels"},{"id":"gas_mask","name":"Gas Mask","emoji":"😷","description":"Filters radiation particles for 72 hours"},{"id":"seeds","name":"Seed Vault","emoji":"🌱","description":"Enough seeds to grow food for years"},{"id":"generator","name":"Hand Generator","emoji":"⚡","description":"Powers lights and radio indefinitely"},{"id":"medicine","name":"Medicine Cabinet","emoji":"💊","description":"Antibiotics, painkillers, radiation pills"},{"id":"books","name":"Survival Library","emoji":"📚","description":"How to rebuild civilization, basically"}]'::jsonb
) RETURNING id INTO s4_id;

INSERT INTO outcome_rules (scenario_id, item_combo, survival_days, iq_delta, outcome_text, reaction_emoji) VALUES
(s4_id, ARRAY['gas_mask','medicine','seeds'], 14, 25, 'Protected from radiation, medicated, and able to grow food. You founded a new civilization. Day 14 of the rest of your life.', '🌍'),
(s4_id, ARRAY['gas_mask','generator','seeds'], 13, 22, 'Power, protection, and food production. You became the most popular person in the bunker. Day 13.', '👑'),
(s4_id, ARRAY['gas_mask','generator','medicine'], 12, 20, 'Protected, powered, and medicated. You kept the bunker running for months. Day 12 of the new world.', '⚡'),
(s4_id, ARRAY['books','gas_mask','seeds'], 12, 20, 'You knew how to grow food and stayed protected. The books made you the bunker teacher. Day 12.', '📚'),
(s4_id, ARRAY['gas_mask','geiger_counter','medicine'], 11, 17, 'You knew when it was safe to leave and stayed healthy. Day 11, first to venture outside.', '☢️'),
(s4_id, ARRAY['gas_mask','geiger_counter','seeds'], 11, 17, 'Protected and able to test soil for planting. Day 11, started the first post-apocalyptic garden.', '🌻'),
(s4_id, ARRAY['gas_mask','geiger_counter','generator'], 10, 15, 'Powered, protected, and monitoring radiation. Day 10, you knew exactly when to emerge.', '🔦'),
(s4_id, ARRAY['books','gas_mask','medicine'], 11, 17, 'Protected, medicated, and educated. You became the bunker doctor. Day 11.', '🩺'),
(s4_id, ARRAY['books','gas_mask','generator'], 10, 15, 'Powered and protected with knowledge. You kept morale high with stories. Day 10.', '📖'),
(s4_id, ARRAY['books','gas_mask','geiger_counter'], 9, 12, 'Protected and informed, you knew when to leave. Day 9, first outside. The books helped you navigate.', '🧭'),
(s4_id, ARRAY['generator','medicine','seeds'], 10, 15, 'No radiation protection but you had power, medicine, and food. Day 10, slightly irradiated but alive.', '🌱'),
(s4_id, ARRAY['books','medicine','seeds'], 9, 12, 'You knew how to grow food and stay healthy, but no radiation protection. Day 9, hair falling out.', '💇'),
(s4_id, ARRAY['books','generator','seeds'], 9, 12, 'Powered and able to grow food with knowledge. Day 9, slightly glowing but productive.', '✨'),
(s4_id, ARRAY['geiger_counter','medicine','seeds'], 8, 10, 'You monitored radiation and stayed medicated while planning your garden. Day 8, cautiously optimistic.', '🌿'),
(s4_id, ARRAY['books','generator','medicine'], 9, 12, 'Powered, medicated, and educated. No radiation protection but you managed. Day 9.', '💡'),
(s4_id, ARRAY['geiger_counter','generator','seeds'], 8, 10, 'Powered and monitoring radiation while planning food production. Day 8, a bit irradiated.', '🔋'),
(s4_id, ARRAY['books','geiger_counter','medicine'], 7, 8, 'You knew when it was safe and stayed healthy, but no mask. Day 7, mild radiation sickness.', '🤒'),
(s4_id, ARRAY['books','geiger_counter','generator'], 7, 8, 'Powered and monitoring, but no protection or medicine. Day 7, glowing slightly.', '☢️'),
(s4_id, ARRAY['books','geiger_counter','seeds'], 6, 5, 'You knew when to plant and when to hide, but no protection. Day 6, radiation sickness setting in.', '🤢'),
(s4_id, ARRAY['geiger_counter','generator','medicine'], 8, 10, 'Powered, monitored, and medicated. No mask but you managed the exposure. Day 8.', '💊');

INSERT INTO scenarios (day_number, play_date, title, flavor_text, timer_seconds, item_options)
VALUES (5, CURRENT_DATE + INTERVAL '4 days', 'Lost in the Arctic', 'Your research station just exploded. -40°C outside. You have 60 seconds to grab 3 things before frostbite sets in.', 60,
'[{"id":"sleeping_bag","name":"Arctic Sleeping Bag","emoji":"🛏️","description":"Rated to -60°C, keeps you alive"},{"id":"compass","name":"Military Compass","emoji":"🧭","description":"Never loses north, even in a blizzard"},{"id":"flare","name":"Signal Flare","emoji":"🚨","description":"Visible for 50km in clear conditions"},{"id":"axe","name":"Ice Axe","emoji":"🪓","description":"Cuts ice, wood, and polar bears"},{"id":"emergency_rations","name":"Emergency Rations","emoji":"🍫","description":"7 days of high-calorie survival bars"},{"id":"satellite_beacon","name":"Satellite Beacon","emoji":"📡","description":"Sends GPS location to rescue services"}]'::jsonb
) RETURNING id INTO s5_id;

INSERT INTO outcome_rules (scenario_id, item_combo, survival_days, iq_delta, outcome_text, reaction_emoji) VALUES
(s5_id, ARRAY['emergency_rations','satellite_beacon','sleeping_bag'], 14, 25, 'Warm, fed, and broadcasting your location. Rescue arrived on day 3. You spent day 14 giving interviews.', '📺'),
(s5_id, ARRAY['flare','satellite_beacon','sleeping_bag'], 13, 22, 'Warm and signaling both visually and via satellite. Rescue found you in 48 hours. Day 13 in a warm hospital.', '🏥'),
(s5_id, ARRAY['compass','satellite_beacon','sleeping_bag'], 12, 20, 'Warm, navigating toward civilization, and broadcasting your location. Day 12 rescue.', '🧭'),
(s5_id, ARRAY['axe','satellite_beacon','sleeping_bag'], 12, 20, 'Built a snow shelter, stayed warm, and broadcast your location. Day 12 rescue, impressed the rescuers.', '🏔️'),
(s5_id, ARRAY['emergency_rations','flare','satellite_beacon'], 13, 22, 'Fed and signaling constantly. Rescue arrived day 2. You spent day 13 writing a book about it.', '✍️'),
(s5_id, ARRAY['compass','emergency_rations','sleeping_bag'], 11, 17, 'Warm, fed, and navigating. No rescue signal but you walked out. Day 11, frostbitten toes.', '🦶'),
(s5_id, ARRAY['axe','emergency_rations','sleeping_bag'], 11, 17, 'Built shelter, stayed warm, and had food. No rescue signal but you survived comfortably. Day 11.', '🏕️'),
(s5_id, ARRAY['emergency_rations','flare','sleeping_bag'], 12, 20, 'Warm, fed, and signaling. Rescue found you on day 4. Day 12 in civilization.', '🎉'),
(s5_id, ARRAY['compass','flare','sleeping_bag'], 10, 15, 'Warm, navigating, and signaling. Day 10 rescue. The compass saved you from walking in circles.', '🔄'),
(s5_id, ARRAY['axe','compass','sleeping_bag'], 9, 12, 'Built shelter, stayed warm, and navigated. No rescue signal but you found a road. Day 9.', '🛣️'),
(s5_id, ARRAY['compass','emergency_rations','flare'], 10, 15, 'Fed, signaling, and navigating. No sleeping bag made nights brutal. Day 10 rescue, frostbitten.', '🥶'),
(s5_id, ARRAY['axe','flare','sleeping_bag'], 11, 17, 'Built shelter, stayed warm, and signaled. Day 11 rescue. The axe was surprisingly versatile.', '🪓'),
(s5_id, ARRAY['axe','emergency_rations','flare'], 9, 12, 'Fed, signaling, and able to build shelter. No sleeping bag made nights dangerous. Day 9 rescue.', '🌙'),
(s5_id, ARRAY['axe','compass','emergency_rations'], 8, 10, 'Fed, navigating, and building shelter. No rescue signal. Day 8, found a road by luck.', '🍀'),
(s5_id, ARRAY['emergency_rations','flare','satellite_beacon'], 13, 22, 'Fed and double-signaling. Rescue arrived in 36 hours. Day 13, you were barely inconvenienced.', '😎'),
(s5_id, ARRAY['axe','compass','flare'], 7, 8, 'Navigating and signaling but no warmth or food. Day 7 rescue, hypothermic and hungry.', '😰'),
(s5_id, ARRAY['axe','compass','satellite_beacon'], 8, 10, 'Broadcasting location and navigating. Built a snow shelter. Day 8 rescue.', '📡'),
(s5_id, ARRAY['compass','flare','satellite_beacon'], 10, 15, 'Signaling and navigating. No warmth or food but rescue was fast. Day 10.', '🚁'),
(s5_id, ARRAY['axe','flare','satellite_beacon'], 11, 17, 'Built shelter, signaled visually and via satellite. Day 11 rescue, very cold but alive.', '❄️'),
(s5_id, ARRAY['axe','emergency_rations','satellite_beacon'], 12, 20, 'Built shelter, fed, and broadcasting location. Day 12 rescue. The axe was the dark horse.', '🌟');

INSERT INTO scenarios (day_number, play_date, title, flavor_text, timer_seconds, item_options)
VALUES (6, CURRENT_DATE + INTERVAL '5 days', 'Alien Invasion', 'They came in peace. They lied. You have 60 seconds to grab 3 things before the mothership vaporizes your block.', 60,
'[{"id":"emp_device","name":"EMP Device","emoji":"⚡","description":"Disables alien tech within 100m"},{"id":"bunker_map","name":"Bunker Map","emoji":"🗺️","description":"Shows all government bunker locations"},{"id":"hazmat_suit","name":"Hazmat Suit","emoji":"🥼","description":"Protects against alien pathogens"},{"id":"signal_jammer","name":"Signal Jammer","emoji":"📡","description":"Blocks alien tracking signals"},{"id":"food_supply","name":"Food Supply","emoji":"🥫","description":"30 days of freeze-dried meals"},{"id":"medkit","name":"Advanced Medkit","emoji":"💊","description":"Treats alien toxin exposure"}]'::jsonb
) RETURNING id INTO s6_id;

INSERT INTO outcome_rules (scenario_id, item_combo, survival_days, iq_delta, outcome_text, reaction_emoji) VALUES
(s6_id, ARRAY['bunker_map','food_supply','signal_jammer'], 14, 25, 'Untracked, fed, and in a bunker. You outlasted the invasion and emerged to a hero''s welcome. Day 14.', '🦸'),
(s6_id, ARRAY['bunker_map','hazmat_suit','signal_jammer'], 13, 22, 'Protected, untracked, and in a bunker. You survived the pathogen wave. Day 13, slightly mutated.', '🧬'),
(s6_id, ARRAY['bunker_map','medkit','signal_jammer'], 12, 20, 'Untracked, medicated, and in a bunker. Day 12, you treated other survivors and became a legend.', '🏥'),
(s6_id, ARRAY['bunker_map','emp_device','signal_jammer'], 13, 22, 'Disabled alien scouts, found the bunker, stayed untracked. Day 13, the resistance recruited you.', '✊'),
(s6_id, ARRAY['bunker_map','food_supply','hazmat_suit'], 12, 20, 'Protected, fed, and in a bunker. Day 12, you were the best-prepared person in the shelter.', '🏆'),
(s6_id, ARRAY['bunker_map','food_supply','medkit'], 11, 17, 'Fed, medicated, and in a bunker. Day 11, you kept the other survivors healthy.', '💊'),
(s6_id, ARRAY['bunker_map','emp_device','food_supply'], 11, 17, 'Disabled alien tech, found the bunker, had food. Day 11, you were the bunker MVP.', '⚡'),
(s6_id, ARRAY['bunker_map','emp_device','hazmat_suit'], 10, 15, 'Protected and able to disable alien scouts. Found the bunker on day 3. Day 10.', '🥼'),
(s6_id, ARRAY['bunker_map','emp_device','medkit'], 10, 15, 'Disabled alien tech, found the bunker, stayed healthy. Day 10, slightly heroic.', '🦸'),
(s6_id, ARRAY['bunker_map','hazmat_suit','medkit'], 9, 12, 'Protected and medicated in a bunker. Day 9, you survived the pathogen wave with minimal symptoms.', '😷'),
(s6_id, ARRAY['emp_device','food_supply','signal_jammer'], 10, 15, 'Untracked, fed, and disabling alien tech. No bunker but you found a basement. Day 10.', '🏚️'),
(s6_id, ARRAY['food_supply','hazmat_suit','signal_jammer'], 9, 12, 'Untracked, protected, and fed. No bunker but you survived in a parking garage. Day 9.', '🅿️'),
(s6_id, ARRAY['food_supply','medkit','signal_jammer'], 8, 10, 'Untracked, fed, and medicated. No bunker or protection. Day 8, barely.', '😅'),
(s6_id, ARRAY['emp_device','hazmat_suit','signal_jammer'], 9, 12, 'Untracked, protected, and disabling alien tech. Day 9, you were basically a one-person resistance.', '💪'),
(s6_id, ARRAY['emp_device','medkit','signal_jammer'], 8, 10, 'Untracked, medicated, and disabling alien tech. Day 8, you survived but it was close.', '😬'),
(s6_id, ARRAY['hazmat_suit','medkit','signal_jammer'], 7, 8, 'Untracked and protected against pathogens. Day 7, you survived the first wave but ran out of food.', '🍽️'),
(s6_id, ARRAY['emp_device','food_supply','hazmat_suit'], 8, 10, 'Protected, fed, and disabling alien tech. No bunker or jammer. Day 8, tracked but alive.', '📍'),
(s6_id, ARRAY['emp_device','food_supply','medkit'], 7, 8, 'Fed, medicated, and disabling alien tech. Day 7, tracked but surviving.', '🎯'),
(s6_id, ARRAY['emp_device','hazmat_suit','medkit'], 6, 5, 'Protected and disabling alien tech but no food or bunker. Day 6, hungry and tracked.', '😩'),
(s6_id, ARRAY['food_supply','hazmat_suit','medkit'], 7, 8, 'Protected, fed, and medicated. No bunker or jammer. Day 7, tracked but healthy.', '🌡️');

INSERT INTO scenarios (day_number, play_date, title, flavor_text, timer_seconds, item_options)
VALUES (7, CURRENT_DATE + INTERVAL '6 days', 'Volcanic Eruption', 'Mount Doom just woke up. Lava flows in 3 minutes. You have 60 seconds to grab 3 things and run.', 60,
'[{"id":"gas_mask","name":"Gas Mask","emoji":"😷","description":"Filters volcanic ash and toxic gases"},{"id":"rope","name":"Climbing Rope","emoji":"🪢","description":"50m, for crossing lava channels"},{"id":"first_aid","name":"First Aid Kit","emoji":"🩹","description":"Treats burns and ash inhalation"},{"id":"water","name":"Water Supply","emoji":"💧","description":"10L of clean water"},{"id":"map","name":"Evacuation Map","emoji":"🗺️","description":"Shows all safe evacuation routes"},{"id":"emergency_radio","name":"Emergency Radio","emoji":"📻","description":"Receives evacuation updates"}]'::jsonb
) RETURNING id INTO s7_id;

INSERT INTO outcome_rules (scenario_id, item_combo, survival_days, iq_delta, outcome_text, reaction_emoji) VALUES
(s7_id, ARRAY['gas_mask','map','water'], 14, 25, 'Protected from ash, hydrated, and following the evacuation route. You reached safety on day 1. Day 14 in a hotel.', '🏨'),
(s7_id, ARRAY['emergency_radio','gas_mask','map'], 13, 22, 'Protected, informed, and navigating. You followed real-time updates to safety. Day 13.', '📻'),
(s7_id, ARRAY['gas_mask','map','rope'], 12, 20, 'Protected, navigating, and able to cross lava channels. Day 12 rescue. The rope was clutch.', '🌋'),
(s7_id, ARRAY['first_aid','gas_mask','map'], 12, 20, 'Protected, navigating, and treating burns along the way. Day 12, you helped others too.', '🩹'),
(s7_id, ARRAY['emergency_radio','gas_mask','water'], 12, 20, 'Protected, hydrated, and informed. Day 12, you knew exactly where to go.', '💧'),
(s7_id, ARRAY['gas_mask','rope','water'], 11, 17, 'Protected, hydrated, and able to cross obstacles. Day 11 rescue. No map made it harder.', '🗺️'),
(s7_id, ARRAY['emergency_radio','gas_mask','rope'], 11, 17, 'Protected, informed, and able to cross lava channels. Day 11 rescue.', '🪢'),
(s7_id, ARRAY['first_aid','gas_mask','water'], 10, 15, 'Protected, hydrated, and treating burns. No map but you found the road. Day 10.', '🛣️'),
(s7_id, ARRAY['first_aid','gas_mask','rope'], 10, 15, 'Protected, treating burns, and crossing obstacles. Day 10 rescue. Slightly singed.', '🔥'),
(s7_id, ARRAY['emergency_radio','first_aid','gas_mask'], 11, 17, 'Protected, informed, and treating burns. Day 11, you were the group medic.', '🏥'),
(s7_id, ARRAY['emergency_radio','map','water'], 10, 15, 'Informed, navigating, and hydrated. No gas mask made breathing difficult. Day 10 rescue, coughing.', '😮‍💨'),
(s7_id, ARRAY['map','rope','water'], 9, 12, 'Navigating, crossing obstacles, and hydrated. No gas mask. Day 9 rescue, lungs full of ash.', '😤'),
(s7_id, ARRAY['emergency_radio','map','rope'], 9, 12, 'Informed, navigating, and crossing obstacles. No gas mask. Day 9, breathing was rough.', '🌫️'),
(s7_id, ARRAY['first_aid','map','water'], 8, 10, 'Navigating, hydrated, and treating burns. No gas mask. Day 8 rescue, ash inhalation.', '🤧'),
(s7_id, ARRAY['emergency_radio','rope','water'], 8, 10, 'Informed, hydrated, and crossing obstacles. No gas mask or map. Day 8, found the road by luck.', '🍀'),
(s7_id, ARRAY['first_aid','map','rope'], 7, 8, 'Navigating, crossing obstacles, and treating burns. No gas mask or water. Day 7, dehydrated.', '😵'),
(s7_id, ARRAY['emergency_radio','first_aid','map'], 9, 12, 'Informed, navigating, and treating burns. No gas mask. Day 9, coughing but alive.', '💪'),
(s7_id, ARRAY['emergency_radio','first_aid','rope'], 7, 8, 'Informed, treating burns, and crossing obstacles. No gas mask or map. Day 7, barely.', '😰'),
(s7_id, ARRAY['emergency_radio','first_aid','water'], 8, 10, 'Informed, hydrated, and treating burns. No gas mask or map. Day 8, found the road eventually.', '🛤️'),
(s7_id, ARRAY['first_aid','rope','water'], 6, 5, 'Hydrated, treating burns, and crossing obstacles. No gas mask or map. Day 6, barely alive.', '😮');

END $$;
