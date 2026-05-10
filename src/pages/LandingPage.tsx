import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Bot, Sparkles, Zap, Shield, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleStart = () => {
    if (user) navigate('/chat');
    else navigate('/login');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-100 italic-serif-headers transition-colors">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img 
              src="https://i.ibb.co/G40rPwcN/Chat-GPT-Image-May-9-2026-03-08-08-PM.png" 
              className="w-8 h-8 rounded-lg object-cover" 
              alt="MS AI Logo"
              referrerPolicy="no-referrer"
            />
            <span className="font-bold text-xl tracking-tight">MS AI</span>
          </div>
          <div className="flex items-center gap-6">
            {user ? (
               <button 
                onClick={() => navigate('/chat')}
                className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-full font-medium transition-all shadow-lg cursor-pointer"
              >
                Go to Chat
              </button>
            ) : (
              <>
                <button 
                  onClick={() => navigate('/login')}
                  className="text-slate-600 hover:text-slate-900 font-medium transition-colors cursor-pointer"
                >
                  Sign In
                </button>
                <button 
                  onClick={handleStart}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full font-medium transition-all shadow-lg shadow-blue-200 cursor-pointer"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4" />
              <span>Next Generation AI Assistant</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-[1.1] dark:text-white">
              Think bigger. <br />
              <span className="text-blue-600 dark:text-blue-500">Build faster.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
              Experience the power of MS AI. A futuristic conversational assistant designed to enhance productivity and ignite creativity.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={handleStart}
                className="w-full sm:w-auto bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                Start Chatting
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="w-full sm:w-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 px-8 py-4 rounded-2xl font-semibold text-lg transition-all dark:text-slate-200 cursor-pointer">
                View Features
              </button>
            </div>
          </motion.div>

          {/* Floating UI Mockup */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mt-24 relative"
          >
            <div className="absolute inset-0 bg-blue-400/20 blur-[120px] rounded-full mx-auto w-2/3 h-2/3 -z-10" />
            <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-2xl p-4 md:p-8 aspect-video md:aspect-[21/9] overflow-hidden">
               <div className="flex gap-4 h-full">
                  <div className="w-1/4 bg-slate-50 rounded-2xl flex flex-col p-4 gap-3">
                     <div className="h-4 w-3/4 bg-slate-200 rounded-full" />
                     <div className="h-4 w-1/2 bg-slate-200 rounded-full" />
                     <div className="mt-auto h-10 w-full bg-slate-100 rounded-xl" />
                  </div>
                  <div className="flex-1 flex flex-col gap-4">
                     <div className="h-8 w-1/4 bg-blue-50 rounded-lg" />
                     <div className="flex flex-col gap-3 mt-4">
                        <div className="h-4 w-2/3 bg-slate-100 rounded-full" />
                        <div className="h-4 w-3/4 bg-slate-100 rounded-full" />
                        <div className="h-4 w-1/2 bg-slate-100 rounded-full" />
                     </div>
                     <div className="mt-auto flex gap-2">
                        <div className="flex-1 h-12 bg-slate-50 rounded-2xl border border-slate-100" />
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl" />
                     </div>
                  </div>
               </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Features Grid */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900 transition-colors">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Zap className="w-6 h-6 text-yellow-500" />}
              title="Lightning Fast"
              description="Built on the latest LLM technology for near-instant responses and analysis."
            />
            <FeatureCard 
              icon={<Shield className="w-6 h-6 text-green-500" />}
              title="Secure & Private"
              description="Your data is encrypted and protected with industry-standard security protocols."
            />
            <FeatureCard 
              icon={<Sparkles className="w-6 h-6 text-blue-500" />}
              title="Infinite Creativity"
              description="Brainstorm ideas, write code, or draft content with an AI that understands context."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 opacity-50">
            <img 
              src="https://i.ibb.co/G40rPwcN/Chat-GPT-Image-May-9-2026-03-08-08-PM.png" 
              className="w-5 h-5 rounded-md object-cover" 
              alt="MS AI Logo"
              referrerPolicy="no-referrer"
            />
            <span className="font-bold tracking-tight">MS AI</span>
          </div>
          <p className="text-slate-400 text-sm">
            © 2026 MS AI Platform. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-slate-500">
            <a href="#" className="hover:text-slate-900">Privacy</a>
            <a href="#" className="hover:text-slate-900">Terms</a>
            <a href="#" className="hover:text-slate-900">FAQ</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] border border-slate-200/60 dark:border-slate-700 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none transition-all group">
      <div className="w-12 h-12 bg-slate-50 dark:bg-slate-700/50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 dark:text-white">{title}</h3>
      <p className="text-slate-500 dark:text-slate-400 leading-relaxed">{description}</p>
    </div>
  );
}
