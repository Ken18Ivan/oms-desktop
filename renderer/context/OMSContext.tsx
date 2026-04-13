import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { formatFullName, validateOfficer } from '../utils';

interface IpcHandler {
  invoke: (channel: string, data?: any) => Promise<any>;
  selectFolder: () => Promise<string | null>;
}

declare global {
  interface Window {
    ipc: IpcHandler;
  }
}



// ============================================================
// TYPES
// ============================================================
interface Department {
  id: string;
  name: string;
  target: number;
  specificRoles: string[];
}

interface Purok {
  id: string;
  name: string;
  groupCount: number;
}

interface ConfirmModalState {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  isDestructive?: boolean;
}

interface OMSContextValue {
  // Auth
  isLoaded: boolean;
  isAuthenticated: boolean;
  setIsAuthenticated: (v: boolean) => void;
  usernameInput: string;
  setUsernameInput: (v: string) => void;
  currentUsername: string;
  setCurrentUsername: (v: string) => void;
  passwordInput: string;
  setPasswordInput: (v: string) => void;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
  authError: boolean;
  handleLogin: (e?: React.FormEvent) => void;
  authModalOpen: boolean;
  setAuthModalOpen: (v: boolean) => void;
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

  // UI
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  showHeader: boolean;
  view: 'DASHBOARD' | 'DATABASE' | 'PROFILE' | 'SETTINGS' | 'ENCODING' | 'MT_SEARCH';
  handleNavigation: (v: 'DASHBOARD' | 'DATABASE' | 'PROFILE' | 'SETTINGS' | 'ENCODING' | 'MT_SEARCH') => void;
  autoBackupEnabled: boolean;
  setAutoBackupEnabled: (v: boolean) => void;
  autoBackupFrequency: number; // in minutes
  setAutoBackupFrequency: (v: number) => void;
  notification: { show: boolean; message: string; type: string };
  setNotification: (v: any) => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
  confirmModalState: ConfirmModalState | null;
  setConfirmModalState: (v: ConfirmModalState | null) => void;

  // Core data
  officers: any[];
  setOfficers: (v: any[]) => void;
  departments: Department[];
  setDepartments: (v: Department[]) => void;
  purokList: Purok[];
  setPurokList: (v: Purok[]) => void;

  // Derived / computed
  filteredOfficers: any[];
  dashData: any;
  todayDate: string;
  allRolesMasterList: string[];
  uniquePurokValues: string[];

  // Filters & sorting
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  kapisananFilter: string;
  setKapisananFilter: (v: string) => void;
  tungkulinFilter: string;
  setTungkulinFilter: (v: string) => void;
  subRoleFilter: string;
  setSubRoleFilter: (v: string) => void;
  statusFilter: string;
  setStatusFilter: (v: string) => void;
  purokFilter: string;
  setPurokFilter: (v: string) => void;
  grupoFilter: string;
  setGrupoFilter: (v: string) => void;
  sortField: 'name' | 'registry' | 'prkGrp' | 'kapisanan';
  setSortField: (v: 'name' | 'registry' | 'prkGrp' | 'kapisanan') => void;
  sortDirection: 'asc' | 'desc';
  setSortDirection: (v: 'asc' | 'desc') => void;

  // Officer CRUD
  formState: any;
  setFormState: (v: any) => void;
  openProfile: (officer?: any) => void;
  saveOfficer: () => Promise<void>;
  deleteOfficer: (id: string) => void;
  bulkImportOfficers: (officers: any[]) => void;
  bulkImportDepartments: (inputText: string) => void;
  handleFormChange: (field: string, value: string) => void;
  handleTungkulinChange: (id: string, field: string, value: string) => void;
  addTungkulinRow: () => void;
  removeTungkulinRow: (id: string) => void;
  invalidFields: string[];
  setInvalidFields: (v: any) => void;
  isDirty: boolean;
  setIsDirty: (v: boolean) => void;
  isLoading: boolean;
  setIsLoading: (v: boolean) => void;

  // Dropdown / autocomplete
  activeDropdown: { id: string; field: string; query?: string } | null;
  setActiveDropdown: (v: any) => void;
  focusedIndex: number;
  setFocusedIndex: (v: any) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>, id: string, currentValue: string) => void;

  // Bulk selection
  selectedOfficers: string[];
  toggleSelectAll: () => void;
  toggleSelectOfficer: (id: string, e: React.MouseEvent | React.ChangeEvent) => void;
  clearSelection: () => void;
  deleteSelected: () => void;

  // Patotoo
  isPatotooView: boolean;
  setIsPatotooView: (v: boolean) => void;
  patotooData: any;
  setPatotooData: (v: any) => void;

  // Print / export
  isPrintingMasterlist: boolean;
  setIsPrintingMasterlist: (v: boolean) => void;
  downloadBackup: () => void;

  // Settings / storage
  saveLocation: string;
  setSaveLocation: (v: string) => void;
  handleFolderPick: () => Promise<void>;
  handleLoadDatabase: () => Promise<void>;
  debugLog: string;

  // Departments
  newDeptName: string;
  setNewDeptName: (v: string) => void;
  newDeptTarget: number;
  setNewDeptTarget: (v: number) => void;
  addDepartment: () => void;
  updateDeptTarget: (id: string, target: number) => void;
  deleteDepartment: (id: string) => void;
  newRoleInputs: Record<string, string>;
  setNewRoleInputs: (v: Record<string, string>) => void;
  addSpecificRole: (deptId: string) => void;
  removeSpecificRole: (deptId: string, role: string) => void;

  // Purok management
  newPurokName: string;
  setNewPurokName: (v: string) => void;
  newPurokGroupCount: number;
  setNewPurokGroupCount: (v: number) => void;
  addPurok: () => void;
  deletePurok: (id: string) => void;

  // Password change
  newPassword: string;
  setNewPassword: (v: string) => void;
  confirmPassword: string;
  setConfirmPassword: (v: string) => void;

  // Username management
  newUsername: string;
  setNewUsername: (v: string) => void;
  currentPasswordForAuth: string;
  setCurrentPasswordForAuth: (v: string) => void;
  updateUsername: () => void;
  updatePassword: () => void;
}

