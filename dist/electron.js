'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var Stream = _interopDefault(require('stream'));
var http = _interopDefault(require('http'));
var Url = _interopDefault(require('url'));
var https = _interopDefault(require('https'));
var zlib = _interopDefault(require('zlib'));
var util$2 = _interopDefault(require('util'));
var path = _interopDefault(require('path'));
var child_process = _interopDefault(require('child_process'));
var fs = _interopDefault(require('fs'));
var os = _interopDefault(require('os'));
var crypto = _interopDefault(require('crypto'));
var assert = _interopDefault(require('assert'));
var tty = _interopDefault(require('tty'));

// Based on https://github.com/tmpvar/jsdom/blob/aa85b2abf07766ff7bf5c1f6daafb3726f2f2db5/lib/jsdom/living/blob.js

// fix for "Readable" isn't a named export issue
const Readable = Stream.Readable;

const BUFFER = Symbol('buffer');
const TYPE = Symbol('type');

class Blob {
	constructor() {
		this[TYPE] = '';

		const blobParts = arguments[0];
		const options = arguments[1];

		const buffers = [];
		let size = 0;

		if (blobParts) {
			const a = blobParts;
			const length = Number(a.length);
			for (let i = 0; i < length; i++) {
				const element = a[i];
				let buffer;
				if (element instanceof Buffer) {
					buffer = element;
				} else if (ArrayBuffer.isView(element)) {
					buffer = Buffer.from(element.buffer, element.byteOffset, element.byteLength);
				} else if (element instanceof ArrayBuffer) {
					buffer = Buffer.from(element);
				} else if (element instanceof Blob) {
					buffer = element[BUFFER];
				} else {
					buffer = Buffer.from(typeof element === 'string' ? element : String(element));
				}
				size += buffer.length;
				buffers.push(buffer);
			}
		}

		this[BUFFER] = Buffer.concat(buffers);

		let type = options && options.type !== undefined && String(options.type).toLowerCase();
		if (type && !/[^\u0020-\u007E]/.test(type)) {
			this[TYPE] = type;
		}
	}
	get size() {
		return this[BUFFER].length;
	}
	get type() {
		return this[TYPE];
	}
	text() {
		return Promise.resolve(this[BUFFER].toString());
	}
	arrayBuffer() {
		const buf = this[BUFFER];
		const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
		return Promise.resolve(ab);
	}
	stream() {
		const readable = new Readable();
		readable._read = function () {};
		readable.push(this[BUFFER]);
		readable.push(null);
		return readable;
	}
	toString() {
		return '[object Blob]';
	}
	slice() {
		const size = this.size;

		const start = arguments[0];
		const end = arguments[1];
		let relativeStart, relativeEnd;
		if (start === undefined) {
			relativeStart = 0;
		} else if (start < 0) {
			relativeStart = Math.max(size + start, 0);
		} else {
			relativeStart = Math.min(start, size);
		}
		if (end === undefined) {
			relativeEnd = size;
		} else if (end < 0) {
			relativeEnd = Math.max(size + end, 0);
		} else {
			relativeEnd = Math.min(end, size);
		}
		const span = Math.max(relativeEnd - relativeStart, 0);

		const buffer = this[BUFFER];
		const slicedBuffer = buffer.slice(relativeStart, relativeStart + span);
		const blob = new Blob([], { type: arguments[2] });
		blob[BUFFER] = slicedBuffer;
		return blob;
	}
}

Object.defineProperties(Blob.prototype, {
	size: { enumerable: true },
	type: { enumerable: true },
	slice: { enumerable: true }
});

Object.defineProperty(Blob.prototype, Symbol.toStringTag, {
	value: 'Blob',
	writable: false,
	enumerable: false,
	configurable: true
});

/**
 * fetch-error.js
 *
 * FetchError interface for operational errors
 */

/**
 * Create FetchError instance
 *
 * @param   String      message      Error message for human
 * @param   String      type         Error type for machine
 * @param   String      systemError  For Node.js system error
 * @return  FetchError
 */
function FetchError(message, type, systemError) {
  Error.call(this, message);

  this.message = message;
  this.type = type;

  // when err.type is `system`, err.code contains system error code
  if (systemError) {
    this.code = this.errno = systemError.code;
  }

  // hide custom error implementation details from end-users
  Error.captureStackTrace(this, this.constructor);
}

FetchError.prototype = Object.create(Error.prototype);
FetchError.prototype.constructor = FetchError;
FetchError.prototype.name = 'FetchError';

let convert;
try {
	convert = require('encoding').convert;
} catch (e) {}

const INTERNALS = Symbol('Body internals');

// fix an issue where "PassThrough" isn't a named export for node <10
const PassThrough = Stream.PassThrough;

/**
 * Body mixin
 *
 * Ref: https://fetch.spec.whatwg.org/#body
 *
 * @param   Stream  body  Readable stream
 * @param   Object  opts  Response options
 * @return  Void
 */
function Body(body) {
	var _this = this;

	var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
	    _ref$size = _ref.size;

	let size = _ref$size === undefined ? 0 : _ref$size;
	var _ref$timeout = _ref.timeout;
	let timeout = _ref$timeout === undefined ? 0 : _ref$timeout;

	if (body == null) {
		// body is undefined or null
		body = null;
	} else if (isURLSearchParams(body)) {
		// body is a URLSearchParams
		body = Buffer.from(body.toString());
	} else if (isBlob(body)) ; else if (Buffer.isBuffer(body)) ; else if (Object.prototype.toString.call(body) === '[object ArrayBuffer]') {
		// body is ArrayBuffer
		body = Buffer.from(body);
	} else if (ArrayBuffer.isView(body)) {
		// body is ArrayBufferView
		body = Buffer.from(body.buffer, body.byteOffset, body.byteLength);
	} else if (body instanceof Stream) ; else {
		// none of the above
		// coerce to string then buffer
		body = Buffer.from(String(body));
	}
	this[INTERNALS] = {
		body,
		disturbed: false,
		error: null
	};
	this.size = size;
	this.timeout = timeout;

	if (body instanceof Stream) {
		body.on('error', function (err) {
			const error = err.name === 'AbortError' ? err : new FetchError(`Invalid response body while trying to fetch ${_this.url}: ${err.message}`, 'system', err);
			_this[INTERNALS].error = error;
		});
	}
}

Body.prototype = {
	get body() {
		return this[INTERNALS].body;
	},

	get bodyUsed() {
		return this[INTERNALS].disturbed;
	},

	/**
  * Decode response as ArrayBuffer
  *
  * @return  Promise
  */
	arrayBuffer() {
		return consumeBody.call(this).then(function (buf) {
			return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
		});
	},

	/**
  * Return raw response as Blob
  *
  * @return Promise
  */
	blob() {
		let ct = this.headers && this.headers.get('content-type') || '';
		return consumeBody.call(this).then(function (buf) {
			return Object.assign(
			// Prevent copying
			new Blob([], {
				type: ct.toLowerCase()
			}), {
				[BUFFER]: buf
			});
		});
	},

	/**
  * Decode response as json
  *
  * @return  Promise
  */
	json() {
		var _this2 = this;

		return consumeBody.call(this).then(function (buffer) {
			try {
				return JSON.parse(buffer.toString());
			} catch (err) {
				return Body.Promise.reject(new FetchError(`invalid json response body at ${_this2.url} reason: ${err.message}`, 'invalid-json'));
			}
		});
	},

	/**
  * Decode response as text
  *
  * @return  Promise
  */
	text() {
		return consumeBody.call(this).then(function (buffer) {
			return buffer.toString();
		});
	},

	/**
  * Decode response as buffer (non-spec api)
  *
  * @return  Promise
  */
	buffer() {
		return consumeBody.call(this);
	},

	/**
  * Decode response as text, while automatically detecting the encoding and
  * trying to decode to UTF-8 (non-spec api)
  *
  * @return  Promise
  */
	textConverted() {
		var _this3 = this;

		return consumeBody.call(this).then(function (buffer) {
			return convertBody(buffer, _this3.headers);
		});
	}
};

// In browsers, all properties are enumerable.
Object.defineProperties(Body.prototype, {
	body: { enumerable: true },
	bodyUsed: { enumerable: true },
	arrayBuffer: { enumerable: true },
	blob: { enumerable: true },
	json: { enumerable: true },
	text: { enumerable: true }
});

Body.mixIn = function (proto) {
	for (const name of Object.getOwnPropertyNames(Body.prototype)) {
		// istanbul ignore else: future proof
		if (!(name in proto)) {
			const desc = Object.getOwnPropertyDescriptor(Body.prototype, name);
			Object.defineProperty(proto, name, desc);
		}
	}
};

/**
 * Consume and convert an entire Body to a Buffer.
 *
 * Ref: https://fetch.spec.whatwg.org/#concept-body-consume-body
 *
 * @return  Promise
 */
function consumeBody() {
	var _this4 = this;

	if (this[INTERNALS].disturbed) {
		return Body.Promise.reject(new TypeError(`body used already for: ${this.url}`));
	}

	this[INTERNALS].disturbed = true;

	if (this[INTERNALS].error) {
		return Body.Promise.reject(this[INTERNALS].error);
	}

	let body = this.body;

	// body is null
	if (body === null) {
		return Body.Promise.resolve(Buffer.alloc(0));
	}

	// body is blob
	if (isBlob(body)) {
		body = body.stream();
	}

	// body is buffer
	if (Buffer.isBuffer(body)) {
		return Body.Promise.resolve(body);
	}

	// istanbul ignore if: should never happen
	if (!(body instanceof Stream)) {
		return Body.Promise.resolve(Buffer.alloc(0));
	}

	// body is stream
	// get ready to actually consume the body
	let accum = [];
	let accumBytes = 0;
	let abort = false;

	return new Body.Promise(function (resolve, reject) {
		let resTimeout;

		// allow timeout on slow response body
		if (_this4.timeout) {
			resTimeout = setTimeout(function () {
				abort = true;
				reject(new FetchError(`Response timeout while trying to fetch ${_this4.url} (over ${_this4.timeout}ms)`, 'body-timeout'));
			}, _this4.timeout);
		}

		// handle stream errors
		body.on('error', function (err) {
			if (err.name === 'AbortError') {
				// if the request was aborted, reject with this Error
				abort = true;
				reject(err);
			} else {
				// other errors, such as incorrect content-encoding
				reject(new FetchError(`Invalid response body while trying to fetch ${_this4.url}: ${err.message}`, 'system', err));
			}
		});

		body.on('data', function (chunk) {
			if (abort || chunk === null) {
				return;
			}

			if (_this4.size && accumBytes + chunk.length > _this4.size) {
				abort = true;
				reject(new FetchError(`content size at ${_this4.url} over limit: ${_this4.size}`, 'max-size'));
				return;
			}

			accumBytes += chunk.length;
			accum.push(chunk);
		});

		body.on('end', function () {
			if (abort) {
				return;
			}

			clearTimeout(resTimeout);

			try {
				resolve(Buffer.concat(accum, accumBytes));
			} catch (err) {
				// handle streams that have accumulated too much data (issue #414)
				reject(new FetchError(`Could not create Buffer from response body for ${_this4.url}: ${err.message}`, 'system', err));
			}
		});
	});
}

/**
 * Detect buffer encoding and convert to target encoding
 * ref: http://www.w3.org/TR/2011/WD-html5-20110113/parsing.html#determining-the-character-encoding
 *
 * @param   Buffer  buffer    Incoming buffer
 * @param   String  encoding  Target encoding
 * @return  String
 */
