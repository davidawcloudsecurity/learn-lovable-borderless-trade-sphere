# Welcome to your Lovable project

### How to create wordpress database and create tables for mock product
To use the mock products in a PostgreSQL `wordpress` database, you'll need to:

---

## ✅ 1. **Create the `wordpress` Database (if not exists)**

First, open `psql` as the `postgres` user:

```bash
docker exec -it adoring_galileo psql -U postgres
```

Then run:

```sql
CREATE DATABASE wordpress;
```

> If it already exists, you’ll get an error you can safely ignore.

---

## ✅ 2. **Connect to the `wordpress` Database**

Still inside `psql`:

```sql
\c wordpress
```

---

## ✅ 3. **Create a `products` Table**

```sql
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC(10, 2),
  original_price NUMERIC(10, 2),
  image TEXT,
  country TEXT,
  flag TEXT,
  rating NUMERIC(2, 1),
  reviews INTEGER,
  shipping TEXT,
  category TEXT
);
```

> PostgreSQL doesn’t have a "float" with exact precision, so use `NUMERIC(p, s)` for prices.

---

## ✅ 4. **(Optional) Insert Mock Data**

Here’s how you'd insert a few products as SQL:

```sql
INSERT INTO products (name, price, original_price, image, country, flag, rating, reviews, shipping, category)
VALUES
  ('MacBook Pro', 2500, 2800, 'photo-1647805256812-ccb927cf1f67', 'USA', '🇺🇸', 4.8, 1250, 'Free shipping', 'Electronics'),
  ('Lamp Shade', 25, 35, 'photo-1694353560850-436cb191fb8c', 'Italy', '🇮🇹', 4.2, 89, '$5.99 shipping', 'Home & Garden'),
  ('Laser Printer', 150, 199, 'photo-1625961332771-3f40b0e2bdcf', 'Japan', '🇯🇵', 4.5, 456, 'Free shipping', 'Electronics');
```

You can insert the rest similarly, or automate it from Node.js.

---

## ✅ 5. **Verify**

Run:

```sql
SELECT * FROM products;
```

You should see your rows.

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
