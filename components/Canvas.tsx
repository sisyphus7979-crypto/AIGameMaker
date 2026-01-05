import React, { useState } from 'react';
import { useStore } from '../store';
import { ZoomIn, ZoomOut, Download, Trash2, Eraser, Loader2, Layers, Eye, EyeOff, UserSquare2 } from 'lucide-react';
import { apiService } from '../apiService';

const Canvas: React.FC = () => {
  const { 
    activeMenu, layers, activeLayerId, setActiveLayerId, updateLayer, removeLayer,
    isGuideVisible, setIsGuideVisible, updateGeneratedImage, getThemeColors, t
  } = useStore() as any;
  
  const colors = getThemeColors();
  const [isProcessingBg, setIsProcessingBg] = useState(false);
  const checkerboardPattern = `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23888888' fill-opacity='0.2'%3E%3Cpath d='M0 0h10v10H0zM10 10h10v10H10z'/%3E%3C/g%3E%3C/svg%3E")`;
  const GUIDE_URL = "https://cdn-icons-png.flaticon.com/512/3011/3011270.png";
  const activeLayer = layers.find((l: any) => l.id === activeLayerId);

  const handleRemoveBg = async () => {
    if (!activeLayer || isProcessingBg) return;
    
    // [메시지] 배경 제거 시작
    alert(t('canvas.bgRemoveStart'));

    setIsProcessingBg(true);
    try {
      const newUrl = await apiService.removeBackground(activeLayer.url);
      updateGeneratedImage(activeLayer.imageId, newUrl);
      
      // [메시지] 배경 제거 완료
      alert(t('canvas.bgRemoveSuccess'));

    } catch (error) { 
        alert(t('canvas.bgRemoveFail'));
    } 
    finally { setIsProcessingBg(false); }
  };

  const handleDeleteLayer = () => {
    if(activeLayerId && window.confirm("Delete this layer?")) {
        removeLayer(activeLayerId);
        // [메시지] 레이어 삭제 완료
        alert(t('canvas.layerDeleted'));
    }
  };

  return (
    <main id="tutorial-canvas" className={`flex-1 h-full ${colors.bgMain} relative flex flex-col overflow-hidden transition-colors duration-300`}>
      <div className={`h-14 ${colors.bgSidebar} border-b ${colors.border} flex items-center justify-between px-6 shrink-0 z-20`}>
        <div className="flex items-center gap-2">
          <span className={`${colors.textSecondary} text-sm font-medium`}>{t('canvas.workspace')}</span>
          <span className="text-zinc-500 text-sm">/</span>
          <span className={`${colors.accentText} text-sm font-medium capitalize`}>
            {activeMenu.replace('_', ' ')}
          </span>
        </div>
        
        <div className="flex items-center gap-4">
            <button 
                onClick={() => setIsGuideVisible(!isGuideVisible)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium border transition-all ${
                    isGuideVisible 
                    ? `${colors.accentBg} bg-opacity-20 ${colors.accentText} border-current` 
                    : `bg-transparent ${colors.textSecondary} border-transparent hover:text-current`
                }`}
            >
                <UserSquare2 size={16} />
                {isGuideVisible ? t('canvas.guideOn') : t('canvas.guideOff')}
            </button>
            <div className={`w-px h-6 ${colors.border}`}></div>
            <div className="flex items-center gap-2">
                <button className={`p-2 ${colors.textSecondary} hover:text-current rounded-md transition-colors`}><ZoomOut size={18} /></button>
                <span className={`text-xs ${colors.textSecondary} font-mono min-w-[3rem] text-center`}>100%</span>
                <button className={`p-2 ${colors.textSecondary} hover:text-current rounded-md transition-colors`}><ZoomIn size={18} /></button>
            </div>
        </div>
      </div>

      <div className="flex-1 relative flex items-center justify-center p-8 overflow-hidden z-10">
        <div 
          className="relative w-[512px] h-[640px] shadow-2xl overflow-hidden bg-white"
          style={{ backgroundColor: '#ffffff', backgroundImage: checkerboardPattern }}
        >
            {isGuideVisible && (
                <div className="absolute inset-0 pointer-events-none z-[5] flex items-center justify-center opacity-30 mix-blend-multiply">
                    <img src={GUIDE_URL} alt="Guide" className="w-[80%] h-auto opacity-50 grayscale" />
                    <div className="absolute top-0 bottom-0 left-1/2 w-px bg-cyan-500/50"></div>
                    <div className="absolute left-0 right-0 top-1/3 h-px bg-cyan-500/50"></div>
                </div>
            )}
            {layers.map((layer: any) => (
                <img
                    key={layer.id}
                    src={layer.url}
                    alt={layer.type}
                    onClick={() => setActiveLayerId(layer.id)}
                    style={{ 
                        zIndex: layer.zIndex + 10,
                        opacity: layer.isVisible ? 1 : 0,
                        transform: `translate(${layer.x}px, ${layer.y}px) scale(${layer.scale})`,
                    }}
                    className={`absolute inset-0 w-full h-full object-contain transition-all duration-200 cursor-pointer hover:brightness-110 ${
                        activeLayerId === layer.id ? 'drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]' : ''
                    }`}
                />
            ))}
            {layers.length === 0 && (
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-gray-400 text-sm">{t('canvas.addParts')}</span>
                 </div>
            )}
        </div>

        <div className={`absolute top-8 left-8 w-48 ${colors.bgPanel} border ${colors.border} rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[50vh]`}>
            <div className={`p-3 border-b ${colors.border} flex items-center gap-2`}>
                <Layers size={14} className={colors.textSecondary} />
                <span className={`text-xs font-semibold ${colors.textPrimary}`}>{t('canvas.layers')}</span>
            </div>
            <div className="overflow-y-auto p-2 space-y-1">
                {layers.slice().reverse().map((layer: any) => (
                    <div 
                        key={layer.id}
                        onClick={() => setActiveLayerId(layer.id)}
                        className={`flex items-center gap-2 p-2 rounded text-xs cursor-pointer transition-colors ${
                            activeLayerId === layer.id 
                            ? `${colors.accentBg} text-white` 
                            : `${colors.textSecondary} hover:bg-black/5`
                        }`}
                    >
                        <button 
                            onClick={(e) => { e.stopPropagation(); updateLayer(layer.id, { isVisible: !layer.isVisible }); }}
                            className={`hover:text-white ${!layer.isVisible && 'opacity-50'}`}
                        >
                            {layer.isVisible ? <Eye size={12} /> : <EyeOff size={12} />}
                        </button>
                        <span className="flex-1 truncate capitalize">{layer.type}</span>
                    </div>
                ))}
            </div>
        </div>
      </div>
      
      {activeLayer && (
         <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 ${colors.bgPanel} rounded-full px-4 py-2 shadow-xl flex items-center gap-4 border ${colors.border}`}>
            <span className={`text-xs font-medium ${colors.textPrimary} capitalize`}>{activeLayer.type} {t('canvas.selected')}</span>
            <div className={`w-px h-4 ${colors.border}`}></div>
            <button onClick={handleRemoveBg} disabled={isProcessingBg} className={`${colors.textSecondary} hover:text-current disabled:opacity-50`}><Eraser size={16} /></button>
            <button className={`${colors.textSecondary} hover:text-current`}><Download size={16} /></button>
            <button onClick={handleDeleteLayer} className="text-red-400 hover:text-red-500"><Trash2 size={16} /></button>
         </div>
      )}
    </main>
  );
};

export default Canvas;