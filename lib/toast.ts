import Toast from "react-native-toast-message";

export const getErrorMessage = (
    error: unknown,
    fallback = "Please try again.",
): string => {
    if (error instanceof Error && error.message) {
        return error.message;
    }

    if (typeof error === "string" && error.trim()) {
        return error;
    }

    return fallback;
};

export const showToast = ({
    type,
    title,
    message,
}: {
    type: "success" | "error" | "info";
    title: string;
    message?: string;
}) => {
    Toast.show({
        type,
        text1: title,
        text2: message,
    });
};

export const showSuccessToast = (
    title: string,
    message = "Action completed successfully.",
) => {
    showToast({ type: "success", title, message });
};

export const showErrorToast = (
    title: string,
    message = "Please try again.",
) => {
    showToast({ type: "error", title, message });
};
