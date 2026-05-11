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
  forceTopOnBoot: true,
  startAt: "top 98%",
  ease: "smoothKyne",
  waitForFonts: true,
  fontReadyTimeout: 1500,
  reduceMotion: "auto",
  highlightEnd: "center",
  highlightWordStagger: 0.04,
  highlightCharStagger: 0.015,
  selectors: {
    reveal: ".sk-reveal",
    textReveal: ".sk-text-lines",
    opacity: ".sk-fade",
    entryBlur: ".sk-entry-blur",
    textHighlightWords: ".sk-text-highlight-words",
    textHighlightChars: ".sk-text-highlight-chars",
  },
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

function getUninitializedSelector(selector) {
  return selector
    .split(",")
    .map((item) => `${item.trim()}:not([data-sk-init])`)
    .join(", ");
}

function prefersReducedMotion() {
  if (!window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function waitForFontsReady(config) {
  if (!config.waitForFonts || config.reduceMotion) {
    return Promise.resolve();
  }

  if (!document.fonts || !document.fonts.ready) {
    return Promise.resolve();
  }

  const timeout = Number.isFinite(config.fontReadyTimeout)
    ? Math.max(0, config.fontReadyTimeout)
    : 0;

  if (!timeout) {
    return document.fonts.ready;
  }

  return Promise.race([
    document.fonts.ready,
    new Promise((resolve) => {
      setTimeout(resolve, timeout);
    }),
  ]);
}

function initSmoothScroll(config) {
  if (!config.smoothScroll) return;

  lenis = new Lenis({
    allowNestedScroll: true,
    anchors: { offset: -108 },
    autoRaf: false,
  });

  lenis.on("scroll", ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);

  window.__lenis = lenis;
}

function initReveal(config) {
  const els = [
    ...document.querySelectorAll(
      getUninitializedSelector(config.selectors.reveal),
    ),
  ];

  if (!els.length) return;

  els.forEach((el) => {
    el.setAttribute("data-sk-init", "true");
  });

  if (config.reduceMotion) {
    gsap.set(els, {
      y: 0,
      opacity: 1,
      clearProps: "transform,opacity,willChange",
    });
    return;
  }

  gsap.set(els, {
    y: 40,
    opacity: 0,
    willChange: "transform, opacity",
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
        clearProps: "transform,opacity,willChange",
      });
    },
  });
}

function initOpacity(config) {
  const els = [
    ...document.querySelectorAll(
      getUninitializedSelector(config.selectors.opacity),
    ),
  ];

  if (!els.length) return;

  els.forEach((el) => {
    el.setAttribute("data-sk-init", "true");
  });

  if (config.reduceMotion) {
    gsap.set(els, {
      opacity: 1,
      clearProps: "opacity,willChange",
    });
    return;
  }

  gsap.set(els, {
    opacity: 0,
    willChange: "opacity",
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
        clearProps: "opacity,willChange",
      });
    },
  });
}

function initEntryBlur(config) {
  const els = [
    ...document.querySelectorAll(
      getUninitializedSelector(config.selectors.entryBlur),
    ),
  ];

  if (!els.length) return;

  els.forEach((el) => {
    el.setAttribute("data-sk-init", "true");
  });

  if (config.reduceMotion) {
    gsap.set(els, {
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      clearProps: "transform,opacity,filter,willChange",
    });
    return;
  }

  gsap.set(els, {
    y: 18,
    opacity: 0,
    filter: "blur(10px)",
    willChange: "transform, opacity, filter",
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
        clearProps: "transform,opacity,filter,willChange",
      });
    },
  });
}

