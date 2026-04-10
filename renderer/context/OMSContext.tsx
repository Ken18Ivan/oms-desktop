import React, { useState, useEffect, useMemo, createContext, useContext } from 'react';
import { formatFullName } from '../utils';



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
  passwordInput: string;
  setPasswordInput: (v: string) => void;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
  authError: boolean;
  handleLogin: (e?: React.FormEvent) => void;

  // UI
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  showHeader: boolean;
  view: 'DASHBOARD' | 'DATABASE' | 'PROFILE' | 'SETTINGS';
  handleNavigation: (v: 'DASHBOARD' | 'DATABASE' | 'PROFILE' | 'SETTINGS') => void;
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
  handleFormChange: (field: string, value: string) => void;
  handleTungkulinChange: (id: string, field: string, value: string) => void;
  addTungkulinRow: () => void;
  removeTungkulinRow: (id: string) => void;
  invalidFields: string[];
  setInvalidFields: (v: any) => void;
  isDirty: boolean;
  setIsDirty: (v: boolean) => void;

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
        console.error('Silent load error:', err);
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
    if (e) e.preventDefault();
    const systemPassword = localStorage.getItem('oms_system_password') || '!005officers01042';
    if (passwordInput === systemPassword) {
      sessionStorage.setItem('iligan_auth', 'true');
      setIsAuthenticated(true);
      setAuthError(false);
    } else {
      setAuthError(true);
      setPasswordInput('');
    }
  };

  // ── UI ────────────────────────────────────────────────────
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    const saved = localStorage.getItem('iligan_theme');
    if (saved === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    localStorage.setItem('iligan_theme', next ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', next);
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
  const [view, setView] = useState<'DASHBOARD' | 'DATABASE' | 'PROFILE' | 'SETTINGS'>('DASHBOARD');
  const [isDirty, setIsDirty] = useState(false);

  const handleNavigation = (newView: 'DASHBOARD' | 'DATABASE' | 'PROFILE' | 'SETTINGS') => {
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
      if (path === 'Documents (Default)') path = localStorage.getItem('oms_custom_path') || '';
      const result = await window.ipc.invoke('save-db', {
        data: { officers: updatedOfficers, departments: updatedDepts, puroks: updatedPuroks },
        customPath: path
      });
      if (!result?.success) console.error('Save failed:', result?.error);
    } catch (err) {
      console.error('IPC Error:', err);
    }
  };

  const handleFolderPick = async () => {
    try {
      const folderPath = await window.ipc.selectFolder();
      if (folderPath) {
        setDebugLog('Folder selected! Loading from: ' + folderPath);
        setSaveLocation(folderPath);
        const loadResult = await window.ipc.invoke('load-db', folderPath);
        if (loadResult?.success && loadResult?.data) {
          if (loadResult.data.officers) setOfficers(loadResult.data.officers);
          if (loadResult.data.departments) setDepartments(loadResult.data.departments);
          if (loadResult.data.puroks) setPurokList(loadResult.data.puroks);
          setDebugLog('SUCCESS: Database loaded from ' + folderPath);
        } else {
          setDebugLog('Folder selected. Will save new database here: ' + folderPath);
        }
        localStorage.setItem('oms_custom_path', folderPath);
      }
    } catch (err: any) {
      setDebugLog('ERROR: ' + err.message);
    }
  };

  const handleLoadDatabase = async () => {
    try {
      // @ts-ignore
      const folderPath = await window.ipc.selectFolder();
      if (folderPath) {
        setSaveLocation(folderPath);
        localStorage.setItem('oms_custom_path', folderPath);
        // @ts-ignore
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
      const fullName = formatFullName(officer).toLowerCase();
      const searchLow = searchQuery.toLowerCase();

      let matchesSearch = false;
      if (searchQuery === '!MISSING_REGISTRY') {
        matchesSearch = !officer.registry || officer.registry.trim() === '';
      } else if (searchQuery === '!MISSING_PUROK') {
        matchesSearch = !officer.purok || officer.purok.trim() === '';
      } else {
        matchesSearch = fullName.includes(searchLow) || (officer.registry && officer.registry.toLowerCase().includes(searchLow));
      }

      const matchesKapisanan = kapisananFilter === 'ALL' || officer.kapisanan === kapisananFilter;
      const matchesPurok = purokFilter === 'ALL' || officer.purok === purokFilter;
      const matchesGrupo = grupoFilter === 'ALL' || officer.grupo === grupoFilter;

      const hasMatchingDutyRow = officer.tungkulinList?.some((t: any) => {
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

      return matchesSearch && matchesKapisanan && matchesPurok && matchesGrupo && hasMatchingDutyRow;
    });

    filtered.sort((a, b) => {
      let valA = '', valB = '';
      if (sortField === 'name') { valA = formatFullName(a); valB = formatFullName(b); }
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
      missingRegistry, missingPurok, deptHealth
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
    const errors: string[] = [];
    if (!formState.registry) errors.push('registry');
    if (!formState.firstName) errors.push('firstName');
    if (!formState.lastNameFather) errors.push('lastNameFather');

    if (errors.length > 0) {
      setInvalidFields(errors);
      showToast('Pangalan at Registry Number ay kailangan!', 'error');
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
    if (path === 'Documents (Default)') path = localStorage.getItem('oms_custom_path') || '';
    await window.ipc.invoke('save-db', { data: { officers: newList, departments, puroks: purokList }, customPath: path });

    showToast(isNew ? '✅ Success adding officer!' : '✅ Success! Record saved.');
    setIsDirty(false);
    setView('DATABASE');
  };

  const deleteOfficer = (id: string) => {
    runConfirm('Burahin ang Record', 'Sigurado ka bang gusto mong burahin ang record na ito?', () => {
      const newList = officers.filter(o => o.id !== id);
      setOfficers(newList);
      saveToBackend(newList, departments);
      setView('DATABASE');
    });
  };

  const bulkImportOfficers = (importedOfficers: any[]) => {
    const newList = [...officers, ...importedOfficers];
    setOfficers(newList);
    saveToBackend(newList, departments);
    showToast(`✅ Successfully imported ${importedOfficers.length} officers!`, 'success');
    setView('DATABASE');
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
        inOathDate: '', inOathRef: '', inTransferDate: '',
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

  const downloadBackup = () => {
    const data = JSON.stringify({ officers, departments }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `INC_Database_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  // ── Context Value ─────────────────────────────────────────
  const value: OMSContextValue = {
    isLoaded, isAuthenticated, setIsAuthenticated,
    passwordInput, setPasswordInput, showPassword, setShowPassword, authError, handleLogin,
    isDarkMode, toggleDarkMode, showHeader,
    view, handleNavigation,
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
    openProfile, saveOfficer, deleteOfficer, bulkImportOfficers,
    handleFormChange, handleTungkulinChange, addTungkulinRow, removeTungkulinRow,
    invalidFields, setInvalidFields,
    isDirty, setIsDirty,
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
  };

  return <OMSContext.Provider value={value}>{children}</OMSContext.Provider>;
}
