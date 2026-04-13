# JA Relief Platform: Technical Documentation

## 1. System Architecture
The platform is built on a **High-Availability Hybrid Stack** designed for disaster resilience and data security.

*   **Frontend**: Angular 16.2 (Single Page Application)
    *   **PWA Architecture**: Implemented with `@angular/service-worker` for offline functionality during network outages.
    *   **State Management**: Reactive streams via RxJS BehaviorSubjects in `AuthService`.
*   **Backend**: Node.js & Express
    *   **Security Layer**: Helmet.js for header hardening and JWT-based authentication.
    *   **Transaction Logic**: Managed via `card.util.js` for virtual relief card generation.
*   **Database**: MySQL (Aiven Cloud Managed)
    *   **Persistence**: Secure storage for survivor profiles, medical records, and strategic pantry inventory.
*   **Hosting**: Vercel (Edge Functions & Optimization)

---

## 2. API Reference

### Survivor Identity & Auth (`/api/survivors`)
| Endpoint | Method | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `/register` | `POST` | Registers a new survivor with ID scan. | No |
| `/login` | `POST` | Authenticates survivor or admin. | No |
| `/profile` | `GET` | Fetches the latest survivor profile. | Yes (JWT) |

### Financial & Security (`/api/survivors`)
| Endpoint | Method | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `/set-pin` | `POST` | Establishes a 4-digit security PIN. | Yes (JWT) |
| `/verify-pin-reveal` | `POST` | Verifies PIN to reveal CVV and Card PIN. | Yes (JWT) |
| `/transactions` | `GET` | Fetches historical relief fund usage. | Yes (JWT) |
| `/simulate-payment` | `POST` | Triggers a mock NFC Tap-to-Pay event. | Yes (JWT) |

### Disaster Intel (`/api/hazards`)
| Endpoint | Method | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `/report` | `POST` | Citizens report a danger zone. | No |
| `/verified` | `GET` | Fetches admin-vetted hazard data. | No |

---

## 3. Deployment & Setup

### Local Development
1.  **Clone Repository**: `git clone <repo-url>`
2.  **Environment Variables**: Create a `.env` in `backend/`
    ```env
    DB_HOST=your-aiven-host
    DB_USER=avnadmin
    DB_PASSWORD=your-pass
    JWT_SECRET=your-secret
    ```
3.  **Install Dependencies**: `npm install`
4.  **Initialize DB**: `node backend/init_db.js`
5.  **Run Platforms**:
    *   Backend: `node backend/server.js`
    *   Frontend: `ng serve`

### Vercel Production
1.  **Build Command**: `ng build`
2.  **Output Directory**: `dist/ja-relief`
3.  **Headers**: Automatic enforcement via `vercel.json`.

---

## 4. Security Hardening (A+ Compliance)
The platform is hardened to meet **Mozilla Observatory A+ Standards**:

*   **Content-Security-Policy**: Prevents XSS and data injection by restricting script execution to `'self'` and trusted CDNs.
*   **Referrer-Policy**: Set to `no-referrer` to strictly protect user privacy during external navigation.
*   **Subresource Integrity (SRI)**: Enabled in `angular.json` to ensure third-party scripts haven't been tampered with.
*   **HSTS & No-Sniff**: Mandatory enforcement for all cross-origin requests.
