from bs4 import BeautifulSoup
import re 
import sqlite3

conn = sqlite3.connect("testing.db")
cursor = conn.cursor()

cursor.execute('''
CREATE TABLE IF NOT EXISTS youtube_search_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    search_text TEXT,
    search_link TEXT,
    search_date TEXT 
)''')


def parse_youtube_search_history():
    '''
    Parses the youtube search history file and saves it to an sqlite databse
    '''
    with open("search-history.html", encoding="utf-8") as file:
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
        search_title = entry_a_tag.text
        search_link = entry_a_tag["href"]

        br_tag = entry.find_all("br")[-2]
        search_date = br_tag.next

        pattern = r'(\d{1,2})\s([A-Za-z]{3,9})\s(\d{4}),\s(\d{2}):(\d{2}):(\d{2})\sGMT([+-]\d{2}):(\d{2})'
        match = re.search(pattern, entry_text)
        if not match:
            print("Unable to extract the date information from youtube watch history html version")
            continue
        
        search_date = match.group(0)

        search_history.append((
            search_title, 
            search_link, 
            search_date
        ))
    
    cursor.executemany('''
    INSERT OR REPLACE INTO youtube_search_history (search_text, search_link, search_date)
    VALUES (?, ?, ?)
    ''', search_history)

    conn.commit()
    conn.close()



if __name__ == "__main__":
   parse_youtube_search_history() 