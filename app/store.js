const constructStore = (reducer, initialState) => {
  const subscribers = []
  let state = initialState

  const subscribe = (fn) => {
    subscribers.push(fn)
  }

  const unsubscribe = (fn) => {
    subscribers.splice(subscribers.indexOf(fn), 1)
  }

  const dispatch = (action) => {
    state = reducer(state, action)

    for (const fn of subscribers) {
      fn(state)
    }
  }

  return {
    state,
    reducer,
    subscribers,
    subscribe,
    unsubscribe,
    dispatch
  }
}

export const imageStore = constructStore((state, action) => {
  switch (action.type) {
    case 'ADD_ARTOBJECT':
      return action.artObject
    default:
      return state
  }
})

export const artObjectsStore = constructStore((state, action) => {
  switch (action.type) {
    case 'ADD_ARTOBJECTS':
      return action.artObjects
    default:
      return state
  }
})
