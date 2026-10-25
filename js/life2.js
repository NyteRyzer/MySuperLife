// More life systems: pets, social media, side hustles, investing, street crime, trials, illnesses,
// holidays and moving to a new city.

// ---------- pets ----------
const PET_TYPES = [
  { kind: 'Dog', emoji: '🐕', cost: 300, life: 13, min: 6 }, { kind: 'Cat', emoji: '🐈', cost: 150, life: 16, min: 5 },
  { kind: 'Bunny', emoji: '🐇', cost: 80, life: 9, min: 5 }, { kind: 'Parrot', emoji: '🦜', cost: 600, life: 40, min: 10 },
  { kind: 'Lizard', emoji: '🦎', cost: 120, life: 15, min: 8 }, { kind: 'Snake', emoji: '🐍', cost: 250, life: 20, min: 12 },
  { kind: 'Pig', emoji: '🐖', cost: 400, life: 15, min: 10 }, { kind: 'Horse', emoji: '🐎', cost: 8000, life: 28, min: 18 },
];
const PET_NAMES = ['Biscuit', 'Rocket', 'Luna', 'Max', 'Pickles', 'Shadow', 'Waffles', 'Nugget', 'Thor', 'Pepper', 'Mochi', 'Ziggy', 'Bolt', 'Cosmo'];

function livingPets() { return (G.pets || []).filter(p => p.alive); }

function actAdoptPet() {
  if (G.prison > 0) return toast('No pets in prison.');
  if (livingPets().length >= 5) return toast('Your home is full of animals already!');
  popup({ emoji: '🐾', title: 'Animal Shelter', text: 'Rows of hopeful faces stare at you. Who comes home with you?', grid: true,
    choices: PET_TYPES.filter(t => G.age >= t.min).map(t => ({ label: `${t.emoji} ${t.kind}`, hint: money(t.cost), fn: () => namePet(t) })).concat([{ label: 'Not today' }]) });
}
function namePet(t) {
  if (G.money < t.cost && G.age >= 18) return toast(`You need ${money(t.cost)}.`);
  const sugg = shuffle(PET_NAMES).slice(0, 5);
  popup({ emoji: t.emoji, title: `Name Your ${t.kind}`, text: 'What will you call them?', input: { placeholder: 'Pet name', suggestions: sugg, max: 16 },
    choices: [{ label: 'Bring them home', fn: v => {
      if (G.age >= 18) G.money -= t.cost;
      const pet = { id: Date.now() + rand(0, 999), name: v || sugg[0], kind: t.kind, emoji: t.emoji, age: rand(0, 3), life: t.life + rand(-3, 3), bond: rand(60, 90), alive: true, powered: false };
      G.pets = G.pets || []; G.pets.push(pet);
      fx({ happy: rand(8, 14) });
      say(`${t.emoji} You adopted a ${t.kind.toLowerCase()} named ${esc(pet.name)}!`, 'good');
    } }] });
}
function petActions(pet) {
  popup({ emoji: pet.emoji, title: pet.name, text: `${pet.powered ? '⚡ Super ' : ''}${pet.kind} · Age ${pet.age}<br>Bond: <b>${pet.bond}%</b>`, choices: [
    { label: '🎾 Play together', fn: () => { if (!once('petplay' + pet.id)) return; pet.bond = clamp(pet.bond + rand(5, 12)); fx({ happy: rand(3, 7) }); toast(`${pet.name} loved it!`); } },
    { label: '🚶 Go for a walk', show: () => ['Dog', 'Pig', 'Horse'].includes(pet.kind), fn: () => { if (!once('petwalk' + pet.id)) return; pet.bond = clamp(pet.bond + 5); fx({ health: rand(2, 5), happy: 2 }); toast('Health up'); } },
    { label: '🎓 Teach a trick', fn: () => {
      if (!once('pettrick' + pet.id)) return;
      const trick = pick(['roll over', 'high five', 'play dead', 'fetch your slippers', 'spin in a circle']);
      if (chance(pet.bond / 120)) { pet.bond = clamp(pet.bond + 6); say(`${pet.emoji} You taught ${esc(pet.name)} to ${trick}!`); toast(`${pet.name} learned to ${trick}!`); } else toast(`${pet.name} just stared at you.`);
    } },
    { label: '🩺 Vet checkup ($150)', show: () => G.money >= 150, fn: () => { if (!once('petvet' + pet.id)) return; G.money -= 150; pet.life += 1; toast(`${pet.name} is healthy!`); } },
    { label: '🏠 Rehome', fn: () => { pet.alive = false; pet.rehomed = true; fx({ happy: -8 }); say(`You gave ${esc(pet.name)} to a new family.`); } },
    { label: 'Close' },
  ] });
}
function petsTick() {
  livingPets().forEach(p => {
    p.age++; p.bond = clamp(p.bond - rand(0, 3));
    if (p.age >= p.life && !p.powered && chance(0.5)) {
      p.alive = false; fx({ happy: -rand(8, 15) });
      say(`🌈 Your ${p.kind.toLowerCase()} ${esc(p.name)} passed away at age ${p.age}.`, 'bad');
    }
  });
  // Super pet: rare, only once you have powers.
  const cands = livingPets().filter(p => !p.powered);
  if (G.super && G.super.alignment && cands.length && chance(0.05)) {
    const p = pick(cands), pw2 = pick(['flight', 'telepathy', 'strength', 'speed', 'invisibility', 'electro']);
    p.powered = pw2;
    say(`⚡ Your ${p.kind.toLowerCase()} ${esc(p.name)} has developed ${POWERS[pw2].name}! They’re your new sidekick.`, 'super');
    popup({ emoji: p.emoji, title: 'Super Pet!', text: `You’ve been around ${esc(p.name)} so long that some of your power rubbed off. Your ${p.kind.toLowerCase()} now has <b>${POWERS[pw2].name}</b>!<br><br>Super pets help you in fights.`, choices: [{ label: 'Good pet!' }] });
  }
}
function superPetBonus() { return livingPets().filter(p => p.powered).length * 4; }

