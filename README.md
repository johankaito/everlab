# Everlab

## Overview
A responsive web application which:
- accepts pathology reports in the form of HL7/ORU format
- automatically interprets the reports

## Process

### Automatic interpretation
- The application highlights to the doctor which results are high risk

### Running
- backend
```sh
cd backend && yarn && yarn start
```

- frontend
```sh
cd frontend && yarn && yarn start
```

## Take-home Plan of Attack

### Approach

#### User Interface

- intentionally skipping login
    - not essential aspect of the take home
- allow for:
    - dashboard
        - button to upload a new file
            - once file is uploaded
            - link file to account and send it to s3
            - run analysis on the file
                - save results of the analysis in a table
        - (stretch) has a list of patients
        - (stretch) clicking on a patient shows:
            - their pathology reports
        - (stretch) analytics for the doctor’s patient load
    - analysis - flags high risk results by report
        - has two groups:- Everlab risk, standard risk
        - each group
            - ordered by date
            - grouped by date
    - (stretch) pathology reports
        - ordered by date
        - grouped by date
        - these are just raw reports

### Workflow

#### Backend

1. assumptions
    1. A given HL7 file contains information only about one patient
    2. At least one metric is needed to match a diagnostic but not all three
2. load the csv files into a local db
    1. analyse the documents to figure out the data types to use for the columns
    2. test that you can read the data locally
3. create a backend
4. add DAOs which allow for reading from the local db
5. add endpoint to fetch analyses per patient
6. add endpoint to accept file upload
    1. save file locally for now (will be sent to s3 later on)
    2. generate analysis of the file and save the analysis results to the local db

#### Frontend

1. create a react app with a simple component library
2. implement the landing page
3. implement the dashboard
4. implement ability to upload pathology report
5. implement ability to view pathology report analyses

#### Improvements

1. introduce user authentication
    1. primary focus was on parsing the file and not authentication
    2. e.g. i’d consider using passportjs, email and or SMS OTP depending on the needs/what doctors are normally used to
2. upload HL7/ORU file improvements
    1. upload file to s3 as part of the processing instead of server storage
    2. pull out and save patient information per file upload
        1. allows for patient information to be pulled (if there currently isn’t a way to get the data)
        2. over time, we can start to observe when particular risk factors become apparent and show this to the doctor as part of the dashboard
        3. a few more others
    3. create a more robust HL7 parser
        1. provides finer control in making observation data specific to the patient provided in the PID section
3. use providers in the frontend to manage data fetched from the backend
    1. a caching layer might come in handy as well
4. add stricter typing of the entities
    1. instead of having all of them be strings
    2. use camelCase (or snake_case if preferred) all across the codebase
        1. consistency is the name of the game here, pick one standard and stick to it
    3. type sharing between the frontend and backend
5. use appropriate db solution
    1. either use a proper NoSQL solution e.g. MongoDB
    2. or use an SQL solution e.g. Postgres
6. switch from expressjs to Nestjs to make a production ready platform
    1. will allow for faster development
    2. introduces DTOs and DAOs for easier data manipulation
    3. has better typing
    4. be sure to also implement tests
    5. the Nest.js structure will also naturally help with the project organisation as the codebase grows e.g.
        1. specific spec files, DAOs, DTOs, etc
7. consider writing the project in GraphQL
    1. performance was highlighted as one of the key factors to consider
    2. using GraphQL will help prevent overfetching especially when aggregating data across multiple resources which is bound to happen as the application matures
8. improvements to the dashboard
    1. allow ability for doctors to suggest the new ranges which should show up as risk factors
        1. there could be a peer review system introduced here as well where other doctors on the platform vote on the suggestions
