import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/common';

@Injectable()
export class IndexService {
  constructor(private httpService: HttpService) {}

  async findAll(){
    const res = await this.httpService.get('http://localhost:3000/cats').toPromise();
    console.log(res.data)
  }
}