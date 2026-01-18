"""
Seed Military Hierarchy Data

Initializes the military_hierarchy collection with IDF organizational data.
Run this script once to populate the database.

Usage:
    python seed_military_hierarchy.py

Based on the real IDF organizational structure:
- Pikud (פיקוד - Command) → Ugda (אוגדה - Division) → Hativa (חטיבה - Brigade) → Gdud (גדוד - Battalion)
"""
from database import mongo
from app import app

# =============================================================================
# IDF Military Hierarchy - Based on Real Structure
# =============================================================================
# Sources: IDF Official, Wikipedia, Jewish Virtual Library
#
# Legend:
#   - Numbers typically represent historical unit designations
#   - Named brigades (e.g., גולני, גבעתי) are elite infantry units
#   - Armored brigades typically use numbers (7, 188, 401, 460)
# =============================================================================

IDF_HIERARCHY = {
    # =========================================================================
    # פיקוד צפון - NORTHERN COMMAND
    # Responsible for Lebanon and Syria borders
    # =========================================================================
    "צפון": {
        "name": "צפון",
        "ugdot": {
            # -----------------------------------------------------------------
            # אוגדה 91 - Division 91 "Galilee" (עוצבת הגליל)
            # Territorial division, Lebanon border security
            # -----------------------------------------------------------------
            "91": {
                "name": "91",
                "hativot": {
                    # חטיבת גולני - Golani Brigade (חטיבה 1)
                    # One of the most decorated infantry brigades
                    # Brown berets, green tree emblem
                    "גולני": {
                        "name": "גולני",
                        "gdudim": {
                            "12": {"name": "12"},      # גדוד ברק (Barak)
                            "13": {"name": "13"},      # גדוד גדעון (Gideon)
                            "51": {"name": "51"},      # גדוד הבוקעים הראשון (First Breachers)
                        }
                    },
                    # חטיבה 300 - 300th Brigade (Regional)
                    "300": {
                        "name": "300",
                        "gdudim": {
                            "8208": {"name": "8208"},
                            "8209": {"name": "8209"},
                        }
                    },
                }
            },
            
            # -----------------------------------------------------------------
            # אוגדה 36 - Division 36 "Ga'ash" (עוצבת געש)
            # Regular armored division, one of the largest
            # -----------------------------------------------------------------
            "36": {
                "name": "36",
                "hativot": {
                    # חטיבה 188 - 188th Armored Brigade "Barak" (ברק)
                    # Merkava Mark IV tanks
                    "188": {
                        "name": "188",
                        "gdudim": {
                            "53": {"name": "53"},      # גדוד סוער
                            "71": {"name": "71"},
                            "74": {"name": "74"},
                        }
                    },
                    # חטיבה 7 - 7th Armored Brigade "Saar me-Golan" (סער מגולן)
                    # Oldest armored brigade, legendary status
                    "7": {
                        "name": "7",
                        "gdudim": {
                            "75": {"name": "75"},
                            "77": {"name": "77"},      # גדוד עז (Oz)
                            "82": {"name": "82"},
                        }
                    },
                    # חטיבה 1 - 1st Infantry Brigade (Territorial)
                    "1": {
                        "name": "1",
                        "gdudim": {
                            "15": {"name": "15"},
                            "17": {"name": "17"},
                        }
                    },
                }
            },
            
            # -----------------------------------------------------------------
            # אוגדה 210 - Division 210
            # UNIFIL coordination sector
            # -----------------------------------------------------------------
            "210": {
                "name": "210",
                "hativot": {
                    "810": {
                        "name": "810",
                        "gdudim": {
                            "8101": {"name": "8101"},
                            "8102": {"name": "8102"},
                        }
                    },
                }
            },
        }
    },
    
    # =========================================================================
    # פיקוד מרכז - CENTRAL COMMAND
    # Responsible for West Bank and Jerusalem
    # =========================================================================
    "מרכז": {
        "name": "מרכז",
        "ugdot": {
            # -----------------------------------------------------------------
            # אוגדה 98 - Division 98 "Ha-Esh" (עוצבת האש - Fire Division)
            # Elite paratrooper/commando division
            # -----------------------------------------------------------------
            "98": {
                "name": "98",
                "hativot": {
                    # חטיבת הצנחנים - Paratroopers Brigade (חטיבה 35)
                    # Red berets, elite airborne unit
                    # Battalion names after venomous snakes
                    "צנחנים": {
                        "name": "צנחנים",
                        "gdudim": {
                            "101": {"name": "101"},    # גדוד פתן (Peten - Cobra)
                            "202": {"name": "202"},    # גדוד צפע (Tzefa - Viper)
                            "890": {"name": "890"},    # גדוד אפעה (Efah - Echis)
                        }
                    },
                    # עוצבת עוז - Commando Brigade (חטיבה 89)
                    "עוז": {
                        "name": "עוז",
                        "gdudim": {
                            "212": {"name": "212"},    # סיירת מטכ"ל
                            "217": {"name": "217"},    # יחידת דובדבן
                            "621": {"name": "621"},    # יחידת אגוז
                        }
                    },
                }
            },
            
            # -----------------------------------------------------------------
            # אוגדת יהודה ושומרון - Judea and Samaria Division
            # Territorial division for West Bank
            # -----------------------------------------------------------------
            "יו\"ש": {
                "name": "יו\"ש",
                "hativot": {
                    # חטיבה מרחבית בנימין
                    "בנימין": {
                        "name": "בנימין",
                        "gdudim": {
                            "450": {"name": "450"},
                            "636": {"name": "636"},
                        }
                    },
                    # חטיבה מרחבית אפרים
                    "אפרים": {
                        "name": "אפרים",
                        "gdudim": {
                            "417": {"name": "417"},
                            "614": {"name": "614"},
                        }
                    },
                    # חטיבה מרחבית שומרון
                    "שומרון": {
                        "name": "שומרון",
                        "gdudim": {
                            "631": {"name": "631"},
                            "632": {"name": "632"},
                        }
                    },
                    # חטיבה מרחבית יהודה
                    "יהודה": {
                        "name": "יהודה",
                        "gdudim": {
                            "604": {"name": "604"},
                            "637": {"name": "637"},
                        }
                    },
                    # חטיבת כפיר - Kfir Brigade (חטיבה 900)
                    # Counter-terrorism, West Bank operations
                    "כפיר": {
                        "name": "כפיר",
                        "gdudim": {
                            "90": {"name": "90"},      # גדוד נצח
                            "92": {"name": "92"},      # גדוד שקד
                            "93": {"name": "93"},      # גדוד לביא
                            "94": {"name": "94"},      # גדוד חרוב
                            "97": {"name": "97"},      # גדוד נחשון
                        }
                    },
                }
            },
            
            # -----------------------------------------------------------------
            # אוגדה 877 - Division 877 (מית"ל)
            # Civil defense and home front coordination
            # -----------------------------------------------------------------
            "877": {
                "name": "877",
                "hativot": {
                    "877א": {
                        "name": "877א",
                        "gdudim": {
                            "8771": {"name": "8771"},
                        }
                    },
                }
            },
        }
    },
    
    # =========================================================================
    # פיקוד דרום - SOUTHERN COMMAND
    # Responsible for Gaza and Egypt borders
    # =========================================================================
    "דרום": {
        "name": "דרום",
        "ugdot": {
            # -----------------------------------------------------------------
            # אוגדה 143 - Division 143 "Firefox" (עוצבת שועלי האש)
            # Gaza Division, border security
            # -----------------------------------------------------------------
            "143": {
                "name": "143",
                "hativot": {
                    # חטיבת גבעתי - Givati Brigade (חטיבה 84)
                    # Purple berets, fox emblem
                    "גבעתי": {
                        "name": "גבעתי",
                        "gdudim": {
                            "424": {"name": "424"},    # גדוד שקד (Shaked - Almond)
                            "432": {"name": "432"},    # גדוד צבר (Tzabar - Cactus)
                            "435": {"name": "435"},    # גדוד רותם (Rotem - Broom)
                        }
                    },
                    # חטיבה מרחבית צפון עזה
                    "צפון עזה": {
                        "name": "צפון עזה",
                        "gdudim": {
                            "8111": {"name": "8111"},
                            "8112": {"name": "8112"},
                            "8113": {"name": "8113"},
                        }
                    },
                    # חטיבה מרחבית דרום עזה
                    "דרום עזה": {
                        "name": "דרום עזה",
                        "gdudim": {
                            "8114": {"name": "8114"},
                            "8115": {"name": "8115"},
                        }
                    },
                }
            },
            
            # -----------------------------------------------------------------
            # אוגדה 162 - Division 162 "Ha-Plada" (עוצבת הפלדה - Steel)
            # Armored division, Sinai/Gaza operations
            # -----------------------------------------------------------------
            "162": {
                "name": "162",
                "hativot": {
                    # חטיבה 401 - 401st Armored Brigade "Iron Tracks" (עקבות הברזל)
                    "401": {
                        "name": "401",
                        "gdudim": {
                            "46": {"name": "46"},
                            "52": {"name": "52"},
                            "195": {"name": "195"},
                        }
                    },
                    # חטיבה 460 - 460th Armored Brigade "Bnei Or" (בני אור - Sons of Light)
                    # Primary training formation for armor
                    "460": {
                        "name": "460",
                        "gdudim": {
                            "198": {"name": "198"},
                            "278": {"name": "278"},
                            "279": {"name": "279"},
                        }
                    },
                }
            },
            
            # -----------------------------------------------------------------
            # אוגדה 80 - Division 80 "Edom" (עוצבת אדום)
            # Territorial division, Arava/Negev/Eilat
            # -----------------------------------------------------------------
            "80": {
                "name": "80",
                "hativot": {
                    # חטיבה 12 - Regional Brigade
                    "12": {
                        "name": "12",
                        "gdudim": {
                            "512": {"name": "512"},
                            "513": {"name": "513"},
                        }
                    },
                    # חטיבה 10 - Armored Training
                    "10": {
                        "name": "10",
                        "gdudim": {
                            "264": {"name": "264"},
                            "265": {"name": "265"},
                        }
                    },
                }
            },
            
            # -----------------------------------------------------------------
            # אוגדה 252 - Division 252 "Sinai" (עוצבת סיני)
            # Reserve division, first permanent IDF division (1968)
            # -----------------------------------------------------------------
            "252": {
                "name": "252",
                "hativot": {
                    # חטיבה 14 - Armored Brigade
                    "14": {
                        "name": "14",
                        "gdudim": {
                            "79": {"name": "79"},
                            "100": {"name": "100"},
                            "184": {"name": "184"},
                        }
                    },
                    # חטיבה 274
                    "274": {
                        "name": "274",
                        "gdudim": {
                            "126": {"name": "126"},
                            "128": {"name": "128"},
                        }
                    },
                    # חטיבת הנח"ל - Nahal Brigade (חטיבה 933)
                    # Light green berets, pioneering/settlement history
                    "נח\"ל": {
                        "name": "נח\"ל",
                        "gdudim": {
                            "50": {"name": "50"},      # גדוד הראל
                            "931": {"name": "931"},
                            "932": {"name": "932"},
                            "934": {"name": "934"},
                        }
                    },
                }
            },
        }
    },
    
    # =========================================================================
    # פיקוד העורף - HOME FRONT COMMAND
    # Civil defense and emergency response
    # =========================================================================
    "עורף": {
        "name": "עורף",
        "ugdot": {
            # פיקוד העורף - Home Front Division
            "פע\"ר": {
                "name": "פע\"ר",
                "hativot": {
                    # מחוז מרכז
                    "מרכז": {
                        "name": "מרכז",
                        "gdudim": {
                            "5001": {"name": "5001"},
                            "5002": {"name": "5002"},
                        }
                    },
                    # מחוז צפון
                    "צפון": {
                        "name": "צפון",
                        "gdudim": {
                            "5003": {"name": "5003"},
                            "5004": {"name": "5004"},
                        }
                    },
                    # מחוז דרום
                    "דרום": {
                        "name": "דרום",
                        "gdudim": {
                            "5005": {"name": "5005"},
                            "5006": {"name": "5006"},
                        }
                    },
                }
            },
        }
    },
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
            "hierarchy": IDF_HIERARCHY
        })
        
        print(f"✅ Military hierarchy seeded successfully!")
        print(f"   Document ID: {result.inserted_id}")
        print(f"   Pikudim: {len(IDF_HIERARCHY)}")
        
        # Count total units
        total_ugdot = sum(len(p["ugdot"]) for p in IDF_HIERARCHY.values())
        total_hativot = sum(
            len(u["hativot"]) 
            for p in IDF_HIERARCHY.values() 
            for u in p["ugdot"].values()
        )
        total_gdudim = sum(
            len(h["gdudim"])
            for p in IDF_HIERARCHY.values()
            for u in p["ugdot"].values()
            for h in u["hativot"].values()
        )
        
        print(f"   Total Ugdot: {total_ugdot}")
        print(f"   Total Hativot: {total_hativot}")
        print(f"   Total Gdudim: {total_gdudim}")
        
        # Summary by Pikud
        print("\n   📊 Breakdown by Pikud:")
        for pikud_name, pikud_data in IDF_HIERARCHY.items():
            ugdot_count = len(pikud_data["ugdot"])
            hativot_count = sum(len(u["hativot"]) for u in pikud_data["ugdot"].values())
            gdudim_count = sum(
                len(h["gdudim"])
                for u in pikud_data["ugdot"].values()
                for h in u["hativot"].values()
            )
            print(f"      פיקוד {pikud_name}: {ugdot_count} אוגדות, {hativot_count} חטיבות, {gdudim_count} גדודים")


if __name__ == "__main__":
    seed_military_hierarchy()
