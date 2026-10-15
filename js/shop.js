// Making friends, and buying stuff: clothes, grooming, cars, homes and luxury items.

const FRIEND_TRAITS = ['Funny', 'Sporty', 'Nerdy', 'Artsy', 'Rebellious', 'Kind', 'Rich', 'Gamer', 'Adventurous', 'Bookworm', 'Party Animal', 'Musician'];
const TRAIT_EMOJI = { Funny: '😂', Sporty: '⚽', Nerdy: '🤓', Artsy: '🎨', Rebellious: '🤘', Kind: '🤗', Rich: '💎', Gamer: '🎮', Adventurous: '🧗', Bookworm: '📚', 'Party Animal': '🥳', Musician: '🎸' };

const HANGOUTS = [
  { id: 'school', emoji: '🏫', name: 'Around school', sub: 'Classmates your age', cond: () => ['Elementary School', 'Middle School', 'High School', 'University', 'Graduate School'].includes(G.edu.stage) },
  { id: 'work', emoji: '💼', name: 'At work', sub: 'Coworkers', cond: () => G.job },
  { id: 'park', emoji: '🌳', name: 'At the park', sub: 'Anyone, any age', cond: () => G.age >= 5 },
  { id: 'cafe', emoji: '☕', name: 'At a coffee shop', sub: 'Young adults & up', cond: () => G.age >= 15 },
  { id: 'online', emoji: '💻', name: 'Online', sub: 'Gamers & internet people', cond: () => G.age >= 12 },
  { id: 'club', emoji: '🧩', name: 'Join a club or team', sub: 'People who share a hobby', cond: () => G.age >= 6 },
];

function actMakeFriends() {
  if (G.prison > 0) return toast('Not much of a social scene in here.');
  popup({ emoji: '🤝', title: 'Make Friends', text: 'Where do you want to meet new people?', choices: HANGOUTS.filter(hg => hg.cond()).map(hg => ({
    label: `${hg.emoji} ${hg.name}`, hint: hg.sub, fn: () => meetPeople(hg),
  })).concat([{ label: 'Never mind' }]) });
}

function meetPeople(hg) {
  if (!once('meet_' + hg.id)) return;
  const [lo, hi] = hg.id === 'school' ? [G.age - 1, G.age + 1] : hg.id === 'park' ? [Math.max(5, G.age - 15), G.age + 25] : [Math.max(5, G.age - 6), G.age + 8];
  const people = [0, 1, 2].map(() => ({ ...randomPerson(null, Math.max(5, lo), Math.max(5, hi)), trait: pick(FRIEND_TRAITS) }));
  popup({ emoji: hg.emoji, title: hg.name, text: 'You notice a few people. Who do you want to talk to? (You only have time for one.)', choices: people.map(p => ({
    label: `${TRAIT_EMOJI[p.trait]} ${p.first} ${p.last}`, hint: `${p.trait} · age ${p.age}`,
    fn: () => approach(p, hg),
  })).concat([{ label: 'Go home' }]) });
}

function approach(p, hg) {
  const openers = {
    Funny: 'You crack a joke about the weather.', Sporty: 'You ask what team they play for.', Nerdy: 'You ask about the book they’re reading.',
    Artsy: 'You compliment their sketchbook.', Rebellious: 'You compliment their leather jacket.', Kind: 'You help them pick up something they dropped.',
    Rich: 'You ask where they got their very expensive sneakers.', Gamer: 'You notice their gaming hoodie and ask what they’re playing.',
    Adventurous: 'You ask about their climbing gear.', Bookworm: 'You recommend a book.', 'Party Animal': 'You ask where the party is this weekend.', Musician: 'You ask about their guitar case.',
  };
  popup({ emoji: TRAIT_EMOJI[p.trait], title: p.first, text: `${openers[p.trait]}<br><br>How do you play it?`, choices: [
    { label: '😄 Be yourself', fn: () => tryFriend(p, 0.55 + G.stats.happy / 300) },
    { label: '😎 Try to look cool', fn: () => tryFriend(p, 0.3 + G.stats.looks / 160) },
    { label: '🧠 Have a deep conversation', fn: () => tryFriend(p, 0.3 + G.stats.smarts / 160) },
    { label: '🎁 Offer to buy them a snack ($10)', show: () => G.money >= 10, fn: () => { G.money -= 10; tryFriend(p, 0.75); } },
  ] });
}

