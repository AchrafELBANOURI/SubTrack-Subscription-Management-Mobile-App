# SubTrack 📱


<p align="center">
  <img src="assets/images/logo-subtrack.png" alt="SubTrack logo" width="180" />
</p>

<p align="center"><strong>Track subscriptions. Understand recurring spending. Stay ahead of renewals.</strong></p>

SubTrack is a mobile subscription manager built with Expo and React Native. It lets users securely manage recurring subscriptions, calculate upcoming spending, review expense history, and receive renewal reminders.

<!-- Demo video: replace this block with a GitHub video, GIF, or hosted demo link. -->

> 🎬 **Demo video coming soon**

## ✨ Features

- 🔐 Clerk authentication with sign-up, sign-in, email verification, MFA , and secure token storage.
- 💳 Create, edit, delete, pause, and reactivate subscriptions.
- 🗓️ Flexible billing periods using a frequency and period such as `1 Month` or `2 Weeks`.
- 💰 Monthly expense totals and currency-aware formatting.
- 📊 Insights dashboard with weekly upcoming expenses, history, and month-over-month change.
- 🔎 Search subscriptions by name, category, or frequency.
- 🔔 Local subscription notifications and backend renewal reminder emails.
- ✉️ Switchable SMTP and Resend email providers in the Spring Boot backend.
- 🏷️ Dynamic Matching Subscription service logos.
- 📈 PostHog analytics for product and navigation events.
- 🌓 Native splash screen, custom fonts, safe areas, and mobile-first layouts.

## 📱 Screens

### Authentication

- **Sign in**: Existing users authenticate with Clerk.
- **Sign up**: New users create an account.
- **Email verification**: New accounts confirm their email address.
- **MFA verification**: Users complete an additional verification step when required.

### Main application

- **Home**: Greeting, monthly balance, upcoming subscriptions, and the complete subscription list.
- **Subscriptions**: Searchable subscription list with expandable cards and create-subscription flow.
- **Insights**: Weekly bar chart, expense summary, percentage change, and expense history.
- **Settings**: Profile information, account ID, join date, and sign out.
- **Onboarding**: Reserved route for the onboarding experience. The current screen is a placeholder.

## 🧱 Technology Stack

- ⚛️ React `19.3`
- 📱 React Native `0.88`
- 🚀 Expo SDK `58`
- 🧭 Expo Router
- 🎨 NativeWind and React Native CSS
- 🔑 Clerk Expo
- 🔄 TanStack Query
- 🗃️ Zustand
- 📈 PostHog React Native
- ☕ Spring Boot `3.5.6`
- 🐘 PostgreSQL
- 🛡️ Spring Security OAuth2 Resource Server with Clerk JWTs
- ✉️ Spring Mail and Resend
- ☁️ EAS Build, Render, and Neon

## 🗂️ Project Structure

```text
.
├── assets/       # Images, icons, fonts, and tab artwork
├── components/   # Reusable React Native UI components
├── constants/    # Theme, images, icons, and static data
├── lib/          # API client, queries, notifications, analytics, and utilities
├── src/app/      # Expo Router screens and layouts
├── stores/       # Zustand UI stores
├── types/        # Shared TypeScript declarations
├── backend/      # Spring Boot API and persistence layer
├── app.json      # Expo application and native configuration
├── eas.json      # EAS development, preview, and production profiles
└── package.json  # Frontend dependencies and scripts
```

## ✅ Prerequisites

Install these before starting:

- Node.js LTS and npm
- Java 25 for the backend
- Maven 3.8 or newer
- Android Studio and an Android SDK for local Android builds or VsCode with installed Expo Go App on your device.
- A Clerk account and Clerk application
- A PostgreSQL database, locally or in cloud such as Neon

Expo Go is useful for JavaScript-only work. A development build is required when testing native modules or native configuration that Expo Go does not include.

## 🚀 Frontend Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd SubTrack
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create the frontend environment file

Copy the example file:

```bash
cp .env.example .env
```

Then fill in the values described below. Never commit `.env` or any secret key.

### 4. Configure frontend environment variables

```env
# Clerk Dashboard -> API Keys -> Publishable key
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key

# Local backend or deployed Render backend
EXPO_PUBLIC_API_URL=http://localhost:8080

# PostHog project settings; use an empty value to disable analytics locally
EXPO_PUBLIC_POSTHOG_PROJECT_TOKEN=phc_your_project_token
EXPO_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

# Logo.dev publishable token for subscription logos
EXPO_PUBLIC_LOGO_DEV_PUBLISHABLE_KEY=your_logo_dev_token
```

### Getting the keys

#### Clerk

