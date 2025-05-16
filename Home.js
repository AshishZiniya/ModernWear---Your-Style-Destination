let timer;
let productData = [];
const productDiv = document.getElementById("product");
let cart = JSON.parse(localStorage.getItem('cart')) || {};
const cartCountSpan = document.getElementById("cart-count");
const closeBtn = document.getElementById("closeBtn");
const cartPopup = document.getElementById("cart-popup");
const orderConfirmationPopup = document.getElementById("order-confirmation");
const placeOrderBtn = document.getElementById("place-order");
const closeOrderPopupBtn = document.getElementById("close-order-popup");
const cartBtn = document.getElementById("cart-button");
const cartDetailsDiv = document.getElementById("cart-details");
const lbl1 = document.getElementById("lbl1");
const lbl2 = document.getElementById("lbl2");
const lbl3 = document.getElementById("lbl3");
const checkboxes = document.querySelectorAll(".price-filter");
const menuToggle = document.getElementById("menu-toggle");
const navMenu = document.getElementById("nav-menu");
const Categories = {};
const Color = {};
const Season = {};

// Toggle mobile menu
menuToggle.addEventListener("click", () => {
  navMenu.classList.toggle("hidden");
});

fetch("./product.json")
  .then((response) => response.json())
  .then((data) => {
    productData = data.products;
    for (const element of productData) {
      Categories[element.articleType] = (Categories[element.articleType] || 0) + 1;
      Color[element.baseColour] = (Color[element.baseColour] || 0) + 1;
      Season[element.season] = (Season[element.season] || 0) + 1;
    }
    for (const key in Categories) {
      document.getElementById("filter").innerHTML += `<option value="${key}">${key}</option>`;
    }
    for (const key1 in Season) {
      document.getElementById("season").innerHTML += `<option value="${key1}">${key1}</option>`;
    }
    for (const key2 in Color) {
      document.getElementById("color").innerHTML += `<option value="${key2}">${key2}</option>`;
    }
    displayAllProducts();
    updateCartDisplay();
  })
  .catch((error) => console.error("Error loading products:", error));

function renderProducts(productsToRender) {
  productDiv.innerHTML = "";
  productsToRender.forEach((product) => {
    const productId = product.id;
    const inCart = cart[productId] !== undefined;
    const quantity = cart[productId] || 1;

    product.isAvailable ? (
      productDiv.innerHTML += `
        <div class="bg-white border border-gray-300 rounded-lg shadow-xl/50 overflow-hidden transition-transform hover:scale-105">
          <img src="${product.image}" alt="${product.articleType}" class="w-full h-48 sm:h-64 object-cover" />
          <div class="p-4 flex flex-col flex-grow">
            <h3 class="text-base sm:text-lg font-semibold text-gray-800">${product.productDisplayName}</h3>
            <p class="text-gray-600 mt-1 text-sm sm:text-base">${product.gender === "M" ? "Men's" : "Women's"} ${product.articleType}</p>
            <div class="mt-auto pt-4 flex justify-between items-center">
              <span class="text-lg sm:text-xl font-bold text-gray-900">$${product.price}</span>
              <div id="action-${product.id}">
                ${inCart ? getInputComponent(productId, quantity) : `
                  <button data-id="${product.id}" class="add-btn bg-gray-500 hover:bg-gray-600 text-white font-semibold py-1.5 px-3 sm:py-2 sm:px-4 rounded-md transition-colors duration-200 text-sm sm:text-base">Add</button>
                `}
              </div>
            </div>
          </div>
        </div>`
    ) : (
      productDiv.innerHTML += `
        <div class="bg-white border border-gray-300 rounded-lg shadow-xl/50 overflow-hidden transition-transform hover:scale-105 relative opacity-60">
          <img src="${product.image}" alt="${product.articleType}" class="w-full h-48 sm:h-64 object-cover" />
          <div class="p-4 flex flex-col flex-grow">
            <h3 class="text-base sm:text-lg font-semibold text-gray-800">${product.productDisplayName}</h3>
            <p class="text-gray-600 mt-1 text-sm sm:text-base">${product.gender === "M" ? "Men's" : "Women's"} ${product.articleType}</p>
            <div class="mt-auto pt-4 flex justify-between items-center">
              <span class="text-lg sm:text-xl font-bold text-gray-900">$${product.price}</span>
              <div id="action-${product.id}"></div>
            </div>
          </div>
          <div class="absolute inset-0 flex items-center justify-center opacity-100 z-10">
            <span class="text-base sm:text-lg font-bold text-red-600 bg-white/90 px-3 py-1.5 rounded-md shadow-md">Out Of Stock</span>
          </div>
        </div>`
    )
  });
}