function tryFriend(p, odds) {
  if (chance(odds)) {
    const f = addPerson({ ...p, role: 'Friend', bond: rand(50, 75) });
    fx({ happy: rand(4, 8) });
    say(`🤝 You became friends with ${fullName(f)} (${f.trait.toLowerCase()}).`, 'good');
    result(TRAIT_EMOJI[f.trait], 'New Friend!', `You and <b>${f.first}</b> hit it off! You can hang out with them from the People tab.`);
  } else {
    fx({ happy: -3 });
    say(`You tried to make friends with ${p.first}, but it was awkward.`);
    result('😬', 'Awkward…', `${p.first} gives you a weird look and finds a reason to leave.`);
  }
}

// Extra things you can do with a friend.
function friendChoices(p) {
  const best = p.role === 'Best Friend';
  const label = best ? 'best friend' : 'friend';
  return [
    { label: '🍕 Grab food together', show: () => G.age >= 8, fn: () => { if (!once(`food${p.id}`)) return; p.bond = clamp(p.bond + rand(4, 9)); fx({ happy: 4, money: G.age >= 16 ? -Math.min(25, G.money) : 0 }); say(`🍕 You grabbed food with your ${label} ${p.first}.`); toast(`${p.first} had a great time`); } },
    { label: '🎬 See a movie', show: () => G.age >= 6, fn: () => {
      if (!once(`movie${p.id}`)) return;
      const film = pick(['a superhero blockbuster', 'a horror movie', 'a romantic comedy', 'an animated movie', 'a sci-fi epic']);
      p.bond = clamp(p.bond + rand(3, 8)); fx({ happy: 5, money: G.age >= 16 ? -Math.min(15, G.money) : 0 });
      say(`🎬 You saw ${film} with ${p.first}.`); toast(`You saw ${film}`);
    } },
    { label: '🎮 Play video games', show: () => p.trait === 'Gamer' || p.age < 30, fn: () => {
      if (!once(`games${p.id}`)) return;
      const won = chance(0.5); p.bond = clamp(p.bond + rand(2, 6)); fx({ happy: won ? 5 : 2 });
      say(`🎮 You played video games with ${p.first}${won ? ' and won every round' : ' and got destroyed'}.`); toast(won ? 'You won!' : 'You lost…');
    } },
    { label: '🧗 Go on an adventure together', show: () => G.age >= 12, fn: () => {
      if (!once(`adv${p.id}`)) return;
      const trip = pick(['went camping', 'went cliff jumping', 'took a spontaneous road trip', 'explored an abandoned mall', 'went to an escape room']);
      p.bond = clamp(p.bond + rand(6, 12)); fx({ happy: rand(6, 10) });
      say(`🧗 You and ${p.first} ${trip}.`, 'good'); result('🧗', 'Adventure!', `You and ${p.first} ${trip}. You’ll be talking about it for years.`);
    } },
    { label: '💸 Ask to borrow money', show: () => p.trait === 'Rich' && G.age >= 14, fn: () => {
      if (!once(`borrow${p.id}`)) return;
      if (chance(p.bond / 120)) { const amt = rand(5, 50) * 100; G.money += amt; p.bond = clamp(p.bond - 5); say(`💸 ${p.first} lent you ${money(amt)}.`); toast(`+${money(amt)}`); }
      else { p.bond = clamp(p.bond - 10); toast(`${p.first} said no. Awkward.`); }
    } },
    { label: '⭐ Ask to be best friends', show: () => !best && p.bond >= 75, fn: () => {
      if (chance(p.bond / 100)) { p.role = 'Best Friend'; p.bond = clamp(p.bond + 10); fx({ happy: 10 }); say(`⭐ ${p.first} is now your best friend!`, 'good'); result('⭐', 'Best Friends!', `${p.first} says yes. Friendship bracelets are being made as we speak.`); }
      else { p.bond = clamp(p.bond - 5); result('😅', 'Not Yet', `${p.first} says they like you a lot, but “best friend” is a big title.`); }
    } },
    { label: '👋 End the friendship', fn: () => { p.role = 'Former Friend'; fx({ happy: -3 }); say(`👋 You ended your friendship with ${fullName(p)}.`); } },
  ];
}

