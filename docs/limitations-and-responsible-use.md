# Limitations and responsible use

Site Recon observes what a normal browser receives. It cannot reliably determine private backend code, unpublished source, design files, inactive dependencies or the intent behind every implementation choice.

## Public sites

- Do not bypass authentication, paywalls, browser warnings, bot protection or rate limits.
- Do not probe private endpoints or submit forms during inspection.
- Treat minified bundles and exact CSS as evidence, not as permission to republish them.
- Do not fetch third-party source maps merely because a reference is public.
- Replace brand names, writing, logos, illustrations, photography, custom fonts and distinctive complete compositions.
- Prefer original source that reproduces a technique rather than copied production code.

## User-owned or permissively licensed sites

Direct reuse may be appropriate when the user owns the source or its license permits reuse. Check the license, retain required notices, and distinguish deployed code from experiments or unused dependencies.

## Claims

Avoid claims the evidence cannot support. A frontend framework does not reveal the backend language. A dependency signature does not prove that a feature is active. A compiled bundle does not reveal the original directory structure.
