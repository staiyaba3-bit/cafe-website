/* ==========================================================================
   Cafe Tesu - Interactive Behavior Script
   Phase 1
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Trigger Entry Animations
    // Allow a tiny delay for styles and fonts to paint, then add the loaded class
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);

    // 2. Scroll Detection for Sticky Glassmorphic Header
    const header = document.getElementById('main-header');
    const scrollThreshold = 50; // px

    function checkHeaderScroll() {
        if (window.scrollY > scrollThreshold) {
            header.classList.add('scrolled');
        } else {
            // Only remove scrolled if mobile menu isn't active
            if (!header.classList.contains('mobile-active')) {
                header.classList.remove('scrolled');
            }
        }
    }

    window.addEventListener('scroll', checkHeaderScroll);
    // Run once initially on load to handle pre-scrolled page refreshes
    checkHeaderScroll();

    // 3. Mobile Navigation Menu Toggle
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    function toggleMobileMenu() {
        const isExpanded = mobileToggle.getAttribute('aria-expanded') === 'true';
        mobileToggle.setAttribute('aria-expanded', !isExpanded);
        mobileToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        
        // Update header background when mobile menu is open
        if (navMenu.classList.contains('active')) {
            header.classList.add('mobile-active');
            header.classList.add('scrolled'); // Force glass background when menu is open
        } else {
            header.classList.remove('mobile-active');
            // Re-evaluate if we should remove the scrolled background based on scroll position
            if (window.scrollY <= scrollThreshold) {
                header.classList.remove('scrolled');
            }
        }
    }

    mobileToggle.addEventListener('click', toggleMobileMenu);

    // Close menu when clicking any nav link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu.classList.contains('active')) {
                toggleMobileMenu();
            }
        });
    });

    // Close menu when clicking outside of it
    document.addEventListener('click', (e) => {
        if (navMenu.classList.contains('active') && 
            !navMenu.contains(e.target) && 
            !mobileToggle.contains(e.target)) {
            toggleMobileMenu();
        }
    });

    // 3.5 Scroll Reveal Intersection Observer
    const revealElements = document.querySelectorAll('.scroll-reveal');
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Stop observing once revealed
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => {
        revealObserver.observe(el);
    });

    // 4. Demo Interactive Feedback & Book Table Modal
    const toast = document.getElementById('demo-toast');
    const toastClose = document.getElementById('toast-close-btn');
    const exploreButtons = [
        document.getElementById('cta-explore'),
        ...document.querySelectorAll('.btn-explore-menu')
    ];
    let toastTimeout;

    function showToast(message) {
        clearTimeout(toastTimeout);
        if (message) toast.querySelector('.toast-message').textContent = message;
        toast.classList.add('show');
        toastTimeout = setTimeout(hideToast, 4000);
    }
    function hideToast() {
        toast.classList.remove('show');
    }

    exploreButtons.forEach(btn => {
        if (btn) {
            btn.addEventListener('click', (e) => {
                if(btn.getAttribute('href') && btn.getAttribute('href').startsWith('#')) return; // let smooth scroll handle hash links
                e.preventDefault();
                showToast(`Viewing the full menu will be fully functional in Phase 2!`);
            });
        }
    });
    if (toastClose) toastClose.addEventListener('click', hideToast);

    // Book Table Modal Logic
    const bookingModal = document.getElementById('booking-modal');
    const bookingOverlay = document.getElementById('booking-modal-overlay');
    const bookingCloseBtn = document.getElementById('booking-close-btn');
    const bookingForm = document.getElementById('booking-form');
    const bookingSuccess = document.getElementById('booking-success');
    const bookButtons = [
        document.getElementById('cta-book'),
        ...document.querySelectorAll('.btn-book-table')
    ].filter(btn => btn && btn.id !== 'booking-submit'); // exclude the submit button inside form

    function openBookingModal(e) {
        if (e) e.preventDefault();
        bookingModal.classList.add('show');
        bookingModal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
        // Reset form state on open
        bookingForm.style.display = 'flex';
        bookingSuccess.classList.add('hidden');
        bookingForm.reset();
    }

    function closeBookingModal() {
        bookingModal.classList.remove('show');
        bookingModal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
    }

    bookButtons.forEach(btn => {
        if (btn) {
            // Check if it's the submit button to avoid hijacking form submission
            if (!btn.classList.contains('booking-submit')) {
                btn.addEventListener('click', openBookingModal);
            }
        }
    });

    if (bookingCloseBtn) bookingCloseBtn.addEventListener('click', closeBookingModal);
    if (bookingOverlay) bookingOverlay.addEventListener('click', closeBookingModal);

    // Handle ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && bookingModal && bookingModal.classList.contains('show')) {
            closeBookingModal();
        }
    });

    // Handle Form Submission (Bonus)
    if (bookingForm) {
        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            bookingForm.style.display = 'none';
            bookingSuccess.classList.remove('hidden');
            
            // Optional: Auto close after a few seconds
            setTimeout(closeBookingModal, 4000);
        });
    }

    // 5. Interactive Menu Tabs Logic
    const tabs = document.querySelectorAll(".menu-tab-btn");
    const panes = document.querySelectorAll(".menu-pane");

    function switchTab(index) {
        tabs.forEach(tab => tab.classList.remove("active"));
        panes.forEach(pane => {
            pane.classList.remove("active");
            pane.classList.remove("show");
        });

        tabs[index].classList.add("active");
        panes[index].classList.add("active");
        
        // Force reflow and add show for smooth transition
        panes[index].offsetHeight;
        panes[index].classList.add("show");
    }

    tabs.forEach((tab, index) => {
        tab.addEventListener("click", () => {
            switchTab(index);
        });
    });

    // 6. Automatic Storytelling Section Logic (Cinematic Auto-Fade Slideshow)
    const storySection = document.getElementById('storytelling');
    const storySlides = document.querySelectorAll('.story-slide');
    const storyDots = document.querySelectorAll('.story-dot');
    let storyIndex = 0;
    let storyInterval;

    function switchStorySlide(index) {
        if (storySlides.length === 0) return;
        
        storySlides.forEach(slide => {
            slide.classList.remove('active');
            // Reset opacity and visibility styles
            slide.style.opacity = '0';
            slide.style.visibility = 'hidden';
        });
        storyDots.forEach(dot => dot.classList.remove('active'));

        // Activate target slide
        const targetSlide = storySlides[index];
        targetSlide.classList.add('active');
        targetSlide.style.opacity = '1';
        targetSlide.style.visibility = 'visible';
        
        if (storyDots[index]) {
            storyDots[index].classList.add('active');
        }

        storyIndex = index;
    }

    function startStoryCycle() {
        stopStoryCycle(); // Safe clearance
        if (storySlides.length === 0) return;
        
        storyInterval = setInterval(() => {
            let nextIndex = (storyIndex + 1) % storySlides.length;
            switchStorySlide(nextIndex);
        }, 4000); // Auto-switch every 4 seconds
    }

    function stopStoryCycle() {
        clearInterval(storyInterval);
    }

    // Initialize slide dots interaction
    storyDots.forEach((dot, i) => {
        dot.addEventListener('click', () => {
            switchStorySlide(i);
            startStoryCycle(); // Reset countdown after manual navigation
        });
    });

    // Hover Controls: Pause cycling on hover, resume on leave
    if (storySection) {
        storySection.addEventListener("mouseenter", stopStoryCycle);
        storySection.addEventListener("mouseleave", startStoryCycle);
    }

    // Set first slide active on load
    if (storySlides.length > 0) {
        storySlides[0].style.opacity = '1';
        storySlides[0].style.visibility = 'visible';
        startStoryCycle();
    }

    // 7. Gallery Lightbox Logic
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightbox = document.getElementById('gallery-lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxClose = document.getElementById('lightbox-close-btn');

    if (galleryItems.length > 0 && lightbox) {
        galleryItems.forEach(item => {
            item.addEventListener('click', () => {
                const img = item.querySelector('.gallery-img');
                const src = item.getAttribute('data-src') || img.src;
                const captionText = img.getAttribute('alt') || '';

                // Load image in lightbox
                lightboxImg.src = src;
                lightboxCaption.textContent = captionText;

                // Open lightbox
                lightbox.classList.add('show');
                lightbox.setAttribute('aria-hidden', 'false');
                document.body.classList.add('lightbox-open');
            });
        });

        const closeLightbox = () => {
            lightbox.classList.remove('show');
            lightbox.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('lightbox-open');
            // Clear src after fade transition finishes to avoid flash on next open
            setTimeout(() => {
                lightboxImg.src = '';
                lightboxCaption.textContent = '';
            }, 500);
        };

        // Close button click
        lightboxClose.addEventListener('click', closeLightbox);

        // Click outside lightbox content (backdrop)
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox || e.target.classList.contains('lightbox-content-wrapper')) {
                closeLightbox();
            }
        });

        // ESC key close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lightbox.classList.contains('show')) {
                closeLightbox();
            }
        });
    }


    // 9. Parallax scroll effect for Hero Content
    window.addEventListener("scroll", () => {
        const scrollY = window.scrollY;
        const heroContent = document.querySelector(".hero-content");

        if (heroContent) {
            heroContent.style.transform = `translateY(${scrollY * 0.2}px)`;
        }
    });
});
