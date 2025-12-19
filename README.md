# google-takeout-viewer

A command-line tool to view your Google Takeout data. 

## What is google takeout?

You can export your data from google services and products as a takeout zip file. This will contain youtube histories, notes, etc... 

## Installation

```bash
pip install google-takeout-viewer
```

## Quick Start

1. **Download your data** from [Google Takeout](https://takeout.google.com)

2. **Parse the data**:
```bash
takeout-viewer parse /path/to/takeout.zip
```
You can parse many takeouts as you want. Each parse command will add the parsed info into an SQLite command. For the parsing logic, it utilizes the takeout parser package: https://github.com/purarue/google_takeout_parser. 

3. **View in browser**:
```bash
takeout-viewer view
```

Opens http://127.0.0.1:8000 with your data

## Commands

- `takeout-viewer parse <path>` - Parse a Google Takeout ZIP or folder
- `takeout-viewer view` - Start server and open browser
- `takeout-viewer clear` - Clear the local database containing the parsed info

## Supported Data

- YouTube watch history
- YouTube search history  
- YouTube comments
- Google Keep notes

## In the works / Future goals

I see two main ways to expand this project.
1) Support more data formats like location history, music history, emails, etc ...
2) Add visualizations for existing formats. We could have for example graphs or charts.

## Contributions

Any contribution and feedback is welcome! I am hoping to create a comprehensive way to easily browse and view takeout files. 

## Tech Stack
- **Backend**: FastAPI + Peewee ORM + SQLite
- **Frontend**: React + TypeScript + Vite
- **CLI**: Click
- **Parsing**: google-takeout-parser

