USE medimart;
UPDATE AspNetUsers
SET EmailConfirmed = 1
WHERE Email = 'admin@medimart.com';