const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

function load(file, mocks = {}, globals = {}) {
  mocks = { '@/lib/date/use-local-date-formatter': { useLocalDateFormatter: formatter => formatter }, ...mocks };
  const source = fs.readFileSync(file, 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  const context = { exports: {}, URLSearchParams, ...globals, require: name => name in mocks ? mocks[name] : require(name) };
  vm.runInNewContext(compiled, context);
  return context.exports;
}
const { messagePageSize, messagePageNumber, messageListQuery } = load('features/messages/utils/message-pagination.ts');
test('page and size URL validation', () => {
  for (const value of ['0', '-1', '1.5', '101', 'bad', '', undefined]) assert.equal(messagePageSize(value), 20);
  assert.equal(messagePageSize('100'), 100);
  assert.equal(messagePageSize('1'), 1);
  for (const value of ['0', '-1', '1.5', 'bad', undefined]) assert.equal(messagePageNumber(value), 1);
});
test('applying date and size controls preserves filters and resets pagination', () => {
  const params = new URLSearchParams(messageListQuery('page=9&status=FAILED&clientId=client&pageSize=20', '2026-10-19', '2026-10-19', '50'));
  assert.equal(params.get('status'), 'FAILED');
  assert.equal(params.get('clientId'), 'client');
  assert.equal(params.get('createdFrom'), '2026-10-19');
  assert.equal(params.get('createdTo'), '2026-10-19');
  assert.equal(params.get('pageSize'), '50');
  assert.equal(params.has('page'), false);
  assert.equal(new URLSearchParams(messageListQuery(params.toString(), '', '', '20')).has('createdFrom'), false);
  assert.throws(() => messageListQuery('', '2026-10-20', '2026-10-19', '20'));
  for (const size of ['0', '101', '1.5']) assert.throws(() => messageListQuery('', '', '', size));
});
test('retry display distinguishes same-route retry, failover and completed submission', () => {
  const { MessageRetryProgress } = load('features/messages/components/message-retry-progress.tsx', { '@/lib/date/format-date': { formatDate: () => 'scheduled-time' } });
  const render = (status, count, latest = 'PENDING') => renderToStaticMarkup(React.createElement(MessageRetryProgress, { message: { currentStatus: status, retryProgress: { attemptCount: 3, routeSubmissionCount: count, latestAttemptStatus: latest, scheduledAt: '2026-10-19T10:00:00Z' } } }));
  assert.match(render('ROUTED', 2), /Retry scheduled/);
  assert.match(render('ROUTED', 1), /Submission scheduled/);
  assert.match(render('SUBMITTED', 2, 'SUBMITTED'), /3 submissions/);
  assert.doesNotMatch(render('FAILED', 2), /Retry scheduled/);
});
test('date and page-size controls render without depending on result count', () => {
  const { MessageListControls } = load('features/messages/components/message-list-controls.tsx', {
    'next/navigation': { useSearchParams: () => new URLSearchParams('createdFrom=2026-10-19&pageSize=50'), useRouter: () => ({ push() {} }), usePathname: () => '/messages' },
    '../utils/message-pagination': { messageListQuery },
  });
  const markup = renderToStaticMarkup(React.createElement(MessageListControls, { pageSize: 50 }));
  assert.match(markup, /Created from/);
  assert.match(markup, /Created to/);
  assert.match(markup, /Items per page/);
  assert.match(markup, /type="number"/);
  assert.match(markup, /value="50"/);
  assert.equal((markup.match(/type="datetime-local"/g) ?? []).length, 2);
  // Local values are applied after hydration to avoid server/device timezone mismatches.
  assert.match(markup, /value=""/);
  assert.match(markup, /local timezone/);
});

test('manual retry API uses scoped POST and propagates conflicts', async () => {
  const calls = [];
  const { retryMessage } = load('features/messages/api/messages-api.ts', {}, {
    fetch: async (url, options) => { calls.push({ url, options }); return { ok: true, status: 202, json: async () => ({ data: { status: 'QUEUED' } }) }; },
  });
  await retryMessage('client/1', 'message?2');
  assert.equal(calls[0].url, '/api/clients/client%2F1/messages/message%3F2/retry');
  assert.equal(calls[0].options.method, 'POST');
  assert.equal(calls[0].options.credentials, 'include');
  const api = load('features/messages/api/messages-api.ts', {}, {
    fetch: async () => ({ ok: false, status: 409, json: async () => ({ message: 'Only failed messages can be retried.' }) }),
  });
  await assert.rejects(api.retryMessage('client', 'message'), error => error.status === 409 && /Only failed/.test(error.message));
});

test('retry button blocks repeated clicks and refreshes after scheduling', async () => {
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  let calls = 0, refreshes = 0;
  const states = [];
  const { RetryMessageButton } = load('features/messages/components/retry-message-button.tsx', {
    react: { useRef: () => ({ current: false }), useState: initial => [initial, value => states.push(value)] },
    'next/navigation': { useRouter: () => ({ refresh: () => refreshes++ }) },
    '../api/messages-api': { retryMessage: async () => { calls++; await gate; } },
  });
  const node = RetryMessageButton({ clientId: 'client', messageId: 'message' });
  const button = node.props.children[0];
  const first = button.props.onClick();
  await button.props.onClick();
  assert.equal(calls, 1);
  release();
  await first;
  assert.equal(refreshes, 1);
  assert.ok(states.includes('pending'));
  assert.ok(states.includes('queued'));
});
test('retry proxy forwards the session cookie and preserves API status', async () => {
  let call;
  class ProxyResponse {
    constructor(body, options) { this.body = body; this.status = options.status; this.headers = options.headers; }
  }
  const { POST } = load('app/api/clients/[id]/messages/[messageId]/retry/route.ts', {
    'next/server': { NextResponse: ProxyResponse },
    '@/lib/control-plane': { getControlPlaneUrl: () => 'https://control.example' },
  }, {
    fetch: async (url, options) => {
      call = { url, options };
      return new Response(JSON.stringify({ message: 'Only failed messages can be retried.' }), { status: 409, headers: { 'content-type': 'application/json' } });
    },
  });
  const response = await POST({ headers: new Headers({ cookie: 'session=test-session' }) }, { params: Promise.resolve({ id: 'client/1', messageId: 'message/2' }) });
  assert.equal(call.url, 'https://control.example/api/clients/client%2F1/messages/message%2F2/retry');
  assert.equal(call.options.headers.Cookie, 'session=test-session');
  assert.equal(call.options.method, 'POST');
  assert.equal(response.status, 409);
});


test('date formatting follows the visitor timezone, including day boundaries', () => {
  const { formatDate } = load('lib/date/format-date.ts');
  const previous = process.env.TZ;
  try {
    process.env.TZ = 'Asia/Shanghai';
    assert.equal(formatDate('2026-10-19T20:30:00Z'), '20 Oct 2026, 04:30');
    process.env.TZ = 'Africa/Nairobi';
    assert.equal(formatDate('2026-10-19T20:30:00Z'), '19 Oct 2026, 23:30');
    process.env.TZ = 'America/New_York';
    assert.equal(formatDate('2026-07-19T20:30:00Z'), '19 Jul 2026, 16:30');
    assert.equal(formatDate('2026-01-19T20:30:00Z'), '19 Jan 2026, 15:30');
    assert.equal(formatDate('invalid'), 'invalid');
  } finally {
    if (previous === undefined) delete process.env.TZ; else process.env.TZ = previous;
  }
});

test('local date formatter waits until hydration before formatting', () => {
  for (const hydrated of [false, true]) {
    const { useLocalDateFormatter } = load('lib/date/use-local-date-formatter.ts', {
      react: { useSyncExternalStore: (_, client, server) => hydrated ? client() : server() },
    });
    const format = useLocalDateFormatter(value => `local: ${value}`);
    assert.equal(format('date'), hydrated ? 'local: date' : '—');
  }
});

test('changing client preserves other filters and clears an incompatible sender selection', () => {
  const navigations = [];
  const { FilterSelect } = load('components/ui/filter-bar.tsx', {
    'next/navigation': {
      useSearchParams: () => new URLSearchParams('page=4&pageSize=50&status=DELIVERED&senderIdId=old-sender&createdFrom=2026-11-01'),
      useRouter: () => ({ push: url => navigations.push(url) }),
      usePathname: () => '/messages',
    },
  });
  const element = FilterSelect({ name: 'clientId', resetParams: ['page', 'senderIdId'], placeholder: 'All clients', options: [{ value: 'client-acme', label: 'Acme Ltd' }] });
  element.props.onChange({ target: { value: 'client-acme' } });
  const params = new URL(navigations[0], 'http://localhost').searchParams;
  assert.equal(params.get('clientId'), 'client-acme');
  assert.equal(params.get('status'), 'DELIVERED');
  assert.equal(params.get('createdFrom'), '2026-11-01');
  assert.equal(params.get('pageSize'), '50');
  assert.equal(params.has('senderIdId'), false);
  assert.equal(params.has('page'), false);
  assert.match(renderToStaticMarkup(element), />Acme Ltd<\/option>/);
});

test('sender selection composes with client, date and status filters', () => {
  let navigation;
  const { FilterSelect } = load('components/ui/filter-bar.tsx', {
    'next/navigation': {
      useSearchParams: () => new URLSearchParams('clientId=client-acme&status=SUBMITTED&createdTo=2026-11-13&page=3'),
      useRouter: () => ({ push: url => { navigation = url; } }),
      usePathname: () => '/messages',
    },
  });
  const element = FilterSelect({ name: 'senderIdId', options: [{ value: 'sender-acme', label: 'ACME' }] });
  element.props.onChange({ target: { value: 'sender-acme' } });
  const params = new URL(navigation, 'http://localhost').searchParams;
  assert.equal(params.get('senderIdId'), 'sender-acme');
  assert.equal(params.get('clientId'), 'client-acme');
  assert.equal(params.get('status'), 'SUBMITTED');
  assert.equal(params.get('createdTo'), '2026-11-13');
  assert.equal(params.has('page'), false);
});

test('message counts remain visible on single-page, empty, and filtered result sets', () => {
  const { MessageResultCount } = load('features/messages/components/message-result-count.tsx', { '@/components/ui/filtered-result-summary': load('components/ui/filtered-result-summary.tsx'), '@/components/ui/sms-segment-summary': load('components/ui/sms-segment-summary.tsx') });
  const render = (page, pageSize, total, count) => renderToStaticMarkup(React.createElement(MessageResultCount, { pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) }, count })).replace(/<[^>]+>/g, '');
  assert.ok(render(1, 20, 5, 5).endsWith('Showing 1–5 of 5 messages'));
  assert.ok(render(1, 20, 0, 0).endsWith('Showing 0–0 of 0 messages'));
  assert.ok(render(2, 20, 27, 7).endsWith('Showing 21–27 of 27 messages'));
  assert.ok(render(3, 20, 27, 0).endsWith('Showing 0–0 of 27 messages'));
});


