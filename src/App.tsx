import { ServicesProvider } from './context/ServicesContext';
import { AppShell } from './screens/AppShell';

export default function App() {
  return (
    <ServicesProvider>
      <AppShell />
    </ServicesProvider>
  );
}
