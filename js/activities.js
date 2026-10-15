// Immersive multi-step activities ("adventures"). Each one is a short chain of scenes with choices.

const FX_LABELS = { happy: '😊 Happiness', health: '❤️ Health', smarts: '🧠 Smarts', looks: '✨ Looks', money: '💰', rep: '🌟 Reputation', control: '🎯 Control', level: '⚡ Power' };

function fxSummary(o) {
  if (!o) return '';
  const parts = Object.entries(o).filter(([k, v]) => v && FX_LABELS[k]).map(([k, v]) =>
    k === 'money' ? `💰 ${v > 0 ? '+' : '-'}${money(Math.abs(v)).replace('-', '')}` : `${FX_LABELS[k]} ${v > 0 ? '+' : ''}${v}`);
  if (o.sus > 0) parts.push('🎭 Suspicion up');
  return parts.length ? `<div class="fx-summary">${parts.join(' · ')}</div>` : '';
}

// A scene in an adventure.
function scene(emoji, title, text, choices) {
  popup({ emoji, title, text, cls: 'adventure', choices });
}
// The final scene: apply effects, log it, show a summary.
function finish(emoji, title, text, effects, log, cls) {
  fx(effects);
  if (log) say(log, cls);
  popup({ emoji, title, text: text + fxSummary(effects), cls: 'adventure', choices: [{ label: 'Done' }] });
}
// Sometimes you meet someone who becomes a friend.
function meetFriend(where, ageLo, ageHi) {
  const f = addPerson({ ...randomPerson(null, Math.max(5, ageLo), ageHi, 'Friend'), trait: pick(FRIEND_TRAITS), bond: rand(55, 80) });
  say(`🤝 You made a new friend, ${fullName(f)}, ${where}.`, 'good');
  return f;
}
function nearAge(spread = 4) { return [Math.max(5, G.age - spread), G.age + spread]; }

// ---------- 1. Gym ----------
function advGym() {
  if (!once('adv_gym')) return;
  scene('🏋️', 'Iron Temple Gym', 'Bass is thumping, chalk dust hangs in the air, and somebody just dropped a deadlift that shook the floor. What’s the plan today?', [
    { label: '🏋️ Heavy lifting', fn: () => scene('🏋️', 'The Bench Press', 'You load up the bar. A massive bodybuilder in a stringer tank wanders over. “Want a spot, champ?”', [
      { label: 'Accept the spot', fn: () => finish('💪', 'Solid Session', 'He hypes you up through every rep. You leave sore and proud.', { health: rand(4, 8), looks: rand(1, 3), happy: 3 }, '🏋️ You had a great lifting session at Iron Temple Gym.') },
      { label: 'Go for a new personal record alone', fn: () => chance(0.5 + G.stats.health / 300)
        ? finish('🏆', 'New PR!', 'The bar flies up. A couple of people actually clap.', { health: rand(5, 9), looks: 3, happy: 8 }, '🏆 You set a new personal record at the gym!', 'good')
        : (G.lastInjury = 'a gym accident', finish('🤕', 'Pulled Something', 'Halfway up, something in your shoulder goes pop. Ouch.', { health: -rand(6, 12), happy: -4 }, '🤕 You hurt yourself lifting at the gym.', 'bad')) },
      { label: '⚡ Lift the entire weight rack', show: () => hasPower() && (G.super.power === 'strength' || G.super.second === 'strength' || G.super.power === 'size'), fn: () => finish('😱', 'Oops', 'You lift the whole rack — plates, bars and all — over your head. The gym goes dead silent. Someone is filming.', { happy: 6, sus: 18 }, '⚡ You showed off your strength at the gym. People are talking.', 'super') },
    ]) },
    { label: '🏃 Cardio', fn: () => scene('🏃', 'The Treadmill Duel', 'You’re jogging when the person on the next treadmill cranks their speed up and smirks at you. It’s on.', [
      { label: 'Race them', fn: () => chance(G.stats.health / 140)
        ? finish('🏅', 'You Win', 'They tap out first, gasping. You give a little nod and keep running.', { health: rand(5, 9), happy: 6 }, '🏃 You won a treadmill race against a total stranger.')
        : finish('😮‍💨', 'You Lose', 'You nearly fly off the back of the treadmill. They wave goodbye.', { health: rand(3, 5), happy: -3 }, '🏃 You lost a treadmill race. Humbling.') },
      { label: 'Ignore them and do your thing', fn: () => finish('🎧', 'Steady Pace', 'Headphones on, world off. A solid, peaceful run.', { health: rand(4, 7), happy: 2 }, '🏃 You went for a run at the gym.') },
      { label: '⚡ Hit 60 mph', show: () => hasPower() && pw('energy') > 0, fn: () => finish('💨', 'Treadmill Destroyed', 'The treadmill belt snaps and launches across the room. You walk away whistling.', { happy: 7, sus: 15, money: -1500 }, '⚡ You broke a treadmill with your powers and had to pay for it.', 'super') },
    ]) },
    { label: '🧘 Yoga class', fn: () => {
      const f = chance(0.45) ? meetFriend('in yoga class', ...nearAge(8)) : null;
      finish('🧘', 'Namaste', `The instructor guides you into poses you didn’t know your body could do. You leave feeling ten pounds lighter.${f ? `<br><br>Afterward, <b>${f.first}</b> from the next mat asks if you want to grab a smoothie. You’re friends now!` : ''}`, { health: rand(3, 6), happy: rand(5, 9) }, '🧘 You took a yoga class.');
    } },
    { label: '🥊 Boxing bag', fn: () => finish('🥊', 'Bag Work', 'Jab, jab, cross. You pour every frustration you have into that bag.', { health: rand(4, 7), happy: rand(4, 7), control: G.super ? 2 : 0 }, '🥊 You hit the heavy bag at the gym.') },
  ]);
}

