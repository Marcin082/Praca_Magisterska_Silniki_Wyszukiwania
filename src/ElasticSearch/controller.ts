import { Body, Controller, Get, Post, Put, Query } from '@nestjs/common';
import { ElasticService } from './service';

@Controller('elastic')
export class ElasticController {
  constructor(private readonly elasticService: ElasticService) {}

  @Post('/index-data')
  async index(
    @Query('index') index: string,
    @Query('type') type: string,
  ) {
    return this.elasticService.indexData(index, type);
  }

  @Put('/update-data') 
  async update(
    @Body('index') index: string,
  ) {
    return this.elasticService.updateData(index);
  }

  @Get('/search')
  async search(
    @Query('index') index: string,
    @Query('title') title: string,
  ) {
    return this.elasticService.search(index, title);
  }

  @Get('/search-full-text') 
  async searchFullText(
    @Query('index') index: string,
    @Query('queryString') queryString: string,
  ) {
    return this.elasticService.searchFullText(index, queryString);
  }
}
