#!/usr/bin/env python3
"""
Sortify v4 — Enhanced Backend
Flask + SQLite: Auth, Progress, Session State, XP/Badges, Stats
"""

import sqlite3, hashlib, os, json, time
from flask import Flask, request, jsonify, g
from flask_cors import CORS
import secrets

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

DB_PATH = os.path.join(os.path.dirname(__file__), 'sortify.db')
SECRET  = "sortify-v4-secret-2025"

# ── XP / BADGE CONFIG ─────────────────────────────────────────
BADGES = {
    'first_sort':     {'name': 'First Step',      'icon': '🚀', 'desc': 'Ran your first algorithm'},
    'bubble_master':  {'name': 'Bubble Master',   'icon': '🫧', 'desc': 'Completed Bubble Sort 10 times'},
    'quick_pro':      {'name': 'Quick Pro',        'icon': '⚡', 'desc': 'Mastered Quick Sort'},
    'tree_climber':   {'name': 'Tree Climber',     'icon': '🌳', 'desc': 'Visualized your first tree'},
    'rb_expert':      {'name': 'RB Expert',        'icon': '🔴', 'desc': 'Completed Red-Black Tree'},
    'quiz_streak_3':  {'name': 'Quiz Streak',      'icon': '🔥', 'desc': 'Answered 3 questions correctly in a row'},
    'centurion':      {'name': 'Centurion',        'icon': '💯', 'desc': 'Answered 100 quiz questions'},
    'perfectionist':  {'name': 'Perfectionist',    'icon': '⭐', 'desc': 'Scored 100% on a quiz round'},
    'speed_demon':    {'name': 'Speed Demon',      'icon': '🏎️', 'desc': 'Ran 5 algorithms in Auto mode'},
    'comparison_king':{'name': 'Comparison King',  'icon': '👑', 'desc': 'Made 1000 total comparisons'},
}

LEVELS = [
    {'level': 1, 'title': 'Beginner',    'min_xp': 0},
    {'level': 2, 'title': 'Learner',     'min_xp': 100},
    {'level': 3, 'title': 'Practitioner','min_xp': 300},
    {'level': 4, 'title': 'Intermediate','min_xp': 600},
    {'level': 5, 'title': 'Advanced',    'min_xp': 1000},
    {'level': 6, 'title': 'Expert',      'min_xp': 1500},
    {'level': 7, 'title': 'Master',      'min_xp': 2200},
    {'level': 8, 'title': 'Grandmaster', 'min_xp': 3000},
]

def get_level(xp):
    lvl = LEVELS[0]
    for l in LEVELS:
        if xp >= l['min_xp']: lvl = l
    idx  = LEVELS.index(lvl)
    nxt  = LEVELS[idx+1] if idx+1 < len(LEVELS) else None
    return {
        'level': lvl['level'], 'title': lvl['title'],
        'xp': xp, 'current_min': lvl['min_xp'],
        'next_min': nxt['min_xp'] if nxt else lvl['min_xp'],
        'progress_pct': int(100*(xp-lvl['min_xp'])/(nxt['min_xp']-lvl['min_xp'])) if nxt and nxt['min_xp']>lvl['min_xp'] else 100
    }

# ── DB INIT ───────────────────────────────────────────────────
def get_db():
    if 'db' not in g:
        g.db = sqlite3.connect(DB_PATH)
        g.db.row_factory = sqlite3.Row
    return g.db

@app.teardown_appcontext
def close_db(e=None):
    db = g.pop('db', None)
    if db: db.close()