// ---------- 2. Nightclub ----------
function advClub() {
  if (!once('adv_club')) return;
  const inside = () => scene('🪩', 'Inside Club Neon', 'Lasers slice through fog. The DJ drops a beat and the whole floor jumps. Where do you go?', [
    { label: '💃 Hit the dance floor', fn: () => (G.stats.looks + rand(0, 60) > 65)
      ? finish('🔥', 'Main Character', 'A circle forms around you. Phones come out. You absolutely own the floor.', { happy: 12, looks: 1 }, '🪩 You stole the show on the dance floor at Club Neon.', 'good')
      : finish('🫠', 'Questionable Moves', 'You try a spin, knock over someone’s drink, and slip. Somebody laughs. Loudly.', { happy: -4 }, '🪩 You embarrassed yourself on the dance floor.') },
    { label: '🍹 Buy a round for strangers ($200)', show: () => G.money >= 200, fn: () => {
      const f = meetFriend('at Club Neon', ...nearAge(6));
      finish('🍹', 'Instant Squad', `The whole booth cheers your name. By last call, <b>${f.first}</b> has your number and calls you their new best friend.`, { money: -200, happy: 8 }, '🍹 You bought a round of drinks for a booth of strangers.');
    } },
    { label: '😍 Talk to someone cute', show: () => !partner(), fn: () => {
      const c = randomPerson(null, Math.max(18, G.age - 5), G.age + 5, 'Partner');
      if (chance(0.3 + G.stats.looks / 150)) {
        const p = addPerson({ ...c, bond: rand(55, 80) });
        finish('💕', 'Sparks', `You and <b>${p.first}</b> talk until the lights come on. You start dating!`, { happy: 12 }, `💕 You met ${fullName(p)} at Club Neon and started dating.`, 'good');
      } else finish('🙅', 'Not Tonight', `${c.first} smiles politely and walks off with their friends.`, { happy: -4 }, 'You got rejected at Club Neon.');
    } },
    { label: '🍾 Sneak into VIP', fn: () => chance(0.4)
      ? finish('🍾', 'VIP Life', 'Free champagne. A pro athlete fist-bumps you. A pop star says your outfit is “a vibe.”', { happy: 14 }, '🍾 You partied in the VIP section at Club Neon.', 'good')
      : finish('🚪', 'Escorted Out', 'Security grabs you by the collar and walks you right out the back door.', { happy: -6 }, 'You were kicked out of Club Neon for sneaking into VIP.') },
  ]);
  scene('🚪', 'Club Neon', 'There’s a line around the block, and a bouncer the size of a refrigerator is guarding the velvet rope.', [
    { label: 'Wait in line', fn: () => chance(0.65) ? inside() : finish('⏳', 'Turned Away', '“Not tonight.” Two hours in line for nothing.', { happy: -5 }, 'You got turned away from Club Neon.') },
    { label: 'Slip the bouncer $100', show: () => G.money >= 100, fn: () => { G.money -= 100; inside(); } },
    { label: '⚡ Use your powers to get in', show: () => hasPower(), fn: () => { fx({ sus: 5 }); inside(); } },
  ]);
}

