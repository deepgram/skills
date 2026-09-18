# Amazon SageMaker

The managed middle ground: Deepgram runs inside your AWS account and VPC, but AWS handles instance provisioning, scaling, and container management. You subscribe to a Deepgram listing on AWS Marketplace and deploy a SageMaker Endpoint — no Quay credentials, no `.dg` model files, no driver installs.

> **There is a dedicated skill for the AWS mechanics.** [`deepgram-devs/dg-sagemaker`](https://github.com/deepgram-devs/dg-sagemaker) (public) ships a `deepgram-sagemaker` skill with 13 deterministic scripts covering preflight, product selection, Marketplace subscribe, IAM execution role, quota check, deploy, invoke test, autoscaling, update, and teardown. Install it and use its scripts rather than hand-writing `aws sagemaker create-*` calls:
>
> ```bash
> npx skills add deepgram-devs/dg-sagemaker
> ```
>
> This page covers when to choose SageMaker, what the products and instance types are, and the SDK transports — which that skill does not cover.

## When SageMaker fits

Choose it when you are AWS-only and want less operational surface than Docker or Kubernetes. Choose full self-hosted containers instead when you need bare metal, a non-AWS cloud, an air gap, or components SageMaker does not package (License Proxy, Billing, SIPREC, UniMRCP).

The tradeoffs versus running containers yourself, and SageMaker pricing, are laid out at [Amazon SageMaker](https://developers.deepgram.com/docs/amazon-sagemaker).

## Product listings

Deepgram publishes to [AWS Marketplace](https://aws.amazon.com/marketplace/search/results?searchTerms=deepgram&CREATOR=6efa21f9-9a33-4cae-ba44-756436fa71dd&FULFILLMENT_OPTION_TYPE=SAGEMAKER_MODEL&filters=CREATOR%2CFULFILLMENT_OPTION_TYPE) (no AWS login needed to browse).

- **STT:** a separate listing per combination of model family (Nova-3, Flux), language coverage (monolingual, multilingual), and processing mode (streaming, batch). For example, *Deepgram Voice AI — Nova-3 Monolingual Speech-to-Text (STT) Streaming*.
- **TTS:** one listing per model family (such as Aura-2), with no separate language or mode listings.

**One endpoint serves one product.** Your application routes each request to the endpoint for the product it needs.

Individual languages are delivered as **versions** of a model package. One monolingual version may cover English and French, another Vietnamese and Thai — read the version name and release notes and pick the version matching your languages. Missing languages are an account-manager request.

## Instance types

Every product needs a GPU instance. Request [SageMaker quota](https://developers.deepgram.com/docs/request-sagemaker-quota) before creating an endpoint.

| Product | Recommended | Also supported | Not supported |
|---|---|---|---|
| Nova-3 STT | `ml.g6.2xlarge` | `ml.g7.2xlarge`, `ml.g7e.2xlarge`, `ml.g6e.2xlarge`, `ml.g5.2xlarge`, `ml.g4dn.2xlarge` | — |
| Flux STT | `ml.g6.2xlarge` | `ml.g7.2xlarge`, `ml.g7e.2xlarge`, `ml.g6e.2xlarge`, `ml.g5.2xlarge` | `ml.g4dn.*` (no `sm_75` kernel) |
| Aura-2 TTS | `ml.g6.12xlarge` | `ml.g7.12xlarge`, `ml.g7e.12xlarge`, `ml.g5.12xlarge`, `ml.g6e.12xlarge`, `ml.g4dn.12xlarge` | Single-GPU types — Aura-2 needs 2+ GPUs |
| Flux TTS (Aura-3) | `ml.g6e.2xlarge` | `ml.g7.2xlarge`, `ml.g7e.2xlarge`, `ml.g6.2xlarge` | `ml.g5.*`, `ml.g4dn.*` |

SageMaker rejects an endpoint configuration whose instance type is absent from the model package's `SupportedRealtimeInferenceInstanceTypes`. The `ml.g7.*` and `ml.g7e.*` families only appear in packages published after the g7 rollout, so an older version may not accept them. Check a specific version:

```bash
aws sagemaker describe-model-package --model-package-name <model-package-arn>
```

The host driver is set by the **inference AMI version**, separately from the instance type, and current Deepgram packages require a recent one. See [Inference AMI Versions](https://developers.deepgram.com/docs/deploy-amazon-sagemaker#inference-ami-versions).

A machine-readable equivalent of this table — product IDs, invocation modes, supported instance types, required parameters — is [`references/products.json`](https://github.com/deepgram-devs/dg-sagemaker/blob/main/skills/deepgram-sagemaker/references/products.json).

## Invocation modes

- **Streaming** — bidirectional HTTP/2 against a real-time endpoint.
- **Synchronous** — `InvokeEndpoint`, files up to 25 MB per request, real-time endpoint.
- **Asynchronous** — `InvokeEndpointAsync`, files up to 1 GB, scale-to-zero. **Temporarily unavailable** for Marketplace-hosted Deepgram; the docs page is titled "(Temporarily Unavailable)" and the `dg-sagemaker` scripts refuse `--async-bucket`. If someone needs 1 GB files or scale-to-zero, route them to a Deepgram representative rather than attempting a deployment.

## SDK transports

SageMaker has no WebSocket. Its streaming API is bidirectional HTTP/2, so the Deepgram SDKs' default WebSocket transport does not reach it. Deepgram publishes a **pluggable transport** per SDK: you construct a transport factory and pass it to the normal client, and the rest of your SDK code is unchanged. That is the point — you can move the same application between Deepgram Cloud and Deepgram on SageMaker by swapping the transport.

Two things are true of all three:

1. **Authentication is AWS credentials, not a Deepgram API key.** Each transport uses the standard AWS credential chain — environment variables, shared credentials file, IAM role on EC2/ECS/Lambda. The client still requires an `apiKey` value to construct, so pass a placeholder such as `"unused"`; it is ignored.
2. **Defaults are tuned for bursts, not for fail-fast.** Connect and acquire timeouts are raised well above the AWS SDK defaults (~2 s connect, ~10 s acquire) because opening 200–500 streams against a cold endpoint trips those defaults before the load balancer has accepted the TLS handshakes — a client-side fail-fast that looks exactly like a server problem. Transient AWS failures (throttling, pool exhaustion, transient connect/timeout) are retried internally with jittered exponential backoff, with buffered messages replayed onto the new stream so audio is not dropped. Only terminal errors (auth, validation, not-found) and budget-exhausted retries reach your code. Tighten the timeouts only if you need fail-fast behavior in a low-latency pipeline.

Published versions at the time of writing — check each registry before pinning:

| SDK | Package | Latest published | Repository |
|---|---|---|---|
| Python | PyPI `deepgram-sagemaker` | **0.4.0** | [deepgram-python-sdk-transport-sagemaker](https://github.com/deepgram/deepgram-python-sdk-transport-sagemaker) |
| Java | Maven Central `com.deepgram:deepgram-sagemaker` | **0.1.3** | [deepgram-java-sdk-transport-sagemaker](https://github.com/deepgram/deepgram-java-sdk-transport-sagemaker) |
| JavaScript | npm `@deepgram/sagemaker` | **0.1.2** | [deepgram-js-sdk-transport-sagemaker](https://github.com/deepgram/deepgram-js-sdk-transport-sagemaker) |

All three repositories are public and MIT licensed.

**Resolve these against the registry, not against this table or a README.** They move independently of the SDKs and fast: `@deepgram/sagemaker` went from `0.1.1` to `0.1.2` inside a single afternoon, and its peer range on `@deepgram/sdk` changed with it. A transport README's install line can sit ahead of what is actually published, or behind it. Check `npm view @deepgram/sagemaker version`, the PyPI JSON API, or Maven Central metadata before you pin.

### Python

Requires **Python 3.12+**, which *is* enforced: the package declares `requires_python >=3.12,<4.0`.

Its declared dependencies are only `aws-sdk-sagemaker-runtime-http2[awscrt]>=0.11,<0.12` and `boto3`. **`deepgram-sdk` is not among them.** The `>=7.8.1,<8.0.0` range below comes from the transport README's install line, not from package metadata, so nothing stops pip from resolving an incompatible SDK alongside it — pin the SDK yourself and treat a mismatch as your problem to catch. This differs from the JS package, which declares a real `peerDependencies` entry on `@deepgram/sdk` (`>=5.5.0 <6`) and so warns on a bad pairing.

`awscrt` is a compiled extension: supported platforms get a wheel, others need a C toolchain.

```bash
pip install "deepgram-sdk>=7.8.1,<8.0.0" deepgram-sagemaker
```

**Async-only** — it must be used with `AsyncDeepgramClient`.

```python
import asyncio
from deepgram import AsyncDeepgramClient
from deepgram.core.events import EventType
from deepgram_sagemaker import SageMakerTransportFactory

factory = SageMakerTransportFactory(
    endpoint_name="my-deepgram-endpoint",
    region="us-west-2",
)
client = AsyncDeepgramClient(api_key="unused", transport_factory=factory)

async def main():
    async with client.listen.v1.connect(model="nova-3") as connection:
        connection.on(EventType.MESSAGE, lambda msg: print(msg))
        await connection.start_listening()

asyncio.run(main())
```

Tuning goes through `SageMakerConfig`, with all time fields as `float` seconds:

```python
from deepgram_sagemaker import SageMakerConfig, SageMakerTransportFactory

config = SageMakerConfig(
    endpoint_name="my-deepgram-endpoint",
    region="us-east-2",
    connection_timeout=5.0,          # default 30.0
    connection_acquire_timeout=15.0, # default 60.0
)
factory = SageMakerTransportFactory(config=config)
```

Defaults: `region` `us-west-2`, `connection_timeout` `30.0`, `connection_acquire_timeout` `60.0`, `subscription_timeout` `60.0`, `max_concurrency` `500`, `max_retries` `5`, `initial_backoff` `0.1`, `max_backoff` `5.0`, `backoff_multiplier` `2.0`, `retry_budget` `30.0`, `max_replay_buffer_bytes` 8 MiB. `max_retries=0` disables internal retry; `max_replay_buffer_bytes=0` disables replay. `max_concurrency` is advisory in Python — the underlying smithy HTTP/2 stack exposes no hard cap — and is kept for parity with Java.

Examples in the repository: `examples/sagemaker_stt.py`, `sagemaker_tts.py`, `sagemaker_flux.py`, `sagemaker_live_mic.py`, `sagemaker_live_mic_flux.py`. It also ships a `loadtest/` package with a WER harness.

### JavaScript / TypeScript

Requires **Node.js 20+** and `@deepgram/sdk` **`>=5.5.0 <6`**, declared as a real peer dependency — `5.5.0` is the first SDK release with `transportFactory` support. The `examples/flux-tts.mjs` example needs `>=5.6.0` for Speak v2.

```bash
npm install @deepgram/sdk @deepgram/sagemaker
```

```ts
import { DeepgramClient } from "@deepgram/sdk";
import { createSageMakerTransportFactory } from "@deepgram/sagemaker";

const transportFactory = createSageMakerTransportFactory({
  endpointName: "my-deepgram-endpoint",
  region: "us-west-2",
});

const client = new DeepgramClient({ apiKey: "unused", transportFactory });

const socket = await client.listen.v1.createConnection({ model: "nova-3" });
socket.on("message", (message) => console.log(message));
socket.connect();
socket.sendMedia(new Uint8Array([1, 2, 3]));
```

`SageMakerConfig` fields are milliseconds: `connectionTimeoutMs` `30_000`, `subscriptionTimeoutMs` `60_000`, `maxConcurrency` `500`, `maxRetries` `5`, `initialBackoffMs` `100`, `maxBackoffMs` `5_000`, `backoffMultiplier` `2.0`, `retryBudgetMs` `30_000`, `maxReplayBufferBytes` 8 MiB. Also accepts `targetVariant` for a SageMaker production variant and `clientConfig` for extra AWS client options (including custom credentials). `maxConcurrency` is advisory in JS as well.

Examples: `examples/stt.mjs`, `tts.mjs`, `flux.mjs`, `flux-tts.mjs`, `live-mic.mjs`, `live-mic-flux.mjs`, plus a `loadtest/` directory.

### Java

Requires **Java 11+** and Deepgram Java SDK **v0.4.0+** — the `default ReconnectOptions reconnectOptions()` hook on `DeepgramTransportFactory` is what enables storm absorption. The transport's README pins `0.4.0` in its install snippet; Maven Central's latest Java SDK is `0.10.0`, which satisfies the floor. Pin deliberately and test the pairing.

```groovy
dependencies {
    implementation 'com.deepgram:deepgram-java-sdk:0.4.0'
    implementation 'com.deepgram:deepgram-sagemaker:0.1.3'
}
```

```java
SageMakerTransportFactory factory = new SageMakerTransportFactory(
    SageMakerConfig.builder()
        .endpointName("my-deepgram-endpoint")
        .region("us-west-2")
        .build()
);

DeepgramClient client = DeepgramClient.builder()
    .apiKey("unused")
    .transportFactory(factory)
    .build();

V1WebSocketClient ws = client.listen().v1().v1WebSocket();
ws.onResults(results -> System.out.println(
    results.getChannel().getAlternatives().get(0).getTranscript()));
ws.connect(V1ConnectOptions.builder().model(ListenV1Model.NOVA3).build());
ws.sendMedia(audioBytes);
ws.close();
```

Defaults: `region` `us-west-2`, `connectionTimeout` `30s`, `connectionAcquireTimeout` `60s`, `subscriptionTimeout` `60s`, `maxConcurrency` `500`, `maxRetries` `5`, `initialBackoff` `100ms`, `maxBackoff` `5s`, `backoffMultiplier` `2.0`, `retryBudget` `30s`. Unlike Python and JS, `maxConcurrency` here is a real cap on in-flight HTTP/2 streams across the shared Netty pool.

Examples: `examples/src/main/java/com/deepgram/examples/` — `SageMakerTransportExample`, `TtsSageMakerExample`, `FluxSageMakerExample`, `LiveMicSageMakerExample`, `LiveMicFluxSageMakerExample`.

## Validating an endpoint

Beyond the transports, [`deepgram-devs/dg-sagemaker`](https://github.com/deepgram-devs/dg-sagemaker) holds runnable client scripts per product and language: `python-stt/`, `python-flux/`, `python-flux-tts/`, `js-stt/`, and `java/stt/` (both an AWS-SDK and a Deepgram-SDK variant). See [Validate a Deepgram SageMaker Endpoint](https://developers.deepgram.com/docs/test-amazon-sagemaker-endpoint).

## Operations

- **Autoscaling:** scale real-time endpoints on the CloudWatch `ConcurrentRequestsPerModel` metric.
- **Observability:** CloudWatch metrics including `ConcurrentRequestsPerModel` and `FirstChunkLatency`, container logs, and alarms. Deepgram containers also emit Embedded Metric Format metrics — billing in `Deepgram/SageMakerInference`, per-feature usage in `Deepgram/SelfHosted`. Detailed observability can stream per-GPU, host, and container Prometheus metrics through an AWS-managed OpenTelemetry Collector.
- **Health checks:** the container reports its state while models load and while serving, and SageMaker replaces unhealthy instances. Streaming connections have a WebSocket ping/pong requirement.
- **FIPS 140-3:** FIPS endpoints are available for both the control plane and inference traffic, including bidirectional streaming on port 8443 and asynchronous endpoints on `s3-fips`. There is an IAM Identity Center caveat. See [Use FIPS Endpoints](https://developers.deepgram.com/docs/fips-endpoints-sagemaker).
- **Updates:** roll a newer model package or model version onto an endpoint already serving production traffic.

## Sources

- Overview: https://developers.deepgram.com/docs/amazon-sagemaker
- Supported products and instance types: https://developers.deepgram.com/docs/supported-products-sagemaker
- Quota: https://developers.deepgram.com/docs/request-sagemaker-quota
- Subscribe: https://developers.deepgram.com/docs/subscribe-aws-marketplace
- Deploy: https://developers.deepgram.com/docs/deploy-amazon-sagemaker
- Terraform: https://developers.deepgram.com/docs/terraform-deploy-sagemaker
- Configure via environment variables: https://developers.deepgram.com/docs/configure-sagemaker-deployments
- Invoke: https://developers.deepgram.com/docs/invoke-sagemaker-endpoint
- Validate: https://developers.deepgram.com/docs/test-amazon-sagemaker-endpoint
- Update: https://developers.deepgram.com/docs/update-amazon-sagemaker-endpoint
- Autoscaling: https://developers.deepgram.com/docs/auto-scaling-sagemaker and https://developers.deepgram.com/docs/auto-scaling-sagemaker-streaming
- Observability: https://developers.deepgram.com/docs/observability-sagemaker, https://developers.deepgram.com/docs/prometheus-otel-sagemaker, https://developers.deepgram.com/docs/enhanced-metrics-sagemaker
- Health checks: https://developers.deepgram.com/docs/health-checks-sagemaker
- Security and compliance: https://developers.deepgram.com/docs/security-and-compliance-sagemaker
- FIPS endpoints: https://developers.deepgram.com/docs/fips-endpoints-sagemaker
- Troubleshooting: https://developers.deepgram.com/docs/troubleshooting-sagemaker
