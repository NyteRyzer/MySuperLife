// Rendering, panels, popups, start & death screens.

const $ = sel => document.querySelector(sel);
let currentSheet = null;

function h(tag, attrs, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else if (k === 'class') e.className = v;
    else if (k === 'html') e.innerHTML = v;
    else e.setAttribute(k, v);
  }
  kids.flat().forEach(k => { if (k != null && k !== false) e.append(k.nodeType ? k : document.createTextNode(k)); });
  return e;
}

// ---------- popups ----------
const Q = [];
let current = null;
function isModalOpen() { return !!current; }
function popup(spec) { Q.push(spec); if (!current) nextModal(); }

function nextModal() {
  const root = $('#modal');
  if (!G || !G.alive) Q.length = 0;
  if (!Q.length) {
    current = null;
    root.hidden = true;
    checkDeath();
    render();
    save();
    return;
  }
  current = Q.shift();
  const spec = current;
  const choices = (spec.choices && spec.choices.length ? spec.choices : [{ label: 'OK' }]).filter(c => !c.show || c.show());
  let input = null;
  const card = h('div', { class: `card ${spec.cls || ''}` },
    spec.emoji ? h('div', { class: 'card-emoji' }, spec.emoji) : null,
    h('h2', {}, spec.title || ''),
    h('div', { class: 'card-text', html: spec.text || '' }),
  );
  if (spec.input) {
    input = h('input', { type: 'text', class: 'name-input', placeholder: spec.input.placeholder || '', maxlength: spec.input.max || 30 });
    card.append(input);
    if (spec.input.suggestions) {
      card.append(h('div', { class: 'chips' }, spec.input.suggestions.map(s => h('button', { class: 'chip', onclick: () => { input.value = s; } }, s))));
    }
  }
  card.append(h('div', { class: `choices ${spec.grid ? 'grid' : ''}` }, choices.map(c =>
    h('button', { class: `choice ${c.cls || ''}`, onclick: () => choose(c, input ? input.value.trim() : undefined) },
      c.label, c.hint ? h('small', {}, c.hint) : null))));
  root.replaceChildren(card);
  root.hidden = false;
  if (input) setTimeout(() => input.focus(), 50);
}

function choose(c, value) {
  const pending = Q.splice(0);
  if (c.fn) c.fn(value);
  Q.push(...pending);
  nextModal();
}

let toastTimer = null;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 1800);
  render();
  save();
}

// ---------- main render ----------
function occupation() {
  if (G.prison > 0) return 'Prison Inmate';
  if (G.job) return jobTitle(G.job);
  if (G.edu.stage) return G.edu.stage === 'University' || G.edu.stage === 'Graduate School' ? `${G.edu.stage} Student` : 'Student';
  if (G.age < 5) return G.age < 2 ? 'Baby' : 'Toddler';
  if (G.retiredJob) return 'Retired';
  return 'Unemployed';
}
function avatar() {
  const m = G.gender === 'm';
  if (G.age < 3) return '👶';
  if (G.age < 13) return m ? '👦' : '👧';
  if (G.age < 60) return m ? '👨' : '👩';
  return m ? '👴' : '👵';
}

