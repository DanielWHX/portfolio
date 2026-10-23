# v0.2.0 deployment · 2026-10-21

## Result

Published to https://hongxiangwang1017.com/chat. Public acceptance completed at 18:13 Asia/Shanghai. PR #18 merged as `36e6ab6cd94fe426d8f61f464187a8b258cd7264`; this is the feature source revision recorded on the production image.

The build used two deployment changes, now retained in Git: repair missing optional `@emnapi` lockfile entries for Linux `npm ci`, and skip the Sites preview plugin when `PORTFOLIO_DEPLOY_TARGET=node`. No application feature was changed during deployment. Server copies of both patches are retained in the backup directory below.

## Runtime

- Host: Tencent Lighthouse, Silicon Valley, Ubuntu 24.04.4 LTS.
- Source: `/home/ubuntu/apps/portfolio-releases/36e6ab6` (isolated worktree; original checkout and its local changes preserved).
- Compose: `/home/ubuntu/apps/portfolio/compose.vps.yaml`; build context now points to that release directory.
- Image tag: `portfolio-vps-web:release-36e6ab6`, also tagged `portfolio-vps-web:local` for the existing Compose service.
- Image ID: `sha256:3897eb27c2a3cac5fa27d037a6f2a44abe4a25a936ca7c0242b38a27e33f936f`.
- Container: `portfolio-vps-web-1`, healthy, `127.0.0.1:3000 -> 3000`, memory 1,073,741,824 bytes, restart `unless-stopped`.
- Existing Nginx and HTTPS configuration retained. Existing server secret file was reused; local credentials were not uploaded or committed.
- Preflight: approximately 2.6GiB available RAM and 44GiB free disk. No whole-server reboot was performed.

## Validation

Before the switch, the candidate on `127.0.0.1:3003` returned 200 for the three public pages and seven gym sprites; real Fun Facts and Luca requests passed using the server's existing API credentials.

After the switch, an independent browser tested the public website without mocks:

- `/`, `/chat`, `/gym` and all seven `/gym/*.png` returned HTTPS 200. HTTP and HTTPS www returned 301.
- Fun Facts returned a real AI summary and the four compact destinations. TopGym remained collapsed until selected; Whatnot and Footprints remained Coming soon.
- First Fun Facts click, repeat click, reload and another click produced exactly one `/api/chat` request. Suggested questions use their own endpoint.
- TopGym displayed 200/160/200 kg and 560 kg total; three successful reps lit three stars. Game interactions produced zero API requests.
- The real Luca reply stated Bichon Frise and 11 years old as reported on October 21, 2026.
- A fresh Me request kept the Profile Card's original Fitness and SaaS companies tags, without pet or family additions.

The Linux Docker build passed after the lockfile repair. The final local build and 22 API checks passed again. Earlier feature validation completed TypeScript and 57 browser checks; those mock checks are separate from the public real-model acceptance above.

## Recovery and cleanup

Backup directory: `/home/ubuntu/deploy-backups/portfolio-20261021-v020`.

It contains the previous Docker/Compose configuration, previous runtime metadata, previous deployment diff, both new build patches, candidate/public acceptance JSON, and `rollback.sh`.

To restore the previous production image from an authenticated server terminal:

```sh
sh /home/ubuntu/deploy-backups/portfolio-20261021-v020/rollback.sh
```

The rollback script retags `portfolio-vps-web:rollback-20261021-v020` (old image `b1864f148677`) as `portfolio-vps-web:local` and recreates only the web service with `--no-build --pull never`, waiting for health. It does not change secrets or delete data. The script was saved; a production rollback was not exercised.

Both `portfolio-candidate-v020` and the previously deferred `portfolio-candidate-25959dd` were removed after acceptance. The one-use SSH public key was removed from `authorized_keys`; existing keys, passwords and firewall rules were preserved.

For the next release, build an isolated immutable source directory, validate it on a local-only port, retain the old image/configuration, then update the Compose build context and switch the image. Updating GitHub alone does not deploy this server.

## 2026-10-23 · JChatMind live-demo connection

This was a runtime configuration update, not a new Portfolio source release. Production still runs `36e6ab6cd94fe426d8f61f464187a8b258cd7264` / v0.2.0, image `sha256:3897eb27c2a3cac5fa27d037a6f2a44abe4a25a936ca7c0242b38a27e33f936f`. The local Question Bank branch remains unpublished; its code and draft snapshot were not included.

The existing private server environment file gained only the non-secret setting `JCHATMIND_DEMO_URL=https://demo.hongxiangwang1017.com/demo`. The existing web service was recreated without building a new image, using `/home/ubuntu/apps/portfolio/compose.vps.yaml`. The container is healthy and public `/chat` returns HTTP 200. Other production source and configuration differences were not changed by this update.

The original JChatMind application at revision `ead9d44` was deployed separately on the same Tencent Lighthouse host, `43.173.88.200`. PostgreSQL/pgvector, Ollama, Spring Boot API and the guest web service are healthy; the web port is bound only to `127.0.0.1:8082` behind the existing host Nginx and HTTPS configuration. The Portfolio entry at `/projects/jchatmind` now receives the verified HTTPS `/demo` URL for its existing inline guest experience.

Deployment acceptance established:

- Five real RAG checks passed: eight-person Team plan at USD 144/month; twelve-person follow-up at USD 216/month; date-tool result `2026-10-23` plus 14 calendar days yielding `2026-11-06`; undocumented SAML SSO retained as unknown; customer reply remained an unsent draft.
- Guest-session isolation and rejection of unauthenticated administrator access passed.
- The API/HTTPS checks establish backend availability and behavior. Public Demo browser automation was explicitly rejected by automatic approval review, so browser visual acceptance and the embedded desktop/mobile experience remain unverified in this deployment. No alternative browser route was used to bypass that rejection.

The recorded replay remains available independently of the live service. To disable the new connection, remove only `JCHATMIND_DEMO_URL` from the private server environment and recreate the same Portfolio web image without a build; the existing unavailable-state/replay experience will return. This fallback was documented, not exercised against production. JChatMind data volumes and credentials must be preserved.
