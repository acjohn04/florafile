# FloraFile

FloraFile is a digital garden companion built with Next.js, Tailwind CSS, Prisma, SQLite, and the Google Gemini API. It helps you identify plants using AI, catalogs your collection, and generates weekly care schedules.

## Features

- **Snap & Identify**: Take a photo of a plant to identify it and get care instructions via Gemini AI.
- **Inventory Management**: Keep track of your plants by room and monitor their status.
- **Weekly Playbook**: Auto-generated care schedules (watering, misting, etc.) customized for your plants.
- **Plant Doctor**: Diagnose sick plants with AI and get actionable recovery steps.

## Requirements

- Node.js 18+
- A Google Gemini API Key

## Getting Started

1. **Clone and Install**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file in the root directory and add your keys:
   ```env
   DATABASE_URL="file:./dev.db"
   GEMINI_API_KEY="your_api_key_here"
   ```

3. **Database Setup**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

## Docker

Run the app using Docker Compose:

```bash
docker-compose up -d --build
```

The app will be available at `http://localhost:3000`. The SQLite database is persisted in a Docker volume.
