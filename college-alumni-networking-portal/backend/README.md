
# AlumniConnect Backend

This folder contains the Node.js, Express, and MongoDB backend for the AlumniConnect application.

## Setup Instructions

1.  **Install Dependencies:**
    Navigate to the `backend` directory and run:
    ```bash
    npm install
    ```

2.  **Set Up Environment Variables:**
    - Create a file named `.env` in the `backend` directory.
    - Copy the contents of `.env.example` into your new `.env` file.
    - **`MONGO_URI`**: Replace the placeholder with your actual MongoDB Atlas connection string. You can get this from your MongoDB Atlas dashboard.
    - **`JWT_SECRET`**: Replace the placeholder with a long, random, and secure string. This is used to sign authentication tokens.

3.  **Run the Server:**
    - To run the server in development mode (with auto-reloading via nodemon):
      ```bash
      npm run dev
      ```
    - To run the server in production mode:
      ```bash
      npm start
      ```

The server will start on the port specified in your `.env` file (default is 5000).