function convertBody(buffer, headers) {
	if (typeof convert !== 'function') {
		throw new Error('The package `encoding` must be installed to use the textConverted() function');
	}

	const ct = headers.get('content-type');
	let charset = 'utf-8';
	let res, str;

	// header
	if (ct) {
		res = /charset=([^;]*)/i.exec(ct);
	}

	// no charset in content type, peek at response body for at most 1024 bytes
	str = buffer.slice(0, 1024).toString();

	// html5
	if (!res && str) {
		res = /<meta.+?charset=(['"])(.+?)\1/i.exec(str);
	}

	// html4
	if (!res && str) {
		res = /<meta[\s]+?http-equiv=(['"])content-type\1[\s]+?content=(['"])(.+?)\2/i.exec(str);

		if (res) {
			res = /charset=(.*)/i.exec(res.pop());
		}
	}

	// xml
	if (!res && str) {
		res = /<\?xml.+?encoding=(['"])(.+?)\1/i.exec(str);
	}

	// found charset
	if (res) {
		charset = res.pop();

		// prevent decode issues when sites use incorrect encoding
		// ref: https://hsivonen.fi/encoding-menu/
		if (charset === 'gb2312' || charset === 'gbk') {
			charset = 'gb18030';
		}
	}

	// turn raw buffers into a single utf-8 buffer
	return convert(buffer, 'UTF-8', charset).toString();
}

/**
 * Detect a URLSearchParams object
 * ref: https://github.com/bitinn/node-fetch/issues/296#issuecomment-307598143
 *
 * @param   Object  obj     Object to detect by type or brand
 * @return  String
 */
function isURLSearchParams(obj) {
	// Duck-typing as a necessary condition.
	if (typeof obj !== 'object' || typeof obj.append !== 'function' || typeof obj.delete !== 'function' || typeof obj.get !== 'function' || typeof obj.getAll !== 'function' || typeof obj.has !== 'function' || typeof obj.set !== 'function') {
		return false;
	}

	// Brand-checking and more duck-typing as optional condition.
	return obj.constructor.name === 'URLSearchParams' || Object.prototype.toString.call(obj) === '[object URLSearchParams]' || typeof obj.sort === 'function';
}

/**
 * Check if `obj` is a W3C `Blob` object (which `File` inherits from)
 * @param  {*} obj
 * @return {boolean}
 */
function isBlob(obj) {
	return typeof obj === 'object' && typeof obj.arrayBuffer === 'function' && typeof obj.type === 'string' && typeof obj.stream === 'function' && typeof obj.constructor === 'function' && typeof obj.constructor.name === 'string' && /^(Blob|File)$/.test(obj.constructor.name) && /^(Blob|File)$/.test(obj[Symbol.toStringTag]);
}

/**
 * Clone body given Res/Req instance
 *
 * @param   Mixed  instance  Response or Request instance
 * @return  Mixed
 */
function clone(instance) {
	let p1, p2;
	let body = instance.body;

	// don't allow cloning a used body
	if (instance.bodyUsed) {
		throw new Error('cannot clone body after it is used');
	}

	// check that body is a stream and not form-data object
	// note: we can't clone the form-data object without having it as a dependency
	if (body instanceof Stream && typeof body.getBoundary !== 'function') {
		// tee instance body
		p1 = new PassThrough();
		p2 = new PassThrough();
		body.pipe(p1);
		body.pipe(p2);
		// set instance body to teed body and return the other teed body
		instance[INTERNALS].body = p1;
		body = p2;
	}

	return body;
}

/**
 * Performs the operation "extract a `Content-Type` value from |object|" as
 * specified in the specification:
 * https://fetch.spec.whatwg.org/#concept-bodyinit-extract
 *
 * This function assumes that instance.body is present.
 *
 * @param   Mixed  instance  Any options.body input
 */
function extractContentType(body) {
	if (body === null) {
		// body is null
		return null;
	} else if (typeof body === 'string') {
		// body is string
		return 'text/plain;charset=UTF-8';
	} else if (isURLSearchParams(body)) {
		// body is a URLSearchParams
		return 'application/x-www-form-urlencoded;charset=UTF-8';
	} else if (isBlob(body)) {
		// body is blob
		return body.type || null;
	} else if (Buffer.isBuffer(body)) {
		// body is buffer
		return null;
	} else if (Object.prototype.toString.call(body) === '[object ArrayBuffer]') {
		// body is ArrayBuffer
		return null;
	} else if (ArrayBuffer.isView(body)) {
		// body is ArrayBufferView
		return null;
	} else if (typeof body.getBoundary === 'function') {
		// detect form data input from form-data module
		return `multipart/form-data;boundary=${body.getBoundary()}`;
	} else if (body instanceof Stream) {
		// body is stream
		// can't really do much about this
		return null;
	} else {
		// Body constructor defaults other things to string
		return 'text/plain;charset=UTF-8';
	}
}

/**
 * The Fetch Standard treats this as if "total bytes" is a property on the body.
 * For us, we have to explicitly get it with a function.
 *
 * ref: https://fetch.spec.whatwg.org/#concept-body-total-bytes
 *
 * @param   Body    instance   Instance of Body
 * @return  Number?            Number of bytes, or null if not possible
 */
function getTotalBytes(instance) {
	const body = instance.body;


	if (body === null) {
		// body is null
		return 0;
	} else if (isBlob(body)) {
		return body.size;
	} else if (Buffer.isBuffer(body)) {
		// body is buffer
		return body.length;
	} else if (body && typeof body.getLengthSync === 'function') {
		// detect form data input from form-data module
		if (body._lengthRetrievers && body._lengthRetrievers.length == 0 || // 1.x
		body.hasKnownLength && body.hasKnownLength()) {
			// 2.x
			return body.getLengthSync();
		}
		return null;
	} else {
		// body is stream
		return null;
	}
}

/**
 * Write a Body to a Node.js WritableStream (e.g. http.Request) object.
 *
 * @param   Body    instance   Instance of Body
 * @return  Void
 */
function writeToStream(dest, instance) {
	const body = instance.body;


	if (body === null) {
		// body is null
		dest.end();
	} else if (isBlob(body)) {
		body.stream().pipe(dest);
	} else if (Buffer.isBuffer(body)) {
		// body is buffer
		dest.write(body);
		dest.end();
	} else {
		// body is stream
		body.pipe(dest);
	}
}

// expose Promise
Body.Promise = global.Promise;

/**
 * headers.js
 *
 * Headers class offers convenient helpers
 */

const invalidTokenRegex = /[^\^_`a-zA-Z\-0-9!#$%&'*+.|~]/;
const invalidHeaderCharRegex = /[^\t\x20-\x7e\x80-\xff]/;

function validateName(name) {
	name = `${name}`;
	if (invalidTokenRegex.test(name) || name === '') {
		throw new TypeError(`${name} is not a legal HTTP header name`);
	}
}

function validateValue(value) {
	value = `${value}`;
	if (invalidHeaderCharRegex.test(value)) {
		throw new TypeError(`${value} is not a legal HTTP header value`);
	}
}

/**
 * Find the key in the map object given a header name.
 *
 * Returns undefined if not found.
 *
 * @param   String  name  Header name
 * @return  String|Undefined
 */
function find(map, name) {
	name = name.toLowerCase();
	for (const key in map) {
		if (key.toLowerCase() === name) {
			return key;
		}
	}
	return undefined;
}

const MAP = Symbol('map');
class Headers {
	/**
  * Headers class
  *
  * @param   Object  headers  Response headers
  * @return  Void
  */
	constructor() {
		let init = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;

		this[MAP] = Object.create(null);

		if (init instanceof Headers) {
			const rawHeaders = init.raw();
			const headerNames = Object.keys(rawHeaders);

			for (const headerName of headerNames) {
				for (const value of rawHeaders[headerName]) {
					this.append(headerName, value);
				}
			}

			return;
		}

		// We don't worry about converting prop to ByteString here as append()
		// will handle it.
		if (init == null) ; else if (typeof init === 'object') {
			const method = init[Symbol.iterator];
			if (method != null) {
				if (typeof method !== 'function') {
					throw new TypeError('Header pairs must be iterable');
				}

				// sequence<sequence<ByteString>>
				// Note: per spec we have to first exhaust the lists then process them
				const pairs = [];
				for (const pair of init) {
					if (typeof pair !== 'object' || typeof pair[Symbol.iterator] !== 'function') {
						throw new TypeError('Each header pair must be iterable');
					}
					pairs.push(Array.from(pair));
				}

				for (const pair of pairs) {
					if (pair.length !== 2) {
						throw new TypeError('Each header pair must be a name/value tuple');
					}
					this.append(pair[0], pair[1]);
				}
			} else {
				// record<ByteString, ByteString>
				for (const key of Object.keys(init)) {
					const value = init[key];
					this.append(key, value);
				}
			}
		} else {
			throw new TypeError('Provided initializer must be an object');
		}
	}

	/**
  * Return combined header value given name
  *
  * @param   String  name  Header name
  * @return  Mixed
  */
	get(name) {
		name = `${name}`;
		validateName(name);
		const key = find(this[MAP], name);
		if (key === undefined) {
			return null;
		}

		return this[MAP][key].join(', ');
	}

	/**
  * Iterate over all headers
  *
  * @param   Function  callback  Executed for each item with parameters (value, name, thisArg)
  * @param   Boolean   thisArg   `this` context for callback function
  * @return  Void
  */
	forEach(callback) {
		let thisArg = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;

		let pairs = getHeaders(this);
		let i = 0;
		while (i < pairs.length) {
			var _pairs$i = pairs[i];
			const name = _pairs$i[0],
			      value = _pairs$i[1];

			callback.call(thisArg, value, name, this);
			pairs = getHeaders(this);
			i++;
		}
	}

	/**
  * Overwrite header values given name
  *
  * @param   String  name   Header name
  * @param   String  value  Header value
  * @return  Void
  */
	set(name, value) {
		name = `${name}`;
		value = `${value}`;
		validateName(name);
		validateValue(value);
		const key = find(this[MAP], name);
		this[MAP][key !== undefined ? key : name] = [value];
	}

	/**
  * Append a value onto existing header
  *
  * @param   String  name   Header name
  * @param   String  value  Header value
  * @return  Void
  */
	append(name, value) {
		name = `${name}`;
		value = `${value}`;
		validateName(name);
		validateValue(value);
		const key = find(this[MAP], name);
		if (key !== undefined) {
			this[MAP][key].push(value);
		} else {
			this[MAP][name] = [value];
		}
	}

	/**
  * Check for header name existence
  *
  * @param   String   name  Header name
  * @return  Boolean
  */
	has(name) {
		name = `${name}`;
		validateName(name);
		return find(this[MAP], name) !== undefined;
	}

	/**
  * Delete all header values given name
  *
  * @param   String  name  Header name
  * @return  Void
  */
	delete(name) {
		name = `${name}`;
		validateName(name);
		const key = find(this[MAP], name);
		if (key !== undefined) {
			delete this[MAP][key];
		}
	}

	/**
  * Return raw headers (non-spec api)
  *
  * @return  Object
  */
	raw() {
		return this[MAP];
	}

	/**
  * Get an iterator on keys.
  *
  * @return  Iterator
  */
	keys() {
		return createHeadersIterator(this, 'key');
	}

	/**
  * Get an iterator on values.
  *
  * @return  Iterator
  */
	values() {
		return createHeadersIterator(this, 'value');
	}

	/**
  * Get an iterator on entries.
  *
  * This is the default iterator of the Headers object.
  *
  * @return  Iterator
  */
	[Symbol.iterator]() {
		return createHeadersIterator(this, 'key+value');
	}
}
Headers.prototype.entries = Headers.prototype[Symbol.iterator];

Object.defineProperty(Headers.prototype, Symbol.toStringTag, {
	value: 'Headers',
	writable: false,
	enumerable: false,
	configurable: true
});

Object.defineProperties(Headers.prototype, {
	get: { enumerable: true },
	forEach: { enumerable: true },
	set: { enumerable: true },
	append: { enumerable: true },
	has: { enumerable: true },
	delete: { enumerable: true },
	keys: { enumerable: true },
	values: { enumerable: true },
	entries: { enumerable: true }
});

function getHeaders(headers) {
	let kind = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'key+value';

	const keys = Object.keys(headers[MAP]).sort();
	return keys.map(kind === 'key' ? function (k) {
		return k.toLowerCase();
	} : kind === 'value' ? function (k) {
		return headers[MAP][k].join(', ');
	} : function (k) {
		return [k.toLowerCase(), headers[MAP][k].join(', ')];
	});
}

const INTERNAL = Symbol('internal');

function createHeadersIterator(target, kind) {
	const iterator = Object.create(HeadersIteratorPrototype);
	iterator[INTERNAL] = {
		target,
		kind,
		index: 0
	};
	return iterator;
}

const HeadersIteratorPrototype = Object.setPrototypeOf({
	next() {
		// istanbul ignore if
		if (!this || Object.getPrototypeOf(this) !== HeadersIteratorPrototype) {
			throw new TypeError('Value of `this` is not a HeadersIterator');
		}

		var _INTERNAL = this[INTERNAL];
		const target = _INTERNAL.target,
		      kind = _INTERNAL.kind,
		      index = _INTERNAL.index;

		const values = getHeaders(target, kind);
		const len = values.length;
		if (index >= len) {
			return {
				value: undefined,
				done: true
			};
		}

		this[INTERNAL].index = index + 1;

		return {
			value: values[index],
			done: false
		};
	}
}, Object.getPrototypeOf(Object.getPrototypeOf([][Symbol.iterator]())));

Object.defineProperty(HeadersIteratorPrototype, Symbol.toStringTag, {
	value: 'HeadersIterator',
	writable: false,
	enumerable: false,
	configurable: true
});

/**
 * Export the Headers object in a form that Node.js can consume.
 *
 * @param   Headers  headers
 * @return  Object
 */
function exportNodeCompatibleHeaders(headers) {
	const obj = Object.assign({ __proto__: null }, headers[MAP]);

	// http.request() only supports string as Host header. This hack makes
	// specifying custom Host header possible.
	const hostHeaderKey = find(headers[MAP], 'Host');
	if (hostHeaderKey !== undefined) {
		obj[hostHeaderKey] = obj[hostHeaderKey][0];
	}

	return obj;
}

/**
 * Create a Headers object from an object of headers, ignoring those that do
 * not conform to HTTP grammar productions.
 *
 * @param   Object  obj  Object of headers
 * @return  Headers
 */
function createHeadersLenient(obj) {
	const headers = new Headers();
	for (const name of Object.keys(obj)) {
		if (invalidTokenRegex.test(name)) {
			continue;
		}
		if (Array.isArray(obj[name])) {
			for (const val of obj[name]) {
				if (invalidHeaderCharRegex.test(val)) {
					continue;
				}
				if (headers[MAP][name] === undefined) {
					headers[MAP][name] = [val];
				} else {
					headers[MAP][name].push(val);
				}
			}
		} else if (!invalidHeaderCharRegex.test(obj[name])) {
			headers[MAP][name] = [obj[name]];
		}
	}
	return headers;
}

const INTERNALS$1 = Symbol('Response internals');

// fix an issue where "STATUS_CODES" aren't a named export for node <10
const STATUS_CODES = http.STATUS_CODES;

/**
 * Response class
 *
 * @param   Stream  body  Readable stream
 * @param   Object  opts  Response options
 * @return  Void
 */
class Response {
	constructor() {
		let body = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
		let opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

		Body.call(this, body, opts);

		const status = opts.status || 200;
		const headers = new Headers(opts.headers);

		if (body != null && !headers.has('Content-Type')) {
			const contentType = extractContentType(body);
			if (contentType) {
				headers.append('Content-Type', contentType);
			}
		}

		this[INTERNALS$1] = {
			url: opts.url,
			status,
			statusText: opts.statusText || STATUS_CODES[status],
			headers,
			counter: opts.counter
		};
	}

	get url() {
		return this[INTERNALS$1].url || '';
	}

	get status() {
		return this[INTERNALS$1].status;
	}

	/**
  * Convenience property representing if the request ended normally
  */
	get ok() {
		return this[INTERNALS$1].status >= 200 && this[INTERNALS$1].status < 300;
	}

	get redirected() {
		return this[INTERNALS$1].counter > 0;
	}

	get statusText() {
		return this[INTERNALS$1].statusText;
	}

	get headers() {
		return this[INTERNALS$1].headers;
	}

	/**
  * Clone this response
  *
  * @return  Response
  */
	clone() {
		return new Response(clone(this), {
			url: this.url,
			status: this.status,
			statusText: this.statusText,
			headers: this.headers,
			ok: this.ok,
			redirected: this.redirected
		});
	}
}

Body.mixIn(Response.prototype);

Object.defineProperties(Response.prototype, {
	url: { enumerable: true },
	status: { enumerable: true },
	ok: { enumerable: true },
	redirected: { enumerable: true },
	statusText: { enumerable: true },
	headers: { enumerable: true },
	clone: { enumerable: true }
});

Object.defineProperty(Response.prototype, Symbol.toStringTag, {
	value: 'Response',
	writable: false,
	enumerable: false,
	configurable: true
});

const INTERNALS$2 = Symbol('Request internals');

// fix an issue where "format", "parse" aren't a named export for node <10
const parse_url = Url.parse;
const format_url = Url.format;

const streamDestructionSupported = 'destroy' in Stream.Readable.prototype;

/**
 * Check if a value is an instance of Request.
 *
 * @param   Mixed   input
 * @return  Boolean
 */
function isRequest(input) {
	return typeof input === 'object' && typeof input[INTERNALS$2] === 'object';
}

function isAbortSignal(signal) {
	const proto = signal && typeof signal === 'object' && Object.getPrototypeOf(signal);
	return !!(proto && proto.constructor.name === 'AbortSignal');
}

/**
 * Request class
 *
 * @param   Mixed   input  Url or Request instance
 * @param   Object  init   Custom options
 * @return  Void
 */
class Request {
	constructor(input) {
		let init = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

		let parsedURL;

		// normalize input
		if (!isRequest(input)) {
			if (input && input.href) {
				// in order to support Node.js' Url objects; though WHATWG's URL objects
				// will fall into this branch also (since their `toString()` will return
				// `href` property anyway)
				parsedURL = parse_url(input.href);
			} else {
				// coerce input to a string before attempting to parse
				parsedURL = parse_url(`${input}`);
			}
			input = {};
		} else {
			parsedURL = parse_url(input.url);
		}

		let method = init.method || input.method || 'GET';
		method = method.toUpperCase();

		if ((init.body != null || isRequest(input) && input.body !== null) && (method === 'GET' || method === 'HEAD')) {
			throw new TypeError('Request with GET/HEAD method cannot have body');
		}

		let inputBody = init.body != null ? init.body : isRequest(input) && input.body !== null ? clone(input) : null;

		Body.call(this, inputBody, {
			timeout: init.timeout || input.timeout || 0,
			size: init.size || input.size || 0
		});

		const headers = new Headers(init.headers || input.headers || {});

		if (inputBody != null && !headers.has('Content-Type')) {
			const contentType = extractContentType(inputBody);
			if (contentType) {
				headers.append('Content-Type', contentType);
			}
		}

		let signal = isRequest(input) ? input.signal : null;
		if ('signal' in init) signal = init.signal;

		if (signal != null && !isAbortSignal(signal)) {
			throw new TypeError('Expected signal to be an instanceof AbortSignal');
		}

		this[INTERNALS$2] = {
			method,
			redirect: init.redirect || input.redirect || 'follow',
			headers,
			parsedURL,
			signal
		};

		// node-fetch-only options
		this.follow = init.follow !== undefined ? init.follow : input.follow !== undefined ? input.follow : 20;
		this.compress = init.compress !== undefined ? init.compress : input.compress !== undefined ? input.compress : true;
		this.counter = init.counter || input.counter || 0;
		this.agent = init.agent || input.agent;
	}

	get method() {
		return this[INTERNALS$2].method;
	}

	get url() {
		return format_url(this[INTERNALS$2].parsedURL);
	}

	get headers() {
		return this[INTERNALS$2].headers;
	}

	get redirect() {
		return this[INTERNALS$2].redirect;
	}

	get signal() {
		return this[INTERNALS$2].signal;
	}

	/**
  * Clone this request
  *
  * @return  Request
  */
	clone() {
		return new Request(this);
	}
}

Body.mixIn(Request.prototype);

Object.defineProperty(Request.prototype, Symbol.toStringTag, {
	value: 'Request',
	writable: false,
	enumerable: false,
	configurable: true
});

Object.defineProperties(Request.prototype, {
	method: { enumerable: true },
	url: { enumerable: true },
	headers: { enumerable: true },
	redirect: { enumerable: true },
	clone: { enumerable: true },
	signal: { enumerable: true }
});

/**
 * Convert a Request to Node.js http request options.
 *
 * @param   Request  A Request instance
 * @return  Object   The options object to be passed to http.request
 */
function getNodeRequestOptions(request) {
	const parsedURL = request[INTERNALS$2].parsedURL;
	const headers = new Headers(request[INTERNALS$2].headers);

	// fetch step 1.3
	if (!headers.has('Accept')) {
		headers.set('Accept', '*/*');
	}

	// Basic fetch
	if (!parsedURL.protocol || !parsedURL.hostname) {
		throw new TypeError('Only absolute URLs are supported');
	}

	if (!/^https?:$/.test(parsedURL.protocol)) {
		throw new TypeError('Only HTTP(S) protocols are supported');
	}

	if (request.signal && request.body instanceof Stream.Readable && !streamDestructionSupported) {
		throw new Error('Cancellation of streamed requests with AbortSignal is not supported in node < 8');
	}

	// HTTP-network-or-cache fetch steps 2.4-2.7
	let contentLengthValue = null;
	if (request.body == null && /^(POST|PUT)$/i.test(request.method)) {
		contentLengthValue = '0';
	}
	if (request.body != null) {
		const totalBytes = getTotalBytes(request);
		if (typeof totalBytes === 'number') {
			contentLengthValue = String(totalBytes);
		}
	}
	if (contentLengthValue) {
		headers.set('Content-Length', contentLengthValue);
	}

	// HTTP-network-or-cache fetch step 2.11
	if (!headers.has('User-Agent')) {
		headers.set('User-Agent', 'node-fetch/1.0 (+https://github.com/bitinn/node-fetch)');
	}

	// HTTP-network-or-cache fetch step 2.15
	if (request.compress && !headers.has('Accept-Encoding')) {
		headers.set('Accept-Encoding', 'gzip,deflate');
	}

	let agent = request.agent;
	if (typeof agent === 'function') {
		agent = agent(parsedURL);
	}

	if (!headers.has('Connection') && !agent) {
		headers.set('Connection', 'close');
	}

	// HTTP-network fetch step 4.2
	// chunked encoding is handled by Node.js

	return Object.assign({}, parsedURL, {
		method: request.method,
		headers: exportNodeCompatibleHeaders(headers),
		agent
	});
}

/**
 * abort-error.js
 *
 * AbortError interface for cancelled requests
 */

/**
 * Create AbortError instance
 *
 * @param   String      message      Error message for human
 * @return  AbortError
 */
function AbortError(message) {
  Error.call(this, message);

  this.type = 'aborted';
  this.message = message;

  // hide custom error implementation details from end-users
  Error.captureStackTrace(this, this.constructor);
}

AbortError.prototype = Object.create(Error.prototype);
AbortError.prototype.constructor = AbortError;
AbortError.prototype.name = 'AbortError';

// fix an issue where "PassThrough", "resolve" aren't a named export for node <10
const PassThrough$1 = Stream.PassThrough;
const resolve_url = Url.resolve;

/**
 * Fetch function
 *
 * @param   Mixed    url   Absolute url or Request instance
 * @param   Object   opts  Fetch options
 * @return  Promise
 */
function fetch(url, opts) {

	// allow custom promise
	if (!fetch.Promise) {
		throw new Error('native promise missing, set fetch.Promise to your favorite alternative');
	}

	Body.Promise = fetch.Promise;

	// wrap http.request into fetch
	return new fetch.Promise(function (resolve, reject) {
		// build request object
		const request = new Request(url, opts);
		const options = getNodeRequestOptions(request);

		const send = (options.protocol === 'https:' ? https : http).request;
		const signal = request.signal;

		let response = null;

		const abort = function abort() {
			let error = new AbortError('The user aborted a request.');
			reject(error);
			if (request.body && request.body instanceof Stream.Readable) {
				request.body.destroy(error);
			}
			if (!response || !response.body) return;
			response.body.emit('error', error);
		};

		if (signal && signal.aborted) {
			abort();
			return;
		}

		const abortAndFinalize = function abortAndFinalize() {
			abort();
			finalize();
		};

		// send request
		const req = send(options);
		let reqTimeout;

		if (signal) {
			signal.addEventListener('abort', abortAndFinalize);
		}

		function finalize() {
			req.abort();
			if (signal) signal.removeEventListener('abort', abortAndFinalize);
			clearTimeout(reqTimeout);
		}

		if (request.timeout) {
			req.once('socket', function (socket) {
				reqTimeout = setTimeout(function () {
					reject(new FetchError(`network timeout at: ${request.url}`, 'request-timeout'));
					finalize();
				}, request.timeout);
			});
		}

		req.on('error', function (err) {
			reject(new FetchError(`request to ${request.url} failed, reason: ${err.message}`, 'system', err));
			finalize();
		});

		req.on('response', function (res) {
			clearTimeout(reqTimeout);

			const headers = createHeadersLenient(res.headers);

			// HTTP fetch step 5
			if (fetch.isRedirect(res.statusCode)) {
				// HTTP fetch step 5.2
				const location = headers.get('Location');

				// HTTP fetch step 5.3
				const locationURL = location === null ? null : resolve_url(request.url, location);

				// HTTP fetch step 5.5
				switch (request.redirect) {
					case 'error':
						reject(new FetchError(`redirect mode is set to error: ${request.url}`, 'no-redirect'));
						finalize();
						return;
					case 'manual':
						// node-fetch-specific step: make manual redirect a bit easier to use by setting the Location header value to the resolved URL.
						if (locationURL !== null) {
							// handle corrupted header
							try {
								headers.set('Location', locationURL);
							} catch (err) {
								// istanbul ignore next: nodejs server prevent invalid response headers, we can't test this through normal request
								reject(err);
							}
						}
						break;
					case 'follow':
						// HTTP-redirect fetch step 2
						if (locationURL === null) {
							break;
						}

						// HTTP-redirect fetch step 5
						if (request.counter >= request.follow) {
							reject(new FetchError(`maximum redirect reached at: ${request.url}`, 'max-redirect'));
							finalize();
							return;
						}

						// HTTP-redirect fetch step 6 (counter increment)
						// Create a new Request object.
						const requestOpts = {
							headers: new Headers(request.headers),
							follow: request.follow,
							counter: request.counter + 1,
							agent: request.agent,
							compress: request.compress,
							method: request.method,
							body: request.body,
							signal: request.signal,
							timeout: request.timeout
						};

						// HTTP-redirect fetch step 9
						if (res.statusCode !== 303 && request.body && getTotalBytes(request) === null) {
							reject(new FetchError('Cannot follow redirect with body being a readable stream', 'unsupported-redirect'));
							finalize();
							return;
						}

						// HTTP-redirect fetch step 11
						if (res.statusCode === 303 || (res.statusCode === 301 || res.statusCode === 302) && request.method === 'POST') {
							requestOpts.method = 'GET';
							requestOpts.body = undefined;
							requestOpts.headers.delete('content-length');
						}

						// HTTP-redirect fetch step 15
						resolve(fetch(new Request(locationURL, requestOpts)));
						finalize();
						return;
				}
			}

			// prepare response
			res.once('end', function () {
				if (signal) signal.removeEventListener('abort', abortAndFinalize);
			});
			let body = res.pipe(new PassThrough$1());

			const response_options = {
				url: request.url,
				status: res.statusCode,
				statusText: res.statusMessage,
				headers: headers,
				size: request.size,
				timeout: request.timeout,
				counter: request.counter
			};

			// HTTP-network fetch step 12.1.1.3
			const codings = headers.get('Content-Encoding');

			// HTTP-network fetch step 12.1.1.4: handle content codings

			// in following scenarios we ignore compression support
			// 1. compression support is disabled
			// 2. HEAD request
			// 3. no Content-Encoding header
			// 4. no content response (204)
			// 5. content not modified response (304)
			if (!request.compress || request.method === 'HEAD' || codings === null || res.statusCode === 204 || res.statusCode === 304) {
				response = new Response(body, response_options);
				resolve(response);
				return;
			}

			// For Node v6+
			// Be less strict when decoding compressed responses, since sometimes
			// servers send slightly invalid responses that are still accepted
			// by common browsers.
			// Always using Z_SYNC_FLUSH is what cURL does.
			const zlibOptions = {
				flush: zlib.Z_SYNC_FLUSH,
				finishFlush: zlib.Z_SYNC_FLUSH
			};

			// for gzip
			if (codings == 'gzip' || codings == 'x-gzip') {
				body = body.pipe(zlib.createGunzip(zlibOptions));
				response = new Response(body, response_options);
				resolve(response);
				return;
			}

			// for deflate
			if (codings == 'deflate' || codings == 'x-deflate') {
				// handle the infamous raw deflate response from old servers
				// a hack for old IIS and Apache servers
				const raw = res.pipe(new PassThrough$1());
				raw.once('data', function (chunk) {
					// see http://stackoverflow.com/questions/37519828
					if ((chunk[0] & 0x0F) === 0x08) {
						body = body.pipe(zlib.createInflate());
					} else {
						body = body.pipe(zlib.createInflateRaw());
					}
					response = new Response(body, response_options);
					resolve(response);
				});
				return;
			}

			// for br
			if (codings == 'br' && typeof zlib.createBrotliDecompress === 'function') {
				body = body.pipe(zlib.createBrotliDecompress());
				response = new Response(body, response_options);
				resolve(response);
				return;
			}

			// otherwise, use response as-is
			response = new Response(body, response_options);
			resolve(response);
		});

		writeToStream(req, request);
	});
}
/**
 * Redirect code matching
 *
 * @param   Number   code  Status code
 * @return  Boolean
 */
fetch.isRedirect = function (code) {
	return code === 301 || code === 302 || code === 303 || code === 307 || code === 308;
};

// expose Promise
fetch.Promise = global.Promise;

var lib = /*#__PURE__*/Object.freeze({
	__proto__: null,
	'default': fetch,
	Headers: Headers,
	Request: Request,
	Response: Response,
	FetchError: FetchError
});

const {promisify} = util$2;



const execFile = promisify(child_process.execFile);

// Binary source → https://github.com/sindresorhus/macos-wallpaper
const binary = path.join(__dirname, 'macos-wallpaper');

var get = async ({screen = 'main'} = {}) => {
	let {stdout} = await execFile(binary, ['get', '--screen', screen]);
	stdout = stdout.trim();

	if (screen === 'all') {
		return stdout.split('\n');
	}

	return stdout;
};

var set = async (imagePath, {screen = 'all', scale = 'auto'} = {}) => {
	if (typeof imagePath !== 'string') {
		throw new TypeError('Expected a string');
	}

	const arguments_ = [
		'set',
		path.resolve(imagePath),
		'--screen',
		screen,
		'--scale',
		scale
	];

	await execFile(binary, arguments_);
};

var screens = async () => {
	const {stdout} = await execFile(binary, ['screens']);
	return stdout.trim().split('\n').map(line => line.replace(/^\d+ - /, ''));
};

var macos = {
	get: get,
	set: set,
	screens: screens
};

const {promisify: promisify$1} = util$2;



const execFile$1 = promisify$1(child_process.execFile);

// Binary source → https://github.com/sindresorhus/win-wallpaper
const binary$1 = path.join(__dirname, 'win-wallpaper.exe');

var get$1 = async () => {
	const {stdout} = await execFile$1(binary$1);
	return stdout.trim();
};

var set$1 = async imagePath => {
	if (typeof imagePath !== 'string') {
		throw new TypeError('Expected a string');
	}

	await execFile$1(binary$1, [path.resolve(imagePath)]);
};

var win = {
	get: get$1,
	set: set$1
};

function unwrapExports (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

function getCjsExportFromNamespace (n) {
	return n && n['default'] || n;
}

const {promisify: promisify$2} = util$2;



const execFile$2 = promisify$2(child_process.execFile);

var commandExists = async cmd => {
	// `which` all commands and expect stdout to return a positive
	try {
		let {stdout} = await execFile$2('which', ['-a', cmd]);
		stdout = stdout.trim();

		if (!stdout) {
			return false;
		}

		return true;
	} catch (_) {
		return false;
	}
};

var hasLine = (string, lineToFind) => string.split('\n').find(line => line.trim() === lineToFind);

var execFile_1 = execFile$2;
var exec = promisify$2(child_process.exec);
var readFile = promisify$2(fs.readFile);

var util = {
	commandExists: commandExists,
	hasLine: hasLine,
	execFile: execFile_1,
	exec: exec,
	readFile: readFile
};

const {commandExists: commandExists$1, execFile: execFile$3, hasLine: hasLine$1} = util;

var isAvailable = async () => {
	if (!await commandExists$1('gsettings')) {
		return false;
	}

	try {
		const {stdout} = await execFile$3('gsettings', ['list-schemas']);
		return hasLine$1(stdout, 'org.cinnamon.desktop.background');
	} catch (_) {
		return false;
	}
};

var set$2 = async imagePath => {
	await execFile$3('gsettings', [
		'set',
		'org.cinnamon.desktop.background',
		'picture-uri',
		`file://${imagePath}`
	]);
};

var get$2 = async () => {
	const {stdout} = await execFile$3('gsettings', [
		'get',
		'org.cinnamon.desktop.background',
		'picture-uri'
	]);

	return stdout.trim().slice(8, -1);
};

var cinnamon = {
	isAvailable: isAvailable,
	set: set$2,
	get: get$2
};

const {commandExists: commandExists$2, execFile: execFile$4} = util;

var isAvailable$1 = () => commandExists$2('dconf');

var set$3 = async imagePath => {
	await execFile$4('dconf', [
		'write',
		'/org/mate/desktop/background/picture-filename',
		`"${imagePath}"`
	]);
};

var get$3 = async () => {
	const {stdout} = await execFile$4('dconf', [
		'read',
		'/org/mate/desktop/background/picture-filename'
	]);

	return stdout.trim().slice(1, -1);
};

var dconf = {
	isAvailable: isAvailable$1,
	set: set$3,
	get: get$3
};

const {commandExists: commandExists$3, execFile: execFile$5} = util;

var isAvailable$2 = () => commandExists$3('dcop');

var set$4 = async imagePath => {
	await execFile$5('dcop', [
		'kdesktop',
		'KBackgroundIface',
		'setWallpaper',
		`${imagePath} 1`
	]);
};

var dcop = {
	isAvailable: isAvailable$2,
	set: set$4
};

const {commandExists: commandExists$4, execFile: execFile$6} = util;

var isAvailable$3 = () => commandExists$4('feh');

var set$5 = async imagePath => {
	await execFile$6('feh', ['--bg-fill', imagePath]);
};

var feh = {
	isAvailable: isAvailable$3,
	set: set$5
};

const {commandExists: commandExists$5, execFile: execFile$7} = util;

var isAvailable$4 = () => commandExists$5('gconftool-2');

var set$6 = async imagePath => {
	await execFile$7('gconftool-2', [
		'--set',
		'/desktop/gnome/background/picture_filename',
		'--type',
		'string',
		imagePath
	]);
};

var gconftool2 = {
	isAvailable: isAvailable$4,
	set: set$6
};

const {commandExists: commandExists$6, execFile: execFile$8} = util;

var isAvailable$5 = () => commandExists$6('gsettings');

var set$7 = async imagePath => {
	await execFile$8('gsettings', [
		'set',
		'org.gnome.desktop.background',
		'picture-uri',
		`file://${imagePath}`
	]);
};

var get$4 = async () => {
	const {stdout} = await execFile$8('gsettings', [
		'get',
		'org.gnome.desktop.background',
		'picture-uri'
	]);

	return stdout.trim().slice(8, -1);
};

var gnome = {
	isAvailable: isAvailable$5,
	set: set$7,
	get: get$4
};

const {commandExists: commandExists$7, execFile: execFile$9, hasLine: hasLine$2} = util;

var isAvailable$6 = async () => {
	if (!await commandExists$7('gsettings')) {
		return false;
	}

	try {
		const {stdout} = await execFile$9('gsettings', ['list-schemas']);
		return hasLine$2(stdout, 'org.mate.background');
	} catch (_) {
		return false;
	}
};

var set$8 = async imagePath => {
	await execFile$9('gsettings', [
		'set',
		'org.mate.background',
		'picture-filename',
		imagePath
	]);
};

var get$5 = async () => {
	const {stdout} = await execFile$9('gsettings', [
		'get',
		'org.mate.background',
		'picture-filename'
	]);

	return stdout.trim().slice(1, -1);
};

var mate = {
	isAvailable: isAvailable$6,
	set: set$8,
	get: get$5
};

const {commandExists: commandExists$8, execFile: execFile$a, readFile: readFile$1} = util;

const homeDir = os.homedir();

var isAvailable$7 = () => commandExists$8('nitrogen');

var set$9 = async imagePath => {
	await execFile$a('nitrogen', [
		'--set-zoom-fill',
		'--save',
		imagePath
	]);
};

var get$6 = async () => {
	const configFile = path.join(homeDir, '.config/nitrogen/bg-saved.cfg');
	const config = await readFile$1(configFile, 'utf8');

	return config.trim().split('\n').find(line => line.startsWith('file=')).replace('file=', '');
};

var nitrogen = {
	isAvailable: isAvailable$7,
	set: set$9,
	get: get$6
};

const {commandExists: commandExists$9, execFile: execFile$b} = util;

var isAvailable$8 = () => commandExists$9('pcmanfm');

var set$a = async imagePath => {
	await execFile$b('pcmanfm', ['--set-wallpaper', imagePath]);
};

var pcmanfm = {
	isAvailable: isAvailable$8,
	set: set$a
};

const {commandExists: commandExists$a, execFile: execFile$c} = util;

var isAvailable$9 = () => commandExists$a('setroot');

var set$b = async imagePath => {
	await execFile$c('setroot', [imagePath]);
};

var setroot = {
	isAvailable: isAvailable$9,
	set: set$b
};

const {commandExists: commandExists$b, execFile: execFile$d} = util;

var isAvailable$a = () => commandExists$b('xfconf-query');

var set$c = async imagePath => {
	await execFile$d('xfconf-query', [
		'--channel',
		'xfce4-desktop',
		'--property',
		'/backdrop/screen0/monitor0/image-path',
		'--set',
		`${imagePath}`
	]);
};

var xfconfQuery = {
	isAvailable: isAvailable$a,
	set: set$c
};

var backgroundManagers = {
	cinnamon: cinnamon,
	dconf: dconf,
	dcop: dcop,
	feh: feh,
	gconftool2: gconftool2,
	gnome: gnome,
	mate: mate,
	nitrogen: nitrogen,
	pcmanfm: pcmanfm,
	setroot: setroot,
	xfconfquery: xfconfQuery
};

var linux = createCommonjsModule(function (module, exports) {



let availableApps;

async function setAvailableApps() {
	availableApps = [];

	const promises = Object.values(backgroundManagers).map(async manager => {
		if (await manager.isAvailable()) {
			availableApps.push(manager);
		}
	});

	await Promise.all(promises);
}

exports.get = async () => {
	if (!availableApps) {
		await setAvailableApps();
		return exports.get();
	}

	const wallpapersVoted = new Map();
	const promises = availableApps.map(async app => {
		if (typeof app.get !== 'function') {
			return;
		}

		const imagePath = await app.get();

		if (typeof imagePath !== 'undefined') {
			if (!wallpapersVoted.get(imagePath)) {
				wallpapersVoted.set(imagePath, 0);
			}

			wallpapersVoted.set(imagePath, wallpapersVoted.get(imagePath) + 1);
		}
	});

	await Promise.all(promises.map(promise => promise.catch(() => {})));

	let wallpaperMostVoted;
	let wallpaperMostVotedCount;

	for (const [wallpaper] of wallpapersVoted) {
		if (!wallpaperMostVoted || wallpaperMostVoted[wallpaper] > wallpaperMostVotedCount) {
			wallpaperMostVoted = wallpaper;
			wallpaperMostVotedCount = wallpaperMostVoted[wallpaper];
		}
	}

	return wallpaperMostVoted;
};

exports.set = async imagePath => {
	if (typeof imagePath !== 'string') {
		throw new TypeError('Expected a string');
	}

	if (!availableApps) {
		await setAvailableApps();
		await exports.set(imagePath);
		return;
	}

	const promises = availableApps.map(async app => {
		if (typeof app.set === 'function') {
			await app.set(path.resolve(imagePath));
		}
	});

	await Promise.all(promises.map(promise => promise.catch(() => {})));
};
});
var linux_1 = linux.get;
var linux_2 = linux.set;

let wallpaper;
if (process.platform === 'darwin') {
	wallpaper = macos;
} else if (process.platform === 'win32') {
	wallpaper = win;
} else {
	wallpaper = linux;
}

var wallpaper_1 = wallpaper;
// TODO: remove this in the next major version
var default_1 = wallpaper;
wallpaper_1.default = default_1;

var pathFile = path.join(__dirname, 'path.txt');

function getElectronPath () {
  if (fs.existsSync(pathFile)) {
    var executablePath = fs.readFileSync(pathFile, 'utf-8');
    if (process.env.ELECTRON_OVERRIDE_DIST_PATH) {
      return path.join(process.env.ELECTRON_OVERRIDE_DIST_PATH, executablePath)
    }
    return path.join(__dirname, 'dist', executablePath)
  } else {
    throw new Error('Electron failed to install correctly, please delete node_modules/electron and try installing again')
  }
}

var electron = getElectronPath();

const { Tray, Menu, app } = electron;

let tray;

const constructTray = ({ events, artObject }) => {
  tray = new Tray('./dist/icon-dark_32x32.png');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: artObject.title
    }, {
      label: 'Next Artwork',
      type: 'normal',
      click: events.setArtwork
    }, {
      type: 'separator'
    }, {
      label: 'Active Features',
      enabled: false
    }, {
      label: 'Background',
      type: 'checkbox',
      click: events.onToggleBackground
    }, {
      label: 'Screen Saver',
      type: 'checkbox',
      click: events.onToggleScreenSaver
    }, {
      type: 'separator'
    }, {
      label: 'Run On Startup',
      type: 'checkbox',
      checked: app.getLoginItemSettings().openAtLogin,
      click: events.onToggleStartup
    }, {
      type: 'separator'
    }, {
      label: 'Quit',
      role: 'quit',
      type: 'normal',
      click: events.onQuit
    }
  ]);

  tray.setContextMenu(contextMenu);

  const setInfo = (str) => {
    contextMenu[0].label = str;
  };

  return {
    setInfo
  }
};

var tray_1 = { constructTray };
var tray_2 = tray_1.constructTray;

var tray$1 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	'default': tray_1,
	__moduleExports: tray_1,
	constructTray: tray_2
});

