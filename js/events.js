// Random yearly events. Each event: { id, min, max, w, cond(), fire() }.
// `once: true` events only happen once per life.

const hasPower = () => G.super && !G.super.retired;
const canWipe = () => G.super && pw('wipe');

const LIFE_EVENTS = [
  {
    id: 'tantrum', min: 2, max: 5, w: 3,
    fire() {
      popup({ emoji: '🍫', title: 'Candy Crisis', text: 'You’re at the grocery store and you see a candy bar you REALLY want.', choices: [
        { label: 'Throw a tantrum', fn: () => { if (chance(0.5)) { fx({ happy: 6 }); say('You threw a tantrum and your parents bought you the candy.'); } else { fx({ happy: -4 }); say('You threw a tantrum in the store. Your parents were mortified.'); } } },
        { label: 'Ask nicely', fn: () => { if (chance(0.6)) { fx({ happy: 5 }); say('You asked nicely and got the candy bar!'); } else say('You asked nicely, but the answer was no.'); } },
        { label: 'Sneak it into your pocket', fn: () => { if (chance(0.6)) { fx({ happy: 4 }); say('You stole a candy bar. Nobody noticed.'); } else { fx({ happy: -6 }); say('You got caught stealing a candy bar. Your parents grounded you.'); } } },
      ] });
    },
  },
  {
    id: 'pet', min: 3, max: 14, w: 1, once: true,
    fire() {
      const name = pick(['Biscuit', 'Rocket', 'Luna', 'Max', 'Pickles', 'Shadow', 'Krypto Jr.', 'Waffles']);
      popup({ emoji: '🐶', title: 'A New Friend', text: `Your parents surprise you with a puppy! You name it <b>${name}</b>.`, choices: [
        { label: 'Hug it!', fn: () => { fx({ happy: 12 }); say(`🐶 Your family adopted a puppy named ${name}.`, 'good'); } },
      ] });
    },
  },
  {
    id: 'bully', min: 6, max: 16, w: 3, cond: () => !!G.edu.stage,
    fire() {
      const b = randomPerson(null, G.age, G.age + 1);
      popup({ emoji: '😠', title: 'Bully', text: `A bully named <b>${b.first}</b> corners you at school and demands your lunch money.`, choices: [
        { label: 'Hand it over', fn: () => { fx({ happy: -6 }); say(`You gave ${b.first} your lunch money.`); } },
        { label: 'Fight back', fn: () => {
          if (chance(0.45)) { fx({ happy: 8, health: -3 }); say(`🥊 You stood up to ${b.first} and won the fight!`, 'good'); }
          else { fx({ happy: -8, health: -8 }); say(`🤕 ${b.first} beat you up.`, 'bad'); }
        } },
        { label: 'Tell a teacher', fn: () => { fx({ happy: -2 }); say(`You told a teacher about ${b.first}. They got detention.`); } },
        { label: '⚡ Use your powers', show: hasPower, fn: () => {
          fx({ happy: 10, sus: 15 });
          say(`⚡ You used your powers on ${b.first}. They ran away screaming — but kids are whispering about what they saw.`, 'super');
        } },
      ] });
    },
  },
  {
    id: 'friend', min: 6, max: 40, w: 2, cond: () => living('Friend').length < 4,
    fire() {
      const f = randomPerson(null, Math.max(5, G.age - 2), G.age + 2, 'Friend');
      popup({ emoji: '👋', title: 'New Friend?', text: `<b>${fullName(f)}</b> seems to want to be your friend.`, choices: [
        { label: 'Be friends', fn: () => { addPerson({ ...f, bond: rand(50, 80) }); fx({ happy: 5 }); say(`🤝 You became friends with ${fullName(f)}.`); } },
        { label: 'Ignore them', fn: () => say(`You ignored ${f.first}.`) },
      ] });
    },
  },
  {
    id: 'exam', min: 12, max: 22, w: 2, cond: () => !!G.edu.stage,
    fire() {
      popup({ emoji: '📝', title: 'Big Exam', text: 'You have a huge exam tomorrow. A classmate offers to sell you the answer key.', choices: [
        { label: 'Study all night', fn: () => { fx({ smarts: rand(2, 5), happy: -2 }); say('📚 You studied all night for your exam and aced it.'); } },
        { label: 'Buy the answers ($50)', fn: () => {
          if (chance(0.65)) { fx({ happy: 4, money: -50 }); say('You cheated on your exam and got an A.'); }
          else { fx({ happy: -10, money: -50 }); say('🚫 You got caught cheating on your exam!', 'bad'); }
        } },
        { label: '🧠 Read the teacher’s mind', show: () => hasPower() && pw('wipe'), fn: () => { fx({ happy: 6 }); say('🧠 You read the answers right out of your teacher’s head. 100%!', 'super'); } },
        { label: 'Wing it', fn: () => { if (G.stats.smarts > 60) { say('You winged the exam and still did great.'); } else { fx({ happy: -4 }); say('You winged the exam and failed it.'); } } },
      ] });
    },
  },
  {
    id: 'party', min: 15, max: 30, w: 2,
    fire() {
      popup({ emoji: '🎉', title: 'Wild Party', text: 'You’re invited to a wild party this weekend.', choices: [
        { label: 'Go!', fn: () => { fx({ happy: 8 }); if (chance(0.25)) { fx({ health: -6 }); say('🎉 You went to a wild party and woke up with a brutal hangover.'); } else say('🎉 You went to a wild party and had a blast.'); } },
        { label: 'Stay home', fn: () => { fx({ smarts: 2, happy: -2 }); say('You skipped the party and stayed home.'); } },
      ] });
    },
  },
  {
    id: 'crush', min: 14, max: 18, w: 2, cond: () => !partner(),
    fire() {
      const c = randomPerson(null, G.age, G.age + 1, 'Partner');
      popup({ emoji: '💌', title: 'Dance Invitation', text: `<b>${fullName(c)}</b> asks you to the school dance!`, choices: [
        { label: 'Say yes!', fn: () => { const p = addPerson({ ...c, bond: rand(55, 85) }); fx({ happy: 10 }); say(`💕 You went to the dance with ${fullName(p)} and started dating!`, 'good'); } },
        { label: 'Politely decline', fn: () => say(`You turned down ${c.first}.`) },
      ] });
    },
  },
  {
    id: 'wallet', min: 8, max: 80, w: 2,
    fire() {
      const cash = rand(20, 400);
      popup({ emoji: '👛', title: 'Lost Wallet', text: `You found a wallet on the sidewalk with <b>${money(cash)}</b> inside.`, choices: [
        { label: 'Return it', fn: () => { fx({ happy: 5 }); if (isHero()) fx({ rep: 1 }); say('You returned a lost wallet to its owner.'); } },
        { label: 'Keep the cash', fn: () => { fx({ money: cash, happy: 2 }); say(`You kept ${money(cash)} from a lost wallet.`); } },
      ] });
    },
  },
  {
    id: 'flu', min: 0, max: 100, w: 2,
    fire() {
      const cost = G.age < 18 ? 0 : 300;
      popup({ emoji: '🤒', title: 'Under the Weather', text: 'You’ve come down with a nasty flu.', choices: [
        { label: cost ? `See a doctor (${money(cost)})` : 'See a doctor', fn: () => { fx({ money: -cost, health: 3 }); say('You saw a doctor and recovered from the flu.'); } },
        { label: 'Tough it out', fn: () => { if (chance(0.6)) say('You toughed out the flu.'); else { fx({ health: -15 }); say('🤒 The flu turned into pneumonia.', 'bad'); } } },
      ] });
    },
  },
  {
    id: 'mugger', min: 16, max: 75, w: 2,
    fire() {
      const take = Math.min(G.money, rand(50, 800));
      popup({ emoji: '🔪', title: 'Mugged!', text: 'A mugger jumps out of an alley and pulls a knife on you. “Wallet. Now.”', choices: [
        { label: 'Hand it over', fn: () => { fx({ money: -take, happy: -5 }); say(`A mugger stole ${money(take)} from you.`, 'bad'); } },
        { label: 'Fight', fn: () => {
          if (chance(0.4)) { fx({ happy: 8 }); say('🥊 You fought off a mugger!', 'good'); }
          else { const d = rand(10, 30); fx({ health: -d, money: -take }); G.lastInjury = 'a mugging'; say(`🔪 You fought a mugger and got stabbed. (-${d} health)`, 'bad'); }
        } },
        { label: 'Run', fn: () => { if (chance(0.6)) say('You outran a mugger.'); else { fx({ money: -take, happy: -5 }); say(`The mugger caught you and took ${money(take)}.`, 'bad'); } } },
        { label: '⚡ Use your powers', show: hasPower, fn: () => {
          fx({ happy: 8, sus: 10 });
          say(`⚡ The mugger made a very big mistake. ${isHero() ? 'You tied him up for the police.' : 'You took HIS wallet.'}`, 'super');
          if (!isHero()) fx({ money: rand(20, 300) });
        } },
      ] });
    },
  },
  {
    id: 'credit', min: 18, max: 65, w: 2, cond: () => G.job && !G.job.pt,
    fire() {
      const c = randomPerson(null, 22, 60);
      popup({ emoji: '😤', title: 'Stolen Credit', text: `Your coworker <b>${c.first}</b> took credit for your work in front of the boss.`, choices: [
        { label: 'Confront them', fn: () => { if (chance(0.5)) { G.job.perf = clamp(G.job.perf + 10); say(`You confronted ${c.first} and the boss sided with you.`); } else { G.job.perf = clamp(G.job.perf - 8); say(`You confronted ${c.first}, but it backfired.`); } } },
        { label: 'Let it go', fn: () => { fx({ happy: -5 }); say(`You let ${c.first} take credit for your work.`); } },
        { label: '🧠 Make them confess', show: () => hasPower() && pw('wipe'), fn: () => { G.job.perf = clamp(G.job.perf + 15); say(`🧠 You nudged ${c.first}’s mind. They confessed to the whole office.`, 'super'); } },
      ] });
    },
  },
  {
    id: 'headhunter', min: 22, max: 60, w: 1, cond: () => G.job && !G.job.pt,
    fire() {
      const raise = Math.round(G.job.salary * (1.15 + Math.random() * 0.25));
      popup({ emoji: '📞', title: 'Job Offer', text: `A recruiter offers you a similar job at a rival company paying <b>${money(raise)}</b>/year.`, choices: [
        { label: 'Take it', fn: () => { G.job.salary = raise; G.job.years = 0; G.job.perf = 50; fx({ happy: 6 }); say(`💼 You switched companies for a salary of ${money(raise)}.`, 'good'); } },
        { label: 'Stay loyal', fn: () => { G.job.perf = clamp(G.job.perf + 5); say('You turned down a job offer to stay loyal.'); } },
      ] });
    },
  },
  {
    id: 'sibmoney', min: 20, max: 70, w: 1, cond: () => living('Sibling').length > 0 && G.money > 2000,
    fire() {
      const s = pick(living('Sibling'));
      const amt = rand(5, 30) * 100;
      popup({ emoji: '💸', title: 'Family Favor', text: `Your ${roleLabel(s).toLowerCase()} ${s.first} is broke and asks to borrow <b>${money(amt)}</b>.`, choices: [
        { label: 'Lend it', fn: () => { fx({ money: -amt }); s.bond = clamp(s.bond + 15); say(`You lent ${s.first} ${money(amt)}.`); } },
        { label: 'Refuse', fn: () => { s.bond = clamp(s.bond - 15); say(`You refused to lend ${s.first} money.`); } },
      ] });
    },
  },
  {
    id: 'inheritance', min: 25, max: 80, w: 1, once: true,
    fire() {
      const amt = rand(5, 120) * 1000;
      fx({ money: amt });
      say(`💰 A distant relative died and left you ${money(amt)}.`, 'good');
      result('💰', 'Inheritance', `A great-aunt you barely remember left you <b>${money(amt)}</b> in her will.`);
    },
  },
  {
    id: 'carcrash', min: 17, max: 90, w: 1,
    fire() {
      const d = rand(10, 35);
      fx({ health: -d, happy: -8 });
      G.lastInjury = 'a car accident';
      say(`🚗 You were in a car accident. (-${d} health)`, 'bad');
      result('🚗', 'Car Accident', `Another driver ran a red light and T-boned your car. (-${d} health)`);
    },
  },
  {
    id: 'sibling_born', min: 1, max: 10, w: 2,
    cond: () => living('Parent').length === 2 && living('Parent').some(p => p.gender === 'f' && p.age < 43) && (G.flags.newSibs || 0) < 2,
    fire() {
      G.flags.newSibs = (G.flags.newSibs || 0) + 1;
      const s = addPerson({ ...randomPerson(null, 0, 0, 'Sibling', G.last), bond: rand(50, 90) });
      say(`👶 Your parents had a baby ${s.gender === 'm' ? 'boy' : 'girl'} named ${s.first}!`, 'good');
      fx({ happy: 4 });
    },
  },
  {
    id: 'divorce', min: 4, max: 17, w: 1, once: true, cond: () => living('Parent').length === 2,
    fire() {
      fx({ happy: -12 });
      say('💔 Your parents got divorced.', 'bad');
      result('💔', 'Divorce', 'Your parents sat you down and told you they’re getting a divorce.');
    },
  },
  {
    id: 'talent', min: 8, max: 17, w: 1,
    fire() {
      popup({ emoji: '🎤', title: 'Talent Show', text: 'The school talent show is coming up. Want to perform?', choices: [
        { label: 'Sing', fn: () => { if (G.stats.looks + rand(0, 60) > 70) { fx({ happy: 10 }); say('🎤 You won the school talent show!', 'good'); } else { fx({ happy: -8 }); say('🎤 Your talent show performance was a disaster.'); } } },
        { label: '⚡ Show off your “magic trick”', show: hasPower, fn: () => { fx({ happy: 10, sus: 20 }); say('✨ Your “magic trick” stunned the whole school. Some people think it wasn’t a trick…', 'super'); } },
        { label: 'Skip it', fn: () => say('You skipped the talent show.') },
      ] });
    },
  },
  {
    id: 'midlife', min: 40, max: 52, w: 1, once: true,
    fire() {
      popup({ emoji: '🏎️', title: 'Midlife Crisis', text: 'You wake up feeling old. Something needs to change.', choices: [
        { label: 'Buy a sports car ($60,000)', show: () => G.money >= 60000, fn: () => { fx({ money: -60000, happy: 15 }); say('🏎️ You bought a flashy sports car.'); } },
        { label: 'Get a tattoo', fn: () => { fx({ happy: 6, money: -300 }); say('You got a tattoo.'); } },
        { label: 'Take up running', fn: () => { fx({ health: 8, happy: 4 }); say('🏃 You took up running.'); } },
      ] });
    },
  },
  {
    id: 'fall', min: 65, max: 120, w: 2,
    fire() {
      const d = rand(5, 20);
      fx({ health: -d });
      G.lastInjury = 'a bad fall';
      say(`🦴 You slipped and fell. (-${d} health)`, 'bad');
    },
  },
  {
    id: 'grandkid', min: 50, max: 100, w: 1, cond: () => living('Child').some(c => c.age >= 22),
    fire() {
      const c = pick(living('Child').filter(c => c.age >= 22));
      fx({ happy: 10 });
      say(`👶 Your ${roleLabel(c).toLowerCase()} ${c.first} had a baby. You’re a grandparent!`, 'good');
    },
  },
  {
    id: 'comiccon', min: 10, max: 45, w: 1,
    fire() {
      if (G.super && !G.super.retired) {
        fx({ happy: 6 });
        say(`🎭 At a comic convention, you saw a dozen people cosplaying as ${esc(G.super.alias)}. ${G.super.rep > 40 ? 'Their costumes were better than yours.' : 'Most of them had no idea who that was.'}`, 'super');
      } else {
        fx({ happy: 5 });
        say('🎭 You went to a comic book convention and met your favorite artist.');
      }
    },
  },
];

