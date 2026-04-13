import React, { useState, useEffect, useMemo } from 'react';
import DOMPurify from 'dompurify';
import { formatFullName } from '../../utils';
import * as XLSX from 'xlsx';

interface DashData {
  total: number;
  active: number;
  inactive: number;
  buklod: number;
  kadiwa: number;
  binhi: number;
  target?: number;
}

interface OfficerDatabaseViewProps {
  filteredOfficers: any[];
  departments: any[];
  selectedOfficers: string[];
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  tungkulinFilter: string;
  setTungkulinFilter: (val: string) => void;
  subRoleFilter: string;
  setSubRoleFilter: (val: string) => void;
  kapisananFilter: string;
  setKapisananFilter: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  dashData: DashData;
  openProfile: (officer?: any) => void;
  setIsPrintingMasterlist: (val: boolean) => void;
  toggleSelectAll: () => void;
  toggleSelectOfficer: (id: string, e: React.MouseEvent | React.ChangeEvent) => void;
  clearSelection: () => void;
  deleteSelected: () => void;
  purokFilter: string;
  setPurokFilter: (val: string) => void;
  grupoFilter: string;
  setGrupoFilter: (val: string) => void;
  uniquePurokValues: string[];
  sortField: string;
  setSortField: (val: any) => void;
  sortDirection: string;
  setSortDirection: (val: any) => void;
  purokList?: any[];
  officers?: any[];
  setOfficers?: (val: any[]) => void;
  showToast?: (msg: string, type?: 'success' | 'error') => void;
}