function render() {
  if (!G) return;
  const s = G.super;
  $('#avatar').textContent = avatar();
  $('#name').textContent = `${G.first} ${G.last}`;
  $('#sub').innerHTML = `Age ${G.age} · ${esc(occupation())}` + (s ? ` · <span class="badge ${s.alignment || ''}">${s.alignment === 'hero' ? '🦸' : '🦹'} ${esc(s.alias || '???')}</span>` : '');
  $('#money').textContent = money(G.money);
  $('#money').classList.toggle('neg', G.money < 0);

  // log
  const log = $('#log');
  const atBottom = log.scrollHeight - log.scrollTop - log.clientHeight < 80;
  log.replaceChildren(...G.log.map(y => h('div', { class: 'year' },
    h('div', { class: 'year-age' }, y.age === 0 ? 'Born' : `Age ${y.age}`),
    y.lines.map(l => h('p', { class: l.c || '', html: l.t })))));
  if (atBottom || renderScrollPending) { log.scrollTop = log.scrollHeight; renderScrollPending = false; }

  // stats
  const st = G.stats;
  const bars = [
    ['😊 Happiness', st.happy], ['❤️ Health', st.health], ['🧠 Smarts', st.smarts], ['✨ Looks', st.looks],
  ];
  if (s && s.alignment) {
    bars.push([`⚡ Power`, s.level, 'power']);
    bars.push([s.alignment === 'hero' ? '🌟 Fame' : '💀 Infamy', s.rep, s.alignment]);
    bars.push([s.exposed ? '🎭 EXPOSED' : '🎭 Suspicion', s.suspicion, 'danger']);
    bars.push(['🚨 Wanted', s.heat, 'danger']);
  }
  $('#stats').replaceChildren(...bars.map(([label, v, cls]) => statBar(label, v, cls)));

  // nav
  $('#nav-powers').classList.toggle('locked', !s);
  $('#nav-powers').classList.toggle('glow', !!s && !s.retired && s.energy > 0);
  if (currentSheet) renderSheet();
}
let renderScrollPending = true;

function statBar(label, v, cls) {
  const color = cls === 'danger' ? (v > 70 ? 'var(--bad)' : v > 40 ? 'var(--warn)' : 'var(--ok)')
    : cls ? `var(--${cls})` : v < 25 ? 'var(--bad)' : v < 50 ? 'var(--warn)' : 'var(--ok)';
  return h('div', { class: 'stat' },
    h('span', { class: 'stat-label' }, label),
    h('div', { class: 'bar' }, h('div', { class: 'fill', style: `width:${Math.round(v)}%;background:${color}` })),
    h('span', { class: 'stat-val' }, `${Math.round(v)}%`));
}

// ---------- sheets ----------
function openSheet(name) {
  if (!G || !G.alive) return;
  currentSheet = name;
  $('#sheet').hidden = false;
  renderSheet();
}
function closeSheet() { currentSheet = null; $('#sheet').hidden = true; }

function renderSheet() {
  const titles = { career: '💼 Occupation', people: '❤️ Relationships', activities: '🎯 Activities', powers: '⚡ Powers', shop: '🛍️ Shopping' };
  const body = { career: careerPanel, people: peoplePanel, activities: activitiesPanel, powers: powersPanel, shop: shopPanel }[currentSheet]();
  const scroller = $('#sheet-body');
  const top = scroller.scrollTop;
  $('#sheet-title').textContent = titles[currentSheet];
  scroller.replaceChildren(body);
  scroller.scrollTop = top;
}

function row(emoji, title, sub, fn, opts = {}) {
  return h('button', { class: `row ${opts.disabled ? 'disabled' : ''} ${opts.cls || ''}`, onclick: opts.disabled ? () => opts.why && toast(opts.why) : fn },
    h('span', { class: 'row-emoji' }, emoji),
    h('span', { class: 'row-main' }, h('b', {}, title), sub ? h('small', { html: sub }) : null),
    h('span', { class: 'row-arrow' }, '›'));
}
function section(title, ...rows) {
  const kids = rows.flat().filter(Boolean);
  if (!kids.length) return null;
  return h('div', { class: 'section' }, h('div', { class: 'section-title' }, title), kids);
}