// ---------- 3. Music festival ----------
function advFestival() {
  const cost = 250;
  if (G.money < cost) return toast(`Tickets cost ${money(cost)}.`);
  if (!once('adv_fest')) return;
  G.money -= cost;
  scene('🎪', 'Sunburst Festival', 'Three stages, a hundred thousand people, glitter everywhere. The headliner goes on in an hour. Where are you headed?', [
    { label: '🎤 Push to the front of the main stage', fn: () => scene('🎤', 'Front Row', 'The headliner points right at you and holds out the mic during the chorus!', [
      { label: 'Sing your heart out', fn: () => (G.stats.looks + G.stats.happy + rand(0, 60) > 110)
        ? finish('🌟', 'Viral Moment', 'You nail it. The crowd roars. By morning the clip has five million views.', { happy: 18, looks: 2 }, '🌟 You sang with the headliner at Sunburst Festival and went viral!', 'good')
        : finish('😬', 'Viral… For the Wrong Reasons', 'Your voice cracks on the high note. The clip still has five million views.', { happy: -6 }, 'You sang (badly) with the headliner at Sunburst Festival.') },
      { label: 'Freeze up', fn: () => finish('🫣', 'Stage Fright', 'You stare at the mic like it’s a snake. The headliner laughs and moves on. Still a great show.', { happy: 6 }, '🎤 You saw the headliner from the front row.') },
    ]) },
    { label: '🤘 Jump in the mosh pit', fn: () => chance(0.65)
      ? finish('🤘', 'Pure Chaos', 'Elbows, sweat, screaming. Best twenty minutes of your life.', { happy: 14, health: -2 }, '🤘 You survived the mosh pit at Sunburst Festival.')
      : (G.lastInjury = 'a mosh pit', finish('🤕', 'Trampled', 'You go down hard and get stepped on. A medic patches you up.', { happy: 2, health: -rand(8, 15) }, '🤕 You got hurt in the mosh pit at Sunburst Festival.', 'bad')) },
    { label: '🌈 Chill in the art tent', fn: () => {
      const f = chance(0.55) ? meetFriend('at Sunburst Festival', ...nearAge(6)) : null;
      finish('🌈', 'Good Vibes', `Hammocks, painters, and a guy playing a didgeridoo. Very relaxing.${f ? `<br><br>You end up sharing snacks with <b>${f.first}</b>. New friend!` : ''}`, { happy: 10 }, '🌈 You chilled in the art tent at Sunburst Festival.');
    } },
    { label: '🎫 Sneak backstage', fn: () => chance(0.35)
      ? finish('🎸', 'Backstage Pass', 'You end up playing cards with the band. They let you keep a guitar pick from the show.', { happy: 20 }, '🎸 You snuck backstage and hung out with the band at Sunburst Festival!', 'good')
      : finish('🚓', 'Caught', 'Security catches you climbing the fence and kicks you out of the festival.', { happy: -8 }, 'You were kicked out of Sunburst Festival.') },
  ]);
}