// ---------- shopping ----------
// kind: wear (one-time looks boost, stays in your wardrobe), care (repeatable service), car, home, luxury
const SHOP = [
  // Clothes & style
  { id: 'thrift', kind: 'wear', emoji: '👕', name: 'Thrift Store Outfit', cost: 60, looks: 2, min: 5 },
  { id: 'sneakers', kind: 'wear', emoji: '👟', name: 'Fresh Sneakers', cost: 180, looks: 3, min: 8 },
  { id: 'streetwear', kind: 'wear', emoji: '🧢', name: 'Streetwear Drop', cost: 450, looks: 4, happy: 3, min: 12 },
  { id: 'leather', kind: 'wear', emoji: '🧥', name: 'Leather Jacket', cost: 900, looks: 5, min: 14 },
  { id: 'formal', kind: 'wear', emoji: '🤵', name: 'Tailored Suit / Gown', cost: 2500, looks: 7, min: 16 },
  { id: 'watch', kind: 'wear', emoji: '⌚', name: 'Luxury Watch', cost: 18000, looks: 5, happy: 4, min: 18 },
  { id: 'jewelry', kind: 'wear', emoji: '💍', name: 'Diamond Jewelry', cost: 45000, looks: 7, happy: 5, min: 18 },
  { id: 'couture', kind: 'wear', emoji: '👗', name: 'Haute Couture Collection', cost: 120000, looks: 12, happy: 6, min: 18 },
  // Grooming (once per year)
  { id: 'haircut', kind: 'care', emoji: '💇', name: 'Fresh Haircut', cost: 45, looks: [2, 4], min: 5 },
  { id: 'skincare', kind: 'care', emoji: '🧴', name: 'Skincare Routine', cost: 150, looks: [1, 3], health: 1, min: 12 },
  { id: 'spa', kind: 'care', emoji: '🧖', name: 'Spa Day', cost: 450, looks: [2, 4], happy: [6, 10], min: 16 },
  { id: 'teeth', kind: 'care', emoji: '😁', name: 'Teeth Whitening', cost: 900, looks: [3, 5], min: 16 },
  { id: 'trainer', kind: 'care', emoji: '🏋️', name: 'Personal Trainer (1 year)', cost: 4000, looks: [3, 6], health: [5, 10], min: 16 },
  { id: 'surgery', kind: 'care', emoji: '💉', name: 'Cosmetic Surgery', cost: 12000, looks: [10, 20], risky: true, min: 18 },
  // Cars
  { id: 'bike', kind: 'car', emoji: '🚲', name: 'Mountain Bike', cost: 600, happy: 4, min: 8 },
  { id: 'scooter', kind: 'car', emoji: '🛵', name: 'Moped', cost: 2500, happy: 4, min: 15 },
  { id: 'beater', kind: 'car', emoji: '🚗', name: 'Used Hatchback', cost: 5000, happy: 5, min: 16 },
  { id: 'sedan', kind: 'car', emoji: '🚙', name: 'New Sedan', cost: 28000, happy: 7, min: 16 },
  { id: 'truck', kind: 'car', emoji: '🛻', name: 'Pickup Truck', cost: 48000, happy: 8, min: 16 },
  { id: 'ev', kind: 'car', emoji: '🔋', name: 'Electric Sports Sedan', cost: 90000, happy: 10, looks: 2, min: 16 },
  { id: 'sports', kind: 'car', emoji: '🏎️', name: 'Italian Sports Car', cost: 280000, happy: 14, looks: 4, min: 18 },
  { id: 'hyper', kind: 'car', emoji: '🚀', name: 'Hypercar', cost: 2500000, happy: 18, looks: 6, min: 18 },
  // Homes
  { id: 'rent', kind: 'rent', emoji: '🏢', name: 'Rent an Apartment', cost: 1400, happy: 6, min: 18 },
  { id: 'condo', kind: 'home', emoji: '🏬', name: 'Downtown Condo', cost: 220000, happy: 10, min: 18 },
  { id: 'house', kind: 'home', emoji: '🏡', name: 'Suburban House', cost: 450000, happy: 12, min: 18 },
  { id: 'loft', kind: 'home', emoji: '🏙️', name: 'Penthouse Loft', cost: 1800000, happy: 16, looks: 2, min: 18 },
  { id: 'mansion', kind: 'home', emoji: '🏰', name: 'Hilltop Mansion', cost: 7500000, happy: 20, looks: 3, min: 18 },
  { id: 'island', kind: 'home', emoji: '🏝️', name: 'Private Island', cost: 45000000, happy: 25, min: 18 },
  // Luxury & fun
  { id: 'console', kind: 'luxury', emoji: '🎮', name: 'Gaming Console', cost: 500, happy: 6, min: 6 },
  { id: 'phone', kind: 'luxury', emoji: '📱', name: 'Latest Smartphone', cost: 1200, happy: 4, looks: 1, min: 10 },
  { id: 'guitar', kind: 'luxury', emoji: '🎸', name: 'Electric Guitar', cost: 1500, happy: 5, smarts: 2, min: 10 },
  { id: 'dog', kind: 'luxury', emoji: '🐕', name: 'Adopt a Dog', cost: 400, happy: 10, health: 2, min: 8 },
  { id: 'boat', kind: 'luxury', emoji: '🚤', name: 'Speedboat', cost: 120000, happy: 12, min: 18 },
  { id: 'art', kind: 'luxury', emoji: '🖼️', name: 'Famous Painting', cost: 900000, happy: 8, smarts: 2, min: 18 },
  { id: 'yacht', kind: 'luxury', emoji: '🛥️', name: 'Superyacht', cost: 15000000, happy: 20, looks: 3, min: 18 },
  { id: 'jet', kind: 'luxury', emoji: '🛩️', name: 'Private Jet', cost: 40000000, happy: 22, min: 18 },
];
const RESALE = { wear: 0.1, car: 0.85, home: 1, luxury: 0.5 };
const rnd = v => Array.isArray(v) ? rand(v[0], v[1]) : (v || 0);

