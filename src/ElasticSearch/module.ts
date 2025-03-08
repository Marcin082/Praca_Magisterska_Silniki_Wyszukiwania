import { Module } from '@nestjs/common';
import { ElasticRepository } from './repository';
import { ElasticController } from './controller'; 
import { ElasticService } from './service';
import { Parser } from './parser';

@Module({
    imports: [],   
    controllers: [ElasticController],
    providers: [ElasticRepository, ElasticService, Parser],
})
export class ElasticModule {} 