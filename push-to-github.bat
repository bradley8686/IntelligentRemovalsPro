@echo off
title Intelligent Removals Pro - GitHub Auto Push
color 0A

echo ==============================================
echo   Intelligent Removals Pro - GitHub Uploader
echo ==============================================
echo.
echo  This script will initialize, commit, and push
echo  your project to GitHub automatically.
echo.

REM --- Change this path if needed ---
cd /d "C:\Users\fresc\Downloads\intelligent-removals-pro-final"

echo.
echo Initializing Git repository...
git init

echo Setting main branch...
git branch -M main

echo Linking to your GitHub repository...
git remote add origin https://github.com/bradley8686/IntelligentRemovalsPro.git

echo.
echo Adding project files...
git add .

echo Creating initial commit...
git commit -m "Final Intelligent Removals Pro build (Pro Edition)"

echo.
echo Pushing project to GitHub...
git push -u origin main

echo.
echo Creating version tag (v1.0.0)...
git tag v1.0.0

echo Pushing tag to GitHub (this triggers auto-build)...
git push origin v1.0.0

echo.
echo ==============================================
echo ✅ Upload complete!
echo Your project is now live at:
echo https://github.com/bradley8686/IntelligentRemovalsPro
echo.
echo GitHub Actions will now build installers automatically.
echo ==============================================
pause
