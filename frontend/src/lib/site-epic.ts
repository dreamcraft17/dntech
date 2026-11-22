/**
 * Site epic scroll — multi-depth hero parallax + section births + in-view reveals
 * Techniques: scrub parallax (0–5), masked line title, top-down clip birth, float-loop
 * Author: Dozer
 */

import type { ScrollTrigger as ScrollTriggerType } from 'gsap/ScrollTrigger';

type Killable = { kill: () => void };

function motionAllowed() {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  if (window.matchMedia('(pointer: coarse)').matches) return false;
  return true;
}

function splitTitle(el: HTMLElement | null) {
  if (!el || el.dataset.epicSplit === '1') return;
  const text = el.textContent?.trim() ?? '';
  const words = text.split(/\s+/);
  el.textContent = '';
  el.classList.add('epic-split');
  el.setAttribute('aria-label', text);
  words.forEach((word, i) => {
    const wrap = document.createElement('span');
    wrap.className = 'epic-word';
    wrap.setAttribute('aria-hidden', 'true');
    wrap.style.setProperty('--i', String(i));
    const inner = document.createElement('span');
    inner.className = 'epic-word-inner';
    inner.style.setProperty('--i', String(i));
    inner.textContent = word + (i < words.length - 1 ? '\u00a0' : '');
    wrap.appendChild(inner);
    el.appendChild(wrap);
  });
  el.dataset.epicSplit = '1';
}

function initRevealObserver(root: ParentNode): IntersectionObserver | null {
  const targets = root.querySelectorAll('.epic-reveal:not(.is-visible), .epic-stagger:not(.is-visible)');
  if (!targets.length) return null;

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    },
    { root: null, rootMargin: '0px 0px -12% 0px', threshold: 0.12 },
  );

  targets.forEach((el) => io.observe(el));
  return io;
}

function bindStaggerItems(root: ParentNode) {
  root.querySelectorAll('.epic-stagger').forEach((stagger) => {
    stagger.querySelectorAll('.epic-stagger-item').forEach((item, i) => {
      (item as HTMLElement).style.setProperty('--i', String(i));
    });
  });
}

function initClipBirthObserver(root: ParentNode): IntersectionObserver | null {
  const births = root.querySelectorAll('.epic-birth:not(.is-born):not(.epic-birth--live)');
  if (!births.length) return null;

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-born');
          io.unobserve(entry.target);
        }
      });
    },
    { root: null, rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
  );

  births.forEach((el) => io.observe(el));
  return io;
}

async function initPageIntroParallax(scene: Element, killables: Killable[]) {
  const depth0 = scene.querySelector('[data-depth="0"]');
  if (!depth0) return;

  try {
    const { gsap } = await import('gsap');
    const { ScrollTrigger } = await import('gsap/ScrollTrigger');
    gsap.registerPlugin(ScrollTrigger);

    const tween = gsap.to(depth0, {
      y: 32,
      ease: 'none',
      scrollTrigger: {
        trigger: scene,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 0.8,
      },
    });
    killables.push(tween);
    const st = tween.scrollTrigger as ScrollTriggerType | undefined;
    if (st) killables.push(st);
  } catch {
    /* static */
  }
}

async function initHeroParallax(scene: Element, killables: Killable[]) {
  const depth0 = scene.querySelector('[data-depth="0"]');
  const depth1 = scene.querySelector('[data-depth="1"]');
  const depth2 = scene.querySelector('[data-depth="2"] .epic-mark');
  const depth3 = scene.querySelector('[data-depth="3"]');
  const depth4 = scene.querySelector('[data-depth="4"]');
  const depth5 = scene.querySelector('[data-depth="5"]');
  if (!depth0 && !depth2 && !depth3) return;

  try {
    const { gsap } = await import('gsap');
    const { ScrollTrigger } = await import('gsap/ScrollTrigger');
    gsap.registerPlugin(ScrollTrigger);

    const scrubbing = [depth0, depth1, depth2, depth3, depth4, depth5].filter(Boolean) as Element[];
    scrubbing.forEach((el) => {
      (el as HTMLElement).style.willChange = 'transform';
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: scene,
        start: 'top top',
        end: 'bottom top',
        scrub: 0.6,
        onLeave: () => {
          scrubbing.forEach((el) => {
            (el as HTMLElement).style.willChange = 'auto';
          });
        },
        onEnterBack: () => {
          scrubbing.forEach((el) => {
            (el as HTMLElement).style.willChange = 'transform';
          });
        },
      },
    });

    // Depth table: farther layers move less (positive y = lag), near layers counter-scroll
    if (depth0) tl.to(depth0, { y: 48, scale: 1.05, ease: 'none' }, 0);
    if (depth1) tl.to(depth1, { y: 28, ease: 'none' }, 0);
    if (depth2) tl.to(depth2, { y: -56, rotate: 6, scale: 1.08, ease: 'none' }, 0);
    if (depth3) tl.to(depth3, { y: -36, ease: 'none' }, 0);
    if (depth4) tl.to(depth4, { y: 28, opacity: 0.82, ease: 'none' }, 0);
    if (depth5) tl.to(depth5, { y: -72, opacity: 0.35, ease: 'none' }, 0);

    killables.push(tl);
    if (tl.scrollTrigger) killables.push(tl.scrollTrigger);
  } catch {
    /* GSAP unavailable — static layout is fine */
  }
}

export function initSiteEpic(): (() => void) | undefined {
  const shell = document.querySelector('.public-shell--epic');
  if (!shell) return;

  const killables: Killable[] = [];

  const title = shell.querySelector('.home-hero-title');
  splitTitle(title as HTMLElement | null);
  shell.classList.add('is-ready');

  bindStaggerItems(shell);

  const allowMotion = motionAllowed();

  const io = initRevealObserver(shell);
  const birthIo = initClipBirthObserver(shell);

  // Safety net: never leave content invisible if the observer misses an
  // element (hidden tab, HMR re-render, odd scroll containers).
  const fallback = window.setTimeout(() => {
    shell.querySelectorAll('.epic-reveal, .epic-stagger').forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight) el.classList.add('is-visible');
    });
    shell.querySelectorAll('.epic-birth:not(.epic-birth--live)').forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.92) el.classList.add('is-born');
    });
  }, 1200);

  if (allowMotion) {
    const hero = shell.querySelector('.scene-hero');
    if (hero) void initHeroParallax(hero, killables);
    shell.querySelectorAll('.scene-page').forEach((pageScene) => {
      void initPageIntroParallax(pageScene, killables);
    });
  } else {
    shell.querySelectorAll('.epic-reveal, .epic-stagger').forEach((el) => el.classList.add('is-visible'));
    shell.querySelectorAll('.epic-birth').forEach((el) => el.classList.add('is-born'));
  }

  return () => {
    io?.disconnect();
    birthIo?.disconnect();
    window.clearTimeout(fallback);
    killables.forEach((k) => {
      try {
        k.kill();
      } catch {
        /* already dead */
      }
    });
  };
}
