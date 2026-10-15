// Superpowers: origin story, secret identity, missions, nemesis, teams, arrests.

function pw(field, def = 0) {
  if (!G.super) return def;
  const a = POWERS[G.super.power][field];
  const b = G.super.second ? POWERS[G.super.second][field] : undefined;
  if (typeof a === 'number' && typeof b === 'number') {
    // multipliers (<1) take the best, bonuses add
    return (field === 'stealth' || field === 'armor' || field === 'gadget') ? Math.min(a, b) : a + Math.round(b / 2);
  }
  return a ?? b ?? def;
}
function isHero() { return G.super && G.super.alignment === 'hero'; }
function alias() { return G.super ? G.super.alias : ''; }
function repWord() { return isHero() ? 'Fame' : 'Infamy'; }
function tierName(l) { return l >= 95 ? 'Omega-Level' : l >= 75 ? 'Legendary' : l >= 50 ? 'Elite' : l >= 25 ? 'Adept' : 'Novice'; }
function maxEnergy() { return 3 + pw('energy', 0); }
function gadgetBonus() { return G.super.gadgets.reduce((t, id) => t + GADGETS.find(g => g.id === id).bonus, 0); }
function baseBonus() { return G.super.base >= 0 ? BASES[G.super.base].bonus : 0; }
function teamBonus() { return G.super.team ? G.super.team.bonus : 0; }
function priceMult() { return pw('gadget', 1); }

// Overall combat strength. Starts ~30, tops out ~150.
function combatScore() {
  const s = G.super;
  return s.level + pw('fight') + gadgetBonus() + baseBonus() + teamBonus() + (s.sidekick ? 4 : 0) + superPetBonus() + G.stats.health / 10;
}
function winChance(diff) { return clamp((combatScore() * 1.2 + 40 - diff) / 100, 0.05, 0.95); }

function injure(min, max, cause) {
  const s = G.super;
  let mult = pw('armor', 1);
  if (s && COSTUMES[s.costume].armor) mult *= COSTUMES[s.costume].armor;
  const dmg = Math.round(rand(min, max) * mult);
  G.stats.health = clamp(G.stats.health - dmg);
  G.lastInjury = cause || 'injuries sustained in battle';
  return dmg;
}

function spendEnergy() {
  const s = G.super;
  if (s.energy <= 0) { toast('You’re exhausted. Age up to recover your energy.'); return false; }
  s.energy--;
  return true;
}

// ---------- origin ----------
function originContext() {
  const school = G.edu.stage ? `your ${G.edu.stage.toLowerCase()}` : 'school';
  return { name: G.first, age: G.age, city: G.city, school, parent: parentName() };
}

function triggerOrigin() {
  const o = pick(ORIGINS);
  const c = originContext();
  say(`⚡ Something happened this year that changed your life forever…`, 'super');
  popup({
    emoji: o.emoji, title: o.title, cls: 'origin', text: o.text(c),
    choices: o.choices.map(ch => ({ label: ch.label, fn: () => originChoice(o, ch) })),
  });
}

function originChoice(o, ch) {
  fx(ch.fx);
  const powerId = pick(ch.powers);
  const p = POWERS[powerId];
  G.super = {
    origin: o.title, originAge: G.age, power: powerId, second: null,
    level: clamp(rand(5, 15) + (ch.tier || 0) + (G.legacy ? 6 : 0), 1, 46), control: rand(10, 30),
    alignment: null, alias: '', color: null, costume: 0, gadgets: [], base: -1,
    rep: 0, heat: 0, suspicion: 0, exposed: false, registered: null,
    team: null, sidekick: null, nemesis: null, agency: false, retired: false,
    energy: 0, doomsday: 0, ruler: false, savedWorld: false,
    stats: { missions: 0, saved: 0, defeated: 0, crimes: 0, stolen: 0, losses: 0 },
    lean: ch.lean || null,
  };
  if (p.smarts) fx({ smarts: p.smarts });
  if (p.looks) fx({ looks: p.looks });
  G.super.energy = maxEnergy();
  say(`${o.emoji} ${o.title}: ${ch.result}`, 'super');
  say(`${p.emoji} You gained ${p.kind === 'skill' ? 'the skill' : 'the power of'} ${p.name}!`, 'super');
  popup({
    emoji: p.emoji, title: p.kind === 'skill' ? 'A Legend Is Born' : 'Your Powers Awaken!', cls: 'origin',
    text: `${ch.result}<br><br>You now have <b>${p.name}</b>.<br><i>${p.desc}</i>`,
    choices: [{ label: 'Embrace your destiny', fn: chooseAlignment }],
  });
}

