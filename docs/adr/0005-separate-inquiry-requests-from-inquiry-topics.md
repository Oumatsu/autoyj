# ADR 0005: Store customer quotation applications separately from inquiry topics

## Status

Accepted

## Decision

Keep `inquiries` and `inquiry_notes` as the existing inquiry-topic and discussion context. Store every Partner or Customer **Apply quotation** submission in a new `inquiry_requests` table linked by `inquiry_no`. An inquiry request is a read-only snapshot of one vehicle configuration, role-specific FOB price, contact details, and quantity; it can be permanently deleted only by its submitter. This intentionally does not create or modify a formal `quotes` record.

## Consequences

The new table avoids overloading topic/comment state with purchase-request data and permits one topic to contain multiple independently visible requests. Server-side request creation recalculates the viewer's authorized FOB price and never accepts a browser-supplied price.
