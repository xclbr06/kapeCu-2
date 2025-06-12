document.addEventListener('DOMContentLoaded', function () {
    const selectedCategory = localStorage.getItem('selectedCategory') || 'all';
    filterItems(selectedCategory);

    function setCategory(category) {
        localStorage.setItem('selectedCategory', category);
        filterItems(category);
    }
    window.setCategory = setCategory;

    function filterItems(category) {
        const items = document.querySelectorAll('.product-card');
        items.forEach(item => {
            if (category === 'all' || item.dataset.category === category) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });

        document.querySelectorAll('.categories li').forEach(li => {
            li.classList.toggle('active', li.dataset.category === category);
        });
    }

    document.getElementById('search-query').addEventListener('input', function() {
        const query = this.value.toLowerCase();
        const products = document.querySelectorAll('.product-card');
        products.forEach(product => {
            const name = product.getAttribute('data-name').toLowerCase();
            if (name.includes(query)) {
                product.style.display = '';
            } else {
                product.style.display = 'none';
            }
        });
    });

    document.getElementById('clear-search-button').addEventListener('click', function() {
        const searchInput = document.getElementById('search-query');
        searchInput.value = '';
        searchInput.dispatchEvent(new Event('input'));
    });

    const selectedProductsSection = document.getElementById('selected-products-section');
    const totalAmountElement = document.getElementById('total-amount');
    const totalAmountSection = document.getElementById('total-amount-section');
    const formTotalAmount = document.getElementById('form-total-amount');
    const formProducts = document.getElementById('form-products');
    const cashAmountInput = document.getElementById('cash-amount');
    const changeAmountElement = document.getElementById('change-amount');
    const formChange = document.getElementById('form-change');
    const cashErrorElement = document.getElementById('cash-error');
    const submitButton = document.getElementById('submit-button');
    const productItems = document.querySelectorAll('.product-card');
    const selectedProducts = {};

    productItems.forEach(item => {
        if (item.getAttribute('data-available') === 'false') return;
        item.addEventListener('click', function () {
            const productId = this.getAttribute('data-id');
            const productName = this.getAttribute('data-name');
            const productPrice = parseFloat(this.getAttribute('data-price'));

            if (selectedProducts[productId]) {
                removeProductFromSelectedSection(productId);
                this.classList.remove('active_product');
            } else {
                selectedProducts[productId] = {
                    id: productId,
                    name: productName,
                    price: productPrice,
                    quantity: 1
                };
                addProductToSelectedSection(productId);
                this.classList.add('active_product');
            }
        });
    });

    function addProductToSelectedSection(productId) {
        const product = selectedProducts[productId];
        const productElement = document.createElement('div');
        productElement.classList.add('selected-product');
        productElement.setAttribute('data-id', productId);
        productElement.innerHTML = `
            <h4>${product.name}</h4>
            <p>Price: ₱${product.price.toFixed(2)}</p>
            <div class="quantity-controls">
                <span>Quantity:</span>
                <button type="button" class="quantity-btn decrement">-</button>
                <span class="quantity">${product.quantity}</span>
                <button type="button" class="quantity-btn increment">+</button>
            </div>
            <p class="subtotal">Total: ₱<span class="total">${(product.price * product.quantity).toFixed(2)}</span></p>
            <button type="button" class="cancel-btn cancel">X</button>
        `;
        selectedProductsSection.appendChild(productElement);

        productElement.querySelector('.increment').addEventListener('click', function () {
            updateQuantity(productId, 1);
        });

        productElement.querySelector('.decrement').addEventListener('click', function () {
            updateQuantity(productId, -1);
        });

        productElement.querySelector('.cancel').addEventListener('click', function () {
            removeProductFromSelectedSection(productId);
            document.querySelector(`.product-card[data-id="${productId}"]`).classList.remove('active_product');
        });

        updateTotalAmount();
    }

    function removeProductFromSelectedSection(productId) {
        delete selectedProducts[productId];
        const productElement = selectedProductsSection.querySelector(`.selected-product[data-id="${productId}"]`);
        if (productElement) {
            selectedProductsSection.removeChild(productElement);
        }
        updateTotalAmount();
    }

    function updateQuantity(productId, change) {
        const product = selectedProducts[productId];
        product.quantity += change;
        if (product.quantity < 1) {
            product.quantity = 1;
        }
        const productElement = selectedProductsSection.querySelector(`.selected-product[data-id="${productId}"]`);
        productElement.querySelector('.quantity').textContent = product.quantity;
        productElement.querySelector('.total').textContent = (product.price * product.quantity).toFixed(2);
        updateTotalAmount();
    }

    function updateTotalAmount() {
        let totalAmount = 0;
        const productsArray = [];
        for (const productId in selectedProducts) {
            const product = selectedProducts[productId];
            const subtotal = product.price * product.quantity;
            totalAmount += subtotal;
            productsArray.push({
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: product.quantity,
                subtotal: subtotal
            });
        }
        totalAmountElement.textContent = totalAmount.toFixed(2);
        formTotalAmount.value = totalAmount.toFixed(2);
        formProducts.value = JSON.stringify(productsArray);

        if (productsArray.length > 0) {
            totalAmountSection.style.display = 'block';
        } else {
            totalAmountSection.style.display = 'none';
        }

        updateChange();
    }

    cashAmountInput.addEventListener('input', updateChange);

    function updateChange() {
        const cashAmount = parseFloat(cashAmountInput.value) || 0;
        const totalAmount = parseFloat(formTotalAmount.value) || 0;
        const change = cashAmount - totalAmount;
        changeAmountElement.textContent = change.toFixed(2);
        formChange.value = change.toFixed(2);

        if (cashAmount >= totalAmount && cashAmount > 0) {
            cashErrorElement.style.display = 'none';
            submitButton.disabled = false;
        } else {
            cashErrorElement.style.display = 'block';
            submitButton.disabled = true;
        }
    }

    function generateReceiptHTML(transaction, receipt_id) {
        let itemsHtml = '';
        transaction.products.forEach(p => {
            itemsHtml += `<tr>
                <td>${p.name}</td>
                <td>${p.quantity}</td>
                <td>₱${parseFloat(p.price).toFixed(2)}</td>
            </tr>`;
        });
        const now = new Date();
        return `
            <div class="receipt-header">Cafe Name</div>
            <div class="receipt-row receipt-number">Receipt #: ${receipt_id}</div>
            <div class="receipt-row receipt-mode">Mode: ${transaction.mode_of_payment}</div>
            <div class="receipt-row receipt-date">Date: ${now.toLocaleString()}</div>
            <hr class="receipt-hr">
            <table class="receipt-table">
                <tr class="receipt-table-header">
                    <td>Item</td>
                    <td>Qty</td>
                    <td>Price</td>
                </tr>
                ${itemsHtml}
            </table>
            <hr class="receipt-hr">
            <div class="receipt-row receipt-total">Total: ₱${parseFloat(transaction.total_amount).toFixed(2)}</div>
            <div class="receipt-row receipt-cash">Cash: ₱${parseFloat(transaction.cash_amount).toFixed(2)}</div>
            <div class="receipt-row receipt-change">Change: ₱${parseFloat(transaction.change).toFixed(2)}</div>
            `;
    }

    function printDiv(divId) {
        var printContents = document.getElementById(divId).innerHTML;
        var originalContents = document.body.innerHTML;
        document.body.innerHTML = printContents;
        window.print();
        document.body.innerHTML = originalContents;
    }
    window.printDiv = printDiv;

    document.getElementById('transaction-form').addEventListener('submit', function(e) {
        e.preventDefault();

        const formData = new FormData(this);
        const transaction = {
            user_id: formData.get('user_id'),
            total_amount: formData.get('total_amount'),
            products: JSON.parse(formData.get('products')),
            mode_of_payment: formData.get('mode_of_payment'),
            cash_amount: formData.get('cash_amount'),
            change: formData.get('change')
        };

        let transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        transactions.push(transaction);
        localStorage.setItem('transactions', JSON.stringify(transactions));

        fetch('/purchase', {
            method: 'POST',
            headers: { 'X-Requested-With': 'XMLHttpRequest' },
            body: new URLSearchParams([...formData])
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById('receipt-area').innerHTML = generateReceiptHTML(transaction, data.receipt_id);
                document.getElementById('receipt-modal').style.display = 'flex';
                document.getElementById('transaction-form').reset();
                document.getElementById('selected-products-section').innerHTML = '';
                document.getElementById('total-amount-section').style.display = 'none';

                for (const key in selectedProducts) {
                    delete selectedProducts[key];
                }
                document.querySelectorAll('.product-card.active_product').forEach(item => {
                    item.classList.remove('active_product');
                });

                submitButton.disabled = true;
                cashAmountInput.value = '';
                changeAmountElement.textContent = '0.00';
                formChange.value = '0';

                document.getElementById('purchase-message').innerHTML =
                    '<div class="flash-message flash-success">Transaction recorded successfully!</div>';
                setTimeout(() => {
                    document.getElementById('purchase-message').innerHTML = '';
                }, 3000);

            } else {
                alert(data.message || 'Transaction failed.');
            }
        })
        .catch(() => {
            alert('Error submitting transaction.');
        });
    });
});