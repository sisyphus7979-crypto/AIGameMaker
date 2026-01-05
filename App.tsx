import React from 'react';
import Sidebar from './components/Sidebar';
import ControlPanel from './components/ControlPanel';
import SettingsPanel from './components/SettingsPanel';
import StyleTraining from './components/StyleTraining';
import Canvas from './components/Canvas';
import TutorialOverlay from './components/TutorialOverlay'; 
import { useStore } from './store';
import { Menu } from 'lucide-react';
import { MenuId } from './types';

function App() {
  const { 
    activeMenu, 
    getThemeColors, 
    setMobileMenuOpen 
  } = useStore() as any;

  const colors = getThemeColors();

  const renderContent = () => {
    switch (activeMenu) {
      case MenuId.STYLE_TRAINING:
        return <StyleTraining />;
      case 'settings':
        return <SettingsPanel />;
      default:
        return <Canvas />;
    }
  };

  return (
    <div className={`flex h-screen w-screen overflow-hidden ${colors.bgMain} transition-colors duration-300`}>
      {/* Tutorial Overlay */}
      <TutorialOverlay />

      {/* 1. Sidebar */}
      <Sidebar />
      
      {/* 2. Main Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Mobile Header */}
        <header className={`md:hidden h-14 flex items-center px-4 border-b ${colors.border} ${colors.bgSidebar} shrink-0`}>
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className={`p-2 rounded-md ${colors.textPrimary} hover:bg-black/5`}
          >
            <Menu size={24} />
          </button>
          <span className={`ml-3 font-bold ${colors.textPrimary}`}>U-GAF Mobile</span>
        </header>

        {/* Content Render */}
        <div className="flex-1 relative overflow-hidden flex">
           {renderContent()}
        </div>
      </div>

      {/* 3. Right Panel (Control Panel) */}
      <div className={`hidden md:block h-full shrink-0 ${activeMenu === 'settings' || activeMenu === MenuId.STYLE_TRAINING ? 'hidden' : 'block'}`}>
         <ControlPanel />
      </div>

      {/* Mobile Settings View */}
      {activeMenu === 'settings' && (
        <div className="fixed inset-0 z-50 md:hidden">
           <SettingsPanel />
        </div>
      )}
    </div>
  );
}

export default App;