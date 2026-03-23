# Security Notes

This project uses secrets for Turso, Mercado Pago, and admin authentication.

## Immediate Actions If a Secret Was Exposed

1. Revoke and rotate exposed credentials:
   - `TURSO_AUTH_TOKEN`
   - `MP_ACCESS_TOKEN`
   - `MP_WEBHOOK_SECRET`
   - `ADMIN_PASSWORD`
   - `ADMIN_TOKEN_SECRET` (if used)
2. Update secrets in:
   - local `.env.local`
   - Vercel project environment variables
   - any CI/CD secret stores

## Prevent Future Leaks

1. Keep real values only in `.env.local` / Vercel env vars.
2. Commit only placeholders in `.env.example`.
3. Never share screenshots/logs containing full tokens.

## Remove Secrets From Git History

If a real secret was committed, rotate it first, then clean history.

Using `git-filter-repo` (recommended):

```bash
git filter-repo --path .env.example --invert-paths
```

Or replace sensitive strings across history:

```bash
git filter-repo --replace-text replacements.txt
```

Then force-push and coordinate with collaborators:

```bash
git push --force --all
git push --force --tags
```

After rewriting history, everyone must re-clone or hard reset to the new history.

