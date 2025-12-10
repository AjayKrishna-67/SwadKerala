# Swadkerala - E-Commerce Storefront

A modern e-commerce storefront built with Remix, React, and GraphQL.

## Prerequisites

- Node.js >= 18.0.0
- pnpm (recommended package manager)

## Installation

1. Install pnpm globally (if not already installed):
   ```bash
   npm install -g pnpm
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

## Available Scripts

- `pnpm run dev` - Start development server
- `pnpm run dev:cf` - Start development server for Cloudflare Pages
- `pnpm run build` - Build for production
- `pnpm run build:cf` - Build for Cloudflare Pages
- `pnpm run build:nf` - Build for Netlify
- `pnpm run start` - Start production server
- `pnpm run start:cf` - Start production server for Cloudflare Pages
- `pnpm run generate` - Generate GraphQL types
- `pnpm run codegen` - Run GraphQL code generation

## Development

Start the development server:

```bash
pnpm run dev
```

The application will be available at `http://localhost:3000`.

## GraphQL Code Generation

Generate TypeScript types from your GraphQL schema:

```bash
pnpm run codegen
```

## Deployment

### Cloudflare Pages

```bash
pnpm run build:cf
```

### Netlify

```bash
pnpm run build:nf
```

## Tech Stack

- **Framework**: Remix
- **UI**: React 18
- **Styling**: Tailwind CSS
- **GraphQL**: Apollo Client
- **Form Validation**: Remix Validated Form + Zod
- **Internationalization**: i18next
- **Package Manager**: pnpm

## License

Private project
