import { useCallback, useState } from 'react';
import { DrawerMenu, type ScreenName } from '../components/common/DrawerMenu';
import { Footer } from '../components/common/Footer';
import { Header } from '../components/common/Header';
import { ChatScreen } from './ChatScreen';
import { DashboardScreen } from './DashboardScreen';
import { MapScreen } from './MapScreen';

/** Root layout: top bar, drawer menu, the current screen. */
export function AppShell() {
  const [screen, setScreen] = useState<ScreenName>('dashboard');
  const [menuOpen, setMenuOpen] = useState(false);

  const navigate = useCallback((s: ScreenName) => {
    setScreen(s);
    setMenuOpen(false);
  }, []);

  return (
    <div className="flex min-h-full flex-col bg-page">
      <Header onMenu={() => setMenuOpen(true)} onBack={screen === 'dashboard' ? undefined : () => navigate('dashboard')} />
      <DrawerMenu open={menuOpen} current={screen} onNavigate={navigate} onClose={() => setMenuOpen(false)} />
      <main className="flex-1">
        {screen === 'dashboard' && <DashboardScreen onStartCheck={() => navigate('chat')} />}
        {screen === 'chat' && <ChatScreen onFindFacility={() => navigate('map')} />}
        {screen === 'map' && <MapScreen />}
      </main>
      <Footer />
    </div>
  );
}
