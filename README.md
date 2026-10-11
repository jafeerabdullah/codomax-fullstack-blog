# Codomax Full Stack Blog Application

**Author: Jafeer Abdullah**
**Codomax Full Stack Web Development Internship**

## Project Overview

**Codomax Journal** is a Full Stack Blog Application developed as part of the **Codomax Full Stack Web Development Internship**. Writers can register, publish stories, keep private drafts, and manage their work in a personal dashboard. Readers can browse, search, filter, and open complete articles.

The application uses HTML5, CSS3, vanilla JavaScript, Node.js, Express.js, and the existing Supabase PostgreSQL database. Module 6 adds an editorial design system, a dedicated Blogs page, improved mobile workspaces, clearer feedback, and preparation for deploying the frontend and API together on Vercel.

**Status:** local development and deployment preparation are complete. A Vercel production deployment and production smoke tests must be performed manually; there is no verified live URL yet.

[Features](#features) · [Technology Stack](#technology-stack) · [Installation](#installation-and-running) · [API Endpoints](#api-endpoints) · [Testing](#testing) · [Deployment](#deployment) · [Production Checklist](#production-verification-checklist)

## Repository branches

- `module-1-frontend` contains the frontend in the root-level `frontend/` folder.
- `module-2-backend` contains the backend in the root-level `backend/` folder.
- `module-3-database` extends both modules with Supabase storage and blog details.
- `module-4-crud` extends the existing application with complete blog management, an edit page, search, and category filtering.
- `module-5-authentication` extends the application with registration validation, protected pages, session management, and user profiles.
- `module-6-final-deployment` contains the final UI, bug fixes, security review, and Vercel deployment preparation.
- `main` includes the merged Modules 1–5. Module 6 is submitted through a manual Pull Request.

The current structure and setup below describe Module 6. Earlier module instructions are retained as project history.

## Features

- Eight responsive pages: Home, Blogs, Blog Details, Login, Register, Dashboard, Create Blog, and Edit Blog.
- A consistent navy/blue editorial design with serif reading typography, local cover images, a mobile menu, accessible forms, visible keyboard focus, and reduced motion support.
- Navigation adapts to the login state; the homepage features an actual published API story.
- Cover previews, a dedicated Save Draft action, reusable notifications, skeleton loading, empty states, and retry actions.
- Frontend validation, server validation, and readable API success/error messages.
- Registration with normalized email addresses, duplicate detection, and bcrypt password hashes.
- Login with a signed JWT and safe user information; passwords are never returned or stored by the frontend.
- Authenticated creation, editing, and deletion with server ownership checks.
- Save private drafts, publish them, or return published posts to draft status.
- Search published blog titles/content and combine results with category filtering.
- Personal dashboard statistics; published API posts also appear on Home.
- Protected dashboard/editors, account details, View actions for published posts/private drafts, and logout to Login.
- Original browser-only sample workspace with edit/delete/reset interactions.
- Supabase PostgreSQL persistence with unique email constraints and automatic timestamps; the original atomic JSON utility remains in Module 2 history.
- Existing MVC structure with database operations in the model layer.
- Automated API tests and a Postman collection.

## Technology Stack

| Layer | Technologies |
| --- | --- |
| Frontend | HTML5, CSS3, vanilla JavaScript, fetch() |
| Backend | Node.js, Express.js, REST API |
| Authentication | bcryptjs, jsonwebtoken (JWT) |
| Database | Supabase, PostgreSQL |
| Deployment | Vercel; exported Express app on Node.js 24, static frontend on the CDN |
| Configuration | dotenv, cors |
| Development | nodemon, Node's built-in test runner |
| Module 2 persistence | users.json and blogs.json |

## Project Structure

```text
codomax-fullstack-blog/
├── .gitignore
├── README.md
├── frontend/
│   ├── index.html
│   ├── blogs.html
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
    ├── app.js (Express application; Vercel entry point)
    ├── server.js (local startup and compatibility export)
    ├── vercel.json
    ├── .vercelignore
    ├── public/ (generated frontend assets; ignored by Git)
    ├── config.js
    ├── package.json
    ├── package-lock.json
    ├── nodemon.json
    ├── .env (generated locally; ignored by Git)
    ├── .env.example
    ├── routes/
    │   ├── authRoutes.js
    │   ├── userRoutes.js
    │   └── blogRoutes.js
    ├── controllers/
    │   ├── authController.js
    │   ├── userController.js
    │   └── blogController.js
    ├── models/
    │   ├── User.js
    │   └── Blog.js
    ├── middleware/
    │   ├── auth.js
    │   ├── authMiddleware.js
    │   └── errorHandler.js
    ├── utils/
    │   ├── HttpError.js
    │   ├── jsonStore.js
    │   └── validation.js
    ├── scripts/
    │   ├── setup-env.js
    │   ├── build-static.js
    │   └── verify-supabase.js
    ├── data/
    │   ├── users.json
    │   └── blogs.json
    ├── tests/
    │   ├── api.test.js
    │   └── session.test.js
    └── postman/Codomax-Module-2.postman_collection.json
```

## Installation and running

Install **Node.js 24**, then use this existing checkout. For a fresh installation:

```sh
git clone https://github.com/jafeerabdullah/codomax-fullstack-blog.git
cd codomax-fullstack-blog
```

From the project folder:

```sh
cd backend
npm ci
npm run setup-env
# Configure Supabase in backend/.env and run database/module-3.sql first (see Module 3 below).
npm run dev
```

Run `setup-env` to create a local `.env` with a random JWT secret. It preserves an existing file. `.env` is ignored by Git and is not included in the repository; `.env.example` documents the settings without a real secret.

Open **http://localhost:5000/** to use the application. The existing **/frontend/** paths also work. Express serves the original frontend sources during local development; no frontend dependency installation is needed.

**http://localhost:5000/health** returns the application health response:

```json
{ "status": "ok" }
```

This endpoint confirms that Express is responding; it does not query the database.

Use `npm start` for a server without file watching. If PowerShell blocks npm's script wrapper, use `npm.cmd ci`, `npm.cmd run dev`, and equivalent `npm.cmd` commands.

The server uses port 5000 and the local loopback interface. For a custom port, update `PORT` and the matching CORS origin. Relative `/api` requests need no frontend port or production URL changes.

## Using the application

1. Register with your name, email, password, and confirmation.
2. Login using the registered email and password, then select **Open dashboard**.
3. Choose **Create new blog**, complete the form, and publish.
4. Your published post appears in the dashboard, Home, and Blogs. Use **Save draft** or the status selector to keep a story private.
5. Use **View** (including your drafts), **Edit**, or **Delete** and confirm. **Logout** clears the tab's login session and returns to Login.

The application has no default account or password. A new database starts with empty users/blogs tables. Register as **Jafeer Abdullah** to publish under that name. Other users publish under their registered names.

For an offline cover image, use `images/code-workspace.jpg`, `images/design-perspective.jpg`, or `images/writing-routine.jpg`. HTTP/HTTPS cover URLs are supported, with a bundled fallback for unavailable images. Blog content is plain text; supplied HTML is displayed as text.

### Original Module 1 demo

The original sample workspace remains at **http://localhost:5000/frontend/dashboard.html?demo=1**. The regular dashboard redirects logged-out users to Login. Only explicit `demo=1` links open the sample workspace, and demo editor/View links preserve that flag.

Demo editing, publishing, deleting, and **Reset demo posts** use the original tab's sessionStorage. They never modify backend posts/accounts, and the interface labels this mode clearly. While logged in, open the regular dashboard to manage real saved posts. The regular Home feed uses API posts only. Open Home with `?demo=1` to read the preserved sample stories.

## Environment Variables

| Setting | Purpose |
| --- | --- |
| PORT | Defaults to 5000 |
| JWT_SECRET | Random signing secret, at least 32 characters |
| JWT_EXPIRES_IN | Token lifetime; defaults to 1h |
| CORS_ORIGINS | Comma separated browser origin allowlist |
| DATA_DIR | Optional storage directory override, used by isolated tests |
| SUPABASE_URL | Your Supabase project's URL; backend only |
| SUPABASE_SERVICE_ROLE_KEY | Backend database access key; never share or place it in frontend files |

Use the Express-served frontend for API features. Relative `/api` requests work on the same origin locally and in production; a standalone static preview needs its own API proxy. The backend retains an explicit local CORS allowlist. Production origins are configured in Vercel as described below. Secret values belong only in the ignored local environment file or Vercel environment settings.

## API Endpoints

Request bodies use `Content-Type: application/json`. Protected requests require:

```http
Authorization: Bearer YOUR_LOGIN_TOKEN
```

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| GET | / | Public | Journal home page |
| GET | /health | Public | `{ "status": "ok" }`; no credentials or database information |
| POST | /api/auth/register | Public | Create account |
| POST | /api/auth/login | Public | JWT and safe user information |
| GET | /api/auth/me | JWT | Current user |
| GET | /api/users/profile | JWT | Account details and own-blog statistics |
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

Names require a letter, allow Unicode, and are limited to 80 characters without control characters. Emails are trimmed, lowercased, validated, and unique. New passwords require at least eight characters including an uppercase letter, a lowercase letter, and a number; they cannot exceed 72 UTF-8 bytes, matching bcrypt's input limit. The bcrypt cost is 12. Existing accounts can still log in with their original passwords.

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

The frontend stores only the JWT and safe user information in the current tab's sessionStorage. The server checks token signature, expiry, issuer, audience, subject, and user record. Private pages verify the token with Express before showing content. Expiry and authenticated 401 responses clear the session; protected pages return to Login. Passwords are never stored by the frontend.

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

## Testing

From backend/:

```sh
npm test
```

Twenty-seven automated tests cover the existing API features plus registration strength, Unicode names, safe profiles, exact statistics beyond the database response limit, invalid JWT claims, deleted accounts, token storage, expiry, authenticated 401 responses, logout, blocked storage, and safe login return links. Module 6 also verifies all eight static pages and assets at root/legacy paths, the health response, security headers, controlled local/production CORS, and relative API requests on HTTPS production/preview origins and custom local ports. API tests use the real Supabase JavaScript SDK against an isolated local PostgREST HTTP fixture and ephemeral ports; session tests exercise the actual frontend API module with browser storage/navigation and a controlled clock. Tests never use your live Supabase credentials or change the historical JSON files. Live database verification is a separate command described below.

Browser verification covers protected-page redirects, registration/login, profiles, dashboard statistics, create/edit/View/delete, draft status, search/filter controls, delete cancellation, token expiry, logout/history navigation, original demo interactions, and responsive layouts from 320px to 1920px. Module 6 replaces the stylesheet with one shared design system for all eight existing/new pages. Fixture browser checks verify UI/API behavior; the separate live Supabase command verifies actual database connectivity and persistence.

Prepare and inspect the deployment assets locally:

```sh
npm run build
```

This creates ignored `backend/public/` from the original frontend sources. It copies only the HTML, CSS, JavaScript, and image assets; it never copies backend configuration or environment files. Local Express uses `frontend/` directly, so the build is only required for deployment.

The nodemon configuration watches only source directories and ignores data writes. A Chokidar 4 override avoids the older watcher's vulnerable brace-pattern dependency; its startup and automatic restart are verified.

## Module 2 persistence history

User.js and Blog.js own persistence. Controllers validate and call model methods; routes connect paths and middleware. Module 3 replaces these models' JSON operations with Supabase queries while retaining the existing frontend API contracts and authentication flow.

The original `backend/data/users.json`, `backend/data/blogs.json`, and `backend/utils/jsonStore.js` remain as Module 2 history. Module 3 does not read or write them. No historical records are automatically imported. The supplied JSON arrays were empty when Module 3 began. PostgreSQL now handles persistence and concurrent writes.

## Images

The original generated laptop, fictional architecture, and writing-desk covers remain bundled locally. The favicon and fallback are local SVG assets. No external font, icon, or image service is required for the original sample pages.

## Module 3 — Database Integration

Supabase hosts the PostgreSQL database. Only the Express backend uses `@supabase/supabase-js`; the existing HTML pages continue using `frontend/js/api.js` and the existing REST URLs. Registration still hashes passwords with bcrypt (cost 12), and login still signs the same JWT with its issuer, audience, and expiry checks. Supabase Auth is not used.

### Database setup

1. Run `backend/database/module-3.sql` in your Supabase SQL editor if the existing users/blogs schema has not been created. Modules 4–6 use the same schema and need no migration.
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

On PowerShell, use `npm.cmd` if script execution policy blocks `npm`. No frontend install or build is needed for local use. Open **http://localhost:5000/frontend/** and select **Blogs**. Module 6 adds `blogs.html` while retaining Home's `#blogs` feed. Database **Read more** links open `blog-details.html?id=BLOG_ID`, showing title, cover, category, author, publication date, reading time, and full plain-text content. The original samples remain at `index.html?demo=1`, with their article dialog and demo behavior.

If the default npm registry returns HTTP 403 in this environment, `npm.cmd ci --registry=https://registry.npmmirror.com` is the tested installation fallback. The committed lockfile retains the normal npm registry URLs and package integrity hashes; no global registry setting is changed.

### Verification and Git completion

`npm test` runs isolated API checks through a local PostgREST fixture. It does **not** establish a live Supabase connection or verify your project's database setup.

`npm run test:supabase` starts Express on an ephemeral port and verifies live registration validation, email uniqueness, stored bcrypt hashes, correct/incorrect login, JWT, user profile details, exact own-blog statistics, blog creation, database field mappings, ordering, public details, literal search, category filtering, draft privacy, draft-preserving updates, the user endpoint, author ownership, timestamp updates, persistence after restarting the HTTP server, and deletion. It creates uniquely named test accounts/posts and removes only this run's records in a `finally` cleanup. A failure exits nonzero. No real keys or tokens are printed.

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
- Delete your own blog only after the confirmation **“Delete this blog?”** and the warning **“This action cannot be undone.”**. Cancel leaves the blog unchanged.
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

## Module 5 — Authentication & Dashboard

Module 5 extends the existing application on `module-5-authentication`. Authentication remains **Frontend → Express API → JWT verification → Supabase users/blogs → protected dashboard**. It uses the existing tables and schema without a migration, Supabase Auth, or a new frontend framework.

### Features

- JWT authentication with bcrypt password hashes and stronger registration validation.
- Protected dashboard, Create Blog, and Edit Blog pages that verify the session with Express before displaying private content.
- A user profile with name, email, and account creation date.
- A welcome message and Total Blogs, Published Blogs, and Draft Blogs statistics for the logged-in user.
- **My Blogs** with title, category, date, status, and Edit/Delete/View actions, including authenticated View access to your drafts.
- Logout that removes the token/user information and redirects to Login.
- Tab-scoped sessions, idle expiry handling, authenticated 401 cleanup, and checks when returning to a page through browser history.
- Safe local login return links, password visibility toggles, loading states, success messages, and field errors.
- The original Module 1 demo remains available through explicit `?demo=1` links; Module 4 CRUD, search, and category filtering remain intact.

### Authentication and session handling

`backend/middleware/authMiddleware.js` reads `Authorization: Bearer TOKEN`, verifies HS256 signatures, issuer, audience, expiry, and a valid user UUID, and confirms the account still exists. Private APIs return 401 for missing/invalid/expired tokens or deleted accounts. `backend/middleware/auth.js` remains a compatibility import. Blog update/delete routes also check the stored author ID and return 403 for another user's blog.

New registration passwords must have at least eight characters, an uppercase letter, a lowercase letter, and a number, with a maximum of 72 UTF-8 bytes. Names support Unicode letters, reject control characters, and allow up to 80 characters. Emails remain normalized and unique. Existing password hashes and the login flow remain compatible; incorrect credentials return the same generic error.

The frontend retains `sessionStorage` for the current tab instead of persisting a login indefinitely in localStorage. It stores the JWT and only safe user fields (`id`, `name`, `email`, `createdDate`), and sends Bearer headers on protected requests. Passwords and backend keys are never stored there. Client-side token checks support the UI; Express performs the actual authentication. JWT lifetime remains controlled by `JWT_EXPIRES_IN` (default one hour). Logout clears the browser session; issued JWTs still expire according to that lifetime.

Without a valid session, `dashboard.html`, `create-blog.html`, and `edit-blog.html` redirect to `login.html?next=...`. Successful login exposes an **Open dashboard** link that returns to the requested local workspace page. External or unsupported return destinations fall back to the dashboard. A failed server session check keeps private content hidden and offers a retry for connection errors.

### Module 5 API documentation

| Method | Endpoint | Access and response |
| --- | --- | --- |
| POST | /api/auth/register | Public. Validated name/email/password; returns 201 with `User registered successfully`. Invalid fields return 400; duplicate accounts return 409. |
| POST | /api/auth/login | Public. Returns 200 with `Login successful`, JWT, and safe user information. Incorrect credentials return 401. |
| GET | /api/auth/me | JWT. Returns `{ "user": {...} }` including the account creation date. |
| GET | /api/users/profile | JWT. Returns the logged-in user's safe account details and own-blog counts shown below. |
| GET | /api/blogs/user | JWT. Returns `{ "blogs": [...] }` containing only your published posts and drafts. |

`GET /api/users/profile` example response:

```json
{
  "id": "USER_UUID",
  "name": "Jafeer Abdullah",
  "email": "jafeer@example.com",
  "createdDate": "2026-10-11T08:00:00.000Z",
  "totalBlogs": 3,
  "publishedBlogs": 2,
  "draftBlogs": 1
}
```

The profile ID always comes from the verified JWT; request parameters cannot select another account. Counts use exact database queries restricted by `author_id`, including records beyond Supabase's per-response limit. Password hashes, JWT signing secrets, and Supabase credentials are excluded from responses.

### Test and complete Module 5

From this existing checkout:

```sh
git switch module-5-authentication
cd backend
npm ci
npm test
npm run test:supabase
npm run dev
```

The live command requires the ignored, locally configured `backend/.env` and the existing Module 3 schema. It verifies registration strength, hashing, correct/incorrect login, profile fields, per-user counts, and all existing CRUD/search/filter behaviors, then removes only the uniquely identified accounts/posts created by that run.

Open `http://localhost:5000/frontend/`. Check that the three private pages redirect to Login without a session. Register/login, view your profile and statistics, create published/draft blogs, use View/Edit/Delete, then log out and try reopening a private page or returning through browser history. A second account must see only its own profile/blogs and cannot edit/delete the first user's posts. Verify the original demo through `dashboard.html?demo=1` and check the browser console.

After testing, from the project root:

```sh
git status
git check-ignore backend/.env
git add .
git commit -m "Complete Module 5 - Authentication and Dashboard"
git push -u origin module-5-authentication
```

Stop after pushing. Create the Pull Request **module-5-authentication → main** manually; do not merge automatically.

## Database

The application continues using the existing `backend/database/module-3.sql` schema:

| Table | Important fields and behavior |
| --- | --- |
| users | UUID ID, name, unique normalized email, bcrypt password hash, creation/update timestamps. Password hashes stay on the server. |
| blogs | UUID ID, title, category, plain-text content, cover image, author ID/name, draft/published status, creation/update timestamps. Author ID references users; deleting a verification account removes its associated blogs. |

Automatic timestamps, constraints, and row level security remain unchanged. Express uses the server database client and enforces JWT authentication, per-user queries, draft privacy, and ownership. Modules 4–6 require **no new tables, schema changes, or migrations**. Do not rerun setup against an already configured database unnecessarily.

## Security

- Registration stores bcrypt hashes with cost 12. Responses and frontend storage exclude passwords and hashes.
- Express verifies JWT signatures, allowed algorithm, issuer, audience, expiry, UUID subject, and the existing user record. Browser checks help the interface; the backend remains authoritative.
- Protected APIs require Bearer authentication. Profile/statistics/My Blogs use the verified account ID. Update/delete check ownership both before and during the database write.
- Only published posts appear publicly. Draft details require the owner's JWT; unavailable drafts return 404. Private pages verify the server session before revealing content. Private article content clears on logout/expiry and is rechecked after cached history restoration.
- Supabase service credentials and the JWT signing secret belong only in the backend environment. `.env` and generated deployment files are excluded from Git; the static build uses an asset allowlist.
- CORS permits explicit origins. JSON bodies are limited to 256 KB; malformed JSON and database errors receive sanitized responses without secrets or stack traces.
- Blog content renders as text. A Content Security Policy, anti-framing policy, content-type protection, referrer policy, and restricted browser permissions apply to the app. API and health responses use `Cache-Control: no-store`.

## Internship Modules

| Module | Work |
| --- | --- |
| 1 — Frontend Development | Original responsive journal, account/editor pages, sample posts, reader and demo workspace. |
| 2 — Backend Development | Express MVC REST API, validation, bcrypt/JWT, JSON persistence utility, API tests and Postman collection. |
| 3 — Database Integration | Existing Supabase PostgreSQL users/blogs schema, model integration, persisted blog details and live verification. |
| 4 — CRUD Operations | Complete ownership-protected create/read/update/delete, private drafts, search and category filtering. |
| 5 — Authentication & Dashboard | Stronger registration, protected pages, profile, exact own-blog statistics, tab sessions and logout/expiry handling. |
| 6 — Final Project & Deployment | Cohesive final UI, dedicated listing, responsive/accessibility improvements, bug/security review and Vercel preparation. |

## Module 6 — Final Project & Deployment

Module 6 continues this repository on `module-6-final-deployment`. It preserves the HTML/CSS/vanilla JavaScript frontend, Node/Express MVC API, existing Supabase schema, JWT/bcrypt authentication, and original explicit demo mode.

### Final UI and behavior

All eight pages share spacing, color, typography, button, form, card, navigation, and footer styles. Home features a real published story; Blogs has dedicated search/category controls and recovery actions. Article pages prioritize the title, reading metadata, cover, and readable paragraphs. Login/Register use compact mobile forms and an understated desktop brand panel. Editors provide cover previews, writing guidance, draft/publish actions, loading indicators, and clear feedback.

The dashboard includes a named welcome, account details, Total/Published/Draft statistics, responsive My Blogs cards, labeled status, View/Edit/Delete actions, and a Create Blog CTA. Deletion uses the existing accessible dialog with an explicit permanent-action warning. Notifications supplement persistent inline messages; failed requests offer useful recovery rather than blank sections.

Fixes include relative production API URLs, login-aware navigation, real homepage featured data, incomplete failed-profile loading, misleading statistics on failure, readable network errors, retry controls, cached private draft content after logout/expiry, and keyboard focus escaping an open dialog. The existing registration, CRUD, session, ownership, search/filter, and demo contracts remain compatible.

Responsive checks cover every page at **320, 375, 425, 768, 1024, 1280, 1440, and 1920 pixels**, with no horizontal overflow. Mobile navigation collapses, workspaces/cards/forms stack, and actions remain easy to tap. Accessible labels, semantic headings, image alternatives, visible focus, live feedback, native modal keyboard behavior, status text, and reduced motion are included. These checks are practical verification, not a claim of a formal accessibility certification.

### Local verification record

- `npm test`: **27 passed** across API and frontend-session suites.
- `npm run test:supabase`: **passed**, including real database persistence, registration/hash/login, profile/counts, CRUD/search/filter, draft privacy and ownership. Its uniquely identified records were cleaned up.
- `npm run build`: **passed**, preparing only frontend assets.
- Chromium browser checks: registration/login, protected pages, CRUD/drafts, profile/statistics, filters, missing/error/retry states, expiry/history, original demo and all eight responsive layouts. Desktop/mobile screenshots were inspected.
- Complete Chromium flow against real Supabase: **passed** on a custom local port. Registration, stored bcrypt hash, login/profile, published/draft creation, counts, listing/search/filter, details, persisted editing, second-account isolation/ownership, logout/history/idle-expiry draft privacy, deletion cancellation, database deletion, empty dashboard, mobile logout and protected-page redirect were verified. Both unique verification accounts and their posts were removed.
- Accessibility checks: **passed** for all eight pages' labels, image alt text, one H1 and unique IDs; keyboard skip links/focus, mobile-menu Escape/focus, dialog focus containment/Escape/restoration, reduced motion, and main text-token contrast of at least 4.5:1 on white/pale backgrounds.

Browser interactions were executed through Chromium automation and reviewed through screenshots. Hosted Vercel behavior remains pending until the manual deployment and production checklist below are completed.

### Module 6 Git submission

After local verification and a secret/diff review, run from this project root:

```sh
git status
git diff
git check-ignore backend/.env
git add .
git commit -m "Complete Module 6 - Final Project and Vercel Deployment Preparation"
git push -u origin module-6-final-deployment
```

Stop after pushing. The user manually creates **module-6-final-deployment → main** and reviews/merges it. Module 6 must not be committed directly to `main`, merged automatically, or automatically deployed.

## Deployment

**Prepared for Vercel; not deployed.** Deploy the frontend and Express API as one project, using Vercel's native Express support. `backend/app.js` configures and exports Express without starting a listener; `backend/server.js` preserves local `npm start`/`npm run dev` and `PORT` support. `npm run build` copies the original sibling frontend assets into ignored `backend/public/`, which Vercel serves on its CDN. API and health routes run through the exported Express application.

### Exact project settings

| Vercel setting | Value |
| --- | --- |
| Git repository | `jafeerabdullah/codomax-fullstack-blog` |
| Root Directory | **backend** |
| Include source files outside the Root Directory in the Build Step | **Enabled**; the static build reads `../frontend` |
| Framework Preset | **Express** |
| Install Command | **npm ci** |
| Build Command | **npm run build** |
| Output Directory | **Leave the override disabled/blank**; Express handles `public/` automatically |
| Node.js Version | **24.x**, matching `backend/package.json` |
| Production Branch | **main**, after the user's manual Module 6 PR merge |

Do not set Output Directory to `public`: the native Express build needs to discover the exported application at its default location. The current configuration is `backend/vercel.json`; it declares Express and the commands above. Rewrites retain `/frontend` and `/frontend/:path*` links while canonical pages live at `/index.html`, `/blogs.html`, etc. Security headers apply to both static CDN assets and function responses. No second API deployment, frontend framework, database migration, or additional serverless wrapper is required.

The settings follow the official [Express deployment documentation](https://vercel.com/docs/frameworks/backend/express), [project configuration](https://vercel.com/docs/project-configuration/vercel-json), [outside-root source setting](https://vercel.com/docs/monorepos/monorepo-faq), and [Node.js runtime versions](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions).

### Vercel environment variables

Configure values in **Project → Settings → Environment Variables**. This document lists names and purposes only, never actual credentials.

| Name | Requirement | Handling |
| --- | --- | --- |
| SUPABASE_URL | Required | Existing project's backend connection URL. |
| SUPABASE_SERVICE_ROLE_KEY | Required | **Sensitive** backend database key. Never expose it to client code. |
| JWT_SECRET | Required | **Sensitive**, cryptographically random signing secret of at least 32 characters. |
| JWT_EXPIRES_IN | Optional | Overrides the existing default token lifetime of one hour. |
| CORS_ORIGINS | Required for production browser access | Exact HTTPS production origin and any intentionally supported additional origins. |

Apply them to **Production** and also to **Preview** if testing the branch before merge. Preview needs its own explicit allowed origin. `PORT` and `DATA_DIR` are unnecessary for Vercel. The application uses Express authentication, so no Supabase publishable/JWKS setting is required. Keep local credentials in ignored `backend/.env`; do not upload that file or add secret values to `vercel.json`.

### Manual deployment steps

1. Review the pushed `module-6-final-deployment` branch, manually create its PR into `main`, and merge it when approved. A branch preview can be tested first without merging.
2. Sign in to Vercel, choose **Add New → Project**, and import the existing GitHub repository.
3. Set Root Directory to **backend** and enable inclusion of source files outside that directory. Select **Express**, Node **24.x**, Install **npm ci**, Build **npm run build**, and leave the Output Directory override off.
4. Add the environment variable names above with your actual backend values. Set an initial intended production origin in `CORS_ORIGINS`; check the assigned URL after deployment.
5. Click **Deploy**. Inspect the build logs: dependency installation, static asset build, and native Express function must finish successfully.
6. Copy the assigned HTTPS production URL. Update `CORS_ORIGINS` to its exact origin, add any custom domain intentionally supported, then **redeploy** so the new environment is applied. For a preview, use that preview's exact origin in the Preview environment and redeploy it.
7. Verify `/health` returns exactly `{ "status": "ok" }`, then complete every production check below using the HTTPS URL.
8. Replace `<VERCEL_URL>` in Live Demo only after the deployed application and database flows pass. Remove only the production records you created for testing.

### Production CORS configuration

Use the final Vercel **origin** (scheme plus hostname), such as your assigned HTTPS project domain, in `CORS_ORIGINS`. Include neither a page path nor a trailing slash. Additional production/custom/preview origins are separated with commas. Explicit local origins can also be listed when intentionally needed. Do not use `*` or a wildcard preview-domain suffix. The frontend's relative `/api` calls use that same origin and require no URL edits. Changes to environment settings require a redeployment.

### Production verification checklist

These checks are **pending until deployment**:

- [ ] HTTPS opens Home, Blogs, Blog Details, Login, Register, Dashboard, Create, and Edit; direct links and legacy `/frontend/` links work.
- [ ] CSS, JavaScript, local covers, favicon, external-cover fallback, navigation, footer and mobile menu work; `/health` returns only the expected JSON.
- [ ] Registration validation, duplicate rejection, new user storage and bcrypt hashing work in Supabase; passwords/hashes are absent from API responses.
- [ ] Correct/incorrect login, JWT-protected profile/dashboard, exact per-user counts, missing/invalid/expired tokens, and logout/history access behave correctly.
- [ ] Create published/draft blogs; verify Supabase storage and dashboard counts. Published blogs appear publicly; another user or logged-out reader cannot read a draft.
- [ ] Details, title/content search, category filters, combined filters, clear-filter recovery, and readable plain-text content work.
- [ ] Editing persists in Supabase. Cancelled deletion leaves data intact; confirmed deletion removes it and updates statistics. Another user's edit/delete returns 403.
- [ ] Empty, loading, missing-post, unauthorized, API/database failure and retry states remain readable; backend errors reveal no internal details.
- [ ] Mobile 320/375/425, tablet 768/1024 and desktop 1280/1440+ layouts have no overflow or clipping. Keyboard focus, labeled forms, password toggles, modal cancellation and reduced motion work.
- [ ] Browser console and Vercel function logs show no application errors; CORS accepts only intended origins; environment files and backend secrets are not served or included in frontend assets.
- [ ] Remove only the accounts/posts created for verification, record the successful URL, and update Live Demo.

## Live Demo

Live Application: `<VERCEL_URL>`

Pending manual Vercel deployment and production verification. No live deployment has been claimed.

## GitHub Repository

[jafeerabdullah/codomax-fullstack-blog](https://github.com/jafeerabdullah/codomax-fullstack-blog)
