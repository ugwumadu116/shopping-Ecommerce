// variables

const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const ProductsDOM = document.querySelector(".products-center");
//
let cart = [];

let buttonDOM = [];

//getting the products 
class Products {
    async getProducts() {
        try {
            const result = await fetch('products.json');
            const data = await result.json();
            const productsItem = data.items;
            const products = productsItem.map(item => {
                const { id } = item.sys;
                const { title, price } = item.fields;
                const image = item.fields.image.fields.file.url;
                return { id, title, price, image };
            })
            return products;
        } catch (error) {
            console.log(error)
        }
    }
};
// displaying products
class UI {
    displayProducts(products) {
        let result = '';
        products.forEach(item => {
            result += `
            <article class="product">
                <div class="img-container">
                    <img src=${item.image} alt="product" class="product-img">
                    <button class="bag-btn" data-id=${item.id}>
                        <i class="fas fa-shopping-cart"></i>
                        add to cart
                    </button>
                </div>
                <h3>${item.title}</h3>
                <h4>${item.price}</h4>
            </article>
            `;
        });
        ProductsDOM.innerHTML = result;

    }
    getBagButtons() {
        const buttons = [...document.querySelectorAll('.bag-btn')];
        buttonDOM = buttons;
        buttons.forEach(button => {
            let id = button.dataset.id
            let inCart = cart.find(item => item.id === id);
            if (inCart) {
                button.innerText = 'In Cart';
                button.disabled = true;
                button.style.cursor = 'default';
            }
            button.addEventListener('click', e => {
                e.target.innerText = 'In Cart';
                e.target.disabled = true;
                button.style.cursor = 'default';

                // get product from products
                let cartItem = { ...Storage.getProducts(id), amount: 1 };
                // add product to the cart
                cart = [...cart, cartItem];
                // save cart in local storage
                Storage.saveCart(cart);
                // set cart values
                this.setCartValues(cart);
                // display cart item
                this.addCartItem(cartItem)
                // show cart
                this.showCart()

            })
        })
        //console.log(buttons);
    }
    setCartValues(cart) {
        let tempTotal = 0;
        let itemsTotal = 0;
        cart.map(item => {
            tempTotal += item.price * item.amount;
            itemsTotal += item.amount;
        })
        cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
        cartItems.innerText = itemsTotal;
    }
    addCartItem(item) {
        const div = document.createElement('div');
        div.classList.add('cart-item');
        div.innerHTML = `
        <img src=${item.image} alt="product">
        <div>
            <h4>${item.title}</h4>
            <h5>$${item.price}</h5>
            <span class="remove-item" data-id=${item.id}>remove</span>
        </div>
        <div>
            <i class="fas fa-chevron-up" data-id=${item.id}></i>
            <p class="item-amount">${item.amount}</p>
            <i class="fas fa-chevron-down" data-id=${item.id}></i>
        </div>`;
        cartContent.appendChild(div)
    }
    showCart() {
        cartOverlay.classList.add('transparentBcg');
        cartDOM.classList.add('showCart');
    }
    setupAPP() {
        cart = Storage.getCart();
        this.setCartValues(cart);
        this.populateCart(cart);
        cartBtn.addEventListener('click', this.showCart);
        closeCartBtn.addEventListener('click', this.hideCart)
    }
    populateCart(cart) {
        cart.forEach(item => this.addCartItem(item));
    }
    hideCart() {
        cartOverlay.classList.remove('transparentBcg');
        cartDOM.classList.remove('showCart');
    }
    cartLogic() {
        // clear cart button
        clearCartBtn.addEventListener('click', () => {
            this.clearCart();
        });
        // cart functionality
        cartContent.addEventListener('click', e => {
            if (e.target.classList.contains('remove-item')) {
                let removeItem = e.target;
                let id = removeItem.dataset.id;
                cartContent.removeChild(removeItem.parentElement.parentElement)
                this.removeItem(id)
            } else if (e.target.classList.contains('fa-chevron-up')) {
                let addAmount = event.target;
                let id = addAmount.dataset.id;
                let tempItem = cart.find(item => item.id === id);
                tempItem.amount += 1;
                Storage.saveCart(cart);
                this.setCartValues(cart);
                addAmount.nextElementSibling.innerText = tempItem.amount;
            } else if (e.target.classList.contains('fa-chevron-down')) {
                let lowerAmount = event.target;
                let id = lowerAmount.dataset.id;
                let tempItem = cart.find(item => item.id === id);
                if (tempItem.amount > 0) {
                    cartContent.removeChild(lowerAmount.parentElement.parentElement);
                    this.removeItem(id)
                }
                tempItem.amount -= 1;
                Storage.saveCart(cart);
                this.setCartValues(cart);
                lowerAmount.previousElementSibling.innerText = tempItem.amount;

            }
        })
    }
    clearCart() {
        let cartItem = cart.map(item => item.id);
        cartItem.forEach(id => this.removeItem(id));
        // remove from the DOM
        while (cartContent.children.length > 0) {
            cartContent.removeChild(cartContent.children[0]);
        }
    }
    removeItem(id) {
        cart = cart.filter(item => item.id !== id);
        this.setCartValues(cart);
        Storage.saveCart(cart);
        let button = this.getSingleButton(id)
        button.disabled = false;
        button.innerHTML = `<i class="fas fa-shopping-cart"></i> add to cart`
        button.style.cursor = 'pointer';
    }
    getSingleButton(id) {
        return buttonDOM.find(button => button.dataset.id === id)
    }
}
//local storage
class Storage {
    static saveProducts(products) {
        localStorage.setItem('products', JSON.stringify(products))
    }
    static getProducts(id) {
        let products = JSON.parse(localStorage.getItem('products'));
        return products.find(product => product.id === id);
    }
    static saveCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart))
    }
    static getCart() {
        return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [];
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const ui = new UI();
    const products = new Products();

    //setup app
    ui.setupAPP()

    // get all products
    products.getProducts().then((products) => {
        ui.displayProducts(products);
        Storage.saveProducts(products)
    }).then(() => {
        ui.getBagButtons();
        ui.cartLogic();
    });
}); 