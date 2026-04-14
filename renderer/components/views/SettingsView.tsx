import { useState, useRef } from 'react';

interface SettingsViewProps {
  newPassword: string;
  setNewPassword: (val: string) => void;
  confirmPassword: string;
  setConfirmPassword: (val: string) => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
  downloadBackup: () => void;
  saveLocation: string;
  setSaveLocation: (val: string) => void;
  handleFolderPick: () => void;
  handleLoadDatabase: () => void;
  runtimeMode: 'electron' | 'browser';
  isIpcReady: boolean;
  runtimeHint: string;
  copyDiagnostics: () => Promise<void>;
  debugLog: string;
  newDeptName: string;
  setNewDeptName: (val: string) => void;
  newDeptTarget: number;
  setNewDeptTarget: (val: number) => void;
  addDepartment: () => void;
  departments: any[];
  updateDeptTarget: (id: string, target: number) => void;
  deleteDepartment: (id: string) => void;
  bulkImportDepartments: (inputText: string) => void;
  newRoleInputs: Record<string, string>;
  setNewRoleInputs: (val: Record<string, string>) => void;
  addSpecificRole: (deptId: string) => void;
  removeSpecificRole: (deptId: string, roleToRemove: string) => void;
  purokList: { id: string, name: string, groupCount: number }[];
  newPurokName: string;
  setNewPurokName: (val: string) => void;
  newPurokGroupCount: number;
  setNewPurokGroupCount: (val: number) => void;
  addPurok: () => void;
  deletePurok: (id: string) => void;
  currentUsername: string;
  setCurrentUsername: (val: string) => void;
  newUsername: string;
  setNewUsername: (val: string) => void;
  currentPasswordForAuth: string;
  setCurrentPasswordForAuth: (val: string) => void;
  updateUsername: () => void;
  updatePassword: () => void;
  authModalOpen: boolean;
  setAuthModalOpen: (val: boolean) => void;
  authModalStep: 'verify' | 'change';
  setAuthModalStep: (v: 'verify' | 'change') => void;
  authModalCurrentPassword: string;
  setAuthModalCurrentPassword: (v: string) => void;
  authModalNewUsername: string;
  setAuthModalNewUsername: (v: string) => void;
  authModalNewPassword: string;
  setAuthModalNewPassword: (v: string) => void;
  authModalConfirmPassword: string;
  setAuthModalConfirmPassword: (v: string) => void;
  openChangeAuthModal: () => void;
  closeChangeAuthModal: () => void;
  verifyCurrentPassword: () => boolean;
  submitAuthChange: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  autoBackupEnabled: boolean;
  setAutoBackupEnabled: (v: boolean) => void;
  autoBackupFrequency: number;
  setAutoBackupFrequency: (v: number) => void;
}

