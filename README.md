# Grade Hustle

Grade Hustle is an elegant, modern, and user-friendly academic grade management application. It features dynamic GPA/IPS calculations, grade projections, a graduation simulator, and the "Extortionist Engine" realism check. 

## 🚀 Features

- **Supabase Authentication**: Secure login via Google with a minimalist interface.
- **Custom Grade Scales**: Define your own grading scales (e.g., A ≥ 85) and their respective GPA weights during the mandatory onboarding process.
- **Comprehensive Grade Management**: Perform CRUD operations on Semesters, Courses (Credits/SKS), and Grade Components (percentage weights).
- **Real-Time Calculations**: Instantly see your IPS (Semester GPA), Total GPA, Total Credits, and Grade Distribution updated in real-time on your Student Profile.
- **The Extortionist Engine (Realism Check)**:
  - Warns you with a "Mathematically Impossible" message if your target grade is unreachable, while suggesting the maximum possible grade.
  - Celebrates with an "Outstanding!" message when you exceed your target grade (overachiever).
- **Graduation Simulator (Advanced DFS Backtracking)**:
  - Plan your graduation path by setting a "Minimum Acceptable Grade" (default C / 2.0). The algorithm prunes possibilities below this threshold.
  - Explores billions of combinations to present up to **3 of the best (easiest) alternative strategies** using an elegant card-based UI.
  - Handles floating-point math precisely, displaying up to 4 decimal places when necessary to clarify borderline possibilities.
- **Smart UI/UX**:
  - Semester accordion automatically collapses old semesters to maintain a clean dashboard.
  - Hard limit on component weights to prevent exceeding 100%, automatically capping inputs.
  - Customized input fields without browser scroll-wheel or spin-buttons to prevent accidental changes.

## 💻 Tech Stack

- **Frontend**: HTML5, CSS3 (Vanilla), JavaScript (ES6+)
- **Backend**: Supabase (PostgreSQL, Google Auth)

## 🎨 UI/UX Philosophy

The interface is strictly designed to be **ELEGANT, MINIMALIST, BEAUTIFUL, and USER-FRIENDLY**.

- **Theme**: Extensive use of whitespace, soft/premium color palettes, modern sans-serif typography, and a custom transparent scrollbar.
- **Components**: Card-based layouts with rounded corners and subtle drop shadows.
- **Interactions**: Smooth CSS transitions (hover effects, fade-in/out). Custom aesthetic modals and toasts replace default browser alerts/prompts. All contents are in English.
- **Real-Time Updates**: DOM manipulation is used for instant UI updates, avoiding page reloads and database spamming to maintain user focus.

---

*This project is built with a focus on delivering a high-quality, realistic, and premium user experience for academic grade management.*