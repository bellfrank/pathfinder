import os
from pickle import TRUE

from cs50 import SQL
import sqlite3
from flask import Flask, flash, redirect, render_template, request, session, url_for, jsonify
from flask_session import Session
from tempfile import mkdtemp
from werkzeug.security import check_password_hash, generate_password_hash

from helpers import apology, login_required

# maze.py
from maze import Node, QueueFrontier, StackFrontier, Maze

# Configure application
app = Flask(__name__)

# Ensure templates are auto-reloaded
app.config["TEMPLATES_AUTO_RELOAD"] = True

# Configure session to use filesystem (instead of signed cookies)
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

# Configure CS50 Library to use SQLite database
db = sqlite3.connect("finance.db")

# Make sure API key is set
if not os.environ.get("API_KEY"):
    raise RuntimeError("API_KEY not set")


@app.after_request
def after_request(response):
    """Ensure responses aren't cached"""
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Expires"] = 0
    response.headers["Pragma"] = "no-cache"
    return response


@app.route("/")
def index():
    """Show portfolio of stocks"""
    return render_template('index.html')


@app.route("/search", methods=["POST"])
def search():
    
    walls = request.json
    m = Maze(walls)
    m.solve()
  
    print("States Explored:", m.num_explored)
    print("Solution:")
    m.print()
    m.output_image("maze.png", show_explored=True)

    # Solution
    solution = m.solution[1] if m.solution is not None else None
    return jsonify({"order": m.order, "solution": solution[:-1]})


@app.route("/sell", methods=["GET", "POST"])
def sell():
    """Sell shares of stock"""
    return apology("TODO")


if __name__ == "__main__":
    app.run(debug=True)
