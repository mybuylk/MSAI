import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Bot, Home, AlertCircle } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mb-8"
      >
        <div className="w-24 h-24 bg-red-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-12 h-12 text-red-500" />
        </div>
        <h1 className="text-6xl font-black text-slate-900 mb-4 tracking-tighter">404</h1>
        <p className="text-xl text-slate-500 font-medium max-w-xs mx-auto">
          Oops! The module you are looking for has drifted into deep space.
        </p>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-4">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg hover:shadow-slate-200 cursor-pointer"
        >
          <Home className="w-5 h-5" />
          Home Base
        </button>
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-600 px-8 py-4 rounded-2xl font-bold hover:border-slate-300 transition-all cursor-pointer"
        >
          Go Back
        </button>
      </div>

      <div className="mt-20 flex items-center gap-2 opacity-20">
        <Bot className="w-5 h-5" />
        <span className="font-bold tracking-tight">MS AI SYSTEM</span>
      </div>
    </div>
  );
}
