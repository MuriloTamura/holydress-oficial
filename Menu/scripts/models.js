// Animação de troca de imagens dos modelos - apenas ao passar o mouse
const modelImages = document.querySelectorAll('.model-images');

modelImages.forEach(container => {
    const images = container.querySelectorAll('.model-image');
    let currentIndex = 0;
    let intervalId = null;
    
    // Função para iniciar a rotação de imagens
    function startRotation() {
        if (intervalId) return; // Já está rodando
        
        // Trocar imediatamente para a próxima
        images[currentIndex].classList.remove('on');
        currentIndex = (currentIndex + 1) % images.length;
        images[currentIndex].classList.add('on');
        
        // Continuar trocando
        intervalId = setInterval(() => {
            images[currentIndex].classList.remove('on');
            currentIndex = (currentIndex + 1) % images.length;
            images[currentIndex].classList.add('on');
        }, 1000); // Troca a cada 1 segundo (mais rápido)
    }
    
    // Função para parar a rotação e voltar à primeira imagem
    function stopRotation() {
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
        }
        
        // Voltar para a primeira imagem
        images[currentIndex].classList.remove('on');
        currentIndex = 0;
        images[currentIndex].classList.add('on');
    }
    
    // Pegar o elemento pai (item-model) para detectar hover
    const itemModel = container.closest('.item-model');
    
    if (itemModel) {
        itemModel.addEventListener('mouseenter', startRotation);
        itemModel.addEventListener('mouseleave', stopRotation);
    }
});