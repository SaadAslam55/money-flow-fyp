# Contributing to Money Flow

Thank you for your interest in contributing to Money Flow! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors, regardless of experience level, gender, gender identity, sexual orientation, disability, appearance, race, ethnicity, age, religion, or nationality.

### Our Standards

**Positive Behavior:**

- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

**Unacceptable Behavior:**

- Trolling, insulting/derogatory comments, and personal attacks
- Public or private harassment
- Publishing others' private information
- Other conduct inappropriate in a professional setting

## Getting Started

### Prerequisites

- Node.js v18 or higher
- npm or pnpm
- Git
- Supabase account (for testing)
- Code editor (VS Code recommended)

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:

```bash
git clone https://github.com/YOUR_USERNAME/moneyflow.git
cd moneyflow
```

3. Add upstream remote:

```bash
git remote add upstream https://github.com/original/moneyflow.git
```

### Install Dependencies

```bash
npm install
```

### Environment Setup

1. Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

2. Fill in your environment variables:

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Run Development Server

```bash
npm run dev
```

## Development Workflow

### 1. Create a Branch

Always create a new branch for your work:

```bash
git checkout -b feature/your-feature-name
```

Branch naming conventions:

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Test additions or modifications
- `chore/` - Maintenance tasks

### 2. Make Your Changes

- Write clean, readable code
- Follow the project's coding standards
- Add tests for new functionality
- Update documentation as needed

### 3. Test Your Changes

```bash
# Run linting
npm run lint

# Run type checking
npm run type-check

# Run tests
npm run test

# Run all checks
npm run validate
```

### 4. Commit Your Changes

Follow our commit message convention (see below).

### 5. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 6. Create Pull Request

Open a pull request from your branch to the main repository.

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define proper types, avoid `any`
- Use interfaces for object shapes
- Use enums for constants

```typescript
// Good
interface User {
  id: string;
  email: string;
  role: UserRole;
}

// Avoid
const user: any = {...};
```

### React

- Use functional components with hooks
- Keep components small and focused
- Use proper prop types
- Follow the single responsibility principle

```typescript
// Good
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export function Button({ label, onClick, variant = 'primary' }: ButtonProps) {
  return <button onClick={onClick} className={variant}>{label}</button>;
}
```

### File Organization

```
src/
├── components/
│   ├── ui/              # Reusable UI components
│   ├── layout/          # Layout components
│   └── features/        # Feature-specific components
├── hooks/               # Custom React hooks
├── lib/                 # Utilities and helpers
├── services/            # API and external services
├── stores/              # State management
└── types/               # TypeScript types
```

### Naming Conventions

- **Components**: PascalCase (e.g., `UserProfile.tsx`)
- **Hooks**: camelCase with 'use' prefix (e.g., `useAuth.ts`)
- **Utilities**: camelCase (e.g., `formatDate.ts`)
- **Types**: PascalCase (e.g., `UserRole`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)

### Code Style

We use ESLint and Prettier for code formatting:

```bash
# Auto-fix linting issues
npm run lint:fix

# Format code
npm run format
```

**Key Rules:**

- Use 2 spaces for indentation
- Use single quotes for strings
- Add semicolons
- Max line length: 100 characters
- Use trailing commas in multiline objects/arrays

## Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code formatting (no logic change)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

### Examples

```
feat(auth): add password reset functionality

Implement password reset flow with email confirmation.
Users can now request a password reset link via email.

Closes #123
```

```
fix(invoice): correct tax calculation for international invoices

Fixed a bug where tax was not being calculated correctly
for invoices with international customers.

Fixes #456
```

### Scope

Common scopes:

- `auth` - Authentication
- `api` - API layer
- `ui` - UI components
- `db` - Database
- `security` - Security features
- `docs` - Documentation

## Pull Request Process

### Before Submitting

1. ✅ All tests pass
2. ✅ Code is linted and formatted
3. ✅ Types are properly defined
4. ✅ Documentation is updated
5. ✅ Commits follow convention
6. ✅ Branch is up-to-date with main

### PR Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## How Has This Been Tested?

Describe testing process

## Checklist

- [ ] Code follows project style
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Backward compatible
```

### Review Process

1. Automated checks must pass
2. At least one approval required
3. Reviewer provides constructive feedback
4. Author addresses feedback
5. Final approval and merge

## Testing

### Unit Tests

```bash
npm run test
```

Write tests for:

- Utility functions
- Custom hooks
- Complex logic
- Edge cases

```typescript
import { describe, it, expect } from 'vitest';
import { formatCurrency } from './utils';

describe('formatCurrency', () => {
  it('formats USD correctly', () => {
    expect(formatCurrency(1000, 'USD')).toBe('$1,000.00');
  });
});
```

### Integration Tests

Test component interactions and API calls:

```typescript
import { renderWithProviders } from '@/lib/testing/testUtils';
import { UserProfile } from './UserProfile';

it('displays user information', async () => {
  const { getByText } = renderWithProviders(<UserProfile />);
  expect(getByText('John Doe')).toBeInTheDocument();
});
```

### E2E Tests

Use Playwright for end-to-end testing:

```bash
npm run test:e2e
```

## Documentation

### Code Documentation

Use JSDoc for functions and components:

```typescript
/**
 * Formats a date into a human-readable string
 * @param date - The date to format
 * @param format - The desired format (default: 'MM/DD/YYYY')
 * @returns Formatted date string
 */
export function formatDate(date: Date, format = 'MM/DD/YYYY'): string {
  // implementation
}
```

### README Updates

Update README.md when:

- Adding new features
- Changing setup process
- Modifying architecture
- Adding dependencies

### API Documentation

Document API endpoints in `docs/api-reference.md`:

````markdown
## POST /api/invoices

Create a new invoice.

**Request:**

```json
{
  "customer_id": "uuid",
  "items": []
}
```
````

**Response:**

```json
{
  "id": "uuid",
  "status": "draft"
}
```

```

## Questions?

- Check existing issues
- Read documentation
- Ask in discussions
- Contact: contribute@moneyflow.app

## Recognition

Contributors will be recognized in:
- Contributors section of README
- Release notes
- Annual contributor awards

Thank you for contributing to Money Flow! 🚀
```
