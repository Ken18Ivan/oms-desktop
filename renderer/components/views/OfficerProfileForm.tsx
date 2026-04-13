import React from 'react';
import { AlertCircle } from 'lucide-react';
import { formatFullName } from '../../utils';

interface OfficerProfileFormProps {
    formState: any;
    setFormState: (val: any) => void;
    handleFormChange: (field: string, value: string) => void;
    handleTungkulinChange: (id: string, field: string, value: string) => void;
    addTungkulinRow: () => void;
    removeTungkulinRow: (idToRemove: string) => void;
    invalidFields: string[];
    setInvalidFields: (val: any) => void;
    activeDropdown: { id: string, field: string, query?: string } | null;
    setActiveDropdown: (val: any) => void;
    focusedIndex: number;
    setFocusedIndex: (val: any) => void;
    allRolesMasterList: string[];
    handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>, id: string, currentValue: string) => void;
    saveOfficer: () => Promise<void>;
    deleteOfficer: (id: string) => void;
    isPatotooView: boolean;
    setIsPatotooView: (val: boolean) => void;
    patotooData: any;
    setPatotooData: (val: any) => void;
    setView: (view: 'DASHBOARD' | 'DATABASE' | 'PROFILE' | 'SETTINGS') => void;
    purokList: { id: string, name: string, groupCount: number }[];
    confirmModalState: { isOpen: boolean; title: string; message: string; onConfirm: () => void; isDestructive?: boolean } | null;
    setConfirmModalState: (val: { isOpen: boolean; title: string; message: string; onConfirm: () => void; isDestructive?: boolean } | null) => void;
    departments: { id: string, name: string, target: number, specificRoles?: string[] }[];
    officers: any[];
}

