<div align="center">
  <img src="assets/star.png" alt="Star" width="120" height="120" />
  
  <h1 style="color:#850d0d; font-family:sans-serif; font-size:2.5rem; margin: 0.5em 0;">PUP-STAR</h1>
  
  <!-- Badges -->
  <p>
    <a href="https://nextjs.org/" target="_blank"><img src="https://img.shields.io/badge/Next.js-000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js Badge" /></a>
    <a href="https://supabase.com/" target="_blank"><img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase Badge" /></a>
    <a href="https://tailwindcss.com/" target="_blank"><img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS Badge" /></a>
    <a href="https://ui.shadcn.com/" target="_blank"><img src="https://img.shields.io/badge/shadcn/ui-111827?style=for-the-badge" alt="shadcn/ui Badge" /></a>
    <a href="https://bun.sh/" target="_blank"><img src="https://img.shields.io/badge/Bun-000000?style=for-the-badge&logo=bun&logoColor=white" alt="Bun Badge" /></a>
  </p>
  <p style="color:#222; font-family:sans-serif; font-size:1.1rem; margin-top:1.5em; max-width:600px;">
    This website application is a final project for the requirement of the subject Web Development.
  </p>
</div>

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Members 👩‍💻👨‍💻](#members-)
- [Project Description](#project-description)
- [How to Run locally](#how-to-run-locally)
  - [Supabase Setup](#supabase-setup)
    - [1. Create a Supabase Project](#1-create-a-supabase-project)
    - [2. Setting the Supabase Keys](#2-setting-the-supabase-keys)
    - [3. Setting up the Database Table](#3-setting-up-the-database-table)
    - [4. Creating a Storage Bucket Named `papers`](#4-creating-a-storage-bucket-named-papers)
    - [5. Running the `migrate.ts`](#5-running-the-migratets)
    - [Troubleshooting](#troubleshooting)

## Members 👩‍💻👨‍💻

Alano, Ruzel Luigi  
Hinay, Anthony John C.  
Llesis, Earl Gem  
Quijano, Katherine  
Rolle, Xavier B.

## Project Description

PUP-STAR is an online platform designed to serve as a centralized digital repository for past theses and research papers from the Polytechnic University of the Philippines (PUP). The platform aims to provide future researchers with easy access to scholarly articles of previous generations, enabling knowledge sharing, citation assistance, and intellectual growth within the university.

***

## How to Run locally

This project uses [Bun](https://bun.sh/) as its JavaScript runtime and package manager.

To install Bun:
- **macOS / Linux**:
  ```sh
  curl -fsSL https://bun.sh/install | bash
  ```
- **Windows** (with [winget](https://learn.microsoft.com/en-us/windows/package-manager/winget/)):
  ```sh
  winget install Oven.Bun
  ```
- For more installation options, see the [official Bun installation guide](https://bun.sh/docs/installation).

Once finished, navigate to the `pup-star` directory and install dependencies:

```sh
cd pup-star
bun i
```

To run the development server:

```sh
bun dev
```

### Supabase Setup

#### 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com/) and sign up or log in.
2. Click **New Project** and follow the instructions to create your project.
3. Once your project is created, you will need to set up environment variables.

#### 2. Setting the Supabase Keys

To run this project, you must set up the `.env.local` variables. Please check `.env.example` for the format.

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_SUPABASE_KEY=your-anon-key
NEXT_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**How to get these keys:**

- **SUPABASE_URL:**  
  - Go to your Supabase project dashboard.
  - Click on **Settings** > **API**.
  - Copy the **Project URL**.

- **SUPABASE_KEY (Anon Key):**  
  - In the same **API** section, copy the **anon public** key.

- **SUPABASE_SERVICE_ROLE_KEY:**  
  - In the **API** section, copy the **service_role** key.
  - **Note:** Never expose the service role key on the client side.

Add these values to your `.env` file in the project root.

#### 3. Setting up the Database Table

On your Supabase project:

1. Go to **Project** > **Console** > **SQL Editor**.
2. Run this SQL to enable dynamic SQL execution (optional):

    ```sql
    create or replace function execute_sql(sql text) returns void as $$
    begin
      execute sql;
    end;
    $$ language plpgsql security definer;
    ```

3. On your SQL editor, click the plus button then choose "Create new snippet" and run:

    ```sql
    create table if not exists studies (
      id text primary key,
      title text not null,
      course text not null,
      year integer not null,
      authors text[],
      abstract text,
      pdf_url text,
      date_published text,
      sections jsonb,
      created_at timestamp with time zone default timezone('utc'::text, now()) not null,
      updated_at timestamp with time zone default timezone('utc'::text, now()) not null
    );

    create or replace function update_updated_at_column()
    returns trigger as $$
    begin
      new.updated_at = timezone('utc'::text, now());
      return new;
    end;
    $$ language 'plpgsql';

    create trigger update_studies_updated_at
      before update on studies
      for each row
      execute procedure update_updated_at_column();
    ```

---

#### 4. Creating a Storage Bucket Named `papers`

To store uploaded thesis and research paper files, you need to create a storage bucket in Supabase:

1. In your Supabase project dashboard, go to **Storage** in the sidebar.
2. Click the **New bucket** button.
3. Enter `papers` as the bucket name (all lowercase).
4. Set the privacy settings as needed (set the privacy to public).
5. Click **Create**.

You can now upload files to the `papers` bucket.

---

#### 5. Running the `migrate.ts`

To test if the database is working, try running the migration script:

```sh
bun run migrate
# or
bun run migrate.ts
```

---

#### Troubleshooting

- Ensure your `.env` file is correctly set up and not committed to version control.
- If you encounter errors with `route.ts`, check the error logs and Supabase permissions.
- Make sure the `papers` storage bucket exists and has the correct permissions.
