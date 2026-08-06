-- Migration 0003: add wait_days to vehicles table
-- wait_days = days after order placement (waitDays in Feishu: 下单后需要等待天数)
-- 0 = In Stock, >0 = Preorder, NULL = unknown
ALTER TABLE vehicles ADD COLUMN wait_days INTEGER;
