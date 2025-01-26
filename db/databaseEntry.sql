INSERT INTO Categories (category_name)
VALUES
        ('Electronics'),
        ('Clothing'),
        ('Home Appliances'),
        ('Books'),
        ('Toys'),
        ('Beauty & Personal Care'),
        ('Sports & Outdoors'),
        ('Furniture'),
        ('Automotive'),
        ('Food & Beverages');

-- Inserting 5 products for 'Electronics' (category_id = 1)
INSERT INTO Products (product_name, ws_code, sales_price, mrp, package_size, images, tags, category_id, stock)
VALUES
    ('Smartphone', 101, 500, 600, 1, '{"image1.jpg", "image2.jpg", "image3.jpg"}', '{"electronics", "smartphone", "sale"}', 1, 50),
    ('Laptop', 102, 1000, 1200, 1, '{"image4.jpg", "image5.jpg"}', '{"electronics", "laptop", "new"}', 1, 30),
    ('Headphones', 103, 100, 150, 1, '{"image6.jpg"}', '{"electronics", "audio", "headphones"}', 1, 100),
    ('Smartwatch', 104, 150, 200, 1, '{"image7.jpg", "image8.jpg", "image9.jpg"}', '{"electronics", "wearable"}', 1, 70),
    ('Camera', 105, 400, 500, 1, '{"image10.jpg", "image11.jpg"}', '{"electronics", "photography", "camera", "sale", "new"}', 1, 40);

-- Inserting 5 products for 'Clothing' (category_id = 2)
INSERT INTO Products (product_name, ws_code, sales_price, mrp, package_size, images, tags, category_id, stock)
VALUES
    ('T-shirt', 201, 20, 30, 1, '{"image12.jpg", "image13.jpg"}', '{"clothing", "casual", "tshirt"}', 2, 150),
    ('Jeans', 202, 40, 50, 1, '{"image14.jpg"}', '{"clothing", "denim", "jeans"}', 2, 80),
    ('Jacket', 203, 60, 80, 1, '{"image15.jpg", "image16.jpg"}', '{"clothing", "winter", "jacket"}', 2, 60),
    ('Sweater', 204, 30, 40, 1, '{"image17.jpg"}', '{"clothing", "warm"}', 2, 100),
    ('Shorts', 205, 25, 35, 1, '{"image18.jpg", "image19.jpg"}', '{"clothing", "summer", "shorts"}', 2, 120);

-- Inserting 5 products for 'Home Appliances' (category_id = 3)
INSERT INTO Products (product_name, ws_code, sales_price, mrp, package_size, images, tags, category_id, stock)
VALUES
    ('Blender', 301, 50, 70, 1, '{"image20.jpg"}', '{"appliances", "kitchen", "blender"}', 3, 60),
    ('Microwave', 302, 150, 200, 1, '{"image21.jpg", "image22.jpg"}', '{"appliances", "cooking", "microwave"}', 3, 40),
    ('Vacuum Cleaner', 303, 100, 150, 1, '{"image23.jpg"}', '{"appliances", "cleaning"}', 3, 50),
    ('Refrigerator', 304, 500, 600, 1, '{"image24.jpg", "image25.jpg"}', '{"appliances", "cooling", "fridge"}', 3, 30),
    ('Washing Machine', 305, 300, 400, 1, '{"image26.jpg", "image27.jpg"}', '{"appliances", "laundry", "washing machine", "sale"}', 3, 20);

-- Inserting 5 products for 'Books' (category_id = 4)
INSERT INTO Products (product_name, ws_code, sales_price, mrp, package_size, images, tags, category_id, stock)
VALUES
    ('Fiction Book', 401, 10, 15, 1, '{"image28.jpg"}', '{"books", "fiction"}', 4, 100),
    ('Science Book', 402, 20, 30, 1, '{"image29.jpg", "image30.jpg"}', '{"books", "science", "education"}', 4, 80),
    ('Cookbook', 403, 15, 25, 1, '{"image31.jpg"}', '{"books", "cooking", "recipe"}', 4, 120),
    ('Biography', 404, 25, 35, 1, '{"image32.jpg"}', '{"books", "biography", "non-fiction"}', 4, 60),
    ('Children Book', 405, 8, 12, 1, '{"image33.jpg", "image34.jpg", "image35.jpg"}', '{"books", "children", "story"}', 4, 150);

-- Inserting 5 products for 'Toys' (category_id = 5)
INSERT INTO Products (product_name, ws_code, sales_price, mrp, package_size, images, tags, category_id, stock)
VALUES
    ('Lego Set', 501, 30, 40, 1, '{"image36.jpg", "image37.jpg"}', '{"toys", "building", "lego", "fun"}', 5, 100),
    ('Doll', 502, 15, 20, 1, '{"image38.jpg", "image39.jpg"}', '{"toys", "kids", "doll"}', 5, 120),
    ('Action Figure', 503, 20, 25, 1, '{"image40.jpg"}', '{"toys", "collectible", "action figure"}', 5, 80),
    ('Toy Car', 504, 10, 15, 1, '{"image41.jpg"}', '{"toys", "car", "fun"}', 5, 150),
    ('Puzzle', 505, 12, 18, 1, '{"image42.jpg", "image43.jpg"}', '{"toys", "puzzle", "game", "fun", "children"}', 5, 130);

