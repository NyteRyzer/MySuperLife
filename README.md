# MySuperLife 🦸🦹

A BitLife-style life simulator where you can become a superhero or a supervillain.

You're born, you grow up, you go to school, get jobs, fall in love, have kids and grow old, one **Age +** tap at a time. But at a random moment before you turn 18, **something happens**: a lab accident, a meteor, a lightning strike, an alien's dying gift, an ancient amulet, a mysterious mentor… It's your **origin story**, and it gives you a random superpower or super-skill.

Then you decide who you become.

## How to play

Open `index.html` in any browser. There's no build step and nothing to install. Your life saves automatically in the browser.

To play on your phone, turn on **GitHub Pages** for this repo (Settings → Pages → deploy from branch, root folder) and open the link it gives you.

## Features

**Normal life (like BitLife)**
- Happiness, Health, Smarts and Looks stats, plus money and debt
- School, university and graduate school, part-time and full-time jobs, promotions, raises and retirement
- Parents, siblings, friends, dating, marriage, kids, and the people in your life aging and dying
- **8 adventures**, each a short story with choices: Iron Temple Gym, Club Neon, Sunburst Festival, Granite Peak Hike, Golden Vault Casino (slots, blackjack, roulette), Coral Cove Beach, Thunder Mountain Park and Dragon Gate Dojo. Many have secret options if you have powers
- **Friends**: meet people at school, work, the park, a coffee shop, online or in a club. Each person has a personality, and you choose how to approach them. Hang out, see movies, go on adventures, and make best friends
- **Shopping**: clothes and jewelry that raise your looks, grooming (haircuts, spa days, surgery), cars from a bike to a hypercar, homes from a rented apartment to a private island, and luxury items like yachts and jets. Cars lose value, homes can gain value, and everything costs upkeep. Tap your money to open the shop
- **Pets**: adopt dogs, cats, parrots, snakes, horses and more. Play, train tricks, visit the vet. If you have powers, a pet may develop powers too and fight by your side
- **Social media**: post selfies, memes and dance videos, go live, or leak footage of your alter ego. Go viral, get verified, and earn sponsorship money
- **Side hustles**: lemonade stands, mowing lawns, tutoring, flipping sneakers, rideshare driving, streaming, and selling superhero photos to the paper
- **Investing**: index funds, tech stocks, crypto and OmniCorp shares that rise and fall every year
- **Street crime and court trials**: shoplift, pickpocket, steal cars or burgle mansions. Get caught and you go to trial, where you choose a lawyer and how to plead
- **Illnesses**: colds, broken arms, anxiety, asthma, diabetes, heart disease and super-powered burnout. Some go away on their own; others need treatment
- **Holidays and birthdays**: Halloween costumes, winter holiday gifts and birthday wishes
- **Move to a new city** for a fresh start
- More activities: library, meditation, doctor, nights out, vacations, dating, lottery
- Dozens of random life events with choices

**Super life**
- **15 origin stories**, each with choices that shape which power you get and how strong it is
- **32 powers and skills**: super strength, flight, telepathy, time manipulation, intangibility, sorcery, genius intellect, martial arts, master thief and more. Each one has its own perks (telepaths can erase memories, healers live longer, ghosts escape prison easily, and so on)
- **Hero or villain**: choose your side, then pick a super name (with power-themed suggestions) and costume colors
- **Secret identity**: missions raise *Suspicion*, and if it hits 100% you're unmasked. Close calls, partners finding your costume, and the choice of who to tell all play into it
- **Hero missions**: patrol the city, hunt villains, give press interviews
- **Villain schemes**: heists, ransoms, ambushing heroes, hijacking the airwaves, and building a **doomsday device** to conquer the world
- **Nemesis**: an arch-enemy who grows stronger, attacks you, and may kidnap people who know your secret
- **Wanted level**: villains (and outlaw vigilantes) get arrested. Fight, flee with your powers, bribe your way out, or serve time and try to break out
- **Gear**: costume upgrades, gadgets and bases (from a rooftop hideout to an orbital watchtower or a floating sky fortress)
- **Teams and allies**: join hero leagues or villain syndicates, recruit sidekicks or henchmen, work for the Bureau of Metahuman Affairs
- **Turn-based battles**: fights with your nemesis, villains, heroes and bounty hunters are played out round by round with Strike, Power Blast, Defend, gadgets and your signature move, or skipped with Auto
- **Signature moves**: name a new finishing move at power 25, 50 and 75
- **The city map**: six districts with their own crime levels. Heroes clean them up for fame; villains take them over and collect protection money
- **The Daily Beacon**: a newspaper headline about your alter ego most years

**Immersion**
- **Phone**: family, friends, your partner, your boss, fans, henchmen, scammers and your nemesis text you, and you choose how to reply. Trace your nemesis's texts to ambush them
- **Story arcs**: four multi-year quests that start with a text from an unknown number — The OmniCorp Conspiracy (heroes), The Heist of the Century (villains), Project Prometheus (the secret behind your powers) and The Blackwater Lighthouse (anyone)
- **Life chapters**: at 13, 18, 30, 50 and 70 a chapter card appears and you choose what the chapter is about (ambition, love, adventure, health, wealth or power), each with its own bonus
- **Your life story**: key moments are recorded and told back as a memoir, by life stage
- **Inner thoughts** about what's happening in your life, and **world news** (recessions, booms, a metahuman panic, pandemics, elections) with real effects
- **Super romance**: date a fellow hero or a forbidden villain, team up, and call them in for backup
- **Comic-book battles** with POW!/BAM! bursts, screen shake, and a backup call to your partner, sidekick, team or super pet
- **Skin tone** choice that carries down your family tree, **atmosphere** that shifts for heroes, villains and prison, an **animated story log**, and optional **background music**

**Across lives**
- **Achievements**: 37 to unlock, tracked across every life
- **Life goals**: three random goals each life
- **Ribbons**: a title when you die, like The Legend, The Mastermind or The Tycoon
- **Play as your child**: continue as one of your kids, inherit your money, and awaken powers of your own
- **Hall of Legends**: a record of every life you've lived
- **Profile page** (tap your avatar) and **sound effects** (toggle in the menu)
- **Big moments**: the Superhuman Registration Act, power evolution (gain a second power), world-ending threats, redemption or a fall to villainy, retirement, and kids who inherit powers

## Project layout

```
index.html        page shell
css/style.css     styles
js/data.js        powers, origins, names, jobs, gear
js/game.js        core life simulation (aging, school, jobs, death, saving)
js/super.js       superpower system (origin, missions, nemesis, identity, prison)
js/events.js      random yearly life and super events
js/actions.js     everyday activities, career and relationship actions
js/activities.js  the 8 adventure activities
js/shop.js        making friends, shopping and owned stuff
js/battle.js      turn-based battles and signature moves
js/city.js        city districts and newspaper headlines
js/life2.js       pets, social media, hustles, investing, crime, trials, illness, holidays, moving
js/meta.js        achievements, goals, ribbons, Hall of Legends, generations, sound, profile
js/immersion.js   phone, chapters, memoir, thoughts, world news, super romance, atmosphere, music
js/quests.js      multi-year story arcs
js/ui.js          rendering, panels and popups
```

New origins, powers or events can be added by appending entries to the arrays in `data.js` and `events.js`.

## Stable build

`MySuperLife.html` is the whole game bundled into one file. Download it and open it in any browser, on a phone or a computer, even offline.

After changing anything in `js/` or `css/`, rebuild it with:

```
python3 build/build.py
```
