# Solar Edge Innovation

A fullstack web application for Solar Edge Innovation, built with **Laravel** (Backend & REST API) and **React 18 + Vite** (Single Page Application with Tailwind CSS).

---

## Database Architecture & Migrations

The canonical database structure is managed exclusively through standard Laravel migrations and seeders located under `database/migrations/` and `database/seeders/`.


### Tables Managed by Migrations:
1. `admins` — Administrator accounts, authentication, and status.
2. `admin_tokens` — Long-lived or API session tokens for administrative access.
3. `projects` — Portfolio and installation projects.
4. `project_images` — Multiple gallery images associated with each project (cascades on project deletion).
5. `faqs` — Customer frequently asked questions and answers categorized by topic.
6. `contact_inquiries` — Customer consultation and quotation inquiry submissions.

---

## Deployment & Database Setup Commands

For a fresh deployment (Hostinger, VPS, or local development):

```bash
# 1. Install Composer dependencies
composer install --no-dev --optimize-autoloader

# 2. Run Database Migrations
php artisan migrate --force

# 3. Seed Default Admin Account
php artisan db:seed --force

# 4. Install Node dependencies & Build Frontend Assets
npm ci
npm run build
```

---

## Local Development

```bash
# Run both Laravel backend and Vite React development server:
npm run dev:all

# Or run separately:
php artisan serve   # http://127.0.0.1:8000
npm run dev         # http://localhost:5173 (React HMR)
```

### Environment Configuration (.env)

- **Local Development**:
  ```ini
  DB_CONNECTION=mysql
  DB_HOST=127.0.0.1
  DB_PORT=3306
  DB_DATABASE=solar_edge_innovation
  DB_USERNAME=root
  DB_PASSWORD=
  ```
- **Production (Hostinger MySQL)**:
  See `.env.production` for production connection settings.

---

## Automated Tests

Run the complete test suite:

```bash
php artisan test
```
