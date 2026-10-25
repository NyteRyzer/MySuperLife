// Progress across lives: achievements, life goals, ribbons, the Hall of Legends, playing as your child,
// sound effects and the profile page.

const META_KEY = 'mysuperlife.meta.v1';
function loadMeta() { try { return JSON.parse(localStorage.getItem(META_KEY)) || {}; } catch (e) { return {}; } }
function saveMeta(m) { try { localStorage.setItem(META_KEY, JSON.stringify(m)); } catch (e) { /* storage unavailable */ } }
function ord(n) { const s = ['th', 'st', 'nd', 'rd'], v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]); }

// ---------- achievements ----------
const S = () => G.super || {};
const SS = () => (G.super && G.super.stats) || {};
const ACHIEVEMENTS = [
  { id: 'awakened', emoji: '⚡', name: 'Awakened', desc: 'Get your powers', test: () => S().alignment },
  { id: 'early', emoji: '🍼', name: 'Early Bloomer', desc: 'Awaken at age 7 or younger', test: () => S().originAge <= 7 },
  { id: 'adept', emoji: '🌟', name: 'Signature Move', desc: 'Learn a signature move', test: () => (S().moves || []).length > 0 },
  { id: 'legendary', emoji: '💫', name: 'Legendary', desc: 'Reach power 75', test: () => S().level >= 75 },
  { id: 'omega', emoji: '♾️', name: 'Omega-Level', desc: 'Reach power 95', test: () => S().level >= 95 },
  { id: 'twin', emoji: '🧬', name: 'Evolved', desc: 'Gain a second power', test: () => S().second },
  { id: 'saver', emoji: '🦸', name: 'Lifesaver', desc: 'Save 100 people', test: () => SS().saved >= 100 },
  { id: 'legend', emoji: '🏛️', name: 'Living Legend', desc: 'Save 1,000 people', test: () => SS().saved >= 1000 },
  { id: 'world', emoji: '🌍', name: 'Savior of Earth', desc: 'Save the world', test: () => S().savedWorld },
  { id: 'ruler', emoji: '👑', name: 'Supreme Ruler', desc: 'Conquer the world', test: () => S().ruler },
  { id: 'kingpin', emoji: '💰', name: 'Kingpin', desc: 'Steal $10 million', test: () => SS().stolen >= 1e7 },
  { id: 'nemesis', emoji: '😈', name: 'Arch-Rival', desc: 'Beat your nemesis 3 times', test: () => S().nemesis && S().nemesis.losses >= 3 },
  { id: 'unmasked', emoji: '🎭', name: 'Unmasked', desc: 'Have your identity revealed', test: () => S().exposed },
  { id: 'brawler', emoji: '⚔️', name: 'Brawler', desc: 'Win 10 battles', test: () => S().wins >= 10 },
  { id: 'guardian', emoji: '🛡️', name: 'Guardian of the City', desc: 'Make 3 districts safe', test: () => isHero() && safeDistricts().length >= 3 },
  { id: 'boss', emoji: '🏴', name: 'City Boss', desc: 'Control 4 districts', test: () => ownedDistricts().length >= 4 },
  { id: 'team', emoji: '🤝', name: 'Team Player', desc: 'Join a super team', test: () => S().team },
  { id: 'fortress', emoji: '🏰', name: 'Fortress', desc: 'Own a top-tier base', test: () => S().base >= 2 },
  { id: 'jail', emoji: '⛓️', name: 'Jailbird', desc: 'Go to prison', test: () => G.flags.wasJailed },
  { id: 'escape', emoji: '🔓', name: 'Escape Artist', desc: 'Break out of prison', test: () => G.flags.brokeOut },
  { id: 'acquit', emoji: '⚖️', name: 'Not Guilty', desc: 'Win a court case', test: () => G.flags.acquitted },
  { id: 'million', emoji: '💵', name: 'Millionaire', desc: 'Net worth of $1 million', test: () => netWorth() >= 1e6 },
  { id: 'billion', emoji: '🏦', name: 'Billionaire', desc: 'Net worth of $1 billion', test: () => netWorth() >= 1e9 },
  { id: 'grad', emoji: '🎓', name: 'Scholar', desc: 'Earn a graduate degree', test: () => G.edu.level >= 3 },
  { id: 'chief', emoji: '💼', name: 'Corner Office', desc: 'Get promoted 3 times', test: () => G.job && G.job.rank >= 3 },
  { id: 'married', emoji: '💍', name: 'Happily Married', desc: 'Get married', test: () => G.people.some(p => p.role === 'Spouse') },
  { id: 'parent', emoji: '👶', name: 'Parent', desc: 'Have a child', test: () => G.people.some(p => p.role === 'Child') },
  { id: 'social', emoji: '🦋', name: 'Social Butterfly', desc: 'Have 8 friends', test: () => G.people.filter(p => p.alive && /^(Best )?Friend$/.test(p.role)).length >= 8 },
  { id: 'bff', emoji: '⭐', name: 'Best Friends', desc: 'Make a best friend', test: () => G.people.some(p => p.role === 'Best Friend') },
  { id: 'influencer', emoji: '📱', name: 'Influencer', desc: 'Reach 1 million followers', test: () => G.social && G.social.followers >= 1e6 },
  { id: 'zoo', emoji: '🐾', name: 'Animal Lover', desc: 'Have 3 pets at once', test: () => livingPets().length >= 3 },
  { id: 'superpet', emoji: '🐶', name: 'Super Pet', desc: 'Have a pet gain powers', test: () => (G.pets || []).some(p => p.powered) },
  { id: 'mansion', emoji: '🏰', name: 'Lap of Luxury', desc: 'Own a mansion or island', test: () => (G.assets || []).some(a => a.id === 'mansion' || a.id === 'island') },
  { id: 'globe', emoji: '🚚', name: 'Fresh Start', desc: 'Move to a new city', test: () => G.moves > 0 },
  { id: 'old', emoji: '🎂', name: 'Centenarian', desc: 'Live to 100', test: () => G.age >= 100 },
  { id: 'goals', emoji: '🎯', name: 'Goal Getter', desc: 'Complete all your life goals', test: () => (G.goals || []).length && G.goals.every(g => g.done) },
  { id: 'dynasty', emoji: '🧬', name: 'Dynasty', desc: 'Play as a 3rd generation', test: () => (G.generation || 1) >= 3 },
];

