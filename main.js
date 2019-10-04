const db = {
  ref: undefined,

  async open (name, version, onupgradeneeded) {
    const request = window.indexedDB.open(name, version);
    request.onupgradeneeded = onupgradeneeded;
    db.ref = await db.promise(request);
  },

  get (name, key) {
    return db.promise(db.ref
      .transaction(name)
      .objectStore(name)
      .get(key))
  },

  put (name, data) {
    return db.promise(db.ref
      .transaction(name, 'readwrite')
      .objectStore(name)
      .put({ ...data, created: new Date().getTime() }))
  },

  getAll (name) {
    return db.promise(db.ref
      .transaction(name)
      .objectStore(name)
      .getAll())
  },

  remove (name, key) {
    return db.promise(db.ref
      .transaction(name, 'readwrite')
      .objectStore(name)
      .delete(key))
  },

  destroy (name) {
    return db.promise(db.ref
      .transaction(name, 'readwrite')
      .objectStore(name)
      .clear())
  },

  promise (request) {
    return new Promise(function (resolve) {
      function onEvent ({ target }) {
        resolve(target.result);
        request.removeEventListener('success', onEvent);
        request.removeEventListener('error', onEvent);
        request.removeEventListener('abort', onEvent);
      }

      request.addEventListener('success', onEvent);
      request.addEventListener('error', onEvent);
      request.addEventListener('abort', onEvent);
    })
  }
};

function createStore (reducer, state) {
  const store = {
    state,
    reducer,
    subscribe,
    unsubscribe,
    subscribers: [],
    dispatch
  };

  function subscribe (fn) {
    store.subscribers.push(fn);
  }

  function unsubscribe (fn) {
    store.subscribers.splice(store.subscribers.indexOf(fn), 1);
  }

  function dispatch (action) {
    store.state = reducer(store.state, action);

    store.subscribers.forEach(function (fn) {
      fn(store.state);
    });
  }

  return store
}

const imageStore = createStore(function (state, action) {
  switch (action.type) {
    case 'ADD_ARTOBJECT':
      return action.artObject
    default:
      return state
  }
});

const artObjectsStore = createStore(function (state, action) {
  switch (action.type) {
    case 'ADD_ARTOBJECTS':
      return action.artObjects
    default:
      return state
  }
});

imageStore.subscribe(function (artObject) {
  db.put('images', artObject);
});

artObjectsStore.subscribe(function (data) {
  db.put('artObjects', data);
});

function timeout (time) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve();
    }, time);
  })
}

async function fetch (...args) {
  const response = await Promise.race([
    timeout(10000),
    window.fetch(...args)
  ]);

  if (!response) return

  if (response.status >= 200 && response.status < 300) {
    return response
  }
}

async function randomArtObject () {
  const artObjects = await getArtObjects();

  if (!artObjects) return

  return removeRandomArtObject(artObjects)
}

async function getArtObjects () {
  const res = await db.get('artObjects', 'wikipedia');

  if (res && res.artObjects.length > 0) {
    return res.artObjects
  } else {
    const [err, str] = await fetchPage('Wikipedia:Featured_pictures/Artwork/Paintings');

    if (err) return

    const artObjects = parsePage(str);
    console.log(artObjects.map(function ({ src }) {
      return src
    }));

    artObjectsStore.dispatch({
      type: 'ADD_ARTOBJECTS',
      artObjects: { key: 'wikipedia', artObjects }
    });

    return artObjects
  }
}

function parsePage (str) {
  const doc = new DOMParser().parseFromString(str, 'text/html');
  const galleryboxes = Array.from(doc.querySelectorAll('.gallerybox'));

  return galleryboxes.map(function (gallerybox) {
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

    return {
      src: `https://upload.wikimedia.org${src.split('//upload.wikimedia.org').pop()}`,
      title,
      author,
      titleLink: titleLink ? `https://wikipedia.org/wiki${titleLink.split('/wiki').pop()}` : '',
      authorLink: authorLink ? `https://wikipedia.org/wiki${authorLink.split('/wiki').pop()}` : '',
      provider: 'Wikipedia',
      providerLink: 'https://wikipedia.org',
      blob: undefined,
      timestamp: undefined
    }
  })
}

