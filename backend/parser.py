from bs4 import BeautifulSoup
import re 
import sqlite3
import logging
import msgspec
from datetime import datetime, timezone

logging.basicConfig(
    level=logging.INFO,  # or DEBUG, WARNING, ERROR, CRITICAL
    format='%(asctime)s - %(levelname)s - %(message)s'
)

class Parser:
    def __init__(self, database):
        self.database = database
        self.conn = sqlite3.connect(database)
        self.cursor = self.conn.cursor()
    
    def parse_youtube_watch_history_json(self, file_name):
        logging.info("Parsing youtube watch history (json version)...")

        self.cursor.execute('''
        CREATE TABLE IF NOT EXISTS youtube_watch_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            link TEXT,
            date TEXT, 
            UNIQUE(title, link, date)
        )''')


        with open(file_name, encoding="utf-8") as file:
            data = file.read()

        decoded_data = msgspec.json.decode(data)
        watchced_videos = []

        for entry in decoded_data:
            title = entry["title"]
            try:
                link = entry["titleUrl"]
            except KeyError:
                continue

            iso_time  = entry["time"]
            ts = iso_time.replace("Z", "+00:00")
            dt = datetime.fromisoformat(ts)
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            tz_raw = dt.strftime("%z")
            tz_formatted = tz_raw[:3] + ":" + tz_raw[3:]
            date = dt.strftime(f"%d %b %Y, %H:%M:%S GMT{tz_formatted}")

            watchced_videos.append((title, link, date))
        
        self.conn.executemany('''
        INSERT OR REPLACE INTO youtube_watch_history (title, link, date)
        VALUES (?, ?, ?)
        ''', watchced_videos)

        self.conn.commit()
        logging.info("Done")

    def parse_youtube_search_history_json(self, file_name):
        logging.info("Parsing youtube search history (json version)...")

        self.cursor.execute('''
        CREATE TABLE IF NOT EXISTS youtube_search_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            link TEXT,
            date TEXT, 
            UNIQUE(title, link, date)
        )''')

        with open(file_name, encoding="utf-8") as file:
            data = file.read()

        decoded_data = msgspec.json.decode(data)
        search_history = []

        for entry in decoded_data:
            title = entry["title"]
            link = entry["titleUrl"]
            iso_time  = entry["time"]

            # TODO: for now, we ignore add views. But it might be cool to also see some stats on 
            #        ads watched
            if "details" in entry and entry["details"][0]["name"] == "From Google Ads":
                continue

            ts = iso_time.replace("Z", "+00:00")
            dt = datetime.fromisoformat(ts)
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            tz_raw = dt.strftime("%z")
            tz_formatted = tz_raw[:3] + ":" + tz_raw[3:]
            date = dt.strftime(f"%d %b %Y, %H:%M:%S GMT{tz_formatted}")

            search_history.append((title, link, date))
        
        self.conn.executemany('''
        INSERT OR REPLACE INTO youtube_search_history (title, link, date)
        VALUES (?, ?, ?)
        ''', search_history)

        self.conn.commit()
        logging.info("Done")




        pass
    
    def parse_youtube_watch_history_html(self, file_name):
        logging.info("Parsing youtube watch history (html version)...")

        self.cursor.execute('''
        CREATE TABLE IF NOT EXISTS youtube_watch_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            link TEXT,
            date TEXT,
            UNIQUE(title, link, date)
        )''')

        with open(file_name, encoding="utf-8") as file:
            html = file.read()

        soup = BeautifulSoup(html, "lxml")
        data = soup.find_all("div", class_="outer-cell")

        search_history = []

        for entry in data[::-1]:

            entry_text = entry.text
            entry_a_tag = entry.find("a")
            title = entry_a_tag.text
            link = entry_a_tag["href"]

            br_tag = entry.find_all("br")[-2]
            date = br_tag.next

            pattern = r'(\d{1,2})\s([A-Za-z]{3,9})\s(\d{4}),\s(\d{2}):(\d{2}):(\d{2})\sGMT([+-]\d{2}):(\d{2})'
            match = re.search(pattern, entry_text)
            if not match:
                print("Unable to extract the date information from youtube watch history html version")
                continue
            
            date = match.group(0)

            search_history.append((
                title, 
                link, 
                date
            ))
        
        self.conn.executemany('''
        INSERT OR REPLACE INTO youtube_watch_history (title, link, date)
        VALUES (?, ?, ?)
        ''', search_history)

        self.conn.commit()
        logging.info("Done")
 


    def parse_youtube_search_history_html(self, file_name):
        '''
        Parses the youtube search history file (html version) and saves it to an sqlite databse
        '''
        logging.info("Parsing youtube search history (html version)...")

        self.cursor.execute('''
        CREATE TABLE IF NOT EXISTS youtube_search_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            link TEXT,
            date TEXT,
            UNIQUE(title, link, date)
        )''')


        with open(file_name, encoding="utf-8") as file:
            html = file.read()

        soup = BeautifulSoup(html, "lxml")
        data = soup.find_all("div", class_="outer-cell")

        search_history = []

        for entry in data[::-1]:

            entry_text = entry.text

            # For some reason, the html file for the search history consists of ADs. 
            # The ADS have "watched" instead of "searched"
            if "Searched" not in entry_text:
                continue

            entry_a_tag = entry.find("a")
            title = entry_a_tag.text
            link = entry_a_tag["href"]

            br_tag = entry.find_all("br")[-2]
            date = br_tag.next

            pattern = r'(\d{1,2})\s([A-Za-z]{3,9})\s(\d{4}),\s(\d{2}):(\d{2}):(\d{2})\sGMT([+-]\d{2}):(\d{2})'
            match = re.search(pattern, entry_text)
            if not match:
                print("Unable to extract the date information from youtube watch history html version")
                continue
            
            date = match.group(0)

            search_history.append((
                title, 
                link, 
                date
            ))
        
        self.conn.executemany('''
        INSERT OR REPLACE INTO youtube_search_history (title, link, date)
        VALUES (?, ?, ?)
        ''', search_history)

        self.conn.commit()
        logging.info("Done")
    
    def close(self):
        self.conn.close()



if __name__ == "__main__":
   logging.info("Started app")
   parser = Parser("testing.db")
#    parser.parse_youtube_watch_history_json("watch-history.json")
   parser.parse_youtube_search_history_json("search-history.json")
#    parser.parse_youtube_search_history_html("search-history.html") 
#    parser.parse_youtube_watch_history_html("watch-history.html") 

   parser.close()