function careerPanel() {
  const e = G.edu, out = h('div', {});
  out.append(h('div', { class: 'info' }, h('div', {}, `🎓 Education: `, h('b', {}, EDU_NAMES[e.level])),
    e.stage ? h('div', {}, `📍 Currently: `, h('b', {}, e.stage), e.stage === 'University' || e.stage === 'Graduate School' ? ` (year ${e.years + 1})` : '') : null,
    G.debt > 0 ? h('div', {}, `💳 Debt: `, h('b', {}, money(G.debt))) : null));
  if (G.prison > 0) { out.append(h('p', { class: 'muted' }, 'You’re in prison. No school or work until you’re out.')); return out; }
  if (G.age < 5) { out.append(h('p', { class: 'muted' }, 'You’re too young for school. Enjoy being little!')); return out; }

  if (e.stage) {
    out.append(section('School',
      row('📖', 'Study harder', 'Boost your smarts', actStudy),
      ['Elementary School', 'Middle School', 'High School'].includes(e.stage) ? row('🛹', 'Skip class', 'Have fun, learn less', actSkipClass) : null,
      G.age >= 16 ? row('🚪', 'Drop out', '', actDropOut, { cls: 'danger' }) : null));
  } else if (G.age >= 18) {
    out.append(section('Education',
      e.level === 1 ? row('🏛️', 'Enroll in university', '4 years · $40,000 in loans', actEnrollUni) : null,
      e.level === 2 ? row('🏛️', 'Enroll in graduate school', '3 years · $80,000 in loans · unlocks top jobs', actGradSchool) : null,
      e.level === 0 && e.dropped ? row('📄', 'Get your GED', 'Earn a high school equivalency', () => { if (!once('ged')) return; if (chance(G.stats.smarts / 100 + 0.3)) { e.level = 1; say('📄 You earned your GED!', 'good'); toast('You passed!'); } else toast('You failed the GED. Try again next year.'); }) : null));
  }

  if (G.job) {
    const j = G.job;
    out.append(section('Your Job',
      h('div', { class: 'info' }, h('div', {}, h('b', {}, jobTitle(j))), h('div', {}, `Salary: ${money(j.salary)}/yr · ${j.years} yr${j.years === 1 ? '' : 's'}`),
        statBar('Performance', j.perf)),
      row('💪', 'Work harder', 'Improve your performance', actWorkHarder),
      row('💵', 'Ask for a raise', '', actRaise),
      G.age >= 60 && !j.pt ? row('🏖️', 'Retire', 'Collect a pension', actRetireJob) : null,
      row('🚪', 'Quit', '', actQuit, { cls: 'danger' })));
  } else if (G.age >= 12) {
    out.append(section(G.age < 18 ? 'Part-Time Jobs' : 'Job Listings',
      jobOffers().map(j => row('💼', j.t, `${money(j.s)}/yr · ${j.edu ? EDU_NAMES[j.edu] : 'No degree needed'}${j.sm ? ` · smarts ${j.sm}+` : ''}`, () => actApply(j)))));
  }
  return out;
}

function peoplePanel() {
  const order = ['Parent', 'Sibling', 'Spouse', 'Partner', 'Child', 'Best Friend', 'Friend', 'Ex'];
  const groups = order.map(r => [r, G.people.filter(p => p.role === r)]).filter(([, l]) => l.length);
  const names = { Parent: 'Parents', Sibling: 'Siblings', Spouse: 'Spouse', Partner: 'Partner', Child: 'Children', 'Best Friend': 'Best Friends', Friend: 'Friends', Ex: 'Exes' };
  const top = G.age >= 5 ? section('Social', row('🤝', 'Make new friends', 'School, work, the park, online and more', actMakeFriends)) : null;
  return h('div', {}, top, groups.length ? groups.map(([r, list]) => section(names[r],
    list.sort((a, b) => b.alive - a.alive).map(p => row(personEmoji(p), fullName(p),
      p.alive ? `${roleLabel(p)} · Age ${p.age}${p.trait ? ` · ${TRAIT_EMOJI[p.trait]} ${p.trait}` : ''} · ❤️ ${p.bond}%${G.super && !G.super.exposed && p.knows ? ' · 🤫 knows' : ''}` : `${roleLabel(p)} · Deceased`,
      () => personActions(p), { disabled: !p.alive, why: `${p.first} has passed away.` }))))
    : h('p', { class: 'muted' }, 'You don’t have anyone in your life right now.'));
}

