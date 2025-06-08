import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

interface GoogleGeocodeResponse {
  plus_code: {
    compound_code: string;
    global_code: string;
  };
  results: Array<{
    address_components: Array<{
      long_name: string;
      types: string[];
    }>;
  }>;
}

@Injectable()
export class LocationService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async reverseGeocode(
    lat: number,
    lng: number,
  ): Promise<{ city: string; country: string } | null> {
    const apiKey = this.configService.get<string>('GoogleMapAPIKey');
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;

    try {
      const res =
        await this.httpService.axiosRef.get<GoogleGeocodeResponse>(url);
      const data = res.data;
      if (!data || !data.results?.length) return null;

      // Prefer plus_code if available
      if (data.plus_code?.compound_code) {
        const compound = data.plus_code.compound_code;

        // Remove the plus code (first word) — e.g., 'J2M7+2CH'
        const parts = compound.split(' ');
        parts.shift(); // remove 'J2M7+2CH'

        const locationString = parts.join(' '); // "Babyntsi, Kyiv Oblast, Ukraine"
        const segments = locationString.split(',').map((s) => s.trim());

        const country = segments.pop(); // remove and store the last part as country
        const city = segments.join(', '); // rest is the "city"

        return city && country ? { city, country } : null;
      }

      // Fallback to address_components if no plus_code
      const components = data.results[0].address_components;

      const city = components.find(
        (c) =>
          c.types.includes('locality') ||
          c.types.includes('administrative_area_level_1'),
      )?.long_name;

      const country = components.find((c) =>
        c.types.includes('country'),
      )?.long_name;

      return city && country ? { city, country } : null;
    } catch (error: any) {
      const errMessage =
        error instanceof Error ? error?.message : 'unknown error';
      console.error('Failed to reverse geocode:', errMessage);
      return null;
    }
  }
}
