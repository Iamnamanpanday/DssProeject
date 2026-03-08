'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { signUp, signIn } from '@/lib/auth';
import { ParticleBackground } from '@/components/particle-background';
import { Brain, LogIn, UserPlus } from 'lucide-react';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState(''); // Simulated password field
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      const user = signIn(email);
      if (user) {
        router.push('/');
      } else {
        setError('Invalid email or user not found. Please sign up.');
      }
    } else {
      if (!name || !email) {
        setError('Please fill in all fields.');
        return;
      }
      signUp(name, email);
      router.push('/onboarding');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-background overflow-hidden p-6">
      <ParticleBackground />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div 
          className="rounded-2xl border border-border backdrop-blur-xl p-8"
          style={{
            background: 'var(--glass-bg)',
            boxShadow: '0 8px 32px rgba(59, 130, 246, 0.15)',
          }}
        >
          {/* Logo Section */}
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="bg-gradient-to-br from-primary to-secondary rounded-xl p-3 mb-4 shadow-xl shadow-primary/20">
              <Brain className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">NeuroSentinel AI</h1>
            <p className="text-sm text-muted-foreground mt-1">Mental Health Decision Support</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
              >
                <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1.5 ml-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-muted/30 border border-border rounded-lg px-4 py-2.5 text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-300"
                  placeholder="John Doe"
                />
              </motion.div>
            )}

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1.5 ml-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-muted/30 border border-border rounded-lg px-4 py-2.5 text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-300"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1.5 ml-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-muted/30 border border-border rounded-lg px-4 py-2.5 text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-300"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-red-400 font-medium"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-primary to-secondary text-primary-foreground font-bold rounded-lg shadow-lg hover:shadow-primary/25 hover:brightness-110 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 group"
            >
              {isLogin ? (
                <>
                  <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  Sign In
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Create Account
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-border flex justify-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
