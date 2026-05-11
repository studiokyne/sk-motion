import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);

const VERSION = __SK_MOTION_VERSION__;

const DEFAULT_CONFIG = {
  debug: new URLSearchParams(window.location.search).has("saDebug"),
  smoothScroll: true,
  forceTopOnBoot: false,
  startAt: "top 98%",
  ease: "smoothKyne",
  selectors: {
    reveal: ".sa-reveal",
    textReveal: ".sa-text-reveal",
    opacity: ".sa-opacity",
    entryBlur: ".sa-entry-blur"
  }
};

let hasInit = false;
let lenis = null;

function domReady(callback) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback, { once: true });
  } else {
    callback();
  }
}

function initSmoothScroll(config) {
  if (!config.smoothScroll) return;

  lenis = new Lenis({
    allowNestedScroll: true,
    anchors: { offset: -108 },
    autoRaf: false
  });

  lenis.on("scroll", ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);

  window.__lenis = lenis;
}

function initReveal(config) {
  const els = [...document.querySelectorAll(`${config.selectors.reveal}:not([data-sk-init])`)];

  if (!els.length) return;

  els.forEach((el) => {
    el.setAttribute("data-sk-init", "true");
  });

  gsap.set(els, {
    y: 40,
    opacity: 0,
    willChange: "transform, opacity"
  });

  ScrollTrigger.batch(els, {
    start: config.startAt,
    once: true,
    batchMax: 10,
    markers: config.debug,
    onEnter: (batch) => {
      gsap.to(batch, {
        y: 0,
        opacity: 1,
        duration: 0.55,
        ease: config.ease,
        stagger: 0.08,
        overwrite: "auto",
        clearProps: "transform,opacity,willChange"
      });
    }
  });
}

function initOpacity(config) {
  const els = [...document.querySelectorAll(`${config.selectors.opacity}:not([data-sk-init])`)];

  if (!els.length) return;

  els.forEach((el) => {
    el.setAttribute("data-sk-init", "true");
  });

  gsap.set(els, {
    opacity: 0,
    willChange: "opacity"
  });

  ScrollTrigger.batch(els, {
    start: config.startAt,
    once: true,
    batchMax: 10,
    markers: config.debug,
    onEnter: (batch) => {
      gsap.to(batch, {
        opacity: 1,
        duration: 0.55,
        ease: config.ease,
        stagger: 0.08,
        overwrite: "auto",
        clearProps: "opacity,willChange"
      });
    }
  });
}

function initEntryBlur(config) {
  const els = [...document.querySelectorAll(`${config.selectors.entryBlur}:not([data-sk-init])`)];

  if (!els.length) return;

  els.forEach((el) => {
    el.setAttribute("data-sk-init", "true");
  });

  gsap.set(els, {
    y: 18,
    opacity: 0,
    filter: "blur(10px)",
    willChange: "transform, opacity, filter"
  });

  ScrollTrigger.batch(els, {
    start: config.startAt,
    once: true,
    batchMax: 10,
    markers: config.debug,
    onEnter: (batch) => {
      gsap.to(batch, {
        y: 0,
        opacity: 1,
        filter: "blur(0px)",
        duration: 0.75,
        ease: config.ease,
        stagger: 0.08,
        overwrite: "auto",
        clearProps: "transform,opacity,filter,willChange"
      });
    }
  });
}

function initTextReveal(config) {
  const els = [...document.querySelectorAll(`${config.selectors.textReveal}:not([data-sk-init])`)];

  if (!els.length) return;

  els.forEach((el) => {
    el.setAttribute("data-sk-init", "true");

    const split = SplitText.create(el, {
      type: "lines",
      mask: "lines",
      linesClass: "sk-line",
      autoSplit: true,
      deepSlice: true
    });

    gsap.set(split.lines, {
      yPercent: 120,
      opacity: 0,
      willChange: "transform, opacity"
    });

    ScrollTrigger.create({
      trigger: el,
      start: config.startAt,
      once: true,
      markers: config.debug,
      onEnter: () => {
        gsap.to(split.lines, {
          yPercent: 0,
          opacity: 1,
          duration: 0.95,
          ease: config.ease,
          stagger: 0.08,
          overwrite: "auto",
          clearProps: "transform,opacity,willChange"
        });
      }
    });
  });
}

function injectCSSOnce() {
  if (document.getElementById("sk-motion-css")) return;

  const style = document.createElement("style");
  style.id = "sk-motion-css";
  style.textContent = `
    .sk-line {
      display: block;
      backface-visibility: hidden;
    }

    .sa-reveal,
    .sa-opacity,
    .sa-entry-blur {
      backface-visibility: hidden;
    }
  `;

  document.head.appendChild(style);
}

function init(userConfig = {}) {
  if (hasInit) return;
  hasInit = true;

  const globalConfig = window.SKMotionConfig || {};

  const config = {
    ...DEFAULT_CONFIG,
    ...globalConfig,
    ...userConfig,
    selectors: {
      ...DEFAULT_CONFIG.selectors,
      ...(globalConfig.selectors || {}),
      ...(userConfig.selectors || {})
    }
  };

  CustomEase.create(config.ease, "0.625,0.05,0,1");

  ScrollTrigger.config({
    ignoreMobileResize: true,
    limitCallbacks: true
  });

  domReady(() => {
    injectCSSOnce();

    if (config.forceTopOnBoot && "scrollRestoration" in history) {
      history.scrollRestoration = "manual";
      window.scrollTo(0, 0);
    }

    initSmoothScroll(config);
    initReveal(config);
    initOpacity(config);
    initEntryBlur(config);
    initTextReveal(config);

    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });

    window.__skMotionScan = () => {
      initReveal(config);
      initOpacity(config);
      initEntryBlur(config);
      initTextReveal(config);
      ScrollTrigger.refresh();
    };

    window.__skMotionRefresh = () => ScrollTrigger.refresh();

    if (config.debug) {
      console.log(`[SK Motion] v${VERSION} initialized`);
    }
  });
}

window.StudioKyneMotion = {
  init,
  version: VERSION
};

if (window.SKMotionConfig?.autoInit !== false) {
  init();
}