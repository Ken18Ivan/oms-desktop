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
    purokList
}: OfficerProfileFormProps) {
    if (!formState) return null;

    const [showPrintPreview, setShowPrintPreview] = React.useState(false);
    const [previewTab, setPreviewTab] = React.useState<'patotoo' | 'data'>('data');
    const [isExporting, setIsExporting] = React.useState(false);
    const [notification, setNotification] = React.useState<{ type: 'success' | 'error', message: string } | null>(null);

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
                font-size: 18pt;
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
            <div class="title-1">TALAAN NG MAYTUNGKULIN</div>
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
                const activeRoles = formState.tungkulinList?.filter((t: any) => t.status === 'ACTIVE').map((t: any) => t.name) || [];

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
              .signatures-container { margin-top: 1.2in; display: flex; justify-content: space-between; align-items: flex-end; font-size: 14pt; }
              .signatures-left { display: flex; flex-direction: column; gap: 0.8in; }
              .signature { min-width: 2.2in; }
              .signature-line { border-bottom: 1.5px solid black; height: 0.5in; margin-bottom: 0.1in; }
              .signature-title { text-align: center; font-weight: normal; font-size: 12pt; }
            </style>
          </head>
          <body>
            <div class="header">
              <p>IGLESIA NI CRISTO</p>
              <p>LOKAL NG ${patotooData.lokalName || 'ILIGAN CITY'}</p>
              <p>DISTRITO NG ${patotooData.distritoName || '____________________'}</p>
            </div>
            
            <div class="date">
              <p>${patotooData.issueDate ? new Date(patotooData.issueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '____________________'}</p>
            </div>
            
            <div class="title">PATOTOO</div>
            
            <div class="content">
              <p>Sa Kinauukulan,</p>
              <p>Pinatutunayan namin na si kapatid na ${formatFullName(formState)} ay masiglang tumutupad ng mga sumusunod na tungkulin:</p>
              <ul>
                ${activeRoles.map((role: string) => `<li><span>■</span><span>${role}</span></li>`).join('')}
              </ul>
              <p>Nawa po ay pahintulutang ninyo siyang makatupad sa inyong lokal.</p>
              <p>Hanggang dito na lamang po.</p>
              <p>Ang inyong kapatid sa Panginoon,</p>
            </div>
            
            <div class="signatures-container">
              <div class="signatures-left">
                <div class="signature">
                  <div class="signature-line">${patotooData.signatoryKalihim || ''}</div>
                  <div class="signature-title">Kalihim</div>
                </div>
                <div class="signature">
                  <div class="signature-line">${patotooData.signatoryPD || ''}</div>
                  <div class="signature-title">Pangulong Diakono</div>
                </div>
              </div>
              <div class="signature">
                <div class="signature-line">${patotooData.signatoryDestinado || ''}</div>
                <div class="signature-title">Destinado</div>
              </div>
            </div>
          </body>
          </html>`;
            }

            // Use Electron IPC to save PDF with file dialog
            if (typeof window !== 'undefined' && (window as any).ipc) {
                const result = await (window as any).ipc.invoke('save-pdf-dialog', {
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
            console.error('Export error:', error);
            setNotification({ type: 'error', message: 'Error exporting PDF' });
            setTimeout(() => setNotification(null), 4000);
        } finally {
            setIsExporting(false);
        }
    };

    const officerName = formatFullName(formState).replace(/\s+/g, '_') || 'Officer';
    const todayStr = new Date().toISOString().split('T')[0];

    return (
        <div className="animate-fadeIn no-print w-full">
            {/* FULL WIDTH ACTION BAR */}
            <div className="flex justify-between items-center p-4 md:px-8 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
                <button onClick={() => setView('DATABASE')} className="text-[#006B3F] dark:text-green-400 font-bold flex items-center bg-white dark:bg-slate-800 px-5 py-3 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                    ← Cancel / Back to Database
                </button>

                <div className="flex gap-3">
                    {!formState.isNew && (
                        <button onClick={() => { setIsPatotooView(false); setShowPrintPreview(true); setPreviewTab('data'); }} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-md transition-all text-sm uppercase font-black">
                            Preview (Patotoo & Info)
                        </button>
                    )}
                    {!formState.isNew && (
                        <button onClick={() => deleteOfficer(formState.id)} className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl shadow-md transition-all text-sm uppercase font-black">
                            Delete
                        </button>
                    )}
                </div>
            </div>



            {/* FULL WIDTH PROFILE CONTENT */}
            <div className="w-full">
                <div className="bg-[#006B3F] dark:bg-[#004d2d] p-8 md:px-12 flex justify-between items-center border-b-4 border-[#CE1126] transition-colors duration-300">
                    <h2 className="text-2xl font-black text-white uppercase tracking-wider">{formState.isNew ? 'BAGONG RECORD' : 'DETALYADONG RECORD'}</h2>
                    <span className="font-mono text-base bg-white dark:bg-slate-900 text-[#006B3F] dark:text-green-400 px-4 py-1.5 rounded-lg font-bold shadow-sm">{formState.registry || 'UNASSIGNED'}</span>
                </div>

                <div className="bg-[#f0fdf4] dark:bg-slate-800 p-5 md:px-12 border-b border-gray-200 dark:border-slate-700 transition-colors duration-300">
                    <h3 className="text-base font-bold text-[#006B3F] dark:text-green-400 uppercase tracking-wide max-w-[1400px] mx-auto">Mga Personal na Impormasyon</h3>
                </div>

                <div className="p-8 md:px-12 grid grid-cols-1 md:grid-cols-4 gap-x-8 gap-y-8 w-full max-w-[1400px] mx-auto text-gray-900 dark:text-white uppercase font-black">
                    <div className="md:col-span-2">
                        <div className="flex justify-between items-end mb-2">
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Registry Number <span className="text-gray-400 normal-case">(13-Char)</span> <span className="text-red-500">*</span></label>
                            {invalidFields.includes('registry') && <div className="flex items-center text-red-500 gap-1"><AlertCircle size={14} /><span className="text-[10px] font-black uppercase">Required</span></div>}
                        </div>
                        <input type="text" value={formState.registry || ''} onChange={(e) => { handleFormChange('registry', e.target.value); setInvalidFields((prev: any[]) => prev.filter(f => f !== 'registry')); }} maxLength={13} className={`w-full border rounded-lg p-3 outline-none font-mono font-bold uppercase transition-colors ${invalidFields.includes('registry') ? 'border-red-500 bg-red-50 dark:bg-red-900/20 focus:ring-2 focus:ring-red-500 text-red-900 dark:text-red-300' : 'border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-[#006B3F] bg-[#fafafa] dark:bg-slate-900 text-gray-900 dark:text-white'}`} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Kapisanan <span className="text-gray-400 normal-case">(Organization)</span></label>
                        <select value={formState.kapisanan || ''} onChange={(e) => handleFormChange('kapisanan', e.target.value)} className="w-full border border-gray-300 dark:border-slate-600 rounded-lg p-3 outline-none bg-[#fafafa] dark:bg-slate-900 focus:ring-2 focus:ring-[#006B3F] font-bold dark:text-white transition-colors">
                            <option value="" disabled>PUMILI...</option>
                            <option value="BUKLOD">BUKLOD</option>
                            <option value="KADIWA">KADIWA</option>
                            <option value="BINHI">BINHI</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Kasarian <span className="text-gray-400 normal-case">(Gender)</span></label>
                        <select value={formState.gender || ''} onChange={(e) => handleFormChange('gender', e.target.value)} className="w-full border border-gray-300 dark:border-slate-600 rounded-lg p-3 outline-none bg-[#fafafa] dark:bg-slate-900 focus:ring-2 focus:ring-[#006B3F] font-bold dark:text-white transition-colors">
                            <option value="" disabled>PUMILI...</option>
                            <option value="LALAKI">LALAKI (MALE)</option>
                            <option value="BABAE">BABAE (FEMALE)</option>
                        </select>
                    </div>

                    <div className="md:col-span-2 md:flex md:gap-4">
                        <div className="flex-1">
                            <div className="flex justify-between items-end mb-2">
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Unang Pangalan <span className="text-gray-400 normal-case">(First Name)</span> <span className="text-red-500">*</span></label>
                                {invalidFields.includes('firstName') && <div className="flex items-center text-red-500 gap-1"><AlertCircle size={14} /><span className="text-[10px] font-black uppercase">Required</span></div>}
                            </div>
                            <input type="text" value={formState.firstName || ''} onChange={(e) => { handleFormChange('firstName', e.target.value); setInvalidFields((prev: any[]) => prev.filter(f => f !== 'firstName')); }} className={`w-full border rounded-lg p-3 outline-none font-bold transition-colors ${invalidFields.includes('firstName') ? 'border-red-500 bg-red-50 dark:bg-red-900/20 focus:ring-2 focus:ring-red-500 text-red-900 dark:text-red-300' : 'border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-[#006B3F] bg-[#fafafa] dark:bg-slate-900 text-gray-900 dark:text-white'}`} />
                        </div>
                        <div className="flex-0 w-64">
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Suffix</label>
                            <select 
                                value={formState.suffix || ''} 
                                onChange={(e) => handleFormChange('suffix', e.target.value)} 
                                className="w-full border-2 border-[#006B3F] dark:border-green-600 rounded-lg h-11 px-3 outline-none bg-white dark:bg-slate-900 focus:ring-2 focus:ring-[#006B3F] font-black text-[#000000] dark:text-white transition-colors text-lg shadow-sm"
                            >
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
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Apelyido sa Ina (Maiden Name)</label>
                        <input type="text" value={formState.lastNameMother || ''} onChange={(e) => handleFormChange('lastNameMother', e.target.value)} className="w-full border border-gray-300 dark:border-slate-600 rounded-lg p-3 outline-none focus:ring-2 focus:ring-[#006B3F] bg-[#fafafa] dark:bg-slate-900 dark:text-white font-bold transition-colors" />
                    </div>

                    <div className="md:col-span-2">
                        <div className="flex justify-between items-end mb-2">
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Apelyido sa Ama <span className="text-gray-400 normal-case">(Father's Last Name)</span> <span className="text-red-500">*</span></label>
                            {invalidFields.includes('lastNameFather') && <div className="flex items-center text-red-500 gap-1"><AlertCircle size={14} /><span className="text-[10px] font-black uppercase">Required</span></div>}
                        </div>
                        <input type="text" value={formState.lastNameFather || ''} onChange={(e) => { handleFormChange('lastNameFather', e.target.value); setInvalidFields((prev: any[]) => prev.filter(f => f !== 'lastNameFather')); }} className={`w-full border rounded-lg p-3 outline-none font-bold transition-colors ${invalidFields.includes('lastNameFather') ? 'border-red-500 bg-red-50 dark:bg-red-900/20 focus:ring-2 focus:ring-red-500 text-red-900 dark:text-red-300' : 'border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-[#006B3F] bg-[#fafafa] dark:bg-slate-900 text-gray-900 dark:text-white'}`} />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Apelyido sa Asawa <span className="text-gray-400 dark:text-gray-500 normal-case font-normal">(Spouse's Last Name, if applicable)</span></label>
                        <input type="text" value={formState.lastNameSpouse || ''} onChange={(e) => handleFormChange('lastNameSpouse', e.target.value)} className="w-full border border-gray-300 dark:border-slate-600 rounded-lg p-3 outline-none focus:ring-2 focus:ring-[#006B3F] bg-[#fafafa] dark:bg-slate-900 dark:text-white font-bold transition-colors" />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Petsa ng Kapanganakan <span className="text-gray-400 normal-case">(Birthday)</span></label>
                        <input type="date" value={formState.bday || ''} onChange={(e) => handleFormChange('bday', e.target.value)} className="w-full border border-gray-300 dark:border-slate-600 rounded-lg p-3 outline-none focus:ring-2 focus:ring-[#006B3F] bg-[#fafafa] dark:bg-slate-900 font-bold text-gray-700 dark:text-white dark:[color-scheme:dark] transition-colors" />
                    </div>

                    <div className="md:col-span-1 flex items-end gap-1.5">
                        <div className="w-16">
                            <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Purok</label>
                            <input type="text" value={formState.purok || ''} onChange={(e) => handleFormChange('purok', e.target.value.toUpperCase())} placeholder="#" maxLength={2} className="w-full border border-gray-300 dark:border-slate-600 rounded-lg p-2 outline-none focus:ring-2 focus:ring-[#006B3F] bg-[#fafafa] dark:bg-slate-900 dark:text-white font-black text-center transition-colors text-base" />
                        </div>
                        <div className="pb-2 text-xl font-black text-gray-400 dark:text-slate-600">-</div>
                        <div className="w-16">
                            <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Grupo</label>
                            <input type="text" value={formState.grupo || ''} onChange={(e) => handleFormChange('grupo', e.target.value.toUpperCase())} placeholder="#" maxLength={2} className="w-full border border-gray-300 dark:border-slate-600 rounded-lg p-2 outline-none focus:ring-2 focus:ring-[#006B3F] bg-[#fafafa] dark:bg-slate-900 dark:text-white font-black text-center transition-colors text-base" />
                        </div>
                    </div>

                    {formState.kapisanan === 'BUKLOD' ? (
                        <div className="md:col-span-3 bg-[#fff1f0] dark:bg-red-900/10 p-3 rounded-lg border border-red-200 dark:border-red-900 shadow-sm flex items-center gap-6 transition-colors">
                            <label className="block text-sm font-black text-[#CE1126] dark:text-red-400 uppercase w-40">Petsa ng Kasal:</label>
                            <input type="date" value={formState.petsaKasal || ''} onChange={(e) => handleFormChange('petsaKasal', e.target.value)} className="w-64 border border-gray-300 dark:border-slate-600 rounded-md p-2 outline-none focus:ring-2 focus:ring-[#CE1126] bg-white dark:bg-slate-900 font-bold text-gray-700 dark:text-white dark:[color-scheme:dark] transition-colors" />
                        </div>
                    ) : (
                        <div className="md:col-span-3"></div>
                    )}


                </div>

                <div className="bg-gray-800 dark:bg-slate-950 p-6 md:px-12 border-y border-gray-700 dark:border-slate-800 mt-2 flex justify-between items-center transition-colors duration-300">
                    <h3 className="text-base font-bold text-white tracking-wide uppercase max-w-[1400px] w-full mx-auto flex justify-between items-center">
                        Hawak Na Tungkulin
                        <button onClick={addTungkulinRow} className="bg-white dark:bg-slate-700 text-gray-800 dark:text-white text-sm font-bold py-2 px-5 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 shadow-sm transition-all">+ ADD TUNGKULIN ROW</button>
                    </h3>
                </div>

                <div className="w-full border-b dark:border-slate-700 px-4 md:px-12">
                    {/* HEADER ROW */}
                    <div className="grid grid-cols-[60px_1fr_180px_1.3fr_160px_90px_50px] gap-0 bg-gray-100 dark:bg-slate-900 text-sm text-gray-700 dark:text-gray-300 uppercase tracking-wider rounded-t-lg border-2 border-gray-200 dark:border-slate-700 font-black">
                        <div className="text-center p-3 border-r-2 border-gray-300 dark:border-slate-700">No</div>
                        <div className="p-3 border-r-2 border-gray-300 dark:border-slate-700">Tungkulin</div>
                        <div className="text-center p-3 border-r-2 border-gray-300 dark:border-slate-700">URI / TYPE</div>
                        <div className="text-center p-3 border-r-2 border-gray-300 dark:border-slate-700 bg-green-50/50 dark:bg-green-900/10">REMARKS / DETAILS</div>
                        <div className="text-center p-3 border-r-2 border-gray-300 dark:border-slate-700 font-black">Status</div>
                        <div className="text-center p-3 border-r-2 border-gray-300 dark:border-slate-700 font-black">Code</div>
                        <div className="text-center p-3">Del</div>
                    </div>

                    {/* DATA ROWS */}
                    <div className="space-y-1 mt-1">
                        {formState.tungkulinList?.map((tungkulin: any, index: number) => {

                            const isDropdownActive = activeDropdown?.id === tungkulin.id;
                            const filterQuery = (isDropdownActive && activeDropdown?.query !== undefined) ? activeDropdown?.query : tungkulin.name;
                            const currentSuggestions = allRolesMasterList.filter(opt =>
                                opt.toLowerCase().includes((filterQuery || '').toLowerCase())
                            );

                            return (
                                <div key={tungkulin.id} className="grid grid-cols-[60px_1fr_180px_1.3fr_160px_90px_50px] gap-0 border-2 border-t-0 border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors font-black uppercase text-sm text-gray-900 dark:text-white items-stretch">
                                    {/* NO */}
                                    <div className="text-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-slate-900 p-2 border-r-2 border-gray-200 dark:border-slate-700 flex items-center justify-center font-mono text-sm">{index + 1}</div>

                                    {/* TUNGKULIN */}
                                    <div className="relative border-r-2 border-gray-200 dark:border-slate-700 p-2 flex items-center">
                                        <input
                                            type="text"
                                            value={tungkulin.name || ''}
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
                                                    setFocusedIndex(focusedIndex + 1);
                                                } else if (e.key === 'ArrowUp') {
                                                    e.preventDefault();
                                                    setFocusedIndex(Math.max(focusedIndex - 1, -1));
                                                } else if (e.key === 'Enter' && focusedIndex >= 0 && currentSuggestions[focusedIndex]) {
                                                    e.preventDefault();
                                                    handleTungkulinChange(tungkulin.id, 'name', currentSuggestions[focusedIndex]);
                                                    setActiveDropdown(null);
                                                } else {
                                                    handleKeyDown(e, tungkulin.id, tungkulin.name);
                                                }
                                            }}
                                            className="w-full p-2 text-lg outline-none border border-gray-300 dark:border-slate-600 rounded font-black text-gray-800 dark:text-white uppercase focus:ring-2 focus:ring-[#006B3F] bg-white dark:bg-slate-900 transition-colors"
                                        />
                                        {activeDropdown?.id === tungkulin.id && activeDropdown?.field === 'name' && currentSuggestions.length > 0 && (
                                            <div className="absolute z-[100] left-0 w-full mb-1 bottom-full bg-white dark:bg-slate-800 border-4 border-[#006B3F] shadow-2xl rounded-lg max-h-72 overflow-y-auto">
                                                {currentSuggestions.map((opt, i) => (
                                                    <div
                                                        key={`${opt}-${i}`}
                                                        onMouseDown={() => handleTungkulinChange(tungkulin.id, 'name', opt)}
                                                        className={`p-3 text-base cursor-pointer font-bold uppercase border-b border-gray-100 dark:border-slate-700 last:border-0 transition-colors
                                ${focusedIndex === i ? 'bg-[#006B3F] text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-[#e6f4ea] dark:hover:bg-slate-700'}`
                                                        }
                                                    >
                                                        {opt}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* URI */}
                                    <div className="border-r-2 border-gray-200 dark:border-slate-700 p-2 flex items-center">
                                        <select value={tungkulin.scope || ''} onChange={(e) => handleTungkulinChange(tungkulin.id, 'scope', e.target.value)} className="w-full p-2.5 text-sm outline-none border border-gray-300 dark:border-slate-600 rounded font-black uppercase focus:ring-2 focus:ring-[#006B3F] bg-white dark:bg-slate-900 dark:text-white transition-colors whitespace-nowrap">
                                            <option value="PANLOKAL">PANLOKAL</option>
                                            <option value="PANDISTRITO">PANDISTRITO</option>
                                        </select>
                                    </div>

                                    {/* REMARKS */}
                                    <div className="bg-white dark:bg-slate-900 p-2 border-r-2 border-gray-200 dark:border-slate-700 flex flex-col gap-1.5 justify-center">
                                        <div className="flex items-center gap-1 px-2 py-1.5 bg-green-50 dark:bg-green-900/10 rounded border border-green-200 dark:border-green-800 transition-colors">
                                            <span className="font-black text-green-700 dark:text-green-500 w-7 uppercase text-[12px]">IN:</span>
                                            <select value={tungkulin.inOathRef || ''} onChange={(e) => handleTungkulinChange(tungkulin.id, 'inOathRef', e.target.value)} className="w-20 p-1 text-[12px] font-black outline-none border border-green-300 dark:border-green-800 rounded bg-white dark:bg-slate-900 text-green-800 dark:text-green-400 focus:ring-1 focus:ring-[#006B3F] transition-colors">
                                                <option value="">TYPE</option>
                                                <option value="R5-04">R5-04</option>
                                                <option value="R5-15">R5-15</option>
                                                <option value="R2-04 IN">R2-04 IN</option>
                                            </select>
                                            <input type="date" value={tungkulin.inOathDate || ''} onChange={(e) => handleTungkulinChange(tungkulin.id, 'inOathDate', e.target.value)} className="flex-1 min-w-0 p-1 text-[12px] outline-none border border-green-300 dark:border-green-800 rounded bg-white dark:bg-slate-900 font-black text-gray-700 dark:text-gray-300 focus:ring-1 focus:ring-[#006B3F] dark:[color-scheme:dark] transition-colors" />
                                        </div>

                                        <div className="flex items-center gap-1 px-2 py-1.5 bg-red-50 dark:bg-red-900/10 rounded border border-red-200 dark:border-red-800 transition-colors">
                                            <span className="font-black text-red-700 dark:text-red-400 w-7 uppercase text-[12px]">OUT:</span>
                                            <select value={tungkulin.outDropRef || ''} onChange={(e) => handleTungkulinChange(tungkulin.id, 'outDropRef', e.target.value)} className="w-20 p-1 text-[12px] font-black outline-none border border-red-300 dark:border-red-800 rounded bg-white dark:bg-slate-900 text-red-800 dark:text-red-400 focus:ring-1 focus:ring-[#CE1126] transition-colors">
                                                <option value="">TYPE</option>
                                                <option value="R5-04a">R5-04a</option>
                                                <option value="R5-15a">R5-15a</option>
                                                <option value="R2-04 OUT">R2-04 OUT</option>
                                                <option value="R2-10">R2-10</option>
                                                <option value="R2-09">R2-09</option>
                                            </select>
                                            <input type="date" value={tungkulin.outDropDate || ''} onChange={(e) => handleTungkulinChange(tungkulin.id, 'outDropDate', e.target.value)} className="flex-1 min-w-0 p-1 text-[12px] outline-none border border-red-300 dark:border-red-800 rounded bg-white dark:bg-slate-900 font-black text-gray-700 dark:text-gray-300 focus:ring-1 focus:ring-[#CE1126] dark:[color-scheme:dark] transition-colors" />
                                        </div>
                                    </div>

                                    {/* STATUS */}
                                    <div className="border-r-2 border-gray-200 dark:border-slate-700 p-2 flex items-center">
                                        <div className="flex flex-col gap-1 w-full">
                                            <select value={tungkulin.status || 'ACTIVE'} onChange={(e) => handleTungkulinChange(tungkulin.id, 'status', e.target.value)} className={`w-full p-2.5 rounded text-sm font-black uppercase focus:ring-1 focus:ring-gray-400 dark:bg-slate-900 outline-none transition-colors whitespace-nowrap overflow-visible ${tungkulin.status === 'ACTIVE' ? 'bg-[#e6f4ea] dark:bg-green-900/30 text-[#006B3F] dark:text-green-400 border border-green-300 dark:border-green-800' : 'bg-[#fff1f0] dark:bg-red-900/30 text-[#CE1126] dark:text-red-400 border border-red-300 dark:border-red-800'}`}>
                                                <option value="ACTIVE">ACTIVE</option>
                                                <option value="INACTIVE">INACTIVE</option>
                                            </select>
                                            {tungkulin.status === 'INACTIVE' && (
                                                <input type="date" value={tungkulin.inactiveDate || ''} onChange={(e) => handleTungkulinChange(tungkulin.id, 'inactiveDate', e.target.value)} className="w-full p-1 text-[12px] outline-none border border-red-300 dark:border-red-800 rounded font-black text-red-800 dark:text-red-400 bg-white dark:bg-slate-900 focus:ring-1 focus:ring-[#CE1126] dark:[color-scheme:dark] transition-colors" title="Petsa ng pagka-inactive" />
                                            )}
                                        </div>
                                    </div>

                                    {/* CODE */}
                                    <div className="border-r-2 border-gray-200 dark:border-slate-700 p-2 flex items-center">
                                        <input type="text" value={tungkulin.code || ''} onChange={(e) => handleTungkulinChange(tungkulin.id, 'code', e.target.value)} className="w-full p-2 text-lg font-black outline-none border border-gray-300 dark:border-slate-600 rounded font-mono uppercase focus:ring-2 focus:ring-[#006B3F] bg-white dark:bg-slate-900 dark:text-white transition-colors text-center" title="Remarks/Code" />
                                    </div>

                                    {/* DELETE */}
                                    <div className="flex justify-center">
                                        <button
                                            onClick={() => removeTungkulinRow(tungkulin.id)}
                                            className="bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded w-8 h-8 flex items-center justify-center font-black text-sm transition-colors shadow-sm"
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

                <div className="p-6 md:px-12 bg-gray-100 dark:bg-slate-950 flex justify-between items-center w-full transition-colors duration-300">
                    <div>
                        {formState.lastModified && (
                            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                                Last modified: {new Date(formState.lastModified).toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                            </p>
                        )}
                    </div>
                    <button onClick={saveOfficer} className="px-12 py-4 rounded-lg font-black text-white bg-[#006B3F] hover:bg-[#004d2d] shadow-lg transition-all tracking-wide uppercase">SAVE RECORD</button>
                </div>
            </div>

            {/* PRINT PREVIEW MODAL */}
            {showPrintPreview && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl flex flex-col max-w-5xl w-full max-h-[90vh] h-full animate-slideDown border border-gray-200 dark:border-slate-700 m-4 overflow-hidden">
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
                            <button onClick={() => setShowPrintPreview(false)} className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white p-2 rounded-lg transition-colors text-2xl font-bold">×</button>
                        </div>

                        {/* PREVIEW CONTENT */}
                        <div className="flex gap-4 flex-1 overflow-auto p-6 bg-gray-50 dark:bg-slate-800">
                            <div className="flex-1 overflow-auto">
                                {previewTab === 'data' ? (
                                    // PRINT DATA PREVIEW
                                    <div className="bg-white !bg-white text-black p-8 mx-auto w-full max-w-[8.5in]" style={{ fontFamily: '"Palatino Linotype", "Book Antiqua", Palatino, serif' }}>
                                        <div className="text-center mb-6 border-b-2 border-black pb-4">
                                            <h1 className="text-[18pt] font-black uppercase tracking-widest m-0">Talaan ng Maytungkulin</h1>
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
                                            <p>Pinatutunayan namin na si kapatid na {formatFullName(formState)} ay masiglang tumutupad ng mga sumusunod na tungkulin:</p>
                                            <ul className="pl-12 space-y-2 list-none">
                                                {(patotooData.selectedTungkulin && patotooData.selectedTungkulin.length > 0
                                                    ? formState.tungkulinList?.filter((t: any) => patotooData.selectedTungkulin.includes(t.id))
                                                    : formState.tungkulinList?.filter((t: any) => t.status === 'ACTIVE')
                                                ).map((t: any, i: number) => (
                                                    <li key={i} className="flex items-center">
                                                        <span className="text-[16pt] mr-4 leading-none">■</span>
                                                        <span className="leading-none mt-1">{t.name}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                            <p>Nawa po ay pahintulutang ninyo siyang makatupad sa inyong lokal.</p>
                                            <p>Hanggang dito na lamang po.</p>
                                            <p>Ang inyong kapatid sa Panginoon,</p>
                                        </div>

                                        <div className="mt-20 flex justify-between text-[12pt]">
                                            <div className="flex flex-col gap-16 w-64">
                                                <div className="text-center">
                                                    <div className="border-b border-black h-6 mb-1">{patotooData.signatoryKalihim || ''}</div>
                                                    <p>Kalihim</p>
                                                </div>
                                                <div className="text-center">
                                                    <div className="border-b border-black h-6 mb-1">{patotooData.signatoryPD || ''}</div>
                                                    <p>Pangulong Diakono</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col justify-end w-64">
                                                <div className="text-center">
                                                    <div className="border-b border-black h-6 mb-1">{patotooData.signatoryDestinado || ''}</div>
                                                    <p>Destinado</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
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
                                        <p className="text-xs text-gray-500 mt-1">If none selected, ACTIVE roles will be used</p>
                                    </div>

                                    <hr className="border-gray-300" />

                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Kalihim</label>
                                        <input type="text" value={patotooData.signatoryKalihim || ''} onChange={(e) => setPatotooData({ ...patotooData, signatoryKalihim: e.target.value.toUpperCase() })} placeholder="Leave blank for line" className="w-full p-2 rounded border border-gray-300 bg-white text-gray-900 text-sm uppercase outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Pangulong Diakono</label>
                                        <input type="text" value={patotooData.signatoryPD || ''} onChange={(e) => setPatotooData({ ...patotooData, signatoryPD: e.target.value.toUpperCase() })} placeholder="Leave blank for line" className="w-full p-2 rounded border border-gray-300 bg-white text-gray-900 text-sm uppercase outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Destinado</label>
                                        <input type="text" value={patotooData.signatoryDestinado || ''} onChange={(e) => setPatotooData({ ...patotooData, signatoryDestinado: e.target.value.toUpperCase() })} placeholder="Leave blank for line" className="w-full p-2 rounded border border-gray-300 bg-white text-gray-900 text-sm uppercase outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
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
                <div className={`fixed bottom-6 right-6 z-[100] px-6 py-4 rounded-xl shadow-lg font-bold text-white uppercase text-sm transition-all animate-slideUp whitespace-pre-wrap ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
                    {notification.message}
                </div>
            )}
        </div>
    );
}