// ---------- 4. Mountain hike ----------
function advHike() {
  if (!once('adv_hike')) return;
  const bear = (next) => scene('🐻', 'Bear!', 'Halfway up, you round a bend and come face-to-face with a big brown bear. It stands up on its hind legs.', [
    { label: 'Back away slowly', fn: () => chance(0.75) ? next() : (G.lastInjury = 'a bear attack', finish('🐻', 'Swiped', 'The bear swats you once and lumbers off. You limp back to the car.', { health: -rand(15, 25), happy: -8 }, '🐻 You were attacked by a bear on Granite Peak.', 'bad')) },
    { label: 'Play dead', fn: () => chance(0.55) ? next() : (G.lastInjury = 'a bear attack', finish('🐻', 'Bad Call', 'The bear is very curious about your backpack, and you’re wearing it.', { health: -rand(10, 20) }, '🐻 Playing dead didn’t work on a bear.', 'bad')) },
    { label: 'Run!', fn: () => chance(0.3) ? next() : (G.lastInjury = 'a bear attack', finish('🐻', 'Never Run From a Bear', 'Bears are fast. Very fast.', { health: -rand(20, 35), happy: -10 }, '🐻 You ran from a bear and it caught you.', 'bad')) },
    { label: '⚡ Use your powers', show: hasPower, fn: () => { fx({ sus: 3 }); next(); } },
  ]);
  const summit = () => (G.flags.summit = true) && finish('🏔️', 'The Summit', 'You reach the top of Granite Peak. Clouds below, the whole city tiny on the horizon. You feel like you could do anything.', { health: rand(5, 9), happy: rand(10, 15) }, '🏔️ You hiked to the summit of Granite Peak.', 'good');
  scene('🥾', 'Granite Peak', 'The trailhead map shows three routes. The air smells like pine.', [
    { label: '🌲 Easy loop trail', fn: () => {
      const f = chance(0.35) ? meetFriend('on a hiking trail', ...nearAge(10)) : null;
      finish('🌲', 'Nice Walk', `Birds, wildflowers, a babbling creek. Peaceful.${f ? `<br><br>You chat with <b>${f.first}</b> the whole way down and swap numbers.` : ''}`, { health: rand(3, 5), happy: rand(4, 7) }, '🌲 You took a walk on the Granite Peak loop trail.');
    } },
    { label: '⛰️ The summit trail', show: () => G.age >= 10, fn: () => chance(0.4) ? bear(summit) : summit() },
    { label: '🧭 Go off-trail', fn: () => chance(0.5)
      ? finish('💦', 'Hidden Waterfall', 'You push through the brush and find a secret waterfall nobody knows about. You swim until sunset.', { happy: 16, health: 3 }, '💦 You discovered a hidden waterfall on Granite Peak.', 'good')
      : scene('🌙', 'Lost', 'The sun is setting and every tree looks the same. Your phone has no signal.', [
        { label: 'Follow the stream downhill', fn: () => chance(0.6 + G.stats.smarts / 300) ? finish('🏡', 'Found the Road', 'The stream leads you to a ranger station. Tired but safe.', { happy: 2 }, 'You got lost on Granite Peak but found your way out.') : (G.lastInjury = 'exposure', finish('🥶', 'Long Night', 'You spend a freezing night under a tree before a rescue team finds you.', { health: -rand(10, 18), happy: -8 }, '🥶 You got lost overnight on Granite Peak.', 'bad')) },
        { label: '⚡ Fly or teleport out', show: () => hasPower() && ['flight', 'teleport'].includes(G.super.power), fn: () => finish('✨', 'Easy', 'You’re home in time for dinner.', { happy: 5 }, 'You used your powers to escape from the woods.', 'super') },
      ]) },
  ]);
}