function removeRandomArtObject (artObjects) {
  const [object] = (artObjects.splice(Math.floor(Math.random() * artObjects.length), 1) || []);

  artObjectsStore.dispatch({
    type: 'ADD_ARTOBJECTS',
    artObjects: { key: 'wikipedia', artObjects }
  });

  return object
}

async function fetchPage (page) {
  try {
    const response = await fetch(`https://en.wikipedia.org/w/api.php?action=parse&prop=text&page=${page}&format=json&origin=*`);

    if (!response) return [true]

    const json = await response.json();

    return [undefined, json.parse.text['*']]
  } catch (err) {
    console.error(err);
    return [true]
  }
}

const wikipedia = {
  randomArtObject
};

const endpoint = 'https://www.rijksmuseum.nl/api/en/collection?format=json&ps=30&imgonly=True&type=painting&key=1KfM6MpD';

async function randomArtObject$1 () {
  const artObjects = await getArtObjects$1();

  if (!artObjects) return

  return removeRandomArtObject$1(artObjects)
}

async function getArtObjects$1 () {
  const res = await db.get('artObjects', 'rijks');

  if (res && res.artObjects.length > 0) {
    return res.artObjects
  } else {
    const page = parseInt(localStorage.getItem('rijks_page') || 1, 10);
    const [err, objects] = await fetchObjects(page);

    if (err) return

    const artObjects = objects
      .filter(function (artObject) {
        return (
          artObject.webImage !== null &&
          artObject.webImage !== undefined
        )
      }).map(function (artObject) {
        return {
          src: artObject.webImage.url,
          title: artObject.title,
          author: artObject.principalOrFirstMaker,
          provider: 'Rijksmuseum',
          titleLink: artObject.links.web,
          providerLink: 'https://www.rijksmuseum.nl/en',
          blob: undefined,
          timestamp: undefined
        }
      });

    artObjectsStore.dispatch({
      type: 'ADD_ARTOBJECTS',
      artObjects: { key: 'rijks', artObjects }
    });

    localStorage.setItem('rijks_page', page + 1);

    return artObjects
  }
}

function removeRandomArtObject$1 (artObjects) {
  const [object] = (artObjects.splice(Math.floor(Math.random() * artObjects.length), 1) || []);

  artObjectsStore.dispatch({
    type: 'ADD_ARTOBJECTS',
    artObjects: { key: 'rijks', artObjects }
  });

  return object
}

async function fetchObjects (page) {
  try {
    const res = await fetch(`${endpoint}&p=${page}`);

    if (!res) return [true]

    const json = await res.json();

    return [undefined, json.artObjects]
  } catch (err) {
    console.error(err);
    return [true]
  }
}

const rijks = {
  randomArtObject: randomArtObject$1
};

// Below is a list of artwork deemed NSFW. It's quite a moving selection,
// but people may be using this app in an office setting.

// If a piece is found that is delightful, yet awkward in a non-progressive
// setting, please add a PR here.
const blacklist = [
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
  'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Feszty_Panorama.jpg/2000px-Feszty_Panorama.jpg',
];

const threeHours = 1000 * 60 * 60 * 3;

async function setArtObject () {
  let current, next;

  current = await db.get('images', 'current');

  const expired = (current && current.timestamp < Date.now() - threeHours);

  if (!current || expired) {
    next = await db.get('images', 'next');

    if (next) {
      current = next;
      await db.remove('images', 'next');
    } else {
      current = await getArtObject();
    }
    console.log(current);
  }

  imageStore.dispatch({
    type: 'ADD_ARTOBJECT',
    artObject: {
      ...current,
      id: 'current'
    }
  });

  next = await db.get('images', 'next');

  if (!next) {
    next = await getArtObject();

    imageStore.dispatch({
      type: 'ADD_ARTOBJECT',
      artObject: {
        ...next,
        id: 'next'
      }
    });
  }
}

