$WshShell = New-Object -comObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("C:\Users\perry\Desktop\Claude Provider Switcher.lnk")
$Shortcut.TargetPath = "C:\projects\burn-wizard\claude-provider-switcher.bat"
$Shortcut.WorkingDirectory = "C:\projects\burn-wizard"
$Shortcut.Description = "Switch between Claude and DeepSeek providers"
$Shortcut.Save()
Write-Host "Desktop shortcut created successfully!"