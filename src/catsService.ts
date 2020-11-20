import { Injectable } from '@nestjs/common';
interface Cat {
  name: string;
  age: number;
  breed: string;
}
@Injectable()
export class CatsService {
  private readonly cats: Cat[] = [];

  create(cat: Cat) {
    this.cats.push(cat);
  }

  findAll() {
    return {
      a: 13,
      b: 22,
    };
  }
}
