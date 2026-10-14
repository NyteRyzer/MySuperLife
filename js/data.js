// Static game data: names, places, powers, origins, jobs, gear.

const FIRST_NAMES = {
  m: ['Liam', 'Noah', 'Marcus', 'Elijah', 'Mateo', 'Jalen', 'Ethan', 'Caleb', 'Andre', 'Kai', 'Darius', 'Owen',
    'Isaiah', 'Leo', 'Miles', 'Xavier', 'Theo', 'Malik', 'Diego', 'Jaden', 'Wesley', 'Adrian', 'Jordan', 'Tyrone',
    'Hiro', 'Ravi', 'Felix', 'Omar', 'Peter', 'Bruce', 'Clark', 'Victor', 'Silas', 'Grant'],
  f: ['Olivia', 'Ava', 'Maya', 'Zoe', 'Aaliyah', 'Sofia', 'Imani', 'Harper', 'Luna', 'Nia', 'Chloe', 'Jasmine',
    'Aria', 'Kira', 'Layla', 'Gabriela', 'Riley', 'Destiny', 'Naomi', 'Priya', 'Mei', 'Sasha', 'Diana', 'Lois',
    'Jessica', 'Talia', 'Iris', 'Raven', 'Selena', 'Monica', 'Tiana', 'Brielle', 'Kendra', 'Faith'],
};

const LAST_NAMES = ['Carter', 'Johnson', 'Rivera', 'Nguyen', 'Williams', 'Brooks', 'Okafor', 'Kim', 'Patel', 'Garcia',
  'Thompson', 'Reyes', 'Stone', 'Knight', 'Parker', 'Wayne', 'Banner', 'Cross', 'Hale', 'Steele', 'Vance', 'Monroe',
  'Bishop', 'Price', 'Sato', 'Diaz', 'Coleman', 'Ford', 'Hayes', 'Lee', 'Morrison', 'Black', 'Grey', 'Holt'];

const CITIES = ['Port Valor', 'Skyline City', 'Ironbay', 'Crescent Harbor', 'New Avalon', 'Granite Falls',
  'Emerald Bay', 'Titan City', 'Blackwater', 'Solace Heights'];