def init_db():
    db = sqlite3.connect(DB_PATH)
    db.executescript("""
        CREATE TABLE IF NOT EXISTS users (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            username        TEXT UNIQUE NOT NULL,
            display         TEXT NOT NULL,
            password        TEXT NOT NULL,
            avatar_color    TEXT DEFAULT '#e87722',
            xp              INTEGER DEFAULT 0,
            badges          TEXT DEFAULT '[]',
            created_at      INTEGER DEFAULT (strftime('%s','now'))
        );

        CREATE TABLE IF NOT EXISTS sessions (
            token      TEXT PRIMARY KEY,
            user_id    INTEGER NOT NULL,
            created_at INTEGER DEFAULT (strftime('%s','now')),
            FOREIGN KEY(user_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS progress (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id    INTEGER NOT NULL,
            section    TEXT NOT NULL,
            algo       TEXT NOT NULL,
            action     TEXT NOT NULL,
            score      INTEGER DEFAULT 0,
            total      INTEGER DEFAULT 0,
            round_num  INTEGER DEFAULT 1,
            comparisons INTEGER DEFAULT 0,
            swaps       INTEGER DEFAULT 0,
            xp_earned   INTEGER DEFAULT 0,
            details    TEXT DEFAULT '{}',
            created_at INTEGER DEFAULT (strftime('%s','now')),
            FOREIGN KEY(user_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS quiz_state (
            user_id    INTEGER NOT NULL,
            section    TEXT NOT NULL,
            algo       TEXT NOT NULL,
            round_num  INTEGER DEFAULT 1,
            used_ids   TEXT DEFAULT '[]',
            PRIMARY KEY(user_id, section, algo)
        );

        CREATE TABLE IF NOT EXISTS session_state (
            user_id        INTEGER PRIMARY KEY,
            page           TEXT DEFAULT 'single',
            algo           TEXT DEFAULT 'Bubble Sort',
            array_values   TEXT DEFAULT '[]',
            step_index     INTEGER DEFAULT 0,
            section        TEXT DEFAULT 'sorting',
            tree_type      TEXT DEFAULT 'Red-Black Tree',
            saved_at       INTEGER DEFAULT (strftime('%s','now')),
            FOREIGN KEY(user_id) REFERENCES users(id)
        );
    """)
    db.commit()
    db.close()

def hash_pw(pw): return hashlib.sha256((pw + SECRET).encode()).hexdigest()
def new_token(): return secrets.token_hex(32)

def get_user_from_token(token):
    if not token: return None
    db = get_db()
    row = db.execute(
        "SELECT u.* FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token=?",
        (token,)
    ).fetchone()
    return dict(row) if row else None

def auth_required(fn):
    from functools import wraps
    @wraps(fn)
    def wrapper(*args, **kwargs):
        token = request.headers.get('Authorization','').replace('Bearer ','').strip()
        user  = get_user_from_token(token)
        if not user: return jsonify({'error': 'Unauthorized'}), 401
        request.user = user
        return fn(*args, **kwargs)
    return wrapper

def award_xp_and_badges(user_id, action, payload):
    """Award XP and check for new badges based on action."""
    db = get_db()
    user = db.execute("SELECT * FROM users WHERE id=?", (user_id,)).fetchone()
    xp_gain = 0
    new_badges = []

    if action == 'visualize':     xp_gain = 10
    elif action == 'quiz_correct': xp_gain = 20
    elif action == 'quiz_round':   xp_gain = 15
    elif action == 'auto_run':     xp_gain = 5

    # Badge checks
    current_badges = json.loads(user['badges'] or '[]')
    total_progress = db.execute(
        "SELECT SUM(total) as qt, SUM(comparisons) as tc, COUNT(*) as acts FROM progress WHERE user_id=?",
        (user_id,)
    ).fetchone()

    viz_count = db.execute(
        "SELECT COUNT(*) as c FROM progress WHERE user_id=? AND action='visualize'", (user_id,)
    ).fetchone()['c']

    correct_total = db.execute(
        "SELECT SUM(score) as s FROM progress WHERE user_id=? AND action='quiz'", (user_id,)
    ).fetchone()['s'] or 0

    if 'first_sort' not in current_badges and viz_count >= 1:
        new_badges.append('first_sort')
    if 'tree_climber' not in current_badges:
        tree_viz = db.execute(
            "SELECT COUNT(*) as c FROM progress WHERE user_id=? AND section='trees' AND action='visualize'", (user_id,)
        ).fetchone()['c']
        if tree_viz >= 1: new_badges.append('tree_climber')
    if 'centurion' not in current_badges and (total_progress['qt'] or 0) >= 100:
        new_badges.append('centurion')
    if 'comparison_king' not in current_badges and (total_progress['tc'] or 0) >= 1000:
        new_badges.append('comparison_king')
    if payload.get('perfect_round') and 'perfectionist' not in current_badges:
        new_badges.append('perfectionist')

    all_badges = list(set(current_badges + new_badges))
    new_xp = (user['xp'] or 0) + xp_gain
    db.execute("UPDATE users SET xp=?, badges=? WHERE id=?",
               (new_xp, json.dumps(all_badges), user_id))
    db.commit()

    return xp_gain, new_badges, new_xp

