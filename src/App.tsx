import { AuthProvider } from './context/AuthContext';
import { ServicesProvider } from './context/ServicesContext';
import { AppShell } from './screens/AppShell';

export default function App() {
  return (
    <ServicesProvider>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </ServicesProvider>
  );
}
