# Supabase Migration and Seed Safe Push Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Safely reconcile local Supabase migrations with the remote project, then apply required seed data with verification and rollback checkpoints.

**Architecture:** Treat schema migrations and seed data as separate phases. First verify remote migration history and fix local migration naming/history issues without destructive operations. Then execute seed SQL only after backup and table-count snapshots, using idempotent scripts where possible.

**Tech Stack:** Supabase CLI, PostgreSQL SQL, PowerShell, Next.js project scripts, Git.

---

## Current Findings

**Project root:** `d:\Project\seekdrn`

**Linked Supabase project ref:** `jbavapzrbjdsaprwswid`

**Relevant files:**
- Migrations: `d:\Project\seekdrn\supabase\migrations`
- Seed SQL: `d:\Project\seekdrn\supabase\seed`
- Seed runner: `d:\Project\seekdrn\supabase\seed\execute_seed.sql`
- Temporary seed copy: `d:\Project\seekdrn\scripts\temp-seed.sql`

**Observed risk from `npx supabase migration list`:**

```text
Skipping migration 003a_product_enhancements.sql... (file name must match pattern "<timestamp>_name.sql")

Local | Remote | Time (UTC)
001   | 001    | 001
001   |        | 001
002   | 002    | 002
002   |        | 002
003   | 003    | 003
003   |        | 003
004   | 004    | 004
005   | 005    | 005
006   | 006    | 006
007   | 007    | 007
008   | 008    | 008
009   | 009    | 009
010   | 010    | 010
011   | 011    | 011
012   | 012    | 012
```

**Interpretation:**
- Some local migrations use duplicate short versions: `001`, `002`, `003`.
- Some same-number local migrations appear not applied remotely.
- `003a_product_enhancements.sql` is not recognized by Supabase CLI and will never be pushed as-is.
- Seed files are tracked locally, but seed data is not automatically applied to remote Supabase.

---

## Safety Rules

- Do not run destructive Git commands.
- Do not run `supabase db reset` against remote.
- Do not run seed files before taking a database backup or table-count snapshot.
- Do not rename an already-applied migration version without checking remote history.
- Prefer creating one new forward migration over rewriting historical migrations.
- Keep schema migration push separate from seed execution.
- Execute all commands from `d:\Project\seekdrn` unless explicitly stated otherwise.

---

### Task 1: Confirm Local Git and Supabase State

**Files:**
- Read-only: `d:\Project\seekdrn\supabase\migrations`
- Read-only: `d:\Project\seekdrn\supabase\seed`
- Read-only: `d:\Project\seekdrn\scripts\temp-seed.sql`

- [ ] **Step 1: Check Git status for Supabase-related files**

Run:

```powershell
git status --short supabase scripts/temp-seed.sql
```

Expected:

```text
?? scripts/temp-seed.sql
```

If any `supabase/migrations/*.sql` or `supabase/seed/*.sql` files appear as modified or untracked, stop and inspect them before continuing.

- [ ] **Step 2: List tracked Supabase files**

Run:

```powershell
git ls-files supabase/migrations supabase/seed scripts/temp-seed.sql
```

Expected:

```text
supabase/migrations/001_add_faqs.sql
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_add_site_content.sql
supabase/migrations/002_rls_policies.sql
supabase/migrations/003_email_logs.sql
supabase/migrations/003_extend_site_settings.sql
supabase/migrations/003a_product_enhancements.sql
supabase/migrations/004_product_videos.sql
supabase/migrations/005_product_categories.sql
supabase/migrations/006_product_tags.sql
supabase/migrations/007_product_extensions.sql
supabase/migrations/008_product_seo.sql
supabase/migrations/009_product_faqs.sql
supabase/migrations/010_product_documents.sql
supabase/migrations/011_product_relations.sql
supabase/migrations/012_product_standardized_specs.sql
supabase/seed/email_templates.sql
supabase/seed/execute_seed.sql
supabase/seed/footer_content.sql
supabase/seed/import_products.py
supabase/seed/mock_case_studies.sql
supabase/seed/mock_products.sql
supabase/seed/mock_static_content.sql
supabase/seed/navigation.sql
supabase/seed/products.sql
supabase/seed/site_settings.sql
supabase/seed/solutions.sql
```

- [ ] **Step 3: Confirm remote migration list**

Run:

```powershell
npx supabase migration list
```

Expected: CLI connects to remote and prints local/remote migration table. Save the output in the task notes before proceeding.

---

