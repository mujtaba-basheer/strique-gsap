import "gsap/types";

type StateItemT = gsap.core.Tween | gsap.core.Timeline | null;
interface GlobalState {
  playedAnimation: StateItemT;
  nextAnimation: StateItemT;
  isActive: boolean;
}

window.scrollTo({ top: 0 });

gsap.registerEffect(ScrollToPlugin);
gsap.registerPlugin(ScrollTrigger);

const state: GlobalState = {
  playedAnimation: null,
  nextAnimation: null,
  isActive: false,
};

window.addEventListener("wheel", (ev) => {
  if (state.isActive) return;

  if (ev.deltaY > 100) {
    const animation = state.nextAnimation;
    if (animation) {
      animation.play(0);
      state.isActive = true;
      state.nextAnimation = null;
    }
  } else if (ev.deltaY < -100) {
    const animation = state.playedAnimation;
    if (animation) {
      animation.reverse();
      state.isActive = true;
      state.playedAnimation = null;
    }
  }
});

const audioEl = document.createElement("audio");
{
  const sourceEl = document.createElement("source");
  sourceEl.src =
    "https://mujtababasheer.com/assets/audio/iphone_notification.mp3";
  sourceEl.type = "audio/mp3";
  audioEl.appendChild(sourceEl);

  audioEl.style.display = "none";
  document.body.appendChild(audioEl);
}

const disableScroll = () => gsap.set(document.body, { overflow: "hidden" });
const enableScroll = () => {
  // while (animations.length) animations.pop();
  gsap.set(document.body, { overflow: "auto" });
};

/*
 First page animation
*/

// disable scroll
disableScroll();

const rotateAnim = gsap.fromTo(
  ".strique-rotate-animation",
  { rotate: 0 },
  {
    rotate: "360deg",
    delay: 1,
    duration: 2,
    onReverseComplete: () => {
      state.nextAnimation = moveToSecondScreenAnim;
      state.isActive = false;
    },
    onComplete: () => {
      state.nextAnimation = moveToSecondScreenAnim;
      state.isActive = false;
    },
  }
);

const moveToSecondScreenAnim = gsap.to(window, {
  duration: 1.5,
  scrollTo: "#list-2",
  paused: true,
  onComplete: () => {
    // moveToSecondScreenAnim.pause().seek(0);
    state.playedAnimation = null;
    phoneEnterAnim.play();
  },
});

/*
 Second page animation
*/

gsap.set(".date-and-time-wrapper", { opacity: 0 });
gsap.set(".comment-wrapper .comment-item", {
  opacity: 0,
  transformOrigin: "center",
  scale: 0,
});

const moveToFirstScreenAnim = gsap.to(window, {
  scrollTo: "#list-1",
  duration: 1.5,
  paused: true,
  onComplete: () => {
    state.playedAnimation = null;
    rotateAnim.play(0);
  },
});

const phoneEnterAnim = gsap.fromTo(
  "#iphone-anim-wrapper",
  { yPercent: 100 },
  {
    yPercent: 0,
    duration: 2,
    paused: true,
    onReverseComplete: () => {
      moveToFirstScreenAnim.play(0);
    },
    onComplete: () => {
      state.playedAnimation = phoneEnterAnim;
      state.nextAnimation = revealDateTimeAnim;
      state.isActive = false;

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
);

const revealDateTimeAnim = gsap.to(".date-and-time-wrapper", {
  opacity: 1,
  paused: true,
  onReverseComplete: () => {
    state.playedAnimation = phoneEnterAnim;
    state.nextAnimation = revealDateTimeAnim;
    state.isActive = false;
  },
  onComplete: () => {
    state.playedAnimation = revealDateTimeAnim;
    state.nextAnimation = revealNotificationAnim;
    state.isActive = false;
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

const revealNotificationAnim = gsap.to(".comment-wrapper .comment-item", {
  opacity: 1,
  scale: 1,
  stagger: 0.4,
  paused: true,
  onStart: () => {
    audioEl.play();
    shakePhone();
  },
  onReverseComplete: () => {
    state.playedAnimation = revealDateTimeAnim;
    state.nextAnimation = revealNotificationAnim;
    state.isActive = false;
  },
  onComplete: () => {
    gsap.set(".comment-wrapper", { transformOrigin: "bottom" });
    state.playedAnimation = revealNotificationAnim;
    state.nextAnimation = popNotificationsAnim;
    state.isActive = false;
  },
});

const popNotificationsAnim = gsap
  .timeline({
    paused: true,
    onReverseComplete: () => {
      state.playedAnimation = revealNotificationAnim;
      state.nextAnimation = popNotificationsAnim;
      state.isActive = false;
    },
    onComplete: () => {
      state.playedAnimation = popNotificationsAnim;
      state.nextAnimation = highlightNotificationAnim;
      state.isActive = false;
    },
  })
  .to(".iphone-image-wrap", { opacity: 0 })
  .to(".date-and-time-wrapper", { opacity: 0 }, "<")
  .to(".comment-wrapper", { scale: 1.4, bottom: 0 });

const highlightNotificationAnim = gsap.to(
  ".comment-wrapper .comment-item.active",
  {
    scale: 1.15,
    backgroundColor: "rgb(255, 255, 255)",
    color: "rgb(12, 3, 26)",
    paused: true,
    onReverseComplete: () => {
      state.playedAnimation = popNotificationsAnim;
      state.nextAnimation = highlightNotificationAnim;
      state.isActive = false;
    },
    onComplete: () => {
      state.playedAnimation = highlightNotificationAnim;
      state.nextAnimation = moveToThirdScreenAnim;
      state.isActive = false;
    },
  }
);

const moveToThirdScreenAnim = gsap.to(window, {
  duration: 1.5,
  scrollTo: "#list-3",
  paused: true,
  onComplete: () => {
    state.playedAnimation = moveToThirdScreenAnim;
    state.nextAnimation = moveChatUpAnim;
    state.isActive = false;
  },
});

/*
 Third page animation
*/

const moveChatUpAnim = gsap.fromTo(
  ".urgent-report-container",
  { y: 0 },
  {
    y: -500,
    paused: true,
    duration: 1,
    onReverseComplete: () => {
      moveBackToSecondScreenAnim.play(0);
      state.nextAnimation = moveChatUpAnim;
    },
    onComplete: () => {
      state.playedAnimation = moveChatUpAnim;
      state.nextAnimation = highlightChatAnim;
      state.isActive = false;
    },
  }
);

const highlightChatAnim = gsap
  .timeline({
    paused: true,
    onReverseComplete: () => {
      state.nextAnimation = highlightChatAnim;
      state.playedAnimation = moveChatUpAnim;
      state.isActive = false;
    },
    onComplete: () => {
      state.nextAnimation = null;
      state.playedAnimation = highlightChatAnim;
      state.isActive = false;
    },
  })
  .fromTo(
    ".urgent-report-container",
    { opacity: 1 },
    {
      opacity: 0,
    }
  )
  .fromTo(".gmail-highlighted-message", { opacity: 0 }, { opacity: 1 }, "<");

const moveBackToSecondScreenAnim = gsap.to(window, {
  duration: 1.5,
  scrollTo: "#list-2",
  paused: true,
  onComplete: () => {
    state.playedAnimation = highlightNotificationAnim;
    state.nextAnimation = moveChatUpAnim;
    state.isActive = false;
  },
});