function getInputComponent(productId, quantity) {
  return `
    <div class="py-1.5 px-2 sm:py-2 sm:px-3 inline-block bg-white border border-gray-300 rounded-lg" data-hs-input-number>
      <div class="flex items-center">
        <button type="button" class="decrement size-5 sm:size-6 inline-flex justify-center items-center text-xs sm:text-sm font-medium rounded-md border border-gray-400 bg-white text-gray-800 hover:bg-gray-50" data-id="${productId}">
          <svg class="shrink-0 size-3 sm:size-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M5 12h14"></path></svg>
        </button>
        <input class="quantity p-0 w-10 sm:w-12 translate-x-1 sm:translate-x-2 bg-transparent border-0 text-center text-gray-800 text-sm sm:text-base" type="number" value="${quantity}" min="1" max="10" readonly data-id="${productId}">
        <button type="button" class="increment size-5 sm:size-6 inline-flex justify-center items-center text-xs sm:text-sm font-medium rounded-md border border-gray-400 bg-white text-gray-800 hover:bg-gray-50" data-id="${productId}">
          <svg class="shrink-0 size-3 sm:size-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
        </button>
      </div>
    </div>`;
}

function showCartPopup() {
  cartPopup.classList.remove("hidden");
  document.body.classList.add("overflow-hidden");

  cartDetailsDiv.innerHTML = "";
  let totalPrice = 0;

  if (Object.keys(cart).length === 0) {
    cartDetailsDiv.innerHTML = `<div class="text-center text-2xl sm:text-3xl w-full h-full flex items-center justify-center text-gray-600">Your cart is empty.</div>`;
    document.getElementById("total-price").textContent = "0.00";
    placeOrderBtn.disabled = true;
    return;
  }

  placeOrderBtn.disabled = false;

  Object.entries(cart).forEach(([productId, quantity]) => {
    const product = productData.find((p) => p.id == productId);
    if (product) {
      totalPrice += product.price * quantity;
      cartDetailsDiv.innerHTML += `
        <div class="grid grid-cols-3 gap-2 items-center border-b p-3 border-black" id="cart-item-${product.id}">
          <div><img src="${product.image}" alt="${product.articleType}" class="w-16 sm:w-20 h-16 sm:h-20 object-cover" /></div>
          <div class="flex flex-col gap-y-1">
            <span class="font-semibold text-sm sm:text-base">${product.productDisplayName}</span>
            <span class="text-lg sm:text-xl">$${product.price}</span>
          </div>
          <div class="flex justify-end">
            <div id="action-cart-${product.id}">${getInputComponent(productId, quantity)}</div>
          </div>
        </div>`;
    }
  });

  document.getElementById("total-price").textContent = totalPrice.toFixed(2);
}

function hideCartPopup() {
  cartPopup.classList.add("hidden");
  document.body.classList.remove("overflow-hidden");
}

closeBtn.addEventListener("click", hideCartPopup);

function updateCartDisplay() {
  const totalQty = Object.values(cart).reduce((acc, qty) => acc + qty, 0);
  cartCountSpan.textContent = totalQty;
  cartBtn.classList.toggle("cursor-pointer", totalQty > 0);
  cartBtn.classList.toggle("cursor-default", totalQty === 0);
}

function updateCartState() {
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartDisplay();
}

function showOrderConfrimationPopup() {
  orderConfirmationPopup.classList.remove("hidden");
  cart = {};
  updateCartState();
  document.getElementById("order-confirmation-message").textContent = "Thank you! Your order has been placed successfully.";
  displayAllProducts();
}

function filterAndSearch() {
  const priceFilters = Array.from(checkboxes).filter(cb => cb.checked).map(cb => cb.dataset.filter);
  const filter = document.getElementById("filter").value;
  const season = document.getElementById("season").value;
  const color = document.getElementById("color").value;
  const search = document.getElementById("searchInput").value.toLowerCase();
  return productData.filter(product => {
    const matchesFilter = filter === "all" || product.articleType === filter;
    const matchesSeason = season === "all" || product.season === season;
    const matchesColor = color === "all" || product.baseColour === color;
    const matchesSearch = product.productDisplayName.toLowerCase().includes(search);
    let matchPrice = priceFilters.length === 0 || priceFilters.some(f => {
      switch (f) {
        case "lt20": return product.price <= 20;
        case "lt40": return product.price <= 40 && product.price > 20;
        case "lt60": return product.price <= 60 && product.price > 40;
        case "lt80": return product.price <= 80 && product.price > 60;
        case "gt80": return product.price > 80;
        default: return false;
      }
    });
    return matchesFilter && matchesSearch && matchPrice && matchesColor && matchesSeason;
  });
}

