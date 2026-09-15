import fs from "fs";
import path from "path";
import { CARDS as SEED_CARDS, ARTICLES as SEED_ARTICLES } from "./seed";
import { VERIFIED_CARDS } from "./verified-cards";
import { CreditCard, User, Favorite, RecommendationRecord, AnalyticsEvent } from "./types";

// ============================================================================
// Repository layer.
//
// This abstracts all data access behind a single module. The current
// implementation persists to a JSON file under .data/ (zero-config, works on
// any host for demo). To move to Postgres/SQLite later, replace ONLY the
// bodies below with SQL queries — the rest of the app imports these functions
// and never touches storage directly.
// ============================================================================

interface DB {
  cards: CreditCard[];
  users: User[];
  favorites: Favorite[];
  recommendations: RecommendationRecord[];
  events: AnalyticsEvent[];
}

const ALL_CARDS = [...SEED_CARDS, ...VERIFIED_CARDS];

// On Vercel/serverless the project dir is read-only; only /tmp is writable.
const WRITABLE_BASE = process.env.VERCEL ? "/tmp" : process.cwd();
const DATA_DIR = path.join(WRITABLE_BASE, ".data");
const DATA_FILE = path.join(DATA_DIR, "db.json");

let _db: DB | null = null;

function load(): DB {
  if (_db) return _db;
  try {
    if (fs.existsSync(DATA_FILE)) {
      _db = JSON.parse(fs.readFileSync(DATA_FILE, "utf8")) as DB;
      // Cards are source-controlled static data, not user data.
      _db.cards = ALL_CARDS;
      return _db;
    }
  } catch {
    // fall through to fresh seed
  }
  _db = { cards: ALL_CARDS, users: [], favorites: [], recommendations: [], events: [] };
  persist();
  return _db;
}

function persist() {
  if (!_db) return;
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    const { cards, ...rest } = _db;
    void cards;
    fs.writeFileSync(DATA_FILE, JSON.stringify(rest, null, 2));
  } catch {
    // best-effort; on read-only hosts we simply keep state in memory
  }
}

function uid(prefix = "id"): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

// ---------------- Cards ----------------
export const cardRepo = {
  all(): CreditCard[] {
    return load().cards;
  },
  byId(id: string): CreditCard | undefined {
    return load().cards.find((c) => c.id === id);
  },
  bySlug(slug: string): CreditCard | undefined {
    return load().cards.find((c) => c.slug === slug);
  },
  byIds(ids: string[]): CreditCard[] {
    const set = new Set(ids);
    return load().cards.filter((c) => set.has(c.id));
  },
  banks(): string[] {
    return [...new Set(load().cards.map((c) => c.bank))].sort();
  },
  upsert(card: CreditCard) {
    const db = load();
    const i = db.cards.findIndex((c) => c.id === card.id);
    if (i >= 0) db.cards[i] = card;
    else db.cards.push(card);
    persist();
    return card;
  },
  remove(id: string) {
    const db = load();
    db.cards = db.cards.filter((c) => c.id !== id);
    persist();
  },
};

// ---------------- Users ----------------
export const userRepo = {
  byEmail(email: string): User | undefined {
    return load().users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  },
  byId(id: string): User | undefined {
    return load().users.find((u) => u.id === id);
  },
  create(data: Omit<User, "id" | "createdAt">): User {
    const db = load();
    const user: User = { ...data, id: uid("usr"), createdAt: new Date().toISOString() };
    db.users.push(user);
    persist();
    return user;
  },
};

// ---------------- Favorites ----------------
export const favRepo = {
  forUser(userId: string): Favorite[] {
    return load().favorites.filter((f) => f.userId === userId);
  },
  toggle(userId: string, cardId: string): boolean {
    const db = load();
    const i = db.favorites.findIndex((f) => f.userId === userId && f.cardId === cardId);
    if (i >= 0) { db.favorites.splice(i, 1); persist(); return false; }
    db.favorites.push({ userId, cardId, createdAt: new Date().toISOString() });
    persist();
    return true;
  },
};

// ---------------- Recommendations history ----------------
export const recRepo = {
  forUser(userId: string): RecommendationRecord[] {
    return load().recommendations.filter((r) => r.userId === userId).reverse();
  },
  add(rec: Omit<RecommendationRecord, "id" | "createdAt">): RecommendationRecord {
    const db = load();
    const record: RecommendationRecord = { ...rec, id: uid("rec"), createdAt: new Date().toISOString() };
    db.recommendations.push(record);
    persist();
    return record;
  },
};

// ---------------- Analytics ----------------
export const analyticsRepo = {
  track(e: Omit<AnalyticsEvent, "id" | "createdAt">) {
    const db = load();
    db.events.push({ ...e, id: uid("evt"), createdAt: new Date().toISOString() });
    if (db.events.length > 5000) db.events = db.events.slice(-5000);
    persist();
  },
  all(): AnalyticsEvent[] {
    return load().events;
  },
  summary() {
    const events = load().events;
    const count = (type: AnalyticsEvent["type"]) => events.filter((e) => e.type === type).length;
    const tally = (type: AnalyticsEvent["type"]) => {
      const m = new Map<string, number>();
      events.filter((e) => e.type === type && e.cardId).forEach((e) => m.set(e.cardId!, (m.get(e.cardId!) || 0) + 1));
      return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
    };
    const searches = new Map<string, number>();
    events.filter((e) => e.type === "search" && e.query).forEach((e) => searches.set(e.query!, (searches.get(e.query!) || 0) + 1));
    return {
      totals: {
        views: count("view"), compares: count("compare"), searches: count("search"),
        recommends: count("recommend"), calculates: count("calculate"), all: events.length,
      },
      mostViewed: tally("view"),
      mostCompared: tally("compare"),
      topSearches: [...searches.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8),
    };
  },
};

export const articleRepo = {
  all: () => SEED_ARTICLES,
  bySlug: (slug: string) => SEED_ARTICLES.find((a) => a.slug === slug),
};
