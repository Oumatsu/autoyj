# Product Category Loading State Design

## Goal

Prevent local static vehicle data from appearing briefly while the public products API is loading on the three product category pages.

## Scope

- Apply the same behavior to `revenue-king`, `elite-flagship`, and `utility-pro`.
- Keep the category hero, filters, search, and sort controls visible.
- Show six neutral skeleton cards in the product grid while the request is pending.
- Render vehicle cards only after the API request succeeds.
- Show an explicit unavailable state if the request fails; never render local fallback vehicles as an error fallback.
- Static category data may still supply missing fields and default ordering after API data is available.

## State Flow

Each category page uses three explicit states:

1. `loading`: skeleton grid; no vehicle count, cards, or pagination from static data.
2. `ready`: API-derived vehicle cards, with static data used only for field completion and ordering.
3. `error`: empty/unavailable message; no static vehicle cards.

## UI

The shared skeleton matches the two-column card grid and renders six cards so the page height remains stable. Each card contains image, title, price, and specification placeholders with subdued pulse animation. The error state occupies the same product-column area.

## Verification

- A source contract test covers all three category pages and fails if any page restores `products || vehicles` or omits the shared loading/error states.
- Run the Node test, `npm run check`, and `npm run build`.
- Inspect the built initial page output or local refresh behavior to confirm static inventory text is absent before API completion.
