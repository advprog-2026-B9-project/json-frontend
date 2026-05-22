'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import styles from './Navbar.module.css';

type UserSession = {
  id?: string;
  username?: string;
  fullName?: string;
  role?: string;
  photoUrl?: string;
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<UserSession | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Gagal memparsing data user:', error);
      }
    } else {
      setUser(null);
    }
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setIsOpen(false);
    router.push('/login');
  };

  if (!isMounted) return <nav className={styles.navbar}></nav>;

  const userRole = user?.role?.toUpperCase();
  const isAdmin = userRole === 'ADMIN';

  let navLinks: { href: string; label: string }[] = [];

  if (!user) {
    navLinks = [];
  } else if (isAdmin) {
    navLinks = [
      { href: '/admin', label: 'Dashboard' },
      { href: '/admin/kyc', label: 'Verifikasi KYC' },
      { href: '/admin/users', label: 'Manajemen User' },
    ];
  } else if (userRole === 'JASTIPER') {
    navLinks = [
      { href: '/', label: 'Home' },
      { href: '/jastiper/products', label: 'Dashboard Jastiper' },
      { href: '/wallet', label: 'Wallet' },
      { href: '/profile', label: 'Profile' },
    ];
  } else if (userRole === 'TITIPERS') {
    navLinks = [
      { href: '/', label: 'Home' },
      { href: '/products', label: 'Products' },
      { href: '/wallet', label: 'Wallet' },
      { href: '/profile', label: 'Profile' },
    ];
  }

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        {/* Sisi Kiri: Logo & Nav Links */}
        <div className={styles.navLeftSection}>
          <Link href="/" className={styles.navLogo}>
            JSON
          </Link>

          <ul className={styles.navMenu}>
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <li className={styles.navItem} key={link.href}>
                  <Link 
                    href={link.href} 
                    className={`${styles.navLinks} ${isActive ? styles.activeLink : ''}`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Sisi Tengah: Search Bar */}
        {user && (
          <div className={styles.searchWrapper}>
            <div className={styles.searchBar}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                placeholder="Search"
                className={styles.searchInput}
              />
            </div>  
          </div>
        )}

        {/* Sisi Kanan: Profile Info & Hamburger */}
        <div className={styles.navRightSection}>
          <div className={styles.authActionContainer}>
            {!user ? (
              <div className={styles.navButtons}>
                <Link href="/login" className={styles.buttonSecondary}>
                  Login
                </Link>
                <Link href="/register" className={styles.buttonPrimary}>
                  Register
                </Link>
              </div>
            ) : (
              <div className={styles.profileControls}>
                <Link href="/profile" className={styles.userLink}>
                  <div className={styles.userInfo}>
                    <div className={styles.userName}>{user.fullName || user.username}</div>
                    <div className={styles.userRole}>
                      {isAdmin ? 'Administrator' : (user.role || 'Titipers')}
                    </div>
                  </div>
                  <div className={styles.avatarCircle}>
                    <img
                      src={
                        user.photoUrl
                          ? user.photoUrl
                            : `https://api.dicebear.com/7.x/initials/svg?seed=${user.fullName || 'User'}&backgroundColor=000000`
                      }
                      alt="Avatar"
                      className={styles.avatarImg}
                    />
                  </div>
                </Link>
                <button onClick={handleLogout} className={styles.buttonDanger}>
                  Logout
                </button>
              </div>
            )}
          </div>

          <button 
            className={styles.menuIcon} 
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle Menu"
          >
            <div className={`${styles.icon} ${isOpen ? styles.iconOpen : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </button>
        </div>

        {/* Mobile Menu Slide Drawer */}
        {isOpen && <div className={styles.mobileBackdrop} onClick={() => setIsOpen(false)} />}

        <div className={`${styles.mobileMenuWrapper} ${isOpen ? styles.active : ''}`}>
          {user && (
            <div className={styles.mobileSearchLocation}>
              <div className={styles.searchBar}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input type="text" placeholder="Search" className={styles.searchInput} />
              </div>
            </div>
          )}

          <ul className={styles.mobileNavMenu}>
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <li className={styles.navItem} key={link.href}>
                  <Link 
                    href={link.href} 
                    className={`${styles.navLinks} ${isActive ? styles.activeLink : ''}`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className={styles.mobileNavButtons}>
            {!user ? (
              <>
                <Link href="/login" className={styles.buttonSecondary}>Login</Link>
                <Link href="/register" className={styles.buttonPrimary}>Register</Link>
              </>
            ) : (
              <button onClick={handleLogout} className={styles.buttonDanger}>Logout</button>
            )}
          </div>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;