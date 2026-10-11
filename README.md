# Codomax Full Stack Blog

**Author: Jafeer Abdullah**
**Codomax Full Stack Web Development Internship**

The Codomax Journal combines **Module 1 — Frontend Development**, **Module 2 — Backend Development**, **Module 3 — Database Integration**, and **Module 4 — CRUD Operations**. The original HTML5, CSS3, and vanilla JavaScript design is preserved. The Express REST API supports registration, login, publishing, reading, editing, deleting, searching, and category filtering. Module 2 used temporary JSON persistence; Modules 3 and 4 use Supabase PostgreSQL.

The architecture remains **Frontend → Node.js + Express.js → Supabase PostgreSQL**. The frontend calls Express APIs; database credentials stay in the backend. This project does not use React, Firebase, or Supabase Auth.

## Repository branches

- `module-1-frontend` contains the frontend in the root-level `frontend/` folder.
- `module-2-backend` contains the backend in the root-level `backend/` folder.
- `module-3-database` extends both modules with Supabase storage and blog details.
- `module-4-crud` extends the existing application with complete blog management, an edit page, search, and category filtering.
- `main` combines the reviewed modules. Module 4 must be reviewed through a manual Pull Request before merging.

The folder structure and installation steps below describe this Module 4 branch.

## Features

- Original responsive Home, Login, Register, Dashboard, and Create Blog pages, plus Blog Details and Edit Blog pages.
- Original blue/white theme, local images, mobile menu, article reader, accessible forms, keyboard focus, and reduced motion support.
- Frontend validation, server validation, and readable API success/error messages.
- Registration with normalized email addresses, duplicate detection, and bcrypt password hashes.
- Login with a signed JWT and safe user information; passwords are never returned or stored by the frontend.
- Authenticated creation, editing, and deletion with server ownership checks.
- Save private drafts, publish them, or return published posts to draft status.
- Search published blog titles/content and combine results with category filtering.
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
│   ├── edit-blog.html
│   ├── blog-details.html
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

Demo editing, publishing, deleting, and **Reset demo posts** use the original tab's sessionStorage. They never modify backend posts/accounts, and the interface labels this mode clearly. While logged in, open the regular dashboard to manage real saved posts. The regular Home feed uses API posts only. Open Home with `?demo=1` to read the preserved sample stories.

## Environment settings

| Setting | Purpose |
| --- | --- |
| PORT | Defaults to 5000 |
| JWT_SECRET | Random signing secret, at least 32 characters |
| JWT_EXPIRES_IN | Token lifetime; defaults to 1h |
| CORS_ORIGINS | Comma separated browser origin allowlist |
| DATA_DIR | Optional storage directory override, used by isolated tests |
| SUPABASE_URL | Your Supabase project's URL; backend only |
| SUPABASE_SERVICE_ROLE_KEY | Backend database access key; never share or place it in frontend files |

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
| GET | /api/blogs | Public | Published posts, newest first; optional search/category filters |
| GET | /api/blogs/user | JWT | Own published posts and drafts |
| GET | /api/blogs/mine | JWT | Preserved alias for /api/blogs/user |
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

Title, category, and content are required on creation. Categories match the frontend dropdown. API callers can omit imageUrl to use the bundled default, or send its alias `image`. Status defaults to published; `draft` creates a private draft. Both editor pages have a status dropdown. Updates preserve omitted fields, including draft status and cover image; provided fields are validated.

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

Fifteen API test groups cover server responses, validation, hashing, email normalization, concurrent duplicate rejection, JWT, ownership, private drafts, concurrent writes, persistence across restarting the HTTP server, public details, pagination, safe database errors, CORS, the user endpoint, partial updates, literal search, combined filters, and filtered pagination. Tests use the real Supabase JavaScript SDK against an isolated local PostgREST HTTP fixture and ephemeral ports. They never use your live Supabase credentials or change the historical JSON files. Live database verification is a separate command described below.

