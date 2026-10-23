import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Text from './Text';
import { useTheme } from '../lib/ThemeContext';
import { type Palette } from '../lib/theme';
import { fetchScanMesh, type CloudAnimal } from '../lib/api';
import ScanViewer from '../web/ScanViewer';

/**
 * Versão web (modo telemóvel do site) do cartão do modelo 3D: o mesmo visualizador
 * three.js da versão de computador, que lê o GLB com a foto. No iPhone, o app usa
 * o visualizador nativo (outro ficheiro, no repositório da app).
 */
export default function Scan3DCard({ animal }: { animal: CloudAnimal }) {
  const { colors: ios, mode } = useTheme();
  const styles = useMemo(() => makeStyles(ios), [ios]);
  const scanId = animal.hasMesh ? animal.latestScanId : null;
  const load = useMemo(() => (scanId ? () => fetchScanMesh(scanId) : null), [scanId]);
  if (!load) {
    return (
      <View style={styles.empty}>
        <Ionicons name="phone-portrait-outline" size={20} color={ios.secondaryLabel} />
        <Text style={styles.emptyText}>
          No 3D model in the cloud yet. It is sent automatically when the iPhone that captured the scan syncs.
        </Text>
      </View>
    );
  }
  return <ScanViewer load={load} dark={mode === 'dark'} />;
}

const makeStyles = (ios: Palette) => StyleSheet.create({
  empty: {
    flexDirection: 'row', gap: 12, alignItems: 'flex-start', padding: 16, borderRadius: 14,
    backgroundColor: ios.secondarySystemGroupedBackground,
  },
  emptyText: { flex: 1, fontSize: 14, color: ios.secondaryLabel, lineHeight: 20 },
});
