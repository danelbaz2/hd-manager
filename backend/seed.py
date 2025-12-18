from app import app
from database import mongo
from datetime import datetime, timedelta
from utils.history import log_history
import sys
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

def clear_database():
    """Clear all data from all collections"""
    print("Clearing database...")
    mongo.db.users.delete_many({})
    mongo.db.ents.delete_many({})
    mongo.db.ents_archive.delete_many({})
    mongo.db.contacts.delete_many({})
    print("Database cleared successfully!")

def seed(clean_only=False):
    with app.app_context():
        # Always clear existing data first
        clear_database()
        
        # 1. Users - ALWAYS seed users (even in clean mode)
        print("Seeding Users...")
        users_data = [
            { "fullName": 'עדן טירם', "username": "eden", "passwordHash": "hash123", "role": 'admin', "color": '#93C5FD', "profileImage": None, "base": {"isDeleted": False, "isActive": True, "createdAt": get_relative_date(-30), "updatedAt": get_relative_date(-30), "lut": get_relative_date(-30), "entityType": "user"}},  # Light Rose
            { "fullName": 'מאור נובחוב', "username": "maor", "passwordHash": "hash123", "role": 'regular', "color": '#FDBA74', "profileImage": None, "base": {"isDeleted": False, "isActive": True, "createdAt": get_relative_date(-30), "updatedAt": get_relative_date(-30), "lut": get_relative_date(-30), "entityType": "user"}},  # Light Blue
            { "fullName": 'עילי אדמוני', "username": "ilay", "passwordHash": "hash123", "role": 'regular', "color": '#86EFAC', "profileImage": "/profiles/ilay.png", "base": {"isDeleted": False, "isActive": True, "createdAt": get_relative_date(-30), "updatedAt": get_relative_date(-30), "lut": get_relative_date(-30), "entityType": "user"}},  # Light Green
            { "fullName": 'דן אלבז', "username": "dan", "passwordHash": "hash123", "role": 'regular', "color": '#FCD34D', "profileImage": "/profiles/dan.png", "base": {"isDeleted": False, "isActive": True, "createdAt": get_relative_date(-30), "updatedAt": get_relative_date(-30), "lut": get_relative_date(-30), "entityType": "user"}},  # Light Amber
            { "fullName": 'אוראל חסידיאן', "username": "orel", "passwordHash": "hash123", "role": 'regular', "color": '#C4B5FD', "profileImage": None, "base": {"isDeleted": False, "isActive": True, "createdAt": get_relative_date(-30), "updatedAt": get_relative_date(-30), "lut": get_relative_date(-30), "entityType": "user"}},  # Light Rose
            { "fullName": 'אליה דנאל', "username": "elia", "passwordHash": "hash123", "role": 'regular', "color": '#FDA4AF', "profileImage": None, "base": {"isDeleted": False, "isActive": True, "createdAt": get_relative_date(-30), "updatedAt": get_relative_date(-30), "lut": get_relative_date(-30), "entityType": "user"}},  # Light Rose
            { "fullName": 'אורי רוגוזיק', "username": "ori", "passwordHash": "hash123", "role": 'regular', "color": '#FCD34D', "profileImage": None, "base": {"isDeleted": False, "isActive": True, "createdAt": get_relative_date(-30), "updatedAt": get_relative_date(-30), "lut": get_relative_date(-30), "entityType": "user"}},  # Light Rose
            { "fullName": 'עדי פליישמן', "username": "adi", "passwordHash": "hash123", "role": 'regular', "color": '#F9A8D4', "profileImage": None, "base": {"isDeleted": False, "isActive": True, "createdAt": get_relative_date(-30), "updatedAt": get_relative_date(-30), "lut": get_relative_date(-30), "entityType": "user"}},  # Light Rose
            { "fullName": 'גל פרץ', "username": "gal", "passwordHash": "hash123", "role": 'regular', "color": '#93C5FD', "profileImage": None, "base": {"isDeleted": False, "isActive": True, "createdAt": get_relative_date(-30), "updatedAt": get_relative_date(-30), "lut": get_relative_date(-30), "entityType": "user"}},  # Light Rose
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
        
        # 2. Tags - with clean, light, modern color palette
        print("Seeding Tags...")
        tags_data = [
            { "name": 'פיתוח', "description": "קשור לפיתוח תוכנה", "color": '#93C5FD', "base": {"isDeleted": False, "isActive": True, "createdAt": get_relative_date(-10), "updatedAt": get_relative_date(-10), "lut": get_relative_date(-10), "entityType": "tag"}},  # Light Blue
            { "name": 'עיצוב', "description": "קשור ל-UI/UX", "color": '#C4B5FD', "base": {"isDeleted": False, "isActive": True, "createdAt": get_relative_date(-10), "updatedAt": get_relative_date(-10), "lut": get_relative_date(-10), "entityType": "tag"}},  # Light Violet
            { "name": 'בדיקות', "description": "QA וטסטים", "color": '#FDBA74', "base": {"isDeleted": False, "isActive": True, "createdAt": get_relative_date(-10), "updatedAt": get_relative_date(-10), "lut": get_relative_date(-10), "entityType": "tag"}},  # Light Orange
            { "name": 'שרתים', "description": "DevOps ותשתיות", "color": '#67E8F9', "base": {"isDeleted": False, "isActive": True, "createdAt": get_relative_date(-10), "updatedAt": get_relative_date(-10), "lut": get_relative_date(-10), "entityType": "tag"}},  # Light Cyan
            { "name": 'ניהול', "description": "ניהול פרויקטים", "color": '#86EFAC', "base": {"isDeleted": False, "isActive": True, "createdAt": get_relative_date(-10), "updatedAt": get_relative_date(-10), "lut": get_relative_date(-10), "entityType": "tag"}},  # Light Green
            { "name": 'דחיפות גבוהה', "description": "לטפל מיד", "color": '#FDA4AF', "base": {"isDeleted": False, "isActive": True, "createdAt": get_relative_date(-10), "updatedAt": get_relative_date(-10), "lut": get_relative_date(-10), "entityType": "tag"}},  # Light Rose
        ]

        
        tag_ids = []
        for t in tags_data:
            t['_id'] = str(ObjectId())
            mongo.db.ents.insert_one(t)
            tid = t['_id']
            tag_ids.append(tid)
            log_history('tag', tid, 'CREATE', 'system', None, t, t)

        # Tag indexes: 0=פיתוח, 1=עיצוב, 2=בדיקות, 3=שרתים, 4=ניהול, 5=דחיפות גבוהה

        # 3. Contacts
        print("Seeding Contacts...")
        contacts_data = [
            { "fullName": 'תמיכה טכנית', "position": 'חיצוני', "department": "IT", "phoneNumber": '050-0000000', "tagsIds": [tag_ids[3]], "base": {"isDeleted": False, "isActive": True, "createdAt": get_relative_date(-30), "updatedAt": get_relative_date(-30), "lut": get_relative_date(-30), "entityType": "contact"}},
            { "fullName": 'ספק שרתים', "position": 'ספק', "department": "Infra", "phoneNumber": '052-1111111', "tagsIds": [tag_ids[3]], "base": {"isDeleted": False, "isActive": True, "createdAt": get_relative_date(-30), "updatedAt": get_relative_date(-30), "lut": get_relative_date(-30), "entityType": "contact"}},
        ]
        
        contact_ids = []
        for c in contacts_data:
            c['_id'] = str(ObjectId())
            mongo.db.contacts.insert_one(c)
            cid = c['_id']
            contact_ids.append(cid)
            log_history('contact', cid, 'CREATE', 'system', None, c, c)

        # 4. Tasks - Realistic test data with various date ranges
        print("Seeding Tasks...")
        
        # Status options for variation
        statuses = ['pending', 'in_progress', 'completed', 'cancelled']
        priorities = ['low', 'medium', 'high']
        
        tasks_data = [
            # === Today's tasks ===
            {
                "title": 'בדיקת שרתים שבועית',
                "description": 'בדיקה מקיפה של שרתי ה-Production וה-Staging לוודא יציבות.',
                "status": 'in_progress',
                "priority": 'high',
                "responsibleUsersId": [user_ids[1]],  # Maor
                "participantsIds": [contact_ids[0]],  # Tech Support contact
                "tagsId": [tag_ids[3], tag_ids[5]],  # Servers, High Priority
                "date": get_relative_date(0),
                "deadline": get_relative_date(2),
                "base": {"isDeleted": False, "isActive": True, "createdAt": get_relative_date(-2), "updatedAt": get_relative_date(0), "lut": get_relative_date(0), "entityType": "task"}
            },
            {
                "title": 'פגישת סינכרון צוות',
                "description": 'סינכרון שבועי עם כל הצוות - סקירת התקדמות ותיאום משימות.',
                "status": 'pending',
                "priority": 'medium',
                "responsibleUsersId": [user_ids[0]],  # Eden
                "participantsIds": [],
                "tagsId": [tag_ids[4]],  # Management
                "date": get_relative_date(0),
                "deadline": get_relative_date(0),
                "base": {"isDeleted": False, "isActive": True, "createdAt": get_relative_date(-1), "updatedAt": get_relative_date(-1), "lut": get_relative_date(-1), "entityType": "task"}
            },
            {
                "title": 'תיקון באג בהתחברות',
                "description": 'משתמשים מדווחים על בעיה בהתחברות עם סיסמה ארוכה.',
                "status": 'in_progress',
                "priority": 'high',
                "responsibleUsersId": [user_ids[2]],  # Ilay
                "participantsIds": [],
                "tagsId": [tag_ids[0], tag_ids[5]],  # Dev, High Priority
                "date": get_relative_date(0),
                "deadline": get_relative_date(1),
                "base": {"isDeleted": False, "isActive": True, "createdAt": get_relative_date(-1), "updatedAt": get_relative_date(0), "lut": get_relative_date(0), "entityType": "task"}
            },
            
            # === Multi-day tasks (for weekly calendar spanning) ===
            {
                "title": 'פיתוח מודול דוחות',
                "description": 'פיתוח מודול חדש להפקת דוחות PDF אוטומטיים.',
                "status": 'in_progress',
                "priority": 'medium',
                "responsibleUsersId": [user_ids[3]],  # Dan
                "participantsIds": [], 
                "tagsId": [tag_ids[0]],  # Dev
                "date": get_relative_date(-1),
                "deadline": get_relative_date(4),
                "base": {"isDeleted": False, "isActive": True, "createdAt": get_relative_date(-3), "updatedAt": get_relative_date(-1), "lut": get_relative_date(-1), "entityType": "task"}
            },
            {
                "title": 'עיצוב דף הבית החדש',
                "description": 'עיצוב מחדש של דף הבית עם חווית משתמש משופרת.',
                "status": 'in_progress',
                "priority": 'medium',
                "responsibleUsersId": [user_ids[7]],  # Adi
                "participantsIds": [],
                "tagsId": [tag_ids[1]],  # Design
                "date": get_relative_date(-2),
                "deadline": get_relative_date(3),
                "base": {"isDeleted": False, "isActive": True, "createdAt": get_relative_date(-5), "updatedAt": get_relative_date(-2), "lut": get_relative_date(-2), "entityType": "task"}
            },
            {
                "title": 'אינטגרציה עם API חיצוני',
                "description": 'חיבור למערכת תשלומים חיצונית.',
                "status": 'pending',
                "priority": 'high',
                "responsibleUsersId": [user_ids[2], user_ids[3]],  # Ilay, Dan
                "participantsIds": [contact_ids[1]], # Server Provider contact
                "tagsId": [tag_ids[0], tag_ids[3]],  # Dev, Servers
                "date": get_relative_date(1),
                "deadline": get_relative_date(5),
                "base": {"isDeleted": False, "isActive": True, "createdAt": get_relative_date(-1), "updatedAt": get_relative_date(-1), "lut": get_relative_date(-1), "entityType": "task"}
            },
            
            # === Tomorrow's tasks ===
            {
                "title": 'סקירת קוד - Sprint 12',
                "description": 'סקירת קוד של כל ה-PRים מהספרינט האחרון.',
                "status": 'pending',
                "priority": 'medium',
                "responsibleUsersId": [user_ids[4]],  # Orel
                "participantsIds": [], 
                "tagsId": [tag_ids[0], tag_ids[2]],  # Dev, Testing
                "date": get_relative_date(1),
                "deadline": get_relative_date(1),
                "base": {"isDeleted": False, "isActive": True, "createdAt": get_relative_date(0), "updatedAt": get_relative_date(0), "lut": get_relative_date(0), "entityType": "task"}
            },
            {
                "title": 'עדכון תיעוד API',
                "description": 'עדכון התיעוד הטכני לאחר השינויים האחרונים.',
                "status": 'pending',
                "priority": 'low',
                "responsibleUsersId": [user_ids[5]],  # Elia
                "participantsIds": [],
                "tagsId": [tag_ids[0]],  # Dev
                "date": get_relative_date(1),
                "deadline": get_relative_date(3),
                "base": {"isDeleted": False, "isActive": True, "createdAt": get_relative_date(0), "updatedAt": get_relative_date(0), "lut": get_relative_date(0), "entityType": "task"}
            },
            
            # === Later this week ===
            {
                "title": 'בדיקות אוטומטיות - E2E',
                "description": 'כתיבת טסטים אוטומטיים לתרחישי קצה חדשים.',
                "status": 'pending',
                "priority": 'medium',
                "responsibleUsersId": [user_ids[6]],  # Ori
                "participantsIds": [],
                "tagsId": [tag_ids[2]],  # Testing
                "date": get_relative_date(2),
                "deadline": get_relative_date(4),
                "base": {"isDeleted": False, "isActive": True, "createdAt": get_relative_date(0), "updatedAt": get_relative_date(0), "lut": get_relative_date(0), "entityType": "task"}
            },
            {
                "title": 'העברת מצגת לניהול',
                "description": 'מצגת סיכום רבעון למנהלים.',
                "status": 'pending',
                "priority": 'high',
                "responsibleUsersId": [user_ids[0]],  # Eden
                "participantsIds": [],
                "tagsId": [tag_ids[4]],  # Management
                "date": get_relative_date(3),
                "deadline": get_relative_date(3),
                "base": {"isDeleted": False, "isActive": True, "createdAt": get_relative_date(-2), "updatedAt": get_relative_date(-2), "lut": get_relative_date(-2), "entityType": "task"}
            },
            
            # === Completed tasks ===
            {
                "title": 'התקנת SSL בשרת Production',
                "description": 'חידוש והתקנת אישור SSL.',
                "status": 'completed',
                "priority": 'high',
                "responsibleUsersId": [user_ids[4]],  # Orel
                "participantsIds": [],
                "tagsId": [tag_ids[3]],  # Servers
                "date": get_relative_date(-3),
                "deadline": get_relative_date(-2),
                "base": {"isDeleted": False, "isActive": True, "createdAt": get_relative_date(-5), "updatedAt": get_relative_date(-2), "lut": get_relative_date(-2), "entityType": "task"}
            },
            {
                "title": 'תיקון בעיית ביצועים',
                "description": 'אופטימיזציה לשאילתות מסד נתונים איטיות.',
                "status": 'completed',
                "priority": 'high',
                "responsibleUsersId": [user_ids[3]],  # Dan
                "participantsIds": [],
                "tagsId": [tag_ids[0], tag_ids[3]],  # Dev, Servers
                "date": get_relative_date(-2),
                "deadline": get_relative_date(-1),
                "base": {"isDeleted": False, "isActive": True, "createdAt": get_relative_date(-4), "updatedAt": get_relative_date(-1), "lut": get_relative_date(-1), "entityType": "task"}
            },
            
            # === Next week tasks ===
            {
                "title": 'השקת גרסה 2.0',
                "description": 'השקה מלאה של הגרסה החדשה לייצור.',
                "status": 'pending',
                "priority": 'high',
                "responsibleUsersId": [user_ids[0], user_ids[1]],  # Eden, Maor
                "participantsIds": [],
                "tagsId": [tag_ids[0], tag_ids[3], tag_ids[4]],  # Dev, Servers, Management
                "date": get_relative_date(7),
                "deadline": get_relative_date(7),
                "base": {"isDeleted": False, "isActive": True, "createdAt": get_relative_date(-10), "updatedAt": get_relative_date(-5), "lut": get_relative_date(-5), "entityType": "task"}
            },
            {
                "title": 'הכנת סביבת Staging',
                "description": 'הקמת סביבת בדיקות חדשה לגרסה 2.0.',
                "status": 'pending',
                "priority": 'medium',
                "responsibleUsersId": [user_ids[4]],  # Orel
                "participantsIds": [contact_ids[1]], # Server Provider
                "tagsId": [tag_ids[3]],  # Servers
                "date": get_relative_date(5),
                "deadline": get_relative_date(6),
                "base": {"isDeleted": False, "isActive": True, "createdAt": get_relative_date(-3), "updatedAt": get_relative_date(-3), "lut": get_relative_date(-3), "entityType": "task"}
            },
            
            # === Long running task spanning entire week ===
            {
                "title": 'ספרינט 13 - פיצ׳רים חדשים',
                "description": 'ספרינט של שבועיים לפיתוח פיצ׳רים חדשים.',
                "status": 'in_progress',
                "priority": 'medium',
                "responsibleUsersId": [user_ids[0]],  # Eden (manager)
                "participantsIds": [],
                "tagsId": [tag_ids[0], tag_ids[4]],  # Dev, Management
                "date": get_relative_date(-3),
                "deadline": get_relative_date(11),
                "base": {"isDeleted": False, "isActive": True, "createdAt": get_relative_date(-4), "updatedAt": get_relative_date(-1), "lut": get_relative_date(-1), "entityType": "task"}
            },
        ]
        
        for t in tasks_data:
            t['_id'] = str(ObjectId())
            mongo.db.ents.insert_one(t)
            tid = t['_id']
            log_history('task', tid, 'CREATE', 'system', None, t, t)

        # 5. Chat Messages
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
                    "lut": get_timestamp_ms() - 100000,
                    "entityType": "chat_message"
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
                    "lut": get_timestamp_ms(),
                    "entityType": "chat_message"
                }
            }
        ]
        
        for msg in chat_data:
            msg['_id'] = str(ObjectId())
            mongo.db.ents.insert_one(msg)
            
        print("Database seeded successfully with sample data!")
        print(f"  - {len(users_data)} users")
        print(f"  - {len(tags_data)} tags")
        print(f"  - {len(contacts_data)} contacts")
        print(f"  - {len(tasks_data)} tasks")
        print(f"  - {len(chat_data)} chat messages")

def print_usage():
    print("Usage: python seed.py [options]")
    print("")
    print("Options:")
    print("  --clean    Clear all data without adding sample data")
    print("  --help     Show this help message")
    print("")
    print("Examples:")
    print("  python seed.py           # Clear and seed with sample data")
    print("  python seed.py --clean   # Clear all data only")

if __name__ == '__main__':
    if '--help' in sys.argv or '-h' in sys.argv:
        print_usage()
    elif '--clean' in sys.argv:
        seed(clean_only=True)
    else:
        seed(clean_only=False)
