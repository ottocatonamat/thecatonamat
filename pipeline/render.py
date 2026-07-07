"""Render Markdown reports to theme-aware HTML in docs/ and rebuild the index.

docs/ is served by GitHub Pages (Settings -> Pages -> deploy from branch,
folder /docs), giving a stable phone-bookmarkable URL.

Usage:
    python pipeline/render.py            # render all reports + index
    python pipeline/render.py --date YYYY-MM-DD
"""

import argparse
import sys
from pathlib import Path

import markdown

sys.path.insert(0, str(Path(__file__).resolve().parent))
from utils import DOCS_DIR, REPORTS_DIR, setup_logging

log = setup_logging("render")

PAGE_TEMPLATE = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<style>
:root {{ color-scheme: light dark;
  --bg:#ffffff; --fg:#1a1a1a; --muted:#666; --accent:#0b5fff; --border:#e3e3e3; --code:#f5f5f5; }}
@media (prefers-color-scheme: dark) {{
  :root {{ --bg:#141414; --fg:#e8e8e8; --muted:#9a9a9a; --accent:#7aa5ff; --border:#333; --code:#222; }} }}
body {{ background:var(--bg); color:var(--fg);
  font:16px/1.65 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  max-width:46rem; margin:0 auto; padding:1.2rem; }}
h1 {{ font-size:1.5rem; line-height:1.3; }}
h2 {{ font-size:1.2rem; margin-top:2rem; border-bottom:1px solid var(--border); padding-bottom:.3rem; }}
a {{ color:var(--accent); text-decoration:none; }}
a:hover {{ text-decoration:underline; }}
blockquote {{ border-left:3px solid var(--border); margin-left:0; padding-left:1rem; color:var(--muted); }}
code, pre {{ background:var(--code); border-radius:4px; padding:.1rem .3rem; }}
nav {{ font-size:.9rem; color:var(--muted); margin-bottom:1.5rem; }}
ol.index li {{ margin:.4rem 0; }}
footer {{ margin-top:3rem; font-size:.8rem; color:var(--muted); border-top:1px solid var(--border); padding-top:1rem; }}
</style>
</head>
<body>
<nav><a href="index.html">← All briefs</a></nav>
{body}
<footer>AI in Finance daily brief — automated pipeline. Verify time-sensitive claims against primary sources.</footer>
</body>
</html>
"""

INDEX_BODY = """<h1>AI in Finance — Daily Briefs</h1>
<p>Automated daily intelligence on artificial intelligence across asset management
and global finance. Newest first.</p>
<ol class="index" reversed>
{links}
</ol>
"""


def render_report(md_path: Path) -> Path:
    html_body = markdown.markdown(md_path.read_text(),
                                  extensions=["extra", "sane_lists"])
    out = DOCS_DIR / f"{md_path.stem}.html"
    out.write_text(PAGE_TEMPLATE.format(
        title=f"AI in Finance — {md_path.stem}", body=html_body))
    return out


def rebuild_index() -> None:
    reports = sorted(REPORTS_DIR.glob("*.md"), reverse=True)
    links = "\n".join(
        f'<li><a href="{p.stem}.html">{p.stem}</a></li>' for p in reports)
    body = INDEX_BODY.format(links=links or "<li>No briefs yet.</li>")
    (DOCS_DIR / "index.html").write_text(PAGE_TEMPLATE.format(
        title="AI in Finance — Daily Briefs", body=body))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--date", default=None)
    args = parser.parse_args()

    DOCS_DIR.mkdir(parents=True, exist_ok=True)
    targets = ([REPORTS_DIR / f"{args.date}.md"] if args.date
               else sorted(REPORTS_DIR.glob("*.md")))
    for md_path in targets:
        if md_path.exists():
            log.info("rendered %s", render_report(md_path).name)
        else:
            log.warning("missing report %s", md_path)
    rebuild_index()
    log.info("index rebuilt (%d briefs)", len(list(REPORTS_DIR.glob('*.md'))))


if __name__ == "__main__":
    main()