const { BrowserWindow, ipcMain } = electron;

const constructBackground = (screen) => {
  let readyResolver;

  const readyPromise = new Promise((resolve) => { readyResolver = resolve; });
  const windows = [];

  ipcMain.once('backgroundReady', (ev, arg) => {
    readyResolver(arg);
  });

  for (const display of screen.getAllDisplays()) {
    // Create the browser window.
    const win = new BrowserWindow({
      type: 'desktop',
      width: display.size.width,
      height: display.size.height + 20,
      x: display.bounds.x,
      y: display.bounds.y - 10,
      enableLargerThanScreen: true,
      center: true,
      show: false,
      frame: false,
      transparent: true,
      webPreferences: {
        preload: path.resolve('./dist/preload.js')
      }
    });

    win.loadFile('index.html');

    win.once('closed', () => {
      windows.splice(windows.indexOf(win), 1);
    });

    win.openDevTools({ mode: 'detach' });

    windows.push(win);
  }

  const ready = () => {
    return readyPromise
  };

  const next = () => {
    return new Promise((resolve) => {
      windows[0].webContents.send('replaceArtObject');

      ipcMain.once('artworkReplaced', (ev, arg) => {
        resolve(arg);
      });
    })
  };

  const getArtObject = async () => {
    return new Promise((resolve) => {
      windows[0].webContents.send('getArtObject');

      ipcMain.once('sendArtObject', (ev, arg) => {
        resolve(arg);
      });
    })
  };

  return {
    ready,
    next,
    getArtObject
  }
};

var background = { constructBackground };
var background_1 = background.constructBackground;

var background$1 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	'default': background,
	__moduleExports: background,
	constructBackground: background_1
});

const timeout = (time) => {
  return new Promise((resolve, reject) => {
    setTimeout(reject, time);
  })
};

const fetch$1 = async (...args) => {
  const response = await Promise.race([
    timeout(20000),
    globalThis.fetch(...args)
  ]);

  if (response.ok) {
    return response
  } else {
    throw new Error(`request responded with status code ${response.status}`)
  }
};

const fetchJSON = async (...args) => {
  try {
    const response = await fetch$1(...args);
    const json = await response.json();
    return [undefined, json]
  } catch (err) {
    return [err]
  }
};

const fetchBlob = async (...args) => {
  try {
    const response = await fetch$1(...args);
    const blob = await response.blob();
    return [undefined, blob]
  } catch (err) {
    return [err]
  }
};

const fetchBuffer = async (...args) => {
  const response = await fetch$1(...args);
  const buffer = await response.buffer();
  return buffer
};

var fetch$2 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	fetch: fetch$1,
	fetchJSON: fetchJSON,
	fetchBlob: fetchBlob,
	fetchBuffer: fetchBuffer
});

var FsPromise = createCommonjsModule(function (module, exports) {
/**
 * Module convert fs functions to promise based functions
 */
Object.defineProperty(exports, "__esModule", { value: true });

exports.pathExists = fs.existsSync;
exports.createReadStream = fs.createReadStream;
async function stat(path) {
    return new Promise((resolve, reject) => {
        fs.stat(path, (err, stats) => {
            if (err)
                reject(err);
            else
                resolve(stats);
        });
    });
}
exports.stat = stat;
async function close(fd) {
    return new Promise((resolve, reject) => {
        fs.close(fd, err => {
            if (err)
                reject(err);
            else
                resolve();
        });
    });
}
exports.close = close;
async function open(path, mode) {
    return new Promise((resolve, reject) => {
        fs.open(path, mode, (err, fd) => {
            if (err)
                reject(err);
            else
                resolve(fd);
        });
    });
}
exports.open = open;
async function read(fd, buffer, offset, length, position) {
    return new Promise((resolve, reject) => {
        fs.read(fd, buffer, offset, length, position, (err, bytesRead, _buffer) => {
            if (err)
                reject(err);
            else
                resolve({ bytesRead, buffer: _buffer });
        });
    });
}
exports.read = read;
async function writeFile(path, data) {
    return new Promise((resolve, reject) => {
        fs.writeFile(path, data, err => {
            if (err)
                reject(err);
            else
                resolve();
        });
    });
}
exports.writeFile = writeFile;
function writeFileSync(path, data) {
    fs.writeFileSync(path, data);
}
exports.writeFileSync = writeFileSync;
async function readFile(path) {
    return new Promise((resolve, reject) => {
        fs.readFile(path, (err, buffer) => {
            if (err)
                reject(err);
            else
                resolve(buffer);
        });
    });
}
exports.readFile = readFile;

});

unwrapExports(FsPromise);
var FsPromise_1 = FsPromise.pathExists;
var FsPromise_2 = FsPromise.createReadStream;
var FsPromise_3 = FsPromise.stat;
var FsPromise_4 = FsPromise.close;
var FsPromise_5 = FsPromise.open;
var FsPromise_6 = FsPromise.read;
var FsPromise_7 = FsPromise.writeFile;
var FsPromise_8 = FsPromise.writeFileSync;
var FsPromise_9 = FsPromise.readFile;

var EndOfFileStream = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultMessages = 'End-Of-Stream';
/**
 * Thrown on read operation of the end of file or stream has been reached
 */
class EndOfStreamError extends Error {
    constructor() {
        super(exports.defaultMessages);
    }
}
exports.EndOfStreamError = EndOfStreamError;

});

unwrapExports(EndOfFileStream);
var EndOfFileStream_1 = EndOfFileStream.defaultMessages;
var EndOfFileStream_2 = EndOfFileStream.EndOfStreamError;

var lib$1 = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });


var EndOfFileStream_2 = EndOfFileStream;
exports.EndOfStreamError = EndOfFileStream_2.EndOfStreamError;
class Deferred {
    constructor() {
        this.promise = new Promise((resolve, reject) => {
            this.reject = reject;
            this.resolve = resolve;
        });
    }
}
const maxStreamReadSize = 1 * 1024 * 1024; // Maximum request length on read-stream operation
class StreamReader {
    constructor(s) {
        this.s = s;
        this.endOfStream = false;
        /**
         * Store peeked data
         * @type {Array}
         */
        this.peekQueue = [];
        if (!s.read || !s.once) {
            throw new Error('Expected an instance of stream.Readable');
        }
        this.s.once('end', () => this.reject(new EndOfFileStream.EndOfStreamError()));
        this.s.once('error', err => this.reject(err));
        this.s.once('close', () => this.reject(new Error('Stream closed')));
    }
    /**
     * Read ahead (peek) from stream. Subsequent read or peeks will return the same data
     * @param buffer - Buffer to store data read from stream in
     * @param offset - Offset buffer
     * @param length - Number of bytes to read
     * @returns Number of bytes peeked
     */
    async peek(buffer, offset, length) {
        const bytesRead = await this.read(buffer, offset, length);
        this.peekQueue.push(buffer.slice(offset, offset + bytesRead)); // Put read data back to peek buffer
        return bytesRead;
    }
    /**
     * Read chunk from stream
     * @param buffer - Target buffer to store data read from stream in
     * @param offset - Offset of target buffer
     * @param length - Number of bytes to read
     * @returns Number of bytes read
     */
    async read(buffer, offset, length) {
        if (length === 0) {
            return 0;
        }
        if (this.peekQueue.length === 0 && this.endOfStream) {
            throw new EndOfFileStream.EndOfStreamError();
        }
        let remaining = length;
        let bytesRead = 0;
        // consume peeked data first
        while (this.peekQueue.length > 0 && remaining > 0) {
            const peekData = this.peekQueue.pop(); // Front of queue
            const lenCopy = Math.min(peekData.length, remaining);
            peekData.copy(buffer, offset + bytesRead, 0, lenCopy);
            bytesRead += lenCopy;
            remaining -= lenCopy;
            if (lenCopy < peekData.length) {
                // remainder back to queue
                this.peekQueue.push(peekData.slice(lenCopy));
            }
        }
        // continue reading from stream if required
        while (remaining > 0 && !this.endOfStream) {
            const reqLen = Math.min(remaining, maxStreamReadSize);
            const chunkLen = await this._read(buffer, offset + bytesRead, reqLen);
            bytesRead += chunkLen;
            if (chunkLen < reqLen)
                break;
            remaining -= chunkLen;
        }
        return bytesRead;
    }
    /**
     * Read chunk from stream
     * @param buffer Buffer to store data read from stream in
     * @param offset Offset buffer
     * @param length Number of bytes to read
     * @returns {any}
     */
    async _read(buffer, offset, length) {
        assert.ok(!this.request, 'Concurrent read operation?');
        const readBuffer = this.s.read(length);
        if (readBuffer) {
            readBuffer.copy(buffer, offset);
            return readBuffer.length;
        }
        else {
            this.request = {
                buffer,
                offset,
                length,
                deferred: new Deferred()
            };
            this.s.once('readable', () => {
                this.tryRead();
            });
            return this.request.deferred.promise.then(n => {
                this.request = null;
                return n;
            }, err => {
                this.request = null;
                throw err;
            });
        }
    }
    tryRead() {
        const readBuffer = this.s.read(this.request.length);
        if (readBuffer) {
            readBuffer.copy(this.request.buffer, this.request.offset);
            this.request.deferred.resolve(readBuffer.length);
        }
        else {
            this.s.once('readable', () => {
                this.tryRead();
            });
        }
    }
    reject(err) {
        this.endOfStream = true;
        if (this.request) {
            this.request.deferred.reject(err);
            this.request = null;
        }
    }
}
exports.StreamReader = StreamReader;

});

