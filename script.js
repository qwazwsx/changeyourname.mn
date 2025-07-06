/* global confetti */

// Main JavaScript functionality for changeyourname.mn
document.addEventListener('DOMContentLoaded', () => {
    document.fonts.ready.then(() => {
        document.body.classList.remove('loading');
    });

    // NAVIGATION BAR FUNCTIONALITY
    const menuButton = document.getElementById('menuButton');
    const navDrawer = document.getElementById('navDrawer');
    const navOverlay = document.getElementById('navOverlay');

    function openDrawer() {
        navDrawer.classList.add('open');
        navOverlay.classList.add('visible');
        document.body.style.overflow = 'hidden';
    }

    function closeDrawer() {
        navDrawer.classList.remove('open');
        navOverlay.classList.remove('visible');
        document.body.style.overflow = '';
    }

    // Make closeNav available globally for nav links
    // onclick="window.closeNav()"
    window.closeNav = closeDrawer;

    menuButton.addEventListener('click', openDrawer);
    navOverlay.addEventListener('click', closeDrawer);

    // Close drawer on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navDrawer.classList.contains('open')) {
            closeDrawer();
        }
    });

    // ASSUMPTIONS CHECKLIST
    document.querySelectorAll('.assumption-item md-checkbox').forEach(checkbox => {
        const assumptionId = checkbox.id.replace('assumption-', '');
        const detailsElement = document.getElementById(`details-${assumptionId}`);

        checkbox.checked = true; // Ensure checkbox is checked by default

        // Set initial state - details hidden when checked
        if (checkbox.checked && detailsElement) {
            detailsElement.classList.remove('visible');
        }

        // show details when unchecked
        checkbox.addEventListener('change', (e) => {
            if (detailsElement) {
                if (e.target.checked) {
                    // Hide details when checked
                    detailsElement.classList.remove('visible');
                } else {
                    // Show details when unchecked
                    detailsElement.classList.add('visible');
                }
            }
        });
    })



    // SECTION COLLAPSING
    document.querySelectorAll('.section-header-buttons button.collapse').forEach(button => {
        // Initialize the DOM state, just in case the section is not collapsed
        button.setAttribute('aria-expanded', 'false');
        button.querySelector('.material-symbols-outlined').textContent = 'expand_more';
        button.closest('.guide-section').classList.remove('collapsed');
        button.closest('.guide-section').querySelector('.section-content').classList.remove('collapsed');

        button.addEventListener('click', () => {
            const section = button.closest('.guide-section');
            const content = section.querySelector('.section-content');

            section.classList.toggle('collapsed');
            content.classList.toggle('collapsed');
            let isCollapsed = content.classList.contains('collapsed');

            // Toggle the section content visibility
            button.querySelector('.material-symbols-outlined').textContent =
                isCollapsed ? 'expand_more' : 'expand_less';

            if (isCollapsed) {
                button.setAttribute('aria-expanded', 'false');
            } else {
                button.setAttribute('aria-expanded', 'true');
            }
        });
    });

    // SECTION DONE BUTTONS
    document.querySelectorAll('.section-header-buttons button.done').forEach(button => {
        button.addEventListener('click', () => {

            let txt = button.querySelector('.material-symbols-outlined').textContent
            button.querySelector('.material-symbols-outlined').textContent =
                txt == 'check' ? 'done_outline' : 'check';
        });
    });



    // Save and load functionality for form elements
    document.querySelectorAll('.saveable').forEach(element => {
        // Load saved value from localStorage or cookies
        const savedValue = load(element.id) === 'true' ? true : false

        // Apply the saved value to the element
        element.value = savedValue;
        element.checked = savedValue

        // update nav bar
        document.querySelector('.nav-drawer nav-item')


        if (element.tagName === 'INPUT') {
            element.addEventListener('change', () => {
                // Save the value when it changes
                save(element);
                playClick();

            })
        } else if (element.tagName === 'MD-CHECKBOX') {
            element.addEventListener('change', () => {
                // Save the value when it changes
                save(element.id, element.checked);
                playClick();
            });
        }
    })

    // Play click sound
    function playClick() {
        const audio = new Audio('resources/click.mp3');
        audio.play();
    }


    // saves the value of an element (or specified ID and value) to local storage AND cookies
    function save(id, value) {
        if (typeof id === 'object' && id !== null) {
            id = id.id;
            value = id.value;
        }

        // Save to localStorage
        localStorage.setItem(id, value);
        // Save to cookies
        document.cookie = `${id}=${value}; path=/; max-age=31536000`; // 1 year
    }

    // load the value of an element from localstorage or cookies
    function load(id) {
        // Load from localStorage
        let value = localStorage.getItem(id);
        if (value === null) {
            // If not found in localStorage, try cookies
            const cookies = document.cookie.split('; ');
            for (let cookie of cookies) {
                const [key, val] = cookie.split('=');
                if (key === id) {
                    value = val;
                    break;
                }
            }
        }
        return value;
    }

    // Smooth scrolling for anchor links with nav bar offset
    document.addEventListener('click', (e) => {
        // Check if the clicked element or its parent is an anchor with hash
        const link = e.target.closest('a[href^="#"]');
        if (link) {
            const href = link.getAttribute('href');
            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);

            // console.log(`Attempting to scroll to: ${targetId}`, targetElement);

            if (targetElement && targetId) {
                // Prevent all default behaviors
                e.preventDefault();
                // e.stopPropagation();
                // e.stopImmediatePropagation();

                // Calculate offset for sticky nav bar
                const appBar = document.querySelector('.app-bar');
                const offset = appBar ? appBar.offsetHeight + 24 : 100; // 24px extra padding

                // Close navigation drawer if open
                if (navDrawer && navDrawer.classList.contains('open')) {
                    closeDrawer();
                }

                // Wait a tiny bit for nav drawer to start closing, then scroll
                setTimeout(() => {
                    // Get the target position
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - offset;

                    // Smooth scroll to position
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }, 50);

            }
        }
    });

    // Celebration Button Functionality
    const celebrationButton = document.getElementById('celebrationButton');
    const moreConfetti = document.getElementById('moreConfetti');
    const audio = new Audio('resources/celebrate.mp3');
    navigator.mediaSession.setActionHandler('play', function () { /* Code excerpted. */ });
    navigator.mediaSession.setActionHandler('pause', function () { /* Code excerpted. */ });
    navigator.mediaSession.setActionHandler('seekbackward', function () { /* Code excerpted. */ });
    navigator.mediaSession.setActionHandler('seekforward', function () { /* Code excerpted. */ });
    navigator.mediaSession.setActionHandler('previoustrack', function () { /* Code excerpted. */ });
    navigator.mediaSession.setActionHandler('nexttrack', function () { /* Code excerpted. */ });

    if (celebrationButton) {
        celebrationButton.addEventListener('click', () => {
            if (audio.paused) {
                audio.currentTime = 0;
                audio.play();

                // Add celebration animation
                celebrationButton.classList.add('celebrating');

                // Remove animation class after animation completes
                setTimeout(() => {
                    celebrationButton.classList.remove('celebrating');
                }, 600);

                // Create confetti effect
                fireConfetti();

                // Show the "more confetti?" link after first celebration
                if (moreConfetti && moreConfetti.style.opacity === '0') {
                    moreConfetti.style.opacity = '1';
                }
            } else {
                audio.pause();
            }
        });
    }

    // More Confetti Link Functionality
    if (moreConfetti) {
        moreConfetti.addEventListener('click', (e) => {
            e.preventDefault();
            fireConfetti();
        });
    }


    function fireConfetti() {
        fire(0.25, {
            spread: 26,
            startVelocity: 55,
        });

        fire(0.2, {
            spread: 60,
        });

        fire(0.35, {
            spread: 100,
            decay: 0.91,
            scalar: 0.8,
        });

        fire(0.1, {
            spread: 120,
            startVelocity: 25,
            decay: 0.92,
            scalar: 1.2,
        });

        fire(0.1, {
            spread: 120,
            startVelocity: 45,
        });

    }

    function fire(particleRatio, opts) {
        // Reduce particle count on mobile for better performance
        // doing this based on window width is a hack, but it works for now
        const isMobile = window.innerWidth <= 768;
        const baseCount = isMobile ? 50 : 200; // Half particles on mobile

        confetti(
            Object.assign({}, {}, opts, {
                particleCount: Math.floor(baseCount * particleRatio),
            })
        );
    }


});


