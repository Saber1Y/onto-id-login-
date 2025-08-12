Demo Link here: https://www.loom.com/share/386c30a79149431fbee9c89b26908fc3?sid=7dfdcddd-a046-4056-9400-21a0ccdf065a

---

## Running Locally

1. **Clone the repo:**

   ```sh
   git clone <your-repo-url>
   cd ont-id-login
   ```

2. **Install dependencies:**

   ```sh
   npm install
   ```

3. **Set up environment variables:**

   - Copy `.env.local.example` to `.env.local` (or create `.env.local` if it doesn't exist):
     ```sh
     cp .env.local.example .env.local
     # or create manually
     ```
   - Add your JWT secret to `.env.local`:
     ```env
     JWT_SECRET=your_super_secret_key_here
     ```

4. **Run the development server:**

   ```sh
   npm run dev
   ```

   The app will be available at [http://localhost:3000](http://localhost:3000).

5. **Install the ONTO Wallet browser extension** and connect it to test ONT ID login.

---

**Note:**

- For production (e.g., Vercel), set the `JWT_SECRET` environment variable in your deployment settings.
- The login flow is stateless and production-ready for serverless platforms.

---
