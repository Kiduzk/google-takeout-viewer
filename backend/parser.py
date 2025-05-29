from bs4 import BeautifulSoup

def parse_youtube_watch_history_html():
    with open("search-history.html", encoding="utf-8") as file:
        html = file.read()

    soup = BeautifulSoup(html, "lxml")
    data = soup.find_all("div", class_="outer-cell")


    print(data[0].find("div", class_="content-cell"))
