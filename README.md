# Crown Emirates Safety Induction Web App

This repository contains the **Safety Induction Web Application** built for Crown Emirates. The app is designed to manage safety video training and assessments.

The following instructions are for the IT department to **set up, run, and test the web app locally** before deployment.

---

## 1. Requirements

Before starting, make sure the following are installed on your machine:

* [Node.js](https://nodejs.org/) (version 18 or higher recommended)
* [npm](https://www.npmjs.com/) (comes with Node.js)
* Git

---

## 2. Clone the Repository

```bash
git clone <repository-url>
cd <repository-folder>
```

---

## 3. Install Dependencies

Run the following command inside the project folder:

```bash
npm install
```

This will download and install all required packages.

---

## 4. Environment Variables (`.env` file)

The web app requires a **`.env` file** that contains important configuration values (e.g., database connection, authentication keys).

⚠️ **Do not attempt to run the application without this file**.

* For security reasons, the `.env` file is **not included** in this repository.
* Please request the `.env` file directly from the developer (Prithvi).
* The safest way to transfer it is through **encrypted email** or a **secure file-sharing platform approved by Crown Emirates IT policy** (e.g., SharePoint or a secure internal server).
* Once received, place the `.env` file in the **root folder** of the project (same folder as `package.json`).

---

## 5. Run the Application

Start the development server with:

```bash
npm run dev
```

This will start the application locally.

By default, it will run at:

```
http://localhost:3000
```

---

## 6. Testing the Application

1. Open `http://localhost:3000` in your browser.
2. Check if an employee has completed the Safety Induction within the last 6 months by entering their full name.
   <img width="1582" height="1031" alt="Screenshot 2025-08-19 at 4 45 41 PM" src="https://github.com/user-attachments/assets/7f5f4dc7-cb48-4351-a02c-86b2ef8c2601" />
3. Navigate through the safety video training sections.
   <img width="1582" height="1031" alt="Screenshot 2025-08-19 at 5 21 10 PM" src="https://github.com/user-attachments/assets/ffda8469-6893-4581-843a-d25dbc12765e" />
   1. Test Volume adjustment
      <img width="1582" height="1031" alt="Screenshot 2025-08-19 at 5 23 15 PM" src="https://github.com/user-attachments/assets/5025700f-116f-4ce2-a437-5629a314348f" />
   2. Test the Full Screen
      <img width="1470" height="920" alt="Screenshot 2025-08-19 at 5 24 38 PM" src="https://github.com/user-attachments/assets/d8421cc4-6e3c-44f2-957d-1c8fa9a5c381" />
4. Test the validations on the user form.
   <img width="1582" height="1031" alt="Screenshot 2025-08-19 at 5 28 03 PM" src="https://github.com/user-attachments/assets/709e0133-b421-400f-b7b6-0458b0c9cf5a" />
5. Complete an assessment to verify the user's understanding of Safety within Crown Emirates.
<img width="1582" height="1031" alt="Screenshot 2025-08-19 at 5 31 00 PM" src="https://github.com/user-attachments/assets/bad5176e-5917-4abb-ba6e-b5788e8e792d" />
6. View the results of the user's assessment.

---

## 7. Notes for Deployment

* This README only covers **local testing**.
* For deployment, Crown Emirates IT should decide on the hosting environment (on-premise or cloud).
* Please ensure security best practices are followed before making the app accessible on the internet.

---

## 8. Support

For the `.env` file or technical assistance, please contact the developer directly.

---

✅ This README is now **step-by-step, clear, and secure**.

Would you like me to also **write a separate README for the Admin Desktop App** later (so the safety manager knows how to install and use it), or should we keep this one only for the web app for now?
