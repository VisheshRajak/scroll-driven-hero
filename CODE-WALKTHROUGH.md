# Code Walkthrough — Why Each Part Exists

This guide explains the project file by file. The source code also contains comments near the most important implementation choices.

## 1. `app/page.tsx`: imports and registration

```tsx
"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);
```

- **`"use client";`** tells Next.js that this component needs browser-side React behavior. GSAP reads browser dimensions and animates DOM elements, so a server-only component would not be the right place for it.
- **`useRef`** stores references to DOM elements. Unlike a normal variable, a ref remains stable between renders and does not cause a render when its value changes.
- **`gsap`** is the animation engine.
- **`ScrollTrigger`** connects an animation timeline to scroll progress.
- **`useGSAP`** integrates GSAP with React's lifecycle so animation contexts can be cleaned up safely.
- **`registerPlugin(...)`** makes ScrollTrigger's features available to GSAP. Registration is done once at module scope rather than repeatedly during rendering.

## 2. The demo data

```tsx
const headline = "WELCOME ITZ FIZZ";

const metrics = [
  { value: "58%", description: "More pickup-point usage", tone: "lime" },
  { value: "23%", description: "Fewer customer phone calls", tone: "blue" },
  { value: "27%", description: "Higher delivery efficiency", tone: "orange" },
  { value: "40%", description: "Less time spent coordinating", tone: "violet" },
];
```

- **`headline`** holds the text in one place, so the visual headline and its accessible label stay consistent.
- **`metrics`** stores the cards as data, rather than repeating four blocks of nearly identical JSX. React maps over the array to make the cards, so changing a description does not require editing the layout structure.
- **`tone`** adds a modifier class per card. The CSS can give each percentage a separate accent color without duplicating markup.
- The percentages are intentionally labelled as illustrative in the UI. They are placeholders, not factual claims.

## 3. The car illustration

`CarIllustration()` returns an inline SVG.

- **`viewBox="0 0 280 112"`** defines a stable coordinate system. The browser can scale the drawing to any display size without a raster image becoming blurry.
- **`role="img"` and `aria-label`** provide an accessible text alternative for a screen reader.
- **`<defs>` and `<linearGradient>`** define reusable paint and window gradients. This gives the car visual depth without an external image file.
- The wheel `<rect>` elements are drawn first so the body can overlap them, similar to the layering used in illustration software.
- The body and windows use `<path>` shapes because paths can make curved silhouettes. This keeps the illustration scalable and lightweight.
- The SVG is original hand-written vector artwork for this demo, not a copied image from the reference page.

## 4. DOM references

```tsx
const rootRef = useRef<HTMLElement>(null);
const stageRef = useRef<HTMLDivElement>(null);
const carRef = useRef<HTMLDivElement>(null);
```

- **`rootRef`** marks the outer component root. It is supplied to `useGSAP` to scope class-based selectors, preventing an animation from accidentally targeting a similarly named element elsewhere on the page.
- **`stageRef`** points to the pinned visual stage. Its `clientWidth` tells the animation how much horizontal space is available.
- **`carRef`** points to the moving car container. GSAP updates its transform; React does not need to re-render on every scroll frame.
- The `<... | null>` types are explicit because the elements do not exist until the browser mounts the component.

## 5. Respecting reduced-motion preferences

```tsx
const reduceMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

if (reduceMotion) return;
```

- **`matchMedia(...)`** asks the browser whether the visitor's system requests reduced motion.
- **`.matches`** is `true` when that preference is active.
- **`return`** skips GSAP animation setup. The content is still in the page and CSS does not hide it, so people can read the hero and statistics without animation.

## 6. The load-in timeline

```tsx
const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
intro
  .from(".eyebrow", { opacity: 0, y: 14, duration: 0.55 })
  .from(
    ".headline-char",
    { opacity: 0, y: 24, rotateX: -35, duration: 0.5, stagger: 0.035 },
    "-=0.2",
  )
  .from(".hero-subtitle", { opacity: 0, y: 12, duration: 0.5 }, "-=0.16")
  .from(
    ".metric-card",
    { opacity: 0, y: 18, duration: 0.48, stagger: 0.1 },
    "-=0.08",
  );
```

