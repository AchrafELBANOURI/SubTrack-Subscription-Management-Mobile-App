const emailPattern: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isValidEmail = (email: string) => emailPattern.test(email);

export const isValidPassword = (password: string) => password.length >= 8;

export const isFormValid = (emailAddress: string, password: string) =>
    isValidEmail(emailAddress) && isValidPassword(password);

export const isValidPrice = (price: string) => {
    const trimmedPrice = price.trim();

    if (!trimmedPrice) return false;

    if (!/^\s*[+-]?(\d+(\.\d+)?|\.\d+)\s*$/.test(trimmedPrice)) return false;

    const numValue = Number(trimmedPrice);

    return Number.isFinite(numValue) && numValue > 0;
};

export const validateSubscriptionForm = (name: string, price: string) =>
    name.trim() !== "" && isValidPrice(price);
