# Prime Horizon Group Plc — Website

A complete, dependency-free website for **Prime Horizon Group Plc** (Addis Ababa, Ethiopia), built from the company's business proposal / software requirements specification: a **public website** plus a **role-aware management portal demo**.

Zero build step. No npm packages. Open `index.html` in any modern browser.

## Structure

```text
website/
├── index.html        Home — hero, stats, services, process, CTA
├── about.html        Story, mission/vision/values, governance, roadmap
├── services.html     Transport + Technical Services divisions
├── fleet.html        Vehicle categories, operating standards, booking
├── projects.html     Case studies + delivery disciplines
├── careers.html      Open roles, application process, suppliers
├── contact.html      Validated inquiry form
├── privacy.html      Privacy policy
├── terms.html        Terms of use
├── portal.html       Management portal (login + app shell)
├── css/
│   ├── style.css     Public-site design system
│   └── portal.css    Portal design system
└── js/
    ├── shell.js      Shared chrome injected into inner pages
    ├── main.js       Nav, reveals, counters, FAQ accordion
    ├── contact.js    Inquiry form validation + demo storage
    ├── data.js       Portal demo datasets (14 founders, 17 shares…)
    └── portal.js     Role-aware SPA: views, charts, approvals, audit
```

## Management portal demo

Open `portal.html`. Click any demo chip (password is pre-filled: `demo1234`).

| Account | Role | Visible modules |
|---|---|---|
| `gm@primehorizon.et` | General Manager | Everything |
| `finance@primehorizon.et` | Finance Officer | Governance, finance, reporting |
| `transport@primehorizon.et` | Transport Manager | Fleet, drivers, trips, maintenance |
| `projects@primehorizon.et` | Project Manager | Leads, projects, tasks |
| `admin@primehorizon.et` | Administrator | Accounts, documents, audit |
| `yonas@primehorizon.et` | Shareholder | Read-only register, capital, reports |

Try: sign in as Finance → **Capital Contributions** → approve a pending contribution with the confirmation modal — paid-in capital, dashboard totals and the audit log all update.

## Key facts reflected in the site

- 14 founding shareholders · 17 shares · ETB 250,000 per share → ETB 4,250,000 planning capital
- Ownership % = shares ÷ total issued × 100 (computed live in the register)
- Two divisions: Transport & Logistics · Technical Services
- All capital figures are marked as planning assumptions pending formal approval, per the proposal.

## Important notes

- **Demo data** (`js/data.js`) is illustrative only — it must never be treated as business truth.
- The proposal's production architecture is React + TypeScript + Django REST + PostgreSQL. This static build mirrors the spec's screens, roles, workflows and design direction so it can be used for review, content sign-off and UI handover.
- In production, every permission check, ownership calculation and approval must be enforced by the backend API, not the browser.
- Before publishing, replace placeholder contact details (`+251 911 000 000`, `info@primehorizon.et`), wire the inquiry form to the backend, and have capital figures, terms and policies reviewed by qualified local professionals.
