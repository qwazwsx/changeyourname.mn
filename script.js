import { createTextAnnotator } from '@recogito/text-annotator';

import '@recogito/text-annotator/text-annotator.css';



// Main JavaScript functionality for changeyourname.mn
document.addEventListener('DOMContentLoaded', () => {
    document.fonts.ready.then(() => {
        document.body.classList.remove('loading');
    });

    const anno = createTextAnnotator(document.querySelector('.content'), {
        allowModifierSelect: true,
        // mergeHighlights: {
        //     horizontalTolerance: 50,
        //     verticalTolerance: 50
        // },
        dismissOnNotAnnotatable: true,
        selectionMode: 'shortest',

    });
    anno.setStyle((annotation, state) => ({
        fill: '#a6ff00',
        fillOpacity: .25,
        underlineStyle: 'dashed',
        underlineColor: '#7d7208ff',
        underlineOffset: 0,
        underlineThickness: 2,
        fillOpacity: state.hovered ? 0.5 : 0.25,
    }));


    // load from local storage
    const savedAnnotations = JSON.parse(localStorage.getItem('annotations')) || [];
    savedAnnotations.forEach(annotation => anno.addAnnotation(annotation));


    let isNewAnnotationPending = false;

    anno.on('selectionChanged', annotations => {
        // // deselect browser range
        // if (window.getSelection) { window.getSelection().removeAllRanges(); }
        // else if (document.selection) { document.selection.empty(); }

        setTimeout(() => { // lib calls selectionChanged before the DOM updates, so we need to wait a tick to get the new elements in the DOM. this is a hack
            console.log('Selected:', annotations);
            if (annotations.length === 0) {
                if (!isNewAnnotationPending) {
                    console.log('No annotations, closing popover');
                    document.querySelector('.annotate-popover').style.display = 'none';
                    return;
                } else {
                    console.log('No annotations, but new annotation is pending, keeping popover open');
                }
            } else {
                isNewAnnotationPending = true;
            }

            if (annotations[0].bodies[0] !== undefined) {
                document.querySelector('.annotate-popover md-filled-text-field').value = annotations[0].bodies[0].text;
            }

            document.querySelectorAll('.r6o-annotation.selected').forEach(el => el.classList.remove('selected'));
            let els = document.querySelectorAll(`[data-annotation="${annotations[0].id}"]`);
            // calculate bounding box for all els with this annotation ID
            let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
            els.forEach(el => {
                el.classList.add('selected');
                let bb = el.getBoundingClientRect();
                minX = Math.min(minX, bb.left);
                minY = Math.min(minY, bb.top);
                maxX = Math.max(maxX, bb.right);
                maxY = Math.max(maxY, bb.bottom);
            });

            let popover = document.querySelector('.annotate-popover');
            popover.style.display = 'flex';

            // center bb
            popover.style.left = `${(minX + maxX) / 2 + window.pageXOffset - (popover.offsetWidth / 2)}px`;
            popover.style.top = `${minY + window.pageYOffset - (popover.offsetHeight)}px`;


            // if popover goes off screen, move it back on
            if (
                window.innerWidth < 700 ||
                parseInt(popover.style.left.split('px')[0]) < window.pageXOffset ||
                parseInt(popover.style.top.split('px')[0]) < window.pageYOffset ||
                parseInt(popover.style.top.split('px')[0]) + popover.offsetHeight > window.pageYOffset + window.innerHeight ||
                parseInt(popover.style.left.split('px')[0]) + popover.offsetWidth > window.pageXOffset + window.innerWidth
            ) {
                // position in center
                popover.style.left = `${(window.innerWidth / 2) - (popover.offsetWidth / 2)}px`;
                popover.style.top = `${(window.innerHeight / 2) - (popover.offsetHeight)}px`;
                popover.style.position = 'fixed'
                // ensure annotation is in view (not blocked by centered popover)
                let annotationTarget = annotations[0].target.selector[0].range.startContainer.parentElement
                annotationTarget.style.scrollMarginTop = '-750px';
                annotationTarget.scrollIntoView({ behavior: 'smooth', block: 'center' });
                console.log(annotations)
            }

            // setTimeout(() => {
            //     document.addEventListener('click', (event) => {
            //     if (!document.querySelector('.annotate-popover').contains(event.target)) {
            //         closePopover();
            //     }
            // })

            let closeIfClickedOutside = (event) => {
                console.log('Document click:', event.target);
                if (!document.querySelector('.annotate-popover').contains(event.target)) {
                    closePopover();
                }
            }
            document.addEventListener('click', closeIfClickedOutside);


            function closePopover() {
                console.log('Closing popover');
                document.removeEventListener('click', closeIfClickedOutside);

                annotations[0].bodies[0] = { text: document.querySelector('.annotate-popover md-filled-text-field').value }
                anno.updateAnnotation(annotations[0]);
                isNewAnnotationPending = false;


                // document.getSelection().removeAllRanges()
                popover.style.display = 'none';
                document.querySelector('.annotate-popover md-filled-text-field').value = ''
                anno.cancelSelected()

                // save to localstorage
                let allAnnotations = anno.getAnnotations();
                localStorage.setItem('annotations', JSON.stringify(allAnnotations));
            }

            // listen for x click
            document.querySelector('.annotate-popover .close-popover').onclick = () => {
                anno.removeAnnotation(annotations[0].id);
                popover.style.display = 'none';
                document.getSelection().removeAllRanges()
                isNewAnnotationPending = false;
            }

            // listen for post note click
            document.querySelector('.annotate-popover .post-note').onclick = () => {
                closePopover()

                fetch('/comments', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ object: annotations[0] })
                })
                    .then(response => {
                        if (response.ok) {
                            alert('Suggestion submitted successfully! Thank you :3');
                            input.value = '';
                        } else {
                            failSubmitComment(JSON.stringify(annotations[0]))
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        failSubmitComment(JSON.stringify(annotations[0]))
                    });
                // send
            }
        }, 150);
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
            console.log(5555555555)
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
        updateNavCheckmark(element.id, savedValue);


        if (element.tagName === 'INPUT') {
            element.addEventListener('change', () => {
                // Save the value when it changes
                save(element);
                playClick();
                updateNavCheckmark(element.id, element.checked);
            })
        } else if (element.tagName === 'MD-CHECKBOX') {
            element.addEventListener('change', () => {
                // Save the value when it changes
                save(element.id, element.checked);
                playClick();
                updateNavCheckmark(element.id, element.checked);
            });
        }
    })

    // Play click sound
    function playClick() {
        const audio = new Audio('resources/click.mp3');
        audio.play();
    }

    // Update nav bar checkmarks based on checkbox state
    function updateNavCheckmark(checkboxId, isChecked) {
        // Convert checkbox ID to nav ID (e.g., "introduction-checkbox" -> "introduction-nav")
        const navId = checkboxId.replace('-checkbox', '-nav');
        const navItem = document.getElementById(navId);

        if (navItem) {
            // Find or create the checkmark icon
            let checkmark = navItem.querySelector('.nav-checkmark');

            if (isChecked) {
                // Add checkmark if it doesn't exist
                if (!checkmark) {
                    checkmark = document.createElement('span');
                    checkmark.className = 'material-symbols-outlined nav-checkmark';
                    checkmark.textContent = 'check_circle';
                    checkmark.setAttribute('aria-hidden', 'true');
                    navItem.appendChild(checkmark);
                }
            } else {
                // Remove checkmark if it exists
                if (checkmark) {
                    checkmark.remove();
                }
            }
        }
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
    const celebrationButton = document.querySelectorAll('.celebration-button');
    // const moreConfetti = document.getElementById('moreConfetti');
    navigator.mediaSession.setActionHandler('play', function () { });
    navigator.mediaSession.setActionHandler('pause', function () { });
    navigator.mediaSession.setActionHandler('seekbackward', function () { });
    navigator.mediaSession.setActionHandler('seekforward', function () { });
    navigator.mediaSession.setActionHandler('previoustrack', function () { });
    navigator.mediaSession.setActionHandler('nexttrack', function () { });

    let audio = undefined;
    let audioID = undefined;

    if (celebrationButton) {
        celebrationButton.forEach(button => button.addEventListener('click', async () => {

            // if audio has been playing from another button, stop it
            if (audioID !== button.getAttribute('audioID')) {
                audio?.pause();
                audio = undefined;

                audioID = button.getAttribute('audioID')
                audio = new Audio(`resources/celebrate-${audioID}.mp3`);
            }

            // if audio is not playing, start
            if (audio.paused) {
                audio.currentTime = 0;
                audio.play();

                // Add celebration animation
                button.classList.add('celebrating');

                // Remove animation class after animation completes
                setTimeout(() => {
                    button.classList.remove('celebrating');
                }, 600);

                // Load confetti library and create confetti effect
                try {
                    await loadConfettiLibrary();
                    fireConfetti();
                } catch (error) {
                    console.warn('Failed to load confetti library:', error);
                }

                let moreConfetti = button.parentElement.querySelector('.more-confetti');
                moreConfetti.addEventListener('click', async (e) => {
                    e.preventDefault();
                    try {
                        await loadConfettiLibrary(); // wait for library to load, this won't actually load it again if already in progress
                        fireConfetti();
                    } catch (error) {
                        console.warn('Failed to load confetti library:', error);
                    }
                });


                // Show the "more confetti?" link after first celebration
                if (moreConfetti && moreConfetti.style.opacity === '0') {
                    moreConfetti.style.opacity = '1';
                    moreConfetti.style.display = 'block'
                }
            } else {
                // otherwise pause the music on second click
                audio.pause();
            }
        }));
    }


    function fireConfetti() {
        // Only fire confetti if the library is loaded
        if (!confettiLoaded || typeof window.confetti !== 'function') {
            console.warn('Confetti library not loaded');
            return;
        }

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
        // Only fire if confetti library is available
        if (!confettiLoaded || typeof window.confetti !== 'function') {
            return;
        }

        // Reduce particle count on mobile for better performance
        // doing this based on window width is a hack, but it works for now
        const isMobile = window.innerWidth <= 768;
        const baseCount = isMobile ? 50 : 100; // Half particles on mobile

        window.confetti(
            Object.assign({}, {}, opts, {
                particleCount: Math.floor(baseCount * particleRatio),
            })
        );
    }


    // Initial check
    updateScrollScrim();

    // Listen for scroll events
    window.addEventListener('scroll', updateScrollScrim);
    window.addEventListener('resize', updateScrollScrim);

});



