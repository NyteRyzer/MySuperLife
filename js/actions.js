// Everyday-life actions: activities, school & career, relationships.

// ---------- activities ----------
function actGym() {
  if (!once('gym')) return;
  const h = rand(2, 7), l = rand(0, 3);
  fx({ health: h, looks: l, happy: 2 });
  say('🏋️ You worked out at the gym.');
  toast(`Health +${h}${l ? ` · Looks +${l}` : ''}`);
}
function actLibrary() {
  if (!once('library')) return;
  const s = rand(2, 6);
  fx({ smarts: s });
  say('📚 You spent time reading at the library.');
  toast(`Smarts +${s}`);
}
function actMeditate() {
  if (!once('meditate')) return;
  const h = rand(3, 8);
  fx({ happy: h, control: G.super ? rand(3, 7) : 0 });
  say('🧘 You meditated.');
  toast(G.super ? `Happiness +${h} · Control up` : `Happiness +${h}`);
}
function actDoctor() {
  const cost = G.age < 18 ? 0 : 800;
  if (G.money < cost) return toast(`You need ${money(cost)}.`);
  if (!once('doctor')) return;
  const h = rand(5, 20);
  fx({ health: h, money: -cost });
  say('🩺 You went to the doctor.');
  toast(`Health +${h}${cost ? ` · -${money(cost)}` : ''}`);
}
function actNightOut() {
  if (!once('night')) return;
  if (chance(0.15)) { fx({ happy: 3, health: -6 }); say('🍸 You had a wild night out and regretted it in the morning.'); toast('Fun… but ouch'); }
  else { const h = rand(4, 10); fx({ happy: h }); say('🍸 You had a great night out with friends.'); toast(`Happiness +${h}`); }
}
function actVacation() {
  const cost = 3500;
  if (G.money < cost) return toast(`You need ${money(cost)}.`);
  if (!once('vacation')) return;
  const dest = pick(['Bali', 'Paris', 'Tokyo', 'Cancún', 'Iceland', 'Cape Town', 'Rome']);
  fx({ happy: rand(10, 18), money: -cost, health: 2 });
  say(`✈️ You took a vacation to ${dest}.`);
  toast(`Enjoyed ${dest}!`);
}
function actLottery() {
  if (G.money < 10) return toast('You need $10.');
  G.money -= 10;
  if (chance(0.0005)) { const w = rand(5, 50) * 1000000; G.money += w; say(`🎰 YOU WON THE LOTTERY! ${money(w)}!`, 'good'); result('🎰', 'JACKPOT!', `You won <b>${money(w)}</b>!`); }
  else if (chance(0.05)) { const w = rand(1, 50) * 20; G.money += w; toast(`Won ${money(w)}!`); }
  else toast('Not a winner. Try again!');
}
function actFindLove() {
  if (partner()) return toast('You’re already in a relationship.');
  if (!once('love')) return;
  const c = randomPerson(null, Math.max(16, G.age - 6), G.age + 6, 'Partner');
  popup({ emoji: '💘', title: 'Dating', text: `You met <b>${fullName(c)}</b>, age ${c.age}.<br>Looks: ${c.looks}%`, choices: [
    { label: 'Ask them out', fn: () => {
      if (chance(0.3 + G.stats.looks / 160 + (G.super && G.super.exposed && isHero() ? 0.2 : 0) + (focusIs('love') ? 0.15 : 0))) {
        const p = addPerson({ ...c, bond: rand(55, 85) });
        fx({ happy: 10 });
        say(`💕 You started dating ${fullName(p)}.`, 'good');
        result('💕', 'It’s a Date!', `${p.first} said yes!`);
      } else { fx({ happy: -5 }); say(`💔 ${c.first} rejected you.`); result('💔', 'Rejected', `${c.first} turned you down.`); }
    } },
    { label: 'Not interested' },
  ] });
}
function actPrisonWorkout() {
  if (!once('pgym')) return;
  fx({ health: rand(2, 6), happy: 1 });
  if (G.super) fx({ level: rand(0, 2) });
  say('💪 You worked out in the prison yard.');
  toast('Health up');
}
function actPrisonRead() {
  if (!once('pread')) return;
  fx({ smarts: rand(2, 5) });
  say('📖 You read books from the prison library.');
  toast('Smarts up');
}

