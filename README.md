<img width="960" height="482" alt="image" src="https://github.com/user-attachments/assets/bdd1c5c7-2442-4e4d-a400-c7ad6cb8ecd1" /># Olive & Thyme Restaurant Management System

A full-stack restaurant portfolio project built with React, Vite, Bootstrap 5, PHP 8+, and MySQL. Guests can browse a sample menu and submit table requests; restaurant staff can review, update, and delete reservation records in the admin dashboard.

> **Demo scope:** The admin page is intentionally unauthenticated for local portfolio use. Do not expose it to the public internet or use it for real customer data without adding authentication, authorization, rate limiting, privacy controls, and production deployment hardening. Reservation requests are recorded in MySQL; this project does not send confirmation email or enforce opening hours, table capacity, or double-booking rules.

## Prerequisites

- Windows with XAMPP (Apache, MySQL, PHP 8.0 or later, and the PHP PDO MySQL extension enabled).
- Node.js and npm.
- A modern browser.
- Internet access for the Bootstrap CDN, Google Fonts, and Unsplash-hosted photography.

- ##Reviews


<img width="960" height="482" alt="image" src="https://github.com/user-attachments/assets/4be3eddb-8ee8-48a6-88ab-ace06fe7d97a" />


-<img width="1920" height="998" alt="image" src="https://github.com/user-attachments/assets/c4337d28-a2e9-475d-b893-8d588172248e" />

- <img width="1892" height="1005" alt="image" src="https://github.com/user-attachments/assets/1a695fbb-32f4-4109-b6be-cd3af88d1d23" />



## Folder structure

```text
restaurant-management-react/
├── backend/
│   ├── api/
│   │   └── reservations.php       # JSON REST API
│   ├── config.php                 # PDO connection and local settings
│   └── config.local.php.example   # Copy to config.local.php; never commit credentials
├── public/                        # Vite public assets
├── src/
│   ├── components/
│   │   ├── AdminDashboard.jsx
│   │   ├── Footer.jsx
│   │   ├── Navbar.jsx
│   │   └── ReservationForm.jsx
│   ├── data/menuItems.js          # Clearly illustrative sample dishes
│   ├── services/api.js            # Centralized frontend API requests
│   ├── App.jsx
│   ├── App.css
│   └── index.css
├── .env.example                   # Frontend API URL example
├── database.sql
└── package.json
```

## Database setup

1. Start **Apache** and **MySQL** from the XAMPP Control Panel.
2. Open [http://localhost/phpmyadmin](http://localhost/phpmyadmin).
3. Select **Import**, choose this project's `database.sql`, and run the import. The script creates the `restaurant_management` database and `reservations` table.
4. The default XAMPP connection expects MySQL at `127.0.0.1:3306`, database `restaurant_management`, user `root`, and an empty password. If your local installation differs, copy `backend/config.local.php.example` to `backend/config.local.php` and edit its values. That local config is ignored by Git. Environment variables `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, and `DB_PASSWORD`, when set in Apache's PHP environment, take precedence.
5. Confirm that `pdo_mysql` is enabled in the PHP configuration used by Apache. Restart Apache after changing `php.ini`.

The frontend contains illustrative sample menu items in JavaScript. There are no sample reservation rows in the database, so the dashboard starts with an empty state until a guest submits a request.

## Frontend installation and startup

In PowerShell, from the project folder:

```powershell
Copy-Item .env.example .env
npm install
npm run dev
```

Open the Vite URL printed in the terminal (normally [http://localhost:5173](http://localhost:5173)). `.env` can override `VITE_API_BASE_URL`; its default is `http://localhost/restaurant-management-react/backend/api`, matching this project folder under XAMPP's `htdocs`.

Other useful commands:

```powershell
npm run lint
npm run build
npm run preview
```

## PHP configuration and CORS

Apache must serve this project from `C:\xampp\htdocs\restaurant-management-react` for the default API URL to work. If the folder name or Apache URL differs, update `VITE_API_BASE_URL` in `.env`.

The API allows the local Vite origins `http://localhost:5173`, `http://127.0.0.1:5173`, and port `5174` for either host. To restrict it to a different single development origin, set `FRONTEND_ORIGIN` in Apache's PHP environment (for example, in an Apache configuration context that supports `SetEnv`). CORS is not an authentication mechanism.

## Features

- Responsive restaurant homepage, navigation, footer, sample menu cards, category filters, and live menu search.
- Reservation form with required guest details, browser-side validation, pending status, and clear submission/connection errors.
- Admin dashboard with live reservation totals, pending/confirmed counts, detail view, status changes, delete confirmation, loading/error states, and an empty state.
- PDO-backed PHP API with prepared statements, JSON input validation, safe generic database errors, and matching status values.

## API endpoints

Base URL: `http://localhost/restaurant-management-react/backend/api/reservations.php`

| Method | URL | Description | Success |
| --- | --- | --- | --- |
| `GET` | `/reservations.php` | List reservations, ordered by date and time | `200 { "data": [...] }` |
| `GET` | `/reservations.php?id=1` | Get a reservation | `200 { "data": {...} }` |
| `POST` | `/reservations.php` | Create a pending reservation | `201 { "message": "...", "data": {...} }` |
| `PATCH` | `/reservations.php?id=1` | Update supplied reservation fields (the dashboard changes status) | `200 { "message": "...", "data": {...} }` |
| `DELETE` | `/reservations.php?id=1` | Delete a reservation | `200 { "message": "Reservation deleted." }` |

Example create request body:

```json
{
  "customer_name": "Alex Example",
  "email": "alex@example.com",
  "phone": "+1 212 555 0100",
  "reservation_date": "2030-05-12",
  "reservation_time": "19:00",
  "party_size": 2,
  "notes": "Window seat, if available"
}
```

Status values are `Pending`, `Confirmed`, and `Cancelled`. Invalid request bodies return `400`, validation errors return `422`, missing records return `404`, and unsupported methods return `405`. Database/server failures return a generic `500` response; details are written to the PHP error log only.

## Troubleshooting

- **API connection error in Vite:** Check that Apache and MySQL are running, the project is inside XAMPP `htdocs`, and `.env` points to the correct API URL. Visit the API URL directly to check Apache/PHP responds.
- **Database unavailable response:** Import `database.sql`, verify the database name/credentials in `backend/config.local.php`, and check that Apache's PHP has `pdo_mysql` enabled. Review the Apache/PHP error log for server-side details.
- **CORS error:** Make sure the browser's Vite origin is one of the allowed origins or set `FRONTEND_ORIGIN` to that exact origin; restart Apache after changing its environment.
- **Vite/npm command not found:** Install Node.js, reopen PowerShell, and verify `node --version` and `npm --version`.
- **Photos or Bootstrap do not load:** This starter uses public CDNs for Bootstrap CSS/JS, Google Fonts, and Unsplash images, so those require an internet connection.

## Manual end-to-end checks

1. Start Apache/MySQL, import `database.sql`, and start Vite.
2. Submit a valid reservation on the homepage and verify the success message.
3. Open **Admin**, confirm the reservation appears and total/pending counts update.
4. Open its details, change status to **Confirmed**, and verify the confirmed count updates.
5. Change it to **Cancelled**, then delete it and accept the confirmation. Verify the row disappears and the empty state is shown when no rows remain.
6. Try an invalid email and a past date; the browser should prevent submission. For direct API validation, send malformed/invalid JSON to the endpoint and verify `400`/`422` JSON responses.
7. Resize the browser or use a phone-sized viewport and verify the navigation menu, form, menu cards, and admin table remain usable.
