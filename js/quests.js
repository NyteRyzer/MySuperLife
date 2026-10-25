// Story arcs: multi-year quests that begin with a mysterious text message.
// Each step can be attempted once per year. A choice either rolls a check (test) or starts a battle (duel).

const stealthBonus = () => (G.super ? (1 - pw('stealth', 1)) * 0.4 : 0);

const QUESTS = [
  {
    id: 'conspiracy', emoji: '🕵️', title: 'The OmniCorp Conspiracy',
    cond: () => isHero() && G.super.rep >= 15 && !G.super.retired,
    hook: 'OmniCorp isn’t what it seems. Check Pier 9 tonight. Come alone. —A friend',
    steps: [
      { title: 'The Shipment at Pier 9', text: 'Crates stamped OMNICORP are being loaded onto a cargo ship in the dead of night. One of them is humming.', choices: [
        { label: '🔦 Sneak closer', test: () => 0.45 + G.stats.smarts / 300 + stealthBonus(), win: 'You pry open a crate: power-dampening collars. Thousands of them.', lose: 'A guard’s flashlight sweeps across you. You escape, but the ship is gone.' },
        { label: '💥 Storm the dock', duel: 35, enemy: { name: 'OmniCorp Security', power: 'marksman' }, win: 'You smash through the guards and crack open a crate: power-dampening collars. Thousands of them.' },
      ] },
      { title: 'Inside OmniCorp Tower', text: 'You need proof of who ordered the collars. The files are on the 88th floor of OmniCorp Tower.', choices: [
        { label: '💻 Hack the servers', test: () => G.stats.smarts / 120 + (G.super.power === 'techno' || G.super.power === 'genius' ? 0.4 : 0), win: 'You’re in. The order was signed by the CEO himself.', lose: 'Firewall. Alarms. You barely get out.' },
        { label: '🪟 Break in through a window', duel: 45, enemy: { name: 'Tower Defense Drones', power: 'energy' }, win: 'You fight past the drones and download everything.' },
      ] },
      { title: 'Victor Kane', text: 'CEO Victor Kane plans to collar every super on Earth — then auction them to the highest bidder. He’s giving a speech tonight.', choices: [
        { label: '📰 Leak the files to the Daily Beacon', test: () => 0.65, win: 'The story breaks worldwide. Kane’s stock collapses — and he’s furious.', lose: 'Kane’s lawyers kill the story before it runs.', fx: { rep: 6 } },
        { label: '🤜 Confront Kane on stage', duel: 55, enemy: { name: 'Victor Kane (power armor)', power: 'strength' }, win: 'Kane’s power armor shatters on live TV. He flees to his factory.' },
      ] },
      { title: 'The Collar Factory', text: 'Kane’s factory in the Harbor District is about to start shipping. This is it.', choices: [
        { label: '⚔️ Destroy the factory', duel: 65, enemy: { name: 'Victor Kane’s Mega-Mech', power: 'energy' }, win: 'The factory explodes behind you as you walk away.' },
      ] },
    ],
    reward: { rep: 20, happy: 20, money: 250000 },
    ending: 'Victor Kane is in handcuffs and every collar is scrap metal. Every super on Earth owes you, and most will never know it.',
  },
  {
    id: 'heist', emoji: '💰', title: 'The Heist of the Century',
    cond: () => G.super && G.super.alignment === 'villain' && G.super.rep >= 15 && !G.super.retired,
    hook: 'The Federal Gold Reserve. $25 million in bars. I have a plan — I just need someone with your… talents.',
    steps: [
      { title: 'Assemble the Crew', text: 'A job this big needs a crew. Who do you bring?', choices: [
        { label: '💻 A hacker ($50,000)', cost: 50000, test: () => 1, win: 'Zero Cool is in. The cameras are as good as yours.' },
        { label: '🚗 A getaway driver ($30,000)', cost: 30000, test: () => 1, win: 'Wheels Malone is in. Nobody outruns Wheels.' },
        { label: '😏 Do it alone', test: () => 0.5, win: 'Who needs a crew? Fewer people to split it with.', lose: 'Without a crew, the plan falls apart. Back to the drawing board.' },
      ] },
      { title: 'Case the Reserve', text: 'You spend weeks posing as a tourist, mapping guard rotations and camera blind spots.', choices: [
        { label: '📝 Study the guard schedule', test: () => G.stats.smarts / 110 + 0.1, win: 'There’s a four-minute gap at 3:12 a.m. That’s your window.', lose: 'A guard recognizes you from last week. You have to lie low and try again.' },
        { label: '🧠 Read a guard’s mind', show: () => pw('wipe'), test: () => 0.95, win: 'You pull the vault codes right out of the head guard’s memory.' },
      ] },
      { title: 'Steal the Vault Blueprints', text: 'The blueprints are locked in the city planning office.', choices: [
        { label: '🥷 Slip in unseen', test: () => 0.4 + stealthBonus() + (G.super.power === 'thief' ? 0.4 : 0), win: 'In and out in ninety seconds. Nobody saw a thing.', lose: 'The night janitor walks in. You bolt.' },
        { label: '💥 Take them by force', duel: 45, enemy: { name: 'Security Chief Hayes', power: 'marksman' }, win: 'Hayes won’t be waking up for a while. The blueprints are yours.' },
      ] },
      { title: 'The Heist', text: '3:12 a.m. The vault door swings open… and a hero is standing inside, waiting for you.', choices: [
        { label: '⚔️ Fight your way to the gold', duel: 70, enemy: { name: 'Captain Valor', power: 'strength' }, win: 'Captain Valor goes down. You load the truck with gold bars and vanish into the night.' },
      ] },
    ],
    reward: { money: 25000000, rep: 20, heat: 35, happy: 20 },
    ending: 'Twenty-five million dollars in gold, and not a single fingerprint. They’re already calling it the heist of the century.',
  },
  {
    id: 'prometheus', emoji: '🧬', title: 'Project Prometheus',
    cond: () => G.super && G.super.alignment && G.super.level >= 20 && G.age >= 16,
    hook: 'Your powers weren’t an accident. Ask about Project Prometheus.',
    steps: [
      { title: 'Where It All Began', text: () => `You return to the place of your origin — “${G.super.origin}.” Something about it feels different now.`, choices: [
        { label: '🔍 Search for clues', test: () => 0.55 + G.stats.smarts / 250, win: 'Under a loose panel you find a badge: “Dr. Elena Voss — Project Prometheus.”', lose: 'Nothing but dust and bad memories. Maybe next year.' },
      ] },
      { title: 'Dr. Elena Voss', text: 'Dr. Voss lives alone in a cabin in the mountains. She goes pale when she sees you.', choices: [
        { label: '🙂 Ask her gently', test: () => 0.35 + G.stats.smarts / 200 + G.stats.looks / 400, win: 'She cries. “You were chosen. Hundreds were. Only a few survived.” She tells you where the vault is.', lose: 'She slams the door. “I don’t know what you’re talking about.”' },
        { label: '😠 Threaten her', test: () => 0.55, win: 'She gives you the location of the Prometheus vault — and begs you not to go.', lose: 'She hits a panic button and vanishes through a trapdoor.' },
        { label: '🧠 Read her mind', show: () => pw('wipe'), test: () => 0.95, win: 'Her memories flood into you: the lab, the experiments, the vault under the old observatory.' },
      ] },
      { title: 'The Prometheus Vault', text: 'Beneath the old observatory, a towering machine wakes up as you enter. “SUBJECT DETECTED.”', choices: [
        { label: '⚔️ Fight the guardian', duel: 50, enemy: { name: 'Prometheus Sentinel', power: 'energy' }, win: 'The Sentinel collapses. Behind it, a door marked with your name.' },
      ] },
      { title: 'The Truth', text: 'The files say you were seeded with power as a child. You were Subject 17. There’s a machine here that could unlock everything you were meant to be.', choices: [
        { label: '⚡ Use the machine', test: () => 1, win: 'Energy tears through you. When it stops, you’re stronger than you ever imagined.', fx: { level: 12, control: 5 } },
        { label: '🔥 Burn it all down', test: () => 1, win: 'You destroy the machine and every file. No one will ever be Subject 18.', fx: { control: 25, happy: 10, rep: 5 } },
      ] },
    ],
    reward: { happy: 15 },
    ending: 'You finally know where your powers came from. Whatever you are, you get to decide what it means.',
  },
  {
    id: 'lighthouse', emoji: '🗼', title: 'The Blackwater Lighthouse',
    cond: () => G.age >= 10 && G.age <= 45,
    hook: 'Blackwater Lighthouse. Midnight. Bring a flashlight. The captain’s gold is real.',
    steps: [
      { title: 'Lights in the Lighthouse', text: 'The lighthouse has been abandoned for sixty years. Tonight, its lamp is glowing.', choices: [
        { label: '🔦 Go alone at midnight', test: () => 0.6, win: 'Inside, the lamp is cold, but a trapdoor in the floor is open.', lose: 'You lose your nerve halfway up the stairs. Maybe next year.' },
        { label: '👯 Bring a friend', show: () => G.people.some(p => p.alive && /^(Best )?Friend$/.test(p.role)), test: () => 0.9, win: 'Together you find a trapdoor hidden under an old rug.', after: () => { const f = pick(G.people.filter(p => p.alive && /^(Best )?Friend$/.test(p.role))); f.bond = clamp(f.bond + 10); } },
      ] },
      { title: 'The Captain’s Journal', text: 'Below the trapdoor is a dusty cabin and a journal written in faded ink and strange symbols.', choices: [
        { label: '📖 Decode the journal', test: () => G.stats.smarts / 100 + 0.15, win: 'The captain hid his gold in a sea cave. The entrance is sealed by a riddle.', lose: 'The symbols make your head spin. You’ll come back to it.' },
      ] },
      { title: 'The Riddle', text: 'Carved into the cave door: <i>“I have keys but open no locks. I have space but no room. You can enter, but never go inside.”</i>', choices: [
        { label: '🗝️ “A prison.”', test: () => 0, lose: 'The door doesn’t budge. Wrong answer. You’ll have to think about it.' },
        { label: '⌨️ “A keyboard.”', test: () => 1, win: 'With a deep groan, the stone door rolls aside.' },
        { label: '🎹 “A piano.”', test: () => 0, lose: 'Close… but the door stays shut.' },
      ] },
      { title: 'The Sea Cave', text: 'The tide is coming in fast. The treasure chest is on a ledge across a flooded chamber.', choices: [
        { label: '🏊 Swim for it', test: () => G.stats.health / 110, win: 'You haul the chest back just as the water reaches the ceiling.', lose: 'The current drags you back. You barely make it out.', failHurt: [5, 15] },
        { label: '⚡ Use your powers', show: () => G.super && G.super.alignment, test: () => 0.95, win: 'You make it look easy.', fx: { sus: 4 } },
      ] },
    ],
    reward: { money: 350000, happy: 20 },
    ending: 'The chest is full of Spanish gold coins. The captain’s legend was true — and now it’s yours.',
  },
];

