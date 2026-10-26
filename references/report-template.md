# Report template

Use this structure unless the user asks for another format.

```markdown
# Site Recon: [site]

## Executive summary
- What the site appears to use
- What makes the experience distinctive
- Biggest implementation and performance considerations

## Confidence legend
Verified / Strongly inferred / Possible / Unknown

## Stack and delivery
| Finding | Confidence | Evidence | Notes |

## Visual system
Typography, color, spacing, layout, breakpoints, imagery, and reusable motifs.

## Page architecture
A compact tree of pages, sections, overlays, and reusable components.

## Animation inventory
| Effect | Location | Trigger | Motion and timing | Mechanism | Confidence |

## Detailed motion recipes
One subsection per important effect, following the seven-part recipe in SKILL.md.

## Responsive and accessibility behavior
Mobile changes, focus/keyboard behavior, reduced motion, contrast, and semantic observations.

## Performance notes
Continuous loops, WebGL/canvas cost, filters, media weight, layout thrashing risks, and likely optimizations.

## Clean-room implementation plan
Component map, recommended stack, build order, and original code patterns.

## Unknowns and limitations
What cannot be determined from the public browser surface.

## Evidence appendix
Relevant URLs, asset names, selectors, headers, and source paths. Do not paste large minified bundles.
```

