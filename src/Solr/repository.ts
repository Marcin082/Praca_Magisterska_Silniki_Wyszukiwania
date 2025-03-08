import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class SolrRepository {
  private readonly solrUrl: string;

  constructor() {
    this.solrUrl = 'http://solr:8983/solr';
  }
  
  async indexData(core:string, data: Record<string, any>) {
    const url = `${this.solrUrl}/${core}/update/json/docs?commit=true`;
    try {
      const response = await axios.post(url, [data], {
        headers: { 'Content-Type': 'application/json' },
      });
      return response.data;
    } catch (error) {
      console.log(error)
      throw new Error(`Error indexing data: ${error.message}`);
    }
  }

  async getAllDocuments(core: string) {
    const url = `${this.solrUrl}/${core}/select?q=*:*&rows=1000000`
    try {
      const response = await axios.get(url)
      return response.data.response.docs
    } catch (error) {
      console.error(`Error fetching all documents: ${error}`)
      throw error
    }
  }

  async updateData(core: string, data: Record<string, any>[]) {
    const url = `${this.solrUrl}/${core}/update?commit=true`
    try {
      const response = await axios.post(url, data, {
        headers: { "Content-Type": "application/json" },
      })
      return response.data
    } catch (error) {
      console.error(`Error updating data: ${error}`)
      throw error
    }
  }
  async search(core: string, query: string) {
    const url = `${this.solrUrl}/${core}/select?q=${encodeURIComponent('title:'+ query)}&fl=*,score&rows=10000`;
    try {
      const res = await axios.get(url);
      return res.data.response
    } catch (error) {
      console.error(`Full error: ${error}`);
      throw new Error(`Error searching data: ${error.message}`);
    }
  }

  async searchFullText(core: string, query: string) {
    const url = `${this.solrUrl}/${core}/select?q=${encodeURIComponent('content:' + query)}&df=content&fl=*,score&rows=10000&hl=on&hl.fl=content&hl.snippets=1&hl.fragsize=150`

    try {
      const res = await axios.get(url)
      return res.data
    } catch (error) {
      console.log(error)
      throw new Error(`Error searching full text data: ${error.message}`)
    }
  }
}