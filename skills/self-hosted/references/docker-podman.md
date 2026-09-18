# Docker and Podman Compose

Single-host deployment from Deepgram's official Compose templates. Read [hardware.md](hardware.md) first and validate the GPU host — a wrong driver is the most common first-day failure.

## Available templates

In [`deepgram/self-hosted-resources`](https://github.com/deepgram/self-hosted-resources):

| File | Services | Notes |
|---|---|---|
| `docker/docker-compose.standard.yml` | api, engine | Direct licensing to `license.deepgram.com` |
| `docker/docker-compose.license-proxy.yml` | api, engine, license-proxy | Production shape |
| `docker/docker-compose.aura-2.yml` | Aura-2 TTS | |
| `docker/docker-compose.aura-2-polyglot.yml` | Aura-2 Dutch, German, French, Italian, Japanese | |
| `docker/docker-compose.flux-tts.yml` | api, engine, license-proxy | Includes `CUDA_VISIBLE_DEVICES` pinning |
| `podman/podman-compose.{standard,license-proxy,aura-2,flux-tts}.yml` | same | Podman uses `devices: [nvidia.com/gpu=all]` instead of `runtime: nvidia` |

The directory READMEs list only the standard and license-proxy templates; the Aura-2 and Flux TTS files exist in the tree but are not yet linked from the README. Browse the directory rather than trusting the README's contents list.

Matching TOML configuration lives in `common/`:

- `common/standard_deploy/` — `api.toml`, `engine.toml` license directly to `license.deepgram.com`
- `common/license_proxy_deploy/` — same files pointed at a local License Proxy, plus `license-proxy.toml`

Per-product variants exist in both directories: `api.flux.toml`, `engine.flux-en.toml`, `engine.flux-multi.toml`, `api.flux-tts.toml`, `engine.flux-tts.toml`, `api.aura-2-en.toml`, `engine.aura-2-es.toml`, `*.aura-2-polyglot.toml`.

**Pair the config directory to the Compose file.** A License Proxy Compose file with `standard_deploy` configs starts a proxy that nothing uses, and API and Engine will still call out to `license.deepgram.com` directly.

## Walkthrough

```bash
# 0. Authenticate to Quay with your distribution credentials
docker login quay.io

# 1. Layout
mkdir -p ~/deepgram/config ~/deepgram/models && cd ~/deepgram

# 2. Choose a deployment type
DEPLOY_TYPE="standard"          # or "license-proxy"

# 3. Download templates and configs
BASE_URL="https://raw.githubusercontent.com/deepgram/self-hosted-resources/refs/heads/main"
curl -sSL "$BASE_URL/docker/docker-compose.$DEPLOY_TYPE.yml" -o config/docker-compose.yml

DEPLOY_DIR="${DEPLOY_TYPE//-/_}_deploy"
for f in api.toml engine.toml; do
  curl -sSL "$BASE_URL/common/$DEPLOY_DIR/$f" -o "config/$f"
done
[ "$DEPLOY_TYPE" = "license-proxy" ] && \
  curl -sSL "$BASE_URL/common/$DEPLOY_DIR/license-proxy.toml" -o config/license-proxy.toml

# 4. Repoint the placeholder paths in the template
sed -i 's#/path/to/\(api\|engine\|license-proxy\).toml#./\1.toml#' config/*.yml
sed -i 's#/path/to/models#../models#' config/*.yml

# 5. Download the .dg model files your account representative sent you
#    (put the links in model_links.txt, one per line)
wget --directory-prefix models --input-file model_links.txt

# 6. Export the self-hosted API key and start
export DEEPGRAM_API_KEY="<your self-hosted API key>"
cd config
sudo --preserve-env=DEEPGRAM_API_KEY docker compose up -d
```

Without `sudo`, plain `docker compose up -d` works. With `sudo`, `--preserve-env=DEEPGRAM_API_KEY` is mandatory — the templates interpolate `${DEEPGRAM_API_KEY}` and `sudo` otherwise strips it, giving you containers that start and then fail licensing.

For Podman substitute `podman login`, `podman-compose`, and the `podman/` template path.

## What the templates set, and why

```yaml
environment:
  DEEPGRAM_API_KEY: "${DEEPGRAM_API_KEY}"
  DEEPGRAM_DEPLOYMENT_ORCHESTRATOR: "docker-compose"   # or "podman-compose"
  NVIDIA_VISIBLE_DEVICES: all
  NVIDIA_DRIVER_CAPABILITIES: compute,utility
```

`NVIDIA_VISIBLE_DEVICES` and `NVIDIA_DRIVER_CAPABILITIES` are not optional decoration. The nvidia-container-runtime injects CUDA libraries only when both are set; without them Engine exits with `libcuda.so.1: cannot open shared object file`.

GPU access differs by runtime: Docker uses `runtime: nvidia`, Podman uses `devices: - nvidia.com/gpu=all`.

Volume mounts use the `:ro,Z` suffix. The `Z` relabels for SELinux, which matters on RHEL and Oracle Linux. Keep it.

The in-container config path must match the `command`, which is `-v serve /api.toml` (or `/engine.toml`, `/license-proxy.toml`). The in-container models path must match `engine.toml`, default `/models`.

## Verify

```bash
docker ps                     # all Deepgram containers Up
docker logs <container-id>    # look for successful model loads and licensing

# STT
wget https://dpgr.am/bueller.wav
curl -X POST --data-binary @bueller.wav \
  "http://localhost:8080/v1/listen?model=nova-3&smart_format=true"

# TTS
curl -X POST -H "Content-Type: application/json" \
  --output tts-test.wav \
  -d '{"text":"This is a TTS self-hosted test."}' \
  "http://localhost:8080/v1/speak?model=aura-2-thalia-en"

# License Proxy status, if deployed (host 8089 in the template maps to container 8080)
curl -s http://localhost:8089/v1/status | jq
```

Use `http://` and `ws://` until you have put your own TLS-terminating proxy in front of the API container.

Parse noisy Engine logs with the published helper:

```bash
curl -sSLO https://raw.githubusercontent.com/deepgram/self-hosted-resources/main/diagnostics/dg_log_parser.sh
```

## Flux STT on Compose

No dedicated Flux STT Compose template ships today — use the standard or license-proxy template with the Flux TOML variants (`api.flux.toml`, `engine.flux-en.toml` or `engine.flux-multi.toml`).

Engine configuration:

```toml
[flux]
enabled = true
max_streams = 0        # placeholder — Engine needs a real value; ask your account rep
model_name = "flux-general-en"   # or "flux-general-multi"
```

API configuration. `api.flux.toml` ships `listen_v2 = true`, while the base `api.toml` ships `listen_v2 = false` — which is why using the Flux variant matters. `listen_v2_force_end_turn` is **not in any shipped template** — it is documented only on the [Flux self-hosted page](https://developers.deepgram.com/docs/flux-self-hosted), so add it by hand if you want it:

```toml
[features]
listen_v2 = true
# Optional, and absent from every template in common/ — add it yourself.
# Enables the ForceEndTurn control message so your client can end a turn
# instead of waiting for model-detected end of speech. Omit if you don't need it.
listen_v2_force_end_turn = true
```

Constraints that bite:

- Requires image `release-251015` or later.
- Engine loads exactly one Flux model. `model_name` defaults to `flux-general-en` if unset. For both English and multilingual, run two Engines.
- The Engine must be dedicated to Flux. Flux allocates GPU memory on startup, by default all of it. A Nova-3 request to the same GPU produces CUDA out-of-memory errors.
- Flux needs and tolerates no companion models — no diarizer, no entity detector.
- Leaving `max_streams` auto-calculated causes agents to stall, calls to drop, and `audio_window_end increased by more than 3 frames` in API logs. Lower it and re-test until latency stabilises.
- Monitor via the Engine metrics endpoint: `flux_max_streams`, `flux_used_streams`, `flux_fraction_streams`.

Confirm the model loaded in Engine logs:

```
INFO impeller::flux::prewarm: Finished prewarming Flux model
```

`Can't find flux-general-en model` means the `.dg` file is missing from the models directory — that file comes from your account representative.

## Flux TTS on Compose

Use `docker/docker-compose.flux-tts.yml` with `common/license_proxy_deploy/` configs (that template runs a License Proxy).

The two `engine.flux-tts.toml` templates already set `enabled = true` and a real model `uuid`; only `max_batch_size` is a placeholder you must replace.

```toml
# engine.flux-tts.toml, as shipped
[flux_tts]
enabled = true
uuid = "f94b1bd5-5f6d-4e41-bbda-b326273386c0"   # shipped value, not a placeholder
max_batch_size = 0   # placeholder — Engine will NOT start until this is non-zero

# api.flux-tts.toml, as shipped
[features]
speak_v2 = true
speak_v2_streaming = true
```

Treat the checked-in `uuid` as the value for the release the template was cut against, not as permanent: confirm it against the release you are deploying. The template's own comment says to obtain the UUID from your account representative, and the Helm chart (`fluxTts.uuid`) and the docs page both leave it empty.

- Requires image `release-260812` or later.
- Needs at least 64 GB system RAM on the host (60 GB startup allocation).
- Pin the Engine to one GPU with `CUDA_VISIBLE_DEVICES: "0"`. For more GPUs, copy the `engine` service once per GPU with a different index.
- Flux TTS and Aura cannot share an Engine — Engine refuses to start if both are configured.
- `speak_v2` is batch REST; `speak_v2_streaming` is the WebSocket. Both are served on the API port.

Test:

```bash
curl -X POST -H "Content-Type: application/json" --output flux-tts-test.mp3 \
  -d '{"text":"This is a Flux TTS self-hosted test."}' \
  "http://localhost:8080/v2/speak?model=flux-haley-en"

wscat -c "ws://localhost:8080/v2/speak?model=flux-haley-en"
# {"type": "Speak", "text": "This is a Flux TTS self-hosted test."}
# {"type": "Flush"}
```

On FIPS images, MP3 and FLAC output is a known issue — set `encoding` explicitly on batch `/v2/speak` requests, which default to MP3. Streaming is unaffected.

## Sources

- Docker/Podman overview: https://developers.deepgram.com/docs/dockerpodman
- Deploy STT services: https://developers.deepgram.com/docs/deploy-stt-services
- Deploy TTS services: https://developers.deepgram.com/docs/deploy-tts-services
- Deploy Deepgram services: https://developers.deepgram.com/docs/deploy-deepgram-services
- Flux STT self-hosted: https://developers.deepgram.com/docs/flux-self-hosted
- Flux TTS self-hosted: https://developers.deepgram.com/docs/deploy-flux-tts
- Per-cloud and bare metal: https://developers.deepgram.com/docs/aws-docker-podman, https://developers.deepgram.com/docs/gcp-docker-podman, https://developers.deepgram.com/docs/oci-docker-podman, https://developers.deepgram.com/docs/azure-docker-podman, https://developers.deepgram.com/docs/bare-metal
- Templates: https://github.com/deepgram/self-hosted-resources/tree/main/docker and `/podman`, `/common`, `/diagnostics`
