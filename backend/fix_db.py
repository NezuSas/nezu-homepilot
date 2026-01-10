import sqlite3
import os

db_path = 'db.sqlite3'

if not os.path.exists(db_path):
    print(f"Database not found at {db_path}")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    # Run foreign key check
    print("Running PRAGMA foreign_key_check...")
    cursor.execute("PRAGMA foreign_key_check;")
    errors = cursor.fetchall()
    if not errors:
        print("No foreign key errors found.")
    else:
        print("Foreign key errors found:")
        for error in errors:
            # table, rowid, target, fkid
            print(f"Table: {error[0]}, RowID: {error[1]}, Target: {error[2]}, FK Index: {error[3]}")
            
            if error[0] == 'routines_routineaction':
                print(f"Deleting bad row {error[1]} from routines_routineaction...")
                cursor.execute(f"DELETE FROM routines_routineaction WHERE rowid = {error[1]}")
                conn.commit()
                print("Deleted.")

except Exception as e:
    print(f"Error: {e}")
finally:
    conn.close()