test('date-time filters preserve local time as an explicit UTC instant', () => {
  const { dateTimeFilterInput, dateTimeFilterInstant } = load('features/messages/utils/message-pagination.ts');
  const previous = process.env.TZ;
  try {
    process.env.TZ = 'Africa/Blantyre';
    assert.equal(dateTimeFilterInstant('2026-11-13T14:30'), '2026-11-13T12:30:00.000Z');
    assert.equal(dateTimeFilterInput('2026-11-13T12:30:00.000Z'), '2026-11-13T14:30');
    assert.equal(dateTimeFilterInput('2026-11-13'), '2026-11-13T00:00');
    assert.throws(() => dateTimeFilterInstant('invalid'));
  } finally { if (previous === undefined) delete process.env.TZ; else process.env.TZ = previous; }
});

test('filtered summaries show totals across all pages with each status including zero', () => {
  const { FilteredResultSummary } = load('components/ui/filtered-result-summary.tsx');
  const html = renderToStaticMarkup(React.createElement(FilteredResultSummary, { total: 104, counts: { DELIVERED: 100, FAILED: 2, ROUTING_FAILED: 1, SUBMITTED: 1, QUEUED: 0 }, kind: 'messages' }));
  assert.match(html, /104 messages match your filters/);
  assert.match(html, /Delivered \(successful\)/);
  assert.match(html, /Routing failures/);
  assert.match(html, />100<\/dd>/);
  assert.match(html, /Queued/);
});


