# Tolgee Alt Overlay and Self-Hosting

Tolgee has two separate pieces:

1. The Tolgee Platform is the management UI, API, and PostgreSQL-backed translation
   store. Deploy it on any reachable Linux server, NAS, or private network.
2. The Alt/Option in-context editor is `@tolgee/web`'s `DevTools`/
   `InContextTools` plugin. It runs inside the website being reviewed; it is not a
   standalone page served by port 8085.

Recommended topology:

```text
translator
  -> https://translation-editor.example.com
       protected copy of the website with DevTools enabled
       apiUrl = https://tolgee.example.com
  -> https://tolgee.example.com
       self-hosted Tolgee Platform + PostgreSQL

public website
  -> static translation bundles only
```

The editor deployment lets a translator hold Alt/Option, hover a translated
string, click it, and save the change in its rendered context. The public
website should not include a write-capable project key or the full in-context
editor. For production-page editing, the official browser-extension workflow is
the safer alternative.

The existing repository already has the two local pieces:

- `bun run tolgee:server` starts `tolgee.jar` on port `8085`.
- `components/TolgeeWrapper.tsx` installs `DevTools()` in the browser.

For a shared installation, run the JAR or the official Tolgee Docker image on a
server with persistent PostgreSQL, put it behind HTTPS and authentication, and
point the editor build at it:

```text
NEXT_PUBLIC_TOLGEE_API_URL=https://tolgee.example.com
NEXT_PUBLIC_TOLGEE_PROJECT_ID=<project-id>
NEXT_PUBLIC_TOLGEE_API_KEY=<scoped-project-api-key>
```

Do not embed a personal access token in browser code. Protect the editor
deployment with login, VPN, IP restrictions, or equivalent access control.
Configure Tolgee's public frontend URL; configure a separate backend URL only
when the API and management UI use different public URLs. The two services do
not require Cloudflare.

## Primary sources

- [Tolgee JS `InContextTools`](https://github.com/tolgee/tolgee-js/blob/main/packages/web/src/package/InContextTools.ts)
- [Tolgee in-context editing documentation](https://github.com/tolgee/documentation/blob/main/js-sdk/in_context.mdx)
- [Tolgee Docker self-hosting](https://github.com/tolgee/documentation/blob/main/platform/self_hosting/running_with_docker.mdx)
- [Tolgee Java self-hosting](https://github.com/tolgee/documentation/blob/main/platform/self_hosting/running_with_java.mdx)
- [Tolgee API keys and PATs](https://github.com/tolgee/documentation/blob/main/platform/account_settings/api_keys_and_pat_tokens.mdx)
- [Tolgee public URL configuration](https://github.com/tolgee/tolgee-platform/blob/main/backend/data/src/main/kotlin/io/tolgee/configuration/tolgee/TolgeeProperties.kt)