// ---------- social media ----------
function followersText(n) { return n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : n >= 1e3 ? (n / 1e3).toFixed(1) + 'K' : String(n); }
function socialPost(kind) {
  if (!once('post_' + kind)) return;
  G.social = G.social || { followers: 0 };
  const sc = G.social;
  const base = { selfie: 20 + G.stats.looks * 4, meme: 50 + G.stats.smarts * 2, stream: 30 + G.stats.smarts * 2 + G.stats.looks * 2, hero: 400 + (G.super ? G.super.rep * 40 : 0), dance: 40 + G.stats.looks * 3 }[kind];
  let gain = Math.round(base * (1 + Math.sqrt(sc.followers) / 60) * (0.5 + Math.random()));
  let viral = chance(kind === 'hero' ? 0.2 : 0.05);
  if (viral) gain *= rand(8, 25);
  let flop = !viral && chance(0.15);
  if (flop) gain = -Math.round(sc.followers * 0.02);
  sc.followers = Math.max(0, sc.followers + gain);
  const what = { selfie: 'a selfie', meme: 'a meme', stream: 'a livestream', hero: `blurry footage of ${G.super ? esc(G.super.alias) : 'a superhero'}`, dance: 'a dance video' }[kind];
  if (kind === 'hero') fx({ sus: 8 });
  fx({ happy: viral ? 12 : flop ? -4 : 3 });
  if (!sc.verified && sc.followers >= 100000) { sc.verified = true; say('✔️ Your account got verified!', 'good'); }
  say(`📱 You posted ${what}${viral ? ' and it went VIRAL' : flop ? ' and lost followers' : ''}. (${followersText(sc.followers)} followers)`, viral ? 'good' : '');
  if (viral) result('🔥', 'Viral!', `Your post exploded. You gained <b>${followersText(gain)}</b> followers overnight.`);
  else toast(flop ? `Flopped… ${followersText(sc.followers)} followers` : `+${followersText(gain)} followers`);
}
function socialTick() {
  const sc = G.social;
  if (!sc || sc.followers < 10000) return;
  const pay = Math.round(sc.followers / 1000 * rand(60, 140));
  G.money += pay;
  say(`📱 Brand deals and sponsorships paid you ${money(pay)} this year.`);
  sc.followers = Math.round(sc.followers * (0.92 + Math.random() * 0.1));
}

