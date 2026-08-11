$html = Get-Content -Raw 'outputs/youguard-quotation-template.html'
$required = @('qty"','fob-unit"','fob-amount"','id="fobTotal"','id="cifTotal" contenteditable="true"','function recalculate','data-amount','input',"Number(row.querySelector('.qty').textContent)")
$missing = $required | Where-Object { $html -notmatch [regex]::Escape($_) }
if ($missing.Count) { throw "Missing automatic calculation behavior: $($missing -join ', ')" }
foreach ($forbidden in @('id="ectnFee"','id="chargerFee"','id="seaFreight"',"const cif=",'cifTotal').Where({ $_ -ne 'cifTotal' })) {
  if ($html -match [regex]::Escape($forbidden)) { throw "CIF must be manually entered; found forbidden automatic-CIF hook: $forbidden" }
}
Write-Output 'PASS: vehicle quantity mapping and automatic FOB calculation hooks are present; CIF is a manual USD entry.'
