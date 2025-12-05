@echo off
echo Syncing with GitHub...
git add .
set /p commit_msg="Enter commit message: "
git commit -m "%commit_msg%"
git push origin main
echo Done!
pause
