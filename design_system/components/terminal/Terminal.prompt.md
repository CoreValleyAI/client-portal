The brand's signature surface — a carbon terminal window. Use it as the hero device on marketing, empty states, or anywhere the CLI is the story.

```jsx
<Terminal
  title="np-ktm-1.corevalley.ai"
  lines={[
    { prompt: '$', text: 'corevalley deploy --gpu h200 --region np-ktm-1' },
    { out: 'provisioning 8× H200 · hydro grid · ~40ms → mumbai' },
    { comment: 'instance live in 12s' },
    { prompt: '$', text: '' },
  ]}
/>
```

Each line is `{ prompt, text }` (command), `{ out }` (output), or `{ comment }` (dimmed #). The last command line gets the blinking cursor.