Browser verification covers register → login → create → edit → read → delete, draft status, search/filter controls, delete cancellation, original demo interactions, and responsive layouts from 320px to 1920px. The original CSS rules are retained, with a small addition for the search controls. Browser checks using the local fixture verify the UI/API flow; they do not establish live Supabase connectivity.

The nodemon configuration watches only source directories and ignores data writes. A Chokidar 4 override avoids the older watcher's vulnerable brace-pattern dependency; its startup and automatic restart are verified.

## Module 2 persistence history

User.js and Blog.js own persistence. Controllers validate and call model methods; routes connect paths and middleware. Module 3 replaces these models' JSON operations with Supabase queries while retaining the existing frontend API contracts and authentication flow.

The original `backend/data/users.json`, `backend/data/blogs.json`, and `backend/utils/jsonStore.js` remain as Module 2 history. Module 3 does not read or write them. No historical records are automatically imported. The supplied JSON arrays were empty when Module 3 began. PostgreSQL now handles persistence and concurrent writes.

## Images

The original generated laptop, fictional architecture, and writing-desk covers remain bundled locally. The favicon and fallback are local SVG assets. No external font, icon, or image service is required for the original sample pages.

## Module 3 — Database Integration

Supabase hosts the PostgreSQL database. Only the Express backend uses `@supabase/supabase-js`; the existing HTML pages continue using `frontend/js/api.js` and the existing REST URLs. Registration still hashes passwords with bcrypt (cost 12), and login still signs the same JWT with its issuer, audience, and expiry checks. Supabase Auth is not used.

### Database setup

1. Run `backend/database/module-3.sql` in your Supabase SQL editor if the existing users/blogs schema has not been created. Module 4 uses the same schema and needs no migration.
2. Run `npm run setup-env` from `backend/` to create the ignored local `.env` and random JWT secret.
3. Configure `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `backend/.env` locally. `.env.example` lists the settings without real credentials.
4. Start Express with `npm run dev`. Keep database credentials in the backend; the browser calls only Express.

The SQL enables row level security and revokes direct table access from anonymous/authenticated Supabase clients. The backend service role performs database operations; Express JWT and ownership checks enforce application access. Never commit the local `.env`.

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

On PowerShell, use `npm.cmd` if script execution policy blocks `npm`. No frontend install or build is needed. Open **http://localhost:5000/frontend/** and select **Blogs**, which points to the existing Home `#blogs` section. The Module 4 journal feed shows database posts. Database **Read more** links open `blog-details.html?id=BLOG_ID`, showing title, cover, category, author, publication date, and full plain-text content. The original samples remain at `index.html?demo=1`, with their article dialog and demo behavior.

If the default npm registry returns HTTP 403 in this environment, `npm.cmd ci --registry=https://registry.npmmirror.com` is the tested installation fallback. The committed lockfile retains the normal npm registry URLs and package integrity hashes; no global registry setting is changed.

### Verification and Git completion

`npm test` runs isolated API checks through a local PostgREST fixture. It does **not** establish a live Supabase connection or verify your project's database setup.

`npm run test:supabase` starts Express on an ephemeral port and verifies live registration, email uniqueness, stored bcrypt hashes, login, JWT, blog creation, database field mappings, ordering, public details, literal search, category filtering, draft privacy, draft-preserving updates, the user endpoint, author ownership, timestamp updates, persistence after restarting the HTTP server, and deletion. It creates uniquely named test accounts/posts and removes only this run's records in a `finally` cleanup. A failure exits nonzero. No real keys or tokens are printed.

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

## Module 4 — CRUD Operations

Module 4 extends the existing MVC application on `module-4-crud`. The flow stays **HTML/JavaScript frontend → Express REST API → Supabase PostgreSQL → blogs table**. It reuses the Supabase connection, users/blogs tables, bcrypt login, JWT middleware, and existing design.

### Features