// ---------- 5. Casino ----------
function advCasino() {
  if (G.money < 100) return toast('You need at least $100 to gamble.');
  if (!once('adv_casino')) return;
  const bets = () => [100, 1000, 10000, 100000].filter(b => b <= G.money);
  const play = (game) => scene(game.emoji, game.name, `${game.desc}<br><br>How much are you betting?`, bets().map(b => ({ label: money(b), fn: () => game.run(b) }))
    .concat([{ label: `All in (${money(G.money)})`, cls: 'danger', fn: () => game.run(G.money) }]));
  const win = (bet, mult, msg) => finish('🤑', 'Winner!', `${msg}<br><br>You won <b>${money(bet * mult)}</b>!`, { money: bet * mult, happy: Math.min(25, 5 + Math.round(Math.log10(bet * mult) * 2)) }, `🎰 You won ${money(bet * mult)} at the Golden Vault Casino.`, 'good');
  const lose = (bet, msg) => finish('💸', 'House Wins', `${msg}<br><br>You lost <b>${money(bet)}</b>.`, { money: -bet, happy: -Math.min(20, 3 + Math.round(Math.log10(bet) * 2)) }, `🎰 You lost ${money(bet)} at the Golden Vault Casino.`, 'bad');
  const games = [
    { name: 'Slot Machines', emoji: '🎰', desc: 'Lights flash, bells ring. Three cherries pays big.', run: b => {
      const r = Math.random();
      if (r < 0.02) win(b, 20, '🍒🍒🍒 JACKPOT! Sirens go off and everyone turns to look.');
      else if (r < 0.3) win(b, 1, '🍋🍋🔔 A small win. You doubled your bet.');
      else lose(b, '🍋🔔⭐ Nothing.');
    } },
    { name: 'Blackjack', emoji: '🃏', desc: 'Get closer to 21 than the dealer without going over.', run: b => {
      const you = rand(12, 20), dealerShows = rand(2, 11);
      scene('🃏', 'Your Hand', `You have <b>${you}</b>. The dealer is showing a <b>${dealerShows}</b>.`, [
        { label: 'Hit', fn: () => { const n = you + rand(2, 11); n > 21 ? lose(b, `You drew to ${n}. Bust!`) : resolveBJ(b, n); } },
        { label: 'Stand', fn: () => resolveBJ(b, you) },
        { label: '🧠 Read the dealer’s mind', show: () => hasPower() && (pw('wipe') || G.super.power === 'precog' || G.super.power === 'time'), fn: () => { fx({ sus: 4 }); win(b, 1, 'You know exactly what card is coming. You play it perfectly.'); } },
      ]);
    } },
    { name: 'Roulette', emoji: '🎡', desc: 'The wheel spins. Red or black doubles your money. A single number pays 35 to 1.', run: b => scene('🎡', 'Place Your Bet', 'Where do you put your chips?', [
      { label: '🔴 Red', fn: () => chance(18 / 38) ? win(b, 1, 'The ball lands on red 23!') : lose(b, 'The ball lands on black 8.') },
      { label: '⚫ Black', fn: () => chance(18 / 38) ? win(b, 1, 'The ball lands on black 17!') : lose(b, 'The ball lands on red 3.') },
      { label: `🎯 Lucky number ${G.age % 36 + 1}`, fn: () => chance(1 / 38) ? win(b, 35, `The ball drops right into ${G.age % 36 + 1}. The whole table screams.`) : lose(b, 'The ball bounces past your number.') },
    ]) },
  ];
  function resolveBJ(b, you) {
    const dealer = rand(16, 23);
    if (dealer > 21) win(b, 1, `You stand on ${you}. The dealer busts with ${dealer}!`);
    else if (you > dealer) win(b, 1, `Your ${you} beats the dealer’s ${dealer}.`);
    else if (you === dealer) finish('🤝', 'Push', `You and the dealer both have ${you}. You keep your bet.`, null, null);
    else lose(b, `The dealer’s ${dealer} beats your ${you}.`);
  }
  scene('🎲', 'Golden Vault Casino', 'Carpet with a dizzying pattern, no clocks anywhere, and free drinks for anyone holding chips. Pick your game.', games.map(g => ({ label: `${g.emoji} ${g.name}`, fn: () => play(g) })).concat([{ label: 'Walk away' }]));
}