// Global variable to track confetti library loading
let confettiLoaded = false;
let confettiLoadingPromise = null;

// Function to dynamically load the confetti library
function loadConfettiLibrary() {
    if (confettiLoaded) {
        return Promise.resolve();
    }

    if (confettiLoadingPromise) {
        return confettiLoadingPromise;
    }

    confettiLoadingPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.2/dist/confetti.browser.min.js';
        script.onload = () => {
            confettiLoaded = true;
            resolve();
        };
        script.onerror = () => {
            reject(new Error('Failed to load confetti library'));
        };
        document.head.appendChild(script);
    });

    return confettiLoadingPromise;
}





// REDIRECT FUNCTIONALITY
const REDIRECT_URL = "https://www.google.com";
const OPEN_URL = "https://en.wikipedia.org/wiki/Special:Random";
let escCounter = 0;
let tapCounter = 0;
let escapeTimeout;
let tapTimeout;
let escapePopupShown = false;

function redirectNow() {
    window.open(OPEN_URL, '_blank');
    location.replace(REDIRECT_URL); // this opens the app on mobile
    location.replace(OPEN_URL); // so we need to still open the random url to cover the page
}

function showEscapePopup() {
    if (escapePopupShown) return;

    const popup = document.getElementById('escapePopup');
    if (popup) {
        popup.style.display = 'flex';
        escapePopupShown = true;

        // // Auto-hide after 5 seconds
        // setTimeout(() => {
        //     hideEscapePopup();
        // }, 5000);
    }
}

