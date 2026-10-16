# LOST / FOUND

A responsive lost and found community board. It supports lost and found reports, keyword search, filters, and contact links.

## Start it

Open `index.html` in a browser, or serve this folder with any static web server. Without Supabase configured, reports are saved in that browser's local storage (useful for a quick preview, not shared between people).

## Make the board shared

1. Create a Supabase project.
2. In its SQL Editor, run the contents of `supabase.sql`.
3. Copy the project URL and public anon key from Project Settings → API into `config.js` (`supabaseUrl` and `supabaseAnonKey`). The anon key is intended for browser use; never put a service role key in this file.
4. Publish the folder with GitHub Pages, Netlify, or Vercel. `index.html`, `styles.css`, `app.js`, and `config.js` must be served from the same site.

## Collaborate

Push this folder to a GitHub repository and invite your friend under repository Settings → Collaborators. Both of you can make changes in separate branches and merge them through pull requests.

## Data and privacy

Lost and found posts are public. The current quick-start schema exposes the contact field to visitors so they can arrange a return. For a public launch with sensitive contact details, add authentication and a private contact handoff before collecting real personal information.
