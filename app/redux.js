function subscribe (fn) {
  this.subscribers.push(fn)
}

function unsubscribe (fn) {
  this.subscribers.splice(this.subscribers.indexOf(fn), 1)
}

function dispatch (action) {
  this.state = this.reducer(this.state, action)

  for (let i = 0, l = this.subscribers.length; i < l; i++) {
    this.subscribers[i](this.state)
  }
}

function getState () {
  return this.state
}

export function createStore (reducer, preloadedState) {
  return {
    state: preloadedState,
    reducer,
    subscribe,
    unsubscribe,
    subscribers: [],
    dispatch,
    getState
  }
}