function chooseAlignment() {
  const lean = G.super.lean;
  const leanText = lean === 'hero' ? 'Deep down, you feel a pull toward protecting people.'
    : lean === 'villain' ? 'Deep down, a dark voice whispers that you deserve more than this.'
      : 'Your heart is torn.';
  popup({
    emoji: '⚖️', title: 'Hero or Villain?', cls: 'origin',
    text: `With great power comes a big decision. ${leanText}<br><br>Who will you become?`,
    choices: [
      { label: '🦸 Become a Hero', cls: 'hero', fn: () => { G.super.alignment = 'hero'; chooseAlias(); } },
      { label: '🦹 Become a Villain', cls: 'villain', fn: () => { G.super.alignment = 'villain'; chooseAlias(); } },
    ],
  });
}

function suggestAliases(powerId, alignment, gender) {
  const theme = ALIAS.theme[powerId] || ALIAS.heroWords;
  const g = gender === 'm' ? 'm' : 'f';
  const hero = alignment === 'hero';
  const pre = hero ? ALIAS.heroPre[g] : ALIAS.villPre[g];
  const words = hero ? ALIAS.heroWords : ALIAS.villWords;
  const youth = G.age < 18 ? (g === 'm' ? 'boy' : 'girl') : null;
  const out = new Set();
  let guard = 0;
  while (out.size < 6 && guard++ < 60) {
    const t = pick(theme);
    switch (rand(0, 4)) {
      case 0: out.add(`${pick(pre)} ${t}`); break;
      case 1: out.add(t); break;
      case 2: out.add(`The ${t}`); break;
      case 3: out.add(`${pick(pre)} ${pick(words)}`); break;
      default: {
        if (!hero) { out.add(`${t} ${pick(words)}`); break; }
        const suf = youth && chance(0.5) ? youth : pick(ALIAS.heroSuf[g]);
        out.add(t.includes(' ') ? `${t} ${suf[0].toUpperCase()}${suf.slice(1)}` : `${t}${suf === 'Knight' ? ' Knight' : suf}`);
      }
    }
  }
  return [...out];
}

function chooseAlias() {
  const s = G.super;
  popup({
    emoji: s.alignment === 'hero' ? '🦸' : '🦹', title: 'Choose Your Name', cls: 'origin',
    text: `Every ${s.alignment} needs a name the world will remember. Type your own or tap a suggestion.`,
    input: { placeholder: 'Your super name', suggestions: suggestAliases(s.power, s.alignment, G.gender), max: 28 },
    choices: [{ label: 'That’s my name', fn: name => { s.alias = name || suggestAliases(s.power, s.alignment, G.gender)[0]; chooseColor(); } }],
  });
}

function chooseColor() {
  popup({
    emoji: '🎨', title: 'Design Your Costume', cls: 'origin',
    text: `What colors will <b>${esc(alias())}</b> wear? (You’re starting with a homemade costume — upgrade it later.)`,
    choices: COSTUME_COLORS.map(c => ({ label: `${c.emoji} ${c.name}`, fn: () => { G.super.color = c.name; finishOrigin(); } })),
    grid: true,
  });
}

function finishOrigin() {
  const s = G.super;
  const p = POWERS[s.power];
  const hero = s.alignment === 'hero';
  say(`${hero ? '🦸' : '🦹'} You became the ${hero ? 'superhero' : 'supervillain'} <b>${esc(s.alias)}</b>, wearing ${s.color}. Nobody knows that ${esc(s.alias)} is really ${esc(G.first)} ${esc(G.last)}.`, 'super');
  popup({
    emoji: hero ? '🦸' : '🦹', title: s.alias, cls: 'origin',
    text: `${hero ? 'A new hero rises' : 'A new villain emerges'} in ${G.city}!<br><br>
      ${p.emoji} <b>${p.name}</b> · ${tierName(s.level)} (power ${s.level})<br>
      🎭 Secret identity: <b>${esc(G.first)} ${esc(G.last)}</b><br><br>
      Open the <b>⚡ Powers</b> tab to ${hero ? 'patrol the city, fight villains and protect your secret identity' : 'plan heists, battle heroes and stay one step ahead of the law'}.
      Every mission raises <b>Suspicion</b> — if it hits 100%, the world learns who you are.`,
    choices: [{ label: hero ? 'Up, up and away!' : 'Muahahaha!' }],
  });
}

