import { Module } from '@nestjs/common';
import dotenv from 'dotenv';
import { ElasticModule } from './ElasticSearch/module';
import { SolrModule } from './Solr/module';

dotenv.config();
@Module({
    imports: [ElasticModule, SolrModule],  
    providers: [], 
})
export class ApplicationModule {}
