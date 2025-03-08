import { Module } from '@nestjs/common';
import { SolrController } from './controller';
import { SolrRepository } from './repository';
import { SolrService } from './service';
import { Parser } from './parser';

@Module({
    imports: [],
    controllers: [SolrController],
    providers: [SolrRepository, SolrService, Parser],
})
export class SolrModule {}