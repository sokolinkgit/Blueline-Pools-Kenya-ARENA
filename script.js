/* =========================================================
   Blueline Pools Kenya — interaction layer
   No framework or build step required.
   ========================================================= */
(function () {
  'use strict';

  const header = document.querySelector('.site-header');
  const navToggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.primary-nav');

  // Keep the header legible over content as the visitor scrolls.
  function updateScrollState() {
    if (header) header.classList.toggle('scrolled', window.scrollY > 35);
    const backToTop = document.querySelector('.back-to-top');
    if (backToTop) backToTop.classList.toggle('visible', window.scrollY > 500);
  }
  window.addEventListener('scroll', updateScrollState, { passive: true });
  updateScrollState();

  // Mobile navigation.
  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      const isOpen = nav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
      navToggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
      document.body.classList.toggle('menu-open', isOpen);
    });
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', 'Open navigation menu');
        document.body.classList.remove('menu-open');
      });
    });
  }

  // Activate the current page in the shared navigation.
  const currentPage = document.body.dataset.page;
  document.querySelectorAll('.nav-link').forEach(function (link) {
    const href = link.getAttribute('href') || '';
    const page = href.split('/').pop().split('#')[0].replace('.html', '') || 'home';
    link.classList.toggle('active', page === currentPage);
  });

  // Smoothly scroll same-page anchors, including those in the footer.
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (event) {
      const id = anchor.getAttribute('href');
      if (!id || id === '#') return;
      const destination = document.querySelector(id);
      if (destination) {
        event.preventDefault();
        destination.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Fade items in as they enter the viewport.
  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealItems.length) {
    const revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -35px' });
    revealItems.forEach(function (item) { revealObserver.observe(item); });
  } else {
    revealItems.forEach(function (item) { item.classList.add('visible'); });
  }

  // Make broken remote placeholders fail gracefully while clearly indicating
  // the local path where a real photo can be dropped in later.
  document.querySelectorAll('img[data-placeholder]').forEach(function (image) {
    image.addEventListener('error', function () {
      image.classList.add('image-unavailable');
      image.alt = image.alt + ' (photo placeholder: ' + image.dataset.placeholder + ')';
    }, { once: true });
  });

  // Back to top.
  const backToTop = document.querySelector('.back-to-top');
  if (backToTop) {
    backToTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  }

  // Lightbox + previous/next controls. Every page can opt in with data-lightbox.
  const lightbox = document.querySelector('.lightbox');
  const tiles = Array.from(document.querySelectorAll('[data-lightbox]'));
  if (lightbox && tiles.length) {
    const lightboxImage = lightbox.querySelector('img');
    const caption = lightbox.querySelector('figcaption');
    const count = lightbox.querySelector('.lightbox-count');
    let activeIndex = 0;
    let lastFocused;

    function showImage(index) {
      activeIndex = (index + tiles.length) % tiles.length;
      const tile = tiles[activeIndex];
      const image = tile.querySelector('img');
      lightboxImage.src = tile.dataset.lightbox;
      lightboxImage.alt = image ? image.alt : 'Blueline Pools Kenya project';
      caption.textContent = tile.dataset.caption || lightboxImage.alt;
      count.textContent = (activeIndex + 1) + ' / ' + tiles.length;
    }
    function openLightbox(index) {
      lastFocused = document.activeElement;
      showImage(index);
      lightbox.classList.add('open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.classList.add('menu-open');
      lightbox.querySelector('.lightbox-close').focus();
    }
    function closeLightbox() {
      lightbox.classList.remove('open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('menu-open');
      if (lastFocused) lastFocused.focus();
    }
    tiles.forEach(function (tile, index) { tile.addEventListener('click', function () { openLightbox(index); }); });
    lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
    lightbox.querySelector('.lightbox-prev').addEventListener('click', function () { showImage(activeIndex - 1); });
    lightbox.querySelector('.lightbox-next').addEventListener('click', function () { showImage(activeIndex + 1); });
    lightbox.addEventListener('click', function (event) { if (event.target === lightbox) closeLightbox(); });
    document.addEventListener('keydown', function (event) {
      if (!lightbox.classList.contains('open')) return;
      if (event.key === 'Escape') closeLightbox();
      if (event.key === 'ArrowLeft') showImage(activeIndex - 1);
      if (event.key === 'ArrowRight') showImage(activeIndex + 1);
    });
  }

  // Gallery category filter on gallery.html.
  const filterButtons = document.querySelectorAll('.filter-button');
  const galleryItems = document.querySelectorAll('.full-gallery .gallery-tile');
  if (filterButtons.length && galleryItems.length) {
    filterButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        filterButtons.forEach(function (item) { item.classList.remove('active'); });
        button.classList.add('active');
        const filter = button.dataset.filter;
        galleryItems.forEach(function (item) {
          const matches = filter === 'all' || item.dataset.category === filter;
          item.classList.toggle('is-hidden', !matches);
        });
      });
    });
  }

  // Contact form: client-side required-field and Kenyan phone validation.
  const form = document.querySelector('#quote-form form');
  if (form) {
    const message = form.querySelector('.form-message');
    const phonePattern = /^(?:\+?254|0)\s?7\d{2}\s?\d{3}\s?\d{3}$/;
    function setInvalid(field, invalid) {
      const wrapper = field.closest('.form-field');
      if (wrapper) wrapper.classList.toggle('invalid', invalid);
    }
    function validateField(field) {
      let invalid = !field.value.trim();
      if (!invalid && field.name === 'phone') invalid = !phonePattern.test(field.value.replace(/[()-]/g, '').trim());
      setInvalid(field, invalid);
      return !invalid;
    }
    form.querySelectorAll('input, select, textarea').forEach(function (field) {
      field.addEventListener('blur', function () { validateField(field); });
      field.addEventListener('input', function () {
        if (field.closest('.form-field')?.classList.contains('invalid')) validateField(field);
      });
    });
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      const fields = Array.from(form.querySelectorAll('input[required], select[required], textarea[required]'));
      const valid = fields.map(validateField).every(Boolean);
      message.className = 'form-message';
      if (!valid) {
        message.textContent = 'Please check the highlighted fields and try again.';
        message.classList.add('error');
        const firstInvalid = form.querySelector('.invalid input, .invalid select, .invalid textarea');
        if (firstInvalid) firstInvalid.focus();
        return;
      }
      const name = form.querySelector('[name="name"]').value.trim();
      message.textContent = 'Thank you, ' + name + '. Your quote request is ready — our team will be in touch shortly.';
      message.classList.add('success');
      form.reset();
      form.querySelectorAll('.invalid').forEach(function (field) { field.classList.remove('invalid'); });
    });
  }

  // Keep the displayed year current without hard-coding it in every page.
  document.querySelectorAll('.current-year').forEach(function (year) { year.textContent = new Date().getFullYear(); });
}());
