from typing import Union
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from google_takeout_parser.path_dispatch import TakeoutParser
from google_takeout_parser.models import Activity


tp = TakeoutParser(r"C:\previous_computer_files_and_backups\summer_2025_googletakeout\json_version\takeout-20250529T162908Z-2-001\Takeout")
tp.dispatch_map()

origins = [
    "http://localhost:5173"
]

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=origins)


@app.get("/")
def read_root():
    return [{"Hello": "World"}]

@app.get("/youtube_history")
def read_youtube_history():
    cached = list(tp.parse(cache=False, filter_type=Activity))
    youtube_history = []
    id = 0
    for entry in cached:
        youtube_history.append(
            {
                "id": id,
                "title": entry.title,
                "time": entry.time,
                "description": entry.description,
                "titleUrl": entry.titleUrl,
                "details": entry.details,
                "products": entry.products,
            }
        )
        id += 1
    
    return youtube_history

@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}