import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Footer } from '../components/common/Footer';
import { Header } from '../components/common/Header';
import { readCollapsed, saveCollapsed, SCREEN_TITLES, Sidebar, SidebarDrawer, type ScreenName } from '../components/common/Sidebar';
import { showToast, ToastHost } from '../components/common/Toast';
import { useAuth } from '../context/AuthContext';
import { initials } from '../utils/format';
import { ChatScreen } from './ChatScreen';
import { DashboardScreen } from './DashboardScreen';
import { HelpScreen } from './HelpScreen';
import { LoginScreen } from './LoginScreen';
import { MapScreen } from './MapScreen';
import { ProfileScreen } from './ProfileScreen';
import { SecurityScreen } from './SecurityScreen';
import { SettingsScreen } from './SettingsScreen';
import { SignUpScreen } from './SignUpScreen';

/** Root layout. Signed out: Login / Sign Up only. Signed in: left sidebar (drawer below md), top bar, the current screen. */
export function AppShell() {
  const { user, loading, signOut } = useAuth();
  const [screen, setScreen] = useState<ScreenName>('dashboard');
  const [authScreen, setAuthScreen] = useState<'login' | 'signup'>('login');
  const [menuOpen, setMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(readCollapsed);

  const navigate = useCallback((s: ScreenName) => {
    if (s === 'login' || s === 'signup') setAuthScreen(s);
    else setScreen(s);
    setMenuOpen(false);
  }, []);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((c) => {
      saveCollapsed(!c);
      return !c;
    });
  }, []);

  const handleSignOut = useCallback(async () => {
    setMenuOpen(false);
    await signOut();
    showToast('Signed out');
  }, [signOut]);

  // Every new session starts on the Dashboard; signing out returns to Sign in.
  const userId = user?.userId ?? null;
  useEffect(() => {
    setScreen('dashboard');
    setMenuOpen(false);
    if (userId === null) setAuthScreen('login');
  }, [userId]);

  let body: ReactNode;
  if (loading) {
    // Checking the saved session: minimal top bar and a card-shaped placeholder.
    body = (
      <div className="flex min-h-full flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center px-4 py-12" aria-busy="true" aria-label="Loading">
          <div className="skeleton h-[480px] w-full max-w-[440px] !rounded-xl" />
        </main>
        <Footer />
      </div>
    );
  } else if (!user) {
    // Signed out: only Login and Sign Up, no sidebar. 112 chip and Demo badge stay.
    body = (
      <div className="flex min-h-full flex-col">
        <Header />
        <main className="flex-1">
          {authScreen === 'login' ? (
            <LoginScreen onCreateAccount={() => navigate('signup')} />
          ) : (
            <SignUpScreen onSignIn={() => navigate('login')} />
          )}
        </main>
        <Footer />
      </div>
    );
  } else {
    const panel = {
      current: screen,
      userName: user.fullName,
      userInitials: initials(user.fullName),
      onNavigate: navigate,
      onSignOut: handleSignOut,
    };
    body = (
      <div className="flex min-h-full">
        <Sidebar collapsed={collapsed} onToggleCollapsed={toggleCollapsed} {...panel} />
        <SidebarDrawer open={menuOpen} onClose={closeMenu} {...panel} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Header
            title={SCREEN_TITLES[screen]}
            onMenu={() => setMenuOpen(true)}
            onBack={screen === 'dashboard' ? undefined : () => navigate('dashboard')}
            userInitials={panel.userInitials}
            userName={user.fullName}
            onProfile={() => navigate('profile')}
            profileActive={screen === 'profile'}
          />
          <main className="flex-1">
            {screen === 'dashboard' && <DashboardScreen onStartCheck={() => navigate('chat')} />}
            {screen === 'chat' && <ChatScreen onFindFacility={() => navigate('map')} />}
            {screen === 'map' && <MapScreen />}
            {screen === 'profile' && <ProfileScreen onOpenSecurity={() => navigate('security')} />}
            {screen === 'settings' && <SettingsScreen onOpenProfile={() => navigate('profile')} />}
            {screen === 'security' && <SecurityScreen onSignOut={handleSignOut} />}
            {screen === 'help' && <HelpScreen onStartCheck={() => navigate('chat')} />}
          </main>
          <Footer />
        </div>
      </div>
    );
  }

  // One outer frame and one ToastHost for every state, so toasts survive sign-in / sign-out.
  return (
    <div className="min-h-full overflow-x-clip bg-surface-tint">
      {body}
      <ToastHost />
    </div>
  );
}
