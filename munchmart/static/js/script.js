function filterMenu(category) {
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        if (category === 'all') {
            item.style.display = 'block';
        } else if (category === 'veg') {
            item.style.display = item.classList.contains('veg') ? 'block' : 'none';
        } else if (category === 'non-veg') {
            item.style.display = item.classList.contains('non-veg') ? 'block' : 'none';
        }
    });
}

document.addEventListener("DOMContentLoaded", function() {
    const searchBar = document.querySelector('.search-bar');
    if (searchBar) {
        searchBar.addEventListener('input', function() {
            const query = this.value.toLowerCase();
            const menuItems = document.querySelectorAll('.menu-item');
            menuItems.forEach(item => {
                const title = item.querySelector('.menu-title').textContent.toLowerCase();
                item.style.display = title.includes(query) ? 'block' : 'none';
            });
        });
    }
});

document.addEventListener("DOMContentLoaded", function () {
    
    feather.replace(); // Ensure icons load properly
   
    
    
   
    
});
document.addEventListener("DOMContentLoaded", () => {
    feather.replace(); // Refresh feather icons to apply styles
    updateCartCount(); // Ensure cart count updates on page load
});

function redirectToCart() {
    window.location.href = "/cart"; // Redirect to cart page
}

// Function to add an item to the cart
let cart = JSON.parse(localStorage.getItem("cart")) || []; // Load existing cart

function addToCart(itemName, itemPrice) {
    let existingItem = cart.find(item => item.name === itemName);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ name: itemName, price: itemPrice, quantity: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(cart)); // Save cart to localStorage
    updateCartCount(); // Update the cart count on UI
}
function updateCartCount() {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let cartCount = document.getElementById("cart-count");

    if (cart.length > 0) {
        cartCount.style.display = "flex"; // Show badge when items are added
        cartCount.innerText = cart.length;
    } else {
        cartCount.style.display = "none"; // Hide when empty
    }
}

// Run on page load
document.addEventListener("DOMContentLoaded", () => {
    feather.replace(); // Refresh feather icons
    updateCartCount(); // Update count on load
});



