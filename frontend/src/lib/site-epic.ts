/**
 * Site epic scroll — parallax hero + in-view reveals
 * Author: Dozer
 */

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
  words.forEach((word, i) => {
    const wrap = document.createElement('span');
    wrap.className = 'epic-word';
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

function initRevealObserver(root: ParentNode) {
  const targets = root.querySelectorAll('.epic-reveal, .epic-stagger');
  if (!targets.length) return;

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
}

function bindStaggerItems(root: ParentNode) {
  root.querySelectorAll('.epic-stagger').forEach((stagger) => {
    stagger.querySelectorAll('.epic-stagger-item').forEach((item, i) => {
      (item as HTMLElement).style.setProperty('--i', String(i));
    });
  });
}

async function initPageIntroParallax(scene: Element) {
  const depth0 = scene.querySelector('[data-depth="0"]');
  if (!depth0) return;

  try {
    const { gsap } = await import('gsap');
    const { ScrollTrigger } = await import('gsap/ScrollTrigger');
    gsap.registerPlugin(ScrollTrigger);

    gsap.to(depth0, {
      y: 32,
      ease: 'none',
      scrollTrigger: {
        trigger: scene,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 0.8,
      },
    });
  } catch {
    /* static */
  }
}

async function initHeroParallax(scene: Element) {
  const depth0 = scene.querySelector('[data-depth="0"]');
  const depth2 = scene.querySelector('[data-depth="2"] .epic-mark');
  const depth3 = scene.querySelector('[data-depth="3"]');
  if (!depth0 && !depth2 && !depth3) return;

  try {
    const { gsap } = await import('gsap');
    const { ScrollTrigger } = await import('gsap/ScrollTrigger');
    gsap.registerPlugin(ScrollTrigger);

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: scene,
        start: 'top top',
        end: 'bottom top',
        scrub: 0.6,
      },
    });

    if (depth0) tl.to(depth0, { y: 56, scale: 1.06, ease: 'none' }, 0);
    if (depth2) tl.to(depth2, { y: -40, rotate: 4, ease: 'none' }, 0);
    if (depth3) tl.to(depth3, { y: -24, ease: 'none' }, 0);

    const copy = scene.querySelector('.epic-copy');
    if (copy) tl.to(copy, { y: 20, opacity: 0.9, ease: 'none' }, 0);
  } catch {
    /* GSAP unavailable — static layout is fine */
  }
}

export function initSiteEpic() {
  const shell = document.querySelector('.public-shell--epic');
  if (!shell) return;

  const title = shell.querySelector('.home-hero-title');
  splitTitle(title as HTMLElement | null);
  shell.classList.add('is-ready');

  bindStaggerItems(shell);
  initRevealObserver(shell);

  if (motionAllowed()) {
    const hero = shell.querySelector('.scene-hero');
    if (hero) void initHeroParallax(hero);
    shell.querySelectorAll('.scene-page').forEach((pageScene) => {
      void initPageIntroParallax(pageScene);
    });
  } else {
    shell.querySelectorAll('.epic-reveal, .epic-stagger').forEach((el) => el.classList.add('is-visible'));
  }
}
