// Immersion: memories & memoir, life chapters, inner thoughts, world news, the phone,
// super romance, skin tones, atmosphere and background music.

const SKIN_TONES = ['', '🏻', '🏼', '🏽', '🏾', '🏿'];
function withSkin(emoji, skin) { return emoji + (skin || ''); }
const stripTags = s => String(s).replace(/<[^>]+>/g, '');

// ---------- memories ----------
const MEMORY_MARKERS = ['💍', '👶', '🎓', '💔', '⛓️', '📰', '🌍', '🧬', '🚚', '💕', '🎯', '🥇', '💀', '🔓', '📜', '📖', '🌟'];
function remember(text) {
  if (!G) return;
  G.memories = G.memories || [];
  const t = stripTags(text);
  if (G.memories.length && G.memories[G.memories.length - 1].t === t) return;
  G.memories.push({ age: G.age, t });
  if (G.memories.length > 120) G.memories.splice(0, G.memories.length - 120);
}
const LIFE_STAGES = [[0, 12, 'Childhood'], [13, 17, 'The Teenage Years'], [18, 29, 'Young Adulthood'], [30, 49, 'The Prime Years'], [50, 69, 'Later Life'], [70, 999, 'The Final Chapter']];
function memoirHTML() {
  const mem = G.memories || [];
  const parts = LIFE_STAGES.map(([a, b, name]) => {
    const list = mem.filter(m => m.age >= a && m.age <= b);
    if (!list.length) return '';
    return `<div class="memoir-stage"><h4>${name}</h4>${list.map(m => `<p><b>${m.age}</b> ${esc(m.t)}</p>`).join('')}</div>`;
  }).join('');
  return parts || '<i>A quiet life, with few stories to tell.</i>';
}
function showMemoir() {
  popup({ emoji: '📖', title: `The Life of ${G.first} ${G.last}`, cls: 'wide memoir', always: true, text: memoirHTML(), choices: [{ label: 'Close' }] });
}

// ---------- chapters & life focus ----------
const CHAPTERS = [
  { age: 13, n: 2, title: 'The Teenage Years', line: 'Your body is changing, your friends matter more than anything, and the world suddenly feels enormous.' },
  { age: 18, n: 3, title: 'Adulthood Begins', line: 'You’re officially an adult. Nobody is going to tell you what to do anymore. That’s exciting — and terrifying.' },
  { age: 30, n: 4, title: 'The Prime Years', line: 'Thirty. You know who you are now. Or at least, you’re starting to.' },
  { age: 50, n: 5, title: 'Later Life', line: 'Half a century behind you. The view from here is different.' },
  { age: 70, n: 6, title: 'The Final Chapter', line: 'Every year is a gift now. What will you do with the time you have left?' },
];
const FOCUSES = [
  { id: 'career', emoji: '💼', name: 'Ambition', desc: 'Your job performance climbs faster' },
  { id: 'love', emoji: '❤️', name: 'Love', desc: 'Easier dating, stronger relationships' },
  { id: 'adventure', emoji: '🧭', name: 'Adventure', desc: 'Extra happiness every year' },
  { id: 'health', emoji: '🍎', name: 'Health', desc: 'Your health holds up better' },
  { id: 'wealth', emoji: '💰', name: 'Wealth', desc: 'Your investments grow faster' },
  { id: 'power', emoji: '⚡', name: 'Power', desc: 'Training your powers works better', show: () => G.super && G.super.alignment },
];
function focusIs(id) { return G.focus === id; }
function checkChapter() {
  const c = CHAPTERS.find(x => x.age === G.age);
  if (!c || G.prison > 0) return;
  const s = G.super;
  const summary = [
    `😊 ${G.stats.happy}% · ❤️ ${G.stats.health}% · 🧠 ${G.stats.smarts}% · ✨ ${G.stats.looks}%`,
    `🏦 ${money(netWorth())}${G.job ? ` · 💼 ${jobTitle(G.job)}` : ''}`,
    s && s.alias ? `${s.alignment === 'hero' ? '🦸' : '🦹'} ${esc(s.alias)} · power ${s.level}` : '',
  ].filter(Boolean).join('<br>');
  popup({
    emoji: '📖', title: `Chapter ${c.n}`, cls: 'chapter',
    text: `<div class="chapter-name">${c.title}</div><p>${c.line}</p><div class="chapter-sum">${summary}</div><p><b>What will this chapter be about?</b></p>`,
    grid: true,
    choices: FOCUSES.filter(f => !f.show || f.show()).map(f => ({ label: `${f.emoji} ${f.name}`, hint: f.desc, fn: () => {
      G.focus = f.id;
      say(`📖 Chapter ${c.n}: ${c.title}. You decided this chapter is about ${f.name.toLowerCase()}.`, 'chapter');
    } })),
  });
}
function focusYearly() {
  if (!G.focus) return;
  if (focusIs('career') && G.job) G.job.perf = clamp(G.job.perf + 4);
  if (focusIs('love')) G.people.filter(p => p.alive && ['Partner', 'Spouse', 'Child', 'Parent'].includes(p.role)).forEach(p => { p.bond = clamp(p.bond + 3); });
  if (focusIs('adventure')) fx({ happy: rand(1, 4) });
  if (focusIs('health')) fx({ health: rand(0, 2) });
  if (focusIs('wealth') && G.invest) Object.keys(G.invest).forEach(k => { G.invest[k] = Math.round(G.invest[k] * 1.03); });
}

