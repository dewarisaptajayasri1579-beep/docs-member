# Interactive Documentation Hub

## Purpose

The Documentation Hub is an interactive website for the Central Membership & SSO Hub. Markdown remains the source of truth; the website serves as a visual layer, navigation, search, and version history.

## Target audience and mode

| Mode | Target | Content Form |
|---|---|---|
| **Simple** | General public, stakeholders, and programmers who want a summary | Simple language, cards, timelines, flowcharts, and explanations of "why". |
| **Detail** | Programmers, QA, and operators | API, database, OAuth2, queue, payload, environment variable, and test scenarios. |

Toggle mode is available in the header and applies throughout the website. The Simple mode replaces jargon with easy-to-understand explanations without hiding important facts; the Detail mode displays complete technical contracts.

## Information Structure

```text
/docs
├── Start here: overview, user journey, glossary
├── How the system works: registration, licenses, payments, SSO
├── Visual dashboard: system map, license lifecycle, change history
├── For developers: API, database, architecture, setup, testing
└── References: all documents and changelog
```

## Interactive Experience

| Feature | Value for readers |
|---|---|
| Clickable system map | Explains the roles of Next.js, NestJS, PostgreSQL, Redis/BullMQ, Midtrans, and Xendit. |
| Flow simulator | Visualizes registration → verification → activation → SSO or checkout → webhook → active license. |
| License lifecycle | Displays `active → grace_period → suspended → renewed` as a state machine. |
| API explorer | Filters endpoints by feature; Simple explains usage, Detail displays request/response/auth. |
| Database explorer | ERD can be clicked to see tables, relationships, and column meanings. |
| Glossary tooltip | Explains JWT, webhook, Redis, and BullMQ in context. |
| Global search | Finds topics across documents, APIs, tables, and test scenarios. |
| Reading progress | Marks pages that have been read. |

Diagrams use SVG/React or local assets to remain functional offline; they do not depend on external diagram services at runtime.

## Offline-first PWA

- The website is built with Next.js and can be installed as a PWA.
- Markdown/MDX content, diagrams, search index, and UI assets are bundled during build.
- The service worker saves pages and assets after the first visit.
- The offline mode displays an indicator and the date/version of active content.
- Initial implementation is in the `/docs` route on the frontend to match the application design.

## Document Versioning

The website has a version selector: **Latest**, `v1.0`, `v1.1`, `v1.2`, and so on. Older versions remain accessible; each page displays the active version, update date, change history link, and option to compare two versions.

| Artifact | Role |
|---|---|
| Active docs folder | Latest content. |
| `versions/vX.Y/` | Snapshot of all docs displayed by the website. |
| `11-changelog/changelog.md` | Human-readable summary of each release. |
| `11-changelog/changelog-guidelines.md` | Rules for determining versions/changes. |
| Git tag `docs-vX.Y` | Official source snapshot marker. |

The Simple mode explains the impact of changes for users; the Detail mode explains API, database, and operational impacts.

## Implementation Stages

1. Create the `/docs` route, layout, sidebar, search, theme, and toggle Simple/Detail.
2. Create visual overview, user journey, payment, and architecture pages.
3. Add API/database/testing explorers from Markdown content.
4. Add offline PWA, version selector, changelog, and version comparison.

## Definition of Done

- General public understands the Hub's purpose and main flow without technical jargon.
- Programmers access detailed API, database, architecture, and testing information from the same portal.
- Main pages/diagrams can be opened after offline cache is available.
- Readers can choose the document version and read the changelog of changes.
- Visual content can be traced back to the source Markdown.