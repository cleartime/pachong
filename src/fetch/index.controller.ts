import { Controller, Get, Query, Post, Body, Param } from '@nestjs/common';
import { IndexService } from './index.service';
import { login } from '../client/index';
import { from } from 'rxjs';
@Controller('fetch')
export class IndexController {
  constructor(private indexService: IndexService) {}
  @Post('login')
  login() {
    login();
  }
  @Get()
  findAll() {
    return this.indexService.findAll();
  }
  @Get(':id')
  finOne(@Param('id') id) {
    return this.indexService.findOne(id);
  }
}
