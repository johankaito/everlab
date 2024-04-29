import express from 'express';
import fs from 'fs';
import readline from 'readline';
import path from 'path';
import { DAO } from './dao.helpers';
import {
  Analysis,
  Condition,
  Diagnostic,
  DiagnosticGroup,
  DiagnosticMetric,
  HL7File,
} from './types/types';
import {
  groupByPatientSSN,
  analyseTestResults,
  upload,
  processHL7File,
} from './utils';

const db = {
  diagnosticGroupsDAO: new DAO<DiagnosticGroup>('diagnostic_groups'),
  diagnosticsDAO: new DAO<Diagnostic>('diagnostics'),
  conditionsDAO: new DAO<Condition>('conditions'),
  diagnosticMetricsDAO: new DAO<DiagnosticMetric>('diagnostic_metrics'),
  processedHLSFilesDAO: new DAO<HL7File>('processed_hls_file'),
  analysesDAO: new DAO<Analysis>('analysis'),
};
const app = express();
const port = 8000;

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, OPTIONS, PUT, PATCH, DELETE',
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-Requested-With,content-type',
  );
  res.setHeader('Access-Control-Allow-Credentials', true.toString());

  next();
});

app.get('/ping', (req, res) => {
  res.send('pong');
});

app.post('/upload', upload.single('file'), async (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  // read file and save data
  const clear = req.query.clear;
  let prefix = '';
  if (clear == 'true') {
    await db.processedHLSFilesDAO.clear();
    await db.analysesDAO.clear();
    prefix = 'Cleared!! ';
  }

  // process the file
  const processedFile = await processHL7File(file.path);
  db.processedHLSFilesDAO.insert(processedFile);

  // analyse results
  const analyses = await analyseTestResults(
    processedFile,
    await db.diagnosticMetricsDAO.get(),
    await db.conditionsDAO.get(),
  );

  // store the analyses
  await db.analysesDAO.insertBulk(analyses);
  res.json(analyses);
});

app.get('/analyses', async (req, res) => {
  res.json(groupByPatientSSN(await db.analysesDAO.get()));
});

app.get('/clear-analyses', async (req, res) => {
  await db.analysesDAO.clear();
  await db.processedHLSFilesDAO.clear();
  res.json({ success: true });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
