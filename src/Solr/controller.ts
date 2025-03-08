import { Body, Controller, Get, Post, Put, Query } from '@nestjs/common';
import { SolrService } from './service';

@Controller('solr')
export class SolrController {
  constructor(private readonly solrService: SolrService) {}

  @Post('/index-data')
  async index(
    @Query('index') index: string,
    @Query('type') type: string,
  ) {
    return this.solrService.indexData(index, type);
  }
  @Put('/update-data') 
  async update(
    @Body('index') index: string, 
  ) {
    return this.solrService.updateData(index);
  }

  @Get('/search')
  async search(
    @Query('index') index: string,
    @Query('title') title: string,
  ) {
    return this.solrService.search(index, title);
  }
  @Get('/search-full-text') 
  async searchFullText(
    @Query('index') index: string,
    @Query('queryString') queryString: string,
  ) {
    return this.solrService.searchFullText(index, queryString);
  }
}