function activitiesPanel() {
  const a = G.age;
  if (G.prison > 0) {
    return h('div', {}, section('Prison',
      row('💪', 'Work out in the yard', '', actPrisonWorkout),
      row('📖', 'Prison library', '', actPrisonRead),
      row('🔓', 'Attempt a prison break', G.super ? `Powers help · ~${Math.round(clamp(0.08 + pw('escape') / 100 + G.super.level / 300, 0, 1) * 100)}% chance` : 'Very risky', actBreakOut, { cls: 'danger' })));
  }
  if (a < 3) return h('p', { class: 'muted' }, 'You’re a baby. Your only activity is napping. Tap Age to grow up!');
  const adv = ADVENTURES.filter(x => a >= x.min);
  return h('div', {},
    section('Shopping', row('🛍️', 'Go shopping', 'Clothes, cars, homes and more', () => openSheet('shop'), { cls: 'feature' })),
    adv.length ? section('Adventures', adv.map(x => row(x.emoji, x.name, G.used['adv_' + advKey(x)] ? 'Done this year' : x.sub, x.fn, { cls: G.used['adv_' + advKey(x)] ? 'done' : '' }))) : null,
    section('Mind & Body',
      row('📚', 'Library', 'Smarts', actLibrary),
      a >= 8 ? row('🧘', 'Meditate', G.super ? 'Happiness & power control' : 'Happiness', actMeditate) : null,
      row('🩺', 'Doctor', a < 18 ? 'Free for kids' : '$800', actDoctor)),
    section('Social',
      a >= 5 ? row('🤝', 'Make friends', 'Meet new people', actMakeFriends) : null,
      a >= 16 ? row('🍸', 'Night out', 'Happiness', actNightOut) : null,
      a >= 16 && !partner() ? row('💘', 'Find love', 'Meet someone new', actFindLove) : null,
      a >= 18 ? row('✈️', 'Vacation', '$3,500', actVacation) : null),
    a >= 18 ? section('Money', row('🎰', 'Lottery ticket', '$10 · tap as much as you want', actLottery)) : null);
}
function advKey(x) { return { advGym: 'gym', advClub: 'club', advFestival: 'fest', advHike: 'hike', advCasino: 'casino', advBeach: 'beach', advThemePark: 'park', advDojo: 'dojo' }[x.fn.name]; }

