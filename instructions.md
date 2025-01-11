# Project Overview
Story is a collaborative storytelling platform where users can contribute to an ongoing narrative line by line. With a retro terminal-style theme, the platform focuses on creativity and engagement through a seamless, community-driven experience.

# Core Functionalities
1. **User Authentication**:
   - Enable users to log in via phantom wallet.
   - Track user contributions, associating each line with the user’s wallet address.

2. **Collaborative Story Writing**:
   - **Line Submission**:
     - Users can add one line at a time to the story.
     - A minimum of 100,000 tokens in the user’s connected wallet is required to be eligible to submit a line.
     - Users are limited to adding one line every 24 hours, encouraging thoughtful and equitable participation.
     - Server-Side Validation: Don’t rely solely on client-side checks. Validate the balance on the server whenever a user attempts to submit a line.
     - Caching: If token balance calls are expensive, consider short-term caching on the server (e.g., 1–5 minutes), invalidated whenever a user attempts to submit a line.
     

   - **AI Integration**:
     - For every user-submitted line, the platform will use AI via the [Hugging Face Inference API](https://huggingface.co/docs/inference-endpoints/index) to generate the next line, ensuring dynamic storytelling and creativity.
     - The AI-generated line is appended to the story in real-time, providing an engaging continuation.

3. **Retro Terminal-Style UI**:
   - Create an immersive, nostalgic interface mimicking a terminal/command-line environment.
   - **Command Features**:
     - `view story`: Displays the current story state in the terminal interface.
     - `submit line`: Allows users to submit their line after validating eligibility and token balance.
     - `view history`: Retrieves and displays the story's previous versions or rollback points.

4. **Real-Time Story Updates**:
   - Dynamically display the story with each new contribution, including both user-submitted and AI-generated lines.
   - Real-time updates ensure that all participants see the most recent additions instantly.

5. **Version Control for Stories**:
   - **Historical Access**: Allow users to view previous versions of the story, facilitating transparency and collaborative editing.
   - **Rollback Feature**: Provide tools to restore earlier versions of the story, ensuring content integrity and flexibility.

6. **User Statistics and Engagement**:
   - **Contribution Metrics**: Display stats such as total lines submitted by each user and most active participants.
   - **Badges and Milestones**: Introduce achievements for contributors, such as “First Line Added” or “Top Contributor of the Month.”

# Current File Structure

STORYAI
├── node_modules/
│
├── public/
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
│
├── components/                <-- NEW: Place reusable UI components here
│   ├── story-terminal.tsx
│   ├── story-toolbar.tsx
│   └── user-stats.tsx
│
├── pages/                     <-- NEW: For dedicated API routes (per your requirement)
│   └── api/
│       ├── auth/
│       │   └── phantom-login.ts   <-- Example: Phantom Wallet authentication
│       ├── ai/
│       │   └── generate-line.ts   <-- Example: Hugging Face integration
│       └── story/
│           ├── index.ts          <-- Example: GET the current story
│           ├── submit-line.ts    <-- POST new user line (server-side validation)
│           ├── rollback.ts       <-- PATCH or POST to roll back story versions
│           └── history.ts        <-- GET story history
│
├── src/
│   └── app/
│       ├── globals.css           <-- Existing global styles
│       ├── layout.tsx            <-- Existing root layout (server component)
│       └── page.tsx              <-- Existing main entry point (server component)
│
├── .gitignore                   <-- Existing
├── eslint.config.mjs            <-- Existing
├── instructions.md              <-- Existing
├── next-env.d.ts                <-- Existing
├── next.config.mjs               <-- Existing (could rename to next.config.mjs if you wish)
├── package-lock.json            <-- Existing
├── package.json                 <-- Existing
├── instructions.md              <-- Existing
├── postcss.config.mjs           <-- Existing
├── README.md                    <-- Existing
├── tailwind.config.ts           <-- Existing
└── tsconfig.json                <-- Existing




# APIs and Libraries
Below is a list of APIs and libraries used in this project, along with links to their official documentation for reference:

1. **Phantom Wallet Integration**:
   - Library: [@solana/wallet-adapter-react](https://github.com/solana-labs/wallet-adapter)
   - Documentation: [Phantom Wallet Official Docs](https://docs.phantom.app/)

2. **AI Model Integration**:
   - API: [Hugging Face Inference API](https://huggingface.co/docs/inference-endpoints/index)
   - Documentation: [Hugging Face API Docs](https://huggingface.co/docs)

3. **Frontend Framework**:
   - Library: [Next.js](https://nextjs.org/)
   - Documentation: [Next.js Docs](https://nextjs.org/docs)

4. **Real-Time Updates**:
   - Library: [Socket.IO](https://socket.io/)
   - Documentation: [Socket.IO Docs](https://socket.io/docs/v4/)

5. **State Management**:
   - Library: [React](https://reactjs.org/)
   - Documentation: [React Docs](https://reactjs.org/docs/getting-started.html)

6. **Styling and Theming**:
   - Library: [Tailwind CSS](https://tailwindcss.com/)
   - Documentation: [Tailwind CSS Docs](https://tailwindcss.com/docs)

7. **Backend Framework**:a
   - Library: [Express.js](https://expressjs.com/)
   - Documentation: [Express.js Docs](https://expressjs.com/en/starter/installing.html)

8. **Database**:
   - Database: [Supabase](https://supabase.io/)
   - Documentation: [Supabase Docs](https://supabase.io/docs)

9. **Environment Variables**:
   - Library: [dotenv](https://github.com/motdotla/dotenv)
   - Documentation: [dotenv Docs](https://github.com/motdotla/dotenv#readme)

10. **Version Control**:
    - Platform: [Git](https://git-scm.com/)
    - Documentation: [Git Docs](https://git-scm.com/doc)

11. **Deployment Platforms**:
    - Frontend: [Vercel](https://vercel.com/)
      - Documentation: [Vercel Docs](https://vercel.com/docs)
    - Backend: [Heroku](https://www.heroku.com/)
      - Documentation: [Heroku Docs](https://devcenter.heroku.com/)

# Additional Requirements

1. **Project Setup**:
   - All new components should go in `/components` at the root (not in the `app` folder) and be named like `example-component.tsx` unless otherwise specified.
   - All new pages go in `/app`.
   - Use the Next.js 14 app router.
   - All data fetching should be done in a server component and pass the data down as props.
   - Client components (useState, hooks, etc.) require that `'use client'` is set at the top of the file.

2. **Server-Side API Calls**:
   - All interactions with external APIs should be performed server-side.
   - Create dedicated API routes in the `pages/api` directory for each external API interaction.
   - Client-side components should fetch data through these API routes, not directly from external APIs.

3. **Environment Variables**:
   - Store all sensitive information (API keys, credentials) in environment variables.
   - Use a `.env.local` file for local development and ensure it's listed in `.gitignore`.
   - For production, set environment variables in the deployment platform (e.g., Vercel).
   - Access environment variables only in server-side code or API routes.

4. **Error Handling and Logging**:
   - Implement comprehensive error handling in both client-side components and server-side API routes.
   - Log errors on the server-side for debugging purposes.
   - Display user-friendly error messages on the client-side.

5. **Type Safety**:
   - Use TypeScript interfaces for all data structures, especially API responses.
   - Avoid using the `any` type; instead, define proper types for all variables and function parameters.

6. **API Client Initialization**:
   - Initialize API clients (e.g., OpenAI) in server-side code only.
   - Implement checks to ensure API clients are properly initialized before use.

7. **Data Fetching in Components**:
   - Use React hooks (e.g., `useEffect`) for data fetching in client-side components.
   - Implement loading states and error handling for all data fetching operations.

8. **Next.js Configuration**:
   - Utilize `next.config.mjs` for environment-specific configurations.
   - Use the `env` property in `next.config.mjs` to make environment variables available to the application.

9. **CORS and API Routes**:
   - Use Next.js API routes to avoid CORS issues when interacting with external APIs.
   - Implement proper request validation in API routes.

10. **Component Structure**:
    - Separate concerns between client and server components.
    - Use server components for initial data fetching and pass data as props to client components.

11. **Security**:
    - Never expose API keys or sensitive credentials on the client-side.
    - Implement proper authentication and authorization for API routes if needed.

12. **Story Moderation Tools**:
    - Provide admins with tools to moderate storylines (e.g., remove inappropriate content).
    - Include reporting features for users to flag offensive content.

13. **Custom Theming**:
    - Allow users to switch between terminal-style themes (e.g., dark mode, vintage green screen).
    - Implement accessibility options such as larger fonts or high-contrast themes.


15. **Mobile Responsiveness**:
    - Ensure the platform is fully optimized for mobile devices.
    - Include touch-friendly interactions and adaptive layouts.

16. **Gamification Features**:
    - Introduce daily or weekly challenges for users (e.g., "Write 3 lines today").
    - Implement leaderboards to encourage friendly competition among contributors.