function initTextReveal(config) {
  const els = [
    ...document.querySelectorAll(
      getUninitializedSelector(config.selectors.textReveal),
    ),
  ];

  if (!els.length) return;

  els.forEach((el) => {
    el.setAttribute("data-sk-init", "true");

    if (config.reduceMotion) {
      gsap.set(el, {
        opacity: 1,
        clearProps: "transform,opacity,willChange",
      });
      return;
    }

    const split = SplitText.create(el, {
      type: "lines",
      mask: "lines",
      linesClass: "sk-line",
      autoSplit: true,
      deepSlice: true,
    });

    gsap.set(split.lines, {
      yPercent: 120,
      opacity: 0,
      willChange: "transform, opacity",
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
          clearProps: "transform,opacity,willChange",
        });
      },
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

    .sk-highlight-word,
    .sk-char-word {
      display: inline;
      backface-visibility: hidden;
      color: currentColor;
    }

    .sk-highlight-char {
      display: inline-block;
      backface-visibility: hidden;
      color: currentColor;
    }

    .sk-reveal,
    .sk-fade,
    .sk-entry-blur {
      backface-visibility: hidden;
    }
  `;

  document.head.appendChild(style);
}

function initTextHighlightWords(config) {
  if (!config.selectors.textHighlightWords) return;

  const els = [
    ...document.querySelectorAll(
      getUninitializedSelector(config.selectors.textHighlightWords),
    ),
  ];

  if (!els.length) return;

  els.forEach((el) => {
    el.setAttribute("data-sk-init", "true");

    if (config.reduceMotion) {
      gsap.set(el, {
        opacity: 1,
        clearProps: "opacity,willChange",
      });
      return;
    }

    const split = SplitText.create(el, {
      type: "words",
      wordsClass: "sk-highlight-word",
      autoSplit: true,
      deepSlice: true,
    });

    gsap.set(split.words, {
      opacity: 0.1,
      willChange: "opacity",
      color: "currentColor",
    });

    gsap.to(split.words, {
      opacity: 1,
      ease: "none",
      stagger: config.highlightWordStagger,
      overwrite: "auto",
      scrollTrigger: {
        trigger: el,
        start: config.startAt,
        end: config.highlightEnd,
        scrub: true,
        markers: config.debug,
      },
    });
  });
}

function initTextHighlightChars(config) {
  if (!config.selectors.textHighlightChars) return;

  const els = [
    ...document.querySelectorAll(
      getUninitializedSelector(config.selectors.textHighlightChars),
    ),
  ];

  if (!els.length) return;

  els.forEach((el) => {
    el.setAttribute("data-sk-init", "true");

    if (config.reduceMotion) {
      gsap.set(el, {
        opacity: 1,
        clearProps: "opacity,willChange",
      });
      return;
    }

    const split = SplitText.create(el, {
      type: "words, chars",
      wordsClass: "sk-char-word",
      charsClass: "sk-highlight-char",
      autoSplit: true,
      deepSlice: true,
    });

    gsap.set(split.chars, {
      opacity: 0.1,
      willChange: "opacity",
      color: "currentColor",
    });

    gsap.to(split.chars, {
      opacity: 1,
      ease: "none",
      stagger: config.highlightCharStagger,
      overwrite: "auto",
      scrollTrigger: {
        trigger: el,
        start: config.startAt,
        end: config.highlightEnd,
        scrub: true,
        markers: config.debug,
      },
    });
  });
}

function init(userConfig = {}) {
  if (hasInit) return;
  hasInit = true;

  const globalConfig = window.SKMotionConfig || {};

  const reduceMotionSetting =
    userConfig.reduceMotion ??
    globalConfig.reduceMotion ??
    DEFAULT_CONFIG.reduceMotion;

  const config = {
    ...DEFAULT_CONFIG,
    ...globalConfig,
    ...userConfig,
    selectors: {
      ...DEFAULT_CONFIG.selectors,
      ...(globalConfig.selectors || {}),
      ...(userConfig.selectors || {}),
    },
    reduceMotion:
      reduceMotionSetting === "auto" || reduceMotionSetting == null
        ? prefersReducedMotion()
        : Boolean(reduceMotionSetting),
  };

  if (config.reduceMotion) {
    config.smoothScroll = false;
  }

  CustomEase.create(config.ease, "0.625,0.05,0,1");

  ScrollTrigger.config({
    ignoreMobileResize: true,
    limitCallbacks: true,
  });

  domReady(() => {
    injectCSSOnce();

    if (config.forceTopOnBoot && "scrollRestoration" in history) {
      history.scrollRestoration = "manual";
      window.scrollTo(0, 0);
    }

    const runInitAnimations = () => {
      initSmoothScroll(config);
      initReveal(config);
      initOpacity(config);
      initEntryBlur(config);
      initTextReveal(config);
      initTextHighlightWords(config);
      initTextHighlightChars(config);

      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
      });
    };

    waitForFontsReady(config).then(runInitAnimations);

    window.__skMotionScan = () => {
      initReveal(config);
      initOpacity(config);
      initEntryBlur(config);
      initTextReveal(config);
      initTextHighlightWords(config);
      initTextHighlightChars(config);
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
  version: VERSION,
};

if (window.SKMotionConfig?.autoInit !== false) {
  init();
}
