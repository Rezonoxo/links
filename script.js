// ============== INICJALIZACJA ==============
const videoBg = document.getElementById('video-bg');
const musicControl = document.getElementById('musicControl');
const card = document.getElementById('card');
const profileImg = document.getElementById('profileImg');
const username = document.getElementById('username');
const bio = document.getElementById('bio');
const gif = document.getElementById('gif');
const linksContainer = document.getElementById('linksContainer');
const clickSound = document.getElementById('clickSound');
const loadingScreen = document.getElementById('loadingScreen');
const progressBar = document.querySelector('.progress-bar');

// Dodaj obsługę języka na podstawie lokalizacji użytkownika
function getLang() {
  const lang = navigator.language || navigator.userLanguage;
  if (lang && lang.toLowerCase().startsWith('pl')) return 'pl';
  return 'en';
}

function getOverlayContent() {
  const lang = getLang();
  if (lang === 'pl') {
    return `
      <div class="autoplay-content">
        <h2>Rozpocznij doświadczenie</h2>
        <p>Strona zawiera efekty dźwiękowe i wizualne.<br>Kliknij, aby rozpocząć.</p>
        <button class="autoplay-button"><i class="fas fa-play"></i> Start</button>
        <div style="font-size:12px;color:#bbb;margin-top:12px;">Dźwięk zostanie włączony po kliknięciu. Możesz go wyciszyć w dowolnym momencie.</div>
      </div>
    `;
  } else {
    return `
      <div class="autoplay-content">
        <h2>Start the experience</h2>
        <p>This site contains sound and visual effects.<br>Click to continue.</p>
        <button class="autoplay-button"><i class="fas fa-play"></i> Start</button>
        <div style="font-size:12px;color:#bbb;margin-top:12px;">Sound will be enabled after clicking. You can mute it at any time.</div>
      </div>
    `;
  }
}

// Dodaj overlay wymuszający kliknięcie
const autoplayOverlay = document.createElement('div');
autoplayOverlay.className = 'autoplay-overlay';
autoplayOverlay.innerHTML = getOverlayContent();
document.body.appendChild(autoplayOverlay);

function showAutoplayOverlay() {
  autoplayOverlay.classList.add('active');
  // Ustaw treść na nowo (np. po zmianie języka)
  autoplayOverlay.innerHTML = getOverlayContent();
  const btn = autoplayOverlay.querySelector('.autoplay-button');
  btn.addEventListener('click', unlockAll);
  autoplayOverlay.addEventListener('click', function(e) {
    if (e.target === autoplayOverlay) unlockAll();
  });
}
function hideAutoplayOverlay() {
  autoplayOverlay.classList.remove('active');
}

function unlockAll() {
  hideAutoplayOverlay();
  activatePage();
}

// Ustawienia z konfiguracji
profileImg.src = config.profile.image;
username.textContent = config.profile.username;
bio.textContent = config.profile.bio;
gif.src = config.media.gif;

// Generowanie linków (otwierających się w nowej karcie)
config.links.forEach(link => {
    const linkElement = document.createElement('a');
    linkElement.href = link.url;
    linkElement.className = `link ${link.class ? link.class : ''}`;
    linkElement.innerHTML = `<i class="${link.icon}"></i> ${link.text}`;
    linkElement.target = "_blank"; // Otwiera w nowej karcie
    linkElement.rel = "noopener noreferrer";
    linksContainer.appendChild(linkElement);
});

let isMusicPlaying = false;
let isCardHovered = false;

function toggleSound() {
    if (videoBg.muted) {
        videoBg.muted = false;
        musicControl.innerHTML = '<i class="fas fa-volume-up"></i>';
    } else {
        videoBg.muted = true;
        musicControl.innerHTML = '<i class="fas fa-volume-mute"></i>';
    }
}

// Funkcja losująca film
function getRandomVideo() {
    const videos = config.media.videos;
    return videos[Math.floor(Math.random() * videos.length)];
}

function isMobile() {
    return window.innerWidth < 769;
}

function activatePage() {
    // Losuj film i ustaw jako źródło
    const randomVideo = getRandomVideo();
    document.querySelector('source[type="video/mp4"]').src = randomVideo;
    videoBg.load();
    // Na PC dźwięk włączony, na mobile wyciszony
    if (isMobile()) {
        videoBg.muted = true;
        musicControl.innerHTML = '<i class="fas fa-volume-mute"></i>';
    } else {
        videoBg.muted = false;
        musicControl.innerHTML = '<i class="fas fa-volume-up"></i>';
    }
    videoBg.play().catch(e => console.log("Playback error:", e));
    card.classList.add('active');
}

