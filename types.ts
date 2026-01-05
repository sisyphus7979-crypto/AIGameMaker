export enum MenuId {
  STYLE_TRAINING = 'style_training',
  CHARACTER_PARTS = 'character_parts',
  FACE_CUSTOM = 'face_custom',
  MONSTER_OBJECT = 'monster_object',
  BACKGROUND_MAP = 'background_map',
  SETTINGS = 'settings',
}

export enum GenerationType {
  FULL_FACE = 'full_face',
  EYES = 'eyes',
  NOSE = 'nose',
  MOUTH = 'mouth',
  HAIR = 'hair',
  FACE_SHAPE = 'face_shape',
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  createdAt: number;
  type: GenerationType;
}

export interface Layer {
  id: string;
  imageId: string;
  url: string;
  type: GenerationType;
  isVisible: boolean;
  x: number;
  y: number;
  scale: number;
  zIndex: number;
}

export interface CustomModel {
  id: string;
  name: string;
  triggerWord: string;
  status: 'starting' | 'processing' | 'succeeded' | 'failed';
  versionId?: string; // The Replicate model version ID or LoRA weights URL
  trainingId?: string;
  createdAt: number;
}

export interface AppState {
  activeMenu: MenuId;
  setActiveMenu: (menu: MenuId) => void;
  
  // Generation Controls
  prompt: string;
  setPrompt: (prompt: string) => void;
  selectedStyle: string;
  setSelectedStyle: (style: string) => void;
  generationType: GenerationType;
  setGenerationType: (type: GenerationType) => void;

  // History / Gallery
  generatedImages: GeneratedImage[];
  addGeneratedImage: (image: GeneratedImage) => void;
  updateGeneratedImage: (id: string, newUrl: string) => void;
  selectedImageId: string | null;
  setSelectedImageId: (id: string | null) => void;

  // Canvas & Layers
  layers: Layer[];
  addLayer: (image: GeneratedImage) => void;
  updateLayer: (id: string, updates: Partial<Layer>) => void;
  removeLayer: (id: string) => void;
  activeLayerId: string | null;
  setActiveLayerId: (id: string | null) => void;
  
  // Guide
  isGuideVisible: boolean;
  setIsGuideVisible: (visible: boolean) => void;

  // Style Training
  customModels: CustomModel[];
  addCustomModel: (model: CustomModel) => void;
  updateCustomModel: (id: string, updates: Partial<CustomModel>) => void;

  isGenerating: boolean;
  setIsGenerating: (isGenerating: boolean) => void;

  // Settings & I18n
  language: string;
  setLanguage: (lang: string) => void;
  apiKey: string;
  setApiKey: (key: string) => void;
  t: (path: string) => string;
}