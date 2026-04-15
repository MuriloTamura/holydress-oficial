const slider = document.querySelectorAll('.slider');
const btnPrev = document.getElementById('prev');
const btnNext = document.getElementById('next');

let currentSlide = 0;

function hideSlider(){
    slider.forEach(item => item.classList.remove('on'));
}

function showSlider(){
    slider[currentSlide].classList.add('on');
}

function nextSlider(){
    hideSlider();
    if(currentSlide === slider.length -1){
        currentSlide = 0;
    } else {
        currentSlide++;
    }
    showSlider();
}

function prevSlider(){
    hideSlider();
    if(currentSlide === 0){
        currentSlide = slider.length -1;
    } else {
        currentSlide--;
    }
    showSlider();
}

btnNext.addEventListener('click', nextSlider);
btnPrev.addEventListener('click', prevSlider);

showSlider();

setInterval(nextSlider, 4000);

(function() {
  const track = document.querySelector('.carousel-track');
  if (!track) return;

  // 1) espera as imagens carregarem
  function imagesLoaded(parent, cb) {
    const imgs = parent.querySelectorAll('img');
    let count = imgs.length;
    if (count === 0) return cb();
    imgs.forEach(img => {
      if (img.complete) {
        count--;
        if (count === 0) cb();
      } else {
        img.addEventListener('load', () => {
          count--;
          if (count === 0) cb();
        });
        img.addEventListener('error', () => {
          count--;
          if (count === 0) cb();
        });
      }
    });
  }

  imagesLoaded(track, initCarousel);

  function initCarousel() {
    const slides = Array.from(track.children);
    for (let i = 0; i < 2; i++) {
      slides.forEach(sl => track.appendChild(sl.cloneNode(true)));
    }

    function setupAnimation() {
      const totalWidth = track.scrollWidth;
      const half = totalWidth / 2;
      const pxPerSecond = 50;
      const duration = half / pxPerSecond;

      const styleId = 'carousel-dynamic-anim';
      let styleEl = document.getElementById(styleId);
      if (styleEl) styleEl.remove();

      styleEl = document.createElement('style');
      styleEl.id = styleId;
      styleEl.textContent = `
        @keyframes carouselScroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-${half}px); }
        }
        .carousel-track {
          animation: carouselScroll ${duration}s linear infinite;
        }
      `;
      document.head.appendChild(styleEl);
    }

    setupAnimation();

    let rt;
    window.addEventListener('resize', () => {
      clearTimeout(rt);
      rt = setTimeout(setupAnimation, 200);
    });
  }
})();

// ==========================================
// EFEITO DE DIGITAÇÃO - ESCREVER E APAGAR
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    const typingElement = document.querySelector('.typing-text span');
    
    if (!typingElement) return;

    const words = [
        "Servo de Deus",
        "Varão",
        "Varoa",
        "Abençoada",
        "Filho de Deus"
    ];

    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 150; // Velocidade de digitação (ms)
    let deletingSpeed = 100; // Velocidade de apagar (ms)
    let pauseTime = 2000; // Tempo de pausa após digitar a palavra completa

    function type() {
        const currentWord = words[wordIndex];
        
        if (isDeleting) {
            // Apagando
            typingElement.textContent = currentWord.substring(0, charIndex - 1);
            charIndex--;
            
            if (charIndex === 0) {
                isDeleting = false;
                wordIndex = (wordIndex + 1) % words.length; // Próxima palavra
                setTimeout(type, 500); // Pequena pausa antes de começar a próxima
                return;
            }
            
            setTimeout(type, deletingSpeed);
            
        } else {
            // Digitando
            typingElement.textContent = currentWord.substring(0, charIndex + 1);
            charIndex++;
            
            if (charIndex === currentWord.length) {
                isDeleting = true;
                setTimeout(type, pauseTime); // Pausa após completar a palavra
                return;
            }
            
            setTimeout(type, typingSpeed);
        }
    }

    // Iniciar o efeito
    type();
});