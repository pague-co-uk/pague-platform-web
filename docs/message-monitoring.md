# Message monitoring controls

Client and platform message lists have created-date range inputs and a numeric
items-per-page input (1–100, default 20). Apply preserves the other URL filters
and resets pagination to page 1. Clearing filters retains the selected page size.
Controls remain available when the result set is empty or fits on one page.
Displayed times use the visitor’s device timezone. The end date includes the whole selected day.
Lists display and sort by creation time, which does not change during retries.

The API supplies lightweight retry progress. Pending same-route submissions are
labelled “Retry scheduled”; an initial submission on a different route is labelled
“Submission scheduled”. Message details show the complete history, per-route retry
numbers and scheduled times. Per-route numbers are calculated from history rather
than stored counters. Message links on the platform list use the existing
client-scoped detail page.

The new response properties are optional in frontend types so older API responses
can still render during rollout. The updated API requires the database package's
scheduledAt migration; see api/docs/message-retrieval.md for the deployment order.
The new creation-date indexes also originate in sms-gateway-db.

Verification:

```sh
npm run test:messages
npx tsc --noEmit
```

Production build verification in this environment is blocked by Google Fonts
network timeouts. The default Turbopack build also hit a helper-process port
restriction; trying Webpack did not resolve the font network dependency.

## Manual retry

Failed messages show a Retry message button on both lists and the detail page for
users with `messages.create`. It queues a fresh routing cycle for the same message
and preserves earlier attempts. The button disables while the request is pending,
reports errors without navigating away, and refreshes message data after the API
responds. A successful response means queued, not delivered.

The browser posts through the client-scoped Next API proxy to the control-plane
retry endpoint. The control plane checks permission and eligibility; hiding the
button is not the authorization boundary. This requires the corresponding API and
routing-service changes to be deployed together.
