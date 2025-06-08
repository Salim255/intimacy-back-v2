import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { LocationService } from '../../../geolocation/location.service';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { CreateProfileDto } from '../../../modules/profiles/profile-dto/profile-dto';

@Injectable()
export class GoogleHomeInterceptor implements NestInterceptor {
  constructor(private readonly locationService: LocationService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest<Request>();

    const { latitude, longitude } = req.body as CreateProfileDto;
    if (latitude && longitude) {
      const location: { city: string; country: string } | null =
        await this.locationService.reverseGeocode(latitude, longitude);
      console.log(location);
      if (location) {
        Object.assign(req.body, {
          city: location.city,
          country: location.country,
        });
      }
    }

    return next.handle();
  }
}
