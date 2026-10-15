// The city map (districts heroes protect and villains take over) and yearly newspaper headlines.

const DISTRICTS = [
  { name: 'Downtown', emoji: '🏙️' }, { name: 'Harbor District', emoji: '⚓' }, { name: 'Old Town', emoji: '🏚️' },
  { name: 'Tech Park', emoji: '🧪' }, { name: 'Lantern Quarter', emoji: '🏮' }, { name: 'Southside', emoji: '🏘️' },
];

function initCity() { G.districts = DISTRICTS.map(d => ({ ...d, crime: rand(25, 75), owner: null })); }
function safeDistricts() { return (G.districts || []).filter(d => d.crime <= 15 && !d.owner); }
function ownedDistricts() { return (G.districts || []).filter(d => d.owner === 'you'); }
function cityCrime() { const d = G.districts || []; return d.length ? Math.round(d.reduce((t, x) => t + x.crime, 0) / d.length) : 50; }

function actProtectDistrict(d) {
  if (!spendEnergy()) return;
  const s = G.super;
  markActive();
  if (chance(winChance(10 + d.crime / 2))) {
    const drop = rand(15, 30), saved = rand(2, 20);
    d.crime = clamp(d.crime - drop);
    s.stats.saved += saved;
    fx({ rep: rand(2, 4), happy: 4, sus: rand(2, 5) });
    say(`🛡️ You cleaned up the streets of ${d.name}. Crime fell ${drop}%.`, 'good');
    result(d.emoji, d.crime <= 15 ? `${d.name} Is Safe!` : `${d.name} Cleaned Up`, `You spent the night breaking up gangs and stopping robberies in ${d.name}.<br><br>Crime: <b>${d.crime}%</b> (−${drop}) · 👥 ${saved} people saved${d.crime <= 15 ? '<br><br>Safe districts boost your fame every year.' : ''}`);
  } else {
    const dmg = injure(6, 16, `a gang fight in ${d.name}`);
    fx({ rep: -2, happy: -4, sus: 4 });
    say(`🤕 A gang in ${d.name} was too much for you. (-${dmg} health)`, 'bad');
    result('🤕', 'Outnumbered', `The ${d.name} gangs were ready for you. (-${dmg} health)`);
  }
}

function actTakeDistrict(d) {
  if (!spendEnergy()) return;
  markActive();
  const diff = 20 + Math.round((100 - d.crime) / 3) + ownedDistricts().length * 4;
  duel(diff, { name: `${d.name} Crime Boss`, power: 'martial' }, `To take over ${d.name}, you’ll have to defeat the crime boss who runs it.`, () => {
    d.owner = 'you'; d.crime = clamp(d.crime + 15, 60, 100);
    fx({ rep: rand(4, 7), heat: rand(6, 10), happy: 6 });
    say(`🏴 You took over ${d.name}. Every business there now pays you.`, 'good');
    result('🏴', `${d.name} Is Yours`, `The old crime boss is gone. ${d.name} now belongs to <b>${esc(alias())}</b>. You’ll collect protection money every year.`);
  }, () => {
    const dmg = injure(10, 22, `a turf war in ${d.name}`);
    fx({ heat: 8, happy: -6 });
    say(`🤕 You failed to take over ${d.name}. (-${dmg} health)`, 'bad');
    result('🤕', 'Turf War Lost', `The ${d.name} crime boss beat you back. (-${dmg} health)`);
  });
}

function cityYearly() {
  const s = G.super;
  if (!G.districts) initCity();
  G.districts.forEach(d => { d.crime = clamp(d.crime + rand(-2, 6), d.owner ? 60 : 0, 100); });
  if (isHero()) {
    const safe = safeDistricts().length;
    if (safe) fx({ rep: safe });
  } else {
    const mine = ownedDistricts();
    if (mine.length) {
      const cash = mine.reduce(t => t + Math.round(rand(30000, 90000) * (1 + s.level / 100)), 0);
      G.money += cash; s.heat = clamp(s.heat + mine.length * 2);
      say(`💼 Your ${mine.length} district${mine.length > 1 ? 's' : ''} paid you ${money(cash)} in protection money.`);
      // Heroes sometimes liberate a district.
      if (chance(0.15)) { const d = pick(mine); d.owner = null; d.crime = 50; say(`🦸 Heroes liberated ${d.name} from your control.`, 'bad'); }
    }
  }
}

function cityRows() {
  const hero = isHero();
  return (G.districts || []).map(d => {
    const status = d.owner === 'you' ? '🏴 Yours' : d.crime <= 15 ? '✅ Safe' : d.crime >= 70 ? '🔥 Dangerous' : '';
    const sub = `Crime ${d.crime}%${status ? ' · ' + status : ''} · 1 energy`;
    if (hero) return row(d.emoji, `Protect ${d.name}`, sub, () => actProtectDistrict(d), { disabled: d.crime <= 5, why: `${d.name} is already spotless.` });
    return row(d.emoji, d.owner === 'you' ? d.name : `Take over ${d.name}`, d.owner === 'you' ? `Yours · pays protection money yearly` : sub, () => actTakeDistrict(d), { disabled: d.owner === 'you', why: 'You already run it.' });
  });
}

function cityMap() {
  const ds = G.districts || [];
  return h('div', { class: 'city-map' }, ds.map(d => h('div', {
    class: `district ${d.owner === 'you' ? 'owned' : d.crime <= 15 ? 'safe' : d.crime >= 70 ? 'danger' : ''}`,
    style: `--crime:${d.crime}%`,
  }, h('span', { class: 'd-emoji' }, d.emoji), h('b', {}, d.name), h('small', {}, d.owner === 'you' ? 'Yours' : `${d.crime}% crime`))));
}

// ---------- newspaper ----------
function headline() {
  const s = G.super;
  const A = esc(s.alias).toUpperCase();
  const n = s.nemesis;
  const d = pick(G.districts || DISTRICTS);
  const opts = isHero() ? [
    `${A} SAVES THE DAY IN ${d.name.toUpperCase()}!`, `WHO IS ${A}? CITY DEMANDS ANSWERS`, `${A}: HERO OR MENACE?`,
    `KIDS NAME ${A} THEIR FAVORITE HERO`, `${A} SPOTTED ON ROOFTOPS OVER ${d.name.toUpperCase()}`,
    `MAYOR THANKS ${A} — “WHOEVER YOU ARE”`,
  ] : [
    `${A} STRIKES AGAIN!`, `POLICE BAFFLED BY ${A}`, `REWARD FOR ${A} RAISED TO ${money(50000 + s.heat * 10000)}`,
    `${d.name.toUpperCase()} LIVES IN FEAR OF ${A}`, `IS ANYONE SAFE FROM ${A}?`,
  ];
  if (n && n.alive) opts.push(`${A} VS. ${n.name.toUpperCase()}: THE FEUD CONTINUES`);
  if (s.exposed) opts.push(`${esc(G.first).toUpperCase()} ${esc(G.last).toUpperCase()} — THE ${isHero() ? 'HERO' : 'VILLAIN'} NEXT DOOR`);
  if (safeDistricts().length >= 3 && isHero()) opts.push(`CRIME AT RECORD LOW — THANKS TO ${A}?`);
  if (ownedDistricts().length >= 2) opts.push(`${A} NOW CONTROLS ${ownedDistricts().length} DISTRICTS`);
  say(`📰 <i>The Daily Beacon:</i> “${pick(opts)}”`, 'news');
}
