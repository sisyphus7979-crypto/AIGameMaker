import { create } from 'zustand';
import { TRANSLATIONS } from './constants/translations';
import { THEMES } from './constants/themes';
import { GenerationType, MenuId } from './types';

// 타입 정의 (types.ts에 없다면 여기에 포함)
interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  createdAt: number;
  type: string;
}

interface AppState {
  // 기존 상태들
  prompt: string;
  setPrompt: (prompt: string) => void;
  selectedStyle: string;
  setSelectedStyle: (style: string) => void;
  generationType: GenerationType;
  setGenerationType: (type: GenerationType) => void;
  isGenerating: boolean;
  setIsGenerating: (isGenerating: boolean) => void;
  generatedImages: GeneratedImage[];
  addGeneratedImage: (image: GeneratedImage) => void;
  selectedImageId: string | null;
  setSelectedImageId: (id: string | null) => void;
  customModels: any[];
  addCustomModel: (model: any) => void;
  updateCustomModel: (id: string, updates: any) => void;
  batchSize: number;
  setBatchSize: (size: number) => void;
  
  // UI 상태
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
  language: string;
  setLanguage: (lang: string) => void;
  apiKey: string;
  setApiKey: (key: string) => void;
  theme: string;
  setTheme: (theme: string) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (isOpen: boolean) => void;

  // 캔버스 상태
  layers: any[];
  activeLayerId: string | null;
  setActiveLayerId: (id: string | null) => void;
  addLayer: (layer: any) => void;
  updateLayer: (id: string, updates: any) => void;
  removeLayer: (id: string) => void;
  isGuideVisible: boolean;
  setIsGuideVisible: (visible: boolean) => void;
  updateGeneratedImage: (id: string, url: string) => void;

  // [신규] 튜토리얼 상태
  isTutorialActive: boolean;
  setTutorialActive: (isActive: boolean) => void;

  // 헬퍼
  t: (path: string) => string;
  getThemeColors: () => any;
}

export const useStore = create<AppState>((set, get) => ({
  prompt: '',
  setPrompt: (prompt) => set({ prompt }),
  selectedStyle: 'anime_v1',
  setSelectedStyle: (style) => set({ selectedStyle: style }),
  generationType: GenerationType.FULL_FACE,
  setGenerationType: (type) => set({ generationType: type }),
  isGenerating: false,
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  generatedImages: [],
  addGeneratedImage: (image) => set((state) => ({ generatedImages: [image, ...state.generatedImages] })),
  selectedImageId: null,
  setSelectedImageId: (id) => set({ selectedImageId: id }),
  customModels: [],
  addCustomModel: (model) => set((state) => ({ customModels: [...state.customModels, model] })),
  updateCustomModel: (id, updates) => set((state) => ({
    customModels: state.customModels.map(m => m.id === id ? { ...m, ...updates } : m)
  })),
  batchSize: 1,
  setBatchSize: (batchSize) => set({ batchSize }),

  activeMenu: MenuId.FACE_CUSTOM,
  setActiveMenu: (activeMenu) => set({ activeMenu }),
  language: 'ko',
  setLanguage: (language) => set({ language }),
  
  apiKey: localStorage.getItem('replicate_api_key') || '',
  setApiKey: (apiKey) => {
    localStorage.setItem('replicate_api_key', apiKey);
    set({ apiKey });
  },

  theme: 'dark',
  setTheme: (theme) => set({ theme }),
  mobileMenuOpen: false,
  setMobileMenuOpen: (mobileMenuOpen) => set({ mobileMenuOpen }),

  // 캔버스 관련 초기값
  layers: [],
  activeLayerId: null,
  setActiveLayerId: (id) => set({ activeLayerId: id }),
  addLayer: (layer) => set((state) => ({ layers: [...state.layers, layer] })),
  updateLayer: (id, updates) => set((state) => ({
    layers: state.layers.map(l => l.id === id ? { ...l, ...updates } : l)
  })),
  removeLayer: (id) => set((state) => ({
    layers: state.layers.filter(l => l.id !== id),
    activeLayerId: state.activeLayerId === id ? null : state.activeLayerId
  })),
  isGuideVisible: false,
  setIsGuideVisible: (visible) => set({ isGuideVisible: visible }),
  updateGeneratedImage: (id, url) => set((state) => ({
      generatedImages: state.generatedImages.map(img => img.id === id ? { ...img, url } : img),
      layers: state.layers.map(l => l.imageId === id ? { ...l, url } : l)
  })),

  // [신규] 튜토리얼 초기값
  isTutorialActive: false,
  setTutorialActive: (isTutorialActive) => set({ isTutorialActive }),

  t: (path: string) => {
    const lang = get().language;
    const keys = path.split('.');
    let value = TRANSLATIONS[lang] || TRANSLATIONS['en'];
    for (const key of keys) {
      if (value && value[key]) value = value[key];
      else return path;
    }
    return value;
  },

  getThemeColors: () => {
    const currentTheme = get().theme;
    return THEMES[currentTheme]?.colors || THEMES['dark'].colors;
  }
}));

export default useStore;