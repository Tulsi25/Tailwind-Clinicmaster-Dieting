const contactForm = () => {
  // Recaptcha callbacks
  window.verifyRecaptchaCallback = (response) => {
    const input = document.querySelector('input[data-recaptcha]');
    if (input) {
      input.value = response;
      input.dispatchEvent(new Event("change"));
    }
  };

  window.expiredRecaptchaCallback = () => {
    const input = document.querySelector('input[data-recaptcha]');
    if (input) {
      input.value = "";
      input.dispatchEvent(new Event("change"));
    }
  };

  let msgDiv;

  // Contact form submission
  document.querySelectorAll(".dzForm").forEach((form) => {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const dzFormMsg = document.querySelector(".dzFormMsg");
      if (dzFormMsg) {
        dzFormMsg.innerHTML = `<div class="gen alert dz-alert alert-success">Submitting..</div>`;
      }

      const dzFormAction = form.getAttribute("action");
      const formData = new FormData(form);
      const activeRecaptcha =
        document.querySelector("input[reCaptchaEnable]")?.value == "1";

      try {
        const response = await fetch(dzFormAction, {
          method: "POST",
          body: formData,
        });
        const dzRes = await response.json();

        if (dzRes.status == 1) {
          msgDiv = `<div class="gen alert dz-alert alert-success">${dzRes.msg}</div>`;
        } else {
          msgDiv = `<div class="err alert dz-alert alert-danger">${dzRes.msg}</div>`;
        }

        if (dzFormMsg) {
          dzFormMsg.innerHTML = msgDiv;
          setTimeout(() => {
            const alertBox = dzFormMsg.querySelector(".alert");
            if (alertBox) alertBox.style.display = "none";
          }, 5000);
        }

        form.reset();

        if (activeRecaptcha) {
          grecaptcha.reset();
        }
      } catch (error) {
        console.error("Form submit failed:", error);
      }
    });
  });

  // Newsletter subscribe
  document.addEventListener("submit", async (e) => {
    if (e.target.matches(".dzSubscribe")) {
      e.preventDefault();

      const thisForm = e.target;
      const dzFormAction = thisForm.getAttribute("action");
      const formData = new FormData(thisForm);

      thisForm.classList.add("dz-ajax-overlay");

      try {
        const response = await fetch(dzFormAction, {
          method: "POST",
          body: formData,
        });
        const dzRes = await response.json();

        thisForm.classList.remove("dz-ajax-overlay");

        if (dzRes.status == 1) {
          msgDiv = `<div class="gen alert dz-alert alert-success">${dzRes.msg}</div>`;
        } else {
          msgDiv = `<div class="err alert dz-alert alert-danger">${dzRes.msg}</div>`;
        }

        const subscribeMsg = document.querySelector(".dzSubscribeMsg");
        if (subscribeMsg) {
          subscribeMsg.innerHTML = msgDiv;
          setTimeout(() => {
            const alertBox = subscribeMsg.querySelector(".alert");
            if (alertBox) alertBox.style.display = "none";
          }, 5000);
        }

        thisForm.reset();
      } catch (error) {
        console.error("Subscription failed:", error);
        thisForm.classList.remove("dz-ajax-overlay");
      }
    }
  });

  // Load more button
  document.querySelectorAll(".dz-load-more").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      const dzLoadMoreUrl = btn.getAttribute("rel");
      if (!dzLoadMoreUrl) return;

      try {
        const response = await fetch(dzLoadMoreUrl, { method: "POST" });
        const data = await response.text();
        const container = document.querySelector(".loadmore-content");
        if (container) {
          container.insertAdjacentHTML("beforeend", data);
        }
      } catch (error) {
        console.error("Load more failed:", error);
      }
    });
  });
};

// Init on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  contactForm();
});