function getRandom () {
  const r = Math.floor(Math.random() * 2);

  switch (r) {
    case 0: return wikipedia.randomArtObject()
    case 1: return rijks.randomArtObject()
  }
}

async function getArtObject () {
  const artObject = await getRandom();

  if (!artObject) {
    return getArtObject()
  }

  console.log(artObject.src, blacklist.includes(artObject.src));
  if (blacklist.includes(artObject.src)) {
    return getArtObject()
  }

  if (artObject.blob) {
    artObject.timestamp = Date.now();
    return artObject
  }

  const [err, blob] = await fetchImageBlob(artObject.src);

  if (err) return getArtObject()

  artObject.blob = blob;
  artObject.timestamp = Date.now();

  return artObject
}

async function fetchImageBlob (src) {
  try {
    const res = await fetch(src.replace('chrome-extension://', 'https://'));

    if (!res) return [true]

    const blob = await res.blob();
    return [undefined, blob]
  } catch (err) {
    console.error(err);
    return [true]
  }
}

function setImage (artObject) {
  if (artObject.id === 'next') return

  const background = document.getElementById('background');
  const img = new window.Image();
  const url = URL.createObjectURL(artObject.blob);

  img.onload = function () {
    background.classList.toggle('portrait', img.naturalWidth < img.naturalHeight);

    background.style.backgroundImage = `url('${url}')`;

    const titleEl = document.getElementById('title');
    titleEl.textContent = artObject.title.length > 50
      ? `${artObject.title.slice(0, 50)}...`
      : artObject.title;

    if (artObject.titleLink) {
      titleEl.href = artObject.titleLink;
      titleEl.style.pointerEvents = 'auto';
    } else {
      titleEl.style.pointerEvents = 'none';
    }

    const authorEl = document.getElementById('author');
    authorEl.textContent = artObject.author ? `by ${artObject.author}` : '';

    if (artObject.authorLink) {
      authorEl.href = artObject.authorLink;
      authorEl.style.pointerEvents = 'auto';
    } else {
      authorEl.style.pointerEvents = 'none';
    }

    const providerEl = document.getElementById('provider');
    providerEl.textContent = `from ${artObject.provider}`;
    providerEl.href = artObject.providerLink;
  };

  img.src = url;

  imageStore.unsubscribe(setImage);
}

let active = false;

const refreshBtn = document.getElementById('btn-refresh');

function addListeners () {
  imageStore.subscribe(setImage);

  refreshBtn.addEventListener('animationiteration', function () {

  });

  refreshBtn.addEventListener('click', async function (e) {
    if (active) return

    active = true;
    refreshBtn.classList.add('active');

    imageStore.subscribe(setImage);

    await db.remove('images', 'current');
    await setArtObject();

    refreshBtn.classList.remove('active');

    active = false;
  });
}

const dom = {
  addListeners
};

async function flush () {
  localStorage.removeItem('rijks_page');

  try { await db.destroy('images'); } catch (err) { console.error(err); }
  try { await db.destroy('artObjects'); } catch (err) { console.error(err); }
}

async function main () {
  navigator.storage.persist();

  await db.open('galeri', 1, function (e) {
    const { result } = e.target;

    if (!result.objectStoreNames.contains('images')) {
      result.createObjectStore('images', {
        keyPath: 'id',
        autoIncrement: true
      });
    }

    if (!result.objectStoreNames.contains('artObjects')) {
      result.createObjectStore('artObjects', {
        keyPath: 'key',
        autoIncrement: true
      });
    }
  });

  dom.addListeners();

  await setArtObject();

  window.flush = flush;
}

main();
