import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, User, Mail, Calendar, Camera, Edit2, Loader2, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user && !isEditing) {
      setName(user.displayName || '');
      setPhotoURL(user.photoURL || '');
    }
  }, [user, isEditing]);

  const handleUpdate = async () => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      await updateProfile(user, { 
        displayName: name,
        photoURL: photoURL
      });
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: name,
        photoURL: photoURL
      });
      setIsEditing(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100">
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-100 z-50">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center gap-4">
          <button 
            onClick={() => navigate('/chat')}
            className="p-2 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <h1 className="font-bold text-lg">Your Profile</h1>
          <div className="ml-auto">
            <button 
              onClick={async () => {
                await logout();
                navigate('/login');
              }}
              className="flex items-center gap-2 text-slate-500 hover:text-red-600 font-bold text-sm transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Log Out
            </button>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-12 px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-xl mx-auto"
        >
          <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200 border border-slate-100 overflow-hidden">
            <div className="h-32 bg-blue-600 relative overflow-hidden">
               <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-50" />
               <div className="absolute bottom-[-30px] left-[-30px] w-48 h-48 bg-blue-400 rounded-full blur-3xl opacity-50" />
            </div>
            
            <div className="px-8 pb-8">
              <div className="relative -mt-16 mb-6 flex justify-center sm:justify-start">
                <div className="relative z-10">
                  {user?.photoURL ? (
                    <img src={isEditing ? photoURL : user.photoURL} className="w-32 h-32 rounded-[2rem] border-4 border-white shadow-xl object-cover" alt="profile" />
                  ) : (
                    <div className="w-32 h-32 rounded-[2rem] bg-slate-100 border-4 border-white shadow-xl flex items-center justify-center">
                      <User className="w-12 h-12 text-slate-300" />
                    </div>
                  )}
                  {isEditing && (
                    <div className="absolute inset-0 bg-black/20 rounded-[2rem] flex items-center justify-center pointer-events-none">
                      <Camera className="w-8 h-8 text-white opacity-80" />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
                <div className="flex-1">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Display Name</label>
                        <input 
                          type="text" 
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-lg font-bold outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Photo URL</label>
                        <input 
                          type="text" 
                          value={photoURL}
                          onChange={(e) => setPhotoURL(e.target.value)}
                          placeholder="https://example.com/photo.jpg"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <h2 className="text-3xl font-bold tracking-tight">{user?.displayName || 'User'}</h2>
                      <p className="text-slate-500 font-medium">{user?.email}</p>
                    </>
                  )}
                </div>
                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <button 
                        onClick={handleUpdate}
                        disabled={isSubmitting}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-bold transition-all cursor-pointer shadow-lg shadow-blue-200"
                      >
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
                      </button>
                      <button 
                        onClick={() => { setIsEditing(false); setName(user?.displayName || ''); setPhotoURL(user?.photoURL || ''); }}
                        disabled={isSubmitting}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-6 py-2.5 rounded-xl font-bold transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 bg-slate-900 border border-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl font-bold transition-all cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit Profile
                    </button>
                  )}
                </div>
              </div>

              <div className="grid gap-4">
                <ProfileItem icon={<Mail className="w-5 h-5" />} label="Email Address" value={user?.email || 'N/A'} />
                <ProfileItem icon={<Calendar className="w-5 h-5" />} label="Member Since" value={user?.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'N/A'} />
                <ProfileItem icon={<User className="w-5 h-5" />} label="Account Type" value="Pro AI User" />
              </div>
            </div>
          </div>

          <div className="mt-8 bg-blue-600 rounded-[2rem] p-8 text-white flex items-center justify-between shadow-xl shadow-blue-200">
             <div>
                <p className="text-blue-100 font-semibold mb-1">Current Usage</p>
                <h3 className="text-2xl font-bold">1.2k Tokens / Month</h3>
             </div>
             <button 
               onClick={() => alert("Upgrade feature coming soon!")}
               className="bg-white text-blue-600 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition-all cursor-pointer"
              >
                Upgrade
             </button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

function ProfileItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm">
        {icon}
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">{label}</p>
        <p className="font-bold text-slate-700">{value}</p>
      </div>
    </div>
  );
}
