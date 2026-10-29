declare global {
    type FormState = {
        name: string;
        price: string;
        currency: Currency;
        plan: string;
        frequency: Frequency;
        frequencyPeriod: FrequencyPeriod;
        category: Category;
    };
}

export {};
