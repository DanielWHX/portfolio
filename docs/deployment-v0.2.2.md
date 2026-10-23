# v0.2.2 deployment · 2026-10-23

## Status: live; cleanup completed

GitHub PR #21 merged as `4edbc47`; GitHub Release `v0.2.2` was published from source revision `56680e3`. That source is now running on the production website. Candidate and public HTTP/API acceptance passed; public visual acceptance remains incomplete, and the internal candidate has been removed; temporary SSH access has been revoked.

Scope: the previously released v0.2.1 Iron & Concrete gym, modal/video interaction and the v0.2.2 Question Bank follow-up system. The owner authorized release of the latest changes on 2026-10-23; the 40-entry snapshot retains its factual boundaries and does not imply individual owner review of every entry.

## Verified before server deployment

- Build, TypeScript, 29 API checks and 71 local browser checks passed. Lint had no errors and six existing image warnings.
- These local regression checks do not establish production model connectivity or public visual correctness.
- The local real-model request failed with a network connection error. Subsequent real candidate and public requests passed on the server; those successes do not erase the local failure or establish uninterrupted upstream availability.
- Authorized SSH access to Tencent Lighthouse was established at 17:25 Asia/Shanghai on 2026-10-23.
- The source archive was transferred and its hash checked. The target immutable source directory is `/home/ubuntu/apps/portfolio-releases/56680e3`.
- Existing production Compose configuration, environment and image metadata were backed up under `/home/ubuntu/deploy-backups/portfolio-20261023-v022`. Environment backups contain credentials and must remain private; they must not enter Git or public test output.

## Production runtime

| Item | Recorded state |
| --- | --- |
| Host | Tencent Lighthouse, `43.173.88.200` |
| Production source | `56680e3` / v0.2.2 |
| Production image | `sha256:bc9685274000e7fe69d71832e8bb108fa5bb5cbb1aac8a7d077d48814168c10f`, healthy |
| Production Compose | `/home/ubuntu/apps/portfolio/compose.vps.yaml` |
| Production port and limit | `127.0.0.1:3000`, memory limit 1 GiB; existing host Nginx/HTTPS remains in place |
| Candidate source | `/home/ubuntu/apps/portfolio-releases/56680e3` |
| Linux candidate build | Passed; candidate image accepted before production switch |
| Candidate target | Loopback-only `127.0.0.1:3003`, memory limit 1 GiB |
| Candidate real-model checks | Six real requests returned HTTP 200; semantic checks passed |
| Production switch | 2026-10-23 09:44:55 UTC / 17:44:55 Asia/Shanghai; new image is healthy |
| Previous-image recovery tag | `portfolio-vps-web:rollback-20261023-v022` retains previous image `3897eb27c2a3` |
| Internal candidate cleanup | Removed after public acceptance |
| Temporary deployment SSH access | Revoked; independent login rejected with Permission denied; local private key removed |

The separately deployed JChatMind stack remains unchanged. Its four services are healthy, and its web entry is exposed only through loopback `8082` and the existing HTTPS reverse proxy. Preserve `JCHATMIND_DEMO_URL=https://demo.hongxiangwang1017.com/demo` in the Portfolio runtime environment when recreating the candidate or production web service. Do not rebuild or restart the JChatMind stack as part of this Portfolio release.

## Acceptance results

- Six real candidate HTTP requests returned 200, taking 1.73–3.66 seconds in this run. Semantic review confirmed that SSE was described as message-level rather than token streaming; explicit Chinese Lyntra input overrode a stale project hint; the history-query bug was not attributed to Hongxiang personally without evidence; restart recovery remained a proposed improvement using would rather than an existing guarantee.
- Public real follow-up generation returned two distinct angles with references `["qb-26", null]` in 3.03 seconds. Sending the referenced suggestion to `/api/chat` returned a grounded answer and HTTP 200 in 2.89 seconds. These are measured outcomes of this run, not latency guarantees.
- The candidate and public `/`, `/chat`, `/gym` and `/projects/jchatmind` pages returned HTTP 200. The default gym theme is Iron & Concrete, and the configured HTTPS JChatMind Demo URL was preserved.
- SHA-256 checks matched all 13 supplied assets individually: seven PNG sprites, three MP4 training clips and three video covers.
- A video Range request returned HTTP 200, not 206. Native-player seeking and buffering were not additionally verified and are not promised by these asset checks.

Main-site CUA readback timed out. Automatic approval review had separately explicitly rejected OrcaTerm/Demo browser access; those rejections remain in effect and were not bypassed. Public desktop/mobile visual and embedded-browser acceptance is therefore not established. HTTP/API checks and local browser regression results remain separately identified.

## Cleanup and remaining verification

- Internal candidate removal: completed; only the production Portfolio and four JChatMind containers remain.
- Temporary deployment SSH key revoked; independent login returned Permission denied and the local private key was removed. Other login configuration and unrelated keys were preserved.
- Public visual/embedded-browser acceptance: incomplete; main-site readback timed out and the separate approval-review rejections remain effective.

## Recovery

The previous production image `sha256:3897eb27c2a3cac5fa27d037a6f2a44abe4a25a936ca7c0242b38a27e33f936f` remains tagged `portfolio-vps-web:rollback-20261023-v022`. The backup directory `/home/ubuntu/deploy-backups/portfolio-20261023-v022` contains the previous Compose/environment state and a generated `rollback.sh` with permissions `700`. The rollback script was retained but not exercised against production.

Inspect the actual container/image state before using the recovery files. Preserve the private runtime configuration and JChatMind data volumes; do not delete persistent data or overwrite credentials. Production currently runs the new image listed above, not the retained rollback image.

Final host check after candidate removal: approximately 2.3 GiB available RAM, 32 GiB free disk, all five production containers healthy, Nginx configuration test passed. No whole-host reboot or production rollback was performed.
