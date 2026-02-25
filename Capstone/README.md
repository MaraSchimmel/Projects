# Capstone_Repo

Run Instructions (as of 4/29/25):
1. Copy `config.example.js`
2. Rename it to `config.js`
3. Fill in your Firebase project credentials
4. Make sure you are in Capstone_Repo directory
5. Right-click index.html
6. Run index.html using VSCode Live Server extension by Ritwick Dey

## Firebase Structure
A diagram of this structure is available on page 10 of the attached project documentation.
- Firestore
    - Faculty
        - Rxxxxxxxx (Faculty R number, each faculty with a student that has uploaded data has a section like this under Faculty)
            - Students
                - Rxxxxxxxx (student R number, each student has an rNumber under Students if they uploaded data)
                    
                    Contains all uploaded data for a specified student

            - facultyName (name of the faculty, used for populating the student select list for admin)
            - students
            - Rxxxxxxxx (student R number)
                - adminApproved (an array that contains the list of admins that approved)
                - adminDenied (an array that contains the list of admins that denied)
                - name (the name of the student, used for populating student select lists)
                - status
    - FacultyInformation
        - Rnumbers
            - Faculty (must be filled with all faculty R numbers registered)
            - FacultyRegistered (contains all faculty who created an account to prevent duplicate faculty accounts)
            - Student (contains all registered students to prevent duplicates)
        - jdoe@rollins.edu (contains relevant data for each faculty based on emails. Each faculty member has their own section/doc for their respective email)
            - rNumber (used for confirming faculty R numbers are valid for faculty sign up)
            - name (used for registering faculty name when linking to a student)
    - ID collection
        - User UID (every account as a unique UID, allowing quick access)
            - accountType (indictates if a user is a student, faculty, or admin, admins must have their accountType manually changed)
            - facultyEmail (shows the email of a student's registered faculty member)
            - facultyName (shows the name of a student's registered faculty member)
            - facultyRNumber (shows the rNumber of a student's registered faculty member)
            - name (name of a user)
            - rNumber (r number of a user)
    - Rules
        - Currently, you must be logged in to write to a file
        - The system can read the FacultyInformation data without being logged in, in order to check if an rNumber is used already or to compare faculty emails. The user does not see this raw data.
- Authentication
    - Rules
        - All new emails cannot have been previously used in an existing account
        - New passwords must be 8 characters or longer, contain a lowercase, uppercase, number, and special character
- Storage
    - Rxxxxxxxx (student R number)

        Contains all files uploaded for a specific student
    - Rules

        You must be logged in to read or write any files uploaded

## Current system notes
Currently, applications are approved or denied by checking how many admins are required to change the status (numAdminsRequired in form.js) and comparing that to the number of admins who approved or denied the application. To change the number of admins required to approve or deny in the future, you can modify how numAdminsRequired is calculated based on numAdmins, which is a fixed value at this time. 

The original AI Chat Bot is no longer active and was removed