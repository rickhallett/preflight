"""
Well-Being Tracker — CLI, Streamlit and **interactive terminal UI**
=================================================================
Now includes a Rich/Typer command‑line, a Streamlit web dashboard **and a full Textual TUI** so that you can tab around, add entries and browse history without remembering commands.

Install
-------
```bash
pip install rich typer matplotlib streamlit textual
```
Run modes
---------
```bash
# interactive terminal UI (Textual)
python wellbeing_tracker.py tui

# traditional CLI
python wellbeing_tracker.py cli add
python wellbeing_tracker.py cli chart hrv --days 30

# web dashboard
streamlit run wellbeing_tracker.py
```
"""

from __future__ import annotations

import sqlite3
import sys
import datetime as _dt
from pathlib import Path
from dataclasses import dataclass, asdict, fields
from typing import Any, List, Sequence

# ---------------------------------------------------------------------------
# 3rd‑party deps (fail‑friendly imports)
# ---------------------------------------------------------------------------
try:
    from rich.console import Console
    from rich.table import Table
    import typer
except ImportError as e:  # pragma: no cover
    missing = e.name if hasattr(e, "name") else "rich/typer"
    raise SystemExit(
        f"Missing dependency: {missing}.  Install via 'pip install rich typer'."
    )

try:
    from textual.app import App, ComposeResult
    from textual.containers import Container, Horizontal
    from textual.widgets import (
        Header,
        Footer,
        Button,
        Static,
        DataTable,
        Input,
        Label,
        Slider,
    )
except ImportError:
    App = None  # fallback so module still loads for Streamlit/CLI

try:
    import matplotlib.pyplot as plt
except ImportError:
    raise SystemExit("Install matplotlib: pip install matplotlib")

DB_PATH = Path.home() / ".wellbeing_tracker.db"
DATE_FMT = "%Y-%m-%d"
console = Console()
app = typer.Typer(add_completion=False, pretty_exceptions_show_locals=False)

autoinit_done: bool = False


@dataclass(slots=True)
class Entry:
    date: str
    sleep_hours: float
    hrv: float
    typing_variability: float
    speech_rate: int
    mood: int
    output_quality: int
    spiritual_depth: int

    @classmethod
    def columns(cls) -> Sequence[str]:
        return [f.name for f in fields(cls)]


# ---------------------------------------------------------------------------
# DB helpers
# ---------------------------------------------------------------------------