function powersPanel() {
  const s = G.super;
  if (!s || !s.alignment) {
    const left = G.originAge - G.age;
    return h('div', { class: 'locked-panel' },
      h('div', { class: 'big' }, '❓'),
      h('h3', {}, 'Your powers have not awakened… yet.'),
      h('p', {}, 'Every person in this world has a destiny. Sometime before you turn 18, something will happen that changes your life forever.'),
      h('p', { class: 'muted' }, left > 0 ? 'Keep living. Keep aging. Watch for the signs.' : 'It could be any moment now…'));
  }
  const p = POWERS[s.power], hero = s.alignment === 'hero';
  const out = h('div', {});
  const n = s.nemesis;
  out.append(h('div', { class: `hero-card ${s.alignment}` },
    h('div', { class: 'hc-top' },
      h('div', { class: 'hc-emoji' }, hero ? '🦸' : '🦹'),
      h('div', {},
        h('div', { class: 'hc-name' }, s.alias),
        h('div', { class: 'hc-sub' }, `${hero ? 'Superhero' : 'Supervillain'} · ${tierName(s.level)}${s.retired ? ' · Retired' : ''}${s.ruler ? ' · 🌍 Ruler of Earth' : ''}${s.savedWorld ? ' · 🌍 Savior of Earth' : ''}`),
        h('div', { class: 'hc-sub' }, s.exposed ? `🎭 Identity public: ${G.first} ${G.last}` : `🎭 Secret identity: ${G.first} ${G.last}`))),
    h('div', { class: 'hc-powers' },
      h('span', { class: 'pill' }, `${p.emoji} ${p.name}`),
      s.second ? h('span', { class: 'pill' }, `${POWERS[s.second].emoji} ${POWERS[s.second].name}`) : null),
    h('div', { class: 'hc-origin' }, `Origin: “${s.origin}” at age ${s.originAge} · Costume: ${s.color} ${COSTUMES[s.costume].name}`),
    statBar('⚡ Power', s.level, 'power'),
    statBar('🎯 Control', s.control),
    statBar(hero ? '🌟 Fame' : '💀 Infamy', s.rep, s.alignment),
    statBar(s.exposed ? '🎭 EXPOSED' : '🎭 Suspicion', s.suspicion, 'danger'),
    statBar('🚨 Wanted', s.heat, 'danger'),
    h('div', { class: 'hc-grid' },
      hero ? h('div', {}, h('b', {}, s.stats.saved.toLocaleString()), h('small', {}, 'people saved'))
        : h('div', {}, h('b', {}, money(s.stats.stolen)), h('small', {}, 'stolen')),
      h('div', {}, h('b', {}, s.stats.defeated), h('small', {}, hero ? 'villains beaten' : 'heroes beaten')),
      h('div', {}, h('b', {}, s.stats.missions), h('small', {}, 'missions')),
      h('div', {}, h('b', {}, '⚡'.repeat(Math.max(0, s.energy)) || '—'), h('small', {}, 'energy left'))),
    h('div', { class: 'hc-extra' },
      s.team ? h('div', {}, `🤝 Team: ${s.team.name}`) : null,
      s.agency ? h('div', {}, '🕴️ Agent of the Bureau of Metahuman Affairs') : null,
      s.sidekick ? h('div', {}, `🫡 ${hero ? 'Sidekick' : 'Henchman'}: ${s.sidekick.name}`) : null,
      s.base >= 0 ? h('div', {}, `🏰 Base: ${BASES[s.base].name[s.alignment]}`) : null,
      s.gadgets.length ? h('div', {}, `🧰 Gear: ${s.gadgets.map(id => GADGETS.find(g => g.id === id).emoji).join(' ')}`) : null,
      s.registered === true ? h('div', {}, '📜 Registered superhuman') : s.registered === false ? h('div', {}, '📜 Unregistered (outlaw)') : null,
      n ? h('div', { class: 'nemesis' }, `😈 Nemesis: ${n.name} (${POWERS[n.power].emoji} ${POWERS[n.power].name}, power ${n.level}) — ${!n.alive ? 'destroyed' : n.jailed ? `in prison (${n.jailed} yr)` : 'at large'} · ${n.losses}W / ${n.wins}L`) : null)));

  if (G.prison > 0) {
    out.append(section('Behind Bars',
      row('🔓', 'Break out', `~${Math.round(clamp(0.08 + pw('escape') / 100 + s.level / 300, 0, 1) * 100)}% chance`, actBreakOut),
      row('🏋️', 'Train in your cell', 'Uses 1 energy', actTrain)));
    return out;
  }
  if (s.retired) {
    out.append(section('Retired', row('🦸', 'Come out of retirement', 'The world needs you', actRetire)));
    return out;
  }

  const pct = d => `${Math.round(winChance(d) * 100)}% success · 1 energy`;
  out.append(section('Missions', hero ? [
    row('🌃', 'Patrol the city', 'Find trouble, save people · 1 energy', actPatrol),
    s.rep >= 10 ? row('🕵️', 'Hunt a supervillain', '1 energy', actHuntVillain) : row('🕵️', 'Hunt a supervillain', 'Need 10 fame', null, { disabled: true, why: 'Get more famous first.' }),
    n && n.alive ? row('😈', `Hunt down ${n.name}`, nemesisAvailable() ? pct(n.level + 30) : 'They’re in prison', actNemesis, { disabled: !nemesisAvailable(), why: `${n.name} is in prison.` }) : null,
    row('🎤', 'Give a press interview', '+Fame, +suspicion', actPress),
    row('🕶️', 'Lay low', 'Lower suspicion & wanted level', actLayLow),
  ] : [
    row('💰', 'Commit a super-crime', 'Heists, ransoms & more · 1 energy', actCrime),
    row('⚔️', 'Ambush a superhero', '1 energy', actFightHero),
    n && n.alive ? row('😈', `Destroy ${n.name}`, nemesisAvailable() ? pct(n.level + 30) : 'They’re in prison', actNemesis, { disabled: !nemesisAvailable(), why: `${n.name} is in prison.` }) : null,
    row('📺', 'Hijack the airwaves', '+Infamy, +wanted', actPress),
    row('🕶️', 'Lay low', 'Lower wanted level & suspicion', actLayLow),
    s.base >= 1 ? row('☢️', s.doomsday >= 100 ? 'ACTIVATE DOOMSDAY DEVICE' : 'Build a doomsday device', s.doomsday >= 100 ? `Conquer the world · ${pct(85)}` : `${s.doomsday}% complete · $150,000 per step`, actDoomsday, { cls: s.doomsday >= 100 ? 'danger' : '' })
      : row('☢️', 'Build a doomsday device', `Requires a ${BASES[1].name.villain}`, null, { disabled: true, why: `You need a ${BASES[1].name.villain} first.` }),
  ]));

  out.append(section('Training', row('🏋️', `Train your ${p.name}`, 'More power & control · 1 energy', actTrain)));

  const nextC = COSTUMES[s.costume + 1];
  const nextB = BASES[s.base + 1];
  const pm = priceMult();
  out.append(section('Gear & Base',
    nextC ? row('🎭', `Upgrade to ${nextC.name}`, `${money(nextC.cost * pm)} · better at hiding your identity`, actBuyCostume) : null,
    GADGETS.filter(g => !s.gadgets.includes(g.id)).map(g => row(g.emoji, g.name, `${money(g.cost * pm)} · +${g.bonus} combat`, () => actBuyGadget(g))),
    nextB ? row('🏰', nextB.name[s.alignment], `${money(nextB.cost * pm)} · +${nextB.bonus} combat`, actBuyBase) : null));

  out.append(section('Allies',
    s.team ? null : TEAMS[s.alignment].map(t => row('🤝', `Join ${t.name}`, `Needs ${t.rep} ${repWord().toLowerCase()} · ${money(t.pay)}/yr`, () => actJoinTeam(t), { disabled: s.rep < t.rep, why: `You need ${t.rep} ${repWord().toLowerCase()}.` })),
    s.team && TEAMS[s.alignment].some(t => t.rep > s.team.rep) ? TEAMS[s.alignment].filter(t => t.rep > s.team.rep).map(t => row('⬆️', `Join ${t.name}`, `Needs ${t.rep} ${repWord().toLowerCase()} · ${money(t.pay)}/yr`, () => actJoinTeam(t), { disabled: s.rep < t.rep, why: `You need ${t.rep} ${repWord().toLowerCase()}.` })) : null,
    !s.sidekick ? row('🫡', hero ? 'Recruit a sidekick' : 'Hire a henchman', hero ? 'Needs 25 fame' : 'Needs 25 infamy · $20,000/yr', actRecruit) : null));

  out.append(section('Identity',
    !s.exposed ? row('🎭', 'Unmask yourself publicly', 'Reveal your secret identity', actRevealIdentity) : null,
    row(hero ? '😈' : '🕊️', hero ? 'Turn to villainy' : 'Seek redemption', 'Switch sides', actSwitchSides),
    row('🧥', 'Retire', 'Hang up the cape', actRetire, { cls: 'danger' })));
  return out;
}

