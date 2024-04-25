import express from 'express';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { DAO } from './dao.helpers';
import {
  Condition,
  Diagnostic,
  DiagnosticGroup,
  DiagnosticMetric,
} from './types';

const db = {
  diagnosticGroupsDAO: new DAO<DiagnosticGroup>('diagnostic_groups'),
  diagnosticsDAO: new DAO<Diagnostic>('diagnostics'),
  conditionsDAO: new DAO<Condition>('conditions'),
  diagnosticMetricsDAO: new DAO<DiagnosticMetric>('diagnostic_metrics'),
};
const app = express();
const port = 3000;
const directoryPath = '../data/';

app.get('/', (req, res) => {
  res.send('Hello, TypeScript with Express!');
});

app.get('/load_data', (req, res) => {
  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      console.error('Error reading directory:', err);
      return;
    }

    files.forEach((file) => {
      if (path.extname(file).toLowerCase() === '.csv') {
        const csvFilePath = path.join(directoryPath, file);
        const fileName = path.basename(file, '.csv');
        const jsonFilePath = path.join(directoryPath, `${fileName}.json`);

        csvToJson(csvFilePath, (csvErr: any, data: any) => {
          if (csvErr) {
            console.error(`Error converting ${file} to JSON:`, csvErr);
          } else {
            db.diagnosticGroupsDAO.insertBulk(data);
            switch (fileName) {
              case 'diagnostic_groups':
                (async () => {
                  await db.diagnosticGroupsDAO.insertBulk(data);
                })();
                break;
              case 'diagnostics':
                (async () => {
                  await db.diagnosticsDAO.insertBulk(data);
                })();
                break;
              case 'conditions':
                (async () => {
                  await db.conditionsDAO.insertBulk(data);
                })();
                break;
              case 'diagnostic_metrics':
                (async () => {
                  await db.diagnosticMetricsDAO.insertBulk(data);
                })();
                break;
            }
            console.log(
              `Successfully converted ${file} to JSON: ${jsonFilePath}`,
            );
          }
        });
      }
    });
  });
  res.send('Hello, TypeScript with Express!');
});

app.get('/test', (req, res) => {
  (async () => {
    const data = await db.diagnosticsDAO.getData();
    res.json(data);
  })();
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

const csvToJson = (csvFilePath: string, callback: any) => {
  const jsonArray: any = [];

  fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on('data', (row: any) => {
      jsonArray.push(row);
    })
    .on('end', () => {
      callback(null, jsonArray);
    })
    .on('error', (err) => {
      callback(err, null);
    });
};
