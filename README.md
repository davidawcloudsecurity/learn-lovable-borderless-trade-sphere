# Welcome to your Lovable project

### How to create wordpress database and create tables for mock product
To use the mock products in a PostgreSQL `wordpress` database, you'll need to:

---

## ✅ 1. **Create the `wordpress` Database (if not exists)**

First, open `psql` as the `postgres` user:

```bash
# 1. Run PostgreSQL Docker container
docker run --name postgres-db \
  -e POSTGRES_DB=shop_db \
  -e POSTGRES_USER=shop_user \
  -e POSTGRES_PASSWORD=shop_password \
  -p 5432:5432 \
  -d postgres:15

# 2. Wait a few seconds for PostgreSQL to start, then connect to create the table
docker exec -it postgres-db psql -U shop_user -d shop_db

# 3. In the PostgreSQL shell, create the products table:
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2),
    image VARCHAR(255),
    country VARCHAR(100),
    flag VARCHAR(10),
    rating DECIMAL(3,2),
    reviews INTEGER,
    shipping VARCHAR(255),
    category VARCHAR(100)
);

# 4. Insert the mock data
INSERT INTO products (name, price, original_price, image, country, flag, rating, reviews, shipping, category) VALUES
('MacBook Pro', 2500.00, 2800.00, 'photo-1647805256812-ccb927cf1f67', 'USA', '🇺🇸', 4.8, 1250, 'Free shipping', 'Electronics'),
('Lamp Shade', 25.00, 35.00, 'photo-1694353560850-436cb191fb8c', 'Italy', '🇮🇹', 4.2, 89, '$5.99 shipping', 'Home & Garden'),
('Laser Printer', 150.00, 199.00, 'photo-1625961332771-3f40b0e2bdcf', 'Japan', '🇯🇵', 4.5, 456, 'Free shipping', 'Electronics'),
('Laptop Stand', 45.00, 60.00, 'photo-1623251606108-512c7c4a3507', 'Germany', '🇩🇪', 4.3, 234, '$3.99 shipping', 'Electronics'),
('LED Light Bulb', 12.00, 18.00, 'photo-1553213134-f60afad82ceb', 'China', '🇨🇳', 4.1, 567, 'Free shipping', 'Home & Garden'),
('Luggage Set', 120.00, 160.00, 'photo-1708403120467-1715bb6840df', 'France', '🇫🇷', 4.6, 123, '$8.99 shipping', 'Travel'),
('Camping Lantern', 35.00, 50.00, 'photo-1570739260082-39a84dae80c8', 'Canada', '🇨🇦', 4.4, 198, 'Free shipping', 'Outdoor');

# 5. Exit PostgreSQL shell
\q

---

## ✅ 5. **Verify**

Run:

```sql
SELECT * FROM products;
```

You should see your rows.
### ✅ Optional: From Node.js
Great! You already have a solid `products` table that matches the data structure from your React components. Let's design the remaining tables to work with your existing schema and checkout flow. Here's how we can extend your database:

### 1. Orders Table (modified to match your checkout form)
```sql
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(20) UNIQUE NOT NULL DEFAULT CONCAT('ORD-', EXTRACT(EPOCH FROM NOW())::BIGINT),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20),
    country VARCHAR(100),
    subtotal DECIMAL(10,2) NOT NULL,
    shipping_cost DECIMAL(10,2) NOT NULL DEFAULT 5.99,
    tax_amount DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_status VARCHAR(20) NOT NULL DEFAULT 'pending',
    status VARCHAR(20) NOT NULL DEFAULT 'processing',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### 2. Order Items Table (links to your products)
```sql
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### 3. Payments Table (secure payment handling)
```sql
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    transaction_id VARCHAR(100),
    card_last4 VARCHAR(4),
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### Key Improvements for Your System:

1. **Order Number Generation**:
   - Automatically generates unique order numbers like "ORD-1700000000"

2. **Relationships**:
   - `order_items` links to your existing `products` table
   - Cascading deletes ensure data integrity

