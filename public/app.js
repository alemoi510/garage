// State management
let products = [];
let editingProductId = null;

// DOM elements
const productsGrid = document.getElementById('products-grid');
const addProductBtn = document.getElementById('add-product-btn');
const productModal = document.getElementById('product-modal');
const deleteModal = document.getElementById('delete-modal');
const productForm = document.getElementById('product-form');
const closeModal = document.getElementById('close-modal');
const cancelBtn = document.getElementById('cancel-btn');
const searchInput = document.getElementById('search-input');
const modalTitle = document.getElementById('modal-title');
const closeDeleteModal = document.getElementById('close-delete-modal');
const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
const confirmDeleteBtn = document.getElementById('confirm-delete-btn');

let deleteProductId = null;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    setupEventListeners();
});

// Event listeners
function setupEventListeners() {
    addProductBtn.addEventListener('click', () => openModal());
    closeModal.addEventListener('click', () => closeModalHandler());
    cancelBtn.addEventListener('click', () => closeModalHandler());
    productForm.addEventListener('submit', handleProductSubmit);
    searchInput.addEventListener('input', handleSearch);
    
    // Delete modal handlers
    closeDeleteModal.addEventListener('click', () => closeDeleteModalHandler());
    cancelDeleteBtn.addEventListener('click', () => closeDeleteModalHandler());
    confirmDeleteBtn.addEventListener('click', handleDeleteConfirm);
    
    // Close modal on outside click
    productModal.addEventListener('click', (e) => {
        if (e.target === productModal) closeModalHandler();
    });
    deleteModal.addEventListener('click', (e) => {
        if (e.target === deleteModal) closeDeleteModalHandler();
    });
}

// Load products from API
async function loadProducts() {
    try {
        const response = await fetch('/api/products');
        if (!response.ok) throw new Error('Failed to fetch products');
        products = await response.json();
        renderProducts(products);
    } catch (error) {
        console.error('Error loading products:', error);
        showError('Failed to load products');
    }
}

// Render products to grid
function renderProducts(productsToRender) {
    if (productsToRender.length === 0) {
        productsGrid.innerHTML = `
            <div class="empty-state">
                <h2>No products found</h2>
                <p>Add your first product to get started!</p>
            </div>
        `;
        return;
    }

    productsGrid.innerHTML = productsToRender.map(product => {
        const stockLevel = getStockLevel(product.quantity);
        return `
            <div class="product-card ${product.quantity < 10 ? 'low-stock' : ''}">
                <div class="product-header">
                    <h3 class="product-name">${escapeHtml(product.name)}</h3>
                    ${product.category ? `<span class="product-category">${escapeHtml(product.category)}</span>` : ''}
                </div>
                <p class="product-description">${escapeHtml(product.description || 'No description available')}</p>
                <div class="product-details">
                    <div class="product-price">$${parseFloat(product.price).toFixed(2)}</div>
                    <div class="product-quantity">
                        <span class="quantity-label">Stock:</span>
                        <input 
                            type="number" 
                            class="quantity-input" 
                            value="${product.quantity}"
                            min="0"
                            data-product-id="${product.id}"
                            onchange="handleQuantityChange(${product.id}, this.value)"
                        >
                        <span class="stock-badge ${stockLevel}">${stockLevel}</span>
                    </div>
                </div>
                <div class="product-actions">
                    <button class="btn btn-secondary btn-small" onclick="openEditModal(${product.id})">
                        Edit
                    </button>
                    <button class="btn btn-danger btn-small" onclick="openDeleteModal(${product.id})">
                        Delete
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Get stock level indicator
function getStockLevel(quantity) {
    if (quantity < 10) return 'low';
    if (quantity < 30) return 'medium';
    return 'high';
}

// Handle search
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const filtered = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        (product.description && product.description.toLowerCase().includes(searchTerm)) ||
        (product.category && product.category.toLowerCase().includes(searchTerm))
    );
    renderProducts(filtered);
}

// Open modal for adding product
function openModal() {
    editingProductId = null;
    modalTitle.textContent = 'Add New Product';
    productForm.reset();
    productModal.classList.add('active');
}

// Open modal for editing product
function openEditModal(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    editingProductId = productId;
    modalTitle.textContent = 'Edit Product';
    
    document.getElementById('product-name').value = product.name;
    document.getElementById('product-description').value = product.description || '';
    document.getElementById('product-quantity').value = product.quantity;
    document.getElementById('product-price').value = product.price;
    document.getElementById('product-category').value = product.category || '';
    
    productModal.classList.add('active');
}

// Close modal
function closeModalHandler() {
    productModal.classList.remove('active');
    productForm.reset();
    editingProductId = null;
}

// Handle product form submission
async function handleProductSubmit(e) {
    e.preventDefault();
    
    const productData = {
        name: document.getElementById('product-name').value,
        description: document.getElementById('product-description').value,
        quantity: parseInt(document.getElementById('product-quantity').value),
        price: parseFloat(document.getElementById('product-price').value),
        category: document.getElementById('product-category').value
    };

    try {
        let response;
        if (editingProductId) {
            // Update existing product
            response = await fetch(`/api/products/${editingProductId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData)
            });
        } else {
            // Create new product
            response = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData)
            });
        }

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to save product');
        }

        closeModalHandler();
        await loadProducts();
        showSuccess(editingProductId ? 'Product updated successfully!' : 'Product added successfully!');
    } catch (error) {
        console.error('Error saving product:', error);
        showError(error.message);
    }
}

// Handle quantity change
async function handleQuantityChange(productId, newQuantity) {
    const quantity = parseInt(newQuantity);
    
    if (isNaN(quantity) || quantity < 0) {
        showError('Please enter a valid quantity');
        await loadProducts();
        return;
    }

    try {
        const response = await fetch(`/api/products/${productId}/quantity`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantity })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to update quantity');
        }

        await loadProducts();
        showSuccess('Quantity updated!');
    } catch (error) {
        console.error('Error updating quantity:', error);
        showError(error.message);
        await loadProducts();
    }
}

// Open delete confirmation modal
function openDeleteModal(productId) {
    deleteProductId = productId;
    deleteModal.classList.add('active');
}

// Close delete modal
function closeDeleteModalHandler() {
    deleteModal.classList.remove('active');
    deleteProductId = null;
}

// Handle delete confirmation
async function handleDeleteConfirm() {
    if (!deleteProductId) return;

    try {
        const response = await fetch(`/api/products/${deleteProductId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to delete product');
        }

        closeDeleteModalHandler();
        await loadProducts();
        showSuccess('Product deleted successfully!');
    } catch (error) {
        console.error('Error deleting product:', error);
        showError(error.message);
    }
}

// Utility functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showSuccess(message) {
    // Simple console log for now - could be enhanced with toast notifications
    console.log('Success:', message);
}

function showError(message) {
    // Simple alert for now - could be enhanced with toast notifications
    alert('Error: ' + message);
}
