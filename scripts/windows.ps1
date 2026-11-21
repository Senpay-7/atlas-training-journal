param([string]$Task = 'start')
$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath (Split-Path -Parent $PSScriptRoot)
$env:EXPO_NO_TELEMETRY = '1'
$npmCommand = Get-Command npm.cmd -ErrorAction SilentlyContinue
if ($npmCommand) {
    & $npmCommand.Source run $Task
    exit $LASTEXITCODE
}
$atlasNpm = Join-Path $env:USERPROFILE 'Documents\Codex\2026-09-18\new-chat\work\package\bin\npm-cli.js'
if (!(Test-Path -LiteralPath $atlasNpm)) { throw 'Install Node.js 24 LTS with npm, then run npm start.' }
$atlasTooling = Join-Path (Get-Location) '.tooling'
New-Item -ItemType Directory -Path $atlasTooling -Force | Out-Null
Set-Content -LiteralPath (Join-Path $atlasTooling 'npm.cmd') -Value ('@echo off' + [Environment]::NewLine + 'node "' + $atlasNpm + '" %*')
$env:Path = $atlasTooling + ';' + $env:Path
& node $atlasNpm run $Task
exit $LASTEXITCODE
