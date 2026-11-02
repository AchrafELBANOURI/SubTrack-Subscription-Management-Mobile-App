import dayjs from "dayjs";

export const formatCurrency = (value: number, currency = "USD"): string => {
    try {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value);
    } catch {
        return value.toFixed(2);
    }
};

export const formatSubscriptionDateTime = (value?: string): string => {
    if (!value) return "Not provided";
    const parsedDate = dayjs(value);
    return parsedDate.isValid()
        ? parsedDate.format("DD MMMM YYYY [at] HH:mm")
        : "Invalid Date Format";
};

export const formatStatusLabel = (value?: string): string => {
    if (!value) return "Unknown";
    return value.charAt(0).toUpperCase() + value.slice(1);
};

export const getRenewalDateFromForm = (form: FormState) => {
    const now = dayjs();
    const unitMap: Record<
        FrequencyPeriod["period"],
        "day" | "week" | "month" | "year"
    > = {
        Days: "day",
        Weeks: "week",
        Months: "month",
        Years: "year",
    };

    return now
        .add(
            form.frequencyPeriod.frequency,
            unitMap[form.frequencyPeriod.period],
        )
        .toISOString();
};

export function getLogoUrl(domain: string, theme: "light" | "dark" = "light") {
    const token = process.env.EXPO_PUBLIC_LOGO_DEV_PUBLISHABLE_KEY!;
    return `https://img.logo.dev/${domain}?token=${token}&size=128&format=png&theme=${theme}`;
}

export function formatHistoryDate(dateString?: string) {
    if (!dateString) return "Recently";
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        });
    } catch {
        return dateString;
    }
}