function hideEscapePopup() {
    const popup = document.getElementById('escapePopup');
    if (popup) {
        popup.style.display = 'none';
    }
}

// ESCAPE HANDLER (Desktop)
document.addEventListener('keyup', function (e) {
    if (e.key === 'Escape' || e.code === 'Escape') {
        // Skip if nav drawer is open (existing functionality)
        const navDrawer = document.getElementById('navDrawer');
        if (navDrawer && navDrawer.classList.contains('open')) {
            return;
        }

        escCounter++;
        clearTimeout(escapeTimeout);
        escapeTimeout = setTimeout(() => {
            escCounter = 0;
        }, 1000);

        // Show popup on first escape press
        if (escCounter === 1) {
            showEscapePopup();
        }

        if (escCounter >= 3) {
            redirectNow();
        }
    }
});

// TOUCH HANDLER (Mobile)
document.addEventListener('touchend', function (e) {
    console.log(e)
    if (e.touches.length > 1) {
        tapCounter = 0; // Ignore multi-finger
        return;
    }
    if (e.target.tagName === 'A') {
        return; // Ignore taps on links
    }

    tapCounter++;
    clearTimeout(tapTimeout);
    tapTimeout = setTimeout(() => {
        tapCounter = 0;
    }, 500);

    // Show popup on first triple tap
    if (tapCounter === 3) {
        showEscapePopup();
    }

    if (tapCounter >= 5) {
        redirectNow();
    }
});

