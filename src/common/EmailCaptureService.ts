import i18nManager from "./i18n/I18nManager";

export interface EmailCaptureData {
    email: string;
    name?: string;
    locale: string;
    hotPot: string;
    recaptchaToken: string;
    timezone: string; // IANA timezone, e.g., "Europe/Bratislava"
}

export interface EmailCaptureResponse {
    success: boolean;
    message?: string;
}

/**
 * Service for handling email capture form submissions
 */
export class EmailCaptureService {
    private static readonly BACKEND_URL = 'https://swingpuzzlesmail.gamer.gd/process.php';

    /**
     * Submit email capture data to the external PHP backend
     * @param formData The form data to submit
     * @returns Promise that resolves with the response
     */
    public static async submitEmailCapture(formData: EmailCaptureData): Promise<EmailCaptureResponse> {
        try {
            const response = await fetch(this.BACKEND_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return {
                success: result.success || false,
                message: result.message
            };
        } catch (error) {
            console.error('Email capture submission error:', error);
            return {
                success: false,
                message: 'Network error occurred'
            };
        }
    }

    /**
     * Get current locale from i18n manager
     */
    public static getCurrentLocale(): string {
        return i18nManager.getCurrentLanguage();
    }

    /**
     * Generate hotPot bot check value
     */
    public static generateHotPotValue(): string {
        return `email_capture_${Date.now()}`;
    }

    /**
     * Get the user's current IANA timezone (e.g., "Europe/Bratislava")
     */
    public static getCurrentTimezone(): string {
        try {
            return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
        } catch {
            return 'UTC';
        }
    }

    /**
     * Validate email format
     */
    public static validateEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}

export default EmailCaptureService;
