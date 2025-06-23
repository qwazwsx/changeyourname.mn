if (window.location.protocol != "file:") {
    alert("This is a work in progress. I am not a lawyer. This is not legal advice. -Emma")
}

twemoji.parse(document.body)

document.querySelector('input#introduction').checked = true;



// Helper function to set a cookie
function setCookie(name, value, days = 365) {
    const d = new Date();
    d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + d.toUTCString();
    document.cookie = `${name}=${value};${expires};path=/`;
}

// Helper function to get a cookie by name
function getCookie(name) {
    const cname = name + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');
    for (let c of ca) {
        while (c.charAt(0) === ' ') c = c.substring(1);
        if (c.indexOf(cname) === 0) return c.substring(cname.length, c.length);
    }
    return null;
}

// Called whenever a checkbox changes, saves its state
const clickAudio = new Audio('click.mp3');
clickAudio.volume = 0.1;
function update(e) {
    const checkbox = e.target;
    const id = checkbox.id;
    const isChecked = checkbox.checked ? "true" : "false";
    // Save to cookie
    setCookie(id, isChecked);
    // Save to localStorage
    localStorage.setItem(id, isChecked);

    document.querySelector(`label.${id}`).classList.toggle('checked', checkbox.checked);

    document.querySelectorAll(`input[type="checkbox"][id]#${id}`).forEach(cb => {
        cb.checked = checkbox.checked;
    })

    if (checkbox.checked) {
        clickAudio.play();
    }

}

// On page load, read saved states and apply them
function loadSavedStates() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"][id]');
    checkboxes.forEach(cb => {
        // Priority: localStorage, then cookies
        let saved = localStorage.getItem(cb.id);
        if (saved === null || saved === "") {
            saved = getCookie(cb.id);
        }
        cb.checked = (saved === null ? cb.checked : saved === "true");
        cb.dispatchEvent(new Event('change')); // Trigger change to update UI
        // Attach listener
        cb.addEventListener('change', update);
    });




    let inputs = document.querySelectorAll('.tableofcontents input')
    // let links = document.querySelectorAll('.tableofcontents a')
    
    inputs.forEach((input, i) => {
        if (input.checked) {
            input.parentElement.classList.add('checked');
        }

        input.addEventListener('change', (e) => {
            console.log(e)
            if (e.target.checked) {
                e.target.parentElement.classList.add('checked');
            } else {
                e.target.parentElement.classList.remove('checked');
            }
        });
    })
}

// fade in body on page load
window.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('fade-in');
    loadSavedStates();
});



// Show subtext when assumption checkboxes are unchecked
document.querySelectorAll('.assumptions input[type="checkbox"][id]').forEach(cb => {
    cb.addEventListener('change', (e) => {
        console.log(e.target.id, e.target.checked);
        document.querySelector(`.assumptions p#${e.target.id}`)?.classList?.toggle?.('visible', !e.target.checked);
    });
});

const audio = new Audio('celebrate.mp3');
document.querySelector('#celebrateButton').addEventListener('click', () => {
    document.querySelector('input#hearing').checked = true;
    if (!document.querySelector('html').classList.contains('celebrate')) {
        document.querySelector('html').classList.add('celebrate');
        fireConfetti()
        let interval = setInterval(() => {
            if (!audio.paused) {
                fireConfetti();
            } else {
                document.querySelector('html').classList.remove('celebrate');
                clearInterval(interval);
            }
        }, 2500)
        audio.play();
        audio.volume = .05
    }else{
        document.querySelector('html').classList.remove('celebrate');
        audio.pause()
        audio.currentTime = 0;
    }
   
})


function registerConfettiHooks(){
// Celebrate with confetti and sound when the hearing checkbox is checked
const audio = new Audio('celebrate.mp3');
document.querySelectorAll('input#hearing').forEach(input => {
    input.addEventListener('change', (e) => {
        // alert(1)
        if (e.target.checked) {
            
        } else {
            audio.pause();
            audio.currentTime = 0;
        }
    })

})

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
    const count = 200,
        defaults = {
            y: .5
        };
    confetti(
        Object.assign({}, {}, opts, {
            particleCount: Math.floor(count * particleRatio),
        })
    );
}


navigator.mediaSession.setActionHandler('play', function() { /* Code excerpted. */ });
navigator.mediaSession.setActionHandler('pause', function() { /* Code excerpted. */ });
navigator.mediaSession.setActionHandler('seekbackward', function() { /* Code excerpted. */ });
navigator.mediaSession.setActionHandler('seekforward', function() { /* Code excerpted. */ });
navigator.mediaSession.setActionHandler('previoustrack', function() { /* Code excerpted. */ });
navigator.mediaSession.setActionHandler('nexttrack', function() { /* Code excerpted. */ });


