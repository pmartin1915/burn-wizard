@echo off
color 0B
title Claude Provider Switcher
mode con cols=65 lines=20

:menu
cls
echo.
echo    ================================================
echo    =                                              =
echo    =        Claude Provider Switcher             =
echo    =                                              =
echo    ================================================
echo.
echo    -----------------------------------------------
echo    -                                             -
echo    -  [1] Switch to Claude (Anthropic)          -
echo    -                                             -
echo    -  [2] Switch to DeepSeek                    -
echo    -                                             -
echo    -  [3] Exit                                   -
echo    -                                             -
echo    -----------------------------------------------
echo.
set /p choice=    Choose an option (1-3): 

if "%choice%"=="1" (
    echo.
    echo    Switching to Claude...
    call switch-to-claude.bat
    echo    Switch completed! Press any key to return to menu.
    pause >nul
    goto menu
)
if "%choice%"=="2" (
    echo.
    echo    Switching to DeepSeek...
    call switch-to-deepseek.bat
    echo    Switch completed! Press any key to return to menu.
    pause >nul
    goto menu
)
if "%choice%"=="3" (
    echo.
    echo    Goodbye!
    timeout /t 1 >nul
    exit
)

echo.
echo    Invalid choice. Please try again.
echo    Press any key to continue...
pause >nul
goto menu