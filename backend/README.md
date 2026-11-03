# SubTrack Backend ☕

This Spring Boot application is the backend API for the SubTrack mobile app. It authenticates users with Clerk JWTs, stores subscriptions and expenses in PostgreSQL, calculates spending insights, processes due renewals, and sends renewal reminder emails through SMTP or Resend.

The mobile application lives in the repository root. See the [main README](../README.md) for the complete frontend setup and deployment guide.

## Requirements

- Java 25
- Maven 3.8 or newer
- PostgreSQL
- Clerk application credentials
- SMTP or Resend credentials if email reminders are enabled

## Run Locally

From this directory:

```bash
mvn spring-boot:run
```

The server listens on port `8080` by default. Set `PORT` to use another port.

The application loads optional environment files from `.env` and `backend/.env`, but production deployments should use the hosting provider's secret environment variables.

### Required environment variables

```env
DATABASE_URL=jdbc:postgresql://localhost:5432/subtrack
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
CLERK_ISSUER=https://your-clerk-domain
CLERK_JWKS_URL=https://your-clerk-domain/.well-known/jwks.json
CLERK_SECRET_KEY=sk_test_your_key
LOGO_DEV_SECRET_KEY=your_logo_dev_secret
PORT=8080
```

The Clerk secret key and database credentials must remain server-side. Never expose them in the Expo application or commit them to Git.

## Email Providers

The backend depends on the `EmailService` interface, so the provider can be changed without changing reminder business logic.

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

### Resend

Verify a sending domain in the Resend Dashboard, create an API key, and configure:

```env
SUBTRACK_EMAIL_PROVIDER=resend
RESEND_API_KEY=re_your_api_key
RESEND_API_URL=https://api.resend.com/emails
SUBTRACK_EMAIL_FROM_EMAIL=notifications@yourdomain.com
SUBTRACK_EMAIL_FROM_NAME=SubTrack
```

The sender domain must be verified by Resend. A Gmail address cannot be used as the sender.

## API Authentication

Protected endpoints expect:

```http
Authorization: Bearer <Clerk JWT>
```

The JWT subject (`sub`) is used as the Clerk user ID. `/api/health` and `/api/notifications/**` are currently permitted by the Spring Security configuration; all other API routes require authentication.

## API Endpoints

### Health

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/api/health` | No | Returns `{ "status": "ok" }`. |

### Current user

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/api/me` | Yes | Creates or loads the application user from the Clerk JWT and returns profile data. |

### Subscriptions

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/api/subscriptions` | Yes | Lists the authenticated user's subscriptions. |
| `POST` | `/api/subscriptions` | Yes | Creates a subscription. Returns `201 Created`. |
| `PUT` | `/api/subscriptions/{subscriptionId}` | Yes | Updates a subscription. |
| `PATCH` | `/api/subscriptions/{subscriptionId}/status/{status}` | Yes | Changes status, such as `active` or `paused`. Returns `204 No Content`. |
| `DELETE` | `/api/subscriptions/{subscriptionId}` | Yes | Deletes a subscription. Returns `204 No Content`. |

The create and update request body contains:

```json
{
  "name": "Netflix",
  "plan": "Premium",
  "category": "Entertainment",
  "paymentMethod": "Card",
  "status": "active",
  "price": 19.99,
  "currency": "USD",
  "frequency": "monthly",
  "frequencyPeriod": {
    "frequency": 1,
    "period": "Months"
  },
  "startDate": "2026-11-03T00:00:00Z",
  "renewalDate": "2026-12-03T00:00:00Z",
  "color": "#8fd1bd"
}
```

`name`, `price`, `currency`, and `frequency` are required. `price` and `frequencyPeriod.frequency` must be positive.

### Expenses and insights

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/api/expenses` | Yes | Lists the authenticated user's expense history. |
| `GET` | `/api/expenses/insights` | Yes | Returns monthly totals, previous-month comparison, weekly upcoming expenses, currency, and history. |
| `DELETE` | `/api/expenses` | Yes | Deletes the authenticated user's expense history. |
| `POST` | `/api/expenses/process-renewals` | Yes | Processes due subscription renewals and creates expenses. |

### Renewal reminders

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/api/notifications/check-reminders` | Configured as permitted | Checks upcoming milestones and sends email reminders. |

Reminder milestones are one day, seven days, fourteen days, thirty days, and sixty days before renewal. Duplicate reminders are prevented through the renewal reminder log table. Delivery errors return a `502 Bad Gateway` response.

The scheduled reminder job runs daily at `09:00 UTC` by default. Override it with:

```env
SUBTRACK_REMINDERS_CRON=0 0 9 * * *
```

## Tests

```bash
mvn test
```

## Deployment

The backend can be deployed from the repository as a Render Web Service using Docker. Set the Render service root directory to `backend`, configure the required environment variables, and connect it to a hosted PostgreSQL database such as Neon. The service must listen on Render's `PORT` environment variable.