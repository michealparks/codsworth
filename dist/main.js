let client;

const promise = (req) => {
  return new Promise((resolve) => {
    const onEvent = ({ target }) => {
      resolve(target.result);
      req.removeEventListener('success', onEvent);
      req.removeEventListener('error', onEvent);
      req.removeEventListener('abort', onEvent);
    };

    req.addEventListener('success', onEvent);
    req.addEventListener('error', onEvent);
    req.addEventListener('abort', onEvent);
  })
};

const open = async (name, version, onupgradeneeded) => {
  const request = window.indexedDB.open(name, version);
  request.onupgradeneeded = onupgradeneeded;
  client = await promise(request);
};

const get = (name, key) => {
  return promise(client
    .transaction(name)
    .objectStore(name)
    .get(key))
};

const put = (name, data) => {
  return promise(client
    .transaction(name, 'readwrite')
    .objectStore(name)
    .put({ ...data, created: Date.now() }))
};

const getAll = (name) => {
  return promise(client
    .transaction(name)
    .objectStore(name)
    .getAll())
};

const remove = (name, key) => {
  return promise(client
    .transaction(name, 'readwrite')
    .objectStore(name)
    .delete(key))
};

const destroy = (name) => {
  return promise(client
    .transaction(name, 'readwrite')
    .objectStore(name)
    .clear())
};

const db = {
  open,
  get,
  put,
  getAll,
  remove,
  destroy
};

// N.A.S.T.Y. - Not Another State Transformation Yack
// It's pretty much a redux impl that syncs with indexeddb.
const constructStore = (stateGetter, reducer) => {
  const subscribers = new Map();

  const initialize = async () => {
    store.state = await stateGetter();
  };

  const subscribe = (channel, fn) => {
    if (subscribers.has(channel) === false) {
      subscribers.set(channel, []);
    }

    subscribers.get(channel).push(fn);
  };

  const unsubscribe = (channel, fn) => {
    const fns = subscribers.get(channel);
    fns.splice(fns.indexOf(fn), 1);
  };

  const dispatch = (action) => {
    reducer(store.state, action);

    for (const fn of subscribers.get(action.type) || []) {
      fn(store.state);
    }
  };

  const store = {
    state: {},
    initialize,
    subscribe,
    unsubscribe,
    dispatch
  };

  return store
};

const handleUpgrade = (e) => {
  const { result } = e.target;

  if (result.objectStoreNames.contains('artObject') === false) {
    result.createObjectStore('artObject', {
      keyPath: 'id',
      autoIncrement: true
    });
  }

  if (result.objectStoreNames.contains('artObjects') === false) {
    result.createObjectStore('artObjects', {
      keyPath: 'id',
      autoIncrement: true
    });
  }
};

const store = constructStore(async () => {
  await db.open('galeri', 2, handleUpgrade);

  const currentArtObjects = await db.getAll('artObject');
  const artObjects = await db.getAll('artObjects');
  const wikipediaArtObjects = artObjects.find(({ id }) => id === 'wikipedia');
  const rijksArtObjects = artObjects.find(({ id }) => id === 'rijks');

  return Object.seal({
    currentArtObject: currentArtObjects.find(({ id }) => id === 'current'),
    nextArtObject: currentArtObjects.find(({ id }) => id === 'next'),
    wikipediaArtObjects: wikipediaArtObjects ? wikipediaArtObjects.artObjects : [],
    rijksArtObjects: rijksArtObjects ? rijksArtObjects.artObjects : []
  })
}, (state, action) => {
  switch (action.type) {
    case 'setCurrentArtObject':
      db.put('artObject', { id: 'current', ...action.artObject });
      state.currentArtObject = action.artObject;
      break
    case 'setNextArtObject':
      db.put('artObject', { id: 'next', ...action.artObject });
      state.nextArtObject = action.artObject;
      break
    case 'setWikipediaArtObjects':
      db.put('artObjects', { id: 'wikipedia', artObjects: action.artObjects });
      state.wikipediaArtObjects = action.artObjects;
      break
    case 'setRijksArtObjects':
      db.put('artObjects', { id: 'rijks', artObjects: action.artObjects });
      state.rijksArtObjects = action.artObjects;
      break
  }
});

const timeout = (time) => {
  return new Promise((resolve, reject) => {
    setTimeout(reject, time);
  })
};

const fetch = async (...args) => {
  const response = await Promise.race([
    timeout(20000),
    globalThis.fetch(...args)
  ]);

  if (response.ok) {
    return response
  } else {
    const text = await response.text();
    throw new Error(`${args[0]} - ${response.status} - ${text}`)
  }
};

