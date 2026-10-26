import {
    create,
    type StoreApi,
    type StateCreator,
    UseBoundStore,
} from "zustand";
import { HOME_SUBSCRIPTIONS } from "../constants/data";

interface SubscriptionStore {
    subscriptions: Subscription[];
    addSubscription: (subscription: Subscription) => void;
    setSubscriptions: (subscriptions: Subscription[]) => void;
    setSubscriptionById: (
        subscriptionId: string,
        subscription: Subscription,
    ) => void;
}

const subscriptionStoreFactory: StateCreator<SubscriptionStore> = (set) => ({
    subscriptions: HOME_SUBSCRIPTIONS,

    addSubscription: (newSubscription: Subscription) => {
        set((state: SubscriptionStore) => ({
            subscriptions: [newSubscription, ...state.subscriptions],
        }));
    },

    setSubscriptions: (subscriptions: Subscription[]) => set({ subscriptions }),

    setSubscriptionById(subscriptionId, subscription) {
        return set((state) => ({
            subscriptions: state.subscriptions.map((sub) =>
                sub.id === subscriptionId ? subscription : sub,
            ),
        }));
    },
});

export const useSubscriptionStore: UseBoundStore<StoreApi<SubscriptionStore>> =
    create<SubscriptionStore>(subscriptionStoreFactory);
