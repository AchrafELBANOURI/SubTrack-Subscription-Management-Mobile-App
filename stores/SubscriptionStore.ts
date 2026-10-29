import { create } from "zustand";

interface SubscriptionUiState {
    expandedSubscriptionId: string | number | null;
    isCreateModalVisible: boolean;
    isUpdateModalVisible: boolean;
    isDeleteModalVisible: boolean;
    searchQuery: string;
    setExpandedSubscriptionId: (subscriptionId: string | number | null) => void;
    setCreateModalVisible: (visible: boolean) => void;
    setUpdateModalVisible: (visible: boolean) => void;
    setDeleteModalVisible: (visible: boolean) => void;
    setSearchQuery: (value: string) => void;
    toggleExpandedSubscriptionId: (subscriptionId: string | number) => void;
    resetUiState: () => void;
}

export const useSubscriptionUiStore = create<SubscriptionUiState>(
    (set, get) => ({
        expandedSubscriptionId: null,
        isCreateModalVisible: false,
        isUpdateModalVisible: false,
        isDeleteModalVisible: false,
        searchQuery: "",

        setExpandedSubscriptionId: (subscriptionId) =>
            set({ expandedSubscriptionId: subscriptionId }),

        setCreateModalVisible: (visible) =>
            set({ isCreateModalVisible: visible }),

        setUpdateModalVisible: (visible) =>
            set({ isUpdateModalVisible: visible }),

        setDeleteModalVisible: (visible) =>
            set({ isDeleteModalVisible: visible }),

        setSearchQuery: (value) => set({ searchQuery: value }),

        toggleExpandedSubscriptionId: (subscriptionId) => {
            const { expandedSubscriptionId } = get();
            const isExpanding = expandedSubscriptionId !== subscriptionId;

            set({
                expandedSubscriptionId: isExpanding ? subscriptionId : null,
            });
        },

        resetUiState: () =>
            set({
                expandedSubscriptionId: null,
                isCreateModalVisible: false,
                searchQuery: "",
            }),
    }),
);
