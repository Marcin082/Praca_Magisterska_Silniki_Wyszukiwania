import { Injectable } from "@nestjs/common";
import { ElasticRepository } from "./repository";
import { SearchTotalHits } from "@elastic/elasticsearch/lib/api/types";
import { Parser } from "./parser";
import { fullTextSearchConfig } from "./config-full-text-serach";
interface Source {
  title: string;
  categoryName: string;
}

@Injectable() 
export class ElasticService {
  constructor(
    private readonly elasticRepository: ElasticRepository,
    private readonly parser: Parser 
  ) {}

  async indexData(index: string, type: string) {
    const BULK_SIZE = 1000;
    try {
      let data;
      switch (type) {
        case 'amazon':
          data = await this.parser.parseAmazon();
          break;
        case 'nytimes':
          data = await this.parser.parseNytimesArticles();
          break;
        default:
          throw new Error(`Unknown data type: ${type}`);
      }
      if(type==='nytimes'){
        await this.elasticRepository.createIndex(index, fullTextSearchConfig)
      }    
      const chunks = this.chunkData(data, BULK_SIZE);

      for (const chunk of chunks) {
        await this.elasticRepository.indexData(index, chunk, type);      
      }
      console.log(`Successfully indexed ${data.length} items.`);
    } catch (error) {
      console.error("Error processing or indexing data:", error);
      throw error;
    }
  }
  chunkData(data: any[], size: number): any[][] {
    const chunks = [];
    for (let i = 0; i < data.length; i += size) {
      chunks.push(data.slice(i, i + size));
    }
    return chunks;
  }

  async updateData(index: string) {
    const result = await this.elasticRepository.searchAll(index);
    const data = result.data.filter(doc => doc.price);

    const objects = data.map(doc => [
      { update: { _id: doc.id, _index: index } },
      { doc: { price: (doc.price * 0.9).toFixed(2) } }
    ]).flat();

    const chunks = this.chunkData(objects, 10000); 
    for (const chunk of chunks) {
      await this.elasticRepository.updateData(index, chunk);
    }
  }

  async search(index: string, title: string) {
    const result = await this.elasticRepository.search(index, title);
    
    const totalCount =  result.hits.total as SearchTotalHits;

    const data = result.hits.hits.map(hit => {
      const typedHit = hit as { _source: Source, _id: string, _score: number, };
      return {
        id: typedHit._id,
        score: typedHit._score,
        title: typedHit._source.title,
        categoryName: typedHit._source.categoryName,
      };
    });
    return {totalCount: totalCount.value, data}
  }

  async searchFullText(index: string, queryString: string) {
    const result = await this.elasticRepository.searchFullText(index, queryString)

    const totalCount = result.hits.total as SearchTotalHits

    const data = result.hits.hits.map((hit) => {
      const typedHit = hit as { _source: any; _id: string; _score: number; highlight?: { content?: string[] } }
      return {
        id: typedHit._id,
        score: typedHit._score,
        title: typedHit._source.title,
        author: typedHit._source.author,
        highlight: typedHit.highlight?.content ? typedHit.highlight.content[0] : null,
      }
    })

    return { totalCount: totalCount.value, data }
  }
}
