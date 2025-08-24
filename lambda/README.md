Great — let’s walk through **Step 1: Installing the required packages** to prepare your Express app for AWS Lambda.

---

## ✅ Step 1: Install Required Packages

### Required Package:

You'll need a library to adapt your Express app to AWS Lambda's format. The **modern and officially supported package** is:

```
@vendia/serverless-express
```

### Run this in your project root:

```bash
npm install @vendia/serverless-express
```

---

### Why this package?

`@vendia/serverless-express` allows you to run a full Express.js app in a Lambda function by handling the event and context objects, converting them to standard Express requests.

It's the successor to `aws-serverless-express`, which is no longer maintained.

---

Once installed, you're ready for **Step 2: Wrapping your Express app for Lambda**.

Let me know when you're ready to continue, or if you'd like to confirm the install was successful.

📌 Confirm It's Installed

After installing, your package.json should include:

"dependencies": {
  "@vendia/serverless-express": "^4.x.x", // version may vary
  ...
}


And you'll see a new entry in node_modules/.

Perfect — moving on to **Step 2: Wrap your Express app for AWS Lambda**.

---

## ✅ Step 2: Wrap Your Express App for Lambda

### 🧱 Goal:

We need to:

1. Refactor your Express app into a reusable module.
2. Create a `lambda.js` file that wraps it using `@vendia/serverless-express`.

---

### 📁 Refactor your code like this:

### 🔹 1. Create `app.js` — Your Express App

Move your entire Express logic (from your original file) into a new file named **`app.js`**, and **export the `app` object** at the end.

```js
// app.js
import express from 'express';
import cors from 'cors';
import pkg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pkg;

const app = express();
app.use(cors());
app.use(express.json());

// PostgreSQL connection pool
const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT || 5432,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  ssl: {
    rejectUnauthorized: false
  }
});

// Test DB connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Error connecting to PostgreSQL:', err);
  } else {
    console.log('✅ Connected to PostgreSQL database');
    release();
  }
});

// Suggestion endpoint
app.get('/api/search/suggestions', async (req, res) => {
  try {
    const q = req.query.q?.toLowerCase() || '';
    const query = `
      SELECT DISTINCT name 
      FROM products 
      WHERE LOWER(name) LIKE $1 OR LOWER(category) LIKE $1
      LIMIT 10
    `;
    const result = await pool.query(query, [`%${q}%`]);
    const suggestions = result.rows.map(row => row.name.toLowerCase());
    res.json({ suggestions });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search endpoint
app.get('/api/search', async (req, res) => {
  try {
    const q = req.query.q?.toLowerCase() || '';
    const limit = parseInt(req.query.limit) || 12;
    const offset = parseInt(req.query.offset) || 0;

    const countQuery = `
      SELECT COUNT(*) as total 
      FROM products 
      WHERE LOWER(name) LIKE $1 OR LOWER(category) LIKE $1
    `;
    const countResult = await pool.query(countQuery, [`%${q}%`]);
    const total = parseInt(countResult.rows[0].total);

    const dataQuery = `
      SELECT * FROM products 
      WHERE LOWER(name) LIKE $1 OR LOWER(category) LIKE $1
      ORDER BY id
      LIMIT $2 OFFSET $3
    `;
    const dataResult = await pool.query(dataQuery, [`%${q}%`, limit, offset]);

    res.json({
      query: q,
      results: dataResult.rows,
      total: total,
      limit: limit,
      offset: offset
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default app;
```

---

### 🔹 2. Create `lambda.js` — Lambda Entry Point

This file will create a Lambda-compatible handler from your Express app:

```js
// lambda.js
import serverlessExpress from '@vendia/serverless-express';
import app from './app.js';

export const handler = serverlessExpress({ app });
```

---

### 🧪 (Optional) Still want to test locally?

You can keep a `server.js` file to run the app locally:

```js
// server.js
import app from './app.js';

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`✅ API server is running at http://localhost:${PORT}`);
});
```

---

✅ Done! Now your app is ready for **deployment to Lambda**.

Let me know when you’re ready for **Step 3: Set up Serverless Framework for deployment**, or if you'd like help testing your setup locally first.

Awesome — now let’s do **Step 3: Set up the Serverless Framework** to deploy your Express API to **AWS Lambda** and expose it via **API Gateway**.

---

## ✅ Step 3: Set Up Serverless Framework

---

### 🔹 1. Install Serverless Framework (if not installed)

Globally install it using npm:

```bash
npm install -g serverless
```

You can verify the install with:

```bash
serverless --version
```

---

### 🔹 2. Log in (Optional but recommended)

This gives you a dashboard and easier secret management:

```bash
serverless login
```

---

### 🔹 3. Initialize Serverless in your project

In your project root (where `package.json` is):

```bash
serverless
```

Follow the prompts:

* Choose: `AWS Node.js`
* Accept default project name or rename it
* Choose `No` if asked about TypeScript for now
* Choose `Yes` if it offers to deploy a demo service (or skip — we’ll configure ours manually)

This will generate a basic `serverless.yml` file.

---

### 🔹 4. Replace with custom `serverless.yml`

Replace the contents of `serverless.yml` with this:

```yaml
service: express-api

provider:
  name: aws
  runtime: nodejs18.x
  region: us-east-1 # or your preferred region
  environment:
    POSTGRES_HOST: ${env:POSTGRES_HOST}
    POSTGRES_PORT: ${env:POSTGRES_PORT}
    POSTGRES_DB: ${env:POSTGRES_DB}
    POSTGRES_USER: ${env:POSTGRES_USER}
    POSTGRES_PASSWORD: ${env:POSTGRES_PASSWORD}

functions:
  api:
    handler: lambda.handler
    events:
      - httpApi: '*'

