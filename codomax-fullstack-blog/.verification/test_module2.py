"""Module 2 browser and Postman QA. All test records stay outside the project."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit
import json
import os
import subprocess
import time
import urllib.request
from uuid import uuid4
from playwright.sync_api import sync_playwright, expect

WORKSPACE = Path(__file__).resolve().parent.parent
PROJECT = WORKSPACE / 'codomax-fullstack-blog'
BACKEND = PROJECT / 'backend'
FRONTEND = PROJECT / 'frontend'
OUTPUT = Path(__file__).resolve().parent
DATA = OUTPUT / ('api-data-' + uuid4().hex)
DATA.mkdir()
BASE = 'http://localhost:5000'
checks = []
def passed(label):
    checks.append(label)
    print('PASS: ' + label, flush=True)

# Check all unchanged navigation destinations after the frontend folder move.
class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.refs=[]
    def handle_starttag(self, tag, attrs):
        data=dict(attrs)
        if tag in ['a','link'] and 'href' in data:
            self.refs.append(data['href'])
        if tag in ['img','script'] and 'src' in data:
            self.refs.append(data['src'])
for html in FRONTEND.glob('*.html'):
    parser=Links()
    parser.feed(html.read_text(encoding='utf-8'))
    for reference in parser.refs:
        url=urlsplit(reference)
        if not url.scheme and url.path:
            assert (FRONTEND / url.path).is_file(), (html.name,reference)
assert (FRONTEND/'css/style.css').read_bytes() == Path(r'C:\Users\JAFEER ABDULLAH\Desktop\codomax-fullstack-blog\codomax-fullstack-blog\css/style.css').read_bytes()
passed('Original CSS is unchanged; every navigation and asset destination exists')

env={**os.environ,'DATA_DIR':str(DATA),'PORT':'5000'}
log=(OUTPUT/'backend-browser-test.log').open('w',encoding='utf-8')
server=subprocess.Popen([r'C:\Program Files\nodejs\node.exe','server.js'],cwd=BACKEND,env=env,stdout=log,stderr=subprocess.STDOUT,creationflags=getattr(subprocess,'CREATE_NO_WINDOW',0))
try:
    for attempt in range(100):
        if server.poll() is not None:
            raise RuntimeError('Test server exited. Check backend-browser-test.log')
        try:
            if urllib.request.urlopen(BASE,timeout=1).read().decode()=='Blog API Server Running':
                break
        except Exception:
            time.sleep(.2)
    else:
        raise RuntimeError('Server failed to start')
    with sync_playwright() as playwright:
        browser=playwright.chromium.launch(executable_path=r'C:\Program Files\Google\Chrome\Application\chrome.exe',headless=True)
        context=browser.new_context(viewport={'width':1440,'height':1000})
        page=context.new_page()
        runtime_errors=[]
        console_errors=[]
        page.on('pageerror',lambda error:runtime_errors.append(str(error)))
        page.on('console',lambda message:console_errors.append(message.text) if message.type=='error' else None)
        def goto(name):
            page.goto(BASE+'/frontend/'+name,wait_until='networkidle')
        def overflow():
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1'), page.url
        pages=['index.html','login.html','register.html','dashboard.html','create-blog.html']
        for width in [320,390,700,701,768,1024,1440,1920]:
            page.set_viewport_size({'width':width,'height':1000})
            for name in pages:
                goto(name)
                overflow()
                if width in [390,1440]:
                    page.screenshot(path=str(OUTPUT/f'module2-{name[:-5]}-{width}.png'),full_page=True)
            passed(f'Five pages open and remain responsive at {width}px')
        assert not runtime_errors,runtime_errors
        assert not console_errors,console_errors
        passed('All normal page loads have no browser console or runtime errors')
        page.set_viewport_size({'width':390,'height':844})
        goto('index.html')
        page.locator('.menu-toggle').click()
        expect(page.locator('#primary-nav')).to_be_visible()
        page.keyboard.press('Escape')
        expect(page.locator('#primary-nav')).not_to_be_visible()
        page.locator('.read-more').first.click()
        expect(page.locator('#reader-title')).to_contain_text('Start small')
        page.keyboard.press('Escape')
        passed('Original mobile navigation and sample article reader still work')

        goto('register.html')
        page.get_by_role('button',name='Register',exact=True).click()
        assert page.locator('[aria-invalid=true]').count()==4
        page.locator('#full-name').fill('Jafeer Abdullah')
        email='browser-'+uuid4().hex[:10]+'@example.com'
        page.locator('#email').fill(email)
        page.locator('#password').fill('Browser-password-123')
        page.locator('#confirm-password').fill('Different-password-123')
        page.get_by_role('button',name='Register',exact=True).click()
        expect(page.locator('#confirm-password-error')).to_contain_text("don't match")
        page.locator('#confirm-password').fill('Browser-password-123')
        page.get_by_role('button',name='Register',exact=True).click()
        expect(page.locator('#register-message')).to_contain_text('User registered successfully',timeout=15000)
        users=json.loads((DATA/'users.json').read_text())
        assert users[0]['email']==email
        assert users[0]['password'].startswith('$2')
        assert users[0]['password']!='Browser-password-123'
        passed('Register frontend calls Express, checks matching passwords, and persists a bcrypt hash')

        goto('login.html')
        page.locator('#email').fill(email)
        page.locator('#password').fill('Browser-password-123')
        page.get_by_role('button',name='Login',exact=True).click()
        expect(page.locator('#login-message')).to_contain_text('Login successful',timeout=15000)
        expect(page.locator('#password')).to_have_value('')
        assert page.evaluate("JSON.parse(sessionStorage.getItem('codomax.module2.session')).token.split('.').length")==3
        page.locator('#login-dashboard-link').click()
        expect(page.locator('#dashboard-heading')).to_contain_text('Jafeer Abdullah')
        expect(page.locator('#dashboard-empty')).to_be_visible()
        expect(page.locator('#reset-demo')).not_to_be_visible()
        passed('Login frontend stores JWT, opens the real personal dashboard, and uses the account name')

        page.get_by_role('link',name='Create new blog',exact=True).first.click()
        page.locator('#blog-title').fill('My connected frontend story')
        page.locator('#category').select_option('Web Development')
        page.locator('#image-url').fill('images/code-workspace.jpg')
        page.locator('#blog-content').fill('A real story saved by Express.\n\n<script>alert(1)</script> stays plain text.')
        page.locator('#publish-button').click()
        expect(page.locator('#blog-message')).to_contain_text('Blog created successfully',timeout=15000)
        blogs=json.loads((DATA/'blogs.json').read_text())
        assert len(blogs)==1
        assert blogs[0]['author']=='Jafeer Abdullah'
        expect(page.locator('#publish-button')).to_be_disabled()
        page.locator('#blog-dashboard-link').click()
        expect(page.locator('#stat-total')).to_have_text('1')
        expect(page.locator('#stat-published')).to_have_text('1')
        passed('Create frontend calls protected API; dashboard stats reflect the saved blog')

        page.locator('.dashboard-row').get_by_role('link',name='Edit My connected frontend story',exact=True).click()
        expect(page.locator('#blog-title')).to_have_value('My connected frontend story')
        page.locator('#blog-title').fill('My edited server story')
        page.locator('#publish-button').click()
        expect(page.locator('#blog-message')).to_contain_text('Blog updated successfully')
        goto('index.html')
        story=page.locator('.blog-card').filter(has_text='My edited server story')
        expect(story).to_be_visible()
        story.get_by_role('button').click()
        expect(page.locator('#reader-content')).to_contain_text('<script>alert(1)</script>')
        assert page.locator('#reader-content script').count()==0
        page.keyboard.press('Escape')
        passed('Real edits persist and appear on Home; blog text is rendered without HTML evaluation')

        goto('dashboard.html')
        page.locator('[data-delete-post]').click()
        page.get_by_role('button',name='Keep story').click()
        expect(page.locator('#stat-total')).to_have_text('1')
        page.locator('[data-delete-post]').click()
        page.locator('#confirm-action').click()
        expect(page.locator('#dashboard-message')).to_contain_text('was deleted')
        expect(page.locator('#stat-total')).to_have_text('0')
        assert json.loads((DATA/'blogs.json').read_text())==[]
        passed('Real deletion confirms before updating JSON and dashboard statistics')

        goto('dashboard.html?demo=1')
        expect(page.locator('#stat-total')).to_have_text('4')
        page.locator("a[href='create-blog.html?edit=post-4&demo=1']").click()
        page.locator('#publish-button').click()
        expect(page.locator('#blog-message')).to_contain_text('saved to the demo')
        goto('dashboard.html?demo=1')
        expect(page.locator('#stat-published')).to_have_text('4')
        page.locator('[data-delete-post]').first.click()
        page.locator('#confirm-action').click()
        expect(page.locator('#stat-total')).to_have_text('3')
        page.locator('#reset-demo').click()
        page.locator('#confirm-action').click()
        expect(page.locator('#stat-total')).to_have_text('4')
        assert json.loads((DATA/'blogs.json').read_text())==[]
        passed('Original demo edit/delete/reset features remain available without altering real posts')
        page.locator('.menu-toggle').click()
        page.get_by_role('button',name='Logout',exact=True).click()
        assert page.evaluate("sessionStorage.getItem('codomax.module2.session')") is None
        passed('Logout clears the login session')
        assert not runtime_errors,runtime_errors
        assert not console_errors,console_errors
        passed('Complete successful frontend/API flow has no console or runtime errors')
        # A server-side duplicate remains visible to users as an error response.
        goto('register.html')
        page.locator('#full-name').fill('Jafeer Abdullah')
        page.locator('#email').fill(email)
        page.locator('#password').fill('Browser-password-123')
        page.locator('#confirm-password').fill('Browser-password-123')
        page.get_by_role('button',name='Register',exact=True).click()
        expect(page.locator('#register-message')).to_contain_text('already exists')
        expect(page.locator('#email-error')).to_contain_text('already registered')
        passed('Frontend displays real server errors and associates field errors with inputs')
        browser.close()

    # Run the supplied Postman collection with Postman's Newman runner.
    result=subprocess.run([r'C:\Program Files\nodejs\npm.cmd','exec','--yes','--package=newman','--','newman','run',str(BACKEND/'postman/Codomax-Module-2.postman_collection.json'),'--env-var','email=postman-'+uuid4().hex[:10]+'@example.com','--reporters','cli,json','--reporter-json-export',str(OUTPUT/'postman-results.json'),'--color','off'],cwd=OUTPUT,timeout=180,capture_output=True,text=True,encoding='utf-8',errors='replace',creationflags=getattr(subprocess,'CREATE_NO_WINDOW',0))
    (OUTPUT/'postman-summary.txt').write_text(result.stdout+'\n'+result.stderr,encoding='utf-8')
    assert result.returncode==0,(result.stdout,result.stderr)
    passed('Postman collection: all 12 requests passed using Newman')
    (OUTPUT/'module2-report.json').write_text(json.dumps({'result':'passed','checks':checks},indent=2),encoding='utf-8')
    print('All '+str(len(checks))+' frontend/Postman check groups passed.',flush=True)
finally:
    server.terminate()
    try:
        server.wait(timeout=10)
    except subprocess.TimeoutExpired:
        server.kill()
        server.wait()
    log.close()
