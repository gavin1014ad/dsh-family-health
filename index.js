/**
 * Host half of the Family Health bundle.
 *
 * The whole manager is a browser-side surface: member profiles, exam records,
 * and lab markers live in this browser's IndexedDB (with seed data shipped in
 * the client bundle). The empty Host half keeps the browser package
 * addressable in the profile overlay.
 */
export function apply() {}
