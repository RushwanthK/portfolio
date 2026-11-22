# Rushwanth K — Portfolio

A fast, static portfolio site. All text lives in `content.yaml`; a small Python script renders it into plain HTML/CSS/JS in `dist/`, which can be hosted anywhere (GitHub Pages, Vercel, Netlify).

## Run locally

```powershell
.\.venv\Scripts\python.exe build.py --serve
```

Open http://localhost:8000. Edits to `content.yaml`, `templates/` or `static/` rebuild automatically; refresh the browser to see them.

First-time setup on a new machine:

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

## Structure

| Path | What it is |
|---|---|
| `content.yaml` | All copy: bio, projects, experience, skills, links |
| `templates/index.html.j2` | Page markup (Jinja2) |
| `static/css/style.css` | Design tokens, layout, animations |
| `static/js/main.js` | Scroll reveals, rotating headline, spotlight/magnetic effects |
| `static/assets/` | Favicon and resume PDF |
| `build.py` | Builds `dist/`; `--serve` adds a live-rebuild dev server |

## Deploy

Hosted on **Vercel**. `vercel.json` tells Vercel to install `requirements.txt`, run `build.py` and serve `dist/`, so every push to `main` redeploys automatically.

For any other static host, run `python build.py` and publish the `dist/` folder.