unwrapExports(lib$1);
var lib_1 = lib$1.EndOfStreamError;
var lib_2 = lib$1.StreamReader;

var AbstractTokenizer_1 = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });

/**
 * Core tokenizer
 */
class AbstractTokenizer {
    constructor(fileInfo) {
        /**
         * Tokenizer-stream position
         */
        this.position = 0;
        this.numBuffer = Buffer.alloc(10);
        this.fileInfo = fileInfo ? fileInfo : {};
    }
    /**
     * Read a token from the tokenizer-stream
     * @param token - The token to read
     * @param position - If provided, the desired position in the tokenizer-stream
     * @returns Promise with token data
     */
    async readToken(token, position) {
        const buffer = Buffer.alloc(token.len);
        const len = await this.readBuffer(buffer, { position });
        if (len < token.len)
            throw new lib$1.EndOfStreamError();
        return token.get(buffer, 0);
    }
    /**
     * Peek a token from the tokenizer-stream.
     * @param token - Token to peek from the tokenizer-stream.
     * @param position - Offset where to begin reading within the file. If position is null, data will be read from the current file position.
     * @returns Promise with token data
     */
    async peekToken(token, position = this.position) {
        const buffer = Buffer.alloc(token.len);
        const len = await this.peekBuffer(buffer, { position });
        if (len < token.len)
            throw new lib$1.EndOfStreamError();
        return token.get(buffer, 0);
    }
    /**
     * Read a numeric token from the stream
     * @param token - Numeric token
     * @returns Promise with number
     */
    async readNumber(token) {
        const len = await this.readBuffer(this.numBuffer, { length: token.len });
        if (len < token.len)
            throw new lib$1.EndOfStreamError();
        return token.get(this.numBuffer, 0);
    }
    /**
     * Read a numeric token from the stream
     * @param token - Numeric token
     * @returns Promise with number
     */
    async peekNumber(token) {
        const len = await this.peekBuffer(this.numBuffer, { length: token.len });
        if (len < token.len)
            throw new lib$1.EndOfStreamError();
        return token.get(this.numBuffer, 0);
    }
    async close() {
        // empty
    }
}
exports.AbstractTokenizer = AbstractTokenizer;

});

unwrapExports(AbstractTokenizer_1);
var AbstractTokenizer_2 = AbstractTokenizer_1.AbstractTokenizer;

/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var w = d * 7;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} [options]
 * @throws {Error} throw an error if val is not a non-empty string or a number
 * @return {String|Number}
 * @api public
 */

var ms = function(val, options) {
  options = options || {};
  var type = typeof val;
  if (type === 'string' && val.length > 0) {
    return parse(val);
  } else if (type === 'number' && isFinite(val)) {
    return options.long ? fmtLong(val) : fmtShort(val);
  }
  throw new Error(
    'val is not a non-empty string or a valid number. val=' +
      JSON.stringify(val)
  );
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  str = String(str);
  if (str.length > 100) {
    return;
  }
  var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
    str
  );
  if (!match) {
    return;
  }
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y;
    case 'weeks':
    case 'week':
    case 'w':
      return n * w;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n;
    default:
      return undefined;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtShort(ms) {
  var msAbs = Math.abs(ms);
  if (msAbs >= d) {
    return Math.round(ms / d) + 'd';
  }
  if (msAbs >= h) {
    return Math.round(ms / h) + 'h';
  }
  if (msAbs >= m) {
    return Math.round(ms / m) + 'm';
  }
  if (msAbs >= s) {
    return Math.round(ms / s) + 's';
  }
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtLong(ms) {
  var msAbs = Math.abs(ms);
  if (msAbs >= d) {
    return plural(ms, msAbs, d, 'day');
  }
  if (msAbs >= h) {
    return plural(ms, msAbs, h, 'hour');
  }
  if (msAbs >= m) {
    return plural(ms, msAbs, m, 'minute');
  }
  if (msAbs >= s) {
    return plural(ms, msAbs, s, 'second');
  }
  return ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, msAbs, n, name) {
  var isPlural = msAbs >= n * 1.5;
  return Math.round(ms / n) + ' ' + name + (isPlural ? 's' : '');
}

/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 */

function setup(env) {
	createDebug.debug = createDebug;
	createDebug.default = createDebug;
	createDebug.coerce = coerce;
	createDebug.disable = disable;
	createDebug.enable = enable;
	createDebug.enabled = enabled;
	createDebug.humanize = ms;

	Object.keys(env).forEach(key => {
		createDebug[key] = env[key];
	});

	/**
	* Active `debug` instances.
	*/
	createDebug.instances = [];

	/**
	* The currently active debug mode names, and names to skip.
	*/

	createDebug.names = [];
	createDebug.skips = [];

	/**
	* Map of special "%n" handling functions, for the debug "format" argument.
	*
	* Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
	*/
	createDebug.formatters = {};

	/**
	* Selects a color for a debug namespace
	* @param {String} namespace The namespace string for the for the debug instance to be colored
	* @return {Number|String} An ANSI color code for the given namespace
	* @api private
	*/
	function selectColor(namespace) {
		let hash = 0;

		for (let i = 0; i < namespace.length; i++) {
			hash = ((hash << 5) - hash) + namespace.charCodeAt(i);
			hash |= 0; // Convert to 32bit integer
		}

		return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
	}
	createDebug.selectColor = selectColor;

	/**
	* Create a debugger with the given `namespace`.
	*
	* @param {String} namespace
	* @return {Function}
	* @api public
	*/
	function createDebug(namespace) {
		let prevTime;

		function debug(...args) {
			// Disabled?
			if (!debug.enabled) {
				return;
			}

			const self = debug;

			// Set `diff` timestamp
			const curr = Number(new Date());
			const ms = curr - (prevTime || curr);
			self.diff = ms;
			self.prev = prevTime;
			self.curr = curr;
			prevTime = curr;

			args[0] = createDebug.coerce(args[0]);

			if (typeof args[0] !== 'string') {
				// Anything else let's inspect with %O
				args.unshift('%O');
			}

			// Apply any `formatters` transformations
			let index = 0;
			args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
				// If we encounter an escaped % then don't increase the array index
				if (match === '%%') {
					return match;
				}
				index++;
				const formatter = createDebug.formatters[format];
				if (typeof formatter === 'function') {
					const val = args[index];
					match = formatter.call(self, val);

					// Now we need to remove `args[index]` since it's inlined in the `format`
					args.splice(index, 1);
					index--;
				}
				return match;
			});

			// Apply env-specific formatting (colors, etc.)
			createDebug.formatArgs.call(self, args);

			const logFn = self.log || createDebug.log;
			logFn.apply(self, args);
		}

		debug.namespace = namespace;
		debug.enabled = createDebug.enabled(namespace);
		debug.useColors = createDebug.useColors();
		debug.color = selectColor(namespace);
		debug.destroy = destroy;
		debug.extend = extend;
		// Debug.formatArgs = formatArgs;
		// debug.rawLog = rawLog;

		// env-specific initialization logic for debug instances
		if (typeof createDebug.init === 'function') {
			createDebug.init(debug);
		}

		createDebug.instances.push(debug);

		return debug;
	}

	function destroy() {
		const index = createDebug.instances.indexOf(this);
		if (index !== -1) {
			createDebug.instances.splice(index, 1);
			return true;
		}
		return false;
	}

	function extend(namespace, delimiter) {
		const newDebug = createDebug(this.namespace + (typeof delimiter === 'undefined' ? ':' : delimiter) + namespace);
		newDebug.log = this.log;
		return newDebug;
	}

	/**
	* Enables a debug mode by namespaces. This can include modes
	* separated by a colon and wildcards.
	*
	* @param {String} namespaces
	* @api public
	*/
	function enable(namespaces) {
		createDebug.save(namespaces);

		createDebug.names = [];
		createDebug.skips = [];

		let i;
		const split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
		const len = split.length;

		for (i = 0; i < len; i++) {
			if (!split[i]) {
				// ignore empty strings
				continue;
			}

			namespaces = split[i].replace(/\*/g, '.*?');

			if (namespaces[0] === '-') {
				createDebug.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
			} else {
				createDebug.names.push(new RegExp('^' + namespaces + '$'));
			}
		}

		for (i = 0; i < createDebug.instances.length; i++) {
			const instance = createDebug.instances[i];
			instance.enabled = createDebug.enabled(instance.namespace);
		}
	}

	/**
	* Disable debug output.
	*
	* @return {String} namespaces
	* @api public
	*/
	function disable() {
		const namespaces = [
			...createDebug.names.map(toNamespace),
			...createDebug.skips.map(toNamespace).map(namespace => '-' + namespace)
		].join(',');
		createDebug.enable('');
		return namespaces;
	}

	/**
	* Returns true if the given mode name is enabled, false otherwise.
	*
	* @param {String} name
	* @return {Boolean}
	* @api public
	*/
	function enabled(name) {
		if (name[name.length - 1] === '*') {
			return true;
		}

		let i;
		let len;

		for (i = 0, len = createDebug.skips.length; i < len; i++) {
			if (createDebug.skips[i].test(name)) {
				return false;
			}
		}

		for (i = 0, len = createDebug.names.length; i < len; i++) {
			if (createDebug.names[i].test(name)) {
				return true;
			}
		}

		return false;
	}

	/**
	* Convert regexp to namespace
	*
	* @param {RegExp} regxep
	* @return {String} namespace
	* @api private
	*/
	function toNamespace(regexp) {
		return regexp.toString()
			.substring(2, regexp.toString().length - 2)
			.replace(/\.\*\?$/, '*');
	}

	/**
	* Coerce `val`.
	*
	* @param {Mixed} val
	* @return {Mixed}
	* @api private
	*/
	function coerce(val) {
		if (val instanceof Error) {
			return val.stack || val.message;
		}
		return val;
	}

	createDebug.enable(createDebug.load());

	return createDebug;
}

var common = setup;

var browser = createCommonjsModule(function (module, exports) {
/* eslint-env browser */

/**
 * This is the web browser implementation of `debug()`.
 */

exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = localstorage();

/**
 * Colors.
 */

exports.colors = [
	'#0000CC',
	'#0000FF',
	'#0033CC',
	'#0033FF',
	'#0066CC',
	'#0066FF',
	'#0099CC',
	'#0099FF',
	'#00CC00',
	'#00CC33',
	'#00CC66',
	'#00CC99',
	'#00CCCC',
	'#00CCFF',
	'#3300CC',
	'#3300FF',
	'#3333CC',
	'#3333FF',
	'#3366CC',
	'#3366FF',
	'#3399CC',
	'#3399FF',
	'#33CC00',
	'#33CC33',
	'#33CC66',
	'#33CC99',
	'#33CCCC',
	'#33CCFF',
	'#6600CC',
	'#6600FF',
	'#6633CC',
	'#6633FF',
	'#66CC00',
	'#66CC33',
	'#9900CC',
	'#9900FF',
	'#9933CC',
	'#9933FF',
	'#99CC00',
	'#99CC33',
	'#CC0000',
	'#CC0033',
	'#CC0066',
	'#CC0099',
	'#CC00CC',
	'#CC00FF',
	'#CC3300',
	'#CC3333',
	'#CC3366',
	'#CC3399',
	'#CC33CC',
	'#CC33FF',
	'#CC6600',
	'#CC6633',
	'#CC9900',
	'#CC9933',
	'#CCCC00',
	'#CCCC33',
	'#FF0000',
	'#FF0033',
	'#FF0066',
	'#FF0099',
	'#FF00CC',
	'#FF00FF',
	'#FF3300',
	'#FF3333',
	'#FF3366',
	'#FF3399',
	'#FF33CC',
	'#FF33FF',
	'#FF6600',
	'#FF6633',
	'#FF9900',
	'#FF9933',
	'#FFCC00',
	'#FFCC33'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

// eslint-disable-next-line complexity
function useColors() {
	// NB: In an Electron preload script, document will be defined but not fully
	// initialized. Since we know we're in Chrome, we'll just detect this case
	// explicitly
	if (typeof window !== 'undefined' && window.process && (window.process.type === 'renderer' || window.process.__nwjs)) {
		return true;
	}

	// Internet Explorer and Edge do not support colors.
	if (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
		return false;
	}

	// Is webkit? http://stackoverflow.com/a/16459606/376773
	// document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
	return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
		// Is firebug? http://stackoverflow.com/a/398120/376773
		(typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
		// Is firefox >= v31?
		// https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
		(typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31) ||
		// Double check webkit in userAgent just in case we are in a worker
		(typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
}

/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs(args) {
	args[0] = (this.useColors ? '%c' : '') +
		this.namespace +
		(this.useColors ? ' %c' : ' ') +
		args[0] +
		(this.useColors ? '%c ' : ' ') +
		'+' + module.exports.humanize(this.diff);

	if (!this.useColors) {
		return;
	}

	const c = 'color: ' + this.color;
	args.splice(1, 0, c, 'color: inherit');

	// The final "%c" is somewhat tricky, because there could be other
	// arguments passed either before or after the %c, so we need to
	// figure out the correct index to insert the CSS into
	let index = 0;
	let lastC = 0;
	args[0].replace(/%[a-zA-Z%]/g, match => {
		if (match === '%%') {
			return;
		}
		index++;
		if (match === '%c') {
			// We only are interested in the *last* %c
			// (the user may have provided their own)
			lastC = index;
		}
	});

	args.splice(lastC, 0, c);
}

/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */
function log(...args) {
	// This hackery is required for IE8/9, where
	// the `console.log` function doesn't have 'apply'
	return typeof console === 'object' &&
		console.log &&
		console.log(...args);
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */
function save(namespaces) {
	try {
		if (namespaces) {
			exports.storage.setItem('debug', namespaces);
		} else {
			exports.storage.removeItem('debug');
		}
	} catch (error) {
		// Swallow
		// XXX (@Qix-) should we be logging these?
	}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */
function load() {
	let r;
	try {
		r = exports.storage.getItem('debug');
	} catch (error) {
		// Swallow
		// XXX (@Qix-) should we be logging these?
	}

	// If debug isn't set in LS, and we're in Electron, try to load $DEBUG
	if (!r && typeof process !== 'undefined' && 'env' in process) {
		r = process.env.DEBUG;
	}

	return r;
}

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage() {
	try {
		// TVMLKit (Apple TV JS Runtime) does not have a window object, just localStorage in the global context
		// The Browser also has localStorage in the global context.
		return localStorage;
	} catch (error) {
		// Swallow
		// XXX (@Qix-) should we be logging these?
	}
}

module.exports = common(exports);

const {formatters} = module.exports;

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

formatters.j = function (v) {
	try {
		return JSON.stringify(v);
	} catch (error) {
		return '[UnexpectedJSONParseError]: ' + error.message;
	}
};
});
var browser_1 = browser.log;
var browser_2 = browser.formatArgs;
var browser_3 = browser.save;
var browser_4 = browser.load;
var browser_5 = browser.useColors;
var browser_6 = browser.storage;
var browser_7 = browser.colors;

var hasFlag = (flag, argv) => {
	argv = argv || process.argv;
	const prefix = flag.startsWith('-') ? '' : (flag.length === 1 ? '-' : '--');
	const pos = argv.indexOf(prefix + flag);
	const terminatorPos = argv.indexOf('--');
	return pos !== -1 && (terminatorPos === -1 ? true : pos < terminatorPos);
};

const env = process.env;

let forceColor;
if (hasFlag('no-color') ||
	hasFlag('no-colors') ||
	hasFlag('color=false')) {
	forceColor = false;
} else if (hasFlag('color') ||
	hasFlag('colors') ||
	hasFlag('color=true') ||
	hasFlag('color=always')) {
	forceColor = true;
}
if ('FORCE_COLOR' in env) {
	forceColor = env.FORCE_COLOR.length === 0 || parseInt(env.FORCE_COLOR, 10) !== 0;
}

function translateLevel(level) {
	if (level === 0) {
		return false;
	}

	return {
		level,
		hasBasic: true,
		has256: level >= 2,
		has16m: level >= 3
	};
}

function supportsColor(stream) {
	if (forceColor === false) {
		return 0;
	}

	if (hasFlag('color=16m') ||
		hasFlag('color=full') ||
		hasFlag('color=truecolor')) {
		return 3;
	}

	if (hasFlag('color=256')) {
		return 2;
	}

	if (stream && !stream.isTTY && forceColor !== true) {
		return 0;
	}

	const min = forceColor ? 1 : 0;

	if (process.platform === 'win32') {
		// Node.js 7.5.0 is the first version of Node.js to include a patch to
		// libuv that enables 256 color output on Windows. Anything earlier and it
		// won't work. However, here we target Node.js 8 at minimum as it is an LTS
		// release, and Node.js 7 is not. Windows 10 build 10586 is the first Windows
		// release that supports 256 colors. Windows 10 build 14931 is the first release
		// that supports 16m/TrueColor.
		const osRelease = os.release().split('.');
		if (
			Number(process.versions.node.split('.')[0]) >= 8 &&
			Number(osRelease[0]) >= 10 &&
			Number(osRelease[2]) >= 10586
		) {
			return Number(osRelease[2]) >= 14931 ? 3 : 2;
		}

		return 1;
	}

	if ('CI' in env) {
		if (['TRAVIS', 'CIRCLECI', 'APPVEYOR', 'GITLAB_CI'].some(sign => sign in env) || env.CI_NAME === 'codeship') {
			return 1;
		}

		return min;
	}

	if ('TEAMCITY_VERSION' in env) {
		return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env.TEAMCITY_VERSION) ? 1 : 0;
	}

	if (env.COLORTERM === 'truecolor') {
		return 3;
	}

	if ('TERM_PROGRAM' in env) {
		const version = parseInt((env.TERM_PROGRAM_VERSION || '').split('.')[0], 10);

		switch (env.TERM_PROGRAM) {
			case 'iTerm.app':
				return version >= 3 ? 3 : 2;
			case 'Apple_Terminal':
				return 2;
			// No default
		}
	}

	if (/-256(color)?$/i.test(env.TERM)) {
		return 2;
	}

	if (/^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(env.TERM)) {
		return 1;
	}

	if ('COLORTERM' in env) {
		return 1;
	}

	if (env.TERM === 'dumb') {
		return min;
	}

	return min;
}

function getSupportLevel(stream) {
	const level = supportsColor(stream);
	return translateLevel(level);
}

var supportsColor_1 = {
	supportsColor: getSupportLevel,
	stdout: getSupportLevel(process.stdout),
	stderr: getSupportLevel(process.stderr)
};

var node = createCommonjsModule(function (module, exports) {
/**
 * Module dependencies.
 */




/**
 * This is the Node.js implementation of `debug()`.
 */

exports.init = init;
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;

/**
 * Colors.
 */

exports.colors = [6, 2, 3, 4, 5, 1];

try {
	// Optional dependency (as in, doesn't need to be installed, NOT like optionalDependencies in package.json)
	// eslint-disable-next-line import/no-extraneous-dependencies
	const supportsColor = supportsColor_1;

	if (supportsColor && (supportsColor.stderr || supportsColor).level >= 2) {
		exports.colors = [
			20,
			21,
			26,
			27,
			32,
			33,
			38,
			39,
			40,
			41,
			42,
			43,
			44,
			45,
			56,
			57,
			62,
			63,
			68,
			69,
			74,
			75,
			76,
			77,
			78,
			79,
			80,
			81,
			92,
			93,
			98,
			99,
			112,
			113,
			128,
			129,
			134,
			135,
			148,
			149,
			160,
			161,
			162,
			163,
			164,
			165,
			166,
			167,
			168,
			169,
			170,
			171,
			172,
			173,
			178,
			179,
			184,
			185,
			196,
			197,
			198,
			199,
			200,
			201,
			202,
			203,
			204,
			205,
			206,
			207,
			208,
			209,
			214,
			215,
			220,
			221
		];
	}
} catch (error) {
	// Swallow - we only care if `supports-color` is available; it doesn't have to be.
}

/**
 * Build up the default `inspectOpts` object from the environment variables.
 *
 *   $ DEBUG_COLORS=no DEBUG_DEPTH=10 DEBUG_SHOW_HIDDEN=enabled node script.js
 */

exports.inspectOpts = Object.keys(process.env).filter(key => {
	return /^debug_/i.test(key);
}).reduce((obj, key) => {
	// Camel-case
	const prop = key
		.substring(6)
		.toLowerCase()
		.replace(/_([a-z])/g, (_, k) => {
			return k.toUpperCase();
		});

	// Coerce string value into JS value
	let val = process.env[key];
	if (/^(yes|on|true|enabled)$/i.test(val)) {
		val = true;
	} else if (/^(no|off|false|disabled)$/i.test(val)) {
		val = false;
	} else if (val === 'null') {
		val = null;
	} else {
		val = Number(val);
	}

	obj[prop] = val;
	return obj;
}, {});

/**
 * Is stdout a TTY? Colored output is enabled when `true`.
 */

function useColors() {
	return 'colors' in exports.inspectOpts ?
		Boolean(exports.inspectOpts.colors) :
		tty.isatty(process.stderr.fd);
}

/**
 * Adds ANSI color escape codes if enabled.
 *
 * @api public
 */

function formatArgs(args) {
	const {namespace: name, useColors} = this;

	if (useColors) {
		const c = this.color;
		const colorCode = '\u001B[3' + (c < 8 ? c : '8;5;' + c);
		const prefix = `  ${colorCode};1m${name} \u001B[0m`;

		args[0] = prefix + args[0].split('\n').join('\n' + prefix);
		args.push(colorCode + 'm+' + module.exports.humanize(this.diff) + '\u001B[0m');
	} else {
		args[0] = getDate() + name + ' ' + args[0];
	}
}

function getDate() {
	if (exports.inspectOpts.hideDate) {
		return '';
	}
	return new Date().toISOString() + ' ';
}

/**
 * Invokes `util.format()` with the specified arguments and writes to stderr.
 */

function log(...args) {
	return process.stderr.write(util$2.format(...args) + '\n');
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */
function save(namespaces) {
	if (namespaces) {
		process.env.DEBUG = namespaces;
	} else {
		// If you set a process.env field to null or undefined, it gets cast to the
		// string 'null' or 'undefined'. Just delete instead.
		delete process.env.DEBUG;
	}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
	return process.env.DEBUG;
}

/**
 * Init logic for `debug` instances.
 *
 * Create a new `inspectOpts` object in case `useColors` is set
 * differently for a particular `debug` instance.
 */

function init(debug) {
	debug.inspectOpts = {};

	const keys = Object.keys(exports.inspectOpts);
	for (let i = 0; i < keys.length; i++) {
		debug.inspectOpts[keys[i]] = exports.inspectOpts[keys[i]];
	}
}

module.exports = common(exports);

const {formatters} = module.exports;

/**
 * Map %o to `util.inspect()`, all on a single line.
 */

formatters.o = function (v) {
	this.inspectOpts.colors = this.useColors;
	return util$2.inspect(v, this.inspectOpts)
		.replace(/\s*\n\s*/g, ' ');
};

/**
 * Map %O to `util.inspect()`, allowing multiple lines if needed.
 */

formatters.O = function (v) {
	this.inspectOpts.colors = this.useColors;
	return util$2.inspect(v, this.inspectOpts);
};
});
var node_1 = node.init;
var node_2 = node.log;
var node_3 = node.formatArgs;
var node_4 = node.save;
var node_5 = node.load;
var node_6 = node.useColors;
var node_7 = node.colors;
var node_8 = node.inspectOpts;

var src = createCommonjsModule(function (module) {
/**
 * Detect Electron renderer / nwjs process, which is node, but we should
 * treat as a browser.
 */

if (typeof process === 'undefined' || process.type === 'renderer' || process.browser === true || process.__nwjs) {
	module.exports = browser;
} else {
	module.exports = node;
}
});

var ReadStreamTokenizer_1 = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });



const debug = src('strtok3:ReadStreamTokenizer');
const maxBufferSize = 1 * 1000 * 1000;
class ReadStreamTokenizer extends AbstractTokenizer_1.AbstractTokenizer {
    constructor(stream, fileInfo) {
        super(fileInfo);
        this.streamReader = new lib$1.StreamReader(stream);
    }
    /**
     * Get file information, an HTTP-client may implement this doing a HEAD request
     * @return Promise with file information
     */
    async getFileInfo() {
        return this.fileInfo;
    }
    /**
     * Read buffer from tokenizer
     * @param buffer - Target buffer to fill with data read from the tokenizer-stream
     * @param options - Read behaviour options
     * @returns Promise with number of bytes read
     */
    async readBuffer(buffer, options) {
        // const _offset = position ? position : this.position;
        // debug(`readBuffer ${_offset}...${_offset + length - 1}`);
        let offset = 0;
        let length = buffer.length;
        if (options) {
            if (Number.isInteger(options.length)) {
                length = options.length;
            }
            else {
                length -= options.offset || 0;
            }
            if (options.position) {
                const skipBytes = options.position - this.position;
                if (skipBytes > 0) {
                    await this.ignore(skipBytes);
                    return this.readBuffer(buffer, options);
                }
                else if (skipBytes < 0) {
                    throw new Error('`options.position` can be less than `tokenizer.position`');
                }
            }
            if (options.offset) {
                offset = options.offset;
            }
        }
        if (length === 0) {
            return 0;
        }
        const bytesRead = await this.streamReader.read(buffer, offset, length);
        this.position += bytesRead;
        if ((!options || !options.mayBeLess) && bytesRead < length) {
            throw new lib$1.EndOfStreamError();
        }
        return bytesRead;
    }
    /**
     * Peek (read ahead) buffer from tokenizer
     * @param buffer - Target buffer to write the data read to
     * @param options - Read behaviour options
     * @returns Promise with number of bytes peeked
     */
    async peekBuffer(buffer, options) {
        // const _offset = position ? position : this.position;
        // debug(`peek ${_offset}...${_offset + length - 1}`);
        let offset = 0;
        let bytesRead;
        let length = buffer.length;
        if (options) {
            if (options.offset) {
                offset = options.offset;
            }
            if (Number.isInteger(options.length)) {
                length = options.length;
            }
            else {
                length -= options.offset || 0;
            }
            if (options.position) {
                const skipBytes = options.position - this.position;
                if (skipBytes > 0) {
                    const skipBuffer = Buffer.alloc(length + skipBytes);
                    bytesRead = await this.peekBuffer(skipBuffer, { mayBeLess: options.mayBeLess });
                    skipBuffer.copy(buffer, offset, skipBytes);
                    return bytesRead - skipBytes;
                }
                else if (skipBytes < 0) {
                    throw new Error('Cannot peek from a negative offset in a stream');
                }
            }
        }
        bytesRead = await this.streamReader.peek(buffer, offset, length);
        if ((!options || !options.mayBeLess) && bytesRead < length) {
            throw new lib$1.EndOfStreamError();
        }
        return bytesRead;
    }
    async ignore(length) {
        debug(`ignore ${this.position}...${this.position + length - 1}`);
        const bufSize = Math.min(maxBufferSize, length);
        const buf = Buffer.alloc(bufSize);
        let totBytesRead = 0;
        while (totBytesRead < length) {
            const remaining = length - totBytesRead;
            const bytesRead = await this.readBuffer(buf, { length: Math.min(bufSize, remaining) });
            if (bytesRead < 0) {
                return bytesRead;
            }
            totBytesRead += bytesRead;
        }
        return totBytesRead;
    }
}
exports.ReadStreamTokenizer = ReadStreamTokenizer;

});

unwrapExports(ReadStreamTokenizer_1);
var ReadStreamTokenizer_2 = ReadStreamTokenizer_1.ReadStreamTokenizer;

var BufferTokenizer_1 = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });

