import os
import requests
# from re import U
# from sqlite3 import Cursor

from flask import Flask, render_template, request, flash, redirect, session, g, jsonify
from flask_debugtoolbar import DebugToolbarExtension
from sqlalchemy.exc import IntegrityError, DataError

from forms import UserForm, LoginForm
from models import db, connect_db, User, Activity
from api import get_random_activity

CURR_USER_KEY = "curr_user"

app = Flask(__name__)

# Get DB_URI from environ variable (useful for production/testing) or,
# if not set there, use development local db.
app.config['SQLALCHEMY_DATABASE_URI'] = (
    os.environ.get('DATABASE_URL', 'postgresql:///bored'))

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ECHO'] = False
app.config['DEBUG_TB_INTERCEPT_REDIRECTS'] = False
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', "it's a secret")
toolbar = DebugToolbarExtension(app)

connect_db(app)

##############################################################################
# User signup/login/logout

@app.before_request
def add_user_to_g():
    """If logged in, add current user to Flask global."""

    if CURR_USER_KEY in session:
        g.user = User.query.get(session[CURR_USER_KEY])

    else:
        g.user = None

def login_action(user):
    """Log user in."""
    session[CURR_USER_KEY] = user.id

def logout_action(user):
    """Logs user out."""

    if CURR_USER_KEY in session:
        del session[CURR_USER_KEY]

@app.route('/signup', methods = ['GET', 'POST'])
def signup(): 
    """Handles user sign up. 
    Creates a new user, adds to DB, then redirects to the user home page."""

    form = UserForm()
    
    if form.validate_on_submit():
        try: 
            user = User.signup(
                username = form.username.data,
                password = form.password.data, 
                email = form.email.data,
            )
            db.session.commit()
        
        except IntegrityError:
            flash("Username or Email already taken")
            return render_template('signup.html', form = form)
        
        login_action(user)
        return redirect('/home')
    
    else:
        return render_template('signup.html', form = form)

@app.route('/login', methods = ['GET', 'POST'])
def login(): 
    """Handles logging user in."""

    form = LoginForm()

    if form.validate_on_submit():
        user = User.login(
                username = form.username.data,
                password = form.password.data)
        
        if user:
            login_action(user)
            return redirect('/home')
        
        else:
            flash("Username or Password not correct")
    
    
    return render_template('login.html', form = form)

@app.route('/logout')
def logout(): 
    """Handles logging user out."""
    if g.user:
        logout_action(g.user)
    
    return redirect('/login')



##############################################################################
# General Routes

@app.route('/')
def homepage():
    """Show homepage for non-logged in users"""

    return render_template('main_home.html')

@app.route('/home')
def home():
    """Show homepage for logged in users"""

    return render_template('user_home.html')

##############################################################################
# API routes:

@app.route('/random')
def random_activity():
    activity = get_random_activity()
    return activity