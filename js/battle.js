// Turn-based super battles and signature moves.

const MOVE_WORDS = {
  a: ['Omega', 'Crimson', 'Final', 'Thunder', 'Phantom', 'Nova', 'Titan', 'Eclipse', 'Dragon', 'Infinity', 'Shadow', 'Solar'],
  b: ['Strike', 'Barrage', 'Cyclone', 'Burst', 'Crash', 'Fury', 'Cannon', 'Storm', 'Breaker', 'Judgment', 'Nova', 'Requiem'],
};
const MOVE_TIERS = [
  { level: 25, tier: 1, dmg: [24, 32], label: 'Technique' },
  { level: 50, tier: 2, dmg: [32, 42], label: 'Ultimate' },
  { level: 75, tier: 3, dmg: [44, 56], label: 'Legendary Finisher' },
];

function bestMove() {
  const m = (G.super.moves || []);
  return m.length ? m.reduce((a, b) => (b.tier > a.tier ? b : a)) : null;
}

// Offers to name a new signature move when a power threshold is crossed. Returns true if one was queued.
function checkMoves() {
  const s = G.super;
  if (!s || !s.alignment) return false;
  s.moves = s.moves || [];
  const t = MOVE_TIERS.find(t => s.level >= t.level && !s.moves.some(m => m.tier === t.tier));
  if (!t) return false;
  const p = POWERS[s.power];
  const sugg = shuffle([...new Set(Array.from({ length: 8 }, () => `${pick(MOVE_WORDS.a)} ${pick(MOVE_WORDS.b)}`))]).slice(0, 5);
  Q.push({
    emoji: '🌟', title: `New ${t.label}!`, cls: 'origin',
    text: `Your ${p.name.toLowerCase()} has reached power ${t.level}. You’ve developed a devastating new move you can use once per battle.<br><br>What do you call it?`,
    input: { placeholder: 'Name your move', suggestions: sugg, max: 26 },
    choices: [{ label: 'Lock it in', fn: v => {
      const name = v || sugg[0];
      s.moves.push({ name, tier: t.tier, dmg: t.dmg });
      sfx('power');
      say(`🌟 ${esc(s.alias)} learned a new signature move: <b>${esc(name)}</b>!`, 'super');
    } }],
  });
  return true;
}

// Converts an old-style difficulty number into an enemy combat rating.
function ratingFor(diff) { return Math.max(10, (diff + 10) / 1.2); }

function hpBar(label, v, cls) {
  return `<div class="hp"><span>${esc(label)}</span><div class="hp-bar"><div class="hp-fill ${cls}" style="width:${Math.max(0, v)}%"></div></div><b>${Math.max(0, Math.round(v))}</b></div>`;
}

// Start a battle. enemy: { name, power }. onWin/onLose run afterward.
function duel(diff, enemy, intro, onWin, onLose, opts = {}) {
  const B = {
    you: 100, foe: 100, stamina: 2, guard: false, sigUsed: false, gadgetUsed: false, turn: 1, log: '',
    enemy: { ...enemy, rating: ratingFor(diff), emoji: POWERS[enemy.power] ? POWERS[enemy.power].emoji : '👊' },
    diff, intro, onWin, onLose, canFlee: opts.canFlee !== false, onFlee: opts.onFlee,
  };
  sfx('battle');
  battleTurn(B);
}

function battleTurn(B) {
  const s = G.super;
  const sig = bestMove();
  const p = POWERS[s.power];
  popup({
    emoji: '⚔️', title: B.turn === 1 ? `VS ${B.enemy.name}` : `Round ${B.turn}`, cls: 'battle', grid: true,
    text: `${B.turn === 1 && B.intro ? `<p>${B.intro}</p>` : ''}${B.log ? `<div class="blog">${B.log}</div>` : ''}
      ${hpBar(s.alias, B.you, 'you')}${hpBar(B.enemy.name, B.foe, 'foe')}
      <div class="stam">Stamina ${'⚡'.repeat(B.stamina) || '—'}</div>`,
    choices: [
      { label: '👊 Strike', hint: 'Reliable hit', fn: () => playerMove(B, 'strike') },
      { label: `${p.emoji} ${p.kind === 'skill' ? 'Skill Combo' : 'Power Blast'}`, hint: B.stamina > 0 ? 'Heavy hit · 1 stamina' : 'No stamina', fn: () => B.stamina > 0 ? playerMove(B, 'power') : battleTurn(B) },
      { label: '🛡️ Defend', hint: 'Block · +1 stamina', fn: () => playerMove(B, 'defend') },
      { label: `🌟 ${sig ? sig.name : ''}`, hint: 'Signature move', cls: 'sig', show: () => sig && !B.sigUsed, fn: () => playerMove(B, 'sig') },
      { label: '🧰 Gadget', hint: 'Can’t miss', show: () => s.gadgets.length && !B.gadgetUsed, fn: () => playerMove(B, 'gadget') },
      { label: '🏃 Flee', hint: 'Escape the fight', show: () => B.canFlee, fn: () => flee(B) },
      { label: '⏩ Auto', hint: 'Skip to the end', fn: () => autoFinish(B) },
    ],
  });
}