// ---------- inner thoughts ----------
function innerThought() {
  const s = G.super, p = partner(), n = s && s.nemesis;
  const opts = [];
  if (G.age < 5) opts.push('Everything is so big and new!', 'Why is the sky blue? Why is everything?');
  if (G.prison > 0) opts.push('These walls get closer every year.', 'I count the days. Then I lose count.');
  if (!s && G.age >= 5) opts.push('Sometimes I feel like I’m meant for something bigger.', 'Do superheroes ever feel normal?');
  if (s && s.alignment) {
    if (s.suspicion > 60 && !s.exposed) opts.push('Everyone is looking at me differently. Do they know?', 'One more slip and it’s over.');
    if (n && n.alive && !n.jailed) opts.push(`I can’t stop thinking about ${n.name}.`, `${n.name} is out there. Waiting.`);
    if (isHero()) opts.push('The city never sleeps. Neither do I.', 'Who saves the hero?', 'Every person I save is worth it.');
    else opts.push('They call me a monster. They have no idea.', 'Power is the only thing this world respects.', 'One day, they’ll all kneel.');
    if (s.exposed) opts.push('Strangers know my name now. My real name.');
  }
  if (G.stats.happy < 30) opts.push('Some days it’s hard to get out of bed.', 'I wish someone would just ask how I’m doing.');
  if (G.stats.health < 30) opts.push('My body isn’t what it used to be.', 'I should really see a doctor.');
  if (G.money > 1e6) opts.push('Money can’t buy everything. But it helps.');
  if (G.money < 100 && G.age >= 18) opts.push('How am I going to pay rent this month?');
  if (p) opts.push(`I should do something nice for ${p.first}.`, `I’m lucky to have ${p.first}.`);
  if (G.age >= 70) opts.push('Where did all the time go?', 'I hope I’ll be remembered.');
  if (livingPets().length) opts.push(`${livingPets()[0].name} is the only one who really gets me.`);
  if (!opts.length) opts.push('Another year. Let’s make it count.');
  say(`💭 <i>${pick(opts)}</i>`, 'thought');
}

