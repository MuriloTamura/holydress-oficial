// Sistema de Modal de Produto - Versão Final Corrigida
// Detecta corretamente a área real da imagem, não do container

// Configuração de tamanhos por tipo
const sizesConfig = {
    'oversized': {
        label: 'Oversized',
        sizes: ['P', 'M', 'G', 'GG'],
        sizeGuideImage: './images/tabela-oversized.jpeg'
    },
    'cropped': {
        label: 'Cropped',
        sizes: ['P', 'M', 'G'],
        sizeGuideImage: './images/tabela-cropped.webp'
    },
    'moletom': {
        label: 'Moletom',
        sizes: ['P', 'M', 'G', 'GG'],
        sizeGuideImage: './images/tabela-moletom.webp'
    },
    'combo_camisa_cropped': {
        label: 'Combo Camisa + Cropped',
        items: [
            { key: 'camisa', label: 'Camisa', sizes: ['P', 'M', 'G', 'GG'] },
            { key: 'cropped', label: 'Cropped', sizes: ['P', 'M', 'G'] }
        ],
        sizeGuideImage: './images/tabela-oversized.jpeg'
    },
    'combo_completo': {
        label: 'Combo Camisa + Cropped + Moletom',
        items: [
            { key: 'camisa', label: 'Camisa', sizes: ['P', 'M', 'G', 'GG'] },
            { key: 'cropped', label: 'Cropped', sizes: ['P', 'M', 'G'] },
            { key: 'moletom', label: 'Moletom', sizes: ['P', 'M', 'G', 'GG'] }
        ],
        sizeGuideImage: './images/tabela-oversized.jpeg'
    }
};

const defaultProductTypes = ['oversized'];
const productTypes = {
    'Frutos': ['oversized', 'cropped', 'moletom']
};

// Variações exclusivas do modelo Frutos.
// Ao adicionar novas fotos, mantenha estes nomes nas respectivas pastas.
const productVariants = {
    'Frutos': {
        oversized: {
            price: 55
        },
        cropped: {
            price: 45,
            images: [1, 2, 3, 4, 5].map(number =>
                `Blusas/Frutos/Cropped/FrutosCropped0${number}.webp`
            )
        },
        moletom: {
            price: 110,
            images: [1, 2, 3, 4, 5].map(number =>
                `Blusas/Frutos/Moletom/FrutosMoletom0${number}.webp`
            )
        },
        combo_camisa_cropped: {
            price: 90,
            images: [
                ...[1, 2, 3].map(number => `Blusas/Frutos/Camisa/FrutosCamisa0${number}.webp`),
                ...[1, 2, 3].map(number => `Blusas/Frutos/Cropped/FrutosCropped0${number}.webp`)
            ]
        },
        combo_completo: {
            price: 180,
            images: [
                ...[1, 2, 3].map(number => `Blusas/Frutos/Camisa/FrutosCamisa0${number}.webp`),
                ...[1, 2, 3].map(number => `Blusas/Frutos/Cropped/FrutosCropped0${number}.webp`),
                ...[1, 2, 3].map(number => `Blusas/Frutos/Moletom/FrutosMoletom0${number}.webp`)
            ]
        }
    }
};

let currentProduct = null;
let selectedType = null;
let selectedSize = null;
let selectedComboSizes = {};
let selectedPrice = null;
let currentSizeGuides = [];
let currentSizeGuideIndex = 0;
let zoomLens = null;
let currentZoomHandlers = null;

