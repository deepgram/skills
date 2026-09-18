# Kubernetes and Helm

The production path. Deepgram publishes and maintains the `deepgram-self-hosted` Helm chart. Read [hardware.md](hardware.md) first.

Chart version `0.46.0`, `appVersion` `release-260915`, requiring Kubernetes `>=1.28.0-0` and **Helm 3.7+**. Also listed on [Artifact Hub](https://artifacthub.io/packages/search?repo=deepgram-self-hosted).

## Install

```bash
helm repo add deepgram https://deepgram.github.io/self-hosted-resources
helm repo update
helm install -f my-values.yaml [RELEASE_NAME] deepgram/deepgram-self-hosted --atomic --timeout 45m
```

The long timeout is not padding — model download and load dominates first install.

Upgrade and rollback:

```bash
helm upgrade -f my-values.yaml [RELEASE_NAME] deepgram/deepgram-self-hosted --atomic --timeout 60m
helm rollback deepgram
```

Upgrades are driven by bumping each component's `image.tag`.

> **`release-260115` is a breaking change for TTS deployments.** API-to-Engine communication changed. Deploy the new **Engine before** the new API: the Engine (`3.107.0-1`) is compatible with previous API versions, so it must be running in advance of the updated API (`1.176.0`). Blue-green is one strategy that satisfies the ordering; any strategy that deploys Engine first works. STT-only deployments are unaffected. Source: the [January 15, 2026 changelog](https://developers.deepgram.com/changelog/2026/1/15), restated in the chart README.

## Two secrets you create before installing

The chart takes references, not values:

| Value | Secret holds |
|---|---|
| `global.pullSecretRef` | Quay distribution credentials, as an image-pull Secret |
| `global.deepgramSecretRef` | Your self-hosted API key |
| `global.deepgramLicenseSecretRef` | Air-gapped license file — only when `billing.enabled` |

## Components and their toggles

| Component | Workload | Key values |
|---|---|---|
| API | Deployment | `api.image.tag`, `api.features.*`, `api.service.type`, `api.driverPool.standard.*` |
| Engine | Deployment | `engine.image.tag`, `engine.modelManager.volumes.*`, `engine.concurrencyLimit.activeRequests` |
| License Proxy | Deployment | `licenseProxy.enabled`, `licenseProxy.deploySecondReplica` |
| Billing | StatefulSet | `billing.enabled`, `billing.licenseFile.secretRef`, `billing.journal.*` |

Chart dependencies, pulled in by condition: NVIDIA `gpu-operator` (`^24.3.0`), `cluster-autoscaler` (`^9.37.0`), `kube-prometheus-stack` (`^60.2.0`), and `prometheus-adapter` (`^4.10.0`). The last two are required for pod autoscaling.

All services default to `ClusterIP`. `NodePort` and `LoadBalancer` are available; for `LoadBalancer`, restrict exposure with `loadBalancerSourceRanges` and consider `externalTrafficPolicy: Local` to preserve source IPs.

## Sample values files

In `charts/deepgram-self-hosted/samples/`, the fastest way to a correct configuration:

| Sample | Covers |
|---|---|
| `01-basic-setup-aws.values.yaml` + `.cluster-config.yaml` | EKS baseline |
| `02-basic-setup-gcp.yaml` | GKE baseline |
| `03-basic-setup-onprem.yaml` | On-premises |
| `04-aura-2-setup.values.yaml` | Aura-2 English + Spanish |
| `06-aura-2-polyglot-setup.values.yaml` | Aura-2 Dutch, German, French, Italian, Japanese |
| `05-voice-agent-aws.values.yaml` + `.cluster-config.yaml` | Voice Agent on EKS, dedicated node groups for API, Engine (GPU), License Proxy |
| `voice-agent/aws/self-hosted-llm/` | Voice Agent routed to an in-cluster NVIDIA NIM LLM (Nemotron) |
| `07-basic-setup-aws-airgapped.values.yaml` + `airgapped.md` | Air-gapped EKS with the Billing container |
| `08-flux-tts-setup.values.yaml` | Flux TTS |

```bash
helm install deepgram deepgram/deepgram-self-hosted -f samples/04-aura-2-setup.values.yaml
```

The AWS samples tag resources with `aws-apn-id: pc:ajk5xy316takzneuu4ykhhj8c` for AWS Partner Relationship Management. Metadata only — no cost, no runtime effect — and Deepgram recommends leaving it in place. AWS does not propagate tags across resource types, so load balancers and dynamically provisioned EBS volumes need the tag applied separately if you create them.

## Model storage

Engine needs the `.dg` files on a volume. Three options under `engine.modelManager.volumes`:

- **AWS EFS** (`aws.efs.enabled`) — needs EKS and an existing `fileSystemId`. The chart runs a download Job against the model links you supply and can create the StorageClass. `forceDownload` re-downloads even when models are present.
- **GCP Persistent Disk** (`gcp.gpd.enabled`) — needs GKE and a pre-existing disk `volumeHandle`.
- **Custom PVC** (`customVolumeClaim.enabled`) — anything else, including on-premises. The PV and PVC `accessMode` must be `ReadWriteMany` or `ReadOnlyMany`.

Shared `ReadWriteMany` storage is the recommended default; it also lets the Billing journal live in a subdirectory of the same PVC for zero-downtime retrieval.

## Scaling

Static and automatic scaling are mutually exclusive. Static is `scaling.replicas.api` and `scaling.replicas.engine` (the latter can be per-Engine-type counts when Voice Agent is enabled). Autoscaling requires `scaling.auto.enabled` plus the Prometheus dependencies.

**Engine — hard limit vs soft limit.** This is the decision that determines your failure mode:

- **Hard:** set `engine.concurrencyLimit.activeRequests` plus `scaling.auto.engine.metrics.requestCapacityRatio` (for example `0.8` scales at 80% of the limit). Accepted requests get consistent performance; surplus requests get `429 Too Many Requests` if the cluster cannot scale in time.
- **Soft:** set a `requestsPerPod` target. The chart defines exactly three, all unset by default:
  - `scaling.auto.engine.metrics.speechToText.batch.requestsPerPod`
  - `scaling.auto.engine.metrics.speechToText.streaming.requestsPerPod`
  - `scaling.auto.engine.metrics.textToSpeech.batch.requestsPerPod`

  Nothing is rejected, but per-request performance degrades if load outruns scaling. **There is no `textToSpeech.streaming` metric** — the chart has no soft-limit knob for streaming TTS, and a key invented at that path is silently ignored rather than rejected. For streaming TTS use the hard limit, or `scaling.auto.engine.metrics.custom`.

Pick hard when predictable latency matters more than accepting every request — which is usually true for voice agents.

**API** scales on `scaling.auto.api.metrics.engineToApiRatio` (default `4`). One API pod fronts several Engine pods, so run fewer API replicas. **License Proxy** is fixed-scale — one pod, or two with `licenseProxy.deploySecondReplica: true`. Never autoscale it.

Deepgram recommends **separate environments for batch STT, streaming STT, and TTS** — the latency and throughput tradeoffs differ for each.

`global.outstandingRequestGracePeriod` (default `1800` seconds) bounds graceful shutdown. Batch requests drain in 10–15 minutes; streaming requests can run indefinitely, so this value is what actually terminates them.

## Enabling newer models

| Product | Values |
|---|---|
| Flux STT | Engine `engine.flux.enabled` (default `false`), `engine.flux.max_streams` (unset), `engine.flux.model_name` (default `flux-general-en`), **plus** API `api.features.listenV2: true` (default `false`) |
| Flux TTS | `fluxTts.enabled`, `fluxTts.uuid`, `fluxTts.maxBatchSize`, plus `api.features.speakV2` and `api.features.speakV2Streaming` |
| Aura-2 | `aura2.enabled`, then `aura2.english` / `aura2.spanish` / `aura2.polyglot` |
| Voice Agent | `agent.enabled: true` (default `false`) |

Helm users do not edit Engine TOML directly — the chart renders it. `fluxTts.maxBatchSize` defaults to `0` and Engine will not start until you set a real value; there is no safe default, and the right one differs substantially per GPU. Get it from your account representative, then confirm it with the `benchmarking/tts/` k6 scripts.

**Flux STT is two-sided, and setting only `api.features.listenV2` is a trap.** That flag exposes the `/v2/listen` route; without `engine.flux.enabled` there is no Flux Engine behind it. Set both. Note that `max_streams` and `model_name` are genuinely snake_case, unlike the camelCase used everywhere else in the chart — copy them exactly:

```yaml
engine:
  flux:
    enabled: true
    # Required for production; the chart leaves it unset. There is no published
    # per-GPU table — get the value from your account representative. Matching
    # the docs' convention, 0 stands in for "not yet set".
    max_streams: 0
    model_name: flux-general-en   # or flux-general-multi
api:
  features:
    listenV2: true
```

`engine.flux` (Flux STT) and `fluxTts` (Flux TTS) are unrelated settings for different products. The chart rejects invalid combinations at install time.

Flux TTS binds to a single GPU. Pin it with `fluxTts.cudaVisibleDevices` on multi-GPU nodes, or let `engine.resources.useNvidiaDevicePlugin` handle allocation. To use more GPUs, run one Engine per GPU.

## Voice Agent

`agent.enabled: true`. The Voice Agent API is served by the same `self-hosted-api` container; `/v1/agent/converse` becomes available once STT and TTS Engines are running alongside it.

Models to request from your account representative:

- **STT:** either `flux-general-en.*.dg`, or `nova-3-general.en.streaming.*.dg` **plus** `end-of-turn.*.dg`
- **TTS:** Aura-2 needs `aura-2.voice-pack.en.*.dg` and `aura-2.generator.en.*.dg`; Aura-1 needs `aura-asteria-en.*.dg` and `phonemizer.en.*.dg`

Other knobs: `agent.eotTimeoutMs` (default `3500`), `agent.maxConversationChars` (default `15000`), and `agent.llmProviders.*` for OpenAI, Anthropic, Google, Groq, xAI, and Deepgram models. To reach a plain-HTTP in-cluster LLM such as a self-hosted NIM you must set `agent.allowInsecureEndpoints: true`, and `agent.allowNonpublicEndpoints: true` for non-public URLs. Both default to `false`.

Verify and test:

```bash
kubectl get pods       # api, engine (STT, TTS, EOT), license-proxy all Running
kubectl port-forward svc/deepgram-api 8080:8080
```

Without TLS on the API service, use `http://` and `ws://` — for example `ws://localhost:8080/v1/agent/converse`.

Point an SDK at the deployment instead of `api.deepgram.com`. Python needs a full `DeepgramClientEnvironment`; there is no `base_url` parameter on the v7 client, and `httpx_client` only affects transport concerns:

```python
from deepgram import DeepgramClient
from deepgram.environment import DeepgramClientEnvironment

self_hosted_env = DeepgramClientEnvironment(
    base="http://localhost:8080",
    production="ws://localhost:8080",
    agent="ws://localhost:8080",
    agent_rest="http://localhost:8080",   # requires Python SDK v7.2.0+
)
client = DeepgramClient(api_key=os.getenv("DEEPGRAM_API_KEY"), environment=self_hosted_env)
```

JavaScript accepts a single `baseUrl`:

```javascript
const deepgram = new DeepgramClient({
  apiKey: process.env.DEEPGRAM_API_KEY,
  baseUrl: "http://localhost:8080",
});
```

## Air-gapped deployments

Enable the **Billing** container, which validates a license locally and journals usage instead of calling `license.deepgram.com`.

- Architecture: `API/Engine → Billing`, or `API/Engine → License Proxy → Billing` for HA.
- Obtain from Deepgram: a license key, a license file (`.dg`, a one-line JSON file), and registry access for `quay.io/deepgram/*` including the Billing image.
- Configure `billing.enabled`, `billing.licenseFile.secretRef` (key `license.dg` by default), and `global.deepgramLicenseSecretRef`.
- Billing listens on `8443` for license verification and `8080` for the `/v1/certificates` endpoint.

**The usage journal is contractual.** It must be persisted and returned to Deepgram regularly; losing the volume may suspend service. Shared `ReadWriteMany` storage gives zero-downtime retrieval and supports multiple replicas; block storage (`ReadWriteOnce`) needs roughly 30–60 seconds of downtime per retrieval and supports one replica only. Follow `charts/deepgram-self-hosted/samples/airgapped.md` — it includes a validation checklist and an automated backup pattern.

Mirror images into your own registry and repoint `{api,engine,licenseProxy,billing}.image.path` away from Quay.

## FIPS 140-3

`global.fips.enabled: true` renders `[fips] mode = "enabled"` into every service's config. You must **also** set a `-fips` image tag on every component in the same change — the FIPS images do not enable FIPS mode on their own, and the chart fails at render time if a non-`-fips` or pre-`release-260728` tag is present. Non-official tags are not checked, since private registries use their own naming.

Verify from logs, not from config: each service logs `openssl_fips_enabled` and `has_fips_encryption` at startup, and **both must be true**. A standard image can report `openssl_fips_enabled=true` with `has_fips_encryption=false`, so the first field alone proves nothing.

Known issue: MP3 and FLAC output on FIPS images. Set `encoding` explicitly on batch `/v2/speak` requests.

## Troubleshooting

```bash
kubectl get pods
kubectl logs <pod-name>
kubectl get events
helm get values [RELEASE_NAME] > my-deployed-values.yaml   # send this to Support
```

Engine crash-looping with `libcuda.so.1: cannot open shared object file` on **GKE**: Container-Optimized OS mounts the host NVIDIA driver at `/usr/local/nvidia` without the container toolkit and expects workloads to find it via `LD_LIBRARY_PATH`. Engine images `release-260611`+ no longer bake the path in. Chart `0.41.1`+ sets it automatically. On older charts set it yourself:

```yaml
engine:
  extraEnv:
    - name: LD_LIBRARY_PATH
      value: "/openh264/lib64:/gstreamer/lib64:/libtorch/lib:/usr/local/cuda/lib64:/usr/local/lib:/usr/local/nvidia/lib:/usr/local/nvidia/lib64"
```

Chart `0.40.2` set an incomplete value that breaks Engine images older than `release-260611`.

Confirm GPU inference in Engine logs — look for `Setting GPU model cache size based on auto lookup table. gpu_id=Gpu(0) …` or `impeller::config: Using devices: Gpu(0)`.

Also verify egress to `license.deepgram.com` and that the API key has self-hosted permissions in Console: a `401` is a permissions problem, a timeout is a firewall problem.

## Monitoring

`monitoring/` in the resources repository ships `grafana_dashboard_template.json`, `grafana_tts_dashboard_template.json`, and `prometheus_tts_alert_rules.yml` (with a test file). Flux STT exposes `flux_max_streams`, `flux_used_streams`, and `flux_fraction_streams` on the Engine metrics endpoint (port `9991`).

## Sources

- Kubernetes overview: https://developers.deepgram.com/docs/kubernetes
- AWS EKS: https://developers.deepgram.com/docs/aws-k8s
- GCP GKE: https://developers.deepgram.com/docs/gcp-k8s
- Self-managed Kubernetes: https://developers.deepgram.com/docs/self-managed-kubernetes
- Securing your cluster: https://developers.deepgram.com/docs/securing-your-cluster
- Kubernetes troubleshooting: https://developers.deepgram.com/docs/k8s-troubleshooting
- Voice Agent: https://developers.deepgram.com/docs/deploy-voice-agent
- Flux TTS: https://developers.deepgram.com/docs/deploy-flux-tts
- FIPS: https://developers.deepgram.com/docs/fips-compliant-deployment
- Blue-green: https://developers.deepgram.com/docs/blue-green-deployment
- Networking: https://developers.deepgram.com/docs/networking
- Metrics: https://developers.deepgram.com/docs/metrics-guide and https://developers.deepgram.com/docs/prometheus-integration
- Chart source and README: https://github.com/deepgram/self-hosted-resources/tree/main/charts/deepgram-self-hosted
- Chart changelog: https://github.com/deepgram/self-hosted-resources/blob/main/charts/deepgram-self-hosted/CHANGELOG.md
