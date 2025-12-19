import click
import subprocess
import time
import webbrowser
import os
import zipfile
import tempfile
import shutil
from pathlib import Path
from google_takeout_viewer.parsers import (
    parse_youtube_comments,
    parse_youtube_history,
    parse_keep,
    YoutubeCommentDatabase,
    YoutubeHistoryDatabase,
    KeepNotesDatabase,
)


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
        1) The takeout as a zip file
        2) The extracted takeout folder
    """
    path_obj = Path(path)
    temp_dir = None
    parse_path = path

    try:
        # Check if path is a ZIP file
        if path_obj.is_file() and zipfile.is_zipfile(path):
            click.echo(f"Extracting ZIP file: {path}")
            temp_dir = tempfile.mkdtemp()
            with zipfile.ZipFile(path, "r") as zip_ref:
                zip_ref.extractall(temp_dir)
            parse_path = os.path.join(temp_dir, "Takeout")
            click.echo(f"Extracted to: {temp_dir}")
        elif path_obj.is_dir():
            click.echo(f"Parsing directory: {path}")
        else:
            click.echo(f"Error: Path must be a directory or ZIP file", err=True)
            return

        # Parse the data
        click.echo("Parsing YouTube comments...")
        parse_youtube_comments(parse_path)
        comments_count = YoutubeCommentDatabase.select().count()
        
        click.echo("Parsing YouTube history...")
        parse_youtube_history(parse_path)
        history_count = YoutubeHistoryDatabase.select().count()
        
        click.echo("Parsing Google Keep notes...")
        parse_keep(parse_path)
        keep_count = KeepNotesDatabase.select().count()

        click.echo("\nParsing complete!")
        click.echo(f"  YouTube Comments: {comments_count}")
        click.echo(f"  YouTube History: {history_count}")
        click.echo(f"  Google Keep Notes: {keep_count}")

    finally:
        # Clean up temporary directory
        if temp_dir and Path(temp_dir).exists():
            click.echo(f"Cleaning up temporary files...")
            shutil.rmtree(temp_dir)


@cli.command("clear")
def clear():
    """
    Clears the parsed takeout database.
    """
    # Define all database models here for easy extension
    DATABASE_MODELS = [
        YoutubeCommentDatabase,
        YoutubeHistoryDatabase,
        KeepNotesDatabase,
    ]

    try:
        click.echo("Clearing databses...")

        # Delete all records from each table
        for model in DATABASE_MODELS:
            count = model.delete().execute()
            click.echo(f"  Cleared {model.__name__}: {count} records deleted")

        click.echo("Database cleared successfully!")
    except Exception as e:
        click.echo(f"Error clearing cache: {e}", err=True)


@cli.command("view")
def view_takeout():
    """
    View the parsed takeout files in the browser.
    Will start a FastAPI backend server and open the browser.
    """
    backend_process = None

    try:
        # Get the project root (parent of src)
        backend_dir = Path(__file__).parent
        src_dir = backend_dir.parent

        click.echo("Starting server...")

        # Start FastAPI backend server with uvicorn
        click.echo("Starting server on http://127.0.0.1:8000")
        backend_process = subprocess.Popen(
            ["python", "-m", "uvicorn", "google_takeout_viewer.server:app", "--host", "127.0.0.1", "--port", "8000"],
            cwd=str(src_dir),
        )

        # Wait for backend to start
        time.sleep(3)

        # Open browser
        click.echo("Opening browser...")
        webbrowser.open("http://127.0.0.1:8000")

        click.echo("\nServer running on http://127.0.0.1:8000")
        click.echo("Press Ctrl+C to stop server")

        # Keep the process running
        while True:
            time.sleep(1)
            if backend_process.poll() is not None:
                click.echo("\nServer stopped")
                break

    except KeyboardInterrupt:
        click.echo("\n\nShutting down...")
    except Exception as e:
        click.echo(f"Error: {e}", err=True)

    finally:
        # Cleanup: terminate process
        if backend_process and backend_process.poll() is None:
            click.echo("Stopping server...")
            backend_process.terminate()
            try:
                backend_process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                backend_process.kill()

        click.echo("Server stopped.")


if __name__ == "__main__":
    cli()
