document.addEventListener("DOMContentLoaded", () => {
  const categoriesEl = document.getElementById("categories");
  const treeListEl = document.getElementById("tree-list");
  const loadingEl = document.getElementById("loading");
  const cartListEl = document.getElementById("cart-list");
  const cartTotalEl = document.getElementById("cart-total");
  const modal = document.getElementById("modal");
  const modalTitle = document.getElementById("modal-title");
  const modalContent = document.getElementById("modal-content");

  let cart = [];

  // ----------------- Fetch Functions -----------------
  async function fetchCategories() {
    const res = await fetch("https://openapi.programming-hero.com/api/categories");
    const data = await res.json();
    return data.categories || [];
  }

  async function fetchAllPlants() {
    const res = await fetch("https://openapi.programming-hero.com/api/plants");
    const data = await res.json();
    return data.plants || [];
  }

  async function fetchPlantsByCategory(id) {
    const res = await fetch(`https://openapi.programming-hero.com/api/category/${id}`);
    const data = await res.json();
    return data.plants || [];
  }

  async function fetchPlantById(id) {
    const res = await fetch(`https://openapi.programming-hero.com/api/plant/${id}`);
    const data = await res.json();
    return data.plants || data; // fallback
  }

  // ----------------- UI Functions -----------------
  function createCategoryButton(cat, isAll=false) {
    const btn = document.createElement("button");
    btn.textContent = isAll ? "All Trees" : cat.category_name;
    btn.className = "block w-full text-left px-3 py-2 mb-2 rounded border hover:bg-green-100";
    btn.onclick = () => loadTrees(isAll ? "all" : cat.id, btn);
    return btn;
  }

  async function loadCategories() {
    const categories = await fetchCategories();
    categoriesEl.innerHTML = "";
    categoriesEl.appendChild(createCategoryButton(null, true));
    categories.forEach(cat => categoriesEl.appendChild(createCategoryButton(cat)));
  }

  async function loadTrees(catId="all", btn=null) {
    treeListEl.innerHTML = "";
    loadingEl.classList.remove("hidden");

    // Highlight active button
    categoriesEl.querySelectorAll("button").forEach(b=>{
      b.classList.remove("bg-green-600","text-white");
      b.classList.add("border");
    });
    if(btn){
      btn.classList.add("bg-green-600","text-white");
      btn.classList.remove("border");
    }

    let trees = [];
    try {
      trees = catId === "all" ? await fetchAllPlants() : await fetchPlantsByCategory(catId);
    } catch (err) {
      console.error(err);
    }
    loadingEl.classList.add("hidden");

    if (!trees || trees.length === 0) {
      treeListEl.innerHTML = `<p class="text-center col-span-6 text-gray-500">🌱 No plants available in this category</p>`;
      return;
    }

    trees.forEach(tree => {
      const card = document.createElement("div");
      card.className = "bg-white rounded-lg shadow p-4 flex flex-col";

      const img = document.createElement("img");
      img.src = tree.image || "assets/placeholder.png";
      img.className = "h-32 w-full object-cover rounded mb-2";
      card.appendChild(img);

      const name = document.createElement("h3");
      name.textContent = tree.name || "No Name";
      name.className = "font-bold text-lg cursor-pointer text-green-700";
      name.onclick = () => showDetails(tree.id);
      card.appendChild(name);

      const desc = document.createElement("p");
      desc.textContent = tree.description ? tree.description.slice(0, 50) + "..." : "";
      desc.className = "text-sm text-gray-600";
      card.appendChild(desc);

      const cat = document.createElement("p");
      cat.textContent = "Category: " + (tree.category || "Unknown");
      cat.className = "text-xs text-gray-400 mt-1";
      card.appendChild(cat);

      const price = document.createElement("p");
      price.textContent = "৳" + (tree.price || 0);
      price.className = "font-semibold mt-2";
      card.appendChild(price);

      const btnAdd = document.createElement("button");
      btnAdd.textContent = "Add to Cart";
      btnAdd.className = "mt-auto bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700";
      btnAdd.onclick = () => addToCart(tree.id, tree.name, tree.price || 0);
      card.appendChild(btnAdd);

      treeListEl.appendChild(card);
    });
  }

  // ----------------- Cart -----------------
  function addToCart(id, name, price) {
    cart.push({id, name, price});
    renderCart();
  }

  function removeFromCart(i) {
    cart.splice(i,1);
    renderCart();
  }

  function renderCart() {
    cartListEl.innerHTML = "";
    let total = 0;
    cart.forEach((item,i)=>{
      total += item.price;
      const li = document.createElement("li");
      li.className = "flex justify-between items-center bg-gray-100 p-2 rounded";
      li.innerHTML = `<span>${item.name || "No Name"} - ৳${item.price}</span>`;
      const btn = document.createElement("button");
      btn.textContent = "❌";
      btn.className = "text-red-500";
      btn.onclick = () => removeFromCart(i);
      li.appendChild(btn);
      cartListEl.appendChild(li);
    });
    cartTotalEl.textContent = "৳" + total;
  }

  // ----------------- Modal -----------------
  async function showDetails(id){
    const plant = await fetchPlantById(id);
    modalTitle.textContent = plant.name || "No Name";
    modalContent.innerHTML = `
      <img src="${plant.image || 'assets/placeholder.png'}" class="h-40 w-full object-cover rounded mb-3"/>
      <p><strong>Category:</strong> ${plant.category || "Unknown"}</p>
      <p><strong>Price:</strong> ৳${plant.price || 0}</p>
      <p class="mt-2">${plant.description || "No description available"}</p>
    `;
    modal.classList.remove("hidden");
  }
  window.closeModal = ()=> { modal.classList.add("hidden"); }

  // ----------------- Init -----------------
  loadCategories();
  loadTrees();
});