["filter", "season", "color"].forEach(e => {
  document.getElementById(e).addEventListener("change", () => {
    renderProducts(filterAndSearch());
  });
});

document.getElementById("searchInput").addEventListener("input", () => {
  clearTimeout(timer);
  productDiv.classList.remove("grid", "grid-cols-1");
  productDiv.innerHTML = `<p class="text-center pt-20 text-4xl sm:text-5xl w-full">Loading...</p>`;
  timer = setTimeout(() => {
    productDiv.classList.add("grid", "grid-cols-1");
    renderProducts(filterAndSearch());
  }, 900);
});

checkboxes.forEach(cb => {
  cb.addEventListener("change", () => {
    renderProducts(filterAndSearch());
  });
});

document.body.addEventListener("click", (e) => {
  const addBtn = e.target.closest(".add-btn");
  const incBtn = e.target.closest(".increment");
  const decBtn = e.target.closest(".decrement");

  if (addBtn) {
    const productId = addBtn.dataset.id;
    cart[productId] = 1;
    updateCartState();
    document.getElementById(`action-${productId}`).innerHTML = getInputComponent(productId, 1);
  }

  if (incBtn) {
    const productId = incBtn.dataset.id;
    cart[productId]++;
    updateCartState();
    document.querySelectorAll(`[data-id="${productId}"].quantity`).forEach(el => el.value = cart[productId]);
    updateTotalPrice();
  }

  if (decBtn) {
    const productId = decBtn.dataset.id;
    if (cart[productId] > 1) {
      cart[productId]--;
      updateCartState();
      document.querySelectorAll(`[data-id="${productId}"].quantity`).forEach(el => el.value = cart[productId]);
    } else {
      delete cart[productId];
      updateCartState();

      const cartItem = document.getElementById(`cart-item-${productId}`);
      if (cartItem) cartItem.remove();

      const productAction = document.getElementById(`action-${productId}`);
      if (productAction) {
        productAction.innerHTML = `
        <button data-id="${productId}" class="add-btn bg-gray-500 hover:bg-gray-600 text-white font-semibold py-1.5 px-3 sm:py-2 sm:px-4 rounded-md transition-colors duration-200 text-sm sm:text-base">Add</button>`;
      }

      if (Object.keys(cart).length === 0) {
        cartDetailsDiv.innerHTML = `<div class="text-center text-2xl sm:text-3xl w-full h-full flex items-center justify-center text-gray-600">Your cart is empty.</div>`;
        document.getElementById("total-price").textContent = "0.00";
        placeOrderBtn.disabled = true;
      }
    }
    updateTotalPrice();
  }
});

function updateTotalPrice() {
  let totalPrice = 0;
  Object.entries(cart).forEach(([id, qty]) => {
    const prod = productData.find(p => p.id == id);
    if (prod) totalPrice += prod.price * qty;
  });
  document.getElementById("total-price").textContent = totalPrice.toFixed(2);
}

lbl1.addEventListener("click", (e) => {
  e.preventDefault();
  lbl1.classList.add("text-sky-500");
  lbl2.classList.remove("text-sky-500");
  lbl3.classList.remove("text-sky-500");
  displayAllProducts();
});

lbl2.addEventListener("click", (e) => {
  e.preventDefault();
  lbl1.classList.remove("text-sky-500");
  lbl2.classList.add("text-sky-500");
  lbl3.classList.remove("text-sky-500");
  renderProducts(productData.filter(p => p.gender === "M"));
});

lbl3.addEventListener("click", (e) => {
  e.preventDefault();
  lbl1.classList.remove("text-sky-500");
  lbl2.classList.remove("text-sky-500");
  lbl3.classList.add("text-sky-500");
  renderProducts(productData.filter(p => p.gender === "F"));
});

cartBtn.addEventListener("click", showCartPopup);

function displayAllProducts() {
  renderProducts(productData);
}

placeOrderBtn.addEventListener("click", () => {
  if (Object.keys(cart).length === 0) return;
  hideCartPopup();
  showOrderConfrimationPopup();
});

closeOrderPopupBtn.addEventListener("click", () => {
  orderConfirmationPopup.classList.add("hidden");
  displayAllProducts();
});