// Power perks (all optional):
//   fight   – bonus to every fight/mission roll
//   stealth – multiplier on suspicion gained (lower = better at hiding)
//   energy  – extra super actions per year
//   heal    – health regained every year
//   armor   – multiplier on damage taken
//   money   – % bonus to villain heists
//   smarts  – one-time smarts boost on awakening
//   looks   – one-time looks boost on awakening
//   gadget  – multiplier on gadget/base prices
//   escape  – bonus % to escape from capture / prison
//   wipe    – can erase memories
const POWERS = {
  strength: { name: 'Super Strength', emoji: '💪', kind: 'power', desc: 'You can lift a city bus over your head like it’s a backpack.', verbs: ['hurled a car at', 'punched clean through the armor of', 'body-slammed'], fight: 12, armor: 0.8 },
  flight: { name: 'Flight', emoji: '🦅', kind: 'power', desc: 'You can soar above the clouds faster than a fighter jet.', verbs: ['dive-bombed', 'snatched up and dropped', 'flew circles around'], fight: 6, energy: 1, escape: 20 },
  speed: { name: 'Super Speed', emoji: '⚡', kind: 'power', desc: 'You move so fast the world looks frozen.', verbs: ['landed a thousand punches on', 'ran circles around', 'disarmed'], fight: 8, energy: 1, escape: 25 },
  telekinesis: { name: 'Telekinesis', emoji: '🌀', kind: 'power', desc: 'You can move anything with your mind.', verbs: ['flung debris at', 'lifted and pinned', 'crushed the weapons of'], fight: 11 },
  telepathy: { name: 'Telepathy', emoji: '🧠', kind: 'power', desc: 'You can read minds — and erase memories.', verbs: ['scrambled the mind of', 'put to sleep', 'turned the henchmen against'], fight: 7, smarts: 10, wipe: true, stealth: 0.8 },
  pyro: { name: 'Pyrokinesis', emoji: '🔥', kind: 'power', desc: 'You can summon and control fire.', verbs: ['engulfed', 'launched a fireball at', 'melted the weapons of'], fight: 13 },
  cryo: { name: 'Cryokinesis', emoji: '❄️', kind: 'power', desc: 'You can freeze anything solid.', verbs: ['froze', 'encased in ice', 'iced the getaway car of'], fight: 11 },
  electro: { name: 'Electrokinesis', emoji: '🌩️', kind: 'power', desc: 'Lightning crackles at your fingertips.', verbs: ['electrocuted', 'blasted lightning at', 'short-circuited'], fight: 12, money: 10 },
  invisibility: { name: 'Invisibility', emoji: '👻', kind: 'power', desc: 'You can vanish from sight at will.', verbs: ['ambushed', 'snuck up on', 'tripped up'], fight: 5, stealth: 0.4, money: 20, escape: 35 },
  shapeshift: { name: 'Shapeshifting', emoji: '🦎', kind: 'power', desc: 'You can look like anyone — or anything.', verbs: ['impersonated and fooled', 'turned into a gorilla and pummeled', 'tricked'], fight: 7, stealth: 0.4, looks: 10, escape: 30, money: 15 },
  healing: { name: 'Healing Factor', emoji: '🩹', kind: 'power', desc: 'Your body heals from almost anything. You may live a very long time.', verbs: ['shrugged off attacks from', 'outlasted', 'wore down'], fight: 6, heal: 12, armor: 0.6 },
  teleport: { name: 'Teleportation', emoji: '✨', kind: 'power', desc: 'You can blink from place to place instantly.', verbs: ['teleported behind', 'blinked around', 'teleported away the weapons of'], fight: 8, energy: 1, escape: 60 },
  time: { name: 'Time Manipulation', emoji: '⏳', kind: 'power', desc: 'You can slow, stop, and even rewind time for a few seconds.', verbs: ['froze time around', 'rewound the attack of', 'outmaneuvered'], fight: 16, escape: 40 },
  weather: { name: 'Weather Control', emoji: '🌪️', kind: 'power', desc: 'Storms, lightning and hurricanes obey you.', verbs: ['summoned a tornado on', 'struck with lightning', 'buried in hail'], fight: 14 },
  shadow: { name: 'Shadow Manipulation', emoji: '🌑', kind: 'power', desc: 'Darkness bends to your will.', verbs: ['wrapped in shadows', 'dragged into the dark', 'blinded'], fight: 9, stealth: 0.6, escape: 25 },
  sonic: { name: 'Sonic Scream', emoji: '📢', kind: 'power', desc: 'Your scream can shatter steel.', verbs: ['sonic-blasted', 'shattered the armor of', 'deafened'], fight: 10 },
  plant: { name: 'Plant Control', emoji: '🌿', kind: 'power', desc: 'Every root, vine and tree answers your call.', verbs: ['entangled', 'smashed with a giant vine', 'trapped in thorns'], fight: 8, heal: 4 },
  techno: { name: 'Technopathy', emoji: '💾', kind: 'power', desc: 'You can talk to machines and control any technology.', verbs: ['hijacked the tech of', 'turned the robots against', 'hacked the suit of'], fight: 7, money: 30, gadget: 0.5 },
  size: { name: 'Size Shifting', emoji: '📏', kind: 'power', desc: 'You can grow to skyscraper height or shrink to the size of an ant.', verbs: ['stomped on', 'shrank down and ambushed', 'flicked away'], fight: 11, escape: 20 },
  force: { name: 'Force Fields', emoji: '🛡️', kind: 'power', desc: 'You can project unbreakable energy shields.', verbs: ['trapped in a bubble', 'deflected the attacks of', 'shield-bashed'], fight: 7, armor: 0.5 },
  sorcery: { name: 'Sorcery', emoji: '🔮', kind: 'power', desc: 'You wield ancient, mystical magic.', verbs: ['hexed', 'banished', 'turned into a frog'], fight: 13, heal: 4 },
  hydro: { name: 'Hydrokinesis', emoji: '🌊', kind: 'power', desc: 'You can command water — from a glass to a tidal wave.', verbs: ['drenched and swept away', 'crushed with a wave', 'bubbled'], fight: 10 },
  ghost: { name: 'Intangibility', emoji: '👤', kind: 'power', desc: 'You can phase through walls — and bullets pass right through you.', verbs: ['phased through and disarmed', 'pulled through the floor', 'haunted'], fight: 6, armor: 0.5, stealth: 0.7, escape: 70 },
  precog: { name: 'Precognition', emoji: '👁️', kind: 'power', desc: 'You see a few seconds into the future.', verbs: ['predicted every move of', 'dodged every attack of', 'outplayed'], fight: 9, armor: 0.6 },
  energy: { name: 'Energy Blasts', emoji: '☄️', kind: 'power', desc: 'You fire beams of raw energy from your hands and eyes.', verbs: ['eye-beamed', 'blasted', 'vaporized the weapons of'], fight: 14 },
  // Skills — no powers, just extraordinary human ability.
  genius: { name: 'Genius Intellect', emoji: '🧪', kind: 'skill', desc: 'You are smarter than anyone alive. You can invent anything.', verbs: ['outsmarted', 'trapped with an invention', 'predicted the plan of'], fight: 6, smarts: 30, gadget: 0.5, money: 15 },
  martial: { name: 'Martial Arts Mastery', emoji: '🥋', kind: 'skill', desc: 'You have mastered every fighting style on Earth.', verbs: ['roundhouse-kicked', 'disarmed and flipped', 'knocked out'], fight: 10 },
  detective: { name: 'Master Detective', emoji: '🔍', kind: 'skill', desc: 'No clue escapes you. You always know who did it.', verbs: ['tracked down and cornered', 'exposed', 'outwitted'], fight: 6, smarts: 15, stealth: 0.6 },
  gadgeteer: { name: 'Gadgeteer', emoji: '🛠️', kind: 'skill', desc: 'You can build amazing gadgets out of junk.', verbs: ['netted', 'gadget-blasted', 'tasered'], fight: 7, gadget: 0.3 },
  marksman: { name: 'Expert Marksman', emoji: '🎯', kind: 'skill', desc: 'You never miss. Ever.', verbs: ['trick-shot the weapon out of the hand of', 'pinned to a wall', 'ricochet-shot'], fight: 9 },
  acrobat: { name: 'Peak Acrobatics', emoji: '🤸', kind: 'skill', desc: 'You move like a world-class gymnast and parkour master.', verbs: ['flipped over and kicked', 'swung in on', 'dodged around'], fight: 7, escape: 25, armor: 0.8 },
  thief: { name: 'Master Thief', emoji: '🗝️', kind: 'skill', desc: 'No lock, vault or safe can stop you.', verbs: ['pickpocketed and humiliated', 'slipped past', 'stole the weapons of'], fight: 5, money: 40, stealth: 0.6, escape: 35 },
};

