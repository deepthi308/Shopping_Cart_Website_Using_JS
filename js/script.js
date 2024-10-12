// Getting the reference of HTML elements with the help of DOM
const addToCartEl = document.getElementById("cart-button");
const closeBtnEl = document.getElementById("close-cart");
const cartEl = document.getElementById("cart");
const productsContainerEl = document.getElementById("product-cards");
const carProductsEl = document.getElementById("cart-products");
const countEl = document.getElementById("count-circle");
const clearProductsEl = document.getElementById("clear-products");
const totalCosts = document.getElementById("total-cost");

let cartProductList = [];
let productCount = 0;
countEl.innerText = productCount;

// This function will be triggered when the user click on Add To Cart button
const handleAddToCart = () => {
  clearProductsEl.style.visibility = "visible";
  cartEl.style.visibility = "visible";
};

// This function will be triggered when we click on close button
const handleCloseCart = () => {
  clearProductsEl.style.visibility = "hidden";
  setTimeout(() => {
    cartEl.style.visibility = "hidden";
  }, 200);
};

// Attaching event handler on the window object
window.addEventListener("DOMContentLoaded", () => {
  let productObj = new Products();
  let cartProducts = productObj.getCartProducts();
  countEl.innerText = cartProducts.length;
  productObj.displayCartProducts(cartProducts);
  if (cartProducts.length === 0) {
    clearProductsEl.innerText = "No Products Were Added";
  } else {
    clearProductsEl.innerText = "Clear All";
  }
});

// Attaching event handler to Add To Cart button
addToCartEl.addEventListener("click", handleAddToCart);

// Attaching an event handler to Close button
closeBtnEl.addEventListener("click", handleCloseCart);

class Products {
  async fetchProducts(url) {
    let response = await fetch(url);
    let data = await response.json();
    localStorage.setItem("products", JSON.stringify(data));
    return data;
  }

  getCartProducts() {
    let cartProducts = JSON.parse(localStorage.getItem("cartProducts")) || [];
    return cartProducts;
  }

  displayProducts(products) {
    let productsEl = "";
    products.forEach((product) => {
      let url = product.fields.image.fields.file.url;
      let { price, title } = product.fields;
      let { id } = product.sys;
      let cartProducts = this.getCartProducts();
      let prodct = cartProducts.find((prod) => {
        return prod.id === id;
      });
      productsEl += `
     <li class="card">
          <section class="card-top">
            <img src=${url} alt=${title} />
            <button id="add-to-cart-button" class="add-to-cart-button" data-id=${id}>
              <i class="fas fa-cart-plus"></i>${
                !prodct ? "Add To Cart" : "Added To Cart"
              }
            </button>
          </section>
          <section class="card-bottom">
            <h3 class="product-name">${title}</h3>
            <h4 class="product-price">$ ${price}</h4>
          </section>
        </li>
        `;
    });
    productsContainerEl.innerHTML = productsEl;
    this.attachEventToButtons();
  }

  displayCartProducts(cartList) {
    let cartListEl = "";
    let total = 0;
    cartList.forEach((cartProduct, index) => {
      let { id, title, price, url, count } = cartProduct;
      total += Number(price);
      cartListEl += `
      <li class="cart-product" id=${id}>
          <section class="cart-product-left">
            <img src=${url} alt=${title} />
          </section>
          <section class="cart-product-middle">
            <h3 class="cart-product-name">${title}</h3>
            <h4 class="cart-product-price">$ ${price}</h4>
            <button class="remove-product" onclick=removeProduct(${id})>Remove</button>
          </section>
          <section class="cart-product-right">
            <button id="increase-count" data-id=${id} class="increase-count" onclick=increaseCount(${index})>
              <i class="fa-solid fa-arrow-up"></i>
            </button>
            <span class="product-count">${count}</span>
            <button id="decrease-count" data-id=${id}  class="decrease-count" onclick=decreaseCount(${index})>
              <i class="fa-solid fa-arrow-down"></i>
            </button>
          </section>
        </li>
      `;
    });
    carProductsEl.innerHTML = cartListEl;
    totalCosts.innerText = "Total Cost: " + total.toFixed(2) + " $";
    localStorage.setItem("total", total.toString());
    if (cartList.length === 0) {
      clearProductsEl.innerText = "No Products Were Added";
    } else {
      clearProductsEl.innerText = "Clear All";
    }
  }

