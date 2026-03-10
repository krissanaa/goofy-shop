# Goofy Shop - Strapi Content Types Summary

## Overview
This document provides a comprehensive overview of the Strapi content types created for the Goofy Shop e-commerce platform.

## Content Types

### 1. Product
**Location:** `strapi/src/api/product/content-types/product/`

**Fields:**
- `name` (String, Required) - Product name
- `slug` (UID, target: name, Required) - URL-friendly identifier
- `description` (Rich Text) - Detailed product description
- `price` (Decimal) - Current selling price
- `compare_at_price` (Decimal) - Original price for comparison
- `sku` (String, Unique) - Stock keeping unit identifier
- `images` (Media, Multiple) - Product images
- `stock_quantity` (Integer, default: 0, min: 0) - Available inventory
- `is_limited` (Boolean, default: false) - Limited edition flag
- `is_sold_out` (Boolean, default: false) - Sold out status
- `specs` (JSON) - Technical specifications (deck width, concave, wheelbase, etc.)

**Relations:**
- `category` - Many-to-One with Category
- `drop_events` - Many-to-Many with Drop-Event (inversed by `featured_products`)

---

### 2. Category
**Location:** `strapi/src/api/category/content-types/category/`

**Fields:**
- `title` (String, Required) - Category name
- `slug` (UID, target: title, Required) - URL-friendly identifier
- `thumbnail` (Media, Single) - Category thumbnail image

**Relations:**
- `products` - One-to-Many with Product (mapped by `category`)

---

### 3. Drop-Event
**Location:** `strapi/src/api/drop-event/content-types/drop-event/`

**Fields:**
- `title` (String, Required) - Event name
- `release_date` (DateTime, Required) - When the drop goes live
- `is_active` (Boolean, default: false) - Active status flag
- `hero_banner` (Media, Single) - Event banner image

**Relations:**
- `featured_products` - Many-to-Many with Product (inversed by `drop_events`)

---

## TypeScript Types

### Centralized Types
**Location:** `strapi/src/types/content-types.ts`

Contains all shared types including:
- `StrapiMedia` - Media file interface
- `ProductSpecs` - Product specifications structure
- `Product`, `Category`, `DropEvent` - Main entity interfaces
- `ProductAttributes`, `CategoryAttributes`, `DropEventAttributes` - Strapi response attributes
- `StrapiResponse<T>` - Single entity response wrapper
- `StrapiCollectionResponse<T>` - Collection response wrapper with pagination

### Individual Type Files
Each content type has its own type file for local use:
- `strapi/src/api/product/content-types/product/types.ts`
- `strapi/src/api/category/content-types/category/types.ts`
- `strapi/src/api/drop-event/content-types/drop-event/types.ts`

These include:
- Entity interfaces
- Input interfaces for creating/updating entities
- Simplified relation types to avoid circular dependencies

---

## Usage Examples

### Importing Types in Next.js Frontend
```typescript
import { 
  Product, 
  Category, 
  DropEvent,
  StrapiCollectionResponse 
} from '@/strapi/src/types/content-types';

// Using in API calls
const products: StrapiCollectionResponse<ProductAttributes> = await fetch(...);
```

### Importing Types in Strapi Backend
```typescript
import { Product, ProductInput } from './content-types/product/types';
import { Category } from './content-types/category/types';
import { DropEvent } from './content-types/drop-event/types';
```

---

## Product Specs JSON Structure
The `specs` field supports flexible JSON data for skateboard specifications:

```json
{
  "deckWidth": "8.25\"",
  "concave": "Medium",
  "wheelbase": "14.25\"",
  "length": "32\"",
  "material": "7-ply Maple",
  "weight": "2.5 lbs"
}
```

---

## Schema Files
All schema.json files are located at:
- `strapi/src/api/product/content-types/product/schema.json`
- `strapi/src/api/category/content-types/category/schema.json`
- `strapi/src/api/drop-event/content-types/drop-event/schema.json`

These files define the Strapi content structure and are automatically read by Strapi on startup.
