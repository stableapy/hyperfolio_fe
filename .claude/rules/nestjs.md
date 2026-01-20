---
paths: src/**/*.ts
---

# NestJS Best Practices for Hyperfolio API

## Module Organization

```typescript
// Each feature should have its own module with this structure:
feature/
├── dto/
│   ├── create-*.dto.ts
│   ├── update-*.dto.ts
│   └── *.dto.ts
├── entities/
│   └── *.entity.ts
├── *.controller.ts
├── *.service.ts
├── *.module.ts
└── *.spec.ts
```

## Dependency Injection

- **ALWAYS** inject dependencies via constructor
- Use `@Injectable()` decorator for services
- Use `@Inject()` for custom providers or circular dependencies
- Specify provider scopes: `DEFAULT_SCOPE`, `REQUEST`, `TRANSIENT`

```typescript
@Injectable()
export class WalletService {
  constructor(
    private readonly cacheService: MultiSourceCacheService,
    private readonly configService: ConfigService,
  ) {}
}
```

## Controllers

- Use **route parameters** for required IDs: `@Param('id') id: string`
- Use **query parameters** for optional filters: `@Query() query: WalletQuery`
- Use **request body** with DTO validation: `@Body() dto: CreateWalletDto`
- Apply guards at controller level when all endpoints need protection
- Use proper HTTP status codes: `@HttpCode(HttpStatus.OK)`

```typescript
@Controller('wallets')
export class WalletController {
  @Get(':address')
  @ApiOperation({ summary: 'Get wallet portfolio' })
  @ApiParam({ name: 'address', type: String })
  async getWallet(@Param('address') address: string): Promise<WalletResponse> {
    return this.walletService.getPortfolio(address);
  }
}
```

## Services

- Keep services **stateless** - avoid storing request-specific data
- Use `@Injectable()` decorator
- One service should have **single responsibility**
- Use async/await for all I/O operations

## DTOs and Validation

- Use `class-validator` decorators for validation
- Use `class-transformer` for type transformation
- Create separate DTOs for Create, Update, and Response
- Enable `validationPipe` globally with `whitelist: true`

```typescript
export class CreateWalletDto {
  @IsString()
  @IsEthereumAddress()
  @ApiProperty()
  address: string;

  @IsOptional()
  @IsEnum(ProtocolType)
  @ApiPropertyOptional({ enum: ProtocolType })
  protocols?: ProtocolType[];
}
```

## Pipes

- Use built-in pipes: `ValidationPipe`, `ParseIntPipe`, `ParseUUIDPipe`
- Create custom pipes for complex transformations
- Use `@UsePipes()` at controller or method level

## Guards

- Use guards for **authentication** and **authorization**
- Implement `CanActivate` interface
- Return `boolean` or `Promise<boolean>`
- Use custom decorators to extract user context

```typescript
@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    return this.validateApiKey(request.headers['x-api-key']);
  }
}
```

## Interceptors

- Use for **cross-cutting concerns**: logging, caching, transformation
- Implement `NestInterceptor` interface
- Use RxJS operators for stream manipulation

```typescript
@Injectable()
export class CacheInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      tap(data => this.cacheService.set(cacheKey, data))
    );
  }
}
```

## Exception Filters

- Create custom exception classes extending `HttpException`
- Use built-in exceptions: `BadRequestException`, `NotFoundException`, etc.
- Return structured error responses

```typescript
throw new BadRequestException({
  statusCode: HttpStatus.BAD_REQUEST,
  message: 'Invalid wallet address',
  error: 'Bad Request',
});
```

## Configuration

- Use `@nestjs/config` for environment variables
- Create custom config schemas for validation
- Use `ConfigService.get()` with type parameter
- Store configs in `src/config/` directory

## Database (PostgreSQL)

- Use TypeORM or Prisma for database operations
- Define entities with proper decorators
- Use repositories for data access
- Create migrations for schema changes

## Caching

- Use `@nestjs/cache-manager` with Redis
- Cache expensive operations (RPC calls, external APIs)
- Set appropriate TTL values
- Use cache invalidation strategies

```typescript
@CacheKey('wallet:positions')
@CacheTTL(300) // 5 minutes
async getPositions(wallet: string): Promise<Position[]> {
  // Cache automatically managed
}
```

## OpenAPI/Swagger

- Use `@nestjs/swagger` decorators for documentation
- Document all endpoints with `@ApiTags()`, `@ApiOperation()`
- Define response types with `@ApiResponse()`
- Group related controllers with tags

## Testing

- Use `@nestjs/testing` for unit tests
- Mock external dependencies
- Test controllers, services, and modules separately
- Use e2e tests for integration testing

```typescript
describe('WalletService', () => {
  let service: WalletService;
  let cacheService: jest.Mocked<MultiSourceCacheService>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        WalletService,
        { provide: MultiSourceCacheService, useValue: mockCacheService },
      ],
    }).compile();

    service = module.get(WalletService);
    cacheService = module.get(MultiSourceCacheService);
  });
});
```

## Best Practices Summary

1. **SOLID principles** - Single responsibility, open/closed, dependency inversion
2. **DRY** - Don't repeat yourself, extract common logic
3. **Separation of concerns** - Controllers handle HTTP, services handle business logic
4. **Dependency injection** - Always inject dependencies via constructor
5. **Async everywhere** - Use async/await for all I/O operations
6. **Error handling** - Use NestJS built-in exceptions and custom filters
7. **Validation** - Use DTOs with class-validator decorators
8. **Documentation** - Add Swagger decorators to all endpoints
9. **Testing** - Write unit tests for services, e2e tests for flows
10. **Configuration** - Use environment variables via ConfigService