def _connect() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def _init_db() -> None:
    global autoinit_done
    if autoinit_done:
        return
    with _connect() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS metrics (
                date TEXT PRIMARY KEY,
                sleep_hours REAL,
                hrv REAL,
                typing_variability REAL,
                speech_rate INTEGER,
                mood INTEGER,
                output_quality INTEGER,
                spiritual_depth INTEGER
            )
            """
        )
    autoinit_done = True


def add_entry(e: Entry) -> None:
    _init_db()
    with _connect() as conn:
        conn.execute(
            f"INSERT OR REPLACE INTO metrics ({', '.join(Entry.columns())}) VALUES (?,?,?,?,?,?,?,?)",
            tuple(asdict(e).values()),
        )


def fetch_entries(days: int | None = None) -> List[sqlite3.Row]:
    _init_db()
    q = "SELECT * FROM metrics ORDER BY date DESC"
    params: tuple[Any, ...] = ()
    if days is not None:
        start = (_dt.date.today() - _dt.timedelta(days=days)).strftime(DATE_FMT)
        q += " WHERE date >= ?"
        params = (start,)
    with _connect() as conn:
        return conn.execute(q, params).fetchall()


def fetch_series(metric: str, days: int | None = None) -> list[tuple[str, float]]:
    if metric not in Entry.columns()[1:]:
        raise ValueError(f"Unknown metric: {metric}")
    _init_db()
    q = f"SELECT date, {metric} FROM metrics ORDER BY date"
    params: tuple[Any, ...] = ()
    if days is not None:
        start = (_dt.date.today() - _dt.timedelta(days=days)).strftime(DATE_FMT)
        q = f"SELECT date, {metric} FROM metrics WHERE date >= ? ORDER BY date"
        params = (start,)
    with _connect() as conn:
        return conn.execute(q, params).fetchall()


# ---------------------------------------------------------------------------
# Rich CLI helpers
# ---------------------------------------------------------------------------


def _render_table(rows: Sequence[sqlite3.Row]) -> None:
    tbl = Table(show_header=True, header_style="bold magenta")
    for col in Entry.columns():
        tbl.add_column(col)
    for r in rows:
        tbl.add_row(*[str(r[col]) for col in Entry.columns()])
    console.print(tbl)


def _plot(metric: str, days: int | None = None) -> None:
    series = fetch_series(metric, days)
    if not series:
        console.print("No data to plot.")
        raise typer.Exit()
    dates, values = zip(*series)
    fig, ax = plt.subplots()
    ax.plot(dates, values, marker="o")
    ax.set_title(metric.replace("_", " ").title())
    ax.set_xlabel("Date")
    ax.set_ylabel(metric)
    ax.tick_params(axis="x", rotation=45)
    plt.tight_layout()
    plt.show()


# ---------------------------------------------------------------------------
# Typer CLI
# ---------------------------------------------------------------------------


@app.command()
def add(
    date: str = typer.Option(_dt.date.today().strftime(DATE_FMT), help="YYYY-MM-DD"),
    sleep_hours: float = typer.Option(..., prompt=True),
    hrv: float = typer.Option(..., prompt=True),
    typing_variability: float = typer.Option(..., prompt=True, help="Std-dev in ms"),
    speech_rate: int = typer.Option(..., prompt=True, help="Words per minute"),
    mood: int = typer.Option(..., prompt=True, help="1-10"),
    output_quality: int = typer.Option(..., prompt=True, help="1-10"),
    spiritual_depth: int = typer.Option(..., prompt=True, help="1-10"),
):
    """Add or replace an entry (prompts if unspecified)."""
    entry = Entry(
        date=date,
        sleep_hours=sleep_hours,
        hrv=hrv,
        typing_variability=typing_variability,
        speech_rate=speech_rate,
        mood=mood,
        output_quality=output_quality,
        spiritual_depth=spiritual_depth,
    )
    add_entry(entry)
    console.print(f"[green]Saved entry for {date}.[/green]")


@app.command()
def list(
    days: int | None = typer.Option(None, help="Limit to N recent days"),
):
    """Display entries in a table."""
    rows = fetch_entries(days)
    _render_table(rows)


@app.command()
def chart(
    metric: str = typer.Argument(..., help="Metric name"),
    days: int | None = typer.Option(None, help="Limit to N recent days"),
):
    """Plot a metric over time."""
    _plot(metric, days)


# ---------------------------------------------------------------------------
# Textual TUI
# ---------------------------------------------------------------------------

if App is not None:

    class AddEntryView(Container):
        """Form for a new daily entry."""

        DEFAULT_CSS = """AddEntryView { align: center middle; } Label {width:20} Input {width:20}"""

        def compose(self) -> ComposeResult:  # type: ignore
            yield Label("Add New Entry", id="title")
            self.date_in = Input(
                value=_dt.date.today().strftime(DATE_FMT), placeholder="YYYY-MM-DD"
            )
            self.sleep_in = Input(placeholder="Sleep hours")
            self.hrv_in = Input(placeholder="HRV")
            self.typing_in = Input(placeholder="Typing variability (ms)")
            self.speech_in = Input(placeholder="Speech rate (wpm)")
            self.mood_in = Slider(low=1, high=10, show_value=True, value=7, name="Mood")
            self.output_in = Slider(
                low=1, high=10, show_value=True, value=7, name="Output quality"
            )
            self.spiritual_in = Slider(
                low=1, high=10, show_value=True, value=5, name="Spiritual depth"
            )
            yield Label("Date"), self.date_in
            yield Label("Sleep"), self.sleep_in
            yield Label("HRV"), self.hrv_in
            yield Label("Typing sd"), self.typing_in
            yield Label("Speech"), self.speech_in
            yield self.mood_in
            yield self.output_in
            yield self.spiritual_in
            yield Horizontal(Button("Save", id="save"), Button("Cancel", id="cancel"))

        def on_button_pressed(self, event: Button.Pressed) -> None:  # type: ignore
            if event.button.id == "cancel":
                self.app.pop_screen()
                return
            try:
                entry = Entry(
                    date=self.date_in.value,
                    sleep_hours=float(self.sleep_in.value),
                    hrv=float(self.hrv_in.value),
                    typing_variability=float(self.typing_in.value),
                    speech_rate=int(self.speech_in.value),
                    mood=int(self.mood_in.value),  # type: ignore
                    output_quality=int(self.output_in.value),  # type: ignore
                    spiritual_depth=int(self.spiritual_in.value),  # type: ignore
                )
            except ValueError:
                self.app.bell()
                return
            add_entry(entry)
            self.app.pop_screen()
            self.app.query_one("#status", Static).update(f"✅ Saved {entry.date}")

    class TrackerApp(App):
        CSS_PATH = None
        BINDINGS = [
            ("a", "add", "Add Entry"),
            ("l", "list", "Show List"),
            ("q", "quit", "Quit"),
        ]

        def compose(self) -> ComposeResult:  # type: ignore
            yield Header()
            with Container():
                self.table = DataTable(zebra_stripes=True)
                yield self.table
                yield Static("", id="status")
            yield Footer()

        def on_mount(self) -> None:
            self.action_list()

        def action_add(self) -> None:
            self.push_screen(AddEntryView())

        def action_list(self) -> None:
            rows = fetch_entries(30)
            self.table.clear()
            self.table.add_columns(*Entry.columns())
            for r in rows:
                self.table.add_row(*[str(r[c]) for c in Entry.columns()])
            self.query_one("#status", Static).update(
                f"Showing last {len(rows)} entries"
            )

    def run_tui() -> None:
        TrackerApp().run()

else:

    def run_tui() -> None:  # pragma: no cover
        console.print("Install 'textual' to use the terminal UI: pip install textual")
        raise typer.Exit()


# Typer shim to launch TUI
@app.command()
def tui():
    """Launch interactive Textual TUI."""
    run_tui()


# ---------------------------------------------------------------------------
# Streamlit dashboard
# ---------------------------------------------------------------------------


def _run_streamlit() -> None:  # pragma: no cover
    import streamlit as st

    st.set_page_config(page_title="Well-Being Tracker", layout="centered")
    st.title("Well-Being Tracker 📈")

    tabs = st.tabs(["Add Entry", "Dashboard"])

    with tabs[0]:
        st.subheader("New daily metrics")
        today = _dt.date.today()
        with st.form("entry_form", clear_on_submit=False):
            date = st.date_input("Date", today)
            sleep_hours = st.number_input("Sleep hours", 0.0, 24.0, 7.0, 0.25)
            hrv = st.number_input("HRV (RMSSD)", 0.0, None, 50.0)
            typing_variability = st.number_input(
                "Typing variability (ms)", 0.0, None, 120.0
            )
            speech_rate = st.number_input("Speech rate (wpm)", 0, None, 130)
            mood = st.slider("Mood (1-10)", 1, 10, 7)
            output_quality = st.slider("Output quality (1-10)", 1, 10, 7)
            spiritual_depth = st.slider("Spiritual depth (1-10)", 1, 10, 5)
            submitted = st.form_submit_button("Save")
            if submitted:
                entry = Entry(
                    date=date.strftime(DATE_FMT),
                    sleep_hours=sleep_hours,
                    hrv=hrv,
                    typing_variability=typing_variability,
                    speech_rate=speech_rate,
                    mood=mood,
                    output_quality=output_quality,
                    spiritual_depth=spiritual_depth,
                )
                add_entry(entry)
                st.success(f"Saved entry for {entry.date}")

    with tabs[1]:
        metric = st.selectbox("Select metric", Entry.columns()[1:])
        days = st.number_input("Days to display", 1, 3650, 30)
        if st.button("Show chart"):
            data = fetch_series(metric, int(days))
            if not data:
                st.warning("No data to plot.")
            else:
                dates, values = zip(*data)
                fig, ax = plt.subplots()
                ax.plot(dates, values, marker="o")
                ax.set_title(metric.replace("_", " ").title())
                ax.set_xlabel("Date")
                ax.set_ylabel(metric)
                ax.tick_params(axis="x", rotation=45)
                st.pyplot(fig)
        st.subheader("Recent entries")
        rows = fetch_entries(30)
        if rows:
            st.dataframe([{col: row[col] for col in Entry.columns()} for row in rows])
        else:
            st.info("No entries yet.")


# ---------------------------------------------------------------------------
# Entrypoint router
# ---------------------------------------------------------------------------


def _is_streamlit_run() -> bool:
    return (
        any("streamlit" in arg for arg in sys.argv[0:1]) or "streamlit" in sys.modules
    )


if _is_streamlit_run():
    _run_streamlit()
else:
    if len(sys.argv) >= 2 and sys.argv[1] == "cli":
        sys.argv.pop(1)
    app()
