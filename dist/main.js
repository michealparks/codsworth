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

const constructStore = (reducer, initialState) => {
  const subscribers = [];
  let state = initialState;

  const subscribe = (fn) => {
    subscribers.push(fn);
  };

  const unsubscribe = (fn) => {
    subscribers.splice(subscribers.indexOf(fn), 1);
  };

  const dispatch = (action) => {
    state = reducer(state, action);

    for (const fn of subscribers) {
      fn(state);
    }
  };

  return {
    state,
    reducer,
    subscribers,
    subscribe,
    unsubscribe,
    dispatch
  }
};

const imageStore = constructStore((state, action) => {
  switch (action.type) {
    case 'ADD_ARTOBJECT':
      return action.artObject
    default:
      return state
  }
});

const artObjectsStore = constructStore((state, action) => {
  switch (action.type) {
    case 'ADD_ARTOBJECTS':
      return action.artObjects
    default:
      return state
  }
});

const timeout = (time) => {
  return new Promise((resolve) => {
    setTimeout(() => { resolve(); }, time);
  })
};

const fetch = async (...args) => {
  const response = await Promise.race([
    timeout(10000),
    window.fetch(...args)
  ]);

  if (response.status >= 200 && response.status < 300) {
    return response
  } else {
    throw new Error(`request responded with status code ${response.status}`)
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
  try {
    const response = await fetch(...args);
    const blob = await response.blob();
    return [undefined, blob]
  } catch (err) {
    return [err]
  }
};

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
    const page = 'Wikipedia:Featured_pictures/Artwork/Paintings';
    const url = `https://en.wikipedia.org/w/api.php?action=parse&prop=text&page=${page}&format=json&origin=*`;
    const [err, json] = await fetchJSON(url);

    if (err) return

    const artObjects = parsePage(json.parse.text['*']);

    artObjectsStore.dispatch({
      type: 'ADD_ARTOBJECTS',
      artObjects: { key: 'wikipedia', artObjects }
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

  artObjectsStore.dispatch({
    type: 'ADD_ARTOBJECTS',
    artObjects: { key: 'wikipedia', artObjects }
  });

  return object
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
    const [err, json] = await fetchJSON(`${endpoint}&p=${page}`);

    if (err) return

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

const rijks = {
  randomArtObject: randomArtObject$1
};

// A list of artwork deemed NSFW. It is a moving selection of works,
// but people may not be able to appreciate the true extent of their beauty in an office setting.

// If a work is found to be delightful, yet very awkward in a non-progressive
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

const setArtObject = async () => {
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
  const [err, blob] = await fetchBlob(src);

  if (err) return getArtObject()

  artObject.blob = blob;
  artObject.timestamp = Date.now();

  return artObject
};

const ui = document.getElementById('ui');
const refreshBtn = document.getElementById('btn-refresh');
const background = document.getElementById('background');
const title = document.getElementById('title');
const author = document.getElementById('author');
const provider = document.getElementById('provider');

const hideUI = () => {
  ui.style.display = 'none';
};

const setImage = (artObject) => {
  if (artObject.id === 'next') return

  const img = new window.Image();
  const url = URL.createObjectURL(artObject.blob);

  img.onload = () => {
    background.classList.toggle('portrait', img.naturalWidth < img.naturalHeight);
    background.style.backgroundImage = `url('${url}')`;

    title.textContent = artObject.title.length > 50
      ? `${artObject.title.slice(0, 50)}...`
      : artObject.title;

    if (artObject.titleLink) {
      title.href = artObject.titleLink;
      title.style.pointerEvents = 'auto';
    } else {
      title.style.pointerEvents = 'none';
    }

    author.textContent = artObject.author ? `by ${artObject.author}` : '';

    if (artObject.authorLink) {
      author.href = artObject.authorLink;
      author.style.pointerEvents = 'auto';
    } else {
      author.style.pointerEvents = 'none';
    }

    provider.textContent = `from ${artObject.provider}`;
    provider.href = artObject.providerLink;
  };

  img.src = url;

  imageStore.unsubscribe(setImage);
};

const replaceArtObject = async () => {
  imageStore.subscribe(setImage);

  await db.remove('images', 'current');
  await setArtObject();

  return true
};

const addListeners = () => {
  imageStore.subscribe(setImage);

  refreshBtn.addEventListener('click', async (e) => {
    if (e.target.classList.contains('active')) return

    e.target.classList.add('active');

    await replaceArtObject();

    e.target.classList.remove('active');
  });

  window.replaceArtObject = replaceArtObject;
  window.hideUI = hideUI;
};

const dom = {
  addListeners
};

const flush = async () => {
  localStorage.removeItem('rijks_page');

  try {
    await db.destroy('images');
  } catch (err) { console.error(err); }

  try {
    await db.destroy('artObjects');
  } catch (err) { console.error(err); }
};

const main = async () => {
  navigator.storage.persist();

  await db.open('galeri', 1, (e) => {
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

  imageStore.subscribe((artObject) => {
    db.put('images', artObject);
  });

  artObjectsStore.subscribe((data) => {
    db.put('artObjects', data);
  });


  dom.addListeners();

  await setArtObject();

  window.flush = flush;
};

main();