function checkAchievements() {
  if (!G || !G.alive) return;
  G.achievements = G.achievements || [];
  const meta = loadMeta();
  meta.ach = meta.ach || [];
  let changed = false;
  ACHIEVEMENTS.forEach(a => {
    if (G.achievements.includes(a.id)) return;
    let ok = false;
    try { ok = !!a.test(); } catch (e) { ok = false; }
    if (!ok) return;
    G.achievements.push(a.id);
    if (!meta.ach.includes(a.id)) meta.ach.push(a.id);
    changed = true;
    say(`🏆 Achievement unlocked: <b>${a.name}</b>`, 'achievement');
    showBadge(`${a.emoji} ${a.name}`);
    sfx('achievement');
  });
  if (changed) saveMeta(meta);
}
let badgeTimer = null;
function showBadge(text, label = 'Achievement unlocked') {
  const b = $('#badge-pop');
  b.innerHTML = `<small>${label}</small>${esc(text)}`;
  b.classList.add('show');
  clearTimeout(badgeTimer);
  badgeTimer = setTimeout(() => b.classList.remove('show'), 2600);
}

// ---------- life goals ----------
const GOALS = [
  { id: 'rich', text: 'Become a millionaire', test: () => netWorth() >= 1e6 },
  { id: 'marry', text: 'Get married', test: () => G.people.some(p => p.role === 'Spouse') },
  { id: 'kids', text: 'Have two kids', test: () => G.people.filter(p => p.role === 'Child').length >= 2 },
  { id: 'degree', text: 'Graduate from university', test: () => G.edu.level >= 2 },
  { id: 'friends', text: 'Make 5 friends', test: () => G.people.filter(p => /^(Best )?Friend$/.test(p.role)).length >= 5 },
  { id: 'home', text: 'Buy a house', test: () => (G.assets || []).some(a => a.kind === 'home') },
  { id: 'car', text: 'Own a sports car', test: () => (G.assets || []).some(a => ['sports', 'hyper', 'ev'].includes(a.id)) },
  { id: 'old', text: 'Live to 85', test: () => G.age >= 85 },
  { id: 'famous', text: 'Reach 100K followers', test: () => G.social && G.social.followers >= 1e5 },
  { id: 'pet', text: 'Adopt a pet', test: () => (G.pets || []).length > 0 },
  { id: 'power', text: 'Become a Legendary super (power 75)', test: () => S().level >= 75 },
  { id: 'nem', text: 'Defeat your nemesis', test: () => S().nemesis && S().nemesis.losses >= 1 },
  { id: 'rep', text: 'Reach 80 fame or infamy', test: () => S().rep >= 80 },
  { id: 'travel', text: 'Climb Granite Peak', test: () => G.flags.summit },
  { id: 'boss', text: 'Get promoted to Head or Chief', test: () => G.job && G.job.rank >= 3 },
];
function pickGoals() { return shuffle(GOALS).slice(0, 3).map(g => ({ id: g.id, done: false })); }
function checkGoals() {
  if (!G || !G.alive || !G.goals) return;
  G.goals.forEach(g => {
    if (g.done) return;
    const def = GOALS.find(x => x.id === g.id);
    let ok = false; try { ok = !!def.test(); } catch (e) { ok = false; }
    if (!ok) return;
    g.done = true; g.age = G.age;
    fx({ happy: 12 });
    say(`🎯 Life goal complete: <b>${def.text}</b>!`, 'achievement');
    showBadge(`🎯 ${def.text}`, 'Life goal complete');
    sfx('achievement');
  });
}

