(function () {
  'use strict';

  let db;

  async function openDB () {
    const request = window.indexedDB.open('galeri', 3);

    request.onupgradeneeded = function (e) {
      const db = e.target.result;

      if (!db.objectStoreNames.contains('images')) {
        db.createObjectStore('images', {
          keyPath: 'id',
          autoIncrement: true
        });
      }

      if (!db.objectStoreNames.contains('artObjects')) {
        db.createObjectStore('artObjects', {
          keyPath: 'id',
          autoIncrement: true
        });
      }
    };

    db = await promise(request);

    return db
  }

  async function putDB (name, data) {
    return promise(db
      .transaction(name, 'readwrite')
      .objectStore(name)
      .put({ ...data, created: new Date().getTime() }))
  }

  async function getDB (name, key) {
    return promise(db
      .transaction(name)
      .objectStore(name)
      .get(key))
  }

  async function clearDB (name) {
    return promise(db
      .transaction(name, 'readwrite')
      .objectStore(name)
      .clear())
  }

  function promise (request) {
    return new Promise(function (resolve, reject) {
      function onEvent ({ target }) {
        resolve(target.result);
      }

      request.onsuccess = onEvent;
      request.onerror = onEvent;
      request.onabort = onEvent;
    })
  }

  function subscribe (fn) {
    this.subscribers.push(fn);
  }

  function unsubscribe (fn) {
    this.subscribers.splice(this.subscribers.indexOf(fn), 1);
  }

  function dispatch (action) {
    this.state = this.reducer(this.state, action);

    for (let i = 0, l = this.subscribers.length; i < l; i++) {
      this.subscribers[i](this.state);
    }
  }

  function getState () {
    return this.state
  }

  function createStore (reducer, preloadedState) {
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

  imageStore.subscribe(async function (artObject) {
    const id = await putDB('images', artObject);
    localStorage.setItem('imageId', id);
  });

  artObjectsStore.subscribe(async function (data) {
    const id = await putDB('artObjects', data);
    localStorage.setItem('artObjectsId', id);
  });

  async function randomArtObject () {
    const artObjects = await getArtObjects();

    if (!artObjects) return

    return removeRandomArtObject(artObjects)
  }

  async function getArtObjects () {
    const artObjectsId = localStorage.getItem('artObjectsId');
  }

  const metmuseum = {
    randomArtObject
  };

  async function randomArtObject$1 () {
    const artObjects = await getArtObjects$1();

    if (!artObjects) return

    return removeRandomArtObject$1(artObjects)
  }

  async function getArtObjects$1 () {
    const id = localStorage.getItem('artObjectsId');

    if (id) {
      const res = await getDB('artObjects', 'wikipedia');
      const { artObjects } = res || {};

      if (artObjects && artObjects.length > 0) {
        return artObjects
      } else {
        localStorage.removeItem('artObjectsId');
        return getArtObjects$1()
      }
    } else {
      const pageStr = await fetchPage('Wikipedia:Featured_pictures/Artwork/Paintings');

      if (!pageStr) return

      const artObjects = parsePage(pageStr);

      artObjectsStore.dispatch({
        type: 'ADD_ARTOBJECTS',
        artObjects: { key: 'wikipedia', artObjects }
      });

      return artObjects
    }
  }

  function parsePage (pageStr) {
    const doc = new DOMParser().parseFromString(pageStr, 'text/html');
    return Array.from(doc.querySelectorAll('.gallerybox')).map(function (artObject) {
      const img = artObject.querySelector('img') || { src: '' };
      const links = artObject.querySelectorAll('.gallerytext a');
      const boldEl = artObject.querySelector('.gallerytext b');
      const titleEl = boldEl.children[0] ? boldEl.children[0] : boldEl;
      const authorEl = links.length > 1 ? links[1] : links[0];
      const arr = img.src.split('/').slice(0, -1);
      const src = arr.concat(`2500px-${arr[arr.length - 1]}`).join('/');
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

  function removeRandomArtObject$1 (artObjects) {
    const [object] = (artObjects.splice(Math.floor(Math.random() * artObjects.length), 1) || []);

    artObjectsStore.dispatch({
      type: 'ADD_ARTOBJECTS',
      artObjects
    });

    return object
  }

  async function fetchPage (page) {
    try {
      const response = await window.fetch(`https://en.wikipedia.org/w/api.php?action=parse&prop=text&page=${page}&format=json&origin=*`);
      const json = await response.json();
      return json.parse.text['*']
    } catch (err) {
      console.error(err);
    }
  }

  const wikipedia = {
    randomArtObject: randomArtObject$1
  };

  async function randomArtObject$2 () {
    const artObjects = await getArtObjects$2();

    if (!artObjects) return

    return removeRandomArtObject$2(artObjects)
  }

  async function getArtObjects$2 () {
    const id = localStorage.getItem('rijks_objects_id');

    if (id) {
      const res = await getDB('artObjects', 'rijks');
      const { artObjects } = res || {};

      if (artObjects && artObjects.length > 0) {
        return artObjects
      } else {
        localStorage.removeItem('rijks_objects_id');
        return getArtObjects$2()
      }
    } else {
      const page = parseInt(localStorage.getItem('rijks_page') || 1, 10);
      const artObjects = fetchObjects(page);

      if (!artObjects) return

      artObjectsStore.dispatch({
        type: 'ADD_ARTOBJECTS',
        artObjects: { key: 'rijks', artObjects }
      });

      localStorage.setItem('rijks_page', page + 1);

      return artObjects
    }
  }

  function removeRandomArtObject$2 (artObjects) {
    const [object] = (artObjects.splice(Math.floor(Math.random() * artObjects.length), 1) || []);

    artObjectsStore.dispatch({
      type: 'ADD_ARTOBJECTS',
      artObjects
    });

    return object
  }

  async function fetchObjects (page) {
    try {
      const res = await window.fetch(`https://www.rijksmuseum.nl/api/en/collection?format=json&ps=30&p=${page}&imgonly=True&type=painting&key=1KfM6MpD`);
      const json = await res.json();
      return json.artObjects.filter(function (artObject) {
        return artObject.webImage !== null && artObject.webImage !== undefined
      }).map(function (artObject) {
        return {
          src: artObject.webImage.url,
          title: artObject.title.length > 60
            ? `${artObject.title.slice(0, 60)}...`
            : artObject.title,
          author: artObject.principalOrFirstMaker,
          provider: 'Rijksmuseum',
          titleLink: artObject.links.web,
          providerLink: 'https://www.rijksmuseum.nl/en',
          blob: undefined,
          timestamp: undefined
        }
      })
    } catch (err) {
      console.error(err);
    }
  }

  const rijks = {
    randomArtObject: randomArtObject$2
  };

  async function getArtObject (forceNew) {
    const imageId = forceNew
      ? null
      : localStorage.getItem('imageId');

    if (imageId) {
      return getDB('images', parseInt(imageId, 10))
    }

    const artObject = await getRandom();

    if (!artObject) return getArtObject()

    const success = await populateImage(artObject);

    return success ? artObject : getArtObject()
  }

  function getRandom () {
    const r = Math.floor(Math.random() * 2);

    console.log(r);

    switch (r) {
      case 0: return wikipedia.randomArtObject()
      case 1: return rijks.randomArtObject()
      case 2: return metmuseum.randomArtObject()
    }
  }

  async function populateImage (artObject) {
    const blob = await fetchImageBlob(artObject.src);

    if (!blob) return false

    artObject.blob = blob;
    artObject.timestamp = Date.now();

    return true
  }

  async function fetchImageBlob (src) {
    try {
      const res = await window.fetch(src.replace('chrome-extension://', 'https://'));
      const blob = await res.blob();
      return blob
    } catch (err) {
      console.error(err);
    }
  }

  function setImage (artObject) {
    const background = document.getElementById('background');
    const img = new window.Image();
    const url = URL.createObjectURL(artObject.blob);

    img.onload = function () {
      background.classList.toggle('portrait', img.naturalWidth < img.naturalHeight);

      background.style.backgroundImage = `url('${url}')`;

      const titleEl = document.getElementById('title');
      titleEl.textContent = artObject.title;

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
        titleEl.style.pointerEvents = 'auto';
      } else {
        titleEl.style.pointerEvents = 'none';
      }

      const providerEl = document.getElementById('provider');
      providerEl.textContent = `from ${artObject.provider}`;
      providerEl.href = artObject.providerLink;
    };

    img.src = url;

    imageStore.unsubscribe(setImage);
  }

  let active = false;

  function addListeners () {
    document.getElementById('btn-refresh')
      .addEventListener('click', async function (e) {
        const el = e.target;

        if (active) return

        active = true;
        el.classList.remove('active');
        el.classList.add('active');

        imageStore.subscribe(setImage);

        const artObject = await getArtObject(true);

        imageStore.dispatch({
          type: 'ADD_ARTOBJECT',
          artObject
        });

        el.addEventListener('animationiteration', function iterate () {
          el.classList.remove('active');
          el.removeEventListener('animationiteration', iterate);
        });

        active = false;
      });

    imageStore.subscribe(setImage);
  }

  const dom = {
    addListeners
  };

  async function main () {
    navigator.storage.persist();

    await openDB();

    dom.addListeners();

    const artObject = await getArtObject();

    imageStore.dispatch({
      type: 'ADD_ARTOBJECT',
      artObject
    });

    if (artObject.timestamp < Date.now() - (1000 * 60 * 60 * 2)) {
      localStorage.removeItem('imageId');

      const next = await getArtObject();

      imageStore.dispatch({
        type: 'ADD_ARTOBJECT',
        artObject: next
      });
    }

    window.flush = function () {
      localStorage.removeItem('artObjectsId');
      localStorage.removeItem('imageId');

      localStorage.removeItem('rijks_objects_id');
      localStorage.removeItem('rijks_page');

      try { clearDB('images'); } catch (err) { console.error(err); }
      try { clearDB('artObjects'); } catch (err) { console.error(err); }
    };
  }

  main();

}());