const fetchJSON = async (...args) => {
  try {
    const response = await fetch(...args);
    const json = await response.json();
    return [undefined, json]
  } catch (err) {
    return [err]
  }
};

const fetchBlob = async (...args) => {
  const response = await fetch(...args);
  return response.blob()
};

const fetchBuffer = async (...args) => {
  const response = await fetch(...args);
  return response.buffer()
};

var fetch_1 = {
  fetchJSON,
  fetchBlob,
  fetchBuffer
};
var fetch_2 = fetch_1.fetchJSON;
var fetch_3 = fetch_1.fetchBlob;

async function randomArtObject () {
  const artObjects = await getArtObjects();

  if (!artObjects) return

  return removeRandomArtObject(artObjects)
}

async function getArtObjects () {
  if (store.state.wikipediaArtObjects.length > 0) {
    return store.state.wikipediaArtObjects
  } else {
    const page = 'Wikipedia:Featured_pictures/Artwork/Paintings';
    const url = `https://en.wikipedia.org/w/api.php?action=parse&prop=text&page=${page}&format=json&origin=*`;
    let json;
    try {
      json = await fetch_2(url);
    } catch {
      return
    }

    const artObjects = parsePage(json.parse.text['*']);

    store.dispatch({
      type: 'setWikipediaArtObjects',
      artObjects
    });

    return artObjects
  }
}

function parsePage (str) {
  const doc = new DOMParser().parseFromString(str, 'text/html');
  const galleryboxes = doc.querySelectorAll('.gallerybox');
  const artObjects = [];

  for (const gallerybox of galleryboxes) {
    const img = gallerybox.querySelector('img') || { src: '' };
    const links = gallerybox.querySelectorAll('.gallerytext a');
    const boldEl = gallerybox.querySelector('.gallerytext b');
    const titleEl = boldEl.children[0] ? boldEl.children[0] : boldEl;
    const authorEl = links.length > 1 ? links[1] : links[0];
    const arr = img.src.split('/').slice(0, -1);
    const src = arr.concat(`2000px-${arr[arr.length - 1]}`).join('/');
    const title = titleEl.innerText || '';
    const titleLink = titleEl.href;
    const author = authorEl.innerText || '';
    const authorLink = authorEl.href;

    artObjects.push({
      src: `https://upload.wikimedia.org${src.split('//upload.wikimedia.org').pop()}`,
      title,
      author,
      titleLink: titleLink ? `https://wikipedia.org/wiki${titleLink.split('/wiki').pop()}` : '',
      authorLink: authorLink ? `https://wikipedia.org/wiki${authorLink.split('/wiki').pop()}` : '',
      provider: 'Wikipedia',
      providerLink: 'https://wikipedia.org',
      blob: undefined,
      timestamp: undefined
    });
  }

  return artObjects
}

function removeRandomArtObject (artObjects) {
  const [object] = (artObjects.splice(Math.floor(Math.random() * artObjects.length), 1) || []);

  store.dispatch({
    type: 'setWikipediaArtObjects',
    artObjects
  });

  return object
}

const wikipedia = {
  randomArtObject
};

const url = 'https://www.rijksmuseum.nl/api/en/collection?format=json&ps=30&imgonly=True&type=painting&key=1KfM6MpD';

async function randomArtObject$1 () {
  const artObjects = await getArtObjects$1();

  if (artObjects === undefined) return

  return removeRandomArtObject$1(artObjects)
}

async function getArtObjects$1 () {
  if (store.state.rijksArtObjects.length > 0) {
    return store.state.rijksArtObjects
  } else {
    const page = parseInt(localStorage.getItem('rijks_page') || 1, 10);

    let json;
    try {
      json = await fetch_2(`${url}&p=${page}`);
    } catch {
      return
    }

    const artObjects = [];

    for (const artObject of json.artObjects) {
      if (!artObject.webImage) continue

      artObjects.push({
        src: artObject.webImage.url,
        title: artObject.title,
        author: artObject.principalOrFirstMaker,
        provider: 'Rijksmuseum',
        titleLink: artObject.links.web,
        providerLink: 'https://www.rijksmuseum.nl/en',
        blob: undefined,
        timestamp: undefined
      });
    }

    store.dispatch({
      type: 'setRijksArtObjects',
      artObjects
    });

    localStorage.setItem('rijks_page', page + 1);

    return artObjects
  }
}

function removeRandomArtObject$1 (artObjects) {
  const [object] = (artObjects.splice(Math.floor(Math.random() * artObjects.length), 1) || []);

  store.dispatch({
    type: 'setRijksArtObjects',
    artObjects
  });

  return object
}

