import click
from parsers import parse_youtube_comments, parse_youtube_history, parse_keep


@click.group()
def cli():
    """
    Generic group for the cli
    """
    pass


@cli.command("parse")
@click.argument("path", type=click.Path(exists=True))
def parse(path):
    """
    Processes a google takeout and caches the values into an sqlite database
    Supports two options:
        1) The takeout as a zip
        2) The extracted takeout. In this case, we just parse through the current directory
        for any files that could potentially be from a takeout
    """
    parse_youtube_comments(path)
    parse_youtube_history(path)
    parse_keep(path)


@cli.command("clear-cache")
def clear_cache():
    print("Clearing cache...")


@cli.command("view")
def view_takeout():
    """
    View the parsed takeout files in the browser.
    Will spin up a backend which will serve the contents of the sqlite database.
    """

    print("viewing the takeout file")


if __name__ == "__main__":
    cli()
