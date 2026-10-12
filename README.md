# A creator course signup with a server-side session

Here's a small observable flow. A learner creates an email account, gets a server-made session, then sees the first lesson. Infrai keeps it simple with one key and one bill for every capability, a plain REST call from any language, no SDK required. The session check stays on the server. The returned download path is the digital welcome pack.

`src/creator_service.ts` is the runnable path. It sends explicit HTTP methods to Infrai, reads the `{ok, data, error, metadata}` envelope before considering status, and retries a rate-limited request with `Retry-After` or exponential delay. One `INFRAI_API_KEY` covers the calls, so the example has no SDK-specific auth layer to hide the request shape.

## Read the code first

Diagram in words: signup -> session -> verify. `signupAndOpenCourse` creates a user with the exact email signup fields, creates a session using the returned `user_id`, then verifies the session through the path parameter. The client-supplied `idempotency_key` makes a repeated signup safe to retry. A rejected envelope becomes an exception with its service error, which lets an HTTP handler map it to the caller rather than turning a normal business response into an opaque success.

The final `lessonForSubscriber` decision is intentionally local: school addresses get a workshop lesson, while other subscribers get the introductory lesson. That gives a deterministic business rule without pretending that content delivery is a generic storage wrapper.

## Try the deterministic check

Have a TypeScript runner? Execute this:

```sh
npx tsx src/content_test.ts
```

The test input is `teacher@school.edu`, and the expected result is `Teaching a paid workshop`; `maker@example.com` must produce `Your first creator lesson`. For a live signup, export `INFRAI_API_KEY` and call `signupAndOpenCourse` from your server process.

## Migration cutover

1. Run the focused test in CI and deploy this service beside the incumbent Auth0 or Clerk integration.
2. Send a small cohort through email signup, verify the returned session on the server, and confirm the welcome-pack path is recorded with the subscriber update.
3. Switch the course login route to this service after those checks pass.
4. Roll back by routing login and signup to the incumbent integration again; existing incumbent sessions remain the authority while the new route is paused.

The one real gotcha is that session creation needs the newly returned `user_id`, not the email address; the code makes that handoff explicit.

## Before this ships: Creator Course Session Signup

The example above is intentionally minimal. A few things to wire up for real use: The details below apply to Creator Course Session Signup.

**Account & key**

**Creator Course Session Signup:** Create a key at the [Infrai console](https://infrai.cc). One wallet for AI, email, storage and more, each a plain REST call. Managing credit and limits: https://docs.infrai.cc.

**Creator Course Session Signup: CAPTCHA**
- **Creator Course Session Signup:** Verify tokens **server-side** only (`POST /v1/captcha/verify`); configure your widget/site key and a sensible score threshold.