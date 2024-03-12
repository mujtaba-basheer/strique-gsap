import "gsap/types";
import Typed from "typed.js";

type StateItemT = gsap.core.Tween | gsap.core.Timeline | null;
interface GlobalState {
  playedAnimation: StateItemT;
  nextAnimation: StateItemT;
  isActive: boolean;
  repeatCount: {
    rotateAnim: number;
  };
  typed: Typed | null;
  isAnimSkipped: boolean;
}

window.scrollTo({ top: 0 });
document.querySelector(".page-loader").scrollTop = 0;

gsap.registerEffect(ScrollToPlugin);
gsap.registerPlugin(ScrollTrigger);

const state: GlobalState = {
  playedAnimation: null,
  nextAnimation: null,
  isActive: false,
  repeatCount: {
    rotateAnim: 0,
  },
  typed: null,
  isAnimSkipped: false,
};

window.addEventListener("wheel", (ev) => {
  if (state.isActive) return;

  if (ev.deltaY > 10) {
    const animation = state.nextAnimation;
    if (animation) {
      animation.play(0);
      state.isActive = true;
      state.nextAnimation = null;
    }
  } else if (ev.deltaY < -10) {
    const animation = state.playedAnimation;
    if (animation) {
      animation.reverse();
      state.isActive = true;
      state.playedAnimation = null;
    }
  }
});

const iPhoneAudioEl = document.createElement("audio");
{
  const sourceEl = document.createElement("source");
  sourceEl.src =
    "https://mujtababasheer.com/assets/audio/iphone_notification.mp3";
  sourceEl.type = "audio/mp3";
  iPhoneAudioEl.appendChild(sourceEl);

  iPhoneAudioEl.style.display = "none";
  document.body.appendChild(iPhoneAudioEl);
}

const slackAudioEl = document.createElement("audio");
{
  const sourceEl = document.createElement("source");
  sourceEl.src = "https://mujtababasheer.com/assets/audio/slack_sound.mp3";
  sourceEl.type = "audio/mp3";
  slackAudioEl.appendChild(sourceEl);

  slackAudioEl.style.display = "none";
  document.body.appendChild(slackAudioEl);
}

const disableScroll = () => gsap.set(document.body, { overflow: "hidden" });
const enableScroll = () => gsap.set(document.body, { overflow: "auto" });

/*
 First page animation
*/

// disable scroll
disableScroll();

const runCounter = () => {
  const counter = document.querySelector<HTMLDivElement>(".counter");

  counter.innerText = "72";
  const updateCounter = () => {
    state.isActive = true;
    const target = +counter.getAttribute("data-target");
    const count = +counter.innerText;
    const increment = target / 1000;
    if (count < target) {
      counter.innerText = `${Math.ceil(count + increment)}`;
      setTimeout(updateCounter, 30);
    } else {
      counter.innerText = target + "";
      setTimeout(() => {
        moveToSecondScreenAnim.play(0);
        state.isActive = true;
      }, 1.5 * 1000);
    }
  };
  updateCounter();
};
const counterEl = document.getElementById("counters");
if (counterEl) runCounter();

const setupTypewriterEffect = () => {
  const textEl = document.querySelector("#typewriter-div .processing-text");
  state.typed = new Typed(textEl, {
    loop: false,
    strings: [
      "Fetching Data through multiple platforms",
      "Analysing multiple data",
      "It takes X hours to compile and generate a report<br />which could lead to human error",
    ],
    typeSpeed: 10,
  });
};
const skipAnimation = (ev: MouseEvent) => {
  ev.preventDefault();
  state.isAnimSkipped = true;

  gsap.to(".page-loader", {
    opacity: 0,
    pointerEvents: "none",
    onComplete: () => {
      document.querySelector(".page-loader").remove();

      state.nextAnimation = null;
      state.playedAnimation = null;
      state.isActive = false;

      enableScroll();
    },
  });
};
window.addEventListener("load", () => {
  setupTypewriterEffect();

  const tabEls = document.querySelectorAll<HTMLAnchorElement>(
    ".tab-wrap a:last-child"
  );
  tabEls.forEach((tabEl) => tabEl.addEventListener("click", skipAnimation));
});

gsap.fromTo(
  ".strique-rotate-animation",
  { rotate: 0 },
  {
    id: "rotateAnim",
    rotate: "360deg",
    delay: 1,
    duration: 2,
    ease: "none",
    repeat: -1,
    onRepeat: () => {
      const { rotateAnim: repeatCount } = state.repeatCount;
      /*
      if (repeatCount === 0) {
        state.nextAnimation = moveToSecondScreenAnim;
        state.isActive = false;
      }
      */
      state.repeatCount.rotateAnim++;
    },
  }
);

const moveToSecondScreenAnim = gsap.fromTo(
  "#list-1",
  { opacity: 1 },
  {
    opacity: 0,
    pointerEvents: "none",
    duration: 1.5,
    paused: true,
    onComplete: () => {
      state.playedAnimation = null;
      notificationsAnim.play(0);
    },
  }
);

