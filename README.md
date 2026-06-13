# Book a Doctor - Complete MERN Stack Application

"Book a Doctor" is a production-ready, feature-rich healthcare booking and management platform built using the MERN stack (MongoDB, Express, React, Node).

The project is structured in separate subfolders for the frontend (`client/`) and backend (`server/`).

---

## Technical Stack

* **Frontend**: React.js, Vite, Bootstrap 5, Axios, React Router v6, React Toastify
* **Backend**: Node.js, Express.js
* **Database**: MongoDB Atlas / Mongoose
* **Authentication**: JSON Web Token (JWT) & Bcrypt password hashing
* **File Uploads**: Multer & Cloudinary (with robust local disk storage fallback)
* **Email Dispatch**: Nodemailer (with console log notification fallback)
* **API Testing**: Custom Postman Collection JSON suite

---

## Directory Structure

```
Book_a_Doctor/
├── client/                   # Frontend React project
│   ├── package.json          # Frontend dependencies
│   ├── index.html            # Main HTML wrapper
│   ├── vite.config.js        # Vite configurations (Reverse Proxy for API calls)
│   └── src/                  # React source files (components, contexts, services, pages)
├── server/                   # Backend Express project
│   ├── package.json          # Backend dependencies
│   ├── server.js             # Main server entrypoint
│   ├── .env                  # Environment config template
│   ├── config/               # db.js Mongoose database link
│   ├── models/               # MongoDB Schemas (User, Doctor, Appointment, Report)
│   ├── controllers/          # Business logic controllers
│   ├── routes/               # Express path routers
│   ├── middlewares/          # Role check guards
│   ├── utils/                # Service helpers (Cloudinary & sendEmail)
│   └── scripts/              # Database seed script
├── postman_collection.json   # API suite collection
└── README.md                 # Project operations guide
```

---

## Installation & Setup

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) (v16.0.0 or higher) and [MongoDB](https://www.mongodb.com/try/download/community) installed locally or a MongoDB Atlas connection URI.

### 1. Database and Backend Configuration

1. Open your terminal and navigate to the backend folder:
   ```bash
   cd server
   ```
2. Install server-side dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in `server/.env`:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/book_a_doctor
   JWT_SECRET=supersecretjwtkey12345!@#

   # Optional Cloudinary (Uploads fallback to local disk storage if empty)
   CLOUDINARY_CLOUD_NAME=
   CLOUDINARY_API_KEY=
   CLOUDINARY_API_SECRET=

   # Optional Nodemailer (Emails fall back to printing on server console if empty)
   SMTP_HOST=smtp.mailtrap.io
   SMTP_PORT=2525
   SMTP_USER=
   SMTP_PASS=
   SMTP_FROM=noreply@bookadoctor.com
   ```

### 2. Seeding the Database

We have provided a database seeding script to populate users, doctors, appointments, and report records immediately so you can test all roles:
* **Admin Account**: `admin@doctor.com`
* **Patient Accounts**: `john@patient.com`, `jane@patient.com`
* **Approved Doctor**: `sarah@doctor.com`
* **Pending Approval Doctor**: `emily@doctor.com`
* **Shared Seed Password**: `Password123`

Inside the `server/` folder, run:
```bash
npm run seed
```

### 3. Start Backend Server

Run this command inside the `server/` folder to launch the server in watch mode:
```bash
npm run dev
```
The server will boot on `http://localhost:5000`.

---

### 4. Frontend Configuration & Execution

1. Open a new terminal and navigate to the client folder:
   ```bash
   cd client
   ```
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Launch the Vite dev server:
   ```bash
   npm run dev
   ```
The frontend will start on `http://localhost:5173`. Open this URL in your browser.

---

## API Testing

1. Open Postman.
2. Import the `postman_collection.json` file found in the root directory.
3. Configure an environment variable `base_url` pointing to `http://localhost:5000/api`.
4. Run requests under the Auth, Doctors, and Admin folders.
