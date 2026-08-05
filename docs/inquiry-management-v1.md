# Inquiry Management V1

## Access model

- `admin` and `sales` can read every inquiry, write notes, and change inquiry status.
- `partner` and `customer` can read only inquiries for their company or where they are listed as a participant. They can write notes but cannot change status.
- The Worker enforces these rules for every inquiry endpoint. The UI only reflects the resulting permissions.

## Data model

`inquiries` remains the inquiry header and stores the original vehicle, quantity, trade term, target price, and initial note.

- `inquiry_notes`: chronological discussion entries. A note may reference one parent note for a single reply level.
- `inquiry_participants`: the external company/user access list. Admin and sales access is implicit and does not require a row.
- `inquiry_status_history`: immutable record of each status change.

The inquiry header remains the source for the commercial snapshot. A later catalog or price change must not change the meaning of an existing inquiry.

## API

- `GET /api/portal/inquiries` returns inquiry summaries in the caller's allowed scope.
- `GET /api/portal/inquiries/:inquiryNo` returns a scoped inquiry with notes and status history.
- `POST /api/portal/inquiries` creates a header, creator participation row, and initial note where provided.
- `POST /api/portal/inquiries/:inquiryNo/notes` adds a scoped note.
- `PATCH /api/portal/inquiries/:inquiryNo/status` is restricted to `admin` and `sales` and appends a history row.

## UI

Inquiry Management uses a list-detail layout: a filterable inquiry list, immutable commercial summary, status controls for internal roles, a chronological note timeline, and a note composer available to all supported account types.
