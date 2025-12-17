from app import app
from database import mongo
from datetime import datetime, timedelta
from utils.history import log_history
import sys
from bson.objectid import ObjectId
import bcrypt

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
        
        # If clean_only flag is set, exit after clearing
        if clean_only:
            print("Clean mode: Collections cleared, no sample data added.")
            return
        
        # 1. Users - with clean, light, modern color palette
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


        # Map for easy access: 0=Maor, 1=Ilay, 2=Dan, 3=Orel
        
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

        # 3. Contacts
        print("Seeding Contacts...")
        contacts_data = [
            { "fullName": 'תמיכה טכנית', "position": 'חיצוני', "department": "IT", "phoneNumber": '050-0000000', "tagsIds": [tag_ids[3]], "base": {"isDeleted": False, "isActive": True, "createdAt": get_relative_date(-30), "updatedAt": get_relative_date(-30), "lut": get_relative_date(-30), "entityType": "contact"}},
            { "fullName": 'ספק שרתים', "position": 'ספק', "department": "Infra", "phoneNumber": '052-1111111', "tagsIds": [tag_ids[3]], "base": {"isDeleted": False, "isActive": True, "createdAt": get_relative_date(-30), "updatedAt": get_relative_date(-30), "lut": get_relative_date(-30), "entityType": "contact"}},
        ]
        
        for c in contacts_data:
            c['_id'] = str(ObjectId())
            mongo.db.contacts.insert_one(c)
            cid = c['_id']
            log_history('contact', cid, 'CREATE', 'system', None, c, c)

        # 4. Tasks
        print("Seeding Tasks...")
        tasks_data = [
            {
                "title": 'בדיקת שרתים שבועית',
                "description": 'בדיקה מקיפה של שרתי ה-Production וה-Staging לוודא יציבות לאחר העדכון האחרון.',
                "status": 'in_progress',
                "responsibleUsersId": [user_ids[0]], # Maor
                "participantsIds": [user_ids[3], user_ids[2]], # Orel, Dan
                "tagsId": [tag_ids[3], tag_ids[5]], # Servers, High Priority
                "date": get_relative_date(0),
                "deadline": get_relative_date(2),
                "base": {
                    "isDeleted": False,
                    "isActive": True,
                    "createdAt": get_relative_date(-2),
                    "updatedAt": get_relative_date(0),
                    "lut": get_relative_date(0),
                    "entityType": "task"
                }
            },
            {
                "title": 'עדכון מסד נתונים',
                "description": 'הרצת סקריפטים של מיגרציה לטבלאות המשתמשים החדשות.',
                "status": 'open',
                "responsibleUsersId": [user_ids[1]], # Ilay
                "participantsIds": [user_ids[0]], # Maor
                "tagsId": [tag_ids[0]], # Dev
                "date": get_relative_date(0),
                "deadline": get_relative_date(1),
                "base": {
                    "isDeleted": False,
                    "isActive": True,
                    "createdAt": get_relative_date(-1),
                    "updatedAt": get_relative_date(-1),
                    "lut": get_relative_date(-1),
                    "entityType": "task"
                }
            },
            {
                "title": 'פגישת צוות',
                "description": 'סינכרון שבועי.',
                "status": 'open',
                "responsibleUsersId": [user_ids[0], user_ids[1]],
                "participantsIds": [],
                "tagsId": [tag_ids[4]], # Management
                "date": get_relative_date(0),
                "deadline": get_relative_date(0),
                "base": {
                    "isDeleted": False,
                    "isActive": True,
                    "createdAt": get_relative_date(-1),
                    "updatedAt": get_relative_date(-1),
                    "lut": get_relative_date(-1),
                    "entityType": "task"
                }
            }
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
