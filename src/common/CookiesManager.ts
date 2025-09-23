import specialModeManager from "./special-mode/SpecialModeManager";
import { i18nManager, languageManager } from "./i18n";
import { TranslationKeys } from "./i18n/TranslationKeys";

class CookiesManager {
    private cookieConsent: HTMLElement | null = null;
    private acceptBtn: HTMLElement | null = null;
    private rejectBtn: HTMLElement | null = null;
    private legalPages: HTMLElement | null = null;
    private legalContent: HTMLElement | null = null;

    public init(): void {
        this.initializeElements();
        this.setupLegalPages();
        this.setupCookieConsent();
        this.setupGlobalFunctions();
        this.checkInitialLegalPage();
        this.updateUITexts();
        
        // Listen for language changes to update UI texts
        languageManager.addLanguageChangeObserver(() => {
            this.updateUITexts();
            this.refreshLegalPagesContent();
        });
    }

    private updateUITexts(): void {
        this.updateCookieBannerText();
        this.updateFullscreenDialogText();
    }

    private updateCookieBannerText(): void {
        const bannerMessage = document.getElementById('cookie-banner-message');
        const acceptBtn = document.getElementById('acceptCookies');
        const rejectBtn = document.getElementById('rejectCookies');
        const privacyLink = document.querySelector('a[href="/privacy-policy"]');
        const termsLink = document.querySelector('a[href="/terms-of-service"]');
        const learnMoreLink = document.querySelector('a[href="/cookie-policy"]');

        if (bannerMessage) {
            bannerMessage.innerHTML = `${i18nManager.translate(TranslationKeys.COOKIES.BANNER_MESSAGE)} <a href="/cookie-policy" onclick="showLegalPage('cookie-policy'); return false;" style="color: #3498db; text-decoration: underline;">${i18nManager.translate(TranslationKeys.COOKIES.LEARN_MORE)}</a>`;
        }

        if (acceptBtn) {
            acceptBtn.textContent = i18nManager.translate(TranslationKeys.COOKIES.ACCEPT);
        }

        if (rejectBtn) {
            rejectBtn.textContent = i18nManager.translate(TranslationKeys.COOKIES.REJECT);
        }

        if (privacyLink) {
            privacyLink.textContent = i18nManager.translate(TranslationKeys.COOKIES.PRIVACY_POLICY);
        }

        if (termsLink) {
            termsLink.textContent = i18nManager.translate(TranslationKeys.COOKIES.TERMS_OF_SERVICE);
        }
    }

    private updateFullscreenDialogText(): void {
        const fullscreenText = document.getElementById('fullscreen-dialog-text');
        const enterBtn = document.getElementById('enterFullscreenBtn');
        const exitBtn = document.getElementById('exitFullscreenBtn');

        if (fullscreenText) {
            fullscreenText.textContent = i18nManager.translate(TranslationKeys.FULLSCREEN.REQUIRED_MESSAGE);
        }

        if (enterBtn) {
            enterBtn.textContent = i18nManager.translate(TranslationKeys.FULLSCREEN.ENTER_BUTTON);
        }

        if (exitBtn) {
            exitBtn.textContent = i18nManager.translate(TranslationKeys.FULLSCREEN.EXIT_BUTTON);
        }
    }

    private refreshLegalPagesContent(): void {
        // Refresh the current legal page if it's open
        const currentPath = window.location.pathname;
        if (currentPath.includes('privacy-policy') || currentPath.includes('terms-of-service') || currentPath.includes('cookie-policy')) {
            const page = currentPath.replace('.html', '').replace('/', '');
            (window as any).showLegalPage(page);
        }
    }

    private initializeElements(): void {
        this.cookieConsent = document.getElementById('cookie-consent');
        this.acceptBtn = document.getElementById('acceptCookies');
        this.rejectBtn = document.getElementById('rejectCookies');
        this.legalPages = document.getElementById('legal-pages');
        this.legalContent = document.getElementById('legal-content');
    }

