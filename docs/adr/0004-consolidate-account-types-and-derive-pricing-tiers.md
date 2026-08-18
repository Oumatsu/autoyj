# ADR 0004: Consolidation of Core Account Types and Automatic Derivation of Pricing Tiers

## Status
Accepted

## Context
Previously, user administration separated RBAC `Role` (`admin`, `sales`, `partner`, `customer`) from B2B `PriceTier` (`internal`, `partner`, `vip`, `hidden`), presenting a redundant 2-axis dropdown matrix in the administrative UI and backend endpoints.

In practical B2B automotive export operations:
1. Internal staff (`admin`, `sales`) unconditionally operate on zero-margin internal cost benchmarks (`internal`).
2. Overseas distribution partners (`partner`) map directly to channel wholesale discount tiers (`partner`).
3. External buyers (`customer`) map to standard trade pricing (`partner` / standard tier).
4. Exposing separate orthogonal dropdowns increased cognitive load and configuration errors during account provisioning.

## Decisions

1. **Four Canonical Account Types**:
   - The user management domain converges on 4 clear, business-driven account types:
     - 👑 **Admin** (System & Operations) -> `role: "admin"`, derived `priceTier: "internal"`
     - 💼 **Sales** (Sales Lead) -> `role: "sales"`, derived `priceTier: "internal"`
     - 🤝 **Partner** (Channel Distributor) -> `role: "partner"`, derived `priceTier: "partner"`
     - 👤 **Customer** (Overseas Buyer) -> `role: "customer"`, derived `priceTier: "partner"`

2. **Automated Tier Derivation**:
   - `lib/users.ts` exports `defaultPriceTierForRole(role: PortalRole): PriceTier`.
   - The Account Creation/Editing Modal eliminates the separate manual `Price Tier` select field, automatically setting and synchronizing `priceTier` when an account type is chosen.
   - Quotation-specific custom discounts remain composable in the sales Quote Composer for one-off deals without polluting account definitions.

## Consequences
- Streamlined administrative UX: 1-click role selection without confusing tier matrices.
- Guaranteed business invariant: internal staff cannot accidentally be provisioned with customer price tiers, and vice-versa.
- Zero breaking changes: existing database schema and pricing calculation engines remain 100% backward compatible.
