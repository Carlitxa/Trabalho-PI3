# Vite + React + TypeScript Frontend

This project is a modern frontend for your platform, built with Vite, React, and TypeScript. It is designed to interact with your Node.js/Express backend and supports role-based dashboards, authentication, and CRUD operations for users, companies, proposals, applications, and departments.

## Features
- Authentication (login/register)
- Role-based dashboards (admin, gestor, empresa, utilizador)
- CRUD for users, companies, proposals, applications, departments
- Responsive UI using Material-UI or Ant Design
- Integration with backend API endpoints

## Getting Started

1. **Install dependencies:**
   ```sh
   npm install
   ```
2. **Start the development server:**
   ```sh
   npm run dev
   ```
3. **Open your browser:**
   Visit [http://localhost:5173](http://localhost:5173) (or the port shown in your terminal)

## Customization
- Update the UI library (Material-UI or Ant Design) as needed.
- Configure API endpoints in a central file (e.g., `src/api.ts`).
- Add or modify components in `src/components` and pages in `src/pages`.

## Project Structure
- `src/` - Main source code
- `.github/copilot-instructions.md` - Copilot custom instructions
- `.vscode/tasks.json` - VS Code tasks

## License
MIT
