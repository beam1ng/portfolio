# API Reference — v1

Base URL: `/api/v1`. All responses use the envelope:

```jsonc
{ "success": true, "data": <payload>, "error": null, "meta": <optional> }
```

Interactive docs (Development): `/scalar/v1`. OpenAPI document: `/openapi/v1.json`.

## Public read endpoints

| Method | Path                     | Description                              |
|--------|--------------------------|------------------------------------------|
| GET    | `/health`                | Liveness probe (no envelope).            |
| GET    | `/api/v1/profile`        | Portfolio owner profile/summary.         |
| GET    | `/api/v1/projects`       | List projects. `?featured=true` filters. |
| GET    | `/api/v1/projects/{slug}`| Single project by slug (detail).         |
| GET    | `/api/v1/skills`         | Skills grouped by category.              |
| GET    | `/api/v1/technologies`   | All technologies.                        |

## Notes

- Read endpoints are public. Admin CRUD (auth) arrives in Phase 4.
- `projects` returns `ProjectSummaryDto`; `{slug}` returns `ProjectDetailDto` (adds `description`, dates).
- Errors return `{ success: false, error: "<safe message>" }`; details logged server-side only.

## Example

```bash
curl http://localhost:8080/api/v1/projects?featured=true
```
