import React from 'react';
import { View } from 'react-native';
import { Asset } from 'expo-asset';
import OrganizationGateScreen from '../screens/OrganizationGateScreen';

const ICON = Asset.fromModule(require('../../assets/icon.png')).uri;

/**
 * Escolher organização no computador: o mesmo layout do login — ícone à
 * esquerda, o ecrã da app à direita. Depois de pedir entrada, a pessoa passa ao
 * painel com acesso limitado até o Líder aprovar.
 */
export default function DesktopOrgGate() {
  return (
    <div className="pf pf-login">
      <section className="pf-lp" aria-hidden="true"><img className="pf-lp-icon" src={ICON} alt="" /></section>
      <section className="pf-rp pf-gate">
        <View style={{ flex: 1, width: '100%', maxWidth: 520, alignSelf: 'center' }}>
          <OrganizationGateScreen bare />
        </View>
      </section>
    </div>
  );
}