class BufferTokenizer {
    /**
     * Construct BufferTokenizer
     * @param buffer - Buffer to tokenize
     * @param fileInfo - Pass additional file information to the tokenizer
     */
    constructor(buffer, fileInfo) {
        this.buffer = buffer;
        this.position = 0;
        this.fileInfo = fileInfo ? fileInfo : {};
        this.fileInfo.size = this.fileInfo.size ? this.fileInfo.size : buffer.length;
    }
    /**
     * Read buffer from tokenizer
     * @param buffer
     * @param options - Read behaviour options
     * @returns {Promise<number>}
     */
    async readBuffer(buffer, options) {
        if (options && options.position) {
            if (options.position < this.position) {
                throw new Error('`options.position` can be less than `tokenizer.position`');
            }
            this.position = options.position;
        }
        return this.peekBuffer(buffer, options).then(bytesRead => {
            this.position += bytesRead;
            return bytesRead;
        });
    }
    /**
     * Peek (read ahead) buffer from tokenizer
     * @param buffer
     * @param options - Read behaviour options
     * @returns {Promise<number>}
     */
    async peekBuffer(buffer, options) {
        let offset = 0;
        let length = buffer.length;
        let position = this.position;
        if (options) {
            if (options.position) {
                if (options.position < this.position) {
                    throw new Error('`options.position` can be less than `tokenizer.position`');
                }
                position = options.position;
            }
            if (Number.isInteger(options.length)) {
                length = options.length;
            }
            else {
                length -= options.offset || 0;
            }
            if (options.offset) {
                offset = options.offset;
            }
        }
        if (length === 0) {
            return Promise.resolve(0);
        }
        position = position || this.position;
        if (!length) {
            length = buffer.length;
        }
        const bytes2read = Math.min(this.buffer.length - position, length);
        if ((!options || !options.mayBeLess) && bytes2read < length) {
            throw new lib$1.EndOfStreamError();
        }
        else {
            this.buffer.copy(buffer, offset, position, position + bytes2read);
            return bytes2read;
        }
    }
    async readToken(token, position) {
        this.position = position || this.position;
        try {
            const tv = this.peekToken(token, this.position);
            this.position += token.len;
            return tv;
        }
        catch (err) {
            this.position += this.buffer.length - position;
            throw err;
        }
    }
    async peekToken(token, position = this.position) {
        if (this.buffer.length - position < token.len) {
            throw new lib$1.EndOfStreamError();
        }
        return token.get(this.buffer, position);
    }
    async readNumber(token) {
        return this.readToken(token);
    }
    async peekNumber(token) {
        return this.peekToken(token);
    }
    /**
     * @return actual number of bytes ignored
     */
    async ignore(length) {
        const bytesIgnored = Math.min(this.buffer.length - this.position, length);
        this.position += bytesIgnored;
        return bytesIgnored;
    }
    async close() {
        // empty
    }
}
exports.BufferTokenizer = BufferTokenizer;

});

unwrapExports(BufferTokenizer_1);
var BufferTokenizer_2 = BufferTokenizer_1.BufferTokenizer;

var core = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });



exports.EndOfStreamError = lib$1.EndOfStreamError;
/**
 * Construct ReadStreamTokenizer from given Stream.
 * Will set fileSize, if provided given Stream has set the .path property/
 * @param stream - Read from Node.js Stream.Readable
 * @param fileInfo - Pass the file information, like size and MIME-type of the correspnding stream.
 * @returns ReadStreamTokenizer
 */
function fromStream(stream, fileInfo) {
    fileInfo = fileInfo ? fileInfo : {};
    return new ReadStreamTokenizer_1.ReadStreamTokenizer(stream, fileInfo);
}
exports.fromStream = fromStream;
/**
 * Construct ReadStreamTokenizer from given Buffer.
 * @param buffer - Buffer to tokenize
 * @param fileInfo - Pass additional file information to the tokenizer
 * @returns BufferTokenizer
 */
function fromBuffer(buffer, fileInfo) {
    return new BufferTokenizer_1.BufferTokenizer(buffer, fileInfo);
}
exports.fromBuffer = fromBuffer;

});

unwrapExports(core);
var core_1 = core.EndOfStreamError;
var core_2 = core.fromStream;
var core_3 = core.fromBuffer;

var FileTokenizer_1 = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });



class FileTokenizer extends AbstractTokenizer_1.AbstractTokenizer {
    constructor(fd, fileInfo) {
        super(fileInfo);
        this.fd = fd;
    }
    /**
     * Read buffer from file
     * @param buffer
     * @param options - Read behaviour options
     * @returns Promise number of bytes read
     */
    async readBuffer(buffer, options) {
        let offset = 0;
        let length = buffer.length;
        if (options) {
            if (options.position) {
                if (options.position < this.position) {
                    throw new Error('`options.position` can be less than `tokenizer.position`');
                }
                this.position = options.position;
            }
            if (Number.isInteger(options.length)) {
                length = options.length;
            }
            else {
                length -= options.offset || 0;
            }
            if (options.offset) {
                offset = options.offset;
            }
        }
        if (length === 0) {
            return Promise.resolve(0);
        }
        const res = await FsPromise.read(this.fd, buffer, offset, length, this.position);
        this.position += res.bytesRead;
        if (res.bytesRead < length && (!options || !options.mayBeLess)) {
            throw new lib$1.EndOfStreamError();
        }
        return res.bytesRead;
    }
    /**
     * Peek buffer from file
     * @param buffer
     * @param options - Read behaviour options
     * @returns Promise number of bytes read
     */
    async peekBuffer(buffer, options) {
        let offset = 0;
        let length = buffer.length;
        let position = this.position;
        if (options) {
            if (options.position) {
                if (options.position < this.position) {
                    throw new Error('`options.position` can be less than `tokenizer.position`');
                }
                position = options.position;
            }
            if (Number.isInteger(options.length)) {
                length = options.length;
            }
            else {
                length -= options.offset || 0;
            }
            if (options.offset) {
                offset = options.offset;
            }
        }
        if (length === 0) {
            return Promise.resolve(0);
        }
        const res = await FsPromise.read(this.fd, buffer, offset, length, position);
        if ((!options || !options.mayBeLess) && res.bytesRead < length) {
            throw new lib$1.EndOfStreamError();
        }
        return res.bytesRead;
    }
    /**
     * @param length - Number of bytes to ignore
     * @return resolves the number of bytes ignored, equals length if this available, otherwise the number of bytes available
     */
    async ignore(length) {
        const bytesLeft = this.fileInfo.size - this.position;
        if (length <= bytesLeft) {
            this.position += length;
            return length;
        }
        else {
            this.position += bytesLeft;
            return bytesLeft;
        }
    }
    async close() {
        return FsPromise.close(this.fd);
    }
}
exports.FileTokenizer = FileTokenizer;
async function fromFile(sourceFilePath) {
    const stat = await FsPromise.stat(sourceFilePath);
    if (!stat.isFile) {
        throw new Error(`File not a file: ${sourceFilePath}`);
    }
    const fd = await FsPromise.open(sourceFilePath, 'r');
    return new FileTokenizer(fd, { path: sourceFilePath, size: stat.size });
}
exports.fromFile = fromFile;

});

unwrapExports(FileTokenizer_1);
var FileTokenizer_2 = FileTokenizer_1.FileTokenizer;
var FileTokenizer_3 = FileTokenizer_1.fromFile;

var lib$2 = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });



exports.fromFile = FileTokenizer_1.fromFile;
var core_1 = core;
exports.EndOfStreamError = core_1.EndOfStreamError;
exports.fromBuffer = core_1.fromBuffer;
/**
 * Construct ReadStreamTokenizer from given Stream.
 * Will set fileSize, if provided given Stream has set the .path property.
 * @param stream - Node.js Stream.Readable
 * @param fileInfo - Pass additional file information to the tokenizer
 * @returns Tokenizer
 */
async function fromStream(stream, fileInfo) {
    fileInfo = fileInfo ? fileInfo : {};
    if (stream.path) {
        const stat = await FsPromise.stat(stream.path);
        fileInfo.path = stream.path;
        fileInfo.size = stat.size;
    }
    return core.fromStream(stream, fileInfo);
}
exports.fromStream = fromStream;

});

unwrapExports(lib$2);
var lib_1$1 = lib$2.fromFile;
var lib_2$1 = lib$2.EndOfStreamError;
var lib_3 = lib$2.fromBuffer;
var lib_4 = lib$2.fromStream;

var read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m;
  var eLen = (nBytes * 8) - mLen - 1;
  var eMax = (1 << eLen) - 1;
  var eBias = eMax >> 1;
  var nBits = -7;
  var i = isLE ? (nBytes - 1) : 0;
  var d = isLE ? -1 : 1;
  var s = buffer[offset + i];

  i += d;

  e = s & ((1 << (-nBits)) - 1);
  s >>= (-nBits);
  nBits += eLen;
  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1);
  e >>= (-nBits);
  nBits += mLen;
  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen);
    e = e - eBias;
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
};

var write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c;
  var eLen = (nBytes * 8) - mLen - 1;
  var eMax = (1 << eLen) - 1;
  var eBias = eMax >> 1;
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0);
  var i = isLE ? 0 : (nBytes - 1);
  var d = isLE ? 1 : -1;
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

  value = Math.abs(value);

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0;
    e = eMax;
  } else {
    e = Math.floor(Math.log(value) / Math.LN2);
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }
    if (e + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * Math.pow(2, 1 - eBias);
    }
    if (value * c >= 2) {
      e++;
      c /= 2;
    }

    if (e + eBias >= eMax) {
      m = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m = ((value * c) - 1) * Math.pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
      e = 0;
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m;
  eLen += mLen;
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128;
};

var ieee754 = {
	read: read,
	write: write
};

var lib$3 = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });


// Primitive types
/**
 * 8-bit unsigned integer
 */
exports.UINT8 = {
    len: 1,
    get(buf, off) {
        return buf.readUInt8(off);
    },
    put(buf, off, v) {
        assert.equal(typeof off, 'number');
        assert.equal(typeof v, 'number');
        assert.ok(v >= 0 && v <= 0xff);
        assert.ok(off >= 0);
        assert.ok(this.len <= buf.length);
        return buf.writeUInt8(v, off);
    }
};
/**
 * 16-bit unsigned integer, Little Endian byte order
 */
exports.UINT16_LE = {
    len: 2,
    get(buf, off) {
        return buf.readUInt16LE(off);
    },
    put(buf, off, v) {
        assert.equal(typeof off, 'number');
        assert.equal(typeof v, 'number');
        assert.ok(v >= 0 && v <= 0xffff);
        assert.ok(off >= 0);
        assert.ok(this.len <= buf.length);
        return buf.writeUInt16LE(v, off);
    }
};
/**
 * 16-bit unsigned integer, Big Endian byte order
 */
exports.UINT16_BE = {
    len: 2,
    get(buf, off) {
        return buf.readUInt16BE(off);
    },
    put(buf, off, v) {
        assert.equal(typeof off, 'number');
        assert.equal(typeof v, 'number');
        assert.ok(v >= 0 && v <= 0xffff);
        assert.ok(off >= 0);
        assert.ok(this.len <= buf.length);
        return buf.writeUInt16BE(v, off);
    }
};
/**
 * 24-bit unsigned integer, Little Endian byte order
 */
exports.UINT24_LE = {
    len: 3,
    get(buf, off) {
        return buf.readUIntLE(off, 3);
    },
    put(buf, off, v) {
        assert.equal(typeof off, 'number');
        assert.equal(typeof v, 'number');
        assert.ok(v >= 0 && v <= 0xffffff);
        assert.ok(off >= 0);
        assert.ok(this.len <= buf.length);
        return buf.writeUIntLE(v, off, 3);
    }
};
/**
 * 24-bit unsigned integer, Big Endian byte order
 */
exports.UINT24_BE = {
    len: 3,
    get(buf, off) {
        return buf.readUIntBE(off, 3);
    },
    put(buf, off, v) {
        assert.equal(typeof off, 'number');
        assert.equal(typeof v, 'number');
        assert.ok(v >= 0 && v <= 0xffffff);
        assert.ok(off >= 0);
        assert.ok(this.len <= buf.length);
        return buf.writeUIntBE(v, off, 3);
    }
};
/**
 * 32-bit unsigned integer, Little Endian byte order
 */
exports.UINT32_LE = {
    len: 4,
    get(buf, off) {
        return buf.readUInt32LE(off);
    },
    put(b, o, v) {
        assert.equal(typeof o, 'number');
        assert.equal(typeof v, 'number');
        assert.ok(v >= 0 && v <= 0xffffffff);
        assert.ok(o >= 0);
        assert.ok(this.len <= b.length);
        return b.writeUInt32LE(v, o);
    }
};
/**
 * 32-bit unsigned integer, Big Endian byte order
 */
exports.UINT32_BE = {
    len: 4,
    get(buf, off) {
        return buf.readUInt32BE(off);
    },
    put(buf, off, v) {
        assert.equal(typeof off, 'number');
        assert.equal(typeof v, 'number');
        assert.ok(v >= 0 && v <= 0xffffffff);
        assert.ok(off >= 0);
        assert.ok(this.len <= buf.length);
        return buf.writeUInt32BE(v, off);
    }
};
/**
 * 8-bit signed integer
 */
exports.INT8 = {
    len: 1,
    get(buf, off) {
        return buf.readInt8(off);
    },
    put(buf, off, v) {
        assert.equal(typeof off, 'number');
        assert.equal(typeof v, 'number');
        assert.ok(v >= -128 && v <= 127);
        assert.ok(off >= 0);
        assert.ok(this.len <= buf.length);
        return buf.writeInt8(v, off);
    }
};
/**
 * 16-bit signed integer, Big Endian byte order
 */