// ---------- side hustles ----------
const HUSTLES = [
  { id: 'lemonade', emoji: '🍋', name: 'Lemonade stand', min: 5, max: 14, pay: [15, 150] },
  { id: 'lawns', emoji: '🌱', name: 'Mow lawns', min: 10, pay: [100, 600], fx: { health: 2 } },
  { id: 'dogwalk', emoji: '🦮', name: 'Walk dogs', min: 11, pay: [200, 900], fx: { health: 2, happy: 2 } },
  { id: 'tutor', emoji: '📐', name: 'Tutor students', min: 14, pay: [600, 2500], need: () => G.stats.smarts >= 60, why: 'You need 60+ smarts.' },
  { id: 'sneakers', emoji: '👟', name: 'Flip sneakers online', min: 14, pay: [-500, 3000] },
  { id: 'design', emoji: '🎨', name: 'Freelance graphic design', min: 16, pay: [1000, 6000], fx: { smarts: 1 } },
  { id: 'rideshare', emoji: '🚗', name: 'Drive for a rideshare app', min: 18, pay: [3000, 11000], need: () => (G.assets || []).some(a => a.kind === 'car' && !['bike'].includes(a.id)), why: 'You need a car.' },
  { id: 'deliver', emoji: '🛵', name: 'Food delivery', min: 16, pay: [1500, 6000] },
  { id: 'stream', emoji: '🎮', name: 'Stream video games', min: 13, pay: [0, 500], streamer: true },
  { id: 'photo', emoji: '📸', name: 'Sell superhero photos to the Daily Beacon', min: 14, pay: [2000, 15000], need: () => G.super && G.super.alignment, why: 'You need to be a super to get the shots.', sus: 6 },
];
function doHustle(hu) {
  if (hu.need && !hu.need()) return toast(hu.why);
  if (!once('hustle_' + hu.id)) return;
  let pay = rand(hu.pay[0], hu.pay[1]);
  if (pay > 0) pay = Math.round(pay * worldMod('pay', 1));
  if (hu.streamer) pay += Math.round(((G.social && G.social.followers) || 0) / 50);
  G.money += pay;
  fx({ ...(hu.fx || {}), sus: hu.sus || 0 });
  say(`${hu.emoji} ${hu.name}: you ${pay >= 0 ? 'made' : 'lost'} ${money(Math.abs(pay))}.`, pay > 0 ? '' : 'bad');
  toast(pay >= 0 ? `+${money(pay)}` : `Lost ${money(-pay)}`);
}

// ---------- investing ----------
const FUNDS = [
  { id: 'index', emoji: '📈', name: 'Index Fund', desc: 'Steady · about +7% a year', ret: () => rand(-12, 25) },
  { id: 'tech', emoji: '💻', name: 'Tech Stocks', desc: 'Bumpy · big swings', ret: () => rand(-35, 55) },
  { id: 'crypto', emoji: '🪙', name: 'Crypto', desc: 'Wild · could moon or crash', ret: () => chance(0.06) ? -90 : rand(-60, 150) },
  { id: 'omni', emoji: '🏢', name: 'OmniCorp Shares', desc: 'Superhero-proof supply company', ret: () => rand(-10, 30) + (G.super && G.super.alignment && !isHero() ? 10 : 0) },
];
function invested() { return Object.values(G.invest || {}).reduce((t, v) => t + v, 0); }
function fundActions(f) {
  G.invest = G.invest || {};
  const has = G.invest[f.id] || 0;
  const amounts = [1000, 10000, 100000, 1000000].filter(a => a <= G.money);
  popup({ emoji: f.emoji, title: f.name, text: `${f.desc}<br><br>You have <b>${money(has)}</b> invested.`, grid: true, choices: amounts.map(a => ({
    label: `Invest ${money(a)}`, fn: () => { G.money -= a; G.invest[f.id] = has + a; say(`${f.emoji} You invested ${money(a)} in ${f.name}.`); },
  })).concat(G.money > 0 ? [{ label: `Invest all (${money(G.money)})`, fn: () => { const a = G.money; G.money = 0; G.invest[f.id] = has + a; say(`${f.emoji} You invested ${money(a)} in ${f.name}.`); } }] : [])
    .concat(has > 0 ? [{ label: `Cash out ${money(has)}`, cls: 'danger', fn: () => { G.money += has; G.invest[f.id] = 0; say(`${f.emoji} You cashed out ${money(has)} from ${f.name}.`); } }] : [])
    .concat([{ label: 'Close' }]) });
}
function investTick() {
  if (!G.invest) return;
  FUNDS.forEach(f => {
    const v = G.invest[f.id];
    if (!v) return;
    const r = f.ret();
    const nv = Math.max(0, Math.round(v * (1 + r / 100)));
    G.invest[f.id] = nv;
    if (Math.abs(nv - v) > 5000 || Math.abs(r) >= 40) say(`${f.emoji} ${f.name} ${r >= 0 ? 'rose' : 'fell'} ${Math.abs(r)}% (${r >= 0 ? '+' : '-'}${money(Math.abs(nv - v))}).`, r >= 0 ? 'good' : 'bad');
  });
}