-- Inserting 5 products for 'Beauty & Personal Care' (category_id = 6)
INSERT INTO Products (product_name, ws_code, sales_price, mrp, package_size, images, tags, category_id, stock)
VALUES
    ('Shampoo', 601, 10, 15, 1, '{"image44.jpg"}', '{"beauty", "hair", "shampoo"}', 6, 200),
    ('Lipstick', 602, 5, 10, 1, '{"image45.jpg", "image46.jpg"}', '{"beauty", "makeup", "lipstick", "cosmetics"}', 6, 150),
    ('Face Cream', 603, 20, 25, 1, '{"image47.jpg"}', '{"beauty", "skin", "cream"}', 6, 100),
    ('Perfume', 604, 30, 40, 1, '{"image48.jpg"}', '{"beauty", "fragrance", "perfume", "luxury"}', 6, 80),
    ('Nail Polish', 605, 7, 12, 1, '{"image49.jpg", "image50.jpg"}', '{"beauty", "nails", "polish", "cosmetics"}', 6, 180);

-- Inserting 5 products for 'Sports & Outdoors' (category_id = 7)
INSERT INTO Products (product_name, ws_code, sales_price, mrp, package_size, images, tags, category_id, stock)
VALUES
    ('Tennis Racket', 701, 50, 60, 1, '{"image51.jpg", "image52.jpg"}', '{"sports", "racket", "tennis"}', 7, 40),
    ('Football', 702, 20, 25, 1, '{"image53.jpg"}', '{"sports", "ball", "football"}', 7, 100),
    ('Yoga Mat', 703, 15, 20, 1, '{"image54.jpg"}', '{"sports", "yoga", "exercise"}', 7, 120),
    ('Basketball', 704, 25, 30, 1, '{"image55.jpg"}', '{"sports", "ball", "basketball", "game"}', 7, 60),
    ('Golf Club', 705, 100, 150, 1, '{"image56.jpg", "image57.jpg"}', '{"sports", "golf", "club"}', 7, 30);

-- Inserting 5 products for 'Furniture' (category_id = 8)
INSERT INTO Products (product_name, ws_code, sales_price, mrp, package_size, images, tags, category_id, stock)
VALUES
    ('Sofa', 801, 300, 350, 1, '{"image58.jpg", "image59.jpg"}', '{"furniture", "living room", "sofa"}', 8, 20),
    ('Dining Table', 802, 200, 250, 1, '{"image60.jpg"}', '{"furniture", "dining", "table"}', 8, 40),
    ('Bed', 803, 500, 600, 1, '{"image61.jpg", "image62.jpg"}', '{"furniture", "bedroom", "bed"}', 8, 10),
    ('Bookshelf', 804, 100, 150, 1, '{"image63.jpg"}', '{"furniture", "office", "bookshelf"}', 8, 50),
    ('Chair', 805, 80, 120, 1, '{"image64.jpg", "image65.jpg"}', '{"furniture", "office", "chair"}', 8, 60);

-- Inserting 5 products for 'Automotive' (category_id = 9)
INSERT INTO Products (product_name, ws_code, sales_price, mrp, package_size, images, tags, category_id, stock)
VALUES
    ('Car Seat Cover', 901, 30, 40, 1, '{"image66.jpg", "image67.jpg"}', '{"automotive", "accessory", "seat cover"}', 9, 100),
    ('Car Vacuum Cleaner', 902, 50, 70, 1, '{"image68.jpg"}', '{"automotive", "cleaning", "vacuum"}', 9, 80),
    ('Tire', 903, 100, 120, 1, '{"image69.jpg"}', '{"automotive", "maintenance", "tire"}', 9, 60),
    ('Jump Starter', 904, 70, 90, 1, '{"image70.jpg"}', '{"automotive", "tool", "jump starter"}', 9, 50),
    ('Car Battery', 905, 120, 150, 1, '{"image71.jpg", "image72.jpg"}', '{"automotive", "parts", "battery"}', 9, 40);

-- Inserting 5 products for 'Food & Beverages' (category_id = 10)
INSERT INTO Products (product_name, ws_code, sales_price, mrp, package_size, images, tags, category_id, stock)
VALUES
    ('Chocolate Bar', 1001, 5, 7, 1, '{"image73.jpg"}', '{"food", "snack", "chocolate"}', 10, 200),
    ('Cereal', 1002, 10, 12, 1, '{"image74.jpg", "image75.jpg"}', '{"food", "breakfast", "cereal"}', 10, 150),
    ('Coffee', 1003, 15, 20, 1, '{"image76.jpg"}', '{"food", "beverage", "coffee"}', 10, 100),
    ('Juice', 1004, 5, 8, 1, '{"image77.jpg", "image78.jpg"}', '{"food", "beverage", "juice", "fresh"}', 10, 180),
    ('Candy', 1005, 3, 5, 1, '{"image79.jpg"}', '{"food", "sweet", "candy"}', 10, 250);
