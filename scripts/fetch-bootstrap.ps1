# Fetch Bootstrap vendor files for self-hosting
# Usage: powershell -ExecutionPolicy Bypass -File scripts\fetch-bootstrap.ps1
$ErrorActionPreference = 'Stop'
$dir = Join-Path -Path $PSScriptRoot -ChildPath "..\assets\vendor\bootstrap"
if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
Write-Host "Downloading Bootstrap into: $dir"
$cssUrl = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css'
$jsUrl = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js'
Invoke-WebRequest -Uri $cssUrl -OutFile (Join-Path $dir 'bootstrap.min.css') -UseBasicParsing
Invoke-WebRequest -Uri $jsUrl -OutFile (Join-Path $dir 'bootstrap.bundle.min.js') -UseBasicParsing
Write-Host "Done. Files saved:" (Join-Path $dir 'bootstrap.min.css') , (Join-Path $dir 'bootstrap.bundle.min.js')
Write-Host "Remember to commit the files to the repo if you want them self-hosted in production."