1. Create an account at [Clerk](https://clerk.com/).
2. Create an application.
3. Configure the sign-in and sign-up methods you want to support.
4. Open **API Keys** in the Clerk Dashboard.
5. Copy the **Publishable key** into `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`.
6. Keep the Clerk secret key for the backend only. Never put it in the Expo `.env` file.

#### PostHog

1. Create a project at [PostHog](https://posthog.com/).
2. Open the project settings.
3. Copy the project API key into `EXPO_PUBLIC_POSTHOG_PROJECT_TOKEN`.
4. Use the host for your PostHog data region, usually `https://us.i.posthog.com`.

#### Logo.dev

1. Create an account at [Logo.dev](https://www.logo.dev/).
2. Create or copy a publishable token.
3. Put it in `EXPO_PUBLIC_LOGO_DEV_PUBLISHABLE_KEY`.

### 5. Start the frontend

```bash
npx expo start
```

From the Expo CLI, choose one of the available targets:

- Press `a` for an Android emulator or connected Android device.
- Press `i` for an iOS simulator on macOS.
- Scan the QR code with Expo Go for supported JavaScript-only development.
- Use a development build when the project needs native modules.

After changing environment variables, restart Expo with a cleared cache:

```bash
npx expo start --clear
```

## 🔧 Backend Setup

The backend has its own guide in [`backend/README.md`](backend/README.md).

For a local backend:

```bash
cd backend
mvn spring-boot:run
```

The API runs on `http://localhost:8080` by default. Keep the frontend value aligned:

```env
EXPO_PUBLIC_API_URL=http://localhost:8080
```

The backend requires a PostgreSQL database and Clerk JWT configuration. Create `backend/.env` locally, or configure the variables in your hosting provider:

```env
DATABASE_URL=jdbc:postgresql://host:5432/database?sslmode=require
DATABASE_USERNAME=postgres_user
DATABASE_PASSWORD=postgres_password
CLERK_ISSUER=https://your-clerk-domain
CLERK_JWKS_URL=https://your-clerk-domain/.well-known/jwks.json
CLERK_SECRET_KEY=sk_test_your_key
LOGO_DEV_SECRET_KEY=your_logo_dev_secret
PORT=8080
```

For a free hosted setup, run the backend as a Render Web Service using Docker and connect it to a Neon PostgreSQL database. Set `EXPO_PUBLIC_API_URL` to the public Render URL before creating a preview or production mobile build.

## ✉️ Email Configuration

The backend exposes one `EmailService` interface with two implementations:

- `smtp`: Spring Mail through an SMTP provider.
- `resend`: Resend's HTTP email API.

Select the provider with:

```env
SUBTRACK_EMAIL_PROVIDER=resend
```

### SMTP

```env
SUBTRACK_EMAIL_PROVIDER=smtp
SUBTRACK_EMAIL_FROM_EMAIL=notifications@yourdomain.com
SUBTRACK_EMAIL_FROM_NAME=SubTrack
SPRING_MAIL_HOST=smtp.example.com
SPRING_MAIL_PORT=587
SPRING_MAIL_USERNAME=your_username
SPRING_MAIL_PASSWORD=your_password
SPRING_MAIL_AUTH=true
SPRING_MAIL_STARTTLS=true
```

Use the SMTP host, port, username, and password supplied by your email provider. The sender address must be allowed by that provider.

### Resend

1. Create an account at [Resend](https://resend.com/).
2. Add a domain under **Domains**.
3. Add the SPF/DKIM DNS records Resend displays.
4. Wait until the domain is verified.
5. Create an API key under **API Keys**.
6. Configure:

```env
SUBTRACK_EMAIL_PROVIDER=resend
RESEND_API_KEY=re_your_api_key
RESEND_API_URL=https://api.resend.com/emails
SUBTRACK_EMAIL_FROM_EMAIL=notifications@yourdomain.com
SUBTRACK_EMAIL_FROM_NAME=SubTrack
```

Do not use a Gmail address as the sender. Resend requires a verified sending domain. `onboarding@resend.dev` is only suitable for limited testing.

## 🏗️ Ways To Run And Build The App

### Expo Go

```bash
npx expo start
```

Best for fast JavaScript and UI iteration. Expo Go cannot fully reproduce native splash-screen behavior or every native module.

### Local Android development build

Generate native projects and build locally:

```bash
npx expo prebuild --clean
npx expo run:android
```

The `android/` directory is generated by Expo. Do not edit generated native files manually; use `app.json` or config plugins.

### EAS development build

```bash
npx eas-cli@latest build --platform android --profile development
npx expo start --dev-client
```

This creates an installable development client in the cloud.

### EAS preview build

```bash
npx eas-cli@latest build --platform android --profile preview
```

The preview profile is intended for internal testing and device installation.

### EAS production build

```bash
npx eas-cli@latest build --platform android --profile production
```

The production Android artifact is intended for Google Play submission. Submit it only after configuring the app identity, backend URL, credentials, and production environment variables.

## 🧪 Quality Checks

```bash
npx expo lint
npx tsc --noEmit

cd backend
mvn test
```

## 📄 License

See [`LICENSE`](LICENSE) for license information.