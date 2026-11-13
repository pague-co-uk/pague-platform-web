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

## Dashboard outcomes and readable filters

The dashboard uses message creation time consistently for totals, daily traffic,
hourly traffic and client comparisons. Delivery failures are failed messages with
at least one route attempt. Failed messages with no route attempt are reported
separately as routing failures. Retrying messages use their current state, so a
historical routing failure does not also appear as a current failure.

Delivery success = delivered / (delivered + delivery failures + expired).
Queued, routed, submitted and routing failures do not affect this completed-outcome
rate. Submitted is a separate current-state metric awaiting a delivery receipt.
An empty denominator produces zero.

Client and sender filters display names. Filter options use `messages.read` and
the existing client scope, so message readers do not need directory permissions.
Changing client clears the sender selection. Search also matches client display
and company names and sender text. Other filters and date controls compose.

Deploy the API and frontend together for the new filter-options endpoints and
routing-failure summary property.

## Themes and identifiers

The header theme button switches Blue and Pague rose, drawn from the invoice's
rose, peach, navy and warm paper palette. A one-year SameSite cookie stores the
choice; the root layout applies it on the server to avoid a theme flash.

Routine displays use entity names, codes or public references. Message attempts
use attempt numbers; ledger message references resolve in a batch within each
entry's client. Original IDs are retained for links, API requests and financial
reconciliation. Audit technical references remain behind a disclosure for support.

## Network and monthly activity

The messaging dashboard includes daily network activity for the selected dashboard
period. Each message is attributed once, using its latest route attempt's mobile
network; retries and failover do not multiply message volume. Network labels use
names and country codes. Messages with no route appear as Unassigned. Network
legend buttons show/hide individual series, and an expandable table provides exact
counts. Days without traffic are zero-filled.

Messages by month compares delivered messages with routed delivery failures for a
selected calendar year (`GET /api/dashboard?period=30d&year=2026`). The year selector
is independent of the daily period control. Twelve months are returned, including
zero-activity months. Routing failures, pending states and expired messages are not
included in the two outcome bars. The API and Next proxy validate year as 2000–2100.

Both client and platform message lists show the filtered result range above their
tables, including empty and single-page results. The pagination controls suppress
their own repeated summary on those lists.
