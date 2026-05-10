import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bot, Mail, Lock, Chrome, ArrowRight, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, loading, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/chat');
    }
  }, [user, loading, navigate]);

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    try {
      await loginWithGoogle();
      navigate('/chat');
    } catch (error) {
      console.error(error);
      alert('Failed to login with Google. Make sure it is enabled in your Firebase console.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Email login requires enabling Email/Password provider in the Firebase console. Please use Google Login for this demo.');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 selection:bg-blue-100 transition-colors">
      <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 group">
        <div className="w-8 h-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-center shadow-sm group-hover:border-blue-500 transition-colors">
          <ArrowRight className="w-4 h-4 rotate-180 dark:text-slate-400" />
        </div>
        <span className="text-slate-500 dark:text-slate-400 font-medium group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Back</span>
      </Link>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-200 dark:shadow-none">
            <Bot className="text-white w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 dark:text-white">Welcome to MS AI</h1>
          <p className="text-slate-500 dark:text-slate-400">Log in to your account to continue</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl shadow-slate-200 dark:shadow-none border border-slate-100 dark:border-slate-800 transition-colors">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Email address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-blue-500/10 rounded-2xl py-3.5 pl-12 pr-4 outline-none transition-all placeholder:text-slate-400 dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Password</label>
                <a href="#" className="text-xs font-semibold text-blue-600 hover:text-blue-700">Forgot password?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-blue-500/10 rounded-2xl py-3.5 pl-12 pr-4 outline-none transition-all placeholder:text-slate-400 dark:text-white"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 disabled:opacity-50 text-white rounded-2xl py-4 font-bold transition-all shadow-lg shadow-slate-200 dark:shadow-none flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign in"}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100 dark:border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white dark:bg-slate-900 text-slate-400 font-medium">Or continue with</span>
            </div>
          </div>

          <button 
            type="button"
            onClick={handleGoogleLogin}
            disabled={isSubmitting}
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 disabled:opacity-50 text-slate-700 dark:text-slate-200 rounded-2xl py-4 font-bold transition-all flex items-center justify-center gap-3 cursor-pointer shadow-sm"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Chrome className="w-5 h-5" />
                <span>Google Account</span>
              </>
            )}
          </button>

          <p className="mt-8 text-center text-sm text-slate-500">
            Don't have an account?{" "}
            <Link to="/login" className="text-blue-600 font-bold hover:text-blue-700">Sign up</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
