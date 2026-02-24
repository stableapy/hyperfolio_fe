# Contributing to Hyperfolio Frontend

Thank you for your interest in contributing to Hyperfolio Frontend! This document provides guidelines and workflows for contributing to the project.

## Development Setup

### Prerequisites

- Node.js 18.x or 20.x
- npm or yarn package manager

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Code Quality Standards

### Linting

- Run linting: `npm run lint`
- Fix linting issues: `npm run lint:fix`

### Type Checking

- Run TypeScript type checking: `npm run type-check`

### Formatting

- Check formatting: `npm run format:check`
- Fix formatting: `npm run format`

### Testing

- Run unit tests: `npm run test`
- Run tests with coverage: `npm run test:coverage`
- Run E2E tests: `npm run test:e2e`

## GitHub Actions Workflows

### CI Workflow (`.github/workflows/ci.yml`)

The CI workflow runs on every push to `main` and `develop` branches, and on every pull request targeting these branches.

**Jobs:**
- **Test**: Matrix testing across Node.js versions 18.x and 20.x
  - Type checking
  - Linting
  - Format checking
  - Build verification
  - Unit tests with coverage
- **E2E Tests**: End-to-end testing with Playwright
- **Security Scan**: Dependency security audit

### Deploy Workflow (`.github/workflows/deploy.yml`)

The deploy workflow runs on pushes to the `main` branch and can be manually triggered.

**Jobs:**
- **Deploy to Vercel**: Automated deployment to Vercel
- **Docker Build**: Build and push Docker image to Docker Hub
- **CDN Deployment**: Deploy static files to AWS S3 and invalidate CloudFront

### Quality Workflow (`.github/workflows/quality.yml`)

The quality workflow runs on pull requests and pushes to main/develop branches.

**Jobs:**
- **Dependencies Check**: Check for outdated and unused dependencies
- **Performance Budget**: Monitor bundle size changes
- **Accessibility Check**: Automated accessibility testing
- **Code Quality**: SonarQube and CodeQL analysis

## Pull Request Process

1. Create a new branch from `develop` or `main`
2. Make your changes
3. Ensure all tests pass locally
4. Ensure code quality standards are met
5. Create a pull request to the target branch
6. Wait for CI checks to pass
7. Address any review comments
8. Ensure at least one approval before merging

## Branch Strategy

- `main`: Production-ready code
- `develop`: Integration branch for features
- Feature branches: `feature/your-feature-name`
- Bug fix branches: `fix/your-fix-name`

## Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) format:

```
feat: add new feature
fix: resolve issue with component
docs: update documentation
style: format code
refactor: improve code structure
test: add or update tests
chore: maintenance tasks
```

## Environment Variables

The project requires several environment variables. Create a `.env.local` file based on `.env.example`:

```env
NEXT_PUBLIC_API_URL=https://api.hyperfolio.xyz
NEXT_PUBLIC_WALLET_CONNECT_ID=your_wallet_connect_project_id
```

## Security Considerations

- Never commit secrets or sensitive information
- Use GitHub Secrets for sensitive configuration
- Keep dependencies updated and secure
- Follow security best practices for web applications

## Getting Help

If you have questions or need help:

1. Check the existing documentation
2. Search existing issues and discussions
3. Create a new issue with detailed information
4. Join our community discussions

## Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md) to ensure a welcoming and inclusive environment for all contributors.