plugins:
  - serverless-dotenv-plugin

package:
  individually: true
  excludeDevDependencies: true
  patterns:
    - '!node_modules/**'
    - '!*.md'
    - '!server.js'  # exclude local-only files
```

---

### 🔹 5. Add `.env` file (already done)

Make sure your `.env` has:

```env
POSTGRES_HOST=your-db-endpoint.amazonaws.com
POSTGRES_PORT=5432
POSTGRES_DB=your-db-name
POSTGRES_USER=your-db-user
POSTGRES_PASSWORD=your-db-password
```

---

### 🔹 6. Install dotenv plugin for Serverless

In your project:

```bash
npm install serverless-dotenv-plugin
```

This allows `serverless.yml` to use your local `.env` file during deployment.

---

### 🔹 7. Deploy to AWS

Finally, deploy with:

```bash
serverless deploy
```

It may take 1–2 minutes.

At the end, you'll see a URL like this:

```bash
endpoints:
  ANY - https://abc123xyz.execute-api.us-east-1.amazonaws.com
```

Try hitting:

* `https://abc123xyz.execute-api.us-east-1.amazonaws.com/api/search`
* `https://abc123xyz.execute-api.us-east-1.amazonaws.com/api/search/suggestions?q=mac`

---

✅ That's it! You now have your Express app running on AWS Lambda via API Gateway.

---

Would you like to add **VPC access** so it can talk to RDS (if needed)? Or deploy with a GitHub Actions CI/CD setup?


Perfect — you're asking:

> **"How do I manually connect my Express app (running in Lambda) to API Gateway?"**

Let’s go through it step by step using the **AWS Console**, without using the Serverless Framework.

---

## ✅ What You're Building

You’ll manually:

1. 📦 Package and upload your Express app as a Lambda function
2. 🌐 Create an API Gateway (HTTP API or REST API)
3. 🔗 Connect the API Gateway to your Lambda function
4. 🧪 Test your `/api/*` endpoints

---

## 🧱 Step-by-Step Guide

---

### 🔹 Step 1: Prepare Your Express App for Lambda

You already did this in Step 2. Here's a quick summary:

#### 1. `app.js` — your Express logic

```js
// app.js
import express from 'express';
const app = express();

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from Lambda + Express!' });
});

export default app;
```

#### 2. `lambda.js` — the Lambda entry point

```js
// lambda.js
import serverlessExpress from '@vendia/serverless-express';
import app from './app.js';

export const handler = serverlessExpress({ app });
```

#### 3. Package your code

Create a ZIP with all required files:

```bash
zip -r lambda-api.zip lambda.js app.js node_modules package.json
```

> ✅ Make sure your `node_modules` folder is included!

---

### 🔹 Step 2: Create Lambda Function (via Console)

1. Go to **AWS Lambda Console** → [https://console.aws.amazon.com/lambda](https://console.aws.amazon.com/lambda)
2. Click **Create function**
3. Choose:

   * **Author from scratch**
   * Name: `expressApi`
   * Runtime: `Node.js 18.x`
   * Permissions: Choose existing role or create one with basic Lambda execution permissions
4. Click **Create function**
5. After creation:

   * Scroll down to **Code source**
   * Click **Upload from → .zip file**
   * Upload `lambda-api.zip`
   * Click **Deploy**

---

### 🔹 Step 3: Create API Gateway

1. Go to **API Gateway Console** → [https://console.aws.amazon.com/apigateway](https://console.aws.amazon.com/apigateway)
2. Click **Create API**
3. Choose **HTTP API** (simpler and faster)
4. Click **Build**

---

#### 3a. Configure API

* **Name**: `expressHttpApi`
* **Configure routes**:

  * Click **Add integration** → **Lambda function**
  * Choose your Lambda function (`expressApi`)
  * Click **Add**
* **Define route**:

  * Method: `ANY`
  * Path: `/api/{proxy+}`
    (This will route all `/api/*` calls)
* Click **Next**
* **Stages**: Accept default (`$default`)
* Click **Create**

---

### 🔹 Step 4: Enable Lambda Permissions

Lambda must allow API Gateway to invoke it.

If not added automatically, go to **Lambda > Permissions > Resource-based policy** and add:

```json
{
  "Effect": "Allow",
  "Principal": {
    "Service": "apigateway.amazonaws.com"
  },
  "Action": "lambda:InvokeFunction",
  "Resource": "arn:aws:lambda:REGION:ACCOUNT_ID:function:expressApi"
}
```

Or run this via AWS CLI (replace values):

```bash
aws lambda add-permission \
  --function-name expressApi \
  --statement-id apigateway-access \
  --action lambda:InvokeFunction \
  --principal apigateway.amazonaws.com \
  --source-arn arn:aws:execute-api:<region>:<account-id>:<api-id>/*/*/api/{proxy+}
```

---

### 🔹 Step 5: Test Your API Gateway Endpoint

Your HTTP API base URL will look like:

```
https://abc123xyz.execute-api.us-east-1.amazonaws.com
```

Try calling:

```bash
curl https://abc123xyz.execute-api.us-east-1.amazonaws.com/api/hello
```

You should get:

```json
{ "message": "Hello from Lambda + Express!" }
```

---

### 🔹 Step 6: (Optional) Point CloudFront `/api/*` to API Gateway

In CloudFront:

* Add a behavior for `/api/*`
* Set the **origin** to your API Gateway URL
* Forward all headers and query strings
* Disable caching (for APIs)

---

## ✅ Summary

You now manually connected:

* ✅ Express (running in Lambda)
* ✅ API Gateway (proxying all `/api/*` routes)
* ✅ CloudFront (can forward API requests globally)

---

Would you like help packaging this automatically with a GitHub Action or setting up custom domains with SSL?
