# Set ScaffyLads env vars on Vercel (requires VERCEL_TOKEN)
# Usage: $env:VERCEL_TOKEN="..."; .\scripts\set-vercel-env.ps1
$ErrorActionPreference = "Stop"
$token = $env:VERCEL_TOKEN
if (-not $token) { throw "Set VERCEL_TOKEN first (https://vercel.com/account/tokens)" }
$teamId = "team_LO30Ns5ecerbLZUPXGfR42GJ"
$projectId = "prj_UADF4s4pFeknrR3Lat1nQusELrQc"
$envFile = Join-Path $PSScriptRoot "..\.env.local" | Resolve-Path
$map = @{}
Get-Content $envFile | ForEach-Object {
  if ($_ -match '^\s*#' -or $_ -notmatch '=') { return }
  $parts = $_.Split('=', 2)
  $map[$parts[0].Trim()] = $parts[1].Trim()
}
$keys = @(
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "XAI_API_KEY",
  "XAI_MODEL"
)
$headers = @{ Authorization = "Bearer $token"; "Content-Type" = "application/json" }
foreach ($key in $keys) {
  $val = $map[$key]
  if ([string]::IsNullOrWhiteSpace($val)) { Write-Host "skip empty $key"; continue }
  $body = @{
    key = $key
    value = $val
    type = if ($key -like "NEXT_PUBLIC_*") { "plain" } else { "encrypted" }
    target = @("production", "preview", "development")
  } | ConvertTo-Json
  $uri = "https://api.vercel.com/v10/projects/$projectId/env?teamId=$teamId&upsert=true"
  try {
    Invoke-RestMethod -Method Post -Uri $uri -Headers $headers -Body $body | Out-Null
    Write-Host "OK $key"
  } catch {
    Write-Host "FAIL $key : $($_.Exception.Message)"
  }
}
Write-Host "Done. Redeploy production for env to apply."