// Função para pegar dados do produto do HTML
function getProdutoData(productName) {
    const cards = document.querySelectorAll('.item-model');
    let productCard = null;
    
    for (let card of cards) {
        const nameElement = card.querySelector('.name-model');
        if (nameElement && nameElement.textContent.trim() === productName) {
            productCard = card;
            break;
        }
    }
    
    if (!productCard) {
        console.error('Produto não encontrado:', productName);
        return null;
    }
    
    const images = [];
    
    // Pegar imagens da galeria
    const gallery = productCard.querySelector('.model-images');
    if (gallery) {
        const galleryImages = gallery.querySelectorAll('.model-image');
        galleryImages.forEach(img => {
            if (img.src) {
                images.push(img.src);
            }
        });
    }
    
    // Se não houver galeria, pegar a imagem principal
    if (images.length === 0) {
        const mainImage = productCard.querySelector('.model-image');
        if (mainImage && mainImage.src) {
            images.push(mainImage.src);
        }
    }
    
    // Pegar preço
    const priceElement = productCard.querySelector('.model-price');
    const priceText = priceElement ? priceElement.textContent : 'R$0,00';
    const price = parseFloat(priceText.replace('R$', '').replace(',', '.').trim());
    
    // Pegar descrição do atributo data-descricao no botão do card
    const btn = productCard.querySelector('.view-details-btn');
    const description = (btn && btn.getAttribute('data-descricao'))
        ? btn.getAttribute('data-descricao')
        : `Camisa ${productName} - Vista-se com propósito e espalhe fé através da moda.`;
    
    return {
        name: productName,
        images: images,
        price: price,
        description: description
    };
}

// Função para calcular o tamanho REAL da imagem renderizada
function getActualImageBounds(img) {
    const imgRect = img.getBoundingClientRect();
    
    // Pegar dimensões naturais da imagem
    const naturalWidth = img.naturalWidth;
    const naturalHeight = img.naturalHeight;
    
    if (!naturalWidth || !naturalHeight) {
        return imgRect; // Imagem não carregada, retorna o rect normal
    }
    
    // Calcular proporção
    const imgRatio = naturalWidth / naturalHeight;
    const containerRatio = imgRect.width / imgRect.height;
    
    let actualWidth, actualHeight, offsetX, offsetY;
    
    if (imgRatio > containerRatio) {
        // Imagem é mais larga - usa a largura total
        actualWidth = imgRect.width;
        actualHeight = imgRect.width / imgRatio;
        offsetX = 0;
        offsetY = (imgRect.height - actualHeight) / 2;
    } else {
        // Imagem é mais alta - usa a altura total
        actualHeight = imgRect.height;
        actualWidth = imgRect.height * imgRatio;
        offsetY = 0;
        offsetX = (imgRect.width - actualWidth) / 2;
    }
    
    return {
        left: imgRect.left + offsetX,
        top: imgRect.top + offsetY,
        right: imgRect.left + offsetX + actualWidth,
        bottom: imgRect.top + offsetY + actualHeight,
        width: actualWidth,
        height: actualHeight,
        x: imgRect.left + offsetX,
        y: imgRect.top + offsetY
    };
}

