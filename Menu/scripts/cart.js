// Sistema de Carrinho
let cart = [];

// Carregar carrinho do localStorage
function loadCart() {
    const savedCart = localStorage.getItem('holyDressCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartUI();
    }
}

// Salvar carrinho no localStorage
function saveCart() {
    localStorage.setItem('holyDressCart', JSON.stringify(cart));
}

// Mostrar notificação
function showNotification(message) {
    const notification = document.getElementById('cart-notification');
    const notificationText = document.getElementById('notification-text');
    
    notificationText.textContent = message;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Atualizar interface do carrinho
function updateCartUI() {
    const cartCount = document.getElementById('cart-count');
    const cartItems = document.getElementById('cart-items');
    const cartTotalPrice = document.getElementById('cart-total-price');
    const sendWhatsappBtn = document.getElementById('send-whatsapp');

    // Atualizar contador
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;

    // Atualizar lista de itens
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="cart-empty">Seu carrinho está vazio</p>';
        cartTotalPrice.textContent = 'R$0,00';
        sendWhatsappBtn.disabled = true;
    } else {
        cartItems.innerHTML = cart.map((item, index) => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">R$${item.price.toFixed(2)}</div>
                </div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn" onclick="decreaseQuantity(${index})">-</button>
                    <span class="quantity-value">${item.quantity}</span>
                    <button class="quantity-btn" onclick="increaseQuantity(${index})">+</button>
                </div>
                <button class="remove-item" onclick="removeItem(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');

        // Calcular total
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotalPrice.textContent = `R$${total.toFixed(2)}`;
        sendWhatsappBtn.disabled = false;
    }

    saveCart();
}

// Adicionar ao carrinho
function addToCart(name, price) {
    const existingItem = cart.find(item => item.name === name);

    if (existingItem) {
        existingItem.quantity++;
        showNotification(`${name} adicionado novamente! (${existingItem.quantity}x)`);
    } else {
        cart.push({
            name: name,
            price: parseFloat(price),
            quantity: 1
        });
        showNotification(`${name} adicionado ao carrinho!`);
    }

    updateCartUI();

    // Feedback visual no botão carrinho
    const cartButton = document.getElementById('cart-button');
    cartButton.style.animation = 'bounce 0.5s';
    setTimeout(() => {
        cartButton.style.animation = '';
    }, 500);
}

// Aumentar quantidade
function increaseQuantity(index) {
    cart[index].quantity++;
    updateCartUI();
}

// Diminuir quantidade
function decreaseQuantity(index) {
    if (cart[index].quantity > 1) {
        cart[index].quantity--;
        updateCartUI();
    }
}

// Remover item
function removeItem(index) {
    const itemName = cart[index].name;
    cart.splice(index, 1);
    updateCartUI();
    showNotification(`${itemName} removido do carrinho`);
}

// Abrir carrinho
function openCart() {
    const modal = document.getElementById('cart-modal');
    modal.classList.add('active');
    document.body.classList.add('cart-open');
}

// Fechar carrinho
function closeCart() {
    const modal = document.getElementById('cart-modal');
    modal.classList.remove('active');
    document.body.classList.remove('cart-open');
}

// Enviar para WhatsApp
function sendToWhatsApp() {
    if (cart.length === 0) return;

    const numeroWhatsApp = '5585920038680';

    let mensagem = '*Pedido Holy Dress*\n\n';
    mensagem += '*Itens do Pedido:*\n';

    cart.forEach(item => {
        mensagem += `- ${item.name} - Qtd: ${item.quantity}x - R$${(item.price * item.quantity).toFixed(2)}\n`;
    });

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    mensagem += `\n*Total: R$${total.toFixed(2)}*\n\n`;
    mensagem += 'Gostaria de finalizar este pedido. Aguardo informações sobre pagamento e entrega!';

    const mensagemCodificada = encodeURIComponent(mensagem);
    const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${mensagemCodificada}`;

    window.open(urlWhatsApp, '_blank');
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    loadCart();

    // Botões adicionar ao carrinho
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const name = this.getAttribute('data-modelo');
            const price = this.getAttribute('data-preco');
            addToCart(name, price);
        });
    });

    // Abrir/Fechar carrinho
    document.getElementById('cart-button').addEventListener('click', openCart);
    document.getElementById('close-cart').addEventListener('click', closeCart);

    // Fechar ao clicar no overlay (fundo escuro)
    document.getElementById('cart-modal').addEventListener('click', function(e) {
        // Só fecha se clicar no overlay, não na sidebar
        if (e.target === this) {
            closeCart();
        }
    });

    // Enviar WhatsApp
    document.getElementById('send-whatsapp').addEventListener('click', sendToWhatsApp);
});

// Animação do botão carrinho
const style = document.createElement('style');
style.textContent = `
    @keyframes bounce {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.2); }
    }
`;
document.head.appendChild(style);