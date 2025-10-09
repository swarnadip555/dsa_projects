class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.map = new Map();
  }

  get(key) {
    if (!this.map.has(key)) return null;
    const value = this.map.get(key);
    this.map.delete(key);
    this.map.set(key, value);
    this.animateAccess(key);
    return value;
  }

  put(key, value) {
    let removedKey = null;
    if (this.map.has(key)) {
      this.map.delete(key);
    } else if (this.map.size >= this.capacity) {
      removedKey = this.map.keys().next().value;
      this.map.delete(removedKey);
    }
    this.map.set(key, value);
    this.display(removedKey, key);
  }

  reset() {
    this.map.clear();
    this.display();
  }

  display(removedKey = null, newKey = null) {
    const container = document.getElementById("cache-display");
    container.innerHTML = "";

    this.map.forEach((value, key) => {
      const block = document.createElement("div");
      block.className = "cache-block";
      block.innerHTML = `<strong>${key}</strong><br>${value}`;

      if (key === newKey) block.classList.add("new");
      if (key === removedKey) block.classList.add("removed");

      container.appendChild(block);
    });
  }

  animateAccess(key) {
    const container = document.getElementById("cache-display");
    const blocks = container.querySelectorAll(".cache-block");
    blocks.forEach((block) => {
      if (block.textContent.includes(key)) {
        block.classList.add("accessed");
        setTimeout(() => block.classList.remove("accessed"), 800);
      }
    });
  }
}

let cache = null;

document.getElementById("put-btn").addEventListener("click", () => {
  const size = parseInt(document.getElementById("cache-size").value);
  const key = document.getElementById("cache-key").value;
  const value = document.getElementById("cache-value").value;
  if (!cache || cache.capacity !== size) cache = new LRUCache(size);
  if (key && value) {
    cache.put(key, value);
  }
});

document.getElementById("get-btn").addEventListener("click", () => {
  const key = document.getElementById("cache-key").value;
  if (cache && key) {
    const value = cache.get(key);
    alert(value !== null ? `Value: ${value}` : "Key not found!");
  }
});

document.getElementById("reset-btn").addEventListener("click", () => {
  if (cache) cache.reset();
});

document.getElementById("theme-toggle").addEventListener("click", () => {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  document.documentElement.setAttribute(
    "data-theme",
    currentTheme === "light" ? "dark" : "light"
  );
});
