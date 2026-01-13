// 확실하게 실제 서버를 호출하도록 설정
const IS_MOCK = false; 
console.log("[Client] Running in Production Mode. Mocking is disabled.");

export const apiService = {
  startTraining: async (modelName: string, triggerWord: string, files: File[]) => {
    try {
      if (IS_MOCK) {
        console.log("Mock Training Started:", { modelName, triggerWord, fileCount: files.length });
        await new Promise(resolve => setTimeout(resolve, 1500)); 
        return "mock-training-id-" + Date.now();
      } else {
        const formData = new FormData();
        formData.append('modelName', modelName);
        formData.append('triggerWord', triggerWord);
        files.forEach((file) => formData.append('images', file));
        
        const response = await fetch(`/api/train`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
           const errorData = await response.json().catch(() => ({}));
           throw new Error(errorData.error || `Server responded with status ${response.status}`);
        }

        const data = await response.json();
        return data.trainingId;
      }
    } catch (error: any) {
      console.error("API Error (startTraining):", error);
      throw error;
    }
  },

  generateImage: async (prompt: string, style: string, type: string) => {
    try {
      if (IS_MOCK) {
        console.log("Mock Image Generation Started:", { prompt, style, type });
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 정수형 seed 값을 사용하여 이미지 서버의 에러를 방지합니다.
        const randomId = Math.floor(Math.random() * 1000);
        return `https://picsum.photos/seed/${randomId}/512/640`; 
      } else {
        const response = await fetch(`/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, style, type }),
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'GENERATE_FAILED' }));
          throw new Error(errorData.error || 'GENERATE_FAILED');
        }
        const data = await response.json();
        return data.url;
      }
    } catch (error) {
      console.error("API Error (generateImage):", error);
      throw error;
    }
  },

  checkTrainingStatus: async (trainingId: string) => {
    try {
      if (IS_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 500));
        return { status: 'succeeded', version: 'mock-v1' };
      } else {
        const response = await fetch(`/api/train/${trainingId}`);
        if (!response.ok) throw new Error('CHECK_STATUS_FAILED');
        return await response.json();
      }
    } catch (error) {
      console.error("API Error (checkTrainingStatus):", error);
      throw error;
    }
  },

  removeBackground: async (imageUrl: string) => {
    try {
      if (IS_MOCK) {
        console.log("Mock Background Removal Started:", imageUrl);
        await new Promise(resolve => setTimeout(resolve, 1500));
        return imageUrl; 
      } else {
        const response = await fetch(`/api/remove-bg`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: imageUrl }),
        });
        if (!response.ok) throw new Error('REMOVE_BG_FAILED');
        const data = await response.json();
        return data.url;
      }
    } catch (error) {
      console.error("API Error (removeBackground):", error);
      throw error;
    }
  }
};