# ── AUTH ENDPOINTS ────────────────────────────────────────────
@app.route('/api/register', methods=['POST'])
def register():
    data     = request.json or {}
    username = (data.get('username') or '').strip().lower()
    display  = (data.get('display')  or '').strip()
    password = (data.get('password') or '').strip()
    color    = data.get('avatar_color', '#e87722')
    if not username or not display or not password:
        return jsonify({'error': 'All fields are required'}), 400
    if len(password) < 4:
        return jsonify({'error': 'Password must be at least 4 characters'}), 400
    try:
        db = get_db()
        db.execute("INSERT INTO users(username,display,password,avatar_color) VALUES(?,?,?,?)",
                   (username, display, hash_pw(password), color))
        db.commit()
        user  = dict(db.execute("SELECT * FROM users WHERE username=?", (username,)).fetchone())
        token = new_token()
        db.execute("INSERT INTO sessions(token,user_id) VALUES(?,?)", (token, user['id']))
        db.commit()
        return jsonify({
            'token': token,
            'user': {'id': user['id'], 'username': username, 'display': display,
                     'avatar_color': color, 'xp': 0, 'badges': [], 'level': get_level(0)}
        })
    except sqlite3.IntegrityError:
        return jsonify({'error': 'Username already taken'}), 409

@app.route('/api/login', methods=['POST'])
def login():
    data     = request.json or {}
    username = (data.get('username') or '').strip().lower()
    password = (data.get('password') or '').strip()
    db = get_db()
    user = db.execute("SELECT * FROM users WHERE username=? AND password=?",
                      (username, hash_pw(password))).fetchone()
    if not user: return jsonify({'error': 'Invalid username or password'}), 401
    user = dict(user)
    token = new_token()
    db.execute("INSERT INTO sessions(token,user_id) VALUES(?,?)", (token, user['id']))
    db.commit()

    # Load last session state
    ss = db.execute("SELECT * FROM session_state WHERE user_id=?", (user['id'],)).fetchone()
    last_session = dict(ss) if ss else None
    if last_session and last_session.get('array_values'):
        last_session['array_values'] = json.loads(last_session['array_values'])

    badges = json.loads(user['badges'] or '[]')
    return jsonify({
        'token': token,
        'user': {
            'id': user['id'], 'username': user['username'],
            'display': user['display'], 'avatar_color': user['avatar_color'],
            'xp': user['xp'], 'badges': badges,
            'level': get_level(user['xp'])
        },
        'last_session': last_session
    })

@app.route('/api/logout', methods=['POST'])
@auth_required
def logout():
    token = request.headers.get('Authorization','').replace('Bearer ','').strip()
    get_db().execute("DELETE FROM sessions WHERE token=?", (token,))
    get_db().commit()
    return jsonify({'ok': True})

@app.route('/api/me', methods=['GET'])
@auth_required
def me():
    u = request.user
    badges = json.loads(u['badges'] or '[]')
    return jsonify({
        'id': u['id'], 'username': u['username'], 'display': u['display'],
        'avatar_color': u['avatar_color'], 'xp': u['xp'],
        'badges': badges, 'level': get_level(u['xp'])
    })

# ── SESSION STATE ─────────────────────────────────────────────
@app.route('/api/session/save', methods=['POST'])
@auth_required
def save_session():
    d = request.json or {}
    db = get_db()
    db.execute("""
        INSERT INTO session_state(user_id,page,algo,array_values,step_index,section,tree_type,saved_at)
        VALUES(?,?,?,?,?,?,?,strftime('%s','now'))
        ON CONFLICT(user_id) DO UPDATE SET
            page=excluded.page, algo=excluded.algo,
            array_values=excluded.array_values, step_index=excluded.step_index,
            section=excluded.section, tree_type=excluded.tree_type,
            saved_at=excluded.saved_at
    """, (request.user['id'], d.get('page','single'), d.get('algo','Bubble Sort'),
          json.dumps(d.get('array_values',[])), d.get('step_index',0),
          d.get('section','sorting'), d.get('tree_type','Red-Black Tree')))
    db.commit()
    return jsonify({'ok': True})

@app.route('/api/session/load', methods=['GET'])
@auth_required
def load_session():
    db  = get_db()
    row = db.execute("SELECT * FROM session_state WHERE user_id=?", (request.user['id'],)).fetchone()
    if not row: return jsonify(None)
    d = dict(row)
    d['array_values'] = json.loads(d.get('array_values') or '[]')
    return jsonify(d)

