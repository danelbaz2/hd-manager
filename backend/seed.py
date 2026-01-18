"""
Database seeding script.

Usage:
    python seed.py --init     # Initialize with users, tags, contacts (fresh start)
    python seed.py            # Seed tasks using existing users (default: 20 tasks)
    python seed.py --bulk     # Seed many tasks for testing (default: 100)
    python seed.py --massive  # Seed 20,000 tasks across 2 months before/after
    python seed.py --clean    # Clear tasks/tags/contacts, keep users
    python seed.py --help     # Show help
"""

import sys
import os
import base64
import random
from flask import Flask
from dotenv import load_dotenv
from database import mongo
from datetime import datetime, timedelta
from bson.objectid import ObjectId
import bcrypt

from utils.history import log_history
from scripts.seed_data import (
    get_users_data,
    get_init_primary_tags_data,
    get_init_secondary_tags_data,
    get_init_contacts_data,
    TaskGenerator,
    HistoryGenerator,
    get_chat_data,
)

# Initialize minimal app for seeding
load_dotenv()
app = Flask(__name__)
app.config["MONGO_URI"] = os.getenv("MONGO_URI", "mongodb://127.0.0.1:27017/hd_manager")
mongo.init_app(app)


# =============================================================================
# Helper Functions
# =============================================================================

def hash_password(password):
    """Hash a password using bcrypt."""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def get_timestamp_ms():
    """Get current timestamp in milliseconds."""
    return int(datetime.now().timestamp() * 1000)


def get_relative_date(diff_days):
    """Get timestamp for a date relative to today."""
    return int((datetime.now() + timedelta(days=diff_days)).timestamp() * 1000)


def create_base(entity_type, days_offset=-30):
    """Helper to create consistent base entity structure."""
    ts = get_relative_date(days_offset)
    return {
        "isDeleted": False,
        "isActive": True,
        "createdAt": ts,
        "updatedAt": ts,
        "entityType": entity_type,
        "createdBy": "System Admin",
        "updatedBy": "System Admin"
    }


def load_profile_image_as_file(username, user_id=None):
    """
    Copy a profile image to the uploads folder and return the relative path.
    
    Args:
        username: Username to find the source image
        user_id: User ID for the filename (if None, uses username)
        
    Returns:
        Relative path like "profiles/abc123.png" or None if no image
    """
    profiles_source_dir = os.path.join(os.path.dirname(__file__), 'static', 'profiles')
    source_path = os.path.join(profiles_source_dir, f'{username}.png')
    
    if not os.path.exists(source_path):
        return None
    
    # Get or create the uploads profiles folder
    upload_folder = os.environ.get('UPLOAD_FOLDER', '/app/uploads')
    # For local development, use a local uploads folder if /app/uploads doesn't exist
    if not os.path.exists(upload_folder):
        upload_folder = os.path.join(os.path.dirname(__file__), 'uploads')
    
    profiles_dest_dir = os.path.join(upload_folder, 'profiles')
    if not os.path.exists(profiles_dest_dir):
        os.makedirs(profiles_dest_dir)
    
    # Use user_id if provided, otherwise use username
    file_id = user_id or username
    dest_filename = f"{file_id}.png"
    dest_path = os.path.join(profiles_dest_dir, dest_filename)
    
    # Copy the file
    import shutil
    shutil.copy2(source_path, dest_path)
    
    return f"profiles/{dest_filename}"




# =============================================================================
# Database Operations
# =============================================================================

def clear_all():
    """Clear all data from all collections."""
    print("🗑️  Clearing all collections...")
    mongo.db.users.delete_many({})
    mongo.db.ents.delete_many({})
    mongo.db.ents_archive.delete_many({})
    mongo.db.contacts.delete_many({})
    print("   ✓ All collections cleared")


def clear_non_users():
    """Clear everything except users."""
    print("🗑️  Clearing non-user data...")
    mongo.db.ents.delete_many({})
    mongo.db.ents_archive.delete_many({})
    mongo.db.contacts.delete_many({})
    print("   ✓ Tasks, tags, contacts, and history cleared")