const rijks = {
  randomArtObject: randomArtObject$1
};

// A list of artworks deemed NSFW. This list is a quite moving selection,
// but people may not be able to appreciate the true extent of their beauty in an
// American corporate office setting.

// If a work is found to be delightful, yet very awkward in a non-progressive
// (or progressive, pending the definition of that word changing over time)
// environment, please add a PR for an addition here.
const blacklist = [
  'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Pierre-Auguste_Renoir_-_Parisiennes_in_Algerian_Costume_or_Harem_-_Google_Art_Project.jpg/2000px-Pierre-Auguste_Renoir_-_Parisiennes_in_Algerian_Costume_or_Harem_-_Google_Art_Project.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/John_William_Waterhouse_-_Echo_and_Narcissus_-_Google_Art_Project.jpg/2000px-John_William_Waterhouse_-_Echo_and_Narcissus_-_Google_Art_Project.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Hugo_van_der_Goes_-_The_Fall_of_Man_and_The_Lamentation_-_Google_Art_Project.jpg/2000px-Hugo_van_der_Goes_-_The_Fall_of_Man_and_The_Lamentation_-_Google_Art_Project.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Antonio_Allegri%2C_called_Correggio_-_Jupiter_and_Io_-_Google_Art_Project.jpg/2000px-Antonio_Allegri%2C_called_Correggio_-_Jupiter_and_Io_-_Google_Art_Project.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Angelo_Bronzino_-_Venus%2C_Cupid%2C_Folly_and_Time_-_National_Gallery%2C_London.jpg/2000px-Angelo_Bronzino_-_Venus%2C_Cupid%2C_Folly_and_Time_-_National_Gallery%2C_London.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Cornelis_Cornelisz._van_Haarlem_-_The_Fall_of_the_Titans_-_Google_Art_Project.jpg/2000px-Cornelis_Cornelisz._van_Haarlem_-_The_Fall_of_the_Titans_-_Google_Art_Project.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Venus_Consoling_Love%2C_Fran%C3%A7ois_Boucher%2C_1751.jpg/2000px-Venus_Consoling_Love%2C_Fran%C3%A7ois_Boucher%2C_1751.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Sarah_Goodridge_Beauty_Revealed_The_Metropolitan_Museum_of_Art.jpg/2000px-Sarah_Goodridge_Beauty_Revealed_The_Metropolitan_Museum_of_Art.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Piero_di_Cosimo_-_Portrait_de_femme_dit_de_Simonetta_Vespucci_-_Google_Art_Project.jpg/2000px-Piero_di_Cosimo_-_Portrait_de_femme_dit_de_Simonetta_Vespucci_-_Google_Art_Project.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Paul_Chabas_September_Morn_The_Metropolitan_Museum_of_Art.jpg/2000px-Paul_Chabas_September_Morn_The_Metropolitan_Museum_of_Art.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Venus_Consoling_Love%2C_François_Boucher%2C_1751.jpg/2000px-Venus_Consoling_Love%2C_François_Boucher%2C_1751.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Giorgione_-_Sleeping_Venus_-_Google_Art_Project_2.jpg/2000px-Giorgione_-_Sleeping_Venus_-_Google_Art_Project_2.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Baudry_paul_the_wave_and_the_pearl.jpg/2000px-Baudry_paul_the_wave_and_the_pearl.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Edouard_Manet_-_Olympia_-_Google_Art_Project_3.jpg/2000px-Edouard_Manet_-_Olympia_-_Google_Art_Project_3.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/RokebyVenus.jpg/2000px-RokebyVenus.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Goya_Maja_naga2.jpg/2000px-Goya_Maja_naga2.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/William-Adolphe_Bouguereau_%281825-1905%29_-_The_Wave_%281896%29.jpg/2000px-William-Adolphe_Bouguereau_%281825-1905%29_-_The_Wave_%281896%29.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Fouquet_Madonna.jpg/2000px-Fouquet_Madonna.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Angelo_Bronzino_-_Venus%2C_Cupid%2C_Folly_and_Time_-_National_Gallery%2C_London.jpg/2000px-Angelo_Bronzino_-_Venus%2C_Cupid%2C_Folly_and_Time_-_National_Gallery%2C_London.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Pierre-Auguste_Renoir%2C_French_-_The_Large_Bathers_-_Google_Art_Project.jpg/2000px-Pierre-Auguste_Renoir%2C_French_-_The_Large_Bathers_-_Google_Art_Project.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Peter_Paul_Rubens_-_The_Birth_of_the_Milky_Way%2C_1636-1637.jpg/2000px-Peter_Paul_Rubens_-_The_Birth_of_the_Milky_Way%2C_1636-1637.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Edvard_Munch_-_Madonna_-_Google_Art_Project.jpg/2000px-Edvard_Munch_-_Madonna_-_Google_Art_Project.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Feszty_Panorama.jpg/2000px-Feszty_Panorama.jpg'
];