### Task 2: Remove or Ignore the Temporary Seed Copy

**Files:**
- Review: `d:\Project\seekdrn\scripts\temp-seed.sql`
- Compare with: `d:\Project\seekdrn\supabase\seed\mock_static_content.sql`

- [ ] **Step 1: Confirm temporary seed matches tracked seed file**

Run:

```powershell
git diff --no-index --stat "supabase/seed/mock_static_content.sql" "scripts/temp-seed.sql"
```

Expected: no stat output, meaning the files are equivalent. Warnings about LF/CRLF are acceptable.

- [ ] **Step 2: Delete temporary copy if it is identical**

Use the IDE file delete tool or run only after confirming no diff:

```powershell
Remove-Item "d:\Project\seekdrn\scripts\temp-seed.sql"
```

Expected: `scripts/temp-seed.sql` disappears from `git status --short`.

- [ ] **Step 3: Re-check status**

Run:

```powershell
git status --short supabase scripts/temp-seed.sql
```

Expected: no output for `scripts/temp-seed.sql`; no modified Supabase files.

---

### Task 3: Fix the Skipped `003a` Migration Safely

**Files:**
- Source: `d:\Project\seekdrn\supabase\migrations\003a_product_enhancements.sql`
- Create if needed: `d:\Project\seekdrn\supabase\migrations\013_product_enhancements.sql`

- [ ] **Step 1: Confirm `003a` has not been applied remotely by CLI**

Run:

```powershell
npx supabase migration list
```

Expected:

```text
Skipping migration 003a_product_enhancements.sql... (file name must match pattern "<timestamp>_name.sql")
```

This means the file is ignored by Supabase CLI. Do not rely on it being pushed.

- [ ] **Step 2: Create a new forward migration using the same content**

Create:

```text
d:\Project\seekdrn\supabase\migrations\013_product_enhancements.sql
```

Content should be copied from:

```text
d:\Project\seekdrn\supabase\migrations\003a_product_enhancements.sql
```

Keep the SQL idempotent. The existing file already uses safe patterns for major objects:

```sql
ALTER TABLE products ADD COLUMN IF NOT EXISTS spec_groups jsonb DEFAULT '[]';
ALTER TABLE product_specs ADD COLUMN IF NOT EXISTS group_id text;
ALTER TABLE product_specs ADD COLUMN IF NOT EXISTS unit jsonb DEFAULT '{}';

CREATE TABLE IF NOT EXISTS product_downloads (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  type        text NOT NULL CHECK (type IN ('manual', 'datasheet', 'certificate', 'media')),
  title       jsonb NOT NULL DEFAULT '{}',
  description jsonb DEFAULT '{}',
  file_url    text NOT NULL,
  file_size   int,
  file_type   text,
  language    text,
  sort_order  int NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
```

- [ ] **Step 3: Do not delete `003a` yet**

Leave `003a_product_enhancements.sql` in place until the team confirms whether historical references depend on it. It is ignored by CLI, so keeping it temporarily is safer than deleting it during the same operation.

- [ ] **Step 4: Verify new migration is recognized**

Run:

```powershell
npx supabase migration list
```

Expected: local list includes `013`; CLI may still warn about `003a`, but `013` should be recognized.

---

### Task 4: Resolve Duplicate Short-Version Migration Ambiguity

**Files:**
- Review: `d:\Project\seekdrn\supabase\migrations\001_add_faqs.sql`
- Review: `d:\Project\seekdrn\supabase\migrations\001_initial_schema.sql`
- Review: `d:\Project\seekdrn\supabase\migrations\002_add_site_content.sql`
- Review: `d:\Project\seekdrn\supabase\migrations\002_rls_policies.sql`
- Review: `d:\Project\seekdrn\supabase\migrations\003_email_logs.sql`
- Review: `d:\Project\seekdrn\supabase\migrations\003_extend_site_settings.sql`

- [ ] **Step 1: Inspect migration list again**

Run:

```powershell
npx supabase migration list
```

Expected: duplicate local versions still show as separate rows for `001`, `002`, and `003`.

- [ ] **Step 2: Do not rename old migrations before push**

Do not rename these files yet:

```text
001_add_faqs.sql
001_initial_schema.sql
002_add_site_content.sql
002_rls_policies.sql
003_email_logs.sql
003_extend_site_settings.sql
```

Reason: renaming old migration files can create remote history mismatch. Supabase migration history is version-based, and these short numeric versions already partially exist remotely.