// Função para configurar zoom na imagem - VERSÃO MELHORADA
function setupImageZoom(imageElement) {
    // Remover zoom anterior
    removeImageZoom();
    
    const container = imageElement.parentElement;
    
    // Criar lupa
    zoomLens = document.createElement('div');
    zoomLens.className = 'zoom-lens';
    zoomLens.style.display = 'none';
    zoomLens.style.opacity = '0';
    zoomLens.style.transition = 'opacity 0.15s ease';
    container.appendChild(zoomLens);
    
    let isActive = false;
    let fadeTimeout = null;
    
    function handleMouseMove(e) {
        // Aguardar imagem carregar
        if (!imageElement.complete || !imageElement.naturalWidth) {
            hideLens();
            return;
        }
        
        // Pegar bounds REAIS da imagem
        const actualBounds = getActualImageBounds(imageElement);
        const containerRect = container.getBoundingClientRect();
        
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        
        // Verificar se está sobre a imagem REAL
        if (mouseX < actualBounds.left || mouseX > actualBounds.right ||
            mouseY < actualBounds.top || mouseY > actualBounds.bottom) {
            hideLens();
            return;
        }
        
        // Limpar timeout de fade se existir
        if (fadeTimeout) {
            clearTimeout(fadeTimeout);
            fadeTimeout = null;
        }
        
        // Está sobre a imagem
        isActive = true;
        zoomLens.style.display = 'block';
        
        // Tamanho da lente
        const lensSize = 140;
        const halfLens = lensSize / 2;
        
        // Posição da lente (relativa ao container) - SEM LIMITES
        let lensX = mouseX - containerRect.left - halfLens;
        let lensY = mouseY - containerRect.top - halfLens;
        
        // Calcular distância das bordas para fade effect
        const distanceFromLeft = lensX + halfLens - (actualBounds.left - containerRect.left);
        const distanceFromRight = (actualBounds.right - containerRect.left) - (lensX + halfLens);
        const distanceFromTop = lensY + halfLens - (actualBounds.top - containerRect.top);
        const distanceFromBottom = (actualBounds.bottom - containerRect.top) - (lensY + halfLens);
        
        // Definir zona de fade (quando está muito próximo da borda)
        const fadeZone = halfLens;
        let opacity = 1;
        
        // Calcular opacity baseado na menor distância
        const minDistance = Math.min(
            distanceFromLeft,
            distanceFromRight,
            distanceFromTop,
            distanceFromBottom
        );
        
        if (minDistance < fadeZone) {
            // Fade progressivo quando se aproxima da borda
            opacity = Math.max(0, minDistance / fadeZone);
        }
        
        // Aplicar posição e opacity
        zoomLens.style.width = lensSize + 'px';
        zoomLens.style.height = lensSize + 'px';
        zoomLens.style.left = lensX + 'px';
        zoomLens.style.top = lensY + 'px';
        zoomLens.style.opacity = opacity;
        
        // Calcular posição na imagem REAL
        const x = mouseX - actualBounds.left;
        const y = mouseY - actualBounds.top;
        
        const bgX = (x / actualBounds.width) * 100;
        const bgY = (y / actualBounds.height) * 100;
        
        // Zoom
        const zoomFactor = 1.6;
        const bgWidth = actualBounds.width * zoomFactor;
        const bgHeight = actualBounds.height * zoomFactor;
        
        zoomLens.style.backgroundImage = `url('${imageElement.src}')`;
        zoomLens.style.backgroundPosition = `${bgX}% ${bgY}%`;
        zoomLens.style.backgroundSize = `${bgWidth}px ${bgHeight}px`;
    }
    
    function hideLens() {
        // Fade out suave antes de esconder
        zoomLens.style.opacity = '0';
        fadeTimeout = setTimeout(() => {
            zoomLens.style.display = 'none';
            isActive = false;
        }, 150); // Tempo da transição
    }
    
    function handleMouseLeave() {
        hideLens();
    }
    
    // Adicionar eventos
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);
    imageElement.addEventListener('mouseleave', handleMouseLeave);
    
    // Guardar handlers
    currentZoomHandlers = {
        container: container,
        imageElement: imageElement,
        handleMouseMove: handleMouseMove,
        handleMouseLeave: handleMouseLeave
    };
}

// Função para remover zoom
function removeImageZoom() {
    if (currentZoomHandlers) {
        const { container, imageElement, handleMouseMove, handleMouseLeave } = currentZoomHandlers;
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseleave', handleMouseLeave);
        if (imageElement) {
            imageElement.removeEventListener('mouseleave', handleMouseLeave);
        }
        currentZoomHandlers = null;
    }
    
    if (zoomLens && zoomLens.parentElement) {
        zoomLens.remove();
    }
    zoomLens = null;
}

