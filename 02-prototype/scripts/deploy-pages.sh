#!/bin/zsh
# Builds the static GitHub Pages deployment and pushes it to the gh-pages branch.
# Usage: ./scripts/deploy-pages.sh <git-url-with-token>
set -e
cd "$(dirname "$0")/.."

REMOTE="$1"
[ -z "$REMOTE" ] && { echo "usage: deploy-pages.sh <remote-url>"; exit 1; }

# Static export cannot contain route handlers; move them aside for this build.
mv app/api /tmp/exit-check-api-backup

cleanup() { [ -d /tmp/exit-check-api-backup ] && mv /tmp/exit-check-api-backup app/api || true; }
trap cleanup EXIT

rm -rf out
PAGES_EXPORT=1 PAGES_BASE_PATH=/HW2 NEXT_PUBLIC_STATIC=1 npx next build

# Publish out/ as the gh-pages branch.
cd out
git init -q -b gh-pages
git add -A
git -c user.name="pages-deploy" -c user.email="deploy@localhost" commit -qm "Static build $(date -u +%FT%TZ)"
git push -qf "$REMOTE" gh-pages
echo "gh-pages pushed."
