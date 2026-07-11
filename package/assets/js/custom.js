const ClinicMaster = (function () {
  "use strict";


  const handleSetCurrentYear = () => {
    const currentDate = new Date();
    let currentYear = currentDate.getFullYear();
    let elements = document.getElementsByClassName("current-year");

    for (const element of elements) {
      element.innerHTML = currentYear;
    }
  };

  const handledzNumber = () => {
    const dzNumber = document.querySelectorAll(".dz-number");

    if (dzNumber) {
      dzNumber.forEach(function (element) {
        element.addEventListener("input", function () {
          const inputVal = element.value;
          const numericVal = inputVal.replace(/\D/g, "");

          if (numericVal.length > 10) {
            element.value = numericVal.slice(0, 10);
          } else {
            element.value = numericVal;
          }
        });
      });
    }
  };

  const handleBoxHover = () => {
    const wrappers = document.querySelectorAll(".box-hover-wrapper");
    if (!wrappers.length) return;

    wrappers.forEach((wrapper) => {
      wrapper.addEventListener("mouseover", (e) => {
        const card = e.target.closest(".box-hover");
        if (!card || !wrapper.contains(card)) return;

        wrapper
          .querySelectorAll(".box-hover.active")
          .forEach((c) => c.classList.remove("active"));

        card.classList.add("active");
      });
    });
  };

  const handleCounterJS = function () {
    const counters = document.querySelectorAll(".value");
    const speed = 200;

    const runCounter = (counter) => {
      const target = +counter.getAttribute("data-value");
      let current = 0;
      const increment = target / speed;

      const update = () => {
        current += increment;
        if (current < target) {
          counter.innerText = Math.ceil(current);
          requestAnimationFrame(update);
        } else {
          counter.innerText = target;
        }
      };

      update();
    };

    const isInViewport = (el) => {
      const rect = el.getBoundingClientRect();
      return (
        rect.top >= 0 &&
        rect.bottom <=
          (window.innerHeight || document.documentElement.clientHeight)
      );
    };

    const handleScroll = () => {
      counters.forEach((counter) => {
        if (!counter.classList.contains("counted") && isInViewport(counter)) {
          counter.classList.add("counted");
          runCounter(counter);
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
  };

  const handleNavScroller = () => {
    let previousScroll = 0;

    window.addEventListener("scroll", () => {
      const screenWidth = window.innerWidth;
      if (screenWidth <= 768) {
        const body = document.body;
        const extraNav = document.querySelector(".extra-nav");
        if (!extraNav) return;

        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const innerHeight = window.innerHeight;
        const scrollHeight = body.scrollHeight;

        if (scrollTop + innerHeight >= scrollHeight) {
          extraNav.classList.add("bottom-end");
        } else {
          extraNav.classList.remove("bottom-end");
        }

        if (scrollTop > previousScroll) {
          extraNav.classList.add("active");
        } else {
          extraNav.classList.remove("active");
        }

        previousScroll = scrollTop;
      }
    });
  };

  const handleAccordion = (container = document) => {
    const accordionContainers = container.querySelectorAll(".myAccordion");

    accordionContainers.forEach((accordion) => {
      if (accordion.dataset.bound === "true") return;
      accordion.dataset.bound = "true";

      accordion.addEventListener("click", function (e) {
        const header = e.target.closest(".accordion-header");
        if (!header || !accordion.contains(header)) return;

        const item = header.parentElement;
        const content = item.querySelector(".accordion-content");
        const arrow = header.querySelector(".arrow");
        const isOpen = header.classList.contains("open");

        accordion.querySelectorAll(".accordion-header").forEach((h) => {
          if (h !== header) {
            h.classList.remove("open");
            h.querySelector(".arrow")?.classList.remove("active");
            const c = h.parentElement.querySelector(".accordion-content");
            if (c) c.style.maxHeight = null;
          }
        });

        if (!isOpen) {
          header.classList.add("open");
          content.style.maxHeight = content.scrollHeight + "px";
          arrow?.classList.add("active");
        } else {
          header.classList.remove("open");
          content.style.maxHeight = null;
          arrow?.classList.remove("active");
        }
      });
    });

    container.querySelectorAll(".accordion-header.open").forEach((header) => {
      const content = header.parentElement.querySelector(".accordion-content");
      const arrow = header.querySelector(".arrow");
      if (content) {
        content.style.maxHeight = content.scrollHeight + "px";
        arrow?.classList.add("active");
      }
    });
  };

  const handleVideoPopupJS = function () {
    const dialog = document.getElementById("videoDialog");
    const container = document.getElementById("videoContainer");
    const closeBtn = document.getElementById("closeBtn");
    const videoWrapper = document.body;

    if (!dialog || !container || !closeBtn) return;

    const onOpenVideo = (e) => {
      const button = e.target.closest("button[data-type]");
      if (!button) return;

      const type = button.getAttribute("data-type");
      const src = button.getAttribute("data-src");

      if (!type || !src) return;

      openVideo(type, src);
    };

    const openVideo = (type, src) => {
      let videoHTML = "";

      if (type === "youtube" || type === "vimeo") {
        const sanitizedSrc = encodeURI(src);
        videoHTML = `<iframe src="${sanitizedSrc}?autoplay=1" allow="autoplay; encrypted-media; fullscreen" allowfullscreen></iframe>`;
      } else if (type === "mp4") {
        videoHTML = `<video controls autoplay><source src="${src}" type="video/mp4">Your browser does not support the video tag.</video>`;
      }

      container.innerHTML = videoHTML;
      dialog.style.display = "flex";
    };

    const closeVideo = () => {
      container.innerHTML = "";
      dialog.style.display = "none";
    };

    videoWrapper.addEventListener("click", onOpenVideo);
    closeBtn.addEventListener("click", closeVideo);

    return () => {
      videoWrapper.removeEventListener("click", onOpenVideo);
      closeBtn.removeEventListener("click", closeVideo);
    };
  };

  const handleTabs = () => {
    const tabContainers = document.querySelectorAll(".custom-tab");

    tabContainers.forEach((container) => {
      const titles = container.querySelectorAll(".tab-title");
      const contents = container.querySelectorAll(".tab-content");

      titles[0]?.classList.add("active");
      contents[0]?.classList.add("active");
      handleAccordion(contents[0]);

      container.addEventListener("click", (e) => {
        const clicked = e.target.closest(".tab-title");
        if (!clicked || !container.contains(clicked)) return;

        titles.forEach((t, i) => {
          const isActive = t === clicked;
          t.classList.toggle("active", isActive);
          contents[i].classList.toggle("active", isActive);

          if (isActive) {
            handleAccordion(contents[i]);
          }
        });
      });
    });
  };

  const handleCountdown = () => {
    const counter = document.querySelector("#countdown");
    if (!counter) return;

    const countDownClock = (number = 100, format = "seconds") => {
      const d = document;
      const daysElement = d.querySelector("#countdown .days");
      const hoursElement = d.querySelector("#countdown .hours");
      const minutesElement = d.querySelector("#countdown .minutes");
      const secondsElement = d.querySelector("#countdown .seconds");
      let countdown;
      convertFormat(format);

      function convertFormat(format) {
        switch (format) {
          case "seconds":
            return timer(number);
          case "minutes":
            return timer(number * 60);
          case "hours":
            return timer(number * 60 * 60);
          case "days":
            return timer(number * 60 * 60 * 24);
        }
      }

      function timer(seconds) {
        const now = Date.now();
        const then = now + seconds * 1000;

        countdown = setInterval(() => {
          const secondsLeft = Math.round((then - Date.now()) / 1000);

          if (secondsLeft <= 0) {
            clearInterval(countdown);
            return;
          }

          displayTimeLeft(secondsLeft);
        }, 1000);
      }

      function displayTimeLeft(seconds) {
        daysElement.textContent = Math.floor(seconds / 86400);
        hoursElement.textContent = Math.floor((seconds % 86400) / 3600);
        minutesElement.textContent = Math.floor(
          ((seconds % 86400) % 3600) / 60
        );
        secondsElement.textContent =
          seconds % 60 < 10 ? `0${seconds % 60}` : seconds % 60;
      }
    };
    countDownClock(20, "days");
  };
  
  const handleBmiCalculator = function() {
    const bmiFormMetric = document.querySelector('#BmiCalculatorMetric');
    if (bmiFormMetric) {
      bmiFormMetric.addEventListener('submit', (event) => {
        event.preventDefault();

        const height = document.querySelector('#heightMetric')?.value.trim();
        const weight = document.querySelector('#weightMetric')?.value.trim();

        if (!height || !weight) {
          alert("Please enter both height and weight!");
          return;
        }

        const bmi = Number(weight) / ((Number(height) / 100) ** 2);
        bmiFormMetric.reset();
        showBmiResult(bmi, '.dzFormBmiMetric');
      });
    }

    const bmiFormImperial = document.querySelector('#BmiCalculatorImperial');
    if (bmiFormImperial) {
      bmiFormImperial.addEventListener('submit', (event) => {
        event.preventDefault();

        const feet = document.querySelector('#heightFeet')?.value.trim();
        const inches = document.querySelector('#heightInches')?.value.trim() || 0;
        const weight = document.querySelector('#weightPounds')?.value.trim();

        if (!feet || !weight) {
          alert("Please enter height and weight!");
          return;
        }

        const totalInches = (Number(feet) * 12) + Number(inches);
        const heightMeters = totalInches * 0.0254;
        const weightKg = Number(weight) * 0.453592;

        const bmi = weightKg / (heightMeters ** 2);
        bmiFormImperial.reset();
        showBmiResult(bmi, '.dzFormBmiImperial');
      });
    }

    function showBmiResult(bmi, selector) {
      let result = '';

      if (bmi < 18.5) result = 'Underweight';
      else if (bmi <= 24.9) result = 'Healthy';
      else if (bmi <= 29.9) result = 'Overweight';
      else if (bmi <= 34.9) result = 'Obese';
      else result = 'Extremely Obese';

      const container = document.querySelector(selector);
      if (container) {
        container.innerHTML = `
          <div class="dzFormInner flex gap-5 mt-4">
            <h4 class="title text-white !mb-0">${result}</h4>
            <h5 class="bmi-result text-primary mb-0">BMI: ${bmi.toFixed(2)}</h5>
          </div>
        `;
      }
    }
  };



  /* Function ============ */
  return {
    init() {
      handleSetCurrentYear();
      handledzNumber();
      handleBoxHover();
      handleCounterJS();
      handleNavScroller();
      handleAccordion();
      handleVideoPopupJS();
      handleTabs();
      handleCountdown();
      handleBmiCalculator();
    },

    load() {},

    resize() {},
  };
})();

document.addEventListener("DOMContentLoaded", function () {
  ClinicMaster.init();
});

window.addEventListener("load", function () {
  ClinicMaster.load();
  const dzPreloader = document.getElementById("dzPreloader");
  setTimeout(function () {
    if (dzPreloader) {
      dzPreloader.remove();
    }
  }, 1000);
  document.body.addEventListener("keydown", function () {
    document.body.classList.add("show-focus-outline");
  });
  document.body.addEventListener("mousedown", function () {
    document.body.classList.remove("show-focus-outline");
  });
});

window.addEventListener("resize", function () {
  ClinicMaster.resize();
});
