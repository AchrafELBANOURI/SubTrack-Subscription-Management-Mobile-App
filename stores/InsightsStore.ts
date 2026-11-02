import { create } from "zustand";

interface InsightsUiState {
    selectedDay: string | null;
    isOptionsModalVisible: boolean;
    showAllUpcoming: boolean;
    showAllHistory: boolean;
    isClearExpensesHistoryConfirmationModalVisible : boolean,
    setSelectedDay: (day: string | null) => void;
    setOptionsModalVisible: (visible: boolean) => void;
    setShowAllUpcoming: (show: boolean) => void;
    setShowAllHistory: (show: boolean) => void;
    setClearExpensesHistoryConfirmationModalVisible: (visible : boolean) => void;
    toggleAllHistory: () => void;
    toggleAllUpcoming: () => void;
    resetUiState: () => void;
}

export const useInsightsUiStore = create<InsightsUiState>((set) => ({
    selectedDay: new Date().toDateString(),
    isOptionsModalVisible: false,
    showAllUpcoming: false,
    showAllHistory: false,
    isClearExpensesHistoryConfirmationModalVisible : false,

    setSelectedDay: (day) => set({ selectedDay: day }),
    setOptionsModalVisible: (visible) => set({ isOptionsModalVisible: visible }),
    setShowAllUpcoming: (show) => set({ showAllUpcoming: show }),
    setShowAllHistory: (show) => set({ showAllHistory: show }),
    setClearExpensesHistoryConfirmationModalVisible  : (visible) => set({isClearExpensesHistoryConfirmationModalVisible : visible}),
    toggleAllHistory: () =>
        set((state) => ({ showAllHistory: !state.showAllHistory })),
    toggleAllUpcoming: () =>
        set((state) => ({ showAllUpcoming: !state.showAllUpcoming })),
    resetUiState: () =>
        set({
            selectedDay: new Date().toDateString(),
            isOptionsModalVisible: false,
            showAllUpcoming: false,
            showAllHistory: false,
            isClearExpensesHistoryConfirmationModalVisible:false,
        }),
}));