export default function OfficerDatabaseView({
  filteredOfficers,
  departments,
  selectedOfficers,
  searchQuery,
  setSearchQuery,
  tungkulinFilter,
  setTungkulinFilter,
  subRoleFilter,
  setSubRoleFilter,
  kapisananFilter,
  setKapisananFilter,
  statusFilter,
  setStatusFilter,
  dashData,
  openProfile,
  setIsPrintingMasterlist,
  toggleSelectAll,
  toggleSelectOfficer,
  clearSelection,
  deleteSelected,
  purokFilter,
  setPurokFilter,
  grupoFilter,
  setGrupoFilter,
  uniquePurokValues,
  sortField,
  setSortField,
  sortDirection,
  setSortDirection,
  purokList,
  officers = [],
  setOfficers,
  showToast,
}: OfficerDatabaseViewProps) {
  const [showExportModal, setShowExportModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewTab, setPreviewTab] = useState<'pdf' | 'excel'>('pdf');
  const [isExporting, setIsExporting] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [showFilterPresets, setShowFilterPresets] = useState(false);
  const [filterPresets, setFilterPresets] = useState<{name: string, filters: any}[]>([]);
  const [newPresetName, setNewPresetName] = useState('');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [visibleColumns, setVisibleColumns] = useState({
    registry: true,
    controlNumber: true,
    name: true,
    kapisanan: true,
    purok: true,
    tungkulin: true,
    actions: true
  });
  const [exportVisibleColumns, setExportVisibleColumns] = useState({
    blg: true,
    registry: true,
    controlNumber: true,
    pangalan: true,
    kapisanan: true,
    purokGrupo: true,
    tungkulin: true,
    cell: true
  });
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, tungkulinFilter, subRoleFilter, kapisananFilter, statusFilter, purokFilter, grupoFilter]);
  
  // Auto-hide notification after 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [notification]);

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+N - New Record
      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        openProfile();
      }
      // Ctrl+E - Export
      if (e.ctrlKey && e.key === 'e') {
        e.preventDefault();
        setShowExportModal(true);
      }
      // Ctrl+F - Focus Search
      if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (searchInput) searchInput.focus();
      }
      // Escape - Close modals/menus
      if (e.key === 'Escape') {
        setShowColumnMenu(false);
        setShowFilterPresets(false);
        setShowExportModal(false);
        setShowPreview(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openProfile]);

  const totalPages = Math.ceil(filteredOfficers.length / itemsPerPage);
  
  const paginatedOfficers = useMemo(() => {
    if (itemsPerPage === -1) return filteredOfficers; // -1 for 'All'
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredOfficers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredOfficers, currentPage, itemsPerPage]);

  // Generate Masterlist HTML
  const generateMasterlistHTML = () => {
    const sheetData = filteredOfficers.map((officer, index) => {
      let displayRoles = '';
      let displayCell = 'N/A';
      const validRoles = officer.tungkulinList?.filter((t: any) => t.name.trim() !== '') || [];

      if (tungkulinFilter !== 'ALL') {
        const dept = departments.find((d) => d.name === tungkulinFilter);
        const validRolesForDept = dept ? [dept.name, ...(dept.specificRoles || [])] : [tungkulinFilter];
        const matchingRole = validRoles.find((t: any) => {
          if (subRoleFilter !== 'ALL') return t.name === subRoleFilter;
          return validRolesForDept.includes(t.name);
        });
        if (matchingRole) {
          displayRoles = matchingRole.name;
        }
      } else {
        displayRoles = validRoles.map((t: any) => t.name).join('<br>') || 'N/A';
      }

      displayCell = officer.cellphone || 'N/A';

      return {
        blg: index + 1,
        registry: officer.registry || 'N/A',
        controlNumber: (officer.controlNumber || '').padStart(4, '0') || '-',
        pangalan: formatFullName(officer, officer.kapisanan),
        kapisanan: officer.kapisanan || '',
        purokGrupo: officer.purok ? `${officer.purok}${officer.grupo ? ` - ${officer.grupo}` : ''}` : '-',
        tungkulin: displayRoles,
        status: displayCell,
      };
    });

    // Build table headers based on visible columns
    const tableHeaders = [];
    if (exportVisibleColumns.blg) tableHeaders.push('<th class="text-center" style="width: 40px;">Blg.</th>');
    if (exportVisibleColumns.registry) tableHeaders.push('<th style="width: 120px;">Registry No.</th>');
    if (exportVisibleColumns.controlNumber) tableHeaders.push('<th style="width: 80px;">Control No.</th>');
    if (exportVisibleColumns.pangalan) tableHeaders.push('<th>Pangalan</th>');
    if (exportVisibleColumns.kapisanan) tableHeaders.push('<th style="width: 100px;">Kapisanan</th>');
    if (exportVisibleColumns.purokGrupo) tableHeaders.push('<th style="width: 80px;">Purok-Grupo</th>');
    if (exportVisibleColumns.tungkulin) tableHeaders.push('<th>Tungkulin</th>');
    if (exportVisibleColumns.cell) tableHeaders.push('<th class="text-center" style="width: 80px;">Cell #</th>');

    // Build table rows based on visible columns
    const tableRows = sheetData.map(row => {
      const cells = [];
      if (exportVisibleColumns.blg) cells.push(`<td class="text-center font-bold">${row.blg}</td>`);
      if (exportVisibleColumns.registry) cells.push(`<td class="font-bold">${row.registry}</td>`);
      if (exportVisibleColumns.controlNumber) cells.push(`<td class="text-center font-bold">${row.controlNumber || 'N/A'}</td>`);
      if (exportVisibleColumns.pangalan) cells.push(`<td>${row.pangalan}</td>`);
      if (exportVisibleColumns.kapisanan) cells.push(`<td class="text-center">${row.kapisanan}</td>`);
      if (exportVisibleColumns.purokGrupo) cells.push(`<td class="text-center">${row.purokGrupo}</td>`);
      if (exportVisibleColumns.tungkulin) cells.push(`<td>${row.tungkulin}</td>`);
      if (exportVisibleColumns.cell) cells.push(`<td class="text-center font-bold">${row.status}</td>`);
      return `<tr>${cells.join('')}</tr>`;
    }).join('');

    // Build filter description for export header
    let filterName = '';
    if (tungkulinFilter !== 'ALL') {
      filterName = subRoleFilter !== 'ALL' ? subRoleFilter : tungkulinFilter;
    } else if (kapisananFilter !== 'ALL') {
      filterName = `Kapisanang ${kapisananFilter}`;
    } else if (purokFilter !== 'ALL') {
      filterName = grupoFilter !== 'ALL' ? `Purok ${purokFilter} - Grupo ${grupoFilter}` : `Purok ${purokFilter}`;
    } else {
      filterName = '(LAHAT NG DEPARTMENTS)';
    }
    const deptName = filterName;

    return `<!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          * { margin: 0; padding: 0; }
          body { font-family: "Palatino Linotype", "Book Antiqua", Palatino, serif; padding: 0.5in; }
          .header { text-align: center; margin-bottom: 0.3in; border-bottom: 2px solid black; padding-bottom: 0.2in; }
          .header h1 { font-size: 18pt; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
          .header h2 { font-size: 14pt; font-weight: 700; text-transform: uppercase; margin-bottom: 8px; }
          .header h3 { font-size: 12pt; font-weight: 700; text-transform: uppercase; background-color: #f3f4f6; padding: 4px 16px; display: inline-block; border-radius: 4px; }
          table { width: 100%; border-collapse: collapse; border: 1px solid black; margin-top: 0.2in; }
          th { background-color: #f3f4f6; border: 1px solid black; padding: 8px; text-align: left; font-weight: 700; font-size: 10pt; text-transform: uppercase; }
          td { border: 1px solid black; padding: 6px; font-size: 10pt; }
          .text-center { text-align: center; }
          .font-bold { font-weight: 700; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Talaan ng mga Maytungkulin</h1>
          <h2>Lokal ng Iligan City</h2>
          <h3>${deptName}</h3>
        </div>
        
        <table>
          <thead>
            <tr>
              ${tableHeaders.join('')}
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </body>
      </html>`;
  };

  // Export to PDF with dialog
  const exportMasterlistPDF = async () => {
    try {
      setIsExporting(true);
      const htmlContent = generateMasterlistHTML();
      const dept = tungkulinFilter !== 'ALL' ? tungkulinFilter : 'ALL_DEPARTMENTS';
      const filename = `Masterlist_${dept}_${new Date().toISOString().split('T')[0]}`;

      if (typeof window !== 'undefined' && window.ipc) {
        const result = await window.ipc.invoke('save-pdf-dialog', {
          html: htmlContent,
          filename: filename,
          defaultPath: filename + '.pdf'
        });

        if (result.success) {
          setNotification({ message: 'PDF downloaded successfully!', type: 'success' });
          setShowPreview(false);
          setShowExportModal(false);
        } else if (!result.cancelled) {
          setNotification({ message: `Error: ${result.error}`, type: 'error' });
        }
      }
    } catch (error) {
      setNotification({ message: 'Error exporting PDF', type: 'error' });
    } finally {
      setIsExporting(false);
    }
  };

  // Export to Excel with dialog
  const exportMasterlistExcel = async () => {
    try {
      setIsExporting(true);
      const sheetData = filteredOfficers.map((officer, index) => {
        let displayRoles = '';
        let displayStatus = 'N/A';
        const validRoles = officer.tungkulinList?.filter((t: any) => t.name.trim() !== '') || [];

        if (tungkulinFilter !== 'ALL') {
          const dept = departments.find((d) => d.name === tungkulinFilter);
          const validRolesForDept = dept ? [dept.name, ...(dept.specificRoles || [])] : [tungkulinFilter];
          const matchingRole = validRoles.find((t: any) => {
            if (subRoleFilter !== 'ALL') return t.name === subRoleFilter;
            return validRolesForDept.includes(t.name);
          });
          if (matchingRole) {
            displayRoles = matchingRole.name;
            displayStatus = matchingRole.status;
          }
        } else {
          displayRoles = validRoles.map((t: any) => t.name).join(', ') || 'N/A';
          const isAnyActive = validRoles.some((t: any) => t.status === 'ACTIVE');
          displayStatus = validRoles.length ? (isAnyActive ? 'ACTIVE' : 'INACTIVE') : 'N/A';
        }

        return {
          'Blg.': index + 1,
          'Registry No.': officer.registry || 'N/A',
          'Control No.': (officer.controlNumber || '').padStart(4, '0') || '-',
          'Pangalan': formatFullName(officer, officer.kapisanan),
          'Kapisanan': officer.kapisanan || '',
          'Purok-Grupo': officer.purok ? `${officer.purok}${officer.grupo ? ` - ${officer.grupo}` : ''}` : '-',
          'Tungkulin': displayRoles,
          'Status': displayStatus,
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(sheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Masterlist");
      
      const dept = tungkulinFilter !== 'ALL' ? tungkulinFilter : 'ALL_DEPARTMENTS';
      const filename = `Masterlist_${dept}_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, filename);
      
      setNotification({ message: 'Excel file downloaded successfully!', type: 'success' });
      setShowPreview(false);
      setShowExportModal(false);
    } catch (error) {
      setNotification({ message: 'Error exporting Excel', type: 'error' });
    } finally {
      setIsExporting(false);
    }
  };


  const selectedDeptData = departments.find((d: any) => d.name === tungkulinFilter);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) return '';
    return sortDirection === 'asc' ? ' ↑' : ' ↓';
  };

  return (
    <div className="space-y-6 animate-fadeIn no-print">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-gray-300 dark:border-slate-700 pb-4">
        <div>
          <h2 className="text-3xl font-black text-gray-800 dark:text-white uppercase tracking-tight">
            Officers Records
          </h2>
          <p className="text-gray-500 font-medium text-sm mt-1">
            Showing {filteredOfficers.length} records
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-3">
          <button
            onClick={() => setShowExportModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-md transition-all text-sm uppercase font-black flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </button>
        </div>
      </div>

      {/* Column Visibility Menu */}
      {showColumnMenu && (
        <div className="absolute z-50 right-4 mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700 p-4 w-64">
          <h4 className="text-sm font-black text-gray-800 dark:text-white uppercase mb-3 border-b border-gray-200 dark:border-slate-700 pb-2">Show Columns</h4>
          <div className="space-y-2">
            {Object.entries(visibleColumns).map(([key, value]) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 p-2 rounded-lg transition-colors">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => setVisibleColumns({...visibleColumns, [key]: e.target.checked})}
                  className="w-4 h-4 rounded border-gray-300 text-slate-600 focus:ring-slate-500"
                />
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">{key}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {tungkulinFilter !== 'ALL' && (
        <div className="bg-[#fffdf0] dark:bg-yellow-900/10 p-6 shadow-md rounded-2xl mb-6 border-b-4 border-yellow-400 border-x border-t border-gray-200 dark:border-slate-700 transition-colors">
          <div className="border-b border-yellow-200 dark:border-yellow-700/50 pb-3 mb-4">
            <h2 className="text-2xl font-black text-gray-800 dark:text-yellow-500 uppercase">
              {subRoleFilter !== 'ALL' ? subRoleFilter : selectedDeptData?.name || tungkulinFilter}
            </h2>
            <span className="text-xs font-bold text-gray-500 uppercase">Department Analytics Dashboard</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-slate-600 shadow-sm">
              <div className="text-center w-full">
                <span className="block text-xs font-bold text-gray-500 uppercase">Total MT</span>
                <span className="font-black text-3xl text-slate-700 dark:text-slate-300">{dashData.total}</span>
              </div>
              {subRoleFilter === 'ALL' && (
                <>
                  <div className="w-px h-12 bg-gray-200 dark:bg-slate-600"></div>
                  <div className="text-center w-full">
                    <span className="block text-xs font-bold text-gray-500 uppercase">Target (Dapat)</span>
                    <span className="font-black text-3xl text-gray-800 dark:text-white">{dashData.target || 0}</span>
                  </div>
                  <div className="w-px h-12 bg-gray-200 dark:bg-slate-600"></div>
                  <div className="text-center w-full">
                    <span className="block text-xs font-bold text-rose-700 dark:text-rose-500 uppercase">Kulang</span>
                    <span className="font-black text-3xl text-rose-700 dark:text-rose-500">
                      {Math.max(0, (dashData.target || 0) - dashData.total)}
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className="grid grid-cols-5 gap-2">
              <div className="col-span-2 bg-white dark:bg-slate-800 p-3 rounded-xl border border-gray-200 dark:border-slate-600 shadow-sm flex justify-around items-center">
                <div className="text-center">
                  <span className="block text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase">Active</span>
                  <span className="font-black text-xl text-emerald-700 dark:text-emerald-400">{dashData.active}</span>
                </div>
                <div className="text-center">
                  <span className="block text-[10px] font-bold text-rose-700 dark:text-rose-400 uppercase">Inactive</span>
                  <span className="font-black text-xl text-rose-700 dark:text-rose-400">{dashData.inactive}</span>
                </div>
              </div>
              <div className="col-span-3 bg-white dark:bg-slate-800 p-3 rounded-xl border border-gray-200 dark:border-slate-600 shadow-sm flex justify-around items-center">
                <div className="text-center">
                  <span className="block text-[10px] font-bold text-blue-800 dark:text-blue-400 uppercase">Buklod</span>
                  <span className="font-black text-xl text-gray-800 dark:text-white">{dashData.buklod}</span>
                </div>
                <div className="text-center">
                  <span className="block text-[10px] font-black text-red-800 dark:text-red-400 uppercase">Kadiwa</span>
                  <span className="font-black text-xl text-gray-800 dark:text-white">{dashData.kadiwa}</span>
                </div>
                <div className="text-center">
                  <span className="block text-[10px] font-black text-green-800 dark:text-green-400 uppercase">Binhi</span>
                  <span className="font-black text-xl text-gray-800 dark:text-white">{dashData.binhi}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FILTER PRESETS TOGGLE */}
      <div className="flex justify-end gap-2">
        <button
          onClick={() => setShowColumnMenu(!showColumnMenu)}
          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
        >
          Columns
        </button>
        <button
          onClick={() => setShowFilterPresets(!showFilterPresets)}
          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all"
        >
          Save/Load Presets
          {filterPresets.length > 0 && (
            <select
              onChange={(e) => {
                const preset = filterPresets.find(p => p.name === e.target.value);
                if (preset) {
                  setSearchQuery(preset.filters.searchQuery);
                  setTungkulinFilter(preset.filters.tungkulinFilter);
                  setSubRoleFilter(preset.filters.subRoleFilter);
                  setKapisananFilter(preset.filters.kapisananFilter);
                  setStatusFilter(preset.filters.statusFilter);
                  setPurokFilter(preset.filters.purokFilter);
                  setGrupoFilter(preset.filters.grupoFilter);
                }
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600"
            >
              <option value="">Load Preset...</option>
              {filterPresets.map(preset => (
                <option key={preset.name} value={preset.name}>{preset.name}</option>
              ))}
            </select>
          )}
        </button>
      </div>

      {/* FILTER PRESETS MENU */}
      {showFilterPresets && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl shadow-sm border border-blue-200 dark:border-blue-800">
          <h4 className="text-sm font-black text-blue-900 dark:text-blue-400 uppercase mb-3">Save Current Filter as Preset</h4>
          <div className="flex gap-2">
            <input
              type="text"
              value={newPresetName}
              onChange={(e) => setNewPresetName(e.target.value)}
              placeholder="Preset name..."
              className="flex-1 px-3 py-2 rounded-lg border border-blue-300 dark:border-blue-700 bg-white dark:bg-slate-900 text-sm"
            />
            <button
              onClick={() => {
                if (newPresetName.trim()) {
                  const newPreset = {
                    name: newPresetName,
                    filters: {
                      searchQuery,
                      tungkulinFilter,
                      subRoleFilter,
                      kapisananFilter,
                      statusFilter,
                      purokFilter,
                      grupoFilter
                    }
                  };
                  setFilterPresets([...filterPresets, newPreset]);
                  setNewPresetName('');
                  setShowFilterPresets(false);
                  if (showToast) showToast('Filter preset saved!', 'success');
                }
              }}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold"
            >
              Save
            </button>
          </div>
          {filterPresets.length > 0 && (
            <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-700">
              <h5 className="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase mb-2">Saved Presets:</h5>
              <div className="flex flex-wrap gap-2">
                {filterPresets.map((preset, index) => (
                  <div key={preset.name} className="flex items-center gap-1 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-700">
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{preset.name}</span>
                    <button
                      onClick={() => setFilterPresets(filterPresets.filter((_, i) => i !== index))}
                      className="text-red-500 hover:text-red-700 text-xs ml-1"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* FILTERS BAR */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 flex flex-wrap lg:flex-nowrap gap-4 items-end transition-colors">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Hanapin (Pangalan o Registry)</label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
            className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-lg p-3 focus:ring-2 focus:ring-slate-500 outline-none transition-all uppercase text-gray-900 dark:text-white"
          />
        </div>

        <div className="w-full lg:w-48">
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Department</label>
          <select
            value={tungkulinFilter}
            onChange={(e) => {
              setTungkulinFilter(e.target.value);
              setSubRoleFilter('ALL');
            }}
            className="w-full border border-gray-300 dark:border-slate-600 rounded-lg p-3 outline-none bg-white dark:bg-slate-900 focus:ring-2 focus:ring-slate-500 font-bold text-slate-700 dark:text-slate-300"
          >
            <option value="ALL">LAHAT (ALL)</option>
            {departments.map((t) => (
              <option key={t.id} value={t.name}>{t.name}</option>
            ))}
          </select>
        </div>

        {selectedDeptData && selectedDeptData.specificRoles && selectedDeptData.specificRoles.length > 0 && (
          <div className="w-full lg:w-56">
            <label className="block text-xs font-bold text-blue-600 dark:text-blue-400 uppercase mb-1">Sub-Role (Gampanin)</label>
            <select
              value={subRoleFilter}
              onChange={(e) => setSubRoleFilter(e.target.value)}
              className="w-full border border-blue-300 dark:border-blue-800 rounded-lg p-3 outline-none bg-blue-50 dark:bg-blue-900/30 focus:ring-2 focus:ring-blue-600 font-bold text-blue-800 dark:text-blue-300"
            >
              <option value="ALL">LAHAT NG {selectedDeptData.name}</option>
              {selectedDeptData.specificRoles.map((r: string) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        )}

        <div className="w-full lg:w-40">
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Kapisanan</label>
          <select
            value={kapisananFilter}
            onChange={(e) => setKapisananFilter(e.target.value)}
            className="w-full border border-gray-300 dark:border-slate-600 rounded-lg p-3 outline-none bg-white dark:bg-slate-900 font-bold text-gray-700 dark:text-white"
          >
            <option value="ALL">LAHAT</option>
            <option value="BUKLOD">BUKLOD</option>
            <option value="KADIWA">KADIWA</option>
            <option value="BINHI">BINHI</option>
          </select>
        </div>

        <div className="w-full lg:w-40">
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full border border-gray-300 dark:border-slate-600 rounded-lg p-3 outline-none bg-white dark:bg-slate-900 font-bold text-gray-700 dark:text-white"
          >
            <option value="ALL">LAHAT</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
        </div>

        <div className="w-full lg:w-40">
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Purok <span className="text-gray-400 normal-case">(Area)</span></label>
          <select
            value={purokFilter}
            onChange={(e) => {
              setPurokFilter(e.target.value);
              setGrupoFilter('ALL');
            }}
            className="w-full border border-gray-300 dark:border-slate-600 rounded-lg p-3 outline-none bg-white dark:bg-slate-900 font-bold text-gray-700 dark:text-white"
          >
            <option value="ALL">LAHAT (ALL)</option>
            {uniquePurokValues.map(val => (
              <option key={val} value={val}>{val}</option>
            ))}
          </select>
        </div>

        {purokFilter !== 'ALL' && (
          <div className="w-full lg:w-32 animate-fadeIn">
            <label className="block text-xs font-bold text-blue-600 dark:text-blue-400 uppercase mb-1">Grupo <span className="text-blue-400 normal-case">(Group)</span></label>
            <select
              value={grupoFilter}
              onChange={(e) => setGrupoFilter(e.target.value)}
              className="w-full border border-blue-300 dark:border-blue-800 rounded-lg p-3 outline-none bg-blue-50 dark:bg-blue-900/30 font-bold text-blue-800 dark:text-blue-300"
            >
              <option value="ALL">LAHAT</option>
              {(() => {
                const selectedPurokObj = purokList?.find(p => p.name === purokFilter);
                if (selectedPurokObj && selectedPurokObj.groupCount > 0) {
                  return Array.from({ length: selectedPurokObj.groupCount }, (_, i) => (
                    <option key={i} value={`${i + 1}`}>{i + 1}</option>
                  ));
                }
                return null;
              })()}
            </select>
          </div>
        )}
      </div>

      {selectedOfficers.length > 0 && (
        <div className="flex gap-4 items-center bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-xl shadow-sm">
          <span className="font-black text-red-800 dark:text-red-400">
            {selectedOfficers.length} Record(s) Selected
          </span>
          <button
            onClick={clearSelection}
            className="bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 font-bold py-2 px-4 rounded-lg shadow-sm hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors text-sm"
          >
            Clear Selection
          </button>
          <button
            onClick={deleteSelected}
            className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors text-sm flex items-center gap-2"
          >
            🗑️ Delete Selected
          </button>
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-gray-200 dark:border-slate-700 overflow-hidden transition-colors">
        <div className="overflow-x-auto max-h-[600px]">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead className="sticky top-0 z-10">
              <tr className="bg-slate-50 dark:bg-slate-900 text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wider border-b-2 border-gray-200 dark:border-slate-700">
                <th className="p-3 w-10">
                  <button
                    onClick={() => {
                      if (expandedRows.size === paginatedOfficers.length) {
                        setExpandedRows(new Set());
                      } else {
                        setExpandedRows(new Set(paginatedOfficers.map(o => o.id)));
                      }
                    }}
                    className="text-xs font-bold text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                    title={expandedRows.size === paginatedOfficers.length ? "Collapse All" : "Expand All"}
                  >
                    {expandedRows.size === paginatedOfficers.length ? '−' : '+'}
                  </button>
                </th>
                {visibleColumns.actions && (
                  <th className="p-3 w-10">
                    <input
                      type="checkbox"
                      checked={selectedOfficers.length === paginatedOfficers.length && paginatedOfficers.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 cursor-pointer accent-slate-600"
                    />
                  </th>
                )}
                {visibleColumns.registry && (
                  <th className="p-4 font-black cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors" onClick={() => handleSort('registry')}>
                    Registry No. {getSortIcon('registry')}
                  </th>
                )}
                {visibleColumns.name && (
                  <th className="p-4 font-black cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors" onClick={() => handleSort('name')}>
                    Buong Pangalan {getSortIcon('name')}
                  </th>
                )}
                {visibleColumns.kapisanan && (
                  <th className="p-4 font-black cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors" onClick={() => handleSort('kapisanan')}>
                    Kapisanan {getSortIcon('kapisanan')}
                  </th>
                )}
                {visibleColumns.purok && (
                  <th className="p-4 font-black cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors" onClick={() => handleSort('prkGrp')}>
                    Purok-Grp {getSortIcon('prkGrp')}
                  </th>
                )}
                {visibleColumns.tungkulin && (
                  <th className="p-4 font-black">Mga Tungkulin</th>
                )}
                {visibleColumns.actions && (
                  <th className="p-4 font-black text-center">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
              {filteredOfficers.length === 0 ? (
                <tr>
                  <td colSpan={Object.values(visibleColumns).filter(Boolean).length} className="p-16">
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="w-24 h-24 mb-6 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-black text-gray-700 dark:text-gray-300 uppercase mb-2">Walang record na nahanap</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        Subukang baguhin ang inyong mga filter o magdagdag ng bagong record.
                      </p>
                      <button
                        onClick={() => openProfile()}
                        className="bg-slate-700 hover:bg-slate-800 text-white font-bold py-2 px-6 rounded-lg transition-colors text-sm uppercase"
                      >
                        + Magdagdag ng Record
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOfficers.map((officer, index) => {
                  const validRoles = officer.tungkulinList?.filter((t: any) => t.name.trim() !== '') || [];
                  const isSelected = selectedOfficers.includes(officer.id);
                  const isExpanded = expandedRows.has(officer.id);
                  return (
                    <React.Fragment key={officer.id}>
                      <tr
                        onClick={() => openProfile(officer)}
                        className={`hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors group ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                      >
                        <td className="p-3 w-10" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => {
                              const newExpanded = new Set(expandedRows);
                              if (newExpanded.has(officer.id)) {
                                newExpanded.delete(officer.id);
                              } else {
                                newExpanded.add(officer.id);
                              }
                              setExpandedRows(newExpanded);
                            }}
                            className="text-xs font-bold text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                          >
                            {isExpanded ? '−' : '+'}
                          </button>
                        </td>
                        {visibleColumns.actions && (
                          <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => toggleSelectOfficer(officer.id, e)}
                              className="w-4 h-4 cursor-pointer accent-slate-600"
                            />
                          </td>
                        )}
                        {visibleColumns.registry && (
                          <td className="p-4 font-mono text-xs text-gray-500 dark:text-gray-400 font-semibold group-hover:text-slate-600 dark:group-hover:text-slate-400">
                            {officer.registry}
                          </td>
                        )}
                        {visibleColumns.controlNumber && (
                          <td className="p-4 font-mono text-xs text-blue-600 dark:text-blue-400 font-bold group-hover:text-blue-700 dark:group-hover:text-blue-300 text-center">
                            {(officer.controlNumber || '').padStart(4, '0') || '-'}
                          </td>
                        )}
                        {visibleColumns.name && (
                          <td className="p-4 font-bold text-gray-900 dark:text-white uppercase">
                            {formatFullName(officer, officer.kapisanan)}
                          </td>
                        )}
                        {visibleColumns.kapisanan && (
                          <td className="p-4 text-sm text-gray-600 dark:text-gray-300 font-bold uppercase">
                            {officer.kapisanan}
                          </td>
                        )}
                        {visibleColumns.purok && (
                          <td className="p-4 text-sm text-gray-600 dark:text-gray-300 font-bold uppercase">
                            {officer.purok ? `${officer.purok}${officer.grupo ? ` - ${officer.grupo}` : ''}` : '-'}
                          </td>
                        )}
                        {visibleColumns.tungkulin && (
                          <td className="p-4 text-xs text-gray-800 dark:text-gray-200 font-black uppercase tracking-wide">
                            {validRoles.length > 0 ? (
                              <div className="space-y-1">
                                {validRoles.map((t: any, idx: number) => (
                                  <div key={idx} className="flex items-center gap-2">
                                    <span className="font-semibold">{t.name}</span>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${t.status === 'ACTIVE' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                      {t.status}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : 'N/A'}
                          </td>
                        )}
                        {visibleColumns.actions && (
                          <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => openProfile(officer)}
                              className="bg-slate-600 hover:bg-slate-700 text-white text-xs font-bold py-2 px-4 rounded-lg transition-colors"
                            >
                              VIEW
                            </button>
                          </td>
                        )}
                      </tr>
                      {isExpanded && (
                        <tr className="bg-slate-50 dark:bg-slate-800/50">
                          <td colSpan={Object.values(visibleColumns).filter(Boolean).length + 2} className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <h4 className="font-bold text-slate-600 dark:text-slate-400 uppercase text-xs mb-2">Personal Info</h4>
                                <p><span className="font-semibold">Gender:</span> {officer.gender}</p>
                                <p><span className="font-semibold">Birthday:</span> {officer.birthday || 'N/A'}</p>
                                <p><span className="font-semibold">Marriage Date:</span> {officer.marriageDate || 'N/A'}</p>
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-600 dark:text-slate-400 uppercase text-xs mb-2">Contact Info</h4>
                                <p><span className="font-semibold">Purok:</span> {officer.purok || 'N/A'}</p>
                                <p><span className="font-semibold">Grupo:</span> {officer.grupo || 'N/A'}</p>
                                <p><span className="font-semibold">Cell #:</span> {officer.cellphone ? `+63 ${officer.cellphone}` : 'N/A'}</p>
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-600 dark:text-slate-400 uppercase text-xs mb-2">Tungkulin List</h4>
                                {officer.tungkulinList?.length > 0 ? (
                                  <ul className="space-y-1">
                                    {officer.tungkulinList.map((t: any, idx: number) => (
                                      <li key={idx} className="text-xs">
                                        {t.name} - <span className={t.status === 'ACTIVE' ? 'text-green-600' : 'text-red-600'}>{t.status}</span>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-gray-500">No tungkulin assigned</p>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* PAGINATION CONTROLS */}
        {filteredOfficers.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50">
            <div className="flex items-center gap-4 mb-4 sm:mb-0">
              <span className="text-sm font-bold text-gray-500 dark:text-gray-400">
                Lahat ng Records: <span className="text-gray-900 dark:text-white">{filteredOfficers.length}</span>
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Ipakita:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="border border-gray-300 dark:border-slate-600 rounded-md p-1.5 text-sm bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 outline-none focus:ring-1 focus:ring-slate-500 font-bold"
                >
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={-1}>Lahat (All)</option>
                </select>
              </div>
            </div>

            {itemsPerPage !== -1 && totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-md text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 shadow-sm"
                >
                  &larr; Nakaraan
                </button>
                <div className="px-4 py-2 text-sm font-black text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700">
                  Pahina {currentPage} of {totalPages}
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-md text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 shadow-sm"
                >
                  Susunod &rarr;
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* EXPORT OPTIONS MODAL */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-8 max-w-sm w-full animate-slideDown border border-gray-200 dark:border-slate-700 m-4">
            <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-2">Preview & Export</h3>
            <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-6">Preview what will be downloaded before exporting {filteredOfficers.length} records</p>
            
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  setShowExportModal(false);
                  setShowPreview(true);
                  setPreviewTab('pdf');
                }}
                className="w-full bg-slate-700 hover:bg-slate-800 text-white font-black py-4 px-6 rounded-xl shadow-lg transition-all flex justify-between items-center group"
              >
                <span>Preview & Export</span>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
              </button>

              <button
                onClick={() => setShowExportModal(false)}
                className="w-full mt-2 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300 font-bold py-3 px-6 rounded-xl transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MASTERLIST PREVIEW MODAL */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl flex flex-col max-w-5xl w-full max-h-[90vh] h-full animate-slideDown border border-gray-200 dark:border-slate-700 m-4 overflow-hidden">
            {/* PREVIEW HEADER WITH TABS */}
            <div className="bg-gray-100 dark:bg-slate-800 p-4 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
              <div className="flex gap-2">
                <button
                  onClick={() => setPreviewTab('pdf')}
                  className={`px-6 py-2 rounded-lg font-bold uppercase text-sm transition-all ${previewTab === 'pdf' ? 'bg-green-600 text-white' : 'bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-slate-600'}`}
                >
                  PDF Preview
                </button>
                <button
                  onClick={() => setPreviewTab('excel')}
                  className={`px-6 py-2 rounded-lg font-bold uppercase text-sm transition-all ${previewTab === 'excel' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-slate-600'}`}
                >
                  Excel Preview
                </button>
              </div>
              <button onClick={() => setShowPreview(false)} className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white p-2 rounded-lg transition-colors text-2xl font-bold">×</button>
            </div>

            {/* COLUMN SELECTION */}
            <div className="bg-gray-50 dark:bg-slate-800 p-4 border-b border-gray-200 dark:border-slate-700">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase">Select Columns:</span>
                <div className="flex flex-wrap gap-3">
                  {Object.entries(exportVisibleColumns).map(([key, value]) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer bg-white dark:bg-slate-700 px-3 py-1 rounded-lg border border-gray-200 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => setExportVisibleColumns({...exportVisibleColumns, [key]: e.target.checked})}
                        className="w-4 h-4 rounded border-gray-300 text-slate-600 focus:ring-slate-500"
                      />
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">{key === 'purokGrupo' ? 'Purok-Grupo' : key === 'cell' ? 'Cell #' : key}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* PREVIEW CONTENT */}
            <div className="flex-1 overflow-auto p-6 bg-gray-50">
              {previewTab === 'pdf' ? (
                <div className="bg-white text-black p-8 mx-auto w-full max-w-[8.5in] shadow-lg" style={{ fontFamily: '"Palatino Linotype", "Book Antiqua", Palatino, serif' }} dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(generateMasterlistHTML().match(/<body>([\s\S]*?)<\/body>/)?.[1] || '')}} />
              ) : (
                <div className="bg-white text-black p-4 rounded-lg overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300 text-sm">
                    <thead>
                      <tr className="bg-gray-100">
                        {exportVisibleColumns.blg && <th className="border border-gray-300 p-2 text-left font-bold">Blg.</th>}
                        {exportVisibleColumns.registry && <th className="border border-gray-300 p-2 text-left font-bold">Registry No.</th>}
                        {exportVisibleColumns.controlNumber && <th className="border border-gray-300 p-2 text-left font-bold">Control No.</th>}
                        {exportVisibleColumns.pangalan && <th className="border border-gray-300 p-2 text-left font-bold">Pangalan</th>}
                        {exportVisibleColumns.kapisanan && <th className="border border-gray-300 p-2 text-left font-bold">Kapisanan</th>}
                        {exportVisibleColumns.purokGrupo && <th className="border border-gray-300 p-2 text-left font-bold">Purok-Grupo</th>}
                        {exportVisibleColumns.tungkulin && <th className="border border-gray-300 p-2 text-left font-bold">Tungkulin</th>}
                        {exportVisibleColumns.cell && <th className="border border-gray-300 p-2 text-left font-bold">Cell #</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOfficers.map((officer, index) => {
                        let displayRoles = '';
                        let displayCell = 'N/A';
                        const validRoles = officer.tungkulinList?.filter((t: any) => t.name.trim() !== '') || [];

                        if (tungkulinFilter !== 'ALL') {
                          const dept = departments.find((d) => d.name === tungkulinFilter);
                          const validRolesForDept = dept ? [dept.name, ...(dept.specificRoles || [])] : [tungkulinFilter];
                          const matchingRole = validRoles.find((t: any) => {
                            if (subRoleFilter !== 'ALL') return t.name === subRoleFilter;
                            return validRolesForDept.includes(t.name);
                          });
                          if (matchingRole) {
                            displayRoles = matchingRole.name;
                          }
                        } else {
                          displayRoles = validRoles.map((t: any) => t.name).join(', ') || 'N/A';
                        }

                        displayCell = officer.cellphone || 'N/A';

                        return (
                          <tr key={index} className="hover:bg-gray-50">
                            {exportVisibleColumns.blg && <td className="border border-gray-300 p-2">{index + 1}</td>}
                            {exportVisibleColumns.registry && <td className="border border-gray-300 p-2 font-bold">{officer.registry || 'N/A'}</td>}
                            {exportVisibleColumns.controlNumber && <td className="border border-gray-300 p-2 font-bold text-center">{(officer.controlNumber || '').padStart(4, '0') || '-'}</td>}
                            {exportVisibleColumns.pangalan && <td className="border border-gray-300 p-2">{formatFullName(officer, officer.kapisanan)}</td>}
                            {exportVisibleColumns.kapisanan && <td className="border border-gray-300 p-2">{officer.kapisanan || ''}</td>}
                            {exportVisibleColumns.purokGrupo && <td className="border border-gray-300 p-2">{officer.purok ? `${officer.purok}${officer.grupo ? ` - ${officer.grupo}` : ''}` : '-'}</td>}
                            {exportVisibleColumns.tungkulin && <td className="border border-gray-300 p-2">{displayRoles}</td>}
                            {exportVisibleColumns.cell && <td className="border border-gray-300 p-2 font-bold">{displayCell}</td>}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* PREVIEW FOOTER */}
            <div className="bg-gray-100 p-4 border-t border-gray-200 flex justify-end gap-3">
              <button onClick={() => setShowPreview(false)} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-6 rounded-lg transition-colors">
                Close
              </button>
              <button 
                onClick={() => {
                  if (previewTab === 'pdf') {
                    exportMasterlistPDF();
                  } else {
                    exportMasterlistExcel();
                  }
                }} 
                disabled={isExporting} 
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-all"
              >
                {isExporting ? 'Downloading...' : 'Download'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NOTIFICATION */}
      {notification && (
        <div className={`fixed bottom-6 right-6 z-[100] px-6 py-4 rounded-xl shadow-lg font-bold text-white uppercase text-sm transition-all animate-slideUp ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {notification.message}
        </div>
      )}
    </div>
  );
}
