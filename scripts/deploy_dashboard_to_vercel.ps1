param(
    [string]$VercelToken = $env:VERCEL_TOKEN
)

$ErrorActionPreference = "Stop"

if (-not $VercelToken) {
    throw "Set VERCEL_TOKEN env var or pass -VercelToken (Vercel account API token)."
}

$headers = @{ "Authorization" = "Bearer $VercelToken"; "Content-Type" = "application/json" }
$projectName = "beyond-juicery-dashboard"
$root = Join-Path (Split-Path $PSScriptRoot -Parent) "..\beyond-juicery-dashboard"

# Run once to create the project (framework: nextjs) and set env vars via:
#   POST https://api.vercel.com/v10/projects  { "name": "beyond-juicery-dashboard", "framework": "nextjs" }
#   POST https://api.vercel.com/v10/projects/beyond-juicery-dashboard/env
#     { "key": "AIRTABLE_PAT", "value": "<token>", "type": "encrypted", "target": ["production","preview","development"] }
#     { "key": "AIRTABLE_BASE_ID", "value": "appmBaUD39bNFM4QA", ... }
#     { "key": "AIRTABLE_ORDERS_TABLE", "value": "tblQkG1DeczNyWsyM", ... }

# --- Build deployment files ---
$files = @(
    "package.json",
    "next.config.js",
    "app/layout.js",
    "app/page.js",
    "app/globals.css",
    "app/api/orders/route.js",
    "app/api/orders/[id]/route.js"
)

$sb = New-Object System.Text.StringBuilder
[void]$sb.Append('{"name":"' + $projectName + '","files":[')
for ($i = 0; $i -lt $files.Count; $i++) {
    $f = $files[$i]
    $fullPath = Join-Path $root $f
    $data = [System.IO.File]::ReadAllText($fullPath, [System.Text.Encoding]::UTF8)
    $relPath = $f.Replace('\', '/')
    $data = $data.Replace('\', '\\')
    $data = $data.Replace('"', '\"')
    $data = $data.Replace("`r`n", '\n')
    $data = $data.Replace("`n", '\n')
    $data = $data.Replace("`t", '\t')
    if ($i -gt 0) { [void]$sb.Append(',') }
    [void]$sb.Append('{"file":"' + $relPath + '","data":"' + $data + '"}')
}
[void]$sb.Append('],"projectSettings":{"framework":"nextjs"},"target":"production"}')

$body = $sb.ToString()
$null = $body | ConvertFrom-Json

# --- Trigger deployment ---
$resp = Invoke-RestMethod -Uri "https://api.vercel.com/v13/deployments" -Method POST -Headers $headers -Body ([System.Text.Encoding]::UTF8.GetBytes($body))

Write-Output ("Deployment ID: " + $resp.id)
Write-Output ("URL: https://" + $resp.url)
Write-Output ("Status: " + $resp.readyState)
Write-Output "Production alias: https://beyond-juicery-dashboard.vercel.app"