// ---------- ribbons ----------
function ribbon() {
  const s = G.super || {}, st = s.stats || {};
  const net = netWorth();
  const friends = G.people.filter(p => /^(Best )?Friend$/.test(p.role)).length;
  const list = [
    [s.ruler, '👑', 'The Conqueror', 'You ruled the entire planet.'],
    [s.savedWorld, '🌍', 'The Savior', 'You saved the world.'],
    [st.saved >= 1000, '🦸', 'The Legend', 'Thousands owe you their lives.'],
    [st.stolen >= 1e7, '🦹', 'The Mastermind', 'The greatest criminal of your age.'],
    [s.alignment === 'hero' && s.rep >= 60, '🌟', 'The Hero', 'The city will never forget you.'],
    [s.alignment === 'villain' && s.rep >= 60, '💀', 'The Menace', 'Your name still makes people shiver.'],
    [net >= 1e8, '💎', 'The Tycoon', 'You died fabulously rich.'],
    [G.flags.wasJailed && (G.record || 0) + (st.crimes || 0) >= 3, '⛓️', 'The Outlaw', 'You spent a lot of time on the wrong side of the law.'],
    [friends >= 8, '🦋', 'The Social Butterfly', 'Everyone was your friend.'],
    [G.edu.level >= 3 && G.stats.smarts >= 80, '🎓', 'The Genius', 'Brilliant to the very end.'],
    [G.age >= 95, '🎂', 'The Elder', 'You lived a very long life.'],
    [livingPets().length + (G.pets || []).length >= 4, '🐾', 'The Animal Whisperer', 'Pets adored you.'],
    [G.stats.happy >= 80, '😊', 'The Content', 'You lived a happy life.'],
    [G.age < 30, '💥', 'The Shooting Star', 'You lived fast and died young.'],
  ];
  const hit = list.find(x => x[0]);
  return hit ? { emoji: hit[1], name: hit[2], desc: hit[3] } : { emoji: '🎗️', name: 'The Ordinary', desc: 'A quiet life, well lived.' };
}

// ---------- Hall of Legends ----------
function recordLegend() {
  const meta = loadMeta();
  meta.legends = meta.legends || [];
  const s = G.super || {};
  const r = ribbon();
  meta.legends.unshift({
    name: `${G.first} ${G.last}`, alias: s.alias || '', alignment: s.alignment || '', power: s.power || '',
    age: G.age, cause: G.cause, net: netWorth(), ribbon: `${r.emoji} ${r.name}`, gen: G.generation || 1, city: G.city,
  });
  meta.legends = meta.legends.slice(0, 40);
  meta.lives = (meta.lives || 0) + 1;
  saveMeta(meta);
}
function showLegends() {
  const meta = loadMeta();
  const list = meta.legends || [];
  const ach = (meta.ach || []).length;
  popup({ emoji: '🏛️', title: 'Hall of Legends', cls: 'wide', always: true,
    text: `${meta.lives || 0} lives lived · ${ach}/${ACHIEVEMENTS.length} achievements earned<br><br>` + (list.length ? list.map(l =>
      `<div class="legend-row"><b>${esc(l.name)}</b>${l.alias ? ` · <span class="badge ${l.alignment}">${l.alignment === 'hero' ? '🦸' : '🦹'} ${esc(l.alias)}</span>` : ''}<br>
       <small>${l.ribbon} · Gen ${l.gen} · ${l.power ? POWERS[l.power].emoji + ' ' : ''}Died at ${l.age} (${esc(l.cause || '')}) · ${money(l.net)}</small></div>`).join('') : '<i>No legends yet. Live a life to be remembered.</i>'),
    choices: [{ label: 'Close' }] });
}

