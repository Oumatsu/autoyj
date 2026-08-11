$html = Get-Content -Raw 'outputs/youguard-quotation-template.html'
$required = @(
  'size:A4 portrait',
  'id="vehicleRows"',
  'function addVehicleRow',
  'addVehicleRow()',
  'removeVehicleRow',
  '@media print',
  'window.print()',
  'YOUGUARD TECHNOLOGY LIMITED',
  'RM 701, UNIT 127, 7/F, TWR B NEW MANDARIN PLAZA 14 SCIENCE MUSEUM RD, TSIM SHA TSUI, HONG KONG',
  'WIHBHKHH',
  'OCBC Bank (Hong Kong) Limited',
  '161 Queen’s Road Central,Hong Kong',
  '795785831'
)
$missing = $required | Where-Object { $html -notmatch [regex]::Escape($_) }
if ($missing.Count) { throw "Missing expected portrait/multi-vehicle behavior: $($missing -join ', ')" }
Write-Output 'PASS: portrait layout and repeatable vehicle rows are present.'
