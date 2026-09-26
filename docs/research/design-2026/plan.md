# DN Tech Design Research Plan

Generated: 2026-09-26  
Scope: public website `dntech.id` and the existing `dntech/frontend` implementation.  
Genre: decision brief / design direction.

## Decision to support

What information architecture, visual system, and interaction priorities should DN Tech adopt so the site feels credible, distinctly human, and easier for a serious Indonesian business buyer to choose—without discarding the working Next.js/CMS foundation?

## Hypotheses

1. DN Tech's highest-leverage design move is not a visual rebrand; it is a clearer split between **custom engineering**, **first-party products**, and **proof/resources**, each tied to a buying job.
2. Concrete disclosure (scope, starting price, timeline, ownership, support, and who works on the project) will create more trust than trend-driven motion or decorative AI imagery.
3. A restrained, editorial visual language using real product/work artifacts and founder/team presence will feel more human than generic gradients, stock photography, or “AI SaaS” effects.
4. The redesign can be delivered incrementally inside the current architecture if shared primitives, content models, and conversion instrumentation are treated as first-class design work.

## Scope

Included: homepage, header/navigation, services, products, case studies/portfolio, about/team, blog/resources, contact/quiz entry points, accessibility, performance, measurement, and the design-to-code handoff.

Excluded: full brand identity redesign, logo creation, backend rewrite, and claims about market size or conversion lift that are not supported by live data.

## Sourcing strategy

- Primary product evidence: current live `dntech.id`, local source, local SEO/content audits, design tokens, route structure, data model, and automated test/bundle outputs.
- Independent UX evidence: Nielsen Norman Group and Baymard for B2B trust, navigation, disclosure, product evaluation, and case-study usefulness.
- Standards/technical evidence: W3C WCAG 2.2, web.dev Core Web Vitals, Google Search Central, GOV.UK Design System.
- Opposition queries: “modern agency website trends”, “dark/animated landing page conversion”, “AI-generated hero imagery”, and “more navigation/feature pages = more trust”. These are treated as risks to test, not assumptions.

## Risk register

| Risk | Why it matters | Mitigation |
|---|---|---|
| Internal assumptions are mistaken for market facts | Existing segment scores are hypotheses | Label them as hypotheses; validate with qualified leads, Search Console, and interviews |
| Visual polish hides weak proof | A beautiful site can still feel like an agency template | Require every major claim to have a linked artifact, person, metric, or process detail |
| Too many CTA paths | Product, service, quiz, chat, blog, and contact can compete | Define one primary CTA per audience/job; secondary paths stay contextual |
| AI-slop perception | Generic gradients, abstract blobs, and inflated claims reduce distinctiveness | Use real screenshots, annotated workflow artifacts, local language, named people, and specific constraints |
| Accessibility/performance regressions | Visual changes can damage usability and SEO | Gate with WCAG AA checks, Core Web Vitals, Lighthouse, keyboard tests, and reduced-motion behavior |

## Stop criteria

Stop visual exploration and return to evidence if a proposal:

- cannot explain which buyer job it improves;
- relies on a claim with no proof in the repo or product;
- adds motion or interaction without a measurable usability benefit;
- requires a new backend/content model when an existing route/model can support the same job;
- cannot meet the agreed accessibility and performance budgets.

