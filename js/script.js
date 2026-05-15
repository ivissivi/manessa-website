/* =========================================================
   MANESSA - Forest Management Portfolio
   Main JavaScript: navigation, reveals, counters, form
   ========================================================= */

(function () {
    'use strict';

    /* ----------  PRELOADER  ---------- */
    window.addEventListener('load', () => {
        const preloader = document.getElementById('preloader');
        if (!preloader) return;
        setTimeout(() => preloader.classList.add('hidden'), 400);
    });

    /* ----------  YEAR  ---------- */
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    /* ----------  HEADER ON SCROLL  ---------- */
    const header = document.getElementById('header');
    const backToTop = document.getElementById('back-to-top');
    const heroScroll = document.querySelector('.hero-scroll');

    const onScroll = () => {
        const y = window.scrollY;
        if (header) header.classList.toggle('scrolled', y > 60);
        if (backToTop) backToTop.classList.toggle('visible', y > 600);
        if (heroScroll) heroScroll.classList.toggle('hidden', y > 30);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    const getScrollOffset = () => (header ? header.offsetHeight + 16 : 92);

    const scrollToTarget = (target, behavior = 'smooth') => {
        const offset = getScrollOffset();
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        let top = target.getBoundingClientRect().top + window.scrollY - offset;

        if (top > maxScroll) {
            const elemH = target.offsetHeight;
            const vh = window.innerHeight;
            if (elemH < vh - offset) {
                top = target.offsetTop - (vh - elemH) * 0.28;
            }
        }

        top = Math.max(0, Math.min(top, maxScroll));
        window.scrollTo({ top, behavior });
    };

    /* ----------  ANCHOR SCROLL (header offset + bottom sections)  ---------- */
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
        link.addEventListener('click', (e) => {
            const hash = link.getAttribute('href');
            if (!hash || hash.length < 2) return;

            const target = document.querySelector(hash);
            if (!target) return;

            e.preventDefault();
            scrollToTarget(target, 'smooth');

            if (history.pushState) {
                history.pushState(null, '', hash);
            } else {
                location.hash = hash;
            }
        });
    });

    /* ----------  MOBILE NAVIGATION  ---------- */
    const navToggle = document.getElementById('nav-toggle');
    const nav = document.getElementById('nav');

    if (navToggle && nav) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            nav.classList.toggle('active');
            document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
        });

        nav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('active');
                nav.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    /* ----------  REVEAL ON SCROLL  ---------- */
    const revealEls = document.querySelectorAll('.reveal');

    if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry, idx) => {
                if (entry.isIntersecting) {
                    setTimeout(() => entry.target.classList.add('visible'),
                        Array.from(entries).indexOf(entry) * 80);
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

        revealEls.forEach(el => io.observe(el));
    } else {
        revealEls.forEach(el => el.classList.add('visible'));
    }

    /* ----------  ANIMATED COUNTERS  ---------- */
    const counters = document.querySelectorAll('[data-count]');

    const animateCount = (el) => {
        const target = parseInt(el.dataset.count, 10);
        if (Number.isNaN(target)) return;

        const duration = 1800;
        const start = performance.now();

        const tick = (now) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(eased * target);
            el.textContent = current.toLocaleString('lv-LV');
            if (progress < 1) requestAnimationFrame(tick);
            else el.textContent = target.toLocaleString('lv-LV');
        };
        requestAnimationFrame(tick);
    };

    if ('IntersectionObserver' in window) {
        const cio = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCount(entry.target);
                    cio.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        counters.forEach(c => cio.observe(c));
    } else {
        counters.forEach(animateCount);
    }

    /* ----------  CONTACT FORM (demo)  ---------- */
    const form = document.getElementById('contact-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const submitBtn = form.querySelector('button[type="submit"]');
            const originalHTML = submitBtn.innerHTML;

            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.7';
            submitBtn.innerHTML = 'Nosūtām...';

            setTimeout(() => {
                submitBtn.innerHTML = '✓ Pieteikums nosūtīts!';
                submitBtn.style.background = 'var(--color-mint-dark)';

                setTimeout(() => {
                    form.reset();
                    submitBtn.innerHTML = originalHTML;
                    submitBtn.disabled = false;
                    submitBtn.style.opacity = '1';
                    submitBtn.style.background = '';
                }, 2400);
            }, 900);
        });
    }

    /* ----------  SMOOTH ACTIVE LINK  ---------- */
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    const setActiveLink = () => {
        const scrollPos = window.scrollY + 120;
        sections.forEach(sec => {
            const top = sec.offsetTop;
            const height = sec.offsetHeight;
            const id = sec.id;

            if (scrollPos >= top && scrollPos < top + height) {
                navLinks.forEach(l => {
                    l.classList.toggle('active', l.getAttribute('href') === '#' + id);
                });
            }
        });
    };

    window.addEventListener('scroll', setActiveLink, { passive: true });

    /* ----------  HERO PARALLAX  ---------- */
    const heroBg = document.querySelector('.hero-bg');
    if (heroBg && window.matchMedia('(min-width: 768px)').matches) {
        window.addEventListener('scroll', () => {
            const y = window.scrollY;
            if (y < window.innerHeight) {
                heroBg.style.transform = `scale(1.05) translateY(${y * 0.25}px)`;
            }
        }, { passive: true });
    }
})();
