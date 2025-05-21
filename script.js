        // ============== INICJALIZACJA ==============
        const videoBg = document.getElementById('video-bg');
        const musicControl = document.getElementById('musicControl');
        const autoplayOverlay = document.getElementById('autoplayOverlay');
        const autoplayButton = document.getElementById('autoplayButton');
        const card = document.getElementById('card');
        const profileImg = document.getElementById('profileImg');
        const username = document.getElementById('username');
        const bio = document.getElementById('bio');
        const gif = document.getElementById('gif');
        const linksContainer = document.getElementById('linksContainer');
        const clickSound = document.getElementById('clickSound');
        
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

        // Nowa funkcja do odtwarzania dźwięku
        const audio = new Audio(config.media.audio); // Create a new audio object
        audio.preload = 'auto'; // Preload the audio
        audio.loop = true; // Set audio to loop        // Funkcja do włączania/wyłączania dźwięku
        function toggleSound() {
            if (audio.paused) {
                // Synchronize audio with video when unmuting
                audio.currentTime = videoBg.currentTime % audio.duration;
                audio.play().then(() => {
                    musicControl.innerHTML = '<i class="fas fa-volume-up"></i>';
                    isMusicPlaying = true;
                }).catch(e => console.log("Audio play error:", e));
            } else {
                audio.pause();
                musicControl.innerHTML = '<i class="fas fa-volume-mute"></i>';
                isMusicPlaying = false;
            }
        }

        // Synchronizacja audio przy wznowieniu widoczności strony
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && isMusicPlaying) {
                audio.currentTime = videoBg.currentTime % audio.duration;
            }
        });

        // Funkcja aktywująca stronę
        function activatePage() {
            // Ustaw źródło wideo po kliknięciu
            document.querySelector('source[type="video/mp4"]').src = config.media.videoWithAudio;
            
            // Włącz dźwięk
            toggleSound();
            
            // Ukryj overlay z animacją
            autoplayOverlay.style.opacity = '0';
            autoplayOverlay.style.transition = 'opacity 0.5s ease';
            
            // Po zakończeniu animacji ukryj overlay
            setTimeout(() => {
                autoplayOverlay.style.display = 'none';
            }, 500);
            
            // Aktywuj interakcje z kartą
            card.classList.add('active');
            
            // Odtwórz wideo
            videoBg.load(); // Load the video after setting the source
            videoBg.play().catch(e => console.log("Playback error:", e));
            audio.play().catch(e => console.log("Audio playback error:", e)); // Play audio
        }

        // Obsługa przycisku w overlay
        autoplayButton.addEventListener('click', function() {
            clickSound.currentTime = 0;
            clickSound.play();
            activatePage();
        });

        // Obsługa przycisku kontroli dźwięku
        musicControl.addEventListener('click', function() {
            clickSound.currentTime = 0;
            clickSound.play();
            toggleSound();
        });

        // Synchronizacja odtwarzania
        videoBg.addEventListener('ended', () => {
            videoBg.currentTime = 0; // Reset video to start
            videoBg.play(); // Replay video
        });

        audio.addEventListener('ended', () => {
            audio.currentTime = 0; // Reset audio to start
            audio.play(); // Replay audio
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
        }        // Initialize particles only on desktop