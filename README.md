# google-takeout-viewer

A command-line tool to visualize your Google Takeout data. Browse your YouTube history, comments, and Google Keep notes in an interactive web interface.

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
You can parse many takeouts as you want. Each parse command will add the parsed info into an SQLite command.

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

We can grow the codebase to be able to parse and view any data.

## Requirements
