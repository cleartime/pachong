import { Controller, Get, Query, Post, Body } from '@nestjs/common';
import { IndexService } from './index.service';

@Controller('fetch')
export class IndexController {
  constructor(private indexService: IndexService) {}
  @Post()
  findAll2() {
    return {
      sfddsf:2,
      sdfds:3
    };
  }
  @Get()
  findAll() {
    this.indexService.findAll();
  }
}
