import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as serveStatic from 'serve-static';
import { scheduleCronstyle } from './schedule';
console.log(scheduleCronstyle());
const path = require('path');
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use('/public', serveStatic(path.join(__dirname, '../public'), {
    maxAge: '1d',
    extensions: ['jpg', 'jpeg', 'png', 'gif'],
   }));
  app.enableCors();
  await app.listen(3000);
}
bootstrap();
