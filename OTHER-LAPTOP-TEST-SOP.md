# OMS Other Laptop Test SOP

## Purpose
Use this checklist to validate a release installer on another laptop and quickly isolate machine-specific problems.

## Release Freeze
1. Use one installer only for this test cycle.
2. Do not rebuild before field testing.
3. Record release info:
   - Version: `1.0.0`
   - Build date: `2026-04-14`
   - Branch: `main`

## Package To Bring
1. `OMS Portal Setup 1.0.0.exe`
2. This SOP file
3. Expected diagnostics sample (optional)

## Integrity Check (Recommended)
Run on build machine:
```powershell
Get-FileHash .\dist\"OMS Portal Setup 1.0.0.exe" -Algorithm SHA256
```
Save the hash text.

Run on target laptop (same installer file):
```powershell
Get-FileHash .\"OMS Portal Setup 1.0.0.exe" -Algorithm SHA256
```
Hash must match exactly.

## Clean Install On Target Laptop
1. Uninstall old OMS versions (if any).
2. Delete old OMS desktop/start menu shortcuts.
3. Install using `OMS Portal Setup 1.0.0.exe`.
4. Launch from the new Start Menu shortcut only.

## First-Run Validation
1. Open **Settings**.
2. Click **Copy Diagnostics**.
3. Paste diagnostics into a text file.
4. Confirm these values:
   - `runtimeMode: electron`
   - `isIpcReady: true`
   - `appVersion: 1.0.0` (or expected version)
5. Test one save and one load operation.

## Pass/Fail Criteria
### Pass
- App opens normally.
- No blocking IPC error screen.
- `runtimeMode: electron` and `isIpcReady: true`.
- Save/load both work.

### Fail
- App shows IPC missing warning or startup health gate.
- Diagnostics show either:
  - `runtimeMode: browser`, or
  - `runtimeMode: electron` + `isIpcReady: false`
- Save/load fails.

## If Failure Happens
1. Reinstall once from the same verified installer.
2. Launch again from Start Menu shortcut only.
3. Copy diagnostics again.
4. Capture these artifacts:
   - Diagnostics text
   - Screenshot of error/log in Settings
   - Exact step where failure happens

## Common Root Causes
1. Wrong launch target (browser or old shortcut).
2. Old install leftovers.
3. Security software/quarantine blocking preload/resources.
4. Folder permission policy (Documents or redirected profile path).

## Immediate Workaround For Storage Issues
1. Go to **Settings**.
2. Use **Change Save Folder**.
3. Select a user-writable folder (for example, Desktop).
4. Retry save/load.

## Reporting Template
```
Laptop Name:
Windows Version:
Installer SHA256:
Runtime Mode:
IPC Ready:
App Version:
Save Test Result:
Load Test Result:
Observed Error:
Attachments: (diagnostics text, screenshots)
```