// ---------- secret identity ----------
function addSuspicion(n) {
  const s = G.super;
  if (!s || s.exposed || n === 0) return;
  if (n > 0) n = Math.round(n * COSTUMES[s.costume].mult * pw('stealth', 1));
  s.suspicion = clamp(s.suspicion + n);
  if (s.suspicion >= 100) exposeIdentity('The press connected the dots.');
}

function exposeIdentity(how) {
  const s = G.super;
  if (s.exposed) return;
  s.exposed = true; s.suspicion = 100;
  G.people.forEach(p => { p.knows = true; });
  const hero = isHero();
  say(`📰 EXPOSED! The whole world now knows that ${esc(s.alias)} is ${esc(G.first)} ${esc(G.last)}.`, 'bad');
  let extra = '';
  if (hero) {
    fx({ rep: 10, happy: -10 });
    extra = 'Fans swarm your house. Reporters camp on your lawn. And every villain now knows where your family lives.';
  } else {
    fx({ heat: 40, happy: -10 });
    extra = 'Your face is on every wanted poster in the country.';
    if (G.job) { say(`You were fired from your job as a ${jobTitle(G.job)}.`, 'bad'); G.job = null; extra += ' Your boss fired you on live TV.'; }
  }
  popup({ emoji: '📰', title: 'Identity Exposed!', text: `${how}<br><br>The headline reads: <b>“${esc(s.alias.toUpperCase())} UNMASKED: IT’S ${esc(G.first.toUpperCase())} ${esc(G.last.toUpperCase())}!”</b><br><br>${extra}`, choices: [{ label: 'Uh oh.' }] });
}

// ---------- yearly ----------
function superYearly() {
  const s = G.super;
  s.energy = maxEnergy();
  if (s.retired) return;
  if (!s.exposed) s.suspicion = clamp(s.suspicion - rand(2, 6));
  s.heat = clamp(s.heat - rand(3, 8));
  if (G.prison === 0) { cityYearly(); if (s.activeLastYear || chance(0.3)) headline(); }
  if (!s.activeLastYear && s.rep > 10) s.rep = clamp(s.rep - rand(1, 4));
  s.activeLastYear = false;
  s.control = clamp(s.control + rand(0, 2));
  if (s.team && G.prison === 0) G.money += s.team.pay;
  if (s.sidekick && !isHero()) {
    const cost = 20000;
    if (G.money >= cost) G.money -= cost;
    else { say(`Your henchman ${s.sidekick.name} quit because you couldn’t pay them.`, 'bad'); s.sidekick = null; }
  }
  const n = s.nemesis;
  if (n && n.alive) {
    n.level = clamp(n.level + rand(1, 4), 1, 120);
    if (n.jailed > 0 && --n.jailed === 0) say(`🚨 Your nemesis ${n.name} has escaped from prison!`, 'bad');
  }
  // Wanted villains (and rogue vigilantes) get hunted down.
  if (G.prison === 0 && s.heat >= 40 && chance((s.heat - 20) / 200)) arrestEvent();
}

function markActive() { G.super.activeLastYear = true; G.super.stats.missions++; }

// ---------- nemesis ----------
function makeNemesis() {
  const s = G.super;
  const hero = isHero();
  const powerId = pick(Object.keys(POWERS).filter(k => k !== s.power));
  s.nemesis = {
    name: pick(hero ? NPC_VILLAINS : NPC_HEROES), power: powerId, alignment: hero ? 'villain' : 'hero',
    level: clamp(s.level + rand(0, 12), 10, 100), wins: 0, losses: 0, alive: true, jailed: 0,
  };
  return s.nemesis;
}
function nemesisAvailable() { const n = G.super.nemesis; return n && n.alive && !n.jailed; }

