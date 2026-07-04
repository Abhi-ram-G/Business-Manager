create table if not exists bit_entries (
  id varchar(50) primary key,
  bit_no varchar(100) not null,
  brand varchar(100) not null,
  size_mm int not null,
  rate numeric(12,2) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
