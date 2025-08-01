@echo off
echo === Updating The Cave Boxing files ===

REM Copy clean files into place
copy /Y "C:\temp\cavefix\page.tsx" "app\page.tsx"
copy /Y "C:\temp\cavefix\admin-page.tsx" "app\admin\page.tsx"
copy /Y "C:\temp\cavefix\media-gallery.tsx" "components\media-gallery.tsx"
copy /Y "C:\temp\cavefix\navigation.tsx" "components\navigation.tsx"

REM Stage changes
git add app\page.tsx app\admin\page.tsx components\media-gallery.tsx components\navigation.tsx

REM Commit changes
git commit -m "Resolved merge conflicts keeping Codex upgrade features"

REM Push changes to upgrade branch
git push origin jqgsmo-codex/upgrade-the-cave-boxing-website

echo === Done! Go to GitHub and merge your PR ===
pause