// ---------- school & career ----------
function actStudy() {
  if (!once('study')) return;
  const s = rand(2, 5);
  fx({ smarts: s, happy: -1 });
  say('📖 You studied harder at school.');
  toast(`Smarts +${s}`);
}
function actSkipClass() {
  if (!once('skip')) return;
  fx({ happy: 4, smarts: -2 });
  say('🛹 You skipped class to hang out.');
  toast('Happiness up · Smarts down');
}
function actDropOut() {
  popup({ emoji: '🚪', title: 'Drop Out?', text: `Are you sure you want to drop out of ${G.edu.stage.toLowerCase()}?`, choices: [
    { label: 'Drop out', fn: () => { say(`🚪 You dropped out of ${G.edu.stage.toLowerCase()}.`, 'bad'); if (['Elementary School', 'Middle School', 'High School'].includes(G.edu.stage)) G.edu.dropped = true; G.edu.stage = ''; fx({ happy: 3 }); } },
    { label: 'Stay in school' },
  ] });
}
function actEnrollUni() { if (G.edu.level >= 1 && !G.edu.stage) { enrollUni(true); toast('Enrolled (+$40,000 in loans)'); } }
function actGradSchool() {
  if (G.edu.level < 2 || G.edu.stage) return;
  G.edu.stage = 'Graduate School'; G.edu.years = 0; G.debt += 80000;
  say('🏛️ You enrolled in graduate school.');
  toast('Enrolled (+$80,000 in loans)');
}

function jobOffers() {
  if (G.jobOffers) return G.jobOffers;
  const pool = JOBS.filter(j => j.minAge <= G.age && (G.age >= 18 || j.pt));
  G.jobOffers = shuffle(pool).slice(0, 7).sort((a, b) => a.s - b.s).map(j => ({ ...j, s: Math.round(j.s * (0.9 + Math.random() * 0.2)) }));
  return G.jobOffers;
}
function actApply(j) {
  if (G.job) return toast('Quit your current job first.');
  if (!once('apply')) return;
  const eduOk = G.edu.level >= j.edu;
  const odds = eduOk ? clamp(0.55 + (G.stats.smarts - j.sm) / 80, 0.05, 0.95) : 0;
  if (chance(odds)) {
    G.job = { t: j.t, salary: j.s, years: 0, perf: 50, rank: 0, pt: !!j.pt };
    fx({ happy: 8 });
    say(`💼 You got a job as a ${j.t} (${money(j.s)}/yr).`, 'good');
    result('💼', 'Hired!', `You got the job as a <b>${j.t}</b>!`);
  } else {
    say(`You applied to be a ${j.t} and were rejected.`);
    result('📭', 'Rejected', eduOk ? `They went with another candidate. Try again next year.` : `You need a ${EDU_NAMES[j.edu].toLowerCase()} for this job.`);
  }
}
function actWorkHarder() {
  if (!once('work')) return;
  G.job.perf = clamp(G.job.perf + rand(5, 12));
  fx({ happy: -1 });
  toast('Performance up');
}
function actRaise() {
  if (!once('raise')) return;
  if (G.job.perf > 55 && chance(G.job.perf / 150)) {
    const old = G.job.salary;
    G.job.salary = Math.round(old * (1.05 + Math.random() * 0.1));
    say(`💵 You got a raise to ${money(G.job.salary)}!`, 'good');
    result('💵', 'Raise!', `Your boss gave you a raise from ${money(old)} to <b>${money(G.job.salary)}</b>.`);
  } else {
    G.job.perf = clamp(G.job.perf - 5);
    result('🙅', 'Denied', 'Your boss laughed and said no.');
  }
}
function actQuit() {
  popup({ emoji: '🚪', title: 'Quit?', text: `Quit your job as a ${jobTitle(G.job)}?`, choices: [
    { label: 'Quit', fn: () => { say(`You quit your job as a ${jobTitle(G.job)}.`); G.job = null; } },
    { label: 'Never mind' },
  ] });
}
function actRetireJob() {
  const pension = Math.round(G.job.salary * 0.4);
  popup({ emoji: '🏖️', title: 'Retire?', text: `Retire from your job? You’ll get a pension of ${money(pension)} per year.`, choices: [
    { label: 'Retire', fn: () => { say(`🏖️ You retired from your job as a ${jobTitle(G.job)}.`, 'good'); G.pension = pension; G.job = null; G.retiredJob = true; fx({ happy: 10 }); } },
    { label: 'Keep working' },
  ] });
}

