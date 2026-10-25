const emailPattern: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isValidEmail = (email: string) => emailPattern.test(email);

export const isValidPassword = (password: string) => password.length >= 8;

export const isFormValid = (emailAddress: string, password: string) =>
    isValidEmail(emailAddress) && isValidPassword(password);
