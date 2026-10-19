const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

function load(file, mocks = {}, globals = {}) {
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
  assert.match(markup, /value="2026-10-19"/);
  assert.match(markup, /Africa\/Blantyre/);
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
