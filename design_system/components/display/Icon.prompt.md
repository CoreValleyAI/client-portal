Thin line icon from a curated Lucide subset — use inside buttons, nav, status rows; color it via `color` (Ink default, Hydro for active).

```jsx
<Icon name="terminal" size={16} />
<Icon name="zap" color="var(--hydro)" />
```

`name` must be one of the bundled set (see `ICON_NAMES`). Keep `strokeWidth` at 2 to match the mono type. Not for the logo or the ridgeline — those are separate assets.
