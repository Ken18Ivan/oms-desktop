import { useMemo, useState } from 'react';
import { formatFullName } from '../../utils';

interface MaytungkulinSearchViewProps {
  officers: any[];
  openProfile: (officer?: any) => void;
}

export default function MaytungkulinSearchView({ officers, openProfile }: MaytungkulinSearchViewProps) {
  const [query, setQuery] = useState('');
  const hasQuery = query.trim().length > 0;

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();

    const rows = officers.flatMap((officer) => {
      const validRoles = officer.tungkulinList?.filter((t: any) => t.name?.trim() !== '') || [];
      return validRoles.map((t: any, idx: number) => ({
        id: `${officer.id}-${idx}`,
        officer,
        tungkulin: t.name,
        status: t.status || 'N/A'
      }));
    });

    if (!q) return [];

    return rows.filter((row) => {
      const officer = row.officer;
      const fullName = formatFullName(officer, officer.kapisanan).toLowerCase();
      const registry = (officer.registry || '').toLowerCase();
      const control = String(officer.controlNumber || '').padStart(4, '0').toLowerCase();
      const role = String(row.tungkulin || '').toLowerCase();
      return fullName.includes(q) || registry.includes(q) || control.includes(q) || role.includes(q);
    });
  }, [officers, query]);

  return (
    <div className="space-y-5 print:hidden">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700">
        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">MT Search</label>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Name, Registry, Control #, or Tungkulin"
          className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded-lg p-3 focus:ring-2 focus:ring-slate-500 outline-none transition-all text-gray-900 dark:text-white"
        />
      </div>

      <div className="space-y-3">
        {!hasQuery ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-8 text-center text-gray-500 dark:text-gray-400 font-medium">
            Mag-type ng MT keyword para lumabas ang resulta.
          </div>
        ) : filteredRows.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-8 text-center text-gray-500 dark:text-gray-400 font-medium">
            Walang maytungkulin na nahanap.
          </div>
        ) : (
          filteredRows.map((row) => {
            const officer = row.officer;
            return (
              <button
                key={row.id}
                onClick={() => openProfile(officer)}
                className="w-full text-left bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-4 hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white uppercase">{formatFullName(officer, officer.kapisanan)}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Registry: {officer.registry || 'N/A'} | Control: {String(officer.controlNumber || '').padStart(4, '0') || '-'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 font-bold text-slate-700 dark:text-slate-200 uppercase">{row.tungkulin}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${row.status === 'ACTIVE' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                      {row.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
