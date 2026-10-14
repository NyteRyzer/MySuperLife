// Core engine: state, life simulation, year ticks, saving.

const SAVE_KEY = 'mysuperlife.save.v1';
let G = null;

// ---------- helpers ----------
const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const chance = p => Math.random() < p;
const clamp = (v, a = 0, b = 100) => Math.max(a, Math.min(b, v));
const money = n => (n < 0 ? '-$' : '$') + Math.abs(Math.round(n)).toLocaleString();
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const shuffle = arr => arr.map(v => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map(x => x[1]);

function fullName(p) { return `${p.first} ${p.last}`; }
function me() { return { first: G.first, last: G.last }; }
function heShe(g) { return g === 'm' ? 'he' : 'she'; }
function himHer(g) { return g === 'm' ? 'him' : 'her'; }

// ---------- log ----------
function newYearLog() { G.log.push({ age: G.age, lines: [] }); }
function say(text, cls) {
  const y = G.log[G.log.length - 1];
  y.lines.push(cls ? { t: text, c: cls } : { t: text });
}

// Apply a bundle of stat changes. Keys: happy health smarts looks money rep sus heat level control
function fx(o) {
  if (!o) return;
  const st = G.stats;
  if (o.happy) st.happy = clamp(st.happy + o.happy);
  if (o.health) st.health = clamp(st.health + o.health);
  if (o.smarts) st.smarts = clamp(st.smarts + o.smarts);
  if (o.looks) st.looks = clamp(st.looks + o.looks);
  if (o.money) G.money += o.money;
  const s = G.super;
  if (s) {
    if (o.rep) s.rep = clamp(s.rep + o.rep);
    if (o.heat) s.heat = clamp(s.heat + o.heat);
    if (o.level) s.level = clamp(s.level + o.level);
    if (o.control) s.control = clamp(s.control + o.control);
    if (o.sus) addSuspicion(o.sus);
  }
}

// ---------- people ----------
function addPerson(p) {
  p.id = (G.nextId = (G.nextId || 0) + 1);
  p.alive = p.alive !== false;
  p.knows = !!p.knows;
  p.bond = p.bond == null ? rand(40, 80) : p.bond;
  G.people.push(p);
  return p;
}
function randomPerson(gender, minAge, maxAge, role, last) {
  gender = gender || pick(['m', 'f']);
  return {
    first: pick(FIRST_NAMES[gender]), last: last || pick(LAST_NAMES), gender, role,
    age: rand(minAge, maxAge), looks: rand(10, 100),
  };
}
function roleLabel(p) {
  const m = p.gender === 'm';
  switch (p.role) {
    case 'Partner': return m ? 'Boyfriend' : 'Girlfriend';
    case 'Spouse': return m ? 'Husband' : 'Wife';
    case 'Child': return m ? 'Son' : 'Daughter';
    case 'Sibling': return m ? 'Brother' : 'Sister';
    case 'Parent': return m ? 'Father' : 'Mother';
    default: return p.role;
  }
}
function living(role) { return G.people.filter(p => p.alive && (!role || p.role === role)); }
function partner() { return G.people.find(p => p.alive && (p.role === 'Partner' || p.role === 'Spouse')); }
function parentName() {
  const p = living('Parent');
  return p.length ? `your ${roleLabel(p[0]).toLowerCase()}` : 'your guardian';
}

// ---------- life ----------
function newLife(opts = {}) {
  const gender = opts.gender || pick(['m', 'f']);
  const last = (opts.last || '').trim() || pick(LAST_NAMES);
  const first = (opts.first || '').trim() || pick(FIRST_NAMES[gender]);
  G = {
    v: 1, alive: true, first, last, gender, city: opts.city || pick(CITIES), age: 0,
    stats: { happy: rand(60, 100), health: rand(75, 100), smarts: rand(10, 90), looks: rand(10, 100) },
    money: 0, debt: 0,
    edu: { level: 0, stage: '', years: 0, dropped: false },
    job: null, retiredJob: false, pension: 0,
    people: [], nextId: 0, used: {}, log: [], flags: {},
    originAge: rand(5, 17), super: null, prison: 0, cause: null,
  };
  const wealth = pick([0.5, 1, 1, 1, 2, 4]);
  G.familyWealth = wealth;
  const mom = addPerson({ ...randomPerson('f', 22, 40, 'Parent', last), bond: rand(60, 100) });
  const dad = addPerson({ ...randomPerson('m', 22, 42, 'Parent', last), bond: rand(50, 100) });
  const sibs = rand(0, 2);
  for (let i = 0; i < sibs; i++) addPerson({ ...randomPerson(null, 1, 9, 'Sibling', last), bond: rand(40, 90) });

  newYearLog();
  say(`You were born a ${gender === 'm' ? 'boy' : 'girl'} in ${G.city}, a city where people whisper about masked vigilantes on the rooftops.`);
  say(`Your name is ${first} ${last}.`);
  say(`Your mother is ${fullName(mom)}, age ${mom.age}. Your father is ${fullName(dad)}, age ${dad.age}.`);
  living('Sibling').forEach(s => say(`You have an older ${roleLabel(s).toLowerCase()}, ${s.first}, age ${s.age}.`));
  if (wealth >= 2) say('Your family is wealthy.');
  else if (wealth < 1) say('Your family doesn’t have much money.');
  save();
}

function ageUp() {
  if (!G || !G.alive || isModalOpen()) return;
  G.age++;
  G.used = {};
  G.jobOffers = null;
  G.lastInjury = null;
  newYearLog();

  yearlyStats();
  peopleTick();
  if (G.prison > 0) prisonTick(); else { schoolTick(); jobTick(); }
  moneyTick();
  if (G.super) superYearly();

  if (naturalDeath()) return;

  if (!G.super && G.age === G.originAge && G.prison === 0) {
    triggerOrigin();
  } else {
    if (!G.super && G.age >= 3 && chance(0.25)) say(pick(HINTS), 'hint');
    runYearEvents();
  }
  render();
  save();
}

function yearlyStats() {
  const st = G.stats;
  st.happy = clamp(st.happy + rand(-4, 3));
  if (G.age > 40) st.health = clamp(st.health - rand(0, Math.ceil((G.age - 35) / 10)));
  if (G.age > 30 && chance(0.5)) st.looks = clamp(st.looks - 1);
  if (G.age < 18 && chance(0.3)) st.looks = clamp(st.looks + rand(-2, 3));
  if (G.super && pw('heal')) st.health = clamp(st.health + pw('heal'));
}

function peopleTick() {
  G.people.forEach(p => {
    if (!p.alive) return;
    p.age++;
    p.bond = clamp(p.bond - rand(0, 3));
    let risk = p.age < 60 ? 0.002 : 0.01 + (p.age - 60) * 0.008;
    if (risk > 0 && chance(risk)) {
      p.alive = false;
      say(`💔 Your ${roleLabel(p).toLowerCase()}, ${fullName(p)}, died at age ${p.age}.`, 'bad');
      fx({ happy: p.bond > 40 ? -rand(10, 25) : -rand(0, 5) });
    }
  });
}

function schoolTick() {
  const e = G.edu, st = G.stats;
  if (!e.dropped) {
    if (G.age === 5) { e.stage = 'Elementary School'; say('🎒 You started elementary school.'); }
    if (G.age === 11) { e.stage = 'Middle School'; say('🏫 You started middle school.'); }
    if (G.age === 14) { e.stage = 'High School'; say('🏫 You started high school.'); }
  }
  if (['Elementary School', 'Middle School', 'High School'].includes(e.stage)) st.smarts = clamp(st.smarts + rand(0, 3));
  if (G.age === 18 && e.stage === 'High School') {
    e.stage = '';
    e.level = Math.max(e.level, 1);
    say('🎓 You graduated from high school!', 'good');
    fx({ happy: 8 });
    collegePrompt();
  }
  if (e.stage === 'University') {
    e.years++; st.smarts = clamp(st.smarts + rand(1, 4));
    if (e.years >= 4) { e.stage = ''; e.level = 2; say('🎓 You graduated from university with a bachelor’s degree!', 'good'); fx({ happy: 10 }); }
  } else if (e.stage === 'Graduate School') {
    e.years++; st.smarts = clamp(st.smarts + rand(1, 4));
    if (e.years >= 3) { e.stage = ''; e.level = 3; say('🎓 You earned your graduate degree!', 'good'); fx({ happy: 10 }); }
  }
}

function collegePrompt() {
  popup({
    emoji: '🎓', title: 'What’s Next?',
    text: 'You graduated from high school! Do you want to go to university?',
    choices: [
      { label: 'Enroll (student loans: $40,000)', fn: () => enrollUni(true) },
      { label: 'Ask your parents to pay', show: () => living('Parent').length > 0, fn: () => {
        const p = living('Parent').sort((a, b) => b.bond - a.bond)[0];
        if (chance(0.25 * G.familyWealth + p.bond / 300)) {
          say(`Your ${roleLabel(p).toLowerCase()} agreed to pay for your tuition!`, 'good');
          enrollUni(false);
        } else {
          result('😬', 'No Luck', `Your ${roleLabel(p).toLowerCase()} said they can’t afford it. You took out student loans instead.`);
          enrollUni(true);
        }
      } },
      { label: 'Skip college', fn: () => say('You decided not to go to college.') },
    ],
  });
}
function enrollUni(loan) {
  G.edu.stage = 'University'; G.edu.years = 0;
  if (loan) G.debt += 40000;
  say('🏛️ You enrolled at Valor State University.');
}

function jobTick() {
  const j = G.job;
  if (!j) return;
  j.years++;
  j.perf = clamp(j.perf + rand(-8, 6));
  if (j.perf >= 70 && j.years >= 2 && j.rank < RANKS.length - 1 && !j.pt && chance(0.35)) {
    j.rank++; j.salary = Math.round(j.salary * (1.12 + Math.random() * 0.1));
    say(`📈 You were promoted to ${jobTitle(j)}! Your new salary is ${money(j.salary)}.`, 'good');
    fx({ happy: 8 });
  } else if (j.perf < 20 && chance(0.4)) {
    say(`📉 You were fired from your job as a ${jobTitle(j)}.`, 'bad');
    G.job = null; fx({ happy: -15 });
  }
}
function jobTitle(j) { return RANKS[j.rank || 0] + j.t; }

function moneyTick() {
  if (G.job && G.prison === 0) G.money += Math.round(G.job.salary * (G.job.pt ? 0.9 : 0.65));
  if (G.pension) G.money += G.pension;
  if (G.super && G.super.agency && !G.super.retired && G.prison === 0) G.money += 90000;
  if (G.debt > 0 && G.money > 0) {
    const pay = Math.min(G.debt, Math.max(3000, Math.round(G.money * 0.2)), G.money);
    G.debt -= pay; G.money -= pay;
    if (G.debt === 0) say('🎉 You paid off all of your debt!', 'good');
  }
  // Adults without income slowly burn money on living costs.
  if (G.age >= 18 && G.prison === 0 && !G.job && !G.edu.stage && G.money > 0) G.money -= Math.min(G.money, 8000);
}

function prisonTick() {
  G.prison--;
  fx({ happy: -rand(3, 8), health: -rand(0, 3) });
  if (G.prison <= 0) {
    G.prison = 0;
    say('🔓 You were released from prison!', 'good');
    fx({ happy: 15 });
  } else say(`⛓️ You are in prison. ${G.prison} year${G.prison === 1 ? '' : 's'} left.`);
}

function naturalDeath() {
  let risk = 0;
  if (G.age > 55) risk = Math.pow((G.age - 55) / 50, 2.2);
  if (G.super && pw('heal')) risk *= 0.4;
  const sick = G.stats.health < 20 ? 0.08 : 0;
  if (G.stats.health <= 0 || chance(sick)) { die(G.lastInjury || 'poor health'); return true; }
  if (chance(risk)) { die('old age'); return true; }
  return false;
}

function die(cause) {
  if (!G.alive) return;
  G.alive = false;
  G.cause = cause;
  say(`☠️ You died at age ${G.age} from ${cause}.`, 'bad');
  save();
  showDeath();
}

// After each popup chain, check whether something killed us.
function checkDeath() {
  if (G && G.alive && G.stats.health <= 0) die(G.lastInjury || 'poor health');
}

// ---------- activities ----------
function once(key) {
  if (G.used[key]) { toast('You already did that this year.'); return false; }
  G.used[key] = true;
  return true;
}

function result(emoji, title, text) {
  popup({ emoji, title, text, choices: [{ label: 'OK' }] });
}

// ---------- persistence ----------
function save() {
  try { if (G) localStorage.setItem(SAVE_KEY, JSON.stringify(G)); } catch (e) { /* storage unavailable */ }
}
function load() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    G = JSON.parse(raw);
    return !!(G && G.alive);
  } catch (e) { return false; }
}
function clearSave() {
  try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* ignore */ }
}