function owned(id) { return (G.assets || []).filter(a => a.id === id); }
function assetValue() { return (G.assets || []).reduce((t, a) => t + (a.kind === 'wear' ? 0 : a.value), 0); }
function netWorth() { return G.money - G.debt + assetValue(); }

function buyItem(it) {
  if (G.age < it.min) return toast(`You need to be ${it.min} for that.`);
  if (G.prison > 0) return toast('You can’t go shopping from prison.');
  if (it.kind === 'rent') return rentApartment();
  if (G.money < it.cost) return toast(`You need ${money(it.cost)}.`);
  if (it.kind === 'care') {
    if (!once('care_' + it.id)) return;
    G.money -= it.cost;
    if (it.risky && chance(0.15)) {
      fx({ looks: -rand(10, 20), happy: -15 });
      say(`💉 Your ${it.name.toLowerCase()} was botched.`, 'bad');
      return result('😱', 'Botched!', 'The surgeon made a terrible mistake. You look worse than before.');
    }
    const eff = { looks: rnd(it.looks), happy: rnd(it.happy), health: rnd(it.health) };
    fx(eff);
    say(`${it.emoji} You got a ${it.name.toLowerCase()}.`);
    return toast(`${it.name}: Looks +${eff.looks}`);
  }
  if (it.kind === 'wear' && owned(it.id).length) return toast('You already own that.');
  G.money -= it.cost;
  G.assets.push({ id: it.id, kind: it.kind, name: it.name, emoji: it.emoji, value: it.cost, paid: it.cost, age: G.age });
  fx({ looks: rnd(it.looks), happy: rnd(it.happy), health: rnd(it.health), smarts: rnd(it.smarts) });
  if (it.kind === 'home' && G.renting) { G.renting = false; say('You moved out of your rented apartment.'); }
  say(`${it.emoji} You bought a ${it.name} for ${money(it.cost)}.`, 'good');
  result(it.emoji, 'Purchased!', `You bought a <b>${it.name}</b> for ${money(it.cost)}.${it.kind === 'home' ? '<br><br>Homes can grow in value over time.' : it.kind === 'car' ? '<br><br>Cars lose value every year and cost money to keep up.' : ''}`);
}

function rentApartment() {
  if (G.renting) {
    G.renting = false; say('🏢 You moved out of your rented apartment.'); return toast('You moved out.');
  }
  G.renting = true; fx({ happy: 6 });
  say('🏢 You rented your own apartment ($1,400/month).', 'good');
  result('🏢', 'Your Own Place', 'You signed a lease on a one-bedroom apartment. Rent is $16,800 a year.');
}

function sellAsset(a) {
  const amt = Math.round(a.value * (RESALE[a.kind] ?? 0.5));
  popup({ emoji: a.emoji, title: `Sell ${a.name}?`, text: `You’d get <b>${money(amt)}</b> for it.`, choices: [
    { label: `Sell for ${money(amt)}`, fn: () => { G.assets = G.assets.filter(x => x !== a); G.money += amt; fx({ happy: -2 }); say(`You sold your ${a.name} for ${money(amt)}.`); } },
    { label: 'Keep it' },
  ] });
}