3. **Tax Calculation**:
   - Your frontend calculates tax (8%) - we store the exact amount

4. **Status Tracking**:
   - Both payment and order statuses are tracked

### Sample Insert Query for Checkout:
```sql
-- Begin transaction
BEGIN;

-- 1. Create the order
INSERT INTO orders (
    first_name, last_name, email, phone,
    address, city, postal_code, country,
    subtotal, tax_amount, total_amount
) VALUES (
    'John', 'Doe', 'john@example.com', '+15551234567',
    '123 Main St', 'New York', '10001', 'United States',
    49.99, 4.47, 60.45
) RETURNING id;

-- 2. Add order items (using the returned order_id)
INSERT INTO order_items (
    order_id, product_id, quantity, unit_price, original_price
) VALUES (
    1,  -- This would come from the RETURNING above
    5,  -- Product ID from your products table
    1,
    49.99,
    59.99
);

-- 3. Record payment attempt
INSERT INTO payments (
    order_id, amount, payment_method, card_last4
) VALUES (
    1,
    60.45,
    'credit_card',
    '4242'  -- Last 4 digits from your form
);

-- Commit if all succeeds
COMMIT;
```

### Backend Integration (Node.js/Express Example):
```typescript
// POST /api/orders
router.post('/', async (req, res) => {
  const { customer, product, payment } = req.body;
  
  try {
    const order = await pool.query(
      `INSERT INTO orders (
        first_name, last_name, email, phone,
        address, city, postal_code, country,
        subtotal, tax_amount, total_amount
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id`,
      [
        customer.firstName, customer.lastName, customer.email, customer.phone,
        customer.address, customer.city, customer.postalCode, customer.country,
        product.price, (product.price + 5.99) * 0.08,  // Tax
        product.price + 5.99 + (product.price + 5.99) * 0.08  // Total
      ]
    );

    await pool.query(
      `INSERT INTO order_items (
        order_id, product_id, unit_price, original_price
      ) VALUES ($1, $2, $3, $4)`,
      [order.rows[0].id, product.id, product.price, product.originalPrice]
    );

    res.status(201).json({ orderId: order.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: 'Order processing failed' });
  }
});
```

### Frontend Modifications:
Update your `handleAddToCart` in `productcard.tsx` to:
```typescript
const handleAddToCart = async () => {
  try {
    const response = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: id,
        quantity: 1
      })
    });
    navigate('/checkout');
  } catch (error) {
    toast.error('Failed to add to cart');
  }
};
```

This design gives you a complete order processing system that:
1. Preserves your existing product structure
2. Handles guest checkouts (no user account required)
3. Maintains proper relationships between tables
4. Tracks payment and order status

Would you like me to add any specific features like:
- User accounts/login system
- Inventory management
- Discount/promo code support
- Shipping method options?

---

### ✅ Optional: From Node.js

If you're loading from code, insert the mock array using your `pg` client like:

```js
const insertProduct = `
  INSERT INTO products
    (name, price, original_price, image, country, flag, rating, reviews, shipping, category)
  VALUES
    ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
`;

for (const p of mockProducts) {
  await pool.query(insertProduct, [
    p.name, p.price, p.originalPrice, p.image, p.country, p.flag,
    p.rating, p.reviews, p.shipping, p.category
  ]);
}
```
## Project info

**URL**: https://lovable.dev/projects/a9a91029-a853-4bb8-b915-13ab750793f5

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/a9a91029-a853-4bb8-b915-13ab750793f5) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:
```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
nvm install 15.0.0
node -e "console.log('Running Node.js ' + process.version)"
nvm install-latest-npm
```
```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev

# Step 5: Start the api server (e.g., using Express).
npm install express cors

# Step 6: Run the backend
node server.js
```

Test it
```
http://localhost:3001/api/search/suggestions?q=lap
```
You should get JSON like:

```
{
  "suggestions": ["laptop", "lamp"]
}
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/a9a91029-a853-4bb8-b915-13ab750793f5) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
