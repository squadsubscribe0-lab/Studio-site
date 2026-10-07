# Renders covers.html scenes to PNG at exact CrazyGames sizes via headless Chrome.
$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$dir = $PSScriptRoot
$out = Join-Path $dir "out"
New-Item -ItemType Directory -Force $out | Out-Null
$jobs = @(
  @{ s = "land";   w = 1920; h = 1080; f = "cover-landscape-1920x1080.png" },
  @{ s = "land2";  w = 1920; h = 1080; f = "cover-landscape-alt-1920x1080.png" },
  @{ s = "port";   w = 800;  h = 1200; f = "cover-portrait-800x1200.png" },
  @{ s = "square"; w = 800;  h = 800;  f = "cover-square-800x800.png" }
)
$base = "file:///" + ($dir -replace '\\', '/') + "/covers.html"
foreach ($j in $jobs) {
  $png = Join-Path $out $j.f
  & $chrome --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 `
    --allow-file-access-from-files --virtual-time-budget=3000 `
    "--window-size=$($j.w),$($j.h)" "--screenshot=$png" "$base`?s=$($j.s)" 2>$null | Out-Null
  Write-Output "$($j.f): $((Get-Item $png).Length) bytes"
}
