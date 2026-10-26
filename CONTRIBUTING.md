# Contributing

Contributions are welcome, especially new high-specificity stack signals, regression fixtures from real false positives, additional clean-room starter patterns, and accessibility checks.

## Development setup

```bash
npm install
npm test
```

To exercise the browser inspector:

```bash
npx playwright install chromium
node scripts/inspect-site.mjs https://example.com --out /tmp/site-recon.json
```

## Detector changes

Every new signal should:

- identify a library or framework more specifically than ordinary prose would;
- name the evidence source in the report;
- include a positive test;
- include a realistic near-miss when the signal could collide with another framework or an English word.

## Pull requests

Keep changes focused and explain which public evidence supports a new detector. Do not add copied third-party application source, private data, credentials, or proprietary assets.
