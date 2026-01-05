import React from 'react';
import { Palette, Puzzle, Smile, Ghost, Map, Settings, X, HelpCircle } from 'lucide-react';
import { useStore } from '../store';
import { MenuId } from '../types';

const Sidebar: React.FC = () => {
  const { 
    activeMenu, setActiveMenu, t, 
    getThemeColors, 
    mobileMenuOpen, setMobileMenuOpen,
    setTutorialActive // 튜토리얼 함수
  } = useStore() as any;
  
  const colors = getThemeColors();

  const menuItems = [
    { id: MenuId.STYLE_TRAINING, label: t('menu.styleTraining'), icon: <Palette size={20} /> },
    { id: MenuId.CHARACTER_PARTS, label: t('menu.characterParts'), icon: <Puzzle size={20} /> },
    { id: MenuId.FACE_CUSTOM, label: t('menu.faceCustom'), icon: <Smile size={20} /> },
    { id: MenuId.MONSTER_OBJECT, label: t('menu.monsterObject'), icon: <Ghost size={20} /> },
    { id: MenuId.BACKGROUND_MAP, label: t('menu.backgroundMap'), icon: <Map size={20} /> },
  ];

  const handleMenuClick = (id: string) => {
    setActiveMenu(id);
    if (window.innerWidth < 768) {
      setMobileMenuOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside className={`
        fixed md:static inset-y-0 left-0 z-50 w-64 
        ${colors.bgSidebar} border-r ${colors.border} 
        transform transition-transform duration-300 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        flex flex-col justify-between shrink-0
      `}>
        <div>
          {/* Logo Area */}
          <div className={`h-16 flex items-center justify-between px-6 border-b ${colors.border}`}>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 ${colors.accentBg} rounded-lg flex items-center justify-center`}>
                <span className="text-white font-bold text-lg">2D</span>
              </div>
              <span className={`${colors.textPrimary} font-bold text-sm tracking-tight truncate`}>
                {t('appTitle')}
              </span>
            </div>
            <button onClick={() => setMobileMenuOpen(false)} className="md:hidden">
              <X size={20} className={colors.textSecondary} />
            </button>
          </div>

          {/* Navigation Menu (ID Added) */}
          <nav id="tutorial-nav" className="p-4 space-y-1">
            {menuItems.map((item) => {
              const isActive = activeMenu === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? `${colors.accentBg} bg-opacity-10 ${colors.accentText} border border-current`
                      : `${colors.textSecondary} hover:bg-black/5 hover:text-current`
                  }`}
                >
                  <span className={isActive ? colors.accentText : colors.textSecondary}>
                    {item.icon}
                  </span>
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Area */}
        <div className={`p-4 border-t ${colors.border} space-y-2`}>
          
          {/* [신규] Tutorial Button */}
          <button 
            onClick={() => setTutorialActive(true)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${colors.textSecondary} hover:bg-black/5 hover:text-current`}
          >
            <HelpCircle size={20} className={colors.textSecondary} />
            {t('menu.tutorial')}
          </button>

          {/* Settings Button */}
          <button 
            onClick={() => handleMenuClick('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              activeMenu === 'settings' 
                ? `${colors.accentBg} bg-opacity-10 ${colors.accentText} border border-current`
                : `${colors.textSecondary} hover:bg-black/5 hover:text-current`
            }`}
          >
            <Settings size={20} className={activeMenu === 'settings' ? colors.accentText : colors.textSecondary} />
            {t('menu.settings')}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;