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
- Activities: gym, library, meditation, doctor, nights out, vacations, dating, lottery
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
- **Big moments**: the Superhuman Registration Act, power evolution (gain a second power), world-ending threats, redemption or a fall to villainy, retirement, and kids who inherit powers

## Project layout

```
index.html        page shell
css/style.css     styles
js/data.js        powers, origins, names, jobs, gear
js/game.js        core life simulation (aging, school, jobs, death, saving)
js/super.js       superpower system (origin, missions, nemesis, identity, prison)
js/events.js      random yearly life and super events
js/actions.js     activities, career and relationship actions
js/ui.js          rendering, panels and popups
```

New origins, powers or events can be added by appending entries to the arrays in `data.js` and `events.js`.

## Stable build

`MySuperLife.html` is the whole game bundled into one file. Download it and open it in any browser, on a phone or a computer, even offline.

After changing anything in `js/` or `css/`, rebuild it with:

```
python3 build/build.py
```
