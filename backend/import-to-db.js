const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Function to read data from a CSV file and convert it to JSON
function csvToJson(csvFilePath, callback) {
  const jsonArray = [];

  fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on('data', (row) => {
      jsonArray.push(row);
    })
    .on('end', () => {
      callback(null, jsonArray);
    })
    .on('error', (err) => {
      callback(err, null);
    });
}

// Function to convert all CSV files in a directory to JSON
function convertCsvFilesToJson(directoryPath) {
  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      console.error('Error reading directory:', err);
      return;
    }

    files.forEach((file) => {
      if (path.extname(file).toLowerCase() === '.csv') {
        const csvFilePath = path.join(directoryPath, file);
        const jsonFilePath = path.join(
          directoryPath,
          `${path.basename(file, '.csv')}.json`,
        );

        csvToJson(csvFilePath, (csvErr, data) => {
          if (csvErr) {
            console.error(`Error converting ${file} to JSON:`, csvErr);
          } else {
            fs.writeFile(
              jsonFilePath,
              JSON.stringify(data, null, 2),
              (writeErr) => {
                if (writeErr) {
                  console.error(
                    `Error writing JSON file ${jsonFilePath}:`,
                    writeErr,
                  );
                } else {
                  console.log(
                    `Successfully converted ${file} to JSON: ${jsonFilePath}`,
                  );
                }
              },
            );
          }
        });
      }
    });
  });
}

// Main function
function main() {
  const directoryPath = process.argv[2];
  if (!directoryPath) {
    console.error(
      'Please provide the directory path as a command-line argument.',
    );
    return;
  }

  convertCsvFilesToJson(directoryPath);
}

main();