    private setupCookieConsent(): void {
        if (!this.cookieConsent || !this.acceptBtn || !this.rejectBtn) {
            console.error('Cookie consent elements not found');
            return;
        }

        // Check if user has already made a choice and if special mode allows cookie banner
        const hasConsent = localStorage.getItem('cookiesAccepted');
        const shouldShowBanner = hasConsent === null && specialModeManager.cookiesBannerVisible(true);
        
        if (shouldShowBanner) {
            this.cookieConsent.style.display = 'block';
        }
        
        // Handle accept all cookies
        this.acceptBtn.addEventListener('click', () => {
            const shouldUseCookies = specialModeManager.useCookies(true);
            localStorage.setItem('cookiesAccepted', shouldUseCookies ? 'true' : 'false');
            localStorage.setItem('analyticsEnabled', shouldUseCookies ? 'true' : 'false');
            this.cookieConsent!.style.display = 'none';
        });
        
        // Handle reject non-essential cookies
        this.rejectBtn.addEventListener('click', () => {
            const shouldUseCookies = specialModeManager.useCookies(true);
            localStorage.setItem('cookiesAccepted', shouldUseCookies ? 'true' : 'false');
            localStorage.setItem('analyticsEnabled', 'false');
            this.cookieConsent!.style.display = 'none';
        });
    }