export default function OfficerProfileForm({
    formState,
    setFormState,
    handleFormChange,
    handleTungkulinChange,
    addTungkulinRow,
    removeTungkulinRow,
    invalidFields,
    setInvalidFields,
    activeDropdown,
    setActiveDropdown,
    focusedIndex,
    setFocusedIndex,
    allRolesMasterList,
    handleKeyDown,
    saveOfficer,
    deleteOfficer,
    isPatotooView,
    setIsPatotooView,
    patotooData,
    setPatotooData,
    setView,
    purokList,
    confirmModalState,
    setConfirmModalState,
    departments,
    officers
}: OfficerProfileFormProps) {
    if (!formState) return null;

    const [showPrintPreview, setShowPrintPreview] = React.useState(false);
    const [previewTab, setPreviewTab] = React.useState<'patotoo' | 'data'>('data');
    const [isFullscreen, setIsFullscreen] = React.useState(false);
    const [isExporting, setIsExporting] = React.useState(false);
    const [notification, setNotification] = React.useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [isDuplicateControlNumber, setIsDuplicateControlNumber] = React.useState(false);

    // Check if control number is duplicate
    const checkDuplicateControlNumber = (controlNum: string) => {
        if (!controlNum || !officers) {
            setIsDuplicateControlNumber(false);
            return;
        }
        const isDuplicate = officers.some(officer => 
            officer.controlNumber === controlNum && officer.id !== formState.id
        );
        setIsDuplicateControlNumber(isDuplicate);
    };

    const printWithTitle = (title: string) => {
        const originalTitle = document.title;
        document.title = title;
        window.print();
        document.title = originalTitle;
    };

    const exportToPDF = async (filename: string, isPrintStrip: boolean = false) => {
        try {
            setIsExporting(true);

            // Get the HTML content based on which template to export
            let htmlContent = '';
            if (isPrintStrip) {
                // For Print Data (Info Sheet) - build HTML dynamically with clean Palatino formatting
                const tungkulinRows = formState.tungkulinList?.filter((t: any) => t.name.trim() !== '').map((t: any) => {
                    const petsa = t.status === 'ACTIVE'
                        ? (t.inOathDate ? `${new Date(t.inOathDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : 'N/A')
                        : (t.outDropDate ? `${new Date(t.outDropDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : 'N/A');
                    return `<tr style="border: 1px solid black; height: 0.4in;">
            <td style="border: 1px solid black; padding: 0.1in 0.05in; font-size: 11pt; font-family: 'Palatino Linotype', serif;">${t.name}</td>
            <td style="border: 1px solid black; padding: 0.1in 0.05in; font-size: 11pt; text-align: center; font-family: 'Palatino Linotype', serif;">${petsa}</td>
            <td style="border: 1px solid black; padding: 0.1in 0.05in; font-size: 11pt; text-align: center; font-family: 'Palatino Linotype', serif;">${t.status}</td>
          </tr>`;
                }).join('') || '';

                htmlContent = `<!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { 
                font-family: "Palatino Linotype", "Book Antiqua", Palatino, serif; 
                width: 8.5in; 
                padding: 0.3in; 
                background: white; 
                color: black;
              }
              .title-1 {
                text-align: center;
                font-size: 14pt;
                font-weight: normal;
                letter-spacing: 0.15em;
                margin-bottom: 0.1in;
                font-family: "Palatino Linotype", serif;
              }
              .title-2 {
                text-align: center;
                font-size: 14pt;
                font-weight: normal;
                letter-spacing: 0.05em;
                margin-bottom: 0.25in;
                border-bottom: 2px solid black;
                padding-bottom: 0.1in;
                font-family: "Palatino Linotype", serif;
              }
              .info-row {
                display: flex;
                width: 100%;
                margin-bottom: 0;
                border: 1px solid black;
                min-height: 0.5in;
              }
              .info-box {
                flex: 1;
                border-right: 1px solid black;
                padding: 0.08in 0.1in;
                display: flex;
                flex-direction: column;
                justify-content: center;
              }
              .info-box:last-child {
                border-right: none;
              }
              .info-label {
                font-size: 9pt;
                font-weight: bold;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                margin-bottom: 0.05in;
                color: #333;
                font-family: "Palatino Linotype", serif;
              }
              .info-value {
                font-size: 12pt;
                font-weight: normal;
                text-transform: uppercase;
                font-family: "Palatino Linotype", serif;
              }
              .info-value.mono {
                font-family: "Courier New", monospace;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 0;
              }
              th {
                border: 1px solid black;
                padding: 0.12in 0.05in;
                text-align: center;
                font-size: 11pt;
                font-weight: bold;
                background-color: #f0f0f0;
                font-family: "Palatino Linotype", serif;
                text-transform: uppercase;
              }
              td {
                border: 1px solid black;
                padding: 0.1in 0.05in;
                font-size: 11pt;
                font-family: "Palatino Linotype", serif;
              }
            </style>
          </head>
          <body>
            <div class="title-1">Officer's Information Sheet</div>
            <div class="title-2">LOKAL NG ILIGAN CITY</div>
            
            <div class="info-row">
              <div class="info-box">
                <div class="info-label">First Name & Suffix</div>
                <div class="info-value">${formState.firstName || '-'} ${formState.suffix || ''}</div>
              </div>
              <div class="info-box">
                <div class="info-label">Apelyido sa Ina</div>
                <div class="info-value">${formState.lastNameMother || '-'}</div>
              </div>
              <div class="info-box">
                <div class="info-label">Apelyido sa Ama</div>
                <div class="info-value">${formState.lastNameFather || '-'}</div>
              </div>
            </div>
            
            <div class="info-row">
              <div class="info-box">
                <div class="info-label">Reg. No.</div>
                <div class="info-value mono">${formState.registry || 'N/A'}</div>
              </div>
              <div class="info-box">
                <div class="info-label">Control No.</div>
                <div class="info-value mono">${(formState.controlNumber || '').padStart(4, '0') || 'N/A'}</div>
              </div>
              <div class="info-box">
                <div class="info-label">BDAY</div>
                <div class="info-value">${formState.bday ? new Date(formState.bday).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase() : 'N/A'}</div>
              </div>
              <div class="info-box">
                <div class="info-label">KASAL</div>
                <div class="info-value">${formState.petsaKasal ? new Date(formState.petsaKasal).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase() : 'N/A'}</div>
              </div>
            </div>
            
            <table>
              <thead>
                <tr>
                  <th style="width: 40%; text-align: left;">Tungkulin</th>
                  <th style="width: 35%; text-align: center;">Petsa Nanumpa</th>
                  <th style="width: 25%; text-align: center;">Status</th>
                </tr>
              </thead>
              <tbody>
                ${tungkulinRows}
              </tbody>
            </table>
          </body>
          </html>`;
            } else {
                // For Patotoo - build HTML dynamically with customized data
                const selectedRoles = patotooData.selectedTungkulin && patotooData.selectedTungkulin.length > 0
                    ? formState.tungkulinList?.filter((t: any) => patotooData.selectedTungkulin.includes(t.id))
                    : formState.tungkulinList?.filter((t: any) => t.status === 'ACTIVE');
                
                const activeRoles = selectedRoles?.map((t: any) => t.name) || [];
                
                // Grammar adaptation: singular vs plural
                const rolePhrase = activeRoles.length === 1 ? 'ng kaniyang tungkulin:' : 'ng mga sumusunod na tungkulin:';
                
                // Build custom signatories HTML (user-added signatories)
                const customSigs = patotooData.customSignatories || [];
                
                // Layout: Custom signatories on top row, PD and Destinado on bottom row aligned
                const signatoriesHTML = `
                    <div style="margin-top: 1.2in; font-size: 16pt;">
                        ${customSigs.length > 0 ? `
                        <div style="margin-bottom: 0.8in; display: flex; gap: 0.5in;">
                            ${customSigs.map((sig: any) => `
                            <div style="text-align: center; width: 2.2in;">
                                <div style="height: 0.6in; display: flex; align-items: flex-end; justify-content: center; border-bottom: 1.5px solid black; margin-bottom: 0.1in;">${sig.name || ''}</div>
                                <div style="font-weight: normal; font-size: 14pt;">${sig.title || ''}</div>
                            </div>
                            `).join('')}
                        </div>
                        ` : ''}
                        <div style="display: flex; justify-content: space-between; align-items: flex-end;">
                            <div style="text-align: center; width: 2.2in;">
                                <div style="height: 0.6in; display: flex; align-items: flex-end; justify-content: center; border-bottom: 1.5px solid black; margin-bottom: 0.1in;">${patotooData.signatoryPD || ''}</div>
                                <div style="font-weight: normal; font-size: 14pt;">Pangulong Diakono</div>
                            </div>
                            <div style="text-align: center; width: 2.2in;">
                                <div style="height: 0.6in; display: flex; align-items: flex-end; justify-content: center; border-bottom: 1.5px solid black; margin-bottom: 0.1in;">${patotooData.signatoryDestinado || ''}</div>
                                <div style="font-weight: normal; font-size: 14pt;">Destinado</div>
                            </div>
                        </div>
                    </div>
                `;

                htmlContent = `<!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <style>
              * { margin: 0; padding: 0; }
              body { 
                font-family: "Palatino Linotype", "Book Antiqua", Palatino, serif;
                padding: 0.7in;
                width: 8.5in;
                line-height: 1.6;
              }
              .header { margin-bottom: 0.8in; line-height: 1.5; font-size: 14pt; }
              .date { margin-bottom: 0.6in; font-size: 14pt; }
              .title { text-align: center; margin: 0.4in 0; font-size: 18pt; text-decoration: underline; font-weight: bold; }
              .content { font-size: 14pt; line-height: 1.8; margin: 0.4in 0; }
              .content p { margin: 0.25in 0; }
              .content ul { margin-left: 0.5in; list-style: none; }
              .content li { margin: 0.1in 0; display: flex; }
              .content li span:first-child { width: 0.2in; margin-right: 0.2in; }
            </style>
          </head>
          <body>
            <div class="header">
              <p>IGLESIA NI CRISTO</p>
              <p>LOKAL NG ${patotooData.lokalName || '____________________'}</p>
              <p>DISTRITO NG ${patotooData.distritoName || '____________________'}</p>
            </div>
            
            <div class="date">
              <p>${patotooData.issueDate ? new Date(patotooData.issueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '____________________'}</p>
            </div>
            
            <div class="title">PATOTOO</div>
            
            <div class="content">
              <p>Sa Kinauukulan,</p>
              <p>Pinatutunayan namin na si kapatid na ${formatFullName(formState, formState.kapisanan)} ay masiglang tumutupad ${rolePhrase}</p>
              <ul>
                ${activeRoles.map((role: string) => `<li><span>■</span><span>${role}</span></li>`).join('')}
              </ul>
              <p>Hanggang dito na lamang po.</p>
              <p>Ang inyong mga kapatid sa Panginoon,</p>
            </div>
            
            ${signatoriesHTML}
          </body>
          </html>`;
            }

            // Use Electron IPC to save PDF with file dialog
            if (typeof window !== 'undefined' && window.ipc) {
                const result = await window.ipc.invoke('save-pdf-dialog', {
                    html: htmlContent,
                    filename: filename,
                    defaultPath: filename + '.pdf'
                });

                if (result.success) {
                    setNotification({ type: 'success', message: `PDF saved successfully!\nFile: ${result.filePath}` });
                    setTimeout(() => setNotification(null), 4000);
                    setShowPrintPreview(false);
                } else if (result.cancelled) {
                    // User cancelled the dialog
                } else {
                    setNotification({ type: 'error', message: `Error saving PDF: ${result.error}` });
                    setTimeout(() => setNotification(null), 4000);
                }
            } else {
                // Fallback to print dialog if IPC not available
                printWithTitle(filename);
            }
        } catch (error) {
            setNotification({ type: 'error', message: 'Error exporting PDF' });
            setTimeout(() => setNotification(null), 4000);
        } finally {
            setIsExporting(false);
        }
    };

    const officerName = formatFullName(formState, formState.kapisanan).replace(/\s+/g, '_') || 'Officer';
    const todayStr = new Date().toISOString().split('T')[0];

    return (
        <div className="animate-fadeIn no-print w-full">
            {/* ACTION BAR */}
            <div className="flex justify-end items-center p-4 md:px-8 border-b border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-900 transition-colors duration-300 gap-3">
                {!formState.isNew && (
                    <button onClick={() => { setIsPatotooView(false); setShowPrintPreview(true); setPreviewTab('data'); }} className="bg-blue-700 hover:bg-blue-800 text-white py-3 px-8 rounded-xl shadow-md transition-all text-sm font-semibold tracking-wide">
                        Preview (Info & Patotoo)
                    </button>
                )}
                {!formState.isNew && (
                    <button onClick={() => deleteOfficer(formState.id)} className="bg-red-700 hover:bg-red-800 text-white py-3 px-6 rounded-xl shadow-md transition-all text-sm font-semibold tracking-wide">
                        Delete
                    </button>
                )}
            </div>

            {/* FULL WIDTH PROFILE CONTENT */}
            <div className="w-full">
                <div className="bg-slate-100 dark:bg-slate-800 p-5 md:px-12 border-b border-stone-200 dark:border-slate-700 transition-colors duration-300">
                    <h3 className="text-lg font-semibold font-serif text-slate-700 dark:text-slate-300 tracking-normal max-w-[1400px] mx-auto">Mga Personal na Impormasyon</h3>
                </div>

                <div className="p-8 md:px-12 flex flex-col gap-6 w-full max-w-[1400px] mx-auto text-gray-900 dark:text-white font-semibold">
                    {/* Row 1: Registry, Control, Kasarian, Kapisanan */}
                    <div className="flex flex-col md:flex-row gap-4 w-full items-stretch">
                        <div className="flex-1 min-w-[180px]">
                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Registry Number <span className="text-gray-400 normal-case">(13-Char)</span> <span className="text-red-500">*</span></label>
                            {invalidFields.includes('registry') && <div className="flex items-center text-red-500 gap-1"><AlertCircle size={14} /><span className="text-[10px] font-semibold">Required</span></div>}
                            <input type="text" value={formState.registry || ''} onChange={(e) => { handleFormChange('registry', e.target.value); setInvalidFields((prev: any[]) => prev.filter(f => f !== 'registry')); }} maxLength={13} className={`w-full border rounded-xl p-3 outline-none font-mono font-medium transition-colors ${invalidFields.includes('registry') ? 'border-red-500 bg-red-50 dark:bg-red-900/20 focus:ring-2 focus:ring-red-500 text-red-900 dark:text-red-300' : 'border-stone-300 dark:border-slate-600 focus:ring-2 focus:ring-slate-500 bg-stone-50 dark:bg-slate-900 text-gray-900 dark:text-white'}`} />
                        </div>
                        <div className="w-20">
                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Control #</label>
                            {isDuplicateControlNumber && <div className="flex items-center text-red-500 gap-1 mb-2"><AlertCircle size={14} /><span className="text-[10px] font-semibold">Control # taken</span></div>}
                            <input type="text" value={formState.controlNumber || ''} onChange={(e) => { const val = e.target.value.replace(/\D/g, '').slice(0, 4); handleFormChange('controlNumber', val); checkDuplicateControlNumber(val); }} placeholder="0001" maxLength={4} className={`w-full border rounded-xl p-3 outline-none font-mono font-medium transition-colors ${isDuplicateControlNumber ? 'border-red-500 bg-red-50 dark:bg-red-900/20 focus:ring-2 focus:ring-red-500 text-red-900 dark:text-red-300' : 'border-stone-300 dark:border-slate-600 focus:ring-2 focus:ring-slate-500 bg-stone-50 dark:bg-slate-900 text-gray-900 dark:text-white'}`} />
                        </div>
                        <div className="flex-1 min-w-[140px]">
                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Kasarian<span className="text-gray-400 normal-case">(Gender)</span></label>
                            <select value={formState.gender || ''} onChange={(e) => handleFormChange('gender', e.target.value)} className="w-full border border-stone-300 dark:border-slate-600 rounded-xl p-3 outline-none bg-stone-50 dark:bg-slate-900 focus:ring-2 focus:ring-slate-500 font-medium dark:text-white transition-colors text-sm">
                                <option value="" disabled>PUMILI...</option>
                                <option value="LALAKI">LALAKI</option>
                                <option value="BABAE">BABAE</option>
                            </select>
                        </div>
                        <div className="flex-1 min-w-[180px]">
                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Kapisanan <span className="text-gray-400 normal-case">(Org)</span></label>
                            <select value={formState.kapisanan || ''} onChange={(e) => handleFormChange('kapisanan', e.target.value)} className="w-full border border-stone-300 dark:border-slate-600 rounded-xl p-3 outline-none bg-stone-50 dark:bg-slate-900 focus:ring-2 focus:ring-slate-500 font-medium dark:text-white transition-colors text-sm">
                                <option value="" disabled>PUMILI...</option>
                                <option value="BUKLOD">BUKLOD</option>
                                <option value="KADIWA">KADIWA</option>
                                <option value="BINHI">BINHI</option>
                            </select>
                        </div>
                    </div>

                    {/* Row 2: Unang Pangalan | Suffix | Apelyido sa Ina */}
                    <div className="flex flex-col md:flex-row gap-4 w-full items-end">
                        <div className="flex-1 min-w-[180px]">
                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400">Unang Pangalan <span className="text-gray-400 normal-case">(First Name)</span> <span className="text-red-500">*</span></label>
                            {invalidFields.includes('firstName') && <div className="flex items-center text-red-500 gap-1"><AlertCircle size={14} /><span className="text-[10px] font-semibold">Required</span></div>}
                            <input type="text" value={formState.firstName || ''} onChange={(e) => { handleFormChange('firstName', e.target.value); setInvalidFields((prev: any[]) => prev.filter(f => f !== 'firstName')); }} className={`w-full border rounded-xl p-3 outline-none font-medium transition-colors ${invalidFields.includes('firstName') ? 'border-red-500 bg-red-50 dark:bg-red-900/20 focus:ring-2 focus:ring-red-500 text-red-900 dark:text-red-300' : 'border-stone-300 dark:border-slate-600 focus:ring-2 focus:ring-slate-500 bg-stone-50 dark:bg-slate-900 text-gray-900 dark:text-white'}`} />
                        </div>
                        <div className="w-20">
                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400">Suffix</label>
                            <select value={formState.suffix || ''} onChange={(e) => handleFormChange('suffix', e.target.value)} className="w-full border border-stone-300 dark:border-slate-600 rounded-xl p-3 outline-none bg-stone-50 dark:bg-slate-900 focus:ring-2 focus:ring-slate-500 text-gray-900 dark:text-white transition-colors text-sm">
                                <option value="">(WALA)</option>
                                <option value="JR.">JR.</option>
                                <option value="SR.">SR.</option>
                                <option value="I">I</option>
                                <option value="II">II</option>
                                <option value="III">III</option>
                                <option value="IV">IV</option>
                                <option value="V">V</option>
                            </select>
                        </div>
                        <div className="flex-1 min-w-[180px]">
                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Apelyido sa Ina <span className="text-gray-400 normal-case">(Mother's Surname)</span></label>
                            <input type="text" value={formState.lastNameMother || ''} onChange={(e) => handleFormChange('lastNameMother', e.target.value)} className="w-full border border-stone-300 dark:border-slate-600 rounded-xl p-3 outline-none focus:ring-2 focus:ring-slate-500 bg-stone-50 dark:bg-slate-900 dark:text-white font-medium transition-colors" />
                        </div>
                    </div>

                    {/* Row 3: Apelyido sa Ama | Apelyido sa Asawa | Petsa ng Kapanganakan */}
                    <div className="flex flex-col md:flex-row gap-4 w-full items-end">
                        <div className="flex-1 min-w-[180px]">
                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400">Apelyido sa Ama <span className="text-gray-400 normal-case">(Father's Surname)</span> <span className="text-red-500">*</span></label>
                            {invalidFields.includes('lastNameFather') && <div className="flex items-center text-red-500 gap-1"><AlertCircle size={14} /><span className="text-[10px] font-semibold">Required</span></div>}
                            <input type="text" value={formState.lastNameFather || ''} onChange={(e) => { handleFormChange('lastNameFather', e.target.value); setInvalidFields((prev: any[]) => prev.filter(f => f !== 'lastNameFather')); }} className={`w-full border rounded-xl p-3 outline-none font-medium transition-colors ${invalidFields.includes('lastNameFather') ? 'border-red-500 bg-red-50 dark:bg-red-900/20 focus:ring-2 focus:ring-red-500 text-red-900 dark:text-red-300' : 'border-stone-300 dark:border-slate-600 focus:ring-2 focus:ring-slate-500 bg-stone-50 dark:bg-slate-900 text-gray-900 dark:text-white'}`} />
                        </div>
                        <div className="flex-1 min-w-[180px]">
                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Apelyido sa Asawa <span className="text-gray-400 dark:text-gray-500 normal-case font-normal">(Spouse Surname)</span></label>
                            <input type="text" value={formState.lastNameSpouse || ''} onChange={(e) => handleFormChange('lastNameSpouse', e.target.value)} className="w-full border border-stone-300 dark:border-slate-600 rounded-xl p-3 outline-none focus:ring-2 focus:ring-slate-500 bg-stone-50 dark:bg-slate-900 dark:text-white font-medium transition-colors" />
                        </div>
                        <div className="flex-1 min-w-[180px]">
                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Petsa ng Kapanganakan <span className="text-gray-400 normal-case">(Birthday)</span></label>
                            <input type="date" value={formState.bday || ''} onChange={(e) => handleFormChange('bday', e.target.value)} className="w-full border border-stone-300 dark:border-slate-600 rounded-xl p-3 outline-none focus:ring-2 focus:ring-slate-500 bg-stone-50 dark:bg-slate-900 font-medium text-gray-700 dark:text-white dark:[color-scheme:dark] transition-colors" />
                        </div>
                    </div>

                    {/* Row 4: Phone | Purok | Grupo */}
                    <div className="flex flex-col md:flex-row gap-4 w-full items-end">
                        <div className="w-56">
                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Phone <span className="text-gray-400 normal-case">+63</span></label>
                            <input type="text" value={formState.cellphone || ''} onChange={(e) => handleFormChange('cellphone', e.target.value)} placeholder="9XXXXXXXXX" maxLength={11} className="w-full border border-stone-300 dark:border-slate-600 rounded-xl p-3 outline-none focus:ring-2 focus:ring-slate-500 bg-stone-50 dark:bg-slate-900 font-mono font-medium text-gray-900 dark:text-white transition-colors" />
                        </div>
                        <div className="w-20">
                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Purok</label>
                            <select value={formState.purok || ''} onChange={(e) => { handleFormChange('purok', e.target.value); handleFormChange('grupo', ''); }} className="w-full border border-stone-300 dark:border-slate-600 rounded-xl p-3 outline-none focus:ring-2 focus:ring-slate-500 bg-stone-50 dark:bg-slate-900 dark:text-white font-semibold text-center transition-colors text-base">
                                <option value="">PUMILI...</option>
                                {purokList?.map((purok) => (
                                    <option key={purok.id} value={purok.name}>{purok.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="w-20">
                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Grupo</label>
                            <select value={formState.grupo || ''} onChange={(e) => handleFormChange('grupo', e.target.value)} disabled={!formState.purok} className="w-full border border-stone-300 dark:border-slate-600 rounded-xl p-3 outline-none focus:ring-2 focus:ring-slate-500 bg-stone-50 dark:bg-slate-900 dark:text-white font-semibold text-center transition-colors text-base disabled:opacity-50 disabled:cursor-not-allowed">
                                <option value="">PUMILI...</option>
                                {(() => {
                                    const selectedPurok = purokList?.find(p => p.name === formState.purok);
                                    if (selectedPurok && selectedPurok.groupCount > 0) {
                                        return Array.from({ length: selectedPurok.groupCount }, (_, i) => (
                                            <option key={i + 1} value={(i + 1).toString()}>{i + 1}</option>
                                        ));
                                    }
                                    return null;
                                })()}
                            </select>
                        </div>
                    </div>

                    {formState.kapisanan === 'BUKLOD' ? (
                        <div className="md:col-span-6 bg-rose-50 dark:bg-rose-900/10 p-4 rounded-xl border border-rose-200 dark:border-rose-900 shadow-sm flex items-center gap-6 transition-colors">
                            <label className="block text-sm font-semibold text-rose-700 dark:text-rose-400 whitespace-nowrap">Petsa ng Kasal:</label>
                            <input type="date" value={formState.petsaKasal || ''} onChange={(e) => handleFormChange('petsaKasal', e.target.value)} className="border border-stone-300 dark:border-slate-600 rounded-xl p-3 outline-none focus:ring-2 focus:ring-rose-500 bg-white dark:bg-slate-900 font-medium text-gray-700 dark:text-white dark:[color-scheme:dark] transition-colors" />
                        </div>
                    ) : (
                        <div className="md:col-span-6"></div>
                    )}


                </div>

                <div className="bg-slate-700 dark:bg-slate-950 p-6 md:px-12 border-y border-slate-600 dark:border-slate-800 mt-2 flex justify-between items-center transition-colors duration-300">
                    <h3 className="text-lg font-semibold font-serif text-white tracking-normal max-w-[1400px] w-full mx-auto flex justify-between items-center">
                        Hawak Na Tungkulin
                        <button onClick={addTungkulinRow} className="bg-white dark:bg-slate-700 text-gray-800 dark:text-white text-sm font-semibold py-2 px-5 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-600 shadow-sm transition-all">+ Add Tungkulin Row</button>
                    </h3>
                </div>

                <div className="w-full border-b dark:border-slate-700 px-4 md:px-12">
                    {/* HEADER ROW */}
                    <div className="grid grid-cols-[60px_1fr_180px_1.3fr_160px_90px_50px] gap-0 bg-stone-100 dark:bg-slate-900 text-sm text-gray-700 dark:text-gray-300 tracking-wide rounded-t-xl border border-stone-300 dark:border-slate-700 font-semibold">
                        <div className="text-center p-3 border-r border-stone-300 dark:border-slate-700">No</div>
                        <div className="p-3 border-r border-stone-300 dark:border-slate-700">Tungkulin</div>
                        <div className="text-center p-3 border-r border-stone-300 dark:border-slate-700">Uri / Type</div>
                        <div className="text-center p-3 border-r border-stone-300 dark:border-slate-700 bg-green-50/40 dark:bg-green-900/10">Remarks</div>
                        <div className="text-center p-3 border-r border-stone-300 dark:border-slate-700">Status</div>
                        <div className="text-center p-3 border-r border-stone-300 dark:border-slate-700">Code</div>
                        <div className="text-center p-3">Del</div>
                    </div>

                    {/* DATA ROWS */}
                    <div className="space-y-1 mt-1">
                        {formState.tungkulinList
                            ?.slice()
                            .sort((a: any, b: any) => {
                                const dateA = new Date(a.inOathDate || a.outDropDate || '0');
                                const dateB = new Date(b.inOathDate || b.outDropDate || '0');
                                return dateA.getTime() - dateB.getTime();
                            })
                            .map((tungkulin: any, index: number) => {

                            const isDropdownActive = activeDropdown?.id === tungkulin.id;
                            const filterQuery = (isDropdownActive && activeDropdown?.query !== undefined) ? activeDropdown?.query : tungkulin.name;
                            const currentSuggestions = allRolesMasterList.filter(opt =>
                                opt.toLowerCase().includes((filterQuery || '').toLowerCase())
                            );
                            const rowFocusedIndex = activeDropdown?.id === tungkulin.id ? focusedIndex : -1;

                            return (
                                <div key={tungkulin.id} className="grid grid-cols-[60px_1fr_180px_1.3fr_160px_90px_50px] gap-0 border border-t-0 border-stone-300 dark:border-slate-700 hover:bg-stone-50 dark:hover:bg-slate-800 transition-colors font-semibold text-sm text-gray-900 dark:text-white items-stretch">
                                    {/* NO */}
                                    <div className="text-center text-gray-500 dark:text-gray-400 bg-stone-50 dark:bg-slate-900 p-2 border-r border-stone-300 dark:border-slate-700 flex items-center justify-center font-mono text-sm">{index + 1}</div>

                                    {/* TUNGKULIN */}
                                    <div className="relative border-r border-stone-300 dark:border-slate-700 p-2 flex items-center">
                                        <input
                                            type="text"
                                            value={tungkulin.name || ''}
                                            placeholder={rowFocusedIndex >= 0 && currentSuggestions[rowFocusedIndex] ? currentSuggestions[rowFocusedIndex] : (isDropdownActive && currentSuggestions.length > 0 ? currentSuggestions[0] : '')}
                                            onFocus={() => {
                                                setActiveDropdown({ id: tungkulin.id, field: 'name', query: tungkulin.name });
                                                setFocusedIndex(-1);
                                            }}
                                            onBlur={() => setTimeout(() => {
                                                setActiveDropdown(null);
                                                setFocusedIndex(-1);
                                            }, 200)}
                                            onChange={(e) => {
                                                handleTungkulinChange(tungkulin.id, 'name', e.target.value);
                                                setActiveDropdown({ id: tungkulin.id, field: 'name', query: e.target.value });
                                                setFocusedIndex(-1);
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'ArrowDown') {
                                                    e.preventDefault();
                                                    setFocusedIndex(Math.min(focusedIndex + 1, currentSuggestions.length - 1));
                                                } else if (e.key === 'ArrowUp') {
                                                    e.preventDefault();
                                                    setFocusedIndex(Math.max(focusedIndex - 1, -1));
                                                } else if (e.key === 'Enter' && rowFocusedIndex >= 0 && currentSuggestions[rowFocusedIndex]) {
                                                    e.preventDefault();
                                                    handleTungkulinChange(tungkulin.id, 'name', currentSuggestions[rowFocusedIndex]);
                                                    setActiveDropdown(null);
                                                } else {
                                                    handleKeyDown(e, tungkulin.id, tungkulin.name);
                                                }
                                            }}
                                            className="w-full p-2 text-lg outline-none border border-stone-300 dark:border-slate-600 rounded-lg font-semibold text-gray-800 dark:text-white focus:ring-2 focus:ring-slate-500 bg-white dark:bg-slate-900 transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                        />
                                        {activeDropdown?.id === tungkulin.id && activeDropdown?.field === 'name' && currentSuggestions.length > 0 && (
                                            <div className="absolute z-[100] left-0 w-full mb-1 bottom-full bg-white dark:bg-slate-800 border-4 border-slate-600 shadow-2xl rounded-lg max-h-72 overflow-y-auto" id={`dropdown-${tungkulin.id}`}>
                                                {currentSuggestions.map((opt, i) => (
                                                    <div
                                                        key={`${opt}-${i}`}
                                                        ref={rowFocusedIndex === i ? (el: any) => el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }) : null}
                                                        onMouseDown={() => handleTungkulinChange(tungkulin.id, 'name', opt)}
                                                        className={`p-3 text-base cursor-pointer font-semibold border-b border-gray-100 dark:border-slate-700 last:border-0 transition-colors
                                ${rowFocusedIndex === i ? 'bg-slate-600 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`
                                                        }
                                                    >
                                                        {opt}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* URI */}
                                    <div className="border-r border-stone-300 dark:border-slate-700 p-2 flex items-center">
                                        <select value={tungkulin.scope || ''} onChange={(e) => handleTungkulinChange(tungkulin.id, 'scope', e.target.value)} className="w-full p-2.5 text-sm outline-none border border-stone-300 dark:border-slate-600 rounded-lg font-semibold focus:ring-2 focus:ring-slate-500 bg-white dark:bg-slate-900 dark:text-white transition-colors whitespace-nowrap">
                                            <option value="PANLOKAL">Panlokal</option>
                                            <option value="PANDISTRITO">Pandistrito</option>
                                        </select>
                                    </div>

                                    {/* REMARKS */}
                                    <div className="bg-white dark:bg-slate-900 p-2 border-r border-stone-300 dark:border-slate-700 flex flex-col gap-1.5 justify-center">
                                        <div className="flex items-center gap-1 px-2 py-1.5 bg-green-50 dark:bg-green-900/10 rounded border border-green-200 dark:border-green-800 transition-colors">
                                            <span className="font-semibold text-green-700 dark:text-green-500 text-[12px]">Petsa Nanumpa:</span>
                                            <select value={tungkulin.inOathRef || ''} onChange={(e) => handleTungkulinChange(tungkulin.id, 'inOathRef', e.target.value)} className="w-20 p-1 text-[12px] font-semibold outline-none border border-green-300 dark:border-green-800 rounded bg-white dark:bg-slate-900 text-green-800 dark:text-green-400 focus:ring-1 focus:ring-slate-500 transition-colors">
                                                <option value="">Type</option>
                                                <option value="R5-04">R5-04</option>
                                                <option value="R5-15">R5-15</option>
                                            </select>
                                            <div className="flex-1 flex items-center">
                                                <input type="date" value={tungkulin.inOathDate || ''} onChange={(e) => handleTungkulinChange(tungkulin.id, 'inOathDate', e.target.value)} className="w-full p-1 text-[12px] outline-none border border-green-300 dark:border-green-800 rounded-l bg-white dark:bg-slate-900 font-medium text-gray-700 dark:text-gray-300 focus:ring-1 focus:ring-slate-500 dark:[color-scheme:dark] transition-colors" />
                                                {tungkulin.inOathDate && (
                                                    <button onClick={() => handleTungkulinChange(tungkulin.id, 'inOathDate', '')} className="px-2 py-1 text-[12px] font-semibold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-800 rounded-r hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">✕</button>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1 px-2 py-1.5 bg-blue-50 dark:bg-blue-900/10 rounded border border-blue-200 dark:border-blue-800 transition-colors">
                                            <span className="font-semibold text-blue-700 dark:text-blue-500 text-[12px]">Petsa Nag-IN:</span>
                                            <select value={tungkulin.inOathRef === 'R2-04 IN' ? 'R2-04 IN' : ''} onChange={(e) => handleTungkulinChange(tungkulin.id, 'inOathRef', e.target.value === 'R2-04 IN' ? 'R2-04 IN' : tungkulin.inOathRef)} className="w-20 p-1 text-[12px] font-semibold outline-none border border-blue-300 dark:border-blue-800 rounded bg-white dark:bg-slate-900 text-blue-800 dark:text-blue-400 focus:ring-1 focus:ring-slate-500 transition-colors">
                                                <option value="">Type</option>
                                                <option value="R2-04 IN">R2-04 IN</option>
                                            </select>
                                            <div className="flex-1 flex items-center">
                                                <input type="date" value={tungkulin.inDate || ''} onChange={(e) => handleTungkulinChange(tungkulin.id, 'inDate', e.target.value)} className="w-full p-1 text-[12px] outline-none border border-blue-300 dark:border-blue-800 rounded-l bg-white dark:bg-slate-900 font-medium text-gray-700 dark:text-gray-300 focus:ring-1 focus:ring-slate-500 dark:[color-scheme:dark] transition-colors" />
                                                {tungkulin.inDate && (
                                                    <button onClick={() => handleTungkulinChange(tungkulin.id, 'inDate', '')} className="px-2 py-1 text-[12px] font-semibold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-800 rounded-r hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">✕</button>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1 px-2 py-1.5 bg-red-50 dark:bg-red-900/10 rounded border border-red-200 dark:border-red-800 transition-colors">
                                            <span className="font-semibold text-red-700 dark:text-red-400 text-[12px]">Petsa Nabawas/OUT:</span>
                                            <select value={tungkulin.outDropRef || ''} onChange={(e) => handleTungkulinChange(tungkulin.id, 'outDropRef', e.target.value)} className="w-20 p-1 text-[12px] font-semibold outline-none border border-red-300 dark:border-red-800 rounded bg-white dark:bg-slate-900 text-red-800 dark:text-red-400 focus:ring-1 focus:ring-rose-500 transition-colors">
                                                <option value="">Type</option>
                                                <option value="R5-04a">R5-04a</option>
                                                <option value="R5-15a">R5-15a</option>
                                                <option value="R2-04 OUT">R2-04 OUT</option>
                                                <option value="R2-10">R2-10</option>
                                                <option value="R2-09">R2-09</option>
                                            </select>
                                            <div className="flex-1 flex items-center">
                                                <input type="date" value={tungkulin.outDropDate || ''} onChange={(e) => handleTungkulinChange(tungkulin.id, 'outDropDate', e.target.value)} className="w-full p-1 text-[12px] outline-none border border-red-300 dark:border-red-800 rounded-l bg-white dark:bg-slate-900 font-medium text-gray-700 dark:text-gray-300 focus:ring-1 focus:ring-rose-500 dark:[color-scheme:dark] transition-colors" />
                                                {tungkulin.outDropDate && (
                                                    <button onClick={() => handleTungkulinChange(tungkulin.id, 'outDropDate', '')} className="px-2 py-1 text-[12px] font-semibold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-800 rounded-r hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">✕</button>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* STATUS */}
                                    <div className="border-r border-stone-300 dark:border-slate-700 p-2 flex items-center">
                                        <div className="flex flex-col gap-1 w-full">
                                            <select value={tungkulin.status || 'ACTIVE'} onChange={(e) => handleTungkulinChange(tungkulin.id, 'status', e.target.value)} className={`w-full p-2.5 rounded-lg text-sm font-semibold focus:ring-1 focus:ring-gray-400 dark:bg-slate-900 outline-none transition-colors whitespace-nowrap overflow-visible ${tungkulin.status === 'ACTIVE' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800' : 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-800'}`}>
                                                <option value="ACTIVE">Active</option>
                                                <option value="INACTIVE">Inactive</option>
                                            </select>
                                            {tungkulin.status === 'INACTIVE' && (
                                                <input type="date" value={tungkulin.inactiveDate || ''} onChange={(e) => handleTungkulinChange(tungkulin.id, 'inactiveDate', e.target.value)} className="w-full p-1 text-[12px] outline-none border border-red-300 dark:border-red-800 rounded font-medium text-red-800 dark:text-red-400 bg-white dark:bg-slate-900 focus:ring-1 focus:ring-rose-500 dark:[color-scheme:dark] transition-colors" title="Petsa ng pagka-inactive" />
                                            )}
                                        </div>
                                    </div>

                                    {/* CODE */}
                                    <div className="border-r border-stone-300 dark:border-slate-700 p-2 flex items-center">
                                        <input type="text" value={tungkulin.code || ''} onChange={(e) => handleTungkulinChange(tungkulin.id, 'code', e.target.value)} className="w-full p-2 text-lg font-semibold outline-none border border-stone-300 dark:border-slate-600 rounded-lg font-mono focus:ring-2 focus:ring-slate-500 bg-white dark:bg-slate-900 dark:text-white transition-colors text-center" title="Remarks/Code" />
                                    </div>

                                    {/* DELETE */}
                                    <div className="flex justify-center items-center">
                                        <button
                                            onClick={() => {
                                                setConfirmModalState({
                                                    isOpen: true,
                                                    title: 'Burahin ang Tungkulin',
                                                    message: 'Sigurado ka bang buburahin mo ang tungkuling ito?',
                                                    onConfirm: () => removeTungkulinRow(tungkulin.id),
                                                    isDestructive: true
                                                });
                                            }}
                                            className="bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded w-8 h-8 flex items-center justify-center font-semibold text-sm transition-colors shadow-sm"
                                            title="Burahin ang row"
                                        >
                                            ×
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="p-6 md:px-12 bg-stone-100 dark:bg-slate-950 flex justify-between items-center w-full transition-colors duration-300">
                    <div>
                        {formState.lastModified && (
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-500 tracking-wide">
                                Last modified: {new Date(formState.lastModified).toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                            </p>
                        )}
                    </div>
                    <button onClick={saveOfficer} className="px-12 py-4 rounded-xl font-semibold text-white bg-slate-700 hover:bg-slate-800 shadow-lg transition-all tracking-wide">Save Record</button>
                </div>
            </div>

            {/* PRINT PREVIEW MODAL */}
            {showPrintPreview && (
                <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeIn ${isFullscreen ? 'p-0' : 'p-4'}`}>
                    <div className={`bg-white dark:bg-slate-900 shadow-2xl flex flex-col w-full h-full animate-slideDown border border-gray-200 dark:border-slate-700 overflow-hidden ${isFullscreen ? 'rounded-none max-w-none max-h-none m-0' : 'rounded-3xl max-w-5xl max-h-[90vh] m-4'}`}>
                        {/* PREVIEW HEADER WITH TABS */}
                        <div className="bg-gray-100 dark:bg-slate-800 p-4 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPreviewTab('data')}
                                    className={`px-6 py-2 rounded-lg font-bold uppercase text-sm transition-all ${previewTab === 'data' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-slate-600'}`}
                                >
                                    Print Data
                                </button>
                                <button
                                    onClick={() => setPreviewTab('patotoo')}
                                    className={`px-6 py-2 rounded-lg font-bold uppercase text-sm transition-all ${previewTab === 'patotoo' ? 'bg-orange-600 text-white' : 'bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-slate-600'}`}
                                >
                                    Patotoo
                                </button>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setIsFullscreen(!isFullscreen)}
                                    className="bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-600 px-4 py-2 rounded-lg font-bold text-sm transition-all"
                                >
                                    {isFullscreen ? '⤓ Exit Fullscreen' : '⤢ Fullscreen'}
                                </button>
                                <button onClick={() => { setShowPrintPreview(false); setIsFullscreen(false); }} className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white p-2 rounded-lg transition-colors text-2xl font-bold">×</button>
                            </div>
                        </div>

                        {/* PREVIEW CONTENT */}
                        <div className="flex gap-4 flex-1 overflow-auto p-6 bg-gray-50 dark:bg-slate-800">
                            <div className="flex-1 overflow-auto">
                                {previewTab === 'data' ? (
                                    // PRINT DATA PREVIEW
                                    <div className="bg-white !bg-white text-black p-8 mx-auto w-full max-w-[8.5in]" style={{ fontFamily: '"Palatino Linotype", "Book Antiqua", Palatino, serif' }}>
                                        <div className="text-center mb-6 border-b-2 border-black pb-4">
                                            <h1 className="text-[14pt] font-black uppercase tracking-widest m-0">Officer's Information Sheet</h1>
                                            <h2 className="text-[14pt] font-bold m-0 mt-1 uppercase">Lokal ng Iligan City</h2>
                                        </div>

                                        <div className="flex flex-col gap-0 mb-3 border-t-2 border-x-2 border-black">
                                            <div className="flex w-full border-b-2 border-black bg-gray-50">
                                                <div className="flex-1 p-2 border-r-2 border-black">
                                                    <span className="block text-[8px] text-gray-500 uppercase font-black leading-none mb-0.5">First Name & Suffix</span>
                                                    <span className="text-[10px] font-black uppercase">{formState.firstName || '-'} {formState.suffix || ''}</span>
                                                </div>
                                                <div className="flex-1 p-2 border-r-2 border-black">
                                                    <span className="block text-[8px] text-gray-500 uppercase font-black leading-none mb-0.5">Apelyido sa Ina</span>
                                                    <span className="text-[10px] font-black uppercase">{formState.lastNameMother || '-'}</span>
                                                </div>
                                                <div className="flex-1 p-2 border-r-2 border-black">
                                                    <span className="block text-[8px] text-gray-500 uppercase font-black leading-none mb-0.5">Apelyido sa Ama</span>
                                                    <span className="text-[10px] font-black uppercase">{formState.lastNameFather || '-'}</span>
                                                </div>
                                                {formState.gender === 'BABAE' && (
                                                    <div className="flex-1 p-2 border-l-2 border-black">
                                                        <span className="block text-[8px] text-gray-500 uppercase font-black leading-none mb-0.5">Apelyido sa Asawa</span>
                                                        <span className="text-[10px] font-black uppercase">{formState.lastNameSpouse || '-'}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex w-full border-b-2 border-black">
                                                <div className="flex-1 p-2 border-r-2 border-black">
                                                    <span className="block text-[8px] text-gray-600 uppercase font-black leading-none mb-0.5">Reg. No.</span>
                                                    <span className="text-[11px] font-mono font-black">{formState.registry || 'N/A'}</span>
                                                </div>
                                                <div className="flex-1 p-2 border-r-2 border-black">
                                                    <span className="block text-[8px] text-gray-600 uppercase font-black leading-none mb-0.5">BDAY</span>
                                                    <span className="text-[10px] font-black uppercase">{formState.bday ? new Date(formState.bday).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}</span>
                                                </div>
                                                <div className="flex-1 p-2 border-l-2 border-black">
                                                    <span className="block text-[8px] text-gray-600 uppercase font-black leading-none mb-0.5">KASAL</span>
                                                    <span className="text-[10px] font-black uppercase">{formState.petsaKasal ? new Date(formState.petsaKasal).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <table className="w-full text-left border-collapse border-2 border-black">
                                            <thead>
                                                <tr className="bg-gray-200">
                                                    <th className="p-2 border border-black text-[9px] uppercase font-black">Tungkulin</th>
                                                    <th className="p-2 border border-black text-[9px] uppercase font-black text-center">Petsa Nanumpa</th>
                                                    <th className="p-2 border border-black text-[9px] uppercase font-black text-center">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {formState.tungkulinList && formState.tungkulinList.filter((t: any) => t.name.trim() !== '').map((t: any, i: number) => (
                                                    <tr key={i}>
                                                        <td className="p-2 border border-black text-[9px] font-black uppercase">{t.name}</td>
                                                        <td className="p-2 border border-black text-[9px] uppercase text-center font-bold">
                                                            {t.status === 'ACTIVE'
                                                                ? (t.inOathDate ? `${new Date(t.inOathDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} (${t.inOathRef || 'N/A'})` : 'N/A')
                                                                : (t.outDropDate ? `${new Date(t.outDropDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} (${t.outDropRef || 'N/A'})` : 'N/A')}
                                                        </td>
                                                        <td className="p-2 border border-black text-[9px] uppercase font-black text-center">{t.status}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    // PATOTOO PREVIEW
                                    (() => {
                                        const selectedRoles = patotooData.selectedTungkulin && patotooData.selectedTungkulin.length > 0
                                            ? formState.tungkulinList?.filter((t: any) => patotooData.selectedTungkulin.includes(t.id))
                                            : formState.tungkulinList?.filter((t: any) => t.status === 'ACTIVE');
                                        const activeRoleNames = selectedRoles?.map((t: any) => t.name) || [];
                                        const rolePhrase = activeRoleNames.length === 1 ? 'ng kaniyang tungkulin:' : 'ng mga sumusunod na tungkulin:';
                                        
                                        // Custom signatories
                                        const customSigs = patotooData.customSignatories || [];
                                        
                                        return (
                                            <div className="bg-white !bg-white text-black p-12 mx-auto w-full max-w-[8.5in]" style={{ fontFamily: '"Palatino Linotype", "Book Antiqua", Palatino, serif' }}>
                                                <div className="mb-8 leading-tight text-[12pt]">
                                                    <p>IGLESIA NI CRISTO</p>
                                                    <p>LOKAL NG {patotooData.lokalName || 'ILIGAN CITY'}</p>
                                                    <p>DISTRITO NG {patotooData.distritoName || '____________________'}</p>
                                                </div>

                                                <div className="mb-12 text-[12pt]">
                                                    <p>{patotooData.issueDate ? new Date(patotooData.issueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '____________________'}</p>
                                                </div>

                                                <div className="text-center mb-10">
                                                    <h1 className="text-[18pt] tracking-wide" style={{ textDecoration: 'underline' }}>PATOTOO</h1>
                                                </div>

                                                <div className="text-[12pt] leading-relaxed space-y-6">
                                                    <p>Sa Kinauukulan,</p>
                                                    <p>Pinatutunayan namin na si kapatid na {formatFullName(formState, formState.kapisanan)} ay masiglang tumutupad {rolePhrase}</p>
                                                    <ul className="pl-12 space-y-2 list-none">
                                                        {selectedRoles?.map((t: any, i: number) => (
                                                            <li key={i} className="flex items-center">
                                                                <span className="text-[16pt] mr-4 leading-none">■</span>
                                                                <span className="leading-none mt-1">{t.name}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                    <p>Hanggang dito na lamang po.</p>
                                                    <p>Ang inyong mga kapatid sa Panginoon,</p>
                                                </div>

                                                <div className="mt-20 text-[12pt]">
                                                    {/* Custom signatories on top row */}
                                                    {customSigs.length > 0 && (
                                                        <div className="mb-12 flex gap-4">
                                                            {customSigs.map((sig: any, idx: number) => (
                                                                <div key={idx} className="text-center w-48">
                                                                    <div className="h-10 flex items-end justify-center border-b border-black mb-1">{sig.name || ''}</div>
                                                                    <p className="text-[14pt]">{sig.title || ''}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {/* PD and Destinado bottom row aligned */}
                                                    <div className="flex justify-between items-end">
                                                        <div className="text-center w-48">
                                                            <div className="h-10 flex items-end justify-center border-b border-black mb-1">{patotooData.signatoryPD || ''}</div>
                                                            <p className="text-[14pt]">Pangulong Diakono</p>
                                                        </div>
                                                        <div className="text-center w-48">
                                                            <div className="h-10 flex items-end justify-center border-b border-black mb-1">{patotooData.signatoryDestinado || ''}</div>
                                                            <p className="text-[14pt]">Destinado</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })()
                                )}
                            </div>
                            {/* PATOTOO CUSTOMIZATION PANEL - Right Sidebar */}
                            {previewTab === 'patotoo' && (
                                <div className="w-96 bg-white border-l border-gray-200 overflow-y-auto p-4 space-y-4">
                                    <h4 className="font-bold uppercase text-sm text-gray-700">Patotoo Settings</h4>

                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Petsa (Date of Issue)</label>
                                        <input type="date" value={patotooData.issueDate || ''} onChange={(e) => setPatotooData({ ...patotooData, issueDate: e.target.value })} className="w-full p-2 rounded border border-gray-300 bg-white text-gray-900 text-sm outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Lokal</label>
                                        <input type="text" value={patotooData.lokalName || ''} onChange={(e) => setPatotooData({ ...patotooData, lokalName: e.target.value.toUpperCase() })} className="w-full p-2 rounded border border-gray-300 bg-white text-gray-900 text-sm uppercase outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500" placeholder="ILIGAN CITY" />
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Distrito</label>
                                        <input type="text" value={patotooData.distritoName || ''} onChange={(e) => setPatotooData({ ...patotooData, distritoName: e.target.value.toUpperCase() })} className="w-full p-2 rounded border border-gray-300 bg-white text-gray-900 text-sm uppercase outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500" placeholder="VISAYAS" />
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-blue-600 uppercase block mb-2">Piliin ang Tungkulin (Select Roles)</label>
                                        <div className="space-y-2 max-h-48 overflow-y-auto border border-blue-200 rounded-lg p-3 bg-blue-50">
                                            {formState.tungkulinList && formState.tungkulinList.filter((t: any) => t.name.trim() !== '').map((tungkulin: any) => (
                                                <div key={tungkulin.id} className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        id={`tungkulin-${tungkulin.id}`}
                                                        checked={(patotooData.selectedTungkulin || []).includes(tungkulin.id)}
                                                        onChange={(e) => {
                                                            const selected = patotooData.selectedTungkulin || [];
                                                            if (e.target.checked) {
                                                                setPatotooData({ ...patotooData, selectedTungkulin: [...selected, tungkulin.id] });
                                                            } else {
                                                                setPatotooData({ ...patotooData, selectedTungkulin: selected.filter((id: string) => id !== tungkulin.id) });
                                                            }
                                                        }}
                                                        className="w-4 h-4 accent-blue-600 cursor-pointer"
                                                    />
                                                    <label htmlFor={`tungkulin-${tungkulin.id}`} className="text-xs font-bold text-gray-700 cursor-pointer uppercase">{tungkulin.name}</label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <hr className="border-gray-300" />

                                    {/* Custom Signatories Section */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <h5 className="text-xs font-bold text-blue-600">Karagdagang Signatories</h5>
                                            <button
                                                onClick={() => {
                                                    const newSig = { id: Date.now().toString(), title: '', name: '' };
                                                    setPatotooData({ 
                                                        ...patotooData, 
                                                        customSignatories: [...(patotooData.customSignatories || []), newSig] 
                                                    });
                                                }}
                                                className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold py-1 px-3 rounded transition-colors"
                                            >
                                                + Add Signatory
                                            </button>
                                        </div>
                                        
                                        {(patotooData.customSignatories || []).length === 0 && (
                                            <p className="text-xs text-gray-500 italic">Walang karagdagang signatory. I-click ang "+ Dagdag Signatory" para magdagdag.</p>
                                        )}
                                        
                                        {(patotooData.customSignatories || []).map((sig: any, idx: number) => (
                                            <div key={sig.id} className="bg-gray-50 p-3 rounded-lg border border-gray-200 space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-bold text-gray-500">Signatory #{idx + 1}</span>
                                                    <button
                                                        onClick={() => {
                                                            const updated = patotooData.customSignatories.filter((s: any) => s.id !== sig.id);
                                                            setPatotooData({ ...patotooData, customSignatories: updated });
                                                        }}
                                                        className="text-red-500 hover:text-red-700 text-xs font-bold"
                                                    >
                                                        ✕ Alisin
                                                    </button>
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold text-gray-500 block mb-1">Titulo (Title)</label>
                                                    <input
                                                        type="text"
                                                        list={`title-options-${sig.id}`}
                                                        value={sig.title || ''}
                                                        onChange={(e) => {
                                                            const updated = patotooData.customSignatories.map((s: any) =>
                                                                s.id === sig.id ? { ...s, title: e.target.value } : s
                                                            );
                                                            setPatotooData({ ...patotooData, customSignatories: updated });
                                                        }}
                                                        placeholder="Type or select from list"
                                                        className="w-full p-2 rounded border border-gray-300 bg-white text-gray-900 text-sm outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                                    />
                                                    <datalist id={`title-options-${sig.id}`}>
                                                        {allRolesMasterList.map((role: string) => (
                                                            <option key={role} value={role} />
                                                        ))}
                                                    </datalist>
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold text-gray-500 block mb-1">Pangalan (Name)</label>
                                                    <input
                                                        type="text"
                                                        value={sig.name || ''}
                                                        onChange={(e) => {
                                                            const updated = patotooData.customSignatories.map((s: any) =>
                                                                s.id === sig.id ? { ...s, name: e.target.value } : s
                                                            );
                                                            setPatotooData({ ...patotooData, customSignatories: updated });
                                                        }}
                                                        placeholder="Pangalan ng signatory"
                                                        className="w-full p-2 rounded border border-gray-300 bg-white text-gray-900 text-sm outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <hr className="border-gray-300" />

                                    {/* Hardcoded Signatories - Always present */}
                                    <div className="space-y-3">
                                        <h5 className="text-xs font-bold text-gray-600">Laging Kasama (Always Present)</h5>
                                        
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 block mb-1">Pangulong Diakono</label>
                                            <input type="text" value={patotooData.signatoryPD || ''} onChange={(e) => setPatotooData({ ...patotooData, signatoryPD: e.target.value })} placeholder="Leave blank for line" className="w-full p-2 rounded border border-gray-300 bg-white text-gray-900 text-sm outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
                                        </div>
                                        
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 block mb-1">Destinado</label>
                                            <input type="text" value={patotooData.signatoryDestinado || ''} onChange={(e) => setPatotooData({ ...patotooData, signatoryDestinado: e.target.value })} placeholder="Leave blank for line" className="w-full p-2 rounded border border-gray-300 bg-white text-gray-900 text-sm outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* PREVIEW FOOTER */}
                        <div className="bg-gray-100 p-4 border-t border-gray-200 flex justify-end gap-3">
                            <button onClick={() => setShowPrintPreview(false)} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-6 rounded-lg transition-colors">
                                Close
                            </button>
                            <button
                                onClick={() => {
                                    setShowPrintPreview(false);
                                    if (previewTab === 'data') {
                                        exportToPDF(`Info_${officerName}_${todayStr}`, true);
                                    } else {
                                        exportToPDF(`Patotoo_${officerName}_${todayStr}`, false);
                                    }
                                }}
                                disabled={isExporting}
                                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-all"
                            >
                                {isExporting ? 'Exporting...' : 'Export as PDF'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* NOTIFICATION */}
            {notification && (
                <div className={`fixed bottom-6 right-6 z-[100] px-6 py-4 rounded-xl shadow-lg font-semibold text-white text-sm transition-all animate-slideUp whitespace-pre-wrap ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
                    {notification.message}
                </div>
            )}
        </div>
    );
}
