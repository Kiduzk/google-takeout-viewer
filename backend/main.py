import os
import sqlite3

conn = sqlite3.connect("testing.db")
cursor = conn.cursor()

cursor.execute('''
CREATE TABLE IF NOT EXISTS files (
    path TEXT PRIMARY KEY,
    name TEXT,
    size INTEGER,
    modified_time INTEGER,
    hash TEXT,
    type TEXT
)''')

cursor.execute('''
CREATE TABLE IF NOT EXISTS folders (
    path TEXT PRIMARY KEY,
    name TEXT
    hash TEXT
)''')

print("Indexing files...")
for path, subFolders, files in os.walk("."):
    print(path)

print("Done.")