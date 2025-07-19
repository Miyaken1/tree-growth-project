#!/bin/bash

# GitHub Pagesへのデプロイスクリプト

set -e

echo "Deploying to GitHub Pages..."

# Gitの状態確認
if [ -n "$(git status --porcelain)" ]; then
    echo "Warning: You have uncommitted changes"
    read -p "Do you want to continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# 現在のブランチを確認
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "Warning: You are not on the main branch (current: $CURRENT_BRANCH)"
    read -p "Do you want to continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# GitHub Pagesの設定確認
echo "Make sure GitHub Pages is enabled in repository settings:"
echo "1. Go to Settings > Pages"
echo "2. Source: Deploy from a branch"
echo "3. Branch: main / (root)"

read -p "Press Enter to continue after confirming GitHub Pages settings..."

# プッシュ
git add .
git commit -m "Deploy: $(date '+%Y-%m-%d %H:%M:%S')" || true
git push origin main

echo "Deployment completed!"
echo "Your site will be available at: https://YOUR_USERNAME.github.io/YOUR_REPO/"
