# API Reference — v1

Base URL: `/api/v1`. All responses use the envelope:

```jsonc
{ "success": true, "data": <payload>, "error": null, "meta": <optional> }
```

Interactive docs (Development): `/scalar/v1`. OpenAPI document: `/openapi/v1.json`.

## Public read endpoints

| Method | Path                      | Description                              |
|--------|---------------------------|------------------------------------------|
| GET    | `/health`                 | Liveness probe (no envelope).            |
| GET    | `/api/v1/profile`         | Portfolio owner profile.                 |
| GET    | `/api/v1/projects`        | List projects. `?featured=true` filters. |
| GET    | `/api/v1/projects/{slug}` | Single project by slug (detail).         |
| GET    | `/api/v1/technologies`    | All technologies.                        |
| GET    | `/api/v1/experience`      | Work-history timeline.                   |
| GET    | `/api/v1/education`       | Education & certifications.              |
| GET    | `/api/v1/testimonials`    | Recommendations / testimonials.          |

## Auth

| Method | Path                  | Description                          |
|--------|-----------------------|--------------------------------------|
| POST   | `/api/v1/auth/login`  | Sets an httpOnly JWT cookie.         |
| POST   | `/api/v1/auth/logout` | Clears the cookie.                   |
| GET    | `/api/v1/auth/me`     | Current admin (401 when logged out). |

## Admin endpoints (cookie auth required)

CRUD lives under `/api/v1/admin`; every `/admin/*` route requires the auth cookie.

| Resource     | List / Create               | Update / Delete                |
|--------------|-----------------------------|--------------------------------|
| Projects     | GET·POST `/admin/projects`  | PUT·DELETE `/admin/projects/{id}`     |
| Technologies | GET·POST `/admin/technologies` | PUT·DELETE `/admin/technologies/{id}` |
| Experience   | GET·POST `/admin/experience` | PUT·DELETE `/admin/experience/{id}`  |
| Education    | GET·POST `/admin/education` | PUT·DELETE `/admin/education/{id}`    |
| Testimonials | GET·POST `/admin/testimonials` | PUT·DELETE `/admin/testimonials/{id}` |
| Profile      | PUT `/admin/profile`        | — (read is the public `/profile`) |
| Uploads      | POST `/admin/uploads/images`, `/admin/uploads/documents` | — |

## Notes

- Read endpoints are public; all `/admin/*` endpoints return `401` without the auth cookie.
- `projects` returns `ProjectSummaryDto`; `{slug}` returns `ProjectDetailDto` (adds `description`, dates, gallery).
- Write requests are validated (FluentValidation); failures return `400` with a safe message.
- Errors return `{ success: false, error: "<safe message>" }`; details are logged server-side only.
- The static (no-API) build serves the same data shape from a bundled `content.json` — regenerate it with `pnpm export:content` (see `scripts/export-content.mjs`).

## Example

```bash
curl http://localhost:8080/api/v1/testimonials
```