// Origins: what happens on the fateful day. `text` and `result` receive a context object `c`
// with { name, age, city, school, parent }.
const ORIGINS = [
  {
    id: 'lab', emoji: '🧬', title: 'The Field Trip',
    text: c => `Your class takes a field trip to Helix Biotech in ${c.city}. While everyone else is in the gift shop, you wander through a door marked <b>RESTRICTED</b>. A shelf wobbles and a rack of glowing green vials shatters at your feet.`,
    choices: [
      { label: 'Try to clean it up', result: 'You kneel down to help — and the glowing liquid soaks straight into your skin. Your veins glow for a heartbeat.', powers: ['healing', 'shapeshift', 'strength', 'size'], lean: 'hero' },
      { label: 'Run and hide', result: 'You run, but the fumes follow you. You cough all the way home and sleep for three days straight.', powers: ['invisibility', 'speed', 'ghost'], tier: -3 },
      { label: 'Drink what’s left in a vial', result: 'You have no idea why you did that. You collapse. When you wake up in the hospital, the machines around you are going haywire.', powers: ['strength', 'energy', 'healing', 'electro', 'size'], tier: 8, fx: { health: -20 }, lean: 'villain' },
    ],
  },
  {
    id: 'meteor', emoji: '☄️', title: 'The Meteor',
    text: c => `A blinding light streaks across the night sky over ${c.city}. With a deafening BOOM, a meteor slams into the field behind your house. Inside the smoking crater, a rock pulses with violet light.`,
    choices: [
      { label: 'Touch the glowing rock', result: 'The moment your fingers touch it, the rock crumbles to dust — and the light flows into you.', powers: ['flight', 'strength', 'energy', 'force'], tier: 5 },
      { label: 'Take it home and hide it', result: 'You keep it under your bed. Over the next few weeks, you start to feel… different.', powers: ['telekinesis', 'energy', 'force', 'sonic'], lean: 'villain' },
      { label: 'Tell your parents', result: `Before your parents can call anyone, the rock flares and knocks you all off your feet. Only you start changing.`, powers: ['flight', 'force', 'precog'], lean: 'hero' },
    ],
  },
  {
    id: 'lightning', emoji: '🌩️', title: 'The Storm',
    text: c => `You're caught outside in the worst thunderstorm ${c.city} has seen in a century. A frightened kitten is stuck on a metal fence nearby, and the lightning is getting closer…`,
    choices: [
      { label: 'Save the kitten', result: 'You grab the kitten just as a bolt of lightning hits the fence. You wake up a week later in the hospital, covered in strange fern-shaped scars.', powers: ['electro', 'speed', 'weather'], lean: 'hero', fx: { health: -10 } },
      { label: 'Run for cover', result: 'You run — but the lightning finds you anyway. The doctors call it a miracle you survived.', powers: ['electro', 'speed', 'weather', 'energy'], fx: { health: -15 } },
    ],
  },
  {
    id: 'beetle', emoji: '🪲', title: 'The Exhibit',
    text: c => `At the ${c.city} Natural History Museum, a scientist is showing off a rare glowing beetle from a deep jungle cave. When nobody is looking, it escapes its case and crawls up your arm.`,
    choices: [
      { label: 'Stay calm and let it crawl', result: 'It bites you anyway. Your arm swells up, and that night you have a fever dream about climbing skyscrapers.', powers: ['acrobat', 'precog', 'strength'], tier: 2, lean: 'hero' },
      { label: 'Swat it!', result: 'You squish it — and its glowing goo seeps into a scratch on your hand. Uh oh.', powers: ['shapeshift', 'precog', 'strength', 'sonic'], lean: 'villain' },
    ],
  },
  {
    id: 'amulet', emoji: '🧿', title: 'The Amulet',
    text: c => `While exploring your grandmother's dusty attic, you find a locked box covered in strange symbols. Inside is an ancient amulet that whispers your name.`,
    choices: [
      { label: 'Put it on', result: 'The amulet melts into your chest, leaving a glowing mark. Ancient knowledge floods your mind.', powers: ['sorcery', 'time', 'teleport', 'shadow'], tier: 5 },
      { label: 'Read the inscription aloud', result: 'The room fills with wind and voices. When it stops, the amulet is gone — but its power stays with you.', powers: ['sorcery', 'weather', 'ghost'], lean: 'hero' },
      { label: 'Try to sell it online', result: 'The amulet does not like that. It burns a mark into your palm, binding itself to you forever.', powers: ['shadow', 'sorcery', 'time'], lean: 'villain', fx: { happy: -5 } },
    ],
  },
  {
    id: 'spill', emoji: '☣️', title: 'The Chemical Spill',
    text: c => `A tanker truck marked <b>OMNICORP — HAZARDOUS</b> skids on the highway and flips right in front of you. Green and purple chemicals pour across the road. A stranger is trapped in the cab.`,
    choices: [
      { label: 'Pull the stranger out', result: 'You drag the driver to safety, but you’re soaked in chemicals. Firefighters call you a hero. Your body starts to change that night.', powers: ['cryo', 'pyro', 'hydro', 'plant', 'healing'], lean: 'hero', fx: { happy: 5 } },
      { label: 'Film it for your followers', result: 'You get way too close for the perfect shot and slip right into the puddle. The video goes viral. So do the side effects.', powers: ['pyro', 'cryo', 'sonic', 'plant'], lean: 'villain' },
    ],
  },
  {
    id: 'alien', emoji: '👽', title: 'The Visitor',
    text: c => `A crashed spacecraft smolders in the woods outside ${c.city}. A wounded alien warrior reaches out to you, holding a glowing ring. "The ring… chooses… you," it whispers.`,
    choices: [
      { label: 'Accept the ring', result: 'The alien smiles and fades away. The ring fits perfectly — and lights up with incredible power.', powers: ['flight', 'force', 'energy'], tier: 6, lean: 'hero' },
      { label: 'Ask what’s in it for you', result: 'The alien hesitates, then presses the ring into your hand. "Use it… wisely." You probably won’t.', powers: ['energy', 'force', 'teleport'], tier: 4, lean: 'villain' },
    ],
  },
  {
    id: 'awakening', emoji: '🧬', title: 'The Awakening',
    text: c => `It starts with a headache. Then the lights flicker. Then, in the middle of a huge argument with ${c.parent}, every window in the house shatters at once. Something has been sleeping inside your DNA all along.`,
    choices: [
      { label: 'Try to calm down', result: 'You breathe. The glass stops floating in the air and gently drops to the floor. You can feel the power waiting for you.', powers: ['telekinesis', 'telepathy', 'force'], lean: 'hero' },
      { label: 'Let the anger flow', result: 'You let it out. It feels amazing. The house is a wreck, but you have never felt so powerful.', powers: ['pyro', 'telekinesis', 'sonic', 'energy'], tier: 5, lean: 'villain', fx: { happy: -5 } },
    ],
  },
  {
    id: 'mentor', emoji: '🥷', title: 'The Mentor',
    text: c => `You notice an old man watching you from the corner of the park every day. One afternoon, he finally walks up to you. "You have the spirit of a warrior," he says. "I can train you — if you are willing."`,
    choices: [
      { label: 'Accept his training', result: 'For years you train in secret, every morning before sunrise. You become something extraordinary — no powers needed.', powers: ['martial', 'acrobat', 'marksman'], lean: 'hero' },
      { label: 'Ask him to teach you to steal', result: 'He laughs. "So be it." He teaches you every trick he knows. Turns out he was the greatest thief who ever lived.', powers: ['thief', 'acrobat', 'martial'], lean: 'villain' },
    ],
  },
  {
    id: 'robbery', emoji: '🚨', title: 'The Robbery',
    text: c => `You’re at your family’s favorite corner store when masked robbers burst in. They take everything — and push ${c.parent} to the floor. The police never catch them. That night, you can’t sleep.`,
    choices: [
      { label: 'Vow to protect the innocent', result: 'You make a promise: no one will ever feel that helpless again. You start training your body and mind relentlessly.', powers: ['detective', 'martial', 'marksman', 'gadgeteer'], lean: 'hero' },
      { label: 'Vow to never be powerless again', result: 'You realize the world belongs to people who take what they want. You start studying how they do it.', powers: ['thief', 'genius', 'martial'], lean: 'villain' },
    ],
  },
  {
    id: 'sciencefair', emoji: '🔬', title: 'The Science Fair',
    text: c => `Your science fair project at ${c.school} — a homemade particle accelerator built from old microwaves — starts humming louder… and louder… and LOUDER.`,
    choices: [
      { label: 'Pull the plug!', result: 'You yank the cord just as it explodes. A wave of energy passes through your brain. Suddenly, everything makes sense.', powers: ['genius', 'techno', 'gadgeteer'], lean: 'hero' },
      { label: 'Crank it up to max', result: 'KA-BOOM. The gym is gone. You walk out of the smoke with a smile and an IQ that is off the charts.', powers: ['genius', 'techno', 'energy'], tier: 4, lean: 'villain' },
    ],
  },
  {
    id: 'eclipse', emoji: '🌘', title: 'The Eclipse',
    text: c => `During a total solar eclipse, everyone in ${c.city} is wearing special glasses. You take yours off for just one second to see the real thing. The sun's corona seems to look right back at you.`,
    choices: [
      { label: 'Keep staring', result: 'Cosmic energy pours into your eyes. When the eclipse ends, you’re floating three feet off the ground.', powers: ['energy', 'flight', 'weather', 'size'], tier: 4 },
      { label: 'Look away fast', result: 'Too late. A tiny spark of cosmic light is already inside you, and it is growing.', powers: ['precog', 'shadow', 'force', 'telepathy'] },
    ],
  },
  {
    id: 'ice', emoji: '🧊', title: 'The Frozen Lake',
    text: c => `Skating on the frozen lake in ${c.city}, you hear a loud CRACK. The ice gives way and you plunge into the freezing black water. You're under for a long, long time…`,
    choices: [
      { label: 'Fight your way to the surface', result: 'You claw your way back to the surface. Paramedics say you were underwater for eleven minutes. That should be impossible.', powers: ['cryo', 'hydro', 'healing'], lean: 'hero' },
      { label: 'Stop struggling', result: 'In the cold dark, something ancient in the lake touches you. You wake up on the shore — and the water around you is moving on its own.', powers: ['hydro', 'cryo', 'shadow', 'ghost'], tier: 3, lean: 'villain' },
    ],
  },
  {
    id: 'flatline', emoji: '💀', title: 'Sixty Seconds',
    text: c => `A terrible fever puts you in the hospital. Late one night, your heart stops. For sixty seconds you're clinically dead, and you see… the other side.`,
    choices: [
      { label: 'Walk toward the light', result: 'A voice says "Not yet." Your heart restarts. You come back with a piece of the other side inside you.', powers: ['ghost', 'healing', 'precog'], lean: 'hero', fx: { health: -10 } },
      { label: 'Walk into the darkness', result: 'The darkness welcomes you. When your heart restarts, the shadows in the room lean toward you like old friends.', powers: ['shadow', 'ghost', 'sorcery'], tier: 3, lean: 'villain', fx: { health: -10 } },
    ],
  },
  {
    id: 'vr', emoji: '🥽', title: 'The Prototype',
    text: c => `A shady guy outside ${c.school} offers you a free prototype VR headset from a tech company nobody has heard of. "Just try it," he says.`,
    choices: [
      { label: 'Try it on', result: 'The headset fuses data straight into your nervous system. When you take it off, you can hear every phone and computer around you.', powers: ['techno', 'genius', 'precog'], tier: 2 },
      { label: 'Hack it first', result: 'You take it apart and find alien circuitry inside. While you poke at it, it zaps you — and now you can speak machine.', powers: ['techno', 'gadgeteer', 'genius'], lean: 'villain' },
    ],
  },
];

