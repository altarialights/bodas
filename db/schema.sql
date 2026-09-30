-- Proposal only: SQLite / Turso. Not executed by this frontend.
-- Bind company_id from the authenticated server context, never from a browser claim.
PRAGMA foreign_keys = ON;

CREATE TABLE companies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  contact_label TEXT NOT NULL,
  contact_url TEXT
);
CREATE TABLE company_memberships (
  company_id TEXT NOT NULL REFERENCES companies(id),
  user_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('owner','editor','viewer')),
  PRIMARY KEY (company_id, user_id)
);
CREATE TABLE weddings (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES companies(id),
  slug TEXT NOT NULL UNIQUE,
  names_json TEXT NOT NULL CHECK(json_valid(names_json)),
  starts_at TEXT NOT NULL,
  ends_at TEXT NOT NULL,
  timezone TEXT NOT NULL,
  locale TEXT NOT NULL,
  rsvp_deadline TEXT NOT NULL,
  phase TEXT NOT NULL DEFAULT 'auto' CHECK(phase IN ('auto','before','during','after')),
  visual_json TEXT NOT NULL CHECK(json_valid(visual_json)),
  sections_json TEXT NOT NULL CHECK(json_valid(sections_json)),
  content_json TEXT NOT NULL CHECK(json_valid(content_json)),
  revision INTEGER NOT NULL DEFAULT 1,
  UNIQUE(company_id,id)
);
CREATE INDEX weddings_by_company ON weddings(company_id,starts_at);
CREATE TABLE invitations (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL,
  wedding_id TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  greeting TEXT NOT NULL,
  allow_companion INTEGER NOT NULL DEFAULT 0 CHECK(allow_companion IN (0,1)),
  table_published INTEGER NOT NULL DEFAULT 0 CHECK(table_published IN (0,1)),
  expires_at TEXT,
  revoked_at TEXT,
  UNIQUE(company_id,wedding_id,id),
  FOREIGN KEY(company_id,wedding_id) REFERENCES weddings(company_id,id)
);
CREATE TABLE guests (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL,
  wedding_id TEXT NOT NULL,
  invitation_id TEXT NOT NULL,
  name TEXT NOT NULL,
  is_child INTEGER NOT NULL DEFAULT 0,
  is_optional INTEGER NOT NULL DEFAULT 0,
  table_name TEXT,
  UNIQUE(company_id,wedding_id,invitation_id,id),
  FOREIGN KEY(company_id,wedding_id,invitation_id) REFERENCES invitations(company_id,wedding_id,id)
);
CREATE INDEX guests_by_invitation ON guests(company_id,wedding_id,invitation_id);
CREATE TABLE venues (
  id TEXT PRIMARY KEY, company_id TEXT NOT NULL, wedding_id TEXT NOT NULL,
  name TEXT NOT NULL, region TEXT NOT NULL, address TEXT, maps_url TEXT,
  details_json TEXT NOT NULL CHECK(json_valid(details_json)),
  UNIQUE(company_id,wedding_id,id),
  FOREIGN KEY(company_id,wedding_id) REFERENCES weddings(company_id,id)
);
CREATE TABLE program_events (
  id TEXT PRIMARY KEY, company_id TEXT NOT NULL, wedding_id TEXT NOT NULL,
  venue_id TEXT NOT NULL, starts_at TEXT NOT NULL, title TEXT NOT NULL, description TEXT NOT NULL,
  FOREIGN KEY(company_id,wedding_id,venue_id) REFERENCES venues(company_id,wedding_id,id)
);
CREATE INDEX events_by_time ON program_events(company_id,wedding_id,starts_at);
CREATE TABLE menu_options (
  id TEXT NOT NULL, company_id TEXT NOT NULL, wedding_id TEXT NOT NULL,
  label TEXT NOT NULL, child_only INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY(company_id,wedding_id,id),
  FOREIGN KEY(company_id,wedding_id) REFERENCES weddings(company_id,id)
);
CREATE TABLE transport (
  id TEXT PRIMARY KEY, company_id TEXT NOT NULL, wedding_id TEXT NOT NULL,
  direction TEXT NOT NULL CHECK(direction IN ('outbound','return')),
  label TEXT NOT NULL, departure TEXT NOT NULL, departure_at TEXT NOT NULL,
  capacity INTEGER NOT NULL CHECK(capacity > 0),
  UNIQUE(company_id,wedding_id,id),
  FOREIGN KEY(company_id,wedding_id) REFERENCES weddings(company_id,id)
);
CREATE TABLE individual_responses (
  id TEXT PRIMARY KEY, company_id TEXT NOT NULL, wedding_id TEXT NOT NULL,
  invitation_id TEXT NOT NULL, guest_id TEXT NOT NULL,
  attendance TEXT NOT NULL CHECK(attendance IN ('pending','yes','no')),
  menu_id TEXT, allergies TEXT, arrival TEXT, outbound_id TEXT, return_id TEXT,
  accessibility TEXT, comment TEXT, updated_at TEXT NOT NULL,
  UNIQUE(company_id,wedding_id,invitation_id,guest_id),
  FOREIGN KEY(company_id,wedding_id,invitation_id,guest_id) REFERENCES guests(company_id,wedding_id,invitation_id,id),
  FOREIGN KEY(company_id,wedding_id,menu_id) REFERENCES menu_options(company_id,wedding_id,id),
  FOREIGN KEY(company_id,wedding_id,outbound_id) REFERENCES transport(company_id,wedding_id,id),
  FOREIGN KEY(company_id,wedding_id,return_id) REFERENCES transport(company_id,wedding_id,id),
  CHECK(attendance = 'yes' OR (menu_id IS NULL AND allergies IS NULL AND arrival IS NULL AND outbound_id IS NULL AND return_id IS NULL AND accessibility IS NULL AND comment IS NULL))
);
CREATE INDEX responses_by_status ON individual_responses(company_id,wedding_id,attendance);
CREATE INDEX responses_outbound ON individual_responses(company_id,wedding_id,outbound_id);
CREATE INDEX responses_return ON individual_responses(company_id,wedding_id,return_id);
CREATE TABLE accommodations (
  id TEXT PRIMARY KEY, company_id TEXT NOT NULL, wedding_id TEXT NOT NULL,
  name TEXT NOT NULL, description TEXT NOT NULL, note TEXT, url TEXT,
  FOREIGN KEY(company_id,wedding_id) REFERENCES weddings(company_id,id)
);
CREATE TABLE faqs (
  id TEXT PRIMARY KEY, company_id TEXT NOT NULL, wedding_id TEXT NOT NULL,
  question TEXT NOT NULL, answer TEXT NOT NULL, sort_order INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY(company_id,wedding_id) REFERENCES weddings(company_id,id)
);
CREATE TABLE gifts (
  id TEXT PRIMARY KEY, company_id TEXT NOT NULL, wedding_id TEXT NOT NULL,
  kind TEXT NOT NULL CHECK(kind IN ('list','honeymoon')), title TEXT NOT NULL, description TEXT NOT NULL, url TEXT,
  FOREIGN KEY(company_id,wedding_id) REFERENCES weddings(company_id,id)
);
CREATE TABLE song_proposals (
  id TEXT PRIMARY KEY, company_id TEXT NOT NULL, wedding_id TEXT NOT NULL, invitation_id TEXT NOT NULL,
  title TEXT NOT NULL, artist TEXT NOT NULL, memory TEXT, created_at TEXT NOT NULL,
  FOREIGN KEY(company_id,wedding_id,invitation_id) REFERENCES invitations(company_id,wedding_id,id)
);
CREATE TABLE memories (
  id TEXT PRIMARY KEY, company_id TEXT NOT NULL, wedding_id TEXT NOT NULL, invitation_id TEXT NOT NULL,
  author TEXT NOT NULL, body TEXT NOT NULL,
  kind TEXT NOT NULL CHECK(kind IN ('guestbook','anniversary')),
  status TEXT NOT NULL CHECK(status IN ('sealed','pending','published','rejected')),
  release_at TEXT, created_at TEXT NOT NULL,
  FOREIGN KEY(company_id,wedding_id,invitation_id) REFERENCES invitations(company_id,wedding_id,id)
);
CREATE INDEX memories_by_visibility ON memories(company_id,wedding_id,status,release_at);
CREATE TABLE media_resources (
  id TEXT PRIMARY KEY, company_id TEXT NOT NULL, wedding_id TEXT NOT NULL,
  invitation_id TEXT, storage_key TEXT NOT NULL,
  kind TEXT NOT NULL CHECK(kind IN ('image','audio','video')),
  mime_type TEXT NOT NULL, byte_size INTEGER NOT NULL, width INTEGER, height INTEGER,
  alt TEXT NOT NULL, origin TEXT, license TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','ready','rejected')),
  created_at TEXT NOT NULL,
  UNIQUE(company_id,wedding_id,id),
  FOREIGN KEY(company_id,wedding_id) REFERENCES weddings(company_id,id),
  FOREIGN KEY(company_id,wedding_id,invitation_id) REFERENCES invitations(company_id,wedding_id,id)
);
CREATE INDEX media_by_wedding ON media_resources(company_id,wedding_id,status);
-- No binary files in Turso: storage_key refers to separately authorized object storage.
-- All server reads/writes include company_id AND wedding_id.
-- RSVP and guest reads additionally scope invitation_id, derived from opaque token resolution.