// Yearly: depreciation, appreciation, upkeep, rent, and a little joy from nice things.
function assetsTick() {
  if (!G.assets) return;
  let upkeep = 0, joy = 0;
  G.assets.forEach(a => {
    if (a.kind === 'car') { a.value = Math.round(a.value * 0.86); upkeep += Math.round(a.paid * 0.03); joy = Math.max(joy, 1); }
    else if (a.kind === 'home') { a.value = Math.round(a.value * (1 + rand(-3, 7) / 100)); upkeep += Math.round(a.value * 0.012); joy = Math.max(joy, 3); }
    else if (a.kind === 'luxury') { a.value = Math.round(a.value * (a.id === 'art' ? 1 + rand(-5, 12) / 100 : 0.9)); upkeep += a.paid >= 100000 ? Math.round(a.paid * 0.05) : 0; }
  });
  if (G.renting && G.prison === 0) upkeep += 16800;
  if (G.prison === 0) G.money -= upkeep;
  if (joy) fx({ happy: rand(0, joy) });
  if (G.money < 0) {
    G.debt += -G.money; G.money = 0;
    say(`💳 You couldn’t cover your bills and went into debt (${money(G.debt)}).`, 'bad');
    fx({ happy: -5 });
  }
}

function livingText() {
  const homes = G.assets.filter(x => x.kind === 'home').sort((x, y) => y.value - x.value);
  if (homes.length) return homes[0].name + (homes.length > 1 ? ` (+${homes.length - 1} other propert${homes.length === 2 ? 'y' : 'ies'})` : '');
  return G.renting ? 'Rented apartment' : G.age < 18 ? 'With your family' : 'With your parents';
}

function shopPanel() {
  const a = G.age;
  const out = h('div', {});
  out.append(h('div', { class: 'info' },
    h('div', {}, '💰 Cash: ', h('b', {}, money(G.money))),
    h('div', {}, '🏦 Net worth: ', h('b', {}, money(netWorth()))),
    h('div', {}, '🏠 Living: ', h('b', {}, livingText()))));
  if (G.prison > 0) { out.append(h('p', { class: 'muted' }, 'You can’t shop while you’re in prison.')); return out; }
  const mine = G.assets.filter(x => x.kind !== 'wear');
  if (mine.length) out.append(section('Your Stuff', mine.map(x => row(x.emoji, x.name, `Worth ${money(x.value * (RESALE[x.kind] ?? 0.5))} · tap to sell`, () => sellAsset(x)))));
  const wardrobe = G.assets.filter(x => x.kind === 'wear');
  if (wardrobe.length) out.append(h('div', { class: 'wardrobe' }, '👚 Wardrobe: ', wardrobe.map(x => x.emoji).join(' ')));
  const item = it => {
    const has = it.kind === 'wear' && owned(it.id).length;
    const boost = [it.looks && `✨ +${Array.isArray(it.looks) ? it.looks.join('–') : it.looks} looks`, it.happy && `😊 +${Array.isArray(it.happy) ? it.happy.join('–') : it.happy}`, it.health && '❤️ health'].filter(Boolean).join(' · ');
    return row(it.emoji, it.name, has ? 'Owned' : `${money(it.cost)}${it.kind === 'rent' ? '/month' : ''}${boost ? ' · ' + boost : ''}${it.risky ? ' · risky' : ''}`,
      () => buyItem(it), { disabled: a < it.min || has, why: has ? 'You already own that.' : `You need to be ${it.min}.` });
  };
  const list = k => SHOP.filter(it => it.kind === k && a >= Math.min(it.min, 18) - 4);
  out.append(section('Clothes & Style', list('wear').map(item)));
  out.append(section('Grooming & Looks', list('care').map(item)));
  out.append(section('Vehicles', list('car').map(item)));
  if (a >= 16) out.append(section('Homes', SHOP.filter(it => it.kind === 'rent' || it.kind === 'home').map(it => it.kind === 'rent'
    ? row(it.emoji, G.renting ? 'Move out of your apartment' : it.name, G.renting ? 'Stop paying rent' : '$1,400/month · your own place', () => buyItem(it), { disabled: a < 18, why: 'You need to be 18.' })
    : item(it))));
  out.append(section('Luxury & Fun', list('luxury').map(item)));
  return out;
}
