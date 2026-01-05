import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { X, ChevronRight, ChevronLeft, Check } from 'lucide-react';

const TutorialOverlay: React.FC = () => {
  const { isTutorialActive, setTutorialActive, t, getThemeColors } = useStore() as any;
  const colors = getThemeColors();
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const steps = [
    { targetId: 'tutorial-nav', title: t('tutorial.step1_title'), desc: t('tutorial.step1_desc') },
    { targetId: 'tutorial-canvas', title: t('tutorial.step2_title'), desc: t('tutorial.step2_desc') },
    { targetId: 'tutorial-controls', title: t('tutorial.step3_title'), desc: t('tutorial.step3_desc') },
    { targetId: 'tutorial-batch', title: t('tutorial.step4_title'), desc: t('tutorial.step4_desc') },
    { targetId: 'tutorial-history', title: t('tutorial.step5_title'), desc: t('tutorial.step5_desc') },
  ];

  useEffect(() => {
    if (!isTutorialActive) {
      setTargetRect(null);
      return;
    }

    const updatePosition = () => {
      const targetId = steps[currentStep].targetId;
      const element = document.getElementById(targetId);
      if (element) {
        setTargetRect(element.getBoundingClientRect());
        // 강조된 요소가 화면에 보이도록 스크롤
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        setTargetRect(null);
      }
    };

    // 약간의 딜레이를 주어 UI 렌더링 후 위치 계산
    const timer = setTimeout(updatePosition, 300);
    window.addEventListener('resize', updatePosition);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isTutorialActive, currentStep]);

  if (!isTutorialActive) return null;

  const handleNext = () => {
    if (currentStep < steps.length - 1) setCurrentStep(prev => prev + 1);
    else handleFinish();
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  const handleFinish = () => {
    setTutorialActive(false);
    setCurrentStep(0);
  };

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden">
      {/* Backdrop with hole */}
      <div className="absolute inset-0 bg-black/70 mix-blend-hard-light transition-all duration-300"></div>

      {/* Highlighter Box */}
      {targetRect && (
        <div 
          className="absolute border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.7)] rounded-lg transition-all duration-300 ease-out z-[101] pointer-events-none box-content"
          style={{
            top: targetRect.top - 4,
            left: targetRect.left - 4,
            width: targetRect.width + 8,
            height: targetRect.height + 8,
          }}
        >
           {/* Pulsing effect */}
           <span className="absolute -inset-1 rounded-lg border-2 border-white/50 animate-ping"></span>
        </div>
      )}

      {/* Tooltip Card */}
      {targetRect && (
        <div 
          className={`absolute z-[102] w-80 p-5 rounded-xl shadow-2xl transition-all duration-300 ${colors.bgPanel} border ${colors.border}`}
          style={{
            top: targetRect.top + targetRect.height + 20 > window.innerHeight - 200 
                 ? targetRect.top - 200 // 화면 아래쪽이면 위로 표시
                 : targetRect.top + targetRect.height + 20, // 아니면 아래로 표시
            left: Math.max(20, Math.min(window.innerWidth - 340, targetRect.left)),
          }}
        >
          <div className="flex justify-between items-start mb-3">
             <h3 className={`font-bold text-lg ${colors.textPrimary}`}>{step.title}</h3>
             <button onClick={handleFinish} className={`${colors.textSecondary} hover:text-current`}>
                <X size={18} />
             </button>
          </div>
          
          <p className={`${colors.textSecondary} text-sm mb-6 leading-relaxed`}>
            {step.desc}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex gap-1">
               {steps.map((_, idx) => (
                  <div key={idx} className={`h-1.5 w-1.5 rounded-full ${idx === currentStep ? colors.accentBg : 'bg-gray-600'}`}></div>
               ))}
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={handlePrev} 
                disabled={currentStep === 0}
                className={`p-2 rounded-full border ${colors.border} ${colors.textSecondary} hover:bg-black/10 disabled:opacity-30`}
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                onClick={handleNext}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold text-white ${colors.accentBg} hover:opacity-90`}
              >
                {currentStep === steps.length - 1 ? (
                   <>{t('tutorial.finish')} <Check size={14} /></>
                ) : (
                   <>{t('tutorial.next')} <ChevronRight size={14} /></>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TutorialOverlay;