// ---------- world news ----------
const WORLD_EVENTS = [
  { id: 'recession', emoji: '📉', headline: 'Global recession hits. Markets crash and jobs dry up.', mods: { pay: 0.6 }, now: () => { Object.keys(G.invest || {}).forEach(k => { G.invest[k] = Math.round(G.invest[k] * 0.85); }); } },
  { id: 'boom', emoji: '📈', headline: 'The economy is booming! Stocks hit record highs.', mods: { pay: 1.3 }, now: () => { Object.keys(G.invest || {}).forEach(k => { G.invest[k] = Math.round(G.invest[k] * 1.12); }); } },
  { id: 'panic', emoji: '😱', headline: 'Metahuman Panic: a viral video sparks fear of hidden supers. Everyone is watching their neighbors.', mods: { sus: 1.5 } },
  { id: 'parade', emoji: '🎉', headline: 'The city declares Hero Appreciation Day. Parades fill the streets.', now: () => { if (G.super && G.super.alignment) fx(isHero() ? { rep: 5, happy: 4 } : { heat: 6 }); } },
  { id: 'pandemic', emoji: '😷', headline: 'A nasty virus sweeps the globe. Hospitals are overwhelmed.', mods: { ill: 0.08 }, now: () => { fx({ health: -rand(2, 7) }); } },
  { id: 'tech', emoji: '🔬', headline: 'Tech breakthrough! Gadgets and electronics are suddenly cheap.', mods: { price: 0.75 } },
  { id: 'aliens', emoji: '🛸', headline: 'Strange lights over the Pacific. The government says it’s “weather balloons.”', now: () => { if (G.super && isHero()) G.flags.alienHint = true; } },
  { id: 'sports', emoji: '🏆', headline: `${G ? G.city : 'Your city'}’s team wins the championship! The whole city celebrates.`, now: () => fx({ happy: 5 }) },
  { id: 'election', emoji: '🗳️', headline: 'Election year! The race is between a pro-hero mayor and a Registration hardliner.', vote: true },
  { id: 'blackout', emoji: '🌑', headline: 'A massive blackout hits the city for three days. Crime spikes.', now: () => { (G.districts || []).forEach(d => { d.crime = clamp(d.crime + rand(4, 10)); }); } },
];
function worldMod(key, def) { const w = G.world; if (!w || w.age !== G.age) return def; const e = WORLD_EVENTS.find(x => x.id === w.id); return e && e.mods && e.mods[key] != null ? e.mods[key] : def; }
function worldNews() {
  if (G.age < 6 || !chance(0.35)) return;
  const e = pick(WORLD_EVENTS.filter(x => !G.world || x.id !== G.world.id));
  G.world = { id: e.id, age: G.age };
  const headline = e.id === 'sports' ? `${G.city}’s team wins the championship! The whole city celebrates.` : e.headline;
  say(`${e.emoji} <b>World news:</b> ${headline}`, 'world');
  if (e.now) e.now();
  if (e.vote && G.age >= 18) {
    popup({ emoji: '🗳️', title: 'Election Day', text: `${headline}<br><br>Who gets your vote?`, choices: [
      { label: '🦸 The pro-hero mayor', fn: () => { const won = chance(0.55); say(`🗳️ You voted for the pro-hero mayor. ${won ? 'They won!' : 'They lost.'}`); if (won && G.super) { if (isHero()) fx({ rep: 3 }); G.super.heat = clamp(G.super.heat - 10); } } },
      { label: '📜 The Registration hardliner', fn: () => { const won = chance(0.45); say(`🗳️ You voted for the Registration hardliner. ${won ? 'They won.' : 'They lost.'}`); if (won && G.super) fx({ heat: 8 }); } },
      { label: '🛋️ Stay home', fn: () => say('🗳️ You skipped the election.') },
    ] });
  }
}