// Pre-origin foreshadowing, logged occasionally while growing up.
const HINTS = [
  'You had a vivid dream that you were flying high above the city.',
  'The lights flickered every time you got upset today.',
  'A fortune teller at the fair grabbed your hand and gasped. "Your destiny is… extraordinary."',
  'You caught a falling glass before it hit the floor. Your mom said she didn’t even see you move.',
  'Your dog keeps staring at you like it knows something you don’t.',
  'You read an entire comic book collection this year. You have a strange feeling it was research.',
  'You noticed a black car parked outside your house all week.',
  'You woke up with your blanket floating above your bed. You decided it was a dream.',
  'During a thunderstorm, you weren’t scared at all. You felt… excited.',
];

// Superhero / supervillain name generator parts.
const ALIAS = {
  heroPre: { m: ['Captain', 'Doctor', 'Mister', 'Major', 'The Mighty', 'Agent', 'Sir', 'Night', 'Ultra'], f: ['Captain', 'Doctor', 'Miss', 'Major', 'The Mighty', 'Agent', 'Lady', 'Night', 'Ultra'] },
  villPre: { m: ['Baron', 'Doctor', 'Lord', 'Count', 'The Dread', 'Mister', 'Professor', 'King'], f: ['Baroness', 'Doctor', 'Lady', 'Countess', 'The Dread', 'Madame', 'Professor', 'Queen'] },
  heroSuf: { m: ['man', 'Knight'], f: ['woman', 'Knight'] },
  heroWords: ['Valor', 'Dawn', 'Aegis', 'Justice', 'Liberty', 'Beacon', 'Guardian', 'Sentinel', 'Nova', 'Star'],
  villWords: ['Malice', 'Ruin', 'Venom', 'Havoc', 'Dread', 'Wrath', 'Nightmare', 'Oblivion', 'Plague', 'Spite'],
  theme: {
    strength: ['Titan', 'Colossus', 'Juggernaut', 'Hammer', 'Bulwark', 'Atlas'],
    flight: ['Falcon', 'Skyward', 'Zephyr', 'Jetstream', 'Raptor', 'Comet'],
    speed: ['Blur', 'Streak', 'Velocity', 'Quickstrike', 'Bolt', 'Mach'],
    telekinesis: ['Kinetic', 'Mindforce', 'Gravity', 'Vector', 'Poltergeist'],
    telepathy: ['Psyche', 'Mindreader', 'Cortex', 'Oracle', 'Whisper'],
    pyro: ['Inferno', 'Blaze', 'Ember', 'Scorch', 'Phoenix', 'Cinder'],
    cryo: ['Frost', 'Glacier', 'Blizzard', 'Permafrost', 'Icicle', 'Winter'],
    electro: ['Voltage', 'Sparkstrike', 'Thunderclap', 'Static', 'Ampere', 'Livewire'],
    invisibility: ['Phantom', 'Specter', 'Vanish', 'Mirage', 'Ghostlight'],
    shapeshift: ['Chameleon', 'Mimic', 'Morph', 'Facade', 'Changeling'],
    healing: ['Regenerator', 'Undying', 'Lazarus', 'Everlast', 'Mender'],
    teleport: ['Blink', 'Warp', 'Portal', 'Jumpgate', 'Flicker'],
    time: ['Chronos', 'Hourglass', 'Paradox', 'Tick Tock', 'Epoch'],
    weather: ['Tempest', 'Storm', 'Cyclone', 'Monsoon', 'Squall'],
    shadow: ['Shade', 'Umbra', 'Nightfall', 'Eclipse', 'Penumbra'],
    sonic: ['Banshee', 'Siren', 'Shockwave', 'Decibel', 'Echo'],
    plant: ['Thornwood', 'Ivy', 'Bramble', 'Verdant', 'Oakheart'],
    techno: ['Circuit', 'Glitch', 'Byte', 'Firewall', 'Cipher'],
    size: ['Giant', 'Ant', 'Goliath', 'Micro', 'Behemoth'],
    force: ['Barrier', 'Bastion', 'Forcefield', 'Shield', 'Prism'],
    sorcery: ['Hex', 'Arcana', 'Mystic', 'Warlock', 'Spellbinder'],
    hydro: ['Tide', 'Riptide', 'Tsunami', 'Undertow', 'Torrent'],
    ghost: ['Wraith', 'Phase', 'Spirit', 'Apparition', 'Revenant'],
    precog: ['Foresight', 'Augur', 'Prophet', 'Seer', 'Omen'],
    energy: ['Photon', 'Quasar', 'Pulsar', 'Solaris', 'Radiant'],
    genius: ['Mastermind', 'Einstein', 'Brainstorm', 'Intellect', 'Equation'],
    martial: ['Dragon', 'Shadowfist', 'Tiger', 'Ronin', 'Crane'],
    detective: ['Sleuth', 'Owl', 'Inspector', 'Watcher', 'Raven'],
    gadgeteer: ['Gizmo', 'Gearhead', 'Contraption', 'Wrench', 'Tinker'],
    marksman: ['Deadeye', 'Crosshair', 'Sureshot', 'Longshot', 'Pinpoint'],
    acrobat: ['Skyleap', 'Leaper', 'Somersault', 'Swing', 'Parkour'],
    thief: ['Cat', 'Magpie', 'Lockpick', 'Fox', 'Black Glove'],
  },
};

