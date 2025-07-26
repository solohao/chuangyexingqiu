import { create } from 'zustand';

interface UiState {
  isPublishModalOpen: boolean;
  openPublishModal: () => void;
  closePublishModal: () => void;
}

export const useUiStore = create<UiState>((set: any) => ({
  isPublishModalOpen: false,
  openPublishModal: () => set({ isPublishModalOpen: true }),
  closePublishModal: () => set({ isPublishModalOpen: false }),
})); 