def get_existing_users():
    """Fetch existing users from the database."""
    users = list(mongo.db.users.find({"base.isDeleted": {"$ne": True}}))
    if not users:
        return None
    
    # Convert to the format expected by other functions
    for user in users:
        user['_id'] = str(user['_id']) if not isinstance(user['_id'], str) else user['_id']
    
    return users


# =============================================================================
# Seeding Functions
# =============================================================================

def seed_users():
    """Seed users into the database."""
    print("👥 Seeding Users...")
    print("   Saving profile images to disk...")
    
    # First create users without profile images to get their IDs
    users_data = get_users_data(lambda x: None, create_base)  # Pass None for profileImage initially
    
    user_ids = []
    for u in users_data:
        u['_id'] = str(ObjectId())
        u['passwordHash'] = hash_password(u['passwordHash'])
        
        # Now save the profile image with the user's ID
        username = u.get('username', '')
        profile_path = load_profile_image_as_file(username, u['_id'])
        if profile_path:
            u['profileImage'] = profile_path
        
        mongo.db.users.insert_one(u)
        uid = u['_id']
        user_ids.append(uid)
        log_history('user', uid, 'CREATE', 'system', None, u, u)
    
    print(f"   ✓ {len(users_data)} users created with file-based profile images")
    return users_data


def seed_primary_tags():
    """Seed primary tags into the database."""
    print("🏷️  Seeding Primary Tags...")
    
    primary_tags_data = get_init_primary_tags_data(create_base)
    
    primary_tag_ids = []
    for t in primary_tags_data:
        t['_id'] = str(ObjectId())
        mongo.db.ents.insert_one(t)
        tid = t['_id']
        primary_tag_ids.append(tid)
        log_history('primary_tag', tid, 'CREATE', 'system', None, t, t)
    
    print(f"   ✓ {len(primary_tags_data)} primary tags created")
    return primary_tag_ids


def seed_secondary_tags(primary_tag_ids):
    """Seed secondary tags into the database."""
    print("🔖 Seeding Secondary Tags...")
    
    secondary_tags_data = get_init_secondary_tags_data(primary_tag_ids, create_base)
    
    secondary_tag_ids = []
    for t in secondary_tags_data:
        t['_id'] = str(ObjectId())
        mongo.db.ents.insert_one(t)
        tid = t['_id']
        secondary_tag_ids.append(tid)
        log_history('secondary_tag', tid, 'CREATE', 'system', None, t, t)
    
    print(f"   ✓ {len(secondary_tags_data)} secondary tags created")
    return secondary_tag_ids


def seed_contacts(primary_tag_ids):
    """Seed contacts into the database."""
    print("📇 Seeding Contacts...")
    
    contacts_data = get_init_contacts_data(primary_tag_ids, create_base)
    
    contact_ids = []
    for c in contacts_data:
        c['_id'] = str(ObjectId())
        mongo.db.contacts.insert_one(c)
        cid = c['_id']
        contact_ids.append(cid)
        log_history('contact', cid, 'CREATE', 'system', None, c, c)
    
    print(f"   ✓ {len(contacts_data)} contacts created")
    return contact_ids


def seed_tasks(users_data, secondary_tag_ids, contact_ids, count=20, date_range_days=7, date_range_before=0):
    """
    Seed tasks with coherent history.
    
    Args:
        users_data: List of user dicts
        secondary_tag_ids: List of secondary tag IDs
        contact_ids: List of contact IDs
        count: Number of tasks to generate
        date_range_days: Days after today for task date spread
        date_range_before: Days before today for task date spread
    """
    print(f"📋 Seeding {count} Tasks...")
    if date_range_before > 0:
        print(f"   📅 Date range: {date_range_before} days before → {date_range_days} days after today")
    
    # Generate tasks
    generator = TaskGenerator(users_data, secondary_tag_ids, contact_ids)
    tasks = generator.generate_tasks(count=count, date_range_days=date_range_days, date_range_before=date_range_before)
    
    # Insert tasks and create initial history
    for task in tasks:
        mongo.db.ents.insert_one(task)
        creator_name = task['base']['createdBy']
        log_history('task', task['_id'], 'CREATE', creator_name, None, task, task, timestamp=task['base']['createdAt'])
    
    print(f"   ✓ {count} tasks created")
    
    # Generate coherent history for tasks
    print("📝 Generating task history...")
    history_gen = HistoryGenerator(users_data, mongo.db)
    
    total_history = 0
    for task in tasks:
        entries = history_gen.generate_history_for_task(task, min_entries=0, max_entries=5)
        total_history += entries
    
    print(f"   ✓ {total_history} history entries added")
    
    return tasks


