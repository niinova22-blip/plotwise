# GitHub Actions workflows

Move these into `.github/workflows/` once your GitHub CLI token has the `workflow` scope:

```bash
gh auth refresh -s workflow
mkdir -p .github/workflows && git mv docs/github-workflows/*.yml .github/workflows/
```
