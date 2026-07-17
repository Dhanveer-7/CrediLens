import os

main_path = r"c:\Users\Dhanveer\OneDrive\Desktop\CrediLens\backend\main.py"

if os.path.exists(main_path):
    with open(main_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replace the direct find_one collection call with our wrapped helper
    old_line = 'raw_user = database.users_col.find_one({"email": login_data.email.lower()})'
    new_line = 'raw_user = database.get_raw_user_for_login(login_data.email)'

    content = content.replace(old_line, new_line)

    with open(main_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("SUCCESS: Updated main.py to use get_raw_user_for_login helper.")
else:
    print("Error: main.py not found.")
