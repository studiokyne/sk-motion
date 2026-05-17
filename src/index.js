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
  highlightWordStagger: 0.25,
  highlightCharStagger: 0.1,
  animations: {
    reveal: {
      fromY: 40,
      duration: 0.55,
      stagger: 0.08,
    },
    opacity: {
      duration: 0.55,
      stagger: 0.08,
    },
    entryBlur: {
      fromY: 18,
      fromBlur: 10,
      duration: 0.75,
      stagger: 0.08,
    },
    scaleIn: {
      fromScale: 0.92,
      duration: 0.6,
      stagger: 0.08,
    },
    scaleInBlur: {
      fromScale: 0.88,
      fromBlur: 8,
      duration: 0.7,
      stagger: 0.08,
    },
    counter: {
      duration: 1.2,
      startValue: 0,
    },
    textReveal: {
      fromYPercent: 120,
      duration: 0.95,
      stagger: 0.08,
    },
    highlightWords: {
      opacity: 0.1,
    },
    highlightChars: {
      opacity: 0.1,
    },
  },
  selectors: {
    reveal: ".sk-reveal",
    textReveal: ".sk-text-lines",
    opacity: ".sk-fade",
    entryBlur: ".sk-entry-blur",
    scaleIn: ".sk-scale-in",
    scaleInBlur: ".sk-scale-in-blur",
    counter: ".sk-counter",
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

function mergeAnimationConfig(baseConfig, userConfig) {
  return {
    ...baseConfig,
    ...(userConfig || {}),
    reveal: {
      ...baseConfig.reveal,
      ...((userConfig && userConfig.reveal) || {}),
    },
    opacity: {
      ...baseConfig.opacity,
      ...((userConfig && userConfig.opacity) || {}),
    },
    entryBlur: {
      ...baseConfig.entryBlur,
      ...((userConfig && userConfig.entryBlur) || {}),
    },
    scaleIn: {
      ...baseConfig.scaleIn,
      ...((userConfig && userConfig.scaleIn) || {}),
    },
    scaleInBlur: {
      ...baseConfig.scaleInBlur,
      ...((userConfig && userConfig.scaleInBlur) || {}),
    },
    counter: {
      ...baseConfig.counter,
      ...((userConfig && userConfig.counter) || {}),
    },
    textReveal: {
      ...baseConfig.textReveal,
      ...((userConfig && userConfig.textReveal) || {}),
    },
    highlightWords: {
      ...baseConfig.highlightWords,
      ...((userConfig && userConfig.highlightWords) || {}),
    },
    highlightChars: {
      ...baseConfig.highlightChars,
      ...((userConfig && userConfig.highlightChars) || {}),
    },
  };
}

function getAnimationConfig(config, key) {
  return config.animations?.[key] || {};
}

function getCounterAnimationText(text) {
  const normalizedText = String(text || "")
    .replace(/\u00A0/g, " ")
    .trim();

  if (!normalizedText) return null;

  const numericPattern = /[+-]?[\d][\d.,\s]*/;
  const numericMatch = normalizedText.match(numericPattern);

  if (!numericMatch) return null;

  const candidate = numericMatch[0].trim();
  const candidateIndex = normalizedText.indexOf(candidate);
  const prefix = normalizedText.slice(0, candidateIndex).trim();
  const suffix = normalizedText.slice(candidateIndex + candidate.length).trim();
  const compactCandidate = candidate.replace(/\s+/g, "");

  const commaCount = (compactCandidate.match(/,/g) || []).length;
  const dotCount = (compactCandidate.match(/\./g) || []).length;
  const hasComma = commaCount > 0;
  const hasDot = dotCount > 0;

  const parseAsThousands = (valueText) => valueText.replace(/[.,]/g, "");
  const parseAsDecimal = (valueText, decimalSeparator) => {
    const parts = valueText.split(decimalSeparator);
    const integerPart = parts.shift() || "";
    const decimalPart = parts.join("");
    return `${integerPart.replace(/[.,]/g, "")}.${decimalPart.replace(/[.,]/g, "")}`;
  };

  let normalizedNumberText = compactCandidate;
  let decimals = 0;

  if (hasComma && hasDot) {
    const lastComma = compactCandidate.lastIndexOf(",");
    const lastDot = compactCandidate.lastIndexOf(".");
    const decimalSeparator = lastComma > lastDot ? "," : ".";
    const decimalIndex = Math.max(lastComma, lastDot);
    normalizedNumberText = parseAsDecimal(compactCandidate, decimalSeparator);
    decimals = Math.max(0, compactCandidate.length - decimalIndex - 1);
  } else if (hasComma || hasDot) {
    const separator = hasComma ? "," : ".";
    const occurrences = hasComma ? commaCount : dotCount;
    const parts = compactCandidate.split(separator);
    const lastPart = parts[parts.length - 1] || "";
    const looksLikeThousands =
      occurrences > 1 ||
      (parts.length === 2 && lastPart.length === 3 && parts[0].length >= 1);

    if (looksLikeThousands) {
      normalizedNumberText = parseAsThousands(compactCandidate);
      decimals = 0;
    } else {
      normalizedNumberText = parseAsDecimal(compactCandidate, separator);
      decimals = lastPart.length;
    }
  } else {
    normalizedNumberText = compactCandidate.replace(/[.,\s]/g, "");
    decimals = 0;
  }

  const value = Number(normalizedNumberText);

  if (!Number.isFinite(value)) return null;

  return {
    prefix,
    suffix,
    value,
    decimals,
  };
}

function getCounterLocale() {
  return document.documentElement.lang || undefined;
}

function formatCounterValue(value, decimals) {
  const locale = getCounterLocale();
  const roundedValue = Number(value);

  if (!Number.isFinite(roundedValue)) {
    return "0";
  }

  if (decimals > 0) {
    return roundedValue.toLocaleString(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  return Math.round(roundedValue).toLocaleString(locale);
}

function getCounterSettings(el, fallbackValue, config, source) {
  const targetAttr = el.getAttribute("data-sk-target");
  const durationAttr = Number(el.getAttribute("data-sk-duration"));
  const decimalsAttr = el.getAttribute("data-sk-decimals");
  const prefixAttr = el.getAttribute("data-sk-prefix");
  const suffixAttr = el.getAttribute("data-sk-suffix");
  const animationConfig = getAnimationConfig(config, "counter");

  const fallbackTargetValue =
    source === "data" &&
    targetAttr != null &&
    Number.isFinite(Number(targetAttr))
      ? Number(targetAttr)
      : fallbackValue.value;
  const duration =
    Number.isFinite(durationAttr) && durationAttr > 0
      ? durationAttr
      : (animationConfig.duration ?? 1.2);
  const decimals =
    decimalsAttr != null &&
    decimalsAttr !== "" &&
    Number.isFinite(Number(decimalsAttr))
      ? Math.max(0, Number(decimalsAttr))
      : fallbackValue.decimals;

  return {
    target: Number.isFinite(fallbackTargetValue)
      ? fallbackTargetValue
      : fallbackValue.value,
    duration,
    decimals,
    prefix: prefixAttr ?? fallbackValue.prefix,
    suffix: suffixAttr ?? fallbackValue.suffix,
  };
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

function initBatchAnimation(config, animationKey, selector, options = {}) {
  const els = [
    ...document.querySelectorAll(getUninitializedSelector(selector)),
  ];

  if (!els.length) return;

  const animationConfig = getAnimationConfig(config, animationKey);

  els.forEach((el) => {
    el.setAttribute("data-sk-init", "true");
  });

  if (config.reduceMotion) {
    options.reduceMotion(els, animationConfig);
    return;
  }

  options.prepare(els, animationConfig);

  ScrollTrigger.batch(els, {
    start: config.startAt,
    once: true,
    batchMax: 10,
    markers: config.debug,
    onEnter: (batch) => {
      options.animate(batch, animationConfig);
    },
  });
}

function resolveCounterSource(el) {
  const htmlCounter = getCounterAnimationText(el.textContent);

  if (htmlCounter) {
    return {
      source: "html",
      value: htmlCounter,
    };
  }

  const targetAttr = el.getAttribute("data-sk-target");

  if (targetAttr != null && Number.isFinite(Number(targetAttr))) {
    return {
      source: "data",
      value: {
        prefix: el.getAttribute("data-sk-prefix") || "",
        suffix: el.getAttribute("data-sk-suffix") || "",
        value: Number(targetAttr),
        decimals:
          el.getAttribute("data-sk-decimals") != null &&
          el.getAttribute("data-sk-decimals") !== "" &&
          Number.isFinite(Number(el.getAttribute("data-sk-decimals")))
            ? Math.max(0, Number(el.getAttribute("data-sk-decimals")))
            : 0,
      },
    };
  }

  return null;
}

function initReveal(config) {
  initBatchAnimation(config, "reveal", config.selectors.reveal, {
    reduceMotion: (els) => {
      gsap.set(els, {
        y: 0,
        opacity: 1,
        clearProps: "transform,opacity,willChange",
      });
    },
    prepare: (els, animationConfig) => {
      gsap.set(els, {
        y: animationConfig.fromY,
        opacity: 0,
        willChange: "transform, opacity",
      });
    },
    animate: (batch, animationConfig) => {
      gsap.to(batch, {
        y: 0,
        opacity: 1,
        duration: animationConfig.duration,
        ease: config.ease,
        stagger: animationConfig.stagger,
        overwrite: "auto",
        clearProps: "transform,opacity,willChange",
      });
    },
  });
}

function initOpacity(config) {
  initBatchAnimation(config, "opacity", config.selectors.opacity, {
    reduceMotion: (els) => {
      gsap.set(els, {
        opacity: 1,
        clearProps: "opacity,willChange",
      });
    },
    prepare: (els) => {
      gsap.set(els, {
        opacity: 0,
        willChange: "opacity",
      });
    },
    animate: (batch, animationConfig) => {
      gsap.to(batch, {
        opacity: 1,
        duration: animationConfig.duration,
        ease: config.ease,
        stagger: animationConfig.stagger,
        overwrite: "auto",
        clearProps: "opacity,willChange",
      });
    },
  });
}

function initEntryBlur(config) {
  initBatchAnimation(config, "entryBlur", config.selectors.entryBlur, {
    reduceMotion: (els) => {
      gsap.set(els, {
        y: 0,
        opacity: 1,
        filter: "blur(0px)",
        clearProps: "transform,opacity,filter,willChange",
      });
    },
    prepare: (els, animationConfig) => {
      gsap.set(els, {
        y: animationConfig.fromY,
        opacity: 0,
        filter: `blur(${animationConfig.fromBlur}px)`,
        willChange: "transform, opacity, filter",
      });
    },
    animate: (batch, animationConfig) => {
      gsap.to(batch, {
        y: 0,
        opacity: 1,
        filter: "blur(0px)",
        duration: animationConfig.duration,
        ease: config.ease,
        stagger: animationConfig.stagger,
        overwrite: "auto",
        clearProps: "transform,opacity,filter,willChange",
      });
    },
  });
}

function initScaleIn(config) {
  initBatchAnimation(config, "scaleIn", config.selectors.scaleIn, {
    reduceMotion: (els) => {
      gsap.set(els, {
        scale: 1,
        opacity: 1,
        clearProps: "transform,opacity,willChange",
      });
    },
    prepare: (els, animationConfig) => {
      gsap.set(els, {
        scale: animationConfig.fromScale,
        opacity: 0,
        transformOrigin: "center center",
        willChange: "transform, opacity",
      });
    },
    animate: (batch, animationConfig) => {
      gsap.to(batch, {
        scale: 1,
        opacity: 1,
        duration: animationConfig.duration,
        ease: config.ease,
        stagger: animationConfig.stagger,
        overwrite: "auto",
        clearProps: "transform,opacity,willChange",
      });
    },
  });
}

function initScaleInBlur(config) {
  initBatchAnimation(config, "scaleInBlur", config.selectors.scaleInBlur, {
    reduceMotion: (els) => {
      gsap.set(els, {
        scale: 1,
        opacity: 1,
        filter: "blur(0px)",
        clearProps: "transform,opacity,filter,willChange",
      });
    },
    prepare: (els, animationConfig) => {
      gsap.set(els, {
        scale: animationConfig.fromScale,
        opacity: 0,
        filter: `blur(${animationConfig.fromBlur}px)`,
        transformOrigin: "center center",
        willChange: "transform, opacity, filter",
      });
    },
    animate: (batch, animationConfig) => {
      gsap.to(batch, {
        scale: 1,
        opacity: 1,
        filter: "blur(0px)",
        duration: animationConfig.duration,
        ease: config.ease,
        stagger: animationConfig.stagger,
        overwrite: "auto",
        clearProps: "transform,opacity,filter,willChange",
      });
    },
  });
}

function initCounter(config) {
  const els = [
    ...document.querySelectorAll(
      getUninitializedSelector(config.selectors.counter),
    ),
  ];

  if (!els.length) return;

  els.forEach((el) => {
    const counterSource = resolveCounterSource(el);

    if (!counterSource) {
      return;
    }

    el.setAttribute("data-sk-init", "true");

    const counterSettings = getCounterSettings(
      el,
      counterSource.value,
      config,
      counterSource.source,
    );

    if (config.reduceMotion) {
      el.textContent = `${counterSettings.prefix}${formatCounterValue(
        counterSettings.target,
        counterSettings.decimals,
      )}${counterSettings.suffix}`;
      return;
    }

    const state = { value: 0 };

    ScrollTrigger.create({
      trigger: el,
      start: config.startAt,
      once: true,
      markers: config.debug,
      onEnter: () => {
        gsap.to(state, {
          value: counterSettings.target,
          duration: counterSettings.duration,
          ease: config.ease,
          overwrite: "auto",
          onUpdate: () => {
            el.textContent = `${counterSettings.prefix}${formatCounterValue(
              state.value,
              counterSettings.decimals,
            )}${counterSettings.suffix}`;
          },
          onComplete: () => {
            el.textContent = `${counterSettings.prefix}${formatCounterValue(
              counterSettings.target,
              counterSettings.decimals,
            )}${counterSettings.suffix}`;
          },
        });
      },
    });
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

    const animationConfig = getAnimationConfig(config, "textReveal");

    const split = SplitText.create(el, {
      type: "lines",
      mask: "lines",
      linesClass: "sk-line",
      autoSplit: true,
      deepSlice: true,
    });

    gsap.set(split.lines, {
      yPercent: animationConfig.fromYPercent,
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
          duration: animationConfig.duration,
          ease: config.ease,
          stagger: animationConfig.stagger,
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
    .sk-hover-underline {
      --sk-hover-underline-thickness: 2px;
      --sk-hover-underline-gap: 0.38em;
      --sk-hover-underline-duration: 0.5s;
      --sk-hover-underline-ease: cubic-bezier(0.25, 1, 0.5, 1);
      --sk-hover-underline-color: currentColor;
      position: relative;
      display: inline-block;
      padding-bottom: var(--sk-hover-underline-gap);
      text-decoration: none;
    }

    .sk-hover-underline::after {
      content: "";
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      height: var(--sk-hover-underline-thickness);
      border-radius: 999px;
      background-color: var(--sk-hover-underline-color);
      pointer-events: none;
      clip-path: inset(0 100% 0 0 round 999px);
      transition:
        clip-path var(--sk-hover-underline-duration)
          var(--sk-hover-underline-ease);
      will-change: clip-path;
    }

    .sk-hover-underline:hover,
    .sk-hover-underline:focus-visible {
      outline: none;
    }

    .sk-hover-underline:hover::after,
    .sk-hover-underline:focus-visible::after {
      clip-path: inset(0 0 0 0 round 999px);
    }

    @media (prefers-reduced-motion: reduce) {
      .sk-hover-underline,
      .sk-hover-underline::after {
        transition: none;
      }

      .sk-hover-underline {
        padding-bottom: var(--sk-hover-underline-gap);
      }

      .sk-hover-underline::after {
        clip-path: inset(0 0 0 0 round 999px);
      }
    }

    .sk-line {
      display: block;
      backface-visibility: hidden;
    }

    .sk-scale-in,
    .sk-scale-in-blur {
      backface-visibility: hidden;
      transform-origin: center center;
    }

    .sk-counter {
      font-variant-numeric: tabular-nums;
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
    .sk-entry-blur,
    .sk-scale-in,
    .sk-scale-in-blur {
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

    const animationConfig = getAnimationConfig(config, "highlightWords");

    const split = SplitText.create(el, {
      type: "words",
      wordsClass: "sk-highlight-word",
      autoSplit: true,
      deepSlice: true,
    });

    gsap.set(split.words, {
      opacity: animationConfig.opacity ?? 0.1,
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

    const animationConfig = getAnimationConfig(config, "highlightChars");

    const split = SplitText.create(el, {
      type: "words, chars",
      wordsClass: "sk-char-word",
      charsClass: "sk-highlight-char",
      autoSplit: true,
      deepSlice: true,
    });

    gsap.set(split.chars, {
      opacity: animationConfig.opacity ?? 0.1,
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
    animations: mergeAnimationConfig(
      mergeAnimationConfig(DEFAULT_CONFIG.animations, globalConfig.animations),
      userConfig.animations,
    ),
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
      initScaleIn(config);
      initScaleInBlur(config);
      initCounter(config);
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
      initScaleIn(config);
      initScaleInBlur(config);
      initCounter(config);
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