const NPC_HEROES = ['Captain Valor', 'Lady Lumen', 'The Sentinel', 'Arc Angel', 'Bluebolt', 'Paragon', 'Dawnstar',
  'Ironclad', 'Miss Mercury', 'The Green Warden', 'Starguard', 'Brightblade'];
const NPC_VILLAINS = ['Doctor Malevolo', 'The Hollow King', 'Madame Viper', 'Gravelord', 'Mindshatter', 'The Rot',
  'Baron Blitz', 'Nightgrip', 'Cinderqueen', 'The Collector', 'Professor Paradox', 'Lady Lockjaw', 'Kingpin Krull'];

const COSTUME_COLORS = [
  { name: 'Crimson & Gold', emoji: '🟥' }, { name: 'Midnight Black', emoji: '⬛' },
  { name: 'Royal Blue & Silver', emoji: '🟦' }, { name: 'Emerald Green', emoji: '🟩' },
  { name: 'Imperial Purple', emoji: '🟪' }, { name: 'Blazing Orange', emoji: '🟧' },
  { name: 'Pure White', emoji: '⬜' }, { name: 'Electric Yellow', emoji: '🟨' },
];

// mult = how much suspicion you gain while wearing it.
const COSTUMES = [
  { name: 'Homemade Costume', cost: 0, mult: 1.5 },
  { name: 'Tailored Suit', cost: 2500, mult: 1.0 },
  { name: 'Tactical Armor Suit', cost: 30000, mult: 0.7, armor: 0.85 },
  { name: 'Nano-Tech Suit', cost: 350000, mult: 0.4, armor: 0.7 },
];

