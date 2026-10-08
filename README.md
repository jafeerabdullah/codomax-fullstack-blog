# Codomax Full Stack Blog

**Author: Jafeer Abdullah**
**Codomax Full Stack Web Development Internship**

The Codomax Journal combines the completed **Module 1 — Frontend Development**, **Module 2 — Backend Development**, and **Module 3 — Database Integration**. The original HTML5, CSS3, and vanilla JavaScript design is preserved. The Express REST API supports registration, login, publishing, reading, editing, and deleting. Module 2 used temporary JSON persistence; Module 3 uses Supabase PostgreSQL.

The architecture remains **Frontend → Node.js + Express.js → Supabase PostgreSQL**. The frontend calls Express APIs; database credentials stay in the backend. This project does not use React, Firebase, or Supabase Auth.

## Repository branches

- `module-1-frontend` contains the frontend in the root-level `frontend/` folder.
- `module-2-backend` contains the backend in the root-level `backend/` folder.
- `module-3-database` extends both modules with Supabase storage and blog details.
- `main` combines the reviewed modules. Module 3 is developed and tested on its own branch and must be reviewed through a Pull Request before merging.

The folder structure and installation steps below describe the combined `main` branch.

## Features

- Original responsive Home, Login, Register, Dashboard, and Create Blog pages, plus the Module 3 Blog Details page.
- Original blue/white theme, local images, mobile menu, article reader, accessible forms, keyboard focus, and reduced motion support.
- Frontend validation, server validation, and readable API success/error messages.
- Registration with normalized email addresses, duplicate detection, and bcrypt password hashes.
- Login with a signed JWT and safe user information; passwords are never returned or stored by the frontend.
- Authenticated creation, editing, and deletion with server ownership checks.
- Personal dashboard statistics; published API posts also appear on Home.
- Original browser-only sample workspace with edit/delete/reset interactions.
- Supabase PostgreSQL persistence with unique email constraints and automatic timestamps; the original atomic JSON utility remains in Module 2 history.
- Existing MVC structure with database operations in the model layer.
- Automated API tests and a Postman collection.

## Technologies

| Layer | Technologies |
| --- | --- |
| Frontend | HTML5, CSS3, vanilla JavaScript, fetch() |
| Backend | Node.js, Express.js, REST API |
| Authentication | bcryptjs, jsonwebtoken (JWT) |
| Configuration | dotenv, cors |
| Development | nodemon, Node's built-in test runner |
| Module 2 persistence | users.json and blogs.json |

## Folder structure

```text
codomax-fullstack-blog/
├── .gitignore
├── README.md
├── frontend/
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── dashboard.html
│   ├── create-blog.html
│   ├── css/style.css
│   ├── js/
│   │   ├── api.js
│   │   └── script.js
│   └── images/
└── backend/
    ├── server.js
    ├── config.js
    ├── package.json
    ├── package-lock.json
    ├── nodemon.json
    ├── .env (generated locally; ignored by Git)
    ├── .env.example
    ├── routes/
    │   ├── authRoutes.js
    │   └── blogRoutes.js
    ├── controllers/
    │   ├── authController.js
    │   └── blogController.js
    ├── models/
    │   ├── User.js
    │   └── Blog.js
    ├── middleware/
    │   ├── auth.js
    │   └── errorHandler.js
    ├── utils/
    │   ├── HttpError.js
    │   ├── jsonStore.js
    │   └── validation.js
    ├── scripts/setup-env.js
    ├── data/
    │   ├── users.json
    │   └── blogs.json
    ├── tests/api.test.js
    └── postman/Codomax-Module-2.postman_collection.json
```

## Installation and running

Install **Node.js 22 or newer**, then open a terminal in the project folder:

```sh
cd backend
npm ci
npm run setup-env
# Configure Supabase in backend/.env and run database/module-3.sql first (see Module 3 below).
npm run dev
```

Run `setup-env` to create a local `.env` with a random JWT secret. It preserves an existing file. `.env` is ignored by Git and is not included in the repository; `.env.example` documents the settings without a real secret.