/*
 Second page animation
*/

gsap.set(".date-and-time-wrapper", { opacity: 0 });
gsap.set(".comment-wrapper .comment-item", {
  opacity: 0,
  transformOrigin: "center",
  scale: 0,
});

const moveToFirstScreenAnim = gsap.to("#list-1", {
  opacity: 1,
  pointerEvents: "auto",
  duration: 1.5,
  paused: true,
  onComplete: () => {
    state.playedAnimation = null;
    state.nextAnimation = moveToSecondScreenAnim;
    state.isActive = false;
  },
});

const notificationsAnim = gsap
  .timeline({
    paused: true,
    onReverseComplete: () => {
      moveToFirstScreenAnim.play(0);
    },
    onComplete: () => {
      state.playedAnimation = notificationsAnim;
      state.nextAnimation = popNotificationsAnim;
      state.isActive = false;
      gsap.set(".comment-wrapper", { transformOrigin: "bottom" });
    },
  })
  .fromTo(
    "#iphone-anim-wrapper",
    { yPercent: 100 },
    {
      yPercent: 0,
      duration: 0.5,
      onReverseComplete: () => {
        // moveToFirstScreenAnim.play(0);
      },
      onStart: () => {
        const dateAndTimeEl = document.querySelector<HTMLDivElement>(
          ".date-and-time-wrapper"
        );
        const date = new Date();

        const timeEl = dateAndTimeEl.querySelector(".iphone-time");
        const ts = date.toLocaleTimeString("en-US", { hour12: true });
        const [hr, min] = ts.split(":");
        timeEl.textContent = `${hr}:${min}`;

        const dateEl = dateAndTimeEl.querySelector(".iphone-date");
        const months = [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ];
        const weekdays = [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ];

        const dayOfMonth = date.getDate();
        const weekday = weekdays[date.getDay()];
        const month = months[date.getMonth()];

        dateEl.textContent = `${weekday}, ${dayOfMonth} ${month}`;
      },
    }
  )
  .to(".date-and-time-wrapper", {
    opacity: 1,
  })
  .to(".comment-wrapper .comment-item", {
    opacity: 1,
    scale: 1,
    stagger: 0.4,
    onStart: () => {
      if (!state.isAnimSkipped) iPhoneAudioEl.play();
      shakePhone();
    },
  });

const shakePhone = () => {
  gsap.to("#iphone-anim-wrapper", {
    x: "+=10",
    yoyo: true,
    repeat: 10,
    duration: 0.1,
  });
  gsap.to("#iphone-anim-wrapper", {
    x: "-=10",
    yoyo: true,
    repeat: 10,
    duration: 0.1,
  });
};

const popNotificationsAnim = gsap
  .timeline({
    paused: true,
    onReverseComplete: () => {
      state.playedAnimation = notificationsAnim;
      state.nextAnimation = popNotificationsAnim;
      state.isActive = false;
    },
    onComplete: () => {
      state.playedAnimation = popNotificationsAnim;
      state.nextAnimation = burstCommentAnim;
      state.isActive = false;
    },
  })
  .to(".iphone-image-wrap", { opacity: 0 })
  .to(".date-and-time-wrapper", { opacity: 0 }, "<")
  .to(".comment-wrapper", { scale: 1.4, transformOrigin: "top" })
  .to(".comment-wrapper .comment-item", {
    y: -250,
    stagger: 0.1,
  })
  .fromTo(
    [".comment-item-overlay-1", ".comment-item-overlay-1.rev-linear"],
    { opacity: 0 },
    { opacity: 1 },
    "<"
  )
  .to(".comment-wrapper .comment-item.active", {
    scale: 1.15,
    backgroundColor: "rgb(255, 255, 255)",
    color: "rgb(12, 3, 26)",
  });

const burstCommentAnim = gsap
  .timeline({
    paused: true,
    onReverseComplete: () => {
      state.playedAnimation = popNotificationsAnim;
      state.nextAnimation = burstCommentAnim;
      state.isActive = false;

      gsap.set(".comment-item.active", { position: "relative" });
    },
    onComplete: () => {
      gsap.set(
        [".fatching-loader._1", ".fatching-loader._2", ".fatching-complete"],
        {
          opacity: 0,
        }
      );

      state.playedAnimation = burstCommentAnim;
      state.nextAnimation = moveToFourthScreenAnim;
      state.isActive = false;
    },
  })
  .fromTo(
    [".comment-item.active img", ".comment-item.active .comment-content"],
    { opacity: 1 },
    {
      opacity: 0,
      duration: 1,
    }
  )
  .fromTo(
    ".comment-item.active",
    { scale: 1.15 },
    {
      scale: 9,
      duration: 2,
      onComplete: () => {
        gsap.set(".comment-item.active", { position: "fixed" });
      },
    },
    "<"
  )
  .fromTo(
    "#list-2",
    { opacity: 1 },
    {
      opacity: 0,
      pointerEvents: "none",
      onReverseComplete: () => {
        gsap.set(".comment-item.active", { position: "relative" });
      },
    }
  )
  .fromTo(
    ".urgent-report-container",
    { y: 0 },
    {
      y: -500,
      delay: 1,
      duration: 1,
      onReverseComplete: () => {
        burstCommentAnim.reverse(1);
      },
    }
  )
  .fromTo(
    ".urgent-report-container",
    { opacity: 1 },
    {
      opacity: 0,
      duration: 1.5,
    }
  )
  .fromTo(
    ".gmail-highlighted-message",
    { opacity: 0 },
    { opacity: 1, duration: 1.5 },
    "<"
  );

