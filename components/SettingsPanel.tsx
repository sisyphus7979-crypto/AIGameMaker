import React from 'react';
import { useStore } from '../store';
import { Globe, Key, Save, Palette, Check } from 'lucide-react';
import { LANGUAGES } from '../constants/translations';
import { THEMES } from '../constants/themes';

const SettingsPanel: React.FC = () => {
  const { 
    language, setLanguage, 
    apiKey, setApiKey, 
    t, 
    theme, setTheme, getThemeColors,
    setMobileMenuOpen 
  } = useStore() as any;
  
  const [tempKey, setTempKey] = React.useState(apiKey);
  const colors = getThemeColors();

  const handleSaveKey = () => {
    try {
      if (!tempKey || tempKey.trim() === '') {
        throw new Error('Empty Key');
      }
      // 간단한 유효성 검사 (Replicate 키는 보통 r8_로 시작)
      if (!tempKey.startsWith('r8_')) {
         // 경고는 하되 저장은 허용할 수도 있지만, 여기선 실패로 간주 예시
         // throw new Error('Invalid Format'); 
      }
      
      setApiKey(tempKey);
      alert(t('settings.saveSuccess')); // "API 키 등록 성공 했습니다."
    } catch (e) {
      alert(t('settings.saveFail')); // "API 키 등록에 실패 했습니다."
    }
  };

  return (
    <aside className={`w-full md:w-80 h-full ${colors.bgPanel} border-l ${colors.border} flex flex-col shrink-0 transition-colors duration-300`}>
      {/* Header */}
      <div className={`h-14 border-b ${colors.border} flex items-center justify-between px-6`}>
        <h2 className={`${colors.textPrimary} font-semibold text-sm flex items-center gap-2`}>
          <Palette size={16} className={colors.accentText} />
          {t('settings.title')}
        </h2>
        <button onClick={() => setMobileMenuOpen(false)} className="md:hidden">
            <span className={colors.textSecondary}>✕</span>
        </button>
      </div>

      <div className="p-6 space-y-8 overflow-y-auto">
        
        {/* Theme Settings */}
        <div className="space-y-3">
          <label className={`text-xs font-medium ${colors.textSecondary} uppercase tracking-wider flex items-center gap-2`}>
            <Palette size={14} /> Theme Color
          </label>
          <div className="grid grid-cols-1 gap-2">
            {Object.entries(THEMES).map(([key, value]: any) => (
              <button
                key={key}
                onClick={() => setTheme(key)}
                className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium border transition-all ${
                  theme === key
                    ? `${colors.accentBg} text-white border-transparent shadow-md`
                    : `${colors.inputBg} ${colors.border} ${colors.textSecondary} hover:opacity-80`
                }`}
              >
                <div className="flex items-center gap-2">
                   <div className={`w-4 h-4 rounded-full border border-gray-300 ${
                       key === 'dark' ? 'bg-zinc-900' :
                       key === 'light' ? 'bg-white' :
                       key === 'pastel_green' ? 'bg-emerald-100' :
                       key === 'pastel_purple' ? 'bg-purple-100' : 'bg-yellow-100'
                   }`}></div>
                   {value.label}
                </div>
                {theme === key && <Check size={16} />}
              </button>
            ))}
          </div>
        </div>

        <div className={`h-px ${colors.border}`} />

        {/* Language Settings */}
        <div className="space-y-3">
          <label className={`text-xs font-medium ${colors.textSecondary} uppercase tracking-wider flex items-center gap-2`}>
            <Globe size={14} /> {t('settings.language')}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`px-3 py-2 rounded-md text-xs font-medium border transition-all ${
                  language === lang.code
                    ? `${colors.accentText} ${colors.border} bg-opacity-10 bg-current`
                    : `${colors.inputBg} ${colors.border} ${colors.textSecondary}`
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        <div className={`h-px ${colors.border}`} />

        {/* API Key Settings */}
        <div className="space-y-3">
          <label className={`text-xs font-medium ${colors.textSecondary} uppercase tracking-wider flex items-center gap-2`}>
            <Key size={14} /> {t('settings.apiKey')}
          </label>
          <p className={`text-[10px] ${colors.textSecondary} leading-relaxed`}>
            {t('settings.apiKeyDesc')}
          </p>
          
          <div className="space-y-2">
            <input 
              type="password"
              value={tempKey}
              onChange={(e) => setTempKey(e.target.value)}
              placeholder={t('settings.placeholder')}
              className={`w-full ${colors.inputBg} ${colors.textPrimary} text-sm border ${colors.border} rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-current transition-all font-mono placeholder:opacity-50`}
            />
            <button 
              onClick={handleSaveKey}
              className={`w-full flex items-center justify-center gap-2 py-2 ${colors.accentBg} text-white rounded-lg text-xs font-bold hover:opacity-90 transition-opacity`}
            >
              <Save size={14} />
              {t('settings.save')}
            </button>
          </div>
        </div>

      </div>
    </aside>
  );
};

export default SettingsPanel;