CREATE TABLE Categories (
id Serial Primary key,
category_name varchar(255) not null

);

CREATE TABLE Users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL CHECK (char_length(name) >= 2), -- Name must not be empty and have at least 2 characters
    email VARCHAR(100) UNIQUE NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'), -- Valid email format
    password VARCHAR(100) NOT NULL CHECK (LENGTH(password) >= 8), -- Password must have at least 8 characters
    role VARCHAR(10) CHECK (role IN ('admin', 'customer')) NOT NULL, -- Role must be 'admin' or 'customer'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);




CREATE TABLE Products (
    id SERIAL PRIMARY KEY,                                  -- Auto-incremented product ID
    product_name VARCHAR(255) NOT NULL CHECK (char_length(product_name) >= 2), -- Product name, must be at least 2 characters long
    ws_code INTEGER NOT NULL UNIQUE CHECK (ws_code >= 0),   -- Product code, must be a non-negative integer
    sales_price INTEGER NOT NULL CHECK (sales_price > 0),   -- Sales price, must be greater than 0
    mrp INTEGER NOT NULL CHECK (mrp > 0 AND mrp >= sales_price), -- MRP, must be greater than 0 and >= sales_price
    package_size INTEGER NOT NULL CHECK (package_size > 0), -- Package size, must be greater than 0
    images TEXT[] DEFAULT '{}',                             -- Array of image URLs for the product
    tags TEXT[] DEFAULT '{}',                               -- Array of tags associated with the product (e.g., 'electronics', 'sale')
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,-- Foreign key to Categories table
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0)     -- Ensure stock is non-negative
);



-- -- Indexes for improved query performance
-- CREATE INDEX idx_category_id ON Products(category_id);
-- CREATE INDEX idx_tags ON Products USING GIN (tags);


CREATE TABLE Carts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES Products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TYPE order_status AS ENUM ('Pending', 'Shipped', 'Completed', 'Cancelled');

CREATE TABLE Orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
    status order_status DEFAULT 'Pending',
    total_amount DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE Order_Items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES Orders(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES Products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price DECIMAL(10, 2)
);

