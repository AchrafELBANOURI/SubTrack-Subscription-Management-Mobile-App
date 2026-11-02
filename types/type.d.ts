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
        firstName: string | null;
        lastName: string | null;
        createdAt: string;
    }

    interface Subscription {
        id: string;
        icon?: string;
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

    interface AuthBrandProps {
        title: string;
        subtitle: string;
    };

    interface WeeklyDayExpense {
        day: string;
        date: string;
        amount: number;
        isPeak: boolean;
    }

    interface Expense {
        id: number;
        subscriptionId?: number | null;
        name: string;
        amount: number;
        currency: string;
        category?: string;
        frequency?: string;
        icon?: string;
        color?: string;
        billingDate: string;
    }

    interface ExpenseInsights {
        month: string;
        totalExpenses: number;
        previousMonthExpenses: number;
        percentageChange: number;
        currency: string;
        weeklyUpcoming: WeeklyDayExpense[];
        history: Expense[];
    }
}

export {};

