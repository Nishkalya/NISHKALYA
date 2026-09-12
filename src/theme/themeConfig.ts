export interface ThemeConfig {
  name: string;
  bgMain: string;
  bgPanel: string;
  bgCard: string;
  borderColor: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  btnPrimary: string;
  btnPrimaryHover: string;
  accentColor: string;
  themeGlow: string;
}

export const defaultLightTheme: ThemeConfig = {
  name: 'Professional Light',
  bgMain: '#FFFFFF',
  bgPanel: '#F8FAFC',
  bgCard: '#FFFFFF',
  borderColor: '#E2E8F0',
  textPrimary: '#0F172A',
  textSecondary: '#334155',
  textMuted: '#64748B',
  btnPrimary: '#2563EB',
  btnPrimaryHover: '#1D4ED8',
  accentColor: '#0284C7',
  themeGlow: 'rgba(37, 99, 235, 0.15)',
};

export let activeGlobalTheme: ThemeConfig = { ...defaultLightTheme };

export function updateGlobalTheme(newTheme: Partial<ThemeConfig>) {
  activeGlobalTheme = { ...activeGlobalTheme, ...newTheme };
  // Update CSS variables on document root
  const root = document.documentElement;
  root.style.setProperty('--bg-main', activeGlobalTheme.bgMain);
  root.style.setProperty('--bg-panel', activeGlobalTheme.bgPanel);
  root.style.setProperty('--bg-card', activeGlobalTheme.bgCard);
  root.style.setProperty('--border-color', activeGlobalTheme.borderColor);
  root.style.setProperty('--text-primary', activeGlobalTheme.textPrimary);
  root.style.setProperty('--text-secondary', activeGlobalTheme.textSecondary);
  root.style.setProperty('--text-muted', activeGlobalTheme.textMuted);
  root.style.setProperty('--btn-primary', activeGlobalTheme.btnPrimary);
  root.style.setProperty('--btn-primary-hover', activeGlobalTheme.btnPrimaryHover);
  root.style.setProperty('--accent-color', activeGlobalTheme.accentColor);
  root.style.setProperty('--theme-glow', activeGlobalTheme.themeGlow);
}
