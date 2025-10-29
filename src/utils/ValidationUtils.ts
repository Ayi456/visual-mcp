export class ValidationUtils {
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validateUsername(username: string): boolean {
    const usernameRegex = /^[\w\u4e00-\u9fa5]{3,50}$/;
    return usernameRegex.test(username);
  }

  static validatePhone(phone: string): boolean {
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phone);
  }
}