// Configurar galeria de imagens
function setupProductGallery(images) {
    const mainImage = document.getElementById('product-main-image');
    const thumbnailsContainer = document.getElementById('product-thumbnails');
    
    // Remover zoom antigo
    removeImageZoom();
    
    if (!images || images.length === 0) {
        images = ['./images/placeholder.jpg'];
    }
    
    // Definir imagem principal
    mainImage.src = images[0];
    
    // Aguardar carregamento antes de configurar zoom
    mainImage.onload = function() {
        // Pequeno delay para garantir que o DOM está atualizado
        setTimeout(() => {
            setupImageZoom(mainImage);
        }, 100);
    };
    
    // Criar miniaturas
    thumbnailsContainer.innerHTML = '';
    images.forEach((imgSrc, index) => {
        const thumbnail = document.createElement('img');
        thumbnail.src = imgSrc;
        thumbnail.className = `product-thumbnail ${index === 0 ? 'active' : ''}`;
        thumbnail.alt = `${currentProduct} - Imagem ${index + 1}`;
        
        thumbnail.addEventListener('click', function() {
            // Remover zoom antes de trocar
            removeImageZoom();
            
            // Trocar imagem
            mainImage.src = imgSrc;
            
            // Atualizar miniaturas ativas
            document.querySelectorAll('.product-thumbnail').forEach(t => t.classList.remove('active'));
            thumbnail.classList.add('active');
            
            // Reconfigurar zoom
            mainImage.onload = function() {
                setTimeout(() => {
                    setupImageZoom(mainImage);
                }, 100);
            };
        });
        
        thumbnailsContainer.appendChild(thumbnail);
    });
}

// Retorna somente as imagens que já existem, evitando miniaturas quebradas.
function getAvailableVariantImages(images) {
    return Promise.all(images.map(src => new Promise(resolve => {
        const image = new Image();
        image.onload = () => resolve(src);
        image.onerror = () => resolve(null);
        image.src = src;
    }))).then(results => results.filter(Boolean));
}

// Atualiza preço e galeria ao trocar o tipo do produto.
async function updateProductVariant(type) {
    const product = getProdutoData(currentProduct);
    const variant = productVariants[currentProduct]?.[type];

    if (!product) return;

    selectedPrice = variant?.price ?? product.price;
    document.getElementById('modal-product-price').textContent =
        `R$ ${selectedPrice.toFixed(2).replace('.', ',')}`;

    if (!variant?.images) {
        setupProductGallery(product.images);
        return;
    }

    const variantImages = await getAvailableVariantImages(variant.images);

    // Impede que um carregamento anterior sobrescreva uma seleção mais recente.
    if (selectedType !== type) return;

    setupProductGallery(variantImages.length > 0 ? variantImages : product.images);
}

// Verificar se um produto está esgotado pelo atributo data-esgotado do botão do card
function isProductEsgotado(productName) {
    const cards = document.querySelectorAll('.item-model');
    for (let card of cards) {
        const nameEl = card.querySelector('.name-model');
        if (nameEl && nameEl.textContent.trim() === productName) {
            const btn = card.querySelector('.view-details-btn');
            return btn && btn.getAttribute('data-esgotado') === 'true';
        }
    }
    return false;
}

