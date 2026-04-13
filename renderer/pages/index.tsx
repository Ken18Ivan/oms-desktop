'use client';

import React, { useState } from 'react';
import DOMPurify from 'dompurify';
import { OMSProvider, useOMS } from '../context/OMSContext';
import LoginScreen from '../components/LoginScreen';
import DashboardView from '../components/views/DashboardView';
import OfficerDatabaseView from '../components/views/OfficerDatabaseView';
import OfficerProfileForm from '../components/views/OfficerProfileForm';
import OfficersEncodingView from '../components/views/OfficersEncodingView';
import SettingsView from '../components/views/SettingsView';
import { formatFullName } from '../utils';
import { X, Menu, User } from 'lucide-react';

// ── Inner app (uses context) ─────────────────────────────────
function AppShell() {
  const {
    isLoaded, isAuthenticated, setIsAuthenticated,
    usernameInput, setUsernameInput,
    currentUsername, setCurrentUsername,
    passwordInput, setPasswordInput, showPassword, setShowPassword, authError, handleLogin,
    isDarkMode, toggleDarkMode, showHeader,
    view, handleNavigation,
    notification, setNotification,
    showToast,
    confirmModalState, setConfirmModalState,
    officers, setOfficers, departments, purokList,
    filteredOfficers, dashData, todayDate,
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
    activeDropdown, setActiveDropdown,
    focusedIndex, setFocusedIndex,
    handleKeyDown,
    isLoading,
    selectedOfficers, toggleSelectAll, toggleSelectOfficer, clearSelection, deleteSelected,
    isPatotooView, setIsPatotooView,
    patotooData, setPatotooData,
    isPrintingMasterlist, setIsPrintingMasterlist,
    downloadBackup,
    saveLocation, setSaveLocation,
    handleFolderPick, handleLoadDatabase,
    debugLog,
    newDeptName, setNewDeptName,
    newDeptTarget, setNewDeptTarget,
    addDepartment,
    updateDeptTarget, deleteDepartment, bulkImportDepartments,
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
    allRolesMasterList, uniquePurokValues,
    autoBackupEnabled, setAutoBackupEnabled,
    autoBackupFrequency, setAutoBackupFrequency,
  } = useOMS();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S to save (only in PROFILE view)
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        if (view === 'PROFILE' && formState) {
          e.preventDefault();
          saveOfficer();
        }
      }
      // Ctrl+F to focus search (only in DATABASE view)
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        if (view === 'DATABASE') {
          e.preventDefault();
          const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
          if (searchInput) searchInput.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [view, formState, saveOfficer]);

  // ── Loading screen ────────────────────────────────────────
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#f4f6f8] dark:bg-[#0f172a] flex flex-col items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-24 h-24 mb-6 relative flex items-center justify-center">
            <div className="absolute inset-0 bg-[#006B3F] blur-xl opacity-40 rounded-full"></div>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="relative z-10 w-20 h-20 drop-shadow-2xl">
              <path fill="#006B3F" d="M12 2L3 6v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V6l-9-4z" />
              <path fill="#CE1126" d="M12 4.5l-7 3.11v4.39c0 4.26 2.95 8.24 7 9.25 4.05-1.01 7-4.99 7-9.25V7.61l-7-3.11z" />
              <path fill="#FFFFFF" d="M12 15c-1.66 0-3-1-3-2V8.5c1.33 1 2.5 1 3 1s1.67 0 3-1V13c0 1-1.34 2-3 2zm0-2.5c-.83 0-1.5-.5-2-1V9.5c.5.5 1.17.5 2 .5s1.5 0 2-.5v2c-.5.5-1.17 1-2 1z" />
              <path fill="#FFFFFF" d="M12 12.5c-.5 0-1-.5-1-1.5 0-1.5 1-3 1-3s1 1.5 1 3c0 1-.5 1.5-1 1.5z" />
            </svg>
          </div>
          <div className="h-4 bg-[#006B3F]/20 dark:bg-[#006B3F]/40 rounded-full w-48 mb-4"></div>
          <div className="h-3 bg-gray-200 dark:bg-slate-800 rounded-full w-32"></div>
        </div>
      </div>
    );
  }

  // ── Login screen ──────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <LoginScreen
        usernameInput={usernameInput}
        setUsernameInput={setUsernameInput}
        passwordInput={passwordInput}
        setPasswordInput={setPasswordInput}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        authError={authError}
        handleLogin={handleLogin}
      />
    );
  }

  // ── Main app ──────────────────────────────────────────────
  return (
    <div className={`min-h-screen font-sans pb-20 transition-colors duration-500
      ${view === 'PROFILE'
        ? 'bg-white dark:bg-slate-900 text-gray-900 dark:text-white'
        : 'bg-[#f4f6f8] dark:bg-[#0f172a] text-gray-900 dark:text-gray-100'
      } print:bg-white print:pb-0 print:min-h-0`}>

      {/* GLOBAL LOADING OVERLAY */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 flex flex-col items-center shadow-2xl">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-600 border-t-transparent mb-4"></div>
            <p className="text-gray-800 dark:text-white font-bold">Processing...</p>
          </div>
        </div>
      )}

      {/* GLOBAL NOTIFICATION TOAST */}
      {notification.show && (
        <div style={{ zIndex: 9999 }} className="fixed top-10 left-1/2 -translate-x-1/2 min-w-[300px] animate-bounce">
          <div className={`flex items-center gap-4 px-6 py-4 rounded-2xl shadow-2xl border-2 ${notification.type === 'success'
            ? 'bg-emerald-600 border-emerald-400 text-white'
            : 'bg-red-600 border-red-400 text-white'
          }`}>
            <div className="flex-1">
              <p className="text-xs font-black uppercase tracking-widest opacity-70">System Alert</p>
              <p className="text-lg font-bold">{notification.message}</p>
            </div>
            <button onClick={() => setNotification({ ...notification, show: false })} className="text-xl">✕</button>
          </div>
        </div>
      )}

      {/* GLOBAL CSS FOR PRINT */}
      <style dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(`
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            background-color: white !important;
          }
        }
      `) }} />

      {/* NAVIGATION */}
      <nav role="navigation" aria-label="Main navigation" className={`bg-slate-800 dark:bg-slate-900 shadow-lg border-b-2 border-slate-600 dark:border-slate-700 sticky top-0 z-40 print:hidden transition-all duration-300 transform ${showHeader ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            {view === 'PROFILE' ? (
              <button onClick={() => handleNavigation('DATABASE')} className="text-white font-black text-xl tracking-widest uppercase flex items-center gap-2 hover:text-slate-300 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                {formState?.isNew ? 'BAGONG RECORD' : 'DETALYADONG RECORD'}
              </button>
            ) : (
              <>
                <div className="bg-white p-1 rounded-md shadow-sm flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6">
                    <path fill="#006B3F" d="M12 2L3 6v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V6l-9-4z" />
                    <path fill="#CE1126" d="M12 4.5l-7 3.11v4.39c0 4.26 2.95 8.24 7 9.25 4.05-1.01 7-4.99 7-9.25V7.61l-7-3.11z" />
                    <path fill="#FFFFFF" d="M12 15c-1.66 0-3-1-3-2V8.5c1.33 1 2.5 1 3 1s1.67 0 3-1V13c0 1-1.34 2-3 2zm0-2.5c-.83 0-1.5-.5-2-1V9.5c.5.5 1.17.5 2 .5s1.5 0 2-.5v2c-.5.5-1.17 1-2 1z" />
                    <path fill="#FFFFFF" d="M12 12.5c-.5 0-1-.5-1-1.5 0-1.5 1-3 1-3s1 1.5 1 3c0 1-.5 1.5-1 1.5z" />
                  </svg>
                </div>
                <span className="text-white font-black text-xl tracking-widest uppercase">Officers Management System</span>
              </>
            )}
          </div>

          <div className="hidden md:flex space-x-2 items-center">
            <button onClick={() => handleNavigation('DASHBOARD')} aria-label="Navigate to Dashboard" aria-current={view === 'DASHBOARD' ? 'page' : undefined} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${view === 'DASHBOARD' ? 'bg-slate-700 dark:bg-slate-800 text-white shadow-inner' : 'text-slate-300 hover:bg-slate-700 dark:hover:bg-slate-800'}`}>HOME</button>
            <button onClick={() => handleNavigation('DATABASE')} aria-label="Navigate to Officers Database" aria-current={view === 'DATABASE' || view === 'PROFILE' ? 'page' : undefined} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${view === 'DATABASE' || view === 'PROFILE' ? 'bg-slate-700 dark:bg-slate-800 text-white shadow-inner' : 'text-slate-300 hover:bg-slate-700 dark:hover:bg-slate-800'}`}>
              OFFICERS <span className="bg-white/20 text-[10px] px-1.5 py-0.5 rounded-full font-black">{officers.length}</span>
            </button>
            <button onClick={() => handleNavigation('ENCODING')} aria-label="Navigate to Officers Encoding" aria-current={view === 'ENCODING' ? 'page' : undefined} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${view === 'ENCODING' ? 'bg-slate-700 dark:bg-slate-800 text-white shadow-inner' : 'text-slate-300 hover:bg-slate-700 dark:hover:bg-slate-800'}`}>
              ENCODING
            </button>
            {/* Admin Profile Dropdown */}
            <div className="relative ml-2">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                aria-label="Admin menu"
                aria-expanded={profileDropdownOpen}
                aria-haspopup="true"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${profileDropdownOpen ? 'bg-slate-700 dark:bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-700 dark:hover:bg-slate-800'}`}
              >
                <User className="w-4 h-4" />
                <span>ADMIN</span>
              </button>
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-200 dark:border-slate-700">
                    <p className="text-sm font-bold text-gray-800 dark:text-white">Administrator</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{new Date().toLocaleDateString()}</p>
                  </div>
                  <button
                    onClick={() => { handleNavigation('SETTINGS'); setProfileDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    Settings
                  </button>
                  <button
                    onClick={() => { toggleDarkMode(); setProfileDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
                  >
                    {isDarkMode ? (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        Light Mode
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                        Dark Mode
                      </>
                    )}
                  </button>
                  <div className="border-t border-gray-200 dark:border-slate-700 mt-2 pt-2">
                    <button
                      onClick={() => { sessionStorage.removeItem('iligan_auth'); setIsAuthenticated(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* Mobile hamburger menu */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
            aria-expanded={mobileMenuOpen}
            className="md:hidden text-white p-2 rounded-lg hover:bg-slate-700 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile slide-out sidebar */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-900 border-t border-slate-700">
            <div className="px-4 py-3 space-y-2">
              <button 
                onClick={() => { handleNavigation('DASHBOARD'); setMobileMenuOpen(false); }}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-bold transition-all ${view === 'DASHBOARD' ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-800'}`}
              >
                DASHBOARD
              </button>
              <button 
                onClick={() => { handleNavigation('DATABASE'); setMobileMenuOpen(false); }}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-bold transition-all flex items-center justify-between ${view === 'DATABASE' || view === 'PROFILE' ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-800'}`}
              >
                OFFICERS <span className="bg-white/20 text-[10px] px-1.5 py-0.5 rounded-full font-black">{officers.length}</span>
              </button>
              <button 
                onClick={() => { handleNavigation('ENCODING'); setMobileMenuOpen(false); }}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-bold transition-all ${view === 'ENCODING' ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-800'}`}
              >
                ENCODING
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* MAIN CONTENT */}
      <main role="main" className={`print:p-0 print:m-0 print:max-w-none ${view === 'PROFILE' ? 'w-full' : 'p-4 md:p-8 max-w-7xl mx-auto mt-4'}`}>

        {/* DASHBOARD */}
        <div className={view === 'DASHBOARD' ? 'block print:hidden' : 'hidden'}>
          {view === 'DASHBOARD' && (
            <DashboardView
              dashData={dashData}
              todayDate={todayDate}
              handleNavigation={handleNavigation}
              setStatusFilter={setStatusFilter}
              setSearchQuery={setSearchQuery}
            />
          )}
        </div>

        {/* DATABASE */}
        <div className={view === 'DATABASE' ? 'block print:hidden' : 'hidden'}>
          {view === 'DATABASE' && (
            <OfficerDatabaseView
              filteredOfficers={filteredOfficers} departments={departments}
              selectedOfficers={selectedOfficers} searchQuery={searchQuery}
              setSearchQuery={setSearchQuery} tungkulinFilter={tungkulinFilter}
              setTungkulinFilter={setTungkulinFilter} subRoleFilter={subRoleFilter}
              setSubRoleFilter={setSubRoleFilter} kapisananFilter={kapisananFilter}
              setKapisananFilter={setKapisananFilter} statusFilter={statusFilter}
              setStatusFilter={setStatusFilter} dashData={dashData}
              openProfile={openProfile} setIsPrintingMasterlist={setIsPrintingMasterlist}
              toggleSelectAll={toggleSelectAll} toggleSelectOfficer={toggleSelectOfficer}
              clearSelection={clearSelection} deleteSelected={deleteSelected}
              purokFilter={purokFilter} setPurokFilter={setPurokFilter}
              grupoFilter={grupoFilter} setGrupoFilter={setGrupoFilter}
              uniquePurokValues={uniquePurokValues} sortField={sortField}
              setSortField={setSortField} sortDirection={sortDirection}
              setSortDirection={setSortDirection} purokList={purokList}
              officers={officers} setOfficers={setOfficers}
              showToast={showToast}
            />
          )}
        </div>

        {/* PROFILE */}
        <div className={view === 'PROFILE' ? 'block print:hidden' : 'hidden'}>
          {view === 'PROFILE' && formState && (
            <OfficerProfileForm
              formState={formState} setFormState={setFormState}
              handleFormChange={handleFormChange} handleTungkulinChange={handleTungkulinChange}
              addTungkulinRow={addTungkulinRow} removeTungkulinRow={removeTungkulinRow}
              invalidFields={invalidFields} setInvalidFields={setInvalidFields}
              activeDropdown={activeDropdown} setActiveDropdown={setActiveDropdown}
              focusedIndex={focusedIndex} setFocusedIndex={setFocusedIndex}
              allRolesMasterList={allRolesMasterList} handleKeyDown={handleKeyDown}
              saveOfficer={saveOfficer} deleteOfficer={deleteOfficer}
              isPatotooView={isPatotooView} setIsPatotooView={setIsPatotooView}
              patotooData={patotooData} setPatotooData={setPatotooData}
              setView={handleNavigation} purokList={purokList}
              confirmModalState={confirmModalState} setConfirmModalState={setConfirmModalState}
              departments={departments}
            />
          )}
        </div>

        {/* ENCODING */}
        <div className={view === 'ENCODING' ? 'block print:hidden' : 'hidden'}>
          {view === 'ENCODING' && (
            <OfficersEncodingView
              handleNavigation={handleNavigation}
              bulkImportOfficers={bulkImportOfficers}
              officers={officers}
              addNewOfficer={() => {
                setFormState({
                  id: '',
                  firstName: '',
                  lastNameFather: '',
                  lastNameMother: '',
                  lastNameSpouse: '',
                  suffix: '',
                  gender: '',
                  birthday: '',
                  marriageDate: '',
                  registry: '',
                  kapisanan: '',
                  purok: '',
                  grupo: '',
                  status: 'ACTIVE',
                  tungkulinList: [],
                  dateEncoded: new Date().toISOString(),
                  isNew: true
                });
                setInvalidFields([]);
                handleNavigation('PROFILE');
              }}
            />
          )}
        </div>

        {/* SETTINGS */}
        <div className={view === 'SETTINGS' ? 'block print:hidden' : 'hidden'}>
          {view === 'SETTINGS' && (
            <SettingsView
              newPassword={newPassword} setNewPassword={setNewPassword}
              confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword}
              showToast={showToast} downloadBackup={downloadBackup}
              saveLocation={saveLocation} setSaveLocation={setSaveLocation}
              handleFolderPick={handleFolderPick} handleLoadDatabase={handleLoadDatabase}
              debugLog={debugLog} newDeptName={newDeptName} setNewDeptName={setNewDeptName}
              newDeptTarget={newDeptTarget} setNewDeptTarget={setNewDeptTarget}
              addDepartment={addDepartment} departments={departments}
              updateDeptTarget={updateDeptTarget} deleteDepartment={deleteDepartment} bulkImportDepartments={bulkImportDepartments}
              newRoleInputs={newRoleInputs} setNewRoleInputs={setNewRoleInputs}
              addSpecificRole={addSpecificRole} removeSpecificRole={removeSpecificRole}
              purokList={purokList} newPurokName={newPurokName} setNewPurokName={setNewPurokName}
              newPurokGroupCount={newPurokGroupCount} setNewPurokGroupCount={setNewPurokGroupCount}
              addPurok={addPurok} deletePurok={deletePurok}
              currentUsername={currentUsername} setCurrentUsername={setCurrentUsername}
              newUsername={newUsername} setNewUsername={setNewUsername}
              currentPasswordForAuth={currentPasswordForAuth} setCurrentPasswordForAuth={setCurrentPasswordForAuth}
              updateUsername={updateUsername} updatePassword={updatePassword}
              authModalOpen={authModalOpen} setAuthModalOpen={setAuthModalOpen}
              authModalStep={authModalStep} setAuthModalStep={setAuthModalStep}
              authModalCurrentPassword={authModalCurrentPassword} setAuthModalCurrentPassword={setAuthModalCurrentPassword}
              authModalNewUsername={authModalNewUsername} setAuthModalNewUsername={setAuthModalNewUsername}
              authModalNewPassword={authModalNewPassword} setAuthModalNewPassword={setAuthModalNewPassword}
              authModalConfirmPassword={authModalConfirmPassword} setAuthModalConfirmPassword={setAuthModalConfirmPassword}
              openChangeAuthModal={openChangeAuthModal} closeChangeAuthModal={closeChangeAuthModal}
              verifyCurrentPassword={verifyCurrentPassword} submitAuthChange={submitAuthChange}
              isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode}
              autoBackupEnabled={autoBackupEnabled} setAutoBackupEnabled={setAutoBackupEnabled}
              autoBackupFrequency={autoBackupFrequency} setAutoBackupFrequency={setAutoBackupFrequency}
            />
          )}
        </div>

        {/* ==========================================
            PRINTABLE: FORMAL PATOTOO (LETTER SIZE)
        ========================================== */}
        {view === 'PROFILE' && formState && isPatotooView && (
          <div className="hidden print:block print-patotoo bg-white text-black relative" style={{ fontFamily: '"Palatino Linotype", "Book Antiqua", Palatino, serif' }}>

            <div className="mb-8 leading-tight text-[12pt]">
              <p>IGLESIA NI CRISTO</p>
              <p>LOKAL NG {patotooData.lokalName}</p>
              <p>DISTRITO NG {patotooData.distritoName}</p>
            </div>

            <div className="mb-12 text-[12pt]">
              <p>{patotooData.issueDate ? new Date(patotooData.issueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '(Petsa)'}</p>
            </div>

            <div className="text-center mb-10">
              <h1 className="text-[18pt] tracking-wide" style={{ textDecoration: 'underline' }}>PATOTOO</h1>
            </div>

            <div className="text-[12pt] leading-relaxed space-y-6">
              <p>Sa Kinauukulan,</p>
              <p>Pinatutunayan namin na si kapatid na {formatFullName(formState, formState.kapisanan)} ay masiglang tumutupad ng mga sumusunod na tungkulin:</p>
              <ul className="pl-12 space-y-2 list-none">
                {formState.tungkulinList?.filter((t: any) => t.status === 'ACTIVE').map((t: any, i: number) => (
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
                  <div className="border-b border-black h-6 mb-1">{patotooData.signatoryKalihim}</div>
                  <p>Kalihim</p>
                </div>
                <div className="text-center">
                  <div className="border-b border-black h-6 mb-1">{patotooData.signatoryPD}</div>
                  <p>Pangulong Diakono</p>
                </div>
              </div>
              <div className="flex flex-col justify-end w-64">
                <div className="text-center">
                  <div className="border-b border-black h-6 mb-1">{patotooData.signatoryDestinado}</div>
                  <p>Destinado</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            PRINT NATIVE TEMPLATE (8.27in x 3in)
        ========================================== */}
        {view === 'PROFILE' && formState && !isPatotooView && (
          <div className="hidden print:flex print-strip flex-col print:w-[8.27in] print:h-[3in] print:bg-white print:text-black print:p-[0.15in] print:box-border print:overflow-hidden relative print:absolute print:top-0 print:left-0 border-black">

            <div className="text-center mb-2 leading-tight border-b-2 border-black pb-1">
              <h1 className="text-[14px] font-black uppercase tracking-widest m-0 text-gray-900">Talaan ng Maytungkulin</h1>
              <h2 className="text-[11px] font-bold m-0 uppercase text-gray-800">Lokal ng Iligan City</h2>
            </div>

            <div className="flex flex-col gap-0 mb-1 border-t-2 border-x-2 border-black">
              <div className="flex w-full border-b-2 border-black bg-gray-50">
                <div className="flex-1 p-1 border-r-2 border-black">
                  <span className="block text-[6px] text-gray-500 uppercase font-black leading-none mb-0.5">First Name & Suffix</span>
                  <span className="text-[10px] font-black uppercase">{formState.firstName || '-'} {formState.suffix || ''}</span>
                </div>
                <div className="flex-1 p-1 border-r-2 border-black">
                  <span className="block text-[6px] text-gray-500 uppercase font-black leading-none mb-0.5">Apelyido sa Ina</span>
                  <span className="text-[10px] font-black uppercase">{formState.lastNameMother || '-'}</span>
                </div>
                <div className="flex-1 p-1 border-r-2 border-black">
                  <span className="block text-[6px] text-gray-500 uppercase font-black leading-none mb-0.5">Apelyido sa Ama</span>
                  <span className="text-[10px] font-black uppercase">{formState.lastNameFather || '-'}</span>
                </div>
                {formState.gender === 'BABAE' && (
                  <div className="flex-1 p-1 border-l-2 border-black">
                    <span className="block text-[6px] text-gray-500 uppercase font-black leading-none mb-0.5">Apelyido sa Asawa</span>
                    <span className="text-[10px] font-black uppercase">{formState.lastNameSpouse || '-'}</span>
                  </div>
                )}
              </div>

              <div className="flex w-full border-b-2 border-black">
                <div className="flex-1 p-1 border-r-2 border-black">
                  <span className="block text-[6px] text-gray-600 uppercase font-black leading-none mb-0.5">Reg. No.</span>
                  <span className="text-[11px] font-mono font-black">{formState.registry || 'N/A'}</span>
                </div>
                <div className="flex-1 p-1 border-r-2 border-black">
                  <span className="block text-[6px] text-gray-600 uppercase font-black leading-none mb-0.5">PUROK-GRP</span>
                  <span className="text-[10px] font-black uppercase">{formState.purok ? `P${formState.purok}${formState.grupo ? `-G${formState.grupo}` : ''}` : 'N/A'}</span>
                </div>
                <div className="flex-1 p-1 border-r-2 border-black">
                  <span className="block text-[6px] text-gray-600 uppercase font-black leading-none mb-0.5">BDAY (Birthday)</span>
                  <span className="text-[10px] font-black uppercase">{formState.bday ? new Date(formState.bday).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A'}</span>
                </div>
                <div className="flex-1 p-1 border-l-2 border-black">
                  <span className="block text-[6px] text-gray-600 uppercase font-black leading-none mb-0.5">KASAL (Petsa ng Kasal)</span>
                  <span className="text-[10px] font-black uppercase">{formState.petsaKasal ? new Date(formState.petsaKasal).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A'}</span>
                </div>
              </div>
            </div>

            <table className="w-full text-left border-collapse border-2 border-black mt-1">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-1 border border-black text-[8px] uppercase font-black">Tungkulin</th>
                  <th className="p-1 border border-black text-[8px] uppercase font-black text-center w-40">Petsa Nanumpa</th>
                  <th className="p-1 border border-black text-[8px] uppercase font-black text-center w-20">Status</th>
                </tr>
              </thead>
              <tbody>
                {formState.tungkulinList && formState.tungkulinList.filter((t: any) => t.name.trim() !== '').map((t: any, i: number) => (
                  <tr key={i}>
                    <td className="p-1 border border-black text-[9px] font-black uppercase">{t.name}</td>
                    <td className="p-1 border border-black text-[9px] uppercase text-center font-bold">
                      {t.status === 'ACTIVE'
                        ? (t.inOathDate ? new Date(t.inOathDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A')
                        : (t.outDropDate ? new Date(t.outDropDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A')}
                    </td>
                    <td className="p-1 border border-black text-[9px] uppercase font-black text-center tracking-wider">{t.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ==========================================
            PRINTABLE: MASTERLIST
        ========================================== */}
        {view === 'DATABASE' && isPrintingMasterlist && (
          <div className="hidden print:block print-masterlist bg-white text-black relative w-full" style={{ fontFamily: '"Palatino Linotype", "Book Antiqua", Palatino, serif' }}>

            <div className="text-center mb-6 border-b-2 border-black pb-4">
              <h1 className="text-[18pt] font-black uppercase tracking-widest m-0">Talaan ng mga Maytungkulin</h1>
              <h2 className="text-[14pt] font-bold m-0 mt-1 uppercase">Lokal ng Iligan City</h2>
              <h3 className="text-[12pt] font-bold m-0 mt-2 bg-gray-200 inline-block px-4 py-1 rounded">
                {tungkulinFilter !== 'ALL' ? (subRoleFilter !== 'ALL' ? subRoleFilter : tungkulinFilter) : 'PANGKALAHATAN (ALL DEPARTMENTS)'}
              </h3>
            </div>

            <table className="w-full text-left border-collapse border border-black">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border border-black text-[10pt] font-bold uppercase text-center w-10">Blg.</th>
                  <th className="p-2 border border-black text-[10pt] font-bold uppercase w-32">Registry No.</th>
                  <th className="p-2 border border-black text-[10pt] font-bold uppercase">Pangalan</th>
                  <th className="p-2 border border-black text-[10pt] font-bold uppercase w-24">Kapisanan</th>
                  <th className="p-2 border border-black text-[10pt] font-bold uppercase w-24">PRK/GRP</th>
                  <th className="p-2 border border-black text-[10pt] font-bold uppercase">Tungkulin</th>
                  <th className="p-2 border border-black text-[10pt] font-bold uppercase text-center w-24">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredOfficers.map((officer, index) => {
                  let displayRoles = '';
                  let displayStatus = 'N/A';
                  const validRoles = officer.tungkulinList?.filter((t: any) => t.name.trim() !== '') || [];

                  if (tungkulinFilter !== 'ALL') {
                    const dept = departments.find(d => d.name === tungkulinFilter);
                    const validRolesForDept = dept ? [dept.name, ...(dept.specificRoles || [])] : [tungkulinFilter];
                    const matchingRole = validRoles.find((t: any) => {
                      if (subRoleFilter !== 'ALL') return t.name === subRoleFilter;
                      return validRolesForDept.includes(t.name);
                    });
                    if (matchingRole) { displayRoles = matchingRole.name; displayStatus = matchingRole.status; }
                  } else {
                    displayRoles = validRoles.map((t: any) => t.name).join(', ') || 'N/A';
                    const isAnyActive = validRoles.some((t: any) => t.status === 'ACTIVE');
                    displayStatus = validRoles.length ? (isAnyActive ? 'ACTIVE' : 'INACTIVE') : 'N/A';
                  }

                  return (
                    <tr key={officer.id}>
                      <td className="p-2 border border-black text-[10pt] text-center">{index + 1}</td>
                      <td className="p-2 border border-black text-[10pt] font-mono">{officer.registry || 'N/A'}</td>
                      <td className="p-2 border border-black text-[10pt] uppercase font-bold">{formatFullName(officer, officer.kapisanan)}</td>
                      <td className="p-2 border border-black text-[10pt] uppercase">{officer.kapisanan}</td>
                      <td className="p-2 border border-black text-[10pt] uppercase">{officer.purok ? `P${officer.purok}${officer.grupo ? `-G${officer.grupo}` : ''}` : '-'}</td>
                      <td className="p-2 border border-black text-[10pt] uppercase">{displayRoles}</td>
                      <td className="p-2 border border-black text-[10pt] uppercase text-center font-bold">{displayStatus}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="mt-8 flex justify-between items-end text-[10pt]">
              <div className="text-gray-500 italic">Generated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
              <div className="text-center">
                <div className="w-48 border-b border-black mb-1"></div>
                <div className="font-bold uppercase">Kalihim ng Lokal</div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* GLOBAL CONFIRM MODAL */}
      {confirmModalState?.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-8 max-w-sm w-full animate-slideDown border border-gray-200 dark:border-slate-700 m-4">
            <h3 className={`text-xl font-black uppercase tracking-tight mb-2 ${confirmModalState.isDestructive ? 'text-[#CE1126] dark:text-red-500' : 'text-[#006B3F] dark:text-green-500'}`}>
              {confirmModalState.title}
            </h3>
            <p className="text-sm font-bold text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              {confirmModalState.message}
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => { confirmModalState.onConfirm(); setConfirmModalState(null); }}
                className={`w-full text-white font-black py-4 px-6 rounded-xl shadow-lg transition-all ${confirmModalState.isDestructive ? 'bg-[#CE1126] hover:bg-red-800' : 'bg-[#006B3F] hover:bg-[#004d2d]'}`}
              >
                Kumpirmahin (Confirm)
              </button>
              <button
                onClick={() => setConfirmModalState(null)}
                className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300 font-bold py-3 px-6 rounded-xl transition-all"
              >
                I-Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <div className="print:hidden w-full text-center mt-12 mb-6 border-t border-gray-200 dark:border-slate-700 pt-6">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 dark:text-gray-400">
          © 2026 OFFICERS MANAGEMENT SYSTEM | LOKAL NG ILIGAN CITY | PRIVATE PROPERTY.<br className="md:hidden" /> Unauthorized reproduction or distribution is strictly prohibited.
        </p>
      </div>
    </div>
  );
}

// ── Root page (wraps in provider) ────────────────────────────
export default function OfficerDatabase() {
  return (
    <OMSProvider>
      <AppShell />
    </OMSProvider>
  );
}