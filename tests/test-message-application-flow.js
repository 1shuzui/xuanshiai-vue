const assert = require('node:assert/strict')
const { readPage, evaluateBindings } = require('./vue-page-helper.cjs')
const page = readPage('pages/message/message.uvue')

function setup(respond = async () => ({ success: true, data: { canChat: true } })) {
  const calls = [], routes = [], notices = []
  const account = { id: 303 }
  const names = ['applications', 'appVisible', 'applicationActionId', 'handleApplicationAction', 'acceptApp', 'rejectApp']
    .filter(name => new RegExp(`const ${name}\\s*=`).test(page.script))
  const state = evaluateBindings(page, names, {
    CURRENT_USER_ID_KEY: 'xsa_user_id',
    uni: { getStorageSync: () => account.id, navigateTo: ({ url }) => routes.push(url) },
    handleApplication: async (...args) => {
      calls.push(args)
      return args[2] ? respond(...args) : { success: false, code: 'CLIENT_COMMAND_ID_REQUIRED' }
    },
    showToast: message => notices.push(message), loadMessages: async () => {},
    completeMatchedApplication: () => { throw Error('Must not create a local matched conversation') }
  })
  const item = { id: 42, userId: 202, name: '测试子女', direction: 'in', status: 'pending' }
  state.applications.value = [item]
  state.appVisible.value = true
  return { ...state, item, calls, routes, notices, account }
}

async function run() {
  const success = setup()
  await success.acceptApp(success.item)
  assert.ok(success.calls[0][2]?.length > 0, 'accept must supply the API-required command ID')
  assert.equal(success.calls[0][3].mode, 'self', 'recipient acts for their own account')
  assert.equal(success.applications.value.length, 0)
  assert.ok(success.routes[0].includes('userId=202'))

  for (const action of ['acceptApp', 'rejectApp']) {
    for (const failure of ['business', 'transport']) {
      let fail = true
      const state = setup(async () => {
        if (fail && failure === 'transport') throw Error('connection lost')
        return fail ? { success: false, message: '请稍后重试' } : { success: true, data: { canChat: action === 'acceptApp' } }
      })
      await state[action](state.item)
      assert.equal(state.applications.value.length, 1, `${action}: failure retains the request for retry`)
      assert.equal(state.routes.length, 0, `${action}: failure must not open chat`)
      assert.ok(state.notices.length > 0, `${action}: failure is visible`)
      fail = false
      await state[action](state.item)
      assert.equal(state.calls[0][2], state.calls[1][2], 'retry reuses the same command ID')
      assert.equal(state.applications.value.length, 0)
    }
  }

  let finish
  const pending = setup(() => new Promise(resolve => { finish = resolve }))
  const operation = pending.acceptApp(pending.item)
  await pending.acceptApp(pending.item)
  await pending.rejectApp(pending.item)
  assert.equal(pending.calls.length, 1, 'a pending action cannot be sent twice or contradicted')
  pending.account.id = 404
  finish({ success: true, data: { canChat: true } })
  await operation
  assert.equal(pending.routes.length, 0, 'an old account response cannot navigate the new account')
  assert.equal(pending.applications.value.length, 1, 'an old response cannot mutate another account view')

  const reload = setup()
  await reload.acceptApp(reload.item)
  assert.equal(reload.calls[0][2], success.calls[0][2], 'command identity survives opening the page again')
  const reject = setup()
  await reject.rejectApp(reject.item)
  assert.notEqual(reject.calls[0][2], success.calls[0][2], 'accept and reject are separate commands')
  assert.equal(reject.routes.length, 0)

  let response = { success: false, message: '服务暂不可用' }
  const list = evaluateBindings(page, ['applications', 'applicationLoading', 'applicationError', 'loadApplications', 'normalizeApp'], {
    getApplications: async () => { if (response instanceof Error) throw response; return response }
  })
  for (const failed of [response, new Error('offline')]) {
    response = failed
    await list.loadApplications()
    assert.equal(list.applications.value.length, 0, 'failed loads must not invent applications')
    assert.ok(list.applicationError.value.length > 0)
    assert.equal(list.applicationLoading.value, false)
  }
  response = { success: true, data: { incoming: [success.item], outgoing: [] } }
  await list.loadApplications()
  assert.equal(list.applications.value[0].id, 42)
  assert.equal(list.applicationError.value, '')
  console.log('PASS recipient application commands, error/retry, duplicate clicks, account changes and server-confirmed navigation')
}

run().catch(error => { console.error(error); process.exitCode = 1 })