const SUPER_EVENTS = [
  {
    id: 'closecall', w: 4, cond: () => !G.super.exposed,
    fire() {
      const s = G.super;
      const witness = G.job && G.age >= 18 ? 'coworker' : G.edu.stage ? 'classmate' : 'neighbor';
      const w = randomPerson(null, Math.max(8, G.age - 3), G.age + 5);
      popup({ emoji: '👀', title: 'Close Call', text: `Your ${witness} <b>${fullName(w)}</b> saw you duck into an alley right before ${esc(s.alias)} appeared. “Hey… wasn’t that you?”`, choices: [
        { label: 'Laugh it off', fn: () => { if (chance(G.stats.smarts / 140 + 0.2)) say(`You laughed it off. ${w.first} bought it.`); else { fx({ sus: 15 }); say(`You laughed it off, but ${w.first} doesn’t seem convinced.`); } } },
        { label: 'Invent an elaborate excuse', fn: () => { if (chance(G.stats.smarts / 100)) { fx({ sus: -5 }); say('Your excuse was so detailed that nobody could doubt it.'); } else { fx({ sus: 20 }); say('Your excuse made no sense at all. Suspicion is rising.', 'bad'); } } },
        { label: '🧠 Erase their memory', show: canWipe, fn: () => { fx({ sus: -5 }); say(`🧠 You erased ${w.first}’s memory of the whole thing.`, 'super'); } },
        { label: 'Tell them the truth', fn: () => {
          const f = addPerson({ ...w, role: 'Friend', knows: true, bond: rand(55, 80) });
          if (chance(0.3)) { fx({ sus: 25 }); say(`You told ${f.first} your secret. They’ve already told two people…`, 'bad'); }
          else say(`🤫 You told ${f.first} your secret. They promised to take it to the grave — and became your friend.`, 'good');
        } },
      ] });
    },
  },
  {
    id: 'partnerfinds', w: 3, cond: () => partner() && !partner().knows,
    fire() {
      const p = partner();
      popup({ emoji: '🧥', title: 'Found Out?', text: `Your ${roleLabel(p).toLowerCase()} <b>${p.first}</b> found your ${esc(G.super.alias)} costume hidden in the closet!`, choices: [
        { label: 'Tell the truth', fn: () => {
          if (chance(p.bond / 110 + (isHero() ? 0.15 : -0.1))) { p.knows = true; p.bond = clamp(p.bond + 15); say(`❤️ You told ${p.first} you’re ${esc(G.super.alias)}. They’re standing by you.`, 'good'); }
          else { p.role = 'Ex'; p.knows = true; fx({ happy: -15 }); say(`💔 You told ${p.first} you’re ${esc(G.super.alias)}. They couldn’t handle it and left you.`, 'bad'); }
        } },
        { label: '“It’s for a costume party!”', fn: () => { if (chance(G.stats.smarts / 120 + 0.2)) say(`${p.first} bought the costume party story.`); else { p.bond = clamp(p.bond - 15); fx({ sus: 10 }); say(`${p.first} didn’t believe your costume party story.`, 'bad'); } } },
        { label: '🧠 Erase their memory', show: canWipe, fn: () => { p.bond = clamp(p.bond - 3); say(`🧠 You erased ${p.first}’s memory. You feel a little guilty.`, 'super'); } },
      ] });
    },
  },
  {
    id: 'nemesis_born', w: 4, cond: () => !G.super.nemesis && (G.super.rep >= 10 || G.super.stats.missions >= 3),
    fire() {
      const n = makeNemesis();
      const np = POWERS[n.power];
      say(`😈 ${n.name} has declared you their sworn enemy. You have a nemesis.`, 'bad');
      result(np.emoji, 'A Nemesis Rises', `A new ${n.alignment} called <b>${n.name}</b> with the power of <b>${np.name}</b> has appeared in ${G.city} — and they’re obsessed with destroying ${esc(G.super.alias)}.`);
    },
  },
  {
    id: 'nemesis_attack', w: 4, cond: () => nemesisAvailable(),
    fire() {
      const n = G.super.nemesis;
      const ctx = isHero() ? `${n.name} is tearing downtown ${G.city} apart, calling your name!` : `${n.name} has found your hideout and is smashing through the door!`;
      popup({ emoji: POWERS[n.power].emoji, title: 'Nemesis Attack!', text: `${ctx}<br><br>Power level: you ${G.super.level} vs. ${n.name} ${n.level}.`, choices: [
        { label: 'Fight!', fn: () => fightNemesis() },
        { label: 'Run', fn: () => { fx({ rep: -8, happy: -6 }); say(`You ran from your nemesis ${n.name}.`, 'bad'); } },
      ] });
    },
  },
  {
    id: 'kidnap', w: 2, cond: () => nemesisAvailable() && G.people.some(p => p.alive && (p.knows || G.super.exposed)) && G.age >= 16,
    fire() {
      const n = G.super.nemesis;
      const victim = pick(G.people.filter(p => p.alive && (p.knows || G.super.exposed)));
      const vl = roleLabel(victim).toLowerCase();
      popup({ emoji: '🆘', title: 'Kidnapped!', text: `${n.name} has kidnapped your ${vl} <b>${victim.first}</b>! A note says: “Come alone to the old clock tower at midnight.”`, choices: [
        { label: 'Go alone and rescue them', fn: () => {
          if (chance(winChance(n.level + 40))) { victim.bond = clamp(victim.bond + 20); fx({ rep: 10, happy: 10 }); n.losses++; say(`🦸 You rescued your ${vl} ${victim.first} from ${n.name}!`, 'good'); result('🦸', 'Rescued!', `You beat ${n.name} and carried ${victim.first} to safety.`); }
          else {
            const dmg = injure(15, 35, `a fight with ${n.name}`);
            if (chance(0.35)) { victim.alive = false; fx({ happy: -30 }); say(`💀 You failed to save your ${vl} ${victim.first}. ${n.name} killed them.`, 'bad'); result('💀', 'Too Late', `You weren’t strong enough. ${victim.first} is gone. (-${dmg} health)`); }
            else { fx({ happy: -10 }); say(`You lost to ${n.name}, but ${victim.first} escaped in the chaos. (-${dmg} health)`); result('😮‍💨', 'Barely', `You lost the fight, but ${victim.first} slipped away in the chaos. (-${dmg} health)`); }
          }
        } },
        { label: 'Call the authorities', fn: () => {
          if (chance(0.5)) { say(`The police rescued your ${vl} ${victim.first}.`); fx({ rep: -3 }); }
          else { victim.alive = false; fx({ happy: -30 }); say(`💀 The police raid failed. ${n.name} killed your ${vl} ${victim.first}.`, 'bad'); }
        } },
      ] });
    },
  },
  {
    id: 'registration', w: 2, cond: () => G.super.registered === null && G.age >= 16,
    fire() {
      const s = G.super;
      popup({ emoji: '📜', title: 'Superhuman Registration Act', text: 'Congress just passed a law requiring every superhuman to register their real identity with the government.', choices: [
        { label: 'Register', fn: () => { s.registered = true; s.heat = clamp(s.heat - 20); if (isHero()) fx({ rep: 5 }); fx({ sus: 10 }); say('📜 You registered with the government as a superhuman.'); } },
        { label: 'Refuse and go rogue', fn: () => { s.registered = false; fx({ heat: isHero() ? 20 : 10, rep: 3 }); say('📜 You refused to register. You’re now an outlaw in the eyes of the government.', 'bad'); } },
      ] });
    },
  },
  {
    id: 'merch', w: 2, cond: () => isHero() && G.super.rep >= 40,
    fire() {
      const pay = G.super.rep * rand(800, 2000);
      popup({ emoji: '🧸', title: 'Action Figures!', text: `A toy company wants to make ${esc(G.super.alias)} action figures and lunchboxes. They’ll pay <b>${money(pay)}</b> to an anonymous account.`, choices: [
        { label: 'Take the deal', fn: () => { fx({ money: pay, happy: 6, sus: 5 }); say(`🧸 You licensed ${esc(G.super.alias)} merchandise for ${money(pay)}.`, 'good'); } },
        { label: 'Donate it to charity', fn: () => { fx({ rep: 6, happy: 8 }); say(`💝 You donated your ${esc(G.super.alias)} merch money to children’s hospitals.`, 'good'); } },
      ] });
    },
  },
  {
    id: 'podcast', w: 2, cond: () => !isHero() && G.super.rep >= 30,
    fire() {
      fx({ happy: 5, rep: 3 });
      say(`🎙️ A true-crime podcast about ${esc(G.super.alias)} hit #1 on the charts.`, 'super');
    },
  },
  {
    id: 'surge', w: 3, cond: () => G.super.control < 45,
    fire() {
      const s = G.super;
      const where = G.job ? 'at work' : G.edu.stage ? 'in class' : 'at the dinner table';
      popup({ emoji: POWERS[s.power].emoji, title: 'Power Surge!', text: `Your ${POWERS[s.power].name.toLowerCase()} suddenly flares out of control ${where}!`, choices: [
        { label: 'Try to contain it', fn: () => {
          if (chance(s.control / 100 + 0.25)) { fx({ control: 6 }); say('You barely contained a power surge. Nobody noticed.'); }
          else { const d = injure(5, 15, 'a power surge'); fx({ sus: 20, happy: -5 }); say(`💥 Your powers went haywire ${where}. Everyone saw something. (-${d} health)`, 'bad'); }
        } },
        { label: 'Run outside', fn: () => { fx({ sus: 6 }); say(`You sprinted out ${where} just before your powers exploded.`); } },
      ] });
    },
  },
  {
    id: 'agency', w: 2, cond: () => isHero() && G.super.rep >= 30 && !G.super.agency && G.age >= 18,
    fire() {
      popup({ emoji: '🕴️', title: 'The Bureau', text: 'Agents from the Bureau of Metahuman Affairs show up at your door. They know who you are. “We’d like you to work for us — $90,000 a year, full legal protection.”', choices: [
        { label: 'Join the Bureau', fn: () => { const s = G.super; s.agency = true; s.registered = true; s.heat = 0; say('🕴️ You became a secret agent of the Bureau of Metahuman Affairs.', 'good'); } },
        { label: 'Decline', fn: () => { fx({ sus: 5 }); say('You turned down the Bureau of Metahuman Affairs.'); } },
      ] });
    },
  },
  {
    id: 'temptation', w: 2, cond: () => G.super.rep >= 15 && G.age >= 16,
    fire() {
      const s = G.super;
      if (isHero()) {
        const v = pick(NPC_VILLAINS), cash = rand(2, 10) * 100000;
        popup({ emoji: '😈', title: 'Temptation', text: `The supervillain <b>${v}</b> offers you <b>${money(cash)}</b> to join their side. “Heroes never get paid. Think about it.”`, choices: [
          { label: 'Refuse', fn: () => { fx({ rep: 3 }); say(`You refused ${v}’s offer to turn evil.`); } },
          { label: 'Take the money and turn villain', fn: () => { G.money += cash; switchSides(); } },
        ] });
      } else {
        const h = pick(NPC_HEROES);
        popup({ emoji: '🕊️', title: 'Second Chance', text: `The hero <b>${h}</b> catches you alone. Instead of fighting, they say: “I know there’s still good in you. It’s not too late.”`, choices: [
          { label: 'Laugh in their face', fn: () => { fx({ rep: 3 }); say(`You laughed at ${h}’s offer of redemption.`); } },
          { label: 'Accept and become a hero', fn: () => switchSides() },
        ] });
      }
    },
  },
  {
    id: 'invasion', w: 1, cond: () => isHero() && G.super.rep >= 55 && !G.super.savedWorld,
    fire() {
      const s = G.super;
      const threat = pick(['An alien armada has appeared over Earth', 'A planet-eating cosmic entity is heading for Earth', 'An army of killer robots is marching on every major city', 'A portal to a demon dimension has opened over ' + G.city]);
      popup({ emoji: '🌍', title: 'The World Needs You', text: `${threat}! Every hero on the planet is being called in.<br><br>Your chance of winning: ~${Math.round(winChance(75) * 100)}%`, choices: [
        { label: 'Lead the charge', fn: () => {
          markActive();
          if (chance(winChance(75))) { s.savedWorld = true; fx({ rep: 25, happy: 25 }); s.stats.saved += 1000000; say(`🌍 ${esc(s.alias)} saved the entire world!`, 'super'); result('🌍', 'Savior of Earth', `Against all odds, you saved the world. Parades are held in your honor in every country on Earth.`); }
          else { const d = injure(25, 50, 'the battle for Earth'); fx({ rep: 5 }); say(`🌍 You fought to save the world. Others finished the job, but you were badly hurt. (-${d} health)`, 'bad'); result('🤕', 'Heavy Losses', `The world was saved, but not by you — you were knocked out early. (-${d} health)`); }
        } },
        { label: 'Stay home', fn: () => { fx({ rep: -20, happy: -10 }); say('🌍 You stayed home while the world nearly ended. People noticed.', 'bad'); } },
      ] });
    },
  },
  {
    id: 'bounty', w: 2, cond: () => !isHero() && G.super.heat >= 45,
    fire() {
      const name = pick(['Deadlock', 'The Huntsman', 'Iron Maiden', 'Shrike', 'Tracker']);
      popup({ emoji: '🎯', title: 'Bounty Hunter', text: `A bounty hunter named <b>${name}</b> has come to collect the price on your head.`, choices: [
        { label: 'Fight', fn: () => { if (chance(winChance(45))) { fx({ rep: 5 }); say(`You defeated the bounty hunter ${name}.`, 'good'); } else { const d = injure(15, 30, `bounty hunter ${name}`); say(`${name} nearly took you down. (-${d} health)`, 'bad'); } } },
        { label: 'Pay them off ($100,000)', show: () => G.money >= 100000, fn: () => { fx({ money: -100000 }); say(`You paid off the bounty hunter ${name}.`); } },
      ] });
    },
  },
  {
    id: 'protege', w: 2, cond: () => G.super.rep >= 30 && !G.super.sidekick && G.age >= 20,
    fire() {
      const s = G.super;
      const p = randomPerson(null, 13, 19);
      const nick = isHero() ? `Kid ${pick(ALIAS.theme[s.power] || ALIAS.heroWords)}` : pick(['Knuckles', 'Scratch', 'Bones', 'Sparky']);
      popup({ emoji: '🧒', title: isHero() ? 'A Young Fan' : 'A Young Delinquent', text: `A ${p.age}-year-old named <b>${p.first}</b> figured out where you hang out and begs to ${isHero() ? 'be your sidekick' : 'work for you'}.`, choices: [
        { label: `Take them on as “${nick}”`, fn: () => { s.sidekick = { name: nick, real: fullName(p) }; say(`🫡 ${p.first} became your ${isHero() ? 'sidekick' : 'henchman'}, ${nick}.`, 'good'); } },
        { label: 'Send them home', fn: () => say(`You sent ${p.first} home.`) },
      ] });
    },
  },
  {
    id: 'evolve', w: 3, cond: () => G.super.level >= 50 && !G.super.second,
    fire() {
      const s = G.super;
      const opts = shuffle(Object.keys(POWERS).filter(k => k !== s.power && POWERS[k].kind === 'power')).slice(0, 3);
      popup({ emoji: '🧬', title: 'Your Powers Are Evolving!', text: 'Something new is waking up inside you. Your body is changing again. Focus — which direction do you push it?',
        choices: opts.map(k => ({ label: `${POWERS[k].emoji} ${POWERS[k].name}`, fn: () => {
          s.second = k; s.level = clamp(s.level + 8);
          say(`🧬 Your powers evolved! You gained ${POWERS[k].name}.`, 'super');
        } })) });
    },
  },
  {
    id: 'kidpowers', w: 1, cond: () => living('Child').some(c => c.age >= 5 && c.age <= 17 && !c.powered),
    fire() {
      const c = pick(living('Child').filter(c => c.age >= 5 && c.age <= 17 && !c.powered));
      c.powered = true;
      const p = POWERS[pick(Object.keys(POWERS).filter(k => POWERS[k].kind === 'power'))];
      popup({ emoji: p.emoji, title: 'Like Parent, Like Child', text: `Your ${roleLabel(c).toLowerCase()} <b>${c.first}</b> just showed signs of <b>${p.name}</b> at breakfast!`, choices: [
        { label: 'Start training them', fn: () => { c.bond = clamp(c.bond + 15); c.knows = true; fx({ happy: 8 }); say(`${p.emoji} Your ${roleLabel(c).toLowerCase()} ${c.first} has ${p.name}! You started training them.`, 'super'); } },
        { label: 'Tell them to hide it', fn: () => { c.bond = clamp(c.bond - 5); say(`${p.emoji} Your ${roleLabel(c).toLowerCase()} ${c.first} has ${p.name}. You told them to keep it hidden.`); } },
      ] });
    },
  },
  {
    id: 'collateral', w: 2, cond: () => isHero() && G.super.stats.missions >= 4,
    fire() {
      const bill = rand(20, 200) * 1000;
      popup({ emoji: '🏚️', title: 'Collateral Damage', text: `The mayor blames ${esc(G.super.alias)} for <b>${money(bill)}</b> in property damage from your last fight.`, choices: [
        { label: 'Pay for repairs anonymously', show: () => G.money >= bill, fn: () => { fx({ money: -bill, rep: 5 }); say('You anonymously paid for the damage you caused.'); } },
        { label: 'Apologize publicly', fn: () => { fx({ rep: -2, sus: 4 }); say(`${esc(G.super.alias)} publicly apologized for property damage.`); } },
        { label: 'Ignore it', fn: () => { fx({ rep: -6, heat: 10 }); say(`${esc(G.super.alias)} ignored the mayor. The police aren’t happy.`, 'bad'); } },
      ] });
    },
  },
];

