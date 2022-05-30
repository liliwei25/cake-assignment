import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { SchemasModule } from './schemas/schemas.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://root:example@localhost:27017/'),
    SchemasModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
