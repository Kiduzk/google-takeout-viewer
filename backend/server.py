import json
from typing import Union
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from google_takeout_parser.path_dispatch import TakeoutParser
from google_takeout_parser.models import Activity, CSVYoutubeComment

PATH = r"C:\previous_computer_files_and_backups\summer_2025_googletakeout\json_version\takeout-20250529T162908Z-2-001\Takeout"
tp = TakeoutParser(PATH)
tp.dispatch_map()

origins = [
    "http://localhost:5173"
]

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=origins)


@app.get("/")
def read_root():
    return [{"Hello": "World"}]

@app.get("/youtube_comments")
def read_youtube_comments():
    comments = list(tp.parse(cache=False, filter_type=CSVYoutubeComment))
    comments_formatted = []
    id = 0
    for comment in comments:
        # TODO: here i am just ignoring mentions in comments. If needed they could be added back in the future
        #       the commnets that have mentions have two entries instead of one
        text = json.loads("["+comment.contentJSON+"]")[-1]["text"]
        print(text)
        comments_formatted.append(
            {
                "id": id,
                "videoId": comment.videoId,
                "channelId": comment.channelId,
                "commentId": comment.commentId,
                "text": text,
                "time": comment.dt,
            }
        )
        id += 1
    return comments_formatted


@app.get("/youtube_history")
def read_youtube_history():
    cached = list(tp.parse(cache=True, filter_type=Activity))
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