// Abrir modal de produto
function openProductModal(productName) {
    const modal = document.getElementById('product-modal');
    const product = getProdutoData(productName);
    
    if (!product) {
        console.error('Produto não encontrado:', productName);
        return;
    }
    
    currentProduct = productName;
    selectedType = null;
    selectedSize = null;
    selectedComboSizes = {};
    selectedPrice = product.price;

    renderProductTypes(productName);
    renderProductCombos(productName);
    
    // Preencher informações do produto
    document.getElementById('modal-product-title').textContent = product.name;
    document.getElementById('modal-product-description').textContent = product.description;

    // Verificar se esgotado
    const esgotado = isProductEsgotado(productName);

    // Preço: riscado se esgotado
    const priceEl = document.getElementById('modal-product-price');
    priceEl.innerHTML = esgotado
        ? `<span style="text-decoration:line-through;color:#666;font-size:0.85em;">R$ ${product.price.toFixed(2)}</span>`
        : `R$ ${product.price.toFixed(2)}`;

    // Banner de esgotado (inserir após o preço)
    const existingBanner = document.getElementById('soldout-modal-banner');
    if (existingBanner) existingBanner.remove();

    if (esgotado) {
        const banner = document.createElement('div');
        banner.id = 'soldout-modal-banner';
        banner.className = 'soldout-modal-banner';
        banner.innerHTML = `
            <i class="fas fa-ban"></i>
            <div class="soldout-modal-banner-text">
                <strong>Produto Esgotado</strong>
                <p>Este modelo está temporariamente indisponível. Fique atento às novidades!</p>
            </div>`;
        priceEl.insertAdjacentElement('afterend', banner);
    }

    // Botão de adicionar ao carrinho
    const addBtn = document.getElementById('product-add-to-cart');
    if (esgotado) {
        addBtn.disabled = true;
        addBtn.classList.add('soldout-disabled');
        addBtn.innerHTML = '<i class="fas fa-ban"></i> Produto Esgotado';
    } else {
        addBtn.disabled = false;
        addBtn.classList.remove('soldout-disabled');
        addBtn.innerHTML = '<i class="fas fa-shopping-cart"></i> Adicionar ao Carrinho';
    }

    // Ocultar seções de tipo/tamanho se esgotado
    const typeSection = document.querySelector('.product-type-section');
    const sizeSection = document.querySelector('.product-size-section');
    const sizeGuide = document.querySelector('.size-guide');
    if (typeSection) typeSection.style.display = esgotado ? 'none' : '';
    if (sizeSection) sizeSection.style.display = esgotado ? 'none' : '';
    if (sizeGuide) sizeGuide.style.display = esgotado ? 'none' : '';
    
    // Configurar galeria de imagens
    setupProductGallery(product.images);
    
    // Resetar seleções (só se disponível)
    if (!esgotado) resetSelections();
    
    // Mostrar modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Fechar modal
function closeProductModal() {
    const modal = document.getElementById('product-modal');
    
    // Remover zoom ao fechar
    removeImageZoom();
    
    // Remover classe active - o CSS transition cuida da animação suavemente
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
    
    // Limpar estado após a transição terminar
    setTimeout(() => {
        currentProduct = null;
        selectedType = null;
        selectedSize = null;
        selectedComboSizes = {};
        selectedPrice = null;
    }, 350); // Igual ao tempo de transition no CSS
}

// Montar os tipos disponíveis para cada produto
function renderProductTypes(productName) {
    const typeOptionsContainer = document.getElementById('product-type-options');
    const availableTypes = productTypes[productName] || defaultProductTypes;

    typeOptionsContainer.innerHTML = '';

    availableTypes.forEach(type => {
        const typeOption = document.createElement('button');
        typeOption.type = 'button';
        typeOption.className = 'type-option';
        typeOption.textContent = sizesConfig[type].label;
        typeOption.onclick = () => selectType(type, typeOption);
        typeOptionsContainer.appendChild(typeOption);
    });
}

// Exibir combos somente para o modelo Frutos
function renderProductCombos(productName) {
    const comboSection = document.getElementById('product-combo-section');
    const comboOptions = document.getElementById('product-combo-options');

    comboOptions.innerHTML = '';
    comboSection.hidden = productName !== 'Frutos';

    if (productName !== 'Frutos') return;

    [
        { type: 'combo_camisa_cropped', name: 'Camisa + Cropped', originalPrice: 100, price: 90, savings: 10 },
        { type: 'combo_completo', name: 'Camisa + Cropped + Moletom', originalPrice: 210, price: 180, savings: 30 }
    ].forEach(combo => {
        const option = document.createElement('button');
        option.type = 'button';
        option.className = 'combo-option';
        option.innerHTML = `
            <span class="combo-check"><i class="fas fa-check"></i></span>
            <span class="combo-option-content">
                <strong>${combo.name}</strong>
                <small class="combo-original-price">De R$ ${combo.originalPrice},00</small>
                <span class="combo-price">R$ ${combo.price},00</span>
            </span>
            <span class="combo-saving">Economize R$ ${combo.savings}</span>`;
        option.onclick = () => selectType(combo.type, option);
        comboOptions.appendChild(option);
    });
}

// Selecionar tipo de camisa
function selectType(type, clickedOption) {
    selectedType = type;
    selectedSize = null;
    selectedComboSizes = {};
    
    // Atualizar UI dos tipos
    document.querySelectorAll('.type-option, .combo-option').forEach(option => {
        option.classList.remove('selected');
    });
    if (clickedOption) clickedOption.classList.add('selected');
    
    // Atualizar tamanhos disponíveis
    updateAvailableSizes(type);
    
    // Atualizar imagem da tabela de medidas
    updateSizeGuideImage(type);

    // Atualizar preço e fotos da variação
    updateProductVariant(type);
    
    // Esconder warning
    document.getElementById('selection-warning').classList.remove('show');
}

// Atualizar tamanhos disponíveis baseado no tipo
function updateAvailableSizes(type) {
    const sizeOptionsContainer = document.getElementById('product-size-options');
    const config = sizesConfig[type];
    
    sizeOptionsContainer.innerHTML = '';
    sizeOptionsContainer.classList.toggle('combo-mode', Boolean(config.items));

    if (config.items) {
        config.items.forEach(item => {
            const group = document.createElement('div');
            group.className = 'combo-size-group';
            group.innerHTML = `<span class="combo-size-label"><i class="fas fa-shirt"></i>${item.label}</span>`;

            const options = document.createElement('div');
            options.className = 'combo-size-options';

            item.sizes.forEach(size => {
                const sizeOption = document.createElement('div');
                sizeOption.className = 'size-option';
                sizeOption.textContent = size;
                sizeOption.dataset.item = item.key;
                sizeOption.onclick = () => selectSize(size, item.key);
                options.appendChild(sizeOption);
            });

            group.appendChild(options);
            sizeOptionsContainer.appendChild(group);
        });
        return;
    }
    
    config.sizes.forEach(size => {
        const sizeOption = document.createElement('div');
        sizeOption.className = 'size-option';
        sizeOption.textContent = size;
        sizeOption.onclick = () => selectSize(size);
        sizeOptionsContainer.appendChild(sizeOption);
    });
}

// Atualizar imagem da tabela de medidas
function updateSizeGuideImage(type) {
    const config = sizesConfig[type];
    const itemTypeMap = { camisa: 'oversized', cropped: 'cropped', moletom: 'moletom' };

    currentSizeGuides = config.items
        ? config.items.map(item => ({
            label: item.label,
            image: sizesConfig[itemTypeMap[item.key]].sizeGuideImage
        }))
        : [{ label: config.label, image: config.sizeGuideImage }];
    currentSizeGuideIndex = 0;
    renderCurrentSizeGuide();
}

function renderCurrentSizeGuide() {
    const sizeGuideImg = document.getElementById('size-guide-image');
    const label = document.getElementById('size-guide-label');
    const counter = document.getElementById('size-guide-counter');
    const prevButton = document.getElementById('size-guide-prev');
    const nextButton = document.getElementById('size-guide-next');
    const guide = currentSizeGuides[currentSizeGuideIndex];

    if (!guide) return;

    label.textContent = guide.label;
    counter.textContent = currentSizeGuides.length > 1
        ? `${currentSizeGuideIndex + 1} de ${currentSizeGuides.length}`
        : '';
    prevButton.hidden = currentSizeGuides.length <= 1;
    nextButton.hidden = currentSizeGuides.length <= 1;
    sizeGuideImg.alt = `Tabela de medidas: ${guide.label}`;
    sizeGuideImg.onerror = () => {
        sizeGuideImg.onerror = null;
        sizeGuideImg.src = './images/tabela-oversized.jpeg';
    };
    sizeGuideImg.src = guide.image;
}

function changeSizeGuide(direction) {
    if (currentSizeGuides.length <= 1) return;

    currentSizeGuideIndex = (
        currentSizeGuideIndex + direction + currentSizeGuides.length
    ) % currentSizeGuides.length;
    renderCurrentSizeGuide();
}

// Selecionar tamanho
function selectSize(size, itemKey = null) {
    if (itemKey) {
        selectedComboSizes[itemKey] = size;
    } else {
        selectedSize = size;
    }
    
    // Atualizar UI dos tamanhos
    document.querySelectorAll('.size-option').forEach(option => {
        const sameGroup = itemKey ? option.dataset.item === itemKey : !option.dataset.item;
        if (sameGroup) option.classList.remove('selected');
        if (sameGroup && option.textContent === size) {
            option.classList.add('selected');
        }
    });
    
    // Esconder warning
    document.getElementById('selection-warning').classList.remove('show');
}

// Resetar seleções
function resetSelections() {
    selectedComboSizes = {};
    // Resetar tipos
    document.querySelectorAll('.type-option, .combo-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // Configurar tamanhos padrão (Oversized - única disponível)
    updateAvailableSizes('oversized');
    updateSizeGuideImage('oversized');
    
    // Esconder warning
    document.getElementById('selection-warning').classList.remove('show');
    
    // Fechar tabela de medidas
    const sizeGuideContent = document.getElementById('size-guide-content');
    const sizeGuideToggle = document.getElementById('size-guide-toggle');
    if (sizeGuideContent) {
        sizeGuideContent.classList.remove('show');
    }
    if (sizeGuideToggle) {
        sizeGuideToggle.classList.remove('active');
    }
}

// Toggle da tabela de medidas
function toggleSizeGuide() {
    const sizeGuideContent = document.getElementById('size-guide-content');
    const sizeGuideToggle = document.getElementById('size-guide-toggle');
    
    sizeGuideContent.classList.toggle('show');
    sizeGuideToggle.classList.toggle('active');
}

// Adicionar ao carrinho do modal
function addToCartFromModal() {
    const warningElement = document.getElementById('selection-warning');
    
    // Validar seleções
    if (!selectedType) {
        warningElement.textContent = '⚠️ Por favor, selecione o tipo de camisa';
        warningElement.classList.add('show');
        return;
    }
    
    const selectedConfig = sizesConfig[selectedType];
    const missingComboItem = selectedConfig.items?.find(item => !selectedComboSizes[item.key]);

    if (missingComboItem) {
        warningElement.textContent = `⚠️ Selecione o tamanho de: ${missingComboItem.label}`;
        warningElement.classList.add('show');
        return;
    }

    if (!selectedConfig.items && !selectedSize) {
        warningElement.textContent = '⚠️ Por favor, selecione um tamanho';
        warningElement.classList.add('show');
        return;
    }
    
    // Pegar preço do produto
    const product = getProdutoData(currentProduct);
    
    // Montar nome completo do produto
    const typeLabel = selectedConfig.label;
    const sizeDescription = selectedConfig.items
        ? selectedConfig.items.map(item => `${item.label}: ${selectedComboSizes[item.key]}`).join(', ')
        : selectedSize;
    const fullProductName = `${currentProduct} - ${typeLabel} (${sizeDescription})`;
    const price = selectedPrice ?? product.price;
    
    // Adicionar ao carrinho
    addToCart(fullProductName, price);
    
    // Fechar modal
    closeProductModal();
}

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    // Modificar os cards de produto para abrir o modal ao clicar
    document.querySelectorAll('.item-model').forEach(card => {
        const productName = card.querySelector('.name-model').textContent.trim();
        
        // Adicionar cursor pointer
        card.style.cursor = 'pointer';
        
        // Clicar no card abre o modal
        card.addEventListener('click', function(e) {
            // Não abrir modal se clicar no botão
            if (!e.target.closest('.view-details-btn')) {
                openProductModal(productName);
            }
        });
    });

    // Event listener específico para os botões "Escolher Modelo"
    document.querySelectorAll('.view-details-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const productName = this.getAttribute('data-modelo');
            openProductModal(productName);
        });
    });
    
    // Fechar modal ao clicar no botão X
    const closeBtn = document.getElementById('close-product-modal');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeProductModal);
    }
    
    // Fechar modal ao clicar fora
    const modal = document.getElementById('product-modal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeProductModal();
            }
        });
    }
    
    // Fechar modal com ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
            closeProductModal();
        }
    });
});
