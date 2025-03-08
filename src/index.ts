import { NestFactory } from '@nestjs/core';
import { ApplicationModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(ApplicationModule);

    app.listen(3003, () => console.log('Application is listening on port 3003.'));
}
bootstrap();
