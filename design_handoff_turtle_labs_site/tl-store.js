// ============================================================
// Turtle Labs — SHARED CONTENT STORE + STUDIO ACCESS
//
// One module sits between `tl-content.js` (the shipped defaults)
// and every page. The CMS publishes here; Home, Works and Journal
// read from here, so a CMS edit shows up on the public pages.
//
// Persistence is localStorage, scoped to the origin — good enough
// for a static handoff with no backend. Swap `readOverrides` /
// `writeOverrides` for API calls when a real backend lands.
//
//   import { loadContent, publishContent } from './tl-store.js'
// ============================================================

import { TL_CONTENT } from './tl-content.js';

const CONTENT_KEY = 'tl-cms-content-v1';
const DRAFT_KEY   = 'tl-cms-draft-v1';
const SESSION_KEY = 'tl-cms-session-v1';
const CHANGE_EVENT = 'tl-content-change';

// Sections the CMS owns. Anything else falls through to tl-content.js.
export const EDITABLE_SECTIONS = ['works', 'featured', 'journal', 'reviews', 'logos'];

// ---- STUDIO ACCESS ---------------------------------------------------
// Separate from the public site: the pages are open, the Studio is not.
//
// NOTE: this is a client-side gate for a static build. The accounts are
// visible in source, so it keeps the Studio out of casual reach — it is
// not a security boundary. Move this check server-side before go-live.
export const TL_ACCOUNTS = [
  { email: 'admin@turtlelabs.co.in',  password: 'TurtleCMS@2026',  name: 'Studio Admin',    role: 'admin',  initials: 'SA' },
  { email: 'editor@turtlelabs.co.in', password: 'TurtleEdit@2026', name: 'Content Editor',  role: 'editor', initials: 'CE' }
];

export const ROLE_LABELS = { admin: 'Administrator', editor: 'Editor' };

// What each role may do. Editors write content; only admins remove it
// or change what the homepage leads with.
export const ROLE_RIGHTS = {
  admin:  { edit: true, delete: true, featured: true, reset: true },
  editor: { edit: true, delete: false, featured: false, reset: false }
};

const SESSION_HOURS = 12;

function safeParse(raw) {
  if (!raw) return null;
  try { return JSON.parse(raw); } catch (e) { return null; }
}

// ---- content -------------------------------------------------------

function readOverrides() {
  const rec = safeParse(localStorage.getItem(CONTENT_KEY));
  return rec && rec.data && typeof rec.data === 'object' ? rec : null;
}

function writeOverrides(data) {
  const rec = { version: 1, savedAt: new Date().toISOString(), data };
  localStorage.setItem(CONTENT_KEY, JSON.stringify(rec));
  return rec;
}

/** Shipped defaults, untouched by the CMS. */
export function baseContent() {
  return TL_CONTENT;
}

/** Defaults with any published CMS edits layered on top. */
export function loadContent() {
  const rec = readOverrides();
  if (!rec) return TL_CONTENT;
  const merged = Object.assign({}, TL_CONTENT);
  EDITABLE_SECTIONS.forEach(k => {
    if (Array.isArray(rec.data[k])) merged[k] = rec.data[k];
  });
  return merged;
}

/** True when the live site is running on CMS content rather than defaults. */
export function isPublished() {
  return !!readOverrides();
}

/** ISO timestamp of the last publish, or null. */
export function publishedAt() {
  const rec = readOverrides();
  return rec ? rec.savedAt : null;
}

/**
 * Push CMS state to every page. `partial` holds any of EDITABLE_SECTIONS;
 * sections left out keep whatever was published before.
 * Returns { ok } or { ok:false, error } when the quota is blown.
 */
export function publishContent(partial) {
  const prev = readOverrides();
  const data = Object.assign({}, prev ? prev.data : {});
  EDITABLE_SECTIONS.forEach(k => {
    if (Array.isArray(partial[k])) data[k] = partial[k];
  });
  let rec;
  try {
    rec = writeOverrides(data);
  } catch (e) {
    // Base64 media in localStorage hits the ~5MB origin quota fast.
    const quota = e && (e.name === 'QuotaExceededError' || e.code === 22);
    return { ok: false, error: quota
      ? 'Storage full — uploaded media is too large to publish. Remove a large image or point the field at a file in assets/.'
      : 'Could not publish: ' + (e && e.message ? e.message : 'unknown error') };
  }
  broadcast(rec.savedAt);
  return { ok: true, savedAt: rec.savedAt };
}

