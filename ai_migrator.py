import os
import shutil
import sys

# === CONFIG ===
OLD_PATH = "D:\ai-cohost-free"
NEW_PATH = "D:\ai-cohost-free\ai-cohost-fixed"

def migrate_and_remove_old():
    print(f"[INFO] Migrating from {D:\ai-cohost-free} → {NEW_PATH}")
    
    if not os.path.exists(OLD_PATH):
        print(f"[ERROR] Old path does not exist: {"D:\ai-cohost-free}")
        sys.exit(1)
    
    if not os.path.exists(NEW_PATH):
        os.makedirs(NEW_PATH)
        print(f"[INFO] Created new root folder: {NEW_PATH}")

    # Walk old folder structure
    for root, dirs, files in os.walk("D:\ai-cohost-free"):
        for dir_name in dirs:
            old_dir = os.path.join(root, dir_name)
            new_dir = os.path.join(NEW_PATH, os.path.relpath(old_dir, OLD_PATH))
            if not os.path.exists(new_dir):
                os.makedirs(new_dir)
                print(f"[DIR] Created folder: {new_dir}")

        for file_name in files:
            old_file = os.path.join(root, file_name)
            new_file = os.path.join(NEW_PATH, os.path.relpath(old_file, OLD_PATH))
            
            if not os.path.exists(new_file):
                shutil.move(old_file, new_file)
                print(f"[FILE] Moved: {new_file}")
            else:
                print(f"[SKIP] Already exists in new structure: {new_file}")

    # After all files and folders are moved, delete the old root folder
    try:
        shutil.rmtree(OLD_PATH)
        print(f"[SUCCESS] Old folder '{OLD_PATH}' deleted successfully!")
    except Exception as e:
        print(f"[ERROR] Could not delete old folder: {e}")

    print("[SUCCESS] Migration and cleanup completed!")

if __name__ == "__main__":
    migrate_and_remove_old()
