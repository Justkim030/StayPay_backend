Staypay backend scaffold

Files created:
- server.js
- src/api/* (routes)
- src/controllers/*
- src/middleware/auth.middleware.js
- src/models/*
- src/services/mpesa.service.js

Usage (local):
1. Copy `.env.example` to `.env` and fill values.
2. Install:
```bash
npm install
```
3. Run locally:
```bash
npm run dev   # for development with nodemon
npm start     # production
```

Deploy to Fly.io (quick):
1. Install Fly CLI: https://fly.io/docs/hands-on/install-fly/
2. Log in and create app:
```bash
fly auth login
fly launch --name staypay-backend --region iad
```
3. Build & deploy:
```bash
fly deploy
```

Notes:
- Use PlanetScale for MySQL if you need a managed MySQL free tier. Configure DB connection in `.env`.
- Keep secrets in Fly secrets or `.env` locally (do NOT commit `.env`).
 
PlanetScale (MySQL) tips:
- Create a database on PlanetScale and copy the connection string into `DATABASE_URL` in your `.env`.
- If PlanetScale requires TLS, set `DB_SSL=true` in `.env`.
- After deploying, set the same `DATABASE_URL` as a secret in Fly using `fly secrets set DATABASE_URL=...`.

Integration with your Flutter app:
- Point your Flutter HTTP client to the Fly app URL (e.g., `https://your-app.fly.dev/api/auth/login`).
- Use the `POST /api/auth/register` and `POST /api/auth/login` endpoints. Send JSON `{ "username":"..", "password":".." }`.
- Store the returned JWT in your Flutter app and include `Authorization: Bearer <token>` on protected requests.
