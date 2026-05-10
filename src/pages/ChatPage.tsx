import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Send, 
  Trash2, 
  User as UserIcon,
  Bot,
  Globe,
  Brain,
  Copy,
  Check,
  RefreshCw,
  MoreVertical,
  Paperclip,
  Mic,
  Image as ImageIcon,
  Download,
  FileText,
  ChevronDown,
  Pin,
  PinOff,
  Edit3,
  Sun,
  Moon as MoonIcon,
  Database,
  Mail,
  Cpu
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp, 
  doc, 
  deleteDoc,
  updateDoc,
  getDocs
} from 'firebase/firestore';
import { getChatResponse } from '../lib/gemini';
import ReactMarkdown from 'react-markdown';
import { cn } from '../lib/utils';

const TRANSLATIONS = {
  en: {
    newChat: 'New Chat',
    search: 'Search conversations...',
    pinned: 'Pinned',
    recent: 'Recent',
    logOut: 'Log Out',
    howHelp: 'How can I help you today?',
    typing: 'MS AI is thinking...',
    placeholder: 'Message MS AI...',
    settings: 'Settings',
    profile: 'Profile',
    clearHistory: 'Clear History',
    downloadTxt: 'Download as TXT',
    downloadJson: 'Download as JSON',
    exportPdf: 'Export as PDF',
  },
  si: {
    newChat: 'නව පිළිසඳරක්',
    search: 'සොයන්න...',
    pinned: 'ප්‍රියතම',
    recent: 'මෑතකදී',
    logOut: 'පිටවෙන්න',
    howHelp: 'අද මට ඔබට උදවු කළ හැක්කේ කෙසේද?',
    typing: 'MS AI සිතමින් සිටී...',
    placeholder: 'MS AI වෙත පණිවිඩයක් එවන්න...',
    settings: 'සැකසුම්',
    profile: 'ගිණුම',
    clearHistory: 'ඉතිහාසය මකන්න',
    downloadTxt: 'TXT ලෙස බාගන්න',
    downloadJson: 'JSON ලෙස බාගන්න',
    exportPdf: 'PDF ලෙස අපනයනය කරන්න',
  }
};