function fightNemesis(context) {
  const s = G.super, n = s.nemesis;
  const np = POWERS[n.power];
  markActive();
  duel(n.level + 30, { name: n.name, power: n.power }, context, () => {
    n.losses++;
    fx({ rep: rand(6, 12), happy: 10, control: 2, level: rand(1, 3) });
    say(`⚔️ You ${pick(POWERS[s.power].verbs)} your nemesis ${n.name} and won the battle!`, 'good');
    const choices = isHero()
      ? [
        { label: 'Hand them over to the authorities', fn: () => { n.jailed = rand(3, 8); s.stats.defeated++; fx({ rep: 5 }); say(`${n.name} was locked up in Blackgate Maximum Security.`); } },
        { label: 'Let them go', fn: () => { fx({ rep: -3 }); say(`You let ${n.name} escape. They swore they’d be back.`); } },
      ]
      : [
        { label: 'Finish them for good', fn: () => { n.alive = false; s.stats.defeated++; fx({ rep: 15, heat: 25, happy: 5 }); say(`💀 You destroyed your nemesis ${n.name}. The world mourns its fallen hero.`, 'bad'); } },
        { label: 'Humiliate them on live TV', fn: () => { fx({ rep: 10, heat: 10 }); say(`You broadcast ${n.name}’s defeat to the whole world.`); } },
        { label: 'Leave them beaten', fn: () => { say(`You left ${n.name} beaten in the rubble.`); } },
      ];
    popup({ emoji: '🏆', title: 'Victory!', text: `You ${pick(POWERS[s.power].verbs)} <b>${n.name}</b>! Their ${np.name.toLowerCase()} was no match for you.<br><br>What now?`, choices });
  }, () => {
    n.wins++;
    const dmg = injure(12, 35, `a battle with ${n.name}`);
    fx({ rep: -rand(3, 8), happy: -10, sus: 6 });
    say(`💥 Your nemesis ${n.name} defeated you in battle. (-${dmg} health)`, 'bad');
    result('💥', 'Defeated', `<b>${n.name}</b> used ${np.name.toLowerCase()} to beat you badly. You barely escaped with your life. (-${dmg} health)`);
  });
}

// ---------- actions (called from the Powers panel) ----------
function actTrain() {
  if (!spendEnergy()) return;
  const s = G.super;
  const gain = Math.max(1, Math.round(rand(2, 6) * (s.level < 50 ? 1 : s.level < 80 ? 0.6 : 0.35)));
  s.level = clamp(s.level + gain);
  s.control = clamp(s.control + rand(3, 8));
  fx({ health: rand(0, 3) });
  if (s.control < 35 && chance(0.25)) {
    const dmg = injure(5, 15, 'a training accident');
    fx({ sus: 12 });
    say(`💥 You lost control while training and wrecked a city block! (-${dmg} health)`, 'bad');
    result('💥', 'Out of Control!', `Your ${POWERS[s.power].name.toLowerCase()} surged out of control during training. Half a city block is in ruins and the news is asking questions. (-${dmg} health, +suspicion)`);
  } else {
    say(`🏋️ You trained your ${POWERS[s.power].name.toLowerCase()}. (+${gain} power)`);
    sfx('power');
    toast(`Power +${gain} · Control up`);
  }
}

function actPatrol() {
  if (!spendEnergy()) return;
  const s = G.super;
  const scene = pick(PATROLS);
  markActive();
  if (chance(winChance(scene.d))) {
    const saved = rand(scene.saved[0], scene.saved[1]);
    s.stats.saved += saved;
    fx({ rep: scene.rep, happy: rand(3, 8), sus: rand(2, 6), level: chance(0.4) ? 1 : 0 });
    say(`🦸 On patrol you stopped ${scene.t}.${saved ? ` You saved ${saved} ${saved === 1 ? 'life' : 'lives'}!` : ''}`, 'good');
    result('🦸', 'Hero of the Day', `While patrolling ${G.city}, you found ${scene.t}. You ${pick(POWERS[s.power].verbs)} the trouble and saved the day!${saved ? `<br><br>👥 ${saved} ${saved === 1 ? 'person' : 'people'} saved.` : ''}`);
  } else {
    const dmg = injure(5, 10 + scene.d / 2, 'injuries on patrol');
    fx({ rep: -2, happy: -6, sus: rand(4, 8) });
    s.stats.losses++;
    say(`🤕 You tried to stop ${scene.t}, but it went badly. (-${dmg} health)`, 'bad');
    result('🤕', 'Rough Night', `You tried to stop ${scene.t}, but things went wrong. The news is calling ${esc(s.alias)} “a menace.” (-${dmg} health)`);
  }
}

