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

    interface Subscription {
        id: string;
        icon: ImageSourcePropType;
        name: string;
        plan?: string;
        frequency?: Frequency;
        category?: Category;
        paymentMethod?: string;
        status?: string;
        startDate?: string;
        price: number;
        currency?: string;
        billing: string;
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