Open **http://localhost:5000/frontend/** to use the application. Express serves the existing frontend files without a separate frontend build or installation.

**http://localhost:5000/** returns the required health response:

```text
Blog API Server Running
```

Use `npm start` for a server without file watching. If PowerShell blocks npm's script wrapper, use `npm.cmd ci`, `npm.cmd run dev`, and equivalent `npm.cmd` commands.

The server uses port 5000 and the local loopback interface. For a custom port, update `PORT`, the matching CORS origin, and the API base URL in `frontend/js/api.js`.

## Using the application

1. Register with your name, email, password, and confirmation.
2. Login using the registered email and password, then select **Open dashboard**.
3. Choose **Create new blog**, complete the form, and publish.
4. Your saved post appears in the dashboard and on Home.
5. Use **Edit**, or **Delete** and confirm. **Logout** clears the tab's login session.

The application has no default account or password. A new database starts with empty users/blogs tables. Register as **Jafeer Abdullah** to publish under that name. Other users publish under their registered names.

For an offline cover image, use `images/code-workspace.jpg`, `images/design-perspective.jpg`, or `images/writing-routine.jpg`. HTTP/HTTPS cover URLs are supported, with a bundled fallback for unavailable images. Blog content is plain text; supplied HTML is displayed as text.

### Original Module 1 demo

The original sample workspace remains at **http://localhost:5000/frontend/dashboard.html?demo=1**. A logged-out dashboard also opens this sample workspace. Demo editor links explicitly carry `demo=1`.

Demo editing, publishing, deleting, and **Reset demo posts** use the original tab's sessionStorage. They never modify backend posts/accounts, and the interface labels this mode clearly. While logged in, open the regular dashboard to manage real saved posts. The original sample stories remain on Home alongside API posts.

## Environment settings

| Setting | Purpose |
| --- | --- |
| PORT | Defaults to 5000 |
| JWT_SECRET | Random signing secret, at least 32 characters |
| JWT_EXPIRES_IN | Token lifetime; defaults to 1h |
| CORS_ORIGINS | Comma separated browser origin allowlist |
| DATA_DIR | Optional storage directory override, used by isolated tests |

The CORS allowlist includes localhost and 127.0.0.1 on ports 5000 and 5500. A VS Code Live Server preview on port 5500 can call the API on 5000. Use the Express-served frontend for the simplest setup; file:// is not configured as an API origin.

## API documentation

Request bodies use `Content-Type: application/json`. Protected requests require:

```http
Authorization: Bearer YOUR_LOGIN_TOKEN
```

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| GET | / | Public | Health response |
| POST | /api/auth/register | Public | Create account |
| POST | /api/auth/login | Public | JWT and safe user information |
| GET | /api/auth/me | JWT | Current user |
| GET | /api/blogs | Public | Published API posts |
| GET | /api/blogs/mine | JWT | Own published posts and drafts |
| GET | /api/blogs/:id | Public for published; owner JWT for drafts | Read one post or load own post for editing |
| POST | /api/blogs | JWT | Create post |
| PUT | /api/blogs/:id | Owner JWT | Update post |
| DELETE | /api/blogs/:id | Owner JWT | Delete post |

### Registration

`POST http://localhost:5000/api/auth/register`

```json
{
  "name": "Jafeer Abdullah",
  "email": "jafeer@example.com",
  "password": "ChooseYourOwnPassword123!"
}
```

**201 Created:**

```json
{ "message": "User registered successfully" }
```

Names are required and limited to 80 characters. Emails are trimmed, lowercased, validated, and unique. Passwords require eight characters and cannot exceed 72 UTF-8 bytes, matching bcrypt's input limit. The bcrypt cost is 12.

### Login

`POST http://localhost:5000/api/auth/login`

```json
{ "email": "jafeer@example.com", "password": "ChooseYourOwnPassword123!" }
```

**200 OK:**