- **`gsap.timeline(...)`** groups the intro steps into one ordered sequence. This is easier to tune than unrelated animations with independent timers.
- **`defaults.ease`** gives the transitions a smooth deceleration at the end.
- **`.from(...)`** defines the starting state; GSAP animates elements from that state to their natural CSS state.
- **`opacity: 0`** creates the fade-in. **`y`** creates a small vertical lift. **`rotateX`** gives the individual letters a subtle 3D entrance.
- **`duration`** is measured in seconds and controls how long that step runs.
- **`stagger: 0.035`** starts each letter 35 milliseconds after the previous one, creating a sequential reveal.
- **`"-=0.2"`** and the other negative offsets let animations overlap slightly. The result feels continuous rather than like a list of unrelated steps.
- The cards' `stagger: 0.1` means each card begins 100 milliseconds after the previous card. This directly implements the assignment's one-by-one statistic reveal.
- This timeline is a **page-load** animation. It is deliberately separate from the scroll-driven car animation below.

## 7. The scroll-linked timeline

```tsx
const journey = gsap.timeline({
  scrollTrigger: {
    trigger: ".hero-section",
    start: "top top",
    end: "bottom bottom",
    scrub: 1,
    invalidateOnRefresh: true,
  },
});
```

- **`trigger`** selects the long hero section whose scroll range should drive the journey.
- **`start: "top top"`** starts when the top of the hero section reaches the top of the viewport.
- **`end: "bottom bottom"`** completes the journey when the bottom of the hero section reaches the bottom of the viewport.
- **`scrub: 1`** links the timeline playhead to scroll progress and smooths its catch-up over roughly one second. Scrolling up reverses the animation naturally because progress is reversible.
- **`invalidateOnRefresh: true`** makes function-based values get recalculated when ScrollTrigger refreshes, for example after a viewport resize.
- Unlike a `setInterval` or `requestAnimationFrame` loop, the car is not moving on its own. Its position reflects how far the user has scrolled through the trigger range.

### 7a. Computing the car's destination

```tsx
.to(carRef.current, {
  x: () => {
    const stage = stageRef.current;
    const car = carRef.current;
    if (!stage || !car) return 0;
    const sideInset = stage.clientWidth * 0.055;
    return Math.max(
      0,
      stage.clientWidth - car.offsetWidth - sideInset * 2,
    );
  },
  ease: "none",
}, 0)
```

- **`.to(carRef.current, ...)`** animates the real car container instead of an abstract number. The component is already positioned near the road's left inset in CSS.
- **`x`** is a transform-based horizontal offset. Changing it does not ask the browser to recalculate grid or document layout on every frame.
- The function measures the stage width and car width only when GSAP evaluates or invalidates the tween; it is not a manually written scroll handler that measures the DOM on every scroll event.
- **`sideInset`** uses 5.5% of the stage width, matching the road's left/right visual padding.
- Subtracting the car width and both insets means the car ends near the right edge without leaving the road.
- **`Math.max(0, ...)`** prevents a negative travel distance on an unusually narrow layout.
- **`ease: "none"`** makes the car's x-coordinate proportional to scroll progress. The overall apparent smoothness comes from ScrollTrigger's scrub behavior, not from an independent time-based ease that could drift away from the scrollbar.
- **`0`** is the timeline position, so the car, trail, progress bar, and headline color share the same scroll range.

### 7b. Road trail and progress line

```tsx
.to(".road-trail", { scaleX: 1, ease: "none" }, 0)
.to(".progress-fill", { scaleX: 1, ease: "none" }, 0)
```

- `scaleX: 1` grows each element from its initial `scaleX(0)` state to full width.
- Their CSS uses `transform-origin: left center`, so the line grows from left to right rather than from its middle.
- These animations share timeline position `0`; they therefore stay synchronized with the car.

### 7c. Headline color shift

```tsx
.to(
  ".headline-char",
  {
    color: "#82992b",
    stagger: { each: 0.025, from: "start" },
    ease: "none",
  },
  0.08,
);
```

- This tween gradually changes each letter to the green accent as scroll progresses.
- **`each: 0.025`** gives each character a small offset from the one before it.
- **`from: "start"`** begins the stagger at the first character.
- The small timeline offset `0.08` delays the color change slightly relative to the start of the scroll journey.

## 8. React markup and semantic structure

- **`<main>`** wraps the page's primary content.
- **`<section aria-labelledby="hero-title">`** identifies the hero region and connects it to the heading for assistive technology.
- **`<h1>`** is the principal page heading. Each character gets its own span so it can animate separately. `aria-label` keeps the phrase meaningful as a single string, while `aria-hidden="true"` on the spans avoids reading individual letters as separate words.
- **`<article>`** is used for each metric card because each card is a small, self-contained content unit.
- Road details and arrows that are only decorative are marked `aria-hidden="true"` to avoid unnecessary screen-reader noise.
- The footer-style closing panel gives the page somewhere to scroll after the pinned hero, making the interaction easy to discover and test.

## 9. `app/globals.css`: how the layout is made

### Design tokens

```css
:root {
  color-scheme: light;
  --paper: #efeee7;
  --ink: #1d2018;
  --muted: #77796e;
  --acid: #d7f45b;
  --road: #252720;
}
```

