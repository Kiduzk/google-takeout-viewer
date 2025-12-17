import click
import subprocess
import time
import webbrowser
import os
import zipfile
import tempfile
import shutil
from pathlib import Path
from parsers import (
    parse_youtube_comments,
    parse_youtube_history,
    parse_keep,
    YoutubeCommentDatabase,
    YoutubeHistoryDatabase,
    KeepNotesDatabase,
    db,
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
        click.echo("Parsing YouTube history...")
        parse_youtube_history(parse_path)
        click.echo("Parsing Google Keep notes...")
        parse_keep(parse_path)

        click.echo("Parsing complete!")

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
    Will spin up a FastAPI backend server and a frontend dev server,
    then open the browser to view the data.
    """
    backend_process = None
    frontend_process = None

    try:
        # Get the project root and paths
        backend_dir = Path(__file__).parent
        frontend_dir = backend_dir.parent / "frontend"

        click.echo("Starting servers...")

        # Start FastAPI backend server
        click.echo("Starting FastAPI server on http://127.0.0.1:8000")
        backend_process = subprocess.Popen(
            ["python", "-m", "fastapi", "dev", "server.py"],
            cwd=str(backend_dir),
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
        )

        # Wait for backend to start
        time.sleep(1)

        # Start frontend dev server
        click.echo("Starting frontend server on http://localhost:5173")
        frontend_process = subprocess.Popen(
            "npm run dev",
            cwd=str(frontend_dir),
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            shell=True,
        )

        # Wait for frontend to start
        time.sleep(1)

        # Open browser
        click.echo("Opening browser...")
        webbrowser.open("http://localhost:5173")

        click.echo("\nServers running!")
        click.echo("  Backend:  http://127.0.0.1:8000")
        click.echo("  Frontend: http://localhost:5173")
        click.echo("\nPress Ctrl+C to stop servers")

        # Keep the processes running
        while True:
            time.sleep(1)
            if backend_process.poll() is not None:
                click.echo("\nBackend server stopped unexpectedly")
                break
            if frontend_process.poll() is not None:
                click.echo("\nFrontend server stopped unexpectedly")
                break

    except Exception as e:
        click.echo(f"Error: {e}", err=True)

    finally:
        # Cleanup: terminate both processes
        if backend_process and backend_process.poll() is None:
            click.echo("\nStopping backend server...")
            backend_process.terminate()
            try:
                backend_process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                backend_process.kill()

        if frontend_process and frontend_process.poll() is None:
            click.echo("Stopping frontend server...")
            frontend_process.terminate()
            try:
                frontend_process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                frontend_process.kill()

        click.echo("Servers stopped.")


if __name__ == "__main__":
    cli()
