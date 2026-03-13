const categories = [
  {
    name: "Decks",
    number: "01/05",
    badge: "New Drop",
    badgeTone: "active",
    count: "5 In Stock",
    subtitle: "Goofy OG Deck 8.0",
    price: "From $1,200,000",
    button: "Browse Decks",
    tint: "rgba(200, 168, 75, 0.36)",
    modifier: "hero",
    href: "#decks",
  },
  {
    name: "Trucks",
    number: "02/05",
    badge: "Coming Soon",
    badgeTone: "muted",
    count: "Category Update",
    subtitle: "Precision hardware and responsive turning setups.",
    price: "",
    button: "Browse Trucks",
    tint: "rgba(90, 124, 196, 0.28)",
    modifier: "small",
    href: "#trucks",
  },
  {
    name: "Wheels",
    number: "03/05",
    badge: "Coming Soon",
    badgeTone: "muted",
    count: "Category Update",
    subtitle: "Street-ready urethane, grip, and speed in every set.",
    price: "",
    button: "Browse Wheels",
    tint: "rgba(136, 86, 190, 0.26)",
    modifier: "small",
    href: "#wheels",
  },
  {
    name: "Shoes",
    number: "04/05",
    badge: "Coming Soon",
    badgeTone: "muted",
    count: "Category Update",
    subtitle: "Skate silhouettes built for impact, board feel, and repeat wear.",
    price: "",
    button: "Browse Shoes",
    tint: "rgba(67, 143, 112, 0.26)",
    modifier: "small",
    href: "#shoes",
  },
  {
    name: "Apparel",
    number: "05/05",
    badge: "Coming Soon",
    badgeTone: "muted",
    count: "Category Update",
    subtitle: "Heavyweight tees, outerwear, and street-layer essentials.",
    price: "",
    button: "Browse Apparel",
    tint: "rgba(176, 104, 74, 0.28)",
    modifier: "small",
    href: "#apparel",
  },
]

const grid = document.getElementById("category-grid")

function createCardMarkup(category, index) {
  const card = document.createElement("a")
  card.className = `category-card category-card--${category.modifier}`
  card.href = category.href
  card.style.setProperty("--tint", category.tint)
  card.style.setProperty("--delay", `${index * 90}ms`)

  const priceMarkup = category.price
    ? `<p class="card-price">${category.price}</p>`
    : ""

  card.innerHTML = `
    <span class="card-number">${category.number}</span>
    <span class="watermark">${category.name}</span>
    <div class="card-content">
      <div class="card-meta">
        <span class="card-tagline ${category.badgeTone === "active" ? "is-active" : ""}">${category.badge}</span>
        <span class="card-count">${category.count}</span>
      </div>
      <span class="accent-line" aria-hidden="true"></span>
      <h2 class="category-name">${category.name}</h2>
      <p class="card-subtitle">${category.subtitle}</p>
      ${priceMarkup}
      <span class="card-button">${category.button} <span class="arrow">-></span></span>
    </div>
  `

  return card
}

categories.forEach((category, index) => {
  grid.appendChild(createCardMarkup(category, index))
})
