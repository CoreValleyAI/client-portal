Mono tab row with a Hydro underline on the active tab — section nav inside a view.

```jsx
<Tabs
  defaultValue="instances"
  tabs={[
    { id: 'instances', label: 'instances', badge: 8 },
    { id: 'storage', label: 'storage' },
    { id: 'billing', label: 'billing' },
  ]}
  onChange={setTab}
/>
```

Controlled via `value` or uncontrolled via `defaultValue`. Optional `badge` count per tab.