exports.INT16_BE = {
    len: 2,
    get(buf, off) {
        return buf.readInt16BE(off);
    },
    put(b, o, v) {
        assert.equal(typeof o, 'number');
        assert.equal(typeof v, 'number');
        assert.ok(v >= -32768 && v <= 32767);
        assert.ok(o >= 0);
        assert.ok(this.len <= b.length);
        return b.writeInt16BE(v, o);
    }
};
/**
 * 16-bit signed integer, Little Endian byte order
 */
exports.INT16_LE = {
    len: 2,
    get(buf, off) {
        return buf.readInt16LE(off);
    },
    put(b, o, v) {
        assert.equal(typeof o, 'number');
        assert.equal(typeof v, 'number');
        assert.ok(v >= -32768 && v <= 32767);
        assert.ok(o >= 0);
        assert.ok(this.len <= b.length);
        return b.writeInt16LE(v, o);
    }
};
/**
 * 24-bit signed integer, Little Endian byte order
 */
exports.INT24_LE = {
    len: 3,
    get(buf, off) {
        return buf.readIntLE(off, 3);
    },
    put(b, o, v) {
        assert.equal(typeof o, 'number');
        assert.equal(typeof v, 'number');
        assert.ok(v >= -0x800000 && v <= 0x7fffff);
        assert.ok(o >= 0);
        assert.ok(this.len <= b.length);
        return b.writeIntLE(v, o, 3);
    }
};
/**
 * 24-bit signed integer, Big Endian byte order
 */
exports.INT24_BE = {
    len: 3,
    get(buf, off) {
        return buf.readIntBE(off, 3);
    },
    put(b, o, v) {
        assert.equal(typeof o, 'number');
        assert.equal(typeof v, 'number');
        assert.ok(v >= -0x800000 && v <= 0x7fffff);
        assert.ok(o >= 0);
        assert.ok(this.len <= b.length);
        return b.writeIntBE(v, o, 3);
    }
};
/**
 * 32-bit signed integer, Big Endian byte order
 */
exports.INT32_BE = {
    len: 4,
    get(buf, off) {
        return buf.readInt32BE(off);
    },
    put(b, o, v) {
        assert.equal(typeof o, 'number');
        assert.equal(typeof v, 'number');
        assert.ok(v >= -2147483648 && v <= 2147483647);
        assert.ok(o >= 0);
        assert.ok(this.len <= b.length);
        return b.writeInt32BE(v, o);
    }
};
/**
 * 32-bit signed integer, Big Endian byte order
 */
exports.INT32_LE = {
    len: 4,
    get(buf, off) {
        return buf.readInt32LE(off);
    },
    put(b, o, v) {
        assert.equal(typeof o, 'number');
        assert.equal(typeof v, 'number');
        assert.ok(v >= -2147483648 && v <= 2147483647);
        assert.ok(o >= 0);
        assert.ok(this.len <= b.length);
        return b.writeInt32LE(v, o);
    }
};
/**
 * 64-bit unsigned integer, Little Endian byte order
 */
exports.UINT64_LE = {
    len: 8,
    get(buf, off) {
        return readUIntLE(buf, off, this.len);
    },
    put(b, o, v) {
        return writeUIntLE(b, v, o, this.len);
    }
};
/**
 * 64-bit signed integer, Little Endian byte order
 */
exports.INT64_LE = {
    len: 8,
    get(buf, off) {
        return readIntLE(buf, off, this.len);
    },
    put(b, off, v) {
        return writeIntLE(b, v, off, this.len);
    }
};
/**
 * 64-bit unsigned integer, Big Endian byte order
 */
exports.UINT64_BE = {
    len: 8,
    get(b, off) {
        return readUIntBE(b, off, this.len);
    },
    put(b, o, v) {
        return writeUIntBE(b, v, o, this.len);
    }
};
/**
 * 64-bit signed integer, Big Endian byte order
 */
exports.INT64_BE = {
    len: 8,
    get(b, off) {
        return readIntBE(b, off, this.len);
    },
    put(b, off, v) {
        return writeIntBE(b, v, off, this.len);
    }
};
/**
 * IEEE 754 16-bit (half precision) float, big endian
 */
exports.Float16_BE = {
    len: 2,
    get(b, off) {
        return ieee754.read(b, off, false, 10, this.len);
    },
    put(b, off, v) {
        return ieee754.write(b, v, off, false, 10, this.len);
    }
};
/**
 * IEEE 754 16-bit (half precision) float, little endian
 */
exports.Float16_LE = {
    len: 2,
    get(b, off) {
        return ieee754.read(b, off, true, 10, this.len);
    },
    put(b, off, v) {
        return ieee754.write(b, v, off, true, 10, this.len);
    }
};
/**
 * IEEE 754 32-bit (single precision) float, big endian
 */
exports.Float32_BE = {
    len: 4,
    get(b, off) {
        return b.readFloatBE(off);
    },
    put(b, off, v) {
        return b.writeFloatBE(v, off);
    }
};
/**
 * IEEE 754 32-bit (single precision) float, little endian
 */
exports.Float32_LE = {
    len: 4,
    get(b, off) {
        return b.readFloatLE(off);
    },
    put(b, off, v) {
        return b.writeFloatLE(v, off);
    }
};
/**
 * IEEE 754 64-bit (double precision) float, big endian
 */
exports.Float64_BE = {
    len: 8,
    get(b, off) {
        return b.readDoubleBE(off);
    },
    put(b, off, v) {
        return b.writeDoubleBE(v, off);
    }
};
/**
 * IEEE 754 64-bit (double precision) float, little endian
 */
exports.Float64_LE = {
    len: 8,
    get(b, off) {
        return b.readDoubleLE(off);
    },
    put(b, off, v) {
        return b.writeDoubleLE(v, off);
    }
};
/**
 * IEEE 754 80-bit (extended precision) float, big endian
 */
exports.Float80_BE = {
    len: 10,
    get(b, off) {
        return ieee754.read(b, off, false, 63, this.len);
    },
    put(b, off, v) {
        return ieee754.write(b, v, off, false, 63, this.len);
    }
};
/**
 * IEEE 754 80-bit (extended precision) float, little endian
 */
exports.Float80_LE = {
    len: 10,
    get(b, off) {
        return ieee754.read(b, off, true, 63, this.len);
    },
    put(b, off, v) {
        return ieee754.write(b, v, off, true, 63, this.len);
    }
};
/**
 * Ignore a given number of bytes
 */
class IgnoreType {
    /**
     * @param len number of bytes to ignore
     */
    constructor(len) {
        this.len = len;
    }
    // ToDo: don't read, but skip data
    get(buf, off) {
    }
}
exports.IgnoreType = IgnoreType;
class BufferType {
    constructor(len) {
        this.len = len;
    }
    get(buf, off) {
        return buf.slice(off, off + this.len);
    }
}
exports.BufferType = BufferType;
/**
 * Consume a fixed number of bytes from the stream and return a string with a specified encoding.
 */
class StringType {
    constructor(len, encoding) {
        this.len = len;
        this.encoding = encoding;
    }
    get(buf, off) {
        return buf.toString(this.encoding, off, off + this.len);
    }
}
exports.StringType = StringType;
/**
 * ANSI Latin 1 String
 * Using windows-1252 / ISO 8859-1 decoding
 */
class AnsiStringType {
    constructor(len) {
        this.len = len;
    }
    static decode(buffer, off, until) {
        let str = '';
        for (let i = off; i < until; ++i) {
            str += AnsiStringType.codePointToString(AnsiStringType.singleByteDecoder(buffer[i]));
        }
        return str;
    }
    static inRange(a, min, max) {
        return min <= a && a <= max;
    }
    static codePointToString(cp) {
        if (cp <= 0xFFFF) {
            return String.fromCharCode(cp);
        }
        else {
            cp -= 0x10000;
            return String.fromCharCode((cp >> 10) + 0xD800, (cp & 0x3FF) + 0xDC00);
        }
    }
    static singleByteDecoder(bite) {
        if (AnsiStringType.inRange(bite, 0x00, 0x7F)) {
            return bite;
        }
        const codePoint = AnsiStringType.windows1252[bite - 0x80];
        if (codePoint === null) {
            throw Error('invaliding encoding');
        }
        return codePoint;
    }
    get(buf, off = 0) {
        return AnsiStringType.decode(buf, off, off + this.len);
    }
}
exports.AnsiStringType = AnsiStringType;
AnsiStringType.windows1252 = [8364, 129, 8218, 402, 8222, 8230, 8224, 8225, 710, 8240, 352,
    8249, 338, 141, 381, 143, 144, 8216, 8217, 8220, 8221, 8226, 8211, 8212, 732,
    8482, 353, 8250, 339, 157, 382, 376, 160, 161, 162, 163, 164, 165, 166, 167, 168,
    169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184,
    185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195, 196, 197, 198, 199, 200,
    201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 215, 216,
    217, 218, 219, 220, 221, 222, 223, 224, 225, 226, 227, 228, 229, 230, 231, 232,
    233, 234, 235, 236, 237, 238, 239, 240, 241, 242, 243, 244, 245, 246, 247,
    248, 249, 250, 251, 252, 253, 254, 255];
/**
 * Best effort approach to read up to 64 bit unsigned integer, little endian.
 * Note that JavasScript is limited to 2^53 - 1 bit.
 */
function readUIntLE(buf, offset, byteLength) {
    offset = offset >>> 0;
    byteLength = byteLength >>> 0;
    let val = buf[offset];
    let mul = 1;
    let i = 0;
    while (++i < byteLength && (mul *= 0x100)) {
        val += buf[offset + i] * mul;
    }
    return val;
}
/**
 * Best effort approach to write up to 64 bit unsigned integer, little endian.
 * Note that JavasScript is limited to 2^53 - 1 bit.
 */
function writeUIntLE(buf, value, offset, byteLength) {
    value = +value;
    offset = offset >>> 0;
    byteLength = byteLength >>> 0;
    let mul = 1;
    let i = 0;
    buf[offset] = value & 0xFF;
    while (++i < byteLength && (mul *= 0x100)) {
        buf[offset + i] = (value / mul) & 0xFF;
    }
    return offset + byteLength;
}
/**
 * Best effort approach to read 64 but signed integer, little endian.
 * Note that JavasScript is limited to 2^53 - 1 bit.
 */
function readIntLE(buf, offset, byteLength) {
    offset = offset >>> 0;
    byteLength = byteLength >>> 0;
    let val = buf[offset];
    let mul = 1;
    let i = 0;
    while (++i < byteLength && (mul *= 0x100)) {
        val += buf[offset + i] * mul;
    }
    mul *= 0x80;
    if (val >= mul)
        val -= Math.pow(2, 8 * byteLength);
    return val;
}
/**
 * Best effort approach to write 64 but signed integer, little endian.
 * Note that JavasScript is limited to 2^53 - 1 bit.
 */
function writeIntLE(buf, value, offset, byteLength) {
    value = +value;
    offset = offset >>> 0;
    let i = 0;
    let mul = 1;
    let sub = 0;
    buf[offset] = value & 0xFF;
    while (++i < byteLength && (mul *= 0x100)) {
        if (value < 0 && sub === 0 && buf[offset + i - 1] !== 0) {
            sub = 1;
        }
        buf[offset + i] = ((value / mul) >> 0) - sub & 0xFF;
    }
    return offset + byteLength;
}
exports.writeIntLE = writeIntLE;
/**
 * Best effort approach to read up to 64 bit unsigned integer, big endian.
 * Note that JavasScript is limited to 2^53 - 1 bit.
 */
function readUIntBE(buf, offset, byteLength) {
    offset = offset >>> 0;
    byteLength = byteLength >>> 0;
    let val = buf[offset + --byteLength];
    let mul = 1;
    while (byteLength > 0 && (mul *= 0x100)) {
        val += buf[offset + --byteLength] * mul;
    }
    return val;
}
exports.readUIntBE = readUIntBE;
/**
 * Best effort approach to write up to 64 bit unsigned integer, big endian.
 * Note that JavasScript is limited to 2^53 - 1 bit.
 */
function writeUIntBE(buf, value, offset, byteLength) {
    value = +value;
    offset = offset >>> 0;
    byteLength = byteLength >>> 0;
    let i = byteLength - 1;
    let mul = 1;
    buf[offset + i] = value & 0xFF;
    while (--i >= 0 && (mul *= 0x100)) {
        buf[offset + i] = (value / mul) & 0xFF;
    }
    return offset + byteLength;
}
exports.writeUIntBE = writeUIntBE;
/**
 * Best effort approach to read 64 but signed integer, big endian.
 * Note that JavasScript is limited to 2^53 - 1 bit.
 */
function readIntBE(buf, offset, byteLength) {
    offset = offset >>> 0;
    byteLength = byteLength >>> 0;
    let i = byteLength;
    let mul = 1;
    let val = buf[offset + --i];
    while (i > 0 && (mul *= 0x100)) {
        val += buf[offset + --i] * mul;
    }
    mul *= 0x80;
    if (val >= mul)
        val -= Math.pow(2, 8 * byteLength);
    return val;
}
exports.readIntBE = readIntBE;
/**
 * Best effort approach to write 64 but signed integer, big endian.
 * Note that JavasScript is limited to 2^53 - 1 bit.
 */
function writeIntBE(buf, value, offset, byteLength) {
    value = +value;
    offset = offset >>> 0;
    let i = byteLength - 1;
    let mul = 1;
    let sub = 0;
    buf[offset + i] = value & 0xFF;
    while (--i >= 0 && (mul *= 0x100)) {
        if (value < 0 && sub === 0 && buf[offset + i + 1] !== 0) {
            sub = 1;
        }
        buf[offset + i] = ((value / mul) >> 0) - sub & 0xFF;
    }
    return offset + byteLength;
}
exports.writeIntBE = writeIntBE;

});

unwrapExports(lib$3);
var lib_1$2 = lib$3.UINT8;
var lib_2$2 = lib$3.UINT16_LE;
var lib_3$1 = lib$3.UINT16_BE;
var lib_4$1 = lib$3.UINT24_LE;
var lib_5 = lib$3.UINT24_BE;
var lib_6 = lib$3.UINT32_LE;
var lib_7 = lib$3.UINT32_BE;
var lib_8 = lib$3.INT8;
var lib_9 = lib$3.INT16_BE;
var lib_10 = lib$3.INT16_LE;
var lib_11 = lib$3.INT24_LE;
var lib_12 = lib$3.INT24_BE;
var lib_13 = lib$3.INT32_BE;
var lib_14 = lib$3.INT32_LE;
var lib_15 = lib$3.UINT64_LE;
var lib_16 = lib$3.INT64_LE;
var lib_17 = lib$3.UINT64_BE;
var lib_18 = lib$3.INT64_BE;
var lib_19 = lib$3.Float16_BE;
var lib_20 = lib$3.Float16_LE;
var lib_21 = lib$3.Float32_BE;
var lib_22 = lib$3.Float32_LE;
var lib_23 = lib$3.Float64_BE;
var lib_24 = lib$3.Float64_LE;
var lib_25 = lib$3.Float80_BE;
var lib_26 = lib$3.Float80_LE;
var lib_27 = lib$3.IgnoreType;
var lib_28 = lib$3.BufferType;
var lib_29 = lib$3.StringType;
var lib_30 = lib$3.AnsiStringType;
var lib_31 = lib$3.writeIntLE;
var lib_32 = lib$3.readUIntBE;
var lib_33 = lib$3.writeUIntBE;
var lib_34 = lib$3.readIntBE;
var lib_35 = lib$3.writeIntBE;

var stringToBytes = string => [...string].map(character => character.charCodeAt(0));

const uint8ArrayUtf8ByteString = (array, start, end) => {
	return String.fromCharCode(...array.slice(start, end));
};

var tarHeaderChecksumMatches = buffer => { // Does not check if checksum field characters are valid
	if (buffer.length < 512) { // `tar` header size, cannot compute checksum without it
		return false;
	}

	const MASK_8TH_BIT = 0x80;

	let sum = 256; // Intitalize sum, with 256 as sum of 8 spaces in checksum field
	let signedBitSum = 0; // Initialize signed bit sum

	for (let i = 0; i < 148; i++) {
		const byte = buffer[i];
		sum += byte;
		signedBitSum += byte & MASK_8TH_BIT; // Add signed bit to signed bit sum
	}

	// Skip checksum field

	for (let i = 156; i < 512; i++) {
		const byte = buffer[i];
		sum += byte;
		signedBitSum += byte & MASK_8TH_BIT; // Add signed bit to signed bit sum
	}

	const readSum = parseInt(uint8ArrayUtf8ByteString(buffer, 148, 154), 8); // Read sum in header

	// Some implementations compute checksum incorrectly using signed bytes
	return (
		// Checksum in header equals the sum we calculated
		readSum === sum ||

		// Checksum in header equals sum we calculated plus signed-to-unsigned delta
		readSum === (sum - (signedBitSum << 1))
	);
};

var uint8ArrayUtf8ByteString_1 = uint8ArrayUtf8ByteString;

/**
ID3 UINT32 sync-safe tokenizer token.
28 bits (representing up to 256MB) integer, the msb is 0 to avoid "false syncsignals".
*/
var uint32SyncSafeToken = {
	get: (buffer, offset) => {
		return (buffer[offset + 3] & 0x7F) | ((buffer[offset + 2]) << 7) | ((buffer[offset + 1]) << 14) | ((buffer[offset]) << 21);
	},
	len: 4
};

var util$1 = {
	stringToBytes: stringToBytes,
	tarHeaderChecksumMatches: tarHeaderChecksumMatches,
	uint8ArrayUtf8ByteString: uint8ArrayUtf8ByteString_1,
	uint32SyncSafeToken: uint32SyncSafeToken
};

var supported = {
	extensions: [
		'jpg',
		'png',
		'apng',
		'gif',
		'webp',
		'flif',
		'cr2',
		'cr3',
		'orf',
		'arw',
		'dng',
		'nef',
		'rw2',
		'raf',
		'tif',
		'bmp',
		'jxr',
		'psd',
		'zip',
		'tar',
		'rar',
		'gz',
		'bz2',
		'7z',
		'dmg',
		'mp4',
		'mid',
		'mkv',
		'webm',
		'mov',
		'avi',
		'mpg',
		'mp2',
		'mp3',
		'm4a',
		'oga',
		'ogg',
		'ogv',
		'opus',
		'flac',
		'wav',
		'spx',
		'amr',
		'pdf',
		'epub',
		'exe',
		'swf',
		'rtf',
		'wasm',
		'woff',
		'woff2',
		'eot',
		'ttf',
		'otf',
		'ico',
		'flv',
		'ps',
		'xz',
		'sqlite',
		'nes',
		'crx',
		'xpi',
		'cab',
		'deb',
		'ar',
		'rpm',
		'Z',
		'lz',
		'msi',
		'mxf',
		'mts',
		'blend',
		'bpg',
		'docx',
		'pptx',
		'xlsx',
		'3gp',
		'3g2',
		'jp2',
		'jpm',
		'jpx',
		'mj2',
		'aif',
		'qcp',
		'odt',
		'ods',
		'odp',
		'xml',
		'mobi',
		'heic',
		'cur',
		'ktx',
		'ape',
		'wv',
		'wmv',
		'wma',
		'dcm',
		'ics',
		'glb',
		'pcap',
		'dsf',
		'lnk',
		'alias',
		'voc',
		'ac3',
		'm4v',
		'm4p',
		'm4b',
		'f4v',
		'f4p',
		'f4b',
		'f4a',
		'mie',
		'asf',
		'ogm',
		'ogx',
		'mpc',
		'arrow',
		'shp',
		'aac',
		'mp1',
		'it',
		's3m',
		'xm',
		'ai'
	],
	mimeTypes: [
		'image/jpeg',
		'image/png',
		'image/gif',
		'image/webp',
		'image/flif',
		'image/x-canon-cr2',
		'image/x-canon-cr3',
		'image/tiff',
		'image/bmp',
		'image/vnd.ms-photo',
		'image/vnd.adobe.photoshop',
		'application/epub+zip',
		'application/x-xpinstall',
		'application/vnd.oasis.opendocument.text',
		'application/vnd.oasis.opendocument.spreadsheet',
		'application/vnd.oasis.opendocument.presentation',
		'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
		'application/vnd.openxmlformats-officedocument.presentationml.presentation',
		'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
		'application/zip',
		'application/x-tar',
		'application/x-rar-compressed',
		'application/gzip',
		'application/x-bzip2',
		'application/x-7z-compressed',
		'application/x-apple-diskimage',
		'application/x-apache-arrow',
		'video/mp4',
		'audio/midi',
		'video/x-matroska',
		'video/webm',
		'video/quicktime',
		'video/vnd.avi',
		'audio/vnd.wave',
		'audio/qcelp',
		'audio/x-ms-wma',
		'video/x-ms-asf',
		'application/vnd.ms-asf',
		'video/mpeg',
		'video/3gpp',
		'audio/mpeg',
		'audio/mp4', // RFC 4337
		'audio/opus',
		'video/ogg',
		'audio/ogg',
		'application/ogg',
		'audio/x-flac',
		'audio/ape',
		'audio/wavpack',
		'audio/amr',
		'application/pdf',
		'application/x-msdownload',
		'application/x-shockwave-flash',
		'application/rtf',
		'application/wasm',
		'font/woff',
		'font/woff2',
		'application/vnd.ms-fontobject',
		'font/ttf',
		'font/otf',
		'image/x-icon',
		'video/x-flv',
		'application/postscript',
		'application/x-xz',
		'application/x-sqlite3',
		'application/x-nintendo-nes-rom',
		'application/x-google-chrome-extension',
		'application/vnd.ms-cab-compressed',
		'application/x-deb',
		'application/x-unix-archive',
		'application/x-rpm',
		'application/x-compress',
		'application/x-lzip',
		'application/x-msi',
		'application/x-mie',
		'application/mxf',
		'video/mp2t',
		'application/x-blender',
		'image/bpg',
		'image/jp2',
		'image/jpx',
		'image/jpm',
		'image/mj2',
		'audio/aiff',
		'application/xml',
		'application/x-mobipocket-ebook',
		'image/heif',
		'image/heif-sequence',
		'image/heic',
		'image/heic-sequence',
		'image/ktx',
		'application/dicom',
		'audio/x-musepack',
		'text/calendar',
		'model/gltf-binary',
		'application/vnd.tcpdump.pcap',
		'audio/x-dsf', // Non-standard
		'application/x.ms.shortcut', // Invented by us
		'application/x.apple.alias', // Invented by us
		'audio/x-voc',
		'audio/vnd.dolby.dd-raw',
		'audio/x-m4a',
		'image/apng',
		'image/x-olympus-orf',
		'image/x-sony-arw',
		'image/x-adobe-dng',
		'image/x-nikon-nef',
		'image/x-panasonic-rw2',
		'image/x-fujifilm-raf',
		'video/x-m4v',
		'video/3gpp2',
		'application/x-esri-shape',
		'audio/aac',
		'audio/x-it',
		'audio/x-s3m',
		'audio/x-xm',
		'video/MP1S',
		'video/MP2P'
	]
};

