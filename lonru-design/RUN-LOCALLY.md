# View the Lonrú Design site locally

This is a Next.js app. To see the full interactive site (cinematic scroll-scrub
hero, navbar, stats, features, testimonials, footer) you run it on **your own
computer** and open `localhost` in your browser.

## What you need first

- **Node.js** — version 18.18+ or 20+. Get it from <https://nodejs.org> (the
  "LTS" download). To check if you already have it, run `node --version`.

## Step 1 — Get the code

Open a terminal and run:

```bash
git clone https://github.com/CallumHalpinRooney/Janet-Cruise-Halpin.git
cd Janet-Cruise-Halpin
git checkout claude/nice-archimedes-2wni57
cd lonru-design
```

(If you've already cloned it before, just `cd` into the repo and run
`git pull` instead.)

## Step 2 — Start it

### macOS / Linux
```bash
./start.sh
```

### Windows / any platform (manual)
```bash
npm install      # first time only
npm run dev
```

## Step 3 — Open it

When the terminal prints **Ready**, open this in your browser:

> **http://localhost:3000**

Scroll the hero — the drone footage advances frame-by-frame as you scroll.

To stop the server, press **Ctrl+C** in the terminal.

---

### Troubleshooting

- **`command not found: npm`** → Node.js isn't installed. See "What you need first".
- **Port 3000 already in use** → run `npm run dev -- -p 3001` and open
  `http://localhost:3001` instead.
- **Hero is black / frames missing** → make sure you're inside the
  `lonru-design` folder and that `public/frames/` contains the `.jpg` files.
