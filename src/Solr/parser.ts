import { All, Injectable } from "@nestjs/common";
import path from "path";
import fs from 'fs';
import JSZip, { file } from 'jszip';
import { Readable } from "stream";
import csv from 'csv-parser';
import { SearchTotalHits } from "@elastic/elasticsearch/lib/api/types";
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
@Injectable()
export class Parser {
    async parseAmazon(){
        const zipFilePath = path.resolve('./amz_ca_total_products_data_processed.csv.zip');
    try {
     const zipBuffer = await fs.promises.readFile(zipFilePath);

     const zip = await JSZip.loadAsync(zipBuffer);   
 
     const csvFileName = Object.keys(zip.files).find(file => file.endsWith('.csv'));
     if (!csvFileName) {
       throw new Error("CSV file not found in the ZIP archive."); 
     }

     const csvBuffer = await zip.file(csvFileName)?.async('nodebuffer');
     if (!csvBuffer) {
       throw new Error("Unable to read the CSV file from the ZIP.");
     }
     const allData = await this.parseCSV(csvBuffer);
     if (allData.length === 0) {
       throw new Error("No data parsed from the CSV file.");
     }
     return allData
    } catch (error) {
      console.error("Error processing or indexing data:", error);
      throw error;
    }
    }
    async parseCSV(csvBuffer: Buffer): Promise<any[]> {
        return new Promise((resolve, reject) => {
          const results = [];
          const stream = Readable.from(csvBuffer);
    
          stream
            .pipe(csv())
            .on('data', (data) => {
              results.push(data);
            })
            .on('end', () => {
              resolve(results);
            })
            .on('error', (err) => {
              reject(err);
            });
        });
      }

      async parseNytimesArticles(){
        const allData: any[] = [];
  
      fs.createReadStream('./nytimes front page.csv')
        .pipe(csv({
          quote: '"',  
          escape: '"',
        }))
        .on('data', (row) => {
          if (row.content) {
            row.content = row.content.replace(/^"|"$/g, '');
          }
          const obj = {
            title: row.title,
            author: row.author,
            content: row.content,
            date: row.date,
            id:row.id
          }
          allData.push(obj);
        })
        .on('error', (error) => {
          console.error('Error reading CSV file:', error);
        });
        return allData
      }

      async parseArticlesData(){
        try {
            const db = await open({
              filename: './all-the-news.db',
              driver: sqlite3.Database,
            });
            const tables = await db.all("SELECT name FROM sqlite_master WHERE type='table'");
    
            // console.log("Tables in database:", tables.map((t) => t.name));
            // const rows = await db.all(`SELECT * FROM db`);
            // if (rows.length === 0) {
            //   throw new Error("No data found in the SQLite database.");
            // }
            // return rows
          } catch (error) {
            console.error("Error processing or indexing data from SQLite:", error);
            throw error;
          }
      }
}