// ---------- street crime ----------
const STREET_CRIMES = [
  { id: 'shoplift', emoji: '🛒', name: 'Shoplift', min: 10, catch: 0.25, loot: [10, 120], years: 1 },
  { id: 'pickpocket', emoji: '👛', name: 'Pickpocket a stranger', min: 13, catch: 0.3, loot: [20, 400], years: 1 },
  { id: 'carjack', emoji: '🚘', name: 'Steal a car', min: 16, catch: 0.35, loot: [3000, 20000], years: 3 },
  { id: 'burglary', emoji: '🏠', name: 'Burgle a mansion', min: 18, catch: 0.4, loot: [10000, 60000], years: 5 },
];
function doStreetCrime(c) {
  if (!once('crime_' + c.id)) return;
  const stealth = G.super ? pw('stealth', 1) : 1;
  if (chance(c.catch * stealth)) {
    G.record = (G.record || 0) + 1;
    say(`🚓 You got caught trying to ${c.name.toLowerCase()}.`, 'bad');
    if (G.age < 18) {
      fx({ happy: -10 });
      living('Parent').forEach(p => { p.bond = clamp(p.bond - 15); });
      return result('🚓', 'Busted', 'The police drove you home. Your parents are furious, and you have a juvenile record now.');
    }
    trial(c.name.toLowerCase(), c.years + (G.record > 2 ? 2 : 0));
  } else {
    const loot = rand(c.loot[0], c.loot[1]);
    G.money += loot;
    if (G.super && !isHero()) fx({ rep: 1 });
    fx({ happy: rand(2, 6) });
    say(`${c.emoji} You got away with ${money(loot)} (${c.name.toLowerCase()}).`);
    toast(`Got away with ${money(loot)}`);
  }
}

// ---------- trials ----------
// years = full sentence if convicted. onAcquit runs if you walk free.
function trial(charge, years, onAcquit) {
  const lawyers = [
    { label: '⚖️ Public defender', hint: 'Free', cost: 0, odds: 0.3 },
    { label: '💼 Good lawyer', hint: '$50,000', cost: 50000, odds: 0.5 },
    { label: '🦈 Legendary lawyer', hint: '$500,000', cost: 500000, odds: 0.72 },
    { label: '🧠 Represent yourself', hint: 'Based on smarts', cost: 0, odds: G.stats.smarts / 160 },
  ];
  popup({ emoji: '⚖️', title: 'Your Day in Court', text: `You’re charged with <b>${charge}</b>. If convicted, you face <b>${years} year${years === 1 ? '' : 's'}</b>.<br><br>Who will defend you?`,
    choices: lawyers.filter(l => G.money >= l.cost).map(l => ({ label: l.label, hint: l.hint, fn: () => {
      G.money -= l.cost;
      popup({ emoji: '🧑‍⚖️', title: 'How Do You Plead?', text: 'The courtroom goes quiet. The judge looks at you over her glasses.', choices: [
        { label: '🙇 Guilty (shorter sentence)', fn: () => goToPrison(Math.max(1, Math.ceil(years / 2)), 'You pleaded guilty and the judge went easy on you.') },
        { label: '🙅 Not guilty (risk the full sentence)', fn: () => {
          if (chance(l.odds)) {
            fx({ happy: 15 });
            G.flags.acquitted = true;
            say(`⚖️ You were found NOT GUILTY of ${charge}!`, 'good');
            if (onAcquit) onAcquit();
            result('🎉', 'Not Guilty!', `The jury foreman reads the verdict: <b>not guilty</b>. You walk out of the courthouse a free person.`);
          } else goToPrison(years, 'The jury found you guilty on all charges.');
        } },
      ] });
    } })) });
}