def seed_chat(user_ids):
    """Seed chat messages."""
    print("💬 Seeding Chat Messages...")
    
    chat_data = get_chat_data(user_ids)
    
    for msg in chat_data:
        msg['_id'] = str(ObjectId())
        mongo.db.ents.insert_one(msg)
    
    print(f"   ✓ {len(chat_data)} chat messages created")
    return chat_data


# =============================================================================
# Main Seed Modes
# =============================================================================

def seed_init():
    """
    Initialize database with users, tags, and contacts.
    Use this for a fresh start. No tasks are created.
    """
    with app.app_context():
        clear_all()
        
        print("\n" + "="*50)
        print("🚀 INIT MODE: Creating foundation data")
        print("="*50 + "\n")
        
        # Create all foundation data
        users_data = seed_users()
        primary_tag_ids = seed_primary_tags()
        secondary_tag_ids = seed_secondary_tags(primary_tag_ids)
        contact_ids = seed_contacts(primary_tag_ids)
        
        # Summary
        print("\n" + "="*50)
        print("✅ Init completed successfully!")
        print("="*50)
        print(f"   • {len(users_data)} users")
        print(f"   • {len(primary_tag_ids)} primary tags")
        print(f"   • {len(secondary_tag_ids)} secondary tags")
        print(f"   • {len(contact_ids)} contacts")
        print("   • 0 tasks (use default mode to add tasks)")
        print()


def seed_default(task_count=20):
    """
    Seed tasks using existing users.
    Clears non-user data first, then creates tags, contacts, and tasks.
    """
    with app.app_context():
        # Check for existing users
        users_data = get_existing_users()
        
        if not users_data:
            print("\n❌ ERROR: No users found in database!")
            print("   Run 'python seed.py --init' first to create users.")
            print()
            sys.exit(1)
        
        clear_non_users()
        
        print("\n" + "="*50)
        print(f"🌱 DEFAULT MODE: Seeding {task_count} tasks")
        print("="*50 + "\n")
        
        print(f"📍 Using {len(users_data)} existing users from database")
        
        # Create tags and contacts
        primary_tag_ids = seed_primary_tags()
        secondary_tag_ids = seed_secondary_tags(primary_tag_ids)
        contact_ids = seed_contacts(primary_tag_ids)
        
        # Create tasks with history
        user_ids = [u['_id'] for u in users_data]
        tasks = seed_tasks(users_data, secondary_tag_ids, contact_ids, count=task_count)
        
        # Create chat messages
        chat_data = seed_chat(user_ids)
        
        # Summary
        print("\n" + "="*50)
        print("✅ Seeding completed successfully!")
        print("="*50)
        print(f"   • {len(users_data)} users (existing)")
        print(f"   • {len(primary_tag_ids)} primary tags")
        print(f"   • {len(secondary_tag_ids)} secondary tags")
        print(f"   • {len(contact_ids)} contacts")
        print(f"   • {len(tasks)} tasks with coherent history")
        print(f"   • {len(chat_data)} chat messages")
        print()


def seed_bulk(task_count=100):
    """Seed many tasks for performance testing."""
    print(f"\n🔥 BULK MODE: Generating {task_count} tasks for testing\n")
    seed_default(task_count=task_count)


