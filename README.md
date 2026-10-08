# Codomax Full Stack Blog

**Author: Jafeer Abdullah**
**Codomax Full Stack Web Development Internship**

The Codomax Journal combines the completed **Module 1 — Frontend Development** with **Module 2 — Backend Development**. The original HTML5, CSS3, and vanilla JavaScript design is preserved. An Express REST API now supports real registration, login, publishing, reading, editing, and deleting, using JSON files as the temporary persistence layer.

MongoDB and database integration are reserved for **Module 3**. This project does not use React, Firebase, or a database.

## Repository branches

- `module-1-frontend` contains the frontend in the root-level `frontend/` folder.
- `module-2-backend` contains the backend in the root-level `backend/` folder.
- `main` combines both modules. Use `main` to run the full application and its automated tests.

The folder structure and installation steps below describe the combined `main` branch.

## Features

- Five responsive pages: Home, Login, Register, Dashboard, and Create Blog.
- Original blue/white theme, local images, mobile menu, article reader, accessible forms, keyboard focus, and reduced motion support.
- Frontend validation, server validation, and readable API success/error messages.
- Registration with normalized email addresses, duplicate detection, and bcrypt password hashes.
- Login with a signed JWT and safe user information; passwords are never returned or stored by the frontend.
- Authenticated creation, editing, and deletion with server ownership checks.
- Personal dashboard statistics; published API posts also appear on Home.
- Original browser-only sample workspace with edit/delete/reset interactions.
- Serialized JSON writes with atomic file replacement.
- MVC structure ready for future database integration.
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

The server starts with empty user/blog arrays and no default account or password. Register as **Jafeer Abdullah** to publish under that name. Other users publish under their registered names.

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
| GET | /api/blogs/:id | Owner JWT | Read own post for editing |
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

Eight API test groups cover server responses, validation, hashing, email normalization, concurrent duplicate rejection, JWT, ownership, private drafts, concurrent file writes, persistence across restarting the HTTP server, JSON errors, and CORS. Tests use a separate temporary data directory and ephemeral port, preserving the delivered data files.

Browser integration checks cover the real register → login → create → edit → read → delete flow, original demo interactions, and responsive layouts from 320px to 1920px. The original CSS file is preserved byte for byte. Browser/Postman QA data is isolated outside the project.

The nodemon configuration watches only source directories and ignores data writes. A Chokidar 4 override avoids the older watcher's vulnerable brace-pattern dependency; its startup and automatic restart are verified.

## Future Module 3 database integration

User.js and Blog.js own persistence. Controllers validate and call model methods; routes connect paths and middleware. Replace the model operations or jsonStore adapter with MongoDB in Module 3 without changing frontend API contracts.

JSON storage persists between server restarts but remains an interim development solution. Use one backend process: the write queue protects operations within that process, not across multiple processes. This internship module runs locally and is not a production deployment.

## Images

The original generated laptop, fictional architecture, and writing-desk covers remain bundled locally. The favicon and fallback are local SVG assets. No external font, icon, or image service is required for the original sample pages.
