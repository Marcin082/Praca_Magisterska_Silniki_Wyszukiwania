import { Injectable } from "@nestjs/common";
import path from "path";
import fs from 'fs';
import JSZip from 'jszip';
import { Readable } from "stream";
import csv from 'csv-parser';
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

      async parseNytimesArticles() {
        const allData = [];
      
        return new Promise((resolve, reject) => {
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
                id: row.id
              };
              allData.push(obj);
            })
            .on('end', () => {
              resolve(allData);
            })
            .on('error', (error) => {
              reject('Error reading CSV file: ' + error);
            });
        });
      }
}