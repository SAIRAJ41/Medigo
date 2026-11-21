import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { DrawerMenu, type ScreenName } from '../components/common/DrawerMenu';
import { Footer } from '../components/common/Footer';
import { Header } from '../components/common/Header';
import { showToast, ToastHost } from '../components/common/Toast';
import { useAuth } from '../context/AuthContext';
import { initials } from '../utils/format';
import { ChatScreen } from './ChatScreen';
import { DashboardScreen } from './DashboardScreen';
import { LoginScreen } from './LoginScreen';
import { MapScreen } from './MapScreen';
import { ProfileScreen } from './ProfileScreen';
import { SignUpScreen } from './SignUpScreen';

/** Root layout. Signed out: Login / Sign Up only. Signed in: top bar, drawer menu, the current screen. */
export function AppShell() {
  const { user, loading, signOut } = useAuth();
  const [screen, setScreen] = useState<ScreenName>('dashboard');
  const [authScreen, setAuthScreen] = useState<'login' | 'signup'>('login');
  const [menuOpen, setMenuOpen] = useState(false);

  const navigate = useCallback((s: ScreenName) => {
    if (s === 'login' || s === 'signup') setAuthScreen(s);
    else setScreen(s);
    setMenuOpen(false);
  }, []);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

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

  // One outer frame and one ToastHost for every state, so toasts survive sign-in / sign-out.
  let body: ReactNode;
  if (loading) {
    // Checking the saved session: minimal top bar and a card-shaped placeholder.
    body = (
      <>
        <Header />
        <main className="flex flex-1 items-center justify-center px-4 py-12" aria-busy="true" aria-label="Loading">
          <div className="skeleton h-[480px] w-full max-w-[440px] !rounded-xl" />
        </main>
      </>
    );
  } else if (!user) {
    // Signed out: only Login and Sign Up, no menu or drawer. 112 chip and Demo badge stay.
    body = (
      <>
        <Header />
        <main className="flex-1">
          {authScreen === 'login' ? (
            <LoginScreen onCreateAccount={() => navigate('signup')} />
          ) : (
            <SignUpScreen onSignIn={() => navigate('login')} />
          )}
        </main>
      </>
    );
  } else {
    body = (
      <>
        <Header
          onMenu={() => setMenuOpen(true)}
          onBack={screen === 'dashboard' ? undefined : () => navigate('dashboard')}
          userInitials={initials(user.fullName)}
          userName={user.fullName}
          onProfile={() => navigate('profile')}
          profileActive={screen === 'profile'}
        />
        <DrawerMenu open={menuOpen} current={screen} onNavigate={navigate} onClose={closeMenu} onSignOut={handleSignOut} />
        <main className="flex-1">
          {screen === 'dashboard' && <DashboardScreen onStartCheck={() => navigate('chat')} />}
          {screen === 'chat' && <ChatScreen onFindFacility={() => navigate('map')} />}
          {screen === 'map' && <MapScreen />}
          {screen === 'profile' && <ProfileScreen />}
        </main>
      </>
    );
  }

  return (
    <div className="flex min-h-full flex-col overflow-x-clip bg-page">
      {body}
      <Footer />
      <ToastHost />
    </div>
  );
}
