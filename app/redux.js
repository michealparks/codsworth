export const createStore = (reducer, state) => {
  return {
    state,
    reducer,
    subscribers: [],
    subscribe (fn) {
      this.subscribers.push(fn)
    },
    unsubscribe (fn) {
      this.subscribers.splice(this.subscribers.indexOf(fn), 1)
    },
    dispatch (action) {
      this.state = this.reducer(this.state, action)
      for (const fn of this.subscribers) {
        fn(this.state)
      }
    }
  }
}
