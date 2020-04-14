import { Controller, Get, Post, Body } from '@nestjs/common';
import { CatsService } from './catsService';
interface Cat {
  name: string;
  age: number;
  breed: string;
}
@Controller('cats')
export class CatsController {
  constructor(private catsService: CatsService) {}

  @Post()
  async create(@Body() createCatDto) {
    this.catsService.create(createCatDto);
  }

  @Get()
  async findAll(): Promise<Cat[]> {
    return this.catsService.findAll();
  }
}