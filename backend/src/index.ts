import express from 'express';
import fs from 'fs';
import readline from 'readline';
import path from 'path';
import { DAO } from './dao.helpers';
import {
  Condition,
  Diagnostic,
  DiagnosticGroup,
  DiagnosticMetric,
  HL7File,
} from './types/types';
import { analyseTestResults, upload, processHL7File } from './utils';

const db = {
  diagnosticGroupsDAO: new DAO<DiagnosticGroup>('diagnostic_groups'),
  diagnosticsDAO: new DAO<Diagnostic>('diagnostics'),
  conditionsDAO: new DAO<Condition>('conditions'),
  diagnosticMetricsDAO: new DAO<DiagnosticMetric>('diagnostic_metrics'),
  processedHLSFilesDAO: new DAO<HL7File>('processed_hls_file'),
};
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello world');
});

app.post('/upload', upload.single('file'), (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).send('No file uploaded.');
  }

  (async () => {
    // read file and save data
    const clear = req.query.clear;
    let prefix = '';
    if (clear == 'true') {
      await db.processedHLSFilesDAO.clear();
      prefix = 'Cleared!! ';
    }
    const processedFile = await processHL7File(file.path);
    db.processedHLSFilesDAO.insert(processedFile);

    // analyse results
    const analysis = await analyseTestResults(
      processedFile,
      await db.diagnosticMetricsDAO.get(),
    );

    // group analysis by oru_sonic_codes, order by date asc
    // allows for same kind of tests done multiple times to be organized so that
    // it's easier to spot when the patient enterred a particular risk zone

    // return analysis
    res.json(analysis);
  })();
});

app.get('/files', (req, res) => {
  (async () => {
    const name = req.query.name?.toString();
    const data = await new DAO<HL7File>(name || 'diagnostics').get();
    res.json(data);
  })();
});

app.get('/reports/:patientId', (req, res) => {
  (async () => {
    const patiendId = req.params.patientId;
    const data = await db.diagnosticsDAO.get();
    res.json(data);
  })();
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
