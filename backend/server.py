import json
from typing import Union
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from time import time
from parsers import YoutubeCommentDatabase, YoutubeHistoryDatabase, KeepNotesDatabase


origins = ["http://localhost:5173"]

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=origins)


@app.get("/youtube_comments")
def read_youtube_comments():
    comments_formatted: list[dict] = []
    
    comments = YoutubeCommentDatabase.select()
    for comment in comments:
        comments_formatted.append(
            {
                "id": comment.entryId,
                "videoId": comment.videoId,
                "channelId": comment.channelId,
                "commentId": comment.commentId,
                "text": comment.text,
                "time": comment.time,
            }
        )
    return comments_formatted


@app.get("/youtube_history")
def read_youtube_history():
    youtube_history: list[dict] = []
    
    entries = YoutubeHistoryDatabase.select()
    for entry in entries:

        
        youtube_history.append(
            {
                "id": entry.entryId,
                "title": entry.title,
                "time": entry.time,
                "description": entry.description,
                "titleUrl": entry.titleUrl,
                "details": entry.details,
                "products": entry.products,
            }
        )

    return youtube_history


@app.get("/google_keep")
def read_keep():
    keep_notes = []
    
    results = KeepNotesDatabase.select()
    for entry in results:
        keep_notes.append(
            {
                "id": entry.entryId,
                "title": entry.title,
                "userEditedTimestampUsec": entry.updatedTime,
                "createdTimestampUsec": entry.createdTime,
                "listContent": entry.listContent,
                "textContent": entry.textContent,
                "textContentHtml": entry.textContentHtml,
                "color": entry.color,
                "annotations": entry.annotations,
                "isTrashed": entry.isTrashed,
                "isPinned": entry.isPinned,
                "isArchived": entry.isArchived,
            }
        )

    return keep_notes


@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}