const GADGETS = [
  { id: 'comms', name: 'Encrypted Earpiece', emoji: '🎧', cost: 2500, bonus: 2 },
  { id: 'grapple', name: 'Grappling Hook', emoji: '🪝', cost: 4000, bonus: 3 },
  { id: 'belt', name: 'Utility Belt', emoji: '🧰', cost: 9000, bonus: 4 },
  { id: 'drones', name: 'Surveillance Drones', emoji: '🛸', cost: 35000, bonus: 5 },
  { id: 'ai', name: 'AI Assistant', emoji: '🤖', cost: 75000, bonus: 6 },
  { id: 'jetpack', name: 'Jetpack', emoji: '🚀', cost: 120000, bonus: 7 },
  { id: 'vehicle', name: 'Armored Super-Vehicle', emoji: '🏎️', cost: 400000, bonus: 10 },
];

const BASES = [
  { name: { hero: 'Rooftop Hideout', villain: 'Abandoned Subway Lair' }, cost: 20000, bonus: 4 },
  { name: { hero: 'Underground HQ', villain: 'Volcano Bunker' }, cost: 500000, bonus: 10 },
  { name: { hero: 'Orbital Watchtower', villain: 'Floating Sky Fortress' }, cost: 6000000, bonus: 20 },
];

const TEAMS = {
  hero: [
    { name: 'The Night Watch', rep: 25, bonus: 5, pay: 15000 },
    { name: 'The Vanguard', rep: 50, bonus: 10, pay: 60000 },
    { name: 'The Paragon League', rep: 75, bonus: 15, pay: 150000 },
  ],
  villain: [
    { name: 'The Gutter Syndicate', rep: 25, bonus: 5, pay: 25000 },
    { name: 'The Legion of Ruin', rep: 50, bonus: 10, pay: 90000 },
    { name: 'The Obsidian Cabal', rep: 75, bonus: 15, pay: 250000 },
  ],
};