test('SMS segments show the message multiplier and total parts', () => {
  const { SmsSegmentSummary } = load('components/ui/sms-segment-summary.tsx');
  const text = renderToStaticMarkup(React.createElement(SmsSegmentSummary, { totalSegments: 25, breakdown: [{ segmentCount: 1, messageCount: 5, totalSegments: 5 }, { segmentCount: 2, messageCount: 10, totalSegments: 20 }] })).replace(/<[^>]+>/g, '');
  assert.match(text, /SMS segments.*25/);
  assert.match(text, /10 messages × 2 segments = 20/);
  assert.match(text, /5 messages × 1 segment = 5/);
});

test('activity graphs show named categories in volume order without internal identifiers', () => {
  const { MessageVolumeChart } = load('features/dashboard/components/message-volume-chart.tsx');
  const html = renderToStaticMarkup(React.createElement(MessageVolumeChart, { label: 'Client activity', items: [{ key: 'hidden-client-id-1', name: 'Small client', messages: 5 }, { key: 'hidden-client-id-2', name: 'Busy client', messages: 20 }] }));
  assert.ok(html.indexOf('Busy client') < html.indexOf('Small client'));
  assert.match(html, /20 messages/);
  assert.match(html, /width:25%/);
  assert.doesNotMatch(html, /hidden-client-id/);
  const empty = renderToStaticMarkup(React.createElement(MessageVolumeChart, { label: 'Sender activity', items: [] }));
  assert.match(empty, /No messaging activity/);
});

