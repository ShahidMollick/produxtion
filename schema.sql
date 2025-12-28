-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- WORKERS TABLE
create table if not exists workers (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  role text default 'worker',
  created_at timestamptz default now()
);

-- DAILY PRODUCTION TABLE
create table if not exists daily_production (
  id uuid default uuid_generate_v4() primary key,
  worker_id uuid references workers(id) on delete cascade not null,
  date date default CURRENT_DATE,
  
  -- Tracking Quantities
  goods_issued int default 0,
  goods_produced int default 0,
  -- goods_in_hand is often calculated, but storing it allows manual adjustment if needed. 
  -- We can use a generated column if we want strict logic:
  -- goods_in_hand int generated always as (goods_issued - goods_produced) stored,
  -- But for flexibility, we'll make it a regular column updated by app logic.
  goods_in_hand int default 0,
  
  alteration_count int default 0,
  qc_passed int default 0,
  qc_failed int default 0,
  packing_completed int default 0,
  
  -- Workflow Status
  current_stage text default 'idle', -- 'issued', 'production', 'alteration', 'qc', 'packing', 'completed'
  
  updated_at timestamptz default now(),
  
  -- Ensure one record per worker per day
  unique(worker_id, date)
);

-- RLS POLICIES (Simple public access for this MVP, restrict in production)
alter table workers enable row level security;
alter table daily_production enable row level security;

create policy "Enable all for anon" on workers for all using (true) with check (true);
create policy "Enable all for anon" on daily_production for all using (true) with check (true);
