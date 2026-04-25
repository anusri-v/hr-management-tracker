Login flow: 
* Google login page
* If the user is new: 
    * The user gets created
    * The user should see the Request access page. 
    * On clicking the request access page, a mail should be sent to hr@shopup.org
    * Until the request is approved, nothing else can be done by the user
* There should be a page to access the requested access to the users

Employee Addition flow: 
* Add Employee button from the list page
* Each part should be saved separately. 
* Part I: Basic Information
    - Employee ID
    - Full Name
    - Gender
    - Date of Birth
    - Contact Number
    - Email ID
    - Address

* Part II: Employment Details
    - Department
    - Designation
    - Reporting Manager
    - Employment Type (Full-time/Intern/Contract)
    - Date of Joining (DOJ)
    - Work Location
    - Employee Status (Active/Inactive)

* Part III: Recruitment Details
    - Source of Hire (Referral/Campus/Consultant)
    - Interview Date-optional
    - Interview Panel- optional
    - Offer Letter Date

* Part IV: Compensation Details
    - Salary/CTC
    - Bank Name
    - Account Number
    - IFSC Code

* Part V: Statutory Details
    - PAN Number
    - Aadhaar Number
    - PF Number/UAN

* Part VI: Onboarding & Documents
    - Documents Submitted (Yes/No)
    - Offer Letter / Appointment Letter Status
    - Upload documents: 
        - Offer letter
        - Signed offer letter
        - Aadhar card
        - PAN card
        - Bank passbook
        - Passport
        - Photo
        - DL
        - Other documents

Employee list flow: 
* List should show: Employee ID, name, department, designation 
* Filter by employee id and name. Sort by date of joining (by default sort by id desc), designation
* On clicking the name, it should go to view page
* In view page, Edit button should be present, which should open the page similar to the add employee page. 
* Should be an option in view page to mark the employee status as resignation.
    * Exit Details
        - Last Working Day
        - Exit Reason
        - Full & Final Settlement Status
        - no due form and exit interview documents

Users panel: 
* Should be able to see who are all the users who have access to this panel
* Should be able to remove access to any user

Email: 
* Should send mail to hr on the employee's last day
* For new employees, 3 months from the date of joining, a mail should be sent to HR that it has been three months since the employee joined the organization
* On first of the month, a mail should be sent to HR listing all the employees who will be celebrating their birthdays that particular month. 
* On the mrng of the day, a mail should be sent if there are any employees are celebrating their birthdays that day.
* When a new user is requesting access to the panel, a mail should be sent

Should be able to see all these reminders in the panel as well. 

Misc: 
* Should keep track of all the major changes done: 
    * Who added employees
    * Who edited employees and what was edited
    * Who gave access to who and who revoked access to who