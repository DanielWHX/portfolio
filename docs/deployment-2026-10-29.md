# Production deployment · 2026-10-29

## Status: live; acceptance and cleanup completed

The owner authorized deployment of the latest Portfolio and installed a restricted, two-hour temporary SSH authorization in their authenticated Tencent OrcaTerm terminal. The current source is now running at https://hongxiangwang1017.com/chat.

- Verified source: `018a0d36ebe27735e8dcd403108dee5ced933422`. Package version is `0.2.4`; this deployment additionally includes the local Fun Facts photo-collection commits. No new GitHub Release was created by this deployment.
- Production switch: `2026-10-29T09:31:43Z` / 2026-10-29 17:31:43 Asia/Shanghai.
- Content: refined visuals and AI motion, Big Three video tabs, contact feedback, unchanged single skydiving cover and the 29-photo collection with sequential card movement and full-frame viewing.

## Runtime and recovery

- Host: existing Tencent Lighthouse Ubuntu server `43.173.88.200`.
- Immutable source: `/home/ubuntu/apps/portfolio-releases/018a0d3`.
- Compose: `/home/ubuntu/apps/portfolio/compose.vps.yaml`, web service only; its build context now points to the source above.
- Live image: `sha256:63f8eac1e37864f9a106e865ce6d3d961708f74af2a2aca6c7d0db811053b2c0`; healthy, OCI source-revision label matches `018a0d36ebe27735e8dcd403108dee5ced933422`.
- Production remains bound to `127.0.0.1:3000`, with the existing 1 GiB container limit and Nginx/HTTPS configuration.
- The server's existing private runtime environment was reused; local credentials were excluded from the archive. `JCHATMIND_DEMO_URL=https://demo.hongxiangwang1017.com/demo` was verified retained.
- Before deployment the running package was `0.2.3`, image `sha256:ea43b243cffccb727864243a789345aa453a5c25004c1e280546870c5eedd8bf`. It is retained as `portfolio-vps-web:rollback-20261029-018a0d3`.
- Private backup: `/home/ubuntu/deploy-backups/portfolio-20261029-018a0d3`. It contains the original Compose, build files, runtime environment backup, acceptance reports and `rollback.sh` (mode 700). Credential-bearing backup files must stay private.
- Recovery, from an authenticated server terminal: `bash /home/ubuntu/deploy-backups/portfolio-20261029-018a0d3/rollback.sh`. This restores the old Compose/image and recreates only Portfolio web. Saved but not exercised against production.

The four JChatMind containers retained their exact container IDs and image IDs and remained healthy. No JChatMind rebuild, restart, volume change, firewall change or whole-server reboot occurred.

## Evidence

- Fresh build, 30 mocked API checks and 103 browser checks passed before deployment. The separate Node-target build also passed. These mocked checks are distinct from real production API acceptance.
- Immutable Git archive: 243 entries, 29.06 MiB, SHA-256 `5e792b30148d5834f800582cb5f92c8871bf61bbfba6d305a182d3f08166b440`. Local env files, node_modules, dist and Git metadata were excluded and checked.
- Reused the existing Linux Dockerfile and dockerignore; Linux candidate build passed. Candidate was exposed only on `127.0.0.1:3003` and passed health before switching production.
- Candidate and public acceptance: `/`, `/chat`, `/gym`, `/projects/jchatmind`, `/projects/lyntra` returned 200; development previews `/preview/chat` and `/preview/fun-facts` returned 404.
- Candidate and public SHA-256 checks matched all 64 selected assets: 56 new gallery JPEGs, the unchanged cover, AI motion sprite, three training videos and three posters.
- Real candidate and public Fun Facts answers and follow-up generation passed. Public response times in this run were 2.52 seconds and 2.05 seconds respectively, not performance guarantees. The initial follow-up probe omitted its preceding user message and correctly received 400; the acceptance script was corrected, and the valid request passed without an application change.
- Independent public Chrome check at 1280px and 390px: exactly one cover image; five fan cards in sequential visual order; image load and full-frame view; Escape, focus and draft restoration; no horizontal overflow or page errors. Both viewport passes together generated one real chat answer; gallery interactions made no extra chat requests. Screenshots and report were retained in the private local deployment audit directory, and the browser report was also saved in the server backup.
- Final state after candidate removal: Portfolio and all four JChatMind containers healthy; Nginx configuration test passed; approximately 2.3 GiB available RAM and 29 GiB free disk.

## Cleanup

The candidate container was removed after public acceptance. The exact temporary SSH authorization was removed while preserving other keys; an independent login was rejected with `Permission denied (publickey,password)`. The local private key was then deleted. The rollback image and private server backups remain.