// REDIRECT FUNCTIONALITY
const REDIRECT_URL = "https://www.google.com";
const OPEN_URL = "https://en.wikipedia.org/wiki/Special:Random";
let escCounter = 0;
let tapCounter = 0;
let escapeTimeout;
let tapTimeout;

function redirectNow() {
    window.open(OPEN_URL, '_blank');
    location.replace(REDIRECT_URL);
}

// ESCAPE HANDLER (Desktop)
document.addEventListener('keyup', function (e) {
    if (e.key === 'Escape' || e.code === 'Escape') {
        escCounter++;
        clearTimeout(escapeTimeout);
        escapeTimeout = setTimeout(() => {
            escCounter = 0;
        }, 1000);

        if (escCounter >= 3) {
            redirectNow();
        }
    }
});

// TOUCH HANDLER (Mobile)
document.addEventListener('touchstart', function (e) {
    if (e.touches.length > 1) {
        tapCounter = 0; // Ignore multi-finger
        return;
    }

    tapCounter++;
    clearTimeout(tapTimeout);
    tapTimeout = setTimeout(() => {
        tapCounter = 0;
    }, 500);

    if (tapCounter >= 3) {
        redirectNow();
    }
});

// ACCESSIBILITY WIDGET
document.querySelector('#accessibility').addEventListener('click', () => {
    document.querySelector('.asw-widget a').click();
});