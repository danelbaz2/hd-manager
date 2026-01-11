"""
Seed Military Hierarchy Data

Initializes the military_hierarchy collection with dummy data.
Run this script once to populate the database.

Usage:
    python seed_military_hierarchy.py
"""
from database import mongo
from app import app

# Dummy military hierarchy data
DUMMY_HIERARCHY = {
    # Pikud Merkaz (מרכז)
    "מרכז": {
        "name": "מרכז",
        "ugdot": {
            "98": {
                "name": "98",
                "hativot": {
                    "7": {
                        "name": "7",
                        "gdudim": {
                            "71": {"name": "71"},
                            "72": {"name": "72"},
                            "73": {"name": "73"},
                        }
                    },
                    "35": {
                        "name": "35",
                        "gdudim": {
                            "351": {"name": "351"},
                            "352": {"name": "352"},
                        }
                    }
                }
            },
            "162": {
                "name": "162",
                "hativot": {
                    "401": {
                        "name": "401",
                        "gdudim": {
                            "46": {"name": "46"},
                            "47": {"name": "47"},
                        }
                    }
                }
            }
        }
    },
    
    # Pikud Tzafon (צפון)
    "צפון": {
        "name": "צפון",
        "ugdot": {
            "91": {
                "name": "91",
                "hativot": {
                    "1": {
                        "name": "1",
                        "gdudim": {
                            "12": {"name": "12"},
                            "13": {"name": "13"},
                        }
                    },
                    "188": {
                        "name": "188",
                        "gdudim": {
                            "53": {"name": "53"},
                            "54": {"name": "54"},
                        }
                    }
                }
            },
            "36": {
                "name": "36",
                "hativot": {
                    "933": {
                        "name": "933",
                        "gdudim": {
                            "101": {"name": "101"},
                            "102": {"name": "102"},
                        }
                    }
                }
            }
        }
    },
    
    # Pikud Darom (דרום)
    "דרום": {
        "name": "דרום",
        "ugdot": {
            "80": {
                "name": "80",
                "hativot": {
                    "84": {
                        "name": "84",
                        "gdudim": {
                            "931": {"name": "931"},
                            "932": {"name": "932"},
                        }
                    }
                }
            }
        }
    }
}


def seed_military_hierarchy():
    """Seed the military hierarchy collection"""
    with app.app_context():
        print("🌱 Seeding military hierarchy...")
        
        # Check if already exists
        existing = mongo.db.military_hierarchy.find_one({})
        if existing:
            print("⚠️  Military hierarchy already exists. Skipping seed.")
            print("   To re-seed, delete the collection first.")
            return
        
        # Insert the hierarchy
        result = mongo.db.military_hierarchy.insert_one({
            "hierarchy": DUMMY_HIERARCHY
        })
        
        print(f"✅ Military hierarchy seeded successfully!")
        print(f"   Document ID: {result.inserted_id}")
        print(f"   Pikudim: {len(DUMMY_HIERARCHY)}")
        
        # Count total units
        total_ugdot = sum(len(p["ugdot"]) for p in DUMMY_HIERARCHY.values())
        total_hativot = sum(
            len(u["hativot"]) 
            for p in DUMMY_HIERARCHY.values() 
            for u in p["ugdot"].values()
        )
        total_gdudim = sum(
            len(h["gdudim"])
            for p in DUMMY_HIERARCHY.values()
            for u in p["ugdot"].values()
            for h in u["hativot"].values()
        )
        
        print(f"   Total Ugdot: {total_ugdot}")
        print(f"   Total Hativot: {total_hativot}")
        print(f"   Total Gdudim: {total_gdudim}")


if __name__ == "__main__":
    seed_military_hierarchy()
