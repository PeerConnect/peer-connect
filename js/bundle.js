(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
(function(e){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=e()}else if(typeof define==="function"&&define.amd){define([],e)}else{var t;if(typeof window!=="undefined"){t=window}else if(typeof global!=="undefined"){t=global}else if(typeof self!=="undefined"){t=self}else{t=this}t.SimplePeer=e()}})(function(){var e,t,r;return function e(t,r,n){function i(s,a){if(!r[s]){if(!t[s]){var f=typeof require=="function"&&require;if(!a&&f)return f(s,!0);if(o)return o(s,!0);var u=new Error("Cannot find module '"+s+"'");throw u.code="MODULE_NOT_FOUND",u}var l=r[s]={exports:{}};t[s][0].call(l.exports,function(e){var r=t[s][1][e];return i(r?r:e)},l,l.exports,e,t,r,n)}return r[s].exports}var o=typeof require=="function"&&require;for(var s=0;s<n.length;s++)i(n[s]);return i}({1:[function(e,t,r){"use strict";r.byteLength=l;r.toByteArray=c;r.fromByteArray=p;var n=[];var i=[];var o=typeof Uint8Array!=="undefined"?Uint8Array:Array;var s="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";for(var a=0,f=s.length;a<f;++a){n[a]=s[a];i[s.charCodeAt(a)]=a}i["-".charCodeAt(0)]=62;i["_".charCodeAt(0)]=63;function u(e){var t=e.length;if(t%4>0){throw new Error("Invalid string. Length must be a multiple of 4")}return e[t-2]==="="?2:e[t-1]==="="?1:0}function l(e){return e.length*3/4-u(e)}function c(e){var t,r,n,s,a;var f=e.length;s=u(e);a=new o(f*3/4-s);r=s>0?f-4:f;var l=0;for(t=0;t<r;t+=4){n=i[e.charCodeAt(t)]<<18|i[e.charCodeAt(t+1)]<<12|i[e.charCodeAt(t+2)]<<6|i[e.charCodeAt(t+3)];a[l++]=n>>16&255;a[l++]=n>>8&255;a[l++]=n&255}if(s===2){n=i[e.charCodeAt(t)]<<2|i[e.charCodeAt(t+1)]>>4;a[l++]=n&255}else if(s===1){n=i[e.charCodeAt(t)]<<10|i[e.charCodeAt(t+1)]<<4|i[e.charCodeAt(t+2)]>>2;a[l++]=n>>8&255;a[l++]=n&255}return a}function h(e){return n[e>>18&63]+n[e>>12&63]+n[e>>6&63]+n[e&63]}function d(e,t,r){var n;var i=[];for(var o=t;o<r;o+=3){n=(e[o]<<16)+(e[o+1]<<8)+e[o+2];i.push(h(n))}return i.join("")}function p(e){var t;var r=e.length;var i=r%3;var o="";var s=[];var a=16383;for(var f=0,u=r-i;f<u;f+=a){s.push(d(e,f,f+a>u?u:f+a))}if(i===1){t=e[r-1];o+=n[t>>2];o+=n[t<<4&63];o+="=="}else if(i===2){t=(e[r-2]<<8)+e[r-1];o+=n[t>>10];o+=n[t>>4&63];o+=n[t<<2&63];o+="="}s.push(o);return s.join("")}},{}],2:[function(e,t,r){},{}],3:[function(e,t,r){"use strict";var n=e("base64-js");var i=e("ieee754");r.Buffer=f;r.SlowBuffer=m;r.INSPECT_MAX_BYTES=50;var o=2147483647;r.kMaxLength=o;f.TYPED_ARRAY_SUPPORT=s();if(!f.TYPED_ARRAY_SUPPORT&&typeof console!=="undefined"&&typeof console.error==="function"){console.error("This browser lacks typed array (Uint8Array) support which is required by "+"`buffer` v5.x. Use `buffer` v4.x if you require old browser support.")}function s(){try{var e=new Uint8Array(1);e.__proto__={__proto__:Uint8Array.prototype,foo:function(){return 42}};return e.foo()===42}catch(e){return false}}function a(e){if(e>o){throw new RangeError("Invalid typed array length")}var t=new Uint8Array(e);t.__proto__=f.prototype;return t}function f(e,t,r){if(typeof e==="number"){if(typeof t==="string"){throw new Error("If encoding is specified then the first argument must be a string")}return h(e)}return u(e,t,r)}if(typeof Symbol!=="undefined"&&Symbol.species&&f[Symbol.species]===f){Object.defineProperty(f,Symbol.species,{value:null,configurable:true,enumerable:false,writable:false})}f.poolSize=8192;function u(e,t,r){if(typeof e==="number"){throw new TypeError('"value" argument must not be a number')}if(X(e)){return g(e,t,r)}if(typeof e==="string"){return d(e,t)}return y(e)}f.from=function(e,t,r){return u(e,t,r)};f.prototype.__proto__=Uint8Array.prototype;f.__proto__=Uint8Array;function l(e){if(typeof e!=="number"){throw new TypeError('"size" argument must be a number')}else if(e<0){throw new RangeError('"size" argument must not be negative')}}function c(e,t,r){l(e);if(e<=0){return a(e)}if(t!==undefined){return typeof r==="string"?a(e).fill(t,r):a(e).fill(t)}return a(e)}f.alloc=function(e,t,r){return c(e,t,r)};function h(e){l(e);return a(e<0?0:v(e)|0)}f.allocUnsafe=function(e){return h(e)};f.allocUnsafeSlow=function(e){return h(e)};function d(e,t){if(typeof t!=="string"||t===""){t="utf8"}if(!f.isEncoding(t)){throw new TypeError('"encoding" must be a valid string encoding')}var r=b(e,t)|0;var n=a(r);var i=n.write(e,t);if(i!==r){n=n.slice(0,i)}return n}function p(e){var t=e.length<0?0:v(e.length)|0;var r=a(t);for(var n=0;n<t;n+=1){r[n]=e[n]&255}return r}function g(e,t,r){if(t<0||e.byteLength<t){throw new RangeError("'offset' is out of bounds")}if(e.byteLength<t+(r||0)){throw new RangeError("'length' is out of bounds")}var n;if(t===undefined&&r===undefined){n=new Uint8Array(e)}else if(r===undefined){n=new Uint8Array(e,t)}else{n=new Uint8Array(e,t,r)}n.__proto__=f.prototype;return n}function y(e){if(f.isBuffer(e)){var t=v(e.length)|0;var r=a(t);if(r.length===0){return r}e.copy(r,0,0,t);return r}if(e){if(K(e)||"length"in e){if(typeof e.length!=="number"||Q(e.length)){return a(0)}return p(e)}if(e.type==="Buffer"&&Array.isArray(e.data)){return p(e.data)}}throw new TypeError("First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.")}function v(e){if(e>=o){throw new RangeError("Attempt to allocate Buffer larger than maximum "+"size: 0x"+o.toString(16)+" bytes")}return e|0}function m(e){if(+e!=e){e=0}return f.alloc(+e)}f.isBuffer=function e(t){return t!=null&&t._isBuffer===true};f.compare=function e(t,r){if(!f.isBuffer(t)||!f.isBuffer(r)){throw new TypeError("Arguments must be Buffers")}if(t===r)return 0;var n=t.length;var i=r.length;for(var o=0,s=Math.min(n,i);o<s;++o){if(t[o]!==r[o]){n=t[o];i=r[o];break}}if(n<i)return-1;if(i<n)return 1;return 0};f.isEncoding=function e(t){switch(String(t).toLowerCase()){case"hex":case"utf8":case"utf-8":case"ascii":case"latin1":case"binary":case"base64":case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return true;default:return false}};f.concat=function e(t,r){if(!Array.isArray(t)){throw new TypeError('"list" argument must be an Array of Buffers')}if(t.length===0){return f.alloc(0)}var n;if(r===undefined){r=0;for(n=0;n<t.length;++n){r+=t[n].length}}var i=f.allocUnsafe(r);var o=0;for(n=0;n<t.length;++n){var s=t[n];if(!f.isBuffer(s)){throw new TypeError('"list" argument must be an Array of Buffers')}s.copy(i,o);o+=s.length}return i};function b(e,t){if(f.isBuffer(e)){return e.length}if(K(e)||X(e)){return e.byteLength}if(typeof e!=="string"){e=""+e}var r=e.length;if(r===0)return 0;var n=false;for(;;){switch(t){case"ascii":case"latin1":case"binary":return r;case"utf8":case"utf-8":case undefined:return H(e).length;case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return r*2;case"hex":return r>>>1;case"base64":return $(e).length;default:if(n)return H(e).length;t=(""+t).toLowerCase();n=true}}}f.byteLength=b;function w(e,t,r){var n=false;if(t===undefined||t<0){t=0}if(t>this.length){return""}if(r===undefined||r>this.length){r=this.length}if(r<=0){return""}r>>>=0;t>>>=0;if(r<=t){return""}if(!e)e="utf8";while(true){switch(e){case"hex":return O(this,t,r);case"utf8":case"utf-8":return M(this,t,r);case"ascii":return j(this,t,r);case"latin1":case"binary":return N(this,t,r);case"base64":return L(this,t,r);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return U(this,t,r);default:if(n)throw new TypeError("Unknown encoding: "+e);e=(e+"").toLowerCase();n=true}}}f.prototype._isBuffer=true;function _(e,t,r){var n=e[t];e[t]=e[r];e[r]=n}f.prototype.swap16=function e(){var t=this.length;if(t%2!==0){throw new RangeError("Buffer size must be a multiple of 16-bits")}for(var r=0;r<t;r+=2){_(this,r,r+1)}return this};f.prototype.swap32=function e(){var t=this.length;if(t%4!==0){throw new RangeError("Buffer size must be a multiple of 32-bits")}for(var r=0;r<t;r+=4){_(this,r,r+3);_(this,r+1,r+2)}return this};f.prototype.swap64=function e(){var t=this.length;if(t%8!==0){throw new RangeError("Buffer size must be a multiple of 64-bits")}for(var r=0;r<t;r+=8){_(this,r,r+7);_(this,r+1,r+6);_(this,r+2,r+5);_(this,r+3,r+4)}return this};f.prototype.toString=function e(){var t=this.length;if(t===0)return"";if(arguments.length===0)return M(this,0,t);return w.apply(this,arguments)};f.prototype.equals=function e(t){if(!f.isBuffer(t))throw new TypeError("Argument must be a Buffer");if(this===t)return true;return f.compare(this,t)===0};f.prototype.inspect=function e(){var t="";var n=r.INSPECT_MAX_BYTES;if(this.length>0){t=this.toString("hex",0,n).match(/.{2}/g).join(" ");if(this.length>n)t+=" ... "}return"<Buffer "+t+">"};f.prototype.compare=function e(t,r,n,i,o){if(!f.isBuffer(t)){throw new TypeError("Argument must be a Buffer")}if(r===undefined){r=0}if(n===undefined){n=t?t.length:0}if(i===undefined){i=0}if(o===undefined){o=this.length}if(r<0||n>t.length||i<0||o>this.length){throw new RangeError("out of range index")}if(i>=o&&r>=n){return 0}if(i>=o){return-1}if(r>=n){return 1}r>>>=0;n>>>=0;i>>>=0;o>>>=0;if(this===t)return 0;var s=o-i;var a=n-r;var u=Math.min(s,a);var l=this.slice(i,o);var c=t.slice(r,n);for(var h=0;h<u;++h){if(l[h]!==c[h]){s=l[h];a=c[h];break}}if(s<a)return-1;if(a<s)return 1;return 0};function S(e,t,r,n,i){if(e.length===0)return-1;if(typeof r==="string"){n=r;r=0}else if(r>2147483647){r=2147483647}else if(r<-2147483648){r=-2147483648}r=+r;if(Q(r)){r=i?0:e.length-1}if(r<0)r=e.length+r;if(r>=e.length){if(i)return-1;else r=e.length-1}else if(r<0){if(i)r=0;else return-1}if(typeof t==="string"){t=f.from(t,n)}if(f.isBuffer(t)){if(t.length===0){return-1}return C(e,t,r,n,i)}else if(typeof t==="number"){t=t&255;if(typeof Uint8Array.prototype.indexOf==="function"){if(i){return Uint8Array.prototype.indexOf.call(e,t,r)}else{return Uint8Array.prototype.lastIndexOf.call(e,t,r)}}return C(e,[t],r,n,i)}throw new TypeError("val must be string, number or Buffer")}function C(e,t,r,n,i){var o=1;var s=e.length;var a=t.length;if(n!==undefined){n=String(n).toLowerCase();if(n==="ucs2"||n==="ucs-2"||n==="utf16le"||n==="utf-16le"){if(e.length<2||t.length<2){return-1}o=2;s/=2;a/=2;r/=2}}function f(e,t){if(o===1){return e[t]}else{return e.readUInt16BE(t*o)}}var u;if(i){var l=-1;for(u=r;u<s;u++){if(f(e,u)===f(t,l===-1?0:u-l)){if(l===-1)l=u;if(u-l+1===a)return l*o}else{if(l!==-1)u-=u-l;l=-1}}}else{if(r+a>s)r=s-a;for(u=r;u>=0;u--){var c=true;for(var h=0;h<a;h++){if(f(e,u+h)!==f(t,h)){c=false;break}}if(c)return u}}return-1}f.prototype.includes=function e(t,r,n){return this.indexOf(t,r,n)!==-1};f.prototype.indexOf=function e(t,r,n){return S(this,t,r,n,true)};f.prototype.lastIndexOf=function e(t,r,n){return S(this,t,r,n,false)};function E(e,t,r,n){r=Number(r)||0;var i=e.length-r;if(!n){n=i}else{n=Number(n);if(n>i){n=i}}var o=t.length;if(o%2!==0)throw new TypeError("Invalid hex string");if(n>o/2){n=o/2}for(var s=0;s<n;++s){var a=parseInt(t.substr(s*2,2),16);if(Q(a))return s;e[r+s]=a}return s}function T(e,t,r,n){return G(H(t,e.length-r),e,r,n)}function x(e,t,r,n){return G(J(t),e,r,n)}function A(e,t,r,n){return x(e,t,r,n)}function k(e,t,r,n){return G($(t),e,r,n)}function R(e,t,r,n){return G(Z(t,e.length-r),e,r,n)}f.prototype.write=function e(t,r,n,i){if(r===undefined){i="utf8";n=this.length;r=0}else if(n===undefined&&typeof r==="string"){i=r;n=this.length;r=0}else if(isFinite(r)){r=r>>>0;if(isFinite(n)){n=n>>>0;if(i===undefined)i="utf8"}else{i=n;n=undefined}}else{throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported")}var o=this.length-r;if(n===undefined||n>o)n=o;if(t.length>0&&(n<0||r<0)||r>this.length){throw new RangeError("Attempt to write outside buffer bounds")}if(!i)i="utf8";var s=false;for(;;){switch(i){case"hex":return E(this,t,r,n);case"utf8":case"utf-8":return T(this,t,r,n);case"ascii":return x(this,t,r,n);case"latin1":case"binary":return A(this,t,r,n);case"base64":return k(this,t,r,n);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return R(this,t,r,n);default:if(s)throw new TypeError("Unknown encoding: "+i);i=(""+i).toLowerCase();s=true}}};f.prototype.toJSON=function e(){return{type:"Buffer",data:Array.prototype.slice.call(this._arr||this,0)}};function L(e,t,r){if(t===0&&r===e.length){return n.fromByteArray(e)}else{return n.fromByteArray(e.slice(t,r))}}function M(e,t,r){r=Math.min(e.length,r);var n=[];var i=t;while(i<r){var o=e[i];var s=null;var a=o>239?4:o>223?3:o>191?2:1;if(i+a<=r){var f,u,l,c;switch(a){case 1:if(o<128){s=o}break;case 2:f=e[i+1];if((f&192)===128){c=(o&31)<<6|f&63;if(c>127){s=c}}break;case 3:f=e[i+1];u=e[i+2];if((f&192)===128&&(u&192)===128){c=(o&15)<<12|(f&63)<<6|u&63;if(c>2047&&(c<55296||c>57343)){s=c}}break;case 4:f=e[i+1];u=e[i+2];l=e[i+3];if((f&192)===128&&(u&192)===128&&(l&192)===128){c=(o&15)<<18|(f&63)<<12|(u&63)<<6|l&63;if(c>65535&&c<1114112){s=c}}}}if(s===null){s=65533;a=1}else if(s>65535){s-=65536;n.push(s>>>10&1023|55296);s=56320|s&1023}n.push(s);i+=a}return I(n)}var B=4096;function I(e){var t=e.length;if(t<=B){return String.fromCharCode.apply(String,e)}var r="";var n=0;while(n<t){r+=String.fromCharCode.apply(String,e.slice(n,n+=B))}return r}function j(e,t,r){var n="";r=Math.min(e.length,r);for(var i=t;i<r;++i){n+=String.fromCharCode(e[i]&127)}return n}function N(e,t,r){var n="";r=Math.min(e.length,r);for(var i=t;i<r;++i){n+=String.fromCharCode(e[i])}return n}function O(e,t,r){var n=e.length;if(!t||t<0)t=0;if(!r||r<0||r>n)r=n;var i="";for(var o=t;o<r;++o){i+=Y(e[o])}return i}function U(e,t,r){var n=e.slice(t,r);var i="";for(var o=0;o<n.length;o+=2){i+=String.fromCharCode(n[o]+n[o+1]*256)}return i}f.prototype.slice=function e(t,r){var n=this.length;t=~~t;r=r===undefined?n:~~r;if(t<0){t+=n;if(t<0)t=0}else if(t>n){t=n}if(r<0){r+=n;if(r<0)r=0}else if(r>n){r=n}if(r<t)r=t;var i=this.subarray(t,r);i.__proto__=f.prototype;return i};function D(e,t,r){if(e%1!==0||e<0)throw new RangeError("offset is not uint");if(e+t>r)throw new RangeError("Trying to access beyond buffer length")}f.prototype.readUIntLE=function e(t,r,n){t=t>>>0;r=r>>>0;if(!n)D(t,r,this.length);var i=this[t];var o=1;var s=0;while(++s<r&&(o*=256)){i+=this[t+s]*o}return i};f.prototype.readUIntBE=function e(t,r,n){t=t>>>0;r=r>>>0;if(!n){D(t,r,this.length)}var i=this[t+--r];var o=1;while(r>0&&(o*=256)){i+=this[t+--r]*o}return i};f.prototype.readUInt8=function e(t,r){t=t>>>0;if(!r)D(t,1,this.length);return this[t]};f.prototype.readUInt16LE=function e(t,r){t=t>>>0;if(!r)D(t,2,this.length);return this[t]|this[t+1]<<8};f.prototype.readUInt16BE=function e(t,r){t=t>>>0;if(!r)D(t,2,this.length);return this[t]<<8|this[t+1]};f.prototype.readUInt32LE=function e(t,r){t=t>>>0;if(!r)D(t,4,this.length);return(this[t]|this[t+1]<<8|this[t+2]<<16)+this[t+3]*16777216};f.prototype.readUInt32BE=function e(t,r){t=t>>>0;if(!r)D(t,4,this.length);return this[t]*16777216+(this[t+1]<<16|this[t+2]<<8|this[t+3])};f.prototype.readIntLE=function e(t,r,n){t=t>>>0;r=r>>>0;if(!n)D(t,r,this.length);var i=this[t];var o=1;var s=0;while(++s<r&&(o*=256)){i+=this[t+s]*o}o*=128;if(i>=o)i-=Math.pow(2,8*r);return i};f.prototype.readIntBE=function e(t,r,n){t=t>>>0;r=r>>>0;if(!n)D(t,r,this.length);var i=r;var o=1;var s=this[t+--i];while(i>0&&(o*=256)){s+=this[t+--i]*o}o*=128;if(s>=o)s-=Math.pow(2,8*r);return s};f.prototype.readInt8=function e(t,r){t=t>>>0;if(!r)D(t,1,this.length);if(!(this[t]&128))return this[t];return(255-this[t]+1)*-1};f.prototype.readInt16LE=function e(t,r){t=t>>>0;if(!r)D(t,2,this.length);var n=this[t]|this[t+1]<<8;return n&32768?n|4294901760:n};f.prototype.readInt16BE=function e(t,r){t=t>>>0;if(!r)D(t,2,this.length);var n=this[t+1]|this[t]<<8;return n&32768?n|4294901760:n};f.prototype.readInt32LE=function e(t,r){t=t>>>0;if(!r)D(t,4,this.length);return this[t]|this[t+1]<<8|this[t+2]<<16|this[t+3]<<24};f.prototype.readInt32BE=function e(t,r){t=t>>>0;if(!r)D(t,4,this.length);return this[t]<<24|this[t+1]<<16|this[t+2]<<8|this[t+3]};f.prototype.readFloatLE=function e(t,r){t=t>>>0;if(!r)D(t,4,this.length);return i.read(this,t,true,23,4)};f.prototype.readFloatBE=function e(t,r){t=t>>>0;if(!r)D(t,4,this.length);return i.read(this,t,false,23,4)};f.prototype.readDoubleLE=function e(t,r){t=t>>>0;if(!r)D(t,8,this.length);return i.read(this,t,true,52,8)};f.prototype.readDoubleBE=function e(t,r){t=t>>>0;if(!r)D(t,8,this.length);return i.read(this,t,false,52,8)};function P(e,t,r,n,i,o){if(!f.isBuffer(e))throw new TypeError('"buffer" argument must be a Buffer instance');if(t>i||t<o)throw new RangeError('"value" argument is out of bounds');if(r+n>e.length)throw new RangeError("Index out of range")}f.prototype.writeUIntLE=function e(t,r,n,i){t=+t;r=r>>>0;n=n>>>0;if(!i){var o=Math.pow(2,8*n)-1;P(this,t,r,n,o,0)}var s=1;var a=0;this[r]=t&255;while(++a<n&&(s*=256)){this[r+a]=t/s&255}return r+n};f.prototype.writeUIntBE=function e(t,r,n,i){t=+t;r=r>>>0;n=n>>>0;if(!i){var o=Math.pow(2,8*n)-1;P(this,t,r,n,o,0)}var s=n-1;var a=1;this[r+s]=t&255;while(--s>=0&&(a*=256)){this[r+s]=t/a&255}return r+n};f.prototype.writeUInt8=function e(t,r,n){t=+t;r=r>>>0;if(!n)P(this,t,r,1,255,0);this[r]=t&255;return r+1};f.prototype.writeUInt16LE=function e(t,r,n){t=+t;r=r>>>0;if(!n)P(this,t,r,2,65535,0);this[r]=t&255;this[r+1]=t>>>8;return r+2};f.prototype.writeUInt16BE=function e(t,r,n){t=+t;r=r>>>0;if(!n)P(this,t,r,2,65535,0);this[r]=t>>>8;this[r+1]=t&255;return r+2};f.prototype.writeUInt32LE=function e(t,r,n){t=+t;r=r>>>0;if(!n)P(this,t,r,4,4294967295,0);this[r+3]=t>>>24;this[r+2]=t>>>16;this[r+1]=t>>>8;this[r]=t&255;return r+4};f.prototype.writeUInt32BE=function e(t,r,n){t=+t;r=r>>>0;if(!n)P(this,t,r,4,4294967295,0);this[r]=t>>>24;this[r+1]=t>>>16;this[r+2]=t>>>8;this[r+3]=t&255;return r+4};f.prototype.writeIntLE=function e(t,r,n,i){t=+t;r=r>>>0;if(!i){var o=Math.pow(2,8*n-1);P(this,t,r,n,o-1,-o)}var s=0;var a=1;var f=0;this[r]=t&255;while(++s<n&&(a*=256)){if(t<0&&f===0&&this[r+s-1]!==0){f=1}this[r+s]=(t/a>>0)-f&255}return r+n};f.prototype.writeIntBE=function e(t,r,n,i){t=+t;r=r>>>0;if(!i){var o=Math.pow(2,8*n-1);P(this,t,r,n,o-1,-o)}var s=n-1;var a=1;var f=0;this[r+s]=t&255;while(--s>=0&&(a*=256)){if(t<0&&f===0&&this[r+s+1]!==0){f=1}this[r+s]=(t/a>>0)-f&255}return r+n};f.prototype.writeInt8=function e(t,r,n){t=+t;r=r>>>0;if(!n)P(this,t,r,1,127,-128);if(t<0)t=255+t+1;this[r]=t&255;return r+1};f.prototype.writeInt16LE=function e(t,r,n){t=+t;r=r>>>0;if(!n)P(this,t,r,2,32767,-32768);this[r]=t&255;this[r+1]=t>>>8;return r+2};f.prototype.writeInt16BE=function e(t,r,n){t=+t;r=r>>>0;if(!n)P(this,t,r,2,32767,-32768);this[r]=t>>>8;this[r+1]=t&255;return r+2};f.prototype.writeInt32LE=function e(t,r,n){t=+t;r=r>>>0;if(!n)P(this,t,r,4,2147483647,-2147483648);this[r]=t&255;this[r+1]=t>>>8;this[r+2]=t>>>16;this[r+3]=t>>>24;return r+4};f.prototype.writeInt32BE=function e(t,r,n){t=+t;r=r>>>0;if(!n)P(this,t,r,4,2147483647,-2147483648);if(t<0)t=4294967295+t+1;this[r]=t>>>24;this[r+1]=t>>>16;this[r+2]=t>>>8;this[r+3]=t&255;return r+4};function q(e,t,r,n,i,o){if(r+n>e.length)throw new RangeError("Index out of range");if(r<0)throw new RangeError("Index out of range")}function F(e,t,r,n,o){t=+t;r=r>>>0;if(!o){q(e,t,r,4,3.4028234663852886e38,-3.4028234663852886e38)}i.write(e,t,r,n,23,4);return r+4}f.prototype.writeFloatLE=function e(t,r,n){return F(this,t,r,true,n)};f.prototype.writeFloatBE=function e(t,r,n){return F(this,t,r,false,n)};function W(e,t,r,n,o){t=+t;r=r>>>0;if(!o){q(e,t,r,8,1.7976931348623157e308,-1.7976931348623157e308)}i.write(e,t,r,n,52,8);return r+8}f.prototype.writeDoubleLE=function e(t,r,n){return W(this,t,r,true,n)};f.prototype.writeDoubleBE=function e(t,r,n){return W(this,t,r,false,n)};f.prototype.copy=function e(t,r,n,i){if(!n)n=0;if(!i&&i!==0)i=this.length;if(r>=t.length)r=t.length;if(!r)r=0;if(i>0&&i<n)i=n;if(i===n)return 0;if(t.length===0||this.length===0)return 0;if(r<0){throw new RangeError("targetStart out of bounds")}if(n<0||n>=this.length)throw new RangeError("sourceStart out of bounds");if(i<0)throw new RangeError("sourceEnd out of bounds");if(i>this.length)i=this.length;if(t.length-r<i-n){i=t.length-r+n}var o=i-n;var s;if(this===t&&n<r&&r<i){for(s=o-1;s>=0;--s){t[s+r]=this[s+n]}}else if(o<1e3){for(s=0;s<o;++s){t[s+r]=this[s+n]}}else{Uint8Array.prototype.set.call(t,this.subarray(n,n+o),r)}return o};f.prototype.fill=function e(t,r,n,i){if(typeof t==="string"){if(typeof r==="string"){i=r;r=0;n=this.length}else if(typeof n==="string"){i=n;n=this.length}if(t.length===1){var o=t.charCodeAt(0);if(o<256){t=o}}if(i!==undefined&&typeof i!=="string"){throw new TypeError("encoding must be a string")}if(typeof i==="string"&&!f.isEncoding(i)){throw new TypeError("Unknown encoding: "+i)}}else if(typeof t==="number"){t=t&255}if(r<0||this.length<r||this.length<n){throw new RangeError("Out of range index")}if(n<=r){return this}r=r>>>0;n=n===undefined?this.length:n>>>0;if(!t)t=0;var s;if(typeof t==="number"){for(s=r;s<n;++s){this[s]=t}}else{var a=f.isBuffer(t)?t:new f(t,i);var u=a.length;for(s=0;s<n-r;++s){this[s+r]=a[s%u]}}return this};var z=/[^+\/0-9A-Za-z-_]/g;function V(e){e=e.trim().replace(z,"");if(e.length<2)return"";while(e.length%4!==0){e=e+"="}return e}function Y(e){if(e<16)return"0"+e.toString(16);return e.toString(16)}function H(e,t){t=t||Infinity;var r;var n=e.length;var i=null;var o=[];for(var s=0;s<n;++s){r=e.charCodeAt(s);if(r>55295&&r<57344){if(!i){if(r>56319){if((t-=3)>-1)o.push(239,191,189);continue}else if(s+1===n){if((t-=3)>-1)o.push(239,191,189);continue}i=r;continue}if(r<56320){if((t-=3)>-1)o.push(239,191,189);i=r;continue}r=(i-55296<<10|r-56320)+65536}else if(i){if((t-=3)>-1)o.push(239,191,189)}i=null;if(r<128){if((t-=1)<0)break;o.push(r)}else if(r<2048){if((t-=2)<0)break;o.push(r>>6|192,r&63|128)}else if(r<65536){if((t-=3)<0)break;o.push(r>>12|224,r>>6&63|128,r&63|128)}else if(r<1114112){if((t-=4)<0)break;o.push(r>>18|240,r>>12&63|128,r>>6&63|128,r&63|128)}else{throw new Error("Invalid code point")}}return o}function J(e){var t=[];for(var r=0;r<e.length;++r){t.push(e.charCodeAt(r)&255)}return t}function Z(e,t){var r,n,i;var o=[];for(var s=0;s<e.length;++s){if((t-=2)<0)break;r=e.charCodeAt(s);n=r>>8;i=r%256;o.push(i);o.push(n)}return o}function $(e){return n.toByteArray(V(e))}function G(e,t,r,n){for(var i=0;i<n;++i){if(i+r>=t.length||i>=e.length)break;t[i+r]=e[i]}return i}function X(e){return e instanceof ArrayBuffer||e!=null&&e.constructor!=null&&e.constructor.name==="ArrayBuffer"&&typeof e.byteLength==="number"}function K(e){return typeof ArrayBuffer.isView==="function"&&ArrayBuffer.isView(e)}function Q(e){return e!==e}},{"base64-js":1,ieee754:9}],4:[function(e,t,r){(function(e){function t(e){if(Array.isArray){return Array.isArray(e)}return y(e)==="[object Array]"}r.isArray=t;function n(e){return typeof e==="boolean"}r.isBoolean=n;function i(e){return e===null}r.isNull=i;function o(e){return e==null}r.isNullOrUndefined=o;function s(e){return typeof e==="number"}r.isNumber=s;function a(e){return typeof e==="string"}r.isString=a;function f(e){return typeof e==="symbol"}r.isSymbol=f;function u(e){return e===void 0}r.isUndefined=u;function l(e){return y(e)==="[object RegExp]"}r.isRegExp=l;function c(e){return typeof e==="object"&&e!==null}r.isObject=c;function h(e){return y(e)==="[object Date]"}r.isDate=h;function d(e){return y(e)==="[object Error]"||e instanceof Error}r.isError=d;function p(e){return typeof e==="function"}r.isFunction=p;function g(e){return e===null||typeof e==="boolean"||typeof e==="number"||typeof e==="string"||typeof e==="symbol"||typeof e==="undefined"}r.isPrimitive=g;r.isBuffer=e.isBuffer;function y(e){return Object.prototype.toString.call(e)}}).call(this,{isBuffer:e("../../is-buffer/index.js")})},{"../../is-buffer/index.js":11}],5:[function(e,t,r){(function(n){r=t.exports=e("./debug");r.log=s;r.formatArgs=o;r.save=a;r.load=f;r.useColors=i;r.storage="undefined"!=typeof chrome&&"undefined"!=typeof chrome.storage?chrome.storage.local:u();r.colors=["lightseagreen","forestgreen","goldenrod","dodgerblue","darkorchid","crimson"];function i(){if(typeof window!=="undefined"&&window.process&&window.process.type==="renderer"){return true}return typeof document!=="undefined"&&document.documentElement&&document.documentElement.style&&document.documentElement.style.WebkitAppearance||typeof window!=="undefined"&&window.console&&(window.console.firebug||window.console.exception&&window.console.table)||typeof navigator!=="undefined"&&navigator.userAgent&&navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)&&parseInt(RegExp.$1,10)>=31||typeof navigator!=="undefined"&&navigator.userAgent&&navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/)}r.formatters.j=function(e){try{return JSON.stringify(e)}catch(e){return"[UnexpectedJSONParseError]: "+e.message}};function o(e){var t=this.useColors;e[0]=(t?"%c":"")+this.namespace+(t?" %c":" ")+e[0]+(t?"%c ":" ")+"+"+r.humanize(this.diff);if(!t)return;var n="color: "+this.color;e.splice(1,0,n,"color: inherit");var i=0;var o=0;e[0].replace(/%[a-zA-Z%]/g,function(e){if("%%"===e)return;i++;if("%c"===e){o=i}});e.splice(o,0,n)}function s(){return"object"===typeof console&&console.log&&Function.prototype.apply.call(console.log,console,arguments)}function a(e){try{if(null==e){r.storage.removeItem("debug")}else{r.storage.debug=e}}catch(e){}}function f(){var e;try{e=r.storage.debug}catch(e){}if(!e&&typeof n!=="undefined"&&"env"in n){e=n.env.DEBUG}return e}r.enable(f());function u(){try{return window.localStorage}catch(e){}}}).call(this,e("_process"))},{"./debug":6,_process:15}],6:[function(e,t,r){r=t.exports=o.debug=o["default"]=o;r.coerce=u;r.disable=a;r.enable=s;r.enabled=f;r.humanize=e("ms");r.names=[];r.skips=[];r.formatters={};var n;function i(e){var t=0,n;for(n in e){t=(t<<5)-t+e.charCodeAt(n);t|=0}return r.colors[Math.abs(t)%r.colors.length]}function o(e){function t(){if(!t.enabled)return;var e=t;var i=+new Date;var o=i-(n||i);e.diff=o;e.prev=n;e.curr=i;n=i;var s=new Array(arguments.length);for(var a=0;a<s.length;a++){s[a]=arguments[a]}s[0]=r.coerce(s[0]);if("string"!==typeof s[0]){s.unshift("%O")}var f=0;s[0]=s[0].replace(/%([a-zA-Z%])/g,function(t,n){if(t==="%%")return t;f++;var i=r.formatters[n];if("function"===typeof i){var o=s[f];t=i.call(e,o);s.splice(f,1);f--}return t});r.formatArgs.call(e,s);var u=t.log||r.log||console.log.bind(console);u.apply(e,s)}t.namespace=e;t.enabled=r.enabled(e);t.useColors=r.useColors();t.color=i(e);if("function"===typeof r.init){r.init(t)}return t}function s(e){r.save(e);r.names=[];r.skips=[];var t=(typeof e==="string"?e:"").split(/[\s,]+/);var n=t.length;for(var i=0;i<n;i++){if(!t[i])continue;e=t[i].replace(/\*/g,".*?");if(e[0]==="-"){r.skips.push(new RegExp("^"+e.substr(1)+"$"))}else{r.names.push(new RegExp("^"+e+"$"))}}}function a(){r.enable("")}function f(e){var t,n;for(t=0,n=r.skips.length;t<n;t++){if(r.skips[t].test(e)){return false}}for(t=0,n=r.names.length;t<n;t++){if(r.names[t].test(e)){return true}}return false}function u(e){if(e instanceof Error)return e.stack||e.message;return e}},{ms:13}],7:[function(e,t,r){function n(){this._events=this._events||{};this._maxListeners=this._maxListeners||undefined}t.exports=n;n.EventEmitter=n;n.prototype._events=undefined;n.prototype._maxListeners=undefined;n.defaultMaxListeners=10;n.prototype.setMaxListeners=function(e){if(!o(e)||e<0||isNaN(e))throw TypeError("n must be a positive number");this._maxListeners=e;return this};n.prototype.emit=function(e){var t,r,n,o,f,u;if(!this._events)this._events={};if(e==="error"){if(!this._events.error||s(this._events.error)&&!this._events.error.length){t=arguments[1];if(t instanceof Error){throw t}else{var l=new Error('Uncaught, unspecified "error" event. ('+t+")");l.context=t;throw l}}}r=this._events[e];if(a(r))return false;if(i(r)){switch(arguments.length){case 1:r.call(this);break;case 2:r.call(this,arguments[1]);break;case 3:r.call(this,arguments[1],arguments[2]);break;default:o=Array.prototype.slice.call(arguments,1);r.apply(this,o)}}else if(s(r)){o=Array.prototype.slice.call(arguments,1);u=r.slice();n=u.length;for(f=0;f<n;f++)u[f].apply(this,o)}return true};n.prototype.addListener=function(e,t){var r;if(!i(t))throw TypeError("listener must be a function");if(!this._events)this._events={};if(this._events.newListener)this.emit("newListener",e,i(t.listener)?t.listener:t);if(!this._events[e])this._events[e]=t;else if(s(this._events[e]))this._events[e].push(t);else this._events[e]=[this._events[e],t];if(s(this._events[e])&&!this._events[e].warned){if(!a(this._maxListeners)){r=this._maxListeners}else{r=n.defaultMaxListeners}if(r&&r>0&&this._events[e].length>r){this._events[e].warned=true;console.error("(node) warning: possible EventEmitter memory "+"leak detected. %d listeners added. "+"Use emitter.setMaxListeners() to increase limit.",this._events[e].length);if(typeof console.trace==="function"){console.trace()}}}return this};n.prototype.on=n.prototype.addListener;n.prototype.once=function(e,t){if(!i(t))throw TypeError("listener must be a function");var r=false;function n(){this.removeListener(e,n);if(!r){r=true;t.apply(this,arguments)}}n.listener=t;this.on(e,n);return this};n.prototype.removeListener=function(e,t){var r,n,o,a;if(!i(t))throw TypeError("listener must be a function");if(!this._events||!this._events[e])return this;r=this._events[e];o=r.length;n=-1;if(r===t||i(r.listener)&&r.listener===t){delete this._events[e];if(this._events.removeListener)this.emit("removeListener",e,t)}else if(s(r)){for(a=o;a-- >0;){if(r[a]===t||r[a].listener&&r[a].listener===t){n=a;break}}if(n<0)return this;if(r.length===1){r.length=0;delete this._events[e]}else{r.splice(n,1)}if(this._events.removeListener)this.emit("removeListener",e,t)}return this};n.prototype.removeAllListeners=function(e){var t,r;if(!this._events)return this;if(!this._events.removeListener){if(arguments.length===0)this._events={};else if(this._events[e])delete this._events[e];return this}if(arguments.length===0){for(t in this._events){if(t==="removeListener")continue;this.removeAllListeners(t)}this.removeAllListeners("removeListener");this._events={};return this}r=this._events[e];if(i(r)){this.removeListener(e,r)}else if(r){while(r.length)this.removeListener(e,r[r.length-1])}delete this._events[e];return this};n.prototype.listeners=function(e){var t;if(!this._events||!this._events[e])t=[];else if(i(this._events[e]))t=[this._events[e]];else t=this._events[e].slice();return t};n.prototype.listenerCount=function(e){if(this._events){var t=this._events[e];if(i(t))return 1;else if(t)return t.length}return 0};n.listenerCount=function(e,t){return e.listenerCount(t)};function i(e){return typeof e==="function"}function o(e){return typeof e==="number"}function s(e){return typeof e==="object"&&e!==null}function a(e){return e===void 0}},{}],8:[function(e,t,r){t.exports=function e(){if(typeof window==="undefined")return null;var t={RTCPeerConnection:window.RTCPeerConnection||window.mozRTCPeerConnection||window.webkitRTCPeerConnection,RTCSessionDescription:window.RTCSessionDescription||window.mozRTCSessionDescription||window.webkitRTCSessionDescription,RTCIceCandidate:window.RTCIceCandidate||window.mozRTCIceCandidate||window.webkitRTCIceCandidate};if(!t.RTCPeerConnection)return null;return t}},{}],9:[function(e,t,r){r.read=function(e,t,r,n,i){var o,s;var a=i*8-n-1;var f=(1<<a)-1;var u=f>>1;var l=-7;var c=r?i-1:0;var h=r?-1:1;var d=e[t+c];c+=h;o=d&(1<<-l)-1;d>>=-l;l+=a;for(;l>0;o=o*256+e[t+c],c+=h,l-=8){}s=o&(1<<-l)-1;o>>=-l;l+=n;for(;l>0;s=s*256+e[t+c],c+=h,l-=8){}if(o===0){o=1-u}else if(o===f){return s?NaN:(d?-1:1)*Infinity}else{s=s+Math.pow(2,n);o=o-u}return(d?-1:1)*s*Math.pow(2,o-n)};r.write=function(e,t,r,n,i,o){var s,a,f;var u=o*8-i-1;var l=(1<<u)-1;var c=l>>1;var h=i===23?Math.pow(2,-24)-Math.pow(2,-77):0;var d=n?0:o-1;var p=n?1:-1;var g=t<0||t===0&&1/t<0?1:0;t=Math.abs(t);if(isNaN(t)||t===Infinity){a=isNaN(t)?1:0;s=l}else{s=Math.floor(Math.log(t)/Math.LN2);if(t*(f=Math.pow(2,-s))<1){s--;f*=2}if(s+c>=1){t+=h/f}else{t+=h*Math.pow(2,1-c)}if(t*f>=2){s++;f/=2}if(s+c>=l){a=0;s=l}else if(s+c>=1){a=(t*f-1)*Math.pow(2,i);s=s+c}else{a=t*Math.pow(2,c-1)*Math.pow(2,i);s=0}}for(;i>=8;e[r+d]=a&255,d+=p,a/=256,i-=8){}s=s<<i|a;u+=i;for(;u>0;e[r+d]=s&255,d+=p,s/=256,u-=8){}e[r+d-p]|=g*128}},{}],
10:[function(e,t,r){if(typeof Object.create==="function"){t.exports=function e(t,r){t.super_=r;t.prototype=Object.create(r.prototype,{constructor:{value:t,enumerable:false,writable:true,configurable:true}})}}else{t.exports=function e(t,r){t.super_=r;var n=function(){};n.prototype=r.prototype;t.prototype=new n;t.prototype.constructor=t}}},{}],11:[function(e,t,r){t.exports=function(e){return e!=null&&(n(e)||i(e)||!!e._isBuffer)};function n(e){return!!e.constructor&&typeof e.constructor.isBuffer==="function"&&e.constructor.isBuffer(e)}function i(e){return typeof e.readFloatLE==="function"&&typeof e.slice==="function"&&n(e.slice(0,0))}},{}],12:[function(e,t,r){var n={}.toString;t.exports=Array.isArray||function(e){return n.call(e)=="[object Array]"}},{}],13:[function(e,t,r){var n=1e3;var i=n*60;var o=i*60;var s=o*24;var a=s*365.25;t.exports=function(e,t){t=t||{};var r=typeof e;if(r==="string"&&e.length>0){return f(e)}else if(r==="number"&&isNaN(e)===false){return t.long?l(e):u(e)}throw new Error("val is not a non-empty string or a valid number. val="+JSON.stringify(e))};function f(e){e=String(e);if(e.length>100){return}var t=/^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(e);if(!t){return}var r=parseFloat(t[1]);var f=(t[2]||"ms").toLowerCase();switch(f){case"years":case"year":case"yrs":case"yr":case"y":return r*a;case"days":case"day":case"d":return r*s;case"hours":case"hour":case"hrs":case"hr":case"h":return r*o;case"minutes":case"minute":case"mins":case"min":case"m":return r*i;case"seconds":case"second":case"secs":case"sec":case"s":return r*n;case"milliseconds":case"millisecond":case"msecs":case"msec":case"ms":return r;default:return undefined}}function u(e){if(e>=s){return Math.round(e/s)+"d"}if(e>=o){return Math.round(e/o)+"h"}if(e>=i){return Math.round(e/i)+"m"}if(e>=n){return Math.round(e/n)+"s"}return e+"ms"}function l(e){return c(e,s,"day")||c(e,o,"hour")||c(e,i,"minute")||c(e,n,"second")||e+" ms"}function c(e,t,r){if(e<t){return}if(e<t*1.5){return Math.floor(e/t)+" "+r}return Math.ceil(e/t)+" "+r+"s"}},{}],14:[function(e,t,r){(function(e){"use strict";if(!e.version||e.version.indexOf("v0.")===0||e.version.indexOf("v1.")===0&&e.version.indexOf("v1.8.")!==0){t.exports=r}else{t.exports=e.nextTick}function r(t,r,n,i){if(typeof t!=="function"){throw new TypeError('"callback" argument must be a function')}var o=arguments.length;var s,a;switch(o){case 0:case 1:return e.nextTick(t);case 2:return e.nextTick(function e(){t.call(null,r)});case 3:return e.nextTick(function e(){t.call(null,r,n)});case 4:return e.nextTick(function e(){t.call(null,r,n,i)});default:s=new Array(o-1);a=0;while(a<s.length){s[a++]=arguments[a]}return e.nextTick(function e(){t.apply(null,s)})}}}).call(this,e("_process"))},{_process:15}],15:[function(e,t,r){var n=t.exports={};var i;var o;function s(){throw new Error("setTimeout has not been defined")}function a(){throw new Error("clearTimeout has not been defined")}(function(){try{if(typeof setTimeout==="function"){i=setTimeout}else{i=s}}catch(e){i=s}try{if(typeof clearTimeout==="function"){o=clearTimeout}else{o=a}}catch(e){o=a}})();function f(e){if(i===setTimeout){return setTimeout(e,0)}if((i===s||!i)&&setTimeout){i=setTimeout;return setTimeout(e,0)}try{return i(e,0)}catch(t){try{return i.call(null,e,0)}catch(t){return i.call(this,e,0)}}}function u(e){if(o===clearTimeout){return clearTimeout(e)}if((o===a||!o)&&clearTimeout){o=clearTimeout;return clearTimeout(e)}try{return o(e)}catch(t){try{return o.call(null,e)}catch(t){return o.call(this,e)}}}var l=[];var c=false;var h;var d=-1;function p(){if(!c||!h){return}c=false;if(h.length){l=h.concat(l)}else{d=-1}if(l.length){g()}}function g(){if(c){return}var e=f(p);c=true;var t=l.length;while(t){h=l;l=[];while(++d<t){if(h){h[d].run()}}d=-1;t=l.length}h=null;c=false;u(e)}n.nextTick=function(e){var t=new Array(arguments.length-1);if(arguments.length>1){for(var r=1;r<arguments.length;r++){t[r-1]=arguments[r]}}l.push(new y(e,t));if(l.length===1&&!c){f(g)}};function y(e,t){this.fun=e;this.array=t}y.prototype.run=function(){this.fun.apply(null,this.array)};n.title="browser";n.browser=true;n.env={};n.argv=[];n.version="";n.versions={};function v(){}n.on=v;n.addListener=v;n.once=v;n.off=v;n.removeListener=v;n.removeAllListeners=v;n.emit=v;n.prependListener=v;n.prependOnceListener=v;n.listeners=function(e){return[]};n.binding=function(e){throw new Error("process.binding is not supported")};n.cwd=function(){return"/"};n.chdir=function(e){throw new Error("process.chdir is not supported")};n.umask=function(){return 0}},{}],16:[function(e,t,r){(function(r,n){"use strict";function i(){throw new Error("secure random number generation not supported by this browser\nuse chrome, FireFox or Internet Explorer 11")}var o=e("safe-buffer").Buffer;var s=n.crypto||n.msCrypto;if(s&&s.getRandomValues){t.exports=a}else{t.exports=i}function a(e,t){if(e>65536)throw new Error("requested too many random bytes");var i=new n.Uint8Array(e);if(e>0){s.getRandomValues(i)}var a=o.from(i.buffer);if(typeof t==="function"){return r.nextTick(function(){t(null,a)})}return a}}).call(this,e("_process"),typeof global!=="undefined"?global:typeof self!=="undefined"?self:typeof window!=="undefined"?window:{})},{_process:15,"safe-buffer":26}],17:[function(e,t,r){"use strict";var n=e("process-nextick-args");var i=Object.keys||function(e){var t=[];for(var r in e){t.push(r)}return t};t.exports=c;var o=e("core-util-is");o.inherits=e("inherits");var s=e("./_stream_readable");var a=e("./_stream_writable");o.inherits(c,s);var f=i(a.prototype);for(var u=0;u<f.length;u++){var l=f[u];if(!c.prototype[l])c.prototype[l]=a.prototype[l]}function c(e){if(!(this instanceof c))return new c(e);s.call(this,e);a.call(this,e);if(e&&e.readable===false)this.readable=false;if(e&&e.writable===false)this.writable=false;this.allowHalfOpen=true;if(e&&e.allowHalfOpen===false)this.allowHalfOpen=false;this.once("end",h)}function h(){if(this.allowHalfOpen||this._writableState.ended)return;n(d,this)}function d(e){e.end()}Object.defineProperty(c.prototype,"destroyed",{get:function(){if(this._readableState===undefined||this._writableState===undefined){return false}return this._readableState.destroyed&&this._writableState.destroyed},set:function(e){if(this._readableState===undefined||this._writableState===undefined){return}this._readableState.destroyed=e;this._writableState.destroyed=e}});c.prototype._destroy=function(e,t){this.push(null);this.end();n(t,e)};function p(e,t){for(var r=0,n=e.length;r<n;r++){t(e[r],r)}}},{"./_stream_readable":19,"./_stream_writable":21,"core-util-is":4,inherits:10,"process-nextick-args":14}],18:[function(e,t,r){"use strict";t.exports=o;var n=e("./_stream_transform");var i=e("core-util-is");i.inherits=e("inherits");i.inherits(o,n);function o(e){if(!(this instanceof o))return new o(e);n.call(this,e)}o.prototype._transform=function(e,t,r){r(null,e)}},{"./_stream_transform":20,"core-util-is":4,inherits:10}],19:[function(e,t,r){(function(r,n){"use strict";var i=e("process-nextick-args");t.exports=C;var o=e("isarray");var s;C.ReadableState=S;var a=e("events").EventEmitter;var f=function(e,t){return e.listeners(t).length};var u=e("./internal/streams/stream");var l=e("safe-buffer").Buffer;var c=n.Uint8Array||function(){};function h(e){return l.from(e)}function d(e){return l.isBuffer(e)||e instanceof c}var p=e("core-util-is");p.inherits=e("inherits");var g=e("util");var y=void 0;if(g&&g.debuglog){y=g.debuglog("stream")}else{y=function(){}}var v=e("./internal/streams/BufferList");var m=e("./internal/streams/destroy");var b;p.inherits(C,u);var w=["error","close","destroy","pause","resume"];function _(e,t,r){if(typeof e.prependListener==="function"){return e.prependListener(t,r)}else{if(!e._events||!e._events[t])e.on(t,r);else if(o(e._events[t]))e._events[t].unshift(r);else e._events[t]=[r,e._events[t]]}}function S(t,r){s=s||e("./_stream_duplex");t=t||{};this.objectMode=!!t.objectMode;if(r instanceof s)this.objectMode=this.objectMode||!!t.readableObjectMode;var n=t.highWaterMark;var i=this.objectMode?16:16*1024;this.highWaterMark=n||n===0?n:i;this.highWaterMark=Math.floor(this.highWaterMark);this.buffer=new v;this.length=0;this.pipes=null;this.pipesCount=0;this.flowing=null;this.ended=false;this.endEmitted=false;this.reading=false;this.sync=true;this.needReadable=false;this.emittedReadable=false;this.readableListening=false;this.resumeScheduled=false;this.destroyed=false;this.defaultEncoding=t.defaultEncoding||"utf8";this.awaitDrain=0;this.readingMore=false;this.decoder=null;this.encoding=null;if(t.encoding){if(!b)b=e("string_decoder/").StringDecoder;this.decoder=new b(t.encoding);this.encoding=t.encoding}}function C(t){s=s||e("./_stream_duplex");if(!(this instanceof C))return new C(t);this._readableState=new S(t,this);this.readable=true;if(t){if(typeof t.read==="function")this._read=t.read;if(typeof t.destroy==="function")this._destroy=t.destroy}u.call(this)}Object.defineProperty(C.prototype,"destroyed",{get:function(){if(this._readableState===undefined){return false}return this._readableState.destroyed},set:function(e){if(!this._readableState){return}this._readableState.destroyed=e}});C.prototype.destroy=m.destroy;C.prototype._undestroy=m.undestroy;C.prototype._destroy=function(e,t){this.push(null);t(e)};C.prototype.push=function(e,t){var r=this._readableState;var n;if(!r.objectMode){if(typeof e==="string"){t=t||r.defaultEncoding;if(t!==r.encoding){e=l.from(e,t);t=""}n=true}}else{n=true}return E(this,e,t,false,n)};C.prototype.unshift=function(e){return E(this,e,null,true,false)};function E(e,t,r,n,i){var o=e._readableState;if(t===null){o.reading=false;M(e,o)}else{var s;if(!i)s=x(o,t);if(s){e.emit("error",s)}else if(o.objectMode||t&&t.length>0){if(typeof t!=="string"&&!o.objectMode&&Object.getPrototypeOf(t)!==l.prototype){t=h(t)}if(n){if(o.endEmitted)e.emit("error",new Error("stream.unshift() after end event"));else T(e,o,t,true)}else if(o.ended){e.emit("error",new Error("stream.push() after EOF"))}else{o.reading=false;if(o.decoder&&!r){t=o.decoder.write(t);if(o.objectMode||t.length!==0)T(e,o,t,false);else j(e,o)}else{T(e,o,t,false)}}}else if(!n){o.reading=false}}return A(o)}function T(e,t,r,n){if(t.flowing&&t.length===0&&!t.sync){e.emit("data",r);e.read(0)}else{t.length+=t.objectMode?1:r.length;if(n)t.buffer.unshift(r);else t.buffer.push(r);if(t.needReadable)B(e)}j(e,t)}function x(e,t){var r;if(!d(t)&&typeof t!=="string"&&t!==undefined&&!e.objectMode){r=new TypeError("Invalid non-string/buffer chunk")}return r}function A(e){return!e.ended&&(e.needReadable||e.length<e.highWaterMark||e.length===0)}C.prototype.isPaused=function(){return this._readableState.flowing===false};C.prototype.setEncoding=function(t){if(!b)b=e("string_decoder/").StringDecoder;this._readableState.decoder=new b(t);this._readableState.encoding=t;return this};var k=8388608;function R(e){if(e>=k){e=k}else{e--;e|=e>>>1;e|=e>>>2;e|=e>>>4;e|=e>>>8;e|=e>>>16;e++}return e}function L(e,t){if(e<=0||t.length===0&&t.ended)return 0;if(t.objectMode)return 1;if(e!==e){if(t.flowing&&t.length)return t.buffer.head.data.length;else return t.length}if(e>t.highWaterMark)t.highWaterMark=R(e);if(e<=t.length)return e;if(!t.ended){t.needReadable=true;return 0}return t.length}C.prototype.read=function(e){y("read",e);e=parseInt(e,10);var t=this._readableState;var r=e;if(e!==0)t.emittedReadable=false;if(e===0&&t.needReadable&&(t.length>=t.highWaterMark||t.ended)){y("read: emitReadable",t.length,t.ended);if(t.length===0&&t.ended)Y(this);else B(this);return null}e=L(e,t);if(e===0&&t.ended){if(t.length===0)Y(this);return null}var n=t.needReadable;y("need readable",n);if(t.length===0||t.length-e<t.highWaterMark){n=true;y("length less than watermark",n)}if(t.ended||t.reading){n=false;y("reading or ended",n)}else if(n){y("do read");t.reading=true;t.sync=true;if(t.length===0)t.needReadable=true;this._read(t.highWaterMark);t.sync=false;if(!t.reading)e=L(r,t)}var i;if(e>0)i=F(e,t);else i=null;if(i===null){t.needReadable=true;e=0}else{t.length-=e}if(t.length===0){if(!t.ended)t.needReadable=true;if(r!==e&&t.ended)Y(this)}if(i!==null)this.emit("data",i);return i};function M(e,t){if(t.ended)return;if(t.decoder){var r=t.decoder.end();if(r&&r.length){t.buffer.push(r);t.length+=t.objectMode?1:r.length}}t.ended=true;B(e)}function B(e){var t=e._readableState;t.needReadable=false;if(!t.emittedReadable){y("emitReadable",t.flowing);t.emittedReadable=true;if(t.sync)i(I,e);else I(e)}}function I(e){y("emit readable");e.emit("readable");q(e)}function j(e,t){if(!t.readingMore){t.readingMore=true;i(N,e,t)}}function N(e,t){var r=t.length;while(!t.reading&&!t.flowing&&!t.ended&&t.length<t.highWaterMark){y("maybeReadMore read 0");e.read(0);if(r===t.length)break;else r=t.length}t.readingMore=false}C.prototype._read=function(e){this.emit("error",new Error("_read() is not implemented"))};C.prototype.pipe=function(e,t){var n=this;var o=this._readableState;switch(o.pipesCount){case 0:o.pipes=e;break;case 1:o.pipes=[o.pipes,e];break;default:o.pipes.push(e);break}o.pipesCount+=1;y("pipe count=%d opts=%j",o.pipesCount,t);var s=(!t||t.end!==false)&&e!==r.stdout&&e!==r.stderr;var a=s?l:w;if(o.endEmitted)i(a);else n.once("end",a);e.on("unpipe",u);function u(e,t){y("onunpipe");if(e===n){if(t&&t.hasUnpiped===false){t.hasUnpiped=true;d()}}}function l(){y("onend");e.end()}var c=O(n);e.on("drain",c);var h=false;function d(){y("cleanup");e.removeListener("close",m);e.removeListener("finish",b);e.removeListener("drain",c);e.removeListener("error",v);e.removeListener("unpipe",u);n.removeListener("end",l);n.removeListener("end",w);n.removeListener("data",g);h=true;if(o.awaitDrain&&(!e._writableState||e._writableState.needDrain))c()}var p=false;n.on("data",g);function g(t){y("ondata");p=false;var r=e.write(t);if(false===r&&!p){if((o.pipesCount===1&&o.pipes===e||o.pipesCount>1&&Z(o.pipes,e)!==-1)&&!h){y("false write response, pause",n._readableState.awaitDrain);n._readableState.awaitDrain++;p=true}n.pause()}}function v(t){y("onerror",t);w();e.removeListener("error",v);if(f(e,"error")===0)e.emit("error",t)}_(e,"error",v);function m(){e.removeListener("finish",b);w()}e.once("close",m);function b(){y("onfinish");e.removeListener("close",m);w()}e.once("finish",b);function w(){y("unpipe");n.unpipe(e)}e.emit("pipe",n);if(!o.flowing){y("pipe resume");n.resume()}return e};function O(e){return function(){var t=e._readableState;y("pipeOnDrain",t.awaitDrain);if(t.awaitDrain)t.awaitDrain--;if(t.awaitDrain===0&&f(e,"data")){t.flowing=true;q(e)}}}C.prototype.unpipe=function(e){var t=this._readableState;var r={hasUnpiped:false};if(t.pipesCount===0)return this;if(t.pipesCount===1){if(e&&e!==t.pipes)return this;if(!e)e=t.pipes;t.pipes=null;t.pipesCount=0;t.flowing=false;if(e)e.emit("unpipe",this,r);return this}if(!e){var n=t.pipes;var i=t.pipesCount;t.pipes=null;t.pipesCount=0;t.flowing=false;for(var o=0;o<i;o++){n[o].emit("unpipe",this,r)}return this}var s=Z(t.pipes,e);if(s===-1)return this;t.pipes.splice(s,1);t.pipesCount-=1;if(t.pipesCount===1)t.pipes=t.pipes[0];e.emit("unpipe",this,r);return this};C.prototype.on=function(e,t){var r=u.prototype.on.call(this,e,t);if(e==="data"){if(this._readableState.flowing!==false)this.resume()}else if(e==="readable"){var n=this._readableState;if(!n.endEmitted&&!n.readableListening){n.readableListening=n.needReadable=true;n.emittedReadable=false;if(!n.reading){i(U,this)}else if(n.length){B(this)}}}return r};C.prototype.addListener=C.prototype.on;function U(e){y("readable nexttick read 0");e.read(0)}C.prototype.resume=function(){var e=this._readableState;if(!e.flowing){y("resume");e.flowing=true;D(this,e)}return this};function D(e,t){if(!t.resumeScheduled){t.resumeScheduled=true;i(P,e,t)}}function P(e,t){if(!t.reading){y("resume read 0");e.read(0)}t.resumeScheduled=false;t.awaitDrain=0;e.emit("resume");q(e);if(t.flowing&&!t.reading)e.read(0)}C.prototype.pause=function(){y("call pause flowing=%j",this._readableState.flowing);if(false!==this._readableState.flowing){y("pause");this._readableState.flowing=false;this.emit("pause")}return this};function q(e){var t=e._readableState;y("flow",t.flowing);while(t.flowing&&e.read()!==null){}}C.prototype.wrap=function(e){var t=this._readableState;var r=false;var n=this;e.on("end",function(){y("wrapped end");if(t.decoder&&!t.ended){var e=t.decoder.end();if(e&&e.length)n.push(e)}n.push(null)});e.on("data",function(i){y("wrapped data");if(t.decoder)i=t.decoder.write(i);if(t.objectMode&&(i===null||i===undefined))return;else if(!t.objectMode&&(!i||!i.length))return;var o=n.push(i);if(!o){r=true;e.pause()}});for(var i in e){if(this[i]===undefined&&typeof e[i]==="function"){this[i]=function(t){return function(){return e[t].apply(e,arguments)}}(i)}}for(var o=0;o<w.length;o++){e.on(w[o],n.emit.bind(n,w[o]))}n._read=function(t){y("wrapped _read",t);if(r){r=false;e.resume()}};return n};C._fromList=F;function F(e,t){if(t.length===0)return null;var r;if(t.objectMode)r=t.buffer.shift();else if(!e||e>=t.length){if(t.decoder)r=t.buffer.join("");else if(t.buffer.length===1)r=t.buffer.head.data;else r=t.buffer.concat(t.length);t.buffer.clear()}else{r=W(e,t.buffer,t.decoder)}return r}function W(e,t,r){var n;if(e<t.head.data.length){n=t.head.data.slice(0,e);t.head.data=t.head.data.slice(e)}else if(e===t.head.data.length){n=t.shift()}else{n=r?z(e,t):V(e,t)}return n}function z(e,t){var r=t.head;var n=1;var i=r.data;e-=i.length;while(r=r.next){var o=r.data;var s=e>o.length?o.length:e;if(s===o.length)i+=o;else i+=o.slice(0,e);e-=s;if(e===0){if(s===o.length){++n;if(r.next)t.head=r.next;else t.head=t.tail=null}else{t.head=r;r.data=o.slice(s)}break}++n}t.length-=n;return i}function V(e,t){var r=l.allocUnsafe(e);var n=t.head;var i=1;n.data.copy(r);e-=n.data.length;while(n=n.next){var o=n.data;var s=e>o.length?o.length:e;o.copy(r,r.length-e,0,s);e-=s;if(e===0){if(s===o.length){++i;if(n.next)t.head=n.next;else t.head=t.tail=null}else{t.head=n;n.data=o.slice(s)}break}++i}t.length-=i;return r}function Y(e){var t=e._readableState;if(t.length>0)throw new Error('"endReadable()" called on non-empty stream');if(!t.endEmitted){t.ended=true;i(H,t,e)}}function H(e,t){if(!e.endEmitted&&e.length===0){e.endEmitted=true;t.readable=false;t.emit("end")}}function J(e,t){for(var r=0,n=e.length;r<n;r++){t(e[r],r)}}function Z(e,t){for(var r=0,n=e.length;r<n;r++){if(e[r]===t)return r}return-1}}).call(this,e("_process"),typeof global!=="undefined"?global:typeof self!=="undefined"?self:typeof window!=="undefined"?window:{})},{"./_stream_duplex":17,"./internal/streams/BufferList":22,"./internal/streams/destroy":23,"./internal/streams/stream":24,_process:15,"core-util-is":4,events:7,inherits:10,isarray:12,"process-nextick-args":14,"safe-buffer":26,"string_decoder/":27,util:2}],20:[function(e,t,r){"use strict";t.exports=a;var n=e("./_stream_duplex");var i=e("core-util-is");i.inherits=e("inherits");i.inherits(a,n);function o(e){this.afterTransform=function(t,r){return s(e,t,r)};this.needTransform=false;this.transforming=false;this.writecb=null;this.writechunk=null;this.writeencoding=null}function s(e,t,r){var n=e._transformState;n.transforming=false;var i=n.writecb;if(!i){return e.emit("error",new Error("write callback called multiple times"))}n.writechunk=null;n.writecb=null;if(r!==null&&r!==undefined)e.push(r);i(t);var o=e._readableState;o.reading=false;if(o.needReadable||o.length<o.highWaterMark){e._read(o.highWaterMark)}}function a(e){if(!(this instanceof a))return new a(e);n.call(this,e);this._transformState=new o(this);var t=this;this._readableState.needReadable=true;this._readableState.sync=false;if(e){if(typeof e.transform==="function")this._transform=e.transform;if(typeof e.flush==="function")this._flush=e.flush}this.once("prefinish",function(){if(typeof this._flush==="function")this._flush(function(e,r){f(t,e,r)});else f(t)})}a.prototype.push=function(e,t){this._transformState.needTransform=false;return n.prototype.push.call(this,e,t)};a.prototype._transform=function(e,t,r){throw new Error("_transform() is not implemented")};a.prototype._write=function(e,t,r){var n=this._transformState;n.writecb=r;n.writechunk=e;n.writeencoding=t;if(!n.transforming){var i=this._readableState;if(n.needTransform||i.needReadable||i.length<i.highWaterMark)this._read(i.highWaterMark)}};a.prototype._read=function(e){var t=this._transformState;if(t.writechunk!==null&&t.writecb&&!t.transforming){t.transforming=true;this._transform(t.writechunk,t.writeencoding,t.afterTransform)}else{t.needTransform=true}};a.prototype._destroy=function(e,t){var r=this;n.prototype._destroy.call(this,e,function(e){t(e);r.emit("close")})};function f(e,t,r){if(t)return e.emit("error",t);if(r!==null&&r!==undefined)e.push(r);var n=e._writableState;var i=e._transformState;if(n.length)throw new Error("Calling transform done when ws.length != 0");if(i.transforming)throw new Error("Calling transform done when still transforming");return e.push(null)}},{"./_stream_duplex":17,"core-util-is":4,inherits:10}],21:[function(e,t,r){(function(r,n){"use strict";var i=e("process-nextick-args");t.exports=w;function o(e,t,r){this.chunk=e;this.encoding=t;this.callback=r;this.next=null}function s(e){var t=this;this.next=null;this.entry=null;this.finish=function(){U(t,e)}}var a=!r.browser&&["v0.10","v0.9."].indexOf(r.version.slice(0,5))>-1?setImmediate:i;var f;w.WritableState=m;var u=e("core-util-is");u.inherits=e("inherits");var l={deprecate:e("util-deprecate")};var c=e("./internal/streams/stream");var h=e("safe-buffer").Buffer;var d=n.Uint8Array||function(){};function p(e){return h.from(e)}function g(e){return h.isBuffer(e)||e instanceof d}var y=e("./internal/streams/destroy");u.inherits(w,c);function v(){}function m(t,r){f=f||e("./_stream_duplex");t=t||{};this.objectMode=!!t.objectMode;if(r instanceof f)this.objectMode=this.objectMode||!!t.writableObjectMode;var n=t.highWaterMark;var i=this.objectMode?16:16*1024;this.highWaterMark=n||n===0?n:i;this.highWaterMark=Math.floor(this.highWaterMark);this.finalCalled=false;this.needDrain=false;this.ending=false;this.ended=false;this.finished=false;this.destroyed=false;var o=t.decodeStrings===false;this.decodeStrings=!o;this.defaultEncoding=t.defaultEncoding||"utf8";this.length=0;this.writing=false;this.corked=0;this.sync=true;this.bufferProcessing=false;this.onwrite=function(e){k(r,e)};this.writecb=null;this.writelen=0;this.bufferedRequest=null;this.lastBufferedRequest=null;this.pendingcb=0;this.prefinished=false;this.errorEmitted=false;this.bufferedRequestCount=0;this.corkedRequestsFree=new s(this)}m.prototype.getBuffer=function e(){var t=this.bufferedRequest;var r=[];while(t){r.push(t);t=t.next}return r};(function(){try{Object.defineProperty(m.prototype,"buffer",{get:l.deprecate(function(){return this.getBuffer()},"_writableState.buffer is deprecated. Use _writableState.getBuffer "+"instead.","DEP0003")})}catch(e){}})();var b;if(typeof Symbol==="function"&&Symbol.hasInstance&&typeof Function.prototype[Symbol.hasInstance]==="function"){b=Function.prototype[Symbol.hasInstance];Object.defineProperty(w,Symbol.hasInstance,{value:function(e){if(b.call(this,e))return true;return e&&e._writableState instanceof m}})}else{b=function(e){return e instanceof this}}function w(t){f=f||e("./_stream_duplex");if(!b.call(w,this)&&!(this instanceof f)){return new w(t)}this._writableState=new m(t,this);this.writable=true;if(t){if(typeof t.write==="function")this._write=t.write;if(typeof t.writev==="function")this._writev=t.writev;if(typeof t.destroy==="function")this._destroy=t.destroy;if(typeof t.final==="function")this._final=t.final}c.call(this)}w.prototype.pipe=function(){this.emit("error",new Error("Cannot pipe, not readable"))};function _(e,t){var r=new Error("write after end");e.emit("error",r);i(t,r)}function S(e,t,r,n){var o=true;var s=false;if(r===null){s=new TypeError("May not write null values to stream")}else if(typeof r!=="string"&&r!==undefined&&!t.objectMode){s=new TypeError("Invalid non-string/buffer chunk")}if(s){e.emit("error",s);i(n,s);o=false}return o}w.prototype.write=function(e,t,r){var n=this._writableState;var i=false;var o=g(e)&&!n.objectMode;if(o&&!h.isBuffer(e)){e=p(e)}if(typeof t==="function"){r=t;t=null}if(o)t="buffer";else if(!t)t=n.defaultEncoding;if(typeof r!=="function")r=v;if(n.ended)_(this,r);else if(o||S(this,n,e,r)){n.pendingcb++;i=E(this,n,o,e,t,r)}return i};w.prototype.cork=function(){var e=this._writableState;e.corked++};w.prototype.uncork=function(){var e=this._writableState;if(e.corked){e.corked--;if(!e.writing&&!e.corked&&!e.finished&&!e.bufferProcessing&&e.bufferedRequest)M(this,e)}};w.prototype.setDefaultEncoding=function e(t){if(typeof t==="string")t=t.toLowerCase();if(!(["hex","utf8","utf-8","ascii","binary","base64","ucs2","ucs-2","utf16le","utf-16le","raw"].indexOf((t+"").toLowerCase())>-1))throw new TypeError("Unknown encoding: "+t);this._writableState.defaultEncoding=t;return this};function C(e,t,r){if(!e.objectMode&&e.decodeStrings!==false&&typeof t==="string"){t=h.from(t,r)}return t}function E(e,t,r,n,i,o){if(!r){var s=C(t,n,i);if(n!==s){r=true;i="buffer";n=s}}var a=t.objectMode?1:n.length;t.length+=a;var f=t.length<t.highWaterMark;if(!f)t.needDrain=true;if(t.writing||t.corked){var u=t.lastBufferedRequest;t.lastBufferedRequest={chunk:n,encoding:i,isBuf:r,callback:o,next:null};if(u){u.next=t.lastBufferedRequest}else{t.bufferedRequest=t.lastBufferedRequest}t.bufferedRequestCount+=1}else{T(e,t,false,a,n,i,o)}return f}function T(e,t,r,n,i,o,s){t.writelen=n;t.writecb=s;t.writing=true;t.sync=true;if(r)e._writev(i,t.onwrite);else e._write(i,o,t.onwrite);t.sync=false}function x(e,t,r,n,o){--t.pendingcb;if(r){i(o,n);i(N,e,t);e._writableState.errorEmitted=true;e.emit("error",n)}else{o(n);e._writableState.errorEmitted=true;e.emit("error",n);N(e,t)}}function A(e){e.writing=false;e.writecb=null;e.length-=e.writelen;e.writelen=0}function k(e,t){var r=e._writableState;var n=r.sync;var i=r.writecb;A(r);if(t)x(e,r,n,t,i);else{var o=B(r);if(!o&&!r.corked&&!r.bufferProcessing&&r.bufferedRequest){M(e,r)}if(n){a(R,e,r,o,i)}else{R(e,r,o,i)}}}function R(e,t,r,n){if(!r)L(e,t);t.pendingcb--;n();N(e,t)}function L(e,t){if(t.length===0&&t.needDrain){t.needDrain=false;e.emit("drain")}}function M(e,t){t.bufferProcessing=true;var r=t.bufferedRequest;if(e._writev&&r&&r.next){var n=t.bufferedRequestCount;var i=new Array(n);var o=t.corkedRequestsFree;o.entry=r;var a=0;var f=true;while(r){i[a]=r;if(!r.isBuf)f=false;r=r.next;a+=1}i.allBuffers=f;T(e,t,true,t.length,i,"",o.finish);t.pendingcb++;t.lastBufferedRequest=null;if(o.next){t.corkedRequestsFree=o.next;o.next=null}else{t.corkedRequestsFree=new s(t)}}else{while(r){var u=r.chunk;var l=r.encoding;var c=r.callback;var h=t.objectMode?1:u.length;T(e,t,false,h,u,l,c);r=r.next;if(t.writing){break}}if(r===null)t.lastBufferedRequest=null}t.bufferedRequestCount=0;t.bufferedRequest=r;t.bufferProcessing=false}w.prototype._write=function(e,t,r){r(new Error("_write() is not implemented"))};w.prototype._writev=null;w.prototype.end=function(e,t,r){var n=this._writableState;if(typeof e==="function"){r=e;e=null;t=null}else if(typeof t==="function"){r=t;t=null}if(e!==null&&e!==undefined)this.write(e,t);if(n.corked){n.corked=1;this.uncork()}if(!n.ending&&!n.finished)O(this,n,r)};function B(e){return e.ending&&e.length===0&&e.bufferedRequest===null&&!e.finished&&!e.writing}function I(e,t){e._final(function(r){t.pendingcb--;if(r){e.emit("error",r)}t.prefinished=true;e.emit("prefinish");N(e,t)})}function j(e,t){if(!t.prefinished&&!t.finalCalled){if(typeof e._final==="function"){t.pendingcb++;t.finalCalled=true;i(I,e,t)}else{t.prefinished=true;e.emit("prefinish")}}}function N(e,t){var r=B(t);if(r){j(e,t);if(t.pendingcb===0){t.finished=true;e.emit("finish")}}return r}function O(e,t,r){t.ending=true;N(e,t);if(r){if(t.finished)i(r);else e.once("finish",r)}t.ended=true;e.writable=false}function U(e,t,r){var n=e.entry;e.entry=null;while(n){var i=n.callback;t.pendingcb--;i(r);n=n.next}if(t.corkedRequestsFree){t.corkedRequestsFree.next=e}else{t.corkedRequestsFree=e}}Object.defineProperty(w.prototype,"destroyed",{get:function(){if(this._writableState===undefined){return false}return this._writableState.destroyed},set:function(e){if(!this._writableState){return}this._writableState.destroyed=e}});w.prototype.destroy=y.destroy;w.prototype._undestroy=y.undestroy;w.prototype._destroy=function(e,t){this.end();t(e)}}).call(this,e("_process"),typeof global!=="undefined"?global:typeof self!=="undefined"?self:typeof window!=="undefined"?window:{})},{"./_stream_duplex":17,"./internal/streams/destroy":23,"./internal/streams/stream":24,_process:15,"core-util-is":4,inherits:10,"process-nextick-args":14,"safe-buffer":26,"util-deprecate":28}],22:[function(e,t,r){"use strict";function n(e,t){if(!(e instanceof t)){throw new TypeError("Cannot call a class as a function")}}var i=e("safe-buffer").Buffer;function o(e,t,r){e.copy(t,r)}t.exports=function(){function e(){n(this,e);this.head=null;this.tail=null;this.length=0}e.prototype.push=function e(t){var r={data:t,next:null};if(this.length>0)this.tail.next=r;else this.head=r;this.tail=r;++this.length};e.prototype.unshift=function e(t){var r={data:t,next:this.head};if(this.length===0)this.tail=r;this.head=r;++this.length};e.prototype.shift=function e(){if(this.length===0)return;var t=this.head.data;if(this.length===1)this.head=this.tail=null;else this.head=this.head.next;--this.length;return t};e.prototype.clear=function e(){this.head=this.tail=null;this.length=0};e.prototype.join=function e(t){if(this.length===0)return"";var r=this.head;var n=""+r.data;while(r=r.next){n+=t+r.data}return n};e.prototype.concat=function e(t){if(this.length===0)return i.alloc(0);if(this.length===1)return this.head.data;var r=i.allocUnsafe(t>>>0);var n=this.head;var s=0;while(n){o(n.data,r,s);s+=n.data.length;n=n.next}return r};return e}()},{"safe-buffer":26}],23:[function(e,t,r){"use strict";var n=e("process-nextick-args");function i(e,t){var r=this;var i=this._readableState&&this._readableState.destroyed;var o=this._writableState&&this._writableState.destroyed;if(i||o){if(t){t(e)}else if(e&&(!this._writableState||!this._writableState.errorEmitted)){n(s,this,e)}return}if(this._readableState){this._readableState.destroyed=true}if(this._writableState){this._writableState.destroyed=true}this._destroy(e||null,function(e){if(!t&&e){n(s,r,e);if(r._writableState){r._writableState.errorEmitted=true}}else if(t){t(e)}})}function o(){if(this._readableState){this._readableState.destroyed=false;this._readableState.reading=false;this._readableState.ended=false;this._readableState.endEmitted=false}if(this._writableState){this._writableState.destroyed=false;this._writableState.ended=false;this._writableState.ending=false;this._writableState.finished=false;this._writableState.errorEmitted=false}}function s(e,t){e.emit("error",t)}t.exports={destroy:i,undestroy:o}},{"process-nextick-args":14}],24:[function(e,t,r){t.exports=e("events").EventEmitter},{events:7}],25:[function(e,t,r){r=t.exports=e("./lib/_stream_readable.js");r.Stream=r;r.Readable=r;r.Writable=e("./lib/_stream_writable.js");r.Duplex=e("./lib/_stream_duplex.js");r.Transform=e("./lib/_stream_transform.js");r.PassThrough=e("./lib/_stream_passthrough.js")},{"./lib/_stream_duplex.js":17,"./lib/_stream_passthrough.js":18,"./lib/_stream_readable.js":19,"./lib/_stream_transform.js":20,"./lib/_stream_writable.js":21}],26:[function(e,t,r){var n=e("buffer");var i=n.Buffer;function o(e,t){for(var r in e){t[r]=e[r]}}if(i.from&&i.alloc&&i.allocUnsafe&&i.allocUnsafeSlow){t.exports=n}else{o(n,r);r.Buffer=s}function s(e,t,r){return i(e,t,r)}o(i,s);s.from=function(e,t,r){if(typeof e==="number"){throw new TypeError("Argument must not be a number")}return i(e,t,r)};s.alloc=function(e,t,r){if(typeof e!=="number"){throw new TypeError("Argument must be a number")}var n=i(e);if(t!==undefined){if(typeof r==="string"){n.fill(t,r)}else{n.fill(t)}}else{n.fill(0)}return n}
;s.allocUnsafe=function(e){if(typeof e!=="number"){throw new TypeError("Argument must be a number")}return i(e)};s.allocUnsafeSlow=function(e){if(typeof e!=="number"){throw new TypeError("Argument must be a number")}return n.SlowBuffer(e)}},{buffer:3}],27:[function(e,t,r){"use strict";var n=e("safe-buffer").Buffer;var i=n.isEncoding||function(e){e=""+e;switch(e&&e.toLowerCase()){case"hex":case"utf8":case"utf-8":case"ascii":case"binary":case"base64":case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":case"raw":return true;default:return false}};function o(e){if(!e)return"utf8";var t;while(true){switch(e){case"utf8":case"utf-8":return"utf8";case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return"utf16le";case"latin1":case"binary":return"latin1";case"base64":case"ascii":case"hex":return e;default:if(t)return;e=(""+e).toLowerCase();t=true}}}function s(e){var t=o(e);if(typeof t!=="string"&&(n.isEncoding===i||!i(e)))throw new Error("Unknown encoding: "+e);return t||e}r.StringDecoder=a;function a(e){this.encoding=s(e);var t;switch(this.encoding){case"utf16le":this.text=p;this.end=g;t=4;break;case"utf8":this.fillLast=c;t=4;break;case"base64":this.text=y;this.end=v;t=3;break;default:this.write=m;this.end=b;return}this.lastNeed=0;this.lastTotal=0;this.lastChar=n.allocUnsafe(t)}a.prototype.write=function(e){if(e.length===0)return"";var t;var r;if(this.lastNeed){t=this.fillLast(e);if(t===undefined)return"";r=this.lastNeed;this.lastNeed=0}else{r=0}if(r<e.length)return t?t+this.text(e,r):this.text(e,r);return t||""};a.prototype.end=d;a.prototype.text=h;a.prototype.fillLast=function(e){if(this.lastNeed<=e.length){e.copy(this.lastChar,this.lastTotal-this.lastNeed,0,this.lastNeed);return this.lastChar.toString(this.encoding,0,this.lastTotal)}e.copy(this.lastChar,this.lastTotal-this.lastNeed,0,e.length);this.lastNeed-=e.length};function f(e){if(e<=127)return 0;else if(e>>5===6)return 2;else if(e>>4===14)return 3;else if(e>>3===30)return 4;return-1}function u(e,t,r){var n=t.length-1;if(n<r)return 0;var i=f(t[n]);if(i>=0){if(i>0)e.lastNeed=i-1;return i}if(--n<r)return 0;i=f(t[n]);if(i>=0){if(i>0)e.lastNeed=i-2;return i}if(--n<r)return 0;i=f(t[n]);if(i>=0){if(i>0){if(i===2)i=0;else e.lastNeed=i-3}return i}return 0}function l(e,t,r){if((t[0]&192)!==128){e.lastNeed=0;return"�".repeat(r)}if(e.lastNeed>1&&t.length>1){if((t[1]&192)!==128){e.lastNeed=1;return"�".repeat(r+1)}if(e.lastNeed>2&&t.length>2){if((t[2]&192)!==128){e.lastNeed=2;return"�".repeat(r+2)}}}}function c(e){var t=this.lastTotal-this.lastNeed;var r=l(this,e,t);if(r!==undefined)return r;if(this.lastNeed<=e.length){e.copy(this.lastChar,t,0,this.lastNeed);return this.lastChar.toString(this.encoding,0,this.lastTotal)}e.copy(this.lastChar,t,0,e.length);this.lastNeed-=e.length}function h(e,t){var r=u(this,e,t);if(!this.lastNeed)return e.toString("utf8",t);this.lastTotal=r;var n=e.length-(r-this.lastNeed);e.copy(this.lastChar,0,n);return e.toString("utf8",t,n)}function d(e){var t=e&&e.length?this.write(e):"";if(this.lastNeed)return t+"�".repeat(this.lastTotal-this.lastNeed);return t}function p(e,t){if((e.length-t)%2===0){var r=e.toString("utf16le",t);if(r){var n=r.charCodeAt(r.length-1);if(n>=55296&&n<=56319){this.lastNeed=2;this.lastTotal=4;this.lastChar[0]=e[e.length-2];this.lastChar[1]=e[e.length-1];return r.slice(0,-1)}}return r}this.lastNeed=1;this.lastTotal=2;this.lastChar[0]=e[e.length-1];return e.toString("utf16le",t,e.length-1)}function g(e){var t=e&&e.length?this.write(e):"";if(this.lastNeed){var r=this.lastTotal-this.lastNeed;return t+this.lastChar.toString("utf16le",0,r)}return t}function y(e,t){var r=(e.length-t)%3;if(r===0)return e.toString("base64",t);this.lastNeed=3-r;this.lastTotal=3;if(r===1){this.lastChar[0]=e[e.length-1]}else{this.lastChar[0]=e[e.length-2];this.lastChar[1]=e[e.length-1]}return e.toString("base64",t,e.length-r)}function v(e){var t=e&&e.length?this.write(e):"";if(this.lastNeed)return t+this.lastChar.toString("base64",0,3-this.lastNeed);return t}function m(e){return e.toString(this.encoding)}function b(e){return e&&e.length?this.write(e):""}},{"safe-buffer":26}],28:[function(e,t,r){(function(e){t.exports=r;function r(e,t){if(n("noDeprecation")){return e}var r=false;function i(){if(!r){if(n("throwDeprecation")){throw new Error(t)}else if(n("traceDeprecation")){console.trace(t)}else{console.warn(t)}r=true}return e.apply(this,arguments)}return i}function n(t){try{if(!e.localStorage)return false}catch(e){return false}var r=e.localStorage[t];if(null==r)return false;return String(r).toLowerCase()==="true"}}).call(this,typeof global!=="undefined"?global:typeof self!=="undefined"?self:typeof window!=="undefined"?window:{})},{}],"/":[function(e,t,r){(function(r){t.exports=u;var n=e("debug")("simple-peer");var i=e("get-browser-rtc");var o=e("inherits");var s=e("randombytes");var a=e("readable-stream");var f=64*1024;o(u,a.Duplex);function u(e){var t=this;if(!(t instanceof u))return new u(e);t._id=s(4).toString("hex").slice(0,7);t._debug("new peer %o",e);e=Object.assign({allowHalfOpen:false},e);a.Duplex.call(t,e);t.channelName=e.initiator?e.channelName||s(20).toString("hex"):null;t._isChromium=typeof window!=="undefined"&&!!window.webkitRTCPeerConnection;t.initiator=e.initiator||false;t.channelConfig=e.channelConfig||u.channelConfig;t.config=e.config||u.config;t.constraints=t._transformConstraints(e.constraints||u.constraints);t.offerConstraints=t._transformConstraints(e.offerConstraints||{});t.answerConstraints=t._transformConstraints(e.answerConstraints||{});t.reconnectTimer=e.reconnectTimer||false;t.sdpTransform=e.sdpTransform||function(e){return e};t.stream=e.stream||false;t.trickle=e.trickle!==undefined?e.trickle:true;t._earlyMessage=null;t.destroyed=false;t.connected=false;t.remoteAddress=undefined;t.remoteFamily=undefined;t.remotePort=undefined;t.localAddress=undefined;t.localPort=undefined;t._wrtc=e.wrtc&&typeof e.wrtc==="object"?e.wrtc:i();if(!t._wrtc){if(typeof window==="undefined"){throw new Error("No WebRTC support: Specify `opts.wrtc` option in this environment")}else{throw new Error("No WebRTC support: Not a supported browser")}}t._pcReady=false;t._channelReady=false;t._iceComplete=false;t._channel=null;t._pendingCandidates=[];t._previousStreams=[];t._chunk=null;t._cb=null;t._interval=null;t._reconnectTimeout=null;t._pc=new t._wrtc.RTCPeerConnection(t.config,t.constraints);t._isWrtc=Array.isArray(t._pc.RTCIceConnectionStates);t._isReactNativeWebrtc=typeof t._pc._peerConnectionId==="number";t._pc.oniceconnectionstatechange=function(){t._onIceStateChange()};t._pc.onicegatheringstatechange=function(){t._onIceStateChange()};t._pc.onsignalingstatechange=function(){t._onSignalingStateChange()};t._pc.onicecandidate=function(e){t._onIceCandidate(e)};if(t.initiator){var r=false;t._pc.onnegotiationneeded=function(){if(!r)t._createOffer();r=true};t._setupData({channel:t._pc.createDataChannel(t.channelName,t.channelConfig)})}else{t._pc.ondatachannel=function(e){t._setupData(e)}}if("addTrack"in t._pc){if(t.stream){t.stream.getTracks().forEach(function(e){t._pc.addTrack(e,t.stream)})}t._pc.ontrack=function(e){t._onTrack(e)}}else{if(t.stream)t._pc.addStream(t.stream);t._pc.onaddstream=function(e){t._onAddStream(e)}}if(t.initiator&&t._isWrtc){t._pc.onnegotiationneeded()}t._onFinishBound=function(){t._onFinish()};t.once("finish",t._onFinishBound)}u.WEBRTC_SUPPORT=!!i();u.config={iceServers:[{urls:"stun:stun.l.google.com:19302"},{urls:"stun:global.stun.twilio.com:3478?transport=udp"}]};u.constraints={};u.channelConfig={};Object.defineProperty(u.prototype,"bufferSize",{get:function(){var e=this;return e._channel&&e._channel.bufferedAmount||0}});u.prototype.address=function(){var e=this;return{port:e.localPort,family:"IPv4",address:e.localAddress}};u.prototype.signal=function(e){var t=this;if(t.destroyed)throw new Error("cannot signal after peer is destroyed");if(typeof e==="string"){try{e=JSON.parse(e)}catch(t){e={}}}t._debug("signal()");if(e.candidate){if(t._pc.remoteDescription)t._addIceCandidate(e.candidate);else t._pendingCandidates.push(e.candidate)}if(e.sdp){t._pc.setRemoteDescription(new t._wrtc.RTCSessionDescription(e),function(){if(t.destroyed)return;t._pendingCandidates.forEach(function(e){t._addIceCandidate(e)});t._pendingCandidates=[];if(t._pc.remoteDescription.type==="offer")t._createAnswer()},function(e){t._destroy(e)})}if(!e.sdp&&!e.candidate){t._destroy(new Error("signal() called with invalid signal data"))}};u.prototype._addIceCandidate=function(e){var t=this;try{t._pc.addIceCandidate(new t._wrtc.RTCIceCandidate(e),l,function(e){t._destroy(e)})}catch(e){t._destroy(new Error("error adding candidate: "+e.message))}};u.prototype.send=function(e){var t=this;if(t._isWrtc&&r.isBuffer(e)){e=new Uint8Array(e)}t._channel.send(e)};u.prototype.destroy=function(e){var t=this;t._destroy(null,e)};u.prototype._destroy=function(e,t){var r=this;if(r.destroyed)return;if(t)r.once("close",t);r._debug("destroy (error: %s)",e&&(e.message||e));r.readable=r.writable=false;if(!r._readableState.ended)r.push(null);if(!r._writableState.finished)r.end();r.destroyed=true;r.connected=false;r._pcReady=false;r._channelReady=false;r._previousStreams=null;r._earlyMessage=null;clearInterval(r._interval);clearTimeout(r._reconnectTimeout);r._interval=null;r._reconnectTimeout=null;r._chunk=null;r._cb=null;if(r._onFinishBound)r.removeListener("finish",r._onFinishBound);r._onFinishBound=null;if(r._pc){try{r._pc.close()}catch(e){}r._pc.oniceconnectionstatechange=null;r._pc.onicegatheringstatechange=null;r._pc.onsignalingstatechange=null;r._pc.onicecandidate=null;if("addTrack"in r._pc){r._pc.ontrack=null}else{r._pc.onaddstream=null}r._pc.onnegotiationneeded=null;r._pc.ondatachannel=null}if(r._channel){try{r._channel.close()}catch(e){}r._channel.onmessage=null;r._channel.onopen=null;r._channel.onclose=null;r._channel.onerror=null}r._pc=null;r._channel=null;if(e)r.emit("error",e);r.emit("close")};u.prototype._setupData=function(e){var t=this;if(!e.channel){return t._destroy(new Error("Data channel event is missing `channel` property"))}t._channel=e.channel;t._channel.binaryType="arraybuffer";if(typeof t._channel.bufferedAmountLowThreshold==="number"){t._channel.bufferedAmountLowThreshold=f}t.channelName=t._channel.label;t._channel.onmessage=function(e){if(!t._channelReady){t._earlyMessage=e;t._onChannelOpen()}else{t._onChannelMessage(e)}};t._channel.onbufferedamountlow=function(){t._onChannelBufferedAmountLow()};t._channel.onopen=function(){if(!t._channelReady)t._onChannelOpen()};t._channel.onclose=function(){t._onChannelClose()};t._channel.onerror=function(e){t._destroy(e)}};u.prototype._read=function(){};u.prototype._write=function(e,t,r){var n=this;if(n.destroyed)return r(new Error("cannot write after peer is destroyed"));if(n.connected){try{n.send(e)}catch(e){return n._destroy(e)}if(n._channel.bufferedAmount>f){n._debug("start backpressure: bufferedAmount %d",n._channel.bufferedAmount);n._cb=r}else{r(null)}}else{n._debug("write before connect");n._chunk=e;n._cb=r}};u.prototype._onFinish=function(){var e=this;if(e.destroyed)return;if(e.connected){t()}else{e.once("connect",t)}function t(){setTimeout(function(){e._destroy()},1e3)}};u.prototype._createOffer=function(){var e=this;if(e.destroyed)return;e._pc.createOffer(function(t){if(e.destroyed)return;t.sdp=e.sdpTransform(t.sdp);e._pc.setLocalDescription(t,r,n);function r(){if(e.destroyed)return;if(e.trickle||e._iceComplete)i();else e.once("_iceComplete",i)}function n(t){e._destroy(t)}function i(){var r=e._pc.localDescription||t;e._debug("signal");e.emit("signal",{type:r.type,sdp:r.sdp})}},function(t){e._destroy(t)},e.offerConstraints)};u.prototype._createAnswer=function(){var e=this;if(e.destroyed)return;e._pc.createAnswer(function(t){if(e.destroyed)return;t.sdp=e.sdpTransform(t.sdp);e._pc.setLocalDescription(t,r,n);function r(){if(e.destroyed)return;if(e.trickle||e._iceComplete)i();else e.once("_iceComplete",i)}function n(t){e._destroy(t)}function i(){var r=e._pc.localDescription||t;e._debug("signal");e.emit("signal",{type:r.type,sdp:r.sdp})}},function(t){e._destroy(t)},e.answerConstraints)};u.prototype._onIceStateChange=function(){var e=this;if(e.destroyed)return;var t=e._pc.iceConnectionState;var r=e._pc.iceGatheringState;e._debug("iceStateChange (connection: %s) (gathering: %s)",t,r);e.emit("iceStateChange",t,r);if(t==="connected"||t==="completed"){clearTimeout(e._reconnectTimeout);e._pcReady=true;e._maybeReady()}if(t==="disconnected"){if(e.reconnectTimer){clearTimeout(e._reconnectTimeout);e._reconnectTimeout=setTimeout(function(){e._destroy()},e.reconnectTimer)}else{e._destroy()}}if(t==="failed"){e._destroy(new Error("Ice connection failed."))}if(t==="closed"){e._destroy()}};u.prototype.getStats=function(e){var t=this;if(t._pc.getStats.length===0){t._pc.getStats().then(function(t){var r=[];t.forEach(function(e){r.push(e)});e(null,r)},function(t){e(t)})}else if(t._isReactNativeWebrtc){t._pc.getStats(null,function(t){var r=[];t.forEach(function(e){r.push(e)});e(null,r)},function(t){e(t)})}else if(t._pc.getStats.length>0){t._pc.getStats(function(r){if(t.destroyed)return;var n=[];r.result().forEach(function(e){var t={};e.names().forEach(function(r){t[r]=e.stat(r)});t.id=e.id;t.type=e.type;t.timestamp=e.timestamp;n.push(t)});e(null,n)},function(t){e(t)})}else{e(null,[])}};u.prototype._maybeReady=function(){var e=this;e._debug("maybeReady pc %s channel %s",e._pcReady,e._channelReady);if(e.connected||e._connecting||!e._pcReady||!e._channelReady)return;e._connecting=true;function t(){if(e.destroyed)return;e.getStats(function(r,n){if(e.destroyed)return;if(r)n=[];var i={};var o={};var s={};var a=false;n.forEach(function(e){if(e.type==="remotecandidate"||e.type==="remote-candidate"){i[e.id]=e}if(e.type==="localcandidate"||e.type==="local-candidate"){o[e.id]=e}if(e.type==="candidatepair"||e.type==="candidate-pair"){s[e.id]=e}});n.forEach(function(e){if(e.type==="transport"){f(s[e.selectedCandidatePairId])}if(e.type==="googCandidatePair"&&e.googActiveConnection==="true"||(e.type==="candidatepair"||e.type==="candidate-pair")&&e.selected){f(e)}});function f(t){a=true;var r=o[t.localCandidateId];if(r&&r.ip){e.localAddress=r.ip;e.localPort=Number(r.port)}else if(r&&r.ipAddress){e.localAddress=r.ipAddress;e.localPort=Number(r.portNumber)}else if(typeof t.googLocalAddress==="string"){r=t.googLocalAddress.split(":");e.localAddress=r[0];e.localPort=Number(r[1])}var n=i[t.remoteCandidateId];if(n&&n.ip){e.remoteAddress=n.ip;e.remotePort=Number(n.port)}else if(n&&n.ipAddress){e.remoteAddress=n.ipAddress;e.remotePort=Number(n.portNumber)}else if(typeof t.googRemoteAddress==="string"){n=t.googRemoteAddress.split(":");e.remoteAddress=n[0];e.remotePort=Number(n[1])}e.remoteFamily="IPv4";e._debug("connect local: %s:%s remote: %s:%s",e.localAddress,e.localPort,e.remoteAddress,e.remotePort)}if(!a&&n.length){setTimeout(t,100);return}else{e._connecting=false;e.connected=true}if(e._chunk){try{e.send(e._chunk)}catch(r){return e._destroy(r)}e._chunk=null;e._debug('sent chunk from "write before connect"');var u=e._cb;e._cb=null;u(null)}if(typeof e._channel.bufferedAmountLowThreshold!=="number"){e._interval=setInterval(function(){e._onInterval()},150);if(e._interval.unref)e._interval.unref()}e._debug("connect");e.emit("connect");if(e._earlyMessage){e._onChannelMessage(e._earlyMessage);e._earlyMessage=null}})}t()};u.prototype._onInterval=function(){if(!this._cb||!this._channel||this._channel.bufferedAmount>f){return}this._onChannelBufferedAmountLow()};u.prototype._onSignalingStateChange=function(){var e=this;if(e.destroyed)return;e._debug("signalingStateChange %s",e._pc.signalingState);e.emit("signalingStateChange",e._pc.signalingState)};u.prototype._onIceCandidate=function(e){var t=this;if(t.destroyed)return;if(e.candidate&&t.trickle){t.emit("signal",{candidate:{candidate:e.candidate.candidate,sdpMLineIndex:e.candidate.sdpMLineIndex,sdpMid:e.candidate.sdpMid}})}else if(!e.candidate){t._iceComplete=true;t.emit("_iceComplete")}};u.prototype._onChannelMessage=function(e){var t=this;if(t.destroyed)return;var n=e.data;if(n instanceof ArrayBuffer)n=r.from(n);t.push(n)};u.prototype._onChannelBufferedAmountLow=function(){var e=this;if(e.destroyed||!e._cb)return;e._debug("ending backpressure: bufferedAmount %d",e._channel.bufferedAmount);var t=e._cb;e._cb=null;t(null)};u.prototype._onChannelOpen=function(){var e=this;if(e.connected||e.destroyed)return;e._debug("on channel open");e._channelReady=true;e._maybeReady()};u.prototype._onChannelClose=function(){var e=this;if(e.destroyed)return;e._debug("on channel close");e._destroy()};u.prototype._onAddStream=function(e){var t=this;if(t.destroyed)return;t._debug("on add stream");t.emit("stream",e.stream)};u.prototype._onTrack=function(e){var t=this;if(t.destroyed)return;t._debug("on track");var r=e.streams[0].id;if(t._previousStreams.indexOf(r)!==-1)return;t._previousStreams.push(r);t.emit("stream",e.streams[0])};u.prototype._debug=function(){var e=this;var t=[].slice.call(arguments);t[0]="["+e._id+"] "+t[0];n.apply(null,t)};u.prototype._transformConstraints=function(e){var t=this;if(Object.keys(e).length===0){return e}if((e.mandatory||e.optional)&&!t._isChromium){var r=Object.assign({},e.optional,e.mandatory);if(r.OfferToReceiveVideo!==undefined){r.offerToReceiveVideo=r.OfferToReceiveVideo;delete r["OfferToReceiveVideo"]}if(r.OfferToReceiveAudio!==undefined){r.offerToReceiveAudio=r.OfferToReceiveAudio;delete r["OfferToReceiveAudio"]}return r}else if(!e.mandatory&&!e.optional&&t._isChromium){if(e.offerToReceiveVideo!==undefined){e.OfferToReceiveVideo=e.offerToReceiveVideo;delete e["offerToReceiveVideo"]}if(e.offerToReceiveAudio!==undefined){e.OfferToReceiveAudio=e.offerToReceiveAudio;delete e["offerToReceiveAudio"]}return{mandatory:e}}return e};function l(){}}).call(this,e("buffer").Buffer)},{buffer:3,debug:5,"get-browser-rtc":8,inherits:10,randombytes:16,"readable-stream":25}]},{},[])("/")});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],2:[function(require,module,exports){
/* eslint-env browser */
/* eslint no-use-before-define: ["error", { "functions": false }] */

const Peer = require('simple-peer');

const peerMethods = function (peer) {
  peer.on("error", err => {
    console.log(err)
  });

  /* Signal is automatically called when a new peer is created with {initiator:true} parameter. This generates the offer object to be sent to the peer.
  Upon receiving the offer object by the receiver, invoke p.signal with the offer object as its parameter. This will generate the answer object. Do the same with the host with the answer object. */
  peer.on("signal", (data) => {
    handleOnSignal(data, peerId)
  });

  // listener for when P2P is established. Ice candidates sent first, then media data itself.
  peer.on('connect', () => {
    handleOnConnect();
  })

  // listener for when data is being received
  peer.on('data', function (data) {
    handleOnData(data)
  })

  peer.on('close', function () {
    console.log('P2P closed')
    assetsDownloaded ? createInitiator() : createInitiator('base')
  })
};

// peer configuration object from server
const configuration = {};

// placeholder for webrtc peer and socket
// track if assets have been downloaded, determines if peer can be an initiator
// peerID is the the socket.id of the initiator.
// candidates is an array of the ice candidates to send once p2p is established
// socket placeholder is for when page is opened on mobile.
// if no placeholder, browser logs reference error to socket.
let socket = { on: () => { } };
let p = null;
let assetsDownloaded = false;
let peerId = '';
let candidates = [];

// global variables for data parsing/transfer and lazy image loading
let imageData;
let counter = 0;
let extCounter = 0;
let otherCounter = 0;

// used to time the asset load time
const browserOpenTime = new Date();
let currentTime = new Date();
let peersConnectedTime;
let connectionDestroyedTime;

// get img tag nodes
const imageArray = document.getElementsByTagName('img');

// assign ids to image
for (const key in imageArray) {
  if (!isNaN(key)) imageArray[key].setAttribute('id', key);
}
// image Id to append timestamp on each image
let imageId = 0;

// checks if broswer is opened from mobile
const isMobile = checkForMobile();
console.log('Am I on mobile?: ', isMobile);

// Establish connection if not mobile
// if mobile load from server and don't create a socket connection
if (isMobile) {
  loadAssetsFromServer()
} else {
  socket = io.connect();
}

// server is empty or assets downloaded so create initiator
socket.on('create_base_initiator', (assetTypes, foldLoading) => {
  // save peer configuration object to front end for host
  configuration.assetTypes = assetTypes;
  configuration.foldLoading = foldLoading;
  document.getElementById('downloaded_from').innerHTML = 'Assets downloaded from the SERVER!';
  document.getElementById('downloaded_from').style.display = '';
  // download assets from server, create initiator peer
  // tell server assets were downloaded and send answer object to server
  // (this happens when new peer is created with initiator key true)
  createInitiator(true);
});
// Create receiver peer; server determined that this peer can be a receiver and
// sent a stored offer object from an avaliable initiator
socket.on('create_receiver_peer', (initiatorData, assetTypes, foldLoading) => {
  console.log('creating receiver peer');
  // save peer configuration object to front end for peer
  configuration.assetTypes = assetTypes;
  configuration.foldLoading = foldLoading;
  p = new Peer({
    initiator: false,
    trickle: false,
    reconnectTimer: 100,
  });
  peerMethods(p);
  p.signal(initiatorData.offer);
  // peerId is the socket id of the avaliable initiator that this peer will pair with
  peerId = initiatorData.peerId;
  // location data of peer to render on page for demo

  document.getElementsByClassName('loading_gif')[0].style.display = 'none';
  document.getElementById('downloaded_from').innerHTML = 'Assets downloaded from a PEER!';
  document.getElementById('downloaded_from').style.display = '';
  document.getElementById('report').style.display = '';
  document.getElementById('peer_info').style.display = '';
  if (initiatorData.location) {
    const { location } = initiatorData;
    document.getElementById('peer_info').innerHTML +=
      `<br>* Received data from ${location.city}, ${location.regionCode}, ${location.country} ${location.zipCode};`;
  }
});

// answer object has arrived to the initiator. Connection will when the signal(message) is invoked.
socket.on('answer_to_initiator', (message, peerLocation) => {
  console.log('answer_to_initiator');
  // this final signal where initiator receives the answer does not call
  // handleOnSignal/.on('signal'), it goes handleOnConnect.
  p.signal(message);

  // location data of peer to render on page for demo
  document.getElementById('peer_info').style.display = '';
  if (peerLocation) {
    document.getElementById('peer_info').innerHTML +=
      `<br>* Sent data to ${peerLocation.city}, ${peerLocation.regionCode}, ${peerLocation.country} ${peerLocation.zipCode};`;
  }
});

// handles all signals
function handleOnSignal(data) {
  // send offer object to server for server to store
  if (data.type === 'offer') {
    console.log('Emitting offer_to_server.');
    socket.emit('offer_to_server', { offer: data });
  }
  // send answer object to server for server to send to avaliable initiator
  if (data.type === 'answer') {
    console.log('Emitting answer_to_server.');
    socket.emit('answer_to_server', { answer: data, peerId });
  }
  // After the offer/answer object is generated, ice candidates are generated as
  // well. These are stored to be sent after the P2P connection is established.
  if (data.candidate) {
    candidates.push(data);
  }
}

// handles when peers are connected through P2P
function handleOnConnect() {
  console.log('CONNECTED');
  reportTime(peersConnectedTime, currentTime, 'time_to_connect');
  // send ice candidates if exist
  if (candidates.length) {
    console.log(`Sending ${candidates.length} ice candidates.`);
    p.send(JSON.stringify(candidates));
    candidates = [];
  }
  // send assets if initiator (uncomment this if trickle off for receiver)
  if (assetsDownloaded) {
    sendAssetsToPeer(p);
  }
}

let imageHeight;
// handles when data is being received

function handleOnData(data) {
  const dataString = data.toString();

  if (dataString.slice(0, 1) === '[') {
    const receivedCandidates = JSON.parse(data);
    receivedCandidates.forEach((ele) => {
      console.log('got candidate');
      p.signal(ele);
    });
    console.log('Received all ice candidates.');
    // // send assets if initiator
    // // uncomment this if receiver trickle on
    // if (assetsDownloaded) {
    //   sendAssetsToPeer(p)
    // }
    return;
  }

  if (dataString.slice(0, 7) === 'test123') {
    setImageHeights(dataString, imageArray);
    return;
  }

  loopImage();

  if (dataString.slice(0, 12) == 'FINISHED-YUY') {
    const imageIndex = data.slice(12);
    // reportTime(dataReceivedTime, currentTime, 'time_to_receive');
    // append time it took to receive image data
    document.getElementById(imageId).parentNode.appendChild(document.createTextNode(`${new Date() - currentTime} ms`));
    currentTime = new Date();
    imageId += 1;
    setImage(imageData, imageArray, imageIndex);
    imageData = '';
    if (counter + extCounter === imageArray.length) {
      console.log('All assets downloaded!');
      assetsDownloaded = true;
      console.log('DESTROYING PEERS');
      reportTime(connectionDestroyedTime, currentTime, 'time_to_destroy');
      reportTime(connectionDestroyedTime, browserOpenTime, 'time_total');
      currentTime = new Date();
      p.destroy();
      checkForImageError(imageArray);
      document.getElementById('downloaded_from').innerHTML = 'Assets got from PEER!!';
    }
  } else {
    imageData += dataString;
  }
}

function loopImage() {
  function returnFunc() {
    if (otherCounter >= 1) return;
    for (let i = 0; i < imageArray.length; i += 1) {
      const imageSource = imageArray[i].dataset.src;
      const extension = getImageType(imageArray[i]);
      const foldLoading = configuration.foldLoading ? isElementInViewport(imageArray[i]) : false;
      if (!configuration.assetTypes.includes(extension)) {
        extCounter += 1;
        setServerImage(imageSource);
      }
      if (foldLoading) {
        setServerImage(imageSource);
      }
    }
    otherCounter += 1;
  }
  return returnFunc();
}

function setImage(imageData, imageArray, index) {
  console.log('Received all data for an image. Setting image.');
  counter += 1;
  if (!isElementInViewport(imageArray[index])) {
    if (imageData.slice(0, 9) === 'undefined') imageArray[index].src = imageData.slice(9);
    else imageArray[index].src = imageData;
  }
}

function setImageHeights(dataString, imageArray) {
  imageHeight = JSON.parse(dataString.slice(7));
  imageHeight.forEach((element, idx) => {
    imageArray[idx].style.height = `${element}px`;
  });
}

// Creates an initiator (therefore emitting a signal that creates an offer). The base parameter determines if initiator should download assets from server (example: there are no other initiators connected or client's peer got disconnected).
function createInitiator(base) {
  if (base) {
    loadAssetsFromServer();
    assetsDownloaded = true;
  }
  p = new Peer({
    initiator: true,
    trickle: false,
    reconnectTimer: 100,
  });
  peerMethods(p);
}

// data chunking/parsing
function sendAssetsToPeer(peer) {
  sendImageHeights(imageArray, peer);
  for (let i = 0; i < imageArray.length; i += 1) {
    const imageType = getImageType(imageArray[i]);
    if (configuration.assetTypes.includes(imageType)) {
      sendImage(imageArray[i], peer, i);
    }
    console.log('message sent');
  }
}

function sendImageHeights(imageArray, peer) {
  const imageHeights = [];
  for (let f = 0; f < imageArray.length; f++) {
    imageHeights.push(imageArray[f].height);
  }
  peer.send(`test123 ${JSON.stringify(imageHeights)}`);
}

function getImageType(image) {
  const imageSrc = image.dataset.src;
  const regex = /(?:\.([^.]+))?$/;
  return regex.exec(imageSrc)[1];
}

function sendImage(image, peer, imageIndex) {
  let data = getImageData(image);
  let CHUNK_SIZE = 60000;
  let n = data.length / CHUNK_SIZE;
  for (let f = 0; f < n; f++) {
    let start = f * CHUNK_SIZE;
    let end = (f + 1) * CHUNK_SIZE;
    console.log(data.slice(start, end));
    peer.send(data.slice(start, end))
  }
  if (data.length % CHUNK_SIZE) {
    console.log(data.slice(n * CHUNK_SIZE));
    peer.send(data.slice(n * CHUNK_SIZE))
  }
  peer.send(`FINISHED-YUY${imageIndex}`);
}

// download assets from server
function loadAssetsFromServer() {
  console.log('LOAD ASSETS FROM SERVER');

  // take off loading gif
  document.getElementsByClassName('loading_gif')[0].style.display = 'none';

  for (let i = 0; i < imageArray.length; i += 1) {
    const imageSrc = imageArray[i].dataset.src;
    setServerImage(imageSrc);
  }
  // report time it took to load assets from server
  document.getElementById('time_total_from_server').innerHTML = `Time it took to load from server: ${new Date() - browserOpenTime} ms  `;
}

function getImageData(image) {
  let canvas = document.createElement('canvas');
  let context = canvas.getContext('2d');
  let img = image;
  let type = getImageType(image);
  context.canvas.width = img.width;
  context.canvas.height = img.height;
  context.drawImage(img, 0, 0, img.width, img.height);
  return canvas.toDataURL(`image/${type}`);
}

function isElementInViewport(el) {
  const rect = el.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

// function that reports time to DOM
function reportTime(time, currentOrTotal, domId) {
  time = new Date();
  document.getElementById(domId).innerHTML += `<span class="bold">${time - currentOrTotal} ms</span>`;
  currentTime = new Date();
}

function checkForMobile() {
  testExp = new RegExp('Android|webOS|iPhone|iPad|BlackBerry|Windows Phone|Opera Mini|IEMobile|Mobile', 'i');
  return !!testExp.test(navigator.userAgent);
}

function checkForImageError(imageArray) {
  for (let i = 0; i < imageArray.length; i++) {
    let source = imageArray[i].dataset.src;
    imageArray[i].error = function () {
      setServerImage(source);
    }
  }
}

function setServerImage(imageSource) {
  document.querySelector(`[data-src='${imageSource}']`).setAttribute('src', `${imageSource}`);
}

},{"simple-peer":23}],3:[function(require,module,exports){
// establish/bind wrtc peer methods

function listeners (peer) {

  peer.on("error", err => {
    console.log(err)
  });

  /* Signal is automatically called when a new peer is created with {initiator:true} parameter. This generates the offer object to be sent to the peer.
  Upon receiving the offer object by the receiver, invoke p.signal with the offer object as its parameter. This will generate the answer object. Do the same with the host with the answer object. */
  peer.on("signal", (data) => {
    handleOnSignal(data, peerId)
  });

  // listener for when P2P is established. Ice candidates sent first, then media data itself.
  peer.on('connect', () => {
    handleOnConnect();
  })

  // listener for when data is being received
  peer.on('data', function (data) {
    handleOnData(data)
  })

  peer.on('close', function () {
    console.log('P2P closed')
    assetsDownloaded ? createInitiator() : createInitiator('base')
  })
}

},{}],4:[function(require,module,exports){
(function (Buffer){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.

function isArray(arg) {
  if (Array.isArray) {
    return Array.isArray(arg);
  }
  return objectToString(arg) === '[object Array]';
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = Buffer.isBuffer;

function objectToString(o) {
  return Object.prototype.toString.call(o);
}

}).call(this,{"isBuffer":require("../../../../../usr/local/lib/node_modules/browserify/node_modules/is-buffer/index.js")})
},{"../../../../../usr/local/lib/node_modules/browserify/node_modules/is-buffer/index.js":31}],5:[function(require,module,exports){
(function (process){
/**
 * This is the web browser implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = require('./debug');
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = 'undefined' != typeof chrome
               && 'undefined' != typeof chrome.storage
                  ? chrome.storage.local
                  : localstorage();

/**
 * Colors.
 */

exports.colors = [
  'lightseagreen',
  'forestgreen',
  'goldenrod',
  'dodgerblue',
  'darkorchid',
  'crimson'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

function useColors() {
  // NB: In an Electron preload script, document will be defined but not fully
  // initialized. Since we know we're in Chrome, we'll just detect this case
  // explicitly
  if (typeof window !== 'undefined' && window.process && window.process.type === 'renderer') {
    return true;
  }

  // is webkit? http://stackoverflow.com/a/16459606/376773
  // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
  return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
    // is firebug? http://stackoverflow.com/a/398120/376773
    (typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
    // is firefox >= v31?
    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
    (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31) ||
    // double check webkit in userAgent just in case we are in a worker
    (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
}

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

exports.formatters.j = function(v) {
  try {
    return JSON.stringify(v);
  } catch (err) {
    return '[UnexpectedJSONParseError]: ' + err.message;
  }
};


/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs(args) {
  var useColors = this.useColors;

  args[0] = (useColors ? '%c' : '')
    + this.namespace
    + (useColors ? ' %c' : ' ')
    + args[0]
    + (useColors ? '%c ' : ' ')
    + '+' + exports.humanize(this.diff);

  if (!useColors) return;

  var c = 'color: ' + this.color;
  args.splice(1, 0, c, 'color: inherit')

  // the final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into
  var index = 0;
  var lastC = 0;
  args[0].replace(/%[a-zA-Z%]/g, function(match) {
    if ('%%' === match) return;
    index++;
    if ('%c' === match) {
      // we only are interested in the *last* %c
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

function log() {
  // this hackery is required for IE8/9, where
  // the `console.log` function doesn't have 'apply'
  return 'object' === typeof console
    && console.log
    && Function.prototype.apply.call(console.log, console, arguments);
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  try {
    if (null == namespaces) {
      exports.storage.removeItem('debug');
    } else {
      exports.storage.debug = namespaces;
    }
  } catch(e) {}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  var r;
  try {
    r = exports.storage.debug;
  } catch(e) {}

  // If debug isn't set in LS, and we're in Electron, try to load $DEBUG
  if (!r && typeof process !== 'undefined' && 'env' in process) {
    r = process.env.DEBUG;
  }

  return r;
}

/**
 * Enable namespaces listed in `localStorage.debug` initially.
 */

exports.enable(load());

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
    return window.localStorage;
  } catch (e) {}
}

}).call(this,require('_process'))
},{"./debug":6,"_process":32}],6:[function(require,module,exports){

/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = createDebug.debug = createDebug['default'] = createDebug;
exports.coerce = coerce;
exports.disable = disable;
exports.enable = enable;
exports.enabled = enabled;
exports.humanize = require('ms');

/**
 * The currently active debug mode names, and names to skip.
 */

exports.names = [];
exports.skips = [];

/**
 * Map of special "%n" handling functions, for the debug "format" argument.
 *
 * Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
 */

exports.formatters = {};

/**
 * Previous log timestamp.
 */

var prevTime;

/**
 * Select a color.
 * @param {String} namespace
 * @return {Number}
 * @api private
 */

function selectColor(namespace) {
  var hash = 0, i;

  for (i in namespace) {
    hash  = ((hash << 5) - hash) + namespace.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }

  return exports.colors[Math.abs(hash) % exports.colors.length];
}

/**
 * Create a debugger with the given `namespace`.
 *
 * @param {String} namespace
 * @return {Function}
 * @api public
 */

function createDebug(namespace) {

  function debug() {
    // disabled?
    if (!debug.enabled) return;

    var self = debug;

    // set `diff` timestamp
    var curr = +new Date();
    var ms = curr - (prevTime || curr);
    self.diff = ms;
    self.prev = prevTime;
    self.curr = curr;
    prevTime = curr;

    // turn the `arguments` into a proper Array
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }

    args[0] = exports.coerce(args[0]);

    if ('string' !== typeof args[0]) {
      // anything else let's inspect with %O
      args.unshift('%O');
    }

    // apply any `formatters` transformations
    var index = 0;
    args[0] = args[0].replace(/%([a-zA-Z%])/g, function(match, format) {
      // if we encounter an escaped % then don't increase the array index
      if (match === '%%') return match;
      index++;
      var formatter = exports.formatters[format];
      if ('function' === typeof formatter) {
        var val = args[index];
        match = formatter.call(self, val);

        // now we need to remove `args[index]` since it's inlined in the `format`
        args.splice(index, 1);
        index--;
      }
      return match;
    });

    // apply env-specific formatting (colors, etc.)
    exports.formatArgs.call(self, args);

    var logFn = debug.log || exports.log || console.log.bind(console);
    logFn.apply(self, args);
  }

  debug.namespace = namespace;
  debug.enabled = exports.enabled(namespace);
  debug.useColors = exports.useColors();
  debug.color = selectColor(namespace);

  // env-specific initialization logic for debug instances
  if ('function' === typeof exports.init) {
    exports.init(debug);
  }

  return debug;
}

/**
 * Enables a debug mode by namespaces. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} namespaces
 * @api public
 */

function enable(namespaces) {
  exports.save(namespaces);

  exports.names = [];
  exports.skips = [];

  var split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
  var len = split.length;

  for (var i = 0; i < len; i++) {
    if (!split[i]) continue; // ignore empty strings
    namespaces = split[i].replace(/\*/g, '.*?');
    if (namespaces[0] === '-') {
      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
    } else {
      exports.names.push(new RegExp('^' + namespaces + '$'));
    }
  }
}

/**
 * Disable debug output.
 *
 * @api public
 */

function disable() {
  exports.enable('');
}

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

function enabled(name) {
  var i, len;
  for (i = 0, len = exports.skips.length; i < len; i++) {
    if (exports.skips[i].test(name)) {
      return false;
    }
  }
  for (i = 0, len = exports.names.length; i < len; i++) {
    if (exports.names[i].test(name)) {
      return true;
    }
  }
  return false;
}

/**
 * Coerce `val`.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api private
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}

},{"ms":9}],7:[function(require,module,exports){
// originally pulled out of simple-peer

module.exports = function getBrowserRTC () {
  if (typeof window === 'undefined') return null
  var wrtc = {
    RTCPeerConnection: window.RTCPeerConnection || window.mozRTCPeerConnection ||
      window.webkitRTCPeerConnection,
    RTCSessionDescription: window.RTCSessionDescription ||
      window.mozRTCSessionDescription || window.webkitRTCSessionDescription,
    RTCIceCandidate: window.RTCIceCandidate || window.mozRTCIceCandidate ||
      window.webkitRTCIceCandidate
  }
  if (!wrtc.RTCPeerConnection) return null
  return wrtc
}

},{}],8:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],9:[function(require,module,exports){
/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
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

module.exports = function(val, options) {
  options = options || {};
  var type = typeof val;
  if (type === 'string' && val.length > 0) {
    return parse(val);
  } else if (type === 'number' && isNaN(val) === false) {
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
  var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(
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
  if (ms >= d) {
    return Math.round(ms / d) + 'd';
  }
  if (ms >= h) {
    return Math.round(ms / h) + 'h';
  }
  if (ms >= m) {
    return Math.round(ms / m) + 'm';
  }
  if (ms >= s) {
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
  return plural(ms, d, 'day') ||
    plural(ms, h, 'hour') ||
    plural(ms, m, 'minute') ||
    plural(ms, s, 'second') ||
    ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, n, name) {
  if (ms < n) {
    return;
  }
  if (ms < n * 1.5) {
    return Math.floor(ms / n) + ' ' + name;
  }
  return Math.ceil(ms / n) + ' ' + name + 's';
}

},{}],10:[function(require,module,exports){
(function (process){
'use strict';

if (!process.version ||
    process.version.indexOf('v0.') === 0 ||
    process.version.indexOf('v1.') === 0 && process.version.indexOf('v1.8.') !== 0) {
  module.exports = nextTick;
} else {
  module.exports = process.nextTick;
}

function nextTick(fn, arg1, arg2, arg3) {
  if (typeof fn !== 'function') {
    throw new TypeError('"callback" argument must be a function');
  }
  var len = arguments.length;
  var args, i;
  switch (len) {
  case 0:
  case 1:
    return process.nextTick(fn);
  case 2:
    return process.nextTick(function afterTickOne() {
      fn.call(null, arg1);
    });
  case 3:
    return process.nextTick(function afterTickTwo() {
      fn.call(null, arg1, arg2);
    });
  case 4:
    return process.nextTick(function afterTickThree() {
      fn.call(null, arg1, arg2, arg3);
    });
  default:
    args = new Array(len - 1);
    i = 0;
    while (i < args.length) {
      args[i++] = arguments[i];
    }
    return process.nextTick(function afterTick() {
      fn.apply(null, args);
    });
  }
}

}).call(this,require('_process'))
},{"_process":32}],11:[function(require,module,exports){
(function (process,global){
'use strict'

function oldBrowser () {
  throw new Error('secure random number generation not supported by this browser\nuse chrome, FireFox or Internet Explorer 11')
}

var Buffer = require('safe-buffer').Buffer
var crypto = global.crypto || global.msCrypto

if (crypto && crypto.getRandomValues) {
  module.exports = randomBytes
} else {
  module.exports = oldBrowser
}

function randomBytes (size, cb) {
  // phantomjs needs to throw
  if (size > 65536) throw new Error('requested too many random bytes')
  // in case browserify  isn't using the Uint8Array version
  var rawBytes = new global.Uint8Array(size)

  // This will not work in older browsers.
  // See https://developer.mozilla.org/en-US/docs/Web/API/window.crypto.getRandomValues
  if (size > 0) {  // getRandomValues fails on IE if size == 0
    crypto.getRandomValues(rawBytes)
  }

  // XXX: phantomjs doesn't like a buffer being passed here
  var bytes = Buffer.from(rawBytes.buffer)

  if (typeof cb === 'function') {
    return process.nextTick(function () {
      cb(null, bytes)
    })
  }

  return bytes
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"_process":32,"safe-buffer":22}],12:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a duplex stream is just a stream that is both readable and writable.
// Since JS doesn't have multiple prototypal inheritance, this class
// prototypally inherits from Readable, and then parasitically from
// Writable.

'use strict';

/*<replacement>*/

var processNextTick = require('process-nextick-args');
/*</replacement>*/

/*<replacement>*/
var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) {
    keys.push(key);
  }return keys;
};
/*</replacement>*/

module.exports = Duplex;

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

var Readable = require('./_stream_readable');
var Writable = require('./_stream_writable');

util.inherits(Duplex, Readable);

var keys = objectKeys(Writable.prototype);
for (var v = 0; v < keys.length; v++) {
  var method = keys[v];
  if (!Duplex.prototype[method]) Duplex.prototype[method] = Writable.prototype[method];
}

function Duplex(options) {
  if (!(this instanceof Duplex)) return new Duplex(options);

  Readable.call(this, options);
  Writable.call(this, options);

  if (options && options.readable === false) this.readable = false;

  if (options && options.writable === false) this.writable = false;

  this.allowHalfOpen = true;
  if (options && options.allowHalfOpen === false) this.allowHalfOpen = false;

  this.once('end', onend);
}

// the no-half-open enforcer
function onend() {
  // if we allow half-open state, or if the writable side ended,
  // then we're ok.
  if (this.allowHalfOpen || this._writableState.ended) return;

  // no more data can be written.
  // But allow more writes to happen in this tick.
  processNextTick(onEndNT, this);
}

function onEndNT(self) {
  self.end();
}

Object.defineProperty(Duplex.prototype, 'destroyed', {
  get: function () {
    if (this._readableState === undefined || this._writableState === undefined) {
      return false;
    }
    return this._readableState.destroyed && this._writableState.destroyed;
  },
  set: function (value) {
    // we ignore the value if the stream
    // has not been initialized yet
    if (this._readableState === undefined || this._writableState === undefined) {
      return;
    }

    // backward compatibility, the user is explicitly
    // managing destroyed
    this._readableState.destroyed = value;
    this._writableState.destroyed = value;
  }
});

Duplex.prototype._destroy = function (err, cb) {
  this.push(null);
  this.end();

  processNextTick(cb, err);
};

function forEach(xs, f) {
  for (var i = 0, l = xs.length; i < l; i++) {
    f(xs[i], i);
  }
}
},{"./_stream_readable":14,"./_stream_writable":16,"core-util-is":4,"inherits":8,"process-nextick-args":10}],13:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a passthrough stream.
// basically just the most minimal sort of Transform stream.
// Every written chunk gets output as-is.

'use strict';

module.exports = PassThrough;

var Transform = require('./_stream_transform');

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

util.inherits(PassThrough, Transform);

function PassThrough(options) {
  if (!(this instanceof PassThrough)) return new PassThrough(options);

  Transform.call(this, options);
}

PassThrough.prototype._transform = function (chunk, encoding, cb) {
  cb(null, chunk);
};
},{"./_stream_transform":15,"core-util-is":4,"inherits":8}],14:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

/*<replacement>*/

var processNextTick = require('process-nextick-args');
/*</replacement>*/

module.exports = Readable;

/*<replacement>*/
var isArray = require('isarray');
/*</replacement>*/

/*<replacement>*/
var Duplex;
/*</replacement>*/

Readable.ReadableState = ReadableState;

/*<replacement>*/
var EE = require('events').EventEmitter;

var EElistenerCount = function (emitter, type) {
  return emitter.listeners(type).length;
};
/*</replacement>*/

/*<replacement>*/
var Stream = require('./internal/streams/stream');
/*</replacement>*/

// TODO(bmeurer): Change this back to const once hole checks are
// properly optimized away early in Ignition+TurboFan.
/*<replacement>*/
var Buffer = require('safe-buffer').Buffer;
var OurUint8Array = global.Uint8Array || function () {};
function _uint8ArrayToBuffer(chunk) {
  return Buffer.from(chunk);
}
function _isUint8Array(obj) {
  return Buffer.isBuffer(obj) || obj instanceof OurUint8Array;
}
/*</replacement>*/

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

/*<replacement>*/
var debugUtil = require('util');
var debug = void 0;
if (debugUtil && debugUtil.debuglog) {
  debug = debugUtil.debuglog('stream');
} else {
  debug = function () {};
}
/*</replacement>*/

var BufferList = require('./internal/streams/BufferList');
var destroyImpl = require('./internal/streams/destroy');
var StringDecoder;

util.inherits(Readable, Stream);

var kProxyEvents = ['error', 'close', 'destroy', 'pause', 'resume'];

function prependListener(emitter, event, fn) {
  // Sadly this is not cacheable as some libraries bundle their own
  // event emitter implementation with them.
  if (typeof emitter.prependListener === 'function') {
    return emitter.prependListener(event, fn);
  } else {
    // This is a hack to make sure that our error handler is attached before any
    // userland ones.  NEVER DO THIS. This is here only because this code needs
    // to continue to work with older versions of Node.js that do not include
    // the prependListener() method. The goal is to eventually remove this hack.
    if (!emitter._events || !emitter._events[event]) emitter.on(event, fn);else if (isArray(emitter._events[event])) emitter._events[event].unshift(fn);else emitter._events[event] = [fn, emitter._events[event]];
  }
}

function ReadableState(options, stream) {
  Duplex = Duplex || require('./_stream_duplex');

  options = options || {};

  // object stream flag. Used to make read(n) ignore n and to
  // make all the buffer merging and length checks go away
  this.objectMode = !!options.objectMode;

  if (stream instanceof Duplex) this.objectMode = this.objectMode || !!options.readableObjectMode;

  // the point at which it stops calling _read() to fill the buffer
  // Note: 0 is a valid value, means "don't call _read preemptively ever"
  var hwm = options.highWaterMark;
  var defaultHwm = this.objectMode ? 16 : 16 * 1024;
  this.highWaterMark = hwm || hwm === 0 ? hwm : defaultHwm;

  // cast to ints.
  this.highWaterMark = Math.floor(this.highWaterMark);

  // A linked list is used to store data chunks instead of an array because the
  // linked list can remove elements from the beginning faster than
  // array.shift()
  this.buffer = new BufferList();
  this.length = 0;
  this.pipes = null;
  this.pipesCount = 0;
  this.flowing = null;
  this.ended = false;
  this.endEmitted = false;
  this.reading = false;

  // a flag to be able to tell if the event 'readable'/'data' is emitted
  // immediately, or on a later tick.  We set this to true at first, because
  // any actions that shouldn't happen until "later" should generally also
  // not happen before the first read call.
  this.sync = true;

  // whenever we return null, then we set a flag to say
  // that we're awaiting a 'readable' event emission.
  this.needReadable = false;
  this.emittedReadable = false;
  this.readableListening = false;
  this.resumeScheduled = false;

  // has it been destroyed
  this.destroyed = false;

  // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.
  this.defaultEncoding = options.defaultEncoding || 'utf8';

  // the number of writers that are awaiting a drain event in .pipe()s
  this.awaitDrain = 0;

  // if true, a maybeReadMore has been scheduled
  this.readingMore = false;

  this.decoder = null;
  this.encoding = null;
  if (options.encoding) {
    if (!StringDecoder) StringDecoder = require('string_decoder/').StringDecoder;
    this.decoder = new StringDecoder(options.encoding);
    this.encoding = options.encoding;
  }
}

function Readable(options) {
  Duplex = Duplex || require('./_stream_duplex');

  if (!(this instanceof Readable)) return new Readable(options);

  this._readableState = new ReadableState(options, this);

  // legacy
  this.readable = true;

  if (options) {
    if (typeof options.read === 'function') this._read = options.read;

    if (typeof options.destroy === 'function') this._destroy = options.destroy;
  }

  Stream.call(this);
}

Object.defineProperty(Readable.prototype, 'destroyed', {
  get: function () {
    if (this._readableState === undefined) {
      return false;
    }
    return this._readableState.destroyed;
  },
  set: function (value) {
    // we ignore the value if the stream
    // has not been initialized yet
    if (!this._readableState) {
      return;
    }

    // backward compatibility, the user is explicitly
    // managing destroyed
    this._readableState.destroyed = value;
  }
});

Readable.prototype.destroy = destroyImpl.destroy;
Readable.prototype._undestroy = destroyImpl.undestroy;
Readable.prototype._destroy = function (err, cb) {
  this.push(null);
  cb(err);
};

// Manually shove something into the read() buffer.
// This returns true if the highWaterMark has not been hit yet,
// similar to how Writable.write() returns true if you should
// write() some more.
Readable.prototype.push = function (chunk, encoding) {
  var state = this._readableState;
  var skipChunkCheck;

  if (!state.objectMode) {
    if (typeof chunk === 'string') {
      encoding = encoding || state.defaultEncoding;
      if (encoding !== state.encoding) {
        chunk = Buffer.from(chunk, encoding);
        encoding = '';
      }
      skipChunkCheck = true;
    }
  } else {
    skipChunkCheck = true;
  }

  return readableAddChunk(this, chunk, encoding, false, skipChunkCheck);
};

// Unshift should *always* be something directly out of read()
Readable.prototype.unshift = function (chunk) {
  return readableAddChunk(this, chunk, null, true, false);
};

function readableAddChunk(stream, chunk, encoding, addToFront, skipChunkCheck) {
  var state = stream._readableState;
  if (chunk === null) {
    state.reading = false;
    onEofChunk(stream, state);
  } else {
    var er;
    if (!skipChunkCheck) er = chunkInvalid(state, chunk);
    if (er) {
      stream.emit('error', er);
    } else if (state.objectMode || chunk && chunk.length > 0) {
      if (typeof chunk !== 'string' && !state.objectMode && Object.getPrototypeOf(chunk) !== Buffer.prototype) {
        chunk = _uint8ArrayToBuffer(chunk);
      }

      if (addToFront) {
        if (state.endEmitted) stream.emit('error', new Error('stream.unshift() after end event'));else addChunk(stream, state, chunk, true);
      } else if (state.ended) {
        stream.emit('error', new Error('stream.push() after EOF'));
      } else {
        state.reading = false;
        if (state.decoder && !encoding) {
          chunk = state.decoder.write(chunk);
          if (state.objectMode || chunk.length !== 0) addChunk(stream, state, chunk, false);else maybeReadMore(stream, state);
        } else {
          addChunk(stream, state, chunk, false);
        }
      }
    } else if (!addToFront) {
      state.reading = false;
    }
  }

  return needMoreData(state);
}

function addChunk(stream, state, chunk, addToFront) {
  if (state.flowing && state.length === 0 && !state.sync) {
    stream.emit('data', chunk);
    stream.read(0);
  } else {
    // update the buffer info.
    state.length += state.objectMode ? 1 : chunk.length;
    if (addToFront) state.buffer.unshift(chunk);else state.buffer.push(chunk);

    if (state.needReadable) emitReadable(stream);
  }
  maybeReadMore(stream, state);
}

function chunkInvalid(state, chunk) {
  var er;
  if (!_isUint8Array(chunk) && typeof chunk !== 'string' && chunk !== undefined && !state.objectMode) {
    er = new TypeError('Invalid non-string/buffer chunk');
  }
  return er;
}

// if it's past the high water mark, we can push in some more.
// Also, if we have no data yet, we can stand some
// more bytes.  This is to work around cases where hwm=0,
// such as the repl.  Also, if the push() triggered a
// readable event, and the user called read(largeNumber) such that
// needReadable was set, then we ought to push more, so that another
// 'readable' event will be triggered.
function needMoreData(state) {
  return !state.ended && (state.needReadable || state.length < state.highWaterMark || state.length === 0);
}

Readable.prototype.isPaused = function () {
  return this._readableState.flowing === false;
};

// backwards compatibility.
Readable.prototype.setEncoding = function (enc) {
  if (!StringDecoder) StringDecoder = require('string_decoder/').StringDecoder;
  this._readableState.decoder = new StringDecoder(enc);
  this._readableState.encoding = enc;
  return this;
};

// Don't raise the hwm > 8MB
var MAX_HWM = 0x800000;
function computeNewHighWaterMark(n) {
  if (n >= MAX_HWM) {
    n = MAX_HWM;
  } else {
    // Get the next highest power of 2 to prevent increasing hwm excessively in
    // tiny amounts
    n--;
    n |= n >>> 1;
    n |= n >>> 2;
    n |= n >>> 4;
    n |= n >>> 8;
    n |= n >>> 16;
    n++;
  }
  return n;
}

// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function howMuchToRead(n, state) {
  if (n <= 0 || state.length === 0 && state.ended) return 0;
  if (state.objectMode) return 1;
  if (n !== n) {
    // Only flow one buffer at a time
    if (state.flowing && state.length) return state.buffer.head.data.length;else return state.length;
  }
  // If we're asking for more than the current hwm, then raise the hwm.
  if (n > state.highWaterMark) state.highWaterMark = computeNewHighWaterMark(n);
  if (n <= state.length) return n;
  // Don't have enough
  if (!state.ended) {
    state.needReadable = true;
    return 0;
  }
  return state.length;
}

// you can override either this method, or the async _read(n) below.
Readable.prototype.read = function (n) {
  debug('read', n);
  n = parseInt(n, 10);
  var state = this._readableState;
  var nOrig = n;

  if (n !== 0) state.emittedReadable = false;

  // if we're doing read(0) to trigger a readable event, but we
  // already have a bunch of data in the buffer, then just trigger
  // the 'readable' event and move on.
  if (n === 0 && state.needReadable && (state.length >= state.highWaterMark || state.ended)) {
    debug('read: emitReadable', state.length, state.ended);
    if (state.length === 0 && state.ended) endReadable(this);else emitReadable(this);
    return null;
  }

  n = howMuchToRead(n, state);

  // if we've ended, and we're now clear, then finish it up.
  if (n === 0 && state.ended) {
    if (state.length === 0) endReadable(this);
    return null;
  }

  // All the actual chunk generation logic needs to be
  // *below* the call to _read.  The reason is that in certain
  // synthetic stream cases, such as passthrough streams, _read
  // may be a completely synchronous operation which may change
  // the state of the read buffer, providing enough data when
  // before there was *not* enough.
  //
  // So, the steps are:
  // 1. Figure out what the state of things will be after we do
  // a read from the buffer.
  //
  // 2. If that resulting state will trigger a _read, then call _read.
  // Note that this may be asynchronous, or synchronous.  Yes, it is
  // deeply ugly to write APIs this way, but that still doesn't mean
  // that the Readable class should behave improperly, as streams are
  // designed to be sync/async agnostic.
  // Take note if the _read call is sync or async (ie, if the read call
  // has returned yet), so that we know whether or not it's safe to emit
  // 'readable' etc.
  //
  // 3. Actually pull the requested chunks out of the buffer and return.

  // if we need a readable event, then we need to do some reading.
  var doRead = state.needReadable;
  debug('need readable', doRead);

  // if we currently have less than the highWaterMark, then also read some
  if (state.length === 0 || state.length - n < state.highWaterMark) {
    doRead = true;
    debug('length less than watermark', doRead);
  }

  // however, if we've ended, then there's no point, and if we're already
  // reading, then it's unnecessary.
  if (state.ended || state.reading) {
    doRead = false;
    debug('reading or ended', doRead);
  } else if (doRead) {
    debug('do read');
    state.reading = true;
    state.sync = true;
    // if the length is currently zero, then we *need* a readable event.
    if (state.length === 0) state.needReadable = true;
    // call internal read method
    this._read(state.highWaterMark);
    state.sync = false;
    // If _read pushed data synchronously, then `reading` will be false,
    // and we need to re-evaluate how much data we can return to the user.
    if (!state.reading) n = howMuchToRead(nOrig, state);
  }

  var ret;
  if (n > 0) ret = fromList(n, state);else ret = null;

  if (ret === null) {
    state.needReadable = true;
    n = 0;
  } else {
    state.length -= n;
  }

  if (state.length === 0) {
    // If we have nothing in the buffer, then we want to know
    // as soon as we *do* get something into the buffer.
    if (!state.ended) state.needReadable = true;

    // If we tried to read() past the EOF, then emit end on the next tick.
    if (nOrig !== n && state.ended) endReadable(this);
  }

  if (ret !== null) this.emit('data', ret);

  return ret;
};

function onEofChunk(stream, state) {
  if (state.ended) return;
  if (state.decoder) {
    var chunk = state.decoder.end();
    if (chunk && chunk.length) {
      state.buffer.push(chunk);
      state.length += state.objectMode ? 1 : chunk.length;
    }
  }
  state.ended = true;

  // emit 'readable' now to make sure it gets picked up.
  emitReadable(stream);
}

// Don't emit readable right away in sync mode, because this can trigger
// another read() call => stack overflow.  This way, it might trigger
// a nextTick recursion warning, but that's not so bad.
function emitReadable(stream) {
  var state = stream._readableState;
  state.needReadable = false;
  if (!state.emittedReadable) {
    debug('emitReadable', state.flowing);
    state.emittedReadable = true;
    if (state.sync) processNextTick(emitReadable_, stream);else emitReadable_(stream);
  }
}

function emitReadable_(stream) {
  debug('emit readable');
  stream.emit('readable');
  flow(stream);
}

// at this point, the user has presumably seen the 'readable' event,
// and called read() to consume some data.  that may have triggered
// in turn another _read(n) call, in which case reading = true if
// it's in progress.
// However, if we're not ended, or reading, and the length < hwm,
// then go ahead and try to read some more preemptively.
function maybeReadMore(stream, state) {
  if (!state.readingMore) {
    state.readingMore = true;
    processNextTick(maybeReadMore_, stream, state);
  }
}

function maybeReadMore_(stream, state) {
  var len = state.length;
  while (!state.reading && !state.flowing && !state.ended && state.length < state.highWaterMark) {
    debug('maybeReadMore read 0');
    stream.read(0);
    if (len === state.length)
      // didn't get any data, stop spinning.
      break;else len = state.length;
  }
  state.readingMore = false;
}

// abstract method.  to be overridden in specific implementation classes.
// call cb(er, data) where data is <= n in length.
// for virtual (non-string, non-buffer) streams, "length" is somewhat
// arbitrary, and perhaps not very meaningful.
Readable.prototype._read = function (n) {
  this.emit('error', new Error('_read() is not implemented'));
};

Readable.prototype.pipe = function (dest, pipeOpts) {
  var src = this;
  var state = this._readableState;

  switch (state.pipesCount) {
    case 0:
      state.pipes = dest;
      break;
    case 1:
      state.pipes = [state.pipes, dest];
      break;
    default:
      state.pipes.push(dest);
      break;
  }
  state.pipesCount += 1;
  debug('pipe count=%d opts=%j', state.pipesCount, pipeOpts);

  var doEnd = (!pipeOpts || pipeOpts.end !== false) && dest !== process.stdout && dest !== process.stderr;

  var endFn = doEnd ? onend : unpipe;
  if (state.endEmitted) processNextTick(endFn);else src.once('end', endFn);

  dest.on('unpipe', onunpipe);
  function onunpipe(readable, unpipeInfo) {
    debug('onunpipe');
    if (readable === src) {
      if (unpipeInfo && unpipeInfo.hasUnpiped === false) {
        unpipeInfo.hasUnpiped = true;
        cleanup();
      }
    }
  }

  function onend() {
    debug('onend');
    dest.end();
  }

  // when the dest drains, it reduces the awaitDrain counter
  // on the source.  This would be more elegant with a .once()
  // handler in flow(), but adding and removing repeatedly is
  // too slow.
  var ondrain = pipeOnDrain(src);
  dest.on('drain', ondrain);

  var cleanedUp = false;
  function cleanup() {
    debug('cleanup');
    // cleanup event handlers once the pipe is broken
    dest.removeListener('close', onclose);
    dest.removeListener('finish', onfinish);
    dest.removeListener('drain', ondrain);
    dest.removeListener('error', onerror);
    dest.removeListener('unpipe', onunpipe);
    src.removeListener('end', onend);
    src.removeListener('end', unpipe);
    src.removeListener('data', ondata);

    cleanedUp = true;

    // if the reader is waiting for a drain event from this
    // specific writer, then it would cause it to never start
    // flowing again.
    // So, if this is awaiting a drain, then we just call it now.
    // If we don't know, then assume that we are waiting for one.
    if (state.awaitDrain && (!dest._writableState || dest._writableState.needDrain)) ondrain();
  }

  // If the user pushes more data while we're writing to dest then we'll end up
  // in ondata again. However, we only want to increase awaitDrain once because
  // dest will only emit one 'drain' event for the multiple writes.
  // => Introduce a guard on increasing awaitDrain.
  var increasedAwaitDrain = false;
  src.on('data', ondata);
  function ondata(chunk) {
    debug('ondata');
    increasedAwaitDrain = false;
    var ret = dest.write(chunk);
    if (false === ret && !increasedAwaitDrain) {
      // If the user unpiped during `dest.write()`, it is possible
      // to get stuck in a permanently paused state if that write
      // also returned false.
      // => Check whether `dest` is still a piping destination.
      if ((state.pipesCount === 1 && state.pipes === dest || state.pipesCount > 1 && indexOf(state.pipes, dest) !== -1) && !cleanedUp) {
        debug('false write response, pause', src._readableState.awaitDrain);
        src._readableState.awaitDrain++;
        increasedAwaitDrain = true;
      }
      src.pause();
    }
  }

  // if the dest has an error, then stop piping into it.
  // however, don't suppress the throwing behavior for this.
  function onerror(er) {
    debug('onerror', er);
    unpipe();
    dest.removeListener('error', onerror);
    if (EElistenerCount(dest, 'error') === 0) dest.emit('error', er);
  }

  // Make sure our error handler is attached before userland ones.
  prependListener(dest, 'error', onerror);

  // Both close and finish should trigger unpipe, but only once.
  function onclose() {
    dest.removeListener('finish', onfinish);
    unpipe();
  }
  dest.once('close', onclose);
  function onfinish() {
    debug('onfinish');
    dest.removeListener('close', onclose);
    unpipe();
  }
  dest.once('finish', onfinish);

  function unpipe() {
    debug('unpipe');
    src.unpipe(dest);
  }

  // tell the dest that it's being piped to
  dest.emit('pipe', src);

  // start the flow if it hasn't been started already.
  if (!state.flowing) {
    debug('pipe resume');
    src.resume();
  }

  return dest;
};

function pipeOnDrain(src) {
  return function () {
    var state = src._readableState;
    debug('pipeOnDrain', state.awaitDrain);
    if (state.awaitDrain) state.awaitDrain--;
    if (state.awaitDrain === 0 && EElistenerCount(src, 'data')) {
      state.flowing = true;
      flow(src);
    }
  };
}

Readable.prototype.unpipe = function (dest) {
  var state = this._readableState;
  var unpipeInfo = { hasUnpiped: false };

  // if we're not piping anywhere, then do nothing.
  if (state.pipesCount === 0) return this;

  // just one destination.  most common case.
  if (state.pipesCount === 1) {
    // passed in one, but it's not the right one.
    if (dest && dest !== state.pipes) return this;

    if (!dest) dest = state.pipes;

    // got a match.
    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;
    if (dest) dest.emit('unpipe', this, unpipeInfo);
    return this;
  }

  // slow case. multiple pipe destinations.

  if (!dest) {
    // remove all.
    var dests = state.pipes;
    var len = state.pipesCount;
    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;

    for (var i = 0; i < len; i++) {
      dests[i].emit('unpipe', this, unpipeInfo);
    }return this;
  }

  // try to find the right one.
  var index = indexOf(state.pipes, dest);
  if (index === -1) return this;

  state.pipes.splice(index, 1);
  state.pipesCount -= 1;
  if (state.pipesCount === 1) state.pipes = state.pipes[0];

  dest.emit('unpipe', this, unpipeInfo);

  return this;
};

// set up data events if they are asked for
// Ensure readable listeners eventually get something
Readable.prototype.on = function (ev, fn) {
  var res = Stream.prototype.on.call(this, ev, fn);

  if (ev === 'data') {
    // Start flowing on next tick if stream isn't explicitly paused
    if (this._readableState.flowing !== false) this.resume();
  } else if (ev === 'readable') {
    var state = this._readableState;
    if (!state.endEmitted && !state.readableListening) {
      state.readableListening = state.needReadable = true;
      state.emittedReadable = false;
      if (!state.reading) {
        processNextTick(nReadingNextTick, this);
      } else if (state.length) {
        emitReadable(this);
      }
    }
  }

  return res;
};
Readable.prototype.addListener = Readable.prototype.on;

function nReadingNextTick(self) {
  debug('readable nexttick read 0');
  self.read(0);
}

// pause() and resume() are remnants of the legacy readable stream API
// If the user uses them, then switch into old mode.
Readable.prototype.resume = function () {
  var state = this._readableState;
  if (!state.flowing) {
    debug('resume');
    state.flowing = true;
    resume(this, state);
  }
  return this;
};

function resume(stream, state) {
  if (!state.resumeScheduled) {
    state.resumeScheduled = true;
    processNextTick(resume_, stream, state);
  }
}

function resume_(stream, state) {
  if (!state.reading) {
    debug('resume read 0');
    stream.read(0);
  }

  state.resumeScheduled = false;
  state.awaitDrain = 0;
  stream.emit('resume');
  flow(stream);
  if (state.flowing && !state.reading) stream.read(0);
}

Readable.prototype.pause = function () {
  debug('call pause flowing=%j', this._readableState.flowing);
  if (false !== this._readableState.flowing) {
    debug('pause');
    this._readableState.flowing = false;
    this.emit('pause');
  }
  return this;
};

function flow(stream) {
  var state = stream._readableState;
  debug('flow', state.flowing);
  while (state.flowing && stream.read() !== null) {}
}

// wrap an old-style stream as the async data source.
// This is *not* part of the readable stream interface.
// It is an ugly unfortunate mess of history.
Readable.prototype.wrap = function (stream) {
  var state = this._readableState;
  var paused = false;

  var self = this;
  stream.on('end', function () {
    debug('wrapped end');
    if (state.decoder && !state.ended) {
      var chunk = state.decoder.end();
      if (chunk && chunk.length) self.push(chunk);
    }

    self.push(null);
  });

  stream.on('data', function (chunk) {
    debug('wrapped data');
    if (state.decoder) chunk = state.decoder.write(chunk);

    // don't skip over falsy values in objectMode
    if (state.objectMode && (chunk === null || chunk === undefined)) return;else if (!state.objectMode && (!chunk || !chunk.length)) return;

    var ret = self.push(chunk);
    if (!ret) {
      paused = true;
      stream.pause();
    }
  });

  // proxy all the other methods.
  // important when wrapping filters and duplexes.
  for (var i in stream) {
    if (this[i] === undefined && typeof stream[i] === 'function') {
      this[i] = function (method) {
        return function () {
          return stream[method].apply(stream, arguments);
        };
      }(i);
    }
  }

  // proxy certain important events.
  for (var n = 0; n < kProxyEvents.length; n++) {
    stream.on(kProxyEvents[n], self.emit.bind(self, kProxyEvents[n]));
  }

  // when we try to consume some more bytes, simply unpause the
  // underlying stream.
  self._read = function (n) {
    debug('wrapped _read', n);
    if (paused) {
      paused = false;
      stream.resume();
    }
  };

  return self;
};

// exposed for testing purposes only.
Readable._fromList = fromList;

// Pluck off n bytes from an array of buffers.
// Length is the combined lengths of all the buffers in the list.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function fromList(n, state) {
  // nothing buffered
  if (state.length === 0) return null;

  var ret;
  if (state.objectMode) ret = state.buffer.shift();else if (!n || n >= state.length) {
    // read it all, truncate the list
    if (state.decoder) ret = state.buffer.join('');else if (state.buffer.length === 1) ret = state.buffer.head.data;else ret = state.buffer.concat(state.length);
    state.buffer.clear();
  } else {
    // read part of list
    ret = fromListPartial(n, state.buffer, state.decoder);
  }

  return ret;
}

// Extracts only enough buffered data to satisfy the amount requested.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function fromListPartial(n, list, hasStrings) {
  var ret;
  if (n < list.head.data.length) {
    // slice is the same for buffers and strings
    ret = list.head.data.slice(0, n);
    list.head.data = list.head.data.slice(n);
  } else if (n === list.head.data.length) {
    // first chunk is a perfect match
    ret = list.shift();
  } else {
    // result spans more than one buffer
    ret = hasStrings ? copyFromBufferString(n, list) : copyFromBuffer(n, list);
  }
  return ret;
}

// Copies a specified amount of characters from the list of buffered data
// chunks.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function copyFromBufferString(n, list) {
  var p = list.head;
  var c = 1;
  var ret = p.data;
  n -= ret.length;
  while (p = p.next) {
    var str = p.data;
    var nb = n > str.length ? str.length : n;
    if (nb === str.length) ret += str;else ret += str.slice(0, n);
    n -= nb;
    if (n === 0) {
      if (nb === str.length) {
        ++c;
        if (p.next) list.head = p.next;else list.head = list.tail = null;
      } else {
        list.head = p;
        p.data = str.slice(nb);
      }
      break;
    }
    ++c;
  }
  list.length -= c;
  return ret;
}

// Copies a specified amount of bytes from the list of buffered data chunks.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function copyFromBuffer(n, list) {
  var ret = Buffer.allocUnsafe(n);
  var p = list.head;
  var c = 1;
  p.data.copy(ret);
  n -= p.data.length;
  while (p = p.next) {
    var buf = p.data;
    var nb = n > buf.length ? buf.length : n;
    buf.copy(ret, ret.length - n, 0, nb);
    n -= nb;
    if (n === 0) {
      if (nb === buf.length) {
        ++c;
        if (p.next) list.head = p.next;else list.head = list.tail = null;
      } else {
        list.head = p;
        p.data = buf.slice(nb);
      }
      break;
    }
    ++c;
  }
  list.length -= c;
  return ret;
}

function endReadable(stream) {
  var state = stream._readableState;

  // If we get here before consuming all the bytes, then that is a
  // bug in node.  Should never happen.
  if (state.length > 0) throw new Error('"endReadable()" called on non-empty stream');

  if (!state.endEmitted) {
    state.ended = true;
    processNextTick(endReadableNT, state, stream);
  }
}

function endReadableNT(state, stream) {
  // Check that we didn't get one last unshift.
  if (!state.endEmitted && state.length === 0) {
    state.endEmitted = true;
    stream.readable = false;
    stream.emit('end');
  }
}

function forEach(xs, f) {
  for (var i = 0, l = xs.length; i < l; i++) {
    f(xs[i], i);
  }
}

function indexOf(xs, x) {
  for (var i = 0, l = xs.length; i < l; i++) {
    if (xs[i] === x) return i;
  }
  return -1;
}
}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./_stream_duplex":12,"./internal/streams/BufferList":17,"./internal/streams/destroy":18,"./internal/streams/stream":19,"_process":32,"core-util-is":4,"events":29,"inherits":8,"isarray":20,"process-nextick-args":10,"safe-buffer":22,"string_decoder/":24,"util":27}],15:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a transform stream is a readable/writable stream where you do
// something with the data.  Sometimes it's called a "filter",
// but that's not a great name for it, since that implies a thing where
// some bits pass through, and others are simply ignored.  (That would
// be a valid example of a transform, of course.)
//
// While the output is causally related to the input, it's not a
// necessarily symmetric or synchronous transformation.  For example,
// a zlib stream might take multiple plain-text writes(), and then
// emit a single compressed chunk some time in the future.
//
// Here's how this works:
//
// The Transform stream has all the aspects of the readable and writable
// stream classes.  When you write(chunk), that calls _write(chunk,cb)
// internally, and returns false if there's a lot of pending writes
// buffered up.  When you call read(), that calls _read(n) until
// there's enough pending readable data buffered up.
//
// In a transform stream, the written data is placed in a buffer.  When
// _read(n) is called, it transforms the queued up data, calling the
// buffered _write cb's as it consumes chunks.  If consuming a single
// written chunk would result in multiple output chunks, then the first
// outputted bit calls the readcb, and subsequent chunks just go into
// the read buffer, and will cause it to emit 'readable' if necessary.
//
// This way, back-pressure is actually determined by the reading side,
// since _read has to be called to start processing a new chunk.  However,
// a pathological inflate type of transform can cause excessive buffering
// here.  For example, imagine a stream where every byte of input is
// interpreted as an integer from 0-255, and then results in that many
// bytes of output.  Writing the 4 bytes {ff,ff,ff,ff} would result in
// 1kb of data being output.  In this case, you could write a very small
// amount of input, and end up with a very large amount of output.  In
// such a pathological inflating mechanism, there'd be no way to tell
// the system to stop doing the transform.  A single 4MB write could
// cause the system to run out of memory.
//
// However, even in such a pathological case, only a single written chunk
// would be consumed, and then the rest would wait (un-transformed) until
// the results of the previous transformed chunk were consumed.

'use strict';

module.exports = Transform;

var Duplex = require('./_stream_duplex');

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

util.inherits(Transform, Duplex);

function TransformState(stream) {
  this.afterTransform = function (er, data) {
    return afterTransform(stream, er, data);
  };

  this.needTransform = false;
  this.transforming = false;
  this.writecb = null;
  this.writechunk = null;
  this.writeencoding = null;
}

function afterTransform(stream, er, data) {
  var ts = stream._transformState;
  ts.transforming = false;

  var cb = ts.writecb;

  if (!cb) {
    return stream.emit('error', new Error('write callback called multiple times'));
  }

  ts.writechunk = null;
  ts.writecb = null;

  if (data !== null && data !== undefined) stream.push(data);

  cb(er);

  var rs = stream._readableState;
  rs.reading = false;
  if (rs.needReadable || rs.length < rs.highWaterMark) {
    stream._read(rs.highWaterMark);
  }
}

function Transform(options) {
  if (!(this instanceof Transform)) return new Transform(options);

  Duplex.call(this, options);

  this._transformState = new TransformState(this);

  var stream = this;

  // start out asking for a readable event once data is transformed.
  this._readableState.needReadable = true;

  // we have implemented the _read method, and done the other things
  // that Readable wants before the first _read call, so unset the
  // sync guard flag.
  this._readableState.sync = false;

  if (options) {
    if (typeof options.transform === 'function') this._transform = options.transform;

    if (typeof options.flush === 'function') this._flush = options.flush;
  }

  // When the writable side finishes, then flush out anything remaining.
  this.once('prefinish', function () {
    if (typeof this._flush === 'function') this._flush(function (er, data) {
      done(stream, er, data);
    });else done(stream);
  });
}

Transform.prototype.push = function (chunk, encoding) {
  this._transformState.needTransform = false;
  return Duplex.prototype.push.call(this, chunk, encoding);
};

// This is the part where you do stuff!
// override this function in implementation classes.
// 'chunk' is an input chunk.
//
// Call `push(newChunk)` to pass along transformed output
// to the readable side.  You may call 'push' zero or more times.
//
// Call `cb(err)` when you are done with this chunk.  If you pass
// an error, then that'll put the hurt on the whole operation.  If you
// never call cb(), then you'll never get another chunk.
Transform.prototype._transform = function (chunk, encoding, cb) {
  throw new Error('_transform() is not implemented');
};

Transform.prototype._write = function (chunk, encoding, cb) {
  var ts = this._transformState;
  ts.writecb = cb;
  ts.writechunk = chunk;
  ts.writeencoding = encoding;
  if (!ts.transforming) {
    var rs = this._readableState;
    if (ts.needTransform || rs.needReadable || rs.length < rs.highWaterMark) this._read(rs.highWaterMark);
  }
};

// Doesn't matter what the args are here.
// _transform does all the work.
// That we got here means that the readable side wants more data.
Transform.prototype._read = function (n) {
  var ts = this._transformState;

  if (ts.writechunk !== null && ts.writecb && !ts.transforming) {
    ts.transforming = true;
    this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
  } else {
    // mark that we need a transform, so that any data that comes in
    // will get processed, now that we've asked for it.
    ts.needTransform = true;
  }
};

Transform.prototype._destroy = function (err, cb) {
  var _this = this;

  Duplex.prototype._destroy.call(this, err, function (err2) {
    cb(err2);
    _this.emit('close');
  });
};

function done(stream, er, data) {
  if (er) return stream.emit('error', er);

  if (data !== null && data !== undefined) stream.push(data);

  // if there's nothing in the write buffer, then that means
  // that nothing more will ever be provided
  var ws = stream._writableState;
  var ts = stream._transformState;

  if (ws.length) throw new Error('Calling transform done when ws.length != 0');

  if (ts.transforming) throw new Error('Calling transform done when still transforming');

  return stream.push(null);
}
},{"./_stream_duplex":12,"core-util-is":4,"inherits":8}],16:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// A bit simpler than readable streams.
// Implement an async ._write(chunk, encoding, cb), and it'll handle all
// the drain event emission and buffering.

'use strict';

/*<replacement>*/

var processNextTick = require('process-nextick-args');
/*</replacement>*/

module.exports = Writable;

/* <replacement> */
function WriteReq(chunk, encoding, cb) {
  this.chunk = chunk;
  this.encoding = encoding;
  this.callback = cb;
  this.next = null;
}

// It seems a linked list but it is not
// there will be only 2 of these for each stream
function CorkedRequest(state) {
  var _this = this;

  this.next = null;
  this.entry = null;
  this.finish = function () {
    onCorkedFinish(_this, state);
  };
}
/* </replacement> */

/*<replacement>*/
var asyncWrite = !process.browser && ['v0.10', 'v0.9.'].indexOf(process.version.slice(0, 5)) > -1 ? setImmediate : processNextTick;
/*</replacement>*/

/*<replacement>*/
var Duplex;
/*</replacement>*/

Writable.WritableState = WritableState;

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

/*<replacement>*/
var internalUtil = {
  deprecate: require('util-deprecate')
};
/*</replacement>*/

/*<replacement>*/
var Stream = require('./internal/streams/stream');
/*</replacement>*/

/*<replacement>*/
var Buffer = require('safe-buffer').Buffer;
var OurUint8Array = global.Uint8Array || function () {};
function _uint8ArrayToBuffer(chunk) {
  return Buffer.from(chunk);
}
function _isUint8Array(obj) {
  return Buffer.isBuffer(obj) || obj instanceof OurUint8Array;
}
/*</replacement>*/

var destroyImpl = require('./internal/streams/destroy');

util.inherits(Writable, Stream);

function nop() {}

function WritableState(options, stream) {
  Duplex = Duplex || require('./_stream_duplex');

  options = options || {};

  // object stream flag to indicate whether or not this stream
  // contains buffers or objects.
  this.objectMode = !!options.objectMode;

  if (stream instanceof Duplex) this.objectMode = this.objectMode || !!options.writableObjectMode;

  // the point at which write() starts returning false
  // Note: 0 is a valid value, means that we always return false if
  // the entire buffer is not flushed immediately on write()
  var hwm = options.highWaterMark;
  var defaultHwm = this.objectMode ? 16 : 16 * 1024;
  this.highWaterMark = hwm || hwm === 0 ? hwm : defaultHwm;

  // cast to ints.
  this.highWaterMark = Math.floor(this.highWaterMark);

  // if _final has been called
  this.finalCalled = false;

  // drain event flag.
  this.needDrain = false;
  // at the start of calling end()
  this.ending = false;
  // when end() has been called, and returned
  this.ended = false;
  // when 'finish' is emitted
  this.finished = false;

  // has it been destroyed
  this.destroyed = false;

  // should we decode strings into buffers before passing to _write?
  // this is here so that some node-core streams can optimize string
  // handling at a lower level.
  var noDecode = options.decodeStrings === false;
  this.decodeStrings = !noDecode;

  // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.
  this.defaultEncoding = options.defaultEncoding || 'utf8';

  // not an actual buffer we keep track of, but a measurement
  // of how much we're waiting to get pushed to some underlying
  // socket or file.
  this.length = 0;

  // a flag to see when we're in the middle of a write.
  this.writing = false;

  // when true all writes will be buffered until .uncork() call
  this.corked = 0;

  // a flag to be able to tell if the onwrite cb is called immediately,
  // or on a later tick.  We set this to true at first, because any
  // actions that shouldn't happen until "later" should generally also
  // not happen before the first write call.
  this.sync = true;

  // a flag to know if we're processing previously buffered items, which
  // may call the _write() callback in the same tick, so that we don't
  // end up in an overlapped onwrite situation.
  this.bufferProcessing = false;

  // the callback that's passed to _write(chunk,cb)
  this.onwrite = function (er) {
    onwrite(stream, er);
  };

  // the callback that the user supplies to write(chunk,encoding,cb)
  this.writecb = null;

  // the amount that is being written when _write is called.
  this.writelen = 0;

  this.bufferedRequest = null;
  this.lastBufferedRequest = null;

  // number of pending user-supplied write callbacks
  // this must be 0 before 'finish' can be emitted
  this.pendingcb = 0;

  // emit prefinish if the only thing we're waiting for is _write cbs
  // This is relevant for synchronous Transform streams
  this.prefinished = false;

  // True if the error was already emitted and should not be thrown again
  this.errorEmitted = false;

  // count buffered requests
  this.bufferedRequestCount = 0;

  // allocate the first CorkedRequest, there is always
  // one allocated and free to use, and we maintain at most two
  this.corkedRequestsFree = new CorkedRequest(this);
}

WritableState.prototype.getBuffer = function getBuffer() {
  var current = this.bufferedRequest;
  var out = [];
  while (current) {
    out.push(current);
    current = current.next;
  }
  return out;
};

(function () {
  try {
    Object.defineProperty(WritableState.prototype, 'buffer', {
      get: internalUtil.deprecate(function () {
        return this.getBuffer();
      }, '_writableState.buffer is deprecated. Use _writableState.getBuffer ' + 'instead.', 'DEP0003')
    });
  } catch (_) {}
})();

// Test _writableState for inheritance to account for Duplex streams,
// whose prototype chain only points to Readable.
var realHasInstance;
if (typeof Symbol === 'function' && Symbol.hasInstance && typeof Function.prototype[Symbol.hasInstance] === 'function') {
  realHasInstance = Function.prototype[Symbol.hasInstance];
  Object.defineProperty(Writable, Symbol.hasInstance, {
    value: function (object) {
      if (realHasInstance.call(this, object)) return true;

      return object && object._writableState instanceof WritableState;
    }
  });
} else {
  realHasInstance = function (object) {
    return object instanceof this;
  };
}

function Writable(options) {
  Duplex = Duplex || require('./_stream_duplex');

  // Writable ctor is applied to Duplexes, too.
  // `realHasInstance` is necessary because using plain `instanceof`
  // would return false, as no `_writableState` property is attached.

  // Trying to use the custom `instanceof` for Writable here will also break the
  // Node.js LazyTransform implementation, which has a non-trivial getter for
  // `_writableState` that would lead to infinite recursion.
  if (!realHasInstance.call(Writable, this) && !(this instanceof Duplex)) {
    return new Writable(options);
  }

  this._writableState = new WritableState(options, this);

  // legacy.
  this.writable = true;

  if (options) {
    if (typeof options.write === 'function') this._write = options.write;

    if (typeof options.writev === 'function') this._writev = options.writev;

    if (typeof options.destroy === 'function') this._destroy = options.destroy;

    if (typeof options.final === 'function') this._final = options.final;
  }

  Stream.call(this);
}

// Otherwise people can pipe Writable streams, which is just wrong.
Writable.prototype.pipe = function () {
  this.emit('error', new Error('Cannot pipe, not readable'));
};

function writeAfterEnd(stream, cb) {
  var er = new Error('write after end');
  // TODO: defer error events consistently everywhere, not just the cb
  stream.emit('error', er);
  processNextTick(cb, er);
}

// Checks that a user-supplied chunk is valid, especially for the particular
// mode the stream is in. Currently this means that `null` is never accepted
// and undefined/non-string values are only allowed in object mode.
function validChunk(stream, state, chunk, cb) {
  var valid = true;
  var er = false;

  if (chunk === null) {
    er = new TypeError('May not write null values to stream');
  } else if (typeof chunk !== 'string' && chunk !== undefined && !state.objectMode) {
    er = new TypeError('Invalid non-string/buffer chunk');
  }
  if (er) {
    stream.emit('error', er);
    processNextTick(cb, er);
    valid = false;
  }
  return valid;
}

Writable.prototype.write = function (chunk, encoding, cb) {
  var state = this._writableState;
  var ret = false;
  var isBuf = _isUint8Array(chunk) && !state.objectMode;

  if (isBuf && !Buffer.isBuffer(chunk)) {
    chunk = _uint8ArrayToBuffer(chunk);
  }

  if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (isBuf) encoding = 'buffer';else if (!encoding) encoding = state.defaultEncoding;

  if (typeof cb !== 'function') cb = nop;

  if (state.ended) writeAfterEnd(this, cb);else if (isBuf || validChunk(this, state, chunk, cb)) {
    state.pendingcb++;
    ret = writeOrBuffer(this, state, isBuf, chunk, encoding, cb);
  }

  return ret;
};

Writable.prototype.cork = function () {
  var state = this._writableState;

  state.corked++;
};

Writable.prototype.uncork = function () {
  var state = this._writableState;

  if (state.corked) {
    state.corked--;

    if (!state.writing && !state.corked && !state.finished && !state.bufferProcessing && state.bufferedRequest) clearBuffer(this, state);
  }
};

Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
  // node::ParseEncoding() requires lower case.
  if (typeof encoding === 'string') encoding = encoding.toLowerCase();
  if (!(['hex', 'utf8', 'utf-8', 'ascii', 'binary', 'base64', 'ucs2', 'ucs-2', 'utf16le', 'utf-16le', 'raw'].indexOf((encoding + '').toLowerCase()) > -1)) throw new TypeError('Unknown encoding: ' + encoding);
  this._writableState.defaultEncoding = encoding;
  return this;
};

function decodeChunk(state, chunk, encoding) {
  if (!state.objectMode && state.decodeStrings !== false && typeof chunk === 'string') {
    chunk = Buffer.from(chunk, encoding);
  }
  return chunk;
}

// if we're already writing something, then just put this
// in the queue, and wait our turn.  Otherwise, call _write
// If we return false, then we need a drain event, so set that flag.
function writeOrBuffer(stream, state, isBuf, chunk, encoding, cb) {
  if (!isBuf) {
    var newChunk = decodeChunk(state, chunk, encoding);
    if (chunk !== newChunk) {
      isBuf = true;
      encoding = 'buffer';
      chunk = newChunk;
    }
  }
  var len = state.objectMode ? 1 : chunk.length;

  state.length += len;

  var ret = state.length < state.highWaterMark;
  // we must ensure that previous needDrain will not be reset to false.
  if (!ret) state.needDrain = true;

  if (state.writing || state.corked) {
    var last = state.lastBufferedRequest;
    state.lastBufferedRequest = {
      chunk: chunk,
      encoding: encoding,
      isBuf: isBuf,
      callback: cb,
      next: null
    };
    if (last) {
      last.next = state.lastBufferedRequest;
    } else {
      state.bufferedRequest = state.lastBufferedRequest;
    }
    state.bufferedRequestCount += 1;
  } else {
    doWrite(stream, state, false, len, chunk, encoding, cb);
  }

  return ret;
}

function doWrite(stream, state, writev, len, chunk, encoding, cb) {
  state.writelen = len;
  state.writecb = cb;
  state.writing = true;
  state.sync = true;
  if (writev) stream._writev(chunk, state.onwrite);else stream._write(chunk, encoding, state.onwrite);
  state.sync = false;
}

function onwriteError(stream, state, sync, er, cb) {
  --state.pendingcb;

  if (sync) {
    // defer the callback if we are being called synchronously
    // to avoid piling up things on the stack
    processNextTick(cb, er);
    // this can emit finish, and it will always happen
    // after error
    processNextTick(finishMaybe, stream, state);
    stream._writableState.errorEmitted = true;
    stream.emit('error', er);
  } else {
    // the caller expect this to happen before if
    // it is async
    cb(er);
    stream._writableState.errorEmitted = true;
    stream.emit('error', er);
    // this can emit finish, but finish must
    // always follow error
    finishMaybe(stream, state);
  }
}

function onwriteStateUpdate(state) {
  state.writing = false;
  state.writecb = null;
  state.length -= state.writelen;
  state.writelen = 0;
}

function onwrite(stream, er) {
  var state = stream._writableState;
  var sync = state.sync;
  var cb = state.writecb;

  onwriteStateUpdate(state);

  if (er) onwriteError(stream, state, sync, er, cb);else {
    // Check if we're actually ready to finish, but don't emit yet
    var finished = needFinish(state);

    if (!finished && !state.corked && !state.bufferProcessing && state.bufferedRequest) {
      clearBuffer(stream, state);
    }

    if (sync) {
      /*<replacement>*/
      asyncWrite(afterWrite, stream, state, finished, cb);
      /*</replacement>*/
    } else {
      afterWrite(stream, state, finished, cb);
    }
  }
}

function afterWrite(stream, state, finished, cb) {
  if (!finished) onwriteDrain(stream, state);
  state.pendingcb--;
  cb();
  finishMaybe(stream, state);
}

// Must force callback to be called on nextTick, so that we don't
// emit 'drain' before the write() consumer gets the 'false' return
// value, and has a chance to attach a 'drain' listener.
function onwriteDrain(stream, state) {
  if (state.length === 0 && state.needDrain) {
    state.needDrain = false;
    stream.emit('drain');
  }
}

// if there's something in the buffer waiting, then process it
function clearBuffer(stream, state) {
  state.bufferProcessing = true;
  var entry = state.bufferedRequest;

  if (stream._writev && entry && entry.next) {
    // Fast case, write everything using _writev()
    var l = state.bufferedRequestCount;
    var buffer = new Array(l);
    var holder = state.corkedRequestsFree;
    holder.entry = entry;

    var count = 0;
    var allBuffers = true;
    while (entry) {
      buffer[count] = entry;
      if (!entry.isBuf) allBuffers = false;
      entry = entry.next;
      count += 1;
    }
    buffer.allBuffers = allBuffers;

    doWrite(stream, state, true, state.length, buffer, '', holder.finish);

    // doWrite is almost always async, defer these to save a bit of time
    // as the hot path ends with doWrite
    state.pendingcb++;
    state.lastBufferedRequest = null;
    if (holder.next) {
      state.corkedRequestsFree = holder.next;
      holder.next = null;
    } else {
      state.corkedRequestsFree = new CorkedRequest(state);
    }
  } else {
    // Slow case, write chunks one-by-one
    while (entry) {
      var chunk = entry.chunk;
      var encoding = entry.encoding;
      var cb = entry.callback;
      var len = state.objectMode ? 1 : chunk.length;

      doWrite(stream, state, false, len, chunk, encoding, cb);
      entry = entry.next;
      // if we didn't call the onwrite immediately, then
      // it means that we need to wait until it does.
      // also, that means that the chunk and cb are currently
      // being processed, so move the buffer counter past them.
      if (state.writing) {
        break;
      }
    }

    if (entry === null) state.lastBufferedRequest = null;
  }

  state.bufferedRequestCount = 0;
  state.bufferedRequest = entry;
  state.bufferProcessing = false;
}

Writable.prototype._write = function (chunk, encoding, cb) {
  cb(new Error('_write() is not implemented'));
};

Writable.prototype._writev = null;

Writable.prototype.end = function (chunk, encoding, cb) {
  var state = this._writableState;

  if (typeof chunk === 'function') {
    cb = chunk;
    chunk = null;
    encoding = null;
  } else if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (chunk !== null && chunk !== undefined) this.write(chunk, encoding);

  // .end() fully uncorks
  if (state.corked) {
    state.corked = 1;
    this.uncork();
  }

  // ignore unnecessary end() calls.
  if (!state.ending && !state.finished) endWritable(this, state, cb);
};

function needFinish(state) {
  return state.ending && state.length === 0 && state.bufferedRequest === null && !state.finished && !state.writing;
}
function callFinal(stream, state) {
  stream._final(function (err) {
    state.pendingcb--;
    if (err) {
      stream.emit('error', err);
    }
    state.prefinished = true;
    stream.emit('prefinish');
    finishMaybe(stream, state);
  });
}
function prefinish(stream, state) {
  if (!state.prefinished && !state.finalCalled) {
    if (typeof stream._final === 'function') {
      state.pendingcb++;
      state.finalCalled = true;
      processNextTick(callFinal, stream, state);
    } else {
      state.prefinished = true;
      stream.emit('prefinish');
    }
  }
}

function finishMaybe(stream, state) {
  var need = needFinish(state);
  if (need) {
    prefinish(stream, state);
    if (state.pendingcb === 0) {
      state.finished = true;
      stream.emit('finish');
    }
  }
  return need;
}

function endWritable(stream, state, cb) {
  state.ending = true;
  finishMaybe(stream, state);
  if (cb) {
    if (state.finished) processNextTick(cb);else stream.once('finish', cb);
  }
  state.ended = true;
  stream.writable = false;
}

function onCorkedFinish(corkReq, state, err) {
  var entry = corkReq.entry;
  corkReq.entry = null;
  while (entry) {
    var cb = entry.callback;
    state.pendingcb--;
    cb(err);
    entry = entry.next;
  }
  if (state.corkedRequestsFree) {
    state.corkedRequestsFree.next = corkReq;
  } else {
    state.corkedRequestsFree = corkReq;
  }
}

Object.defineProperty(Writable.prototype, 'destroyed', {
  get: function () {
    if (this._writableState === undefined) {
      return false;
    }
    return this._writableState.destroyed;
  },
  set: function (value) {
    // we ignore the value if the stream
    // has not been initialized yet
    if (!this._writableState) {
      return;
    }

    // backward compatibility, the user is explicitly
    // managing destroyed
    this._writableState.destroyed = value;
  }
});

Writable.prototype.destroy = destroyImpl.destroy;
Writable.prototype._undestroy = destroyImpl.undestroy;
Writable.prototype._destroy = function (err, cb) {
  this.end();
  cb(err);
};
}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./_stream_duplex":12,"./internal/streams/destroy":18,"./internal/streams/stream":19,"_process":32,"core-util-is":4,"inherits":8,"process-nextick-args":10,"safe-buffer":22,"util-deprecate":25}],17:[function(require,module,exports){
'use strict';

/*<replacement>*/

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Buffer = require('safe-buffer').Buffer;
/*</replacement>*/

function copyBuffer(src, target, offset) {
  src.copy(target, offset);
}

module.exports = function () {
  function BufferList() {
    _classCallCheck(this, BufferList);

    this.head = null;
    this.tail = null;
    this.length = 0;
  }

  BufferList.prototype.push = function push(v) {
    var entry = { data: v, next: null };
    if (this.length > 0) this.tail.next = entry;else this.head = entry;
    this.tail = entry;
    ++this.length;
  };

  BufferList.prototype.unshift = function unshift(v) {
    var entry = { data: v, next: this.head };
    if (this.length === 0) this.tail = entry;
    this.head = entry;
    ++this.length;
  };

  BufferList.prototype.shift = function shift() {
    if (this.length === 0) return;
    var ret = this.head.data;
    if (this.length === 1) this.head = this.tail = null;else this.head = this.head.next;
    --this.length;
    return ret;
  };

  BufferList.prototype.clear = function clear() {
    this.head = this.tail = null;
    this.length = 0;
  };

  BufferList.prototype.join = function join(s) {
    if (this.length === 0) return '';
    var p = this.head;
    var ret = '' + p.data;
    while (p = p.next) {
      ret += s + p.data;
    }return ret;
  };

  BufferList.prototype.concat = function concat(n) {
    if (this.length === 0) return Buffer.alloc(0);
    if (this.length === 1) return this.head.data;
    var ret = Buffer.allocUnsafe(n >>> 0);
    var p = this.head;
    var i = 0;
    while (p) {
      copyBuffer(p.data, ret, i);
      i += p.data.length;
      p = p.next;
    }
    return ret;
  };

  return BufferList;
}();
},{"safe-buffer":22}],18:[function(require,module,exports){
'use strict';

/*<replacement>*/

var processNextTick = require('process-nextick-args');
/*</replacement>*/

// undocumented cb() API, needed for core, not for public API
function destroy(err, cb) {
  var _this = this;

  var readableDestroyed = this._readableState && this._readableState.destroyed;
  var writableDestroyed = this._writableState && this._writableState.destroyed;

  if (readableDestroyed || writableDestroyed) {
    if (cb) {
      cb(err);
    } else if (err && (!this._writableState || !this._writableState.errorEmitted)) {
      processNextTick(emitErrorNT, this, err);
    }
    return;
  }

  // we set destroyed to true before firing error callbacks in order
  // to make it re-entrance safe in case destroy() is called within callbacks

  if (this._readableState) {
    this._readableState.destroyed = true;
  }

  // if this is a duplex stream mark the writable part as destroyed as well
  if (this._writableState) {
    this._writableState.destroyed = true;
  }

  this._destroy(err || null, function (err) {
    if (!cb && err) {
      processNextTick(emitErrorNT, _this, err);
      if (_this._writableState) {
        _this._writableState.errorEmitted = true;
      }
    } else if (cb) {
      cb(err);
    }
  });
}

function undestroy() {
  if (this._readableState) {
    this._readableState.destroyed = false;
    this._readableState.reading = false;
    this._readableState.ended = false;
    this._readableState.endEmitted = false;
  }

  if (this._writableState) {
    this._writableState.destroyed = false;
    this._writableState.ended = false;
    this._writableState.ending = false;
    this._writableState.finished = false;
    this._writableState.errorEmitted = false;
  }
}

function emitErrorNT(self, err) {
  self.emit('error', err);
}

module.exports = {
  destroy: destroy,
  undestroy: undestroy
};
},{"process-nextick-args":10}],19:[function(require,module,exports){
module.exports = require('events').EventEmitter;

},{"events":29}],20:[function(require,module,exports){
var toString = {}.toString;

module.exports = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};

},{}],21:[function(require,module,exports){
exports = module.exports = require('./lib/_stream_readable.js');
exports.Stream = exports;
exports.Readable = exports;
exports.Writable = require('./lib/_stream_writable.js');
exports.Duplex = require('./lib/_stream_duplex.js');
exports.Transform = require('./lib/_stream_transform.js');
exports.PassThrough = require('./lib/_stream_passthrough.js');

},{"./lib/_stream_duplex.js":12,"./lib/_stream_passthrough.js":13,"./lib/_stream_readable.js":14,"./lib/_stream_transform.js":15,"./lib/_stream_writable.js":16}],22:[function(require,module,exports){
/* eslint-disable node/no-deprecated-api */
var buffer = require('buffer')
var Buffer = buffer.Buffer

// alternative to using Object.keys for old browsers
function copyProps (src, dst) {
  for (var key in src) {
    dst[key] = src[key]
  }
}
if (Buffer.from && Buffer.alloc && Buffer.allocUnsafe && Buffer.allocUnsafeSlow) {
  module.exports = buffer
} else {
  // Copy properties from require('buffer')
  copyProps(buffer, exports)
  exports.Buffer = SafeBuffer
}

function SafeBuffer (arg, encodingOrOffset, length) {
  return Buffer(arg, encodingOrOffset, length)
}

// Copy static methods from Buffer
copyProps(Buffer, SafeBuffer)

SafeBuffer.from = function (arg, encodingOrOffset, length) {
  if (typeof arg === 'number') {
    throw new TypeError('Argument must not be a number')
  }
  return Buffer(arg, encodingOrOffset, length)
}

SafeBuffer.alloc = function (size, fill, encoding) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  var buf = Buffer(size)
  if (fill !== undefined) {
    if (typeof encoding === 'string') {
      buf.fill(fill, encoding)
    } else {
      buf.fill(fill)
    }
  } else {
    buf.fill(0)
  }
  return buf
}

SafeBuffer.allocUnsafe = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return Buffer(size)
}