- `:root` declares global CSS custom properties, so a color can be reused consistently instead of hard-coded repeatedly.
- `color-scheme: light` tells browser-native controls to use a light theme suitable for the page.
- The palette separates the paper background, text, bright accent, and road surface for a deliberate contrast system.

### Box sizing

```css
* { box-sizing: border-box; }
```

`border-box` makes an element's declared width include its padding and border. That simplifies responsive dimensions and avoids a card growing wider than the grid column because of padding.

### Sticky scene and scroll length

```css
.hero-section { height: 260vh; }
.hero-stage {
  position: sticky;
  top: 0;
  height: 100vh;
  height: 100svh;
  overflow: hidden;
}
```

- `260vh` makes the hero's scroll range longer than one screen so the visitor can scrub the animation.
- `position: sticky; top: 0` keeps the stage at the top of the viewport during that scroll range.
- `100vh` is the fallback viewport height. `100svh` uses the small viewport unit supported by modern browsers to behave better when mobile browser chrome expands or contracts.
- `overflow: hidden` keeps the moving car and decorative grid inside the hero frame.
- `min-height` supplies a usable design canvas on short viewports; mobile rules adjust the content positions and card layout.

### Transform-first motion

- `.car-object` uses `transform: translateY(-50%)` to center the car vertically in the road. GSAP adds an `x` transform to move it horizontally.
- `.road-trail` and `.progress-fill` are full-width elements whose visible progress is controlled by `scaleX`.
- `will-change: transform` hints to the browser that the car's transform will animate. This is used only on the moving car, rather than applied indiscriminately to every element.
- These choices avoid animating geometry like `left`, `width`, `margin`, or `top`, which can trigger extra layout work.

### Responsive breakpoints

- The `max-width: 760px` media query moves the road and statistic block higher, reduces small labels, and changes four statistic columns into two.
- The `max-width: 390px` rules shrink letter spacing and adjust labels for narrow phones.
- `clamp(min, preferred, max)` makes text and visual dimensions grow between sensible minimum and maximum sizes.

### Reduced motion

```css
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

This CSS avoids smooth native scrolling and minimizes CSS animations for visitors who request reduced motion. The separate JavaScript media query skips GSAP timelines too; both parts are needed because CSS cannot directly disable a GSAP timeline.

## 10. The configuration files

- **`app/layout.tsx`** supplies the root `<html lang="en">`, the body, and metadata. The title and description help browsers, bookmarks, and search previews identify the page.
- **`tailwind.config.ts`** tells Tailwind which app files to scan for utility classes and adds project palette tokens. This lets future edits safely use Tailwind utilities and shared color names.
- **`postcss.config.mjs`** runs Tailwind and Autoprefixer during CSS compilation.
- **`next.config.mjs`** enables static export so GitHub Pages can host the files without a Node server. GitHub Actions passes `GITHUB_PAGES=true` and `GITHUB_REPOSITORY`; the config reads the repo name and sets a matching `basePath` for project-page URLs.
- **`.github/workflows/deploy.yml`** checks out source, installs dependencies from `package-lock.json`, builds the static export into `out/`, uploads that folder as a Pages artifact, then publishes it. Pushing to `main` automatically triggers the workflow.

## 11. Why the implementation meets the assignment

| Assignment requirement | Implementation |
|---|---|
| Hero above the fold | The sticky stage fills the viewport and contains headline, road scene, and metrics. |
| Letter-spaced headline | `.hero-headline` applies wide letter spacing and each character is individually wrapped for stagger animation. |
| Statistics beneath the headline | Four responsive `.metric-card` elements. |
| Load-in effects | GSAP intro timeline fades/lifts the content and staggers letters and cards. |
| Scroll-linked object | ScrollTrigger scrubs the car's x-transform as the user scrolls. |
| Smooth motion | `scrub: 1`, GSAP timeline, and transforms. |
| Performance | No custom continuous scroll listener; transforms are animated and ScrollTrigger schedules updates efficiently. |
| Required stack | Next.js, React, TypeScript, Tailwind CSS, GSAP, and ScrollTrigger. |
| GitHub Pages deploy | Included GitHub Actions workflow and static export configuration. |

## 12. Small improvements you can try after the first successful deploy

1. Change the `metrics` array's descriptions while keeping the illustrative disclaimer until you have real, attributable measurements.
2. Modify the car's end position or `scrub` value to compare a direct scroll feel with a softer catch-up effect.
3. Tune `hero-section`'s height to make the motion complete over more or less scrolling.
4. Change the CSS variables in `:root` to reskin the entire page without changing the layout or GSAP logic.
