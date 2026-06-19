/* =========================================================
   MANESSA - Forest Management Portfolio
   Main JavaScript: navigation, reveals, counters, form
   ========================================================= */

(function () {
    'use strict';

    const PAGE_ID = document.body.dataset.page || '';
    const IS_HOME = PAGE_ID === 'home';

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
        if (header && IS_HOME) header.classList.toggle('scrolled', y > 60);
        if (backToTop) backToTop.classList.toggle('visible', y > 600);
        if (heroScroll) heroScroll.classList.toggle('hidden', y > 30);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* ----------  ACTIVE NAV (multi-page)  ---------- */
    const navLinks = document.querySelectorAll('.nav-link[data-nav]');
    navLinks.forEach((link) => {
        link.classList.toggle('active', link.dataset.nav === PAGE_ID);
    });

    /* ----------  SAME-PAGE ANCHOR SCROLL  ---------- */
    const getScrollOffset = () => (header ? header.offsetHeight + 16 : 92);

    document.querySelectorAll('a[href^="#"]').forEach((link) => {
        link.addEventListener('click', (e) => {
            const hash = link.getAttribute('href');
            if (!hash || hash.length < 2) return;

            const target = document.querySelector(hash);
            if (!target) return;

            e.preventDefault();
            const offset = getScrollOffset();
            const top = Math.max(
                0,
                target.getBoundingClientRect().top + window.scrollY - offset
            );
            window.scrollTo({ top, behavior: 'smooth' });

            if (history.pushState) {
                history.pushState(null, '', hash);
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

        nav.querySelectorAll('a').forEach((link) => {
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
            const visible = entries.filter((e) => e.isIntersecting);
            visible
                .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
                .forEach((entry, idx) => {
                    setTimeout(() => entry.target.classList.add('visible'), idx * 80);
                    io.unobserve(entry.target);
                });
        }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

        revealEls.forEach((el) => io.observe(el));
    } else {
        revealEls.forEach((el) => el.classList.add('visible'));
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
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    animateCount(entry.target);
                    cio.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        counters.forEach((c) => cio.observe(c));
    } else {
        counters.forEach(animateCount);
    }

    /* ----------  PIETEIKUMA FORMA  ---------- */
    const form = document.getElementById('contact-form');
    if (form) {
        /* Honeypot - tikai JS, lai cilvēki neredzētu (CSS slēpšana nestrādāja uzticami) */
        let honeypotInput = null;
        if (!form.querySelector('[data-honeypot]')) {
            honeypotInput = document.createElement('input');
            honeypotInput.type = 'text';
            honeypotInput.name = 'website';
            honeypotInput.setAttribute('data-honeypot', 'true');
            honeypotInput.tabIndex = -1;
            honeypotInput.autocomplete = 'off';
            honeypotInput.setAttribute('aria-hidden', 'true');
            honeypotInput.style.cssText =
                'position:fixed;left:-10000px;top:0;width:1px;height:1px;opacity:0;pointer-events:none;';
            form.appendChild(honeypotInput);
        } else {
            honeypotInput = form.querySelector('[data-honeypot]');
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        const statusEl = document.getElementById('form-status');
        const originalHTML = submitBtn ? submitBtn.innerHTML : '';

        const setStatus = (message, type) => {
            if (!statusEl) {
                return;
            }
            statusEl.textContent = message;
            statusEl.hidden = !message;
            statusEl.classList.remove('is-error', 'is-success');
            if (type) {
                statusEl.classList.add(type === 'error' ? 'is-error' : 'is-success');
            }
        };

        const setSubmitting = (loading) => {
            if (!submitBtn) {
                return;
            }
            submitBtn.disabled = loading;
            submitBtn.style.opacity = loading ? '0.7' : '1';
            submitBtn.innerHTML = loading ? 'Nosūtām...' : originalHTML;
            if (!loading) {
                submitBtn.style.background = '';
            }
        };

        /* --- Lauku līmeņa validācija ar ziņām --- */
        const FIELDS = ['name', 'phone', 'email'];
        const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

        const setFieldError = (field, message) => {
            const input = form[field];
            const errEl = document.getElementById(`${field}-error`);
            if (input) {
                input.classList.toggle('has-error', Boolean(message));
                input.setAttribute('aria-invalid', message ? 'true' : 'false');
            }
            if (errEl) {
                errEl.textContent = message || '';
                errEl.hidden = !message;
            }
        };

        const clearFieldErrors = () => FIELDS.forEach((f) => setFieldError(f, ''));

        const validateClient = (p) => {
            const errors = {};
            if (!p.name.trim()) {
                errors.name = 'Lūdzu ievadiet vārdu, uzvārdu.';
            }
            if (!p.phone.trim()) {
                errors.phone = 'Lūdzu ievadiet tālruņa numuru.';
            } else if (!/^[\d\s+()-]+$/.test(p.phone.trim()) || !/\d/.test(p.phone)) {
                errors.phone = 'Lūdzu ievadiet derīgu tālruņa numuru (tikai cipari).';
            }
            if (p.email.trim() && !EMAIL_RE.test(p.email.trim())) {
                errors.email = 'Lūdzu ievadiet derīgu e-pasta adresi (piem., vards@piemers.lv).';
            }
            return errors;
        };

        /* Notīra lauka kļūdu, tiklīdz lietotājs sāk labot */
        FIELDS.forEach((f) => {
            const input = form[f];
            if (input) {
                input.addEventListener('input', () => {
                    if (input.classList.contains('has-error')) setFieldError(f, '');
                });
            }
        });

        const showErrors = (errors) => {
            FIELDS.forEach((f) => setFieldError(f, errors[f] || ''));
            const firstField = FIELDS.find((f) => errors[f]);
            if (firstField && form[firstField]) form[firstField].focus();
        };

        /* Ziņas lauka simbolu skaitītājs */
        const messageEl = form.message;
        const counterEl = document.getElementById('message-counter');
        if (messageEl && counterEl) {
            const maxLen = Number(messageEl.getAttribute('maxlength')) || 5000;
            const updateCounter = () => {
                const len = messageEl.value.length;
                counterEl.textContent = `${len} / ${maxLen}`;
                counterEl.classList.toggle('is-limit', len >= maxLen);
            };
            messageEl.addEventListener('input', updateCounter);
            updateCounter();
        }

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            setStatus('');
            clearFieldErrors();

            const payload = {
                name: form.name?.value ?? '',
                phone: form.phone?.value ?? '',
                email: form.email?.value ?? '',
                service: form.service?.value ?? '',
                kadastrs: form.kadastrs?.value ?? '',
                message: form.message?.value ?? '',
                website: honeypotInput?.value ?? '',
            };

            const clientErrors = validateClient(payload);
            if (Object.keys(clientErrors).length > 0) {
                showErrors(clientErrors);
                setStatus('Lūdzu izlabojiet iezīmētos laukus.', 'error');
                return;
            }

            setSubmitting(true);

            try {
                const response = await fetch('/api/pieteikums', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                    body: JSON.stringify(payload),
                });

                const data = await response.json().catch(() => ({}));

                if (!response.ok) {
                    if (data.errors && typeof data.errors === 'object') {
                        showErrors(data.errors);
                    }
                    const errMsg =
                        data.error ||
                        (data.errors && 'Lūdzu izlabojiet iezīmētos laukus.') ||
                        'Neizdevās nosūtīt. Mēģiniet vēlāk.';
                    setStatus(errMsg, 'error');
                    setSubmitting(false);
                    return;
                }

                setStatus(data.message || 'Paldies! Jūsu pieteikums ir nosūtīts.', 'success');
                if (submitBtn) {
                    submitBtn.innerHTML = '✓ Nosūtīts!';
                    submitBtn.style.background = 'var(--color-mint-dark)';
                }
                form.reset();
                messageEl?.dispatchEvent(new Event('input'));

                setTimeout(() => {
                    setSubmitting(false);
                    setStatus('');
                }, 4000);
            } catch {
                setStatus(
                    'Savienojuma kļūda. Pārbaudiet internetu vai sazinieties tieši.',
                    'error'
                );
                setSubmitting(false);
            }
        });
    }

    /* ----------  HERO PARALLAX (home only)  ---------- */
    const heroBg = document.querySelector('.hero-bg');
    if (IS_HOME && heroBg && window.matchMedia('(min-width: 768px)').matches) {
        window.addEventListener('scroll', () => {
            const y = window.scrollY;
            if (y < window.innerHeight) {
                heroBg.style.transform = `scale(1.05) translateY(${y * 0.25}px)`;
            }
        }, { passive: true });
    }
})();