// Heroes patrol and get a random emergency.
const PATROLS = [
  { t: 'a cat stuck at the very top of a tree', d: 0, rep: 1, saved: [0, 0] },
  { t: 'a mugging in a dark alley', d: 5, rep: 2, saved: [1, 1] },
  { t: 'a high-speed car chase on the freeway', d: 15, rep: 4, saved: [1, 6] },
  { t: 'masked thugs robbing a jewelry store', d: 15, rep: 5, saved: [2, 8] },
  { t: 'a bank robbery in progress at First Valor Bank', d: 22, rep: 6, saved: [5, 20] },
  { t: 'an apartment building on fire with families trapped inside', d: 25, rep: 8, saved: [8, 40] },
  { t: 'a gang shootout downtown', d: 30, rep: 7, saved: [3, 15] },
  { t: 'a runaway subway train with no brakes', d: 35, rep: 10, saved: [50, 200] },
  { t: 'a bridge collapsing during rush hour', d: 40, rep: 12, saved: [30, 150] },
  { t: 'a giant robot rampaging through the city', d: 50, rep: 15, saved: [20, 100] },
];

// Villains choose their crimes.
const CRIMES = [
  { t: 'Shake down local businesses', emoji: '💼', d: 5, cash: [3000, 15000], inf: 2, heat: 5 },
  { t: 'Rob an armored truck', emoji: '🚚', d: 15, cash: [25000, 90000], inf: 5, heat: 10 },
  { t: 'Steal a priceless gem from the museum', emoji: '💎', d: 25, cash: [120000, 450000], inf: 8, heat: 15 },
  { t: 'Rob the Central Bank vault', emoji: '🏦', d: 32, cash: [250000, 900000], inf: 11, heat: 22 },
  { t: 'Hack the stock exchange', emoji: '📈', d: 38, cash: [400000, 2000000], inf: 9, heat: 18 },
  { t: 'Hold the mayor hostage for ransom', emoji: '🎩', d: 45, cash: [1000000, 4000000], inf: 18, heat: 35 },
];