// ---------- 6. Beach ----------
function advBeach() {
  if (!once('adv_beach')) return;
  scene('🏖️', 'Coral Cove Beach', 'Hot sand, cold waves, seagulls eyeing your snacks. Perfect beach day.', [
    { label: '🏄 Surf', show: () => G.age >= 8, fn: () => scene('🌊', 'Big Wave', 'A huge set is rolling in. The locals are paddling out.', [
      { label: 'Paddle for the biggest wave', fn: () => chance(G.stats.health / 150) ? finish('🏄', 'Barrel!', 'You drop in and ride the barrel all the way to the beach. A surfer yells “SHOOTS, BRAH!”', { happy: 15, health: 4, looks: 2 }, '🏄 You rode a huge wave at Coral Cove!', 'good') : (G.lastInjury = 'a surfing wipeout', finish('🌊', 'Wipeout', 'The wave eats you alive and holds you down for way too long.', { health: -rand(6, 14), happy: -3 }, '🌊 You wiped out surfing at Coral Cove.', 'bad')) },
      { label: 'Stick to the small ones', fn: () => finish('🏄', 'Fun Session', 'Small waves, big smiles. You’re getting better.', { happy: 8, health: 3 }, '🏄 You went surfing at Coral Cove.') },
    ]) },
    { label: '😎 Sunbathe', fn: () => chance(0.7) ? finish('😎', 'Golden', 'You get a perfect tan and a nap to the sound of the waves.', { happy: 7, looks: rand(1, 3) }, '😎 You worked on your tan at Coral Cove.') : finish('🦞', 'Lobster', 'You fell asleep. You are now the color of a lobster.', { happy: -3, health: -3, looks: -2 }, '🦞 You got a bad sunburn at the beach.') },
    { label: '🏐 Join a volleyball game', fn: () => {
      const f = meetFriend('playing beach volleyball', ...nearAge(6));
      finish('🏐', 'Game Point', `You spike the winning point. Your teammate <b>${f.first}</b> invites you to play again next week. New friend!`, { happy: 9, health: 4 }, '🏐 You played beach volleyball at Coral Cove.');
    } },
    { label: '🏊 Swim out past the buoys', fn: () => scene('🆘', 'Rip Current', 'Far out, you hear a scream. A swimmer is being dragged out to sea by a rip current!', [
      { label: 'Swim over and help', fn: () => chance(G.stats.health / 130) ? finish('🦸', 'Lifesaver', 'You swim parallel to the shore, grab them, and bring them in. The crowd on the beach applauds.', { happy: 15, rep: isHero() ? 3 : 0 }, '🦸 You saved a drowning swimmer at Coral Cove!', 'good') : (G.lastInjury = 'drowning', finish('🚁', 'In Over Your Head', 'The current is too strong. A lifeguard has to rescue both of you.', { health: -rand(8, 15), happy: -4 }, 'You tried to save a swimmer but needed rescuing yourself.', 'bad')) },
      { label: 'Wave for the lifeguard', fn: () => finish('🛟', 'Safe', 'The lifeguard gets there in time. Everyone is okay.', { happy: 2 }, 'You flagged down a lifeguard to save a drowning swimmer.') },
      { label: '⚡ Save them with your powers', show: hasPower, fn: () => { if (isHero()) G.super.stats.saved++; finish('⚡', 'Miracle at Coral Cove', 'One second they’re drowning, the next they’re lying safely on the sand. Nobody can explain it.', { happy: 12, rep: isHero() ? 4 : 0, sus: 12 }, '⚡ You used your powers to save a drowning swimmer.', 'super'); } },
    ]) },
  ]);
}