function eligible(list, ageCheck) {
  return list.filter(e => (!ageCheck || (G.age >= e.min && G.age <= e.max))
    && !(e.once && G.flags['ev_' + e.id])
    && (!e.cond || e.cond()));
}
function weightedPick(list) {
  const total = list.reduce((t, e) => t + (e.w || 1), 0);
  let r = Math.random() * total;
  for (const e of list) { r -= (e.w || 1); if (r <= 0) return e; }
  return list[list.length - 1];
}
function fireEvent(e) {
  if (e.once) G.flags['ev_' + e.id] = true;
  e.fire();
}

function runYearEvents() {
  if (G.prison > 0) {
    if (chance(0.3)) {
      const d = rand(5, 15);
      popup({ emoji: '⛓️', title: 'Prison Yard', text: 'A gang of inmates surrounds you in the yard.', choices: [
        { label: 'Fight', fn: () => { if (chance(G.super ? winChance(25) : 0.4)) { fx({ happy: 5 }); say('You won a prison yard fight. Nobody messes with you now.', 'good'); } else { fx({ health: -d }); G.lastInjury = 'a prison fight'; say(`You lost a prison yard fight. (-${d} health)`, 'bad'); } } },
        { label: 'Back down', fn: () => { fx({ happy: -6 }); say('You backed down in the prison yard.'); } },
      ] });
    }
    return;
  }
  const life = eligible(LIFE_EVENTS, true);
  if (life.length && chance(0.65)) {
    const e = weightedPick(life);
    fireEvent(e);
    const rest = life.filter(x => x !== e);
    if (rest.length && chance(0.15)) fireEvent(weightedPick(rest));
  }
  if (G.super && !G.super.retired) {
    const sup = eligible(SUPER_EVENTS, false);
    if (sup.length && chance(0.6)) fireEvent(weightedPick(sup));
  }
}
