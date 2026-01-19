---
paths: **/*.ts
---

# TypeScript Best Practices for Hyperfolio API

## Type Safety

- **NEVER use `any`** - use `unknown` if the type is truly unknown, then narrow with type guards
- Use `satisfies` operator for type assertions instead of `as` when possible
- Enable strict mode: `strict: true`, `noImplicitAny: true`, `strictNullChecks: true`
- Use `readonly` for immutable arrays and object properties
- Prefer `const assertions` for enum-like objects: `const Status = { Active: 'active' } as const`

## Modern TypeScript (5.7+)

- Use template literal types for string patterns
- Leverage `satisfies` for better type inference
- Use `await using` for async cleanup when working with Node 18+
- Consider using `const type parameters` for generic functions

## Code Style

- Use **PascalCase** for: classes, interfaces, enums, type aliases, decorators
- Use **camelCase** for: variables, functions, methods, properties
- Use **UPPER_SNAKE_CASE** for: constants, environment variables
- Use **kebab-case** for: file names (except `.ts` files use PascalCase for classes)

## Function Patterns

```typescript
// BAD
function getData(id: any) {
  return fetch(`/api/${id}`).then(r => r.json());
}

// GOOD
async function getData(id: string): Promise<UserData> {
  const response = await fetch(`/api/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.statusText}`);
  }
  return response.json() as Promise<UserData>;
}
```

## Error Handling

- Always wrap async operations in try/catch blocks
- Use custom error classes that extend `Error`
- Type error conditions: `type Result<T> = { success: true; data: T } | { success: false; error: Error }`

## Async/Await

- Prefer `async/await` over Promises for readability
- Avoid mixing `await` and `Promise.all` unnecessarily
- Use `Promise.all()` for parallel independent operations
- Use `Promise.allSettled()` when you need all results to complete regardless of failures

## Interface vs Type

- Use **interfaces** for: object shapes that can be extended, class contracts
- Use **type aliases** for: unions, intersections, mapped types, conditional types
- Prefer interfaces for public APIs (better for declaration merging)

## Null and Undefined

- Enable `strictNullChecks`
- Use optional chaining `?.` for deep property access
- Use nullish coalescing `??` instead of `||` for fallback values
- Explicitly handle null/undefined in function parameters

## Decorators (NestJS)

```typescript
// Use proper typing for custom decorators
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  }
);
```

## Imports

- Use named imports: `import { Injectable } from '@nestjs/common';`
- Avoid barrel imports (importing from index files) for better tree-shaking
- Group imports: 1) Node/built-in, 2) External packages, 3) Internal modules
- Sort imports alphabetically within groups

## Comments and JSDoc

- Add JSDoc comments for all public methods and classes
- Include `@param` and `@returns` tags with types
- Document complex type definitions
- Use `// TODO:` and `// FIXME:` comments for temporary code

## Type Exports

- Prefer `export type` for type-only exports
- Use `export interface` and `export type alias` for public APIs
- Re-export types for convenience: `export type { User } from './user.model';`