// ---------- 7. Theme park ----------
function advThemePark() {
  const cost = 120;
  if (G.money < cost && G.age >= 18) return toast(`Tickets cost ${money(cost)}.`);
  if (!once('adv_park')) return;
  if (G.age >= 18) G.money -= cost;
  const p = partner();
  scene('🎢', 'Thunder Mountain Park', `Churros, screaming, and the rattle of wooden coasters.${G.age < 18 ? ' Your parents paid for the tickets!' : ''} What first?`, [
    { label: '🎢 Ride the Doom Drop', fn: () => chance(0.12)
      ? scene('😱', 'Stuck at the Top!', 'The Doom Drop jerks to a stop at its highest point — 400 feet up. Sparks fly from the track. People are screaming.', [
        { label: 'Stay calm and wait', fn: () => finish('🚒', 'Rescued', 'Two hours later, firefighters bring everyone down. You get a free lifetime pass as an apology.', { happy: -2 }, '😱 You were stuck at the top of the Doom Drop for two hours.') },
        { label: '⚡ Save everyone', show: hasPower, fn: () => { if (isHero()) G.super.stats.saved += 24; finish('🦸', 'Hero of Thunder Mountain', 'You get every rider down safely before the track gives way. The news calls it a miracle.', { happy: 15, rep: isHero() ? 8 : 2, sus: 15 }, '⚡ You secretly saved 24 people stuck on a broken roller coaster.', 'super'); } },
      ])
      : chance(0.25) ? finish('🤢', 'Mistakes Were Made', 'Great ride. Shouldn’t have had the chili dog first.', { happy: 4, health: -2 }, '🎢 You rode the Doom Drop and immediately threw up.') : finish('🎢', 'AAAAHHH!', 'Zero gravity, 90 mph, pure adrenaline. You run straight back into line.', { happy: 12 }, '🎢 You rode the Doom Drop at Thunder Mountain Park.') },
    { label: '🎯 Carnival games', fn: () => chance(0.35) ? finish('🧸', 'Winner!', 'You knock down all six bottles and walk away with a stuffed bear bigger than you.', { happy: 10 }, '🧸 You won a giant stuffed bear at the carnival games.') : finish('🎯', 'Rigged', 'Twenty dollars later, you’re pretty sure those bottles are glued down.', { happy: -2, money: G.age >= 12 ? -Math.min(20, G.money) : 0 }, 'You lost at the carnival games.') },
    { label: '👻 Haunted house', fn: () => finish('👻', 'Terrified', chance(0.5) ? 'A zombie grabs your ankle. You scream so loud the actors break character to check on you.' : 'You walk through laughing at every jump scare. Too easy.', { happy: 7 }, '👻 You went through the haunted house at Thunder Mountain Park.') },
    { label: p ? `🎡 Ferris wheel with ${p.first}` : '🎡 Ferris wheel', fn: () => { if (p) p.bond = clamp(p.bond + 12); finish('🎡', 'On Top of the World', p ? `At the very top, with the whole park lit up below, ${p.first} takes your hand.` : 'The sunset from the top is incredible.', { happy: 9 }, p ? `🎡 You rode the Ferris wheel with ${p.first}.` : '🎡 You rode the Ferris wheel at sunset.'); } },
  ]);
}

