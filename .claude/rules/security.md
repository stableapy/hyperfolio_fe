---
paths: src/auth/**, src/common/guards/**, src/**/*.guard.ts, src/**/*security*.ts, src/**/*auth*.ts
---

# Security Best Practices for Hyperfolio API

## API Key Authentication

### API Key Guard

```typescript
@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKey = this.extractApiKey(request);

    if (!apiKey) {
      throw new UnauthorizedException('API key is required');
    }

    // Validate against environment variable
    const validKeys = this.configService.get<string>('API_KEYS')?.split(',') || [];
    const isValid = validKeys.includes(apiKey);

    if (!isValid) {
      // Log failed attempt (without exposing key)
      this.logFailedAttempt(request);
    }

    return isValid;
  }

  private extractApiKey(request: Request): string | undefined {
    const headerKey = request.headers['x-api-key'] as string;
    if (headerKey) return headerKey;

    const authHeader = request.headers['authorization'];
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    return undefined;
  }

  private logFailedAttempt(request: Request): void {
    logger.warn('Failed API key attempt', {
      ip: request.socket.remoteAddress,
      userAgent: request.headers['user-agent'],
      timestamp: new Date().toISOString(),
    });
  }
}
```

## Rate Limiting

### Using @nestjs/throttler

```typescript
// app.module.ts
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000,      // 1 minute
      limit: 100,      // 100 requests per minute
    }]),
  ],
})
export class AppModule {}
```

### Custom Rate Limits by Endpoint

```typescript
@Controller('wallets')
export class WalletController {
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @Get(':address')
  async getWallet(@Param('address') address: string) {
    // Only 20 requests per minute for this endpoint
  }
}
```

## Input Validation

### DTO Validation

```typescript
import { IsString, IsOptional, IsEnum, MinLength, IsHexString } from 'class-validator';

export class GetWalletDto {
  @IsString()
  @IsHexString()
  @MinLength(42)
  address: string;

  @IsOptional()
  @IsEnum(ProtocolType, { each: true })
  protocols?: ProtocolType[];
}
```

### Enable Global Validation Pipe

```typescript
// main.ts
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
}));
```

## Environment Variable Security

### Never Log Sensitive Data

```typescript
// GOOD
logger.info('Wallet request', { address: walletAddress });

// BAD - Logs sensitive data
logger.info('Wallet request', {
  address: walletAddress,
  apiKey: apiKey,           // NEVER log API keys
  privateKey: privateKey,   // NEVER log private keys
});
```

## SQL Injection Prevention

### Using Parameterized Queries

```typescript
// GOOD - Parameterized query
const result = await this.connection.query(
  'SELECT * FROM wallets WHERE address = $1',
  [walletAddress],
);

// BAD - String concatenation (vulnerable)
const result = await this.connection.query(
  `SELECT * FROM wallets WHERE address = '${walletAddress}'`,
);
```

## Security Headers

```typescript
// main.ts
import helmet from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.getHttpAdapter().getInstance().disable('x-powered-by');

  await app.listen(3000);
}
```

## CORS Configuration

```typescript
app.enableCors({
  origin: [
    'https://hyperfolio.xyz',
    'https://app.hyperfolio.xyz',
  ],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  credentials: true,
});
```

## Error Response Security

### Generic Error Messages

```typescript
// GOOD - Generic error message
throw new UnauthorizedException('Invalid credentials');

// BAD - Reveals system information
throw new UnauthorizedException(`Invalid API key: ${apiKey}`);
```

## Security Checklist

Before deploying to production:

- [ ] All endpoints require authentication
- [ ] Rate limiting is configured
- [ ] Input validation is enabled
- [ ] Security headers are set
- [ ] CORS is properly configured
- [ ] Error messages don't leak information
- [ ] Sensitive data is not logged
- [ ] Secrets are in environment variables only
