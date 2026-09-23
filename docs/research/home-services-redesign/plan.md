# Home Services Redesign — Research Plan

Date: 2026-09-22
Genre: design decision / validation

## Decision

Redesign the DN Tech homepage services section so visitors can quickly understand which engagement fits their problem, while removing the repetitive SaaS-card aesthetic that makes the section feel generated.

## Scope

- Homepage services section only.
- Preserve API-driven service names, descriptions, and links.
- Preserve the existing DN Tech color tokens and overall page architecture.
- No new client-side JavaScript or image dependency.

## Working assumptions

- Primary device/network: mobile 4G, with desktop as the secondary review context.
- Rendering: SEO-dependent public Next.js page; server component remains the default.
- Accessibility: WCAG 2.2 AA; DN Tech owns remediation.
- Targets: LCP <= 2.0 s, INP <= 200 ms, CLS <= 0.1 at p75; no additional route JavaScript; Lighthouse performance >= 90 and accessibility >= 95.

## Falsifiable hypotheses

1. Equal-sized, visually identical cards reduce differentiation between services and force visitors to read every card before deciding where to click.
2. Outcome-oriented framing and short decision cues make the service set easier to scan than generic service descriptions alone.
3. A restrained editorial composition—clear hierarchy, asymmetrical grid, borders, and whitespace—can create a distinctive brand expression without decorative gradients, glass effects, or generic icons.

## Sourcing strategy

- UX research on scanning, information scent, and link labels.
- Mature public design-system guidance on cards, links, hierarchy, focus, and target size.
- Accessibility standards for focus visibility and target sizing.
- Existing DN Tech content, components, and tests as the primary implementation evidence.

## Opposition queries

- When do cards improve rather than harm scanning?
- Is asymmetry likely to reduce comprehension or responsive reliability?
- Can a text-first section still communicate enough visual identity?

## Risks

- API descriptions can be long or generic.
- Dynamic service order can make hard-coded semantic labels misleading.
- A visually ambitious layout can collapse poorly on mobile.
- Styling changes can weaken focus visibility or link semantics.

## Stop criteria

Stop research once three independent source types support the core hierarchy/scanning decision, counter-evidence has been considered, and the implementation can be validated with existing tests plus a production build.

