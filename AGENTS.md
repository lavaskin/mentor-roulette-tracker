# AGENTS.md - mentor-roulette-tracker

## Architecture

Angular 21 standalone app (Single Project Architecture). Entry: `src/main.ts`. Styles via Tailwind v4 + PrimeNG in `src/tailwind.css` + `src/styles.scss`.

- **Services**: `src/app/services/` — API clients consuming `environment.apiBaseUrl`
- **Components & views**: `src/app/components/`, `src/app/views/`
- **Configurables**: `src/app/config/` (e.g. chart.js defaults)
- **Test files alongside sources** with `.spec.ts` suffix; run all tests: `npm test`

## Commands

| Task | Command |
|---|---|
| Dev server | `npm start` |
| Build | `npm run build` |
| Tests | `npm test` (watches by default) |

**Standalone-only**: Components must declare their own `providers` in the component config — there is no NgModule layer. Use `provideCharts()` from `ng-charts/providers` to enable Chart.js components. Import PrimeNG components directly with full module paths (e.g. `primeng/inputnumber`). Standalone imports live on each component's `imports` array, not shared modules.

## Rules

- Don't commit or push things with git.
- After making any changes with Angular, make sure to build the project/run the tests to make sure it actually builds.
