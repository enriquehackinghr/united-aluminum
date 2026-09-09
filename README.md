# United Aluminum Website

Modern website for [United Aluminum](https://unitedalum.com/) — Arizona's trusted supplier of aluminum storage sheds, pergolas, patio covers, and building materials since 1968.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## Tech Stack

- **Next.js 15** — React framework with App Router
- **Tailwind CSS 4** — Utility-first styling
- **Framer Motion** — Smooth animations
- **Lucide React** — Icons

## Project Structure

```
src/
├── app/              # Pages and routing
├── components/       # Reusable UI components
└── lib/data.ts       # Company info, products, FAQs
```

## Deployment

Deploy to [Vercel](https://vercel.com) or any platform that supports Next.js:

```bash
npm run build
npm start
```

## Notes

- Gallery images use Unsplash placeholders — replace with actual product photos in `src/lib/data.ts`
- Contact/quote forms show a success state client-side — wire up to your email service or CRM for production
