from typing import Union
from fastapi import FastAPI
from google_takeout_parser.path_dispatch import TakeoutParser
from google_takeout_parser.models import Activity


tp = TakeoutParser(r"C:\previous_computer_files_and_backups\summer_2025_googletakeout\json_version\takeout-20250529T162908Z-2-001\Takeout")
tp.dispatch_map()

app = FastAPI()

@app.get("/")
def read_root():
    return [{"Hello": "World"}]

@app.get("/youtube_watch_history")
def read_youtube_watch_history():
    cached = list(tp.parse(cache=True, filter_type=Activity))
    youtube_watch_history = []
    for entry in cached:
        youtube_watch_history.append(
            {
                "title": entry.title,
                "time": entry.time,
                "description": entry.description,
                "titleUrl": entry.titleUrl,
                "details": entry.details,
            }
        )
    
    return youtube_watch_history[:100]


@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}