- Create blogs as an authenticated writer, with required title, category, and content.
- View published blogs newest first and open their complete details.
- Manage **My Blogs** in the dashboard, including title, category, date, status, Edit, and Delete.
- Update your own blog at `frontend/edit-blog.html?id=BLOG_ID`, with existing fields prefilled.
- Save private drafts, publish them, or move published blogs back to draft.
- Delete your own blog only after the confirmation **“Are you sure you want to delete this blog?”**. Cancel leaves the blog unchanged.
- Search published titles/content, ignoring case and treating punctuation as literal text.
- Filter by Technology, Web Development, Design, Productivity, or Personal Growth; combine category and search.
- Loading, empty, success, and error states across the feed, dashboard, and editors.

### Module 4 API documentation

| Method | Endpoint | Behavior |
| --- | --- | --- |
| POST | /api/blogs | JWT required; create a blog. Returns 201 with `{ "message": "Blog created successfully", "blog": {...} }`. |
| GET | /api/blogs | Public; return published blogs newest first, with author information. |
| GET | /api/blogs?search=node | Match title or content. Search is limited to 200 characters. |
| GET | /api/blogs?category=Technology | Match the selected category. |
| GET | /api/blogs?search=node&category=Technology | Apply both filters. URL-encode query values, such as `Web%20Development`. |
| GET | /api/blogs/user | JWT required; return only your published blogs and private drafts. `/mine` remains compatible. |
| GET | /api/blogs/:id | Complete published details, or an owner's draft with JWT. Missing/invalid IDs and inaccessible drafts return 404. |
| PUT | /api/blogs/:id | Owner JWT required; update title, category, content, image/imageUrl, or status. Returns 200 with `Blog updated successfully` and the updated blog. |
| DELETE | /api/blogs/:id | Owner JWT required; delete the blog. Returns 200 with `{ "message": "Blog deleted successfully" }`. |

Feed/user responses retain the existing Modules 2/3 envelope `{ "blogs": [...] }`; single details use `{ "blog": {...} }`. Each blog includes `id`, `title`, `category`, `content`, `imageUrl`, `authorId`, `author`, `status`, `createdAt`, and `updatedAt`, plus the existing card display fields. This preserves existing clients while adding Module 4 endpoints.

Database storage remains `title`, `category`, `content`, `image`, `author_id`, `author_name`, and `status`, with automatic timestamps. The backend maps those fields to the existing frontend contract. Only the authenticated user's identity sets author/ownership; submitted author IDs/names cannot transfer a blog. Supabase service credentials remain backend-only. Blog content renders as plain text.

The create/update JSON example above still works. A partial update can also preserve a draft's other fields:

```http
PUT /api/blogs/BLOG_UUID
Authorization: Bearer YOUR_LOGIN_TOKEN
Content-Type: application/json

{ "title": "My revised title" }
```

Missing/invalid/expired JWTs return 401. Another user's update/delete returns 403. Invalid fields or filters return 400. Missing blogs return 404. The dashboard uses `/api/blogs/user`, the real journal feed fetches database posts, and the legacy `create-blog.html?edit=ID` editor links continue to work. The original Module 1 sample workspace and reader remain accessible with `?demo=1`.

### Test and complete Module 4

From this existing checkout:

```sh
git switch module-4-crud
cd backend
npm ci
npm test
# Requires a locally configured backend/.env and the existing Supabase schema:
npm run test:supabase
npm run dev
```

Open `http://localhost:5000/frontend/`. Register/login, create a post, open **My Blogs**, edit all fields, save a draft, publish it, search by title/content, and change categories. Cancel a deletion first, then confirm it. Check with a second account that another user's post cannot be edited/deleted. Verify the original demo at `dashboard.html?demo=1`. The API tests exercise these server behaviors without touching live records; `test:supabase` verifies actual database persistence and removes only its own uniquely identified test records.

After verification, from the project root:

```sh
git status
git add .
git commit -m "Complete Module 4 - Blog CRUD Operations"
git push -u origin module-4-crud
```

Stop after pushing. Create the Pull Request **module-4-crud → main** manually; do not merge automatically.
