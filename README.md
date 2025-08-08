https://vibe-two-rho.vercel.app/
# Vibe: AI-Powered Next.js App Builder

[![Next.js](https://img.shields.io/badge/Next.js-15.3.4-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-38B2AC)](https://tailwindcss.com/)
[![tRPC](https://img.shields.io/badge/tRPC-11.4.2-blue)](https://trpc.io/)
[![Prisma](https://img.shields.io/badge/Prisma-6.10.1-green)](https://www.prisma.io/)

> **Transform natural language into fully functional Next.js applications with AI-powered code generation, live previews, and secure sandboxed environments.**

## 🚀 Overview

Vibe is an AI-powered app builder that generates production-ready Next.js applications from natural language prompts. It orchestrates background AI agents, secure sandboxes, and type-safe APIs to produce working UIs (Netflix-like homepages, Kanban boards, admin dashboards), complete with code, live preview, and persisted artifacts.

### ✨ Key Features

- **Natural Language to Code**: Transform simple prompts into fully functional Next.js apps
- **Live Sandboxed Preview**: Real-time preview with E2B secure containers
- **Full Code Explorer**: Syntax-highlighted file browser with directory tree
- **AI Background Jobs**: Long-running tasks with retries and step-by-step logs
- **Multi-Agent Architecture**: Tool-using code generation with network lifecycle
- **Persistent Storage**: Save prompts, AI results, code artifacts, and sandbox URLs
- **Authentication Ready**: Clerk integration with credits/billing pattern
- **Developer Workflow**: Git branches, PR reviews, and AI code review (CodeRabbit)
- **Modern UI**: Dark mode, resizable panes, tabs for Demo/Code

## 🏗️ Architecture

### Tech Stack

- **Framework**: Next.js 15.3.4 (App Router), React 19, TypeScript 5
- **Styling/UI**: Tailwind CSS v4, shadcn/ui 2.7.0, Lucide Icons
- **Data**: Prisma 6.10.1, Neon PostgreSQL, Zod validation
- **API**: tRPC 11.4.2, TanStack Query 5.80.10, SuperJSON
- **Background/Agents**: Ingest CLI/dev server, Ingest AgentKit (OpenAI GPT-4.1/Anthropic Sonnet 3.5)
- **Sandboxes**: E2B Code Interpreter 1.5.1, Docker
- **Auth**: Clerk 6.23.0, @clerk/themes
- **Dev Experience**: VSCode, GitHub PRs, CodeRabbit, date-fns, prismjs

### System Workflow

1. **Prompt to Project**: User enters prompt → tRPC creates project → Background job starts
2. **Background Job**: Ingest orchestrates AI agent with tools (terminal, file operations, code generation)
3. **Live Preview**: E2B sandbox runs generated app → Real-time iframe preview
4. **Code View**: File explorer with syntax highlighting → Full codebase access

## 🛠️ Quick Start

### Prerequisites

- Node.js 18.18+
- npm or yarn
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/vibe.git
cd vibe

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your database URL, API keys, etc.

# Run database migrations
npx prisma migrate dev

# Start the development server
npm run dev

# In another terminal, start Ingest dev server
npx ingest dev
```

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://..."

# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."

# AI/Background Jobs
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."

# E2B Sandboxes
E2B_API_KEY="..."

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## 📁 Project Structure

```
vibe/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (home)/            # Home route group
│   │   ├── projects/          # Project pages
│   │   ├── api/               # API routes
│   │   └── globals.css        # Global styles
│   ├── components/            # Reusable components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── code-view/        # Code viewer
│   │   └── file-explorer.tsx # File tree
│   ├── modules/              # Feature modules
│   │   ├── projects/         # Project logic
│   │   ├── messages/         # Message handling
│   │   └── usage/            # Usage tracking
│   ├── trpc/                 # tRPC setup
│   │   ├── init.ts           # tRPC initialization
│   │   ├── client.tsx        # Client provider
│   │   └── server.tsx        # Server helpers
│   ├── ingest/               # Background jobs
│   │   ├── client.ts         # Ingest client
│   │   ├── functions.ts      # Job functions
│   │   └── utils.ts          # Utilities
│   └── lib/                  # Utilities
│       ├── db.ts             # Database client
│       └── utils.ts          # Helper functions
├── prisma/                   # Database schema
│   ├── schema.prisma         # Prisma schema
│   └── migrations/           # Database migrations
├── sandbox-templates/        # E2B templates
│   └── nextjs/              # Next.js template
└── public/                  # Static assets
```

## 🔧 Core Components

### Data Models (Prisma)

```prisma
model Project {
  id        String    @id @default(cuid())
  name      String    // Generated slug
  messages  Message[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}

model Message {
  id        String        @id @default(cuid())
  content   String
  role      MessageRole
  type      MessageType?
  projectId String
  project   Project       @relation(fields: [projectId], references: [id], onDelete: Cascade)
  fragment  Fragment?
  createdAt DateTime      @default(now())
  updatedAt DateTime      @updatedAt
}

model Fragment {
  id          String   @id @default(cuid())
  messageId   String   @unique
  message     Message  @relation(fields: [messageId], references: [id], onDelete: Cascade)
  sandboxUrl  String
  title       String
  files       Json     // Record<path, content>
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### API Layer (tRPC)

```typescript
// Example tRPC procedure
export const projectsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ value: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      // Create project and trigger background job
      const project = await ctx.db.project.create({
        data: { name: generateSlug() }
      });
    
      await ingest.send('codeAgent:run', {
        data: { prompt: input.value, projectId: project.id }
      });
    
      return project;
    }),
});
```

### Background Jobs (Ingest)

```typescript
// Example background job
export const codeAgent = createFunction({
  id: 'codeAgent:run',
  on: 'codeAgent:run',
  steps: [
    step.run('get sandbox', async () => {
      // Create E2B sandbox
    }),
    step.run('code agent', async () => {
      // Run AI agent with tools
    }),
    step.run('save result', async () => {
      // Save to database
    }),
  ],
});
```

## 🎯 Usage Examples

### Generate a Netflix Clone

```typescript
// User enters: "Create a Netflix-style homepage with movie cards"
// System generates:
// - Responsive layout with Tailwind CSS
// - Movie card components with hover effects
// - Navigation bar with search
// - Live preview in E2B sandbox
```

### Build a Kanban Board

```typescript
// User enters: "Make a drag-and-drop Kanban board"
// System generates:
// - React DnD integration
// - Column and card components
// - State management with React hooks
// - Real-time drag and drop functionality
```

### Create an Admin Dashboard

```typescript
// User enters: "Build an admin dashboard with charts and tables"
// System generates:
// - Data visualization with charts
// - Paginated data tables
// - Sidebar navigation
// - Status cards and metrics
```

## 🔒 Security & Best Practices

- **Sandboxed Execution**: All AI-generated code runs in isolated E2B containers
- **Type Safety**: Full-stack type safety with tRPC and TypeScript
- **Authentication**: Clerk integration with protected routes
- **Rate Limiting**: Background job retries with exponential backoff
- **Error Handling**: Graceful failure handling with user feedback

## 🚀 Deployment

### Production Setup

1. **Database**: Deploy to Neon PostgreSQL
2. **Frontend**: Deploy to Vercel/Railway/Render
3. **Background Jobs**: Deploy Ingest to production
4. **Sandboxes**: Configure E2B production environment
5. **Environment**: Set production environment variables

### Environment Variables (Production)

```env
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."
OPENAI_API_KEY="sk-..."
E2B_API_KEY="..."
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
```

### Deployment Configuration

#### ESLint Configuration

To avoid build failures with generated files:

```javascript
// eslint.config.mjs
export default [
  // ... other config
  {
    ignores: ['**/generated/**']
  }
];
```

#### Vercel Deployment Protection

For Ingest integration in production:

1. Go to Vercel project settings → Deployment Protection
2. Add "Protection Bypass for Automation"
3. Copy the bypass secret
4. Configure in Ingest dashboard

#### Production Troubleshooting

- **Build Failures**: Check ESLint ignores for generated files
- **Ingest Connection**: Verify deployment protection bypass
- **Environment Variables**: Ensure all production keys are set
- **Redeployment**: Required after environment variable changes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Workflow

- Follow the Git workflow with branches and PRs
- Use CodeRabbit for AI-powered code reviews
- Maintain type safety throughout
- Test background jobs locally with Ingest dev server

## 📚 Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [tRPC Documentation](https://trpc.io/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Ingest Documentation](https://ingest.dev/docs)
- [E2B Documentation](https://e2b.dev/docs)

## 🎨 UI Components

Built with shadcn/ui components:

```bash
# Add components as needed
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
# ... and more
```

## 🔧 Configuration

### Tailwind CSS v4

No `tailwind.config.js` needed - uses CSS variables and utilities directly.

### TypeScript

Strict mode enabled for full type safety across the stack.

### ESLint

Configured for Next.js and TypeScript best practices.

## 📊 Monitoring & Analytics

- **Background Jobs**: Ingest dashboard for job monitoring
- **Database**: Prisma Studio for data inspection
- **Performance**: Next.js built-in analytics
- **Errors**: Error boundaries and logging

## 🎯 Roadmap

- [ ] Enhanced AI agent capabilities
- [ ] More sandbox templates
- [ ] Advanced code review features
- [ ] Team collaboration features
- [ ] API rate limiting and quotas
- [ ] Advanced billing integration
- [ ] Mobile app generation
- [ ] Multi-language support

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing framework
- [tRPC](https://trpc.io/) for type-safe APIs
- [Prisma](https://www.prisma.io/) for database tooling
- [Ingest](https://ingest.dev/) for background jobs
- [E2B](https://e2b.dev/) for secure sandboxes
- [Clerk](https://clerk.com/) for authentication
- [shadcn/ui](https://ui.shadcn.com/) for beautiful components

---

**Built with ❤️ using Next.js, React, TypeScript, and AI**

*Transform your ideas into reality with Vibe - the AI-powered app builder that makes coding accessible to everyone.*
