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
        ? parsedDate.format("MM/DD/YYYY")
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

    const nextValue =
        form.frequency === "Monthly"
            ? { frequency: 1, period: "Months" as const }
            : form.frequency === "Yearly"
              ? { frequency: 1, period: "Years" as const }
              : form.frequencyPeriod;

    return now
        .add(nextValue.frequency, unitMap[nextValue.period])
        .toISOString();
};
