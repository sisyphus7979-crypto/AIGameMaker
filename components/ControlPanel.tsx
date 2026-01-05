import React, { useState } from 'react';
import { useStore } from '../store';
import { Sparkles, Wand2, ChevronDown, AlertCircle, Circle, Eye, User, Smile, Copy, DownloadCloud, Loader2, ToggleLeft, ToggleRight } from 'lucide-react';
import { apiService } from '../apiService';
import { GenerationType } from '../types';
import JSZip from 'jszip';

const ControlPanel: React.FC = () => {
  const { 
    prompt, setPrompt, selectedStyle, setSelectedStyle, 
    generationType, setGenerationType, isGenerating, setIsGenerating,
    generatedImages, addGeneratedImage, selectedImageId, setSelectedImageId,
    customModels, batchSize, setBatchSize, getThemeColors, t
  } = useStore() as any; 

  const colors = getThemeColors();
  const [error, setError] = React.useState<string | null>(null);
  const [isZipping, setIsZipping] = React.useState(false);
  const [isBatchMode, setIsBatchMode] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    // [메시지] 생성 시작
    // alert(t('controlPanel.generateStart')); // 너무 빈번하면 주석 처리 가능

    setIsGenerating(true);
    setError(null);
    const countToGenerate = isBatchMode ? batchSize : 1;
    
    const requests = Array.from({ length: countToGenerate }).map(() => 
      apiService.generateImage(prompt, selectedStyle, generationType)
        .then(url => ({ status: 'fulfilled', value: url }))
        .catch(err => ({ status: 'rejected', reason: err }))
    );

    try {
      const results = await Promise.all(requests);
      let successCount = 0;
      results.forEach((result: any) => {
        if (result.status === 'fulfilled') {
          addGeneratedImage({
            id: crypto.randomUUID(),
            url: result.value,
            prompt: prompt,
            createdAt: Date.now(),
            type: generationType
          });
          successCount++;
        }
      });
      if (successCount === 0) throw new Error("All generations failed.");
      
      // [메시지] 생성 완료 (선택 사항)
      // alert(t('controlPanel.generateSuccess'));

    } catch (err: any) {
      setError(err.message || "Failed to generate images.");
      alert(t('controlPanel.generateFail')); // [메시지] 실패
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadAll = async () => {
    if (generatedImages.length === 0) return;
    
    // [메시지] 다운로드 시작
    alert(t('controlPanel.downloadStart'));

    setIsZipping(true);
    try {
        const zip = new JSZip();
        const folder = zip.folder("game_assets");
        const imagePromises = generatedImages.map(async (img: any) => {
            try {
                const response = await fetch(img.url);
                if(!response.ok) throw new Error("Fetch failed");
                const blob = await response.blob();
                const safeStyle = selectedStyle.replace(/[^a-zA-Z0-9]/g, '_');
                folder?.file(`${img.type}_${safeStyle}_${img.createdAt}.png`, blob);
            } catch (e) { console.warn(e); }
        });
        await Promise.all(imagePromises);
        const content = await zip.generateAsync({ type: "blob" });
        const url = window.URL.createObjectURL(content);
        const link = document.createElement('a');
        link.href = url;
        link.download = `export_${Date.now()}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (err) { 
        alert(t('controlPanel.downloadFail')); // [메시지] 실패
    } finally { 
        setIsZipping(false); 
    }
  };

  const typeOptions = [
    { id: GenerationType.FULL_FACE, label: t('parts.fullFace'), icon: <User size={14} /> },
    { id: GenerationType.FACE_SHAPE, label: t('parts.faceShape'), icon: <Circle size={14} /> },
    { id: GenerationType.EYES, label: t('parts.eyes'), icon: <Eye size={14} /> },
    { id: GenerationType.NOSE, label: t('parts.nose'), icon: <Circle size={8} className="fill-current" /> }, 
    { id: GenerationType.MOUTH, label: t('parts.mouth'), icon: <Smile size={14} /> },
    { id: GenerationType.HAIR, label: t('parts.hair'), icon: <Wand2 size={14} /> },
  ];
  const readyCustomModels = customModels?.filter((m: any) => m.status === 'succeeded') || [];

  return (
    <aside id="tutorial-controls" className={`w-80 h-full ${colors.bgPanel} border-l ${colors.border} flex flex-col shrink-0 transition-colors duration-300`}>
      <div className={`h-14 border-b ${colors.border} flex items-center px-6`}>
        <h2 className={`${colors.textPrimary} font-semibold text-sm flex items-center gap-2`}>
          <Wand2 size={16} className={colors.accentText} />
          {t('controlPanel.title')}
        </h2>
      </div>

      <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
        <div className="space-y-2">
          <label className={`text-xs font-medium ${colors.textSecondary} uppercase tracking-wider`}>{t('controlPanel.targetPart')}</label>
          <div className="grid grid-cols-2 gap-2">
            {typeOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setGenerationType(opt.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium border transition-all ${
                  generationType === opt.id
                    ? `${colors.accentBg} bg-opacity-10 ${colors.accentText} border-current`
                    : `${colors.inputBg} ${colors.border} ${colors.textSecondary} hover:opacity-80`
                }`}
              >
                {opt.icon}
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className={`text-xs font-medium ${colors.textSecondary} uppercase tracking-wider`}>{t('controlPanel.assetStyle')}</label>
          <div className="relative">
            <select 
              value={selectedStyle}
              onChange={(e) => setSelectedStyle(e.target.value)}
              className={`w-full ${colors.inputBg} ${colors.textPrimary} text-sm border ${colors.border} rounded-lg p-3 pr-10 appearance-none focus:outline-none focus:ring-1 focus:ring-current transition-all`}
            >
              <optgroup label={t('controlPanel.presetStyles')}>
                <option value="anime_v1">Anime Cel-Shaded</option>
                <option value="pixel_art">Pixel Art (16-bit)</option>
                <option value="realistic">Realistic 3D Render</option>
                <option value="watercolor">Watercolor / Hand-painted</option>
                <option value="fantasy_rpg">Dark Fantasy RPG</option>
              </optgroup>
              {readyCustomModels.length > 0 && (
                <optgroup label={t('controlPanel.myStyles')}>
                  {readyCustomModels.map((m: any) => (
                    <option key={m.id} value={`custom_${m.versionId}|${m.triggerWord}`}>{m.name}</option>
                  ))}
                </optgroup>
              )}
            </select>
            <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 ${colors.textSecondary} pointer-events-none`} size={16} />
          </div>
        </div>

        <div id="tutorial-batch" className={`space-y-3 p-3 rounded-lg border ${colors.border} bg-black/5`}>
           <div className="flex justify-between items-center">
             <div className="flex items-center gap-2">
                 <Copy size={12} className={colors.textSecondary} />
                 <span className={`text-xs font-medium ${colors.textPrimary}`}>{t('controlPanel.batchMode')}</span>
             </div>
             <button 
                onClick={() => setIsBatchMode(!isBatchMode)}
                className={`${colors.accentText} hover:opacity-80 focus:outline-none`}
             >
                 {isBatchMode ? <ToggleRight size={24} /> : <ToggleLeft size={24} className={colors.textSecondary} />}
             </button>
           </div>
           
           {isBatchMode && (
             <div className="pt-2 animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="flex justify-between items-center mb-2">
                    <span className={`text-[10px] ${colors.textSecondary} uppercase tracking-wide`}>{t('controlPanel.quantity')}</span>
                    <span className={`${colors.accentText} font-mono text-xs font-bold`}>{batchSize}</span>
                </div>
                <input 
                    type="range" min="1" max="10" step="1"
                    value={batchSize}
                    onChange={(e) => setBatchSize(parseInt(e.target.value))}
                    className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-gray-600 accent-${colors.accent}-500`}
                />
             </div>
           )}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className={`text-xs font-medium ${colors.textSecondary} uppercase tracking-wider`}>{t('controlPanel.prompt')}</label>
            <span className={`text-[10px] ${colors.textSecondary}`}>{prompt.length}/500</span>
          </div>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={t('controlPanel.promptPlaceholder')}
            className={`w-full h-24 ${colors.inputBg} ${colors.textPrimary} text-sm border ${colors.border} rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-current transition-all resize-none placeholder:opacity-50`}
          />
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg flex gap-2 items-start">
            <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
            <p className="text-xs text-red-400 leading-snug">{error}</p>
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className={`w-full py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-semibold text-sm transition-all shadow-lg ${
            isGenerating || !prompt.trim()
              ? `bg-gray-700/50 text-gray-500 cursor-not-allowed`
              : `${colors.accentBg} text-white hover:opacity-90 active:scale-[0.98]`
          }`}
        >
          {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
          {isGenerating ? t('controlPanel.generating') : t('controlPanel.generate')}
        </button>

        <div id="tutorial-history" className={`border-t ${colors.border} pt-6`}>
          <div className="flex items-center justify-between mb-4">
              <label className={`text-xs font-medium ${colors.textSecondary} uppercase tracking-wider block`}>{t('controlPanel.history')}</label>
              {generatedImages.length > 0 && (
                <button 
                  onClick={handleDownloadAll}
                  disabled={isZipping}
                  className={`text-[10px] flex items-center gap-1 ${colors.accentText} hover:opacity-80 transition-colors disabled:opacity-50`}
                >
                  {isZipping ? <Loader2 size={10} className="animate-spin" /> : <DownloadCloud size={12} />} {t('controlPanel.exportAll')}
                </button>
              )}
          </div>
          
          {generatedImages.length === 0 ? (
            <div className={`text-center py-8 px-4 rounded-lg border border-dashed ${colors.border} bg-black/5`}>
              <span className={`${colors.textSecondary} text-xs`}>{t('controlPanel.noAssets')}</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {generatedImages.map((img: any) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImageId(img.id)}
                  className={`relative group aspect-square rounded-md overflow-hidden border transition-all ${
                    selectedImageId === img.id 
                      ? `${colors.border} ring-2 ring-current ${colors.accentText}` 
                      : `${colors.border} hover:opacity-80`
                  }`}
                >
                  <img src={img.url} alt={img.prompt} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default ControlPanel;