# ── PROGRESS & STATS ──────────────────────────────────────────
@app.route('/api/progress/log', methods=['POST'])
@auth_required
def log_progress():
    d  = request.json or {}
    db = get_db()
    db.execute("""
        INSERT INTO progress(user_id,section,algo,action,score,total,round_num,comparisons,swaps,xp_earned,details)
        VALUES(?,?,?,?,?,?,?,?,?,?,?)
    """, (request.user['id'], d.get('section','sorting'), d.get('algo',''),
          d.get('action',''), d.get('score',0), d.get('total',0),
          d.get('round',1), d.get('comparisons',0), d.get('swaps',0),
          0, json.dumps(d.get('details',{}))))
    db.commit()

    xp, new_bdg, total_xp = award_xp_and_badges(
        request.user['id'], d.get('action',''),
        {'perfect_round': d.get('score',0)==d.get('total',0) and d.get('total',0)>0}
    )
    return jsonify({'ok': True, 'xp_earned': xp, 'new_badges': new_bdg,
                    'total_xp': total_xp, 'level': get_level(total_xp)})

@app.route('/api/progress/summary', methods=['GET'])
@auth_required
def progress_summary():
    db  = get_db()
    uid = request.user['id']

    recent = db.execute("""
        SELECT section,algo,action,score,total,round_num,comparisons,swaps,created_at
        FROM progress WHERE user_id=? ORDER BY created_at DESC LIMIT 20
    """, (uid,)).fetchall()

    quiz_stats = db.execute("""
        SELECT section,algo,COUNT(*) as rounds,
               SUM(score) as correct,SUM(total) as attempted
        FROM progress WHERE user_id=? AND action='quiz'
        GROUP BY section,algo
    """, (uid,)).fetchall()

    viz_stats = db.execute("""
        SELECT section,algo,COUNT(*) as views,SUM(comparisons) as total_comps, SUM(swaps) as total_swaps
        FROM progress WHERE user_id=? AND action='visualize'
        GROUP BY section,algo
    """, (uid,)).fetchall()

    totals = db.execute("""
        SELECT SUM(comparisons) as tc, SUM(swaps) as ts,
               COUNT(DISTINCT algo) as algos_used,
               COUNT(*) as total_actions
        FROM progress WHERE user_id=?
    """, (uid,)).fetchone()

    # Weekly activity (last 7 days)
    weekly = db.execute("""
        SELECT date(created_at,'unixepoch') as day, COUNT(*) as actions, SUM(score) as correct
        FROM progress WHERE user_id=? AND created_at > strftime('%s','now','-7 days')
        GROUP BY day ORDER BY day
    """, (uid,)).fetchall()

    return jsonify({
        'recent':     [dict(r) for r in recent],
        'quiz_stats': [dict(r) for r in quiz_stats],
        'viz_stats':  [dict(r) for r in viz_stats],
        'totals':     dict(totals),
        'weekly':     [dict(r) for r in weekly],
        'badges_info': BADGES,
    })

# ── QUIZ STATE ────────────────────────────────────────────────
@app.route('/api/quiz/state', methods=['GET'])
@auth_required
def get_quiz_state():
    section = request.args.get('section','sorting')
    algo    = request.args.get('algo','')
    db  = get_db()
    row = db.execute(
        "SELECT * FROM quiz_state WHERE user_id=? AND section=? AND algo=?",
        (request.user['id'], section, algo)
    ).fetchone()
    if row: return jsonify({'round': row['round_num'], 'used_ids': json.loads(row['used_ids'])})
    return jsonify({'round': 1, 'used_ids': []})

@app.route('/api/quiz/advance', methods=['POST'])
@auth_required
def advance_quiz():
    d    = request.json or {}
    db   = get_db()
    used = d.get('used_ids', [])
    rnd  = d.get('round', 1)
    db.execute("""
        INSERT INTO quiz_state(user_id,section,algo,round_num,used_ids)
        VALUES(?,?,?,?,?)
        ON CONFLICT(user_id,section,algo) DO UPDATE SET round_num=?,used_ids=?
    """, (request.user['id'], d.get('section','sorting'), d.get('algo',''),
          rnd, json.dumps(used), rnd, json.dumps(used)))
    db.commit()
    return jsonify({'ok': True})

@app.route('/api/badges', methods=['GET'])
def get_badges():
    return jsonify(BADGES)

@app.route('/api/levels', methods=['GET'])
def get_levels():
    return jsonify(LEVELS)

if __name__ == '__main__':
    init_db()
    print("✅ Sortify v4 Backend → http://localhost:5000")
    app.run(debug=True, port=5000)
