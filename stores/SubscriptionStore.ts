import { create } from "zustand";

interface SubscriptionUiState {
    expandedSubscriptionId: string | number | null;
    openModal: SubscriptionModal | null;
    searchQuery: string;
    setExpandedSubscriptionId: (subscriptionId: string | number | null) => void;
    openCreateModal: (owner: SubscriptionModalOwner) => void;
    openUpdateModal: (
        owner: SubscriptionModalOwner,
        subscriptionId: string | number,
    ) => void;
    openDeleteModal: (
        owner: SubscriptionModalOwner,
        subscriptionId: string | number,
    ) => void;
    closeModal: () => void;
    setSearchQuery: (value: string) => void;
    toggleExpandedSubscriptionId: (subscriptionId: string | number) => void;
    resetUiState: () => void;
}

export type SubscriptionModalOwner = "home" | "subscriptions";

type SubscriptionModal =
    | { type: "create"; owner: SubscriptionModalOwner }
    | {
          type: "update";
          owner: SubscriptionModalOwner;
          subscriptionId: string | number;
      }
    | {
          type: "delete";
          owner: SubscriptionModalOwner;
          subscriptionId: string | number;
      };

export const useSubscriptionUiStore = create<SubscriptionUiState>(
    (set, get) => ({
        expandedSubscriptionId: null,
        openModal: null,
        searchQuery: "",

        setExpandedSubscriptionId: (subscriptionId) =>
            set({ expandedSubscriptionId: subscriptionId }),

        openCreateModal: (owner) => set({ openModal: { type: "create", owner } }),

        openUpdateModal: (owner, subscriptionId) =>
            set({ openModal: { type: "update", owner, subscriptionId } }),

        openDeleteModal: (owner, subscriptionId) =>
            set({ openModal: { type: "delete", owner, subscriptionId } }),

        closeModal: () => set({ openModal: null }),

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
                openModal: null,
                searchQuery: "",
            }),
    }),
);
