import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { CatsController } from './catsController';
import { AppService } from './app.service';
import { CatsService } from './catsService';
// import { MongooseModule } from '@nestjs/mongoose';
import { FetchModule } from './fetch';
// import { BlogModule } from './blog/blog.module';

@Module({
  imports: [
    // MongooseModule.forRoot('mongodb://localhost/nest-blog', {
    //   useNewUrlParser: true,
    // }),
    FetchModule,
    // BlogModule,
  ],
  controllers: [AppController, CatsController],
  providers: [AppService, CatsService],
})
export class AppModule {}
