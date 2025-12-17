import json
from fastapi.middleware.cors import CORSMiddleware
from google_takeout_parser.path_dispatch import TakeoutParser
from google_takeout_parser.models import Activity, CSVYoutubeComment, Keep
from peewee import *

db = SqliteDatabase("parsed_takeout_data.db")
SQL_UPDATE_BATCH_SIZE = 900


class YoutubeCommentDatabase(Model):
    entryId = CharField()
    videoId = CharField()
    channelId = CharField()
    commentId = CharField()
    text = CharField()

    time = DateTimeField()

    class Meta:
        database = db


class YoutubeHistoryDatabase(Model):
    entryId = IntegerField()
    title = CharField()
    description = CharField(null=True)
    titleUrl = CharField(null=True)
    details = CharField(null=True)
    products = CharField(null=True)

    time = DateTimeField()

    class Meta:
        database = db


class KeepNotesDatabase(Model):
    entryId = IntegerField()
    title = CharField()
    updatedTime = DateTimeField()
    createdTime = DateTimeField()
    listContent = CharField(null=True)
    textContent = CharField(null=True)
    textContentHtml = CharField(null=True)
    color = CharField()
    annotations = CharField()
    isTrashed = BooleanField()
    isPinned = BooleanField()
    isArchived = BooleanField()

    class Meta:
        database = db


db.create_tables([YoutubeCommentDatabase, YoutubeHistoryDatabase, KeepNotesDatabase])


def parse_youtube_comments(path):
    """
    Parses through the youtube comments and adds them to an sqlite db

    :param path: the path of the takeout
    """

    tp = TakeoutParser(path)
    tp.dispatch_map()

    comments = tp.parse(cache=True, filter_type=CSVYoutubeComment)

    comments_data = []
    id = 0
    for i, comment in enumerate(comments):  # type: ignore
        # NOTE: I am just ignoring mentions in comments. If needed they could be added back in the future
        #       the commnets that have mentions have two entries instead of one

        comment: CSVYoutubeComment
        text = json.loads("[" + comment.contentJSON + "]")[-1]["text"]
        comments_data.append(
            {
                "entryId": id,
                "videoId": comment.videoId,
                "channelId": comment.channelId,
                "commentId": comment.commentId,
                "text": text,
                "time": comment.dt,
            }
        )
        id += 1

        # We chunk the updates since sqlite has limit for batch updates
        if i % SQL_UPDATE_BATCH_SIZE == 0:
            YoutubeCommentDatabase.insert_many(comments_data).execute()
            comments_data = []

    YoutubeCommentDatabase.insert_many(comments_data).execute()


def parse_youtube_history(path):
    """
    Parses through the youtube history, adds them to sqlite db and and returns a parsed list of dictionaries

    :param path: the path of the takeout
    """

    tp = TakeoutParser(path)
    tp.dispatch_map()

    cached = tp.parse(cache=True, filter_type=Activity)
    history_data = []
    id = 0

    for i, entry in enumerate(cached):  # type: ignore
        entry: Activity


        # Skip adds, can be dded later if needed
        if "From Google Ads" in entry.details:
            continue

        history_data.append(
            {
                "entryId": id,
                "title": entry.title,
                "description": entry.description,
                "titleUrl": entry.titleUrl,
                "details": entry.details,
                "products": entry.products,
                "time": entry.time,
            }
        )
        id += 1

        if i % SQL_UPDATE_BATCH_SIZE == 0:
            YoutubeHistoryDatabase.insert_many(history_data).execute()
            history_data = []

    YoutubeHistoryDatabase.insert_many(history_data).execute()


def parse_keep(path):
    """
    Parses through the keep notes and returns a parsed list of dictionaries

    :param path: the path of the takeout
    """

    tp = TakeoutParser(path)
    tp.dispatch_map()

    # NOTE: if i try to get caching i get an error regaruding subscripted genrics.
    #        Might be worth looking in the future if reading keep files gets slower
    results = tp.parse(cache=False, filter_type=Keep)
    keep_data = []
    id = 0
    for i, entry in enumerate(results):  # type: ignore
        entry: Keep

        # Convert listContent to JSON serializable format
        list_content_json = None
        if entry.listContent:
            try:
                list_content_json = json.dumps([
                    {
                        "text": item.text,
                        "textHtml": item.textHtml,
                        "checked": item.isChecked
                    }
                    for item in entry.listContent
                ])
            except Exception as e:
                print(f"Error serializing listContent: {e}")
                list_content_json = None

        keep_data.append(
            {
                "entryId": id,
                "title": entry.title,
                "updatedTime": entry.updated_dt,
                "createdTime": entry.created_dt,
                "listContent": list_content_json,
                "textContent": entry.textContent,
                "textContentHtml": entry.textContentHtml,
                "color": entry.color,
                "annotations": entry.annotations,
                "isTrashed": entry.isTrashed,
                "isPinned": entry.isPinned,
                "isArchived": entry.isArchived,
            }
        )
        id += 1

        if i % SQL_UPDATE_BATCH_SIZE == 0:
            KeepNotesDatabase.insert_many(keep_data).execute()
            keep_data = []

    KeepNotesDatabase.insert_many(keep_data).execute()