function qState(id) { G.quests = G.quests || {}; return G.quests[id]; }
function activeQuests() { return QUESTS.filter(q => { const s = qState(q.id); return s && !s.done; }); }
function questsDone() { return QUESTS.filter(q => { const s = qState(q.id); return s && s.done; }).length; }

// Yearly: maybe a stranger texts you to begin a new story.
function questYearly() {
  if (G.prison > 0 || activeQuests().length >= 2) return;
  const open = QUESTS.filter(q => !qState(q.id) && q.cond());
  if (!open.length || !chance(0.3)) return;
  if ((G.inbox || []).some(m => m.type === 'quest' && !m.answered)) return;
  const q = pick(open);
  sendMessage('quest', { quest: q.id, from: 'Unknown number', emoji: '❓', text: q.hook });
  say('📱 You got a strange text from an unknown number.', 'hint');
}

function startQuest(id) {
  const q = QUESTS.find(x => x.id === id);
  if (!q || qState(id)) return;
  G.quests[id] = { step: 0, done: false, started: G.age };
  say(`📖 A new story begins: <b>${q.title}</b>.`, 'quest');
  runQuestStep(q);
}

function runQuestStep(q) {
  const st = qState(q.id);
  if (!st || st.done) return;
  if (G.used['quest_' + q.id]) return toast('You’ve done all you can this year. Age up to continue.');
  const step = q.steps[st.step];
  const text = typeof step.text === 'function' ? step.text() : step.text;
  popup({
    emoji: q.emoji, title: step.title, cls: 'quest',
    text: `<div class="quest-tag">${q.title} · Part ${st.step + 1} of ${q.steps.length}</div>${text}`,
    choices: step.choices.filter(c => !c.show || c.show()).map(c => ({
      label: c.label, hint: c.cost ? money(c.cost) : c.duel ? 'Battle' : null,
      fn: () => {
        if (c.cost && G.money < c.cost) return toast(`You need ${money(c.cost)}.`);
        G.used['quest_' + q.id] = true;
        if (c.cost) G.money -= c.cost;
        if (c.duel) {
          if (!G.super || !G.super.alignment) return questFail(q, c);
          duel(c.duel, c.enemy, '', () => questWin(q, c), () => { injure(10, 25, `a fight with ${c.enemy.name}`); questFail(q, c); });
        } else if (chance(clamp(c.test(), 0, 1))) questWin(q, c);
        else questFail(q, c);
      },
    })).concat([{ label: 'Not now' }]),
  });
}

