// Função para enviar mensagem via WhatsApp
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contatoForm');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const nome = document.getElementById('nome').value;
            const telefone = document.getElementById('telefone').value;
            const mensagem = document.getElementById('mensagem').value;
            
            // Número do WhatsApp da Holy Dress
            const numeroWhatsApp = '5585920038680';
            
            // Montar mensagem
            let textoWhatsApp = `Olá! Meu nome é *${nome}*\n\n`;
            
            if (telefone) {
                textoWhatsApp += `Meu WhatsApp: ${telefone}\n\n`;
            }
            
            textoWhatsApp += `${mensagem}`;
            
            // Codificar a mensagem para URL
            const mensagemCodificada = encodeURIComponent(textoWhatsApp);
            
            // Abrir WhatsApp
            const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${mensagemCodificada}`;
            window.open(urlWhatsApp, '_blank');
            
            // Limpar formulário
            form.reset();
        });
    }
});
// ==========================================
// CARROSSEL DE FOTOS - SEÇÃO CONTATO
// ==========================================
(function () {
    const track = document.querySelector('.carousel-track-contato');
    if (!track) return;

    function imagesLoaded(parent, cb) {
        const imgs = parent.querySelectorAll('img');
        let count = imgs.length;
        if (count === 0) return cb();
        imgs.forEach(img => {
            if (img.complete && img.naturalWidth > 0) {
                count--;
                if (count === 0) cb();
            } else {
                img.addEventListener('load', () => { count--; if (count === 0) cb(); });
                img.addEventListener('error', () => { count--; if (count === 0) cb(); });
            }
        });
    }

    imagesLoaded(track, initCarousel);

    function initCarousel() {
        const originalSlides = Array.from(track.children);

        // Duplica os slides para loop infinito
        originalSlides.forEach(slide => {
            track.appendChild(slide.cloneNode(true));
        });

        function setupAnimation() {
            // Mede a largura real dos slides originais
            let originalWidth = 0;
            originalSlides.forEach(slide => {
                const style = window.getComputedStyle(slide);
                originalWidth += slide.offsetWidth + parseInt(style.marginRight || 0);
            });

            const pxPerSecond = 80;
            const duration = originalWidth / pxPerSecond;

            const styleId = 'contato-carousel-anim';
            const existing = document.getElementById(styleId);
            if (existing) existing.remove();

            const styleEl = document.createElement('style');
            styleEl.id = styleId;
            styleEl.textContent = `
                @keyframes carouselScrollContato {
                    0%   { transform: translateX(0); }
                    100% { transform: translateX(-${originalWidth}px); }
                }
                .carousel-track-contato {
                    animation: carouselScrollContato ${duration}s linear infinite;
                }
            `;
            document.head.appendChild(styleEl);
        }

        setupAnimation();

        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(setupAnimation, 200);
        });
    }
})();