```json
{
  "message": "Login successful",
  "token": "SIGNED_JWT",
  "user": { "id": "USER_UUID", "name": "Jafeer Abdullah", "email": "jafeer@example.com" }
}
```

The frontend stores only the JWT and safe user information in the current tab's sessionStorage. The server checks token signature, expiry, issuer, audience, and user record. Passwords are never stored by the frontend.

### Create or update a blog

`POST http://localhost:5000/api/blogs` or `PUT http://localhost:5000/api/blogs/BLOG_ID`

```json
{
  "title": "My backend-connected story",
  "category": "Web Development",
  "content": "This story is saved through the Express REST API.",
  "author": "Jafeer Abdullah",
  "imageUrl": "images/code-workspace.jpg",
  "status": "published"
}
```

**201 Created:**

```json
{
  "message": "Blog created successfully",
  "blog": { "id": "BLOG_UUID", "title": "My backend-connected story", "author": "Jafeer Abdullah", "authorId": "USER_UUID" }
}
```

The full blog also includes category, content, cover image, description, date, reading time, status, and timestamps. Updates return 200 with `Blog updated successfully` and the updated blog.

Title, category, and content are required. Categories match the frontend dropdown. API callers can omit imageUrl to use the bundled default. Status defaults to published; `draft` creates a private draft. The frontend Publish button publishes a draft or new post.

The documented author field is accepted, but the server derives the actual author and ownership from the authenticated account. A submitted name/ID cannot grant access to another user's posts.

### Errors