SafeBuffer.allocUnsafeSlow = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return buffer.SlowBuffer(size)
}

},{"buffer":28}],23:[function(require,module,exports){
(function (Buffer){
module.exports = Peer

var debug = require('debug')('simple-peer')
var getBrowserRTC = require('get-browser-rtc')
var inherits = require('inherits')
var randombytes = require('randombytes')
var stream = require('readable-stream')

var MAX_BUFFERED_AMOUNT = 64 * 1024

inherits(Peer, stream.Duplex)

/**
 * WebRTC peer connection. Same API as node core `net.Socket`, plus a few extra methods.
 * Duplex stream.
 * @param {Object} opts
 */
function Peer (opts) {
  var self = this
  if (!(self instanceof Peer)) return new Peer(opts)

  self._id = randombytes(4).toString('hex').slice(0, 7)
  self._debug('new peer %o', opts)

  opts = Object.assign({
    allowHalfOpen: false
  }, opts)

  stream.Duplex.call(self, opts)

  self.channelName = opts.initiator
    ? opts.channelName || randombytes(20).toString('hex')
    : null

  // Needed by _transformConstraints, so set this early
  self._isChromium = typeof window !== 'undefined' && !!window.webkitRTCPeerConnection

  self.initiator = opts.initiator || false
  self.channelConfig = opts.channelConfig || Peer.channelConfig
  self.config = opts.config || Peer.config
  self.constraints = self._transformConstraints(opts.constraints || Peer.constraints)
  self.offerConstraints = self._transformConstraints(opts.offerConstraints || {})
  self.answerConstraints = self._transformConstraints(opts.answerConstraints || {})
  self.reconnectTimer = opts.reconnectTimer || false
  self.sdpTransform = opts.sdpTransform || function (sdp) { return sdp }
  self.stream = opts.stream || false
  self.trickle = opts.trickle !== undefined ? opts.trickle : true
  self._earlyMessage = null

  self.destroyed = false
  self.connected = false

  self.remoteAddress = undefined
  self.remoteFamily = undefined
  self.remotePort = undefined
  self.localAddress = undefined
  self.localPort = undefined

  self._wrtc = (opts.wrtc && typeof opts.wrtc === 'object')
    ? opts.wrtc
    : getBrowserRTC()

  if (!self._wrtc) {
    if (typeof window === 'undefined') {
      throw new Error('No WebRTC support: Specify `opts.wrtc` option in this environment')
    } else {
      throw new Error('No WebRTC support: Not a supported browser')
    }
  }

  self._pcReady = false
  self._channelReady = false
  self._iceComplete = false // ice candidate trickle done (got null candidate)
  self._channel = null
  self._pendingCandidates = []
  self._previousStreams = []

  self._chunk = null
  self._cb = null
  self._interval = null
  self._reconnectTimeout = null

  self._pc = new (self._wrtc.RTCPeerConnection)(self.config, self.constraints)

  // We prefer feature detection whenever possible, but sometimes that's not
  // possible for certain implementations.
  self._isWrtc = Array.isArray(self._pc.RTCIceConnectionStates)
  self._isReactNativeWebrtc = typeof self._pc._peerConnectionId === 'number'

  self._pc.oniceconnectionstatechange = function () {
    self._onIceStateChange()
  }
  self._pc.onicegatheringstatechange = function () {
    self._onIceStateChange()
  }
  self._pc.onsignalingstatechange = function () {
    self._onSignalingStateChange()
  }
  self._pc.onicecandidate = function (event) {
    self._onIceCandidate(event)
  }

  // Other spec events, unused by this implementation:
  // - onconnectionstatechange
  // - onicecandidateerror
  // - onfingerprintfailure

  if (self.initiator) {
    var createdOffer = false
    self._pc.onnegotiationneeded = function () {
      if (!createdOffer) self._createOffer()
      createdOffer = true
    }

    self._setupData({
      channel: self._pc.createDataChannel(self.channelName, self.channelConfig)
    })
  } else {
    self._pc.ondatachannel = function (event) {
      self._setupData(event)
    }
  }

  if ('addTrack' in self._pc) {
    // WebRTC Spec, Firefox
    if (self.stream) {
      self.stream.getTracks().forEach(function (track) {
        self._pc.addTrack(track, self.stream)
      })
    }
    self._pc.ontrack = function (event) {
      self._onTrack(event)
    }
  } else {
    // Chrome, etc. This can be removed once all browsers support `ontrack`
    if (self.stream) self._pc.addStream(self.stream)
    self._pc.onaddstream = function (event) {
      self._onAddStream(event)
    }
  }

  // HACK: wrtc doesn't fire the 'negotionneeded' event
  if (self.initiator && self._isWrtc) {
    self._pc.onnegotiationneeded()
  }

  self._onFinishBound = function () {
    self._onFinish()
  }
  self.once('finish', self._onFinishBound)
}

Peer.WEBRTC_SUPPORT = !!getBrowserRTC()

/**
 * Expose config, constraints, and data channel config for overriding all Peer
 * instances. Otherwise, just set opts.config, opts.constraints, or opts.channelConfig
 * when constructing a Peer.
 */
Peer.config = {
  iceServers: [
    {
      urls: 'stun:stun.l.google.com:19302'
    },
    {
      urls: 'stun:global.stun.twilio.com:3478?transport=udp'
    }
  ]
}
Peer.constraints = {}
Peer.channelConfig = {}

Object.defineProperty(Peer.prototype, 'bufferSize', {
  get: function () {
    var self = this
    return (self._channel && self._channel.bufferedAmount) || 0
  }
})

Peer.prototype.address = function () {
  var self = this
  return { port: self.localPort, family: 'IPv4', address: self.localAddress }
}

Peer.prototype.signal = function (data) {
  var self = this
  if (self.destroyed) throw new Error('cannot signal after peer is destroyed')
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data)
    } catch (err) {
      data = {}
    }
  }
  self._debug('signal()')

  if (data.candidate) {
    if (self._pc.remoteDescription) self._addIceCandidate(data.candidate)
    else self._pendingCandidates.push(data.candidate)
  }
  if (data.sdp) {
    self._pc.setRemoteDescription(new (self._wrtc.RTCSessionDescription)(data), function () {
      if (self.destroyed) return

      self._pendingCandidates.forEach(function (candidate) {
        self._addIceCandidate(candidate)
      })
      self._pendingCandidates = []

      if (self._pc.remoteDescription.type === 'offer') self._createAnswer()
    }, function (err) { self._destroy(err) })
  }
  if (!data.sdp && !data.candidate) {
    self._destroy(new Error('signal() called with invalid signal data'))
  }
}

Peer.prototype._addIceCandidate = function (candidate) {
  var self = this
  try {
    self._pc.addIceCandidate(
      new self._wrtc.RTCIceCandidate(candidate),
      noop,
      function (err) { self._destroy(err) }
    )
  } catch (err) {
    self._destroy(new Error('error adding candidate: ' + err.message))
  }
}

/**
 * Send text/binary data to the remote peer.
 * @param {TypedArrayView|ArrayBuffer|Buffer|string|Blob|Object} chunk
 */
Peer.prototype.send = function (chunk) {
  var self = this

  // HACK: `wrtc` module crashes on Node.js Buffer, so convert to Uint8Array
  // See: https://github.com/feross/simple-peer/issues/60
  if (self._isWrtc && Buffer.isBuffer(chunk)) {
    chunk = new Uint8Array(chunk)
  }

  self._channel.send(chunk)
}

Peer.prototype.destroy = function (onclose) {
  var self = this
  self._destroy(null, onclose)
}

Peer.prototype._destroy = function (err, onclose) {
  var self = this
  if (self.destroyed) return
  if (onclose) self.once('close', onclose)

  self._debug('destroy (error: %s)', err && (err.message || err))

  self.readable = self.writable = false

  if (!self._readableState.ended) self.push(null)
  if (!self._writableState.finished) self.end()

  self.destroyed = true
  self.connected = false
  self._pcReady = false
  self._channelReady = false
  self._previousStreams = null
  self._earlyMessage = null

  clearInterval(self._interval)
  clearTimeout(self._reconnectTimeout)
  self._interval = null
  self._reconnectTimeout = null
  self._chunk = null
  self._cb = null

  if (self._onFinishBound) self.removeListener('finish', self._onFinishBound)
  self._onFinishBound = null

  if (self._pc) {
    try {
      self._pc.close()
    } catch (err) {}

    self._pc.oniceconnectionstatechange = null
    self._pc.onicegatheringstatechange = null
    self._pc.onsignalingstatechange = null
    self._pc.onicecandidate = null
    if ('addTrack' in self._pc) {
      self._pc.ontrack = null
    } else {
      self._pc.onaddstream = null
    }
    self._pc.onnegotiationneeded = null
    self._pc.ondatachannel = null
  }

  if (self._channel) {
    try {
      self._channel.close()
    } catch (err) {}

    self._channel.onmessage = null
    self._channel.onopen = null
    self._channel.onclose = null
    self._channel.onerror = null
  }
  self._pc = null
  self._channel = null

  if (err) self.emit('error', err)
  self.emit('close')
}

Peer.prototype._setupData = function (event) {
  var self = this
  if (!event.channel) {
    // In some situations `pc.createDataChannel()` returns `undefined` (in wrtc),
    // which is invalid behavior. Handle it gracefully.
    // See: https://github.com/feross/simple-peer/issues/163
    return self._destroy(new Error('Data channel event is missing `channel` property'))
  }

  self._channel = event.channel
  self._channel.binaryType = 'arraybuffer'

  if (typeof self._channel.bufferedAmountLowThreshold === 'number') {
    self._channel.bufferedAmountLowThreshold = MAX_BUFFERED_AMOUNT
  }

  self.channelName = self._channel.label

  self._channel.onmessage = function (event) {
    if (!self._channelReady) { // HACK: Workaround for Chrome not firing "open" between tabs
      self._earlyMessage = event
      self._onChannelOpen()
    } else {
      self._onChannelMessage(event)
    }
  }
  self._channel.onbufferedamountlow = function () {
    self._onChannelBufferedAmountLow()
  }
  self._channel.onopen = function () {
    if (!self._channelReady) self._onChannelOpen()
  }
  self._channel.onclose = function () {
    self._onChannelClose()
  }
  self._channel.onerror = function (err) {
    self._destroy(err)
  }
}

Peer.prototype._read = function () {}

Peer.prototype._write = function (chunk, encoding, cb) {
  var self = this
  if (self.destroyed) return cb(new Error('cannot write after peer is destroyed'))

  if (self.connected) {
    try {
      self.send(chunk)
    } catch (err) {
      return self._destroy(err)
    }
    if (self._channel.bufferedAmount > MAX_BUFFERED_AMOUNT) {
      self._debug('start backpressure: bufferedAmount %d', self._channel.bufferedAmount)
      self._cb = cb
    } else {
      cb(null)
    }
  } else {
    self._debug('write before connect')
    self._chunk = chunk
    self._cb = cb
  }
}

// When stream finishes writing, close socket. Half open connections are not
// supported.
Peer.prototype._onFinish = function () {
  var self = this
  if (self.destroyed) return

  if (self.connected) {
    destroySoon()
  } else {
    self.once('connect', destroySoon)
  }

  // Wait a bit before destroying so the socket flushes.
  // TODO: is there a more reliable way to accomplish this?
  function destroySoon () {
    setTimeout(function () {
      self._destroy()
    }, 1000)
  }
}

Peer.prototype._createOffer = function () {
  var self = this
  if (self.destroyed) return

  self._pc.createOffer(function (offer) {
    if (self.destroyed) return
    offer.sdp = self.sdpTransform(offer.sdp)
    self._pc.setLocalDescription(offer, onSuccess, onError)

    function onSuccess () {
      if (self.destroyed) return
      if (self.trickle || self._iceComplete) sendOffer()
      else self.once('_iceComplete', sendOffer) // wait for candidates
    }

    function onError (err) {
      self._destroy(err)
    }

    function sendOffer () {
      var signal = self._pc.localDescription || offer
      self._debug('signal')
      self.emit('signal', {
        type: signal.type,
        sdp: signal.sdp
      })
    }
  }, function (err) { self._destroy(err) }, self.offerConstraints)
}

Peer.prototype._createAnswer = function () {
  var self = this
  if (self.destroyed) return

  self._pc.createAnswer(function (answer) {
    if (self.destroyed) return
    answer.sdp = self.sdpTransform(answer.sdp)
    self._pc.setLocalDescription(answer, onSuccess, onError)

    function onSuccess () {
      if (self.destroyed) return
      if (self.trickle || self._iceComplete) sendAnswer()
      else self.once('_iceComplete', sendAnswer)
    }

    function onError (err) {
      self._destroy(err)
    }

    function sendAnswer () {
      var signal = self._pc.localDescription || answer
      self._debug('signal')
      self.emit('signal', {
        type: signal.type,
        sdp: signal.sdp
      })
    }
  }, function (err) { self._destroy(err) }, self.answerConstraints)
}

Peer.prototype._onIceStateChange = function () {
  var self = this
  if (self.destroyed) return
  var iceConnectionState = self._pc.iceConnectionState
  var iceGatheringState = self._pc.iceGatheringState

  self._debug(
    'iceStateChange (connection: %s) (gathering: %s)',
    iceConnectionState,
    iceGatheringState
  )
  self.emit('iceStateChange', iceConnectionState, iceGatheringState)

  if (iceConnectionState === 'connected' || iceConnectionState === 'completed') {
    clearTimeout(self._reconnectTimeout)
    self._pcReady = true
    self._maybeReady()
  }
  if (iceConnectionState === 'disconnected') {
    if (self.reconnectTimer) {
      // If user has set `opt.reconnectTimer`, allow time for ICE to attempt a reconnect
      clearTimeout(self._reconnectTimeout)
      self._reconnectTimeout = setTimeout(function () {
        self._destroy()
      }, self.reconnectTimer)
    } else {
      self._destroy()
    }
  }
  if (iceConnectionState === 'failed') {
    self._destroy(new Error('Ice connection failed.'))
  }
  if (iceConnectionState === 'closed') {
    self._destroy()
  }
}

Peer.prototype.getStats = function (cb) {
  var self = this

  // Promise-based getStats() (standard)
  if (self._pc.getStats.length === 0) {
    self._pc.getStats().then(function (res) {
      var reports = []
      res.forEach(function (report) {
        reports.push(report)
      })
      cb(null, reports)
    }, function (err) { cb(err) })

  // Two-parameter callback-based getStats() (deprecated, former standard)
  } else if (self._isReactNativeWebrtc) {
    self._pc.getStats(null, function (res) {
      var reports = []
      res.forEach(function (report) {
        reports.push(report)
      })
      cb(null, reports)
    }, function (err) { cb(err) })

  // Single-parameter callback-based getStats() (non-standard)
  } else if (self._pc.getStats.length > 0) {
    self._pc.getStats(function (res) {
      // If we destroy connection in `connect` callback this code might happen to run when actual connection is already closed
      if (self.destroyed) return

      var reports = []
      res.result().forEach(function (result) {
        var report = {}
        result.names().forEach(function (name) {
          report[name] = result.stat(name)
        })
        report.id = result.id
        report.type = result.type
        report.timestamp = result.timestamp
        reports.push(report)
      })
      cb(null, reports)
    }, function (err) { cb(err) })

  // Unknown browser, skip getStats() since it's anyone's guess which style of
  // getStats() they implement.
  } else {
    cb(null, [])
  }
}

Peer.prototype._maybeReady = function () {
  var self = this
  self._debug('maybeReady pc %s channel %s', self._pcReady, self._channelReady)
  if (self.connected || self._connecting || !self._pcReady || !self._channelReady) return

  self._connecting = true

  // HACK: We can't rely on order here, for details see https://github.com/js-platform/node-webrtc/issues/339
  function findCandidatePair () {
    if (self.destroyed) return

    self.getStats(function (err, items) {
      if (self.destroyed) return

      // Treat getStats error as non-fatal. It's not essential.
      if (err) items = []

      var remoteCandidates = {}
      var localCandidates = {}
      var candidatePairs = {}
      var foundSelectedCandidatePair = false

      items.forEach(function (item) {
        // TODO: Once all browsers support the hyphenated stats report types, remove
        // the non-hypenated ones
        if (item.type === 'remotecandidate' || item.type === 'remote-candidate') {
          remoteCandidates[item.id] = item
        }
        if (item.type === 'localcandidate' || item.type === 'local-candidate') {
          localCandidates[item.id] = item
        }
        if (item.type === 'candidatepair' || item.type === 'candidate-pair') {
          candidatePairs[item.id] = item
        }
      })

      items.forEach(function (item) {
        // Spec-compliant
        if (item.type === 'transport') {
          setSelectedCandidatePair(candidatePairs[item.selectedCandidatePairId])
        }

        // Old implementations
        if (
          (item.type === 'googCandidatePair' && item.googActiveConnection === 'true') ||
          ((item.type === 'candidatepair' || item.type === 'candidate-pair') && item.selected)
        ) {
          setSelectedCandidatePair(item)
        }
      })

      function setSelectedCandidatePair (selectedCandidatePair) {
        foundSelectedCandidatePair = true

        var local = localCandidates[selectedCandidatePair.localCandidateId]

        if (local && local.ip) {
          // Spec
          self.localAddress = local.ip
          self.localPort = Number(local.port)
        } else if (local && local.ipAddress) {
          // Firefox
          self.localAddress = local.ipAddress
          self.localPort = Number(local.portNumber)
        } else if (typeof selectedCandidatePair.googLocalAddress === 'string') {
          // TODO: remove this once Chrome 58 is released
          local = selectedCandidatePair.googLocalAddress.split(':')
          self.localAddress = local[0]
          self.localPort = Number(local[1])
        }

        var remote = remoteCandidates[selectedCandidatePair.remoteCandidateId]

        if (remote && remote.ip) {
          // Spec
          self.remoteAddress = remote.ip
          self.remotePort = Number(remote.port)
        } else if (remote && remote.ipAddress) {
          // Firefox
          self.remoteAddress = remote.ipAddress
          self.remotePort = Number(remote.portNumber)
        } else if (typeof selectedCandidatePair.googRemoteAddress === 'string') {
          // TODO: remove this once Chrome 58 is released
          remote = selectedCandidatePair.googRemoteAddress.split(':')
          self.remoteAddress = remote[0]
          self.remotePort = Number(remote[1])
        }
        self.remoteFamily = 'IPv4'

        self._debug(
          'connect local: %s:%s remote: %s:%s',
          self.localAddress, self.localPort, self.remoteAddress, self.remotePort
        )
      }

      if (!foundSelectedCandidatePair && items.length) {
        setTimeout(findCandidatePair, 100)
        return
      } else {
        self._connecting = false
        self.connected = true
      }

      if (self._chunk) {
        try {
          self.send(self._chunk)
        } catch (err) {
          return self._destroy(err)
        }
        self._chunk = null
        self._debug('sent chunk from "write before connect"')

        var cb = self._cb
        self._cb = null
        cb(null)
      }

      // If `bufferedAmountLowThreshold` and 'onbufferedamountlow' are unsupported,
      // fallback to using setInterval to implement backpressure.
      if (typeof self._channel.bufferedAmountLowThreshold !== 'number') {
        self._interval = setInterval(function () { self._onInterval() }, 150)
        if (self._interval.unref) self._interval.unref()
      }

      self._debug('connect')
      self.emit('connect')
      if (self._earlyMessage) { // HACK: Workaround for Chrome not firing "open" between tabs
        self._onChannelMessage(self._earlyMessage)
        self._earlyMessage = null
      }
    })
  }
  findCandidatePair()
}

Peer.prototype._onInterval = function () {
  if (!this._cb || !this._channel || this._channel.bufferedAmount > MAX_BUFFERED_AMOUNT) {
    return
  }
  this._onChannelBufferedAmountLow()
}

Peer.prototype._onSignalingStateChange = function () {
  var self = this
  if (self.destroyed) return
  self._debug('signalingStateChange %s', self._pc.signalingState)
  self.emit('signalingStateChange', self._pc.signalingState)
}

Peer.prototype._onIceCandidate = function (event) {
  var self = this
  if (self.destroyed) return
  if (event.candidate && self.trickle) {
    self.emit('signal', {
      candidate: {
        candidate: event.candidate.candidate,
        sdpMLineIndex: event.candidate.sdpMLineIndex,
        sdpMid: event.candidate.sdpMid
      }
    })
  } else if (!event.candidate) {
    self._iceComplete = true
    self.emit('_iceComplete')
  }
}

Peer.prototype._onChannelMessage = function (event) {
  var self = this
  if (self.destroyed) return
  var data = event.data
  if (data instanceof ArrayBuffer) data = Buffer.from(data)
  self.push(data)
}

Peer.prototype._onChannelBufferedAmountLow = function () {
  var self = this
  if (self.destroyed || !self._cb) return
  self._debug('ending backpressure: bufferedAmount %d', self._channel.bufferedAmount)
  var cb = self._cb
  self._cb = null
  cb(null)
}

Peer.prototype._onChannelOpen = function () {
  var self = this
  if (self.connected || self.destroyed) return
  self._debug('on channel open')
  self._channelReady = true
  self._maybeReady()
}

Peer.prototype._onChannelClose = function () {
  var self = this
  if (self.destroyed) return
  self._debug('on channel close')
  self._destroy()
}

Peer.prototype._onAddStream = function (event) {
  var self = this
  if (self.destroyed) return
  self._debug('on add stream')
  self.emit('stream', event.stream)
}

Peer.prototype._onTrack = function (event) {
  var self = this
  if (self.destroyed) return
  self._debug('on track')
  var id = event.streams[0].id
  if (self._previousStreams.indexOf(id) !== -1) return // Only fire one 'stream' event, even though there may be multiple tracks per stream
  self._previousStreams.push(id)
  self.emit('stream', event.streams[0])
}

Peer.prototype._debug = function () {
  var self = this
  var args = [].slice.call(arguments)
  args[0] = '[' + self._id + '] ' + args[0]
  debug.apply(null, args)
}

// Transform constraints objects into the new format (unless Chromium)
// TODO: This can be removed when Chromium supports the new format
Peer.prototype._transformConstraints = function (constraints) {
  var self = this

  if (Object.keys(constraints).length === 0) {
    return constraints
  }

  if ((constraints.mandatory || constraints.optional) && !self._isChromium) {
    // convert to new format

    // Merge mandatory and optional objects, prioritizing mandatory
    var newConstraints = Object.assign({}, constraints.optional, constraints.mandatory)

    // fix casing
    if (newConstraints.OfferToReceiveVideo !== undefined) {
      newConstraints.offerToReceiveVideo = newConstraints.OfferToReceiveVideo
      delete newConstraints['OfferToReceiveVideo']
    }

    if (newConstraints.OfferToReceiveAudio !== undefined) {
      newConstraints.offerToReceiveAudio = newConstraints.OfferToReceiveAudio
      delete newConstraints['OfferToReceiveAudio']
    }

    return newConstraints
  } else if (!constraints.mandatory && !constraints.optional && self._isChromium) {
    // convert to old format

    // fix casing
    if (constraints.offerToReceiveVideo !== undefined) {
      constraints.OfferToReceiveVideo = constraints.offerToReceiveVideo
      delete constraints['offerToReceiveVideo']
    }

    if (constraints.offerToReceiveAudio !== undefined) {
      constraints.OfferToReceiveAudio = constraints.offerToReceiveAudio
      delete constraints['offerToReceiveAudio']
    }

    return {
      mandatory: constraints // NOTE: All constraints are upgraded to mandatory
    }
  }

  return constraints
}

function noop () {}

}).call(this,require("buffer").Buffer)
},{"buffer":28,"debug":5,"get-browser-rtc":7,"inherits":8,"randombytes":11,"readable-stream":21}],24:[function(require,module,exports){
'use strict';

var Buffer = require('safe-buffer').Buffer;

var isEncoding = Buffer.isEncoding || function (encoding) {
  encoding = '' + encoding;
  switch (encoding && encoding.toLowerCase()) {
    case 'hex':case 'utf8':case 'utf-8':case 'ascii':case 'binary':case 'base64':case 'ucs2':case 'ucs-2':case 'utf16le':case 'utf-16le':case 'raw':
      return true;
    default:
      return false;
  }
};

function _normalizeEncoding(enc) {
  if (!enc) return 'utf8';
  var retried;
  while (true) {
    switch (enc) {
      case 'utf8':
      case 'utf-8':
        return 'utf8';
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return 'utf16le';
      case 'latin1':
      case 'binary':
        return 'latin1';
      case 'base64':
      case 'ascii':
      case 'hex':
        return enc;
      default:
        if (retried) return; // undefined
        enc = ('' + enc).toLowerCase();
        retried = true;
    }
  }
};

// Do not cache `Buffer.isEncoding` when checking encoding names as some
// modules monkey-patch it to support additional encodings
function normalizeEncoding(enc) {
  var nenc = _normalizeEncoding(enc);
  if (typeof nenc !== 'string' && (Buffer.isEncoding === isEncoding || !isEncoding(enc))) throw new Error('Unknown encoding: ' + enc);
  return nenc || enc;
}

// StringDecoder provides an interface for efficiently splitting a series of
// buffers into a series of JS strings without breaking apart multi-byte
// characters.
exports.StringDecoder = StringDecoder;
function StringDecoder(encoding) {
  this.encoding = normalizeEncoding(encoding);
  var nb;
  switch (this.encoding) {
    case 'utf16le':
      this.text = utf16Text;
      this.end = utf16End;
      nb = 4;
      break;
    case 'utf8':
      this.fillLast = utf8FillLast;
      nb = 4;
      break;
    case 'base64':
      this.text = base64Text;
      this.end = base64End;
      nb = 3;
      break;
    default:
      this.write = simpleWrite;
      this.end = simpleEnd;
      return;
  }
  this.lastNeed = 0;
  this.lastTotal = 0;
  this.lastChar = Buffer.allocUnsafe(nb);
}

StringDecoder.prototype.write = function (buf) {
  if (buf.length === 0) return '';
  var r;
  var i;
  if (this.lastNeed) {
    r = this.fillLast(buf);
    if (r === undefined) return '';
    i = this.lastNeed;
    this.lastNeed = 0;
  } else {
    i = 0;
  }
  if (i < buf.length) return r ? r + this.text(buf, i) : this.text(buf, i);
  return r || '';
};

StringDecoder.prototype.end = utf8End;

// Returns only complete characters in a Buffer
StringDecoder.prototype.text = utf8Text;

// Attempts to complete a partial non-UTF-8 character using bytes from a Buffer
StringDecoder.prototype.fillLast = function (buf) {
  if (this.lastNeed <= buf.length) {
    buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, this.lastNeed);
    return this.lastChar.toString(this.encoding, 0, this.lastTotal);
  }
  buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, buf.length);
  this.lastNeed -= buf.length;
};