// ---------- phone ----------
const MSG_TYPES = {
  parent: {
    make: () => { const p = pick(living('Parent')); return p && G.age >= 12 && { pid: p.id, from: p.first, emoji: '👪', text: pick(['Call your mother! 😘', 'Are you eating enough??', 'Proud of you, kiddo.', 'Your father wants to know how to send a gif.', 'Come home for dinner this weekend?']) }; },
    replies: (m, p) => [
      { label: '❤️ Love you too', fn: () => { p.bond = clamp(p.bond + 6); fx({ happy: 2 }); } },
      { label: '😑 Busy, talk later', fn: () => { p.bond = clamp(p.bond - 4); } },
      { label: '💸 Could you send some money?', show: () => G.age < 30, fn: () => { if (chance(p.bond / 140)) { const a = rand(50, 500) * Math.max(1, G.familyWealth); G.money += a; toast(`${p.first} sent ${money(a)}`); } else { p.bond = clamp(p.bond - 3); toast(`${p.first}: “Get a job!”`); } } },
    ],
  },
  friend: {
    make: () => { const f = pick(G.people.filter(p => p.alive && /^(Best )?Friend$/.test(p.role))); return f && { pid: f.id, from: f.first, emoji: TRAIT_EMOJI[f.trait] || '🙂', text: pick(['Party at my place Saturday. You in?', 'Wanna hang out this weekend?', 'Dude. You will NOT believe what just happened.', 'Movie night?? 🍿', 'I need to vent. Can you talk?']) }; },
    replies: (m, p) => [
      { label: '🙌 I’m in!', fn: () => { p.bond = clamp(p.bond + 8); fx({ happy: 5 }); say(`📱 You hung out with ${p.first} after they texted you.`); } },
      { label: '🙏 Can’t, sorry', fn: () => { p.bond = clamp(p.bond - 3); } },
    ],
  },
  partner: {
    make: () => { const p = partner(); return p && { pid: p.id, from: p.first, emoji: '💕', text: pick(['Thinking about you ❤️', 'Date night tonight?', 'Miss you already', 'Guess what I’m making for dinner 😏', 'Are we okay? You’ve been distant lately.']) }; },
    replies: (m, p) => [
      { label: '❤️ Me too', fn: () => { p.bond = clamp(p.bond + 8); fx({ happy: 3 }); } },
      { label: '🍷 Plan a romantic date ($150)', show: () => G.money >= 150, fn: () => { G.money -= 150; p.bond = clamp(p.bond + 14); fx({ happy: 6 }); say(`🍷 You took ${p.first} on a romantic date.`); } },
      { label: '😴 Leave them on read', fn: () => { p.bond = clamp(p.bond - 6); } },
    ],
  },
  nemesis: {
    make: () => { const s = G.super; const n = s && s.nemesis; return n && n.alive && !n.jailed && { from: n.name, emoji: '😈', text: pick([`Enjoy your peace while it lasts, ${s.alias}.`, `I know where you sleep. Do you know where I sleep?`, `Our next fight will be our last.`, `Tick tock, ${s.alias}.`, `I let you win last time. Never again.`]) }; },
    replies: () => {
      const s = G.super, n = s.nemesis;
      return [
        { label: '😤 “Bring it on.”', fn: () => { fx({ rep: 2, happy: 2 }); G.flags.taunted = true; } },
        { label: '📡 Trace the signal', fn: () => {
          if (chance(G.stats.smarts / 130 + (s.power === 'techno' ? 0.4 : 0))) {
            say(`📡 You traced ${n.name}’s message and ambushed them.`, 'super');
            if (s.energy > 0) { s.energy--; fightNemesis(`You traced the message to an abandoned subway station. ${n.name} wasn’t expecting you.`); }
            else result('📡', 'Found Them', `You traced the signal, but you’re too exhausted to fight this year.`);
          } else toast('The signal bounced through 40 countries. Lost it.');
        } },
        { label: '🚫 Block number', fn: () => {} },
      ];
    },
  },
  boss: {
    make: () => G.job && !G.job.pt && { from: 'Your boss', emoji: '💼', text: pick(['Need you in early tomorrow.', 'Can you stay late Friday?', 'Great work on that project.', 'We need to talk. My office. Now.']) },
    replies: () => [
      { label: '👍 On it!', fn: () => { G.job.perf = clamp(G.job.perf + 6); fx({ happy: -2 }); } },
      { label: '🙄 Leave me alone', fn: () => { G.job.perf = clamp(G.job.perf - 8); } },
    ],
  },
  fan: {
    make: () => { const s = G.super; return s && s.alignment && s.rep >= 25 && { from: `${s.alias} fan account`, emoji: isHero() ? '🤩' : '😨', text: isHero() ? pick([`OMG ${s.alias} saved my grandma!!! THANK YOU`, `My son dressed as ${s.alias} for Halloween 😭`, `${s.alias} if you see this I love you`]) : pick([`${s.alias} please don’t hurt my family`, `Why are you doing this, ${s.alias}?`, `${s.alias} is honestly iconic tho`]) }; },
    replies: () => [
      { label: `✍️ Reply as ${G.super.alias}`, fn: () => { fx({ happy: 4, rep: 1, sus: 3 }); say(`📱 You secretly replied to a fan as ${esc(G.super.alias)}. It went viral.`); } },
      { label: 'Ignore', fn: () => {} },
    ],
  },
  henchman: {
    make: () => { const s = G.super; return s && !isHero() && s.sidekick && { from: s.sidekick.name, emoji: '🫡', text: pick(['Boss, the cops are sniffin’ around the lair.', 'Boss, I think someone followed me.', 'Boss can I get a raise. Asking for me.']) }; },
    replies: () => [
      { label: '🕶️ Lay low for a while', fn: () => { G.super.heat = clamp(G.super.heat - 8); } },
      { label: '💵 Bribe the cops ($20,000)', show: () => G.money >= 20000, fn: () => { G.money -= 20000; G.super.heat = clamp(G.super.heat - 20); } },
      { label: '😠 Stop bothering me', fn: () => {} },
    ],
  },
  sibling: {
    make: () => { const p = pick(living('Sibling')); return p && G.age >= 12 && { pid: p.id, from: p.first, emoji: '🧑‍🤝‍🧑', text: pick(['Remember when we were kids? Miss you.', 'Mom is driving me crazy.', 'Can I borrow your car this weekend?', 'Happy birthday nerd 🎂']) }; },
    replies: (m, p) => [
      { label: '🥹 Miss you too', fn: () => { p.bond = clamp(p.bond + 7); } },
      { label: '🙃 Whatever', fn: () => { p.bond = clamp(p.bond - 4); } },
    ],
  },
  spam: {
    make: () => G.age >= 14 && { from: 'Unknown', emoji: '📢', text: pick(['CONGRATULATIONS! You’ve won a FREE cruise! Reply YES to claim!', 'Your package could not be delivered. Click here to pay $1.99 shipping.', 'Hot singles in your area want to meet YOU']) },
    replies: () => [
      { label: '😃 YES!!', fn: () => { const loss = Math.min(G.money, rand(100, 2500)); G.money -= loss; say(`📱 You fell for a scam text and lost ${money(loss)}.`, 'bad'); toast(`Scammed! -${money(loss)}`); } },
      { label: '🗑️ Delete', fn: () => {} },
    ],
  },
  quest: {
    make: () => null, // created by quests.js
    replies: (m) => [
      { label: '📖 “I’m listening.”', fn: () => startQuest(m.quest) },
      { label: '🗑️ Ignore it', fn: () => {} },
    ],
  },
};