export default function ChatPage() {
  const { chatId } = useParams();
  const { user, logout, userSettings } = useAuth();
  const navigate = useNavigate();
  
  const lang = userSettings?.language?.selected || 'en';
  const t = TRANSLATIONS[lang as keyof typeof TRANSLATIONS];

  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 1024);
  const [chats, setChats] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      return (saved as 'light' | 'dark') || 'light';
    }
    return 'light';
  });

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  useEffect(() => {
    // Initial sync
    const saved = localStorage.getItem('theme') || 'light';
    if (saved === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);
  const [selectedImage, setSelectedImage] = useState<{ data: string, mimeType: string } | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [useDeepThink, setUseDeepThink] = useState(false);
  const [useSearch, setUseSearch] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Load chats for sidebar
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'chats'),
      where('userId', '==', user.uid),
      orderBy('updatedAt', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      setChats(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'chats');
    });
  }, [user]);

  // Load messages for current chat
  useEffect(() => {
    if (!chatId) {
      setMessages([]);
      return;
    }
    const q = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('timestamp', 'asc')
    );
    return onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `chats/${chatId}/messages`);
    });
  }, [chatId]);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Handle window resize for sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar on mobile when chat changes
  useEffect(() => {
    if (window.innerWidth <= 1024) {
      setSidebarOpen(false);
    }
  }, [chatId]);

  const createNewChat = async () => {
    if (!user) return;
    try {
      const docRef = await addDoc(collection(db, 'chats'), {
        userId: user.uid,
        title: 'New Chat',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      navigate(`/chat/${docRef.id}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'chats');
    }
  };

  const deleteChat = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this conversation? This will permanently remove all messages.')) {
      try {
        // Clean up messages first (optional but better for storage and rules consistency)
        const messagesRef = collection(db, 'chats', id, 'messages');
        const snapshot = await getDocs(messagesRef);
        const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);

        // Then delete the chat doc
        await deleteDoc(doc(db, 'chats', id));
        
        if (chatId === id) {
          navigate('/chat');
        }
      } catch (error) {
        console.error('Error deleting chat:', error);
        handleFirestoreError(error, OperationType.DELETE, `chats/${id}`);
      }
    }
  };

  const togglePin = async (id: string, e: React.MouseEvent, isPinned: boolean) => {
    e.stopPropagation();
    try {
      await updateDoc(doc(db, 'chats', id), {
        isPinned: !isPinned,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `chats/${id}`);
    }
  };

  const startEditingTitle = (id: string, e: React.MouseEvent, currentTitle: string) => {
    e.stopPropagation();
    setEditingChatId(id);
    setEditTitle(currentTitle);
  };

  const saveNewTitle = async (id: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim()) {
      setEditingChatId(null);
      return;
    }
    try {
      await updateDoc(doc(db, 'chats', id), {
        title: editTitle.trim(),
        updatedAt: serverTimestamp()
      });
      setEditingChatId(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `chats/${id}`);
    }
  };

  const clearChat = async () => {
    if (!chatId || !user) return;
    if (window.confirm('Are you sure you want to clear all messages in this conversation? This cannot be undone.')) {
      try {
        const messagesRef = collection(db, 'chats', chatId, 'messages');
        const snapshot = await getDocs(messagesRef);
        
        if (snapshot.empty) {
          setShowMoreMenu(false);
          return;
        }

        const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
        
        // Update chat updatedAt
        await updateDoc(doc(db, 'chats', chatId), {
          updatedAt: serverTimestamp()
        });
        
        setShowMoreMenu(false);
      } catch (error) {
        console.error('Error clearing chat:', error);
        handleFirestoreError(error, OperationType.DELETE, `chats/${chatId}/messages`);
      }
    }
  };

  const copyMessage = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const regenerateMessage = async (index: number) => {
    if (index === 0) return;
    
    // Find the last user message before this model message
    let lastUserMessage = '';
    for (let i = index - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        lastUserMessage = messages[i].content;
        break;
      }
    }

    if (!lastUserMessage) return;
    
    // If it's the last message, we can just delete it and re-send
    if (index === messages.length - 1) {
      try {
        await deleteDoc(doc(db, 'chats', chatId!, 'messages', messages[index].id));
        handleSendMessage(undefined, lastUserMessage);
      } catch (error) {
        console.error(error);
      }
    } else {
      // Logic for middle-of-chat regeneration: just send the prompt again
      handleSendMessage(undefined, lastUserMessage);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent, overrideInput?: string) => {
    e?.preventDefault();
    const messageToSend = overrideInput || input;
    if (!messageToSend.trim() || !user) return;
    
    let currentChatId = chatId;
    
    try {
      // Create chat if none exists
      if (!currentChatId) {
        const chatDoc = await addDoc(collection(db, 'chats'), {
          userId: user.uid,
          title: messageToSend.slice(0, 30) + '...',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        currentChatId = chatDoc.id;
        navigate(`/chat/${currentChatId}`);
      }

      const userMessage = messageToSend;
      if (!overrideInput) setInput('');
      const currentImage = selectedImage;
      const currentPreview = imagePreview;
      const currentFile = selectedFile;
      setSelectedImage(null);
      setImagePreview(null);
      setSelectedFile(null);
      
      // Add user message to Firestore
      await addDoc(collection(db, 'chats', currentChatId, 'messages'), {
        role: 'user',
        content: userMessage,
        image: currentPreview,
        fileName: currentFile?.name || null,
        timestamp: serverTimestamp()
      });

      // Update chat title if it's the first message
      if (messages.length === 0) {
        await updateDoc(doc(db, 'chats', currentChatId), {
          title: userMessage.slice(0, 30) + (userMessage.length > 30 ? '...' : ''),
          updatedAt: serverTimestamp()
        });
      }

      setIsTyping(true);
      try {
        const history = messages.map(m => ({ role: m.role, content: m.content }));
        const aiResponse = await getChatResponse(userMessage, history, currentImage || undefined, {
          useSearch,
          useDeepThink
        });
        
        await addDoc(collection(db, 'chats', currentChatId, 'messages'), {
          role: 'model',
          content: aiResponse,
          timestamp: serverTimestamp()
        });
        
        await updateDoc(doc(db, 'chats', currentChatId), {
          updatedAt: serverTimestamp()
        });
      } catch (error) {
        console.error(error);
      } finally {
        setIsTyping(false);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `chats/${currentChatId}`);
    }
  };

  const downloadChat = (format: 'txt' | 'json') => {
    if (messages.length === 0) return;
    
    let content = '';
    let fileName = `chat-${chatId || 'new'}`;
    let type = '';

    if (format === 'json') {
      content = JSON.stringify(messages, null, 2);
      fileName += '.json';
      type = 'application/json';
    } else {
      content = messages.map(m => `[${m.role.toUpperCase()}] ${m.content}`).join('\n\n');
      fileName += '.txt';
      type = 'text/plain';
    }

    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
    setShowMoreMenu(false);
  };

  const exportAsPDF = () => {
    alert("Export to PDF is a premium enterprise feature. TXT and JSON exports are available for your current plan.");
    setShowMoreMenu(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('File size exceeds 10MB limit.');
        return;
      }
      setSelectedFile(file);
      // Clear image if file is selected
      setSelectedImage(null);
      setImagePreview(null);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size exceeds 5MB limit.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        const base64Data = base64.split(',')[1];
        setSelectedImage({
          data: base64Data,
          mimeType: file.type
        });
        setImagePreview(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const startVoiceInput = () => {
    // Check for SpeechRecognition API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => prev + ' ' + transcript);
      setIsRecording(false);
    };

    recognition.onerror = (event: any) => {
      setIsRecording(false);
      console.error('Speech recognition error:', event.error);
      
      switch (event.error) {
        case 'not-allowed':
          alert('Microphone access denied. Please enable microphone permissions in your browser settings.');
          break;
        case 'no-speech':
          alert('No speech was detected. Please try again.');
          break;
        case 'network':
          alert('Network error during speech recognition.');
          break;
        case 'aborted':
          // User or system aborted, usually don't need an alert
          break;
        default:
          alert(`Speech recognition error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
  };

  const filteredChats = chats.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedChats = filteredChats.filter(c => c.isPinned);
  const recentChats = filteredChats.filter(c => !c.isPinned);

  const ChatItem = ({ chat }: { chat: any }) => (
    <div
      key={chat.id}
      onClick={() => navigate(`/chat/${chat.id}`)}
      className={cn(
        "group flex items-center justify-between px-3 py-3 rounded-xl cursor-pointer transition-all",
        chatId === chat.id 
          ? "bg-blue-50 text-blue-700" 
          : "hover:bg-slate-100 text-slate-600 hover:text-slate-900"
      )}
    >
      {editingChatId === chat.id ? (
        <form 
          onSubmit={(e) => saveNewTitle(chat.id, e)}
          className="flex-1 mr-2"
          onClick={(e) => e.stopPropagation()}
        >
          <input 
            type="text"
            autoFocus
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={(e) => saveNewTitle(chat.id, e)}
            className="w-full bg-white border border-blue-300 rounded px-2 py-0.5 text-sm outline-none focus:ring-2 focus:ring-blue-100"
          />
        </form>
      ) : (
        <div className="flex items-center gap-2 flex-1 truncate">
          {chat.isPinned && <Pin className="w-3 h-3 text-blue-500 flex-shrink-0" />}
          <span className="text-sm font-medium truncate">{chat.title}</span>
        </div>
      )}
      
      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-all">
        <button 
          onClick={(e) => togglePin(chat.id, e, !!chat.isPinned)}
          className="p-1.5 hover:bg-slate-200 rounded-lg transition-all text-slate-400 hover:text-blue-600"
          title={chat.isPinned ? "Unpin chat" : "Pin chat"}
        >
          {chat.isPinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
        </button>
        <button 
          onClick={(e) => startEditingTitle(chat.id, e, chat.title)}
          className="p-1.5 hover:bg-slate-200 rounded-lg transition-all text-slate-400 hover:text-blue-600"
          title="Rename chat"
        >
          <Edit3 className="w-3.5 h-3.5" />
        </button>
        <button 
          onClick={(e) => deleteChat(chat.id, e)}
          className="p-1.5 hover:bg-slate-200 rounded-lg transition-all text-slate-400 hover:text-red-500"
          title="Delete chat"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans overflow-hidden relative">
      {/* Sidebar backdrop for mobile */}
      <AnimatePresence>
        {sidebarOpen && window.innerWidth <= 1024 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: window.innerWidth <= 1024 ? -320 : 0, opacity: window.innerWidth <= 1024 ? 1 : 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={cn(
              "fixed inset-y-0 left-0 lg:relative flex-shrink-0 bg-slate-50 dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 flex flex-col z-50 lg:z-30 transition-all duration-500",
              userSettings?.appearance?.sidebarCompact ? "w-20" : "w-80"
            )}
          >
            <div className={cn("p-4 flex items-center justify-between", userSettings?.appearance?.sidebarCompact && "justify-center px-0")}>
              <div className="flex items-center gap-2">
                <img 
                  src="https://i.ibb.co/G40rPwcN/Chat-GPT-Image-May-9-2026-03-08-08-PM.png" 
                  className="w-8 h-8 rounded-lg object-cover shadow-lg shadow-blue-500/20" 
                  alt="MS AI Logo"
                  referrerPolicy="no-referrer"
                />
                {!userSettings?.appearance?.sidebarCompact && (
                  <span className="font-bold text-lg tracking-tight dark:text-white bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">MS AI</span>
                )}
              </div>
              {!userSettings?.appearance?.sidebarCompact && (
                <button 
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl lg:hidden text-slate-600 dark:text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className={cn("px-4 mb-4", userSettings?.appearance?.sidebarCompact && "px-2")}>
              <button 
                onClick={createNewChat}
                className={cn(
                  "flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 rounded-2xl text-sm font-semibold transition-all shadow-sm hover:shadow-blue-100 dark:hover:shadow-blue-900/20 cursor-pointer text-slate-700 dark:text-slate-200",
                  userSettings?.appearance?.sidebarCompact ? "w-12 h-12 justify-center mx-auto p-0" : "w-full px-4 py-3"
                )}
                title={t.newChat}
              >
                <Plus className="w-4 h-4 text-blue-600" />
                {!userSettings?.appearance.sidebarCompact && t.newChat}
              </button>
            </div>

            {!userSettings?.appearance?.sidebarCompact && (
              <div className="px-4 mb-4 relative">
                <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  placeholder={t.search}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-100/50 dark:bg-slate-800/50 border-none rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all dark:text-slate-200"
                />
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-2 space-y-4 custom-scrollbar">
              {pinnedChats.length > 0 && (
                <div className="space-y-1">
                  {!userSettings?.appearance?.sidebarCompact && <p className="px-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">{t.pinned}</p>}
                  {pinnedChats.map(chat => <ChatItem key={chat.id} chat={chat} />)}
                </div>
              )}
              
              <div className="space-y-1">
                {pinnedChats.length > 0 && !userSettings?.appearance?.sidebarCompact && (
                  <p className="px-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">{t.recent}</p>
                )}
                {recentChats.map(chat => <ChatItem key={chat.id} chat={chat} />)}
              </div>
            </div>

            <div className={cn("p-4 border-t border-slate-100 dark:border-slate-800 space-y-2", userSettings?.appearance?.sidebarCompact && "p-2")}>
              <div 
                onClick={() => navigate('/settings')}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 cursor-pointer hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-md transition-all shadow-sm group",
                  userSettings?.appearance?.sidebarCompact && "px-0 justify-center h-12 w-12 mx-auto"
                )}
                title={t.settings}
              >
                <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-900 flex items-center justify-center group-hover:rotate-45 transition-transform">
                  <Settings className="w-4 h-4 text-slate-500" />
                </div>
                {!userSettings?.appearance?.sidebarCompact && (
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate text-slate-800 dark:text-slate-100">{t.settings}</p>
                    <p className="text-[10px] text-slate-400 truncate tracking-tight">Personalize experience</p>
                  </div>
                )}
              </div>

              <button 
                onClick={() => logout()}
                className={cn(
                  "flex items-center gap-3 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-2xl transition-all cursor-pointer group",
                  userSettings?.appearance?.sidebarCompact ? "h-12 w-12 justify-center mx-auto" : "w-full px-3 py-2"
                )}
                title={t.logOut}
              >
                <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-red-100 dark:group-hover:bg-red-900/20 flex items-center justify-center transition-colors">
                  <LogOut className="w-4 h-4 transition-transform group-hover:scale-110" />
                </div>
                {!userSettings?.appearance?.sidebarCompact && <span className="text-xs font-bold">{t.logOut}</span>}
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Top Navbar */}
        <header className="h-20 flex items-center justify-between px-6 border-b border-slate-50 dark:border-slate-800 flex-shrink-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all cursor-pointer group"
            >
              <Menu className={cn("w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:scale-110 transition-transform", sidebarOpen && "rotate-180")} />
            </button>
            <div className="h-8 w-px bg-slate-100 dark:bg-slate-800" />
            <div className="max-w-[200px] sm:max-w-none">
              <h2 className="font-bold text-slate-800 dark:text-white truncate tracking-tight">
                {chats.find(c => c.id === chatId)?.title || t.newChat}
              </h2>
              {chatId && <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest leading-none">Conversation Active</p>}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {chatId && (
              <div className="relative">
                <button 
                  onClick={() => setShowMoreMenu(!showMoreMenu)}
                  className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all cursor-pointer text-slate-400 hover:text-slate-600"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
                
                <AnimatePresence>
                  {showMoreMenu && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className="absolute right-0 mt-3 w-56 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl shadow-2xl z-50 overflow-hidden"
                    >
                      <div className="p-2 space-y-1">
                        <button 
                          onClick={() => downloadChat('txt')}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-2xl transition-all font-semibold"
                        >
                          <Download className="w-4 h-4 text-blue-500" />
                          {t.downloadTxt}
                        </button>
                        <button 
                          onClick={() => downloadChat('json')}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-2xl transition-all font-semibold"
                        >
                          <Database className="w-4 h-4 text-purple-500" />
                          {t.downloadJson}
                        </button>
                        <button 
                          onClick={exportAsPDF}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-2xl transition-all font-semibold"
                        >
                          <FileText className="w-4 h-4 text-emerald-500" />
                          {t.exportPdf}
                        </button>
                        <div className="h-px bg-slate-100 dark:bg-slate-700 my-1 mx-2" />
                        <button 
                          onClick={clearChat}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all font-bold"
                        >
                          <Trash2 className="w-4 h-4" />
                          {t.clearHistory}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </header>

        {/* Messages */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 py-8 custom-scrollbar bg-[#FDFDFD] dark:bg-slate-950 transition-colors"
        >
          <div className="max-w-3xl mx-auto space-y-10">
            {messages.length === 0 && (
              <div className="text-center py-20 flex flex-col items-center">
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-24 h-24 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl shadow-blue-200/50 dark:shadow-none flex items-center justify-center mb-8 overflow-hidden border border-slate-100 dark:border-slate-800"
                >
                  <img 
                    src="https://i.ibb.co/G40rPwcN/Chat-GPT-Image-May-9-2026-03-08-08-PM.png" 
                    className="w-16 h-16 object-cover animate-pulse" 
                    alt="MS AI"
                    referrerPolicy="no-referrer"
                  />
                </motion.div>
                <h3 className="text-4xl font-black mb-4 text-slate-800 dark:text-white tracking-tight leading-tight">
                  {userSettings?.ai?.welcomeMessage || t.howHelp}
                </h3>
                <p className="text-slate-400 font-medium mb-12 max-w-sm mx-auto">Ask me anything about design, code, or just have a creative talk.</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl w-full">
                  {[
                    { label: 'Write an email', desc: 'Professional or casual', icon: Mail, color: 'text-blue-500' },
                    { label: 'Code a website', desc: 'React, Tailwind & more', icon: Cpu, color: 'text-purple-500' },
                    { label: 'Plan a trip', desc: 'Custom itineraries', icon: Globe, color: 'text-emerald-500' },
                    { label: 'Explain AI', desc: 'Simple terms, deep insights', icon: Brain, color: 'text-rose-500' }
                  ].map((item, idx) => (
                    <motion.button 
                      key={item.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      onClick={() => handleSendMessage(undefined, item.label)}
                      className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 rounded-[2rem] text-left transition-all shadow-xl shadow-slate-200/20 dark:shadow-none hover:shadow-blue-100/50 hover:-translate-y-1 group active:scale-95 cursor-pointer relative overflow-hidden"
                    >
                      <div className="relative z-10">
                        <div className={cn("w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl mb-4 flex items-center justify-center transition-transform group-hover:scale-110", item.color)}>
                          <item.icon className="w-5 h-5" />
                        </div>
                        <div className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{item.label}</div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 uppercase font-bold tracking-widest">{item.desc}</div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message, i) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={message.id || i}
                className={cn(
                  "flex gap-4 group",
                  message.role === 'user' ? "flex-row-reverse" : "flex-row"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md overflow-hidden transition-transform duration-300 group-hover:scale-110",
                  message.role === 'user' ? "bg-slate-900 dark:bg-slate-800 ring-2 ring-slate-100 dark:ring-slate-800" : "bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 ring-2 ring-slate-50 dark:ring-slate-800/20"
                )}>
                  {message.role === 'user' ? (
                    user?.photoURL ? (
                      <img src={user.photoURL} className="w-full h-full object-cover" alt="user" />
                    ) : (
                      <UserIcon className="text-white w-5 h-5" />
                    )
                  ) : (
                    <img 
                      src="https://i.ibb.co/G40rPwcN/Chat-GPT-Image-May-9-2026-03-08-08-PM.png" 
                      className="w-full h-full object-cover" 
                      alt="MS AI"
                      referrerPolicy="no-referrer"
                    />
                  )}
                </div>
                <div className={cn(
                  "flex flex-col max-w-[88%]",
                  message.role === 'user' ? "items-end" : "items-start"
                )}>
                <div className={cn(
                "px-6 py-5 rounded-[2.2rem] text-sm leading-relaxed overflow-hidden transition-all duration-300 group-hover:shadow-2xl",
                message.role === 'user' 
                  ? "bg-gradient-to-br from-slate-800 to-slate-950 dark:from-blue-600 dark:to-blue-800 text-white rounded-tr-md shadow-xl shadow-slate-200/50 dark:shadow-none" 
                  : cn(
                      "bg-white dark:bg-slate-900 border border-slate-100/80 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-md shadow-2xl shadow-slate-200/40 dark:shadow-none backdrop-blur-sm",
                      userSettings?.appearance?.chatBubbleStyle === 'glass' && "glass"
                    )
              )}>
                {message.image && (
                  <img 
                    src={message.image} 
                    alt="Uploaded content" 
                    className="max-w-full rounded-2xl mb-4 border border-white/10 shadow-md"
                  />
                )}
                {message.fileName && (
                  <div className="flex items-center gap-3 mb-4 p-3 bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{message.fileName}</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">Attached file</span>
                    </div>
                  </div>
                )}
                <div className={cn(
                  "prose prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-slate-900 prose-pre:text-blue-100",
                  message.role === 'user' ? "prose-invert prose-slate" : "prose-slate dark:prose-invert"
                )}>
                  {userSettings?.chat?.markdownRendering ? (
                    <ReactMarkdown>
                      {message.content}
                    </ReactMarkdown>
                  ) : (
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  )}
                </div>
              </div>
                  <div className="flex items-center gap-4 mt-2 px-1">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-slate-300">
                      {message.timestamp?.toDate ? message.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                    </span>
                    {message.role === 'model' && (
                      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-2 transition-all">
                        <button 
                          onClick={() => copyMessage(message.content, message.id)}
                          className="p-1.5 hover:bg-white dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-blue-600 transition-all cursor-pointer border border-transparent hover:border-slate-100 dark:hover:border-slate-700 hover:shadow-sm"
                          title="Copy message"
                        >
                          {copiedId === message.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        <button 
                          onClick={() => regenerateMessage(i)}
                          className="p-1.5 hover:bg-white dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-blue-600 transition-all cursor-pointer border border-transparent hover:border-slate-100 dark:hover:border-slate-700 hover:shadow-sm"
                          title="Regenerate"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}

            {(isTyping && userSettings?.chat?.typingAnimation) && (
                <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center flex-shrink-0 animate-pulse overflow-hidden ring-2 ring-slate-50 dark:ring-slate-900/50">
                        <img 
                          src="https://i.ibb.co/G40rPwcN/Chat-GPT-Image-May-9-2026-03-08-08-PM.png" 
                          className="w-full h-full object-cover" 
                          alt="MS AI"
                          referrerPolicy="no-referrer"
                        />
                    </div>
                    <div className="bg-white dark:bg-slate-900 border border-slate-100/80 dark:border-slate-800 px-6 py-5 rounded-[2.2rem] rounded-tl-md shadow-2xl shadow-slate-200/40 dark:shadow-none backdrop-blur-sm">
                        <div className="flex gap-1.5 pt-1">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-duration:1s]" />
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-duration:1s] [animation-delay:0.2s]" />
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-duration:1s] [animation-delay:0.4s]" />
                        </div>
                    </div>
                </div>
            )}
          </div>
        </div>

        {/* Input area */}
        <div className="p-4 sm:p-6 bg-gradient-to-t from-white dark:from-slate-950 via-white dark:via-slate-950 to-transparent pt-10">
          <div className="max-w-3xl mx-auto relative group">
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleFileUpload}
            />
            <input 
              type="file" 
              accept="image/*" 
              ref={imageInputRef} 
              className="hidden" 
              onChange={handleImageUpload}
            />
            <div className="absolute inset-0 bg-blue-400/5 dark:bg-blue-400/0 blur-3xl -z-10 group-focus-within:bg-blue-400/10 transition-all" />
            
            {imagePreview && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative inline-block mb-4 p-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-lg z-10"
              >
                <img src={imagePreview} className="h-20 w-20 object-cover rounded-xl" alt="Preview" />
                <button 
                  onClick={() => { setSelectedImage(null); setImagePreview(null); }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-red-600 transition-colors pointer-events-auto cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.div>
            )}

            {selectedFile && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative inline-flex items-center gap-3 mb-4 p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-lg z-10 pr-10"
              >
                <div className="w-10 h-10 bg-blue-50 dark:bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate max-w-[150px]">{selectedFile.name}</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">{(selectedFile.size / 1024).toFixed(1)} KB</span>
                </div>
                <button 
                  onClick={() => setSelectedFile(null)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-red-600 transition-colors pointer-events-auto cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.div>
            )}

            <div className="flex items-center gap-2 mb-4 px-1">
              <button
                onClick={() => setUseDeepThink(!useDeepThink)}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-2 rounded-2xl text-[10px] sm:text-xs font-bold transition-all border cursor-pointer relative overflow-hidden group",
                  useDeepThink 
                    ? "bg-blue-50 dark:bg-blue-500/10 border-blue-400 dark:border-blue-500 text-blue-600 dark:text-blue-400 shadow-sm" 
                    : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:border-blue-200 dark:hover:border-blue-700 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50/20 shadow-sm"
                )}
              >
                <Brain className={cn("w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:scale-110", useDeepThink ? "text-blue-600 dark:text-blue-400" : "text-slate-400 group-hover:text-blue-500")} />
                <span>DeepThink</span>
              </button>
              
              <button
                onClick={() => setUseSearch(!useSearch)}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-2 rounded-2xl text-[10px] sm:text-xs font-bold transition-all border cursor-pointer relative overflow-hidden group",
                  useSearch 
                    ? "bg-blue-50 dark:bg-blue-500/10 border-blue-400 dark:border-blue-500 text-blue-600 dark:text-blue-400 shadow-sm" 
                    : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:border-blue-200 dark:hover:border-blue-700 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50/20 shadow-sm"
                )}
              >
                <Globe className={cn("w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:scale-110", useSearch ? "text-blue-600 dark:text-blue-400" : "text-slate-400 group-hover:text-blue-500")} />
                <span>Search</span>
              </button>
            </div>

            <form 
              onSubmit={handleSendMessage}
              className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-500/5 dark:focus-within:ring-blue-500/10 rounded-3xl p-2.5 transition-all shadow-xl shadow-slate-200/50 dark:shadow-none"
            >
              <div className="flex items-end gap-2 px-2">
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all cursor-pointer"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Ask MS AI anything..."
                  rows={1}
                  className="w-full bg-transparent border-none focus:ring-0 outline-none text-sm py-3 px-2 max-h-48 resize-none overflow-y-auto text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
                />
                <div className="flex gap-1">
                    <button 
                      type="button" 
                      onClick={startVoiceInput}
                      className={cn(
                        "hidden sm:flex p-2.5 rounded-2xl transition-all cursor-pointer",
                        isRecording ? "bg-red-50 dark:bg-red-500/10 text-red-500 animate-pulse" : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
                      )}
                    >
                      <Mic className="w-5 h-5" />
                    </button>
                    <button 
                      type="button" 
                      onClick={() => imageInputRef.current?.click()}
                      className="hidden sm:flex p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all cursor-pointer"
                    >
                      <ImageIcon className="w-5 h-5" />
                    </button>
                    <button 
                      type="submit"
                      disabled={!input.trim() || isTyping}
                      className="p-2.5 bg-blue-600 disabled:bg-slate-100 dark:disabled:bg-slate-800 text-white disabled:text-slate-300 dark:disabled:text-slate-600 rounded-2xl hover:bg-blue-700 transition-all flex items-center justify-center cursor-pointer shadow-lg shadow-blue-200 dark:shadow-none"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                </div>
              </div>
            </form>
            <p className="text-[10px] text-center text-slate-400 mt-3 font-medium uppercase tracking-widest">
                AI can make mistakes. Check important info.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
