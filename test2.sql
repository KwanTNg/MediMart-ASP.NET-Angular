USE medimart;
UPDATE AspNetUsers
SET CreatedAt = DATEADD(DAY, -12, GETDATE())
WHERE Email = 'admin@medimart.com';