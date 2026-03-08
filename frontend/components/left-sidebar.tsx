'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut, getCurrentUser } from '@/lib/auth';
import { Sparkles, Calendar, Search, LogOut, Settings, BarChart3, Clock, Home, Brain, Activity, Heart } from 'lucide-react';

export function LeftSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = getCurrentUser();

  const navItems = [
    { icon: Home, label: 'Dashboard', href: '/', active: pathname === '/' },
    { icon: Clock, label: 'History', href: '/history', active: pathname === '/history' },
    { icon: BarChart3, label: 'Deep Insights', href: '/insights', active: pathname === '/insights' },
    { icon: Heart, label: 'Resources', href: '/resources', active: pathname === '/resources' },
  ];

  const handleLogout = () => {
    signOut();
    router.push('/login');
  };

  return (
    <div
      className="w-64 h-screen border-r border-border flex flex-col p-4"
      style={{
        background: 'linear-gradient(180deg, rgba(15, 20, 25, 0.7) 0%, rgba(26, 31, 46, 0.5) 100%)',
        backdropFilter: 'blur(8px)',
      }}
    >
      {/* Logo */}
      <Link href="/" className="mb-10 flex items-center gap-3">
        <div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-lg blur-lg opacity-50"
          />
          <div className="relative bg-gradient-to-br from-primary to-secondary rounded-lg p-2">
            <Brain className="w-6 h-6 text-primary-foreground" />
          </div>
        </div>
        <div>
          <p className="text-sm font-bold text-foreground">NeuroSentinel</p>
          <p className="text-xs text-muted-foreground">AI Health Monitor</p>
        </div>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                item.active
                  ? 'bg-primary/10 border border-primary/20 text-primary'
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">{item.label}</span>
              {item.active && (
                <motion.div
                  layoutId="activeIndicator"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* System Telemetry (DSS Style) */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-8 p-4 rounded-xl bg-white/5 border border-white/10 space-y-4"
      >
        <div className="flex items-center justify-between text-muted-foreground">
          <div className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-primary" />
            <span className="text-[9px] font-black uppercase tracking-widest">System Telemetry</span>
          </div>
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse" />
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center text-[10px] font-bold">
            <span className="text-white/40 uppercase">Processing</span>
            <span className="text-foreground">88.4 Tflops</span>
          </div>
          <div className="flex justify-between items-center text-[10px] font-bold">
            <span className="text-white/40 uppercase">Sync Rate</span>
            <span className="text-emerald-400">99.8%</span>
          </div>
          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
             <motion.div 
               animate={{ width: ['20%', '80%', '45%'] }}
               transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
               className="h-full bg-primary/40" 
             />
          </div>
        </div>
      </motion.div>


      {/* User Section */}
      <div className="space-y-3 pt-4 border-t border-border">
        {user && (
          <div className="flex items-center gap-3 px-4 py-3">
             <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-secondary/40 to-primary/40 flex items-center justify-center text-sm font-bold border border-white/10 uppercase">
                {user.name.charAt(0)}
             </div>
             <div className="truncate">
                <p className="text-sm font-bold text-foreground truncate">{user.name}</p>
                <p className="text-[10px] text-muted-foreground truncate">Professional Plan</p>
             </div>
          </div>
        )}
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-300 group"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}
