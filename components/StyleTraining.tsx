import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, CheckCircle2, Loader2, Sparkles, HelpCircle } from 'lucide-react';
import { useStore } from '../store';
import { apiService } from '../apiService';

const StyleTraining: React.FC = () => {
  const [name, setName] = useState('');
  const [triggerWord, setTriggerWord] = useState('TOK');
  const [files, setFiles] = useState<File[]>([]);
  const [isTraining, setIsTraining] = useState(false);
  
  // 툴팁 상태 관리
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  
  const { customModels, addCustomModel, updateCustomModel, getThemeColors, t } = useStore() as any;
  const colors = getThemeColors();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const processingModels = customModels.filter((m: any) => m.status === 'starting' || m.status === 'processing');
    if (processingModels.length === 0) return;
    const interval = setInterval(async () => {
      for (const model of processingModels) {
        if (!model.trainingId) continue;
        try {
          const result = await apiService.checkTrainingStatus(model.trainingId);
          if (result.status !== model.status) {
            updateCustomModel(model.id, { status: result.status, versionId: result.version });
          }
        } catch (e) { console.error(e); }
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [customModels, updateCustomModel]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
  };

  const handleStartTraining = async () => {
    if (!name || !triggerWord || files.length === 0) return;
    setIsTraining(true);
    try {
      const trainingId = await apiService.startTraining(name, triggerWord, files);
      addCustomModel({ id: crypto.randomUUID(), name, triggerWord, status: 'starting', trainingId, createdAt: Date.now() });
      setName(''); setFiles([]); setTriggerWord('TOK');
      
      // 성공 메시지
      alert(t('styleTraining.trainingSuccess'));
      
    } catch (error: any) { 
      console.error("Training Failed:", error); // 상세 로그 출력
      
      // 에러 메시지 번역 분기 처리
      if (error.message === 'LIMIT_EXCEEDED_CLIENT') {
        alert(t('styleTraining.errorTooLarge'));
      } else if (error.message === 'LIMIT_EXCEEDED_SERVER') {
        alert(t('styleTraining.errorPayloadTooLarge'));
      } else if (error.message === 'SERVER_ADDRESS_NOT_FOUND') {
        alert(t('styleTraining.errorNotFound'));
      } else {
        // 500 에러 등 기타 서버 오류
        alert(`${t('styleTraining.errorServer')}\n(Code: ${error.message || 'Unknown'})`);
      }
    } 
    finally { 
      setIsTraining(false); 
    }
  };

  return (
    <div className={`flex-1 ${colors.bgMain} p-8 overflow-y-auto transition-colors duration-300`}>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className={`text-2xl font-bold ${colors.textPrimary} mb-2`}>{t('styleTraining.title')}</h1>
          <p className={colors.textSecondary}>{t('styleTraining.description')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className={`${colors.bgPanel} border ${colors.border} rounded-xl p-6 space-y-4 overflow-visible`}>
              <h2 className={`text-lg font-semibold ${colors.textPrimary} flex items-center gap-2`}>
                <Sparkles size={20} className={colors.accentText} /> {t('styleTraining.configTitle')}
              </h2>
              
              {/* Model Name Input */}
              <div className="space-y-2 relative">
                <label className={`text-sm font-medium ${colors.textSecondary} flex items-center gap-2`}>
                    {t('styleTraining.modelName')}
                    <div 
                        className="relative"
                        onMouseEnter={() => setActiveTooltip('modelName')}
                        onMouseLeave={() => setActiveTooltip(null)}
                    >
                        <HelpCircle size={14} className="cursor-help opacity-70 hover:opacity-100" />
                        {activeTooltip === 'modelName' && (
                            <div className="absolute left-0 bottom-full mb-2 w-64 bg-black/90 text-white text-xs p-3 rounded-lg shadow-xl z-50 pointer-events-none">
                                {t('styleTraining.tooltipModelName')}
                                <div className="absolute left-1 top-full w-0 h-0 border-4 border-transparent border-t-black/90"></div>
                            </div>
                        )}
                    </div>
                </label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. My Cyberpunk Hero" className={`w-full ${colors.inputBg} border ${colors.border} rounded-lg p-3 ${colors.textPrimary} focus:outline-none focus:ring-1 focus:ring-current`} />
              </div>

              {/* Trigger Word Input */}
              <div className="space-y-2 relative">
                <label className={`text-sm font-medium ${colors.textSecondary} flex items-center gap-2`}>
                    {t('styleTraining.triggerWord')}
                    <div 
                        className="relative"
                        onMouseEnter={() => setActiveTooltip('triggerWord')}
                        onMouseLeave={() => setActiveTooltip(null)}
                    >
                        <HelpCircle size={14} className="cursor-help opacity-70 hover:opacity-100" />
                        {activeTooltip === 'triggerWord' && (
                            <div className="absolute left-0 bottom-full mb-2 w-64 bg-black/90 text-white text-xs p-3 rounded-lg shadow-xl z-50 pointer-events-none">
                                {t('styleTraining.tooltipTriggerWord')}
                                <div className="absolute left-1 top-full w-0 h-0 border-4 border-transparent border-t-black/90"></div>
                            </div>
                        )}
                    </div>
                </label>
                <input type="text" value={triggerWord} onChange={(e) => setTriggerWord(e.target.value)} placeholder="e.g. CYBER_HERO" className={`w-full ${colors.inputBg} border ${colors.border} rounded-lg p-3 ${colors.textPrimary} focus:outline-none focus:ring-1 focus:ring-current`} />
              </div>

              <div className={`border-t ${colors.border} pt-4`}>
                 <button onClick={handleStartTraining} disabled={isTraining || files.length === 0 || !name} className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 ${isTraining || files.length === 0 || !name ? `bg-gray-700/50 text-gray-500 cursor-not-allowed` : `${colors.accentBg} text-white hover:opacity-90`}`}>{isTraining ? <Loader2 className="animate-spin" /> : t('styleTraining.startTraining')}</button>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className={`text-sm font-medium ${colors.textSecondary} uppercase tracking-wider`}>{t('styleTraining.yourModels')}</h3>
              {customModels.length === 0 && <p className={`text-sm italic ${colors.textSecondary}`}>{t('styleTraining.noModels')}</p>}
              {customModels.map((model: any) => (
                <div key={model.id} className={`${colors.bgPanel} border ${colors.border} p-4 rounded-lg flex items-center justify-between`}>
                  <div><h4 className={`font-medium ${colors.textPrimary}`}>{model.name}</h4><p className={`text-xs ${colors.textSecondary}`}>Trigger: <span className={colors.accentText}>{model.triggerWord}</span></p></div>
                  <div className="flex items-center gap-2">{model.status === 'succeeded' ? <span className="text-xs text-green-500 flex items-center gap-1"><CheckCircle2 size={12} /> {t('styleTraining.statusReady')}</span> : <span className="text-xs text-amber-500 flex items-center gap-1"><Loader2 size={12} className="animate-spin" /> {t('styleTraining.statusProcessing')}</span>}</div>
                </div>
              ))}
            </div>
          </div>

          <div className={`${colors.bgPanel} border ${colors.border} rounded-xl p-6 flex flex-col h-full`}>
            <div className="flex items-center justify-between mb-4"><h2 className={`text-lg font-semibold ${colors.textPrimary}`}>{t('styleTraining.datasetTitle')}</h2><span className={`text-xs ${colors.textSecondary}`}>{files.length} images selected</span></div>
            <div className={`flex-1 border-2 border-dashed ${colors.border} rounded-lg bg-black/5 flex flex-col items-center justify-center p-8 transition-colors hover:border-current cursor-pointer`} onClick={() => (fileInputRef.current as any)?.click()}>
              <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
              <Upload size={48} className={`mb-4 ${colors.textSecondary}`} /><p className={`font-medium ${colors.textPrimary}`}>{t('styleTraining.uploadText')}</p>
              
              {/* 용량 안내 문구 추가 */}
              <p className="mt-4 text-[11px] text-zinc-500 text-center leading-relaxed">
                {t('styleTraining.uploadLimitNotice')}
              </p>
            </div>
            {files.length > 0 && (
              <div className="mt-4 grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-48 overflow-y-auto">
                {files.map((file, idx) => (
                  <div key={idx} className="relative aspect-square rounded-md overflow-hidden group">
                    <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                    <button onClick={(e) => { e.stopPropagation(); setFiles(prev => prev.filter((_, i) => i !== idx)); }} className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100"><X size={12} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StyleTraining;