document.addEventListener('DOMContentLoaded', function() {
    // Load cart from localStorage
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartItemsContainer = document.getElementById('cartItems');
    const itemCountElement = document.getElementById('item-count');
    const subtotalElement = document.getElementById('subtotal');
    const deliveryFeeElement = document.getElementById('delivery-fee');
    const taxesElement = document.getElementById('taxes');
    const totalElement = document.getElementById('total');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const clearCartBtn = document.getElementById('clearCart');
    const applyPromoBtn = document.getElementById('applyPromo');
    const promoCodeInput = document.getElementById('promoCode');
    const promoMessage = document.getElementById('promoMessage');

    // Enhanced add to cart functionality with animation
function addToCart(name, price, image, buttonElement) {
    // Get the current cart from local storage or initialize an empty array
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Get quantity from input
    const quantityInput = buttonElement.parentElement.querySelector('.quantity-input');
    const quantity = quantityInput ? parseInt(quantityInput.value) : 1;
    
    // Check if the item already exists in the cart
    let itemIndex = cart.findIndex(item => item.name === name);
    
    if (itemIndex !== -1) {
        // If the item exists, increase the quantity
        cart[itemIndex].quantity += quantity;
    } else {
        // If the item doesn't exist, add it to the cart
        cart.push({ 
            name: name, 
            price: price, 
            quantity: quantity,
            image: image 
        });
    }
    
    // Save the updated cart back to local storage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update the cart count in the floating cart icon
    updateCartCount();
    
    // Add animation to button
    buttonElement.classList.add('added');
    
    // Change button text temporarily
    const originalHTML = buttonElement.innerHTML;
    buttonElement.innerHTML = '<i class="fas fa-check"></i> Added!';
    
    // Reset button after animation
    setTimeout(() => {
        buttonElement.classList.remove('added');
        buttonElement.innerHTML = originalHTML;
        
        // Reset quantity to 1 if needed
        if (quantityInput) {
            quantityInput.value = 1;
        }
    }, 1500);
}

// Quick add functionality (for the + button that appears on hover)
function quickAddToCart(name, price, image, buttonElement) {
    // Add item to cart with quantity 1
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Check if the item already exists in the cart
    let itemIndex = cart.findIndex(item => item.name === name);
    
    if (itemIndex !== -1) {
        // If the item exists, increase the quantity by 1
        cart[itemIndex].quantity += 1;
    } else {
        // If the item doesn't exist, add it to the cart with quantity 1
        cart.push({ 
            name: name, 
            price: price, 
            quantity: 1,
            image: image 
        });
    }
    
    // Save the updated cart back to local storage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update the cart count
    updateCartCount();
    
    // Add animation to button
    buttonElement.innerHTML = '<i class="fas fa-check"></i>';
    buttonElement.style.backgroundColor = '#4CAF50';
    
    // Reset button after animation
    setTimeout(() => {
        buttonElement.innerHTML = '<i class="fas fa-plus"></i>';
        buttonElement.style.backgroundColor = '';
    }, 1500);
}

// Function to update cart count
function updateCartCount() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    const cartCountElement = document.querySelector('.cart-count');
    
    // Update count with animation
    cartCountElement.textContent = totalItems;
    cartCountElement.classList.add('pulse');
    
    setTimeout(() => {
        cartCountElement.classList.remove('pulse');
    }, 500);
}

// Quantity control functions
function increaseQuantity(button) {
    const input = button.parentElement.querySelector('.quantity-input');
    const currentValue = parseInt(input.value);
    if (currentValue < parseInt(input.getAttribute('max'))) {
        input.value = currentValue + 1;
    }
}

function decreaseQuantity(button) {
    const input = button.parentElement.querySelector('.quantity-input');
    const currentValue = parseInt(input.value);
    if (currentValue > parseInt(input.getAttribute('min'))) {
        input.value = currentValue - 1;
    }
}

// Add this style for the cart count animation
document.addEventListener('DOMContentLoaded', function() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.3); }
            100% { transform: scale(1); }
        }
        
        .cart-count.pulse {
            animation: pulse 0.5s ease;
        }
        
        .floating-cart {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 60px;
            height: 60px;
            background-color: #06c167;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
            cursor: pointer;
            transition: all 0.3s ease;
            z-index: 1000;
        }
        
        .floating-cart:hover {
            background-color: #05a057;
            transform: scale(1.05);
        }
        
        .floating-cart i {
            font-size: 24px;
        }
        
        .cart-count {
            position: absolute;
            top: 0;
            right: 0;
            background-color: #ff5722;
            color: white;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: bold;
            transition: all 0.3s ease;
        }
    `;
    document.head.appendChild(style);
    
    // Initialize cart count on page load
    updateCartCount();
});
    
    // Delivery options
    const deliveryOptions = document.querySelectorAll('.option-card');
    
    // Render cart items
    function renderCart() {
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="empty-cart">
                    <img src="static/images/empty-cart.svg" alt="Empty Cart">
                    <h3>Your cart is empty</h3>
                    <p>Looks like you haven't added anything to your cart yet</p>
                    <button class="btn-primary" onclick="window.location.href='products.html'">Shop Now</button>
                </div>
            `;
            checkoutBtn.disabled = true;
            return;
        }
        
        checkoutBtn.disabled = false;
        
        cartItemsContainer.innerHTML = cart.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                <div class="cart-item-details">
                    <h3 class="cart-item-title">${item.name}</h3>
                    <p class="cart-item-weight">${item.weight || '1 unit'}</p>
                    <p class="cart-item-price">₹${item.price.toFixed(2)}</p>
                    <div class="cart-item-actions">
                        <div class="quantity-control">
                            <button class="quantity-btn minus" onclick="updateQuantity('${item.id}', -1)">-</button>
                            <span class="quantity-value">${item.quantity}</span>
                            <button class="quantity-btn plus" onclick="updateQuantity('${item.id}', 1)">+</button>
                        </div>
                        <button class="remove-btn" onclick="removeItem('${item.id}')">
                            <i class="fas fa-trash"></i> Remove
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
        
        updateCartSummary();
    }
    
    // Update cart summary (subtotal, taxes, total)
    function updateCartSummary() {
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const deliveryFee = 40; // Fixed delivery fee
        const taxes = subtotal * 0.05; // 5% tax
        const total = subtotal + deliveryFee + taxes;
        
        itemCountElement.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
        subtotalElement.textContent = `₹${subtotal.toFixed(2)}`;
        deliveryFeeElement.textContent = `₹${deliveryFee.toFixed(2)}`;
        taxesElement.textContent = `₹${taxes.toFixed(2)}`;
        totalElement.textContent = `₹${total.toFixed(2)}`;
        
        // Update cart count in header
        updateCartCount();
    }
    
    // Update cart count in header
    function updateCartCount() {
        const count = cart.reduce((sum, item) => sum + item.quantity, 0);
        document.querySelectorAll('.cart-count').forEach(el => {
            el.textContent = count;
        });
    }
    
    // Update item quantity
    window.updateQuantity = function(id, change) {
        const itemIndex = cart.findIndex(item => item.id === id);
        if (itemIndex !== -1) {
            const newQuantity = cart[itemIndex].quantity + change;
            
            if (newQuantity < 1) {
                removeItem(id);
                return;
            }
            
            cart[itemIndex].quantity = newQuantity;
            localStorage.setItem('cart', JSON.stringify(cart));
            renderCart();
        }
    };
    
    // Remove item from cart
    window.removeItem = function(id) {
        cart = cart.filter(item => item.id !== id);
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCart();
    };
    
    // Clear cart
    clearCartBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to clear your cart?')) {
            cart = [];
            localStorage.setItem('cart', JSON.stringify(cart));
            renderCart();
        }
    });
    
    // Delivery option selection
    deliveryOptions.forEach(option => {
        option.addEventListener('click', function() {
            deliveryOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            
            // Update delivery fee
            const deliveryFee = this.querySelector('.price').textContent === 'FREE' ? 0 : 40;
            deliveryFeeElement.textContent = `₹${deliveryFee.toFixed(2)}`;
            
            // Recalculate total
            const subtotal = parseFloat(subtotalElement.textContent.replace('₹', ''));
            const taxes = parseFloat(taxesElement.textContent.replace('₹', ''));
            const total = subtotal + deliveryFee + taxes;
            totalElement.textContent = `₹${total.toFixed(2)}`;
        });
    });
    
    // Apply promo code
    applyPromoBtn.addEventListener('click', function() {
        const promoCode = promoCodeInput.value.trim();
        
        if (!promoCode) {
            promoMessage.textContent = 'Please enter a promo code';
            promoMessage.className = 'promo-message error';
            return;
        }
        
        // Simulate promo code validation
        const validPromoCodes = {
            'WELCOME10': 0.1,  // 10% discount
            'FREEDELIVERY': 'free-delivery',
            'SAVE20': 0.2     // 20% discount
        };
        
        if (validPromoCodes.hasOwnProperty(promoCode.toUpperCase())) {
            const discount = validPromoCodes[promoCode.toUpperCase()];
            
            if (discount === 'free-delivery') {
                // Apply free delivery
                deliveryOptions[1].click(); // Select store pickup
                promoMessage.textContent = 'Free delivery applied!';
                promoMessage.className = 'promo-message success';
            } else {
                // Apply percentage discount
                const subtotal = parseFloat(subtotalElement.textContent.replace('₹', ''));
                const discountAmount = subtotal * discount;
                const newSubtotal = subtotal - discountAmount;
                
                subtotalElement.innerHTML = `
                    <span style="text-decoration: line-through; color: var(--grey-color);">₹${subtotal.toFixed(2)}</span>
                    ₹${newSubtotal.toFixed(2)}
                `;
                
                // Recalculate total
                const deliveryFee = parseFloat(deliveryFeeElement.textContent.replace('₹', ''));
                const taxes = newSubtotal * 0.05;
                const total = newSubtotal + deliveryFee + taxes;
                
                taxesElement.textContent = `₹${taxes.toFixed(2)}`;
                totalElement.textContent = `₹${total.toFixed(2)}`;
                
                promoMessage.textContent = `Discount of ${discount * 100}% applied!`;
                promoMessage.className = 'promo-message success';
            }
        } else {
            promoMessage.textContent = 'Invalid promo code';
            promoMessage.className = 'promo-message error';
        }
    });
    
    // Proceed to checkout
    checkoutBtn.addEventListener('click', function() {
        if (cart.length === 0) {
            alert('Your cart is empty!');
            return;
        }
        
        // Save order summary for checkout page
        const orderSummary = {
            subtotal: parseFloat(subtotalElement.textContent.replace('₹', '')),
            deliveryFee: parseFloat(deliveryFeeElement.textContent.replace('₹', '')),
            taxes: parseFloat(taxesElement.textContent.replace('₹', '')),
            total: parseFloat(totalElement.textContent.replace('₹', ''))
        };
        
        localStorage.setItem('orderSummary', JSON.stringify(orderSummary));
        window.location.href = 'checkout.html';
    });
    
    // Initialize cart
    renderCart();
});