// ---------- 8. Dojo ----------
function advDojo() {
  const cost = G.age >= 18 ? 100 : 0;
  if (G.money < cost) return toast(`Classes cost ${money(cost)}.`);
  if (!once('adv_dojo')) return;
  G.money -= cost;
  scene('🥋', 'Dragon Gate Dojo', 'You bow at the door. Sensei Takeda nods from across the mat. “Today, what will you learn?”', [
    { label: '🥋 Practice forms', fn: () => finish('🥋', 'Discipline', 'Hundreds of repetitions until every move is perfect. Your mind feels clear.', { health: rand(3, 6), happy: 4, smarts: 2, control: G.super ? rand(2, 5) : 0 }, '🥋 You practiced forms at Dragon Gate Dojo.') },
    { label: '🤼 Spar with a black belt', fn: () => {
      const odds = G.super ? winChance(30) : 0.3 + G.stats.health / 400;
      chance(odds) ? finish('🏆', 'Upset Victory', 'You sweep the black belt’s legs and pin them. The whole dojo goes quiet, then bursts into applause.', { happy: 12, health: 3 }, '🥋 You beat a black belt in sparring!', 'good')
        : (G.lastInjury = 'a sparring injury', finish('🤕', 'Lesson Learned', 'You last about eight seconds. Sensei says losing is the best teacher.', { health: -rand(3, 8), happy: -2, smarts: 1 }, 'You got beaten by a black belt in sparring.'));
    } },
    { label: '🏆 Enter the city tournament', show: () => G.age >= 10, fn: () => scene('🏆', 'Tournament Final', 'You fight your way through three rounds. In the final you face the reigning champion, who smirks at you.', [
      { label: 'Fight with honor', fn: () => chance(G.super ? winChance(40) : 0.25 + G.stats.health / 300) ? finish('🥇', 'Champion!', 'One perfect kick. The crowd erupts. You take home the trophy and $5,000.', { happy: 18, money: 5000 }, '🥇 You won the city martial arts tournament!', 'good') : finish('🥈', 'Runner-Up', 'You lose a close decision, but the champion bows to you with respect.', { happy: 6 }, '🥈 You placed second in the city martial arts tournament.') },
      { label: '⚡ Secretly use your powers', show: hasPower, fn: () => finish('🥇', 'Champion (Sort Of)', 'You win in four seconds. The champion is very confused. Sensei Takeda looks at you for a long, long time.', { happy: 8, money: 5000, sus: 12 }, '🥇 You won the martial arts tournament with a little super help.', 'super') },
    ]) },
    { label: '🧓 Ask Sensei for a secret technique', fn: () => chance(0.3)
      ? finish('🐉', 'The Dragon’s Breath', 'Sensei leads you to a back room and teaches you a breathing technique passed down for 800 years.', { health: 8, happy: 8, control: G.super ? 10 : 0, level: G.super ? 2 : 0 }, '🐉 Sensei Takeda taught you a secret technique.', 'good')
      : finish('🧓', 'Not Yet', '“You are not ready.” He hands you a broom. You sweep the dojo for an hour.', { happy: -2, health: 1 }, 'Sensei Takeda said you weren’t ready for his secret technique.') },
  ]);
}

const ADVENTURES = [
  { emoji: '🏋️', name: 'Iron Temple Gym', sub: 'Lift, run, stretch or box', min: 12, fn: advGym },
  { emoji: '🪩', name: 'Club Neon', sub: 'Dance, party, meet people', min: 18, fn: advClub },
  { emoji: '🎪', name: 'Sunburst Festival', sub: 'Music festival · $250', min: 16, fn: advFestival },
  { emoji: '🥾', name: 'Granite Peak Hike', sub: 'Trails, wildlife, adventure', min: 6, fn: advHike },
  { emoji: '🎲', name: 'Golden Vault Casino', sub: 'Slots, blackjack, roulette', min: 21, fn: advCasino },
  { emoji: '🏖️', name: 'Coral Cove Beach', sub: 'Surf, sun and volleyball', min: 4, fn: advBeach },
  { emoji: '🎢', name: 'Thunder Mountain Park', sub: 'Roller coasters · $120', min: 5, fn: advThemePark },
  { emoji: '🥋', name: 'Dragon Gate Dojo', sub: 'Martial arts training', min: 7, fn: advDojo },
];