function questWin(q, c) {
  const st = qState(q.id);
  if (c.fx) fx(c.fx);
  if (c.after) c.after();
  st.step++;
  if (st.step >= q.steps.length) {
    st.done = true; st.finished = G.age;
    fx(q.reward);
    say(`📖 You completed <b>${q.title}</b>!`, 'quest');
    popup({ emoji: '🏆', title: q.title, cls: 'quest', text: `${c.win}<br><br><b>The End.</b> ${q.ending}${fxSummary(q.reward)}`, choices: [{ label: 'What a story' }] });
  } else {
    say(`${q.emoji} ${q.title}: ${c.win}`, 'quest');
    popup({ emoji: q.emoji, title: 'Success', cls: 'quest', text: `${c.win}<br><br><i>To be continued… (Part ${st.step + 1} next year)</i>`, choices: [{ label: 'Continue' }] });
  }
}
function questFail(q, c) {
  if (c.failHurt) { const d = rand(c.failHurt[0], c.failHurt[1]); fx({ health: -d }); G.lastInjury = 'an accident'; }
  const msg = c.lose || 'It didn’t work out this time.';
  say(`${q.emoji} ${q.title}: ${msg}`);
  popup({ emoji: '😓', title: 'Setback', cls: 'quest', text: `${msg}<br><br><i>You can try again next year.</i>`, choices: [{ label: 'OK' }] });
}

function questRows() {
  return activeQuests().map(q => {
    const st = qState(q.id);
    const done = G.used['quest_' + q.id];
    return row(q.emoji, q.title, done ? 'Continue next year' : `Part ${st.step + 1}/${q.steps.length}: ${q.steps[st.step].title}`, () => runQuestStep(q), { cls: done ? 'done' : 'feature' });
  });
}

ACHIEVEMENTS.push(
  { id: 'story', emoji: '📖', name: 'Storyteller', desc: 'Finish a story arc', test: () => questsDone() >= 1 },
  { id: 'saga', emoji: '📚', name: 'The Saga', desc: 'Finish 3 story arcs', test: () => questsDone() >= 3 },
  { id: 'chapter', emoji: '🔖', name: 'Final Chapter', desc: 'Reach Chapter 6 of your life', test: () => G.age >= 70 },
  { id: 'powercouple', emoji: '💞', name: 'Power Couple', desc: 'Date a fellow super', test: () => G.people.some(p => p.alive && p.superAlias && ['Partner', 'Spouse'].includes(p.role)) },
);
