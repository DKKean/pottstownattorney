# Launch checklist (static site + optional PHP form)


## Branding


- [ ] Confirm assets/images/bauer-associates-logo.png is the final production asset (header, footer, favicon, OG on home).

- [ ] Replace any local/staging https://www.pottstownattorney.com/ references if the launch domain differs (meta canonical, og:url, og:image, JSON-LD).


## Contact form (real delivery)


- [ ] Copy form-config.example.php to **form-config.php** on the server; set a valid to address.

- [ ] **Keep form-config.php out of git** (see .gitignore); back it up securely on the host.

- [ ] Confirm PHP is enabled and form-submit.php is reachable; submit a test from contact.html.

- [ ] If mail() fails (common on Windows without SMTP), configure SMTP in php.ini or use a host that supports mail(), **or** set window.BAUER_WEB3FORMS_KEY in an inline script on contact.html before main.js for [Web3Forms](https://web3forms.com) and test again.

- [ ] Confirm success: redirect to thank-you.html with real submission received.

- [ ] Confirm validation: empty required field shows error; honeypot field left alone (no thank-you for bots).


## Apache redirects


- [ ] Set RewriteBase to match the folder where the site lives (/ at domain root, or /yoursubdir/ in a subfolder).

- [ ] curl -I each Location — **Location** must be a real URL, not a disk path.

- [ ] If the host is not Apache, port the same map in IIS/nginx or the host UI (see docs/REDIRECT-VERIFICATION.md).


## SEO / index

- [ ] **Production:** robots.txt allows crawlers; sitemap.xml uses production URLs.
- [ ] **Public staging** that should not be indexed: either password-protect it, or disallow in robots.txt and/or add noindex to pages (trading off secrecy vs. leaks).

- [ ] thank-you.html and 404.html use noindex (as shipped); do not add them to sitemap.xml.


## Content / compliance


- [ ] No public "under construction" or "replace this later" copy.

- [ ] No implementation notes on public pages (form wiring, main.js, host instructions).

- [ ] Disclaimers remain on educational pages.


## Post-launch


- [ ] Re-run python tools/check_local_links.py after any edits.

- [ ] Spot-check from a phone: nav, call links, and contact form.
