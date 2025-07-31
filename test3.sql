USE medimart;
UPDATE Orders
SET DeliveryDate = DATEADD(DAY, 2, GETDATE())
WHERE Id = 1002;