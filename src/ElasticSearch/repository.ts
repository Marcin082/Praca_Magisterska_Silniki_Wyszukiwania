import { Injectable } from '@nestjs/common';
import { Client } from '@elastic/elasticsearch';

@Injectable()
export class ElasticRepository {
  private readonly client: Client;

  constructor() {
    this.client = new Client({ node: 'http://elasticsearch:9200' });
  }  

  async indexData(index: string, allData: any[], type: string) {
    const body = allData.flatMap(doc => [
      { index: { _index: index } },
      doc
    ]);
    await this.client.bulk({ body, timeout: '60s' });
  }

  async updateData(index: string, chunk:any) {
    return this.client.bulk({
      body: chunk,
      refresh: true
    });
  }
  async searchAll(index: string) {
    const result = await this.client.search({
      index,
      scroll: '1m',
      size: 1000,
      body: { query: { match_all: {} } }
    });
  
    const allData = [];
    
    let scroll_id = result._scroll_id;
    let hits = result.hits.hits;
  
    while (hits.length > 0) {
      const data = hits.map(hit => ({
        id: hit._id,
        price: (hit._source as { price?: number }).price ?? null
      }));
  
      allData.push(...data);
  
      const scrollResult = await this.client.scroll({
        scroll_id,
        scroll: '1m',
      });
  
      scroll_id = scrollResult._scroll_id;
      hits = scrollResult.hits.hits;
    }
  
    return { data: allData };
  }
  
  

  async search(index: string, title: string) {
    return this.client.search({
      index,
      body: {
        query: {
          match: {
            title
          }
        },
        size: 10000
      },
    });
  }

  async searchFullText(index: string, queryString: string) {
    return this.client.search({
      index,
      body: {
        query: {
          match: {
            content: queryString,
          },
        },
        highlight: {
          fields: {
            content: {},
          },
        },
        size: 10000,
      },
    })
  }

  async createIndex(index: string, mapping: any) {
    try {
      const indexExists = await this.client.indices.exists({ index })
      if (indexExists) {
        console.log(`Index ${index} already exists.`)
        return
      }

      await this.client.indices.create({
        index: index,
        body: mapping,
      })

      console.log(`Index ${index} created successfully`)
    } catch (error) {
      console.error(`Error creating index ${index}:`, error)
      throw error
    }
  }
}