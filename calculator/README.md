# Calculator

A modern, keyboard-friendly calculator with history and theme toggle. Runs entirely in your browser.

## Run
- Open `index.html` directly in your browser, or
- Serve the folder and open at `http://localhost:PORT`.

On Linux/macOS you can serve quickly from this folder:

```bash
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.

## Keyboard shortcuts
- Digits: `0-9`
- Operators: `+ - * /`
- Decimal: `.`
- Evaluate: `Enter` or `=`
- Backspace: `Backspace`
- Clear: `Esc` or `C`
- Percent: `%`
- Parentheses: `(` and `)`

## Notes
- Percent is treated as immediate percent (e.g., `50%` becomes `0.5`).
- History is persisted in `localStorage`.
- Click a history item to reuse its result.