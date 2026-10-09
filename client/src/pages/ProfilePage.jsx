import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Camera,
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  ShieldCheck,
  ShieldAlert,
  Shield,
  Copy,
  Mail,
  Building,
  Code2,
  KeyRound,
  FileText,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  Calendar,
  Home,
  Sun,
  Moon,
  Zap,
  ArrowRight,
  LogOut,
  LogIn,
  Download,
  RefreshCw,
  Check,
  X
} from 'lucide-react';
import { GoogleIcon } from '../components/GoogleIcon';

export default function ProfilePage() {
  const {
    user,
    updateProfile,
    changePassword,
    generate2FA,
    enable2FA,
    disable2FA,
    getNewRecoveryCodes,
    logout,
    isAdmin,
  } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);
  const toggleTheme = () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  const isDark = theme === 'dark';

  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'security'

  // General tab states
  const [name, setName] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [previewURL, setPreviewURL] = useState('');
  const [bio, setBio] = useState('');
  const [company, setCompany] = useState('');
  const [githubUsername, setGithubUsername] = useState('');

  // Password tab states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // 2FA tab states
  const [twoFactorStep, setTwoFactorStep] = useState('initial'); // 'initial' | 'setup' | 'recovery'
  const [twoFactorSecret, setTwoFactorSecret] = useState('');
  const [twoFactorQrCode, setTwoFactorQrCode] = useState('');
  const [twoFactorCodeInput, setTwoFactorCodeInput] = useState('');
  const [twoFactorRecoveryCodes, setTwoFactorRecoveryCodes] = useState([]);
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);
  const [twoFactorError, setTwoFactorError] = useState('');
  const [twoFactorSuccess, setTwoFactorSuccess] = useState('');
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState(false);

  // Disable 2FA identity verification modal
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [disablePassword, setDisablePassword] = useState('');
  const [disableCode, setDisableCode] = useState('');
  const [disableLoading, setDisableLoading] = useState(false);
  const [disableError, setDisableError] = useState('');

  // Regenerate recovery codes modal
  const [showRegenModal, setShowRegenModal] = useState(false);
  const [regenPassword, setRegenPassword] = useState('');
  const [regenLoading, setRegenLoading] = useState(false);
  const [regenError, setRegenError] = useState('');

  // Status states
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Sync state whenever user changes
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhotoURL(user.photoURL || '');
      setPreviewURL(user.photoURL || '');
      setBio(user.bio || '');
      setCompany(user.company || '');
      setGithubUsername(user.githubUsername || '');
    }
  }, [user]);

  // Handle local image file upload & convert to Base64 image
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (PNG, JPG, WEBP, GIF).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('Image file size must be less than 2MB.');
      return;
    }

    setError('');
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewURL(reader.result);
      setPhotoURL(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPreviewURL('');
    setPhotoURL('');
  };

  const handleGeneralSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await updateProfile({
        name,
        photoURL,
        bio,
        company,
        githubUsername,
      });
      setSuccess('Profile details and picture updated successfully!');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setPasswordLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      setPasswordSuccess('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(''), 4000);
    } catch (err) {
      setPasswordError(err.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleStart2FASetup = async () => {
    setTwoFactorLoading(true);
    setTwoFactorError('');
    setTwoFactorSuccess('');
    try {
      const data = await generate2FA();
      setTwoFactorSecret(data.secret || '');
      setTwoFactorQrCode(data.qrCode || '');
      setTwoFactorCodeInput('');
      setTwoFactorStep('setup');
    } catch (err) {
      setTwoFactorError(err.message || 'Failed to generate 2FA setup');
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handleConfirm2FA = async (e) => {
    e.preventDefault();
    if (twoFactorCodeInput.length < 6) {
      setTwoFactorError('Please enter the 6-digit verification code.');
      return;
    }
    setTwoFactorLoading(true);
    setTwoFactorError('');
    try {
      const res = await enable2FA(twoFactorCodeInput);
      setTwoFactorSuccess('Two-Factor Authentication is now enabled!');
      setTwoFactorCodeInput('');
      if (Array.isArray(res.recoveryCodes) && res.recoveryCodes.length > 0) {
        setTwoFactorRecoveryCodes(res.recoveryCodes);
        setTwoFactorStep('recovery');
      } else {
        setTwoFactorStep('initial');
      }
      setTimeout(() => setTwoFactorSuccess(''), 4000);
    } catch (err) {
      setTwoFactorError(err.message || 'Invalid verification code');
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handleDisable2FA = async (e) => {
    e?.preventDefault();
    if (!disablePassword && !disableCode) {
      setDisableError('Please enter your account password or current 6-digit authenticator code.');
      return;
    }
    setDisableLoading(true);
    setDisableError('');
    try {
      await disable2FA({ password: disablePassword, code: disableCode });
      setTwoFactorSuccess('Two-Factor Authentication has been successfully disabled.');
      setShowDisableModal(false);
      setDisablePassword('');
      setDisableCode('');
      setTwoFactorStep('initial');
      setTwoFactorSecret('');
      setTwoFactorQrCode('');
      setTwoFactorRecoveryCodes([]);
      setTimeout(() => setTwoFactorSuccess(''), 4000);
    } catch (err) {
      setDisableError(err.message || 'Failed to disable 2FA');
    } finally {
      setDisableLoading(false);
    }
  };

  const handleRegenerateRecoveryCodes = async (e) => {
    e?.preventDefault();
    if (!regenPassword) {
      setRegenError('Please enter your account password to generate new recovery codes.');
      return;
    }
    setRegenLoading(true);
    setRegenError('');
    try {
      const data = await getNewRecoveryCodes({ password: regenPassword });
      setTwoFactorRecoveryCodes(data.recoveryCodes || []);
      setShowRegenModal(false);
      setRegenPassword('');
      setTwoFactorStep('recovery');
      setTwoFactorSuccess('New recovery codes generated!');
      setTimeout(() => setTwoFactorSuccess(''), 4000);
    } catch (err) {
      setRegenError(err.message || 'Failed to generate recovery codes');
    } finally {
      setRegenLoading(false);
    }
  };

  const handleCopyCodes = () => {
    if (twoFactorRecoveryCodes.length > 0) {
      const text = twoFactorRecoveryCodes.join('\n');
      navigator.clipboard.writeText(text);
      setCopiedCodes(true);
      setTimeout(() => setCopiedCodes(false), 2000);
    }
  };

  const handleDownloadCodes = () => {
    if (twoFactorRecoveryCodes.length === 0) return;
    const content = `APITester Studio - Two-Factor Authentication Backup Recovery Codes\nAccount: ${user?.email}\nGenerated: ${new Date().toLocaleString()}\n\nKeep these codes safe and private. Each code can only be used once to access your account if you lose your authenticator app:\n\n${twoFactorRecoveryCodes.map((c, i) => `${i + 1}. ${c}`).join('\n')}\n`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `apitester-recovery-codes-${user?.email?.split('@')[0] || 'account'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopySecret = () => {
    if (twoFactorSecret) {
      navigator.clipboard.writeText(twoFactorSecret);
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {/* Top Navbar */}
      <header className={`border-b sticky top-0 z-30 transition-colors duration-200 ${isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200'} backdrop-blur-md`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 group" title="Return to Landing Page">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
                <Zap className="w-5 h-5 text-amber-300 fill-amber-300" />
              </div>
              <span className="font-bold text-base tracking-tight">
                APITester <span className="text-xs px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 font-mono">PRO</span>
              </span>
            </Link>

            <Link
              to="/"
              className={`text-xs flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition ${
                isDark ? 'border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300' : 'border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>

            <Link
              to="/app"
              className={`text-xs flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition ${
                isDark ? 'border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300' : 'border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <span>API Studio</span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg border transition ${
                isDark ? 'border-slate-800 bg-slate-900 text-amber-400 hover:bg-slate-800' : 'border-slate-200 bg-white text-indigo-600 hover:bg-slate-100 shadow-xs'
              }`}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {user ? (
              <button
                onClick={logout}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition cursor-pointer flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            ) : (
              <Link
                to="/login"
                className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6">
        {!user ? (
          <div className={`p-8 rounded-2xl border text-center max-w-md mx-auto my-12 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xl'}`}>
            <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 mx-auto mb-4">
              <User className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold mb-2">Sign in to Access Profile</h2>
            <p className="text-xs text-slate-400 mb-6">
              You must be logged in to view and edit your profile details, upload a profile photo, and manage security settings.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs shadow-md"
            >
              <LogIn className="w-4 h-4" />
              <span>Go to Sign In</span>
            </Link>
          </div>
        ) : (
          <div className={`rounded-2xl border overflow-hidden shadow-xl ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            {/* Profile Header Banner */}
            <div className="bg-gradient-to-r from-sky-600/30 via-indigo-600/20 to-purple-600/30 p-6 sm:p-8 border-b border-slate-800">
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
                {/* Profile Picture with Camera Overlay */}
                <div className="relative group">
                  {previewURL ? (
                    <img
                      src={previewURL}
                      alt={name || user.name}
                      className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-slate-900 shadow-2xl ring-2 ring-sky-500"
                    />
                  ) : (
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-sky-600 to-indigo-600 text-white flex items-center justify-center text-3xl font-bold border-4 border-slate-900 shadow-2xl ring-2 ring-sky-500">
                      {(name || user.name || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition cursor-pointer text-white"
                    title="Change Profile Picture"
                  >
                    <Camera className="w-7 h-7" />
                  </button>
                </div>

                {/* Profile Header Info */}
                <div className="flex-1 text-center sm:text-left space-y-1.5">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">{name || user.name}</h1>
                    {isAdmin ? (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 font-mono font-bold flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                        ADMINISTRATOR
                      </span>
                    ) : (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-700/60 text-slate-300 border border-slate-600 font-mono font-medium">
                        STANDARD USER
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 font-mono">{user.email}</p>
                  {company && <p className="text-xs text-slate-300 flex items-center justify-center sm:justify-start gap-1"><Building className="w-3 h-3 text-slate-400" /> {company}</p>}
                </div>

                {/* Photo Actions */}
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Picture</span>
                  </button>
                  {previewURL && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 border border-rose-500/30 transition cursor-pointer flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-slate-800 px-6 pt-2 gap-4">
              <button
                onClick={() => setActiveTab('general')}
                className={`pb-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'general'
                    ? 'border-sky-500 text-sky-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Personal Profile & Details</span>
              </button>

              <button
                onClick={() => setActiveTab('security')}
                className={`pb-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'security'
                    ? 'border-sky-500 text-sky-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <KeyRound className="w-4 h-4" />
                <span>Password & Security</span>
              </button>
            </div>

            {/* Tab Body */}
            <div className="p-6 sm:p-8">
              {activeTab === 'general' ? (
                <form onSubmit={handleGeneralSubmit} className="space-y-6">
                  {error && (
                    <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {success && (
                    <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{success}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
                    <div>
                      <label className="block text-slate-300 font-medium mb-1.5">Full Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        placeholder="e.g. Namitha Singupuram"
                        className="w-full rounded-xl px-4 py-2.5 border border-slate-700 bg-slate-950 text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-medium mb-1.5">Email Address</label>
                      <div className="relative">
                        <input
                          type="email"
                          value={user.email}
                          disabled
                          className="w-full rounded-xl pl-10 pr-4 py-2.5 border border-slate-800 bg-slate-950/60 text-slate-400 cursor-not-allowed text-xs font-mono"
                        />
                        <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-medium mb-1.5">Company / Organization</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                          placeholder="e.g. API Studio Labs"
                          className="w-full rounded-xl pl-10 pr-4 py-2.5 border border-slate-700 bg-slate-950 text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
                        />
                        <Building className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-medium mb-1.5">GitHub Username</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={githubUsername}
                          onChange={(e) => setGithubUsername(e.target.value)}
                          placeholder="e.g. namitha8411"
                          className="w-full rounded-xl pl-10 pr-4 py-2.5 border border-slate-700 bg-slate-950 text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
                        />
                        <Code2 className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5 text-xs">
                      <label className="text-slate-300 font-medium">Bio / Developer Note</label>
                      <span className="text-[10px] text-slate-500">{bio.length}/300</span>
                    </div>
                    <textarea
                      rows={3}
                      value={bio}
                      onChange={(e) => setBio(e.target.value.slice(0, 300))}
                      placeholder="Write a brief summary of your role, development tools, or API testing projects..."
                      className="w-full rounded-xl p-3.5 border border-slate-700 bg-slate-950 text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs resize-none"
                    />
                  </div>

                  {/* Account Authorization Card */}
                  <div className={`p-4 rounded-xl border text-xs space-y-2 ${isAdmin ? 'bg-purple-950/20 border-purple-500/30' : 'bg-slate-950/60 border-slate-800'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isAdmin ? (
                          <ShieldCheck className="w-4 h-4 text-purple-400" />
                        ) : (
                          <ShieldAlert className="w-4 h-4 text-amber-400" />
                        )}
                        <span className="font-semibold text-slate-200">
                          {isAdmin ? 'Administrator Access Granted' : 'Standard User Authorization'}
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase ${isAdmin ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' : 'bg-slate-800 text-slate-400'}`}>
                        Role: {user.role || 'user'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {isAdmin
                        ? 'Your account is authorized to view and modify user permissions, telemetry, and system audits in the Admin Dashboard.'
                        : 'Your account has full access to the API Testing Workbench, Environments, and Collection Runner. Access to the Admin Dashboard requires whitelist approval.'}
                    </p>
                  </div>

                  {/* Submit Button */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs shadow-lg shadow-sky-600/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Saving Profile...</span>
                        </>
                      ) : (
                        <span>Save Profile Changes</span>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                /* Password & Security Tab */
                <div className="space-y-6">
                  {/* Two-Factor Authentication Section */}
                  <div className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'} space-y-4`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${user.twoFactorEnabled ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                          {user.twoFactorEnabled ? (
                            <ShieldCheck className="w-5 h-5" />
                          ) : (
                            <ShieldAlert className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-xs">Two-Factor Authentication (2FA)</h4>
                          <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {user.twoFactorEnabled
                              ? 'Your account is secured with standard TOTP 2FA verification.'
                              : 'Protect your account with Google Authenticator, Microsoft Authenticator, or Authy.'}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded font-mono text-[10px] font-bold uppercase ${
                          user.twoFactorEnabled
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {user.twoFactorEnabled ? 'Active' : 'Disabled'}
                      </span>
                    </div>

                    {twoFactorError && (
                      <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{twoFactorError}</span>
                      </div>
                    )}

                    {twoFactorSuccess && (
                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>{twoFactorSuccess}</span>
                      </div>
                    )}

                    {/* Step: Display Backup Recovery Codes */}
                    {twoFactorStep === 'recovery' && twoFactorRecoveryCodes.length > 0 ? (
                      <div className="p-5 rounded-xl border bg-purple-950/20 border-purple-500/30 space-y-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs font-bold text-purple-300">
                            <KeyRound className="w-4 h-4 text-purple-400" />
                            <span>Save Your Backup Recovery Codes</span>
                          </div>
                          <p className={`text-[11px] ${isDark ? 'text-slate-300' : 'text-slate-600'} leading-relaxed`}>
                            Store these 8 one-time backup codes securely. If you ever lose your phone or authenticator app, each code can be used once to access your account. <strong>They will not be shown again.</strong>
                          </p>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                          {twoFactorRecoveryCodes.map((code, index) => (
                            <div
                              key={index}
                              className={`p-2.5 rounded-lg border font-mono font-bold text-xs text-center tracking-wider ${
                                isDark ? 'bg-slate-900 border-purple-500/20 text-purple-200' : 'bg-white border-purple-200 text-purple-800'
                              }`}
                            >
                              {code}
                            </div>
                          ))}
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-purple-500/20">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={handleCopyCodes}
                              className="px-3 py-1.5 rounded-lg border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                            >
                              {copiedCodes ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{copiedCodes ? 'Copied All!' : 'Copy All Codes'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={handleDownloadCodes}
                              className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5 text-sky-400" />
                              <span>Download (.txt)</span>
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setTwoFactorStep('initial');
                              setTwoFactorRecoveryCodes([]);
                            }}
                            className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md transition cursor-pointer"
                          >
                            I Have Saved My Recovery Codes &rarr;
                          </button>
                        </div>
                      </div>
                    ) : user.twoFactorEnabled ? (
                      /* Active State */
                      <div className="space-y-3 pt-1">
                        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                          <div className="space-y-0.5">
                            <span className="text-xs text-emerald-400 flex items-center gap-1.5 font-bold">
                              <CheckCircle2 className="w-4 h-4" /> Two-Factor Authentication Is Active
                            </span>
                            <p className="text-[11px] text-slate-400">
                              {user.remainingRecoveryCodes !== undefined
                                ? `${user.remainingRecoveryCodes} of 8 backup recovery codes remaining.`
                                : 'Protected by Authenticator App TOTP codes.'}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setShowRegenModal(true);
                                setRegenError('');
                                setRegenPassword('');
                              }}
                              className="px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
                            >
                              <RefreshCw className="w-3 h-3 text-purple-400" />
                              <span>Regenerate Codes</span>
                            </button>
                            <button
                              type="button"
                              disabled={twoFactorLoading}
                              onClick={() => {
                                setShowDisableModal(true);
                                setDisableError('');
                                setDisablePassword('');
                                setDisableCode('');
                              }}
                              className="px-3.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold transition cursor-pointer disabled:opacity-50"
                            >
                              Disable 2FA
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : twoFactorStep === 'setup' ? (
                      /* 2FA Setup Flow */
                      <div className={`p-5 rounded-xl border ${isDark ? 'bg-purple-950/20 border-purple-500/30' : 'bg-purple-50 border-purple-200'} space-y-4`}>
                        <div className="space-y-1">
                          <div className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-purple-400" />
                            <span>Link Your Authenticator Application</span>
                          </div>
                          <p className={`text-[11px] ${isDark ? 'text-slate-300' : 'text-slate-600'} leading-relaxed`}>
                            1. Open <strong>Google Authenticator</strong>, <strong>Microsoft Authenticator</strong>, or <strong>Authy</strong> on your mobile phone.<br />
                            2. Scan the QR code below using your phone's camera:
                          </p>
                        </div>

                        {/* High-Contrast QR Code Display */}
                        {twoFactorQrCode && (
                          <div className="flex flex-col items-center justify-center p-3 bg-white rounded-xl shadow-lg border border-purple-400/30 w-fit mx-auto">
                            <img
                              src={twoFactorQrCode}
                              alt="2FA QR Code"
                              className="w-44 h-44 object-contain rounded"
                            />
                            <span className="text-[10px] text-slate-800 font-mono font-bold mt-1.5">
                              Scan with Authenticator App
                            </span>
                          </div>
                        )}

                        {/* Manual Secret Key */}
                        <div className="space-y-1">
                          <span className="text-[11px] text-slate-400 font-medium">Or enter this key manually if camera is unavailable:</span>
                          <div className={`flex items-center justify-between px-3.5 py-2 rounded-xl border font-mono text-xs ${isDark ? 'bg-slate-900 border-purple-500/20 text-purple-200' : 'bg-white border-purple-200 text-purple-700'}`}>
                            <span className="tracking-widest font-bold">{twoFactorSecret}</span>
                            <button
                              type="button"
                              onClick={handleCopySecret}
                              className="ml-2 text-slate-400 hover:text-white p-1 cursor-pointer flex items-center gap-1 text-[11px]"
                              title="Copy Secret"
                            >
                              {copiedSecret ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{copiedSecret ? 'Copied' : 'Copy'}</span>
                            </button>
                          </div>
                        </div>

                        {/* Verification Input Form (No fake demo code preview) */}
                        <form onSubmit={handleConfirm2FA} className="space-y-3 max-w-sm">
                          <div>
                            <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                              Enter 6-Digit Code Shown in Authenticator App
                            </label>
                            <input
                              type="text"
                              maxLength={6}
                              autoFocus
                              required
                              value={twoFactorCodeInput}
                              onChange={(e) => setTwoFactorCodeInput(e.target.value.replace(/\D/g, ''))}
                              placeholder="000000"
                              className={`w-full text-center tracking-[0.4em] font-mono text-xl py-2 rounded-xl border ${isDark ? 'bg-slate-950 border-purple-500/30 text-purple-200' : 'bg-white border-purple-300 text-purple-800'} focus:outline-none focus:ring-2 focus:ring-purple-500/30`}
                            />
                          </div>

                          <div className="flex items-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                setTwoFactorStep('initial');
                                setTwoFactorError('');
                              }}
                              className="px-3.5 py-2 text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={twoFactorLoading || twoFactorCodeInput.length < 6}
                              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md transition disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                            >
                              {twoFactorLoading ? (
                                <>
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  <span>Enabling...</span>
                                </>
                              ) : (
                                <>
                                  <ShieldCheck className="w-3.5 h-3.5" />
                                  <span>Confirm & Enable 2FA</span>
                                </>
                              )}
                            </button>
                          </div>
                        </form>
                      </div>
                    ) : (
                      /* Start Setup Button */
                      <button
                        type="button"
                        disabled={twoFactorLoading}
                        onClick={handleStart2FASetup}
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md transition cursor-pointer flex items-center gap-2 disabled:opacity-50"
                      >
                        {twoFactorLoading ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Initializing 2FA...</span>
                          </>
                        ) : (
                          <>
                            <Shield className="w-4 h-4" />
                            <span>Enable Two-Factor Authentication</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Disable 2FA Verification Modal */}
                  {showDisableModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
                      <div className={`w-full max-w-md p-6 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-2xl'} space-y-4`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm font-bold text-rose-400">
                            <ShieldAlert className="w-5 h-5" />
                            <span>Disable Two-Factor Authentication</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowDisableModal(false)}
                            className="p-1 text-slate-400 hover:text-white"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <p className="text-xs text-slate-400 leading-relaxed">
                          Disabling 2FA lowers your account defense. To verify your identity, please enter your current account password or live 6-digit authenticator code:
                        </p>

                        {disableError && (
                          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{disableError}</span>
                          </div>
                        )}

                        <form onSubmit={handleDisable2FA} className="space-y-3 text-xs">
                          <div>
                            <label className="block text-slate-300 font-medium mb-1">Account Password</label>
                            <input
                              type="password"
                              value={disablePassword}
                              onChange={(e) => setDisablePassword(e.target.value)}
                              placeholder="••••••••"
                              className="w-full rounded-xl px-3.5 py-2 border border-slate-700 bg-slate-950 text-slate-100 text-xs focus:ring-2 focus:ring-rose-500/30 outline-none"
                            />
                          </div>

                          <div className="relative text-center my-1">
                            <span className="text-[10px] uppercase font-bold text-slate-500 px-2 bg-slate-900">or</span>
                          </div>

                          <div>
                            <label className="block text-slate-300 font-medium mb-1">6-Digit Authenticator Code</label>
                            <input
                              type="text"
                              maxLength={6}
                              value={disableCode}
                              onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, ''))}
                              placeholder="000000"
                              className="w-full rounded-xl px-3.5 py-2 border border-slate-700 bg-slate-950 text-slate-100 font-mono tracking-widest text-center text-sm focus:ring-2 focus:ring-rose-500/30 outline-none"
                            />
                          </div>

                          <div className="flex items-center justify-end gap-2 pt-2">
                            <button
                              type="button"
                              onClick={() => setShowDisableModal(false)}
                              className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 text-xs"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={disableLoading || (!disablePassword && !disableCode)}
                              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition disabled:opacity-50 flex items-center gap-1.5"
                            >
                              {disableLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                              <span>Confirm & Disable 2FA</span>
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}

                  {/* Regenerate Recovery Codes Modal */}
                  {showRegenModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
                      <div className={`w-full max-w-md p-6 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-2xl'} space-y-4`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm font-bold text-purple-300">
                            <RefreshCw className="w-5 h-5 text-purple-400" />
                            <span>Regenerate Recovery Codes</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowRegenModal(false)}
                            className="p-1 text-slate-400 hover:text-white"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <p className="text-xs text-slate-400 leading-relaxed">
                          Generating new recovery codes will immediately invalidate all previously generated codes. Please enter your account password to verify identity:
                        </p>

                        {regenError && (
                          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{regenError}</span>
                          </div>
                        )}

                        <form onSubmit={handleRegenerateRecoveryCodes} className="space-y-3 text-xs">
                          <div>
                            <label className="block text-slate-300 font-medium mb-1">Account Password</label>
                            <input
                              type="password"
                              required
                              value={regenPassword}
                              onChange={(e) => setRegenPassword(e.target.value)}
                              placeholder="••••••••"
                              className="w-full rounded-xl px-3.5 py-2 border border-slate-700 bg-slate-950 text-slate-100 text-xs focus:ring-2 focus:ring-purple-500/30 outline-none"
                            />
                          </div>

                          <div className="flex items-center justify-end gap-2 pt-2">
                            <button
                              type="button"
                              onClick={() => setShowRegenModal(false)}
                              className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 text-xs"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={regenLoading || !regenPassword}
                              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition disabled:opacity-50 flex items-center gap-1.5"
                            >
                              {regenLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                              <span>Generate New Codes</span>
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}

                  {/* Password Form */}
                  <form onSubmit={handlePasswordSubmit} className="space-y-5 pt-4 border-t border-slate-800">
                    {passwordError && (
                      <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{passwordError}</span>
                      </div>
                    )}

                    {passwordSuccess && (
                      <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>{passwordSuccess}</span>
                      </div>
                    )}

                    <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 text-xs text-slate-400 space-y-1">
                      <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                        <Lock className="w-4 h-4 text-amber-400" />
                        <span>Change Account Password</span>
                      </div>
                      <p className="text-[11px] leading-relaxed">
                        Enter your current password followed by your desired new password (at least 6 characters).
                      </p>
                    </div>

                    <div className="space-y-4 text-xs max-w-lg">
                      <div>
                        <label className="block text-slate-300 font-medium mb-1.5">Current Password</label>
                        <div className="relative">
                          <input
                            type={showCurrentPassword ? 'text' : 'password'}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                            className="w-full rounded-xl pl-4 pr-10 py-2.5 border border-slate-700 bg-slate-950 text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                          >
                            {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-300 font-medium mb-1.5">New Password</label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            placeholder="At least 6 characters"
                            className="w-full rounded-xl pl-4 pr-10 py-2.5 border border-slate-700 bg-slate-950 text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                          >
                            {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-300 font-medium mb-1.5">Confirm New Password</label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          placeholder="Re-type new password"
                          className="w-full rounded-xl px-4 py-2.5 border border-slate-700 bg-slate-950 text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                      <button
                        type="submit"
                        disabled={passwordLoading}
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {passwordLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Updating Password...</span>
                          </>
                        ) : (
                          <span>Update Password</span>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

