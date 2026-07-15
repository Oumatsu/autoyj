# Insight Detail Query Fix Design

## Problem

The Insights list successfully reads published records from Feishu table `tblGeZKKIL9O7jaT`, but the detail endpoint sends a JSON condition object as the `filter` query parameter to the list-records endpoint. Feishu rejects that request with `InvalidFilter`, and the client incorrectly reaches its article-not-found state.

After the article loads, a second race can blank the page: the local `insightsDetail.tags.*` values are arrays, but the live translation payload does not contain `insightsDetail`. When live translations replace the static dictionary, `t()` returns a string key and the detail page calls `.map()` on that string.

## Design

Keep Feishu Base as the only article source. `handlePublicInsight` will use the same unfiltered, paginated read path as the working Insights list, then locate the record whose `slug` exactly matches the route and whose `status` is `Published`. The returned article shape and 404 behavior remain unchanged.

Dynamic translations will overlay, rather than replace, the static locale dictionaries. The detail page will also normalize translated tag values so its render input is always a string array.

## Scope

- Modify only the public Insight detail query in `worker/portal.ts`.
- Add a regression test that prevents this handler from reintroducing `equalsFilter` and requires exact slug/status matching after a normal paginated read.
- Add static fallback resolution for keys missing from live translations and type-safe Insight tag normalization.
- Do not modify Feishu schema, views, records, or article content.
- Do not push or deploy without a separate explicit request.

## Verification

- Observe the regression test fail against the current invalid-filter implementation.
- Run the full Node test suite after the fix.
- Run Vinext compatibility checks and a production build.
- Verify the target detail endpoint through a local Worker runtime when available.
