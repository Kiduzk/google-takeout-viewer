import types

import pytest

from google_takeout_viewer.parsers import parse_youtube_history
from google_takeout_parser.path_dispatch import TakeoutParser

class FakeEntry:
    def __init__(self, title="t", description=None, titleUrl=None, details=None, products=None, time=None):
        self.title = title
        self.description = description
        self.titleUrl = titleUrl
        self.details = details
        self.products = products
        self.time = time


def test_parse_youtube_history_skips_exception_like_entries(monkeypatch, tmp_path):
    # Make TakeoutParser.parse return an exception-like object then a valid entry
    fake_exception = KeyError("missing")
    valid_entry = FakeEntry(title="ok", details="Some details", time=None)

    def fake_parse(self, cache=True, filter_type=None):
        return [fake_exception, valid_entry]

    monkeypatch.setattr(TakeoutParser, "parse", fake_parse)

    # Should not raise
    parse_youtube_history(str(tmp_path))
