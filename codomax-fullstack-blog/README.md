# Codomax Full Stack Blog

**Author and demo writer: Jafeer Abdullah**

A complete responsive blog frontend for the **Codomax Full Stack Web Development Internship — Module 1: Frontend Development**.

The Codomax Journal is an editorial style blog with five pages, accessible forms, and a small writing workspace. The project uses **HTML5, CSS3, and vanilla JavaScript only**. It runs without a build step, package installation, framework, or backend.

## Features

- Responsive navigation with a mobile menu, active page indicators, and keyboard support.
- Home page with a welcome hero, featured article, and three published sample blog cards.
- Local cover images, categories, dates, reading times, and working Read More article dialogs.
- Login form with required email/password validation and readable error messages.
- Registration form with full name, email, password length, and matching password validation.
- Password visibility controls. Account forms never save or transmit credentials.
- Demo dashboard with total, published, and draft statistics that update after changes.
- Working demo edit/delete actions, delete confirmation, empty state, and reset control.
- Blog editor with title, category, cover image URL, plain text content, word count, and required field validation.
- Successful publishing and editing update the browser tab's demo posts and show an explicit success message.
- Semantic HTML, labeled inputs, visible keyboard focus, skip links, accessible dialogs, and reduced motion support.
- Shared styling, consistent navigation, rounded cards, hover effects, and responsive layouts for desktop, laptop, tablet, and mobile.

## Technologies

| Technology | Purpose |
| --- | --- |
| HTML5 | Semantic page structure, forms, and native dialogs |
| CSS3 | Shared theme, responsive grids, media queries, and interaction states |
| Vanilla JavaScript | Navigation, validation, dialogs, and demo post interactions |
| Browser `sessionStorage` | Temporary demo posts in the current tab only |

There are **no runtime libraries, Node.js files, APIs, authentication services, or databases** in this module.

## Folder structure

```text
codomax-fullstack-blog/
├── index.html
├── login.html
├── register.html
├── dashboard.html
├── create-blog.html
├── css/
│   └── style.css
├── js/
│   └── script.js
├── images/
│   ├── code-workspace.jpg
│   ├── design-perspective.jpg
│   ├── writing-routine.jpg
│   ├── cover-fallback.svg
│   └── favicon.svg
└── README.md
```

## How to run

1. Download or copy the complete `codomax-fullstack-blog` folder.
2. Open **`index.html`** in a current browser, such as Chrome, Edge, Firefox, or Safari.
3. Use the header and footer links to explore the five pages. The Blogs link opens the latest posts section on the home page.

No installation, command line, or backend is required. The bundled images and system fonts let the original sample pages work offline.

For a consistent browser origin during development, you can optionally open the folder with the **VS Code Live Server extension**, then choose **Open with Live Server** on `index.html`. A static preview server simply serves these files; it adds no backend functionality to the project.

## Trying the demo

**Account forms:** Login validates a nonempty password and a correctly formatted email. Register also checks a nonempty full name, a password of at least eight characters, and matching passwords. Successful submission confirms validation only. No user is authenticated and no account is created. Password fields are cleared after success. The demo dashboard is public and does not require a login.

**Blog forms:** Open `create-blog.html`, fill all four fields, and choose **Publish blog**. For an offline cover image, enter `images/code-workspace.jpg`, `images/design-perspective.jpg`, or `images/writing-routine.jpg`. HTTP/HTTPS image URLs are accepted, too; external images require an internet connection and the image host's permission to load them. A local abstract cover appears when an image cannot load.

**Editing:** Choose **Edit** beside a dashboard post. The same blog editor opens with `?edit=POST_ID` and prefilled fields. Publishing an existing draft changes its demo status to published. Saving a published post updates that post rather than creating a duplicate.

**Deleting:** Choose **Delete**, then confirm. Statistics and the post list update immediately. **Reset demo posts** restores the four original samples, including one draft.

**Temporary state:** Demo posts use `sessionStorage`, which survives page navigation and reloads in the same tab. Closing the tab normally ends the demo session. Tabs opened from another tab may start with a copy of that tab's session and then change independently. This is temporary frontend sample data, not a database. No credentials or account information are stored. Some browsers restrict storage for directly opened files; use a static preview server if changes do not carry between pages. If storage is blocked, the interface explains that changes cannot carry over.

## Code organization

`css/style.css` contains shared design tokens and labeled sections for the header/footer, journal, forms, dashboard, editor, dialogs, and responsive breakpoints.

`js/script.js` uses an isolated scope and separate page initializers. The `DemoPosts` adapter owns demo data operations; rendering, validation, navigation, and dialogs are kept in separate functions. User input is rendered using DOM elements and `textContent`, with no HTML evaluation. Blog content is plain text. Account form submit buttons stay disabled until their JavaScript handlers are ready.

## Future backend implementation

Later modules can introduce **Node.js, Express.js, MongoDB, and JWT authentication**. Replace the `DemoPosts` adapter with API calls, connect the account forms to real authentication endpoints, and enforce authentication and authorization on the server. Move validation and security checks to the server as well; browser validation is for usability and is not a security boundary.

This module intentionally contains no backend routes, database connection, JWT handling, fake accounts, or private dashboard access.

## Verification

The frontend passed browser checks in Chrome for all five pages at 13 viewport widths from **320px to 1920px**. Navigation, local assets, mobile menu behavior, article dialogs, form validation, publishing, editing, deleting, statistics, and demo reset were checked. All pages also passed overflow checks at 200% text size on mobile, tablet, and desktop. The normal page and interaction flows produced no browser console or JavaScript runtime errors.

Additional checks confirmed that failed external images display the local fallback, blocked browser storage produces a helpful message, and form submit buttons remain disabled when JavaScript is unavailable. QA tooling is kept outside the project and is not a runtime dependency.

## Image assets

The three cover images are original AI generated editorial images created for this project using the built-in image generation tool. The fictional architecture does not depict a specific building. The favicon and fallback cover are simple, local SVG assets. No external font, icon, or image service is required to display the original sample pages.

Generation briefs:

1. A dark laptop with abstract, unreadable code on a clean navy/gray workspace, atmospheric editorial light.
2. White contemporary architectural geometry with light blue sky and geometric shadows.
3. An overhead cream notebook and coffee on a gray wood writing desk with calm neutral tones.

Each image uses a landscape photographic composition without people, brands, overlay text, or watermarks.
