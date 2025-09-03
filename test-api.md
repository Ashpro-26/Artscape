# API Testing Guide

## Backend Server
- Running on: http://localhost:5000
- MongoDB: Connected successfully

## Frontend Server  
- Running on: http://localhost:3000
- React app with authentication forms

## Test API Endpoints

### 1. Test Registration
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testartist",
    "email": "test@example.com", 
    "password": "password123",
    "bio": "I am a digital artist"
  }'
```

### 2. Test Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 3. Test Root Endpoint
```bash
curl http://localhost:5000/
```

## Frontend Testing

1. Open http://localhost:3000 in your browser
2. You should be redirected to the login page
3. Click "Register here" to test registration
4. Fill out the form and submit
5. You should be redirected to the dashboard
6. Test logout functionality

## Expected Results

- Registration should create a new user and return a JWT token
- Login should authenticate and return a JWT token  
- Frontend should store the token and redirect to dashboard
- Dashboard should display user information
- Logout should clear localStorage and redirect to login 

---

## **Step 1: Keep Your Backend Server Running**
- Open a terminal window and run:
  ```sh
  cd server
  npm start
  ```
- **Leave this window open** so you can see any error messages when you try to register or log in.

---

## **Step 2: Open a New Terminal for Testing**
- Open a second terminal window.
- Use this window to run test commands (curl) or to start/stop your frontend.

---

## **Step 3: Register a New User via API**
In the new terminal, run:
```sh
curl -X POST http://localhost:5000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"testuser1\",\"email\":\"testuser1@example.com\",\"password\":\"password123\",\"bio\":\"Test artist bio\"}"
```
- If you’re on PowerShell, use `^` for line breaks, or put the whole command on one line.

---

## **Step 4: Log In with the New User**
```sh
curl -X POST http://localhost:5000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"testuser1@example.com\",\"password\":\"password123\"}"
```

---

## **Step 5: Watch the Backend Terminal**
- As you run these commands, **watch the backend terminal** for any error messages or stack traces.
- If you see any errors, **copy and paste them here**.

---

## **Step 6: Try the Frontend Again**
- Go to [http://localhost:3000](http://localhost:3000)
- Try registering and logging in with the new user.
- If you get an error, check the backend terminal for details and share them here.

---

**Please follow these steps and let me know:**
- The output of the curl commands (success or error)
- Any error messages in your backend terminal

This will help me pinpoint and fix the issue for you! 