Errors return JSON with `message` and optional field `errors`. Status codes are 400 (invalid input), 401 (missing/invalid login or wrong credentials), 403 (another user's post), 404 (missing route/post), 409 (duplicate email), 413 (oversized request), and 500 (storage/server failure). Responses never include password hashes, signing secrets, or stack traces.

## Testing with Postman

Import `backend/postman/Codomax-Module-2.postman_collection.json` into Postman. Choose a fresh email and test password in the collection variables and run requests in order. Login automatically stores the JWT, and creation stores the blog ID for later read/edit/delete requests. The same endpoints can be called manually in Thunder Client.

The collection tests 12 requests, including registration, duplicate rejection, login, current user, creation, reading, editing, deletion, and missing-token rejection. It can also run through [Postman's Newman CLI](https://learning.postman.com/docs/reference/newman-cli/command-line-integration-with-newman/):

```sh
npx --yes newman run postman/Codomax-Module-2.postman_collection.json
```

Run this from backend/ while the server is running. Newman is an optional QA tool, not an app dependency. Change the email before repeating registration.

## Automated checks

From backend/:

```sh
npm test
```

Eleven API test groups cover server responses, validation, hashing, email normalization, concurrent duplicate rejection, JWT, ownership, private drafts, concurrent writes, persistence across restarting the HTTP server, public details, pagination, safe database errors, and CORS. Tests use the real Supabase JavaScript SDK against an isolated local PostgREST HTTP fixture and ephemeral ports. They never use your live Supabase credentials or change the historical JSON files. Live database verification is a separate command described below.

Browser integration checks cover the real register → login → create → edit → read → delete flow, original demo interactions, and responsive layouts from 320px to 1920px. The original CSS file is preserved byte for byte. Browser/Postman QA data is isolated outside the project.

The nodemon configuration watches only source directories and ignores data writes. A Chokidar 4 override avoids the older watcher's vulnerable brace-pattern dependency; its startup and automatic restart are verified.

## Module 2 persistence history

User.js and Blog.js own persistence. Controllers validate and call model methods; routes connect paths and middleware. Module 3 replaces these models' JSON operations with Supabase queries while retaining the existing frontend API contracts and authentication flow.

The original `backend/data/users.json`, `backend/data/blogs.json`, and `backend/utils/jsonStore.js` remain as Module 2 history. Module 3 does not read or write them. No historical records are automatically imported. The supplied JSON arrays were empty when Module 3 began. PostgreSQL now handles persistence and concurrent writes.

## Images

The original generated laptop, fictional architecture, and writing-desk covers remain bundled locally. The favicon and fallback are local SVG assets. No external font, icon, or image service is required for the original sample pages.

## Module 3 — Database Integration

Supabase hosts the PostgreSQL database. Only the Express backend uses `@supabase/supabase-js`; the existing HTML pages continue using `frontend/js/api.js` and the existing REST URLs. Registration still hashes passwords with bcrypt (cost 12), and login still signs the same JWT with its issuer, audience, and expiry checks. Supabase Auth is not used.


### Module 3 endpoints and API testing

Use Postman, Thunder Client, or the existing Module 2 Postman collection with base URL `http://localhost:5000`. Choose a fresh email and your own test password.

| Method | Endpoint | Test and expected result |
| --- | --- | --- |
| POST | /api/auth/register | Send name/email/password using the registration example above. Expect 201; the users table contains a bcrypt hash, and the response contains no password. Repeating the email returns 409. |
| POST | /api/auth/login | Send email/password. Expect 200 with a JWT and safe user information. Save the token; a wrong password returns 401. |
| POST | /api/blogs | Send the existing blog JSON example above and `Authorization: Bearer YOUR_LOGIN_TOKEN`. Expect 201. Save the returned blog ID and inspect the blogs table. A forged author cannot change ownership. |
| GET | /api/blogs | No token required. Expect 200 with `{ "blogs": [...] }`, containing published database posts ordered newest first. Drafts are excluded. |
| GET | /api/blogs/:id | Substitute the saved ID. A published post returns 200 with `{ "blog": {...} }` without login. Missing/invalid IDs return 404. A draft is readable only with its author's token; other readers receive 404. |

`GET /api/auth/me`, `GET /api/blogs/mine`, `PUT /api/blogs/:id`, and `DELETE /api/blogs/:id` also remain available. Updates and deletion still require the author token; another user receives 403. Use `/api/blogs/mine` for all of your own posts, including drafts.

### Run Module 3

From the existing project folder, on branch `module-3-database`:

```sh
cd backend
npm ci
npm run setup-env
# Complete the SQL and backend/.env setup above.
npm test
npm run test:supabase
npm run dev
```

On PowerShell, use `npm.cmd` if script execution policy blocks `npm`. No frontend install or build is needed. Open **http://localhost:5000/frontend/** and select **Blogs**, which points to the existing Home `#blogs` section. Database posts appear alongside the preserved Module 1 samples. Database **Read more** links open `blog-details.html?id=BLOG_ID`, showing title, cover, category, author, publication date, and full plain-text content. Sample posts retain their original article dialog and demo behavior.

If the default npm registry returns HTTP 403 in this environment, `npm.cmd ci --registry=https://registry.npmmirror.com` is the tested installation fallback. The committed lockfile retains the normal npm registry URLs and package integrity hashes; no global registry setting is changed.

### Verification and Git completion

`npm test` runs isolated API checks through a local PostgREST fixture. It does **not** establish a live Supabase connection or verify your project's database setup.

`npm run test:supabase` starts Express on an ephemeral port and verifies live registration, email uniqueness, stored bcrypt hashes, login, JWT, blog creation, database field mappings, ordering, public details, draft privacy, author ownership, timestamp updates, persistence after restarting the HTTP server, and deletion. It creates uniquely named test accounts/posts and removes only this run's records in a `finally` cleanup. A failure exits nonzero. No real keys or tokens are printed.

After live verification, use the browser to register → login → create → open Blogs → Read more → edit → delete. Check that the original demo at `dashboard.html?demo=1` still works, and inspect the browser console. Missing IDs, unpublished blogs, and connection failures display readable details-page messages. Blog HTML is rendered as text.

Only after these checks pass, complete the requested branch workflow from the project root:

```sh
git status
git check-ignore backend/.env
git add .
git commit -m "Complete Module 3 - Supabase Database Integration"
git push -u origin module-3-database
```

Do not commit Module 3 on `main` or merge automatically. Manually create the Pull Request **module-3-database → main** after pushing.