/*
 Third page animation
*/

const moveToFourthScreenAnim = gsap.to(".anims-container", {
  opacity: 0,
  pointerEvents: "none",
  duration: 2,
  paused: true,
  onComplete: () => {
    showProcessTextsAnim.play(0);
  },
});

/*
 Fourth page animation
*/

const moveBackToThirdScreenAnim = gsap.to(".anims-container", {
  opacity: 1,
  pointerEvents: "auto",
  duration: 1.5,
  paused: true,
  onComplete: () => {
    state.playedAnimation = burstCommentAnim;
    state.nextAnimation = moveToFourthScreenAnim;
    state.isActive = false;
  },
});

const showProcessTextsAnim = gsap
  .timeline({
    paused: true,
    onReverseComplete: () => {
      moveBackToThirdScreenAnim.play(0);
    },
    onComplete: () => {
      state.playedAnimation = showProcessTextsAnim;
      state.nextAnimation = insightsAnim;
      state.isActive = false;
    },
  })
  .fromTo(
    ".processing-data-bg-grid img",
    { y: 100 },
    {
      y: 0,
    }
  )
  .fromTo(
    ".fatching-loader._1",
    { opacity: 0 },
    {
      opacity: 1,
      duration: 2,
      onStart: () => {
        if (state.typed) state.typed.reset(true);
      },
    }
  );

const insightsAnim = gsap
  .timeline({
    paused: true,
    onReverseComplete: () => {
      state.playedAnimation = showProcessTextsAnim;
      state.nextAnimation = insightsAnim;
      state.isActive = false;
    },
    onComplete: () => {
      state.playedAnimation = insightsAnim;
      state.nextAnimation = showStriqueLoaderAnim;
      state.isActive = false;
    },
  })
  .fromTo(
    [".processing-data-bg-grid", ".processing-data .div-block-1038"],
    { opacity: 1 },
    {
      opacity: 0,
      onComplete: () => {
        gsap.set(
          [".processing-data-bg-grid", ".processing-data .div-block-1038"],
          { display: "none" }
        );
      },
    }
  )
  .fromTo(
    ".processing-data",
    { background: "transparent" },
    {
      background: "linear-gradient(#542cc2, #b57bee)",
      onReverseComplete: () => {
        gsap.set(".processing-data-bg-grid", { display: "block" });
        gsap.set(".processing-data .div-block-1038", { display: "flex" });
      },
    },
    "<"
  )
  .fromTo(".testimonial-tagline", { opacity: 0, y: 300 }, { opacity: 1, y: 0 })
  .fromTo(
    ".testimonial-wrap:not(.bottom) .insights-metric-testimonial",
    { opacity: 0, y: 100, scale: 0.8 },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      stagger: 0.4,
      ease: "elastic.out",
      onStart: () => slackAudioEl.play(),
    }
  )
  .fromTo(
    ".testimonial-wrap.bottom .insights-metric-testimonial",
    { opacity: 0, y: 100, scale: 0.8 },
    {
      opacity: 1,
      y: -40,
      scale: 1,
      stagger: 0.4,
      ease: "elastic.out",
      onStart: () => slackAudioEl.play(),
    }
  );

const showStriqueLoaderAnim = gsap
  .timeline({
    paused: true,
    onReverseComplete: () => {
      state.playedAnimation = insightsAnim;
      state.nextAnimation = showStriqueLoaderAnim;
      state.isActive = false;
    },
    onComplete: () => {
      state.playedAnimation = null;
      state.nextAnimation = null;
      document.querySelector(".page-loader").remove();
      enableScroll();
      state.isActive = false;
    },
  })
  .fromTo("#insights-wrapper", { opacity: 1 }, { opacity: 0 })
  .to(
    ".processing-data",
    // { background: "linear-gradient(#542cc2, #b57bee)" },
    {
      background: "#0b0219",
      onReverseComplete: () => {
        gsap.set("#insights-wrapper", { display: "block" });
      },
      onComplete: () => {
        gsap.set("#insights-wrapper", { display: "none" });
      },
    }
  )
  .fromTo(".final-logo-screen", { opacity: 0 }, { opacity: 1 })
  .fromTo(
    ".final-logo-bg-wrapper",
    { scale: 1, rotate: 0 },
    { scale: 20, rotate: 360, duration: 1.5 },
    ">+=2"
  )
  .fromTo(".page-loader", { opacity: 1 }, { opacity: 0, duration: 1 }, "<");
