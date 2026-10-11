# SmartNotes AI - Backend Server

A lightweight, secure Node.js & Express backend for SmartNotes AI integrating Google's official `@google/genai` SDK.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- A Google Gemini API Key from [Google AI Studio](https://aistudio.google.com/)

---

## Setup & Configuration

1. **Navigate to the server directory**:
   ```bash
   cd server
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Copy `.env.example` to create your private `.env` file:
   ```bash
   # Windows (PowerShell)
   Copy-Item .env.example .env

   # macOS / Linux
   cp .env.example .env
   ```

4. **Add your Gemini API key**:
   Open `.env` in your editor and set your key:
   ```env
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   PORT=3001
   FRONTEND_URL=http://localhost:5173
   GEMINI_MODEL=gemini-2.5-flash
   ```

> **Security Note**: Never commit `.env` or share your API key. The root `.gitignore` is configured to keep `.env` out of version control.

---

## Running the Server

* **Start in development mode** (auto-reloads on file changes):
  ```bash
  npm run dev
  ```

* **Start in production mode**:
  ```bash
  npm start
  ```

The server will run at `http://localhost:3001`.

---

## API Endpoints

### 1. Health Check
* **Endpoint:** `GET /api/health`
* **Description:** Verifies that the server is alive without revealing any secrets or credentials.
* **Test via cURL / PowerShell**:
  ```powershell
  # PowerShell
  Invoke-RestMethod -Uri http://localhost:3001/api/health -Method GET

  # cURL
  curl http://localhost:3001/api/health
  ```
* **Expected Response:**
  ```json
  {
    "status": "ok",
    "uptime": 12,
    "timestamp": "2026-10-11T09:00:00.000Z"
  }
  ```

### 2. AI Generation
* **Endpoint:** `POST /api/generate`
* **Headers:** `Content-Type: application/json`
* **Supported Actions:** `summarize`, `keyPoints`, `improveWriting`
* **Request Body Example:**
  ```json
  {
    "text": "Machine learning enables computers to learn from data patterns...",
    "action": "summarize"
  }
  ```
* **Success Response:**
  ```json
  {
    "result": "Machine learning allows systems to identify patterns and make decisions from data."
  }
  ```

---

## Deploying to Render

1. Connect your repository to [Render](https://render.com/) and create a new **Web Service**.
2. Configure settings:
   - **Root Directory:** `server`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
3. Add Environment Variables in Render Dashboard:
   - `GEMINI_API_KEY`: *(Your Google AI Studio API key)*
   - `FRONTEND_URL`: `https://your-smartnotes-app.vercel.app` *(Your deployed Vercel frontend URL)*
   - `GEMINI_MODEL`: `gemini-2.5-flash` *(Optional, defaults to gemini-2.5-flash)*
   - *(Note: Render automatically injects `PORT`, no need to set it manually)*