// ============================================================
// CONTEXT
// ============================================================
const OMSContext = createContext<OMSContextValue | null>(null);

export function useOMS(): OMSContextValue {
  const ctx = useContext(OMSContext);
  if (!ctx) throw new Error('useOMS must be used inside <OMSProvider>');
  return ctx;
}

// ============================================================
// PROVIDER
// ============================================================
export function OMSProvider({ children }: { children: React.ReactNode }) {

  // ── Auth ──────────────────────────────────────────────────
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUsername, setCurrentUsername] = useState('');
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState(false);
  const lastActivityRef = React.useRef(Date.now());

  useEffect(() => {
    const wakeUpSilently = async () => {
      try {
        if (typeof window === 'undefined' || !window.ipc) {
          setIsLoaded(true);
          return;
        }
        const result = await window.ipc.invoke('load-db');
        if (result?.success && result?.data) {
          if (result.data.officers) setOfficers(result.data.officers);
          if (result.data.departments) setDepartments(result.data.departments);
          if (result.data.puroks) setPurokList(result.data.puroks);
          if (result.rememberedFolder) setSaveLocation(result.rememberedFolder);
        }
      } catch (err) {
      } finally {
        setIsLoaded(true);
      }
    };
    wakeUpSilently();
  }, []);

  // Session timeout
  useEffect(() => {
    if (!isAuthenticated) return;
    const updateActivity = () => { lastActivityRef.current = Date.now(); };
    const events = ['click', 'mousemove', 'keydown', 'scroll'];
    events.forEach(ev => window.addEventListener(ev, updateActivity, { passive: true }));
    const interval = setInterval(() => {
      if (Date.now() - lastActivityRef.current > 1800000) {
        sessionStorage.removeItem('iligan_auth');
        setIsAuthenticated(false);
        alert('Session expired due to inactivity.');
      }
    }, 10000);
    return () => {
      events.forEach(ev => window.removeEventListener(ev, updateActivity));
      clearInterval(interval);
    };
  }, [isAuthenticated]);

  const handleLogin = (e?: React.FormEvent) => {
    e?.preventDefault();
    const systemUsername = typeof window !== 'undefined' ? localStorage.getItem('oms_system_username') : null;
    const systemPassword = typeof window !== 'undefined' ? localStorage.getItem('oms_system_password') : null;
    const defaultUsername = 'cor.14377';
    const defaultPassword = 'lan00501042';

    // First-time setup - no credentials exist, allow creation or use defaults
    if (!systemUsername || !systemPassword) {
      if (usernameInput === defaultUsername && passwordInput === defaultPassword) {
        // Use default credentials
        if (typeof window !== 'undefined') {
          localStorage.setItem('oms_system_username', defaultUsername);
          localStorage.setItem('oms_system_password', defaultPassword);
        }
        setIsAuthenticated(true);
        setCurrentUsername(defaultUsername);
        setAuthError(false);
        setPasswordInput('');
        showToast('Logged in with default credentials', 'success');
      } else if (usernameInput && passwordInput) {
        // Create custom initial credentials
        if (typeof window !== 'undefined') {
          localStorage.setItem('oms_system_username', usernameInput);
          localStorage.setItem('oms_system_password', passwordInput);
        }
        setIsAuthenticated(true);
        setCurrentUsername(usernameInput);
        setAuthError(false);
        setPasswordInput('');
        showToast('Initial credentials created successfully!', 'success');
      } else {
        showToast('Please enter username and password to set up initial credentials', 'error');
      }
      return;
    }

    if (usernameInput === systemUsername && passwordInput === systemPassword) {
      setIsAuthenticated(true);
      setCurrentUsername(usernameInput);
      setAuthError(false);
      setPasswordInput('');
    } else {
      setAuthError(true);
    }
  };

  // ── UI ────────────────────────────────────────────────────
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('iligan_theme');
      if (saved === 'dark') {
        setIsDarkMode(true);
        if (typeof document !== 'undefined') {
          document.documentElement.classList.add('dark');
        }
      }
    }
  }, []);

  const toggleDarkMode = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem('iligan_theme', next ? 'dark' : 'light');
    }
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', next);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setShowHeader(!(y > lastScrollY && y > 60));
      setLastScrollY(y);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
  };

  const [confirmModalState, setConfirmModalState] = useState<ConfirmModalState | null>(null);

  const runConfirm = (title: string, message: string, onConfirm: () => void, isDestructive = true) => {
    setConfirmModalState({ isOpen: true, title, message, onConfirm, isDestructive });
  };

  // ── Navigation ────────────────────────────────────────────
  const [view, setView] = useState<'DASHBOARD' | 'DATABASE' | 'PROFILE' | 'SETTINGS' | 'ENCODING' | 'MT_SEARCH'>('DASHBOARD');
  const [isDirty, setIsDirty] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('oms_auto_backup') === 'true';
    }
    return false;
  });
  const [autoBackupFrequency, setAutoBackupFrequency] = useState(() => {
    if (typeof window !== 'undefined') {
      return parseInt(localStorage.getItem('oms_backup_frequency') || '30', 10);
    }
    return 30;
  });

  // Persist auto backup settings
  const handleSetAutoBackupEnabled = (enabled: boolean) => {
    setAutoBackupEnabled(enabled);
    if (typeof window !== 'undefined') {
      localStorage.setItem('oms_auto_backup', String(enabled));
    }
  };

  const handleSetAutoBackupFrequency = (frequency: number) => {
    setAutoBackupFrequency(frequency);
    if (typeof window !== 'undefined') {
      localStorage.setItem('oms_backup_frequency', String(frequency));
    }
  };

  const handleNavigation = (newView: 'DASHBOARD' | 'DATABASE' | 'PROFILE' | 'SETTINGS' | 'ENCODING' | 'MT_SEARCH') => {
    if (isDirty) {
      runConfirm('May Mga Hindi Pa Naka-save', 'Sigurado ka ba? Mawawala ang lahat ng iyong ginawang pagbabago.', () => {
        setIsDirty(false);
        setView(newView);
      }, true);
    } else {
      setIsDirty(false);
      setView(newView);
    }
  };

  // ── Core Data ─────────────────────────────────────────────
  const [officers, setOfficers] = useState<any[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [purokList, setPurokList] = useState<Purok[]>([]);

  // Auto backup effect
  useEffect(() => {
    if (!autoBackupEnabled) return;

    const interval = setInterval(() => {
      downloadBackup();
      showToast('Auto backup completed', 'success');
    }, autoBackupFrequency * 60 * 1000); // Convert minutes to milliseconds

    return () => clearInterval(interval);
  }, [autoBackupEnabled, autoBackupFrequency, officers, departments, purokList]);

  // ── Storage ───────────────────────────────────────────────
  const [saveLocation, setSaveLocation] = useState('Documents (Default)');
  const [debugLog, setDebugLog] = useState('System Ready');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('oms_custom_path');
      if (saved) setSaveLocation(saved);
    }
  }, []);

  const saveToBackend = async (updatedOfficers: any[], updatedDepts: any[], updatedPuroks: any[] = purokList) => {
    try {
      let path = saveLocation;
      if (path === 'Documents (Default)' && typeof window !== 'undefined') path = localStorage.getItem('oms_custom_path') || '';
      const result = await window.ipc.invoke('save-db', {
        data: { officers: updatedOfficers, departments: updatedDepts, puroks: updatedPuroks },
        customPath: path
      });
      if (!result?.success) showToast('Save failed: ' + (result?.error || 'Unknown error'), 'error');
    } catch (err) {
      showToast('IPC communication error', 'error');
    }
  };

  const handleFolderPick = async () => {
    try {
      if (!window.ipc) {
        setDebugLog('ERROR: IPC not available. Make sure the app is running in Electron.');
        return;
      }
      const folderPath = await window.ipc.invoke('select-folder');
      if (folderPath) {
        setDebugLog('Folder selected! Loading from: ' + folderPath);
        setSaveLocation(folderPath);
        const loadResult = await window.ipc.invoke('load-db', folderPath);
        if (loadResult?.success && loadResult?.data) {
          if (loadResult.data.officers) setOfficers(loadResult.data.officers);
          if (loadResult.data.departments) setDepartments(loadResult.data.departments);
          if (loadResult.data.puroks) setPurokList(loadResult.data.puroks);
          setDebugLog('SUCCESS: Database loaded from ' + folderPath);
        }
        if (folderPath) {
          setDebugLog('Folder selected. Will save new database here: ' + folderPath);
        }
        if (typeof window !== 'undefined') localStorage.setItem('oms_custom_path', folderPath);
      }
    } catch (err: any) {
      setDebugLog('ERROR: ' + err.message);
    }
  };

  const handleLoadDatabase = async () => {
    try {
      if (!window.ipc) {
        showToast('❌ System Error: IPC not available.', 'error');
        return;
      }
      const folderPath = await window.ipc.invoke('select-folder');
      if (folderPath) {
        setSaveLocation(folderPath);
        if (typeof window !== 'undefined') localStorage.setItem('oms_custom_path', folderPath);
        const result = await window.ipc.invoke('load-db', folderPath);
        if (result?.success && result?.data) {
          if (result.data.officers) setOfficers(result.data.officers);
          if (result.data.departments) setDepartments(result.data.departments);
          if (result.data.puroks) setPurokList(result.data.puroks);
          showToast('✅ Matagumpay na nai-load ang mga record!');
        } else {
          showToast('❌ Walang nakitang record sa folder na ito.', 'error');
        }
      }
    } catch {
      showToast('❌ System Error: Hindi ma-load ang file.', 'error');
    }
  };

  // ── Filters & Sorting ─────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [kapisananFilter, setKapisananFilter] = useState('ALL');
  const [tungkulinFilter, setTungkulinFilter] = useState('ALL');
  const [subRoleFilter, setSubRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [purokFilter, setPurokFilter] = useState('ALL');
  const [grupoFilter, setGrupoFilter] = useState('ALL');
  const [sortField, setSortField] = useState<'name' | 'registry' | 'prkGrp' | 'kapisanan'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // ── Derived Data ──────────────────────────────────────────
  const allRolesMasterList = useMemo(() => {
    const roles: string[] = [];
    departments.forEach(dept => {
      dept.specificRoles?.forEach(role => {
        if (role && !roles.includes(role)) roles.push(role);
      });
    });
    return roles.sort();
  }, [departments]);

  const uniquePurokValues = useMemo(() => {
    const vals = new Set<string>();
    officers.forEach(o => { if (o.purok?.trim()) vals.add(o.purok.trim()); });
    return Array.from(vals).sort();
  }, [officers]);

  const filteredOfficers = useMemo(() => {
    const filtered = officers.filter(officer => {
      const fullName = formatFullName(officer, officer.kapisanan).toLowerCase();
      const searchLow = searchQuery.toLowerCase();

      let matchesSearch = false;
      if (searchQuery === '!MISSING_REGISTRY') {
        matchesSearch = !officer.registry || officer.registry.trim() === '';
      } else if (searchQuery === '!MISSING_PUROK') {
        matchesSearch = !officer.purok || officer.purok.trim() === '';
      } else if (searchQuery === '!MISSING_INFOS') {
        // Missing Petsa Nanumpa (active tungkulin without inOathDate)
        const hasActiveWithoutOathDate = officer.tungkulinList?.some((t: any) => t.status === 'ACTIVE' && (!t.inOathDate || t.inOathDate.trim() === ''));
        // Missing Petsa Nabawas/OUT (inactive tungkulin without outDropDate)
        const hasInactiveWithoutDropDate = officer.tungkulinList?.some((t: any) => t.status === 'INACTIVE' && (!t.outDropDate || t.outDropDate.trim() === ''));
        // Missing Kapisanan
        const missingKapisanan = !officer.kapisanan || officer.kapisanan.trim() === '';
        matchesSearch = hasActiveWithoutOathDate || hasInactiveWithoutDropDate || missingKapisanan;
      } else {
        matchesSearch = fullName.includes(searchLow) || (officer.registry && officer.registry.toLowerCase().includes(searchLow)) || (officer.controlNumber && officer.controlNumber.toLowerCase().includes(searchLow));
      }

      const matchesKapisanan = kapisananFilter === 'ALL' || officer.kapisanan === kapisananFilter;
      const matchesPurok = purokFilter === 'ALL' || officer.purok === purokFilter;
      const matchesGrupo = grupoFilter === 'ALL' || officer.grupo === grupoFilter;

      // Only check tungkulin matching if officer has tungkulinList OR if tungkulin/status filters are active
      const hasMatchingDutyRow = (() => {
        // If no tungkulin filters and no status filter, any officer matches (including those without tungkulin)
        if (tungkulinFilter === 'ALL' && statusFilter === 'ALL') return true;
        
        // If officer has no tungkulin, they don't match when filters are active
        if (!officer.tungkulinList || officer.tungkulinList.length === 0) return false;
        
        return officer.tungkulinList.some((t: any) => {
          if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
          if (tungkulinFilter !== 'ALL') {
            const dept = departments.find(d => d.name === tungkulinFilter);
            const validRoles = dept ? [dept.name, ...(dept.specificRoles || [])] : [tungkulinFilter];
            if (subRoleFilter !== 'ALL') {
              if (t.name !== subRoleFilter) return false;
            } else {
              if (!validRoles.includes(t.name)) return false;
            }
          }
          return true;
        });
      })();

      return matchesSearch && matchesKapisanan && matchesPurok && matchesGrupo && hasMatchingDutyRow;
    });

    filtered.sort((a, b) => {
      let valA = '', valB = '';
      if (sortField === 'name') {
        // Sort by last name (lastNameFather only)
        valA = a.lastNameFather || '';
        valB = b.lastNameFather || '';
      }
      else if (sortField === 'registry') { valA = a.registry || ''; valB = b.registry || ''; }
      else if (sortField === 'prkGrp') { valA = a.purok || ''; valB = b.purok || ''; }
      else if (sortField === 'kapisanan') { valA = a.kapisanan || ''; valB = b.kapisanan || ''; }
      const cmp = valA.localeCompare(valB);
      return sortDirection === 'asc' ? cmp : -cmp;
    });

    return filtered;
  }, [officers, searchQuery, kapisananFilter, tungkulinFilter, subRoleFilter, statusFilter, purokFilter, grupoFilter, sortField, sortDirection, departments]);

  const dashData = useMemo(() => {
    const targetDept = view === 'DASHBOARD' ? 'ALL' : tungkulinFilter;

    const dashOfficers = officers.filter(o => {
      if (targetDept === 'ALL') return o.tungkulinList && o.tungkulinList.length > 0;
      return o.tungkulinList?.some((t: any) => {
        const dept = departments.find(d => d.name === targetDept);
        const validRoles = dept ? [dept.name, ...(dept.specificRoles || [])] : [targetDept];
        return validRoles.includes(t.name);
      });
    });

    const total = dashOfficers.length;
    const active = dashOfficers.filter(o =>
      o.tungkulinList?.some((t: any) => {
        if (t.status !== 'ACTIVE') return false;
        if (targetDept !== 'ALL') {
          const dept = departments.find(d => d.name === targetDept);
          const validRoles = dept ? [dept.name, ...(dept.specificRoles || [])] : [targetDept];
          if (!validRoles.includes(t.name)) return false;
        }
        return true;
      })
    ).length;

    const missingRegistry = dashOfficers.filter(o => !o.registry || o.registry.trim() === '').length;
    const missingPurok = dashOfficers.filter(o => !o.purok || o.purok.trim() === '').length;

    const missingInfos = dashOfficers.filter(o => {
      // Missing Petsa Nanumpa (active tungkulin without inOathDate)
      const hasActiveWithoutOathDate = o.tungkulinList?.some((t: any) => t.status === 'ACTIVE' && (!t.inOathDate || t.inOathDate.trim() === ''));
      // Missing Petsa Nabawas/OUT (inactive tungkulin without outDropDate)
      const hasInactiveWithoutDropDate = o.tungkulinList?.some((t: any) => t.status === 'INACTIVE' && (!t.outDropDate || t.outDropDate.trim() === ''));
      // Missing Kapisanan
      const missingKapisanan = !o.kapisanan || o.kapisanan.trim() === '';

      return hasActiveWithoutOathDate || hasInactiveWithoutDropDate || missingKapisanan;
    }).length;

    // Calculate birthdays for this month and next month
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;

    const birthdaysThisMonth = dashOfficers.filter(o => {
      if (!o.bday) return false;
      const bday = new Date(o.bday);
      return bday.getMonth() === currentMonth && bday.getDate() >= now.getDate();
    }).sort((a, b) => {
      const bdayA = new Date(a.bday);
      const bdayB = new Date(b.bday);
      return bdayA.getDate() - bdayB.getDate();
    });

    const birthdaysNextMonth = dashOfficers.filter(o => {
      if (!o.bday) return false;
      const bday = new Date(o.bday);
      return bday.getMonth() === nextMonth && bday.getFullYear() === nextYear;
    }).sort((a, b) => {
      const bdayA = new Date(a.bday);
      const bdayB = new Date(b.bday);
      return bdayA.getDate() - bdayB.getDate();
    });

    const deptHealth = departments.map(d => {
      const activeInDept = dashOfficers.filter(o =>
        o.tungkulinList?.some((t: any) => {
          if (t.status !== 'ACTIVE') return false;
          const validRoles = [d.name, ...(d.specificRoles || [])];
          return validRoles.includes(t.name);
        })
      ).length;
      return { name: d.name, target: d.target || 0, active: activeInDept, deficit: Math.max(0, (d.target || 0) - activeInDept) };
    }).sort((a, b) => b.deficit - a.deficit);

    return {
      total, active,
      inactive: total - active,
      buklod: dashOfficers.filter(o => o.kapisanan === 'BUKLOD').length,
      kadiwa: dashOfficers.filter(o => o.kapisanan === 'KADIWA').length,
      binhi: dashOfficers.filter(o => o.kapisanan === 'BINHI').length,
      target: departments.find(d => d.name === targetDept)?.target || 0,
      missingRegistry, missingPurok, missingInfos, deptHealth,
      birthdaysThisMonth, birthdaysNextMonth
    };
  }, [officers, tungkulinFilter, view, departments]);

  const todayDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  // ── Officer CRUD ──────────────────────────────────────────
  const [formState, setFormState] = useState<any>(null);
  const [invalidFields, setInvalidFields] = useState<string[]>([]);
  const [activeDropdown, setActiveDropdown] = useState<{ id: string; field: string; query?: string } | null>(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const openProfile = (officer?: any) => {
    if (officer) {
      setFormState({ ...officer });
    } else {
      setFormState({
        isNew: true,
        controlNumber: '',
        firstName: '', suffix: '', gender: '',
        lastNameFather: '', lastNameMother: '', lastNameSpouse: '',
        registry: '', kapisanan: '', bday: '', petsaKasal: '', prkGrp: '',
        tungkulinList: [{
          id: Date.now().toString(), name: '', scope: 'PANLOKAL',
          inOathDate: '', inOathRef: '', inTransferDate: '',
          outDropDate: '', outDropRef: '', outTransferDate: '',
          status: 'ACTIVE', code: '', inactiveDate: ''
        }]
      });
    }
    setIsDirty(false);
    setView('PROFILE');
    setIsPatotooView(false);
  };

  const saveOfficer = async () => {
    try {
      setIsLoading(true);
      // Use validation utilities
      const validation = validateOfficer(formState);
      if (!validation.valid) {
        setInvalidFields([]);
        showToast(validation.errors.join(', '), 'error');
        return;
      }
      setInvalidFields([]);

      const isNew = formState.isNew;
      const savedForm = { ...formState, lastModified: new Date().toISOString() };
      let newList: any[];

      if (isNew) {
        const newObj = { ...savedForm, id: Date.now().toString() };
        delete newObj.isNew;
        newList = [...officers, newObj];
      } else {
        newList = officers.map(o => o.id === savedForm.id ? savedForm : o);
      }

      setOfficers(newList);

      let path = saveLocation;
      if (path === 'Documents (Default)' && typeof window !== 'undefined') path = localStorage.getItem('oms_custom_path') || '';
      const saveResult = await window.ipc.invoke('save-db', { data: { officers: newList, departments, puroks: purokList }, customPath: path });

      if (!saveResult?.success) {
        showToast('❌ Save failed: ' + (saveResult?.error || 'Unknown error'), 'error');
        return;
      }
      showToast(isNew ? '✅ Success adding officer!' : '✅ Success! Record saved.');
      setIsDirty(false);
      setView('DATABASE');
    } catch (error) {
      showToast('Error saving officer record', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteOfficer = (id: string) => {
    runConfirm('Burahin ang Record', 'Sigurado ka bang gusto mong burahin ang record na ito?', () => {
      try {
        const newList = officers.filter(o => o.id !== id);
        setOfficers(newList);
        saveToBackend(newList, departments);
        setView('DATABASE');
      } catch (error) {
        showToast('Error deleting officer record', 'error');
      }
    });
  };

  const bulkImportOfficers = (importedOfficers: any[]) => {
    try {
      const newList = [...officers, ...importedOfficers];
      setOfficers(newList);
      saveToBackend(newList, departments);
      showToast(`✅ Successfully imported ${importedOfficers.length} officers!`, 'success');
      setView('DATABASE');
    } catch (error) {
      showToast('Error importing officers', 'error');
    }
  };

  const handleFormChange = (field: string, value: string) => {
    const textFields = ['firstName', 'lastNameFather', 'lastNameMother', 'lastNameSpouse', 'registry', 'prkGrp'];
    const finalValue = textFields.includes(field) ? value.toUpperCase() : value;
    setIsDirty(true);
    setFormState((prev: any) => ({ ...prev, [field]: finalValue }));
  };

  const handleTungkulinChange = (id: string, field: string, value: string) => {
    const textFields = ['name', 'code'];
    const finalValue = textFields.includes(field) ? value.toUpperCase() : value;
    setIsDirty(true);
    setFormState((prev: any) => ({
      ...prev,
      tungkulinList: prev.tungkulinList.map((t: any) => t.id === id ? { ...t, [field]: finalValue } : t)
    }));
  };

  const addTungkulinRow = () => {
    setFormState((prev: any) => ({
      ...prev,
      tungkulinList: [...prev.tungkulinList, {
        id: Date.now().toString(), name: '', scope: 'PANLOKAL',
        inOathDate: '', inOathRef: '', inDate: '', inTransferDate: '',
        outDropDate: '', outDropRef: '', outTransferDate: '',
        status: 'ACTIVE', code: '', inactiveDate: ''
      }]
    }));
  };

  const removeTungkulinRow = (idToRemove: string) => {
    if (formState.tungkulinList.length === 1) {
      alert('Hindi pwedeng burahin lahat. Mag-iwan ng kahit isang row.');
      return;
    }
    setFormState((prev: any) => ({
      ...prev,
      tungkulinList: prev.tungkulinList.filter((t: any) => t.id !== idToRemove)
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, id: string, currentValue: string) => {
    const isDropdownActive = activeDropdown?.id === id;
    const filterQuery = (isDropdownActive && activeDropdown?.query !== undefined) ? activeDropdown.query : currentValue;
    const suggestions = allRolesMasterList.filter(opt => opt.toLowerCase().includes((filterQuery || '').toLowerCase()));

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex(prev => {
        const next = prev < suggestions.length - 1 ? prev + 1 : prev;
        if (next >= 0) handleTungkulinChange(id, 'name', suggestions[next]);
        return next;
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex(prev => {
        const next = prev > 0 ? prev - 1 : 0;
        if (next >= 0) handleTungkulinChange(id, 'name', suggestions[next]);
        return next;
      });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (focusedIndex >= 0 && focusedIndex < suggestions.length) {
        handleTungkulinChange(id, 'name', suggestions[focusedIndex]);
      }
      setActiveDropdown(null);
      setFocusedIndex(-1);
    } else if (e.key === 'Escape') {
      setActiveDropdown(null);
      setFocusedIndex(-1);
    }
  };

  // ── Bulk Selection ────────────────────────────────────────
  const [selectedOfficers, setSelectedOfficers] = useState<string[]>([]);

  const toggleSelectAll = () => {
    if (selectedOfficers.length === filteredOfficers.length && filteredOfficers.length > 0) {
      setSelectedOfficers([]);
    } else {
      setSelectedOfficers(filteredOfficers.map(o => o.id));
    }
  };

  const toggleSelectOfficer = (id: string, e: React.MouseEvent | React.ChangeEvent) => {
    e.stopPropagation();
    setSelectedOfficers(prev =>
      prev.includes(id) ? prev.filter(oid => oid !== id) : [...prev, id]
    );
  };

  const clearSelection = () => setSelectedOfficers([]);

  const deleteSelected = () => {
    if (selectedOfficers.length === 0) return;
    runConfirm('Burahin ang Seleksyon', `Sigurado ka bang gusto mong burahin ang ${selectedOfficers.length} na record(s)?`, () => {
      const newList = officers.filter(o => !selectedOfficers.includes(o.id));
      setOfficers(newList);
      saveToBackend(newList, departments);
      setSelectedOfficers([]);
    });
  };

  // ── Patotoo ───────────────────────────────────────────────
  const [isPatotooView, setIsPatotooView] = useState(false);
  const [patotooData, setPatotooData] = useState({
    issueDate: new Date().toISOString().split('T')[0],
    lokalName: 'ILIGAN CITY',
    distritoName: 'LANAO',
    signatoryKalihim: '',
    signatoryPD: '',
    signatoryDestinado: ''
  });

  // ── Print ─────────────────────────────────────────────────
  const [isPrintingMasterlist, setIsPrintingMasterlist] = useState(false);

  const downloadBackup = async () => {
    try {
      const data = JSON.stringify({ officers, departments, puroks: purokList }, null, 2);
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `INC_Database_Backup_${timestamp}.json`;
      
      let backupPath = saveLocation;
      if (!backupPath || backupPath === 'Documents (Default)') {
        backupPath = localStorage.getItem('oms_custom_path') || '';
      }
      
      if (window.ipc && backupPath) {
        const filePath = `${backupPath}/${filename}`;
        const result = await window.ipc.invoke('save-file', { filePath, data });
        if (result?.success) {
          showToast('✅ Backup saved successfully!', 'success');
          return;
        }
      }
      
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast('✅ Backup downloaded to Downloads folder!', 'success');
    } catch (err: any) {
      showToast('❌ Backup failed: ' + err.message, 'error');
    }
  };

  // ── Departments ───────────────────────────────────────────
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptTarget, setNewDeptTarget] = useState(0);
  const [newRoleInputs, setNewRoleInputs] = useState<Record<string, string>>({});

  const addDepartment = () => {
    if (!newDeptName) return;
    const newList = [...departments, { id: Date.now().toString(), name: newDeptName.toUpperCase(), target: newDeptTarget, specificRoles: [] }];
    setDepartments(newList);
    saveToBackend(officers, newList);
    setNewDeptName('');
    setNewDeptTarget(0);
  };

  const updateDeptTarget = (id: string, target: number) => {
    const newList = departments.map(d => d.id === id ? { ...d, target } : d);
    setDepartments(newList);
    saveToBackend(officers, newList);
  };

  const deleteDepartment = (id: string) => {
    runConfirm('Burahin ang Department', 'Burahin itong Department at lahat ng sub-roles nito?', () => {
      const newList = departments.filter(d => d.id !== id);
      setDepartments(newList);
      saveToBackend(officers, newList);
    });
  };

  const addSpecificRole = (deptId: string) => {
    const roleToAdd = newRoleInputs[deptId];
    if (!roleToAdd?.trim()) return;
    const newList = departments.map(d => {
      if (d.id !== deptId) return d;
      if (d.specificRoles.includes(roleToAdd.toUpperCase())) return d;
      return { ...d, specificRoles: [...d.specificRoles, roleToAdd.toUpperCase()] };
    });
    setDepartments(newList);
    saveToBackend(officers, newList);
    setNewRoleInputs({ ...newRoleInputs, [deptId]: '' });
  };

  const removeSpecificRole = (deptId: string, roleToRemove: string) => {
    const newList = departments.map(d => {
      if (d.id !== deptId) return d;
      return { ...d, specificRoles: d.specificRoles.filter(r => r !== roleToRemove) };
    });
    setDepartments(newList);
    saveToBackend(officers, newList);
  };

  // ── Purok Management ──────────────────────────────────────
  const [newPurokName, setNewPurokName] = useState('');
  const [newPurokGroupCount, setNewPurokGroupCount] = useState(1);

  const addPurok = () => {
    if (!newPurokName) return;
    const newList = [...purokList, { id: Date.now().toString(), name: newPurokName.toUpperCase(), groupCount: newPurokGroupCount }];
    setPurokList(newList);
    saveToBackend(officers, departments, newList);
    setNewPurokName('');
    setNewPurokGroupCount(1);
  };

  const deletePurok = (id: string) => {
    runConfirm('Burahin ang Purok', 'Sigurado ka bang gusto mong burahin ang Purok na ito?', () => {
      const newList = purokList.filter(p => p.id !== id);
      setPurokList(newList);
      saveToBackend(officers, departments, newList);
    });
  };

  // ── Password Change ───────────────────────────────────────
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // ── Username Management ─────────────────────────────────────
  const [newUsername, setNewUsername] = useState('');
  const [currentPasswordForAuth, setCurrentPasswordForAuth] = useState('');

  // ── Auth Modal ─────────────────────────────────────────────
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalStep, setAuthModalStep] = useState<'verify' | 'change'>('verify');
  const [authModalCurrentPassword, setAuthModalCurrentPassword] = useState('');
  const [authModalNewUsername, setAuthModalNewUsername] = useState('');
  const [authModalNewPassword, setAuthModalNewPassword] = useState('');
  const [authModalConfirmPassword, setAuthModalConfirmPassword] = useState('');

  const openChangeAuthModal = () => {
    setAuthModalOpen(true);
    setAuthModalStep('verify');
    setAuthModalCurrentPassword('');
    setAuthModalNewUsername(currentUsername);
    setAuthModalNewPassword('');
    setAuthModalConfirmPassword('');
  };

  const closeChangeAuthModal = () => {
    setAuthModalOpen(false);
    setAuthModalStep('verify');
    setAuthModalCurrentPassword('');
    setAuthModalNewUsername('');
    setAuthModalNewPassword('');
    setAuthModalConfirmPassword('');
  };

  const verifyCurrentPassword = (): boolean => {
    const systemPassword = typeof window !== 'undefined' ? localStorage.getItem('oms_system_password') : null;
    if (!systemPassword) {
      showToast('No password set. Please set up credentials first.', 'error');
      return false;
    }
    if (authModalCurrentPassword !== systemPassword) {
      showToast('Current password is incorrect!', 'error');
      return false;
    }
    setAuthModalStep('change');
    return true;
  };

  const submitAuthChange = () => {
    if (!authModalNewUsername.trim()) {
      showToast('Username cannot be empty!', 'error');
      return;
    }
    if (!authModalNewPassword) {
      showToast('Password cannot be empty!', 'error');
      return;
    }
    if (authModalNewPassword !== authModalConfirmPassword) {
      showToast('Passwords do not match!', 'error');
      return;
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('oms_system_username', authModalNewUsername);
      localStorage.setItem('oms_system_password', authModalNewPassword);
    }
    setCurrentUsername(authModalNewUsername);
    showToast('Username and password updated successfully!', 'success');
    closeChangeAuthModal();
  };

  // ── Bulk Import Departments ─────────────────────────────────
  const bulkImportDepartments = (inputText: string) => {
    try {
      const lines = inputText.trim().split('\n');
      const parsedDepartments: { name: string; target: number; specificRoles: string[] }[] = [];
      let currentDept: { name: string; target: number; specificRoles: string[] } | null = null;

      lines.forEach(line => {
        const trimmed = line.trim();
        if (!trimmed) return;

        // Check if line starts with indentation (sub role)
        if (trimmed.startsWith('-') || trimmed.startsWith('•') || /^\s+/.test(trimmed)) {
          const roleName = trimmed.replace(/^[-•]\s*/, '').trim();
          if (currentDept && roleName) {
            currentDept.specificRoles.push(roleName);
          }
        } else {
          // New department
          if (currentDept) {
            parsedDepartments.push(currentDept);
          }

          // Check for target in department name
          let deptName = trimmed;
          let target = 0;
          const targetMatch = trimmed.match(/,?\s*Target:\s*(\d+)/i);
          if (targetMatch) {
            target = parseInt(targetMatch[1], 10);
            deptName = trimmed.replace(/,?\s*Target:\s*\d+/i, '').trim();
          }

          currentDept = { name: deptName, target, specificRoles: [] };
        }
      });

      // Add last department
      if (currentDept) {
        parsedDepartments.push(currentDept);
      }

      // Merge with existing departments
      const existingDepts = [...departments];
      parsedDepartments.forEach(newDept => {
        const existingIndex = existingDepts.findIndex(d => d.name.toLowerCase() === newDept.name.toLowerCase());
        if (existingIndex >= 0) {
          // Update existing department
          existingDepts[existingIndex] = {
            ...existingDepts[existingIndex],
            target: newDept.target || existingDepts[existingIndex].target,
            specificRoles: [...new Set([...(existingDepts[existingIndex].specificRoles || []), ...newDept.specificRoles])]
          };
        } else {
          // Add new department
          existingDepts.push({
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            name: newDept.name,
            target: newDept.target,
            specificRoles: newDept.specificRoles
          });
        }
      });

      setDepartments(existingDepts);
      saveToBackend(officers, existingDepts, purokList);
      showToast(`Successfully imported ${parsedDepartments.length} department(s)!`, 'success');
    } catch (error) {
      showToast('Error importing departments', 'error');
    }
  };

  const updateUsername = () => {
    const systemPassword = typeof window !== 'undefined' ? localStorage.getItem('oms_system_password') : null;
    if (!systemPassword) {
      showToast('No password set. Please set up credentials first.', 'error');
      return;
    }
    if (currentPasswordForAuth !== systemPassword) {
      showToast('Current password is incorrect!', 'error');
      return;
    }
    if (!newUsername.trim()) {
      showToast('Username cannot be empty!', 'error');
      return;
    }
    if (typeof window !== 'undefined') localStorage.setItem('oms_system_username', newUsername);
    setCurrentUsername(newUsername);
    setCurrentPasswordForAuth('');
    showToast('Username updated successfully!');
  };

  const updatePassword = () => {
    const systemPassword = typeof window !== 'undefined' ? localStorage.getItem('oms_system_password') : null;
    if (!systemPassword) {
      showToast('No password set. Please set up credentials first.', 'error');
      return;
    }
    if (currentPasswordForAuth !== systemPassword) {
      showToast('Current password is incorrect!', 'error');
      return;
    }
    if (newPassword && newPassword === confirmPassword) {
      if (typeof window !== 'undefined') localStorage.setItem('oms_system_password', newPassword);
      showToast('Password updated successfully!');
      setNewPassword('');
      setConfirmPassword('');
      setCurrentPasswordForAuth('');
    }
  };

  const value: OMSContextValue = {
    isLoaded, isAuthenticated, setIsAuthenticated,
    usernameInput, setUsernameInput,
    currentUsername, setCurrentUsername,
    passwordInput, setPasswordInput, showPassword, setShowPassword, authError, handleLogin,
    isDarkMode, toggleDarkMode, showHeader,
    view, handleNavigation,
    autoBackupEnabled, setAutoBackupEnabled: handleSetAutoBackupEnabled,
    autoBackupFrequency, setAutoBackupFrequency: handleSetAutoBackupFrequency,
    notification, setNotification, showToast,
    confirmModalState, setConfirmModalState,
    officers, setOfficers,
    departments, setDepartments,
    purokList, setPurokList,
    filteredOfficers, dashData, todayDate, allRolesMasterList, uniquePurokValues,
    searchQuery, setSearchQuery,
    kapisananFilter, setKapisananFilter,
    tungkulinFilter, setTungkulinFilter,
    subRoleFilter, setSubRoleFilter,
    statusFilter, setStatusFilter,
    purokFilter, setPurokFilter,
    grupoFilter, setGrupoFilter,
    sortField, setSortField,
    sortDirection, setSortDirection,
    formState, setFormState,
    openProfile, saveOfficer, deleteOfficer, bulkImportOfficers, bulkImportDepartments,
    handleFormChange, handleTungkulinChange, addTungkulinRow, removeTungkulinRow,
    invalidFields, setInvalidFields,
    isDirty, setIsDirty,
    isLoading, setIsLoading,
    activeDropdown, setActiveDropdown,
    focusedIndex, setFocusedIndex,
    handleKeyDown,
    selectedOfficers,
    toggleSelectAll, toggleSelectOfficer, clearSelection, deleteSelected,
    isPatotooView, setIsPatotooView,
    patotooData, setPatotooData,
    isPrintingMasterlist, setIsPrintingMasterlist,
    downloadBackup,
    saveLocation, setSaveLocation,
    handleFolderPick, handleLoadDatabase,
    debugLog,
    newDeptName, setNewDeptName,
    newDeptTarget, setNewDeptTarget,
    addDepartment, updateDeptTarget, deleteDepartment,
    newRoleInputs, setNewRoleInputs,
    addSpecificRole, removeSpecificRole,
    newPurokName, setNewPurokName,
    newPurokGroupCount, setNewPurokGroupCount,
    addPurok, deletePurok,
    newPassword, setNewPassword,
    confirmPassword, setConfirmPassword,
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
  };

  return <OMSContext.Provider value={value}>{children}</OMSContext.Provider>;
}
