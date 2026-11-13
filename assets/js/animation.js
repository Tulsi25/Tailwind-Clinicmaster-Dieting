const ClinicMasterGsap = function(){
  
  gsap.registerPlugin( ScrollSmoother, ScrollTrigger );

  let smoother;

  if (!smoother) {
    smoother = ScrollSmoother.create({
      smooth: 2,
      effects: true,
      normalizeScroll: true,
      smoothTouch: 0.1, 
    });
  }
  
	let tl = gsap.timeline({paused: true});
	tl.to("#headerWrapper1", {
	  top: -98,
	  duration: 0.3,
	  ease: "power2.out"
	});

	ScrollTrigger.create({
	  trigger: "#headerWrapper1",
	  start: "bottom top",
	  onEnter: () => tl.play(),      
	  onLeaveBack: () => tl.reverse() 
	});

	

  const headingAnimation = () => {
    const triggers = [];

    const headings = document.querySelectorAll(".pxl-heading-scroll-effect .heading-text");

    if (headings.length === 0) return;

    headings.forEach((heading) => {
      if (!heading) return;

      const split = new SplitText(heading, { type: "lines" });

      split.lines.forEach((line) => {
        const tween = gsap.to(line, {
          backgroundPositionX: "0%",
          ease: "power2.inOut",
          scrollTrigger: {
            trigger: line,
            start: "top 50%",
            end: "bottom center",
            scrub: 1,
          },
        });

        if (tween.scrollTrigger) {
          triggers.push(tween.scrollTrigger);
        }
      });
    });

    return () => {
      triggers.forEach((trigger) => trigger.kill());
    };
  };

  const headerSticky = () => {
	  const header = document.querySelector(".site-header");
	  const sidebarStickyWrap = document.querySelector(".sidebar-sticky");

	  if (!header) return;

	  let lastScroll = 0;
	  let animationFrameId;
	  const headerHeight = header.offsetHeight || 80;

	  const updateStickyHeader = (scrollY) => {
		const shouldFix = scrollY > 100;
		header.classList.toggle("is-fixed", shouldFix);

		if (sidebarStickyWrap) {
		  sidebarStickyWrap.style.top = shouldFix
			? `${headerHeight + 10}px`
			: "60%";
		}

		lastScroll = scrollY;
	  };

	  const loop = () => {
		const currentScroll =
		  typeof smoother?.scrollTop === "function"
			? smoother.scrollTop()
			: window.scrollY || document.documentElement.scrollTop;

		updateStickyHeader(currentScroll);
		animationFrameId = requestAnimationFrame(loop);
	  };

	  animationFrameId = requestAnimationFrame(loop);

	  return () => {
		if (animationFrameId) cancelAnimationFrame(animationFrameId);
	  };
	};

  const linkSmoothScroll = () => {
	  const anchorLinks = Array.from(document.querySelectorAll('a[href^="#"]'))
		.filter(link => link.getAttribute("href") !== "#");

	  const clickHandler = (e) => {
		const anchor = e.target.closest('a[href^="#"]');
		if (!anchor) return;

		const href = anchor.getAttribute("href");
		if (!href || href === "#") return;

		const targetId = href.slice(1);
		const targetEl = document.getElementById(targetId);
		if (!targetEl) return;

		e.preventDefault();

		anchorLinks.forEach(link => link.classList.remove("active"));
		anchor.classList.add("active");

		if (typeof smoother?.scrollTo === "function") {
		  smoother.scrollTo(targetEl, true);
		} else {
		  targetEl.scrollIntoView({ behavior: "smooth" });
		}
	  };

	  document.addEventListener("click", clickHandler);

	  anchorLinks.forEach(link => {
		const href = link.getAttribute("href");
		const targetId = href.slice(1);
		const section = document.getElementById(targetId);

		if (!section) return;

		ScrollTrigger.create({
		  trigger: section,
		  start: "top center",
		  end: "bottom center",
		  onEnter: () => setActiveLink(href),
		  onEnterBack: () => setActiveLink(href),
		});
	  });

	  const setActiveLink = (href) => {
		anchorLinks.forEach(link => {
		  link.classList.toggle("active", link.getAttribute("href") === href);
		});
	  };

	  return () => {
		document.removeEventListener("click", clickHandler);
		ScrollTrigger.getAll().forEach(trigger => trigger.kill());
	  };
	};

  let cleanupSticky = null;
  const initStickyPosition = (selector = ".my-sticky", offset = 100) => {
    ScrollTrigger.matchMedia({
      "(min-width: 992px)": () => {
        const elements = document.querySelectorAll(selector);
        const triggers = [];
        elements.forEach((el) => {
          const parent = el.parentElement;
          if (!parent) return;

          const spacer = document.createElement("div");
          spacer.style.position = "relative";
          spacer.style.height = el.classList.contains("sidebar-sticky") ? 0 : `${el.offsetHeight + offset}px`;
          parent.insertBefore(spacer, el);
          spacer.appendChild(el);

          Object.assign(el.style, {
            position: "absolute",
            top: el.classList.contains("space-top-0") ?  0 : `${offset}px`,
            left: 0,
            right: 0,
          });

          const trigger = ScrollTrigger.create({
            trigger: spacer,
            start: "top top",
            end: () => `+=${parent.offsetHeight - el.offsetHeight - offset}`,
            pin: el,
            pinSpacing: false,
            scroller: "#smooth-wrapper",
            anticipatePin: 1,
          });

          triggers.push({ trigger, spacer, el });
        });

        return () => {
          triggers.forEach(({ trigger, spacer, el }) => {
            trigger.kill();

            const parent = spacer.parentElement;
            if (parent) {
              parent.insertBefore(el, spacer);
              parent.removeChild(spacer);
            }

            Object.assign(el.style, {
              position: "",
              top: "",
              left: "",
              right: "",
            });
          });
        };

      }
    });
  };  

  const applySticky = () => {
    if (cleanupSticky) cleanupSticky();       
    cleanupSticky = initStickyPosition();   
  };

  document.querySelectorAll(".sticky-update-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      setTimeout(() => {
        applySticky();
      }, 200);
    });
  });
  
  const customScroll = () => {
    const content = document.querySelectorAll('.custom-scroll');

    content.forEach((item) => {
      item.addEventListener('wheel', function (e) {
        e.stopPropagation();
      }, { passive: false });

      let startY = 0;
      let startX = 0;

      item.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        startY = touch.clientY;
        startX = touch.clientX;
      }, { passive: true });

      item.addEventListener('touchmove', (e) => {
        const touch = e.touches[0];
        const deltaY = startY - touch.clientY;
        const deltaX = startX - touch.clientX;

        item.scrollTop += deltaY;
        item.scrollLeft += deltaX;

        startY = touch.clientY;
        startX = touch.clientX;

        e.stopPropagation();
        e.preventDefault();
      }, { passive: false });
    });
  };
  const handleScrollTop = function () {
    const scrollBtn = document.getElementById("scrollProgress");
    if (!scrollBtn) return;

    const circle = scrollBtn.querySelector("circle");
    if (!circle) return;

    const radius = circle.r.baseVal.value;
    const circumference = 2 * Math.PI * radius;

    circle.style.strokeDasharray = `${circumference}`;
    circle.style.strokeDashoffset = `${circumference}`;

    function updateProgress() {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      const scrollPercent = scrollTop / docHeight;
      const offset = circumference * (1 - scrollPercent);
      circle.style.strokeDashoffset = offset;

      if (scrollTop > 200) {
        scrollBtn.classList.add("active");
      } else {
        scrollBtn.classList.remove("active");
      }
    }

    window.addEventListener("scroll", updateProgress);
    updateProgress();

    scrollBtn.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  };


  return {
    init(){
      headingAnimation();
      headerSticky();
      linkSmoothScroll();
      applySticky();
      customScroll();
      handleScrollTop();
    },
  };
};

window.addEventListener("load", () => {
  ClinicMasterGsap().init();
});

let resizeTimeout;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    ScrollTrigger.refresh();
  }, 250);
});