function actHuntVillain() {
  if (!spendEnergy()) return;
  const s = G.super;
  const name = pick(NPC_VILLAINS.filter(v => !s.nemesis || v !== s.nemesis.name));
  const d = rand(20, 45) + Math.round(s.level / 3);
  markActive();
  duel(d, { name, power: pick(Object.keys(POWERS)) }, `You tracked the supervillain <b>${name}</b> to an abandoned warehouse. They were waiting for you.`, () => {
    s.stats.defeated++;
    fx({ rep: rand(6, 12), happy: 8, sus: rand(3, 7), level: rand(1, 2) });
    say(`🦸 You tracked down the supervillain ${name} and put them behind bars!`, 'good');
    result('🦸', 'Villain Captured', `You tracked <b>${name}</b> to an abandoned warehouse and ${pick(POWERS[s.power].verbs)} them. ${name} is going to prison!`);
    if (!s.nemesis && chance(0.3)) {
      const n = makeNemesis();
      n.name = name; n.jailed = rand(2, 4);
      say(`${name} swore revenge from behind bars. You have a nemesis.`, 'bad');
    }
  }, () => {
    const dmg = injure(10, 25, `a fight with ${name}`);
    fx({ rep: -4, happy: -8, sus: 5 });
    s.stats.losses++;
    say(`🤕 The supervillain ${name} got away and left you bruised. (-${dmg} health)`, 'bad');
    result('🤕', 'They Got Away', `<b>${name}</b> was ready for you. You lost the fight and they escaped. (-${dmg} health)`);
  });
}

function actCrime() {
  const s = G.super;
  popup({
    emoji: '🦹', title: 'Plan a Crime', text: 'What’s the scheme this time? Bigger crimes pay more — and bring more heat.',
    choices: CRIMES.map(c => ({
      label: `${c.emoji} ${c.t}`, hint: `${Math.round(winChance(c.d) * 100)}% success`,
      fn: () => doCrime(c),
    })).concat([{ label: 'Never mind' }]),
  });
}
function doCrime(c) {
  if (!spendEnergy()) return;
  const s = G.super;
  markActive();
  if (chance(winChance(c.d))) {
    const cash = Math.round(rand(c.cash[0], c.cash[1]) * (1 + pw('money') / 100) * (1 + s.level / 200));
    G.money += cash;
    s.stats.crimes++; s.stats.stolen += cash;
    fx({ rep: c.inf, heat: c.heat, happy: rand(5, 10), sus: rand(3, 7) });
    say(`🦹 ${c.t}: success! You got away with ${money(cash)}.`, 'good');
    result(c.emoji, 'Crime Pays', `${c.t} — success! You ${pick(POWERS[s.power].verbs)} the guards and escaped with <b>${money(cash)}</b>.`);
    if (!s.nemesis && s.stats.crimes >= 2 && chance(0.4)) {
      const n = makeNemesis();
      say(`🦸 A hero calling themselves ${n.name} has sworn to stop you. You have a nemesis.`, 'bad');
    }
  } else {
    const dmg = injure(8, 22, 'a heist gone wrong');
    s.stats.losses++;
    fx({ heat: Math.round(c.heat * 1.5), happy: -8, sus: rand(5, 10) });
    say(`🚨 ${c.t}: it all went wrong. (-${dmg} health)`, 'bad');
    result('🚨', 'Busted!', `The heist went sideways — the alarms went off and a hero showed up. You barely escaped. (-${dmg} health, heat rising)`);
  }
}

function actFightHero() {
  if (!spendEnergy()) return;
  const s = G.super;
  const name = pick(NPC_HEROES.filter(v => !s.nemesis || v !== s.nemesis.name));
  const d = rand(20, 45) + Math.round(s.level / 3);
  markActive();
  duel(d, { name, power: pick(Object.keys(POWERS)) }, `You lure the hero <b>${name}</b> into a trap on a rooftop downtown.`, () => {
    s.stats.defeated++;
    fx({ rep: rand(6, 12), heat: rand(5, 12), happy: 8, level: rand(1, 2) });
    say(`🦹 You ambushed the hero ${name} and crushed them!`, 'good');
    result('🦹', 'Hero Humbled', `You lured <b>${name}</b> into a trap and ${pick(POWERS[s.power].verbs)} them. The city trembles.`);
  }, () => {
    const dmg = injure(10, 25, `a fight with ${name}`);
    fx({ rep: -3, heat: 10, happy: -8 });
    s.stats.losses++;
    say(`🤕 The hero ${name} beat you and nearly captured you. (-${dmg} health)`, 'bad');
    result('🤕', 'Foiled!', `<b>${name}</b> foiled your plans and nearly dragged you to prison. (-${dmg} health)`);
  });
}