// Checks the type of a UTF-8 byte, whether it's ASCII, a leading byte, or a
// continuation byte.
function utf8CheckByte(byte) {
  if (byte <= 0x7F) return 0;else if (byte >> 5 === 0x06) return 2;else if (byte >> 4 === 0x0E) return 3;else if (byte >> 3 === 0x1E) return 4;
  return -1;
}

// Checks at most 3 bytes at the end of a Buffer in order to detect an
// incomplete multi-byte UTF-8 character. The total number of bytes (2, 3, or 4)
// needed to complete the UTF-8 character (if applicable) are returned.
function utf8CheckIncomplete(self, buf, i) {
  var j = buf.length - 1;
  if (j < i) return 0;
  var nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) self.lastNeed = nb - 1;
    return nb;
  }
  if (--j < i) return 0;
  nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) self.lastNeed = nb - 2;
    return nb;
  }
  if (--j < i) return 0;
  nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) {
      if (nb === 2) nb = 0;else self.lastNeed = nb - 3;
    }
    return nb;
  }
  return 0;
}

// Validates as many continuation bytes for a multi-byte UTF-8 character as
// needed or are available. If we see a non-continuation byte where we expect
// one, we "replace" the validated continuation bytes we've seen so far with
// UTF-8 replacement characters ('\ufffd'), to match v8's UTF-8 decoding
// behavior. The continuation byte check is included three times in the case
// where all of the continuation bytes for a character exist in the same buffer.
// It is also done this way as a slight performance increase instead of using a
// loop.
function utf8CheckExtraBytes(self, buf, p) {
  if ((buf[0] & 0xC0) !== 0x80) {
    self.lastNeed = 0;
    return '\ufffd'.repeat(p);
  }
  if (self.lastNeed > 1 && buf.length > 1) {
    if ((buf[1] & 0xC0) !== 0x80) {
      self.lastNeed = 1;
      return '\ufffd'.repeat(p + 1);
    }
    if (self.lastNeed > 2 && buf.length > 2) {
      if ((buf[2] & 0xC0) !== 0x80) {
        self.lastNeed = 2;
        return '\ufffd'.repeat(p + 2);
      }
    }
  }
}