function sendMessage(type, data) {
  G.inbox = G.inbox || [];
  G.inbox.unshift({ id: Date.now() + rand(0, 99999), type, read: false, age: G.age, ...data });
  if (G.inbox.length > 20) G.inbox.length = 20;
}
function phoneYearly() {
  if (G.age < 10 || G.prison > 0) return;
  const types = Object.keys(MSG_TYPES).filter(t => t !== 'quest');
  const n = rand(1, 3);
  for (let i = 0; i < n; i++) {
    const t = pick(types);
    const m = MSG_TYPES[t].make();
    if (m) sendMessage(t, m);
  }
}
function unreadCount() { return (G.inbox || []).filter(m => !m.read).length; }
function openMessage(m) {
  m.read = true;
  const T = MSG_TYPES[m.type];
  const p = m.pid ? G.people.find(x => x.id === m.pid) : null;
  if (m.pid && (!p || !p.alive)) { m.answered = true; return result('📱', m.from, `<div class="sms">${esc(m.text)}</div><br><i>You never got the chance to reply.</i>`); }
  const replies = m.answered ? [] : T.replies(m, p).filter(r => !r.show || r.show());
  popup({ emoji: m.emoji, title: m.from, cls: 'phone',
    text: `<div class="sms">${esc(m.text)}</div><small class="muted">Age ${m.age}</small>`,
    choices: (m.answered ? [] : replies.map(r => ({ label: r.label, fn: () => { m.answered = true; r.fn(); } }))).concat([{ label: m.answered ? 'Close' : 'Later' }]) });
}
function phonePanel() {
  const box = G.inbox || [];
  if (!box.length) return h('p', { class: 'muted' }, G.age < 10 ? 'You’re too young for a phone.' : 'No messages yet.');
  return h('div', { class: 'inbox' }, box.map(m => h('button', { class: `msg ${m.read ? '' : 'unread'} ${m.type === 'quest' ? 'quest' : ''}`, onclick: () => openMessage(m) },
    h('span', { class: 'msg-emoji' }, m.emoji),
    h('span', { class: 'msg-main' }, h('b', {}, m.from), h('small', {}, m.text)),
    h('span', { class: 'msg-age' }, m.answered ? '✓' : m.read ? '' : '●'))));
}