function actNemesis() {
  if (!nemesisAvailable()) return;
  if (!spendEnergy()) return;
  fightNemesis('You hunted down your nemesis. ');
}

function actPress() {
  if (!once('press')) return;
  const s = G.super;
  markActive();
  if (isHero()) {
    fx({ rep: rand(3, 7), sus: rand(3, 8), happy: 4 });
    say(`🎤 ${esc(s.alias)} gave an exclusive interview to the Daily Beacon.`);
    result('🎤', 'Press Conference', `The city loved hearing from ${esc(s.alias)}! (+${repWord().toLowerCase()}, but the reporter asked a lot of personal questions…)`);
  } else {
    fx({ rep: rand(4, 8), heat: rand(5, 10), happy: 4 });
    say(`📺 You hijacked every TV in ${G.city} to deliver a chilling manifesto.`);
    result('📺', 'Broadcast Hijacked', `“People of ${G.city}… your heroes cannot save you.” Every screen in the city showed your face (well, your mask). (+infamy, +heat)`);
  }
}

function actLayLow() {
  if (!once('laylow')) return;
  const s = G.super;
  s.heat = clamp(s.heat - rand(12, 25));
  if (!s.exposed) s.suspicion = clamp(s.suspicion - rand(8, 15));
  fx({ happy: 3 });
  say('🕶️ You laid low and lived a normal life for a while.');
  toast('Heat and suspicion dropped');
}

function actDoomsday() {
  const s = G.super;
  if (s.doomsday >= 100) return activateDoomsday();
  const cost = 150000;
  if (G.money < cost) return toast(`You need ${money(cost)} for parts.`);
  if (!spendEnergy()) return;
  G.money -= cost;
  const prog = rand(15, 30);
  s.doomsday = clamp(s.doomsday + prog);
  fx({ heat: rand(3, 8) });
  say(`☢️ You worked on your doomsday device. (${s.doomsday}% complete)`, 'super');
  toast(`Doomsday device: ${s.doomsday}%`);
}

function activateDoomsday() {
  const s = G.super;
  popup({
    emoji: '☢️', title: 'The Doomsday Device',
    text: 'It’s finished. With one button, you can hold the entire planet hostage. Every hero on Earth will try to stop you.',
    choices: [
      { label: 'Activate it. The world will be mine!', fn: () => {
        if (!spendEnergy()) return;
        markActive();
        if (chance(winChance(85))) {
          s.ruler = true; s.rep = 100; G.money += 1000000000; s.doomsday = 0;
          fx({ happy: 40 });
          say(`🌍 The world surrendered. ${esc(s.alias)} is now Supreme Ruler of Earth.`, 'super');
          result('🌍', 'Supreme Ruler of Earth', `Every government on Earth has surrendered. Statues of <b>${esc(s.alias)}</b> are being built in every capital. You are now the ruler of the world.`);
        } else {
          s.doomsday = 0;
          const dmg = injure(20, 45, 'the battle for Earth');
          say(`🦸 The world’s heroes destroyed your doomsday device. (-${dmg} health)`, 'bad');
          if (G.stats.health > 0) { fx({ heat: 50 }); goToPrison(rand(15, 30), 'The world’s greatest heroes smashed your doomsday device and dragged you away in power-dampening chains.'); }
        }
      } },
      { label: 'Not yet…' },
    ],
  });
}

function actBuyCostume() {
  const s = G.super;
  const next = COSTUMES[s.costume + 1];
  if (!next) return;
  const cost = Math.round(next.cost * priceMult());
  if (G.money < cost) return toast(`You need ${money(cost)}.`);
  G.money -= cost; s.costume++;
  say(`🎭 You upgraded to a ${next.name}.`);
  toast(`New costume: ${next.name}`);
}

