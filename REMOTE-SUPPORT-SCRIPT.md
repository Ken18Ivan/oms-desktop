# OMS Remote Support Script (No Developer Laptop Needed)

## Goal
Guide an onsite helper to install, validate, and triage OMS issues using a strict step-by-step process.

## Use This During A Call
Read each step exactly. Do not skip steps.

## What You Need From Onsite Person
1. The installer file: `OMS Portal Setup 1.0.0.exe`
2. Access to Start Menu and Settings
3. Permission to uninstall/reinstall app

## Step 1: Verify Installer Integrity
Ask onsite person to run:
```powershell
Get-FileHash .\"OMS Portal Setup 1.0.0.exe" -Algorithm SHA256
```
Compare against your known good hash.

- If hash does not match: stop, recopy installer, verify hash again.
- If hash matches: continue.

## Step 2: Clean Reinstall
1. Uninstall old OMS versions from Installed apps.
2. Delete old OMS shortcuts (desktop/start menu if stale).
3. Reboot laptop.
4. Install `OMS Portal Setup 1.0.0.exe`.
5. Launch from the new Start Menu shortcut only.

## Step 3: Capture Diagnostics Immediately
Inside OMS:
1. Go to **Settings**.
2. Click **Copy Diagnostics**.
3. Paste output into Notepad and send to you.

Required fields to check:
- `runtimeMode`
- `isIpcReady`
- `appVersion`

## Step 4: Decision Tree
### Case A
- `runtimeMode: browser`

Action:
1. App launched in wrong target (not installed Electron app).
2. Close app.
3. Relaunch from Start Menu OMS shortcut.
4. Copy diagnostics again.

### Case B
- `runtimeMode: electron`
- `isIpcReady: false`

Action:
1. Likely preload/resources blocked or corrupted install.
2. Repeat Step 2 clean reinstall.
3. If still failing, collect screenshot + diagnostics and escalate as machine security/policy issue.

### Case C
- `runtimeMode: electron`
- `isIpcReady: true`
- But save/load fails

Action:
1. In Settings, click **Change Save Folder**.
2. Pick a writable folder (Desktop or Documents).
3. Retry save/load.
4. If still failing, collect diagnostics + screenshot of log.

## Step 5: Functional Validation
After fixes, verify:
1. Login works.
2. Save one record works.
3. Load existing records works.
4. No startup IPC block screen.

## Artifacts To Send Back
1. Diagnostics text
2. Screenshot of any error/log
3. Installer hash output
4. Exact step where failure occurred

## Escalation Message Template
```
Laptop Name:
Windows Version:
Installer Hash Matches: Yes/No
runtimeMode:
isIpcReady:
appVersion:
Save Test: Pass/Fail
Load Test: Pass/Fail
Observed Error:
Attached: diagnostics + screenshots
```

## Notes For Caller
1. Keep the caller on one installer version only.
2. Do not test with copied app folders; always install from setup exe.
3. Do not rely on old shortcuts.