// Jobs. edu: 0 none, 1 high school, 2 university, 3 graduate.
const JOBS = [
  { t: 'Newspaper Delivery', s: 6000, edu: 0, sm: 0, minAge: 12, pt: true },
  { t: 'Babysitter', s: 9000, edu: 0, sm: 10, minAge: 13, pt: true },
  { t: 'Grocery Bagger', s: 13000, edu: 0, sm: 0, minAge: 14, pt: true },
  { t: 'Fast Food Cashier', s: 16000, edu: 0, sm: 0, minAge: 14, pt: true },
  { t: 'Janitor', s: 27000, edu: 0, sm: 0, minAge: 18 },
  { t: 'Barista', s: 25000, edu: 0, sm: 10, minAge: 18 },
  { t: 'Retail Clerk', s: 28000, edu: 0, sm: 10, minAge: 18 },
  { t: 'Construction Worker', s: 42000, edu: 0, sm: 10, minAge: 18 },
  { t: 'Photographer, The Daily Beacon', s: 38000, edu: 1, sm: 30, minAge: 18 },
  { t: 'Mechanic', s: 46000, edu: 1, sm: 25, minAge: 18 },
  { t: 'Firefighter', s: 52000, edu: 1, sm: 30, minAge: 18 },
  { t: 'Police Officer', s: 56000, edu: 1, sm: 35, minAge: 18 },
  { t: 'Security Guard, Helix Biotech', s: 34000, edu: 1, sm: 15, minAge: 18 },
  { t: 'Reporter, The Daily Beacon', s: 58000, edu: 2, sm: 50, minAge: 21 },
  { t: 'Teacher', s: 50000, edu: 2, sm: 50, minAge: 21 },
  { t: 'Lab Technician, Helix Biotech', s: 62000, edu: 2, sm: 55, minAge: 21 },
  { t: 'Nurse', s: 74000, edu: 2, sm: 55, minAge: 21 },
  { t: 'Accountant', s: 76000, edu: 2, sm: 60, minAge: 21 },
  { t: 'Architect', s: 88000, edu: 2, sm: 65, minAge: 22 },
  { t: 'Software Engineer, OmniCorp', s: 120000, edu: 2, sm: 70, minAge: 21 },
  { t: 'Lawyer', s: 165000, edu: 3, sm: 75, minAge: 24 },
  { t: 'Surgeon', s: 260000, edu: 3, sm: 82, minAge: 25 },
  { t: 'Research Scientist, Quantum Dynamics', s: 140000, edu: 3, sm: 80, minAge: 24 },
];

const RANKS = ['', 'Senior ', 'Lead ', 'Head ', 'Chief '];
const EDU_NAMES = ['No Diploma', 'High School Diploma', 'Bachelor’s Degree', 'Graduate Degree'];