function actBuyGadget(g) {
  const s = G.super;
  const cost = Math.round(g.cost * priceMult());
  if (s.gadgets.includes(g.id)) return;
  if (G.money < cost) return toast(`You need ${money(cost)}.`);
  G.money -= cost; s.gadgets.push(g.id);
  say(`${g.emoji} You ${pw('gadget', 1) < 1 ? 'built' : 'bought'} a ${g.name}.`);
  toast(`Got: ${g.name}`);
}

function actBuyBase() {
  const s = G.super;
  const next = BASES[s.base + 1];
  if (!next) return;
  const cost = Math.round(next.cost * priceMult());
  if (G.money < cost) return toast(`You need ${money(cost)}.`);
  G.money -= cost; s.base++;
  say(`🏰 You set up your new base: the ${next.name[s.alignment]}.`, 'good');
  toast(`New base: ${next.name[s.alignment]}`);
}

function actJoinTeam(t) {
  const s = G.super;
  if (s.rep < t.rep) return toast(`You need ${t.rep} ${repWord().toLowerCase()}.`);
  if (!once('team')) return;
  if (chance(0.55 + (s.rep - t.rep) / 80)) {
    s.team = { ...t };
    fx({ happy: 10 });
    say(`🤝 You joined ${t.name}!`, 'good');
    result('🤝', 'Welcome to the Team', `<b>${t.name}</b> welcomed you as a member. You’ll get backup on missions and a yearly cut of ${money(t.pay)}.`);
  } else {
    result('🙅', 'Rejected', `${t.name} turned you down. Build your reputation and try again next year.`);
  }
}

function actRecruit() {
  const s = G.super;
  if (!once('recruit')) return;
  const p = randomPerson(null, 14, 25, 'Ally');
  const nick = isHero() ? `Kid ${pick(ALIAS.theme[s.power] || ALIAS.heroWords)}` : pick(['Knuckles', 'Tiny', 'Scratch', 'Lefty', 'Bones', 'Sparky', 'Mugsy']);
  if (s.rep >= 25 && chance(0.6)) {
    s.sidekick = { name: `${nick}`, real: fullName(p) };
    say(`🫡 ${p.first} joined you as your ${isHero() ? 'sidekick' : 'henchman'}, “${nick}.”`, 'good');
    result('🫡', isHero() ? 'New Sidekick' : 'New Henchman', `<b>${esc(p.first)}</b> wants to fight by your side as <b>${nick}</b>.${isHero() ? '' : ' They’ll cost $20,000 a year.'}`);
  } else result('🤷', 'No Takers', 'Nobody wanted the job this year. Raise your reputation and try again.');
}

function actRevealIdentity() {
  popup({
    emoji: '🎭', title: 'Unmask Yourself?',
    text: `Do you want to tell the world that ${esc(alias())} is really ${esc(G.first)} ${esc(G.last)}? There’s no going back.`,
    choices: [
      { label: 'Unmask on live TV', fn: () => exposeIdentity(`You stood in front of the cameras and pulled off your mask.`) },
      { label: 'Keep the secret' },
    ],
  });
}

function actSwitchSides() {
  const s = G.super;
  const toHero = !isHero();
  popup({
    emoji: toHero ? '🕊️' : '😈', title: toHero ? 'Redemption' : 'Fall From Grace',
    text: toHero ? 'Can a villain really change? You’ll lose your criminal friends — and the heroes may never fully trust you.' : 'The heroes will call you a traitor. But being bad pays a lot better…',
    choices: [
      { label: toHero ? 'Turn over a new leaf' : 'Embrace the darkness', fn: () => switchSides() },
      { label: 'Stay as I am' },
    ],
  });
}
function switchSides() {
  const s = G.super;
  s.alignment = s.alignment === 'hero' ? 'villain' : 'hero';
  s.rep = Math.round(s.rep / 3);
  s.team = null; s.agency = false;
  (G.districts || []).forEach(d => { d.owner = null; });
  if (s.nemesis) { say(`Your old nemesis ${s.nemesis.name} can’t believe you switched sides.`); s.nemesis = null; }
  say(s.alignment === 'hero' ? `🕊️ ${esc(s.alias)} turned their back on crime and became a hero.` : `😈 ${esc(s.alias)} turned their back on justice and became a villain.`, 'super');
}