export default function SettingsView({
  newPassword, setNewPassword,
  confirmPassword, setConfirmPassword,
  showToast, downloadBackup,
  saveLocation, setSaveLocation,
  handleFolderPick, handleLoadDatabase,
  runtimeMode, isIpcReady, runtimeHint, copyDiagnostics,
  debugLog,
  newDeptName, setNewDeptName,
  newDeptTarget, setNewDeptTarget,
  addDepartment, departments,
  updateDeptTarget, deleteDepartment, bulkImportDepartments,
  newRoleInputs, setNewRoleInputs,
  addSpecificRole, removeSpecificRole,
  purokList, newPurokName, setNewPurokName,
  newPurokGroupCount, setNewPurokGroupCount,
  addPurok, deletePurok,
  currentUsername, setCurrentUsername,
  newUsername, setNewUsername,
  currentPasswordForAuth, setCurrentPasswordForAuth,
  updateUsername, updatePassword,
  authModalOpen, setAuthModalOpen,
  authModalStep, setAuthModalStep,
  authModalCurrentPassword, setAuthModalCurrentPassword,
  authModalNewUsername, setAuthModalNewUsername,
  authModalNewPassword, setAuthModalNewPassword,
  authModalConfirmPassword, setAuthModalConfirmPassword,
  openChangeAuthModal, closeChangeAuthModal,
  verifyCurrentPassword, submitAuthChange,
  isDarkMode, toggleDarkMode,
  autoBackupEnabled, setAutoBackupEnabled,
  autoBackupFrequency, setAutoBackupFrequency
}: SettingsViewProps) {
  const [bulkImportModalOpen, setBulkImportModalOpen] = useState(false);
  const [bulkImportText, setBulkImportText] = useState('');
  const [bulkImportFile, setBulkImportFile] = useState<File | null>(null);
  const deptFileInputRef = useRef<HTMLInputElement>(null);

  const handleDeptFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setBulkImportFile(file);
    
    try {
      const text = await file.text();
      setBulkImportText(text);
    } catch (error) {
      showToast('Error processing file', 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      <div className="border-b border-gray-300 dark:border-slate-700 pb-4">
        <h2 className="text-3xl font-black text-gray-800 dark:text-white uppercase tracking-tight">System Settings</h2>
      </div>

      {/* SECURITY SETTINGS */}
      <div className="bg-white dark:bg-slate-800 shadow-md rounded-2xl overflow-hidden border border-gray-200 dark:border-slate-700 transition-colors mt-6 mb-6">
        <div className="bg-purple-900 dark:bg-purple-950 p-6 border-b-4 border-purple-500">
          <h2 className="text-xl font-bold text-white uppercase tracking-wider">Access Security</h2>
          <p className="text-purple-200 text-sm mt-1">Palitan ang username at system password na ginagamit sa pag-login.</p>
        </div>

        {/* Dark Mode Toggle */}
        <div className="p-6 bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
          <div className="flex justify-between items-center">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Dark Mode</label>
              <p className="text-sm text-gray-600 dark:text-gray-400">Toggle dark/light theme for the application</p>
            </div>
            <button
              onClick={toggleDarkMode}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isDarkMode ? 'bg-slate-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isDarkMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Auto Backup Toggle */}
        <div className="p-6 bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
          <div className="flex justify-between items-center mb-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Auto Backup</label>
              <p className="text-sm text-gray-600 dark:text-gray-400">Automatically backup data at specified intervals</p>
            </div>
            <button
              onClick={() => setAutoBackupEnabled(!autoBackupEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                autoBackupEnabled ? 'bg-slate-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  autoBackupEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          {autoBackupEnabled && (
            <div className="flex items-center gap-4">
              <label className="text-sm text-gray-600 dark:text-gray-400">Backup every</label>
              <select
                value={autoBackupFrequency}
                onChange={(e) => setAutoBackupFrequency(parseInt(e.target.value))}
                className="border border-gray-300 dark:border-slate-600 rounded-md p-2 bg-white dark:bg-slate-900 dark:text-white"
              >
                <option value={5}>5 minutes</option>
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={60}>1 hour</option>
              </select>
            </div>
          )}
        </div>
        
        {/* Username Display */}
        <div className="p-6 bg-gray-50 dark:bg-slate-800">
          <div className="mb-4">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Current Username</label>
            <input
              type="text"
              value={currentUsername}
              readOnly
              className="w-full border border-gray-300 dark:border-slate-600 rounded-md p-3 outline-none bg-gray-100 dark:bg-slate-900 dark:text-gray-400 font-bold"
            />
          </div>
          <button
            onClick={openChangeAuthModal}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-md shadow-sm w-full md:w-auto transition-all"
          >
            Change Username/Password
          </button>
        </div>
      </div>

      {/* Auth Modal */}
      {authModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full mx-4">
            <div className="bg-purple-900 dark:bg-purple-950 p-6 border-b-4 border-purple-500">
              <h3 className="text-xl font-bold text-white uppercase tracking-wider">
                {authModalStep === 'verify' ? 'Verify Current Password' : 'Change Username/Password'}
              </h3>
            </div>
            
            <div className="p-6">
              {authModalStep === 'verify' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Current Password</label>
                    <input
                      type="password"
                      value={authModalCurrentPassword}
                      onChange={(e) => setAuthModalCurrentPassword(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') verifyCurrentPassword(); }}
                      className="w-full border border-gray-300 dark:border-slate-600 rounded-md p-3 outline-none focus:ring-2 focus:ring-purple-500 dark:bg-slate-900 dark:text-white"
                      placeholder="Enter current password"
                      autoFocus
                    />
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={closeChangeAuthModal}
                      className="flex-1 bg-gray-300 dark:bg-slate-700 text-gray-800 dark:text-white font-bold py-3 px-6 rounded-md transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={verifyCurrentPassword}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-md transition-all"
                    >
                      Verify
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">New Username</label>
                    <input
                      type="text"
                      value={authModalNewUsername}
                      onChange={(e) => setAuthModalNewUsername(e.target.value)}
                      className="w-full border border-gray-300 dark:border-slate-600 rounded-md p-3 outline-none focus:ring-2 focus:ring-purple-500 dark:bg-slate-900 dark:text-white"
                      placeholder="Enter new username"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">New Password</label>
                    <input
                      type="password"
                      value={authModalNewPassword}
                      onChange={(e) => setAuthModalNewPassword(e.target.value)}
                      className="w-full border border-gray-300 dark:border-slate-600 rounded-md p-3 outline-none focus:ring-2 focus:ring-purple-500 dark:bg-slate-900 dark:text-white"
                      placeholder="Enter new password"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Confirm Password</label>
                    <input
                      type="password"
                      value={authModalConfirmPassword}
                      onChange={(e) => setAuthModalConfirmPassword(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') submitAuthChange(); }}
                      className="w-full border border-gray-300 dark:border-slate-600 rounded-md p-3 outline-none focus:ring-2 focus:ring-purple-500 dark:bg-slate-900 dark:text-white"
                      placeholder="Confirm new password"
                    />
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={closeChangeAuthModal}
                      className="flex-1 bg-gray-300 dark:bg-slate-700 text-gray-800 dark:text-white font-bold py-3 px-6 rounded-md transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={submitAuthChange}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-md transition-all"
                    >
                      Update
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* DATABASE MANAGEMENT */}
      <div className="bg-white dark:bg-slate-800 shadow-md rounded-2xl overflow-hidden border border-gray-200 dark:border-slate-700 transition-colors">
        <div className="bg-blue-900 dark:bg-blue-950 p-6 border-b-4 border-blue-500 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white uppercase tracking-wider">Database Backup & Security</h2>
            <p className="text-blue-200 text-sm mt-1">Naka-save ang data sa hard drive ng laptop. Pwede mong i-download ito as backup.</p>
          </div>
          <button onClick={downloadBackup} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-all flex items-center gap-2">
            ⬇️ DOWNLOAD BACKUP FILE
          </button>
        </div>
      </div>
      <div className="mt-6 p-4 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">
          Database Storage Location
        </h3>
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-4 flex items-center">
          <span className="whitespace-nowrap mr-2">Current path:</span>
          <input
            type="text"
            value={saveLocation}
            onChange={(e) => {
              setSaveLocation(e.target.value);
              localStorage.setItem('oms_custom_path', e.target.value);
            }}
            placeholder="Choose a folder to save your database"
            className="flex-1 p-2 rounded border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-mono text-slate-600 dark:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all"
          />
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleFolderPick}
            className="bg-slate-700 hover:bg-slate-800 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-all"
          >
            Change Save Folder
          </button>
          <button
            onClick={handleLoadDatabase}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-all"
          >
            📂 Load Existing Records
          </button>
          <button
            onClick={copyDiagnostics}
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-all"
          >
            Copy Diagnostics
          </button>
        </div>
        <div className="mt-4 rounded-md border border-amber-300/40 bg-amber-100/50 dark:bg-amber-900/20 p-3">
          <p className="text-xs font-bold uppercase tracking-wide text-amber-800 dark:text-amber-200">
            Runtime: {runtimeMode === 'electron' ? (isIpcReady ? 'Electron + IPC Ready' : 'Electron + IPC Missing') : 'Browser Mode'}
          </p>
          <p className="mt-1 text-xs text-amber-700 dark:text-amber-100/90">{runtimeHint}</p>
        </div>
        <p className="mt-4 p-2 bg-black text-red-500 text-xs font-mono font-bold rounded">
          {'>'} LOG: {debugLog}
        </p>
      </div>

      {/* PUROK MANAGEMENT */}
      <div className="bg-white dark:bg-slate-800 shadow-md rounded-2xl overflow-hidden border border-gray-200 dark:border-slate-700 transition-colors">
        <div className="bg-orange-800 dark:bg-orange-950 p-6 border-b-4 border-orange-500">
          <h2 className="text-xl font-bold text-white uppercase tracking-wider">Pamamahala ng Purok <span className="text-xs text-orange-300 normal-case">(Purok - Grupo Management)</span></h2>
          <p className="text-orange-200 text-sm mt-1">I-setup ang mga Purok at kung ilang grupo ang sakop nilang bawat isa.</p>
        </div>

        <div className="p-6 bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 flex gap-4 items-end flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Pangalan / Bilang ng Purok <span className="text-gray-400 normal-case">(Purok Name)</span></label>
            <input
              type="text"
              value={newPurokName}
              onChange={(e) => setNewPurokName(e.target.value.toUpperCase())}
              onKeyDown={(e) => { if (e.key === 'Enter') addPurok(); }}
              placeholder="e.g. PUROK 1"
              className="w-full border border-gray-300 dark:border-slate-600 rounded-md p-3 outline-none focus:ring-2 focus:ring-orange-500 uppercase dark:bg-slate-900 dark:text-white"
            />
          </div>
          <div className="w-40">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Ilan ang Grupo? <span className="text-gray-400 normal-case">(Groups)</span></label>
            <input
              type="number"
              min="0"
              value={newPurokGroupCount}
              onChange={(e) => setNewPurokGroupCount(parseInt(e.target.value) || 0)}
              onKeyDown={(e) => { if (e.key === 'Enter') addPurok(); }}
              className="w-full border border-gray-300 dark:border-slate-600 rounded-md p-3 outline-none focus:ring-2 focus:ring-orange-500 dark:bg-slate-900 dark:text-white font-black"
            />
          </div>
          <button onClick={addPurok} className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-md shadow-sm">
            + ADD PUROK
          </button>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto">
          {purokList && purokList.map(purok => (
            <div key={purok.id} className="flex justify-between items-center p-4 border border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 shadow-sm transition-colors">
              <div>
                <span className="block font-black text-lg text-gray-800 dark:text-white uppercase">{purok.name}</span>
                <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase">{purok.groupCount} Grupo</span>
              </div>
              <button onClick={() => deletePurok(purok.id)} className="text-red-500 hover:text-red-700 font-bold px-3 py-1 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-xs transition-colors">
                BURAHIN
              </button>
            </div>
          ))}
          {(!purokList || purokList.length === 0) && (
            <div className="col-span-full p-8 text-center text-gray-400 italic">
              Walang naka-save na Purok. (No Purok saved).
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 shadow-md rounded-2xl overflow-hidden border border-gray-200 dark:border-slate-700 transition-colors">
        <div className="bg-gray-800 dark:bg-slate-900 p-6 border-b-4 border-slate-600 flex justify-between items-center relative">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white uppercase tracking-wider">Mga Tungkulin (Department Roles)</h2>
            <p className="text-gray-400 text-sm mt-1">Magdagdag ng department, target, at mga sub-roles.</p>
          </div>
          <button
            onClick={() => setBulkImportModalOpen(true)}
            className="bg-slate-600 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-lg shadow-sm transition-all text-sm cursor-pointer relative z-10 ml-4"
          >
            Bulk Import
          </button>
        </div>

        <div className="p-6 bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Pangalan ng Tungkulin (Department)</label>
            <input
              type="text"
              value={newDeptName}
              onChange={(e) => setNewDeptName(e.target.value.toUpperCase())}
              onKeyDown={(e) => { if (e.key === 'Enter') addDepartment(); }}
              className="w-full border border-gray-300 dark:border-slate-600 rounded-md p-3 outline-none focus:ring-2 focus:ring-slate-500 uppercase dark:bg-slate-900 dark:text-white"
            />
          </div>
          <div className="w-32">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Target</label>
            <input
              type="number"
              value={newDeptTarget}
              onChange={(e) => setNewDeptTarget(parseInt(e.target.value) || 0)}
              onKeyDown={(e) => { if (e.key === 'Enter') addDepartment(); }}
              className="w-full border border-gray-300 dark:border-slate-600 rounded-md p-3 outline-none focus:ring-2 focus:ring-slate-500 dark:bg-slate-900 dark:text-white"
            />
          </div>
          <button onClick={addDepartment} className="bg-slate-700 hover:bg-slate-800 text-white font-bold py-3 px-6 rounded-md shadow-sm">
            + ADD DEPT
          </button>
        </div>

        <div className="p-8 space-y-8 max-h-[600px] overflow-y-auto">
          {departments.map(dept => (
            <div key={dept.id} className="border border-gray-200 dark:border-slate-600 rounded-xl p-5 shadow-sm bg-white dark:bg-slate-900 transition-colors">
              <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-700 pb-4 mb-4">
                <span className="font-black text-lg text-gray-800 dark:text-white uppercase">{dept.name}</span>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-gray-400">Target Qty:</span>
                  <input
                    type="number"
                    value={dept.target}
                    onChange={(e) => updateDeptTarget(dept.id, parseInt(e.target.value) || 0)}
                    className="w-20 border border-gray-300 dark:border-slate-600 rounded-md p-2 text-center font-black text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-slate-500 bg-gray-50 dark:bg-slate-800"
                  />
                  <button onClick={() => deleteDepartment(dept.id)} className="text-red-500 hover:text-red-700 font-bold px-2 ml-2">DELETE DEPT</button>
                </div>
              </div>

              <div className="pl-4 border-l-4 border-green-100 dark:border-green-900/50">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-400 uppercase mb-3">Magdagdag ng mga Sub-Role (Gampanin):</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {dept.specificRoles?.length === 0 && <span className="text-xs text-gray-400 italic">Walang naka-save na sub-roles.</span>}
                  {dept.specificRoles?.map((role: string) => (
                    <span key={role} className="bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 text-xs px-3 py-1.5 rounded-full font-bold flex items-center gap-2 shadow-sm">
                      {role}
                      <button onClick={() => removeSpecificRole(dept.id, role)} className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 text-lg leading-none">&times;</button>
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newRoleInputs[dept.id] || ''}
                    onChange={(e) => setNewRoleInputs({ ...newRoleInputs, [dept.id]: e.target.value.toUpperCase() })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSpecificRole(dept.id);
                      }
                    }}
                    className="border border-gray-300 dark:border-slate-600 rounded-md p-2 text-sm outline-none focus:ring-2 focus:ring-slate-500 w-64 uppercase dark:bg-slate-800 dark:text-white"
                  />
                  <button onClick={() => addSpecificRole(dept.id)} className="bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-800 dark:text-white font-bold py-2 px-4 rounded-md text-sm transition-colors">
                    Add Role
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bulk Import Departments Modal */}
      {bulkImportModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col">
            <div className="bg-gray-800 dark:bg-slate-900 p-6 border-b-4 border-slate-600">
              <h3 className="text-xl font-bold text-white uppercase tracking-wider">Bulk Import Departments</h3>
              <p className="text-gray-400 text-sm mt-1">Paste your department data in the format below</p>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto">
              <div className="bg-gray-50 dark:bg-slate-900 rounded-lg p-4 mb-4 text-xs text-gray-600 dark:text-gray-400 font-mono">
                <p className="font-bold mb-2 uppercase">Format:</p>
                <pre className="whitespace-pre-wrap">
Department Name, Target: 10
    - Sub Role 1
    - Sub Role 2

Another Department
    - Sub Role A
                </pre>
              </div>
              
              <div className="flex gap-4 mb-4">
                <input
                  ref={deptFileInputRef}
                  type="file"
                  accept=".txt,.docx,.pdf"
                  onChange={handleDeptFileChange}
                  className="hidden"
                />
                <button
                  onClick={() => deptFileInputRef.current?.click()}
                  className="flex-1 bg-slate-600 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-lg shadow-sm transition-all text-sm cursor-pointer"
                >
                  📁 Select File (.txt, .docx, .pdf)
                </button>
                {bulkImportFile && (
                  <span className="flex-1 text-xs text-gray-600 dark:text-gray-400 py-2 px-4 bg-gray-100 dark:bg-slate-900 rounded-lg truncate">
                    {bulkImportFile.name}
                  </span>
                )}
              </div>

              <textarea
                value={bulkImportText}
                onChange={(e) => setBulkImportText(e.target.value)}
                placeholder="Paste your department data here or select a file..."
                className="w-full h-48 p-4 border border-gray-300 dark:border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-slate-500 dark:bg-slate-900 dark:text-white font-mono text-sm"
              />
            </div>
            
            <div className="p-6 border-t border-gray-200 dark:border-slate-700 flex gap-4">
              <button
                onClick={() => {
                  setBulkImportModalOpen(false);
                  setBulkImportText('');
                  setBulkImportFile(null);
                }}
                className="flex-1 bg-gray-300 dark:bg-slate-700 text-gray-800 dark:text-white font-bold py-3 px-6 rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (bulkImportText.trim()) {
                    bulkImportDepartments(bulkImportText);
                    setBulkImportModalOpen(false);
                    setBulkImportText('');
                    setBulkImportFile(null);
                  } else {
                    showToast('Please enter department data before importing', 'error');
                  }
                }}
                className="flex-1 bg-slate-600 hover:bg-slate-700 text-white font-bold py-3 px-6 rounded-lg transition-all cursor-pointer relative z-10"
              >
                Import
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