- [ ] **Step 3: Manually verify whether missing duplicate migrations' objects already exist remotely**

Use Supabase SQL Editor or `psql` against the remote database. Run:

```sql
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'faqs',
    'site_content',
    'site_settings',
    'email_logs'
  )
order by table_name;
```

Expected: confirms which objects exist remotely.

- [ ] **Step 4: If objects already exist remotely, do not replay old duplicate migrations**

If tables/columns already exist, leave duplicate historical migrations alone and only use new forward migrations from `013` onward.

- [ ] **Step 5: If required objects are missing remotely, create one new forward repair migration**

Create:

```text
d:\Project\seekdrn\supabase\migrations\014_repair_legacy_schema_gaps.sql
```

This file should include only missing schema pieces, using `IF NOT EXISTS` and `DROP POLICY IF EXISTS` before `CREATE POLICY`. Do not copy entire old migrations blindly if the remote already contains some objects.

Example pattern:

```sql
CREATE TABLE IF NOT EXISTS email_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  to_email text NOT NULL,
  subject text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
```

Only include this example if `email_logs` is actually missing and the columns match the existing app schema.

---

### Task 5: Push Schema Migrations Only

**Files:**
- Push candidate: `d:\Project\seekdrn\supabase\migrations\013_product_enhancements.sql`
- Optional push candidate: `d:\Project\seekdrn\supabase\migrations\014_repair_legacy_schema_gaps.sql`

- [ ] **Step 1: Preview migration status**

Run:

```powershell
npx supabase migration list
```

Expected: `013` appears local-only. `014` appears local-only only if created.

- [ ] **Step 2: Push migrations**

Run:

```powershell
npx supabase db push
```

Expected: Supabase CLI asks to apply pending migrations. Confirm only if the pending migrations are expected:

```text
013_product_enhancements.sql
014_repair_legacy_schema_gaps.sql
```

Do not confirm if the CLI attempts to apply old duplicate `001`, `002`, or `003` files directly.

- [ ] **Step 3: Verify remote migration state**

Run:

```powershell
npx supabase migration list
```

Expected: `013` and optional `014` show in both Local and Remote columns.

---

### Task 6: Take Pre-Seed Snapshot

**Files:**
- Read-only: `d:\Project\seekdrn\supabase\seed\execute_seed.sql`
- Read-only: `d:\Project\seekdrn\supabase\seed\mock_static_content.sql`
- Read-only: `d:\Project\seekdrn\supabase\seed\mock_products.sql`
- Read-only: `d:\Project\seekdrn\supabase\seed\mock_case_studies.sql`

- [ ] **Step 1: Run table count snapshot in Supabase SQL Editor**

Run:

```sql
select 'products' as table_name, count(*) from products
union all
select 'case_studies', count(*) from case_studies
union all
select 'product_tags', count(*) from product_tags
union all
select 'product_faqs', count(*) from product_faqs
union all
select 'product_documents', count(*) from product_documents
union all
select 'solutions', count(*) from solutions
union all
select 'site_settings', count(*) from site_settings
order by table_name;
```

Expected: save the count output before seed execution.

- [ ] **Step 2: Export a backup before seed**

Use Supabase Dashboard backup/export if available. If using CLI access with a database URL, run a PostgreSQL dump from a safe terminal environment:

```powershell
pg_dump "$env:SUPABASE_DB_URL" --clean --if-exists --no-owner --no-privileges --file "backup-before-seed.sql"
```

Expected: `backup-before-seed.sql` is created outside tracked source files or ignored by Git. Do not commit database backup files.

---

### Task 7: Execute Seed Data in Controlled Order

**Files:**
- Main seed runner: `d:\Project\seekdrn\supabase\seed\execute_seed.sql`
- Static seed: `d:\Project\seekdrn\supabase\seed\mock_static_content.sql`
- Product seed: `d:\Project\seekdrn\supabase\seed\mock_products.sql`
- Case study seed: `d:\Project\seekdrn\supabase\seed\mock_case_studies.sql`

- [ ] **Step 1: Review destructive seed statements**

Inspect seed files for statements like:

```sql
DELETE FROM product_tags;
DELETE FROM product_faqs;
DELETE FROM product_documents;
```

Expected: identify which tables will be cleared or overwritten. Do not seed production if these deletes are unacceptable.

- [ ] **Step 2: Execute seed using psql from seed directory**

Run from:

```text
d:\Project\seekdrn\supabase\seed
```

Command:

