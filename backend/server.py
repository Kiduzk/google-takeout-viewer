import json
from typing import Union
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from time import time
from parsers import YoutubeCommentDatabase, YoutubeHistoryDatabase, KeepNotesDatabase


origins = ["http://localhost:5173"]

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=origins)


def paginate(query, page: int = 1, per_page: int = 50):
    """Helper function to paginate Peewee query results"""
    total_count = query.count()
    offset = (page - 1) * per_page
    entries = query.offset(offset).limit(per_page)

    return {
        "entries": list(entries),
        "pagination": {
            "page": page,
            "per_page": per_page,
            "total": total_count,
            "pages": (total_count + per_page - 1) // per_page,
        },
    }


@app.get("/youtube_comments")
def read_youtube_comments(
    page: int = 1, per_page: int = 50, search: str = "", sort: str = "newest"
):
    """Get YouTube comments with pagination"""
    query = YoutubeCommentDatabase.select()

    if search:
        query = query.where(YoutubeCommentDatabase.text.contains(search))

    # Apply sorting
    if sort == "oldest":
        query = query.order_by(YoutubeCommentDatabase.time.asc())
    else:
        query = query.order_by(YoutubeCommentDatabase.time.desc())

    result = paginate(query, page, per_page)

    # Format the comments data
    comments_formatted = [
        {
            "id": comment.entryId,
            "videoId": comment.videoId,
            "channelId": comment.channelId,
            "commentId": comment.commentId,
            "text": comment.text,
            "time": comment.time,
        }
        for comment in result["entries"]
    ]

    return {
        "data": comments_formatted,
        "pagination": result["pagination"],
    }


@app.get("/youtube_history")
def read_youtube_history(
    page: int = 1, per_page: int = 50, search: str = "", sort: str = "newest"
):
    """Get YouTube watch history (videos watched, not searches)"""
    query = YoutubeHistoryDatabase.select().where(
        ~YoutubeHistoryDatabase.title.startswith("Searched")
    )

    if search:
        query = query.where(
            (YoutubeHistoryDatabase.title.contains(search))
            | (YoutubeHistoryDatabase.description.contains(search))
        )

    # Apply sorting
    if sort == "oldest":
        query = query.order_by(YoutubeHistoryDatabase.time.asc())
    else:
        query = query.order_by(YoutubeHistoryDatabase.time.desc())

    result = paginate(query, page, per_page)

    # Format the data
    youtube_history = [
        {
            "id": entry.entryId,
            "title": entry.title,
            "time": entry.time,
            "description": entry.description,
            "titleUrl": entry.titleUrl,
            "details": entry.details,
            "products": entry.products,
        }
        for entry in result["entries"]
    ]

    return {
        "data": youtube_history,
        "pagination": result["pagination"],
    }


@app.get("/youtube_search")
def read_youtube_search(
    page: int = 1, per_page: int = 50, search: str = "", sort: str = "newest"
):
    """Get YouTube search history (searches performed)"""
    query = YoutubeHistoryDatabase.select().where(
        YoutubeHistoryDatabase.title.startswith("Searched")
    )

    if search:
        query = query.where(
            (YoutubeHistoryDatabase.title.contains(search))
            | (YoutubeHistoryDatabase.description.contains(search))
        )

    # Apply sorting
    if sort == "oldest":
        query = query.order_by(YoutubeHistoryDatabase.time.asc())
    else:
        query = query.order_by(YoutubeHistoryDatabase.time.desc())

    result = paginate(query, page, per_page)

    # Format the data
    youtube_searches = [
        {
            "id": entry.entryId,
            "title": entry.title,
            "time": entry.time,
            "description": entry.description,
            "titleUrl": entry.titleUrl,
            "details": entry.details,
            "products": entry.products,
        }
        for entry in result["entries"]
    ]

    return {
        "data": youtube_searches,
        "pagination": result["pagination"],
    }


@app.get("/google_keep")
def read_keep(
    page: int = 1, per_page: int = 50, search: str = "", sort: str = "newest"
):
    """Get Google Keep notes with pagination"""
    query = KeepNotesDatabase.select()

    if search:
        query = query.where(
            (KeepNotesDatabase.title.contains(search))
            | (KeepNotesDatabase.textContent.contains(search))
        )

    # Apply sorting
    if sort == "oldest":
        query = query.order_by(KeepNotesDatabase.updatedTime.asc())
    else:
        query = query.order_by(KeepNotesDatabase.updatedTime.desc())

    result = paginate(query, page, per_page)

    # Format the data
    keep_notes = [
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
        for entry in result["entries"]
    ]

    return {
        "data": keep_notes,
        "pagination": result["pagination"],
    }


@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}
