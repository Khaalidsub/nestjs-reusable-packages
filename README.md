# NestJS Reusable Packages

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<p align="center">A collection of reusable NestJS packages and libraries for building efficient and scalable applications.</p>

## Description

This repository contains multiple shareable NestJS packages designed to be easily integrated into your applications. Each package is built with TypeScript and follows NestJS best practices for modularity and dependency injection.

## Available Packages

### 📦 Redis Stream Events (`libs/redis-stream-events`)

A comprehensive NestJS module for working with Redis Streams, providing both publishing and consuming capabilities with type-safe payloads.

**Features:**
- Type-safe event publishing with Zod schema validation
- Consumer groups and message acknowledgment
- Graceful connection handling and shutdown
- Easy dependency injection with decorators

**Quick Start:**
```typescript
@Module({
  imports: [
    RedisStreamsModule.forRoot({ url: 'redis://localhost:6379' }),
    RedisStreamsModule.register({ streamId: 'mystream' }),
  ],
})
export class AppModule {}
```

[📖 Full Documentation](README_REDISSTREAMS.md)

---

## Project Structure

```
libs/
├── redis-stream-events/     # Redis Streams package
│   ├── src/
│   │   ├── redis-streams.module.ts
│   │   ├── redis-stream.client.ts
│   │   ├── redis-stream.server.ts
│   │   └── ...
│   └── tsconfig.lib.json
└── [future-packages]/       # More packages coming soon!

apps/
├── examples/                # Usage examples
└── super-repo/             # Main application
```

## Project setup

## Development

```bash
# Install dependencies
$ pnpm install

# Run examples app
$ pnpm start:dev examples

# Run main app
$ pnpm start:dev super-repo
```

## Compile and run the project

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Run tests

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ pnpm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Contributing

We welcome contributions! If you'd like to add a new reusable package:

1. Create a new directory under `libs/`
2. Follow the existing structure and patterns
3. Add comprehensive documentation
4. Include usage examples in the `apps/examples` directory
5. Submit a pull request

## Future Packages

We're planning to add more reusable packages including:
- Database utilities
- Authentication helpers
- Logging modules
- API response formatters
- And more...

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

This project is [MIT licensed](LICENSE).