const {
	stringToBytes: stringToBytes$1,
	tarHeaderChecksumMatches: tarHeaderChecksumMatches$1,
	uint32SyncSafeToken: uint32SyncSafeToken$1,
	uint8ArrayUtf8ByteString: uint8ArrayUtf8ByteString$1
} = util$1;


const minimumBytes = 4100; // A fair amount of file-types are detectable within this range

async function fromStream(stream) {
	const tokenizer = await core.fromStream(stream);
	try {
		return await fromTokenizer(tokenizer);
	} finally {
		await tokenizer.close();
	}
}

async function fromBuffer(input) {
	if (!(input instanceof Uint8Array || input instanceof ArrayBuffer || Buffer.isBuffer(input))) {
		throw new TypeError(`Expected the \`input\` argument to be of type \`Uint8Array\` or \`Buffer\` or \`ArrayBuffer\`, got \`${typeof input}\``);
	}

	const buffer = input instanceof Buffer ? input : Buffer.from(input);

	if (!(buffer && buffer.length > 1)) {
		return;
	}

	const tokenizer = core.fromBuffer(buffer);
	return fromTokenizer(tokenizer);
}

function _check(buffer, headers, options) {
	options = {
		offset: 0,
		...options
	};

	for (const [index, header] of headers.entries()) {
		// If a bitmask is set
		if (options.mask) {
			// If header doesn't equal `buf` with bits masked off
			if (header !== (options.mask[index] & buffer[index + options.offset])) {
				return false;
			}
		} else if (header !== buffer[index + options.offset]) {
			return false;
		}
	}

	return true;
}

async function _checkSequence(sequence, tokenizer, ignoreBytes) {
	const buffer = Buffer.alloc(minimumBytes);
	await tokenizer.ignore(ignoreBytes);

	await tokenizer.peekBuffer(buffer, {mayBeLess: true});

	return buffer.includes(Buffer.from(sequence));
}

async function fromTokenizer(tokenizer) {
	try {
		return _fromTokenizer(tokenizer);
	} catch (error) {
		if (!(error instanceof core.EndOfStreamError)) {
			throw error;
		}
	}
}

async function _fromTokenizer(tokenizer) {
	let buffer = Buffer.alloc(minimumBytes);
	const bytesRead = 12;
	const check = (header, options) => _check(buffer, header, options);
	const checkString = (header, options) => check(stringToBytes$1(header), options);
	const checkSequence = (sequence, ignoreBytes) => _checkSequence(sequence, tokenizer, ignoreBytes);

	// Keep reading until EOF if the file size is unknown.
	if (!tokenizer.fileInfo.size) {
		tokenizer.fileInfo.size = Number.MAX_SAFE_INTEGER;
	}

	await tokenizer.peekBuffer(buffer, {length: bytesRead, mayBeLess: true});

	// -- 2-byte signatures --

	if (check([0x42, 0x4D])) {
		return {
			ext: 'bmp',
			mime: 'image/bmp'
		};
	}

	if (check([0x0B, 0x77])) {
		return {
			ext: 'ac3',
			mime: 'audio/vnd.dolby.dd-raw'
		};
	}

	if (check([0x78, 0x01])) {
		return {
			ext: 'dmg',
			mime: 'application/x-apple-diskimage'
		};
	}

	if (check([0x4D, 0x5A])) {
		return {
			ext: 'exe',
			mime: 'application/x-msdownload'
		};
	}

	if (check([0x25, 0x21])) {
		return {
			ext: 'ps',
			mime: 'application/postscript'
		};
	}

	if (
		check([0x1F, 0xA0]) ||
		check([0x1F, 0x9D])
	) {
		return {
			ext: 'Z',
			mime: 'application/x-compress'
		};
	}

	// -- 3-byte signatures --

	if (check([0xFF, 0xD8, 0xFF])) {
		return {
			ext: 'jpg',
			mime: 'image/jpeg'
		};
	}

	if (check([0x49, 0x49, 0xBC])) {
		return {
			ext: 'jxr',
			mime: 'image/vnd.ms-photo'
		};
	}

	if (check([0x1F, 0x8B, 0x8])) {
		return {
			ext: 'gz',
			mime: 'application/gzip'
		};
	}

	if (check([0x42, 0x5A, 0x68])) {
		return {
			ext: 'bz2',
			mime: 'application/x-bzip2'
		};
	}

	if (checkString('ID3')) {
		await tokenizer.ignore(6); // Skip ID3 header until the header size
		const id3HeaderLen = await tokenizer.readToken(uint32SyncSafeToken$1);
		if (tokenizer.position + id3HeaderLen > tokenizer.fileInfo.size) {
			// Guess file type based on ID3 header for backward compatibility
			return {
				ext: 'mp3',
				mime: 'audio/mpeg'
			};
		}

		await tokenizer.ignore(id3HeaderLen);
		return fromTokenizer(tokenizer); // Skip ID3 header, recursion
	}

	// Musepack, SV7
	if (checkString('MP+')) {
		return {
			ext: 'mpc',
			mime: 'audio/x-musepack'
		};
	}

	if (
		(buffer[0] === 0x43 || buffer[0] === 0x46) &&
		check([0x57, 0x53], {offset: 1})
	) {
		return {
			ext: 'swf',
			mime: 'application/x-shockwave-flash'
		};
	}

	// -- 4-byte signatures --

	if (check([0x47, 0x49, 0x46])) {
		return {
			ext: 'gif',
			mime: 'image/gif'
		};
	}

	if (checkString('FLIF')) {
		return {
			ext: 'flif',
			mime: 'image/flif'
		};
	}

	if (checkString('8BPS')) {
		return {
			ext: 'psd',
			mime: 'image/vnd.adobe.photoshop'
		};
	}

	if (checkString('WEBP', {offset: 8})) {
		return {
			ext: 'webp',
			mime: 'image/webp'
		};
	}

	// Musepack, SV8
	if (checkString('MPCK')) {
		return {
			ext: 'mpc',
			mime: 'audio/x-musepack'
		};
	}

	if (checkString('FORM')) {
		return {
			ext: 'aif',
			mime: 'audio/aiff'
		};
	}

	// Zip-based file formats
	// Need to be before the `zip` check
	if (check([0x50, 0x4B, 0x3, 0x4])) { // Local file header signature
		try {
			while (tokenizer.position + 30 < tokenizer.fileInfo.size) {
				await tokenizer.readBuffer(buffer, {length: 30});

				// https://en.wikipedia.org/wiki/Zip_(file_format)#File_headers
				const zipHeader = {
					compressedSize: buffer.readUInt32LE(18),
					uncompressedSize: buffer.readUInt32LE(22),
					filenameLength: buffer.readUInt16LE(26),
					extraFieldLength: buffer.readUInt16LE(28)
				};

				zipHeader.filename = await tokenizer.readToken(new lib$3.StringType(zipHeader.filenameLength, 'utf-8'));
				await tokenizer.ignore(zipHeader.extraFieldLength);

				// Assumes signed `.xpi` from addons.mozilla.org
				if (zipHeader.filename === 'META-INF/mozilla.rsa') {
					return {
						ext: 'xpi',
						mime: 'application/x-xpinstall'
					};
				}

				if (zipHeader.filename.endsWith('.rels') || zipHeader.filename.endsWith('.xml')) {
					const type = zipHeader.filename.split('/')[0];
					switch (type) {
						case '_rels':
							break;
						case 'word':
							return {
								ext: 'docx',
								mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
							};
						case 'ppt':
							return {
								ext: 'pptx',
								mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
							};
						case 'xl':
							return {
								ext: 'xlsx',
								mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
							};
						default:
							break;
					}
				}

				if (zipHeader.filename.startsWith('xl/')) {
					return {
						ext: 'xlsx',
						mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
					};
				}

				// The docx, xlsx and pptx file types extend the Office Open XML file format:
				// https://en.wikipedia.org/wiki/Office_Open_XML_file_formats
				// We look for:
				// - one entry named '[Content_Types].xml' or '_rels/.rels',
				// - one entry indicating specific type of file.
				// MS Office, OpenOffice and LibreOffice may put the parts in different order, so the check should not rely on it.
				if (zipHeader.filename === 'mimetype' && zipHeader.compressedSize === zipHeader.uncompressedSize) {
					const mimeType = await tokenizer.readToken(new lib$3.StringType(zipHeader.compressedSize, 'utf-8'));

					switch (mimeType) {
						case 'application/epub+zip':
							return {
								ext: 'epub',
								mime: 'application/epub+zip'
							};
						case 'application/vnd.oasis.opendocument.text':
							return {
								ext: 'odt',
								mime: 'application/vnd.oasis.opendocument.text'
							};
						case 'application/vnd.oasis.opendocument.spreadsheet':
							return {
								ext: 'ods',
								mime: 'application/vnd.oasis.opendocument.spreadsheet'
							};
						case 'application/vnd.oasis.opendocument.presentation':
							return {
								ext: 'odp',
								mime: 'application/vnd.oasis.opendocument.presentation'
							};
						default:
					}
				}

				await tokenizer.ignore(zipHeader.compressedSize);
			}
		} catch (error) {
			if (!(error instanceof core.EndOfStreamError)) {
				throw error;
			}
		}

		return {
			ext: 'zip',
			mime: 'application/zip'
		};
	}

	if (checkString('OggS')) {
		// This is an OGG container
		await tokenizer.ignore(28);
		const type = Buffer.alloc(8);
		await tokenizer.readBuffer(type);

		// Needs to be before `ogg` check
		if (_check(type, [0x4F, 0x70, 0x75, 0x73, 0x48, 0x65, 0x61, 0x64])) {
			return {
				ext: 'opus',
				mime: 'audio/opus'
			};
		}

		// If ' theora' in header.
		if (_check(type, [0x80, 0x74, 0x68, 0x65, 0x6F, 0x72, 0x61])) {
			return {
				ext: 'ogv',
				mime: 'video/ogg'
			};
		}

		// If '\x01video' in header.
		if (_check(type, [0x01, 0x76, 0x69, 0x64, 0x65, 0x6F, 0x00])) {
			return {
				ext: 'ogm',
				mime: 'video/ogg'
			};
		}

		// If ' FLAC' in header  https://xiph.org/flac/faq.html
		if (_check(type, [0x7F, 0x46, 0x4C, 0x41, 0x43])) {
			return {
				ext: 'oga',
				mime: 'audio/ogg'
			};
		}

		// 'Speex  ' in header https://en.wikipedia.org/wiki/Speex
		if (_check(type, [0x53, 0x70, 0x65, 0x65, 0x78, 0x20, 0x20])) {
			return {
				ext: 'spx',
				mime: 'audio/ogg'
			};
		}

		// If '\x01vorbis' in header
		if (_check(type, [0x01, 0x76, 0x6F, 0x72, 0x62, 0x69, 0x73])) {
			return {
				ext: 'ogg',
				mime: 'audio/ogg'
			};
		}

		// Default OGG container https://www.iana.org/assignments/media-types/application/ogg
		return {
			ext: 'ogx',
			mime: 'application/ogg'
		};
	}

	if (
		check([0x50, 0x4B]) &&
		(buffer[2] === 0x3 || buffer[2] === 0x5 || buffer[2] === 0x7) &&
		(buffer[3] === 0x4 || buffer[3] === 0x6 || buffer[3] === 0x8)
	) {
		return {
			ext: 'zip',
			mime: 'application/zip'
		};
	}

	//

	// File Type Box (https://en.wikipedia.org/wiki/ISO_base_media_file_format)
	// It's not required to be first, but it's recommended to be. Almost all ISO base media files start with `ftyp` box.
	// `ftyp` box must contain a brand major identifier, which must consist of ISO 8859-1 printable characters.
	// Here we check for 8859-1 printable characters (for simplicity, it's a mask which also catches one non-printable character).
	if (
		checkString('ftyp', {offset: 4}) &&
		(buffer[8] & 0x60) !== 0x00 // Brand major, first character ASCII?
	) {
		// They all can have MIME `video/mp4` except `application/mp4` special-case which is hard to detect.
		// For some cases, we're specific, everything else falls to `video/mp4` with `mp4` extension.
		const brandMajor = uint8ArrayUtf8ByteString$1(buffer, 8, 12).replace('\0', ' ').trim();
		switch (brandMajor) {
			case 'mif1':
				return {ext: 'heic', mime: 'image/heif'};
			case 'msf1':
				return {ext: 'heic', mime: 'image/heif-sequence'};
			case 'heic':
			case 'heix':
				return {ext: 'heic', mime: 'image/heic'};
			case 'hevc':
			case 'hevx':
				return {ext: 'heic', mime: 'image/heic-sequence'};
			case 'qt':
				return {ext: 'mov', mime: 'video/quicktime'};
			case 'M4V':
			case 'M4VH':
			case 'M4VP':
				return {ext: 'm4v', mime: 'video/x-m4v'};
			case 'M4P':
				return {ext: 'm4p', mime: 'video/mp4'};
			case 'M4B':
				return {ext: 'm4b', mime: 'audio/mp4'};
			case 'M4A':
				return {ext: 'm4a', mime: 'audio/x-m4a'};
			case 'F4V':
				return {ext: 'f4v', mime: 'video/mp4'};
			case 'F4P':
				return {ext: 'f4p', mime: 'video/mp4'};
			case 'F4A':
				return {ext: 'f4a', mime: 'audio/mp4'};
			case 'F4B':
				return {ext: 'f4b', mime: 'audio/mp4'};
			case 'crx':
				return {ext: 'cr3', mime: 'image/x-canon-cr3'};
			default:
				if (brandMajor.startsWith('3g')) {
					if (brandMajor.startsWith('3g2')) {
						return {ext: '3g2', mime: 'video/3gpp2'};
					}

					return {ext: '3gp', mime: 'video/3gpp'};
				}

				return {ext: 'mp4', mime: 'video/mp4'};
		}
	}

	if (checkString('MThd')) {
		return {
			ext: 'mid',
			mime: 'audio/midi'
		};
	}

	if (
		checkString('wOFF') &&
		(
			check([0x00, 0x01, 0x00, 0x00], {offset: 4}) ||
			checkString('OTTO', {offset: 4})
		)
	) {
		return {
			ext: 'woff',
			mime: 'font/woff'
		};
	}

	if (
		checkString('wOF2') &&
		(
			check([0x00, 0x01, 0x00, 0x00], {offset: 4}) ||
			checkString('OTTO', {offset: 4})
		)
	) {
		return {
			ext: 'woff2',
			mime: 'font/woff2'
		};
	}

	if (check([0xD4, 0xC3, 0xB2, 0xA1]) || check([0xA1, 0xB2, 0xC3, 0xD4])) {
		return {
			ext: 'pcap',
			mime: 'application/vnd.tcpdump.pcap'
		};
	}

	// Sony DSD Stream File (DSF)
	if (checkString('DSD ')) {
		return {
			ext: 'dsf',
			mime: 'audio/x-dsf' // Non-standard
		};
	}

	if (checkString('LZIP')) {
		return {
			ext: 'lz',
			mime: 'application/x-lzip'
		};
	}

	if (checkString('fLaC')) {
		return {
			ext: 'flac',
			mime: 'audio/x-flac'
		};
	}

	if (check([0x42, 0x50, 0x47, 0xFB])) {
		return {
			ext: 'bpg',
			mime: 'image/bpg'
		};
	}

	if (checkString('wvpk')) {
		return {
			ext: 'wv',
			mime: 'audio/wavpack'
		};
	}

	if (checkString('%PDF')) {
		// Check if this is an Adobe Illustrator file
		const isAiFile = await checkSequence('Adobe Illustrator', 1350);
		if (isAiFile) {
			return {
				ext: 'ai',
				mime: 'application/postscript'
			};
		}

		// Assume this is just a normal PDF
		return {
			ext: 'pdf',
			mime: 'application/pdf'
		};
	}

	if (check([0x00, 0x61, 0x73, 0x6D])) {
		return {
			ext: 'wasm',
			mime: 'application/wasm'
		};
	}

	// TIFF, little-endian type
	if (check([0x49, 0x49, 0x2A, 0x0])) {
		if (checkString('CR', {offset: 8})) {
			return {
				ext: 'cr2',
				mime: 'image/x-canon-cr2'
			};
		}

		if (check([0x1C, 0x00, 0xFE, 0x00], {offset: 8}) || check([0x1F, 0x00, 0x0B, 0x00], {offset: 8})) {
			return {
				ext: 'nef',
				mime: 'image/x-nikon-nef'
			};
		}

		if (
			check([0x08, 0x00, 0x00, 0x00], {offset: 4}) &&
			(check([0x2D, 0x00, 0xFE, 0x00], {offset: 8}) ||
				check([0x27, 0x00, 0xFE, 0x00], {offset: 8}))
		) {
			return {
				ext: 'dng',
				mime: 'image/x-adobe-dng'
			};
		}

		buffer = Buffer.alloc(24);
		await tokenizer.peekBuffer(buffer);
		if (
			(check([0x10, 0xFB, 0x86, 0x01], {offset: 4}) || check([0x08, 0x00, 0x00, 0x00], {offset: 4})) &&
			// This pattern differentiates ARW from other TIFF-ish file types:
			check([0x00, 0xFE, 0x00, 0x04, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x03, 0x01], {offset: 9})
		) {
			return {
				ext: 'arw',
				mime: 'image/x-sony-arw'
			};
		}

		return {
			ext: 'tif',
			mime: 'image/tiff'
		};
	}

	// TIFF, big-endian type
	if (check([0x4D, 0x4D, 0x0, 0x2A])) {
		return {
			ext: 'tif',
			mime: 'image/tiff'
		};
	}

	if (checkString('MAC ')) {
		return {
			ext: 'ape',
			mime: 'audio/ape'
		};
	}

	// https://github.com/threatstack/libmagic/blob/master/magic/Magdir/matroska
	if (check([0x1A, 0x45, 0xDF, 0xA3])) { // Root element: EBML
		async function readField() {
			const msb = await tokenizer.peekNumber(lib$3.UINT8);
			let mask = 0x80;
			let ic = 0; // 0 = A, 1 = B, 2 = C, 3 = D

			while ((msb & mask) === 0) {
				++ic;
				mask >>= 1;
			}

			const id = Buffer.alloc(ic + 1);
			await tokenizer.readBuffer(id);
			return id;
		}

		async function readElement() {
			const id = await readField();
			const lenField = await readField();
			lenField[0] ^= 0x80 >> (lenField.length - 1);
			const nrLen = Math.min(6, lenField.length); // JavaScript can max read 6 bytes integer
			return {
				id: id.readUIntBE(0, id.length),
				len: lenField.readUIntBE(lenField.length - nrLen, nrLen)
			};
		}

		async function readChildren(level, children) {
			while (children > 0) {
				const e = await readElement();
				if (e.id === 0x4282) {
					return tokenizer.readToken(new lib$3.StringType(e.len, 'utf-8')); // Return DocType
				}

				await tokenizer.ignore(e.len); // ignore payload
				--children;
			}
		}

		const re = await readElement();
		const docType = await readChildren(1, re.len);

		switch (docType) {
			case 'webm':
				return {
					ext: 'webm',
					mime: 'video/webm'
				};

			case 'matroska':
				return {
					ext: 'mkv',
					mime: 'video/x-matroska'
				};

			default:
				return;
		}
	}

	// RIFF file format which might be AVI, WAV, QCP, etc
	if (check([0x52, 0x49, 0x46, 0x46])) {
		if (check([0x41, 0x56, 0x49], {offset: 8})) {
			return {
				ext: 'avi',
				mime: 'video/vnd.avi'
			};
		}

		if (check([0x57, 0x41, 0x56, 0x45], {offset: 8})) {
			return {
				ext: 'wav',
				mime: 'audio/vnd.wave'
			};
		}

		// QLCM, QCP file
		if (check([0x51, 0x4C, 0x43, 0x4D], {offset: 8})) {
			return {
				ext: 'qcp',
				mime: 'audio/qcelp'
			};
		}
	}

	if (checkString('SQLi')) {
		return {
			ext: 'sqlite',
			mime: 'application/x-sqlite3'
		};
	}

	if (check([0x4E, 0x45, 0x53, 0x1A])) {
		return {
			ext: 'nes',
			mime: 'application/x-nintendo-nes-rom'
		};
	}

	if (checkString('Cr24')) {
		return {
			ext: 'crx',
			mime: 'application/x-google-chrome-extension'
		};
	}

	if (
		checkString('MSCF') ||
		checkString('ISc(')
	) {
		return {
			ext: 'cab',
			mime: 'application/vnd.ms-cab-compressed'
		};
	}

	if (check([0xED, 0xAB, 0xEE, 0xDB])) {
		return {
			ext: 'rpm',
			mime: 'application/x-rpm'
		};
	}

	// -- 5-byte signatures --

	if (check([0x4F, 0x54, 0x54, 0x4F, 0x00])) {
		return {
			ext: 'otf',
			mime: 'font/otf'
		};
	}

	if (checkString('#!AMR')) {
		return {
			ext: 'amr',
			mime: 'audio/amr'
		};
	}

	if (checkString('{\\rtf')) {
		return {
			ext: 'rtf',
			mime: 'application/rtf'
		};
	}

	if (check([0x46, 0x4C, 0x56, 0x01])) {
		return {
			ext: 'flv',
			mime: 'video/x-flv'
		};
	}

	if (checkString('IMPM')) {
		return {
			ext: 'it',
			mime: 'audio/x-it'
		};
	}

	// MPEG program stream (PS or MPEG-PS)
	if (check([0x00, 0x00, 0x01, 0xBA])) {
		//  MPEG-PS, MPEG-1 Part 1
		if (check([0x21], {offset: 4, mask: [0xF1]})) {
			return {
				ext: 'mpg', // May also be .ps, .mpeg
				mime: 'video/MP1S'
			};
		}

		// MPEG-PS, MPEG-2 Part 1
		if (check([0x44], {offset: 4, mask: [0xC4]})) {
			return {
				ext: 'mpg', // May also be .mpg, .m2p, .vob or .sub
				mime: 'video/MP2P'
			};
		}
	}

	// -- 6-byte signatures --

	if (check([0xFD, 0x37, 0x7A, 0x58, 0x5A, 0x00])) {
		return {
			ext: 'xz',
			mime: 'application/x-xz'
		};
	}

	if (checkString('<?xml ')) {
		return {
			ext: 'xml',
			mime: 'application/xml'
		};
	}

	if (checkString('BEGIN:')) {
		return {
			ext: 'ics',
			mime: 'text/calendar'
		};
	}

	if (check([0x37, 0x7A, 0xBC, 0xAF, 0x27, 0x1C])) {
		return {
			ext: '7z',
			mime: 'application/x-7z-compressed'
		};
	}

	if (
		check([0x52, 0x61, 0x72, 0x21, 0x1A, 0x7]) &&
		(buffer[6] === 0x0 || buffer[6] === 0x1)
	) {
		return {
			ext: 'rar',
			mime: 'application/x-rar-compressed'
		};
	}

	// -- 7-byte signatures --

	if (checkString('BLENDER')) {
		return {
			ext: 'blend',
			mime: 'application/x-blender'
		};
	}

	if (checkString('!<arch>')) {
		await tokenizer.ignore(8);
		const str = await tokenizer.readToken(new lib$3.StringType(13, 'ascii'));
		if (str === 'debian-binary') {
			return {
				ext: 'deb',
				mime: 'application/x-deb'
			};
		}

		return {
			ext: 'ar',
			mime: 'application/x-unix-archive'
		};
	}

	// -- 8-byte signatures --

	if (check([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])) {
		// APNG format (https://wiki.mozilla.org/APNG_Specification)
		// 1. Find the first IDAT (image data) chunk (49 44 41 54)
		// 2. Check if there is an "acTL" chunk before the IDAT one (61 63 54 4C)

		// Offset calculated as follows:
		// - 8 bytes: PNG signature
		// - 4 (length) + 4 (chunk type) + 13 (chunk data) + 4 (CRC): IHDR chunk

		await tokenizer.ignore(8); // ignore PNG signature

		async function readChunkHeader() {
			return {
				length: await tokenizer.readToken(lib$3.INT32_BE),
				type: await tokenizer.readToken(new lib$3.StringType(4, 'binary'))
			};
		}

		do {
			const chunk = await readChunkHeader();
			switch (chunk.type) {
				case 'IDAT':
					return {
						ext: 'png',
						mime: 'image/png'
					};
				case 'acTL':
					return {
						ext: 'apng',
						mime: 'image/apng'
					};
				default:
					await tokenizer.ignore(chunk.length + 4); // Ignore chunk-data + CRC
			}
		} while (tokenizer.position < tokenizer.fileInfo.size);

		return {
			ext: 'png',
			mime: 'image/png'
		};
	}

	if (check([0x41, 0x52, 0x52, 0x4F, 0x57, 0x31, 0x00, 0x00])) {
		return {
			ext: 'arrow',
			mime: 'application/x-apache-arrow'
		};
	}

	if (check([0x67, 0x6C, 0x54, 0x46, 0x02, 0x00, 0x00, 0x00])) {
		return {
			ext: 'glb',
			mime: 'model/gltf-binary'
		};
	}

	// `mov` format variants
	if (
		check([0x66, 0x72, 0x65, 0x65], {offset: 4}) || // `free`
		check([0x6D, 0x64, 0x61, 0x74], {offset: 4}) || // `mdat` MJPEG
		check([0x6D, 0x6F, 0x6F, 0x76], {offset: 4}) || // `moov`
		check([0x77, 0x69, 0x64, 0x65], {offset: 4}) // `wide`
	) {
		return {
			ext: 'mov',
			mime: 'video/quicktime'
		};
	}

	// -- 9-byte signatures --

	if (check([0x49, 0x49, 0x52, 0x4F, 0x08, 0x00, 0x00, 0x00, 0x18])) {
		return {
			ext: 'orf',
			mime: 'image/x-olympus-orf'
		};
	}

	// -- 12-byte signatures --

	if (check([0x49, 0x49, 0x55, 0x00, 0x18, 0x00, 0x00, 0x00, 0x88, 0xE7, 0x74, 0xD8])) {
		return {
			ext: 'rw2',
			mime: 'image/x-panasonic-rw2'
		};
	}

	// ASF_Header_Object first 80 bytes
	if (check([0x30, 0x26, 0xB2, 0x75, 0x8E, 0x66, 0xCF, 0x11, 0xA6, 0xD9])) {
		async function readHeader() {
			const guid = Buffer.alloc(16);
			await tokenizer.readBuffer(guid);
			return {
				id: guid,
				size: await tokenizer.readToken(lib$3.UINT64_LE)
			};
		}

		await tokenizer.ignore(30);
		// Search for header should be in first 1KB of file.
		while (tokenizer.position + 24 < tokenizer.fileInfo.size) {
			const header = await readHeader();
			let payload = header.size - 24;
			if (_check(header.id, [0x91, 0x07, 0xDC, 0xB7, 0xB7, 0xA9, 0xCF, 0x11, 0x8E, 0xE6, 0x00, 0xC0, 0x0C, 0x20, 0x53, 0x65])) {
				// Sync on Stream-Properties-Object (B7DC0791-A9B7-11CF-8EE6-00C00C205365)
				const typeId = Buffer.alloc(16);
				payload -= await tokenizer.readBuffer(typeId);

				if (_check(typeId, [0x40, 0x9E, 0x69, 0xF8, 0x4D, 0x5B, 0xCF, 0x11, 0xA8, 0xFD, 0x00, 0x80, 0x5F, 0x5C, 0x44, 0x2B])) {
					// Found audio:
					return {
						ext: 'wma',
						mime: 'audio/x-ms-wma'
					};
				}

				if (_check(typeId, [0xC0, 0xEF, 0x19, 0xBC, 0x4D, 0x5B, 0xCF, 0x11, 0xA8, 0xFD, 0x00, 0x80, 0x5F, 0x5C, 0x44, 0x2B])) {
					// Found video:
					return {
						ext: 'wmv',
						mime: 'video/x-ms-asf'
					};
				}

				break;
			}

			await tokenizer.ignore(payload);
		}

		// Default to ASF generic extension
		return {
			ext: 'asf',
			mime: 'application/vnd.ms-asf'
		};
	}

	if (check([0xAB, 0x4B, 0x54, 0x58, 0x20, 0x31, 0x31, 0xBB, 0x0D, 0x0A, 0x1A, 0x0A])) {
		return {
			ext: 'ktx',
			mime: 'image/ktx'
		};
	}

	if ((check([0x7E, 0x10, 0x04]) || check([0x7E, 0x18, 0x04])) && check([0x30, 0x4D, 0x49, 0x45], {offset: 4})) {
		return {
			ext: 'mie',
			mime: 'application/x-mie'
		};
	}

	if (check([0x27, 0x0A, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00], {offset: 2})) {
		return {
			ext: 'shp',
			mime: 'application/x-esri-shape'
		};
	}

	if (check([0x00, 0x00, 0x00, 0x0C, 0x6A, 0x50, 0x20, 0x20, 0x0D, 0x0A, 0x87, 0x0A])) {
		// JPEG-2000 family

		await tokenizer.ignore(20);
		const type = await tokenizer.readToken(new lib$3.StringType(4, 'ascii'));
		switch (type) {
			case 'jp2 ':
				return {
					ext: 'jp2',
					mime: 'image/jp2'
				};
			case 'jpx ':
				return {
					ext: 'jpx',
					mime: 'image/jpx'
				};
			case 'jpm ':
				return {
					ext: 'jpm',
					mime: 'image/jpm'
				};
			case 'mjp2':
				return {
					ext: 'mj2',
					mime: 'image/mj2'
				};
			default:
				return;
		}
	}

	// -- Unsafe signatures --

	if (
		check([0x0, 0x0, 0x1, 0xBA]) ||
		check([0x0, 0x0, 0x1, 0xB3])
	) {
		return {
			ext: 'mpg',
			mime: 'video/mpeg'
		};
	}

	if (check([0x00, 0x01, 0x00, 0x00, 0x00])) {
		return {
			ext: 'ttf',
			mime: 'font/ttf'
		};
	}

	if (check([0x00, 0x00, 0x01, 0x00])) {
		return {
			ext: 'ico',
			mime: 'image/x-icon'
		};
	}

	if (check([0x00, 0x00, 0x02, 0x00])) {
		return {
			ext: 'cur',
			mime: 'image/x-icon'
		};
	}

	// Increase sample size from 12 to 256.
	await tokenizer.peekBuffer(buffer, {length: Math.min(256, tokenizer.fileInfo.size), mayBeLess: true});

	// `raf` is here just to keep all the raw image detectors together.
	if (checkString('FUJIFILMCCD-RAW')) {
		return {
			ext: 'raf',
			mime: 'image/x-fujifilm-raf'
		};
	}

	if (checkString('Extended Module:')) {
		return {
			ext: 'xm',
			mime: 'audio/x-xm'
		};
	}

	if (checkString('Creative Voice File')) {
		return {
			ext: 'voc',
			mime: 'audio/x-voc'
		};
	}

	if (
		check([0x30, 0x30, 0x30, 0x30, 0x30, 0x30], {offset: 148, mask: [0xF8, 0xF8, 0xF8, 0xF8, 0xF8, 0xF8]}) && // Valid tar checksum
		tarHeaderChecksumMatches$1(buffer)
	) {
		return {
			ext: 'tar',
			mime: 'application/x-tar'
		};
	}

	if (check([0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x3E])) {
		return {
			ext: 'msi',
			mime: 'application/x-msi'
		};
	}

	if (check([0x06, 0x0E, 0x2B, 0x34, 0x02, 0x05, 0x01, 0x01, 0x0D, 0x01, 0x02, 0x01, 0x01, 0x02])) {
		return {
			ext: 'mxf',
			mime: 'application/mxf'
		};
	}

	if (checkString('SCRM', {offset: 44})) {
		return {
			ext: 's3m',
			mime: 'audio/x-s3m'
		};
	}

	if (check([0x47], {offset: 4}) && (check([0x47], {offset: 192}) || check([0x47], {offset: 196}))) {
		return {
			ext: 'mts',
			mime: 'video/mp2t'
		};
	}

	if (check([0x42, 0x4F, 0x4F, 0x4B, 0x4D, 0x4F, 0x42, 0x49], {offset: 60})) {
		return {
			ext: 'mobi',
			mime: 'application/x-mobipocket-ebook'
		};
	}

	if (check([0x44, 0x49, 0x43, 0x4D], {offset: 128})) {
		return {
			ext: 'dcm',
			mime: 'application/dicom'
		};
	}

	if (check([0x4C, 0x00, 0x00, 0x00, 0x01, 0x14, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0xC0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x46])) {
		return {
			ext: 'lnk',
			mime: 'application/x.ms.shortcut' // Invented by us
		};
	}

	if (check([0x62, 0x6F, 0x6F, 0x6B, 0x00, 0x00, 0x00, 0x00, 0x6D, 0x61, 0x72, 0x6B, 0x00, 0x00, 0x00, 0x00])) {
		return {
			ext: 'alias',
			mime: 'application/x.apple.alias' // Invented by us
		};
	}

	if (
		check([0x4C, 0x50], {offset: 34}) &&
		(
			check([0x00, 0x00, 0x01], {offset: 8}) ||
			check([0x01, 0x00, 0x02], {offset: 8}) ||
			check([0x02, 0x00, 0x02], {offset: 8})
		)
	) {
		return {
			ext: 'eot',
			mime: 'application/vnd.ms-fontobject'
		};
	}

	// Increase sample size from 256 to 512
	await tokenizer.peekBuffer(buffer, {length: Math.min(512, tokenizer.fileInfo.size), mayBeLess: true});

	if (
		check([0x30, 0x30, 0x30, 0x30, 0x30, 0x30], {offset: 148, mask: [0xF8, 0xF8, 0xF8, 0xF8, 0xF8, 0xF8]}) && // Valid tar checksum
		tarHeaderChecksumMatches$1(buffer)
	) {
		return {
			ext: 'tar',
			mime: 'application/x-tar'
		};
	}

	// Check for MPEG header at different starting offsets
	for (let start = 0; start < 2 && start < (buffer.length - 16); start++) {
		// Check MPEG 1 or 2 Layer 3 header, or 'layer 0' for ADTS (MPEG sync-word 0xFFE)
		if (buffer.length >= start + 2 && check([0xFF, 0xE0], {offset: start, mask: [0xFF, 0xE0]})) {
			if (check([0x10], {offset: start + 1, mask: [0x16]})) {
				// Check for (ADTS) MPEG-2
				if (check([0x08], {offset: start + 1, mask: [0x08]})) {
					return {
						ext: 'aac',
						mime: 'audio/aac'
					};
				}

				// Must be (ADTS) MPEG-4
				return {
					ext: 'aac',
					mime: 'audio/aac'
				};
			}

			// MPEG 1 or 2 Layer 3 header
			// Check for MPEG layer 3
			if (check([0x02], {offset: start + 1, mask: [0x06]})) {
				return {
					ext: 'mp3',
					mime: 'audio/mpeg'
				};
			}

			// Check for MPEG layer 2
			if (check([0x04], {offset: start + 1, mask: [0x06]})) {
				return {
					ext: 'mp2',
					mime: 'audio/mpeg'
				};
			}

			// Check for MPEG layer 1
			if (check([0x06], {offset: start + 1, mask: [0x06]})) {
				return {
					ext: 'mp1',
					mime: 'audio/mpeg'
				};
			}
		}
	}
}

