-- A quotation may supersede the vehicle and quantity selected when its inquiry was opened.
-- Populate existing rows from their linked inquiry before new quote writes require this value.
ALTER TABLE quotes ADD COLUMN quantity INTEGER;

UPDATE quotes
SET quantity = COALESCE(
  (SELECT inquiries.quantity FROM inquiries WHERE inquiries.inquiry_no = quotes.inquiry_no),
  1
)
WHERE quantity IS NULL;
