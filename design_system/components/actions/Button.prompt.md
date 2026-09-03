Primary action control — use for the single most important action in a view; reserve `variant="primary"` (Hydro green) for it and keep everything else secondary or ghost.

```jsx
<Button variant="primary" onClick={deploy}>Deploy instance</Button>
<Button variant="secondary" size="sm">Cancel</Button>
<Button variant="ghost" mono iconLeft={<Icon name="terminal" />}>Open CLI</Button>
```

Variants: `primary` (Hydro, one per view), `secondary` (Carbon surface), `ghost` (text-only), `danger`. Sizes `sm | md | lg`. Set `mono` for CLI-flavored actions; `fullWidth` to fill its container.
