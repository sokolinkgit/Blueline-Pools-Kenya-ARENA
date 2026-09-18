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

  // --- Home project slideshow (minimized preview of the portfolio) ---
  const viewport = document.querySelector('.project-slideshow .slideshow-viewport');
  if (viewport) {
    const slides = Array.from(viewport.querySelectorAll('.slide'));
    const dotsWrap = document.querySelector('.project-slideshow .slide-dots');
    let slideIndex = 0;
    let slideTimer = null;
    const slideInterval = 2000;

    function renderDots() {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = '';
      slides.forEach(function (_, i) {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'slide-dot' + (i === slideIndex ? ' active' : '');
        dot.setAttribute('aria-label', 'Go to project ' + (i + 1));
        dot.addEventListener('click', function () { goTo(i); restartTimer(); });
        dotsWrap.appendChild(dot);
      });
    }

    function goTo(index) {
      slideIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === slideIndex);
      });
      dotsWrap.querySelectorAll('.slide-dot').forEach(function (dot, i) {
        dot.classList.toggle('active', i === slideIndex);
      });
    }

    function restartTimer() {
      if (slideTimer) clearInterval(slideTimer);
      slideTimer = setInterval(function () { goTo(slideIndex + 1); }, slideInterval);
    }

    const prev = viewport.parentElement.querySelector('.slide-control[data-dir="prev"]');
    const next = viewport.parentElement.querySelector('.slide-control[data-dir="next"]');
    if (prev) prev.addEventListener('click', function () { goTo(slideIndex - 1); restartTimer(); });
    if (next) next.addEventListener('click', function () { goTo(slideIndex + 1); restartTimer(); });

    renderDots();
    restartTimer();

    // Pause auto-play while the visitor hovers or the tab is hidden.
    viewport.addEventListener('mouseenter', function () { if (slideTimer) clearInterval(slideTimer); });
    viewport.addEventListener('mouseleave', restartTimer);
    document.addEventListener('visibilitychange', function () {
      if (document.hidden && slideTimer) clearInterval(slideTimer);
      else if (!document.hidden) restartTimer();
    });
  }

  // --- Testimonials: render, filter by region and load more ---
  const reviewsGrid = document.getElementById('reviews-grid');
  if (reviewsGrid && Array.isArray(window.BLUELINE_REVIEWS)) {
    const reviews = window.BLUELINE_REVIEWS;
    const tabs = Array.from(document.querySelectorAll('.region-tab'));
    const loadMore = document.getElementById('load-more');
    const PAGE_SIZE = 12;
    let activeRegion = 'all';
    let shown = PAGE_SIZE;

    const initialsOf = function (name) {
      return name.split(' ').map(function (w) { return w.charAt(0); }).slice(0, 2).join('').toUpperCase();
    };
    const starsOf = function (n) { return '\u2605'.repeat(n) + '\u2606'.repeat(5 - n); };

    function filtered() {
      return activeRegion === 'all' ? reviews : reviews.filter(function (r) { return r.region === activeRegion; });
    }

    function renderCard(r) {
      const card = document.createElement('article');
      card.className = 'review-card reveal visible';
      card.dataset.region = r.region;
      const avatar = document.createElement('span');
      avatar.className = 'review-avatar';
      avatar.textContent = initialsOf(r.name);
      const region = document.createElement('span');
      region.className = 'review-region';
      region.textContent = r.region;
      const stars = document.createElement('div');
      stars.className = 'review-stars';
      stars.setAttribute('aria-label', r.stars + ' out of 5 stars');
      stars.textContent = starsOf(r.stars);
      const body = document.createElement('p');
      body.textContent = '\u201C' + r.text + '\u201D';
      const reviewer = document.createElement('div');
      reviewer.className = 'reviewer';
      const meta = document.createElement('div');
      const name = document.createElement('strong');
      name.textContent = r.name;
      const place = document.createElement('small');
      place.textContent = r.place + ', ' + r.region + ' \u00B7 ' + r.service;
      meta.appendChild(name);
      meta.appendChild(place);
      reviewer.appendChild(avatar);
      reviewer.appendChild(meta);
      card.appendChild(stars);
      card.appendChild(region);
      card.appendChild(body);
      card.appendChild(reviewer);
      return card;
    }

    function render() {
      const list = filtered();
      const visible = list.slice(0, shown);
      reviewsGrid.innerHTML = '';
      visible.forEach(function (r) { reviewsGrid.appendChild(renderCard(r)); });
      if (loadMore) {
        loadMore.style.display = visible.length < list.length ? '' : 'none';
      }
    }

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        tabs.forEach(function (t) { t.classList.remove('active'); });
        tab.classList.add('active');
        activeRegion = tab.dataset.region;
        shown = PAGE_SIZE;
        render();
      });
    });

    if (loadMore) {
      loadMore.addEventListener('click', function () {
        shown += PAGE_SIZE;
        render();
      });
    }

    render();
  }
}());
