export function createStore (reducer, state) {
  const store = {
    state,
    reducer,
    subscribe,
    unsubscribe,
    subscribers: [],
    dispatch
  }

  function subscribe (fn) {
    store.subscribers.push(fn)
  }

  function unsubscribe (fn) {
    store.subscribers.splice(store.subscribers.indexOf(fn), 1)
  }

  function dispatch (action) {
    store.state = reducer(store.state, action)

    store.subscribers.forEach(function (fn) {
      fn(store.state)
    })
  }

  return store
}
