# Credentials Reference

Actual secret values are **never committed**. They live in
`.credentials/credentials.local.md` on the working machine (gitignored —
see `.gitignore`).

| Service | What's stored locally | Used for |
|---|---|---|
| Airtable | Personal Access Token, Base ID `appmBaUD39bNFM4QA` | All n8n workflows + dashboard |
| n8n | API key (JWT), instance `hkaconnectionsllc.app.n8n.cloud` | Deploying/updating workflows |
| Twilio | Account SID, Auth Token, phone number `+13136311176` | SMS order notifications (`toast_order_push_v1`) |
| Vapi | Private/public keys, assistant ID `b9c95d99-575d-4202-90af-652a19509b8b` | Voice assistant config |
| Vercel | API token, project `beyond-juicery-dashboard` (`prj_5ieT2r9FRhlRJt7IomqqOAOZWcbf`) | Order dashboard hosting — see `scripts/deploy_dashboard_to_vercel.ps1` |
| GitHub | Personal Access Token (dudasolve) | Pushing this repo + `beyond-juicery-dashboard` |

## Live deployments

- Order dashboard: https://beyond-juicery-dashboard.vercel.app

If `.credentials/credentials.local.md` is lost, regenerate tokens from each
service's dashboard and re-paste — nothing depends on a specific file format
beyond this doc's structure.
