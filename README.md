<p align="center">
  <a href="https://hackcanada.org" target="_blank">
    <img src="https://www.hackcanada.org/favicon.svg" alt="Daedalus Logo" width="120">
  </a>
</p>

<h1 align="center">Daedalus: Your Hackathon Command Center</h1>

<p align="center">
  The ultimate dashboard for orchestrating your Hackathons Canada event. Inspired by the mythical craftsman, Daedalus empowers you to navigate every facet of your hackathon journey, from application to awards.
</p>

<p align="center">
  <a href="https://github.com/Hackathons-Canada/Daedalus/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/Hackathons-Canada/Daedalus?style=for-the-badge" alt="License">
  </a>
  <!-- TODO: Add other badges like build status, deployment, etc. -->
</p>

## ✨ Features

Daedalus is packed with features to streamline hackathon management for both organizers and hackers:

- **👨‍💻 Hacker Applications:** A fully-featured application system with custom forms, resume uploads, and detailed submission tracking.
- **📊 Organizer Dashboard:** A central hub for organizers to view analytics, manage applications, and oversee event logistics.
- **🗓️ Dynamic Schedule:** Create and manage a real-time event schedule to keep participants informed.
- **🎟️ RSVP & Check-in:** Effortlessly manage event RSVPs and streamline on-site check-in with a built-in QR code scanner.
- **👤 User Profiles:** Personalized profiles for hackers and organizers.
- **🤫 Auth Ready:** Secure authentication powered by NextAuth.js.
- ...and much more!

## 🛠️ Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Authentication:** [NextAuth.js](https://next-auth.js.org/)
- **Database & ORM:** [PostgreSQL](https://www.postgresql.org/) with [Drizzle ORM](https://orm.drizzle.team/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/)
- **Form Handling:** [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/) for validation
- **Deployment:** [Vercel](https://vercel.com/)
- **Package Manager:** [Bun](https://bun.sh/)

## 🚀 Getting Started

Follow these instructions to get a local copy of Daedalus up and running.

### Prerequisites

- **Node.js** (v18 or higher recommended)
- **Bun** (fast JavaScript runtime & package manager): `curl -fsSL https://bun.sh/install | bash`
  - On Windows: `powershell -c "irm bun.sh/install.ps1 | iex"`
- **Database Access:** Contact **Sohel (VP Backend)** for database connection details

### Installation & Setup

1.  **Clone the Repository:**

    ```bash
    git clone https://github.com/Hack-Canada/Daedalus-Hacker-Portal.git
    cd Daedalus-Hacker-Portal
    ```

2.  **Install Dependencies:**

    ```bash
    bun install
    ```

3.  **Set Up Environment Variables:**

    Create a `.env.local` file in the root of the project:

    ```bash
    # Create environment file
    touch .env.local  # On Windows: type nul > .env.local
    ```

    Add the following variables to your `.env.local` file:

    ```env
    # Database (PostgreSQL) - Contact Sohel (VP Backend) for this URL
    DATABASE_URL="postgresql://username:password@host:port/database"

    # Auth.js - Generate a secret key
    AUTH_SECRET="your-auth-secret-here"  # Generate with: openssl rand -base64 32
    AUTH_URL="http://localhost:3000"

    # Application URL
    NEXT_PUBLIC_APP_URL="http://localhost:3000"

    # Optional: Google OAuth (for social login)
    GOOGLE_CLIENT_ID="your-google-client-id"
    GOOGLE_CLIENT_SECRET="your-google-client-secret"

    # Optional: AWS Services (for file uploads and emails)
    AWS_REGION="us-east-1"
    AWS_ACCESS_KEY_ID="your-aws-access-key"
    AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
    AWS_S3_BUCKET_NAME="your-s3-bucket"
    NEXT_PUBLIC_AWS_S3_BUCKET_NAME="your-s3-bucket"
    AWS_SES_VERIFIED_EMAIL="your-verified-email@domain.com"
    AWS_SES_NO_REPLY_EMAIL="no-reply@your-domain.com"
    ```

4.  **Apply Database Migrations:**

    Apply committed migrations to the portal database:

    ```bash
    bun run db:migrate
    ```

    Schema changes start in `lib/db/schema.ts`, then `bun run db:generate`, review the SQL under `drizzle/`, and `bun run db:migrate`.

5.  **Launch the Development Server:**

    ```bash
    bun dev
    ```

    Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### 🔧 Available Scripts

| Command     | Bun Command           | Description                                      |
| ----------- | --------------------- | ------------------------------------------------ |
| Development | `bun dev`             | Start development server                         |
| Build       | `bun run build`       | Build for production                             |
| Start       | `bun start`           | Start production server                          |
| Lint        | `bun run lint`        | Run ESLint                                       |
| Format      | `bun run format`      | Format code with Prettier                        |
| DB Generate | `bun run db:generate` | Write the next migration from `lib/db/schema.ts` |
| DB Migrate  | `bun run db:migrate`  | Apply pending migrations                         |
| DB Studio   | `bun run db:studio`   | Open Drizzle Studio                              |

### 🐛 Troubleshooting

**Database Connection Issues:**

- Ensure your `DATABASE_URL` is correct (contact Sohel if needed)
- Check that your database is running and accessible
- Verify your `.env.local` file is in the project root

**Environment Variables Not Loading:**

- Make sure you're using `.env.local` (not `.env`)
- Restart your development server after changing environment variables
- Check that there are no syntax errors in your `.env.local` file

## 🤝 Contributing

Contributions are welcome! If you have a feature request, bug report, or want to contribute to the code, please feel free to open an issue or submit a pull request.

I recommend creating a `CONTRIBUTING.md` file to outline the process for contributors.

## 📄 License

This project is licensed under the [GPLv3 License](LICENSE).

## ❤️ Created By Hack Canada

Let's build unforgettable hackathon experiences together! 🚀