// Attempts to complete a multi-byte UTF-8 character using bytes from a Buffer.
function utf8FillLast(buf) {
  var p = this.lastTotal - this.lastNeed;
  var r = utf8CheckExtraBytes(this, buf, p);
  if (r !== undefined) return r;
  if (this.lastNeed <= buf.length) {
    buf.copy(this.lastChar, p, 0, this.lastNeed);
    return this.lastChar.toString(this.encoding, 0, this.lastTotal);
  }
  buf.copy(this.lastChar, p, 0, buf.length);
  this.lastNeed -= buf.length;
}

// Returns all complete UTF-8 characters in a Buffer. If the Buffer ended on a
// partial character, the character's bytes are buffered until the required
// number of bytes are available.
function utf8Text(buf, i) {
  var total = utf8CheckIncomplete(this, buf, i);
  if (!this.lastNeed) return buf.toString('utf8', i);
  this.lastTotal = total;
  var end = buf.length - (total - this.lastNeed);
  buf.copy(this.lastChar, 0, end);
  return buf.toString('utf8', i, end);
}

// For UTF-8, a replacement character for each buffered byte of a (partial)
// character needs to be added to the output.
function utf8End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) return r + '\ufffd'.repeat(this.lastTotal - this.lastNeed);
  return r;
}