// ---------- screens ----------
function showStart() {
  closeSheet();
  $('#death').hidden = true;
  const hasSave = load();
  const st = $('#start');
  const citySel = h('select', { id: 'f-city' }, h('option', { value: '' }, 'Random city'), CITIES.map(c => h('option', { value: c }, c)));
  const first = h('input', { id: 'f-first', placeholder: 'First name (optional)', maxlength: 20 });
  const last = h('input', { id: 'f-last', placeholder: 'Last name (optional)', maxlength: 20 });
  const gender = h('select', { id: 'f-gender' }, h('option', { value: '' }, 'Random gender'), h('option', { value: 'm' }, 'Male'), h('option', { value: 'f' }, 'Female'));
  const begin = opts => { newLife(opts); st.hidden = true; renderScrollPending = true; render(); };
  st.replaceChildren(h('div', { class: 'start-card' },
    h('div', { class: 'logo' }, h('span', {}, 'My'), 'Super', h('span', {}, 'Life')),
    h('p', { class: 'tagline' }, 'Live a whole life. Somewhere before 18, your origin story begins.'),
    hasSave ? h('button', { class: 'big-btn alt', onclick: () => { st.hidden = true; renderScrollPending = true; render(); } }, `▶ Continue as ${G.first} ${G.last} (age ${G.age})`) : null,
    h('div', { class: 'form' }, first, last, gender, citySel),
    h('button', { class: 'big-btn', onclick: () => begin({ first: first.value, last: last.value, gender: gender.value, city: citySel.value }) }, '✨ Start New Life'),
    h('button', { class: 'big-btn ghost', onclick: () => begin({}) }, '🎲 Random Life')));
  st.hidden = false;
}