test('network chart uses full dates angled upward with room below the plot', () => {
  const { NetworkActivityChart } = load('features/dashboard/components/messaging-activity-charts.tsx');
  const html = renderToStaticMarkup(React.createElement(NetworkActivityChart, { series: [{ key: 'network', name: 'Airtel', points: [{ date: '2026-11-13', count: 12 }] }] }));
  assert.match(html, /transform="rotate\(-45 /);
  assert.match(html, /text-anchor="end"/);
  assert.match(html, />2026-11-13<\/text>/);
});

test('dashboard segment details start collapsed while keeping the total visible', () => {
  const { SmsSegmentSummary } = load('components/ui/sms-segment-summary.tsx');
  const html = renderToStaticMarkup(React.createElement(SmsSegmentSummary, { totalSegments: 20, breakdown: [{ segmentCount: 2, messageCount: 10, totalSegments: 20 }], collapsible: true }));
  assert.match(html, /<details/);
  assert.doesNotMatch(html, /<details[^>]*\sopen/);
  assert.match(html, /<summary[^>]*>SMS segments: 20/);
  assert.match(html, /10 messages/);
});

test('status mix distinguishes routing failures from delivery failures', () => {
  const { MessageStatusMix } = load('features/dashboard/components/message-status-mix.tsx');
  const html = renderToStaticMarkup(React.createElement(MessageStatusMix, { messages: { delivered: 80, submitted: 0, queued: 0, routed: 0, failed: 10, routingFailures: 10, expired: 0 } }));
  assert.match(html, /80\.0%/);
  assert.match(html, /Routing failed/);
  assert.match(html, /Delivery failed/);
});
