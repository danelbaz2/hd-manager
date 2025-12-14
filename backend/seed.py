from app import app
from database import mongo
from datetime import datetime, timedelta
from utils.history import log_history
import random
from bson.objectid import ObjectId

def get_relative_date(diff_days):
    return (datetime.now() + timedelta(days=diff_days)).strftime('%Y-%m-%d')

def get_timestamp_ms():
    return int(datetime.now().timestamp() * 1000)

def seed():
    with app.app_context():
        # Clear existing data
        print("Clearing database...")
        mongo.db.users.delete_many({})
        mongo.db.tags.delete_many({})
        mongo.db.system_contacts.delete_many({})
        mongo.db.missions.delete_many({})
        mongo.db.history_entries.delete_many({})
        mongo.db.chat_messages.delete_many({})
        
        # 1. Users
        print("Seeding Users...")
        users_data = [
            { "fullName": 'מאור', "username": "maor", "passwordHash": "hash123", "role": 'admin', "iconColor": 'bg-blue-100 text-blue-600', "createdAt": get_relative_date(-30), "isActive": True, "isDeleted": False },
            { "fullName": 'עילי', "username": "ilay", "passwordHash": "hash123", "role": 'regular', "iconColor": 'bg-indigo-100 text-indigo-600', "createdAt": get_relative_date(-30), "isActive": True, "isDeleted": False },
            { "fullName": 'דן', "username": "dan", "passwordHash": "hash123", "role": 'regular', "iconColor": 'bg-cyan-100 text-cyan-600', "createdAt": get_relative_date(-30), "isActive": True, "isDeleted": False },
            { "fullName": 'אוראל', "username": "orel", "passwordHash": "hash123", "role": 'regular', "iconColor": 'bg-rose-100 text-rose-600', "createdAt": get_relative_date(-30), "isActive": True, "isDeleted": False },
        ]
        
        user_ids = []
        for u in users_data:
            u['_id'] = str(ObjectId())
            mongo.db.users.insert_one(u)
            uid = u['_id']
            user_ids.append(uid)
            # Log Create History
            log_history('user', uid, 'CREATE', None, u, u)

        # Map for easy access: 0=Maor, 1=Ilay, 2=Dan, 3=Orel
        
        # 2. Tags
        print("Seeding Tags...")
        tags_data = [
            { "name": 'פיתוח', "description": "קשור לפיתוח תוכנה", "color": 'bg-blue-100 text-blue-700 border-blue-200', "createdAt": get_relative_date(-10), "isActive": True, "isDeleted": False },
            { "name": 'עיצוב', "description": "קשור ל-UI/UX", "color": 'bg-purple-100 text-purple-700 border-purple-200', "createdAt": get_relative_date(-10), "isActive": True, "isDeleted": False },
            { "name": 'בדיקות', "description": "QA וטסטים", "color": 'bg-orange-100 text-orange-700 border-orange-200', "createdAt": get_relative_date(-10), "isActive": True, "isDeleted": False },
            { "name": 'שרתים', "description": "DevOps ותשתיות", "color": 'bg-slate-100 text-slate-700 border-slate-200', "createdAt": get_relative_date(-10), "isActive": True, "isDeleted": False },
            { "name": 'ניהול', "description": "ניהול פרויקטים", "color": 'bg-emerald-100 text-emerald-700 border-emerald-200', "createdAt": get_relative_date(-10), "isActive": True, "isDeleted": False },
            { "name": 'דחיפות גבוהה', "description": "לטפל מיד", "color": 'bg-red-100 text-red-700 border-red-200', "createdAt": get_relative_date(-10), "isActive": True, "isDeleted": False },
        ]
        
        tag_ids = []
        for t in tags_data:
            t['_id'] = str(ObjectId())
            mongo.db.tags.insert_one(t)
            tid = t['_id']
            tag_ids.append(tid)
            log_history('tag', tid, 'CREATE', None, t, t)

        # 3. System Contacts
        print("Seeding Contacts...")
        contacts_data = [
            { "fullName": 'תמיכה טכנית', "position": 'חיצוני', "department": "IT", "phoneNumber": '050-0000000', "email": 'support@example.com', "tagsIds": [tag_ids[3]], "createdAt": get_relative_date(-30), "isActive": True, "isDeleted": False },
            { "fullName": 'ספק שרתים', "position": 'ספק', "department": "Infra", "phoneNumber": '052-1111111', "email": 'cloud@example.com', "tagsIds": [tag_ids[3]], "createdAt": get_relative_date(-30), "isActive": True, "isDeleted": False },
        ]
        
        for c in contacts_data:
            c['_id'] = str(ObjectId())
            mongo.db.system_contacts.insert_one(c)
            cid = c['_id']
            log_history('system_contact', cid, 'CREATE', None, c, c)

        # 4. Missions
        print("Seeding Missions...")
        missions_data = [
            {
                "title": 'בדיקת שרתים שבועית',
                "description": 'בדיקה מקיפה של שרתי ה-Production וה-Staging לוודא יציבות לאחר העדכון האחרון.',
                "status": 'in_progress',
                "responsibleUsersId": [user_ids[0]], # Maor
                "participantsIds": [user_ids[3], user_ids[2]], # Orel, Dan
                "tagId": tag_ids[3], # Servers
                "date": get_relative_date(0),
                "deadline": get_relative_date(2),
                "createdAt": get_relative_date(-2),
                "updatedAt": get_relative_date(0),
                "priority": 'high',
                "isDeleted": False
            },
            {
                "title": 'עדכון מסד נתונים',
                "description": 'הרצת סקריפטים של מיגרציה לטבלאות המשתמשים החדשות.',
                "status": 'open',
                "responsibleUsersId": [user_ids[1]], # Ilay
                "participantsIds": [user_ids[0]], # Maor
                "tagId": tag_ids[0], # Dev
                "date": get_relative_date(0),
                "deadline": get_relative_date(1),
                "createdAt": get_relative_date(-1),
                "updatedAt": get_relative_date(-1),
                "priority": 'medium',
                "isDeleted": False
            },
            {
                "title": 'פגישת צוות',
                "description": 'סינכרון שבועי.',
                "status": 'open',
                "responsibleUsersId": [user_ids[0], user_ids[1]],
                "participantsIds": [],
                "tagId": tag_ids[4], # Management
                "date": get_relative_date(0),
                "deadline": get_relative_date(0),
                "createdAt": get_relative_date(-1),
                "updatedAt": get_relative_date(-1),
                "priority": 'low',
                "isDeleted": False
            }
        ]
        
        for m in missions_data:
            m['_id'] = str(ObjectId())
            mongo.db.missions.insert_one(m)
            mid = m['_id']
            log_history('mission', mid, 'CREATE', None, m, m)

        # 5. Chat Messages
        print("Seeding Chat...")
        chat_data = [
            {
                "senderUserId": user_ids[0],
                "message": "בוקר טוב לכולם!",
                "createdAt": get_timestamp_ms() - 100000,
                "isDeleted": False
            },
            {
                "senderUserId": user_ids[1],
                "message": "בוקר אור, מה המצב?",
                "createdAt": get_timestamp_ms(),
                "isDeleted": False
            }
        ]
        
        for msg in chat_data:
            msg['_id'] = str(ObjectId())
            mongo.db.chat_messages.insert_one(msg)
            
        print("Database seeded successfully with updated Schema and IDs!")

if __name__ == '__main__':
    seed()