function playerMove(B, kind) {
  const s = G.super;
  const r = Math.sqrt(combatScore() / B.enemy.rating);
  const verb = pick(POWERS[s.power].verbs);
  let dmg = 0, text = '';
  B.guard = false;
  if (kind === 'strike') {
    if (chance(0.9)) { dmg = rand(7, 12) * r; text = `You land a solid hit.`; } else text = 'You swing and miss!';
  } else if (kind === 'power') {
    B.stamina--;
    if (chance(0.75)) { dmg = rand(14, 22) * r; text = `You ${verb} ${B.enemy.name}!`; } else text = `${B.enemy.name} dodges your attack!`;
  } else if (kind === 'sig') {
    const m = bestMove(); B.sigUsed = true;
    dmg = rand(m.dmg[0], m.dmg[1]) * Math.max(1, r); text = `<b>${esc(m.name.toUpperCase())}!</b> The ground shakes.`;
    sfx('power');
  } else if (kind === 'gadget') {
    B.gadgetUsed = true;
    const gid = pick(s.gadgets);
    const g = GADGETS.find(x => x.id === gid);
    dmg = (8 + gadgetBonus()) * r; text = `You hit them with your ${g.name.toLowerCase()}!`;
  } else if (kind === 'defend') {
    B.guard = true; B.stamina = Math.min(3, B.stamina + 1); text = 'You brace yourself.';
  }
  B.foe -= Math.round(dmg);
  if (dmg) sfx('hit');
  B.log = `${text}${dmg ? ` <b>-${Math.round(dmg)}</b>` : ''}`;
  if (B.foe <= 0) return endBattle(B, true);
  enemyMove(B, r);
}

function enemyMove(B, r) {
  const s = G.super;
  let mult = pw('armor', 1) * (COSTUMES[s.costume].armor || 1);
  if (B.guard) mult *= 0.3;
  const special = B.turn % 3 === 0;
  let dmg = 0, text;
  if (chance(special ? 0.7 : 0.85)) {
    dmg = Math.round(rand(7, 13) / r * (special ? 1.7 : 1) * mult);
    const ep = POWERS[B.enemy.power];
    text = special && ep ? `${B.enemy.name} unleashes their ${ep.name.toLowerCase()}! <b>-${dmg}</b>` : `${B.enemy.name} hits back. <b>-${dmg}</b>`;
  } else text = `${B.enemy.name} misses!`;
  B.you -= dmg;
  B.log += `<br>${text}`;
  B.turn++;
  if (B.you <= 0) return endBattle(B, false);
  battleTurn(B);
}

function flee(B) {
  if (chance(0.45 + pw('escape') / 100)) {
    G.stats.health = clamp(G.stats.health - Math.round((100 - B.you) * 0.15));
    say(`🏃 You fled from a fight with ${B.enemy.name}.`);
    fx({ rep: -3, happy: -3 });
    if (B.onFlee) B.onFlee(); else result('🏃', 'Escaped', `You got away from ${B.enemy.name}. Not your proudest moment.`);
  } else {
    B.log = 'You try to run, but they cut you off!';
    enemyMove(B, Math.sqrt(combatScore() / B.enemy.rating));
  }
}

function autoFinish(B) {
  const base = winChance(B.diff);
  endBattle(B, chance(clamp(base + (B.you - B.foe) / 200, 0.03, 0.97)), true);
}

function endBattle(B, won, auto) {
  const s = G.super;
  if (won) {
    // Winning still leaves scrapes; losing is handled by each fight's own injury.
    if (!auto) G.stats.health = clamp(G.stats.health - Math.round((100 - B.you) * 0.15));
    s.wins = (s.wins || 0) + 1;
    sfx('good');
    B.onWin();
  } else {
    sfx('bad');
    B.onLose();
  }
}
