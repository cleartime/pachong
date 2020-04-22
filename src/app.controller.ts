import { Controller, Get, Query, Post, Body, Put, Param, Delete } from '@nestjs/common';

@Controller()
export class AppController {
  @Post()
  create(@Body() createCatDto) {
    return 'This action adds a new cat';
  }

  @Get()
  findAll(@Query() query) {
    return `This action returns all cats (limit: ${query.limit} items)`;
  }
}
