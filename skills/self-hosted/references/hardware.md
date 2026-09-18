# Hardware, GPUs, Drivers, and Network

Every figure here is from Deepgram's published documentation. Anything not listed — concurrency targets, per-GPU `max_streams`, sizing for a specific throughput — is a Support conversation, not a guess. The docs say so explicitly and repeatedly.

## GPU support

NVIDIA GPUs only. Dedicated GPUs only: **Multi-Instance GPU (MIG) and partial or fractional GPUs are not supported.**

| Model | T4 | A10 / A10G | L4 | L40S | A100 | H100 | Blackwell |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| Nova-3, Nova-2 STT | yes | yes | yes | yes | yes | yes | yes |
| Aura-1, Aura-2 TTS | yes | yes | yes | yes | yes | yes | yes |
| Flux STT | **no** | yes | yes | yes | yes | yes | yes |
| Flux TTS | **no** | **no** | yes | yes | yes | yes | yes |

- **Flux STT** requires Ampere generation or newer. The T4 is incompatible on compute capability.
- **Flux TTS** runs on L4, L40S, A100, H100, and Blackwell. Contact Support before provisioning any other GPU for it.

## Drivers: `>=580`, open kernel modules

Engine is built against CUDA 13, and NVIDIA's CUDA 13 support begins at the `580` driver branch. Driver `>=580` is the minimum for **every** GPU in the table, and it must be the **open** kernel-module flavor, for example `nvidia-driver-580-open`, not the proprietary build.

On Blackwell this is decisive: NVIDIA never added Blackwell support to the proprietary `580` branch, so a Blackwell GPU on that driver is not visible to the host at all.

Validate the host before you deploy anything, using the script Deepgram publishes:

```bash
curl -sSLO https://raw.githubusercontent.com/deepgram/self-hosted-resources/main/diagnostics/dg_validate_nvidia_setup.sh
bash dg_validate_nvidia_setup.sh
```

See [Drivers and Containerization Platforms](https://developers.deepgram.com/docs/drivers-and-containerization-platforms) for install and verification steps.

## Per-component minimums

These are baseline recommendations for a single container. Scale out by request volume.

### STT Engine — per machine

- 1 NVIDIA GPU, compute capability `7.0+`, 16 GB GPU RAM
- 4 CPU cores
- 32 GB system RAM — possibly 16 GB with very few models loaded, but confirm with Support
- 50 GB storage; more for multiple STT models
- Cloud recommendation: NVIDIA L4 — AWS `g6.2xlarge`, GCP `g2-standard-8`. Also common: A10, L40S; Azure `Standard_NV36ads_A10_v5`

### TTS Engine (Aura, Aura-2) — per machine

- **2 NVIDIA GPUs per Engine — required, not a minimum.** A device-count requirement: one larger GPU does not substitute for two, and one Engine will not schedule across more than two. Additional GPU pairs let you run additional Engine instances.
- Compute capability `7.0+`, 16 GB GPU RAM per GPU (32 GB total)
- 8 CPU cores
- 64 GB system RAM
- 50 GB storage; more for multiple TTS models
- Cloud recommendation: NVIDIA L4 — AWS `g6.12xlarge` (4 L4s, so multiple Engines), GCP `g2-standard-24` or `g2-standard-48`; Azure `Standard_NV72ads_A10_v5`

### Flux TTS Engine — per machine

Different shape from Aura. **One** GPU per Engine, from the Flux TTS-supported set only.

- At least **64 GB system RAM**: the Engine allocates up to 60 GB while loading the model at startup. Size against that startup peak, not steady state — an Engine that cannot allocate it fails to load and exits. This is system RAM, not GPU memory.
- AWS `g6.4xlarge` (one L4, 64 GB RAM) meets the requirement.
- Exposing more GPUs to one Flux TTS Engine does not raise its capacity. Run one Engine per GPU, pinning each with `CUDA_VISIBLE_DEVICES`.

### API

Can share a machine with an Engine. On its own machine, for load-balancing across many Engines:

- 4 CPU cores
- 16 GB system RAM

One API pod typically fronts several Engine pods, so run fewer API replicas than Engine replicas.

### License Proxy

At least 5 GB RAM. Deploy as a fixed-scale one or two instances per environment regardless of how far API and Engine scale — do not autoscale it.

## Platform

- **Architecture:** Linux on `x86-64` / `amd64` only. Anything else requires a conversation with Support.
- **Operating systems officially supported:** Ubuntu Server 22.04 / 24.04, RHEL 8 / 9, Oracle Linux 8 / 9.
- **Container orchestration officially supported:** Docker, Podman, Kubernetes. Note Docker Engine itself is not supported on RHEL or Oracle Linux — use Podman there.
- **Clouds with dedicated guides:** AWS, GCP, Oracle Cloud Infrastructure, Azure. Others work; there is just no custom guide.
- **TLS termination is yours.** Deepgram expects a customer-provided proxy — NGINX, HAProxy, Apache.

## Networking

### Ingress

Deepgram's servers never initiate a connection into your environment. All ingress from Deepgram can be deny-listed. To let your own applications in, see [Ingress Authentication](https://developers.deepgram.com/docs/self-hosted-ingress-auth).

### Egress

Two destinations, both HTTPS on port `443`:

| Destination | Why | Avoidable? |
|---|---|---|
| `quay.io` | Pulling container images | Yes — mirror images into a private registry |
| `license.deepgram.com` | Licensing and usage reporting, continuously | Only with the License Proxy (one egress point) or the Billing container (air gap) |

Deepgram publishes no static IP list for the license server — allow-list the hostname. Containers respect the standard `HTTPS_PROXY` and `ALL_PROXY` environment variables if you route through a firewall or proxy.

The license connection uses **mTLS**. Probing it with `curl` or an HTTP/SSL scanner such as Qualys SSL Labs produces spurious errors; that is correct behavior and not a fault.

No inference data ever leaves the environment. License messages carry no audio, text, or transcripts.

### Intra-network and default ports

From the template TOML files in `common/standard_deploy/`:

| Service | Port | Purpose |
|---|---|---|
| API | `8080` | Client requests (`[server] port`) |
| Engine | `8080` | API-to-Engine traffic (`[server] port`) |
| Engine | `9991` | Metrics (`[metrics_server] port`) |
| License Proxy | `8443` | License verification from Deepgram containers (`[server] port`) |
| License Proxy | `8080` | Health and status, `/v1/status` (`status_port`) |

If API and Engine are on separate hosts, open port `8080` between them, and from wherever clients originate.

## Graceful shutdown

On `SIGTERM`, API and Engine stop accepting new requests but keep running until in-flight requests finish. Batch requests finish in roughly 10–15 minutes; **streaming requests can run indefinitely**. The Helm chart exposes `global.outstandingRequestGracePeriod` to bound how long Kubernetes waits before forcing termination. Set it deliberately for streaming workloads.

## Load testing

`deepgram/self-hosted-resources` ships k6 scripts under `benchmarking/`: `batch/k6batch.js`, `streaming/k6streaming.js`, and `tts/k6tts.js`, plus Python plotting helpers for TTS latency and throughput. Use these to find your real `max_streams` and `max_batch_size` rather than guessing, and to confirm the values your account representative recommends.