/** Drop all CMS edits; every page falls back to tl-content.js. */
export function resetContent() {
  localStorage.removeItem(CONTENT_KEY);
  broadcast(null);
  return { ok: true };
}

// ---- drafts ----------------------------------------------------------
// Studio edits land here first. Nothing reaches the public pages until
// someone hits Publish, so a half-finished work never goes live — and a
// refresh (or a closed laptop) does not lose the work in progress.

/** Save the Studio's working set. Returns { ok } or { ok:false, error }. */
export function saveDraft(partial) {
  const data = {};
  EDITABLE_SECTIONS.forEach(k => { if (Array.isArray(partial[k])) data[k] = partial[k]; });
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ version: 1, savedAt: new Date().toISOString(), data }));
  } catch (e) {
    const quota = e && (e.name === 'QuotaExceededError' || e.code === 22);
    return { ok: false, error: quota
      ? 'Storage full — uploaded media is too large to save. Remove a large image or point the field at a file in assets/.'
      : 'Could not save draft: ' + (e && e.message ? e.message : 'unknown error') };
  }
  return { ok: true };
}

/** The unpublished working set, or null when there is none. */
export function loadDraft() {
  const rec = safeParse(localStorage.getItem(DRAFT_KEY));
  return rec && rec.data && typeof rec.data === 'object' ? rec.data : null;
}

export function clearDraft() {
  localStorage.removeItem(DRAFT_KEY);
}

/** Sections where the draft differs from what is live. */
export function pendingSections(draft) {
  const d = draft || loadDraft();
  if (!d) return [];
  const live = loadContent();
  return EDITABLE_SECTIONS.filter(k =>
    Array.isArray(d[k]) && JSON.stringify(d[k]) !== JSON.stringify(live[k] || [])
  );
}

function broadcast(savedAt) {
  // Other tabs get the native `storage` event; this tab needs a nudge.
  try { window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: { savedAt } })); } catch (e) {}
}

/**
 * Run `cb` whenever content is published — from this tab or another one.
 * Returns an unsubscribe function; call it in componentWillUnmount.
 */
export function onContentChange(cb) {
  const local = () => cb(loadContent());
  const cross = (e) => { if (e.key === CONTENT_KEY) cb(loadContent()); };
  window.addEventListener(CHANGE_EVENT, local);
  window.addEventListener('storage', cross);
  return () => {
    window.removeEventListener(CHANGE_EVENT, local);
    window.removeEventListener('storage', cross);
  };
}

// ---- access --------------------------------------------------------

function publicUser(acct) {
  return { email: acct.email, name: acct.name, role: acct.role, initials: acct.initials };
}

/** Returns { ok:true, user } or { ok:false, error }. */
export function login(email, password) {
  const e = String(email || '').trim().toLowerCase();
  const p = String(password || '');
  if (!e || !p) return { ok: false, error: 'Enter your email and password.' };
  const acct = TL_ACCOUNTS.find(a => a.email.toLowerCase() === e);
  if (!acct || acct.password !== p) return { ok: false, error: 'That email and password do not match a Studio account.' };
  const user = publicUser(acct);
  const session = { user, expiresAt: Date.now() + SESSION_HOURS * 3600 * 1000 };
  try { localStorage.setItem(SESSION_KEY, JSON.stringify(session)); } catch (err) {}
  return { ok: true, user };
}

/** The signed-in user, or null when there is no live session. */
export function currentUser() {
  const s = safeParse(localStorage.getItem(SESSION_KEY));
  if (!s || !s.user || !s.expiresAt) return null;
  if (Date.now() > s.expiresAt) { logout(); return null; }
  return s.user;
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
}

/** Rights for a user object (or the current session when omitted). */
export function rightsFor(user) {
  const u = user || currentUser();
  return ROLE_RIGHTS[u && u.role] || ROLE_RIGHTS.editor;
}
