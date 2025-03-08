import { Injectable } from '@nestjs/common';
import { SolrRepository } from './repository';
import { Parser } from './parser';

@Injectable()
export class SolrService {
  constructor(
    private readonly solrRepository: SolrRepository,
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
     const chunks = this.chunkData(data, BULK_SIZE);

      for (const chunk of chunks) {
        await this.solrRepository.indexData(index, chunk);      
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
  

  async updateData(core: string) {
    try {
      const allDocs = await this.solrRepository.getAllDocuments(core)
      const updatedDocs = allDocs.map((doc) => ({
        ...doc,
        price: Number.parseFloat((doc.price * 0.9).toFixed(2)),
      }))

      const BULK_SIZE = 1000
      const chunks = this.chunkData(updatedDocs, BULK_SIZE)

      for (const chunk of chunks) {
        await this.solrRepository.updateData(core, chunk)
      }

      console.log(`Successfully updated ${allDocs.length} documents.`)
      return { status: "success", message: `Updated ${allDocs.length} documents` }
    } catch (error) {
      console.error("Error updating data:", error)
      throw error
    }
  }

  async search(core:string, query: string) {
    const result = await this.solrRepository.search(core, query);
    const totalCount =  result.numFound;
    const data = result.docs.map(doc => {
      return {
        id: doc.id,
        score: doc.score,
        title: doc.title,
        categoryName: doc.categoryName,
      };
    });
    return {totalCount: totalCount.value, data}
  }


  async searchFullText(index: string, queryString: string) {
    const result = await this.solrRepository.searchFullText(index, queryString)

    const totalCount = result.response.numFound
    const data = result.response.docs.map((doc) => {
      const highlight = result.highlighting[doc.id]?.content?.[0] || ""
      return {
        id: doc.id,
        score: doc.score,
        title: doc.title,
        author: doc.author,
        highlight: highlight,
      }
    })

    return { totalCount: totalCount, data }
  }
}