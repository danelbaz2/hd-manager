"""
Seed data for users entity.
"""

def get_users_data(load_profile_image_fn, create_base_fn):
    """Generate users seed data with profile images."""
    return [
        { "fullName": 'עדן טירם', "username": "eden", "passwordHash": "123456", "role": 'admin', "color": '#93C5FD', "profileImage": load_profile_image_fn("eden"), "nickname": "ראש צוות HD", "base": create_base_fn("user")},
        { "fullName": 'מאור נובחוב', "username": "maor", "passwordHash": "123456", "role": 'regular', "color": '#FDBA74', "profileImage": load_profile_image_fn("maor"), "nickname": "ג'ינג'י", "base": create_base_fn("user")},
        { "fullName": 'עילי אדמוני', "username": "ilay", "passwordHash": "123456", "role": 'admin', "color": '#86EFAC', "profileImage": load_profile_image_fn("ilay"), "nickname": "בחפיפה", "base": create_base_fn("user")},
        { "fullName": 'דן אלבז', "username": "dan", "passwordHash": "123456", "role": 'admin', "color": '#FCD34D', "profileImage": load_profile_image_fn("dan"), "nickname": "הצרפתי", "base": create_base_fn("user")},
        { "fullName": 'אוראל חסידיאן', "username": "orel", "passwordHash": "123456", "role": 'regular', "color": '#C4B5FD', "profileImage": load_profile_image_fn("orel"), "nickname": "רנ\"ג דסק", "base": create_base_fn("user")},
        { "fullName": 'אליה דנאל', "username": "eliya", "passwordHash": "123456", "role": 'regular', "color": '#FDA4AF', "profileImage": load_profile_image_fn("eliya"), "nickname": "משתמש", "base": create_base_fn("user")},
        { "fullName": 'אורי רוגוזיק', "username": "ori", "passwordHash": "123456", "role": 'regular', "color": '#FCD34D', "profileImage": load_profile_image_fn("ori"), "nickname": "נינג'ה", "base": create_base_fn("user")},
        { "fullName": 'עדי פליישמן', "username": "adi", "passwordHash": "123456", "role": 'regular', "color": '#F9A8D4', "profileImage": load_profile_image_fn("adi"), "nickname": "משתמש", "base": create_base_fn("user")},
        { "fullName": 'גל פרץ', "username": "gal", "passwordHash": "123456", "role": 'regular', "color": '#93C5FD', "profileImage": load_profile_image_fn("gal"), "nickname": "הסטודנט", "base": create_base_fn("user")},
    ]
