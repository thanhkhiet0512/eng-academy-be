import "reflect-metadata";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { AppExceptionFilter } from "./common/filters/app-exception.filter";
import { ResponseInterceptor } from "./common/interceptors/response.interceptor";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = parseInt(process.env.PORT ?? "4000", 10);

  app.setGlobalPrefix("api");
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new AppExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());

  const corsOrigins = process.env.CORS_ORIGIN?.split(",").map((s) => s.trim());
  if (!corsOrigins && process.env.NODE_ENV === "production") {
    throw new Error("CORS_ORIGIN must be set in production");
  }
  app.enableCors({
    origin: corsOrigins ?? true,
    credentials: true,
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle("Eng Academy API")
    .setDescription("Eng Academy — NestJS + Prisma + PostgreSQL")
    .setVersion("1.0")
    .addBearerAuth()
    .build();
  SwaggerModule.setup("docs", app, SwaggerModule.createDocument(app, swaggerConfig));

  await app.listen(port);
}

void bootstrap();