// UTF-16LE typically needs two bytes per character, but even if we have an even
// number of bytes available, we need to check if we end on a leading/high
// surrogate. In that case, we need to wait for the next two bytes in order to
// decode the last character properly.
function utf16Text(buf, i) {
  if ((buf.length - i) % 2 === 0) {
    var r = buf.toString('utf16le', i);
    if (r) {
      var c = r.charCodeAt(r.length - 1);
      if (c >= 0xD800 && c <= 0xDBFF) {
        this.lastNeed = 2;
        this.lastTotal = 4;
        this.lastChar[0] = buf[buf.length - 2];
        this.lastChar[1] = buf[buf.length - 1];
        return r.slice(0, -1);
      }
    }
    return r;
  }
  this.lastNeed = 1;
  this.lastTotal = 2;
  this.lastChar[0] = buf[buf.length - 1];
  return buf.toString('utf16le', i, buf.length - 1);
}

// For UTF-16LE we do not explicitly append special replacement characters if we
// end on a partial character, we simply let v8 handle that.
function utf16End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) {
    var end = this.lastTotal - this.lastNeed;
    return r + this.lastChar.toString('utf16le', 0, end);
  }
  return r;
}

function base64Text(buf, i) {
  var n = (buf.length - i) % 3;
  if (n === 0) return buf.toString('base64', i);
  this.lastNeed = 3 - n;
  this.lastTotal = 3;
  if (n === 1) {
    this.lastChar[0] = buf[buf.length - 1];
  } else {
    this.lastChar[0] = buf[buf.length - 2];
    this.lastChar[1] = buf[buf.length - 1];
  }
  return buf.toString('base64', i, buf.length - n);
}

