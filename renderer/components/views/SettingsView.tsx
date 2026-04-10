
import React from 'react';

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
  debugLog: string;
  newDeptName: string;
  setNewDeptName: (val: string) => void;
  newDeptTarget: number;
  setNewDeptTarget: (val: number) => void;
  addDepartment: () => void;
  departments: any[];
  updateDeptTarget: (id: string, target: number) => void;
  deleteDepartment: (id: string) => void;
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
  bulkImportOfficers?: (officers: any[]) => void;
}

export default function SettingsView({
  newPassword, setNewPassword,
  confirmPassword, setConfirmPassword,
  showToast, downloadBackup,
  saveLocation, setSaveLocation,
  handleFolderPick, handleLoadDatabase,
  debugLog,
  newDeptName, setNewDeptName,
  newDeptTarget, setNewDeptTarget,
  addDepartment, departments,
  updateDeptTarget, deleteDepartment,
  newRoleInputs, setNewRoleInputs,
  addSpecificRole, removeSpecificRole,
  purokList, newPurokName, setNewPurokName,
  newPurokGroupCount, setNewPurokGroupCount,
  addPurok, deletePurok,
  bulkImportOfficers
}: SettingsViewProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = React.useState(false);

  const handleBulkImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      const XLSX = await import('xlsx');
      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          const arrayBuffer = event.target?.result as ArrayBuffer;
          const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const data = XLSX.utils.sheet_to_json(worksheet);

          if (data.length === 0) {
            showToast('No data found in the Excel file!', 'error');
            return;
          }

          const importedOfficers = data.map((row: any) => ({
            id: Math.random().toString(36).substr(2, 9),
            firstName: row['First Name'] || row['firstName'] || '',
            lastNameFather: row['Last Name (Father)'] || row['lastNameFather'] || '',
            lastNameMother: row['Last Name (Mother)'] || row['lastNameMother'] || '',
            lastNameSpouse: row['Last Name (Spouse)'] || row['lastNameSpouse'] || '',
            suffix: row['Suffix'] || row['suffix'] || '',
            gender: row['Gender'] || row['gender'] || 'LALAKI',
            bday: row['Birthday'] || row['bday'] || '',
            petsaKasal: row['Date of Marriage'] || row['petsaKasal'] || '',
            registry: row['Registry No.'] || row['registry'] || '',
            kapisanan: row['Kapisanan'] || row['kapisanan'] || 'BUKLOD',
            purok: row['Purok'] || row['purok'] || '',
            grupo: row['Grupo'] || row['grupo'] || '',
            tungkulinList: [],
            lastModified: new Date().toISOString(),
            isNew: false,
          }));

          if (bulkImportOfficers) {
            bulkImportOfficers(importedOfficers);
          }

          showToast(`✅ Successfully imported ${importedOfficers.length} officers!`, 'success');
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        } catch (parseError) {
          console.error('Parse error:', parseError);
          showToast('Error parsing Excel file. Please check the format.', 'error');
        } finally {
          setIsImporting(false);
        }
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('Import error:', error);
      showToast('Error importing file', 'error');
      setIsImporting(false);
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
          <p className="text-purple-200 text-sm mt-1">Palitan ang system password na ginagamit sa pag-login.</p>
        </div>
        <div className="p-6 bg-gray-50 dark:bg-slate-800 flex gap-4 items-end flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-gray-300 dark:border-slate-600 rounded-md p-3 outline-none focus:ring-2 focus:ring-purple-500 dark:bg-slate-900 dark:text-white"
              placeholder="Enter new password"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-gray-300 dark:border-slate-600 rounded-md p-3 outline-none focus:ring-2 focus:ring-purple-500 dark:bg-slate-900 dark:text-white"
              placeholder="Confirm new password"
            />
          </div>
          <button
            onClick={() => {
              if (newPassword && newPassword === confirmPassword) {
                localStorage.setItem('oms_system_password', newPassword);
                showToast("Password updated successfully!");
                setNewPassword('');
                setConfirmPassword('');
              } else {
                showToast("Passwords do not match or are empty!", "error");
              }
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-md shadow-sm w-full md:w-auto transition-all"
          >
            UPDATE PASSWORD
          </button>
        </div>
      </div>

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
            placeholder="E.g. C:\Users\Documents or choose folder below..."
            className="flex-1 p-2 rounded border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-mono text-emerald-600 dark:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-[#006B3F] transition-all"
          />
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleFolderPick}
            className="bg-[#006B3F] hover:bg-[#004d2d] text-white font-bold py-3 px-6 rounded-lg shadow-md transition-all"
          >
            Change Save Folder
          </button>
          <button
            onClick={handleLoadDatabase}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-all"
          >
            📂 Load Existing Records
          </button>
        </div>
        <p className="mt-4 p-2 bg-black text-red-500 text-xs font-mono font-bold rounded">
          {'>'} LOG: {debugLog}
        </p>
      </div>

      {/* BULK IMPORT SECTION */}
      <div className="bg-white dark:bg-slate-800 shadow-md rounded-2xl overflow-hidden border border-gray-200 dark:border-slate-700 transition-colors">
        <div className="bg-teal-900 dark:bg-teal-950 p-6 border-b-4 border-teal-500">
          <h2 className="text-xl font-bold text-white uppercase tracking-wider">Bulk Import Officers</h2>
          <p className="text-teal-200 text-sm mt-1">I-upload ang Excel file upang mag-import ng maraming officers sa isang pagkakataon.</p>
        </div>
        <div className="p-6 bg-gray-50 dark:bg-slate-800 flex flex-col gap-4">
          <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg p-4">
            <h3 className="text-sm font-bold text-teal-900 dark:text-teal-300 mb-2 uppercase">Excel Format Required:</h3>
            <ul className="text-xs text-teal-800 dark:text-teal-300 space-y-1 ml-4 list-disc">
              <li>First Name</li>
              <li>Last Name (Father)</li>
              <li>Last Name (Mother)</li>
              <li>Last Name (Spouse) - for female officers</li>
              <li>Suffix - optional (Jr., Sr., etc.)</li>
              <li>Gender - LALAKI or BABAE</li>
              <li>Birthday - YYYY-MM-DD format</li>
              <li>Date of Marriage - YYYY-MM-DD format</li>
              <li>Registry No.</li>
              <li>Kapisanan - BUKLOD, KADIWA, or BINHI</li>
              <li>Purok - area number</li>
              <li>Grupo - group number</li>
            </ul>
          </div>

          <div className="flex gap-4 items-center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleBulkImport}
              disabled={isImporting}
              className="flex-1 p-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 cursor-pointer"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              className="bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-all whitespace-nowrap"
            >
              {isImporting ? 'Importing...' : '📤 Select File'}
            </button>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
            <p className="text-xs text-yellow-800 dark:text-yellow-300 font-bold">
              ⚠️ Tip: Make sure your Excel file has headers in the first row matching the column names listed above.
            </p>
          </div>
        </div>
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
        <div className="bg-gray-800 dark:bg-slate-900 p-6 border-b-4 border-[#CE1126]">
          <h2 className="text-xl font-bold text-white uppercase tracking-wider">Mga Tungkulin (Department Roles)</h2>
          <p className="text-gray-400 text-sm mt-1">Magdagdag ng department, target, at mga sub-roles.</p>
        </div>

        <div className="p-6 bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Pangalan ng Tungkulin (Department)</label>
            <input
              type="text"
              value={newDeptName}
              onChange={(e) => setNewDeptName(e.target.value.toUpperCase())}
              onKeyDown={(e) => { if (e.key === 'Enter') addDepartment(); }}
              className="w-full border border-gray-300 dark:border-slate-600 rounded-md p-3 outline-none focus:ring-2 focus:ring-[#006B3F] uppercase dark:bg-slate-900 dark:text-white"
            />
          </div>
          <div className="w-32">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Target</label>
            <input
              type="number"
              value={newDeptTarget}
              onChange={(e) => setNewDeptTarget(parseInt(e.target.value) || 0)}
              onKeyDown={(e) => { if (e.key === 'Enter') addDepartment(); }}
              className="w-full border border-gray-300 dark:border-slate-600 rounded-md p-3 outline-none focus:ring-2 focus:ring-[#006B3F] dark:bg-slate-900 dark:text-white"
            />
          </div>
          <button onClick={addDepartment} className="bg-[#006B3F] hover:bg-[#004d2d] text-white font-bold py-3 px-6 rounded-md shadow-sm">
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
                    className="w-20 border border-gray-300 dark:border-slate-600 rounded-md p-2 text-center font-black text-[#006B3F] dark:text-green-400 outline-none focus:ring-2 focus:ring-[#006B3F] bg-gray-50 dark:bg-slate-800"
                  />
                  <button onClick={() => deleteDepartment(dept.id)} className="text-red-500 hover:text-red-700 font-bold px-2 ml-2">DELETE DEPT</button>
                </div>
              </div>

              <div className="pl-4 border-l-4 border-green-100 dark:border-green-900/50">
                <p className="text-xs font-bold text-[#006B3F] dark:text-green-500 uppercase mb-3">Magdagdag ng mga Sub-Role (Gampanin):</p>

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
                    className="border border-gray-300 dark:border-slate-600 rounded-md p-2 text-sm outline-none focus:ring-2 focus:ring-[#006B3F] w-64 uppercase dark:bg-slate-800 dark:text-white"
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
    </div>
  );
}
