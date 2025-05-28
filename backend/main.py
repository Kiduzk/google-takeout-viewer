import os
import sqlite3
import mimetypes
from time import time

start = time()

conn = sqlite3.connect("testing.db")
cursor = conn.cursor()

cursor.execute('''
CREATE TABLE IF NOT EXISTS files (
    path TEXT PRIMARY KEY,
    name TEXT,
    size INTEGER,
    modified_time INTEGER,
    created_time INTEGER,
    hash TEXT,
    type TEXT
)''')

cursor.execute('''
CREATE TABLE IF NOT EXISTS folders (
    path TEXT PRIMARY KEY,
    name TEXT
    hash TEXT
)''')


def get_file_type(file_path):
    file_name, file_extension = os.path.splitext(file_path)
    if file_extension:
      return file_extension

    mime_type, _ = mimetypes.guess_type(file_path)
    if mime_type:
      return mimetypes.guess_extension(mime_type)

    return None


def index_file(path):
    '''
    Indexes a file by adding it to the sqlite databse
    '''

    name = os.path.basename(path)
    size = os.path.getsize(path)
    modified_time = os.path.getmtime(path)
    created_time = os.path.getctime(path)
    return (
        path,
        name,
        size,
        int(modified_time),
        int(created_time),
        None,  
        get_file_type(path)
    )

print("Indexing files...")

conn.execute("BEGIN")
index_values = []
for path, subFolders, files in os.walk(".."):
    for file in files:
        index_values.append(index_file(os.path.join(path, file)))

cursor.executemany('''
INSERT OR REPLACE INTO files (path, name, size, modified_time, created_time, hash, type)
VALUES (?, ?, ?, ?, ?, ?, ?)
''', index_values)

conn.commit()
conn.close()
print("Done. Took ", time() - start)