use medimart;
UPDATE Orders
SET Status = 'Dispatched'
WHERE Status = 'Delivered';
