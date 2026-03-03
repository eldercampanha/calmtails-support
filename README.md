# Calm Tails Privacy Policy

_Last updated: 2025-02-13_

## Auth Redirect Fallback Page

This repository includes a static Supabase auth redirect/fallback page at:
`/calmtails-support/auth/confirm/`

Public URL:
`https://eldercampanha.github.io/calmtails-support/auth/confirm`

Purpose:
- Handles email auth redirects from Supabase.
- Detects callback status from URL query/hash parameters.
- Provides clear instructions and install fallback links when the app is not installed.

Supported states:
- `success_confirmed`: token/session detected, normal confirmation flow.
- `success_recovery`: token/session detected with recovery flow.
- `expired`: expired token/link indicators detected.
- `invalid`: invalid or already-used link indicators detected.
- `unknown_error`: catch-all fallback when status cannot be determined.

Expected behavior:
- Status page attempts one automatic deep-link open on load and also shows an explicit `Open CalmTails App` button.
- Success states tell users to return to the CalmTails app to continue.
- Expired/invalid states instruct users to open the app, sign in again, and request a new email link.
- A web fallback note includes a `Return to sign in` link if the app does not open.
- In non-production hosts, a debug panel displays detected state and masked parsed params.

Calm Tails (“the App”) is developed and maintained by Elder Baltazar (“we”, “us”, or “our”). This Privacy Policy explains how the App handles information when you use it on your device.

## 1. Information We Collect

Calm Tails does not require you to create an account and does not collect personally identifiable information (such as your name, email address, or phone number).

The App stores entries, logs, and settings locally on your device. These records stay on your device unless you explicitly export, share, or back them up through features you choose to use.

### Device Permissions

- **Notifications:** Used to deliver reminders you configure. Notification schedules are stored locally.
- **Storage / File access:** Used when you generate or export PDF reports. Exported files are saved to locations you select.
- **Orientation & display permissions:** Used to provide a consistent viewing experience.

Calm Tails does **not** access your contacts, camera, microphone, or precise location.

## 2. Third-Party Services

The App integrates with third-party libraries that help deliver core functionality (for example, React Native components, charting utilities, and PDF generation). These libraries operate within the App and do not receive personal data unless you explicitly share exported files using another app or service.

If you open, share, or back up files using third-party apps (email, cloud storage providers, messaging apps, etc.), their privacy policies will apply.

## 3. Data Storage and Security

All data you enter into Calm Tails is stored locally on your device. We recommend protecting your device with a secure passcode and keeping your operating system up to date.

If you uninstall the App, the locally stored data is deleted. We are not able to recover deleted entries.

## 4. Children’s Privacy

Calm Tails is intended for use by adults. We do not knowingly collect information from children. If you are a parent or guardian and believe a child has provided data through the App, please delete the App from the device to remove stored information.

## 5. Your Choices

- **Export / Delete:** You can export specific logs or delete entries from within the App at any time.
- **Notifications:** You can enable or disable notifications in your device settings.
- **Permissions:** You can revoke permissions such as storage or notifications through your device settings. Note that revoking certain permissions may limit functionality (for example, exporting PDFs).

## 6. Changes to This Policy

We may update this Privacy Policy to reflect changes to the App or to comply with legal requirements. When we make changes, we will update the “Last updated” date at the top of this page. Continued use of the App after an update means you accept the revised policy.

## 7. Contact Us

For questions or concerns about this Privacy Policy or the App, contact:

**Elder Baltazar**  
Email: elderbaltazar@gmail.com

---

By using Calm Tails, you agree to this Privacy Policy. If you do not agree with the policy, please discontinue use of the App.
