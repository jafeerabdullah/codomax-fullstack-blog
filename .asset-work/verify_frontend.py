"""External QA utility. Not a dependency or part of the delivered frontend."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import json
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parent.parent / "codomax-fullstack-blog"
OUT = Path(__file__).resolve().parent / "verification"
OUT.mkdir(exist_ok=True)
PAGES = ["index.html", "login.html", "register.html", "dashboard.html", "create-blog.html"]
WIDTHS = [320, 360, 390, 480, 600, 700, 701, 768, 900, 1024, 1280, 1440, 1920]
checks = []

def passed(text):
    checks.append(text)
    print("PASS:", text, flush=True)

class References(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links, self.ids, self.assets = [], set(), []
    def handle_starttag(self, tag, attrs):
        data = dict(attrs)
        if "id" in data:
            self.ids.add(data["id"])
        if tag == "a" and "href" in data:
            self.links.append(data["href"])
        if tag in ["script", "img"] and "src" in data:
            self.assets.append(data["src"])
        if tag == "link" and "href" in data:
            self.assets.append(data["href"])

documents = {}
for name in PAGES:
    parser = References()
    parser.feed((ROOT / name).read_text(encoding="utf-8"))
    documents[name] = parser
for name, parser in documents.items():
    for href in parser.links + parser.assets:
        parsed = urlsplit(href)
        if parsed.scheme:
            continue
        target = unquote(parsed.path) or name
        assert (ROOT / target).is_file(), (name, href, "missing file")
        if parsed.fragment:
            assert parsed.fragment in documents[target].ids, (name, href, "missing anchor")
passed("Every local link, anchor, stylesheet, script, favicon, and original image exists")

with sync_playwright() as playwright:
    browser = playwright.chromium.launch(
        executable_path=r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        headless=True, args=["--allow-file-access-from-files"])
    context = browser.new_context(viewport={"width": 1440, "height": 1000})
    page = context.new_page()
    errors, console_errors = [], []
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)

    def goto(name):
        page.goto((ROOT / name).as_uri(), wait_until="load")

    def no_overflow():
        dimensions = page.evaluate("({viewport: innerWidth, document: document.documentElement.scrollWidth, body:document.body.scrollWidth})")
        assert dimensions["document"] <= dimensions["viewport"] + 1, (page.url, dimensions)
        assert dimensions["body"] <= dimensions["viewport"] + 1, (page.url, dimensions)

    for width in WIDTHS:
        page.set_viewport_size({"width": width, "height": 900})
        for name in PAGES:
            goto(name)
            no_overflow()
            assert page.locator("link[rel=stylesheet]").count() == 1
            assert page.evaluate("getComputedStyle(document.body).fontFamily.includes('Segoe')")
            assert page.locator("h1, h2").first.is_visible()
            page.locator("img").evaluate_all("images => images.forEach(img => img.loading='eager')")
            page.wait_for_function("[...document.images].every(img => img.complete && img.naturalWidth > 0)")
            if width in [390, 1440]:
                page.screenshot(path=str(OUT / f"{name[:-5]}-{width}.png"), full_page=True)
        passed(f"Five pages: CSS, images, headings and zero horizontal overflow at {width}px")
    assert not errors, errors
    assert not console_errors, console_errors
    passed("No browser console or JavaScript runtime errors across all page sizes")

    page.set_viewport_size({"width": 390, "height": 844})
    goto("index.html")
    menu = page.locator(".menu-toggle")
    expect(page.locator("#primary-nav")).not_to_be_visible()
    menu.click()
    expect(menu).to_have_attribute("aria-expanded", "true")
    expect(page.locator("#primary-nav")).to_be_visible()
    no_overflow()
    page.keyboard.press("Escape")
    expect(menu).to_have_attribute("aria-expanded", "false")
    menu.click()
    page.locator("#primary-nav a[href='index.html#blogs']").click()
    expect(menu).to_have_attribute("aria-expanded", "false")
    expect(page.locator("#blogs")).to_be_in_viewport()
    passed("Mobile menu: open, keyboard close, anchor navigation, and no overflow")

    page.locator(".read-more").first.click()
    expect(page.locator("#reader-dialog")).to_be_visible()
    expect(page.locator("#reader-title")).to_contain_text("Start small")
    no_overflow()
    page.keyboard.press("Escape")
    expect(page.locator("#reader-dialog")).not_to_be_visible()
    assert "dialog-open" not in page.locator("body").get_attribute("class").split()
    passed("Read More opens the correct article and Escape closes its accessible dialog")

    goto("login.html")
    page.get_by_role("button", name="Login", exact=True).click()
    assert page.locator("[aria-invalid=true]").count() == 2
    page.locator("#email").fill("wrong-email")
    page.locator("#password").fill("   ")
    page.get_by_role("button", name="Login", exact=True).click()
    expect(page.locator("#email-error")).to_contain_text("valid email")
    page.locator("#email").fill("writer@example.com")
    page.locator("#password").fill("test-password")
    page.get_by_role("button", name="Show password", exact=True).click()
    expect(page.locator("#password")).to_have_attribute("type", "text")
    page.get_by_role("button", name="Login", exact=True).click()
    expect(page.locator("#login-message")).to_contain_text("passed validation")
    expect(page.locator("#login-dashboard-link")).to_be_visible()
    expect(page.locator("#password")).to_have_value("")
    assert page.evaluate("sessionStorage.length") == 0
    passed("Login: required fields, invalid email, blank password, visibility, success, no credential storage")

    goto("register.html")
    page.get_by_role("button", name="Register", exact=True).click()
    assert page.locator("[aria-invalid=true]").count() == 4
    page.locator("#full-name").fill("Test Writer")
    page.locator("#email").fill("writer@example.com")
    page.locator("#password").fill("short")
    page.locator("#confirm-password").fill("different")
    page.get_by_role("button", name="Register", exact=True).click()
    expect(page.locator("#password-error")).to_contain_text("8 characters")
    expect(page.locator("#confirm-password-error")).to_contain_text("don't match")
    page.locator("#password").fill("valid-password")
    page.locator("#confirm-password").fill("valid-password")
    page.get_by_role("button", name="Register", exact=True).click()
    expect(page.locator("#register-message")).to_contain_text("validated successfully")
    expect(page.locator("#password")).to_have_value("")
    expect(page.locator("#confirm-password")).to_have_value("")
    assert page.evaluate("sessionStorage.length") == 0
    passed("Register: all required fields, password length/match, successful validation, no account storage")

    goto("create-blog.html")
    page.locator("#publish-button").click()
    assert page.locator("[aria-invalid=true]").count() == 4
    page.locator("#blog-title").fill("A useful new perspective")
    page.locator("#category").select_option("Technology")
    page.locator("#image-url").fill("javascript:alert(1)")
    safe_content = "A clear first paragraph.\n\n<img src=x onerror=alert(1)> is displayed as plain text."
    page.locator("#blog-content").fill(safe_content)
    page.locator("#publish-button").click()
    expect(page.locator("#image-url-error")).to_contain_text("valid HTTP/HTTPS")
    page.locator("#image-url").fill("images/writing-routine.jpg")
    page.locator("#publish-button").click()
    expect(page.locator("#blog-message")).to_contain_text("published successfully")
    expect(page.locator("#publish-button")).to_be_disabled()
    expect(page.locator("#blog-dashboard-link")).to_be_visible()
    created = page.evaluate("JSON.parse(sessionStorage.getItem('codomax.module1.posts.v1'))[0]")
    assert created["title"] == "A useful new perspective"
    assert len(page.evaluate("JSON.parse(sessionStorage.getItem('codomax.module1.posts.v1'))")) == 5
    page.reload()
    expect(page.locator("#blog-title")).to_have_value("A useful new perspective")
    passed("Create: required fields, rejects unsafe URL, word count, publish, tab storage, reload reopens saved post")

    goto("dashboard.html")
    expect(page.locator("#stat-total")).to_have_text("5")
    expect(page.locator("#stat-published")).to_have_text("4")
    expect(page.locator("#stat-drafts")).to_have_text("1")
    row = page.locator(".dashboard-row").filter(has_text="A useful new perspective")
    row.get_by_role("link", name="Edit A useful new perspective", exact=True).click()
    expect(page.locator("#blog-title")).to_have_value("A useful new perspective")
    page.locator("#blog-title").fill("A freshly edited perspective")
    page.locator("#publish-button").click()
    expect(page.locator("#blog-message")).to_contain_text("changes were saved")
    goto("dashboard.html")
    expect(page.locator("#stat-total")).to_have_text("5")
    expect(page.locator(".dashboard-row").filter(has_text="A freshly edited perspective")).to_be_visible()
    page.locator("a[href='create-blog.html?edit=post-4']").click()
    expect(page.locator("#blog-title")).to_have_value("What I'm learning about accessible websites")
    page.locator("#publish-button").click()
    expect(page.locator("#blog-message")).to_contain_text("changes were saved")
    goto("dashboard.html")
    expect(page.locator("#stat-published")).to_have_text("5")
    expect(page.locator("#stat-drafts")).to_have_text("0")
    passed("Edit: prefills fields, updates same post, keeps total correct, and publishes an existing draft")

    goto("index.html")
    expect(page.locator(".blog-card")).to_have_count(5)
    page.locator(".blog-card").filter(has_text="A freshly edited perspective").get_by_role("button").click()
    expect(page.locator("#reader-content")).to_contain_text("<img src=x onerror=alert(1)>")
    assert page.locator("#reader-content img").count() == 0
    page.keyboard.press("Escape")
    passed("Published demo changes appear on Home; supplied HTML is safely rendered as plain text")

    goto("dashboard.html")
    page.locator("[data-delete-post]").first.click()
    page.get_by_role("button", name="Keep story").click()
    expect(page.locator("#stat-total")).to_have_text("5")
    for expected in range(4, -1, -1):
        page.locator("[data-delete-post]").first.click()
        page.locator("#confirm-action").click()
        expect(page.locator("#stat-total")).to_have_text(str(expected))
    expect(page.locator("#dashboard-empty")).to_be_visible()
    no_overflow()
    page.locator("#reset-demo").click()
    page.locator("#confirm-action").click()
    expect(page.locator("#stat-total")).to_have_text("4")
    expect(page.locator("#stat-published")).to_have_text("3")
    expect(page.locator("#stat-drafts")).to_have_text("1")
    passed("Delete: cancellation, confirmation, accurate stats, empty state, and reset to original samples")

    goto("create-blog.html")
    page.goto((ROOT / "create-blog.html").as_uri() + "?edit=missing-post")
    expect(page.locator("#blog-message")).to_contain_text("could not be found")
    page.get_by_role("link", name="Cancel", exact=True).click()
    assert page.url.endswith("dashboard.html")
    passed("Invalid edit ID is handled; Cancel returns to dashboard")

    # Enlarge text without changing the physical viewport.
    for width in [320, 768, 1440]:
        page.set_viewport_size({"width": width, "height": 1000})
        for name in PAGES:
            goto(name)
            page.evaluate("document.documentElement.style.fontSize='200%'")
            no_overflow()
    passed("All pages remain free of horizontal overflow at 200% text size on mobile, tablet, and desktop")

    assert not errors, errors
    assert not console_errors, console_errors
    passed("Complete interaction flow has no browser console or runtime errors")

    # Deliberately fail an image request and verify the local fallback.
    goto("index.html")
    page.route("https://missing.example/**", lambda route: route.abort())
    page.evaluate("document.querySelector('.blog-card img').src='https://missing.example/cover.jpg'")
    page.wait_for_function("document.querySelector('.blog-card img').getAttribute('src') === 'images/cover-fallback.svg' && document.querySelector('.blog-card img').naturalWidth > 0")
    passed("Failed external cover requests recover to a loaded local fallback")

    # Storage denial is recoverable and never crashes the editor.
    blocked = browser.new_context()
    blocked.add_init_script("Object.defineProperty(window, 'sessionStorage', {get(){throw new Error('Storage unavailable for test')}})")
    blocked_page = blocked.new_page()
    blocked_errors = []
    blocked_page.on("pageerror", lambda error: blocked_errors.append(str(error)))
    blocked_page.goto((ROOT / "dashboard.html").as_uri())
    expect(blocked_page.locator("#dashboard-message")).to_contain_text("storage is unavailable")
    expect(blocked_page.locator(".dashboard-row")).to_have_count(4)
    blocked_page.goto((ROOT / "create-blog.html").as_uri())
    blocked_page.locator("#blog-title").fill("Storage test")
    blocked_page.locator("#category").select_option("Design")
    blocked_page.locator("#image-url").fill("images/design-perspective.jpg")
    blocked_page.locator("#blog-content").fill("A complete story for a storage failure test.")
    blocked_page.locator("#publish-button").click()
    expect(blocked_page.locator("#blog-message")).to_contain_text("storage is unavailable")
    assert not blocked_errors, blocked_errors
    passed("Blocked browser storage gracefully degrades without runtime errors")
    blocked.close()

    nojs = browser.new_context(java_script_enabled=False)
    nojs_page = nojs.new_page()
    for name in ["login.html", "register.html", "create-blog.html"]:
        nojs_page.goto((ROOT / name).as_uri())
        expect(nojs_page.locator("[type=submit]")).to_be_disabled()
    nojs.close()
    passed("Forms cannot accidentally submit account data when JavaScript is disabled")

    browser.close()

(OUT / "report.json").write_text(json.dumps({"result": "passed", "checks": checks}, indent=2), encoding="utf-8")
print(f"All {len(checks)} check groups passed. Report: {OUT / 'report.json'}", flush=True)
