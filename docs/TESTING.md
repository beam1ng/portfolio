# Testing

This project has three useful test layers:

- Backend unit tests for application rules that do not need HTTP, EF Core, or a database.
- Backend API integration tests for route behavior, auth boundaries, response envelopes, and validation wiring.
- Frontend tests for rendering and pure TypeScript helpers.

## Commands

Run everything:

```bash
dotnet test backend/Portfolio.slnx
pnpm -r test
```

Run backend tests only:

```bash
dotnet test backend/Portfolio.slnx
```

Run frontend tests only:

```bash
pnpm -r test
```

## Backend Baseline

The placeholder xUnit files have been replaced with focused coverage for:

- `UpsertProjectRequestValidator`, including slug rules, date ranges, and gallery image requirements.
- Project write mappings, especially technology diffing and gallery ordering.
- Public project API reads, including featured filtering and not-found envelopes.
- Admin project API behavior, including anonymous rejection, validation failures, slug conflicts, and successful creation.
- `UpsertTestimonialRequestValidator` rules (required author/quote, max lengths, non-negative sort order).
- Résumé and recommendation APIs — public ordering plus admin auth boundary, validation failures, not-found, and delete flows for experience, education, and testimonials.

Integration tests run against `WebApplicationFactory<Program>` with database setup skipped via `SkipDatabaseSetup=true`. Repository dependencies are replaced with small in-memory fakes so endpoint behavior stays fast and deterministic.

## Next Testing Targets

- Add repository tests against a relational provider for EF configuration, sorting, cascade behavior, and slug uniqueness.
- Add auth endpoint tests around login, logout, `/auth/me`, and cookie attributes.
- Add static export tests around `scripts/export-content.mjs` and `content.json` shape.
- Add frontend tests for static-mode routing and the absence of admin routes in `build:static`.

## Next UX/UI Review Phase

The next phase should be an extensive visual and content audit:

- Check consistency across spacing, typography, color tokens, cards, buttons, forms, and admin/public layouts.
- Inspect responsive behavior on mobile, tablet, and desktop.
- Review content depth: project case studies, gallery captions, technology usage notes, profile narrative, skills grouping, and contact pathways.
- Identify missing content types, such as certifications, downloadable resume metadata, project outcomes, and richer case-study sections. (Experience, education, and testimonials are now implemented.)
