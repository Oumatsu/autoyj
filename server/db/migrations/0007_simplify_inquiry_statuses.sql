-- Inquiry lifecycle is intentionally limited to two canonical database values.
-- Historical commercial stages are retained as events (quotes/negotiations), not inquiry states.
UPDATE inquiries
SET status = CASE
  WHEN LOWER(TRIM(status)) = 'closed' THEN 'closed'
  ELSE 'open'
END;

UPDATE inquiry_status_history
SET from_status = CASE
  WHEN LOWER(TRIM(from_status)) = 'closed' THEN 'closed'
  ELSE 'open'
END
WHERE from_status IS NOT NULL;

UPDATE inquiry_status_history
SET to_status = CASE
  WHEN LOWER(TRIM(to_status)) = 'closed' THEN 'closed'
  ELSE 'open'
END;
