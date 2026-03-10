# Goofy Shop - Strapi Content Management Guide

## 🎨 Enhanced Admin Theme

Your Strapi admin now features a **retro skater aesthetic** with:

### Color Palette:
- **Background**: Pure black (#000000)
- **Primary Action**: Neon lime (#00FF00) with glow effects
- **Accents**: Magenta (#FF00FF) and Cyan (#00FFFF)
- **Text**: Light gray (#E0E0E0)
- **Font**: Monospace (JetBrains Mono, IBM Plex Mono)

### Features:
- ✨ Neon glow effects on buttons
- 🎯 Hover animations
- 🌈 Retro color scheme
- 💻 Terminal-style monospace font
- 🎮 80s/90s skater vibe

---

## 📦 Content Types Available

### 1. **Products**
Create skateboard decks, wheels, trucks, and accessories.

**Fields:**
- Name, Slug, Description
- Price, Compare At Price, SKU
- Images (multiple)
- Stock Quantity
- Is Limited, Is Sold Out
- Specs (JSON for deck width, concave, etc.)
- Category (relation)
- Drop Events (relation)

### 2. **Categories**
Organize products (Decks, Wheels, Trucks, Apparel, etc.)

**Fields:**
- Title, Slug
- Thumbnail image
- Products (relation)

### 3. **Drop Events**
Limited release events with countdown timers

**Fields:**
- Title
- Release Date
- Is Active
- Hero Banner
- Featured Products (relation)

---

## 🚀 Quick Start Guide

### Step 1: Create Categories
1. Go to **Content Manager** → **Category**
2. Click **Create new entry**
3. Add categories like:
   - Decks
   - Wheels
   - Trucks
   - Apparel
   - Accessories

### Step 2: Create Products
1. Go to **Content Manager** → **Product**
2. Click **Create new entry**
3. Fill in product details:
   ```json
   Example Specs:
   {
     "deckWidth": "8.25\"",
     "concave": "Medium",
     "wheelbase": "14.25\"",
     "length": "32\"",
     "material": "7-ply Maple"
   }
   ```

### Step 3: Create Drop Events
1. Go to **Content Manager** → **Drop Event**
2. Create limited releases
3. Set release date (future date for countdown)
4. Toggle "Is Active" for live events
5. Add featured products

### Step 4: Publish Content
- Click **Save** to draft
- Click **Publish** to make live
- Unpublish anytime to hide from frontend

---

## 🎯 Best Practices

### Product Management:
- ✅ Use high-quality images (at least 1200x1200px)
- ✅ Write detailed descriptions
- ✅ Keep SKUs unique
- ✅ Update stock quantities regularly
- ✅ Use specs JSON for technical details

### Drop Events:
- ✅ Only one active drop at a time
- ✅ Set release date in the future
- ✅ Add compelling hero banner
- ✅ Feature 3-5 products per drop

### Categories:
- ✅ Keep category names short
- ✅ Use clear, descriptive thumbnails
- ✅ Organize products logically

---

## 🔌 API Endpoints

Your content is automatically available via REST API:

### Products:
```
GET /api/products
GET /api/products/:id
```

### Categories:
```
GET /api/categories
GET /api/categories/:id
```

### Drop Events:
```
GET /api/drop-events
GET /api/drop-events/:id
```

**Note:** All endpoints are public (read-only). Create/Update/Delete requires authentication.

---

## 🎨 Customizing Theme Further

To adjust colors, edit: `strapi/src/admin/app.css`

**Available CSS Variables:**
```css
--goofy-admin-bg: #000000;
--goofy-admin-neon: #00ff00;
--goofy-admin-purple: #ff00ff;
--goofy-admin-cyan: #00ffff;
```

Change these to match your brand!

---

## 🛠️ Useful Commands

```bash
# Start Strapi
cd strapi && npm run dev

# Build for production
npm run build

# Start production server
npm start
```

---

## 📱 Next Steps

1. **Create sample content** in Strapi admin
2. **Test API endpoints** at http://localhost:1337/api/products
3. **Connect Next.js frontend** to display products
4. **Deploy to production** when ready

---

## 🎯 Pro Tips

- Use **Media Library** for organized image management
- Set up **Roles & Permissions** for team members
- Enable **Internationalization** for multi-language support
- Use **Webhooks** to trigger actions on content changes

Happy content managing! 🛹✨
