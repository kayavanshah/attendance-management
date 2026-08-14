'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Users, Calendar, Camera, FileText, Settings, LogOut, Menu, X } from 'lucide-react';
import styles from './dashboard.module.css';

const allNavItems = [
  { name: 'Analytics', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Members', href: '/dashboard/people', icon: Users },
  { name: 'Sessions', href: '/dashboard/sessions', icon: Calendar },
  { name: 'Scanner', href: '/dashboard/scanner', icon: Camera },
  { name: 'Reports', href: '/dashboard/reports', icon: FileText },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.role) {
          setRole(data.role);
        }
      });
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Filter items based on role
  const navItems = role === 'STAFF' 
    ? allNavItems.filter(item => item.name === 'Scanner')
    : allNavItems;

  return (
    <div className={styles.layout}>
      
      {/* Mobile Header */}
      <div className={styles.mobileHeader}>
        <div className={styles.mobileHeaderTitle}>Attendance Pro</div>
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', padding: '0.5rem' }}
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Overlay */}
      <div 
        className={`${styles.overlay} ${isMobileMenuOpen ? styles.open : ''}`} 
        onClick={() => setIsMobileMenuOpen(false)}
      />

      <aside className={`${styles.sidebar} ${isMobileMenuOpen ? styles.open : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 1rem', marginBottom: '2rem' }}>
          <div className={styles.sidebarHeader} style={{ margin: 0, padding: 0 }}>Attendance Pro</div>
          
          {/* Close button inside sidebar on mobile */}
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className={styles.mobileHeader} // re-using mobileHeader to show only on mobile
            style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)' }}
          >
            <X size={24} />
          </button>
        </div>
        
        {role && (
          <div style={{ padding: '0 1.5rem 1.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Logged in as: <strong style={{ color: role === 'STAFF' ? 'var(--primary)' : 'var(--success)' }}>{role}</strong>
          </div>
        )}

        <nav className={styles.nav}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/dashboard');
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`${styles.navLink} ${isActive ? styles.active : ''}`}
              >
                <Icon size={20} />
                {item.name}
              </Link>
            );
          })}
          
          <div style={{ marginTop: 'auto' }}>
            <button onClick={handleLogout} className={styles.navLink} style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer' }}>
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </nav>
      </aside>
      <main className={styles.main}>
        {children}
      </main>
    </div>
  );
}
