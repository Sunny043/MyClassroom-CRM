# 🔐 MyClassroom CRM - User Credentials

## 📋 Login Information

### 👑 **Administrator Account**
- **Username:** `admin`
- **Password:** `admin123`
- **Role:** Administrator
- **Full Name:** System Administrator
- **Email:** admin@myclassroom.com
- **Permissions:** Full system access, can manage all branches, students, and coordinators

---

## 👥 **Branch Coordinators**

### 1. 💻 **Computer Science Coordinator**
- **Username:** `csc_coord`
- **Password:** `csc123456`
- **Role:** Branch Coordinator
- **Full Name:** Robert Johnson
- **Email:** robert.johnson@myclassroom.com
- **Branch:** Computer Science (CSC)
- **Permissions:** Manage CSC branch students and sections only

### 2. 📊 **Data Science Coordinator**
- **Username:** `ds_coord`
- **Password:** `ds123456`
- **Role:** Branch Coordinator
- **Full Name:** Sarah Wilson
- **Email:** sarah.wilson@myclassroom.com
- **Branch:** Data Science (DS)
- **Permissions:** Manage DS branch students and sections only

### 3. 🤖 **Artificial Intelligence Coordinator**
- **Username:** `ai_coord`
- **Password:** `ai123456`
- **Role:** Branch Coordinator
- **Full Name:** Michael Chen
- **Email:** michael.chen@myclassroom.com
- **Branch:** Artificial Intelligence (AI)
- **Permissions:** Manage AI branch students and sections only

### 4. 🖥️ **Information Technology Coordinator**
- **Username:** `it_coord`
- **Password:** `it123456`
- **Role:** Branch Coordinator
- **Full Name:** Emily Rodriguez
- **Email:** emily.rodriguez@myclassroom.com
- **Branch:** Information Technology (IT)
- **Permissions:** Manage IT branch students and sections only

### 5. 🔒 **Cyber Security Coordinator**
- **Username:** `cyber_coord`
- **Password:** `cyber123456`
- **Role:** Branch Coordinator
- **Full Name:** Jennifer Kim
- **Email:** jennifer.kim@myclassroom.com
- **Branch:** Cyber Security (CS)
- **Permissions:** Manage Cyber Security branch students and sections only

### 6. ⚙️ **Software Engineering Coordinator**
- **Username:** `se_coord`
- **Password:** `se123456`
- **Role:** Branch Coordinator
- **Full Name:** James Thompson
- **Email:** james.thompson@myclassroom.com
- **Branch:** Software Engineering (SE)
- **Permissions:** Manage SE branch students and sections only

### 7. 📈 **Business Analytics Coordinator**
- **Username:** `ba_coord`
- **Password:** `ba123456`
- **Role:** Branch Coordinator
- **Full Name:** Amanda Davis
- **Email:** amanda.davis@myclassroom.com
- **Branch:** Business Analytics (BA)
- **Permissions:** Manage BA branch students and sections only

### 8. 📱 **Digital Marketing Coordinator**
- **Username:** `dm_coord`
- **Password:** `dm123456`
- **Role:** Branch Coordinator
- **Full Name:** Christopher Lee
- **Email:** christopher.lee@myclassroom.com
- **Branch:** Digital Marketing (DM)
- **Permissions:** Manage DM branch students and sections only

---

## 🏢 **Branch Information**

| Branch Code | Branch Name | HOD | Coordinator |
|-------------|-------------|-----|-------------|
| CSC | Computer Science | Dr. John Smith | Robert Johnson |
| DS | Data Science | Dr. Jane Doe | Sarah Wilson |
| AI | Artificial Intelligence | Dr. Alex Johnson | Michael Chen |
| IT | Information Technology | Dr. Maria Garcia | Emily Rodriguez |
| CS | Cyber Security | Dr. David Brown | Jennifer Kim |
| SE | Software Engineering | Dr. Lisa Anderson | James Thompson |
| BA | Business Analytics | Dr. Kevin White | Amanda Davis |
| DM | Digital Marketing | Dr. Rachel Green | Christopher Lee |

---

## 🔧 **Quick Login Guide**

### For Admin Testing:
1. Open the application at `http://localhost:3000`
2. Use username: `admin` and password: `admin123`
3. You'll have access to all features including branch management

### For Coordinator Testing:
1. Choose any coordinator from the list above
2. Login with their credentials
3. You'll only see options for your assigned branch
4. Test creating students in your branch only

### ✅ **All Logins Verified Working**
All coordinator accounts have been tested and verified to work correctly. If you encounter any login issues, run the fix script:

```bash
cd backend
node scripts/fixPasswords.js
```

---

## 🔄 **How to Reset/Recreate Users**

To recreate all users and branches with fresh data:

```bash
cd backend
node scripts/seedInitialData.js
```

This will:
- Create the admin user if it doesn't exist
- Create all 8 branches with their coordinators
- Set up default sections (A and B) for each branch
- Display all credentials in the console

---

## 🔐 **Security Notes**

⚠️ **Important:** These are demo credentials for development/testing purposes only.

**For Production:**
- Change all default passwords
- Use strong, unique passwords
- Implement password complexity requirements
- Add password expiration policies
- Enable two-factor authentication
- Use environment variables for sensitive data

---

## 📞 **Support**

For technical support or password resets, contact the system administrator.

**Last Updated:** June 27, 2025
