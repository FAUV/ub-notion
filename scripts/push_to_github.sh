#!/usr/bin/env bash
set -euo pipefail

if [ -z "${GITHUB_TOKEN:-}" ]; then
  echo "ERROR: define GITHUB_TOKEN with repo permissions."
  exit 1
fi

if [ $# -lt 2 ]; then
  echo "Usage: $0 <github-username> <repo-name> [branch=main]"
  exit 1
fi

USER="$1"
REPO="$2"
BRANCH="${3:-main}"

REMOTE="https://${USER}:${GITHUB_TOKEN}@github.com/${USER}/${REPO}.git"

git init
git add .
git commit -m "Initial production commit (UB Notion Control Center)"
git branch -M "${BRANCH}"
git remote add origin "${REMOTE}"
git push -u origin "${BRANCH}"

echo "Pushed to https://github.com/${USER}/${REPO} (branch: ${BRANCH})"
