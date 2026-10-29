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

    interface User {
        id: number;
        clerkUserId: string;
        email: string | null;
        createdAt: string;
    }

    interface Subscription {
        id: string;
        icon?: ImageSourcePropType;
        name: string;
        plan?: string | null;
        frequency?: Frequency;
        frequencyPeriod?: FrequencyPeriod;
        category?: Category | null;
        paymentMethod?: string | null;
        status?: Status;
        price: number;
        currency: Currency;
        startDate?: string | null;
        renewalDate?: string | null;
        color?: string | null;
    }

    interface SubscriptionPayload extends Omit<Subscription, "id"> {}

    type Category =
        | "Entertainment"
        | "AI Tools"
        | "Developer Tools"
        | "Design"
        | "Productivity"
        | "Other";

    type Frequency = "Daily" | "Weekly" | "Monthly" | "Yearly";

    type Status = "active" | "paused";

    type FrequencyPeriod = {
        frequency: number;
        period: "Days" | "Weeks" | "Months" | "Years";
    };

    type Currency = "USD" | "EUR" | "MAD";

    interface SubscriptionCardProps extends Omit<Subscription, "id"> {
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
