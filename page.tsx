"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

// Register GSAP's scroll plugin and its React-aware lifecycle hook once.
gsap.registerPlugin(ScrollTrigger, useGSAP);

const headline = "WELCOME ITZ FIZZ";

// These figures are illustrative demo content, not verified business claims.
const metrics = [
  { value: "58%", description: "More pickup-point usage", tone: "lime" },
  { value: "23%", description: "Fewer customer phone calls", tone: "blue" },
  { value: "27%", description: "Higher delivery efficiency", tone: "orange" },
  { value: "40%", description: "Less time spent coordinating", tone: "violet" },
];

function CarIllustration() {
  return (
    <svg
      className="car-svg"
      viewBox="0 0 280 112"
      role="img"
      aria-label="Illustration of a sporty delivery car"
    >
      <defs>
        <linearGradient id="carPaint" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="48%" stopColor="#d9ddd1" />
          <stop offset="100%" stopColor="#aeb6a9" />
        </linearGradient>
        <linearGradient id="glassPaint" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#51636a" />
          <stop offset="100%" stopColor="#17252a" />
        </linearGradient>
      </defs>

      {/* Wheels sit behind the body, like a top-view car illustration. */}
      <g fill="#11130f" stroke="#555a50" strokeWidth="2">
        <rect x="57" y="4" width="39" height="17" rx="7" />
        <rect x="57" y="91" width="39" height="17" rx="7" />
        <rect x="184" y="4" width="39" height="17" rx="7" />
        <rect x="184" y="91" width="39" height="17" rx="7" />
      </g>
      <g fill="#899087">
        <path d="M64 8h25v9H64zM64 95h25v9H64zM191 8h25v9h-25zM191 95h25v9h-25z" />
      </g>

      {/* The body narrows at the rear and rounds toward the front. */}
      <path
        d="M20 56c-9-6-8-15 2-20l30-13C69 15 96 12 128 12h59c18 0 31 8 43 23l24 10c10 4 10 14 0 19l-24 10c-12 15-25 23-43 23h-59c-32 0-59-3-76-11L22 76c-10-5-11-14-2-20Z"
        fill="url(#carPaint)"
        stroke="#8c9486"
        strokeWidth="2"
      />
      <path
        d="M91 22c13-4 27-5 42-5h46c12 0 20 5 29 16l10 11H81l10-22Z"
        fill="url(#glassPaint)"
        stroke="#748078"
        strokeWidth="2"
      />
      <path
        d="M81 68h137l-10 11c-9 10-17 15-29 15h-46c-15 0-29-1-42-5L81 68Z"
        fill="url(#glassPaint)"
        stroke="#748078"
        strokeWidth="2"
      />
      <path d="M145 18v76" stroke="#879087" strokeWidth="2" />
      <path d="M249 46l10 5v10l-10 5-4-10Z" fill="#d7f45b" />
      <path d="M31 42l14-6-4 8-10 4ZM31 70l14 6-4-8-10-4Z" fill="#f6f6df" />
      <path d="M38 54h15" stroke="#6d756a" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function Home() {
  // The main element scopes GSAP selectors to this component only.
  const rootRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const carRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // Show content immediately for visitors who prefer reduced motion.
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (reduceMotion) return;

      // Capture mounted elements once so GSAP receives non-null targets.
      const carElement = carRef.current;
      const stageElement = stageRef.current;
      if (!carElement || !stageElement) return;

      // Intro motion is time-based and runs once when the page first loads.
      const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
      intro
        .from(".eyebrow", { opacity: 0, y: 14, duration: 0.55 })
        .from(
          ".headline-char",
          {
            opacity: 0,
            y: 24,
            rotateX: -35,
            duration: 0.5,
            stagger: 0.035,
          },
          "-=0.2",
        )
        .from(
          ".hero-subtitle",
          { opacity: 0, y: 12, duration: 0.5 },
          "-=0.16",
        )
        .from(
          ".metric-card",
          { opacity: 0, y: 18, duration: 0.48, stagger: 0.1 },
          "-=0.08",
        );

      // This timeline is scrubbed: the visitor's scroll position drives it.
      const journey = gsap.timeline({
        scrollTrigger: {
          trigger: ".hero-section",
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });

      journey
        .to(
          carElement,
          {
            x: () => {
              const sideInset = stageElement.clientWidth * 0.055;
              return Math.max(
                0,
                stageElement.clientWidth - carElement.offsetWidth - sideInset * 2,
              );
            },
            ease: "none",
          },
          0,
        )
        .to(".road-trail", { scaleX: 1, ease: "none" }, 0)
        .to(".progress-fill", { scaleX: 1, ease: "none" }, 0)
        .to(
          ".headline-char",
          {
            color: "#82992b",
            stagger: { each: 0.025, from: "start" },
            ease: "none",
          },
          0.08,
        );
    },
    { scope: rootRef },
  );

  return (
    <main ref={rootRef} className="min-h-screen">
      <section className="hero-section" aria-labelledby="hero-title">
        {/* Sticky stage stays in view while the section's scroll progress changes. */}
        <div ref={stageRef} className="hero-stage">
          <div className="background-grid" aria-hidden="true" />

          <div className="topbar">
            <a className="brand-mark" href="#top" aria-label="ITZ FIZZ home">
              ITZ<span>/</span>FIZZ<span className="brand-dot">.</span>
            </a>
            <div className="topbar-note">
              <span className="status-dot" /> SCROLL-DRIVEN EXPERIENCE
            </div>
            <span className="issue-number">MOTION STUDY&nbsp; / &nbsp;01</span>
          </div>

          <div id="top" className="hero-copy">
            <p className="eyebrow">A smoother way to move things forward</p>
            <h1 id="hero-title" className="hero-headline" aria-label={headline}>
              {headline.split("").map((character, index) => (
                <span className="headline-char" aria-hidden="true" key={`${character}-${index}`}>
                  {character === " " ? "\u00A0" : character}
                </span>
              ))}
            </h1>
            <p className="hero-subtitle">
              Designed for momentum. <span>Driven by your scroll.</span>
            </p>
          </div>

          <div className="road-area" aria-label="Scroll to move the car across the road">
            <div className="road-edge road-edge-top" />
            <div className="road-surface">
              <div className="road-dashes" aria-hidden="true" />
              <div className="road-trail" aria-hidden="true" />
              <div ref={carRef} className="car-object">
                <CarIllustration />
              </div>
            </div>
            <div className="road-edge road-edge-bottom" />
            <div className="road-label road-label-left">START <span>—</span> 00 KM</div>
            <div className="road-label road-label-right">KEEP MOVING <span>↗</span></div>
          </div>

          <div className="metrics-heading">
            <span>THE DIFFERENCE, IN NUMBERS</span>
            <span className="illustrative-note">ILLUSTRATIVE METRICS</span>
          </div>

          <div className="metrics-grid">
            {metrics.map((metric, index) => (
              <article className={`metric-card metric-${metric.tone}`} key={metric.value}>
                <div className="metric-card-top">
                  <span className="metric-index">0{index + 1}</span>
                  <span className="metric-arrow" aria-hidden="true">↗</span>
                </div>
                <strong className="metric-value">{metric.value}</strong>
                <p>{metric.description}</p>
              </article>
            ))}
          </div>

          <div className="bottomline">
            <span>SCROLL TO EXPERIENCE THE MOTION</span>
            <span className="scroll-glyph" aria-hidden="true">↓</span>
            <span>BUILT WITH GSAP + REACT</span>
          </div>
          <div className="progress-track" aria-hidden="true">
            <div className="progress-fill" />
          </div>
        </div>
      </section>

      {/* The second section makes it clear that the pinned hero has an end. */}
      <section className="closing-section flex flex-col items-start">
        <p className="closing-kicker">MOTION / MEETS / MEANING</p>
        <h2>Good experiences don’t just move.<br />They move with you.</h2>
        <p className="closing-copy">
          The car, the trail, and the progress bar all respond to scroll position—not autoplay.
        </p>
        <a className="back-link" href="#top">BACK TO TOP <span>↑</span></a>
      </section>
    </main>
  );
}
