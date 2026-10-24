import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold } from '@expo-google-fonts/inter';
import { ThemeProvider, useTheme } from './src/lib/ThemeContext';
import { applyThemeAttr } from './src/web/themeScan';
import { WeatherProvider } from './src/lib/weather';
import { AuthProvider, useAuth } from './src/lib/AuthContext';
import { RootNavigator } from './src/navigation/AppNavigator';
import DesktopOrgGate from './src/web/DesktopOrgGate';
import { AlertHost, installWebAlert } from './src/web/webAlert';
import DesktopLogin from './src/web/DesktopLogin';
import DeviceStage from './src/web/DeviceStage';
import { loadDeviceMode, NARROW, type DeviceMode } from './src/web/deviceMode';
import { CSS } from './src/web/styles';

// Na web, Alert.alert não fazia nada (react-native-web): passa a abrir um diálogo.
installWebAlert();

// Entrada da versão web (Expo escolhe este ficheiro na web; o iPhone continua a usar App.tsx).
function useNarrow() {
  const [n, setN] = useState(window.innerWidth < NARROW);
  useEffect(() => { const f = () => setN(window.innerWidth < NARROW); window.addEventListener('resize', f); return () => window.removeEventListener('resize', f); }, []);
  return n;
}

function WebRoot() {
  const { token, user, loading } = useAuth();
  const { mode: themeMode } = useTheme();
  useEffect(() => { applyThemeAttr(themeMode); }, [themeMode]);
  const narrow = useNarrow();
  const [mode, setMode] = useState<DeviceMode | null>(null);
  useEffect(() => { loadDeviceMode(window.innerWidth).then(setMode); }, []);

  if (loading || mode === null) {
    return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--ground)' as any }}><ActivityIndicator color="#2D7D46" /></View>;
  }
  // Num ecrã estreito (um telemóvel de verdade) a app abre como no iPhone, sem moldura.
  if (narrow) return <View style={{ flex: 1 }}><RootNavigator /></View>;
  if (!token) return <DesktopLogin />;
  // Sem organização: criar uma ou pedir entrada. À espera de aprovação entra no
  // painel com acesso limitado (como no iPhone): aviso na Home, sem dados da
  // organização, e abre sozinho o rebanho quando o Líder aprovar.
  if (user && user.membershipStatus === 'none') {
    return <DesktopOrgGate />;
  }
  return <DeviceStage initial={mode} />;
}

export default function App() {
  const [fontsLoaded, fontError] = useFonts({ Inter_400Regular, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold });
  useEffect(() => {
    const el = document.createElement('style'); el.id = 'pf-web-css'; el.textContent = CSS; document.head.appendChild(el);
    document.title = 'PondiFarm';
    return () => { el.remove(); };
  }, []);
  if (!fontsLoaded && !fontError) return null;
  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <AuthProvider>
          <WeatherProvider>
            <WebRoot />
          </WeatherProvider>
          <AlertHost />
        </AuthProvider>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
