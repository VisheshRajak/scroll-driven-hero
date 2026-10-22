# ITZ FIZZ — Scroll-Driven Hero Animation

A responsive, original scroll-animation study inspired by the supplied car-scroll reference. The page uses a custom SVG car, an editorial layout, staggered entrance animations, and a scroll-scrubbed car journey.

> **Metric note:** the percentages are illustrative UI content included to demonstrate the layout. They are not verified business results.

## Technology

- **Next.js + React + TypeScript** — component structure and a maintainable app entry point.
- **Tailwind CSS** — utility-CSS build pipeline and reusable theme tokens; custom CSS is used for the precise animation layout.
- **GSAP + ScrollTrigger + `@gsap/react`** — the intro timeline, scroll-linked movement, responsive measurements, and React-safe cleanup.
- **GitHub Pages** — static deployment through the workflow in `.github/workflows/deploy.yml`.

## Run it locally

Use Node.js 20.9 or newer (Node 22 is a good choice).

```bash
npm install
npm run dev
```

Then open `http://localhost:3000` in your browser. Changes to the source files will refresh the development page.

### Production build checks

```bash
npm run typecheck
npm run build
```

`next.config.mjs` sets `output: "export"`, so a successful build also produces the static website in `out/`.

## Publish to GitHub Pages

1. Create a new **public** repository on GitHub, for example `scroll-driven-hero`. Do not initialize it with a README or license because this folder already contains them.
2. In a terminal, open this project folder and run:

   ```bash
   git init
   git add .
   git commit -m "Build scroll-driven hero animation"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/scroll-driven-hero.git
   git push -u origin main
   ```

   Replace `YOUR-USERNAME` with your GitHub username and change the repository name in the URL if you used a different one.

3. On GitHub, open **Settings → Pages** and set the build/deployment source to **GitHub Actions** if it is not selected automatically.
4. Open the repository's **Actions** tab and wait for **Deploy static Next.js site to GitHub Pages** to finish successfully.
5. The live address will be `https://YOUR-USERNAME.github.io/scroll-driven-hero/` for a project repository. Replace the username and repository segment with your actual values. The workflow sets the Next.js `basePath` based on the repository name, so its bundled CSS and JavaScript work from that subpath.

If the first workflow run fails because Pages permissions are restricted, check **Settings → Actions → General → Workflow permissions**, then rerun the workflow. Never commit passwords, access tokens, or other secrets into the repository.

## How the page works

### 1. Layout

`app/page.tsx` renders a single-page composition: a top navigation strip, a letter-spaced headline, a horizontal road with an SVG car, four statistic cards, a scroll-progress line, and a closing panel. The first section is taller than the viewport while `.hero-stage` is sticky. This creates room for natural scrolling while keeping the hero composition on screen during the animation.

### 2. Entrance animation

When the page loads, the GSAP intro timeline reveals the eyebrow, each headline character, the subtitle, and then each statistic card. `stagger` introduces a small delay between items. The animation runs once on load; it does not control the car's journey.

### 3. Scroll-driven animation

The `journey` timeline uses ScrollTrigger with `scrub: 1`. That ties its progress to the user's scroll position and adds a short catch-up smoothing interval. The car's horizontal `x` transform, the road-trail scale, the progress-bar scale, and the headline color all derive from that same scroll progress. There is no autoplay timer or repeated scroll-event calculation written by hand.

The car's destination is calculated from the stage width and car width when GSAP evaluates the tween. `invalidateOnRefresh: true` allows ScrollTrigger to recalculate after a viewport resize. Animation uses transforms (`x` and `scaleX`) instead of changing layout dimensions on every frame.

### 4. React lifecycle and accessibility

`useGSAP` scopes selectors to this component and cleans up GSAP effects when React tears down the component. The reduced-motion media query skips the entrance and scroll animations for visitors who request less motion. The car illustration has an accessible SVG label; decorative road details are hidden from assistive technologies.

### 5. Responsive styling

`app/globals.css` contains the design tokens, layout, card styling, mobile breakpoints, and reduced-motion CSS. The road/car sizes and headline sizes scale with the viewport. The metric cards become a two-column layout on smaller screens.

## Suggested test checklist

- Load the page from the top and confirm the headline and metrics reveal in sequence.
- Scroll slowly, quickly, and back upward; the car and progress line should follow the scroll in both directions.
- Resize between desktop and phone widths; the car should stay on the road and the cards should remain readable.
- Turn on the operating system's reduced-motion setting and reload to confirm the content remains visible without the animated sequence.
- Run `npm run typecheck` and `npm run build` before pushing changes.

## Source map

| File | Purpose |
|---|---|
| `app/page.tsx` | React markup, data for metrics, SVG car, and GSAP timelines. |
| `app/globals.css` | Visual system, responsive layout, and motion-friendly styling. |
| `app/layout.tsx` | Root document and page metadata. |
| `tailwind.config.ts` | Tailwind content scanning and project color tokens. |
| `postcss.config.mjs` | Connects Tailwind and Autoprefixer to the CSS build. |
| `next.config.mjs` | Enables static export and configures GitHub Pages subpaths. |
| `.github/workflows/deploy.yml` | Builds and publishes `out/` to GitHub Pages after each push to `main`. |
| `CODE-WALKTHROUGH.md` | More detailed, step-by-step explanations of why the key code is written this way. |