function showDeath() {
  closeSheet();
  const s = G.super;
  const hero = s && s.alignment === 'hero';
  const net = netWorth();
  let legacy = 'You never discovered your powers.';
  if (s && s.alignment) {
    legacy = hero
      ? `${s.savedWorld ? 'The hero who saved the world. ' : ''}${s.exposed ? 'The world knew you' : 'Only a few ever knew you'} as <b>${esc(s.alias)}</b>, who saved ${s.stats.saved.toLocaleString()} lives and defeated ${s.stats.defeated} villains.`
      : `${s.ruler ? 'Supreme Ruler of Earth. ' : ''}${s.exposed ? 'The world feared you' : 'Your secret died with you'} as <b>${esc(s.alias)}</b>, who stole ${money(s.stats.stolen)} and defeated ${s.stats.defeated} heroes.`;
  }
  const d = $('#death');
  d.replaceChildren(h('div', { class: 'start-card' },
    h('div', { class: 'card-emoji' }, '🪦'),
    h('h2', {}, `${G.first} ${G.last}`),
    s && s.alias ? h('div', { class: `badge big ${s.alignment}` }, `${hero ? '🦸' : '🦹'} ${s.alias}`) : null,
    h('p', {}, `Died at age ${G.age} from ${G.cause}.`),
    h('p', { html: legacy }),
    h('div', { class: 'info' },
      h('div', {}, `💰 Net worth: ${money(net)}`),
      h('div', {}, `🎓 ${EDU_NAMES[G.edu.level]}`),
      h('div', {}, `💼 ${G.job ? jobTitle(G.job) : G.retiredJob ? 'Retired' : 'No job'}`),
      s && s.alignment ? h('div', {}, `${POWERS[s.power].emoji} ${POWERS[s.power].name} · ${tierName(s.level)}`) : null,
      s && s.nemesis ? h('div', {}, `😈 Nemesis: ${s.nemesis.name}`) : null),
    h('button', { class: 'big-btn', onclick: () => { clearSave(); showStart(); } }, '✨ New Life')));
  d.hidden = false;
}

// ---------- boot ----------
window.addEventListener('DOMContentLoaded', () => {
  $('#age-btn').addEventListener('click', () => { closeSheet(); renderScrollPending = true; ageUp(); });
  document.querySelectorAll('[data-sheet]').forEach(b => b.addEventListener('click', () => {
    const name = b.dataset.sheet;
    if (currentSheet === name) closeSheet(); else openSheet(name);
  }));
  $('#sheet-close').addEventListener('click', closeSheet);
  $('#money').addEventListener('click', () => { if (currentSheet === 'shop') closeSheet(); else openSheet('shop'); });
  $('#menu-btn').addEventListener('click', () => popup({
    emoji: '⚙️', title: 'Menu', text: 'Your life saves automatically.',
    choices: [
      { label: '🔄 Start a new life', fn: () => popup({ emoji: '⚠️', title: 'Are you sure?', text: 'Your current life will be lost forever.', choices: [{ label: 'Yes, start over', fn: () => { clearSave(); showStart(); } }, { label: 'Cancel' }] }) },
      { label: 'Close' },
    ],
  }));
  showStart();
});
