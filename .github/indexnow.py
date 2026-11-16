"""Submit new or changed URLs to IndexNow (Bing and partners). No visitor data involved."""
import json, os, re, subprocess, sys, time, urllib.request

KEY = "29244266656d76ca373e7b2ca7cf6c9e"
ENDPOINT = "https://api.indexnow.org/indexnow"
EVENT = os.environ.get("EVENT", "")
STATE = ".github/indexnow-state/marlastone.txt"


def submit(host, urls):
    if not urls:
        print(host, "nothing to submit")
        return True
    body = json.dumps({"host": host, "key": KEY, "keyLocation": f"https://{host}/{KEY}.txt", "urlList": urls}).encode()
    req = urllib.request.Request(ENDPOINT, data=body, headers={"Content-Type": "application/json; charset=utf-8"})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            print(host, "submitted", len(urls), "status", r.status)
            return r.status in (200, 202)
    except Exception as e:  # 403 = key file not reachable yet, 422 = host mismatch
        print(host, "submit failed:", e)
        return False


def garden():
    """Pages changed in the latest push to marlagarden.co.uk."""
    try:
        out = subprocess.run(["git", "diff", "--name-only", "HEAD~1", "HEAD"], capture_output=True, text=True, check=True).stdout
    except Exception as e:
        print("garden: no diff available:", e)
        return
    urls = []
    for f in out.splitlines():
        if not f.endswith(".html") or f.startswith(".") or f in ("404.html",) or f.startswith("google"):
            continue
        path = re.sub(r"index\.html$", "", f)
        urls.append("https://marlagarden.co.uk/" + path)
    if urls:
        time.sleep(150)  # let GitHub Pages finish deploying before search engines fetch
    submit("marlagarden.co.uk", urls[:500])


def stone():
    """New URLs in the marlastone.co.uk sitemap since the last run."""
    try:
        req = urllib.request.Request("https://www.marlastone.co.uk/sitemap.xml", headers={"User-Agent": "Mozilla/5.0 (IndexNow sync)"})
        xml = urllib.request.urlopen(req, timeout=60).read().decode("utf-8", "replace")
    except Exception as e:
        print("stone: sitemap fetch failed:", e)
        return
    urls = sorted(set(re.findall(r"<loc>\s*([^<\s]+)\s*</loc>", xml)))
    if len(urls) < 50:
        print("stone: sitemap looks incomplete, skipping", len(urls))
        return
    if not os.path.exists(STATE):
        os.makedirs(os.path.dirname(STATE), exist_ok=True)
        open(STATE, "w").write("\n".join(urls) + "\n")
        print("stone: baseline saved", len(urls))
        return
    known = set(open(STATE).read().split())
    new = [u for u in urls if u not in known]
    if not new:
        print("stone: no new URLs")
        return
    if submit("www.marlastone.co.uk", new[:500]):
        open(STATE, "w").write("\n".join(sorted(known | set(new))) + "\n")


if EVENT == "push":
    garden()
stone()
