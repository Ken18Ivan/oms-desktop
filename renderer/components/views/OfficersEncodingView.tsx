import React, { useRef, useState } from 'react';
import { Plus, FileSpreadsheet, ArrowLeft, Calendar, User } from 'lucide-react';

interface OfficersEncodingViewProps {
  handleNavigation: (view: 'DASHBOARD' | 'DATABASE' | 'PROFILE' | 'SETTINGS' | 'ENCODING') => void;
  bulkImportOfficers: (importedOfficers: any[]) => void;
  officers: any[];
  addNewOfficer: () => void;
}

export default function OfficersEncodingView({ handleNavigation, bulkImportOfficers, officers, addNewOfficer }: OfficersEncodingViewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState<boolean>(false);

  const handleBulkImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      // Parse Excel file (simplified - in real implementation use xlsx library)
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      const importedOfficers = lines.slice(1).map((line, index) => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        
        // Parse tungkulin (comma-separated)
        const tungkulinStr = values[12] || '';
        const tungkulinNames = tungkulinStr ? tungkulinStr.split(',').map((t: string) => t.trim()) : [];
        
        // Parse dates (MM-DD-YYYY format)
        const parseDate = (dateStr: string) => {
          if (!dateStr) return '';
          const parts = dateStr.split('-');
          if (parts.length === 3) {
            const [month, day, year] = parts;
            return `${year}-${month}-${day}`; // Convert to YYYY-MM-DD
          }
          return dateStr;
        };
        
        // Build tungkulinList
        const tungkulinList = tungkulinNames.map((name: string) => ({
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name,
          scope: 'PANLOKAL',
          inOathDate: parseDate(values[13] || ''), // Petsa Nanumpa
          inOathRef: '',
          inDate: parseDate(values[14] || ''), // Petsa Nag-IN
          inTransferDate: '',
          outDropDate: parseDate(values[15] || ''), // Nabawas
          outDropRef: '',
          outTransferDate: '',
          status: values[16] || 'ACTIVE', // Status
          code: '',
          inactiveDate: ''
        }));
        
        return {
          id: `imported-${Date.now()}-${index}`,
          firstName: values[0] || '',
          lastNameFather: values[1] || '',
          lastNameMother: values[2] || '',
          lastNameSpouse: values[3] || '',
          suffix: values[4] || '',
          gender: values[5] || 'LALAKI',
          birthday: values[6] || '',
          marriageDate: values[7] || '',
          registry: values[8] || '',
          kapisanan: values[9] || 'BUKLOD',
          purok: values[10] || '',
          grupo: values[11] || '',
          status: values[16] || 'ACTIVE',
          tungkulinList,
          dateEncoded: new Date().toISOString(),
          isNew: true
        };
      });

      bulkImportOfficers(importedOfficers);
      alert(`Successfully imported ${importedOfficers.length} officers!`);
    } catch (error) {
      alert('Error importing file. Please check the format.');
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Get latest encoded officers (last 10)
  const latestEncoded = officers
    .filter(o => o.dateEncoded)
    .sort((a, b) => new Date(b.dateEncoded).getTime() - new Date(a.dateEncoded).getTime())
    .slice(0, 10);

  return (
    <div className="space-y-6 animate-fadeIn no-print font-sans max-w-[1400px] mx-auto">
      <div className="flex items-center gap-4 border-b border-gray-300 dark:border-slate-700 pb-4">
        <button
          onClick={() => handleNavigation('DASHBOARD')}
          className="p-2 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
        <div>
          <h2 className="text-3xl font-black text-gray-800 dark:text-white uppercase tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-8 h-8 text-slate-600 dark:text-slate-400" />
            Officers Encoding
          </h2>
          <p className="text-gray-500 font-medium text-sm mt-1">
            Add new records or bulk import officers
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN - ADD RECORD & BULK IMPORT */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* ADD RECORD CARD */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-gray-200 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-4 border-b border-gray-100 dark:border-slate-700 pb-4">
              <Plus className="w-5 h-5 text-slate-600" />
              <h3 className="font-black text-gray-800 dark:text-white uppercase tracking-wider text-sm">Add New Record</h3>
            </div>
            <button
              onClick={addNewOfficer}
              className="w-full bg-slate-700 hover:bg-slate-800 text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              <span>Create New Officer Profile</span>
            </button>
          </div>

          {/* BULK IMPORT CARD */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-gray-200 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-4 border-b border-gray-100 dark:border-slate-700 pb-4">
              <FileSpreadsheet className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <h3 className="font-black text-gray-800 dark:text-white uppercase tracking-wider text-sm">Bulk Import Officers</h3>
            </div>
            
            <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg p-4 mb-4">
              <h4 className="text-sm font-bold text-teal-900 dark:text-teal-300 mb-2 uppercase">Excel Format Required:</h4>
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
                <li>Tungkulin - comma-separated for multiple roles (optional)</li>
                <li>Petsa Nanumpa - MM-DD-YYYY format (optional)</li>
                <li>Petsa Nag-IN - MM-DD-YYYY format, only for R2-04 IN (optional)</li>
                <li>Nabawas - MM-DD-YYYY format (optional)</li>
                <li>Status - ACTIVE, INACTIVE, or leave blank (optional)</li>
              </ul>
            </div>

            <div className="flex gap-4 items-center mb-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleBulkImport}
                disabled={isImporting}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isImporting}
                className="bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-all whitespace-nowrap cursor-pointer relative z-10"
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

        {/* RIGHT COLUMN - LATEST ENCODED OFFICERS */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-4 border-b border-gray-100 dark:border-slate-700 pb-4">
            <Calendar className="w-5 h-5 text-slate-600" />
            <h3 className="font-black text-gray-800 dark:text-white uppercase tracking-wider text-sm">Latest Encoded Officers</h3>
          </div>

          {latestEncoded.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm font-bold bg-gray-50 dark:bg-slate-900/50 rounded-2xl">
              No officers encoded yet.
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {latestEncoded.map((officer, index) => (
                <div
                  key={officer.id}
                  className="p-4 rounded-xl bg-gray-50 dark:bg-slate-900/80 border border-gray-100 dark:border-slate-700/50 hover:border-slate-500 dark:hover:border-slate-500 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="bg-slate-600 dark:bg-slate-500 p-2 rounded-full flex-shrink-0">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-black text-sm text-gray-800 dark:text-white uppercase truncate">
                        {officer.firstName} {officer.lastNameFather}
                      </div>
                      <div className="text-[10px] font-bold text-gray-500 dark:text-gray-400 mt-1">
                        Registry: {officer.registry || 'N/A'}
                      </div>
                      <div className="text-[10px] font-bold text-slate-600 dark:text-slate-400 mt-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {officer.dateEncoded ? new Date(officer.dateEncoded).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
