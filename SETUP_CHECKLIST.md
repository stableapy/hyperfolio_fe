# Setup Checklist

## ✅ Initial Setup

- [ ] Initialize Next.js project with TypeScript and Tailwind
- [ ] Install all dependencies
- [ ] Configure TypeScript (`tsconfig.json`)
- [ ] Configure Tailwind CSS
- [ ] Setup ESLint and Prettier
- [ ] Configure Vitest for testing
- [ ] Create `.env.local` with environment variables

## 📁 Directory Structure

- [ ] Create `src/app/api/` for API routes
- [ ] Create `src/app/components/` for Server Components
- [ ] Create `src/app/lib/` for utilities
- [ ] Create `src/app/hooks/` for Client hooks
- [ ] Create `src/app/types/` for TypeScript types
- [ ] Create `src/app/ui/` for UI components
- [ ] Create `src/test/` for test files

## 🔧 Configuration Files

- [ ] Copy `tsconfig.json.example` to `tsconfig.json`
- [ ] Copy `package.json.example` to `package.json` (or create your own)
- [ ] Setup `.gitignore` (already created)
- [ ] Create `.env.local` from `ENV_VARIABLES.md`
- [ ] Configure `.prettierrc`
- [ ] Configure `.eslintrc.json`

## 📝 Core Files

- [ ] Create `src/app/layout.tsx` (root layout)
- [ ] Create `src/app/page.tsx` (home page)
- [ ] Create `src/app/globals.css` (global styles)
- [ ] Create `src/app/lib/api.ts` (API utilities)
- [ ] Create `src/app/lib/types.ts` (type definitions)

## 🎨 First Components

- [ ] Create basic Server Component example
- [ ] Create basic Client Component example
- [ ] Create loading component (`loading.tsx`)
- [ ] Create error component (`error.tsx`)
- [ ] Create not-found component (`not-found.tsx`)

## 🧪 Testing Setup

- [ ] Create `src/test/setup.ts`
- [ ] Write first unit test
- [ ] Write first component test
- [ ] Configure Playwright for E2E tests

## 🚀 Development

- [ ] Run `npm run dev` successfully
- [ ] Run `npm run build` successfully
- [ ] Run `npm run lint` successfully
- [ ] Run `npm run type-check` successfully
- [ ] Run `npm test` successfully

## 📚 Documentation

- [ ] Read README.md
- [ ] Read ARCHITECTURE.md
- [ ] Read QUICK_START.md
- [ ] Read Cursor rules in `.cursor/rules/`
- [ ] Update environment variables from `ENV_VARIABLES.md`

## 🔗 Backend Integration

- [ ] Test connection to NestJS backend
- [ ] Verify API endpoints
- [ ] Test authentication flow
- [ ] Test data fetching
- [ ] Test error handling

## 🎯 Next Steps

- [ ] Design wallet UI components
- [ ] Implement wallet connection logic
- [ ] Create transaction history view
- [ ] Add real-time updates
- [ ] Implement caching strategy
- [ ] Add error boundaries
- [ ] Setup monitoring and analytics

## 🐛 Troubleshooting

If you encounter issues:

1. Check that all dependencies are installed
2. Verify environment variables are set
3. Run `npm run type-check` to find TypeScript errors
4. Check the browser console for runtime errors
5. Review Cursor rules for code generation guidelines

## 💡 Tips

- Use Cursor AI with the rules we've set up for faster development
- Start with Server Components before adding Client Components
- Test your code frequently
- Follow the DRY principle
- Keep components small and focused
- Write tests for critical features

## 📞 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [React Server Components](https://react.dev/blog/2023/03/22/react-labs-latest-updates)

---

**Ready to start building?** Follow `QUICK_START.md` for detailed setup instructions!

