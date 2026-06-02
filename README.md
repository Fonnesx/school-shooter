# Squad FPS Prototype

Minimal browser-based first-person prototype using Three.js. Player leads a small squad to eliminate enemies.


Controls
- Click to lock pointer and play
- WASD to move, mouse to look
- Left mouse to shoot, `R` to reload

Run locally (recommended - uses Vite dev server):

```bash
npm install
npm run dev
# then open the URL printed by Vite (usually http://localhost:5173)
```

Or quickly serve static files (no bundling):

```bash
python3 -m http.server 8000
# then open http://localhost:8000 in your browser
```

Files added:
- [index.html](index.html)
- [style.css](style.css)
- [src/main.js](src/main.js)
- [src/ai.js](src/ai.js)
