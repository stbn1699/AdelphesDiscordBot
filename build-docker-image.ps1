param(
    [Parameter(Mandatory = $false)]
    [string]$Version
)

$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($Version)) {
    $Version = Read-Host "Numero de version (ex: 1.5, 2.6, 8.45)"
}

if ($Version -notmatch '^\d+(\.\d+)+$') {
    Write-Host ""
    Write-Host "Version invalide : $Version" -ForegroundColor Red
    Write-Host "Format attendu : 1.5, 2.6, 8.45, etc." -ForegroundColor Yellow
    exit 1
}

$imageName = "adelphes-discord-bot"
$imageTag = "v$Version"
$imageReference = "${imageName}:${imageTag}"

$outputDirectory = Join-Path $PSScriptRoot "builds\v1"
$outputFileName = "${imageName}-${imageTag}.tar"
$outputPath = Join-Path $outputDirectory $outputFileName

New-Item -ItemType Directory -Force -Path $outputDirectory | Out-Null

Write-Host ""
Write-Host "=== Build Docker ===" -ForegroundColor Cyan
Write-Host "Image : $imageReference"
Write-Host ""

docker build --pull -t $imageReference .

if ($LASTEXITCODE -ne 0) {
    throw "Le build Docker a echoue."
}

Write-Host ""
Write-Host "=== Export Docker ===" -ForegroundColor Cyan
Write-Host "Fichier : $outputPath"
Write-Host ""

docker save -o $outputPath $imageReference

if ($LASTEXITCODE -ne 0) {
    throw "L'export Docker a echoue."
}

Write-Host ""
Write-Host "Build termine avec succes." -ForegroundColor Green
Write-Host "Archive creee : $outputPath" -ForegroundColor Green