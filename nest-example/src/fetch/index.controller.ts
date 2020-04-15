import { Controller, Get, Query, Post, Body } from '@nestjs/common';
import { IndexService } from './index.service';

@Controller('fetch')
export class IndexController {
  constructor(private indexService: IndexService) {}

  @Get()
  findAll() {
    this.indexService.findAll();
  }
}
