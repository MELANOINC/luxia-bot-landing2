-- Lead and conversation tracking for generative AI workflows
create table leads (
  id uuid primary key default gen_random_uuid(),
  source text check (source in ('web','whatsapp','email')) not null,
  name text,
  email text,
  phone text,
  country text,
  interest text,
  details jsonb,
  status text default 'new',
  score integer default 0,
  score_reasons text,
  created_at timestamptz default now()
);

create table conversations (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id),
  channel text,
  role text,
  message text,
  metadata jsonb,
  created_at timestamptz default now()
);

create table docs (
  id uuid primary key default gen_random_uuid(),
  title text,
  tags text[],
  url text,
  content text,
  created_at timestamptz default now()
);

create table doc_chunks (
  id uuid primary key default gen_random_uuid(),
  doc_id uuid references docs(id),
  chunk text,
  embedding vector(1536)
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id),
  product text,
  price numeric,
  currency text default 'ARS',
  status text,
  mp_preference_id text,
  mp_payment_id text,
  created_at timestamptz default now()
);
