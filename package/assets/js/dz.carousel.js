const ClinicMasterCarousel = function () {

  const BlogSlideshowSwiper = () => {
    const swiperEl = document.querySelector(".blog-slideshow");
    if (!swiperEl) return;

    new Swiper(".blog-slideshow", {
      loop: true,
      spaceBetween: 0,
      slidesPerView: "auto",
      speed: 1500,
      autoplay: {
        delay: 2000,
      },
      pagination: {
        el: ".swiper-pagination-two",
        clickable: true,
      },
    });
  };

  if (
    document.querySelector(".galley-thumb-swiper") &&
    document.querySelector(".galley-swiper")
  ) {
    const swiperThumbs = new Swiper(".galley-thumb-swiper", {
      loop: false,
      spaceBetween: 10,
      slidesPerView: 4,
      freeMode: true,
      watchSlidesProgress: true,
    });

    new Swiper(".galley-swiper", {
      loop: true,
      spaceBetween: 10,
      thumbs: {
        swiper: swiperThumbs,
      },
    });
  }

  const handleCompareSwiper2 = function() {	
      const swiperContainer = document.querySelector('.compare-swiper-2');

      if (swiperContainer) {
        const compareSwiper = new Swiper(".compare-swiper-2", {
          loop: true,
          slidesPerView: 3,
          spaceBetween: 20,
          centeredSlides: true,
          autoplay: {
            delay: 3000,
          },
          navigation: {
            nextEl: ".compare-swiper-2-next",
            prevEl: ".compare-swiper-2-prev",
          },
          pagination: {
            el: ".compare-pagination-swiper",
            type: "progressbar",
          },
          breakpoints: {
            1481: {
              slidesPerView: 2.6,
            },
            1280: {
              slidesPerView: 3,
            },
            991: {
              slidesPerView: 3,
            },
            320: {
              slidesPerView: 2,
            },
          },
        });

        const paginationCurrent = document.querySelector('.compare-slider__current');
        const paginationTotal = document.querySelector('.compare-slider__total');

        if (paginationCurrent && paginationTotal) {
          const mainSliderPagination = () => {
            const totalSlides = compareSwiper.slides.length - compareSwiper.loopedSlides * 2; // Swiper adds looped slides
            let current = compareSwiper.realIndex + 1;
            if (current > totalSlides) current = 1;
            const currentFormatted = current < 10 ? `0${current}` : current;
            const totalFormatted = totalSlides < 10 ? `0${totalSlides}` : totalSlides;

            paginationCurrent.innerHTML = currentFormatted;
            paginationTotal.innerHTML = totalFormatted;
          };

          mainSliderPagination();
          compareSwiper.on('slideChange', mainSliderPagination);
        }
      }	
    };

  
  return {
    load() {
      BlogSlideshowSwiper();
      handleCompareSwiper2();
    },
  };
};

window.addEventListener("load", function () {
  ClinicMasterCarousel().load();
});