// ---------- illnesses ----------
const CONDITIONS = [
  { id: 'cold', heals: 0.7, emoji: '🤧', name: 'Bad Cold', drain: { happy: -2, health: -2 }, cost: 100, cure: 'doctor', min: 0, w: 4 },
  { id: 'arm', heals: 0.5, emoji: '🦴', name: 'Broken Arm', drain: { happy: -4, health: -3 }, cost: 2500, cure: 'cast', min: 3, w: 2 },
  { id: 'migraine', heals: 0.25, emoji: '🤕', name: 'Migraines', drain: { happy: -4 }, cost: 600, cure: 'medicine', min: 10, w: 2 },
  { id: 'anxiety', heals: 0.15, emoji: '😰', name: 'Anxiety', drain: { happy: -6 }, cost: 1500, cure: 'therapy', min: 12, w: 2 },
  { id: 'depression', emoji: '🌧️', name: 'Depression', drain: { happy: -8 }, cost: 2500, cure: 'therapy', min: 14, w: 1 },
  { id: 'asthma', emoji: '🫁', name: 'Asthma', drain: { health: -2 }, cost: 800, cure: 'inhaler', min: 3, w: 1 },
  { id: 'diabetes', emoji: '🩸', name: 'Diabetes', drain: { health: -3 }, cost: 5000, cure: 'treatment', min: 35, w: 1 },
  { id: 'heart', emoji: '🫀', name: 'Heart Disease', drain: { health: -5 }, cost: 40000, cure: 'surgery', min: 55, w: 1 },
  { id: 'burnout', heals: 0.35, emoji: '🔥', name: 'Power Burnout', drain: { health: -4, happy: -3 }, cost: 0, cure: 'rest', min: 5, w: 2, super: true },
];
function illnessTick() {
  G.conditions = G.conditions || [];
  G.conditions = G.conditions.filter(id => {
    const c = CONDITIONS.find(x => x.id === id);
    if (c.heals && chance(c.heals)) { say(`${c.emoji} Your ${c.name.toLowerCase()} went away on its own.`, 'good'); return false; }
    fx(c.drain);
    if (['heart', 'diabetes', 'asthma'].includes(c.id)) G.lastInjury = c.name.toLowerCase();
    return true;
  });
  if (G.super && pw('heal') && G.conditions.length && chance(0.6)) {
    const id = G.conditions.shift(); say(`🩹 Your healing factor cured your ${CONDITIONS.find(c => c.id === id).name.toLowerCase()}.`, 'good');
  }
  const pool = CONDITIONS.filter(c => G.age >= c.min && !G.conditions.includes(c.id) && (!c.super || (G.super && G.super.alignment && G.super.control < 50)));
  if (pool.length && chance(0.04 + (G.age > 50 ? 0.04 : 0) + (G.stats.health < 40 ? 0.03 : 0) + worldMod('ill', 0))) {
    const c = weightedPick(pool);
    G.conditions.push(c.id);
    say(`${c.emoji} You were diagnosed with ${c.name.toLowerCase()}.`, 'bad');
    popup({ emoji: c.emoji, title: 'Diagnosis', text: `The doctor says you have <b>${c.name}</b>. It’ll wear you down every year until it’s treated.`, choices: [
      { label: c.cost ? `Treat it now (${money(G.age < 18 ? 0 : c.cost)})` : 'Rest and recover', show: () => G.age < 18 || G.money >= c.cost, fn: () => treat(c) },
      { label: 'Deal with it later' },
    ] });
  }
}
function treat(c) {
  const cost = G.age < 18 ? 0 : c.cost;
  if (G.money < cost) return toast(`You need ${money(cost)}.`);
  if (c.id === 'burnout' && !once('rest')) return;
  G.money -= cost;
  const ok = chance(c.id === 'heart' ? 0.75 : 0.9);
  if (ok) { G.conditions = G.conditions.filter(x => x !== c.id); fx({ happy: 5 }); say(`${c.emoji} Your ${c.name.toLowerCase()} was cured.`, 'good'); toast(`Cured: ${c.name}`); }
  else { fx({ health: -5 }); say(`${c.emoji} Treatment for your ${c.name.toLowerCase()} didn’t work this time.`, 'bad'); toast('Treatment failed. Try again.'); }
}

// ---------- moving ----------
function actMove() {
  const cost = 5000;
  if (G.money < cost) return toast(`Moving costs ${money(cost)}.`);
  popup({ emoji: '🚚', title: 'Move to a New City', text: `A fresh start. Your job, your local friends and your ${G.super && G.super.alignment ? 'reputation with the local police' : 'routine'} all stay behind. Where to?`, grid: true,
    choices: CITIES.filter(c => c !== G.city).map(c => ({ label: c, fn: () => {
      G.money -= cost;
      const old = G.city; G.city = c; G.moves = (G.moves || 0) + 1;
      if (G.job) { say(`You left your job as a ${jobTitle(G.job)}.`); G.job = null; }
      G.people.filter(p => /Friend/.test(p.role)).forEach(p => { p.bond = clamp(p.bond - 20); });
      G.renting = false;
      if (G.super) { G.super.heat = clamp(G.super.heat - 40); if (!G.super.exposed) G.super.suspicion = clamp(G.super.suspicion - 30); G.super.team = null; }
      initCity();
      fx({ happy: 6 });
      say(`🚚 You moved from ${old} to ${c}.`, 'good');
    } })).concat([{ label: 'Stay put' }]) });
}