// ---------- super romance ----------
SUPER_EVENTS.push({
  id: 'superdate', w: 2, cond: () => !partner() && G.age >= 18 && G.age <= 55,
  fire() {
    const s = G.super;
    const forbidden = chance(0.35);
    const side = forbidden ? (isHero() ? 'villain' : 'hero') : s.alignment;
    const c = randomPerson(null, Math.max(18, G.age - 6), G.age + 6, 'Partner');
    const a = pick(side === 'hero' ? NPC_HEROES : NPC_VILLAINS).replace(/^(Captain|Lady|Doctor|Baron|Madame|Professor|Miss|The) /, '');
    const alias2 = `${pick(side === 'hero' ? ['Star', 'Silver', 'Night', 'Blue', 'Crimson'] : ['Black', 'Venom', 'Shadow', 'Scarlet', 'Iron'])} ${a.split(' ').pop()}`;
    popup({ emoji: forbidden ? '💔' : '💘', title: forbidden ? 'Forbidden Love' : 'Sparks on the Rooftop',
      text: forbidden
        ? `Mid-battle, the ${side} <b>${alias2}</b> has you pinned… and hesitates. Your eyes meet. Later, a note appears in your pocket: <i>“Same rooftop. Tomorrow. Come alone.”</i> Underneath the mask is <b>${c.first}</b>.`
        : `During a rooftop showdown, the ${side} <b>${alias2}</b> fights back-to-back with you. Afterward, they pull off their mask: <b>${c.first}</b>. “Coffee sometime? Out of costume?”`,
      choices: [
        { label: '💘 Say yes', fn: () => {
          const p = addPerson({ ...c, bond: rand(60, 85), knows: true, superAlias: alias2, superSide: side });
          fx({ happy: 12 });
          say(`💕 You started dating ${fullName(p)} — secretly the ${side} ${alias2}.`, 'super');
        } },
        { label: '🙅 Keep it professional', fn: () => say(`You turned down ${alias2}.`) },
      ] });
  },
});
function superPartner() { const p = partner(); return p && p.superAlias ? p : null; }

// ---------- atmosphere ----------
function updateAtmosphere() {
  const s = G && G.super;
  document.body.dataset.mood = !G ? '' : G.prison > 0 ? 'prison' : s && s.alignment && !s.retired ? s.alignment : G.age < 13 ? 'child' : '';
}

// ---------- background music ----------
let music = null;
function musicOn() { try { return localStorage.getItem('mysuperlife.music') === 'on'; } catch (e) { return false; } }
function setMusic(on) { try { localStorage.setItem('mysuperlife.music', on ? 'on' : 'off'); } catch (e) { /* ignore */ } on ? startMusic() : stopMusic(); }
function startMusic() {
  if (music) return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const master = audioCtx.createGain(); master.gain.value = 0.5; master.connect(audioCtx.destination);
    let step = 0;
    const tick = () => {
      const mood = document.body.dataset.mood;
      const scale = mood === 'villain' ? [220, 247, 262, 294, 330, 349, 415, 440] : mood === 'hero' ? [262, 294, 330, 392, 440, 523, 587, 659] : mood === 'prison' ? [196, 208, 233, 262, 277] : [294, 330, 349, 392, 440, 494, 523];
      const t = audioCtx.currentTime;
      if (step % 8 === 0) {
        [scale[0] / 2, scale[2] / 2].forEach(f => {
          const o = audioCtx.createOscillator(), g = audioCtx.createGain();
          o.type = 'sine'; o.frequency.value = f;
          g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.025, t + 1); g.gain.linearRampToValueAtTime(0.0001, t + 4.6);
          o.connect(g); g.connect(master); o.start(t); o.stop(t + 4.8);
        });
      }
      if (chance(0.6)) {
        const o = audioCtx.createOscillator(), g = audioCtx.createGain();
        o.type = 'triangle'; o.frequency.value = pick(scale);
        g.gain.setValueAtTime(0.018, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);
        o.connect(g); g.connect(master); o.start(t); o.stop(t + 1.2);
      }
      step++;
    };
    music = { timer: setInterval(tick, 600), master };
  } catch (e) { music = null; }
}
function stopMusic() {
  if (!music) return;
  clearInterval(music.timer);
  try { music.master.disconnect(); } catch (e) { /* ignore */ }
  music = null;
}
// Browsers only allow audio after a tap, so resume music on the first interaction.
document.addEventListener('pointerdown', () => { if (musicOn() && !music) startMusic(); }, { once: true });
