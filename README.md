# AI-Powered Customer Complaint Management System

An automated agentic customer complaint logging system designed for Quality Assurance. This application features a ChatGPT-style AI Copilot that automatically extracts details from raw text and uploaded documents, infers risk assessment metadata, suggests initial root cause actions, and allows conversational form adjustments in real-time.

---

## 🚀 Key Features

- **Unified AI Copilot**: Upload documents (PDF, DOCX, TXT, EML) or paste complaint text directly into a unified chat window.
- **Auto-Fill Extraction**: Instantly parses and populates complex intake forms.
- **AI Risk Assessment**: Automatically determines the **Severity of Risk** (Critical, Major, or Minor) in a single word, suggests **Preventive Action (CAPA)**, and compiles an **Executive Summary**.
- **Conversational Edits**: Correct form values by messaging the Copilot (e.g., *"change priority to High"*).
- **Duplicate Detection**: Prevents registering duplicate complaints by checking the product, batch, and complaint type.
- **Relational Storage**: Backed by PostgreSQL.

---

## 🛠️ Technology Stack

- **Backend**: Python, FastAPI, SQLAlchemy ORM, LangGraph, LangChain, Groq API (Llama 3.3 70B model)
- **Frontend**: React, Redux Toolkit, Vanilla CSS, Lucide icons
- **Database**: PostgreSQL

---

## 📋 Prerequisites

Ensure you have the following installed on your machine:
- Python 3.10+
- Node.js (v18+) and npm
- PostgreSQL database server running locally

---

## ⚙️ Detailed Installation Guide

Follow these step-by-step instructions to get the project running on your local machine.

### Step 1: Clone the Repository
First, clone the repository to your local machine and navigate into the project directory:
```bash
git clone https://github.com/megzz19/AIVOA.git
cd AIVOA
```

### Step 2: PostgreSQL Database Setup
The application requires a PostgreSQL database to store complaint records.
1. Ensure the PostgreSQL service is installed and running on your machine.
2. Open your preferred database client (e.g., pgAdmin, DBeaver) or use the command-line tool `psql`:
   ```bash
   psql -U postgres
   ```
3. Create a new database named `aivoa`:
   ```sql
   CREATE DATABASE aivoa;
   ```
4. Verify the database was created successfully, then exit. *(The backend will automatically create the necessary tables on startup).*

### Step 3: Backend Configuration & Setup
The backend is built with FastAPI and requires Python 3.10+.
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create a Python virtual environment to isolate project dependencies:
   ```bash
   # On Windows:
   python -m venv venv
   .\venv\Scripts\activate

   # On macOS/Linux:
   python3 -m venv venv
   source venv/bin/activate
   ```
3. Install the required Python packages:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file in the `backend` folder. You will need to add your Groq API key and your PostgreSQL connection string:
   ```env
   # Get your API key from: https://console.groq.com/keys
   GROQ_API_KEY=your_groq_api_key_here
   
   # Format: postgresql://<username>:<password>@<host>:<port>/<database_name>
   # Replace <username> and <password> with your PostgreSQL credentials.
   DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/aivoa
   ```
5. Start the FastAPI backend server:
   ```bash
   uvicorn main:app --reload
   ```
   *The backend will boot up at `http://localhost:8000`. You can view the interactive API documentation at `http://localhost:8000/docs`.*

### Step 4: Frontend Configuration & Setup
The frontend is a React SPA built with Vite.
1. Open a new terminal window (keep the backend running in the first one).
2. Navigate to the frontend directory from the project root:
   ```bash
   cd frontend
   ```
3. Install the necessary Node.js dependencies:
   ```bash
   npm install
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend will launch at `http://localhost:5173`.*

---

## 🧪 Testing the Application

1. Open your browser and navigate to `http://localhost:5173`.
2. Locate the sample complaint PDF generated inside the project at `backend/sample_complaint.pdf`.
3. Use the paperclip 📎 button in the Copilot chat to upload this PDF, or paste its text.
4. Watch the AI extract the data, populate the form, assess the risk severity, and suggest CAPA workflows.