// ---------- holidays & birthdays (added to the yearly event pool) ----------
LIFE_EVENTS.push(
  { id: 'halloween', min: 4, max: 40, w: 2, fire() {
    popup({ emoji: '🎃', title: 'Halloween', text: 'Halloween night! What’s your costume?', choices: [
      { label: '👻 A spooky ghost', fn: () => { fx({ happy: 6 }); say(`🎃 You went ${G.age < 14 ? 'trick-or-treating' : 'to a Halloween party'} as a ghost.`); } },
      { label: '🧛 A vampire', fn: () => { fx({ happy: 6, looks: 1 }); say('🎃 You dressed up as a vampire for Halloween.'); } },
      { label: `🦸 Yourself (${G.super && G.super.alias ? esc(G.super.alias) : 'a superhero'})`, fn: () => {
        if (G.super && G.super.alias && !G.super.exposed) { fx({ happy: 10, sus: chance(0.3) ? 10 : -5 }); say(`🎃 You dressed as ${esc(G.super.alias)} for Halloween. Everyone said it was “so accurate.”`, 'super'); }
        else { fx({ happy: 7 }); say('🎃 You dressed up as a superhero for Halloween.'); }
      } },
    ] });
  } },
  { id: 'holidays', min: 3, max: 100, w: 2, fire() {
    const fam = G.people.filter(p => p.alive && ['Parent', 'Sibling', 'Spouse', 'Partner', 'Child'].includes(p.role));
    popup({ emoji: '🎁', title: 'Winter Holidays', text: 'Snow outside, lights everywhere, family in the living room.', choices: [
      { label: `🎁 Give everyone gifts${G.age >= 16 ? ' ($300)' : ''}`, show: () => G.age < 16 || G.money >= 300, fn: () => { if (G.age >= 16) G.money -= 300; fam.forEach(p => { p.bond = clamp(p.bond + rand(4, 10)); }); fx({ happy: 8 }); say('🎁 You gave your family holiday gifts. Everyone loved them.'); } },
      { label: '🍪 Bake cookies together', fn: () => { fam.forEach(p => { p.bond = clamp(p.bond + rand(2, 6)); }); fx({ happy: 6 }); say('🍪 You baked holiday cookies with your family.'); } },
      { label: '🎿 Go on a ski trip ($2,000)', show: () => G.age >= 16 && G.money >= 2000, fn: () => { G.money -= 2000; fx({ happy: 12, health: 2 }); say('🎿 You spent the holidays skiing in the mountains.'); } },
    ] });
  } },
  { id: 'birthday', min: 5, max: 100, w: 2, fire() {
    const friends = G.people.filter(p => p.alive && /Friend/.test(p.role));
    popup({ emoji: '🎂', title: `Happy ${ord(G.age)} Birthday!`, text: friends.length ? `${friends.length > 1 ? 'Your friends threw' : `${friends[0].first} threw`} you a surprise party! Time to make a wish.` : 'You blow out the candles on your cake. Make a wish!', choices: [
      { label: '💰 Wish for money', fn: () => { const m = chance(0.25) ? rand(50, 500) * (G.age >= 18 ? 10 : 1) : 0; G.money += m; fx({ happy: 4 }); say(m ? `🎂 Your birthday wish for money came true: ${money(m)}!` : '🎂 You wished for money on your birthday. Nothing happened.'); } },
      { label: '❤️ Wish for love', fn: () => { const p = partner(); if (p) { p.bond = clamp(p.bond + 10); } fx({ happy: 6 }); say('🎂 You wished for love on your birthday.'); } },
      { label: '⚡ Wish for powers', show: () => !G.super, fn: () => { fx({ happy: 3 }); say('🎂 You wished for superpowers on your birthday. Something stirred inside you…', 'hint'); if (G.originAge > G.age + 1 && chance(0.3)) G.originAge = G.age + 1; } },
      { label: '🌍 Wish for world peace', fn: () => { fx({ happy: 5 }); say('🎂 You wished for world peace on your birthday.'); } },
    ] });
  } },
);
