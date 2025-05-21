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
        const audio = new Audio(config.media.audio);
        audio.preload = 'auto';
        audio.loop = true;

        function toggleSound() {
            if (audio.paused) {
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

        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && isMusicPlaying) {
                audio.currentTime = videoBg.currentTime % audio.duration;
            }
        });

        function activatePage() {
            document.querySelector('source[type="video/mp4"]').src = config.media.videoWithAudio;
            videoBg.load();
            videoBg.play().catch(e => console.log("Playback error:", e));
            toggleSound();
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
                            activatePage();
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