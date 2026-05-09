# 📚 Smart Library Management System

![Live Status](https://img.shields.io/badge/Status-Live-success)
![Version](https://img.shields.io/badge/Version-1.0-blue)

A full-stack, cloud-deployed Library Management System built with the MERN stack. This application digitizes library operations, featuring role-based access control, real-time inventory tracking, and an automated borrowing/fining system.

**Live Demo:** [Click here to view the live application](https://smart-library-frontend-eta.vercel.app) *(Note: Add your actual Vercel link here if it's different)*

---

## ✨ Key Features

* **Role-Based Access Control (RBAC):** * **Public/Members:** Can browse the catalog, view book availability, and search/filter inventory.
  * **Librarians/Admins:** Secured behind JWT authentication. Admins can process book lending, manage returns, and view system-wide transaction history.
* **Automated Fine System:** Dynamically calculates late fees in Rupees (Rs.) upon book return based on the elapsed time past the due date. The return date is strictly locked to the system's current date to prevent manipulation.
* **Dynamic Inventory Tracking:** Automatically tracks "Available Copies". Prevents lending when a book reaches 0 copies and updates the UI to show "Out of Stock".
* **Advanced Search & Pagination:** Frontend logic to filter books by Title, Author, or Genre, complete with dynamic pagination (8 books per page) for optimal performance.
* **Security:** Implements protected React routes to restrict unauthorized access to administrative pages, kicking unauthenticated users back to the login screen.

---

## 🛠️ Technology Stack

**Frontend:**
* React.js (built with Vite)
* React Router DOM (Navigation & Protected Routes)
* Axios (API Communication)
* Deployed on **Vercel** (with CI/CD)

**Backend:**
* Node.js & Express.js (RESTful API)
* MongoDB Atlas (Cloud Database)
* Mongoose (Data Modeling)
* JSON Web Tokens (JWT Authentication)
* Deployed on **Render**

---

## 🚀 Local Installation & Setup

If you wish to run this project locally on your machine, follow these steps:

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/your-username/Smart-Library-Management-System.git](https://github.com/your-username/Smart-Library-Management-System.git)
   cd Smart-Library-Management-System
