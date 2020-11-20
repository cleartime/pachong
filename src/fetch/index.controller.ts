import { Controller, Get, Query, Post, Body, Param } from '@nestjs/common';
import { IndexService } from './index.service';
import { acfunlogin, geekLogin } from '../client/index';
@Controller('fetch')
export class IndexController {
  constructor(private indexService: IndexService) {}
  @Post('geekLogin')
  geekhublogin() {
    geekLogin();
  }
  @Post('acfunlogin')
  login() {
    acfunlogin();
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
