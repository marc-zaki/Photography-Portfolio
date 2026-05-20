/* ==========================================================================
   MARK Z. PHOTOGRAPHY PORTFOLIO - CORE INTERACTION LOGIC
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. CUSTOM CURSOR TRACKER
    // ==========================================
    const cursorDot = document.getElementById('custom-cursor-dot');
    const cursorRing = document.getElementById('custom-cursor-ring');
    const hoverTargets = document.querySelectorAll('.hover-target, a, button, select, input, textarea');

    let mouseX = 0;
    let mouseY = 0;
    let ringX = 0;
    let ringY = 0;

    // Track mouse coordinates
    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Immediate position for the center dot
        if (cursorDot) {
            cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
        }
    });

    // Smooth lag animation for the outer ring
    function animateCursorRing() {
        // Linear interpolation (lerp) for smooth trailing effect
        ringX += (mouseX - ringX) * 0.15;
        ringY += (mouseY - ringY) * 0.15;

        if (cursorRing) {
            cursorRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
        }

        requestAnimationFrame(animateCursorRing);
    }
    animateCursorRing();

    // Hover states to scale the outer ring
    hoverTargets.forEach(target => {
        target.addEventListener('mouseenter', () => {
            if (cursorRing) cursorRing.classList.add('cursor-hover');
        });
        target.addEventListener('mouseleave', () => {
            if (cursorRing) cursorRing.classList.remove('cursor-hover');
        });
    });


    // ==========================================
    // 2. STICKY NAVBAR & MOBILE MENU TOGGLE
    // ==========================================
    const navbar = document.getElementById('navbar');
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Sticky scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        // Highlight active link on scroll
        let currentSection = '';
        const sections = document.querySelectorAll('section');
        const scrollPosition = window.scrollY + 120; // offset

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSection = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    });

    // Mobile hamburger toggle
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('open');
            navMenu.classList.toggle('open');
        });
    }

    // Close menu when clicking links
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (menuToggle && navMenu) {
                menuToggle.classList.remove('open');
                navMenu.classList.remove('open');
            }
        });
    });


    // ==========================================
    // 3. SCROLL REVEAL & STATS COUNTER
    // ==========================================
    const revealElements = document.querySelectorAll('.scroll-reveal');
    let statsAnimated = false;

    // Intersection Observer for scroll triggers
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-active');
                
                // If it is the experience section and stats are not yet animated
                if (entry.target.classList.contains('experience-stats') && !statsAnimated) {
                    animateStats();
                    statsAnimated = true;
                }
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(element => {
        revealObserver.observe(element);
    });

    // Stats counter trigger
    function animateStats() {
        const statNumbers = document.querySelectorAll('.stat-number');
        statNumbers.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-target'), 10);
            const duration = 2000; // 2 seconds
            const stepTime = Math.abs(Math.floor(duration / target));
            let current = 0;
            
            const timer = setInterval(() => {
                current += 1;
                stat.textContent = current;
                if (current >= target) {
                    stat.textContent = target;
                    clearInterval(timer);
                }
            }, stepTime);
        });
    }


    // ==========================================
    // 4. PORTFOLIO FILTERING LOGIC
    // ==========================================
    const filterButtons = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const filterValue = button.getAttribute('data-filter');

            portfolioItems.forEach(item => {
                const category = item.getAttribute('data-category');
                
                if (filterValue === 'all' || category === filterValue) {
                    item.classList.remove('filtered-out');
                    // Add delay to sync with CSS display transition
                    setTimeout(() => {
                        item.classList.add('filtered-in');
                    }, 10);
                } else {
                    item.classList.remove('filtered-in');
                    item.classList.add('filtered-out');
                }
            });
        });
    });


    // ==========================================
    // 5. LIGHTBOX MODAL NAVIGATION
    // ==========================================
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxClose = document.getElementById('lightbox-close');
    const lightboxPrev = document.getElementById('lightbox-prev');
    const lightboxNext = document.getElementById('lightbox-next');
    const lightboxTitle = document.getElementById('lightbox-title');
    const lightboxCategory = document.getElementById('lightbox-category');
    const lightboxLocation = document.getElementById('lightbox-location');
    const lightboxSettings = document.getElementById('lightbox-settings');

    let currentGalleryItems = [];
    let currentImgIndex = 0;

    // Open Lightbox
    portfolioItems.forEach(item => {
        item.addEventListener('click', () => {
            // Find current active (filtered) items in order
            const activeFilter = document.querySelector('.filter-btn.active').getAttribute('data-filter');
            currentGalleryItems = Array.from(portfolioItems).filter(el => {
                return activeFilter === 'all' || el.getAttribute('data-category') === activeFilter;
            });

            // Set index of clicked item
            currentImgIndex = currentGalleryItems.indexOf(item);
            
            updateLightboxContent();
            
            if (lightbox) {
                lightbox.classList.add('active');
                lightbox.setAttribute('aria-hidden', 'false');
                document.body.style.overflow = 'hidden'; // Lock background scrolling
            }
        });
    });

    // Update Lightbox Display
    function updateLightboxContent() {
        const item = currentGalleryItems[currentImgIndex];
        if (!item || !lightboxImg) return;

        const imgElement = item.querySelector('.portfolio-img');
        // Extract original image source
        const imgSrc = imgElement.getAttribute('src');
        const imgTitle = item.getAttribute('data-title') || '';
        const imgCategory = item.getAttribute('data-category') || '';
        const imgSettings = item.getAttribute('data-settings') || '';
        const imgLocation = item.getAttribute('data-location') || '';

        // Animate image container scaling on update
        lightboxImg.style.opacity = '0';
        lightboxImg.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            lightboxImg.setAttribute('src', imgSrc);
            lightboxImg.setAttribute('alt', imgTitle);
            
            if (lightboxTitle) lightboxTitle.textContent = imgTitle;
            if (lightboxCategory) lightboxCategory.textContent = imgCategory.toUpperCase();
            if (lightboxLocation) lightboxLocation.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${imgLocation}`;
            if (lightboxSettings) lightboxSettings.textContent = imgSettings;
            
            lightboxImg.style.opacity = '1';
            lightboxImg.style.transform = 'scale(1)';
        }, 150);
    }

    // Close Lightbox
    const closeLightboxModal = () => {
        if (lightbox) {
            lightbox.classList.remove('active');
            lightbox.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = 'auto'; // Unlock background scrolling
        }
    };

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightboxModal);
    
    // Close on click outside content
    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightboxModal();
            }
        });
    }

    // Next/Prev navigation
    const showNextImage = () => {
        if (currentGalleryItems.length <= 1) return;
        currentImgIndex = (currentImgIndex + 1) % currentGalleryItems.length;
        updateLightboxContent();
    };

    const showPrevImage = () => {
        if (currentGalleryItems.length <= 1) return;
        currentImgIndex = (currentImgIndex - 1 + currentGalleryItems.length) % currentGalleryItems.length;
        updateLightboxContent();
    };

    if (lightboxNext) lightboxNext.addEventListener('click', showNextImage);
    if (lightboxPrev) lightboxPrev.addEventListener('click', showPrevImage);

    // Keyboard Nav (Left, Right, Escape)
    window.addEventListener('keydown', (e) => {
        if (!lightbox || !lightbox.classList.contains('active')) return;
        
        if (e.key === 'Escape') closeLightboxModal();
        if (e.key === 'ArrowRight') showNextImage();
        if (e.key === 'ArrowLeft') showPrevImage();
    });


    // ==========================================
    // 6. CONTACT FORM & FLOATING LABEL INTERACTIONS
    // ==========================================
    const contactForm = document.getElementById('contactForm');
    const formInputs = document.querySelectorAll('.form-input');
    const toast = document.getElementById('toast-notification');

    // Double check active state on labels
    formInputs.forEach(input => {
        // Toggle active label class based on input values
        input.addEventListener('blur', () => {
            if (input.value !== '') {
                input.nextElementSibling.classList.add('active');
            } else {
                input.nextElementSibling.classList.remove('active');
            }
        });
        
        // Handle select element default labels
        if (input.tagName === 'SELECT') {
            input.nextElementSibling.classList.add('active');
        }
    });

    // Handle form submission response
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const submitBtn = contactForm.querySelector('.btn-submit');
            const originalBtnContent = submitBtn.innerHTML;
            
            // Loading state feedback
            submitBtn.disabled = true;
            submitBtn.innerHTML = `Sending... <i class="fa-solid fa-circle-notch fa-spin"></i>`;
            
            // Build the form data payload as JSON for the AJAX endpoint
            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData.entries());
            
            // Send actual network request using FormSubmit AJAX API
            fetch("https://formsubmit.co/ajax/sherifmark759@gmail.com", {
                method: "POST",
                body: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            })
            .then(response => {
                if (!response.ok) {
                    return response.text().then(text => {
                        let errMsg = `Server returned status ${response.status}`;
                        try {
                            const parsed = JSON.parse(text);
                            if (parsed.message) errMsg += `: ${parsed.message}`;
                        } catch (e) {
                            if (text) errMsg += `: ${text.substring(0, 150)}`;
                        }
                        throw new Error(errMsg);
                    });
                }
                return response.json();
            })
            .then(data => {
                // Restore button state
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnContent;
                
                // FormSubmit can return {"success":"true"} or {"success":true}
                if (data.success === "true" || data.success === true) {
                    // Show floating Toast alert notification
                    if (toast) {
                        toast.classList.add('active');
                        
                        // Auto-hide toast after 4 seconds
                        setTimeout(() => {
                            toast.classList.remove('active');
                        }, 4000);
                    }

                    // Reset form values
                    contactForm.reset();
                    
                    // Reset floating label states
                    formInputs.forEach(input => {
                        if (input.tagName !== 'SELECT') {
                            input.nextElementSibling.classList.remove('active');
                        }
                    });
                } else {
                    alert("Submission failed: " + (data.message || "Please check your form details and try again."));
                }
            })
            .catch(error => {
                // Restore button state
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnContent;
                console.error("FormSubmit Error:", error);
                
                let friendlyMsg = "An error occurred while sending your inquiry.\n\n";
                if (error.message.includes("Failed to fetch") || error.name === "TypeError") {
                    friendlyMsg += "The request failed to reach the server. This is frequently caused by adblockers (like Brave Shields, uBlock Origin) blocking third-party form processors. Please try disabling your adblocker for this site, or contact me directly via email.";
                } else {
                    friendlyMsg += error.message + "\n\nPlease try again or contact me directly via email.";
                }
                alert(friendlyMsg);
            });
        });
    }

});
