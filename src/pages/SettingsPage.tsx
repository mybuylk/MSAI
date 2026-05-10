import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, User, Mail, Shield, Bell, Languages, 
  Palette, MessageSquare, Brain, Database, Trash2, 
  Check, X, Loader2, Camera, Key, HardDrive, 
  Zap, Clock, Download, Globe, Lock, Cpu, Sparkles,
  Smartphone, UserX, LogOut, ChevronRight, Monitor,
  Volume2, Type, Layout, RefreshCw, Layers
} from 'lucide-react';
import { useAuth, DEFAULT_SETTINGS, UserSettings } from '../context/AuthContext';
import { cn } from '../lib/utils';
import { toast } from 'react-hot-toast';
import { updateProfile, updateEmail, updatePassword, deleteUser } from 'firebase/auth';

type TabType = 'account' | 'appearance' | 'chat' | 'language' | 'notification' | 'security' | 'ai' | 'storage';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, userSettings, updateSettings, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('account');
  const [isSaving, setIsSaving] = useState(false);
  
  // Account Editing States
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(user?.displayName || '');
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState(user?.email || '');
  const [showPasswordUpdate, setShowPasswordUpdate] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  const sidebarTabs: { id: TabType; icon: any; label: string; color: string }[] = [
    { id: 'account', icon: User, label: 'Account', color: 'text-blue-500' },
    { id: 'appearance', icon: Palette, label: 'Appearance', color: 'text-purple-500' },
    { id: 'chat', icon: MessageSquare, label: 'Chat Settings', color: 'text-emerald-500' },
    { id: 'language', icon: Languages, label: 'Language', color: 'text-orange-500' },
    { id: 'notification', icon: Bell, label: 'Notifications', color: 'text-rose-500' },
    { id: 'security', icon: Shield, label: 'Security', color: 'text-indigo-500' },
    { id: 'ai', icon: Brain, label: 'AI Preferences', color: 'text-cyan-500' },
    { id: 'storage', icon: Database, label: 'Storage', color: 'text-amber-500' },
  ];

  const handleUpdateProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      if (newName !== user.displayName) {
        await updateProfile(user, { displayName: newName });
        toast.success('Profile updated');
      }
      setIsEditingName(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    if (window.confirm('WARNING: Are you sure you want to delete your account? This action is permanent and all your data will be lost.')) {
      try {
        await deleteUser(user);
        toast.success('Account deleted');
        navigate('/');
      } catch (error: any) {
        toast.error('Deletion failed. You may need to re-authenticate first.');
      }
    }
  };

  const handleUpdateNestedSetting = async (category: keyof UserSettings, key: string, value: any) => {
    if (!userSettings) return;
    setIsSaving(true);
    try {
      const categoryData = userSettings[category] || {};
      const updatedCategory = { ...categoryData, [key]: value };
      await updateSettings({ [category]: updatedCategory });
      toast.success('Setting saved');
    } catch (error) {
      toast.error('Failed to save setting');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-300">
      {/* Navbar */}
      <header className="fixed top-0 w-full glass z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/chat')}
              className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all cursor-pointer group"
            >
              <ArrowLeft className="w-5 h-5 text-slate-500 group-hover:-translate-x-1 transition-transform" />
            </button>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
            <div>
              <h1 className="text-xl font-bold dark:text-white flex items-center gap-2">
                Settings
                {isSaving && <Loader2 className="w-4 h-4 animate-spin text-blue-500" />}
              </h1>
              <p className="text-xs text-slate-500 font-medium tracking-tight">Configure your MS AI experience</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => logout()}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-50 dark:bg-red-900/10 text-red-600 rounded-xl font-bold text-sm hover:bg-red-100 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 pt-32 pb-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-72 flex-shrink-0">
            <nav className="space-y-1.5 sticky top-32">
              {sidebarTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "w-full flex items-center gap-4 px-5 py-4 rounded-[1.25rem] transition-all duration-300 cursor-pointer text-left font-semibold text-sm",
                    activeTab === tab.id 
                      ? "bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/40 dark:shadow-none border border-slate-100 dark:border-slate-800 scale-[1.02]" 
                      : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900/50"
                  )}
                >
                  <div className={cn(
                    "p-2 rounded-xl transition-colors",
                    activeTab === tab.id ? "bg-slate-50 dark:bg-slate-800" : "bg-transparent"
                  )}>
                    <tab.icon className={cn("w-4 h-4", activeTab === tab.id ? tab.color : "text-slate-400")} />
                  </div>
                  <span className={activeTab === tab.id ? "dark:text-white" : ""}>{tab.label}</span>
                  {activeTab === tab.id && (
                    <motion.div 
                      layoutId="active-pill"
                      className="ml-auto w-1.5 h-1.5 bg-blue-500 rounded-full"
                    />
                  )}
                </button>
              ))}
            </nav>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 lg:p-12 shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800"
              >
                {activeTab === 'account' && (
                  <div className="space-y-10">
                    <div>
                      <h2 className="text-3xl font-extrabold tracking-tight mb-2 dark:text-white">Account Settings</h2>
                      <p className="text-slate-500">Manage your personal information and account security.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="group relative">
                          <p className="text-sm font-bold text-slate-400 mb-3 uppercase tracking-widest">Avatar</p>
                          <div className="flex items-center gap-6">
                            <div className="relative group cursor-pointer">
                              <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800 flex items-center justify-center overflow-hidden border-2 border-dashed border-slate-200 dark:border-slate-700 group-hover:border-blue-500 transition-all">
                                {user?.photoURL ? (
                                  <img src={user.photoURL} className="w-full h-full object-cover" alt="avatar" />
                                ) : (
                                  <User className="w-10 h-10 text-slate-300 group-hover:text-blue-500 transition-colors" />
                                )}
                              </div>
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-[2rem] transition-all">
                                <Camera className="w-6 h-6 text-white" />
                              </div>
                            </div>
                            <div className="space-y-2">
                               <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all cursor-pointer shadow-lg shadow-blue-100 dark:shadow-none">Upload New</button>
                               <button className="block text-sm text-slate-500 font-bold hover:text-red-500 transition-colors cursor-pointer">Remove</button>
                            </div>
                          </div>
                       </div>

                       <div className="space-y-6">
                          <div>
                            <p className="text-sm font-bold text-slate-400 mb-3 uppercase tracking-widest">User Details</p>
                            <div className="flex flex-col gap-1">
                              <span className="text-[10px] font-bold text-slate-400">UID</span>
                              <span className="text-xs font-mono bg-slate-50 dark:bg-slate-800 p-2 rounded-lg dark:text-slate-400">{user?.uid}</span>
                            </div>
                            <div className="flex flex-col gap-1 mt-4">
                              <span className="text-[10px] font-bold text-slate-400">CREATED ON</span>
                              <span className="text-xs font-semibold dark:text-slate-300">{user?.metadata.creationTime}</span>
                            </div>
                          </div>
                       </div>
                    </div>

                    <div className="h-px bg-slate-50 dark:bg-slate-800" />

                    <div className="space-y-6">
                       <SectionItem 
                        title="Username" 
                        value={user?.displayName || 'Not set'} 
                        onEdit={() => setIsEditingName(true)}
                        isEditing={isEditingName}
                        editComponent={
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              value={newName}
                              onChange={(e) => setNewName(e.target.value)}
                              className="bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none w-full dark:text-white"
                              autoFocus
                            />
                            <button onClick={handleUpdateProfile} className="p-2 bg-blue-600 text-white rounded-xl"><Check className="w-4 h-4" /></button>
                            <button onClick={() => setIsEditingName(false)} className="p-2 bg-slate-100 rounded-xl"><X className="w-4 h-4" /></button>
                          </div>
                        }
                       />
                       <SectionItem 
                        title="Email Address" 
                        value={user?.email || 'Not set'} 
                        onEdit={() => toast.error('Email updates require re-authentication in this demo')}
                       />
                       <SectionItem 
                        title="Password" 
                        value="••••••••••••" 
                        onEdit={() => setShowPasswordUpdate(true)}
                       />
                    </div>

                    <div className="space-y-4 pt-10">
                      <h3 className="text-red-500 font-bold text-sm tracking-widest uppercase">Danger Zone</h3>
                      <button 
                        onClick={handleDeleteAccount}
                        className="w-full flex items-center justify-between p-6 bg-red-50 dark:bg-red-950/20 rounded-[1.5rem] border border-red-100 dark:border-red-900/30 hover:bg-red-100 transition-all group cursor-pointer"
                      >
                        <div className="text-left">
                          <p className="font-bold text-red-600">Delete Account</p>
                          <p className="text-xs text-red-500/80">Permanently remove all your chat data and settings.</p>
                        </div>
                        <UserX className="w-5 h-5 text-red-400 group-hover:scale-110 transition-transform" />
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'appearance' && userSettings && (
                  <div className="space-y-10">
                    <div>
                      <h2 className="text-3xl font-extrabold tracking-tight mb-2 dark:text-white">Appearance</h2>
                      <p className="text-slate-500">Customize how MS AI looks and feels for you.</p>
                    </div>

                    <div className="space-y-8">
                       <SettingRow 
                        label="Interface Theme" 
                        desc="Switch between light and dark modes"
                        control={
                          <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                            <button 
                              onClick={() => handleUpdateNestedSetting('appearance', 'theme', 'light')}
                              className={cn("px-4 py-1.5 rounded-lg text-xs font-bold transition-all", userSettings?.appearance?.theme === 'light' ? "bg-white text-blue-600 shadow-sm" : "text-slate-400")}
                            >Light</button>
                            <button 
                              onClick={() => handleUpdateNestedSetting('appearance', 'theme', 'dark')}
                              className={cn("px-4 py-1.5 rounded-lg text-xs font-bold transition-all", userSettings?.appearance?.theme === 'dark' ? "bg-white dark:bg-slate-700 text-blue-400 shadow-sm" : "text-slate-400")}
                            >Dark</button>
                          </div>
                        }
                       />

                       <SettingRow 
                        label="Font Size" 
                        desc="Adjust readability across the platform"
                        control={
                          <select 
                            value={userSettings.appearance.fontSize}
                            onChange={(e) => handleUpdateNestedSetting('appearance', 'fontSize', e.target.value)}
                            className="bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/10 dark:text-slate-200"
                          >
                            <option value="small">Small</option>
                            <option value="medium">Medium</option>
                            <option value="large">Large</option>
                          </select>
                        }
                       />

                       <ToggleRow 
                         label="Compact Sidebar" 
                         desc="Hide labels for a minimal navigation experience"
                         enabled={userSettings.appearance.sidebarCompact}
                         onToggle={() => handleUpdateNestedSetting('appearance', 'sidebarCompact', !userSettings.appearance.sidebarCompact)}
                       />

                       <ToggleRow 
                         label="Motion & Animations" 
                         desc="Enable smooth transitions and visual flair"
                         enabled={userSettings.appearance.animationsEnabled}
                         onToggle={() => handleUpdateNestedSetting('appearance', 'animationsEnabled', !userSettings.appearance.animationsEnabled)}
                       />
                       
                       <SettingRow 
                        label="Chat Bubble Style" 
                        desc="Select your preferred message appearance"
                        control={
                          <div className="flex gap-2">
                            {['modern', 'classic', 'glass'].map((style) => (
                              <button
                                key={style}
                                onClick={() => handleUpdateNestedSetting('appearance', 'chatBubbleStyle', style)}
                                className={cn(
                                  "px-4 py-2 rounded-xl text-xs font-bold border transition-all capitalize",
                                  userSettings.appearance.chatBubbleStyle === style 
                                    ? "bg-blue-50 border-blue-200 text-blue-600" 
                                    : "border-slate-100 text-slate-500 hover:bg-slate-50"
                                )}
                              >{style}</button>
                            ))}
                          </div>
                        }
                       />
                    </div>
                  </div>
                )}

                {activeTab === 'chat' && userSettings && (
                  <div className="space-y-10">
                    <div>
                      <h2 className="text-3xl font-extrabold tracking-tight mb-2 dark:text-white">Chat Experience</h2>
                      <p className="text-slate-500">Fine-tune your messaging and AI interactions.</p>
                    </div>

                    <div className="space-y-6">
                       <ToggleRow 
                        label="Typing Animations" 
                        desc="Show when AI is formulating its response"
                        enabled={userSettings.chat.typingAnimation}
                        onToggle={() => handleUpdateNestedSetting('chat', 'typingAnimation', !userSettings.chat.typingAnimation)}
                       />
                       <ToggleRow 
                        label="Markdown Rendering" 
                        desc="Support rich text, lists, and bold formatting"
                        enabled={userSettings.chat.markdownRendering}
                        onToggle={() => handleUpdateNestedSetting('chat', 'markdownRendering', !userSettings.chat.markdownRendering)}
                       />
                       <ToggleRow 
                        label="Code Highlighting" 
                        desc="Beautiful syntax highlighting for programmers"
                        enabled={userSettings.chat.codeHighlighting}
                        onToggle={() => handleUpdateNestedSetting('chat', 'codeHighlighting', !userSettings.chat.codeHighlighting)}
                       />
                       <ToggleRow 
                        label="Message Sounds" 
                        desc="Play a soft tone when a message is received"
                        enabled={userSettings.chat.messageSound}
                        onToggle={() => handleUpdateNestedSetting('chat', 'messageSound', !userSettings.chat.messageSound)}
                       />

                       <div className="h-px bg-slate-50 dark:bg-slate-800" />

                       <div className="space-y-4">
                         <h4 className="text-sm font-bold text-slate-800 dark:text-white">Data Management</h4>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <ChatActionBtn icon={Clock} label="Auto-Delete History" desc="Delete chats older than 30 days" />
                           <ChatActionBtn 
                              icon={Download} 
                              label="Export Workspace" 
                              desc="Download all chat logs in TXT" 
                              onClick={() => toast.success('Prepairing export archive...')}
                           />
                           <button 
                            className="p-6 bg-rose-50 dark:bg-rose-950/20 rounded-[1.5rem] text-left border border-rose-100 dark:border-rose-900/30 hover:bg-rose-100 transition-all cursor-pointer group"
                            onClick={() => window.confirm('Clear all chat data?') && toast.success('Workspace cleared')}
                           >
                              <div className="w-10 h-10 bg-white dark:bg-rose-900/40 rounded-xl flex items-center justify-center text-rose-500 mb-4 group-hover:scale-110 transition-transform">
                                <Trash2 className="w-5 h-5" />
                              </div>
                              <p className="font-bold text-rose-600 text-sm">Clear All Chats</p>
                              <p className="text-[10px] text-rose-400 mt-1 uppercase font-bold tracking-widest">Permanent action</p>
                           </button>
                         </div>
                       </div>
                    </div>
                  </div>
                )}

                {activeTab === 'language' && userSettings && (
                  <div className="space-y-10 text-center py-10">
                    <div className="w-20 h-20 bg-orange-100 rounded-3xl flex items-center justify-center mx-auto mb-6 text-orange-600">
                      <Languages className="w-10 h-10" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-extrabold tracking-tight mb-2 dark:text-white">Language</h2>
                      <p className="text-slate-500">Choose your preferred UI language.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
                       <button 
                        onClick={() => handleUpdateNestedSetting('language', 'selected', 'en')}
                        className={cn(
                          "p-6 rounded-[2rem] border-2 transition-all cursor-pointer",
                          userSettings.language.selected === 'en' ? "border-blue-500 bg-blue-50 shadow-xl shadow-blue-200/50" : "border-slate-100 hover:border-slate-200"
                        )}
                       >
                          <p className="text-2xl font-bold dark:text-white">English</p>
                          <p className="text-slate-400 mt-1">Default</p>
                       </button>
                       <button 
                        onClick={() => handleUpdateNestedSetting('language', 'selected', 'si')}
                        className={cn(
                          "p-6 rounded-[2rem] border-2 transition-all cursor-pointer",
                          userSettings.language.selected === 'si' ? "border-blue-500 bg-blue-50 shadow-xl shadow-blue-200/50" : "border-slate-100 hover:border-slate-200"
                        )}
                       >
                          <p className="text-2xl font-bold dark:text-white">සිංහල</p>
                          <p className="text-slate-400 mt-1">Sinhala</p>
                       </button>
                    </div>
                  </div>
                )}

                {activeTab === 'ai' && userSettings && (
                  <div className="space-y-10">
                    <div>
                      <h2 className="text-3xl font-extrabold tracking-tight mb-2 dark:text-white">AI Engine Preferences</h2>
                      <p className="text-slate-500">Configure how the intelligence layer behaves.</p>
                    </div>

                    <div className="space-y-8">
                       <SettingRow 
                        label="Response Speed" 
                        desc="Optimize for latency or reasoning depth"
                        control={
                           <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                             {[
                               { id: 'fast', icon: Zap },
                               { id: 'balanced', icon: RefreshCw },
                               { id: 'thorough', icon: Layers }
                             ].map((item) => (
                               <button
                                 key={item.id}
                                 onClick={() => handleUpdateNestedSetting('ai', 'responseSpeed', item.id)}
                                 className={cn(
                                   "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all capitalize",
                                   userSettings.ai.responseSpeed === item.id ? "bg-white dark:bg-slate-700 text-blue-600 shadow-md" : "text-slate-400 hover:text-slate-600"
                                 )}
                               >
                                 <item.icon className="w-3.5 h-3.5" />
                                 {item.id}
                               </button>
                             ))}
                           </div>
                        }
                       />

                       <SettingRow 
                        label="AI Personality" 
                        desc="Set the tone for all AI conversations"
                        control={
                          <select 
                            value={userSettings.ai.personality}
                            onChange={(e) => handleUpdateNestedSetting('ai', 'personality', e.target.value)}
                            className="bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/10 dark:text-slate-200"
                          >
                            <option value="creative">Creative Mode</option>
                            <option value="balanced">Balanced Mode</option>
                            <option value="smart">Smart Intelligence</option>
                          </select>
                        }
                       />

                       <ToggleRow 
                         label="Conversation Memory" 
                         desc="Allows AI to remember previous context indefinitely"
                         enabled={userSettings.ai.memoryMode}
                         onToggle={() => handleUpdateNestedSetting('ai', 'memoryMode', !userSettings.ai.memoryMode)}
                       />

                       <div className="space-y-3">
                          <label className="text-sm font-bold text-slate-800 dark:text-white">Custom Greeting</label>
                          <textarea 
                            value={userSettings.ai.welcomeMessage}
                            onChange={(e) => handleUpdateNestedSetting('ai', 'welcomeMessage', e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border bg-transparent p-4 rounded-3xl text-sm outline-none focus:ring-4 focus:ring-blue-500/5 dark:text-slate-200 min-h-[100px] border-slate-100 dark:border-slate-800"
                            placeholder="Set a custom message for new chats..."
                          />
                       </div>
                    </div>
                  </div>
                )}

                {activeTab === 'storage' && (
                  <div className="space-y-10">
                    <div>
                      <h2 className="text-3xl font-extrabold tracking-tight mb-2 dark:text-white">Cloud Storage</h2>
                      <p className="text-slate-500">Monitor and optimize your data usage on our servers.</p>
                    </div>

                    <div className="p-10 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] text-center">
                       <div className="w-32 h-32 relative mx-auto mb-8">
                          <svg className="w-full h-full transform -rotate-90">
                            <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-slate-200 dark:text-slate-800" />
                            <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="10" fill="transparent" strokeDasharray="364.4" strokeDashoffset="300" className="text-blue-500" strokeLinecap="round" />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                             <span className="text-2xl font-black dark:text-white">18%</span>
                             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Used</span>
                          </div>
                       </div>
                       <p className="text-sm font-bold dark:text-slate-200">185 MB of 1 GB used</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <ChatActionBtn icon={Sparkles} label="Optimize Data" desc="Compress and archive old attachments" onClick={() => toast.success('Optimization complete')} />
                       <ChatActionBtn icon={RefreshCw} label="Sync Status" desc="Successfully synced with cloud" color="text-emerald-500" />
                    </div>
                  </div>
                )}

                {activeTab === 'security' && (
                  <div className="space-y-10">
                    <div>
                      <h2 className="text-3xl font-extrabold tracking-tight mb-2 dark:text-white">Security & Access</h2>
                      <p className="text-slate-500">Control your account access and verification levels.</p>
                    </div>

                    <div className="space-y-6">
                       <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
                                <Monitor className="w-6 h-6" />
                             </div>
                             <div>
                                <p className="font-bold dark:text-white">Current Session</p>
                                <p className="text-xs text-slate-400">Windows • Chrome • 192.168.1.1</p>
                             </div>
                          </div>
                          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase rounded-full">Active</span>
                       </div>

                       <SectionItem title="Two-Factor Auth" value="Enabled (Authenticator app)" onEdit={() => toast.error('Security settings restricted in demo')} />
                       <SectionItem title="Last Login" value={user?.metadata.lastSignInTime || 'Just now'} hideEdit />
                    </div>
                  </div>
                )}

                {activeTab === 'notification' && userSettings && (
                  <div className="space-y-10">
                    <div>
                      <h2 className="text-3xl font-extrabold tracking-tight mb-2 dark:text-white">Notifications</h2>
                      <p className="text-slate-500">Stay updated about your account and activities.</p>
                    </div>

                    <div className="space-y-6">
                       <ToggleRow 
                         label="Push Notifications" 
                         desc="Receive alerts on browser even when tab is closed"
                         enabled={userSettings.notification.enabled}
                         onToggle={() => handleUpdateNestedSetting('notification', 'enabled', !userSettings.notification.enabled)}
                       />
                       <ToggleRow 
                         label="Sound Effects" 
                         desc="Enable alert sounds for system notifications"
                         enabled={userSettings.notification.soundEffects}
                         onToggle={() => handleUpdateNestedSetting('notification', 'soundEffects', !userSettings.notification.soundEffects)}
                       />
                       <ToggleRow 
                         label="Desktop Alerts" 
                         desc="Show floating toast notifications on your desktop"
                         enabled={userSettings.notification.desktopAlerts}
                         onToggle={() => handleUpdateNestedSetting('notification', 'desktopAlerts', !userSettings.notification.desktopAlerts)}
                       />
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}

function SectionItem({ title, value, onEdit, isEditing, editComponent, hideEdit }: { title: string, value: string, onEdit?: () => void, isEditing?: boolean, editComponent?: React.ReactNode, hideEdit?: boolean }) {
  return (
    <div className="flex items-center justify-between py-6 border-b border-slate-50 dark:border-slate-800 last:border-0">
      <div className="flex-1 mr-4">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
        {isEditing ? (
          editComponent
        ) : (
          <p className="font-bold text-slate-800 dark:text-slate-100">{value}</p>
        )}
      </div>
      {!hideEdit && !isEditing && (
        <button 
          onClick={onEdit}
          className="px-4 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
        >Edit</button>
      )}
    </div>
  );
}

function SettingRow({ label, desc, control }: { label: string, desc: string, control: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
      <div className="max-w-md">
        <p className="font-bold text-slate-800 dark:text-white">{label}</p>
        <p className="text-xs text-slate-500 leading-relaxed mt-0.5">{desc}</p>
      </div>
      {control}
    </div>
  );
}

function ToggleRow({ label, desc, enabled, onToggle }: { label: string, desc: string, enabled: boolean, onToggle: () => void }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div className="max-w-md">
        <p className="font-bold text-slate-800 dark:text-white">{label}</p>
        <p className="text-xs text-slate-500 leading-relaxed mt-0.5">{desc}</p>
      </div>
      <button 
        onClick={onToggle}
        className={cn(
          "w-12 h-6 rounded-full relative transition-all duration-500 ease-in-out cursor-pointer shadow-inner",
          enabled ? "bg-blue-600 ring-2 ring-blue-500/20" : "bg-slate-300 ring-2 ring-slate-100 dark:bg-slate-800"
        )}
      >
        <motion.div 
          animate={{ x: enabled ? 26 : 4 }}
          className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg"
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </button>
    </div>
  );
}

function ChatActionBtn({ icon: Icon, label, desc, onClick, color }: { icon: any, label: string, desc: string, onClick?: () => void, color?: string }) {
  return (
    <button 
      onClick={onClick}
      className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-[1.5rem] text-left border border-slate-100 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none transition-all cursor-pointer group"
    >
      <div className={cn(
        "w-10 h-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform",
        color || "text-blue-500"
      )}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="font-bold text-slate-800 dark:text-white text-sm">{label}</p>
      <p className="text-[10px] text-slate-400 mt-1 leading-tight">{desc}</p>
    </button>
  );
}