// Loading screen logic
function simulateLoading() {
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 100) progress = 100;
        progressBar.style.width = `${progress}%`;
        if (progress === 100) {
            clearInterval(interval);
            setTimeout(() => {
                loadingScreen.style.animation = 'fadeOut 0.5s forwards';
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                    // Pokaż overlay dopiero po loadingu
                    showAutoplayOverlay();
                    const btn = autoplayOverlay.querySelector('.autoplay-button');
                    btn.addEventListener('click', unlockAll);
                    autoplayOverlay.addEventListener('click', function(e) {
                        if (e.target === autoplayOverlay) unlockAll();
                    });
                }, 500);
            }, 500);
        }
    }, 200);
}

window.addEventListener('load', () => {
    simulateLoading();
});

// Obsługa przycisku kontroli dźwięku
musicControl.addEventListener('click', function() {
    clickSound.currentTime = 0;
    clickSound.play();
    // Pozwól włączyć dźwięk tylko po kliknięciu
    toggleSound();
});

// Synchronizacja odtwarzania
videoBg.addEventListener('ended', () => {
    videoBg.currentTime = 0; // Reset video to start
    videoBg.play(); // Replay video
});

// Inicjalizacja wideo (tylko obraz, bez dźwięku)
videoBg.muted = true;
videoBg.play().catch(e => {
    console.log("Autoplay prevented, waiting for user interaction");
});        // Efekty 3D karty - uproszczona wersja
function updateCardTransform(e) {
    if (!isCardHovered) return;
    
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / config.effects.cardTiltIntensity;
    const y = (rect.height / 2 - (e.clientY - rect.top)) / config.effects.cardTiltIntensity;
    
    card.style.transform = `perspective(1000px) rotateX(${y}deg) rotateY(${x}deg) scale(${config.effects.cardScaleOnHover})`;
    card.style.boxShadow = `${-x/3}px ${-y/3}px 30px rgba(0, 0, 0, 0.4), 0 0 30px rgba(50, 50, 100, ${config.effects.glowIntensity})`;
}

card.addEventListener('mousemove', updateCardTransform);
card.addEventListener('mouseenter', () => {
    isCardHovered = true;
    card.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
});

card.addEventListener('mouseleave', () => {
    isCardHovered = false;
    card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(0.8)';
    card.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.1)';
    card.style.transition = 'transform 0.5s ease, box-shadow 0.5s ease';
});

// Efekty kliknięcia linków
document.querySelectorAll('.link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        clickSound.currentTime = 0;
        clickSound.play();
        
        link.style.transform = 'translateY(-3px) scale(0.98)';
        setTimeout(() => {
            link.style.transform = 'translateY(0) scale(1)';
            // Otwiera link w nowej karcie (już ustawione przez target="_blank")
            window.open(link.href, '_blank');
        }, 300);
    });
});        // Custom Cursor
if (window.innerWidth > 768) {
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');

    document.addEventListener('mousemove', (e) => {
        cursorDot.style.left = e.clientX + 'px';
        cursorDot.style.top = e.clientY + 'px';
        cursorOutline.style.left = e.clientX + 'px';
        cursorOutline.style.top = e.clientY + 'px';
    });

    // Hide cursor when leaving window
    document.addEventListener('mouseleave', () => {
        cursorDot.style.opacity = '0';
        cursorOutline.style.opacity = '0';
    });

    document.addEventListener('mouseenter', () => {
        cursorDot.style.opacity = '1';
        cursorOutline.style.opacity = '1';
    });
}
document.addEventListener('DOMContentLoaded', function() {
    const visitCounter = document.getElementById('visitCounter');
    
    // Unikalny klucz dla Twojej strony (np. nazwa domeny)
    const namespace = 'nozercodelinks';
    
    fetch(`https://api.countapi.xyz/hit/${namespace}/visits`)
        .then(response => response.json())
        .then(data => {
            visitCounter.innerHTML = `<i class="fas fa-eye"></i> ${data.value}`;
        })
        .catch(error => {
            console.error('Błąd licznika:', error);
            visitCounter.innerHTML = `<i class="fas fa-eye"></i> 0`;
        });
});