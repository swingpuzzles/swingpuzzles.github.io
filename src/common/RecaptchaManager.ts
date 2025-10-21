/**
 * Simple manager for reCAPTCHA v2 checkbox integration
 */
export class RecaptchaManager {
    private static isLoaded = false;
    private static siteKey: string | null = null;
    private static widgetId: number | null = null;

    /**
     * Load reCAPTCHA script and initialize
     * @param siteKey The reCAPTCHA site key
     */
    public static async loadRecaptcha(siteKey: string): Promise<void> {
        this.siteKey = siteKey;
        
        if (this.isLoaded) {
            return;
        }

        return new Promise((resolve, reject) => {
            // Check if already loaded
            if (typeof (window as any).grecaptcha !== 'undefined') {
                this.isLoaded = true;
                resolve();
                return;
            }

            // Create script element
            const script = document.createElement('script');
            script.src = `https://www.google.com/recaptcha/api.js`;
            script.async = true;
            script.defer = true;
            
            script.onload = () => {
                this.isLoaded = true;
                resolve();
            };
            
            script.onerror = () => {
                reject(new Error('Failed to load reCAPTCHA script'));
            };

            document.head.appendChild(script);
        });
    }

    /**
     * Show reCAPTCHA checkbox in a modal
     * @param callback Function to call when reCAPTCHA is completed
     * @returns Promise that resolves with the token
     */
    public static async showCheckbox(callback: (token: string) => void): Promise<string> {
        if (!this.isLoaded || !this.siteKey) {
            throw new Error('reCAPTCHA not loaded. Call loadRecaptcha first.');
        }

        return new Promise((resolve, reject) => {
            // Create modal overlay
            const modal = document.createElement('div');
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
            `;

            // Create modal content
            const modalContent = document.createElement('div');
            modalContent.style.cssText = `
                background: white;
                padding: 20px;
                border-radius: 10px;
                text-align: center;
                max-width: 400px;
                width: 90%;
            `;

            // Add title
            const title = document.createElement('h3');
            title.textContent = 'Please verify you are human';
            title.style.marginBottom = '20px';
            modalContent.appendChild(title);

            // Create reCAPTCHA container
            const recaptchaContainer = document.createElement('div');
            recaptchaContainer.id = 'recaptcha-modal';
            recaptchaContainer.style.marginBottom = '20px';
            modalContent.appendChild(recaptchaContainer);

            // Add close button
            const closeButton = document.createElement('button');
            closeButton.textContent = 'Cancel';
            closeButton.style.cssText = `
                background: #e74c3c;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                margin-right: 10px;
            `;
            closeButton.onclick = () => {
                document.body.removeChild(modal);
                reject(new Error('User cancelled reCAPTCHA'));
            };
            modalContent.appendChild(closeButton);

            modal.appendChild(modalContent);
            document.body.appendChild(modal);

            // Create reCAPTCHA widget
            try {
                this.widgetId = (window as any).grecaptcha.render('recaptcha-modal', {
                    'sitekey': this.siteKey,
                    'callback': (token: string) => {
                        document.body.removeChild(modal);
                        callback(token);
                        resolve(token);
                    },
                    'theme': 'light',
                    'size': 'normal'
                });
            } catch (error) {
                document.body.removeChild(modal);
                reject(error);
            }
        });
    }

    /**
     * Reset reCAPTCHA widget
     */
    public static resetWidget(): void {
        if (this.widgetId !== null && typeof (window as any).grecaptcha !== 'undefined') {
            (window as any).grecaptcha.reset(this.widgetId);
        }
    }
}

export default RecaptchaManager;