    private setupLegalPages(): void {
        if (!this.legalPages || !this.legalContent) {
            return;
        }

        const legalPagesContent = {
            'privacy-policy': `
                <a href="#" class="back-link" style="display: inline-block; margin-bottom: 20px; color: #3498db; text-decoration: none; font-weight: bold;">${i18nManager.translate(TranslationKeys.LEGAL.BACK_TO_GAME)}</a>
                
                <h1 style="color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px;">Privacy Policy</h1>
                
                <div style="background-color: #ecf0f1; padding: 15px; border-left: 4px solid #3498db; margin: 20px 0;">
                    <strong>Last Updated:</strong> September 2025<br>
                    <strong>Effective Date:</strong> September 2025
                </div>

                <p>Welcome to Swing Puzzles! This Privacy Policy explains how we collect, use, and protect your information when you use our 3D jigsaw puzzle game.</p>

                <h2 style="color: #34495e; margin-top: 30px;">1. Information We Collect</h2>

                <h3 style="color: #7f8c8d;">1.1 Information You Provide Directly</h3>
                <ul style="padding-left: 20px;">
                    <li><strong>Gift Creation Data:</strong> When creating puzzle gifts, you may provide:
                        <ul>
                            <li>Friend's name (stored locally only)</li>
                            <li>Age information</li>
                            <li>Custom wish text</li>
                            <li>Language preferences</li>
                            <li>Visual customization choices</li>
                        </ul>
                    </li>
                    <li><strong>Game Preferences:</strong> Your selected puzzle categories and difficulty settings</li>
                </ul>

                <h3 style="color: #7f8c8d;">1.2 Information We Collect Automatically</h3>
                <ul style="padding-left: 20px;">
                    <li><strong>Game Performance Data:</strong> Solve times, completion rates, and gameplay patterns</li>
                    <li><strong>Technical Data:</strong> Device information, browser type, screen resolution</li>
                    <li><strong>Usage Analytics:</strong> How you interact with the game interface</li>
                    <li><strong>Error Information:</strong> Technical errors to help improve the game</li>
                </ul>

                <h2 style="color: #34495e; margin-top: 30px;">2. How We Use Your Information</h2>

                <h3 style="color: #7f8c8d;">2.1 Game Functionality</h3>
                <ul style="padding-left: 20px;">
                    <li>Remember your tutorial progress and preferences</li>
                    <li>Save your game settings and customizations</li>
                    <li>Enable gift creation and sharing features</li>
                    <li>Improve game performance and user experience</li>
                </ul>

                <h3 style="color: #7f8c8d;">2.2 Analytics and Improvement</h3>
                <ul style="padding-left: 20px;">
                    <li>Understand how players use our game</li>
                    <li>Identify and fix technical issues</li>
                    <li>Optimize game performance</li>
                    <li>Develop new features based on usage patterns</li>
                </ul>

                <h2 style="color: #34495e; margin-top: 30px;">3. Data Storage and Security</h2>

                <h3 style="color: #7f8c8d;">3.1 Local Storage</h3>
                <p>Most of your data is stored locally in your browser using localStorage. This includes:</p>
                <ul style="padding-left: 20px;">
                    <li>Game progress and preferences</li>
                    <li>Gift creation data</li>
                    <li>Analytics events (up to 50 recent events)</li>
                    <li>Cookie consent preferences</li>
                </ul>

                <h3 style="color: #7f8c8d;">3.2 Third-Party Services</h3>
                <p>We use Microsoft Clarity for website analytics. Clarity may collect:</p>
                <ul style="padding-left: 20px;">
                    <li>Page views and user interactions</li>
                    <li>Device and browser information</li>
                    <li>Session recordings (anonymized)</li>
                </ul>
                <p><strong>Clarity Privacy:</strong> Microsoft Clarity is GDPR compliant and does not collect personally identifiable information. Learn more at <a href="https://privacy.microsoft.com/en-us/privacystatement" target="_blank" rel="noopener noreferrer" style="color: #3498db;">Microsoft's Privacy Statement</a>.</p>

                <h3 style="color: #7f8c8d;">3.3 Amazon Associates Program</h3>
                <p>We participate in the Amazon Associates Program, which means we may earn commissions from qualifying purchases made through our affiliate links. When you click on puzzle purchase links in our game:</p>
                <ul style="padding-left: 20px;">
                    <li>You may be redirected to Amazon.com or regional Amazon sites</li>
                    <li>Amazon may collect information about your visit and purchases</li>
                    <li>We may receive a small commission if you make a qualifying purchase</li>
                    <li>This does not affect the price you pay for products</li>
                </ul>
                <p><strong>Amazon Privacy:</strong> Amazon's data collection and privacy practices are governed by their own privacy policy. We do not have access to your personal information or purchase details from Amazon.</p>

                <h2 style="color: #34495e; margin-top: 30px;">4. Your Rights and Choices</h2>

                <h3 style="color: #7f8c8d;">4.1 Data Control</h3>
                <ul style="padding-left: 20px;">
                    <li><strong>Clear Data:</strong> You can clear all local storage data through your browser settings</li>
                    <li><strong>Disable Analytics:</strong> Analytics can be disabled in your browser's "Do Not Track" settings</li>
                    <li><strong>Cookie Consent:</strong> You can withdraw cookie consent at any time</li>
                </ul>

                <h3 style="color: #7f8c8d;">4.2 Data Retention</h3>
                <ul style="padding-left: 20px;">
                    <li>Local storage data persists until you clear it or uninstall the app</li>
                    <li>Analytics events are automatically limited to 50 recent events</li>
                    <li>Clarity data is retained according to Microsoft's policies</li>
                </ul>

                <h2 style="color: #34495e; margin-top: 30px;">5. Children's Privacy</h2>
                <p>Our game is designed for all ages. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately.</p>

                <h2 style="color: #34495e; margin-top: 30px;">6. International Users</h2>
                <p>If you are accessing our game from outside the United States, please be aware that your information may be transferred to, stored, and processed in the United States where our servers are located.</p>

                <h2 style="color: #34495e; margin-top: 30px;">7. Changes to This Policy</h2>
                <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.</p>

                <h2 style="color: #34495e; margin-top: 30px;">8. Contact Us</h2>
                <div style="background-color: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p>If you have any questions about this Privacy Policy or our data practices, please contact us:</p>
                    <ul style="padding-left: 20px;">
                        <li><strong>Website:</strong> <a href="https://swingpuzzles.com" target="_blank" rel="noopener noreferrer" style="color: #3498db;">swingpuzzles.com</a></li>
                        <li><strong>Email:</strong> privacy@swingpuzzles.com</li>
                    </ul>
                </div>

                <div style="font-style: italic; color: #7f8c8d; text-align: right; margin-top: 30px;">
                    This Privacy Policy was last updated on September 2025.
                </div>
            `,
            'terms-of-service': `
                <a href="#" class="back-link" style="display: inline-block; margin-bottom: 20px; color: #3498db; text-decoration: none; font-weight: bold;">${i18nManager.translate(TranslationKeys.LEGAL.BACK_TO_GAME)}</a>
                
                <h1 style="color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px;">Terms of Service</h1>
                
                <div style="background-color: #ecf0f1; padding: 15px; border-left: 4px solid #3498db; margin: 20px 0;">
                    <strong>Last Updated:</strong> September 2025<br>
                    <strong>Effective Date:</strong> September 2025
                </div>

                <p>Welcome to Swing Puzzles! These Terms of Service ("Terms") govern your use of our 3D jigsaw puzzle game and related services. By accessing or using our game, you agree to be bound by these Terms.</p>

                <h2 style="color: #34495e; margin-top: 30px;"><span style="color: #3498db; font-weight: bold;">1.</span> Acceptance of Terms</h2>
                <p>By accessing, downloading, or using Swing Puzzles, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, please do not use our game.</p>

                <h2 style="color: #34495e; margin-top: 30px;"><span style="color: #3498db; font-weight: bold;">2.</span> Description of Service</h2>
                <p>Swing Puzzles is a web-based 3D jigsaw puzzle game that allows users to:</p>
                <ul style="padding-left: 20px;">
                    <li>Solve interactive 3D jigsaw puzzles in various categories</li>
                    <li>Create and share custom puzzle gifts with friends</li>
                    <li>Customize puzzle difficulty and appearance</li>
                    <li>Track game progress and achievements</li>
                </ul>

                <h2 style="color: #34495e; margin-top: 30px;"><span style="color: #3498db; font-weight: bold;">3.</span> User Accounts and Eligibility</h2>
                <h3 style="color: #7f8c8d;">3.1 No Account Required</h3>
                <p>You can use Swing Puzzles without creating an account. All data is stored locally in your browser.</p>
                
                <h3 style="color: #7f8c8d;">3.2 Age Requirements</h3>
                <p>Our game is suitable for all ages. Users under 13 should have parental supervision when using the gift creation features.</p>

                <h2 style="color: #34495e; margin-top: 30px;"><span style="color: #3498db; font-weight: bold;">4.</span> Acceptable Use</h2>
                
                <h3 style="color: #7f8c8d;">4.1 Permitted Uses</h3>
                <p>You may use Swing Puzzles for personal, non-commercial entertainment purposes only.</p>

                <h3 style="color: #7f8c8d;">4.2 Prohibited Uses</h3>
                <p>You agree not to:</p>
                <ul style="padding-left: 20px;">
                    <li>Use the game for any illegal or unauthorized purpose</li>
                    <li>Attempt to reverse engineer, decompile, or disassemble the game</li>
                    <li>Create inappropriate or offensive content using the gift creation features</li>
                    <li>Interfere with or disrupt the game's functionality</li>
                    <li>Use automated systems to access the game</li>
                    <li>Share malicious links or harmful content through gift sharing</li>
                </ul>

                <h2 style="color: #34495e; margin-top: 30px;"><span style="color: #3498db; font-weight: bold;">5.</span> Intellectual Property</h2>
                
                <h3 style="color: #7f8c8d;">5.1 Our Rights</h3>
                <p>Swing Puzzles and all related content, including but not limited to:</p>
                <ul style="padding-left: 20px;">
                    <li>Game code, graphics, and audio</li>
                    <li>User interface design and layout</li>
                    <li>Puzzle images and content</li>
                    <li>Trademarks and logos</li>
                </ul>
                <p>are owned by us and protected by copyright, trademark, and other intellectual property laws.</p>

                <h3 style="color: #7f8c8d;">5.2 Your Content</h3>
                <p>When you create gifts or customize puzzles, you retain ownership of your original content. However, you grant us a license to use, display, and distribute your content as necessary to provide the service.</p>

                <h2 style="color: #34495e; margin-top: 30px;"><span style="color: #3498db; font-weight: bold;">6.</span> Privacy and Data</h2>
                <p>Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and protect your information.</p>

                <h2 style="color: #34495e; margin-top: 30px;"><span style="color: #3498db; font-weight: bold;">7.</span> Disclaimers and Limitations</h2>
                
                <div style="background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0;">
                    <h3 style="color: #7f8c8d;">7.1 Service Availability</h3>
                    <p>We strive to provide continuous service, but we cannot guarantee that Swing Puzzles will be available at all times. The service may be temporarily unavailable due to maintenance, updates, or technical issues.</p>
                </div>

                <h3 style="color: #7f8c8d;">7.2 No Warranties</h3>
                <p>Swing Puzzles is provided "as is" without warranties of any kind, either express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement.</p>

                <h3 style="color: #7f8c8d;">7.3 Limitation of Liability</h3>
                <p>To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or use, arising from your use of the game.</p>

                <h2 style="color: #34495e; margin-top: 30px;"><span style="color: #3498db; font-weight: bold;">8.</span> Third-Party Services</h2>
                <p>Our game may integrate with third-party services such as Microsoft Clarity for analytics. These services have their own terms and privacy policies, which we encourage you to review.</p>

                <h2 style="color: #34495e; margin-top: 30px;"><span style="color: #3498db; font-weight: bold;">8.1</span> Amazon Associates Program</h2>
                <p>Swing Puzzles participates in the Amazon Associates Program. This means:</p>
                <ul style="padding-left: 20px;">
                    <li>We may include affiliate links to physical puzzle products on Amazon</li>
                    <li>We may earn commissions from qualifying purchases made through these links</li>
                    <li>You are not obligated to purchase anything through our affiliate links</li>
                    <li>Purchasing through our links does not affect the price you pay</li>
                    <li>Amazon's terms of service and privacy policy apply to all purchases</li>
                </ul>
                <p><strong>Disclosure:</strong> We are required to disclose that we may receive compensation for purchases made through our affiliate links, in accordance with FTC guidelines and Amazon Associates Program requirements.</p>

                <h2 style="color: #34495e; margin-top: 30px;"><span style="color: #3498db; font-weight: bold;">9.</span> Termination</h2>
                <p>We reserve the right to terminate or suspend your access to Swing Puzzles at any time, with or without notice, for any reason, including violation of these Terms.</p>

                <h2 style="color: #34495e; margin-top: 30px;"><span style="color: #3498db; font-weight: bold;">10.</span> Changes to Terms</h2>
                <p>We may update these Terms from time to time. We will notify you of any material changes by posting the new Terms on this page and updating the "Last Updated" date. Your continued use of the game after such changes constitutes acceptance of the new Terms.</p>

                <h2 style="color: #34495e; margin-top: 30px;"><span style="color: #3498db; font-weight: bold;">11.</span> Governing Law</h2>
                <p>These Terms shall be governed by and construed in accordance with the laws of the United States, without regard to conflict of law principles.</p>

                <h2 style="color: #34495e; margin-top: 30px;"><span style="color: #3498db; font-weight: bold;">12.</span> Severability</h2>
                <p>If any provision of these Terms is found to be unenforceable or invalid, the remaining provisions will remain in full force and effect.</p>

                <h2 style="color: #34495e; margin-top: 30px;"><span style="color: #3498db; font-weight: bold;">13.</span> Contact Information</h2>
                <div style="background-color: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p>If you have any questions about these Terms of Service, please contact us:</p>
                    <ul style="padding-left: 20px;">
                        <li><strong>Website:</strong> <a href="https://swingpuzzles.com" target="_blank" rel="noopener noreferrer" style="color: #3498db;">swingpuzzles.com</a></li>
                        <li><strong>Email:</strong> legal@swingpuzzles.com</li>
                    </ul>
                </div>

                <div style="font-style: italic; color: #7f8c8d; text-align: right; margin-top: 30px;">
                    These Terms of Service were last updated on September 2025.
                </div>
            `,
            'cookie-policy': `
                <a href="#" class="back-link" style="display: inline-block; margin-bottom: 20px; color: #3498db; text-decoration: none; font-weight: bold;">${i18nManager.translate(TranslationKeys.LEGAL.BACK_TO_GAME)}</a>
                
                <h1 style="color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px;">Cookie Policy</h1>
                
                <div style="background-color: #ecf0f1; padding: 15px; border-left: 4px solid #3498db; margin: 20px 0;">
                    <strong>Last Updated:</strong> September 2025<br>
                    <strong>Effective Date:</strong> September 2025
                </div>

                <p>This Cookie Policy explains how Swing Puzzles uses cookies and similar technologies when you visit our website and play our 3D jigsaw puzzle game.</p>

                <h2 style="color: #34495e; margin-top: 30px;">What Are Cookies?</h2>
                <p>Cookies are small text files that are stored on your device when you visit a website. They help websites remember information about your visit, such as your preferences and settings, which can make your next visit easier and the site more useful to you.</p>

                <h2 style="color: #34495e; margin-top: 30px;">How We Use Cookies</h2>
                <p>We use cookies and similar technologies to:</p>
                <ul style="padding-left: 20px;">
                    <li>Remember your game preferences and settings</li>
                    <li>Track your progress through tutorials</li>
                    <li>Analyze how you use our game to improve the experience</li>
                    <li>Remember your cookie consent preferences</li>
                </ul>

                <h2 style="color: #34495e; margin-top: 30px;">Types of Cookies We Use</h2>

                <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                    <thead>
                        <tr>
                            <th style="border: 1px solid #ddd; padding: 12px; text-align: left; background-color: #f8f9fa; font-weight: bold;">Cookie Type</th>
                            <th style="border: 1px solid #ddd; padding: 12px; text-align: left; background-color: #f8f9fa; font-weight: bold;">Purpose</th>
                            <th style="border: 1px solid #ddd; padding: 12px; text-align: left; background-color: #f8f9fa; font-weight: bold;">Duration</th>
                            <th style="border: 1px solid #ddd; padding: 12px; text-align: left; background-color: #f8f9fa; font-weight: bold;">Essential</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style="background-color: #d4edda;">
                            <td style="border: 1px solid #ddd; padding: 12px;"><strong>Essential Cookies</strong></td>
                            <td style="border: 1px solid #ddd; padding: 12px;">Required for basic game functionality</td>
                            <td style="border: 1px solid #ddd; padding: 12px;">Session/Persistent</td>
                            <td style="border: 1px solid #ddd; padding: 12px;">Yes</td>
                        </tr>
                        <tr style="background-color: #d4edda;">
                            <td style="border: 1px solid #ddd; padding: 12px;">tutorialDone</td>
                            <td style="border: 1px solid #ddd; padding: 12px;">Remembers if you've completed the tutorial</td>
                            <td style="border: 1px solid #ddd; padding: 12px;">Persistent</td>
                            <td style="border: 1px solid #ddd; padding: 12px;">Yes</td>
                        </tr>
                        <tr style="background-color: #d4edda;">
                            <td style="border: 1px solid #ddd; padding: 12px;">giftTutorialDone</td>
                            <td style="border: 1px solid #ddd; padding: 12px;">Remembers if you've completed the gift tutorial</td>
                            <td style="border: 1px solid #ddd; padding: 12px;">Persistent</td>
                            <td style="border: 1px solid #ddd; padding: 12px;">Yes</td>
                        </tr>
                        <tr style="background-color: #d4edda;">
                            <td style="border: 1px solid #ddd; padding: 12px;">category</td>
                            <td style="border: 1px solid #ddd; padding: 12px;">Stores your selected puzzle category preference</td>
                            <td style="border: 1px solid #ddd; padding: 12px;">Persistent</td>
                            <td style="border: 1px solid #ddd; padding: 12px;">Yes</td>
                        </tr>
                        <tr style="background-color: #d4edda;">
                            <td style="border: 1px solid #ddd; padding: 12px;">giftPiecesCount</td>
                            <td style="border: 1px solid #ddd; padding: 12px;">Remembers your preferred gift puzzle piece count</td>
                            <td style="border: 1px solid #ddd; padding: 12px;">Persistent</td>
                            <td style="border: 1px solid #ddd; padding: 12px;">Yes</td>
                        </tr>
                        <tr style="background-color: #d4edda;">
                            <td style="border: 1px solid #ddd; padding: 12px;">cookiesAccepted</td>
                            <td style="border: 1px solid #ddd; padding: 12px;">Stores your cookie consent preference</td>
                            <td style="border: 1px solid #ddd; padding: 12px;">Persistent</td>
                            <td style="border: 1px solid #ddd; padding: 12px;">Yes</td>
                        </tr>
                        <tr style="background-color: #fff3cd;">
                            <td style="border: 1px solid #ddd; padding: 12px;"><strong>Analytics Cookies</strong></td>
                            <td style="border: 1px solid #ddd; padding: 12px;">Help us understand how you use our game</td>
                            <td style="border: 1px solid #ddd; padding: 12px;">Various</td>
                            <td style="border: 1px solid #ddd; padding: 12px;">No</td>
                        </tr>
                        <tr style="background-color: #fff3cd;">
                            <td style="border: 1px solid #ddd; padding: 12px;">analytics_events</td>
                            <td style="border: 1px solid #ddd; padding: 12px;">Stores recent game events for analysis (max 50 events)</td>
                            <td style="border: 1px solid #ddd; padding: 12px;">Persistent</td>
                            <td style="border: 1px solid #ddd; padding: 12px;">No</td>
                        </tr>
                        <tr style="background-color: #fff3cd;">
                            <td style="border: 1px solid #ddd; padding: 12px;">Microsoft Clarity</td>
                            <td style="border: 1px solid #ddd; padding: 12px;">Website analytics and user behavior tracking</td>
                            <td style="border: 1px solid #ddd; padding: 12px;">13 months</td>
                            <td style="border: 1px solid #ddd; padding: 12px;">No</td>
                        </tr>
                    </tbody>
                </table>

                <h2 style="color: #34495e; margin-top: 30px;">Third-Party Cookies</h2>
                
                <h3 style="color: #7f8c8d;">Microsoft Clarity</h3>
                <p>We use Microsoft Clarity to analyze how users interact with our game. Clarity may set the following cookies:</p>
                <ul style="padding-left: 20px;">
                    <li><strong>_clck:</strong> Persists the Clarity user ID and preferences</li>
                    <li><strong>_clsk:</strong> Connects multiple page views by a user into a single Clarity session recording</li>
                    <li><strong>_cltk:</strong> Identifies unique users</li>
                </ul>
                <p>These cookies help us understand user behavior and improve our game. Clarity does not collect personally identifiable information. You can learn more about Microsoft Clarity's privacy practices in their <a href="https://privacy.microsoft.com/en-us/privacystatement" target="_blank" rel="noopener noreferrer" style="color: #3498db;">Privacy Statement</a>.</p>

                <h3 style="color: #7f8c8d;">Amazon Associates</h3>
                <p>We participate in the Amazon Associates Program and may include affiliate links to physical puzzle products. Amazon may set cookies when you visit their site through our links:</p>
                <ul style="padding-left: 20px;">
                    <li><strong>Amazon cookies:</strong> Track your browsing and purchase behavior on Amazon</li>
                    <li><strong>Affiliate tracking:</strong> Identify that you came from our site</li>
                    <li><strong>Purchase attribution:</strong> Determine if we should receive commission</li>
                </ul>
                <p>Amazon's cookie and privacy policies govern these cookies. We do not have access to your Amazon browsing or purchase data.</p>

                <h2 style="color: #34495e; margin-top: 30px;">Local Storage</h2>
                <p>In addition to cookies, we use browser local storage to store:</p>
                <ul style="padding-left: 20px;">
                    <li>Game progress and settings</li>
                    <li>Gift creation data (when creating custom gifts)</li>
                    <li>User preferences and customizations</li>
                    <li>Analytics events (limited to 50 recent events)</li>
                </ul>
                <p>Local storage data persists until you clear your browser data or uninstall the application.</p>

                <h2 style="color: #34495e; margin-top: 30px;">Managing Your Cookie Preferences</h2>
                
                <div style="background-color: #e3f2fd; padding: 20px; border-radius: 5px; margin: 20px 0;">
                    <h3 style="color: #7f8c8d;">Cookie Controls</h3>
                    <p>You can control cookies in several ways:</p>
                    <ul style="padding-left: 20px;">
                        <li><strong>Browser Settings:</strong> Most browsers allow you to refuse or delete cookies through their settings</li>
                        <li><strong>Do Not Track:</strong> Enable "Do Not Track" in your browser to disable analytics</li>
                        <li><strong>Clear Data:</strong> Clear your browser's local storage to remove all stored data</li>
                    </ul>
                    
                    <button onclick="clearLocalStorage()" style="background-color: #3498db; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; margin: 5px;">Clear All Local Data</button>
                    <button onclick="withdrawConsent()" style="background-color: #3498db; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; margin: 5px;">Withdraw Cookie Consent</button>
                </div>

                <h2 style="color: #34495e; margin-top: 30px;">Essential vs Non-Essential Cookies</h2>
                
                <h3 style="color: #7f8c8d;">Essential Cookies</h3>
                <p>These cookies are necessary for the game to function properly. They cannot be disabled and include:</p>
                <ul style="padding-left: 20px;">
                    <li>Game progress and settings storage</li>
                    <li>Tutorial completion tracking</li>
                    <li>User preference storage</li>
                    <li>Cookie consent management</li>
                </ul>

                <h3 style="color: #7f8c8d;">Non-Essential Cookies</h3>
                <p>These cookies enhance your experience but are not required for basic functionality:</p>
                <ul style="padding-left: 20px;">
                    <li>Analytics and usage tracking</li>
                    <li>Performance monitoring</li>
                    <li>User behavior analysis</li>
                </ul>

                <h2 style="color: #34495e; margin-top: 30px;">Impact of Disabling Cookies</h2>
                <p>If you disable cookies:</p>
                <ul style="padding-left: 20px;">
                    <li><strong>Essential cookies:</strong> The game may not function properly or remember your preferences</li>
                    <li><strong>Analytics cookies:</strong> We won't be able to track usage patterns, but the game will work normally</li>
                    <li><strong>Local storage:</strong> Game progress and settings may not be saved between sessions</li>
                </ul>

                <h2 style="color: #34495e; margin-top: 30px;">Updates to This Policy</h2>
                <p>We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes by posting the updated policy on this page.</p>

                <h2 style="color: #34495e; margin-top: 30px;">Contact Us</h2>
                <div style="background-color: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p>If you have any questions about our use of cookies, please contact us:</p>
                    <ul style="padding-left: 20px;">
                        <li><strong>Website:</strong> <a href="https://swingpuzzles.com" target="_blank" rel="noopener noreferrer" style="color: #3498db;">swingpuzzles.com</a></li>
                        <li><strong>Email:</strong> privacy@swingpuzzles.com</li>
                    </ul>
                </div>

                <div style="font-style: italic; color: #7f8c8d; text-align: right; margin-top: 30px;">
                    This Cookie Policy was last updated on September 2025.
                </div>
            `
        };

        // Handle legal page navigation
        (window as any).showLegalPage = (page: string) => {
            if (!this.legalPages || !this.legalContent) return;
            
            this.legalPages.style.display = 'block';
            // Hide the main game canvas
            const canvas = document.querySelector('canvas');
            if (canvas) canvas.style.display = 'none';
            
            // Load the appropriate legal page content
            if (legalPagesContent[page as keyof typeof legalPagesContent]) {
                this.legalContent.innerHTML = legalPagesContent[page as keyof typeof legalPagesContent];
            } else {
                this.legalContent.innerHTML = `
                    <div style="padding: 40px; text-align: center;">
                        <h1>${i18nManager.translate(TranslationKeys.LEGAL.PAGE_NOT_FOUND)}</h1>
                        <p>${i18nManager.translate(TranslationKeys.LEGAL.PAGE_NOT_FOUND_MESSAGE)}</p>
                        <a href="#" class="back-link" style="color: #3498db; text-decoration: underline;">${i18nManager.translate(TranslationKeys.LEGAL.BACK_TO_GAME)}</a>
                    </div>
                `;
            }
        };

        (window as any).hideLegalPage = () => {
            if (!this.legalPages) return;
            
            this.legalPages.style.display = 'none';
            // Show the main game canvas
            const canvas = document.querySelector('canvas');
            if (canvas) canvas.style.display = 'block';
        };

        // Handle back button clicks in legal pages
        this.legalContent.addEventListener('click', (e) => {
            if ((e.target as HTMLElement).classList.contains('back-link')) {
                e.preventDefault();
                (window as any).hideLegalPage();
                // Update URL to remove legal page
                window.history.pushState({}, '', window.location.pathname);
            }
        });

        // Handle browser back/forward buttons
        window.addEventListener('popstate', () => {
            const path = window.location.pathname;
            if (path.includes('privacy-policy') || path.includes('terms-of-service') || path.includes('cookie-policy')) {
                const page = path.replace('.html', '').replace('/', '');
                (window as any).showLegalPage(page);
            } else {
                (window as any).hideLegalPage();
            }
        });
    }

    private setupGlobalFunctions(): void {
        // Helper functions for cookie policy
        (window as any).clearLocalStorage = () => {
            if (confirm('This will clear all your game progress and settings. Are you sure?')) {
                localStorage.clear();
                alert('All local data has been cleared. The page will reload.');
                location.reload();
            }
        };

        (window as any).withdrawConsent = () => {
            localStorage.setItem('cookiesAccepted', 'false');
            alert('Cookie consent has been withdrawn. Analytics tracking has been disabled.');
        };
    }

    private checkInitialLegalPage(): void {
        const path = window.location.pathname;
        if (path.includes('privacy-policy') || path.includes('terms-of-service') || path.includes('cookie-policy')) {
            const page = path.replace('.html', '').replace('/', '');
            (window as any).showLegalPage(page);
        }
    }
}

const cookiesManager = new CookiesManager();
export default cookiesManager;