def seed_massive(task_count=20000, months_before=2, months_after=2):
    """
    Seed massive amount of tasks across a wide date range.
    
    Args:
        task_count: Number of tasks to generate (default: 20,000)
        months_before: Months before today to include (default: 2)
        months_after: Months after today to include (default: 2)
    """
    # Calculate days (approximate: 30 days per month)
    date_range_before = months_before * 30  # ~60 days before
    date_range_days = months_after * 30     # ~60 days after
    
    with app.app_context():
        # Check for existing users
        users_data = get_existing_users()
        
        if not users_data:
            print("\n❌ ERROR: No users found in database!")
            print("   Run 'python seed.py --init' first to create users.")
            print()
            sys.exit(1)
        
        clear_non_users()
        
        print("\n" + "="*50)
        print(f"🚀 MASSIVE MODE: Seeding {task_count:,} tasks")
        print(f"   Date range: {date_range_before} days before → {date_range_days} days after")
        print("="*50 + "\n")
        
        print(f"📍 Using {len(users_data)} existing users from database")
        
        # Create tags and contacts
        primary_tag_ids = seed_primary_tags()
        secondary_tag_ids = seed_secondary_tags(primary_tag_ids)
        contact_ids = seed_contacts(primary_tag_ids)
        
        # Create tasks with history (but skip history generation for massive mode)
        user_ids = [u['_id'] for u in users_data]
        
        print(f"📋 Seeding {task_count:,} Tasks (this may take a while)...")
        
        # Generate tasks in batches for better performance
        generator = TaskGenerator(users_data, secondary_tag_ids, contact_ids)
        tasks = generator.generate_tasks(
            count=task_count, 
            date_range_days=date_range_days, 
            date_range_before=date_range_before
        )
        
        # Batch insert for better performance
        batch_size = 1000
        for i in range(0, len(tasks), batch_size):
            batch = tasks[i:i + batch_size]
            mongo.db.ents.insert_many(batch)
            print(f"   ✓ Inserted {min(i + batch_size, len(tasks)):,}/{task_count:,} tasks")
        
        print(f"   ✓ {task_count:,} tasks created")
        
        # Skip history for massive mode (too many records)
        print("   ℹ️  Skipping history generation for performance")
        
        # Create chat messages
        chat_data = seed_chat(user_ids)
        
        # Summary
        print("\n" + "="*50)
        print("✅ Massive seeding completed successfully!")
        print("="*50)
        print(f"   • {len(users_data)} users (existing)")
        print(f"   • {len(primary_tag_ids)} primary tags")
        print(f"   • {len(secondary_tag_ids)} secondary tags")
        print(f"   • {len(contact_ids)} contacts")
        print(f"   • {task_count:,} tasks (no history for performance)")
        print(f"   • {len(chat_data)} chat messages")
        print()


def seed_clean():
    """Clear all non-user data (keep users)."""
    with app.app_context():
        users = get_existing_users()
        user_count = len(users) if users else 0
        
        clear_non_users()
        
        print("\n" + "="*50)
        print("🧹 CLEAN MODE: Cleared non-user data")
        print("="*50)
        print(f"   • {user_count} users (kept)")
        print("   • All tasks, tags, contacts, history cleared")
        print()


def print_usage():
    """Print usage information."""
    print("""
HD Manager Database Seeding Tool
================================

Usage: python seed.py [option]

Options:
  --init     Initialize database with users, tags, and contacts.
             Use this FIRST on a fresh database. No tasks created.

  (default)  Seed 20 tasks using existing users.
             Clears old tasks/tags/contacts, keeps users.

  --bulk     Seed 100 tasks for performance testing.
             Same as default but with more tasks.

  --massive  Seed 20,000 tasks across 4 months (2 before, 2 after).
             Optimized for large data sets, skips history generation.

  --clean    Clear all except users.
             Removes tasks, tags, contacts, and history.

  --help     Show this help message.

Examples:
  python seed.py --init    # Fresh start: create users, tags, contacts
  python seed.py           # Add 20 tasks (requires --init first)
  python seed.py --bulk    # Add 100 tasks for testing
  python seed.py --massive # Add 20,000 tasks for stress testing
  python seed.py --clean   # Clear tasks, keep users

Notes:
  - Running without --init on a fresh database will fail.
  - Users are ONLY created with --init flag.
  - Task history is coherent: CREATE first, then updates by responsible users.
  - Massive mode skips history for performance reasons.
""")


# =============================================================================
# Entry Point
# =============================================================================

if __name__ == '__main__':
    if '--help' in sys.argv or '-h' in sys.argv:
        print_usage()
    elif '--init' in sys.argv:
        seed_init()
    elif '--clean' in sys.argv:
        seed_clean()
    elif '--bulk' in sys.argv:
        seed_bulk(task_count=100)
    elif '--massive' in sys.argv:
        seed_massive(task_count=20000, months_before=2, months_after=2)
    else:
        seed_default(task_count=20)