function base64End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) return r + this.lastChar.toString('base64', 0, 3 - this.lastNeed);
  return r;
}

// Pass bytes on through for single-byte encodings (e.g. ascii, latin1, hex)
function simpleWrite(buf) {
  return buf.toString(this.encoding);
}

function simpleEnd(buf) {
  return buf && buf.length ? this.write(buf) : '';
}
},{"safe-buffer":22}],25:[function(require,module,exports){
(function (global){

/**
 * Module exports.
 */

module.exports = deprecate;

/**
 * Mark that a method should not be used.
 * Returns a modified function which warns once by default.
 *
 * If `localStorage.noDeprecation = true` is set, then it is a no-op.
 *
 * If `localStorage.throwDeprecation = true` is set, then deprecated functions
 * will throw an Error when invoked.
 *
 * If `localStorage.traceDeprecation = true` is set, then deprecated functions
 * will invoke `console.trace()` instead of `console.error()`.
 *
 * @param {Function} fn - the function to deprecate
 * @param {String} msg - the string to print to the console when `fn` is invoked
 * @returns {Function} a new "deprecated" version of `fn`
 * @api public
 */

function deprecate (fn, msg) {
  if (config('noDeprecation')) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (config('throwDeprecation')) {
        throw new Error(msg);
      } else if (config('traceDeprecation')) {
        console.trace(msg);
      } else {
        console.warn(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
}

/**
 * Checks `localStorage` for boolean values for the given `name`.
 *
 * @param {String} name
 * @returns {Boolean}
 * @api private
 */

function config (name) {
  // accessing global.localStorage can trigger a DOMException in sandboxed iframes
  try {
    if (!global.localStorage) return false;
  } catch (_) {
    return false;
  }
  var val = global.localStorage[name];
  if (null == val) return false;
  return String(val).toLowerCase() === 'true';
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],26:[function(require,module,exports){
'use strict'

exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function placeHoldersCount (b64) {
  var len = b64.length
  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // the number of equal signs (place holders)
  // if there are two placeholders, than the two characters before it
  // represent one byte
  // if there is only one, then the three characters before it represent 2 bytes
  // this is just a cheap hack to not do indexOf twice
  return b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0
}

function byteLength (b64) {
  // base64 is 4/3 + up to two characters of the original data
  return (b64.length * 3 / 4) - placeHoldersCount(b64)
}

function toByteArray (b64) {
  var i, l, tmp, placeHolders, arr
  var len = b64.length
  placeHolders = placeHoldersCount(b64)

  arr = new Arr((len * 3 / 4) - placeHolders)

  // if there are placeholders, only get up to the last complete 4 chars
  l = placeHolders > 0 ? len - 4 : len

  var L = 0

  for (i = 0; i < l; i += 4) {
    tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)]
    arr[L++] = (tmp >> 16) & 0xFF
    arr[L++] = (tmp >> 8) & 0xFF
    arr[L++] = tmp & 0xFF
  }

  if (placeHolders === 2) {
    tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[L++] = tmp & 0xFF
  } else if (placeHolders === 1) {
    tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[L++] = (tmp >> 8) & 0xFF
    arr[L++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var output = ''
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    output += lookup[tmp >> 2]
    output += lookup[(tmp << 4) & 0x3F]
    output += '=='
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + (uint8[len - 1])
    output += lookup[tmp >> 10]
    output += lookup[(tmp >> 4) & 0x3F]
    output += lookup[(tmp << 2) & 0x3F]
    output += '='
  }

  parts.push(output)

  return parts.join('')
}

},{}],27:[function(require,module,exports){

},{}],28:[function(require,module,exports){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

var K_MAX_LENGTH = 0x7fffffff
exports.kMaxLength = K_MAX_LENGTH

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Print warning and recommend using `buffer` v4.x which has an Object
 *               implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * We report that the browser does not support typed arrays if the are not subclassable
 * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
 * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
 * for __proto__ and has a buggy typed array implementation.
 */
Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport()

if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' &&
    typeof console.error === 'function') {
  console.error(
    'This browser lacks typed array (Uint8Array) support which is required by ' +
    '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
  )
}

function typedArraySupport () {
  // Can typed array instances can be augmented?
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = {__proto__: Uint8Array.prototype, foo: function () { return 42 }}
    return arr.foo() === 42
  } catch (e) {
    return false
  }
}

function createBuffer (length) {
  if (length > K_MAX_LENGTH) {
    throw new RangeError('Invalid typed array length')
  }
  // Return an augmented `Uint8Array` instance
  var buf = new Uint8Array(length)
  buf.__proto__ = Buffer.prototype
  return buf
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new Error(
        'If encoding is specified then the first argument must be a string'
      )
    }
    return allocUnsafe(arg)
  }
  return from(arg, encodingOrOffset, length)
}

// Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
if (typeof Symbol !== 'undefined' && Symbol.species &&
    Buffer[Symbol.species] === Buffer) {
  Object.defineProperty(Buffer, Symbol.species, {
    value: null,
    configurable: true,
    enumerable: false,
    writable: false
  })
}

Buffer.poolSize = 8192 // not used by this implementation

function from (value, encodingOrOffset, length) {
  if (typeof value === 'number') {
    throw new TypeError('"value" argument must not be a number')
  }

  if (isArrayBuffer(value)) {
    return fromArrayBuffer(value, encodingOrOffset, length)
  }

  if (typeof value === 'string') {
    return fromString(value, encodingOrOffset)
  }

  return fromObject(value)
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(value, encodingOrOffset, length)
}

// Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
// https://github.com/feross/buffer/pull/148
Buffer.prototype.__proto__ = Uint8Array.prototype
Buffer.__proto__ = Uint8Array

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be a number')
  } else if (size < 0) {
    throw new RangeError('"size" argument must not be negative')
  }
}

function alloc (size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(size).fill(fill, encoding)
      : createBuffer(size).fill(fill)
  }
  return createBuffer(size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(size, fill, encoding)
}

function allocUnsafe (size) {
  assertSize(size)
  return createBuffer(size < 0 ? 0 : checked(size) | 0)
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(size)
}

function fromString (string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('"encoding" must be a valid string encoding')
  }

  var length = byteLength(string, encoding) | 0
  var buf = createBuffer(length)

  var actual = buf.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    buf = buf.slice(0, actual)
  }

  return buf
}

