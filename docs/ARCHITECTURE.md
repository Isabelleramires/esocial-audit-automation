# Technical architecture and design choices

This repository contains a **new, simplified implementation for a public portfolio**, not code extracted from a proprietary system. All examples are deliberately synthetic.

## Data flow

1. `ENTRADA ASO` stores fictional ASO records. Demo entries are automatically generated on first setup.
2. `Logica.gs` normalizes exam and job labels, validates sample types, determines illustrative event categories, and handles date periods.
3. `Auditoria.gs` generates audit rows and prevents duplicates using **period + sample ID + event**.
4. `RETORNOS SIMULADOS` acts as a locally editable response dataset, replacing any need for external APIs.
5. `Retornos.gs` reconciles responses with audit rows through the fictional record ID and event type.
6. `BASE GERAL` assembles one row per **audit event**, and `DASHBOARD` calculates event-level indicators.
7. `Menu.gs` exposes custom Google Sheets actions; the optional CSV export stores synthetic results on the user's Google Drive.

## Event routing: demonstration logic

- **Admissional:** creates sample S-2220 and S-2240 records, both placed in the combined audit tab.
- **Other supported exam types:** create an S-2220 record.
- **Illustrative motorist job:** also creates an S-2221 record in its own tab.

These are intentionally simplified examples. They are **not official eSocial eligibility rules**, do not reproduce a vendor's matching algorithm, and are not suitable for real auditing.

## Data safety and consistency

- No network requests, API keys, service IDs, customer URLs or actual personal data.
- A simulated response with no usable status does not delete existing entries.
- A confirmed demo receipt cannot be downgraded by a later pending or rejected response.
- Notes are never overwritten by the reconciliation function.
- The demonstration rejects unsupported exam types instead of inventing a classification.
- CSV fields beginning with spreadsheet formula prefixes are escaped.

## Limitations

- Record matching is by a **synthetic ID + event**, not an official event identifier.
- The combined tab stores separate event rows (rather than paired event columns).
- Weekly and monthly periods are based on the current local date, not historical user-selected periods.
- The consolidated base rebuilds from all current audit rows; it is not a one-row-per-company reporting store.
- No authentication, external web-service integration, live validation, triggers, alerting or production error recovery.
- Google Sheets UI automation has not been end-to-end validated in a connected Google account; Node.js tests cover pure logic and a mocked, offline end-to-end workflow; live Google Sheets authorization and UI still require manual validation.
