import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  info() {
    return { name: 'All in One - AZAV LMS & QM', version: '0.1.0' };
  }
}
