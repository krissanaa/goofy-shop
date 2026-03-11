# Home Page Sections Guide

Use this with `home-page-sections.example.json`.

## CMS Order

In `Strapi -> Content Manager -> Home Page -> page_sections`, add sections in this order:

1. `Slideshow`
2. `Marquee Text`
3. `Featured Drops`
4. `Category Row`
5. `New Arrivals` with `badge_filter = NEW`
6. `New Arrivals` with `badge_filter = SALE`
7. `New Arrivals` with `badge_filter = HOT`
8. `New Arrivals` with `badge_filter = COLLAB`
9. `Youtube Links`
10. `Sponsor Strip`

## Notes

- The four product sections all use the same component type: `sections.new-arrivals`
- Only `badge_filter` changes:
  - `NEW`
  - `SALE`
  - `HOT`
  - `COLLAB`
- Category links should use:
  - `/products?category=decks`
  - `/products?category=wheels`
  - `/products?category=apparel`
  - `/products?category=trucks`
  - `/products?category=gear`
  - `/products?category=accessories`

## Product Fields For Better Section Stats

Optional product fields now supported in Strapi:

- `brand_name`
- `sale_end_date`
- `views_count`
- `sold_count`
- `average_rating`
- `limit_per_customer`
- `waitlist_count`

If these are empty, the frontend still works and uses fallback values.
