-- ============================================================================
-- CreditWise — relational schema (PostgreSQL dialect)
--
-- The running app uses a repository abstraction (lib/repo.ts) backed by a JSON
-- store for zero-config demo hosting. This file documents the production schema
-- the repository maps onto: swapping lib/repo.ts to use these tables is the only
-- change required to run on Postgres.
-- ============================================================================

CREATE TABLE banks (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL UNIQUE
);

CREATE TABLE cards (
  id                  TEXT PRIMARY KEY,
  slug                TEXT NOT NULL UNIQUE,
  name                TEXT NOT NULL,
  bank_id             TEXT NOT NULL REFERENCES banks(id),
  category            TEXT NOT NULL,         -- Cashback | Travel | Fuel | Shopping | Premium | Student | Rewards | Co-brand
  tier                TEXT NOT NULL,         -- Entry | Mid | Premium | Super-premium
  color               TEXT NOT NULL,
  networks            TEXT[] NOT NULL,

  joining_fee         INTEGER NOT NULL DEFAULT 0,
  annual_fee          INTEGER NOT NULL DEFAULT 0,
  annual_fee_waiver   INTEGER NOT NULL DEFAULT 0,   -- spend to waive; 0 = none

  base_rate           NUMERIC(5,4) NOT NULL,        -- value per ₹1
  reward_currency     TEXT NOT NULL,
  point_value         NUMERIC(5,2) NOT NULL,        -- ₹ per unit at best redemption

  min_income_annual   INTEGER NOT NULL,
  min_credit_score    INTEGER NOT NULL,
  min_age             INTEGER NOT NULL,

  lounge_domestic     INTEGER NOT NULL DEFAULT 0,
  lounge_intl         INTEGER NOT NULL DEFAULT 0,
  forex_markup        NUMERIC(4,2) NOT NULL DEFAULT 3.5,
  welcome_bonus_value INTEGER NOT NULL DEFAULT 0,
  welcome_bonus_desc  TEXT,
  summary             TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_cards_category ON cards(category);
CREATE INDEX idx_cards_bank     ON cards(bank_id);
CREATE INDEX idx_cards_fee      ON cards(annual_fee);

-- One row per (card, spend category) accelerated reward rule.
CREATE TABLE reward_rules (
  id                TEXT PRIMARY KEY,
  card_id           TEXT NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  category          TEXT NOT NULL,           -- SpendCategory
  rate              NUMERIC(5,4) NOT NULL,
  monthly_cap_value INTEGER                  -- nullable
);
CREATE INDEX idx_rules_card ON reward_rules(card_id);

-- Free-text benefit / pro / con / best-for rows (typed by `kind`).
CREATE TABLE card_facets (
  id       TEXT PRIMARY KEY,
  card_id  TEXT NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  kind     TEXT NOT NULL,   -- benefit | pro | con | best_for
  value    TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX idx_facets_card ON card_facets(card_id, kind);

CREATE TABLE users (
  id            TEXT PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  name          TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'user',  -- user | admin
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE favorites (
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  card_id    TEXT NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, card_id)
);

CREATE TABLE recommendations (
  id             TEXT PRIMARY KEY,
  user_id        TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  spend_profile  JSONB NOT NULL,
  result_card_ids TEXT[] NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_recs_user ON recommendations(user_id);

CREATE TABLE analytics_events (
  id         TEXT PRIMARY KEY,
  type       TEXT NOT NULL,     -- view | compare | search | recommend | calculate
  card_id    TEXT REFERENCES cards(id) ON DELETE SET NULL,
  query      TEXT,
  meta       JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_events_type ON analytics_events(type);
CREATE INDEX idx_events_card ON analytics_events(card_id);
CREATE INDEX idx_events_time ON analytics_events(created_at);