// ESCAPE POPUP EVENT HANDLERS
document.addEventListener('DOMContentLoaded', () => {
    const escapePopupClose = document.getElementById('escapePopupClose');
    const escapePopup = document.getElementById('escapePopup');

    if (escapePopupClose) {
        escapePopupClose.addEventListener('click', hideEscapePopup);
    }

    if (escapePopup) {
        escapePopup.addEventListener('click', (e) => {
            if (e.target === escapePopup) {
                hideEscapePopup();
            }
        });
    }
});

// ACCESSIBILITY WIDGET
document.querySelector('#accessibility').addEventListener('click', () => {
    document.querySelector('.asw-widget a').click();
    document.querySelector('button.asw-btn[data-key="monochrome"]').click();
    document.querySelector('button.asw-btn[data-key="stop-animations"]').click();
});


// SHOW URLS ON PRINT VIEW
window.addEventListener("beforeprint", () => {
    document.body.classList.add('print');
    alert('For some reason printing is broken. Unfortunately this is a low priority issue for me. Feel free to PR a fix.');

    // Create hidden URL display elements for md-filled-button elements
    createButtonUrlDisplays();

    // Force load all lazy images for printing
    forceLoadLazyImages();
});

window.addEventListener("afterprint", () => {
    document.body.classList.remove('print');
});

// Function to force load all lazy images for printing
function forceLoadLazyImages() {
    document.querySelectorAll('img[loading="lazy"]').forEach(img => {
        // Change loading attribute to eager to force immediate loading
        img.loading = 'eager';

        // If the image hasn't loaded yet, force it by triggering load
        if (!img.complete) {
            // Create a new image to force loading
            const newImg = new Image();
            newImg.onload = () => {
                // Image is now loaded and will appear in print
            };
            newImg.src = img.src;
        }
    });
}

// Function to create hidden URL displays for buttons
function createButtonUrlDisplays() {
    // Remove any existing print URL elements first
    document.querySelectorAll('.print-button-url').forEach(el => el.remove());

    // Find all md-filled-button elements with onclick attributes
    document.querySelectorAll('md-filled-button[onclick], md-outlined-button[onclick], md-text-button[onclick]').forEach(button => {
        const onclick = button.getAttribute('onclick');

        // Extract URL from onclick attribute
        // Look for patterns like window.open('url', '_blank') or similar
        const urlMatch = onclick.match(/(?:window\.open|location\.href\s*=)\s*\(\s*['"`]([^'"`]+)['"`]/);

        if (urlMatch && urlMatch[1]) {
            let url = urlMatch[1];

            if (!url.startsWith('http')) {
                // Ensure URL is absolute
                url = window.location.origin + '/' + url;
            }

            // Create hidden paragraph element
            const urlDisplay = document.createElement('p');
            urlDisplay.className = 'print-button-url';
            urlDisplay.textContent = `(${url})`;
            // urlDisplay.style.display = 'none'; // Hidden by default

            // Insert the URL display after the button
            button.parentNode.insertBefore(urlDisplay, button.nextSibling);
        }
    });
}

// SCROLL INDICATOR SCRIM
const scrollScrim = document.getElementById('scrollScrim');

function updateScrollScrim() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    // Hide scrim if user has scrolled down or if near bottom of page
    const scrollThreshold = 100; // Hide after scrolling 100px
    const nearBottom = (scrollTop + windowHeight) >= (documentHeight - 200);

    if (scrollTop > scrollThreshold || nearBottom) {
        scrollScrim.classList.add('hidden');
    } else {
        scrollScrim.classList.remove('hidden');
    }
}


window['submitComment'] = submitComment;
function submitComment() {
    let input = document.querySelector('#comment-input');

    fetch('/comments', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: input.value })
    })
        .then(response => {
            if (response.ok) {
                alert('Comment submitted successfully! Thank you :3');
                input.value = '';
            } else {
                failSubmitComment(input.value)
            }
        })
        .catch(error => {
            console.error('Error:', error);
            failSubmitComment(input.value)
        });
}

function failSubmitComment(comment) {
    alert('Error submitting comment. Sorry. Email me at emma@zimbin.ski');

    const mailto = 'mailto:emma@zimbin.ski?subject=' + encodeURIComponent('ChangeYourName.MN') + '&body=' + encodeURIComponent(comment);
    window.open(mailto, '_blank');
}


