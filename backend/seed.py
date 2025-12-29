import sys
import os
from flask import Flask
from dotenv import load_dotenv
from database import mongo
from datetime import datetime, timedelta
from utils.history import log_history

# Initialize minimal app for seeding to avoid eventlet/socketio overhead
load_dotenv()
app = Flask(__name__)
app.config["MONGO_URI"] = os.getenv("MONGO_URI", "mongodb://127.0.0.1:27017/hd_manager")
mongo.init_app(app)
import base64
from bson.objectid import ObjectId
import bcrypt
import random

def hash_password(password):
    """Hash a password using bcrypt"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def get_relative_date(diff_days):
    return int((datetime.now() + timedelta(days=diff_days)).timestamp() * 1000)

def get_timestamp_ms():
    return int(datetime.now().timestamp() * 1000)

def create_base(entity_type, days_offset=-30):
    """Helper to create consistent base entity structure"""
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

def load_profile_image_base64(username):
    """Load a profile image and convert to base64 data URI"""
    # Path to profile images
    profiles_dir = os.path.join(os.path.dirname(__file__), 'static', 'profiles')
    image_path = os.path.join(profiles_dir, f'{username}.png')
    
    if os.path.exists(image_path):
        with open(image_path, 'rb') as img_file:
            image_data = img_file.read()
            base64_data = base64.b64encode(image_data).decode('utf-8')
            return f'data:image/png;base64,{base64_data}'
    return None

def clear_database():
    """Clear all data from all collections"""
    print("Clearing database...")
    mongo.db.users.delete_many({})
    mongo.db.ents.delete_many({})
    mongo.db.ents_archive.delete_many({})
    mongo.db.contacts.delete_many({})
    print("Database cleared successfully!")

def seed(clean_only=False, bulk_tasks=False):
    with app.app_context():
        # Always clear existing data first
        clear_database()
        
        # 1. Users - ALWAYS seed users (even in clean mode)
        print("Seeding Users...")
        print("  Loading profile images as base64...")
        
        users_data = [
            { "fullName": 'עדן טירם', "username": "eden", "passwordHash": "123456", "role": 'admin', "color": '#93C5FD', "profileImage": load_profile_image_base64("eden"), "nickname": "ראש צוות HD", "base": create_base("user")},
            { "fullName": 'מאור נובחוב', "username": "maor", "passwordHash": "123456", "role": 'regular', "color": '#FDBA74', "profileImage": load_profile_image_base64("maor"), "nickname": "ג'ינג'י", "base": create_base("user")},
            { "fullName": 'עילי אדמוני', "username": "ilay", "passwordHash": "123456", "role": 'admin', "color": '#86EFAC', "profileImage": load_profile_image_base64("ilay"), "nickname": "בחפיפה", "base": create_base("user")},
            { "fullName": 'דן אלבז', "username": "dan", "passwordHash": "123456", "role": 'admin', "color": '#FCD34D', "profileImage": load_profile_image_base64("dan"), "nickname": "הצרפתי", "base": create_base("user")},
            { "fullName": 'אוראל חסידיאן', "username": "orel", "passwordHash": "123456", "role": 'regular', "color": '#C4B5FD', "profileImage": load_profile_image_base64("orel"), "nickname": "רנ\"ג דסק", "base": create_base("user")},
            { "fullName": 'אליה דנאל', "username": "eliya", "passwordHash": "123456", "role": 'regular', "color": '#FDA4AF', "profileImage": load_profile_image_base64("eliya"), "nickname": "משתמש", "base": create_base("user")},
            { "fullName": 'אורי רוגוזיק', "username": "ori", "passwordHash": "123456", "role": 'regular', "color": '#FCD34D', "profileImage": load_profile_image_base64("ori"), "nickname": "נינג'ה", "base": create_base("user")},
            { "fullName": 'עדי פליישמן', "username": "adi", "passwordHash": "123456", "role": 'regular', "color": '#F9A8D4', "profileImage": load_profile_image_base64("adi"), "nickname": "משתמש", "base": create_base("user")},
            { "fullName": 'גל פרץ', "username": "gal", "passwordHash": "123456", "role": 'regular', "color": '#93C5FD', "profileImage": load_profile_image_base64("gal"), "nickname": "הסטודנט", "base": create_base("user")},
        ]
        
        user_ids = []
        for u in users_data:
            u['_id'] = str(ObjectId())
            # Hash the password
            u['passwordHash'] = hash_password(u['passwordHash'])
            mongo.db.users.insert_one(u)
            uid = u['_id']
            user_ids.append(uid)
            # Log Create History
            log_history('user', uid, 'CREATE', 'system', None, u, u)
        
        print(f"  - {len(users_data)} users seeded")

        # If clean_only flag is set, exit after seeding users
        if clean_only:
            print("Clean mode: Only users added, no other sample data.")
            return

        # Map for easy access: 0=Eden, 1=Maor, 2=Ilay, 3=Dan, 4=Orel, 5=Elia, 6=Ori, 7=Adi, 8=Gal
        
        # 2. Primary Tags - Categories/Domains (using PRIMARY_TAG_COLORS from frontend)
        print("Seeding Primary Tags...")
        primary_tags_data = [
            { "name": 'פיתוח', "description": "קשור לפיתוח תוכנה", "color": '#3B82F6', "base": create_base("primary_tag", -10)},  # Blue
            { "name": 'עיצוב', "description": "קשור ל-UI/UX", "color": '#8B5CF6', "base": create_base("primary_tag", -10)},  # Violet
            { "name": 'שרתים', "description": "DevOps ותשתיות", "color": '#06B6D4', "base": create_base("primary_tag", -10)},  # Cyan
            { "name": 'ניהול', "description": "ניהול פרויקטים", "color": '#22C55E', "base": create_base("primary_tag", -10)},  # Green
            { "name": 'בדיקות', "description": "QA וטסטים", "color": '#F97316', "base": create_base("primary_tag", -10)},  # Orange
        ]

        primary_tag_ids = []
        for t in primary_tags_data:
            t['_id'] = str(ObjectId())
            mongo.db.ents.insert_one(t)
            tid = t['_id']
            primary_tag_ids.append(tid)
            log_history('primary_tag', tid, 'CREATE', 'system', None, t, t)
        
        print(f"  - {len(primary_tags_data)} primary tags seeded")
        
        # Primary tag indexes: 0=פיתוח, 1=עיצוב, 2=שרתים, 3=ניהול, 4=בדיקות
        
        # 3. Secondary Tags - Actions/Subjects linked to Primary Tags (use LIGHTER colors for display)
        print("Seeding Secondary Tags...")
        secondary_tags_data = [
            # פיתוח (Dev) secondary tags
            { "name": 'עדכון', "primaryTagId": primary_tag_ids[0], "description": "עדכון קוד או תכונה", "base": create_base("secondary_tag", -10)},
            { "name": 'באג', "primaryTagId": primary_tag_ids[0], "description": "תיקון באג", "base": create_base("secondary_tag", -10)},
            { "name": 'פיצ\'ר חדש', "primaryTagId": primary_tag_ids[0], "description": "פיתוח תכונה חדשה", "base": create_base("secondary_tag", -10)},
            
            # עיצוב (Design) secondary tags
            { "name": 'UI', "primaryTagId": primary_tag_ids[1], "description": "עיצוב ממשק משתמש", "base": create_base("secondary_tag", -10)},
            { "name": 'UX', "primaryTagId": primary_tag_ids[1], "description": "חווית משתמש", "base": create_base("secondary_tag", -10)},
            
            # שרתים (Servers) secondary tags
            { "name": 'בדיקה', "primaryTagId": primary_tag_ids[2], "description": "בדיקת שרתים", "base": create_base("secondary_tag", -10)},
            { "name": 'גיבוי', "primaryTagId": primary_tag_ids[2], "description": "גיבוי נתונים", "base": create_base("secondary_tag", -10)},
            { "name": 'הגדרה', "primaryTagId": primary_tag_ids[2], "description": "הגדרת סביבה", "base": create_base("secondary_tag", -10)},
            
            # ניהול (Management) secondary tags
            { "name": 'פגישה', "primaryTagId": primary_tag_ids[3], "description": "פגישת צוות", "base": create_base("secondary_tag", -10)},
            { "name": 'מצגת', "primaryTagId": primary_tag_ids[3], "description": "הכנת מצגת", "base": create_base("secondary_tag", -10)},
            { "name": 'תכנון', "primaryTagId": primary_tag_ids[3], "description": "תכנון ספרינט", "base": create_base("secondary_tag", -10)},
            
            # בדיקות (Testing) secondary tags
            { "name": 'אוטומטי', "primaryTagId": primary_tag_ids[4], "description": "בדיקות אוטומטיות", "base": create_base("secondary_tag", -10)},
            { "name": 'ידני', "primaryTagId": primary_tag_ids[4], "description": "בדיקות ידניות", "base": create_base("secondary_tag", -10)},
            { "name": 'E2E', "primaryTagId": primary_tag_ids[4], "description": "בדיקות End-to-End", "base": create_base("secondary_tag", -10)},
        ]
        
        secondary_tag_ids = []
        for t in secondary_tags_data:
            t['_id'] = str(ObjectId())
            mongo.db.ents.insert_one(t)
            tid = t['_id']
            secondary_tag_ids.append(tid)
            log_history('secondary_tag', tid, 'CREATE', 'system', None, t, t)
        
        print(f"  - {len(secondary_tags_data)} secondary tags seeded")
        
        # Secondary tag indexes:
        # 0=עדכון (פיתוח), 1=באג (פיתוח), 2=פיצ'ר חדש (פיתוח)
        # 3=UI (עיצוב), 4=UX (עיצוב)
        # 5=בדיקה (שרתים), 6=גיבוי (שרתים), 7=הגדרה (שרתים)
        # 8=פגישה (ניהול), 9=מצגת (ניהול), 10=תכנון (ניהול)
        # 11=אוטומטי (בדיקות), 12=ידני (בדיקות), 13=E2E (בדיקות)

        # 4. Contacts - linked to Primary Tags
        print("Seeding Contacts...")
        contacts_data = [
            { "fullName": 'תמיכה טכנית', "position": 'חיצוני', "department": "IT", "phoneNumber": '050-0000000', "primaryTagIds": [primary_tag_ids[2]], "base": create_base("contact", -30)},  # שרתים (Primary)
            { "fullName": 'ספק שרתים', "position": 'ספק', "department": "Infra", "phoneNumber": '052-1111111', "primaryTagIds": [primary_tag_ids[2]], "base": create_base("contact", -30)},  # שרתים (Primary)
        ]
        
        contact_ids = []
        for c in contacts_data:
            c['_id'] = str(ObjectId())
            mongo.db.contacts.insert_one(c)
            cid = c['_id']
            contact_ids.append(cid)
            log_history('contact', cid, 'CREATE', 'system', None, c, c)

        # 5. Tasks - Realistic test data with various date ranges
        print("Seeding Tasks...")
        
        # Status options for variation
        statuses = ['pending', 'in_progress', 'completed', 'cancelled']
        priorities = ['low', 'medium', 'high']
        
        if bulk_tasks:
            # REALISTIC TEST MODE: Generate 20 tasks with history over 7 days
            print("🔥 BULK MODE: Generating 20 tasks with realistic history...")
            
            task_titles = [
                "בדיקת שרתים", "פיתוח פיצ'ר חדש", "תיקון באג", "סקירת קוד",
                "עדכון תיעוד", "פגישת צוות", "בדיקות אוטומטיות", "אינטגרציה",
                "אופטימיזציה", "עיצוב UI", "ניהול פרויקט", "תמיכה טכנית",
                "פיתוח API", "הגדרת סביבה", "העלאה לייצור", "גיבוי נתונים",
                "שדרוג מערכת", "בדיקת אבטחה", "תיקון ביצועים", "עיצוב UX"
            ]
            
            task_descriptions = [
                "משימה לטובת בדיקת ביצועים",
                "פיתוח קומפוננטה חדשה",
                "פתרון בעיה קריטית",
                "עבודה שוטפת",
                "משימה דחופה"
            ]
            
            notes_examples = [
                "התחלתי לעבוד על זה",
                "צריך לבדוק עם הצוות",
                "ממתין לאישור",
                "בודק את הפתרון",
                "מתקדם יפה",
                "נתקלתי בבעיה קטנה",
                "הבעיה נפתרה",
                "מעדכן את הקוד",
                "בדיקות עברו בהצלחה",
                "מחכה לסקירת קוד"
            ]
            
            created_tasks = []
            
            for i in range(1000):
                # Date spread over 7 days (0 = today, 1-6 = future days)
                day_offset = i % 15  # Spread tasks across the week
                task_date = get_relative_date(day_offset)
                deadline = get_relative_date(day_offset + random.randint(1, 3))
                
                # Random initial assignment
                initial_user_idx = random.randint(0, len(user_ids) - 1)
                initial_user = user_ids[initial_user_idx]
                initial_user_name = users_data[initial_user_idx]['fullName']
                
                # Creation timestamp (1-4 hours before now)
                hours_ago = random.randint(1, 4)
                created_at = get_timestamp_ms() - (hours_ago * 3600 * 1000)
                
                task = {
                    "_id": str(ObjectId()),
                    "title": f"{task_titles[i % len(task_titles)]} #{i + 1}",
                    "description": random.choice(task_descriptions),
                    "status": "pending",  # Start as pending
                    "priority": random.choices(priorities, weights=[30, 50, 20])[0],
                    "responsibleUserIds": [initial_user],
                    "participantIds": [],
                    "secondaryTagIds": random.sample(secondary_tag_ids, random.randint(0, 2)),
                    "date": task_date,
                    "deadline": deadline,
                    "base": {
                        "isDeleted": False,
                        "isActive": True,
                        "createdAt": created_at,
                        "updatedAt": created_at,
                        "entityType": "task",
                        "createdBy": initial_user_name,
                        "updatedBy": initial_user_name
                    }
                }
                
                # Insert task
                mongo.db.ents.insert_one(task)
                log_history('task', task['_id'], 'CREATE', initial_user_name, None, task, task)
                created_tasks.append(task)
                
            print(f"  ✅ Created 20 tasks")
            
            # Now add realistic history entries to some tasks
            print("  📝 Adding realistic history entries...")
            
            history_count = 0
            
            for idx, task in enumerate(created_tasks):
                task_id = task['_id']
                current_status = "pending"
                current_users = task['responsibleUserIds']
                current_task = task.copy()
                
                # Determine how many history entries this task should have (0-5)
                num_entries = random.choices([0, 1, 2, 3, 4, 5], weights=[20, 25, 20, 15, 12, 8])[0]
                
                for entry_idx in range(num_entries):
                    # Pick a random user for this action
                    actor_idx = random.randint(0, len(user_ids) - 1)
                    actor_name = users_data[actor_idx]['fullName']
                    
                    # Timestamp: spread across the last few hours
                    minutes_ago = (num_entries - entry_idx) * random.randint(10, 45)
                    entry_timestamp = get_timestamp_ms() - (minutes_ago * 60 * 1000)
                    
                    # Choose action type
                    action_type = random.choices(
                        ['note', 'status_change', 'assignment'],
                        weights=[40, 35, 25]
                    )[0]
                    
                    if action_type == 'note':
                        # Add a note
                        note_text = random.choice(notes_examples)
                        entry = {
                            '_id': str(ObjectId()),
                            'o': None,
                            'c': {
                                'action': 'NOTE',
                                'timestamp': entry_timestamp,
                                'note': note_text,
                                'base': {
                                    'updatedBy': actor_name
                                }
                            },
                            'n': {
                                'id': task_id,
                                '_id': task_id,
                                'note': note_text,
                                'base': {
                                    'entityType': 'task',
                                    'updatedBy': actor_name
                                }
                            }
                        }
                        mongo.db.ents_archive.insert_one(entry)
                        history_count += 1
                        
                    elif action_type == 'status_change':
                        # Progress status: pending -> in_progress -> completed
                        old_task = current_task.copy()
                        
                        if current_status == 'pending':
                            new_status = 'in_progress'
                        elif current_status == 'in_progress':
                            new_status = random.choice(['in_progress', 'completed'])  # May stay or complete
                        else:
                            continue  # Already completed, skip
                        
                        if new_status != current_status:
                            # Update task in DB
                            mongo.db.ents.update_one(
                                {'_id': task_id},
                                {'$set': {'status': new_status, 'base.updatedAt': entry_timestamp, 'base.updatedBy': actor_name}}
                            )
                            
                            # Create history entry
                            new_task = old_task.copy()
                            new_task['status'] = new_status
                            new_task['base']['updatedAt'] = entry_timestamp
                            new_task['base']['updatedBy'] = actor_name
                            
                            changes = {
                                'status': new_status,
                                'base': {'updatedAt': entry_timestamp, 'updatedBy': actor_name}
                            }
                            
                            log_history('task', task_id, 'UPDATE', actor_name, old_task, new_task, changes)
                            current_status = new_status
                            current_task = new_task
                            history_count += 1
                            
                    elif action_type == 'assignment':
                        # Change assignment
                        new_user_idx = random.randint(0, len(user_ids) - 1)
                        new_user = user_ids[new_user_idx]
                        
                        if new_user not in current_users:
                            old_task = current_task.copy()
                            new_users = [new_user]  # Replace with new user
                            
                            # Update task in DB
                            mongo.db.ents.update_one(
                                {'_id': task_id},
                                {'$set': {'responsibleUserIds': new_users, 'base.updatedAt': entry_timestamp, 'base.updatedBy': actor_name}}
                            )
                            
                            # Create history entry
                            new_task = old_task.copy()
                            new_task['responsibleUserIds'] = new_users
                            new_task['base']['updatedAt'] = entry_timestamp
                            new_task['base']['updatedBy'] = actor_name
                            
                            changes = {
                                'responsibleUserIds': new_users,
                                'base': {'updatedAt': entry_timestamp, 'updatedBy': actor_name}
                            }
                            
                            log_history('task', task_id, 'UPDATE', actor_name, old_task, new_task, changes)
                            current_users = new_users
                            current_task = new_task
                            history_count += 1
                
            print(f"  ✅ Added {history_count} history entries")
            print(f"✅ Successfully created realistic test data!")
            
        else:
            # NORMAL MODE: Seed with realistic sample tasks
            # Using secondary tags:
            # 0=עדכון (פיתוח), 1=באג (פיתוח), 2=פיצ'ר חדש (פיתוח)
            # 3=UI (עיצוב), 4=UX (עיצוב)
            # 5=בדיקה (שרתים), 6=גיבוי (שרתים), 7=הגדרה (שרתים)
            # 8=פגישה (ניהול), 9=מצגת (ניהול), 10=תכנון (ניהול)
            # 11=אוטומטי (בדיקות), 12=ידני (בדיקות), 13=E2E (בדיקות)
            tasks_data = [
                # === Today's tasks ===
                {
                    "title": 'בדיקת שרתים שבועית',
                    "description": 'בדיקה מקיפה של שרתי ה-Production וה-Staging לוודא יציבות.',
                    "status": 'in_progress',
                    "priority": 'high',
                    "responsibleUserIds": [user_ids[1]],  # Maor
                    "participantIds": [contact_ids[0]],  # Tech Support contact
                    "secondaryTagIds": [secondary_tag_ids[5]],  # בדיקה (שרתים)
                    "date": get_relative_date(0),
                    "deadline": get_relative_date(2),
                    "base": {"isDeleted": False, "isActive": True, "createdAt": get_relative_date(-2), "updatedAt": get_relative_date(0), "entityType": "task", "createdBy": "System Admin", "updatedBy": "System Admin"}
                },
                {
                    "title": 'פגישת סינכרון צוות',
                    "description": 'סינכרון שבועי עם כל הצוות - סקירת התקדמות ותיאום משימות.',
                    "status": 'pending',
                    "priority": 'medium',
                    "responsibleUserIds": [user_ids[0]],  # Eden
                    "participantIds": [],
                    "secondaryTagIds": [secondary_tag_ids[8]],  # פגישה (ניהול)
                    "date": get_relative_date(0),
                    "deadline": get_relative_date(0),
                    "base": {"isDeleted": False, "isActive": True, "createdAt": get_relative_date(-1), "updatedAt": get_relative_date(-1), "entityType": "task", "createdBy": "System Admin", "updatedBy": "System Admin"}
                },
                {
                    "title": 'תיקון באג בהתחברות',
                    "description": 'משתמשים מדווחים על בעיה בהתחברות עם סיסמה ארוכה.',
                    "status": 'in_progress',
                    "priority": 'high',
                    "responsibleUserIds": [user_ids[2]],  # Ilay
                    "participantIds": [],
                    "secondaryTagIds": [secondary_tag_ids[1]],  # באג (פיתוח)
                    "date": get_relative_date(0),
                    "deadline": get_relative_date(1),
                    "base": {"isDeleted": False, "isActive": True, "createdAt": get_relative_date(-1), "updatedAt": get_relative_date(0), "entityType": "task", "createdBy": "System Admin", "updatedBy": "System Admin"}
                },
                
                # === Multi-day tasks (for weekly calendar spanning) ===
                {
                    "title": 'פיתוח מודול דוחות',
                    "description": 'פיתוח מודול חדש להפקת דוחות PDF אוטומטיים.',
                    "status": 'in_progress',
                    "priority": 'medium',
                    "responsibleUserIds": [user_ids[3]],  # Dan
                    "participantIds": [], 
                    "secondaryTagIds": [secondary_tag_ids[2]],  # פיצ'ר חדש (פיתוח)
                    "date": get_relative_date(-1),
                    "deadline": get_relative_date(4),
                    "base": {"isDeleted": False, "isActive": True, "createdAt": get_relative_date(-3), "updatedAt": get_relative_date(-1), "entityType": "task", "createdBy": "System Admin", "updatedBy": "System Admin"}
                },
                {
                    "title": 'עיצוב דף הבית החדש',
                    "description": 'עיצוב מחדש של דף הבית עם חווית משתמש משופרת.',
                    "status": 'in_progress',
                    "priority": 'medium',
                    "responsibleUserIds": [user_ids[7]],  # Adi
                    "participantIds": [],
                    "secondaryTagIds": [secondary_tag_ids[3], secondary_tag_ids[4]],  # UI, UX (עיצוב)
                    "date": get_relative_date(-2),
                    "deadline": get_relative_date(3),
                    "base": {"isDeleted": False, "isActive": True, "createdAt": get_relative_date(-5), "updatedAt": get_relative_date(-2), "entityType": "task", "createdBy": "System Admin", "updatedBy": "System Admin"}
                },
                {
                    "title": 'אינטגרציה עם API חיצוני',
                    "description": 'חיבור למערכת תשלומים חיצונית.',
                    "status": 'pending',
                    "priority": 'high',
                    "responsibleUserIds": [user_ids[2], user_ids[3]],  # Ilay, Dan
                    "participantIds": [contact_ids[1]], # Server Provider contact
                    "secondaryTagIds": [secondary_tag_ids[2], secondary_tag_ids[7]],  # פיצ'ר חדש (פיתוח), הגדרה (שרתים)
                    "date": get_relative_date(1),
                    "deadline": get_relative_date(5),
                    "base": {"isDeleted": False, "isActive": True, "createdAt": get_relative_date(-1), "updatedAt": get_relative_date(-1), "entityType": "task", "createdBy": "System Admin", "updatedBy": "System Admin"}
                },
                
                # === Tomorrow's tasks ===
                {
                    "title": 'סקירת קוד - Sprint 12',
                    "description": 'סקירת קוד של כל ה-PRים מהספרינט האחרון.',
                    "status": 'pending',
                    "priority": 'medium',
                    "responsibleUserIds": [user_ids[4]],  # Orel
                    "participantIds": [], 
                    "secondaryTagIds": [secondary_tag_ids[0], secondary_tag_ids[12]],  # עדכון (פיתוח), ידני (בדיקות)
                    "date": get_relative_date(1),
                    "deadline": get_relative_date(1),
                    "base": {"isDeleted": False, "isActive": True, "createdAt": get_relative_date(0), "updatedAt": get_relative_date(0), "entityType": "task", "createdBy": "System Admin", "updatedBy": "System Admin"}
                },
                {
                    "title": 'עדכון תיעוד API',
                    "description": 'עדכון התיעוד הטכני לאחר השינויים האחרונים.',
                    "status": 'pending',
                    "priority": 'low',
                    "responsibleUserIds": [user_ids[5]],  # Elia
                    "participantIds": [],
                    "secondaryTagIds": [secondary_tag_ids[0]],  # עדכון (פיתוח)
                    "date": get_relative_date(1),
                    "deadline": get_relative_date(3),
                    "base": {"isDeleted": False, "isActive": True, "createdAt": get_relative_date(0), "updatedAt": get_relative_date(0), "entityType": "task", "createdBy": "System Admin", "updatedBy": "System Admin"}
                },
                
                # === Later this week ===
                {
                    "title": 'בדיקות אוטומטיות - E2E',
                    "description": 'כתיבת טסטים אוטומטיים לתרחישי קצה חדשים.',
                    "status": 'pending',
                    "priority": 'medium',
                    "responsibleUserIds": [user_ids[6]],  # Ori
                    "participantIds": [],
                    "secondaryTagIds": [secondary_tag_ids[11], secondary_tag_ids[13]],  # אוטומטי, E2E (בדיקות)
                    "date": get_relative_date(2),
                    "deadline": get_relative_date(4),
                    "base": {"isDeleted": False, "isActive": True, "createdAt": get_relative_date(0), "updatedAt": get_relative_date(0), "entityType": "task", "createdBy": "System Admin", "updatedBy": "System Admin"}
                },
                {
                    "title": 'העברת מצגת לניהול',
                    "description": 'מצגת סיכום רבעון למנהלים.',
                    "status": 'pending',
                    "priority": 'high',
                    "responsibleUserIds": [user_ids[0]],  # Eden
                    "participantIds": [],
                    "secondaryTagIds": [secondary_tag_ids[9]],  # מצגת (ניהול)
                    "date": get_relative_date(3),
                    "deadline": get_relative_date(3),
                    "base": {"isDeleted": False, "isActive": True, "createdAt": get_relative_date(-2), "updatedAt": get_relative_date(-2), "entityType": "task", "createdBy": "System Admin", "updatedBy": "System Admin"}
                },
                
                # === Completed tasks ===
                {
                    "title": 'התקנת SSL בשרת Production',
                    "description": 'חידוש והתקנת אישור SSL.',
                    "status": 'completed',
                    "priority": 'high',
                    "responsibleUserIds": [user_ids[4]],  # Orel
                    "participantIds": [],
                    "secondaryTagIds": [secondary_tag_ids[7]],  # הגדרה (שרתים)
                    "date": get_relative_date(-3),
                    "deadline": get_relative_date(-2),
                    "base": {"isDeleted": False, "isActive": True, "createdAt": get_relative_date(-5), "updatedAt": get_relative_date(-2), "entityType": "task", "createdBy": "System Admin", "updatedBy": "System Admin"}
                },
                {
                    "title": 'תיקון בעיית ביצועים',
                    "description": 'אופטימיזציה לשאילתות מסד נתונים איטיות.',
                    "status": 'completed',
                    "priority": 'high',
                    "responsibleUserIds": [user_ids[3]],  # Dan
                    "participantIds": [],
                    "secondaryTagIds": [secondary_tag_ids[1], secondary_tag_ids[5]],  # באג (פיתוח), בדיקה (שרתים)
                    "date": get_relative_date(-2),
                    "deadline": get_relative_date(-1),
                    "base": {"isDeleted": False, "isActive": True, "createdAt": get_relative_date(-4), "updatedAt": get_relative_date(-1), "entityType": "task", "createdBy": "System Admin", "updatedBy": "System Admin"}
                },
                
                # === Next week tasks ===
                {
                    "title": 'השקת גרסה 2.0',
                    "description": 'השקה מלאה של הגרסה החדשה לייצור.',
                    "status": 'pending',
                    "priority": 'high',
                    "responsibleUserIds": [user_ids[0], user_ids[1]],  # Eden, Maor
                    "participantIds": [],
                    "secondaryTagIds": [secondary_tag_ids[2], secondary_tag_ids[7], secondary_tag_ids[10]],  # פיצ'ר חדש (פיתוח), הגדרה (שרתים), תכנון (ניהול)
                    "date": get_relative_date(7),
                    "deadline": get_relative_date(7),
                    "base": {"isDeleted": False, "isActive": True, "createdAt": get_relative_date(-10), "updatedAt": get_relative_date(-5), "entityType": "task", "createdBy": "System Admin", "updatedBy": "System Admin"}
                },
                {
                    "title": 'הכנת סביבת Staging',
                    "description": 'הקמת סביבת בדיקות חדשה לגרסה 2.0.',
                    "status": 'pending',
                    "priority": 'medium',
                    "responsibleUserIds": [user_ids[4]],  # Orel
                    "participantIds": [contact_ids[1]], # Server Provider
                    "secondaryTagIds": [secondary_tag_ids[7]],  # הגדרה (שרתים)
                    "date": get_relative_date(5),
                    "deadline": get_relative_date(6),
                    "base": {"isDeleted": False, "isActive": True, "createdAt": get_relative_date(-3), "updatedAt": get_relative_date(-3), "entityType": "task", "createdBy": "System Admin", "updatedBy": "System Admin"}
                },
                
                # === Long running task spanning entire week ===
                {
                    "title": 'ספרינט 13 - פיצ׳רים חדשים',
                    "description": 'ספרינט של שבועיים לפיתוח פיצ׳רים חדשים.',
                    "status": 'in_progress',
                    "priority": 'medium',
                    "responsibleUserIds": [user_ids[0]],  # Eden (manager)
                    "participantIds": [],
                    "secondaryTagIds": [secondary_tag_ids[2], secondary_tag_ids[10]],  # פיצ'ר חדש (פיתוח), תכנון (ניהול)
                    "date": get_relative_date(-3),
                    "deadline": get_relative_date(11),
                    "base": {"isDeleted": False, "isActive": True, "createdAt": get_relative_date(-4), "updatedAt": get_relative_date(-1), "entityType": "task", "createdBy": "System Admin", "updatedBy": "System Admin"}
                },
            ]
            
            for t in tasks_data:
                t['_id'] = str(ObjectId())
                mongo.db.ents.insert_one(t)
                tid = t['_id']
                log_history('task', tid, 'CREATE', 'system', None, t, t)
            
            print(f"  - {len(tasks_data)} tasks seeded")

        # 6. Chat Messages
        print("Seeding Chat...")
        chat_data = [
            {
                "senderUserId": user_ids[0],  # String user ID
                "message": "בוקר טוב לכולם!",
                "base": {
                    "isDeleted": False,
                    "isActive": True,
                    "createdAt": get_timestamp_ms() - 100000,
                    "updatedAt": get_timestamp_ms() - 100000,

                    "entityType": "chat_message",
                    "createdBy": "System Admin",
                    "updatedBy": "System Admin"
                }
            },
            {
                "senderUserId": user_ids[1],  # String user ID
                "message": "בוקר אור, מה המצב?",
                "base": {
                    "isDeleted": False,
                    "isActive": True,
                    "createdAt": get_timestamp_ms(),
                    "updatedAt": get_timestamp_ms(),

                    "entityType": "chat_message",
                    "createdBy": "System Admin",
                    "updatedBy": "System Admin"
                }
            }
        ]
        
        for msg in chat_data:
            msg['_id'] = str(ObjectId())
            mongo.db.ents.insert_one(msg)
            
        print("Database seeded successfully with sample data!")
        print(f"  - {len(users_data)} users")
        print(f"  - {len(primary_tags_data)} primary tags")
        print(f"  - {len(secondary_tags_data)} secondary tags")
        print(f"  - {len(contacts_data)} contacts")
        if bulk_tasks:
            print(f"  - 20 tasks with history (bulk mode)")
        else:
            print(f"  - {len(tasks_data)} tasks")
        print(f"  - {len(chat_data)} chat messages")

def seed_init():
    """Initialize database with essential data only: users, tags, and contacts. No tasks or chat."""
    with app.app_context():
        # Clear existing data
        clear_database()
        
        # 1. Users - Same as regular seed
        print("Seeding Users...")
        print("  Loading profile images as base64...")
        
        users_data = [
            { "fullName": 'עדן טירם', "username": "eden", "passwordHash": "123456", "role": 'admin', "color": '#93C5FD', "profileImage": load_profile_image_base64("eden"), "nickname": "ראש צוות HD", "base": create_base("user")},
            { "fullName": 'מאור נובחוב', "username": "maor", "passwordHash": "123456", "role": 'regular', "color": '#FDBA74', "profileImage": load_profile_image_base64("maor"), "nickname": "ג'ינג'י", "base": create_base("user")},
            { "fullName": 'עילי אדמוני', "username": "ilay", "passwordHash": "123456", "role": 'admin', "color": '#86EFAC', "profileImage": load_profile_image_base64("ilay"), "nickname": "בחפיפה", "base": create_base("user")},
            { "fullName": 'דן אלבז', "username": "dan", "passwordHash": "123456", "role": 'admin', "color": '#FCD34D', "profileImage": load_profile_image_base64("dan"), "nickname": "הצרפתי", "base": create_base("user")},
            { "fullName": 'אוראל חסידיאן', "username": "orel", "passwordHash": "123456", "role": 'regular', "color": '#C4B5FD', "profileImage": load_profile_image_base64("orel"), "nickname": "רנ\"ג דסק", "base": create_base("user")},
            { "fullName": 'אליה דנאל', "username": "eliya", "passwordHash": "123456", "role": 'regular', "color": '#FDA4AF', "profileImage": load_profile_image_base64("eliya"), "nickname": "משתמש", "base": create_base("user")},
            { "fullName": 'אורי רוגוזיק', "username": "ori", "passwordHash": "123456", "role": 'regular', "color": '#FCD34D', "profileImage": load_profile_image_base64("ori"), "nickname": "נינג'ה", "base": create_base("user")},
            { "fullName": 'עדי פליישמן', "username": "adi", "passwordHash": "123456", "role": 'regular', "color": '#F9A8D4', "profileImage": load_profile_image_base64("adi"), "nickname": "משתמש", "base": create_base("user")},
            { "fullName": 'גל פרץ', "username": "gal", "passwordHash": "123456", "role": 'regular', "color": '#93C5FD', "profileImage": load_profile_image_base64("gal"), "nickname": "הסטודנט", "base": create_base("user")},
        ]
        
        user_ids = []
        for u in users_data:
            u['_id'] = str(ObjectId())
            u['passwordHash'] = hash_password(u['passwordHash'])
            mongo.db.users.insert_one(u)
            uid = u['_id']
            user_ids.append(uid)
            log_history('user', uid, 'CREATE', 'system', None, u, u)
        
        print(f"  - {len(users_data)} users seeded")

        # 2. Primary Tags - The 8 main categories
        print("Seeding Primary Tags...")
        primary_tags_data = [
            { "name": 'DB', "description": "מסדי נתונים", "color": '#3B82F6', "base": create_base("primary_tag", -10)},       # Blue
            { "name": 'TD', "description": "תיעוד טכני", "color": '#8B5CF6', "base": create_base("primary_tag", -10)},       # Violet
            { "name": 'APP', "description": "אפליקציה", "color": '#06B6D4', "base": create_base("primary_tag", -10)},        # Cyan
            { "name": 'GO', "description": "Go Live / העלאה לייצור", "color": '#22C55E', "base": create_base("primary_tag", -10)},  # Green
            { "name": 'CORE', "description": "ליבת המערכת", "color": '#F97316', "base": create_base("primary_tag", -10)},    # Orange
            { "name": 'DVC', "description": "התקנים ומכשירים", "color": '#EC4899', "base": create_base("primary_tag", -10)}, # Pink
            { "name": 'COMP', "description": "תאימות ואינטגרציה", "color": '#EAB308', "base": create_base("primary_tag", -10)},  # Yellow
            { "name": 'OCP', "description": "תפעול ובקרה", "color": '#14B8A6', "base": create_base("primary_tag", -10)},     # Teal
        ]

        primary_tag_ids = []
        for t in primary_tags_data:
            t['_id'] = str(ObjectId())
            mongo.db.ents.insert_one(t)
            tid = t['_id']
            primary_tag_ids.append(tid)
            log_history('primary_tag', tid, 'CREATE', 'system', None, t, t)
        
        print(f"  - {len(primary_tags_data)} primary tags seeded")
        
        # Primary tag indexes: 0=DB, 1=TD, 2=APP, 3=GO, 4=CORE, 5=DVC, 6=COMP, 7=OCP

        # 3. Secondary Tags - 2 per primary tag
        print("Seeding Secondary Tags...")
        secondary_tags_data = [
            # DB (Database) secondary tags
            { "name": 'גיבוי', "primaryTagId": primary_tag_ids[0], "description": "גיבוי מסד נתונים", "base": create_base("secondary_tag", -10)},
            { "name": 'שאילתות', "primaryTagId": primary_tag_ids[0], "description": "אופטימיזציית שאילתות", "base": create_base("secondary_tag", -10)},
            
            # TD (Technical Documentation) secondary tags
            { "name": 'API', "primaryTagId": primary_tag_ids[1], "description": "תיעוד API", "base": create_base("secondary_tag", -10)},
            { "name": 'מדריך', "primaryTagId": primary_tag_ids[1], "description": "מדריך למשתמש", "base": create_base("secondary_tag", -10)},
            
            # APP (Application) secondary tags
            { "name": 'פרונטאנד', "primaryTagId": primary_tag_ids[2], "description": "צד לקוח", "base": create_base("secondary_tag", -10)},
            { "name": 'בקאנד', "primaryTagId": primary_tag_ids[2], "description": "צד שרת", "base": create_base("secondary_tag", -10)},
            
            # GO (Go Live) secondary tags
            { "name": 'דיפלוי', "primaryTagId": primary_tag_ids[3], "description": "העלאה לייצור", "base": create_base("secondary_tag", -10)},
            { "name": 'רולבק', "primaryTagId": primary_tag_ids[3], "description": "חזרה לגרסה קודמת", "base": create_base("secondary_tag", -10)},
            
            # CORE (Core System) secondary tags
            { "name": 'אבטחה', "primaryTagId": primary_tag_ids[4], "description": "אבטחת מידע", "base": create_base("secondary_tag", -10)},
            { "name": 'ביצועים', "primaryTagId": primary_tag_ids[4], "description": "אופטימיזציית ביצועים", "base": create_base("secondary_tag", -10)},
            
            # DVC (Devices) secondary tags
            { "name": 'מובייל', "primaryTagId": primary_tag_ids[5], "description": "מכשירים ניידים", "base": create_base("secondary_tag", -10)},
            { "name": 'IoT', "primaryTagId": primary_tag_ids[5], "description": "התקנים חכמים", "base": create_base("secondary_tag", -10)},
            
            # COMP (Compatibility) secondary tags
            { "name": 'API חיצוני', "primaryTagId": primary_tag_ids[6], "description": "אינטגרציה חיצונית", "base": create_base("secondary_tag", -10)},
            { "name": 'מיגרציה', "primaryTagId": primary_tag_ids[6], "description": "העברת נתונים", "base": create_base("secondary_tag", -10)},
            
            # OCP (Operations) secondary tags
            { "name": 'ניטור', "primaryTagId": primary_tag_ids[7], "description": "ניטור מערכת", "base": create_base("secondary_tag", -10)},
            { "name": 'התראות', "primaryTagId": primary_tag_ids[7], "description": "מערכת התראות", "base": create_base("secondary_tag", -10)},
        ]
        
        secondary_tag_ids = []
        for t in secondary_tags_data:
            t['_id'] = str(ObjectId())
            mongo.db.ents.insert_one(t)
            tid = t['_id']
            secondary_tag_ids.append(tid)
            log_history('secondary_tag', tid, 'CREATE', 'system', None, t, t)
        
        print(f"  - {len(secondary_tags_data)} secondary tags seeded")
        
        # Secondary tag indexes:
        # 0=גיבוי (DB), 1=שאילתות (DB)
        # 2=API (TD), 3=מדריך (TD)
        # 4=פרונטאנד (APP), 5=בקאנד (APP)
        # 6=דיפלוי (GO), 7=רולבק (GO)
        # 8=אבטחה (CORE), 9=ביצועים (CORE)
        # 10=מובייל (DVC), 11=IoT (DVC)
        # 12=API חיצוני (COMP), 13=מיגרציה (COMP)
        # 14=ניטור (OCP), 15=התראות (OCP)

        # 4. Contacts - 10 contacts linked to Primary Tags
        print("Seeding Contacts...")
        contacts_data = [
            # DB related contacts
            { "fullName": 'יוסי כהן', "position": 'DBA', "department": "IT", "phoneNumber": '050-1234567', "primaryTagIds": [primary_tag_ids[0]], "base": create_base("contact", -30)},
            { "fullName": 'מיכל לוי', "position": 'מנהלת מסדי נתונים', "department": "IT", "phoneNumber": '052-2345678', "primaryTagIds": [primary_tag_ids[0], primary_tag_ids[4]], "base": create_base("contact", -30)},  # DB + CORE
            
            # APP related contacts
            { "fullName": 'דוד ישראלי', "position": 'מפתח בכיר', "department": "פיתוח", "phoneNumber": '053-3456789', "primaryTagIds": [primary_tag_ids[2]], "base": create_base("contact", -30)},
            { "fullName": 'רחל אברהם', "position": 'ארכיטקטית', "department": "פיתוח", "phoneNumber": '054-4567890', "primaryTagIds": [primary_tag_ids[2], primary_tag_ids[4]], "base": create_base("contact", -30)},  # APP + CORE
            
            # GO & OCP related contacts
            { "fullName": 'אבי שמעון', "position": 'DevOps', "department": "תפעול", "phoneNumber": '055-5678901', "primaryTagIds": [primary_tag_ids[3], primary_tag_ids[7]], "base": create_base("contact", -30)},  # GO + OCP
            { "fullName": 'נועה פרידמן', "position": 'מנהלת תפעול', "department": "תפעול", "phoneNumber": '056-6789012', "primaryTagIds": [primary_tag_ids[7]], "base": create_base("contact", -30)},  # OCP
            
            # DVC related contacts
            { "fullName": 'עומר גולן', "position": 'מהנדס IoT', "department": "R&D", "phoneNumber": '057-7890123', "primaryTagIds": [primary_tag_ids[5]], "base": create_base("contact", -30)},  # DVC
            { "fullName": 'שירה נחמן', "position": 'מפתחת מובייל', "department": "פיתוח", "phoneNumber": '058-8901234', "primaryTagIds": [primary_tag_ids[5], primary_tag_ids[2]], "base": create_base("contact", -30)},  # DVC + APP
            
            # TD & COMP related contacts
            { "fullName": 'אלון ברק', "position": 'כותב טכני', "department": "תיעוד", "phoneNumber": '059-9012345', "primaryTagIds": [primary_tag_ids[1]], "base": create_base("contact", -30)},  # TD
            { "fullName": 'תמר רוזן', "position": 'מנהלת אינטגרציות', "department": "פיתוח", "phoneNumber": '050-0123456', "primaryTagIds": [primary_tag_ids[6], primary_tag_ids[1]], "base": create_base("contact", -30)},  # COMP + TD
        ]
        
        contact_ids = []
        for c in contacts_data:
            c['_id'] = str(ObjectId())
            mongo.db.contacts.insert_one(c)
            cid = c['_id']
            contact_ids.append(cid)
            log_history('contact', cid, 'CREATE', 'system', None, c, c)

        print(f"  - {len(contacts_data)} contacts seeded")

        # Summary
        print("")
        print("✅ Init mode completed successfully!")
        print(f"  - {len(users_data)} users")
        print(f"  - {len(primary_tags_data)} primary tags (DB, TD, APP, GO, CORE, DVC, COMP, OCP)")
        print(f"  - {len(secondary_tags_data)} secondary tags")
        print(f"  - {len(contacts_data)} contacts (with tag connections)")
        print("  - 0 tasks")
        print("  - 0 chat messages")


def print_usage():
    print("Usage: python seed.py [options]")
    print("")
    print("Options:")
    print("  --init     Initialize with users, tags, and contacts only (no tasks/chat)")
    print("  --clean    Clear all data and add only users (no sample data)")
    print("  --bulk     Seed with 100 tasks for performance testing")
    print("  --help     Show this help message")
    print("")
    print("Examples:")
    print("  python seed.py           # Clear and seed with sample data (15 tasks)")
    print("  python seed.py --init    # Initialize with users, tags, and contacts only")
    print("  python seed.py --clean   # Clear all data and add only users")
    print("  python seed.py --bulk    # Clear and seed with 100 tasks for performance testing")

if __name__ == '__main__':
    if '--help' in sys.argv or '-h' in sys.argv:
        print_usage()
    elif '--init' in sys.argv:
        seed_init()
    elif '--clean' in sys.argv:
        seed(clean_only=True, bulk_tasks=False)
    elif '--bulk' in sys.argv:
        seed(clean_only=False, bulk_tasks=True)
    else:
        seed(clean_only=False, bulk_tasks=False)
