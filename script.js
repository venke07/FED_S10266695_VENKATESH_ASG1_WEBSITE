function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

function getPriceByName(productName) {
    const prices = {
        "Rolex Submariner": "$8100",
        "Omega Seamaster": "$5200",
        "Tag Heuer Carrera": "$4500",
        "Casio G-Shock Mudmaster": "$350",
        "Garmin Fenix 6X Pro": "$700",
        "Suunto Core All Black": "$300",
        "Luxury Gold Watch": "$299",
        "Tissot Le Locle Automatic": "$199",
        "Heavy Duty Watch": "$149",
        "Garmin Forerunner 945": "$299",
        "Suunto 9 Baro": "$199",
        "Polar Vantage V2": "$149",
        "Apple : Series 10": "$399",
        "Samsung : Galaxy Watch Ultra": "$499",
        "Fitbit : Fb5": "$129"
    };
    return prices[productName] || "$0";
}

document.addEventListener('DOMContentLoaded', function() {
    // Handle "Buy Now" buttons
    const buyNowButtons = document.querySelectorAll('.buy-now');
    buyNowButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productElement = this.closest('.product, .watch-info');
            const productName = productElement.querySelector('h2, p').textContent;
            const productPrice = getPriceByName(productName);
            const productImage = productElement.querySelector('img').src;
            addToCart(productName, productPrice, productImage);
            alert('Added to cart');
        });
    });

    // Add to cart function
    function addToCart(name, price, image) {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existingProduct = cart.find(product => product.name === name);
        if (existingProduct) {
            existingProduct.quantity += 1;
        } else {
            cart.push({ name, price, image, quantity: 1 });
        }
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    // Load cart items
    function loadCart() {
        const cartTableBody = document.querySelector('.cart-table tbody');
        const cartSummary = document.querySelector('.cart-summary');
        if (cartTableBody && cartSummary) {
            let cart = JSON.parse(localStorage.getItem('cart')) || [];
            cartTableBody.innerHTML = '';
            let subtotal = 0;
            cart.forEach(product => {
                const total = parseFloat(product.price.replace('$', '')) * product.quantity;
                subtotal += total;
                cartTableBody.innerHTML += `
                    <tr>
                        <td><img src="${product.image}" alt="${product.name}" class="cart-product-image"></td>
                        <td>${product.name}</td>
                        <td>${product.price}</td>
                        <td><input type="number" value="${product.quantity}" min="1" data-name="${product.name}"></td>
                        <td>$${total.toFixed(2)}</td>
                        <td><button class="remove-btn" data-name="${product.name}">Remove</button></td>
                    </tr>
                `;
            });
            const tax = subtotal * 0.1;
            const total = subtotal + tax;
            cartSummary.innerHTML = `
                <p>Subtotal: $${subtotal.toFixed(2)}</p>
                <p>Tax: $${tax.toFixed(2)}</p>
                <p>Total: $${total.toFixed(2)}</p>
                <button class="checkout-btn" onclick="window.location.href='payment.html'">Proceed to Checkout</button>
            `;
        }
    }

    // Update cart summary
    function updateCartSummary() {
        const cartTableBody = document.querySelector('.cart-table tbody');
        const cartSummary = document.querySelector('.cart-summary');
        if (cartTableBody && cartSummary) {
            let cart = JSON.parse(localStorage.getItem('cart')) || [];
            let subtotal = 0;
            cartTableBody.querySelectorAll('tr').forEach(row => {
                const name = row.querySelector('input[type="number"]').getAttribute('data-name');
                const price = parseFloat(row.querySelector('td:nth-child(3)').textContent.replace('$', ''));
                const quantity = parseInt(row.querySelector('input[type="number"]').value);
                const total = price * quantity;
                row.querySelector('td:nth-child(5)').textContent = `$${total.toFixed(2)}`;
                subtotal += total;
                const product = cart.find(product => product.name === name);
                if (product) {
                    product.quantity = quantity;
                }
            });
            localStorage.setItem('cart', JSON.stringify(cart));
            const tax = subtotal * 0.1;
            const total = subtotal + tax;
            cartSummary.innerHTML = `
                <p>Subtotal: $${subtotal.toFixed(2)}</p>
                <p>Tax: $${tax.toFixed(2)}</p>
                <p>Total: $${total.toFixed(2)}</p>
                <button class="checkout-btn" onclick="window.location.href='payment.html'">Proceed to Checkout</button>
            `;
        }
    }

    // Handle cart table events
    const cartTable = document.querySelector('.cart-table tbody');
    if (cartTable) {
        cartTable.addEventListener('input', updateCartSummary);
        cartTable.addEventListener('click', function(event) {
            if (event.target.classList.contains('remove-btn')) {
                const name = event.target.getAttribute('data-name');
                let cart = JSON.parse(localStorage.getItem('cart')) || [];
                cart = cart.filter(product => product.name !== name);
                localStorage.setItem('cart', JSON.stringify(cart));
                loadCart();
            }
        });

        loadCart();
    }

    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.2
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 1s ease forwards';
            }
        });
    }, observerOptions);

    const watchInfoContainers = document.querySelectorAll('.watch-info-container, .watch-info-container2');
    watchInfoContainers.forEach(el => {
        observer.observe(el);
    });

    // Payment form submission
    const paymentForm = document.getElementById('payment-form');
    if (paymentForm) {
        paymentForm.addEventListener('submit', function(event) {
            event.preventDefault();
            alert('Payment successful! Your virtual receipt will be emailed to you.');

            // Example order data
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            const orderData = {
                orderNumber: '123456789',
                orderDate: new Date().toLocaleDateString(),
                orderTotal: cart.reduce((total, item) => total + parseFloat(item.price.replace('$', '')) * item.quantity, 0).toFixed(2),
                orderDetails: cart
            };

            // Save order data to localStorage
            localStorage.setItem('orderData', JSON.stringify(orderData));

            // Clear cart after payment
            localStorage.removeItem('cart');

            window.location.href = 'receipt.html';
        });
    }

    // Load order data on receipt page
    if (window.location.pathname.endsWith('receipt.html')) {
        const orderData = JSON.parse(localStorage.getItem('orderData'));

        if (orderData) {
            document.getElementById('order-number').textContent = `Order Number: ${orderData.orderNumber}`;
            document.getElementById('order-date').textContent = `Date: ${orderData.orderDate}`;
            document.getElementById('order-total').textContent = `Total: $${orderData.orderTotal}`;

            const orderDetailsTable = document.getElementById('order-details');
            orderData.orderDetails.forEach(detail => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${detail.name}</td>
                    <td>${detail.quantity}</td>
                    <td>$${(parseFloat(detail.price.replace('$', '')) * detail.quantity).toFixed(2)}</td>
                `;
                orderDetailsTable.appendChild(row);
            });
        }
    }
});