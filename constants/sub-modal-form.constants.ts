export const CATEGORY_COLORS: Record<Category, string> = {
    Entertainment: "#ff6b6b",
    "AI Tools": "#b8d4e3",
    "Developer Tools": "#e8def8",
    Design: "#f5c542",
    Productivity: "#95e1d3",
    Other: "#d4d4d4",
};

export const CATEGORIES: Category[] = [
    "Entertainment",
    "AI Tools",
    "Developer Tools",
    "Design",
    "Productivity",
    "Other",
];

export const FREQUENCIES: Frequency[] = [
    "Daily",
    "Monthly",
    "Weekly",
    "Yearly",
];

export const CURRENCY_OPTIONS: Currency[] = ["USD", "EUR", "MAD"];

export const PERIOD_OPTIONS: FrequencyPeriod["period"][] = [
    "Days",
    "Weeks",
    "Months",
    "Years",
];

export const DEFAULT_FORM_STATE: FormState = {
    name: "",
    price: "",
    currency: "USD",
    plan: "",
    frequency: "Monthly",
    frequencyPeriod: { frequency: 1, period: "Months" },
    category: "Other",
};