// ---------- generations ----------
function heirs() { return G.people.filter(p => p.alive && p.role === 'Child'); }
function continueAsChild(c) {
  const old = G;
  const inherit = Math.max(0, Math.round(netWorth() * 0.8));
  const parentAlias = old.super && old.super.alias;
  const deceased = { first: old.first, last: old.last, gender: old.gender, role: 'Parent', age: old.age, alive: false, bond: c.bond, knows: true };
  G = {
    v: 1, alive: true, first: c.first, last: c.last, gender: c.gender, city: old.city, age: c.age, skin: c.skin != null ? c.skin : old.skin,
    inbox: [], quests: {}, memories: [],
    stats: { happy: clamp(rand(40, 70)), health: rand(70, 100), smarts: rand(20, 90), looks: rand(20, 100) },
    money: inherit, debt: 0, assets: [], renting: false,
    edu: { level: c.age >= 18 ? 1 : 0, stage: c.age >= 5 && c.age < 18 ? (c.age < 11 ? 'Elementary School' : c.age < 14 ? 'Middle School' : 'High School') : '', years: 0, dropped: false },
    job: null, retiredJob: false, pension: 0,
    people: [], nextId: 0, used: {}, log: [], flags: {}, familyWealth: old.familyWealth,
    originAge: c.powered ? c.age + 1 : (c.age < 17 ? rand(c.age + 1, 17) : c.age + 1),
    super: null, prison: 0, cause: null,
    generation: (old.generation || 1) + 1, legacy: parentAlias ? { alias: parentAlias, alignment: old.super.alignment } : null,
    pets: (old.pets || []).filter(p => p.alive), social: { followers: 0 }, invest: {}, conditions: [],
    goals: pickGoals(), achievements: [],
  };
  addPerson(deceased);
  old.people.filter(p => p.role === 'Spouse' && p.alive).forEach(p => addPerson({ ...p, role: 'Parent', bond: clamp(c.bond) }));
  old.people.filter(p => p.role === 'Child' && p !== c).forEach(p => addPerson({ ...p, role: 'Sibling' }));
  initCity();
  newYearLog();
  say(`🧬 You are now ${esc(c.first)} ${esc(c.last)}, age ${c.age}, ${old.gender === 'm' ? 'son' : 'daughter'} of ${esc(old.first)} ${esc(old.last)}${parentAlias ? ` — the ${old.super.alignment} known as <b>${esc(parentAlias)}</b>` : ''}.`, 'super');
  if (inherit) say(`💰 You inherited ${money(inherit)}.`, 'good');
  if (parentAlias) say('Superpowers run in your family. Your own awakening is coming soon…', 'hint');
  // Children are aware of their parents' secret.
  save();
}

// ---------- sound ----------
let audioCtx = null;
function soundOn() { try { return localStorage.getItem('mysuperlife.sound') !== 'off'; } catch (e) { return true; } }
function toggleSound() { try { localStorage.setItem('mysuperlife.sound', soundOn() ? 'off' : 'on'); } catch (e) { /* ignore */ } }
function sfx(kind) {
  if (!soundOn()) return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const notes = {
      age: [[523, 0.06], [784, 0.08]], good: [[523, 0.08], [659, 0.08], [784, 0.12]], bad: [[330, 0.12], [247, 0.2]],
      power: [[392, 0.06], [587, 0.06], [880, 0.14]], hit: [[140, 0.07]], battle: [[220, 0.1], [330, 0.1], [440, 0.16]],
      achievement: [[659, 0.08], [784, 0.08], [1047, 0.2]], pop: [[880, 0.04]],
    }[kind] || [[600, 0.05]];
    let t = audioCtx.currentTime;
    notes.forEach(([f, d]) => {
      const o = audioCtx.createOscillator(), g = audioCtx.createGain();
      o.type = kind === 'hit' ? 'sawtooth' : 'triangle';
      o.frequency.value = f;
      g.gain.setValueAtTime(0.08, t); g.gain.exponentialRampToValueAtTime(0.001, t + d);
      o.connect(g); g.connect(audioCtx.destination); o.start(t); o.stop(t + d + 0.02);
      t += d * 0.9;
    });
    if (kind === 'bad' && navigator.vibrate) navigator.vibrate(60);
  } catch (e) { /* audio unavailable */ }
}

