# SiteGenius Backend

This directory contains the Node.js backend service for the SiteGenius application. It uses Express.js to provide a REST API that communicates with the Supabase database.

## Setup

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Create an environment file:**
    Copy the example environment file:
    ```bash
    cp .env.example .env
    ```

4.  **Configure Environment Variables:**
    Open the newly created `.env` file and add your Supabase project credentials.

    ```env
    SUPABASE_URL=https://your-project-url.supabase.co

    # IMPORTANT: Use your SERVICE_ROLE_KEY here.
    # This key can bypass Row Level Security and is required for the backend to write to the database.
    # Find it in your Supabase Project Settings > API.
    SUPABASE_SERVICE_KEY=your_supabase_service_role_key

    # The port the backend server will run on.
    PORT=3001
    ```

## Running the Server

-   **For development (with auto-reloading):**
    ```bash
    npm run dev
    ```

-   **For production:**
    ```bash
    npm start
    ```

The server will start on `http://localhost:3001` (or the port specified in your `.env` file).