// ---------- relationships ----------
function personActions(p) {
  const label = roleLabel(p);
  const key = k => `${k}${p.id}`;
  const knowsLine = G.super && !G.super.exposed ? (p.knows ? '<br>🤫 Knows your secret identity' : '') : '';
  const isPartner = p.role === 'Partner' || p.role === 'Spouse';
  popup({
    emoji: personEmoji(p), title: fullName(p),
    text: `${label} · Age ${p.age}${p.superAlias ? ` · 🦸 secretly ${p.superAlias}` : ''}${p.trait ? ` · ${TRAIT_EMOJI[p.trait]} ${p.trait}` : ''}<br>Relationship: <b>${p.bond}%</b>${knowsLine}`,
    choices: [
      ...(p.role === 'Friend' || p.role === 'Best Friend' ? friendChoices(p) : []),
      { label: `🦸 Team up as ${p.superAlias}`, show: () => p.superAlias && G.super && G.super.alignment && !G.super.retired, fn: () => {
        if (!once('teamup' + p.id)) return;
        p.bond = clamp(p.bond + 10); markActive();
        fx(p.superSide === 'hero' ? { rep: rand(3, 6), happy: 8 } : { rep: rand(3, 6), heat: 6, happy: 8, money: rand(20, 80) * 1000 });
        say(`💞 You and ${p.first} (${p.superAlias}) teamed up for a night out in costume.`, 'super');
        toast(`${p.superAlias} has your back`);
      } },
      { label: '⏰ Spend time together', fn: () => { if (!once(key('time'))) return; const b = rand(4, 12); p.bond = clamp(p.bond + b); fx({ happy: rand(2, 5) }); say(`You spent time with your ${label.toLowerCase()} ${p.first}.`); toast(`Relationship +${b}`); } },
      { label: '💬 Have a conversation', fn: () => { if (!once(key('talk'))) return; const b = rand(-2, 7); p.bond = clamp(p.bond + b); toast(b >= 0 ? `Relationship +${b}` : 'That got awkward…'); } },
      { label: '🌹 Compliment', fn: () => { if (!once(key('comp'))) return; p.bond = clamp(p.bond + rand(1, 5)); toast(`${p.first} smiled.`); } },
      { label: '🎁 Give a gift ($200)', show: () => G.money >= 200, fn: () => { if (!once(key('gift'))) return; G.money -= 200; p.bond = clamp(p.bond + rand(5, 12)); toast(`${p.first} loved it!`); } },
      { label: '😠 Argue', fn: () => { if (!once(key('argue'))) return; p.bond = clamp(p.bond - rand(5, 15)); fx({ happy: -2 }); say(`You got into an argument with your ${label.toLowerCase()} ${p.first}.`); toast('Relationship down'); } },
      { label: '💵 Ask for money', show: () => p.role === 'Parent', fn: () => {
        if (!once(key('money'))) return;
        if (chance(p.bond / 140)) { const amt = Math.round(rand(10, G.age < 18 ? 200 : 2000) * G.familyWealth); G.money += amt; say(`Your ${label.toLowerCase()} gave you ${money(amt)}.`); toast(`+${money(amt)}`); }
        else { p.bond = clamp(p.bond - 3); toast(`${p.first} said no.`); }
      } },
      { label: '💍 Propose', show: () => p.role === 'Partner' && G.age >= 18, fn: () => {
        if (!once(key('propose'))) return;
        if (chance(p.bond / 110)) { p.role = 'Spouse'; p.bond = clamp(p.bond + 10); fx({ happy: 15 }); say(`💍 You married ${fullName(p)}!`, 'good'); result('💍', 'Married!', `${p.first} said YES! You got married.`); }
        else { p.bond = clamp(p.bond - 15); fx({ happy: -10 }); result('💔', 'No…', `${p.first} said they’re not ready.`); }
      } },
      { label: '👶 Try for a baby', show: () => isPartner && G.age >= 18 && G.age <= 50 && p.age <= 50, fn: () => {
        if (!once('baby')) return;
        if (chance(0.5)) {
          const kid = addPerson({ ...randomPerson(null, 0, 0, 'Child', G.last), bond: rand(70, 100), skin: pick([G.skin || '', p.skin || '']) });
          fx({ happy: 12 });
          say(`👶 You had a baby ${kid.gender === 'm' ? 'boy' : 'girl'} named ${kid.first}!`, 'good');
          result('👶', 'It’s a Baby!', `Welcome to the world, <b>${kid.first}</b>!`);
        } else toast('No luck this year.');
      } },
      { label: '💔 Break up', show: () => p.role === 'Partner', fn: () => { p.role = 'Ex'; fx({ happy: -6 }); say(`You broke up with ${fullName(p)}.`); } },
      { label: '⚖️ Divorce', show: () => p.role === 'Spouse', fn: () => { p.role = 'Ex'; const loss = Math.round(Math.max(0, G.money) * 0.4); G.money -= loss; fx({ happy: -12 }); say(`⚖️ You divorced ${fullName(p)} and lost ${money(loss)} in the settlement.`, 'bad'); } },
      { label: `🎭 Reveal you are ${G.super ? G.super.alias : ''}`, show: () => G.super && !G.super.exposed && !p.knows && p.age >= 5, fn: () => revealTo(p) },
      { label: '🧠 Erase their memory of your secret', show: () => G.super && !G.super.exposed && p.knows && pw('wipe'), fn: () => { p.knows = false; p.bond = clamp(p.bond - 5); say(`🧠 You erased your ${label.toLowerCase()} ${p.first}’s memory of your secret identity.`, 'super'); } },
      { label: 'Close' },
    ],
  });
}

