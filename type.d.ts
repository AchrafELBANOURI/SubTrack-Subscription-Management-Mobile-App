import type { ImageSourcePropType } from "react-native";

declare global {
    interface AppTab {
        name: string;
        title: string;
        icon: ImageSourcePropType;
    }
    interface TabIconProps {
        focused: boolean;
        icon: ImageSourcePropType;
    }

    interface UpcomingSubscription {
        id: string;
        icon: ImageSourcePropType;
        name: string;
        price: number;
        currency?: string;
        daysLeft: number;
    }

    interface UpcomingSubscriptionCardProps extends Omit<
        UpcomingSubscription,
        "id"
    > {}

    interface User {
        id: number;
        clerkUserId: string;
        email: string | null;
        createdAt: string;
    }

    interface Subscription {
        id: string | number;
        icon?: ImageSourcePropType;
        name: string;
        plan?: string | null;
        frequency?: Frequency;
        category?: Category | null;
        paymentMethod?: string | null;
        status?: string | null;
        price: number;
        currency: string;
        billing: string;
        startDate?: string | null;
        renewalDate?: string | null;
        color?: string | null;
    }

    interface SubscriptionPayload {
        name: string;
        plan?: string;
        category?: string;
        paymentMethod?: string;
        status?: string;
        price: number;
        currency: string;
        billing: string;
        startDate?: string;
        renewalDate?: string;
        color?: string;
    }

    type Category =
        | "Entertainment"
        | "AI Tools"
        | "Developer Tools"
        | "Design"
        | "Productivity"
        | "Other";

    type Frequency = "Monthly" | "Yearly";

    interface SubscriptionCardProps extends Omit<Subscription, "id"> {
        expanded: boolean;
        onPress: () => void;
        onCancelPress?: () => void;
        isCancelling?: boolean;
    }

    interface ListHeadingProps {
        title: string;
    }

    type AuthBrandProps = {
        title: string;
        subtitle: string;
    };
}

export {};
