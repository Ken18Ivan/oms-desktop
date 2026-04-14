import React from 'react';

interface LoginScreenProps {
  usernameInput: string;
  setUsernameInput: (val: string) => void;
  passwordInput: string;
  setPasswordInput: (val: string) => void;
  showPassword: boolean;
  setShowPassword: (val: boolean) => void;
  authError: boolean;
  runtimeMode: 'electron' | 'browser';
  isIpcReady: boolean;
  runtimeHint: string;
  handleLogin: (e?: React.FormEvent) => void;
}

export default function LoginScreen({
  usernameInput,
  setUsernameInput,
  passwordInput,
  setPasswordInput,
  showPassword,
  setShowPassword,
  authError,
  runtimeMode,
  isIpcReady,
  runtimeHint,
  handleLogin,
}: LoginScreenProps) {
  return (
    <div className="fixed inset-0 bg-[#0f172a] flex items-center justify-center z-[9999] overflow-hidden">
      {/* Decorative Background Orbs for Glass Effect */}
      <div className="absolute top-[10%] left-[20%] w-96 h-96 bg-[#006B3F] rounded-full mix-blend-screen filter blur-[128px] opacity-40 animate-pulse"></div>
      <div className="absolute bottom-[10%] right-[20%] w-96 h-96 bg-[#CE1126] rounded-full mix-blend-screen filter blur-[128px] opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] rounded-3xl p-10 w-full max-w-sm flex flex-col items-center transform transition-all hover:scale-[1.02] duration-500">
        {/* CUSTOM CHURCH OFFICERS LOGO */}
        <div className="mx-auto mb-4 w-24 h-24 relative flex items-center justify-center">
          <div className="absolute inset-0 bg-[#006B3F] blur-xl opacity-40 rounded-full"></div>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="relative z-10 w-20 h-20 drop-shadow-2xl">
            <path fill="#006B3F" d="M12 2L3 6v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V6l-9-4z" />
            <path fill="#CE1126" d="M12 4.5l-7 3.11v4.39c0 4.26 2.95 8.24 7 9.25 4.05-1.01 7-4.99 7-9.25V7.61l-7-3.11z" />
            <path fill="#FFFFFF" d="M12 15c-1.66 0-3-1-3-2V8.5c1.33 1 2.5 1 3 1s1.67 0 3-1V13c0 1-1.34 2-3 2zm0-2.5c-.83 0-1.5-.5-2-1V9.5c.5.5 1.17.5 2 .5s1.5 0 2-.5v2c-.5.5-1.17 1-2 1z" />
            <path fill="#FFFFFF" d="M12 12.5c-.5 0-1-.5-1-1.5 0-1.5 1-3 1-3s1 1.5 1 3c0 1-.5 1.5-1 1.5z" />
          </svg>
        </div>

        <h1 className="text-white text-xl font-black mb-1 text-center tracking-[0.2em] uppercase drop-shadow-sm">
          O.M.S PORTAL
        </h1>
        <p className="text-gray-300/80 text-[9px] font-bold uppercase mb-8 tracking-[0.3em] text-center">
          MT REGISTRY ACCESS
        </p>

        <form onSubmit={handleLogin} className="w-full space-y-5">
          <div className="relative group flex items-center justify-center flex-col">
            <div className="relative w-full">
              <input
                type="text"
                autoFocus
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="ENTER USERNAME"
                className={`w-full px-6 py-4 rounded-xl bg-black/20 border border-white/10 text-white placeholder-white/30 font-bold tracking-[0.1em] text-center focus:outline-none focus:ring-2 focus:ring-[#006B3F]/70 focus:bg-black/40 transition-all duration-300 ${authError ? 'border-red-500 animate-shake bg-red-500/20' : ''}`}
              />
            </div>
          </div>
          <div className="relative group flex items-center justify-center flex-col">
            <div className="relative w-full">
              <input
                type={showPassword ? "text" : "password"}
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="ENTER PASSWORD"
                className={`w-full px-6 py-4 rounded-xl bg-black/20 border border-white/10 text-white placeholder-white/30 font-bold tracking-[0.1em] text-center focus:outline-none focus:ring-2 focus:ring-[#006B3F]/70 focus:bg-black/40 transition-all duration-300 ${authError ? 'border-red-500 animate-shake bg-red-500/20' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors text-xl"
                title={showPassword ? "Hide Password" : "Show Password"}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                    <line x1="2" y1="2" x2="22" y2="22" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            {authError && <p className="text-red-400 text-[10px] font-black mt-3 uppercase tracking-widest text-center w-full">Unauthorized Credential</p>}
          </div>

          <button
            type="submit"
            className="w-full bg-[#006B3F]/90 hover:bg-[#006B3F] text-white font-black uppercase tracking-[0.2em] py-4 rounded-xl shadow-[0_4px_15px_rgba(0,107,63,0.4)] hover:shadow-[0_6px_20px_rgba(0,107,63,0.6)] hover:-translate-y-1 transition-all duration-300 active:scale-95"
          >
            Login
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/10 w-full text-center flex items-center justify-center gap-2">
          <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></div>
          <p className="text-[8px] text-white/40 font-bold uppercase tracking-[0.3em]">
            Authorized Personnel Only
          </p>
        </div>

        {!isIpcReady && (
          <div className="mt-4 w-full rounded-xl border border-amber-300/40 bg-amber-500/10 p-3 text-left">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-200">
              Runtime Check: {runtimeMode === 'electron' ? 'Electron (IPC Missing)' : 'Browser Mode'}
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-amber-100/90">
              {runtimeHint}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
