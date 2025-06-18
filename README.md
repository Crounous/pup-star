# PUP-STAR

This website application is a final project for the requirement of the subject Web Development.

**Members:**  
Alano, Ruzel Luigi  
Hinay, Anthony John C.  
Llesis, Earl Gem  
Quijano, Katherine  
Rolle, Xavier B.

PUP-STAR is an online platform designed to serve as a centralized digital repository for past theses and research papers from the Polytechnic University of the Philippines (PUP). The platform aims to provide future researchers with easy access to scholarly articles of previous generations, enabling knowledge sharing, citation assistance, and intellectual growth within the university.

***

## How to Run

### Supabase Setup

> **Note:**  
> Currently, only `migrate.ts` is working. Both `route.ts` files have errors.

#### 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com/) and sign up or log in.
2. Click **New Project** and follow the instructions to create your project.
3. Once your project is created, you will need to set up environment variables.

#### 2. Setting the Supabase Keys

To run this project, you must set up the `.env` variables. Please check `.env.example` for the format.

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
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

## Troubleshooting

- Ensure your `.env` file is correctly set up and not committed to version control.
- If you encounter errors with `route.ts`, check the error logs and Supabase permissions.
- Make sure the `papers` storage bucket exists and has the correct permissions.

---