const threeHours = 1000 * 60 * 60 * 3;

const isExpired = (timestamp) => {
  return timestamp < Date.now() - threeHours
};

const setCurrentArtObject = async (config = {}) => {
  let current = store.state.currentArtObject;
  let next = store.state.nextArtObject;

  if (current === undefined || isExpired(current.timestamp) || config.replace === true) {
    if (next === undefined) {
      current = await getArtObject();
    } else {
      current = next;
      next = undefined;
    }
  }

  store.dispatch({
    type: 'setCurrentArtObject',
    artObject: current
  });

  if (next === undefined) {
    next = await getArtObject();

    store.dispatch({
      type: 'setNextArtObject',
      artObject: next
    });
  }

  return current
};

const replaceArtObject = (config) => {
  return setCurrentArtObject({ ...config, replace: true })
};

const getRandom = () => {
  const r = Math.floor(Math.random() * 2);

  switch (r) {
    case 0: return wikipedia.randomArtObject()
    case 1: return rijks.randomArtObject()
  }
};

const getArtObject = async () => {
  const artObject = await getRandom();

  if (!artObject) {
    return getArtObject()
  }

  console.log(artObject.src, blacklist.includes(artObject.src));
  if (blacklist.includes(decodeURI(artObject.src))) {
    return getArtObject()
  }

  if (artObject.blob) {
    artObject.timestamp = Date.now();
    return artObject
  }

  const src = artObject.src.replace('chrome-extension://', 'https://');

  try {
    artObject.blob = await fetch_3(src);
  } catch (err) {
    return getArtObject()
  }

  artObject.timestamp = Date.now();
  return artObject
};

const ui = document.getElementById('ui');
const refreshBtn = document.getElementById('btn-refresh');
const background = document.getElementById('background');
const titleNode = document.getElementById('title');
const authorNode = document.getElementById('author');
const providerNode = document.getElementById('provider');

const hideUI = () => {
  ui.style.display = 'none';
};

const setImage = (state) => {
  const { blob, title, titleLink, author, authorLink, provider, providerLink } = state.currentArtObject;

  const img = new window.Image();
  const url = URL.createObjectURL(blob);

  img.onload = () => {
    background.classList.toggle('portrait', img.naturalWidth < img.naturalHeight);
    background.style.backgroundImage = `url('${url}')`;

    titleNode.textContent = title.length > 50 ? `${title.slice(0, 50)}...` : title;

    if (titleLink) {
      titleNode.href = titleLink;
      titleNode.style.pointerEvents = 'auto';
    } else {
      titleNode.style.pointerEvents = 'none';
    }

    authorNode.textContent = author ? `by ${author}` : '';

    if (authorLink) {
      authorNode.href = authorLink;
      authorNode.style.pointerEvents = 'auto';
    } else {
      authorNode.style.pointerEvents = 'none';
    }

    providerNode.textContent = `from ${provider}`;
    providerNode.href = providerLink;
  };

  img.src = url;
};

const addListeners = () => {
  store.subscribe('setCurrentArtObject', setImage);

  refreshBtn.addEventListener('click', async (e) => {
    if (e.target.classList.contains('active')) return

    e.target.classList.add('active');

    await setCurrentArtObject({ replace: true });

    e.target.classList.remove('active');
  });
};

const dom = {
  hideUI,
  addListeners
};

const setFullscreenMode = (callback) => {
  const endFullscreen = () => {
    window.removeEventListener('keydown', endFullscreen);
    window.removeEventListener('mousedown', endFullscreen);
    window.removeEventListener('touchstart', endFullscreen);
    callback();
  };

  window.addEventListener('keydown', endFullscreen, { passive: true });
  window.addEventListener('mousedown', endFullscreen, { passive: true });
  window.addEventListener('touchstart', endFullscreen, { passive: true });
};

const getCurrentArtObject = () => {
  return store.state.currentArtObject
};

const main = async () => {
  navigator.storage.persist();

  await store.initialize();

  dom.addListeners();

  await setCurrentArtObject();

  if (window.onApplicationReady !== undefined) {
    window.onApplicationReady({
      replaceArtObject,
      getCurrentArtObject,
      setCurrentArtObject,
      setFullscreenMode,
      hideUI: dom.hideUI
    });
  }
};

main();
