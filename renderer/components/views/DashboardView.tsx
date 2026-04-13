
import { Users, Activity, AlertCircle, ChevronRight, AlertTriangle, FileWarning, Plus, FileSpreadsheet, Cake, Search } from 'lucide-react';

interface DeptHealth {
  name: string;
  target: number;
  active: number;
  deficit: number;
}

interface DashData {
  total: number;
  active: number;
  inactive: number;
  buklod: number;
  kadiwa: number;
  binhi: number;
  target?: number;
  missingRegistry: number;
  missingPurok: number;
  missingInfos: number;
  deptHealth: DeptHealth[];
  birthdaysThisMonth: any[];
  birthdaysNextMonth: any[];
}

interface DashboardViewProps {
  dashData: DashData;
  todayDate: string;
  handleNavigation: (view: 'DASHBOARD' | 'DATABASE' | 'PROFILE' | 'SETTINGS' | 'ENCODING' | 'MT_SEARCH') => void;
  setStatusFilter: (filter: string) => void;
  setSearchQuery: (query: string) => void;
}

export default function DashboardView({ dashData, todayDate, handleNavigation, setStatusFilter, setSearchQuery }: DashboardViewProps) {

  const activePercentage = dashData.total > 0 ? Math.round((dashData.active / dashData.total) * 100) : 0;
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (activePercentage / 100) * circumference;

  const navigateToFilteredDb = (status: string, specialQuery: string = '') => {
    setStatusFilter(status);
    setSearchQuery(specialQuery);
    handleNavigation('DATABASE');
  };

  return (
    <div className="space-y-6 animate-fadeIn no-print font-sans max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-gray-300 dark:border-slate-700 pb-4">
        <div>
          <h2 className="text-3xl font-black text-gray-800 dark:text-white uppercase tracking-tight flex items-center gap-2">
            <Activity className="w-8 h-8 text-[#006B3F] dark:text-green-400" />
            Main Dashboard
          </h2>
          <p className="text-gray-500 font-medium text-sm mt-1">
            Overall Lokal Summary as of {todayDate}
          </p>
        </div>
      </div>

      {/* TOP METRICS GRIDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* TOTAL OFFICERS CARD */}
        <div
          onClick={() => navigateToFilteredDb('ALL')}
          className="group cursor-pointer bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-gray-200 dark:border-slate-700 hover:shadow-lg transition-all hover:-translate-y-1 relative overflow-hidden"
        >
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Users className="w-32 h-32" />
          </div>
          <div className="flex justify-between items-start mb-4">
            <div className="bg-gray-100 dark:bg-slate-700 p-3 rounded-2xl">
              <Users className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" />
          </div>
          <div className="flex flex-col">
            <span className="text-4xl font-black text-gray-800 dark:text-white">{dashData.total}</span>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Total MT sa Lokal</span>
          </div>
        </div>

        {/* OFFICERS ENCODING CARD */}
        <div
          onClick={() => handleNavigation('ENCODING')}
          className="group cursor-pointer bg-gradient-to-br from-teal-50 to-cyan-100 dark:from-teal-900/20 dark:to-cyan-900/10 rounded-3xl p-6 shadow-sm border border-teal-200 dark:border-teal-800 hover:shadow-lg transition-all hover:-translate-y-1 relative overflow-hidden"
        >
          <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity text-[#006B3F]">
            <FileSpreadsheet className="w-32 h-32" />
          </div>
          <div className="flex justify-between items-start mb-4">
            <div className="bg-white/60 dark:bg-teal-900/50 p-3 rounded-2xl backdrop-blur-sm">
              <Plus className="w-6 h-6 text-[#006B3F] dark:text-teal-400" />
            </div>
            <ChevronRight className="w-5 h-5 text-teal-600 dark:text-teal-400 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-black text-[#006B3F] dark:text-teal-400">Officers Encoding</span>
            <span className="text-xs font-bold text-teal-800 dark:text-teal-500 uppercase tracking-widest mt-1">Add Record / Bulk Import</span>
          </div>
        </div>

        {/* MT SEARCH CARD */}
        <div
          onClick={() => handleNavigation('MT_SEARCH')}
          className="group cursor-pointer bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900/30 dark:to-slate-800/20 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all hover:-translate-y-1 relative overflow-hidden"
        >
          <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity text-slate-600 dark:text-slate-300">
            <Search className="w-32 h-32" />
          </div>
          <div className="flex justify-between items-start mb-4">
            <div className="bg-white/70 dark:bg-slate-900/50 p-3 rounded-2xl backdrop-blur-sm">
              <Search className="w-6 h-6 text-slate-700 dark:text-slate-300" />
            </div>
            <ChevronRight className="w-5 h-5 text-slate-500 dark:text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-black text-slate-800 dark:text-slate-200">MT Search</span>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mt-1">Find MT Quickly</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* COMPOSITE METRICS COLUMN (LEFT 2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* HEALTH RING & KAPISANAN OVERVIEW */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-gray-200 dark:border-slate-700 flex flex-col md:flex-row gap-8 items-center justify-between">

            {/* Circular Gauge */}
            <div className="flex items-center gap-6">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="transform -rotate-90 w-32 h-32">
                  <circle cx="64" cy="64" r={radius} className="stroke-current text-gray-100 dark:text-slate-700" strokeWidth="12" fill="transparent" />
                  <circle cx="64" cy="64" r={radius} className="stroke-current text-[#006B3F] dark:text-green-500 transition-all duration-1000 ease-out" strokeWidth="12" fill="transparent" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-gray-800 dark:text-white">{activePercentage}%</span>
                </div>
              </div>
              <div>
                <h3 className="font-black tracking-tight text-xl text-gray-900 dark:text-white mb-1">Health Rate</h3>
                <p className="text-xs font-bold text-gray-500">Ang porsyento ng Overall Active MT</p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => navigateToFilteredDb('ACTIVE')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs font-bold"
                  >
                    Active: {dashData.active}
                  </button>
                  <button
                    onClick={() => navigateToFilteredDb('INACTIVE')}
                    className="px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs font-bold"
                  >
                    Inactive: {dashData.inactive}
                  </button>
                </div>
              </div>
            </div>

            {/* Kapisanan Breakdowns */}
            <div className="flex gap-8 w-full md:w-auto mt-6 md:mt-0 pt-6 md:pt-0 border-t md:border-t-0 md:border-l border-gray-100 dark:border-slate-700 md:pl-8">
              <div className="text-center">
                <div className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase mb-1">Buklod</div>
                <div className="text-3xl font-black text-gray-800 dark:text-white">{dashData.buklod}</div>
              </div>
              <div className="text-center">
                <div className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase mb-1">Kadiwa</div>
                <div className="text-3xl font-black text-gray-800 dark:text-white">{dashData.kadiwa}</div>
              </div>
              <div className="text-center">
                <div className="text-xs font-bold text-green-700 dark:text-green-400 uppercase mb-1">Binhi</div>
                <div className="text-3xl font-black text-gray-800 dark:text-white">{dashData.binhi}</div>
              </div>
            </div>
          </div>

          {/* DEPARTMENT QUOTA TICKER */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-gray-200 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-6 border-b border-gray-100 dark:border-slate-700 pb-4">
              <Activity className="w-5 h-5 text-gray-400" />
              <h3 className="font-black text-gray-800 dark:text-white uppercase tracking-wider text-sm">Department Quota Tracking</h3>
            </div>

            {dashData.deptHealth.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm font-bold bg-gray-50 dark:bg-slate-900/50 rounded-2xl">No departments configured yet.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dashData.deptHealth.slice(0, 6).map((dept, index) => (
                  <div key={index} className="flex justify-between items-center p-4 rounded-2xl bg-gray-50 dark:bg-slate-900/80 border border-gray-100 dark:border-slate-700/50">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-black text-gray-900 dark:text-gray-100 truncate">{dept.name}</div>
                      <div className="text-[10px] font-bold text-gray-500">Target: {dept.target}</div>
                    </div>
                    <div className="flex items-center gap-4 ml-4">
                      <div className="text-center">
                        <div className="text-xs font-black text-[#006B3F] dark:text-green-400">{dept.active}</div>
                        <div className="text-[9px] font-bold text-gray-400 uppercase">Active</div>
                      </div>
                      <div className={`text-center px-3 py-1 rounded-lg ${dept.deficit > 0 ? 'bg-red-100 dark:bg-red-900/30' : 'bg-gray-100 dark:bg-slate-800'}`}>
                        <div className={`text-xs font-black ${dept.deficit > 0 ? 'text-[#CE1126] dark:text-red-400' : 'text-gray-400'}`}>-{dept.deficit}</div>
                        <div className="text-[9px] font-bold text-gray-500 uppercase">Kulang</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* ACTION REQUIRED COLUMN (RIGHT 1/3) */}
        <div className="bg-amber-50 dark:bg-yellow-900/10 rounded-3xl p-6 shadow-sm border border-amber-200 dark:border-yellow-700/50 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-yellow-500" />
            <h3 className="font-black text-amber-900 dark:text-yellow-500 uppercase tracking-wider text-sm">Action Required</h3>
          </div>

          <div className="space-y-3 mb-6">

            {/* Missing Registry */}
            <div
              onClick={() => navigateToFilteredDb('ALL', '!MISSING_REGISTRY')}
              className="group flex justify-between items-center bg-white dark:bg-slate-800 p-3 rounded-2xl border border-amber-100 dark:border-yellow-700/30 cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-3">
                <div className="bg-amber-100 dark:bg-yellow-900/40 p-2 rounded-full">
                  <FileWarning className="w-4 h-4 text-amber-700 dark:text-yellow-500" />
                </div>
                <div>
                  <span className="block text-sm font-black text-gray-800 dark:text-white">Missing Registry</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-amber-600 dark:text-yellow-500">{dashData.missingRegistry}</span>
                <ChevronRight className="w-4 h-4 text-amber-300 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" />
              </div>
            </div>

            {/* Missing Info */}
            <div
              onClick={() => navigateToFilteredDb('ALL', '!MISSING_INFOS')}
              className="group flex justify-between items-center bg-white dark:bg-slate-800 p-3 rounded-2xl border border-amber-100 dark:border-yellow-700/30 cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-3">
                <div className="bg-amber-100 dark:bg-yellow-900/40 p-2 rounded-full">
                  <AlertCircle className="w-4 h-4 text-amber-700 dark:text-yellow-500" />
                </div>
                <div>
                  <span className="block text-sm font-black text-gray-800 dark:text-white">Missing Info</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-amber-600 dark:text-yellow-500">{dashData.missingInfos || 0}</span>
                <ChevronRight className="w-4 h-4 text-amber-300 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" />
              </div>
            </div>

          </div>

          {/* BIRTHDAYS SECTION */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-4">
              <Cake className="w-5 h-5 text-pink-600 dark:text-pink-400" />
              <h3 className="font-black text-pink-900 dark:text-pink-500 uppercase tracking-wider text-sm">Birthdays</h3>
            </div>

            <div className="space-y-3">
              {/* This Month */}
              <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl border border-pink-100 dark:border-pink-700/30">
                <div className="mb-2">
                  <span className="block text-sm font-black text-gray-800 dark:text-white">This Month</span>
                  <span className="block text-[10px] font-bold text-gray-500">{new Date().toLocaleDateString('en-US', { month: 'long' })}</span>
                </div>
                {dashData.birthdaysThisMonth && dashData.birthdaysThisMonth.length > 0 ? (
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {dashData.birthdaysThisMonth.map((officer: any) => {
                      const bday = new Date(officer.bday);
                      const today = new Date();
                      const age = today.getFullYear() - bday.getFullYear() - ((today.getMonth() < bday.getMonth() || (today.getMonth() === bday.getMonth() && today.getDate() < bday.getDate())) ? 1 : 0);
                      const birthDateStr = bday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                      return (
                        <div key={officer.id} className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-gray-700 dark:text-gray-300">{officer.lastNameFather}, {officer.firstName}</span>
                          <span className="text-pink-600 dark:text-pink-400 font-bold">{birthDateStr} ({age})</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-[10px] text-gray-400 italic">No birthdays this month</p>
                )}
              </div>

              {/* Next Month */}
              <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl border border-pink-100 dark:border-pink-700/30">
                <div className="mb-2">
                  <span className="block text-sm font-black text-gray-800 dark:text-white">Next Month</span>
                  <span className="block text-[10px] font-bold text-gray-500">
                    {new Date(new Date().setMonth(new Date().getMonth() + 1)).toLocaleDateString('en-US', { month: 'long' })}
                  </span>
                </div>
                {dashData.birthdaysNextMonth && dashData.birthdaysNextMonth.length > 0 ? (
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {dashData.birthdaysNextMonth.map((officer: any) => {
                      const bday = new Date(officer.bday);
                      const today = new Date();
                      const age = today.getFullYear() - bday.getFullYear() - ((today.getMonth() < bday.getMonth() || (today.getMonth() === bday.getMonth() && today.getDate() < bday.getDate())) ? 1 : 0);
                      const birthDateStr = bday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                      return (
                        <div key={officer.id} className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-gray-700 dark:text-gray-300">{officer.lastNameFather}, {officer.firstName}</span>
                          <span className="text-pink-600 dark:text-pink-400 font-bold">{birthDateStr} ({age})</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-[10px] text-gray-400 italic">No birthdays next month</p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-amber-200/50 dark:border-yellow-700/30">
            <p className="text-[10px] text-amber-700/70 dark:text-yellow-500/70 font-bold uppercase text-center leading-relaxed">
              Manatiling updated ang inyong database upang maging tama ang inyong inilalabas na talaan.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
