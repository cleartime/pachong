import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): any {
    return [{
      a: '2',
      b: 3,
    }]
  }
}