function actRetire() {
  const s = G.super;
  if (s.retired) {
    s.retired = false;
    say(`🦸 ${esc(s.alias)} came out of retirement!`, 'super');
    return toast('You’re back!');
  }
  popup({
    emoji: '🧥', title: 'Hang Up the Cape?', text: 'Retiring means no more missions, no more nemesis attacks — and maybe a quiet life.',
    choices: [
      { label: 'Retire', fn: () => { s.retired = true; s.team = null; s.agency = false; fx({ happy: 5 }); say(`🧥 ${esc(s.alias)} retired from the ${isHero() ? 'hero' : 'villain'} life.`); } },
      { label: 'Not yet' },
    ],
  });
}

// ---------- capture & prison ----------
function arrestEvent() {
  const s = G.super;
  const hero = isHero();
  const bribe = 50000 * Math.ceil(s.heat / 20);
  popup({
    emoji: '🚨', title: 'Surrounded!',
    text: hero
      ? `The Metahuman Response Unit has you surrounded. You’re wanted for illegal vigilante activity.`
      : `SWAT teams and the Metahuman Response Unit have tracked you down. Spotlights. Helicopters. Power-dampening cuffs. “${esc(s.alias)}, come out with your hands up!”`,
    choices: [
      { label: 'Surrender and face trial', fn: () => trial(hero ? 'illegal vigilante activity' : 'super-crimes', Math.max(1, Math.round(2 + s.heat / 12)), () => { s.heat = clamp(s.heat - 25); }) },
      { label: 'Fight your way out', fn: () => {
        if (chance(winChance(55))) { fx({ heat: 10, rep: 5 }); say('💥 You fought off an entire police squad and escaped!', 'good'); result('💥', 'Escaped!', 'You smashed through the police line and vanished into the night. (+heat)'); }
        else { const dmg = injure(15, 30, 'a battle with police'); if (G.stats.health > 0) goToPrison(Math.round(4 + s.heat / 8), `You fought hard but they overwhelmed you. (-${dmg} health)`); }
      } },
      { label: 'Escape with your powers', show: () => pw('escape') > 0, fn: () => {
        if (chance(0.25 + pw('escape') / 100)) { fx({ heat: -10 }); say('🌀 You used your powers to slip away from the police.', 'good'); result('🌀', 'Gone!', 'One second you were there, the next you were gone. The cops are baffled.'); }
        else goToPrison(Math.round(3 + s.heat / 10), 'Your escape failed — they were ready for your powers.');
      } },
      { label: `Bribe them (${money(bribe)})`, show: () => G.money >= bribe, fn: () => { G.money -= bribe; s.heat = clamp(s.heat - 30); say(`💰 You bribed your way out of an arrest for ${money(bribe)}.`); } },
    ],
  });
}

function goToPrison(years, why) {
  const s = G.super;
  G.prison = years;
  G.flags.wasJailed = true;
  if (G.job) { say(`You lost your job as a ${jobTitle(G.job)}.`, 'bad'); G.job = null; }
  if (G.edu.stage === 'University' || G.edu.stage === 'Graduate School') G.edu.stage = '';
  if (s) {
    s.heat = 0; s.team = null;
    if (!s.exposed) exposeIdentity('When the police pulled off your mask in custody, the cameras were rolling.');
  }
  say(`⛓️ You were sentenced to ${years} years in Blackgate Maximum Security Prison.`, 'bad');
  result('⛓️', 'Sentenced', `${why}<br><br>You were sentenced to <b>${years} years</b> in Blackgate Maximum Security Prison.`);
}

function actBreakOut() {
  if (!once('breakout')) return;
  const bonus = G.super ? pw('escape') / 100 + G.super.level / 300 : 0;
  if (chance(0.08 + bonus)) {
    G.prison = 0;
    G.flags.brokeOut = true;
    if (G.super) fx({ heat: 40, rep: 6 });
    say('🔓 You broke out of prison!', 'good');
    result('🔓', 'Jailbreak!', 'You broke out of Blackgate in the middle of the night. You’re free — but every cop in the country is looking for you.');
  } else {
    G.prison += 2;
    injure(5, 15, 'a failed prison break');
    say('🚨 Your escape attempt failed. Two years were added to your sentence.', 'bad');
    result('🚨', 'Caught', 'The guards caught you halfway over the wall. +2 years to your sentence.');
  }
}