function fromArrayLike (array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  var buf = createBuffer(length)
  for (var i = 0; i < length; i += 1) {
    buf[i] = array[i] & 255
  }
  return buf
}

function fromArrayBuffer (array, byteOffset, length) {
  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('\'offset\' is out of bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('\'length\' is out of bounds')
  }

  var buf
  if (byteOffset === undefined && length === undefined) {
    buf = new Uint8Array(array)
  } else if (length === undefined) {
    buf = new Uint8Array(array, byteOffset)
  } else {
    buf = new Uint8Array(array, byteOffset, length)
  }

  // Return an augmented `Uint8Array` instance
  buf.__proto__ = Buffer.prototype
  return buf
}

function fromObject (obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    var buf = createBuffer(len)

    if (buf.length === 0) {
      return buf
    }

    obj.copy(buf, 0, 0, len)
    return buf
  }

  if (obj) {
    if (isArrayBufferView(obj) || 'length' in obj) {
      if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
        return createBuffer(0)
      }
      return fromArrayLike(obj)
    }

    if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
      return fromArrayLike(obj.data)
    }
  }

  throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
}

function checked (length) {
  // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= K_MAX_LENGTH) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return b != null && b._isBuffer === true
}

Buffer.compare = function compare (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!Array.isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (isArrayBufferView(string) || isArrayBuffer(string)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    string = '' + string
  }

  var len = string.length
  if (len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
      case undefined:
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) return utf8ToBytes(string).length // assume utf8
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
// to detect a Buffer instance. It's not possible to use `instanceof Buffer`
// reliably in a browserify context because there could be multiple different
// copies of the 'buffer' package in use. This method works even for Buffer
// instances that were created from another copy of the `buffer` package.
// See: https://github.com/feross/buffer/issues/154
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max) str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (!Buffer.isBuffer(target)) {
    throw new TypeError('Argument must be a Buffer')
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset  // Coerce to Number.
  if (numberIsNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (numberIsNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset >>> 0
    if (isFinite(length)) {
      length = length >>> 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
      : (firstByte > 0xBF) ? 2
      : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256))
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf = this.subarray(start, end)
  // Return an augmented `Uint8Array` instance
  newBuf.__proto__ = Buffer.prototype
  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset + 3] = (value >>> 24)
  this[offset + 2] = (value >>> 16)
  this[offset + 1] = (value >>> 8)
  this[offset] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  this[offset + 2] = (value >>> 16)
  this[offset + 3] = (value >>> 24)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start
  var i

  if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else if (len < 1000) {
    // ascending copy from start
    for (i = 0; i < len; ++i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, start + len),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if (code < 256) {
        val = code
      }
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : new Buffer(val, encoding)
    var len = bytes.length
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = str.trim().replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

// ArrayBuffers from another context (i.e. an iframe) do not pass the `instanceof` check
// but they should be treated as valid. See: https://github.com/feross/buffer/issues/166
function isArrayBuffer (obj) {
  return obj instanceof ArrayBuffer ||
    (obj != null && obj.constructor != null && obj.constructor.name === 'ArrayBuffer' &&
      typeof obj.byteLength === 'number')
}

// Node 0.10 supports `ArrayBuffer` but lacks `ArrayBuffer.isView`
function isArrayBufferView (obj) {
  return (typeof ArrayBuffer.isView === 'function') && ArrayBuffer.isView(obj)
}

function numberIsNaN (obj) {
  return obj !== obj // eslint-disable-line no-self-compare
}

},{"base64-js":26,"ieee754":30}],29:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        // At least give some kind of context to the user
        var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
        err.context = er;
        throw err;
      }
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    args = Array.prototype.slice.call(arguments, 1);
    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else if (listeners) {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.prototype.listenerCount = function(type) {
  if (this._events) {
    var evlistener = this._events[type];

    if (isFunction(evlistener))
      return 1;
    else if (evlistener)
      return evlistener.length;
  }
  return 0;
};

EventEmitter.listenerCount = function(emitter, type) {
  return emitter.listenerCount(type);
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],30:[function(require,module,exports){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],31:[function(require,module,exports){
/*!
 * Determine if an object is a Buffer
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */

// The _isBuffer check is for Safari 5-7 support, because it's missing
// Object.prototype.constructor. Remove this eventually
module.exports = function (obj) {
  return obj != null && (isBuffer(obj) || isSlowBuffer(obj) || !!obj._isBuffer)
}

function isBuffer (obj) {
  return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
}

// For Node v0.10 support. Remove this eventually.
function isSlowBuffer (obj) {
  return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isBuffer(obj.slice(0, 0))
}

},{}],32:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}]},{},[1,2,3]);
