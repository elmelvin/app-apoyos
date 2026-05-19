$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$sourceLogo = Join-Path $root "public\brand-logo.png"
$publicLogo = Join-Path $root "public\Logodiff.png"

if (-not (Test-Path $sourceLogo)) {
  throw "No se encontro el logo base en public\\brand-logo.png"
}

function New-Bitmap([int]$width, [int]$height) {
  $bitmap = New-Object System.Drawing.Bitmap $width, $height, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  return @{ Bitmap = $bitmap; Graphics = $graphics }
}

function Save-Png($bitmap, [string]$path) {
  $directory = Split-Path -Parent $path
  if (-not (Test-Path $directory)) {
    New-Item -ItemType Directory -Path $directory | Out-Null
  }
  $bitmap.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
}

$logoOriginal = [System.Drawing.Bitmap]::FromFile($sourceLogo)
$logo = New-Object System.Drawing.Bitmap $logoOriginal.Width, $logoOriginal.Height, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

for ($x = 0; $x -lt $logoOriginal.Width; $x++) {
  for ($y = 0; $y -lt $logoOriginal.Height; $y++) {
    $pixel = $logoOriginal.GetPixel($x, $y)
    $max = [Math]::Max($pixel.R, [Math]::Max($pixel.G, $pixel.B))
    $min = [Math]::Min($pixel.R, [Math]::Min($pixel.G, $pixel.B))
    $avg = ($pixel.R + $pixel.G + $pixel.B) / 3

    if (($max - $min) -le 18 -and $avg -ge 220) {
      $logo.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, 255, 255, 255))
    } else {
      $logo.SetPixel($x, $y, $pixel)
    }
  }
}

$iconCrop = New-Object System.Drawing.Rectangle 245, 145, 540, 470
$iconSymbol = $logo.Clone($iconCrop, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

Save-Png $logo $publicLogo

$adaptiveForegroundSizes = @{
  "mipmap-mdpi" = 108
  "mipmap-hdpi" = 162
  "mipmap-xhdpi" = 216
  "mipmap-xxhdpi" = 324
  "mipmap-xxxhdpi" = 432
}

$launcherSizes = @{
  "mipmap-mdpi" = 48
  "mipmap-hdpi" = 72
  "mipmap-xhdpi" = 96
  "mipmap-xxhdpi" = 144
  "mipmap-xxxhdpi" = 192
}

foreach ($entry in $adaptiveForegroundSizes.GetEnumerator()) {
  $size = $entry.Value
  $target = New-Bitmap $size $size
  $target.Graphics.Clear([System.Drawing.Color]::Transparent)

  $padding = [int]($size * 0.12)
  $drawSize = $size - ($padding * 2)
  $destRect = New-Object System.Drawing.Rectangle $padding, $padding, $drawSize, $drawSize
  $target.Graphics.DrawImage($iconSymbol, $destRect)

  Save-Png $target.Bitmap (Join-Path $root "android\app\src\main\res\$($entry.Key)\ic_launcher_foreground.png")
  $target.Graphics.Dispose()
  $target.Bitmap.Dispose()
}

foreach ($entry in $launcherSizes.GetEnumerator()) {
  $size = $entry.Value

  foreach ($name in @("ic_launcher.png", "ic_launcher_round.png")) {
    $target = New-Bitmap $size $size
    $target.Graphics.Clear([System.Drawing.ColorTranslator]::FromHtml("#FFFFFF"))

    $padding = [int]($size * 0.14)
    $drawSize = $size - ($padding * 2)
    $destRect = New-Object System.Drawing.Rectangle $padding, $padding, $drawSize, $drawSize
    $target.Graphics.DrawImage($iconSymbol, $destRect)

    Save-Png $target.Bitmap (Join-Path $root "android\app\src\main\res\$($entry.Key)\$name")
    $target.Graphics.Dispose()
    $target.Bitmap.Dispose()
  }
}

$splashTargets = @(
  @{ Path = "android\app\src\main\res\drawable\splash.png"; Width = 480; Height = 320 },
  @{ Path = "android\app\src\main\res\drawable-port-mdpi\splash.png"; Width = 320; Height = 480 },
  @{ Path = "android\app\src\main\res\drawable-port-hdpi\splash.png"; Width = 480; Height = 800 },
  @{ Path = "android\app\src\main\res\drawable-port-xhdpi\splash.png"; Width = 720; Height = 1280 },
  @{ Path = "android\app\src\main\res\drawable-port-xxhdpi\splash.png"; Width = 960; Height = 1600 },
  @{ Path = "android\app\src\main\res\drawable-port-xxxhdpi\splash.png"; Width = 1280; Height = 1920 },
  @{ Path = "android\app\src\main\res\drawable-land-mdpi\splash.png"; Width = 480; Height = 320 },
  @{ Path = "android\app\src\main\res\drawable-land-hdpi\splash.png"; Width = 800; Height = 480 },
  @{ Path = "android\app\src\main\res\drawable-land-xhdpi\splash.png"; Width = 1280; Height = 720 },
  @{ Path = "android\app\src\main\res\drawable-land-xxhdpi\splash.png"; Width = 1600; Height = 960 },
  @{ Path = "android\app\src\main\res\drawable-land-xxxhdpi\splash.png"; Width = 1920; Height = 1280 }
)

foreach ($item in $splashTargets) {
  $target = New-Bitmap ([int]$item.Width) ([int]$item.Height)
  $target.Graphics.Clear([System.Drawing.ColorTranslator]::FromHtml("#F7FAF8"))

  $scale = [Math]::Min(($item.Width * 0.58) / $logo.Width, ($item.Height * 0.42) / $logo.Height)
  $drawWidth = [int]($logo.Width * $scale)
  $drawHeight = [int]($logo.Height * $scale)
  $offsetX = [int](($item.Width - $drawWidth) / 2)
  $offsetY = [int](($item.Height - $drawHeight) / 2)
  $destRect = New-Object System.Drawing.Rectangle $offsetX, $offsetY, $drawWidth, $drawHeight

  $target.Graphics.DrawImage($logo, $destRect)
  Save-Png $target.Bitmap (Join-Path $root $item.Path)
  $target.Graphics.Dispose()
  $target.Bitmap.Dispose()
}

$faviconTarget = New-Bitmap 512 512
$faviconTarget.Graphics.Clear([System.Drawing.ColorTranslator]::FromHtml("#FFFFFF"))
$faviconPadding = 56
$faviconSize = 512 - ($faviconPadding * 2)
$faviconRect = New-Object System.Drawing.Rectangle $faviconPadding, $faviconPadding, $faviconSize, $faviconSize
$faviconTarget.Graphics.DrawImage($iconSymbol, $faviconRect)
Save-Png $faviconTarget.Bitmap (Join-Path $root "public\favicon.png")
$faviconTarget.Graphics.Dispose()
$faviconTarget.Bitmap.Dispose()

$iconSymbol.Dispose()
$logoOriginal.Dispose()
$logo.Dispose()
