# PowerShell script to convert PNG to ICO
Add-Type -AssemblyName System.Drawing

# Load the PNG image
$pngPath = "C:\projects\burn-wizard\wizard-icon\wizard-image.png"
$icoPath = "C:\projects\burn-wizard\wizard-icon\wizard-icon.ico"

try {
    # Load the PNG image
    $bitmap = [System.Drawing.Bitmap]::new($pngPath)
    
    # Create icon from bitmap
    $icon = [System.Drawing.Icon]::FromHandle($bitmap.GetHicon())
    
    # Save as ICO file
    $iconStream = [System.IO.FileStream]::new($icoPath, [System.IO.FileMode]::Create)
    $icon.Save($iconStream)
    $iconStream.Close()
    
    # Clean up
    $bitmap.Dispose()
    $icon.Dispose()
    
    Write-Host "Icon created successfully: $icoPath"
} catch {
    Write-Error "Failed to create icon: $_"
}