  saveToCart(cartProductList) {
    localStorage.setItem("cartProducts", JSON.stringify(cartProductList));
  }

  attachEventToButtons() {
    const addToCartEl = document.querySelectorAll(".add-to-cart-button");
    console.log(addToCartEl);

    addToCartEl.forEach((el) => {
      el.addEventListener("click", () => {
        let productId = el.dataset.id;
        let cartProductList =
          JSON.parse(localStorage.getItem("cartProducts")) || [];
        let existingProduct = cartProductList.find((product) => {
          return product.id === productId;
        });
        if (existingProduct) {
        } else {
          let prods = JSON.parse(localStorage.getItem("products"))?.items || [];
          let product = prods.find((prod) => {
            return prod.sys.id === productId;
          });
          if (product) {
            let url = product.fields.image.fields.file.url;
            let { price, title } = product.fields;
            let { id } = product.sys;
            let count = 1;
            let prd = {
              id,
              title,
              price,
              url,
              count,
            };
            el.innerText = `Added To Cart`;
            el.style.backgroundColor = "green";
            el.style.cursor = "not-allowed";
            cartProductList.push(prd);
            countEl.innerText = cartProductList.length;
            this.saveToCart(cartProductList);
            this.displayCartProducts(cartProductList);
          }
        }
      });
    });
  }

  addProduct(product) {
    console.log();
  }
}

function increaseCount(id) {
  let productObj = new Products();
  let cartProducts = productObj.getCartProducts();
  let newCartProducts = cartProducts.map((cartProduct, index) => {
    if (index == id) {
      let price1 = Number(cartProduct.price);
      let count1 = Number(cartProduct.count);
      let perProductCost = price1 / count1;
      let cnt = cartProduct.count + 1;
      let prce = Number(cartProduct.price) + perProductCost;
      prce = prce.toFixed(2);
      return {
        ...cartProduct,
        price: prce,
        count: cnt,
      };
    } else {
      return cartProduct;
    }
  });
  localStorage.setItem("cartProducts", JSON.stringify(newCartProducts));
  productObj.displayCartProducts(newCartProducts);
}

function decreaseCount(id) {
  let productObj = new Products();
  let cartProducts = productObj.getCartProducts();
  let newCartProducts = cartProducts.map((cartProduct, index) => {
    if (index == id) {
      if (cartProduct.count == 1) {
        return cartProduct;
      }
      let price1 = cartProduct.price;
      let count1 = cartProduct.count;
      let perProductCost = price1 / count1;
      let cnt = cartProduct.count - 1;
      let prce = Number(cartProduct.price) - perProductCost;
      prce = prce.toFixed(2);
      return {
        ...cartProduct,
        price: prce,
        count: cnt,
      };
    } else {
      return cartProduct;
    }
  });
  localStorage.setItem("cartProducts", JSON.stringify(newCartProducts));
  productObj.displayCartProducts(newCartProducts);
}

function removeProduct(id) {
  console.log(id);
  let productObj = new Products();
  let cartProducts = productObj.getCartProducts();
  let newCartProducts = cartProducts.filter((cartProduct) => {
    return Number(cartProduct.id) !== id;
  });
  productObj.displayCartProducts(newCartProducts);
  localStorage.setItem("cartProducts", JSON.stringify(newCartProducts));
}

let productsObj = new Products();
productsObj.fetchProducts("../data/products.json").then((products) => {
  productsObj.displayProducts(products.items);
});

clearProductsEl.addEventListener("click", () => {
  if (clearProductsEl.innerText !== "CLEAR ALL") {
    return;
  }
  localStorage.setItem("cartProducts", JSON.stringify([]));
  let productObj = new Products();
  productObj.displayCartProducts(productObj.getCartProducts());
  countEl.innerText = 0;
  totalCosts.innerText = "Total Cost: " + 0 + " $";
  localStorage.setItem("total", 0);
  window.location.reload();
});