// ---------- profile ----------
function profilePanel() {
  const s = G.super;
  const out = h('div', {});
  out.append(h('div', { class: 'info' },
    h('div', {}, '🪪 ', h('b', {}, `${G.first} ${G.last}`), ` · ${G.gender === 'm' ? 'Male' : 'Female'} · Age ${G.age}`),
    h('div', {}, `📍 ${G.city} · Generation ${G.generation || 1}`),
    G.legacy ? h('div', {}, `🧬 Child of ${G.legacy.alignment === 'hero' ? 'the hero' : 'the villain'} ${G.legacy.alias}`) : null,
    h('div', {}, `🏦 Net worth: `, h('b', {}, money(netWorth()))),
    h('div', {}, `🎓 ${EDU_NAMES[G.edu.level]} · 💼 ${occupation()}`),
    G.social && G.social.followers ? h('div', {}, `📱 ${followersText(G.social.followers)} followers${G.social.verified ? ' ✔️' : ''}`) : null,
    G.record ? h('div', {}, `🚓 Criminal record: ${G.record} offense${G.record > 1 ? 's' : ''}`) : null,
    s && s.alias ? h('div', {}, `${s.alignment === 'hero' ? '🦸' : '🦹'} ${s.alias} · ${POWERS[s.power].name} · power ${s.level}`) : null));
  const w = G.world && G.world.age === G.age ? WORLD_EVENTS.find(e => e.id === G.world.id) : null;
  const f = FOCUSES.find(x => x.id === G.focus);
  if (f || w) out.append(h('div', { class: 'info' },
    f ? h('div', {}, `📖 This chapter is about `, h('b', {}, `${f.emoji} ${f.name}`), ` · ${f.desc.toLowerCase()}`) : null,
    w ? h('div', {}, `${w.emoji} World this year: ${w.headline}`) : null));
  if (activeQuests().length || questsDone()) out.append(section('Stories', questRows(),
    QUESTS.filter(q => qState(q.id) && qState(q.id).done).map(q => h('div', { class: 'goal done' }, `✅ ${q.emoji} ${q.title}`, h('small', {}, ` finished at ${qState(q.id).finished}`)))));
  out.append(section('Memories', (G.memories || []).slice(-6).reverse().map(m => h('div', { class: 'memory' }, h('b', {}, m.age), ' ', m.t)),
    row('📖', 'Read your whole story', `${(G.memories || []).length} memories`, showMemoir)));
  out.append(section('Life Goals', (G.goals || []).map(g => {
    const def = GOALS.find(x => x.id === g.id);
    return h('div', { class: `goal ${g.done ? 'done' : ''}` }, g.done ? '✅' : '⬜', ' ', def.text, g.done ? h('small', {}, ` age ${g.age}`) : null);
  })));
  const conds = (G.conditions || []).map(id => CONDITIONS.find(c => c.id === id));
  if (conds.length) out.append(section('Health Conditions', conds.map(c => row(c.emoji, c.name, c.cost ? `Treat for ${money(G.age < 18 ? 0 : c.cost)}` : 'Rest to recover', () => treat(c)))));
  const mine = G.achievements || [];
  out.append(section(`Achievements · ${mine.length}/${ACHIEVEMENTS.length}`, h('div', { class: 'ach-grid' }, ACHIEVEMENTS.map(a =>
    h('div', { class: `ach ${mine.includes(a.id) ? 'got' : ''}`, title: a.desc }, h('span', {}, mine.includes(a.id) ? a.emoji : '🔒'), h('b', {}, a.name), h('small', {}, a.desc))))));
  return out;
}
