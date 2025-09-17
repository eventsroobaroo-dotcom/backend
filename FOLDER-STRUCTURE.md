# 📁 PROJECT FOLDER STRUCTURE

## Create this exact folder structure:

```
roobaroo-backend/                    # ← Create this main folder
├── models/                          # ← Create this folder
│   └── Registration.js              # ← Copy from: models-Registration.js
├── routes/                          # ← Create this folder
│   └── register.js                  # ← Copy from: routes-register.js
├── package.json                     # ← Copy from: package.json
├── server.js                        # ← Copy from: server.js
├── .env                             # ← Copy from: env-example.md (rename)
├── .gitignore                       # ← Copy from: gitignore.md (rename)
└── README.md                        # ← Copy from: README-COMPLETE.md
```

## 🔧 File Renaming Instructions:

1. `models-Registration.js` → `models/Registration.js`
2. `routes-register.js` → `routes/register.js`
3. `env-example.md` → `.env` (and fill in your values)
4. `gitignore.md` → `.gitignore`
5. `README-COMPLETE.md` → `README.md`

## 📱 Frontend Files (add to your existing website):

```
your-website-folder/                 # ← Your existing website
├── index.html                       # ← Your existing file
├── style.css                        # ← Add mobile-fixes.css to the END
├── app.js                           # ← Update with frontend-integration-mongodb.js
└── ... (your other files)
```

## 🚀 Quick Setup Commands:

```bash
# 1. Create and navigate to folder
mkdir roobaroo-backend
cd roobaroo-backend

# 2. Create subfolders
mkdir models routes

# 3. Initialize npm project
npm init -y

# 4. Install dependencies
npm install express cors mongoose dotenv helmet express-rate-limit

# 5. Install dev dependencies
npm install --save-dev nodemon

# 6. Copy all the files I provided into the correct locations
# 7. Edit .env with your MongoDB connection string
# 8. Test locally: npm start
```

## ✅ Verification Checklist:

After setting up, you should have:
- [ ] 📁 `models/` folder with `Registration.js`
- [ ] 📁 `routes/` folder with `register.js`  
- [ ] 📄 `package.json` with all dependencies
- [ ] 📄 `server.js` as main server file
- [ ] 📄 `.env` with your MongoDB connection string
- [ ] 📄 `.gitignore` to keep secrets safe
- [ ] 🚀 `npm start` works without errors
- [ ] 🌐 http://localhost:5000/api/health returns OK

## 🎯 What Each Folder Does:

**📁 models/** 
- Contains database schemas (blueprints for your data)
- `Registration.js` defines how registration data is structured

**📁 routes/**  
- Contains API endpoints (the URLs people can access)
- `register.js` handles all registration-related requests

**📄 Root Files:**
- `server.js` - Starts your backend server
- `package.json` - Lists all dependencies 
- `.env` - Contains secret information (MongoDB password, etc.)
- `.gitignore` - Tells git what files to ignore

## 🔐 Important Security Notes:

1. **Never commit `.env` to git** - It contains your database password
2. **The `.gitignore` file prevents this** - Always include it
3. **Keep your MongoDB connection string secret** - Don't share it publicly
4. **Use environment variables on deployment platforms** - Not hardcoded values

## 🎉 Ready to Deploy!

Once you have this structure set up:
1. Test locally: `npm start`
2. Push to GitHub (`.env` will be ignored)
3. Deploy on Render.com for FREE
4. Add environment variables in Render dashboard
5. Get your live backend URL
6. Update your frontend to use the live URL

**You'll have a professional registration system running in under an hour! 🚀**