const stream = readableStream => new Promise((resolve, reject) => {
	// Using `eval` to work around issues when bundling with Webpack
	const stream = eval('require')('stream'); // eslint-disable-line no-eval

	readableStream.on('error', reject);
	readableStream.once('readable', async () => {
		// Set up output stream
		const pass = new stream.PassThrough();
		let outputStream;
		if (stream.pipeline) {
			outputStream = stream.pipeline(readableStream, pass, () => {});
		} else {
			outputStream = readableStream.pipe(pass);
		}

		// Read the input stream and detect the filetype
		const chunk = readableStream.read(minimumBytes) || readableStream.read() || Buffer.alloc(0);
		try {
			const fileType = await fromBuffer(chunk);
			pass.fileType = fileType;
		} catch (error) {
			reject(error);
		}

		resolve(outputStream);
	});
});

const fileType = {
	fromStream,
	fromTokenizer,
	fromBuffer,
	stream
};

Object.defineProperty(fileType, 'extensions', {
	get() {
		return new Set(supported.extensions);
	}
});

Object.defineProperty(fileType, 'mimeTypes', {
	get() {
		return new Set(supported.mimeTypes);
	}
});

var core$1 = fileType;

async function fromFile(path) {
	const tokenizer = await lib$2.fromFile(path);
	try {
		return await core$1.fromTokenizer(tokenizer);
	} finally {
		await tokenizer.close();
	}
}

const fileType$1 = {
	fromFile
};

Object.assign(fileType$1, core$1);

Object.defineProperty(fileType$1, 'extensions', {
	get() {
		return core$1.extensions;
	}
});

Object.defineProperty(fileType$1, 'mimeTypes', {
	get() {
		return core$1.mimeTypes;
	}
});

var fileType_1 = fileType$1;

const { fetchBuffer: fetchBuffer$1 } = fetch$2;


const { promisify: promisify$3 } = util$2;
const { resolve } = path;

const { app: app$1 } = electron;
const mkdir = promisify$3(fs.mkdir);
const writeFile = promisify$3(fs.writeFile);

const createHash = (url) => {
  const hash = crypto.createHash('md5').update(url).digest('base64');
  return hash.replace('==', '2').replace('=', '1')
};

/**
 * Fetches and image, writes it to disk, and returns a filepath
 * @param {string} url
 * @return {string} filepath
 */
const download = async (url) => {
  const buffer = await fetchBuffer$1(url);
  const { ext } = await fileType_1.fromBuffer(buffer);
  const filename = `artwork_${createHash(url)}.${ext}`;
  const appPath = app$1.getPath('appData');
  const path = resolve(`${appPath}`, 'Galeri', filename);

  try {
    await mkdir(resolve(appPath, 'Galeri'));
  } catch (err) {}

  await writeFile(path, buffer);

  return path
};

var image = {
  image: {
    download
  }
};
var image_1 = image.image;

var image$1 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	'default': image,
	__moduleExports: image,
	image: image_1
});

var fetch$3 = getCjsExportFromNamespace(lib);

const { app: app$2, screen } = electron;
const { constructTray: constructTray$1 } = tray$1;
const { constructBackground: constructBackground$1 } = background$1;
const { image: image$2 } = image$1;

globalThis.fetch = fetch$3;

app$2.requestSingleInstanceLock();

if (app$2.dock) app$2.dock.hide();

app$2.on('ready', async () => {
  let timerId = -1;

  const setArtwork = async (artObject) => {
    const imgPath = await image$2.download(artObject.src);
    console.log(imgPath);
    const response = await wallpaper_1.set(imgPath);
    console.log(response);
  };

  const replaceArtwork = async () => {
    const artObject = await background.next();
    await setArtwork(artObject);
  };

  const initTimer = () => {
    if (timerId) clearTimeout(timerId);

    timerId = setTimeout(() => {
      setArtwork();
      initTimer();
    }, 3 * 1000 * 60 * 60);
  };

  try {
    console.log(await wallpaper_1.get());
  } catch (err) {
    console.log(err);
  }
  
  const background = constructBackground$1(screen);
  const artObject = await background.ready();

  try {
    await setArtwork(artObject);
  } catch (err) {
    console.log(err);
  }
  

  constructTray$1({
    artObject,
    events: {
      replaceArtwork,
      onToggleBackground: () => {},
      onToggleScreenSaver: () => {},
      onToggleStartup: () => app$2.setLoginItemSettings({
        openAtLogin: !app$2.getLoginItemSettings().openAtLogin
      }),
      onQuit: () => app$2.quit()
    }
  });

  initTimer();
});