function revealTo(p) {
  const label = roleLabel(p).toLowerCase();
  p.knows = true;
  const trust = p.bond / 100 + (isHero() ? 0.15 : -0.15);
  if (chance(trust)) {
    p.bond = clamp(p.bond + 10);
    say(`🎭 You told your ${label} ${p.first} that you’re ${esc(G.super.alias)}. They promised to keep your secret.`, 'good');
    result('🤫', 'Secret Shared', `${p.first}’s jaw dropped. “${isHero() ? 'You’re a HERO?! I’m so proud of you.' : 'You’re… a villain? I… I won’t tell anyone.'}”`);
  } else {
    p.bond = clamp(p.bond - 20);
    fx({ sus: 20 });
    say(`🎭 You told your ${label} ${p.first} that you’re ${esc(G.super.alias)}. They freaked out — and they might talk.`, 'bad');
    result('😱', 'Not Good', `${p.first} freaked out and stormed off. You can only hope they keep quiet. (+suspicion)`);
  }
}

function personEmoji(p) {
  if (!p.alive) return '🪦';
  const m = p.gender === 'm';
  const k = p.skin || '';
  if (p.age < 4) return '👶' + k;
  if (p.age < 13) return (m ? '👦' : '👧') + k;
  if (p.age < 60) return (m ? '👨' : '👩') + k;
  return (m ? '👴' : '👵') + k;
}
