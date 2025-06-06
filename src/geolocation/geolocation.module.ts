import { Module } from '@nestjs/common';
import { LocationService } from './location.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [LocationService],
  exports: [LocationService],
})
export class GeolocationModule {}