```powershell
psql "$env:SUPABASE_DB_URL" -f "execute_seed.sql"
```

Expected output includes:

```text
Starting database seed...
Seeding static content...
Seeding products...
Seeding case studies...
Database seed completed successfully!
Verifying data...
```

- [ ] **Step 3: If `psql` is unavailable, use Supabase SQL Editor manually**

Execute files in this order:

```text
1. d:\Project\seekdrn\supabase\seed\mock_static_content.sql
2. d:\Project\seekdrn\supabase\seed\mock_products.sql
3. d:\Project\seekdrn\supabase\seed\mock_case_studies.sql
```

Do not paste all files together unless the SQL Editor supports the full script size and transaction behavior.

---

### Task 8: Verify Schema and Seed Result

**Files:**
- Verify against app pages and API routes that consume Supabase data.

- [ ] **Step 1: Verify important schema objects exist**

Run in Supabase SQL Editor:

```sql
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'products',
    'product_specs',
    'product_downloads',
    'product_case_relations',
    'product_tags',
    'product_faqs',
    'product_documents',
    'case_studies',
    'solutions',
    'site_settings'
  )
order by table_name;
```

Expected: all listed tables that the application depends on are present.

- [ ] **Step 2: Verify product data**

Run:

```sql
select model, slug, published
from products
order by sort_order, model
limit 20;
```

Expected: product rows exist and published products are visible to public pages.

- [ ] **Step 3: Verify seed counts after execution**

Run:

```sql
select 'products' as table_name, count(*) from products
union all
select 'case_studies', count(*) from case_studies
union all
select 'product_tags', count(*) from product_tags
union all
select 'product_faqs', count(*) from product_faqs
union all
select 'product_documents', count(*) from product_documents
union all
select 'solutions', count(*) from solutions
union all
select 'site_settings', count(*) from site_settings
order by table_name;
```

Expected: counts match the intended seed result and differ from pre-seed snapshot only where expected.

- [ ] **Step 4: Run local project checks**

Run:

```powershell
npm run typecheck
npm run lint
npm run check:arch
```

Expected: all commands complete successfully.

---

### Task 9: Commit Only the Plan and Safe Migration Changes When Requested

**Files:**
- Commit candidate: `d:\Project\seekdrn\docs\superpowers\plans\2026-06-08-supabase-migration-seed-safe-push.md`
- Commit candidate if created: `d:\Project\seekdrn\supabase\migrations\013_product_enhancements.sql`
- Commit candidate if created: `d:\Project\seekdrn\supabase\migrations\014_repair_legacy_schema_gaps.sql`

- [ ] **Step 1: Check final Git status**

Run:

```powershell
git status --short
```

Expected: only intentional files are staged or unstaged.

- [ ] **Step 2: Do not commit unless explicitly requested**

If the user asks for a commit, stage only relevant files:

```powershell
git add "docs/superpowers/plans/2026-06-08-supabase-migration-seed-safe-push.md" "supabase/migrations/013_product_enhancements.sql" "supabase/migrations/014_repair_legacy_schema_gaps.sql"
```

If `014_repair_legacy_schema_gaps.sql` was not created, omit it from the command.

- [ ] **Step 3: Suggested commit message if requested**

```text
chore: plan safe Supabase migration and seed rollout
```

---

## Rollback Guidance

### If migration push fails before applying anything

- Stop.
- Save CLI output.
- Do not retry blindly.
- Inspect the exact migration that failed.

### If migration push partially applies

- Do not delete remote objects manually.
- Check `npx supabase migration list`.
- Check Supabase Dashboard logs.
- Create a new forward repair migration instead of editing the already-applied migration.

### If seed execution corrupts or overwrites data

- Stop app writes if possible.
- Restore from Supabase Dashboard backup or `backup-before-seed.sql`.
- Re-run only verified idempotent seed sections after restoration.

---

## Recommended Execution Order Summary

1. Confirm Git status and remote migration list.
2. Remove `scripts/temp-seed.sql` if identical to tracked seed.
3. Create `013_product_enhancements.sql` from ignored `003a_product_enhancements.sql`.
4. Verify whether duplicate legacy migrations' schema already exists remotely.
5. Create `014_repair_legacy_schema_gaps.sql` only if remote schema is missing required objects.
6. Run `npx supabase db push` and apply only expected new forward migrations.
7. Take pre-seed counts and backup.
8. Execute seed in controlled order.
9. Verify schema, data counts, app typecheck, lint, and architecture check.
