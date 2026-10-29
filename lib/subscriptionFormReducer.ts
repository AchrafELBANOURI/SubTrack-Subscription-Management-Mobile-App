import { DEFAULT_FORM_STATE } from "../constants/sub-modal-form.constants";

type UpdateAction = {
    type: "update";
    field: keyof FormState;
    value: string | Currency | Frequency | FrequencyPeriod | Category;
};

type FrequencyAction = {
    type: "set-frequency";
    value: Frequency;
};

type ResetAction = {
    type: "reset";
    initialState?: FormState;
};

type FormAction = UpdateAction | FrequencyAction | ResetAction;

export const formReducer = (
    state: FormState,
    action: FormAction,
): FormState => {
    const FrequencyMapper: Record<Frequency, FrequencyPeriod> = {
        Daily: { frequency: state.frequencyPeriod.frequency, period: "Days" },
        Weekly: { frequency: state.frequencyPeriod.frequency, period: "Weeks" },
        Monthly: {
            frequency: state.frequencyPeriod.frequency,
            period: "Months",
        },
        Yearly: { frequency: state.frequencyPeriod.frequency, period: "Years" },
    };
    switch (action.type) {
        case "update":
            return {
                ...state,
                [action.field]: action.value,
            };

        case "set-frequency": {
            const frequencyPeriod = FrequencyMapper[action.value];

            return {
                ...state,
                frequency: action.value,
                frequencyPeriod,
            };
        }

        case "reset":
            return action.initialState ?? DEFAULT_FORM_STATE;

        default:
            return state;
    }
};
