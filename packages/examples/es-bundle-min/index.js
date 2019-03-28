(function() {
  function Ta(a) {
    return a && a.__esModule ? { d: a.default } : { d: a };
  }
  var sa = this;
  var Fa = {},
    J =
      ('undefined' != typeof crypto && crypto.getRandomValues && crypto.getRandomValues.bind(crypto)) ||
      ('undefined' != typeof msCrypto &&
        'function' == typeof window.msCrypto.getRandomValues &&
        msCrypto.getRandomValues.bind(msCrypto));
  if (J) {
    var V = new Uint8Array(16);
    Fa = function() {
      return J(V), V;
    };
  } else {
    var H = new Array(16);
    Fa = function() {
      for (var r, $ = 0; $ < 16; $++)
        0 == (3 & $) && (r = 4294967296 * Math.random()), (H[$] = (r >>> ((3 & $) << 3)) & 255);
      return H;
    };
  }
  for (var va = {}, L = [], o = 0; o < 256; ++o) L[o] = (o + 256).toString(16).substr(1);
  function ob($, r) {
    var b = r || 0,
      a = L;
    return [
      a[$[b++]],
      a[$[b++]],
      a[$[b++]],
      a[$[b++]],
      '-',
      a[$[b++]],
      a[$[b++]],
      '-',
      a[$[b++]],
      a[$[b++]],
      '-',
      a[$[b++]],
      a[$[b++]],
      '-',
      a[$[b++]],
      a[$[b++]],
      a[$[b++]],
      a[$[b++]],
      a[$[b++]],
      a[$[b++]],
    ].join('');
  }
  va = ob;
  var sb = {};
  function yb(r, $, a) {
    var e = ($ && a) || 0;
    'string' == typeof r && (($ = 'binary' === r ? new Array(16) : null), (r = null));
    var n = (r = r || {}).random || (r.rng || Fa)();
    if (((n[6] = (15 & n[6]) | 64), (n[8] = (63 & n[8]) | 128), $)) for (var v = 0; v < 16; ++v) $[e + v] = n[v];
    return $ || va(n);
  }
  sb = yb;
  function ta(r) {
    for (; r; ) {
      var e = r,
        o = e.closed,
        t = e.destination,
        $ = e.isStopped;
      if (o || $) return !1;
      r = t && t instanceof g ? t : null;
    }
    return !0;
  }
  var ua = function(t, e) {
    return (ua =
      Object.setPrototypeOf ||
      ({ __proto__: [] } instanceof Array &&
        function(t, e) {
          t.__proto__ = e;
        }) ||
      function(t, e) {
        for (var r in e) e.hasOwnProperty(r) && (t[r] = e[r]);
      })(t, e);
  };
  function b(t, e) {
    function r() {
      this.constructor = t;
    }
    ua(t, e), (t.prototype = null === e ? Object.create(e) : ((r.prototype = e.prototype), new r()));
  }
  var xa = function() {
    return (
      (xa =
        Object.assign ||
        function(t) {
          for (var e, r = 1, o = arguments.length; r < o; r++)
            for (var n in (e = arguments[r])) Object.prototype.hasOwnProperty.call(e, n) && (t[n] = e[n]);
          return t;
        }),
      xa.apply(this, arguments)
    );
  };
  function F(t) {
    return this instanceof F ? ((this.v = t), this) : new F(t);
  }
  function A(n) {
    return 'function' == typeof n;
  }
  var mb = !1,
    c = {
      Promise: void 0,
      set useDeprecatedSynchronousErrorHandling(r) {
        r && new Error().stack;
        mb = r;
      },
      get useDeprecatedSynchronousErrorHandling() {
        return mb;
      },
    };
  function k(r) {
    setTimeout(function() {
      throw r;
    });
  }
  var u = {
    closed: !0,
    next: function(r) {},
    error: function(r) {
      if (c.useDeprecatedSynchronousErrorHandling) throw r;
      k(r);
    },
    complete: function() {},
  };
  var ra =
    Array.isArray ||
    function(r) {
      return r && 'number' == typeof r.length;
    };
  function W(t) {
    return null !== t && 'object' == typeof t;
  }
  function Z(r) {
    return (
      Error.call(this),
      (this.message = r
        ? r.length +
          ' errors occurred during unsubscription:\n' +
          r
            .map(function(r, n) {
              return n + 1 + ') ' + r.toString();
            })
            .join('\n  ')
        : ''),
      (this.name = 'UnsubscriptionError'),
      (this.errors = r),
      this
    );
  }
  Z.prototype = Object.create(Error.prototype);
  var v = Z;
  var f = (function() {
    function r(r) {
      (this.closed = !1),
        (this._parent = null),
        (this._parents = null),
        (this._subscriptions = null),
        r && (this._unsubscribe = r);
    }
    var t;
    return (
      (r.prototype.unsubscribe = function() {
        var r,
          t = !1;
        if (!this.closed) {
          var i = this._parent,
            s = this._parents,
            n = this._unsubscribe,
            o = this._subscriptions;
          (this.closed = !0), (this._parent = null), (this._parents = null), (this._subscriptions = null);
          for (var e = -1, u = s ? s.length : 0; i; ) i.remove(this), (i = (++e < u && s[e]) || null);
          if (A(n))
            try {
              n.call(this);
            } catch (p) {
              (t = !0), (r = p instanceof v ? I(p.errors) : [p]);
            }
          if (ra(o))
            for (e = -1, u = o.length; ++e < u; ) {
              var c = o[e];
              if (W(c))
                try {
                  c.unsubscribe();
                } catch (p) {
                  (t = !0), (r = r || []), p instanceof v ? (r = r.concat(I(p.errors))) : r.push(p);
                }
            }
          if (t) throw new v(r);
        }
      }),
      (r.prototype.add = function(t) {
        var i = t;
        switch (typeof t) {
          case 'function':
            i = new r(t);
          case 'object':
            if (i === this || i.closed || 'function' != typeof i.unsubscribe) return i;
            if (this.closed) return i.unsubscribe(), i;
            if (!(i instanceof r)) {
              var s = i;
              (i = new r())._subscriptions = [s];
            }
            break;
          default:
            if (!t) return r.EMPTY;
            throw new Error('unrecognized teardown ' + t + ' added to Subscription.');
        }
        if (i._addParent(this)) {
          var n = this._subscriptions;
          n ? n.push(i) : (this._subscriptions = [i]);
        }
        return i;
      }),
      (r.prototype.remove = function(r) {
        var t = this._subscriptions;
        if (t) {
          var i = t.indexOf(r);
          -1 !== i && t.splice(i, 1);
        }
      }),
      (r.prototype._addParent = function(r) {
        var t = this._parent,
          i = this._parents;
        return (
          t !== r &&
          (t ? (i ? -1 === i.indexOf(r) && (i.push(r), !0) : ((this._parents = [r]), !0)) : ((this._parent = r), !0))
        );
      }),
      (r.EMPTY = (((t = new r()).closed = !0), t)),
      r
    );
  })();
  function I(r) {
    return r.reduce(function(r, t) {
      return r.concat(t instanceof v ? t.errors : t);
    }, []);
  }
  var q = 'function' == typeof Symbol ? Symbol('rxSubscriber') : '@@rxSubscriber_' + Math.random();
  var g = (function(r) {
    function t(e, o, i) {
      var s = r.call(this) || this;
      switch (
        ((s.syncErrorValue = null),
        (s.syncErrorThrown = !1),
        (s.syncErrorThrowable = !1),
        (s.isStopped = !1),
        arguments.length)
      ) {
        case 0:
          s.destination = u;
          break;
        case 1:
          if (!e) {
            s.destination = u;
            break;
          }
          if ('object' == typeof e) {
            e instanceof t
              ? ((s.syncErrorThrowable = e.syncErrorThrowable), (s.destination = e), e.add(s))
              : ((s.syncErrorThrowable = !0), (s.destination = new U(s, e)));
            break;
          }
        default:
          (s.syncErrorThrowable = !0), (s.destination = new U(s, e, o, i));
      }
      return s;
    }
    return (
      b(t, r),
      (t.prototype[q] = function() {
        return this;
      }),
      (t.create = function(r, e, o) {
        var i = new t(r, e, o);
        return (i.syncErrorThrowable = !1), i;
      }),
      (t.prototype.next = function(r) {
        this.isStopped || this._next(r);
      }),
      (t.prototype.error = function(r) {
        this.isStopped || ((this.isStopped = !0), this._error(r));
      }),
      (t.prototype.complete = function() {
        this.isStopped || ((this.isStopped = !0), this._complete());
      }),
      (t.prototype.unsubscribe = function() {
        this.closed || ((this.isStopped = !0), r.prototype.unsubscribe.call(this));
      }),
      (t.prototype._next = function(r) {
        this.destination.next(r);
      }),
      (t.prototype._error = function(r) {
        this.destination.error(r), this.unsubscribe();
      }),
      (t.prototype._complete = function() {
        this.destination.complete(), this.unsubscribe();
      }),
      (t.prototype._unsubscribeAndRecycle = function() {
        var r = this._parent,
          t = this._parents;
        return (
          (this._parent = null),
          (this._parents = null),
          this.unsubscribe(),
          (this.closed = !1),
          (this.isStopped = !1),
          (this._parent = r),
          (this._parents = t),
          this
        );
      }),
      t
    );
  })(f);
  var U = (function(r) {
    function t(t, e, o, i) {
      var s,
        n = r.call(this) || this;
      n._parentSubscriber = t;
      var c = n;
      return (
        A(e)
          ? (s = e)
          : e &&
            ((s = e.next),
            (o = e.error),
            (i = e.complete),
            e !== u &&
              ((c = Object.create(e)),
              A(c.unsubscribe) && n.add(c.unsubscribe.bind(c)),
              (c.unsubscribe = n.unsubscribe.bind(n)))),
        (n._context = c),
        (n._next = s),
        (n._error = o),
        (n._complete = i),
        n
      );
    }
    return (
      b(t, r),
      (t.prototype.next = function(r) {
        if (!this.isStopped && this._next) {
          var t = this._parentSubscriber;
          c.useDeprecatedSynchronousErrorHandling && t.syncErrorThrowable
            ? this.__tryOrSetError(t, this._next, r) && this.unsubscribe()
            : this.__tryOrUnsub(this._next, r);
        }
      }),
      (t.prototype.error = function(r) {
        if (!this.isStopped) {
          var t = this._parentSubscriber,
            e = c.useDeprecatedSynchronousErrorHandling;
          if (this._error)
            e && t.syncErrorThrowable
              ? (this.__tryOrSetError(t, this._error, r), this.unsubscribe())
              : (this.__tryOrUnsub(this._error, r), this.unsubscribe());
          else if (t.syncErrorThrowable)
            e ? ((t.syncErrorValue = r), (t.syncErrorThrown = !0)) : k(r), this.unsubscribe();
          else {
            if ((this.unsubscribe(), e)) throw r;
            k(r);
          }
        }
      }),
      (t.prototype.complete = function() {
        var r = this;
        if (!this.isStopped) {
          var t = this._parentSubscriber;
          if (this._complete) {
            var e = function() {
              return r._complete.call(r._context);
            };
            c.useDeprecatedSynchronousErrorHandling && t.syncErrorThrowable
              ? (this.__tryOrSetError(t, e), this.unsubscribe())
              : (this.__tryOrUnsub(e), this.unsubscribe());
          } else this.unsubscribe();
        }
      }),
      (t.prototype.__tryOrUnsub = function(r, t) {
        try {
          r.call(this._context, t);
        } catch (e) {
          if ((this.unsubscribe(), c.useDeprecatedSynchronousErrorHandling)) throw e;
          k(e);
        }
      }),
      (t.prototype.__tryOrSetError = function(r, t, e) {
        if (!c.useDeprecatedSynchronousErrorHandling) throw new Error('bad call');
        try {
          t.call(this._context, e);
        } catch (o) {
          return c.useDeprecatedSynchronousErrorHandling
            ? ((r.syncErrorValue = o), (r.syncErrorThrown = !0), !0)
            : (k(o), !0);
        }
        return !1;
      }),
      (t.prototype._unsubscribe = function() {
        var r = this._parentSubscriber;
        (this._context = null), (this._parentSubscriber = null), r.unsubscribe();
      }),
      t
    );
  })(g);
  function rb(r, e, $) {
    if (r) {
      if (r instanceof g) return r;
      if (r[q]) return r[q]();
    }
    return r || e || $ ? new g(r, e, $) : new g(u);
  }
  var l = ('function' == typeof Symbol && Symbol.observable) || '@@observable';
  function ub(r) {
    return r
      ? 1 === r.length
        ? r[0]
        : function(e) {
            return r.reduce(function(r, e) {
              return e(r);
            }, e);
          }
      : wb;
  }
  function wb() {}
  var a = (function() {
    function r(r) {
      (this._isScalar = !1), r && (this._subscribe = r);
    }
    return (
      (r.prototype.lift = function(o) {
        var e = new r();
        return (e.source = this), (e.operator = o), e;
      }),
      (r.prototype.subscribe = function(r, o, e) {
        var t = this.operator,
          n = rb(r, o, e);
        if (
          (t
            ? n.add(t.call(n, this.source))
            : n.add(
                this.source || (c.useDeprecatedSynchronousErrorHandling && !n.syncErrorThrowable)
                  ? this._subscribe(n)
                  : this._trySubscribe(n)
              ),
          c.useDeprecatedSynchronousErrorHandling &&
            n.syncErrorThrowable &&
            ((n.syncErrorThrowable = !1), n.syncErrorThrown))
        )
          throw n.syncErrorValue;
        return n;
      }),
      (r.prototype._trySubscribe = function(r) {
        try {
          return this._subscribe(r);
        } catch (o) {
          c.useDeprecatedSynchronousErrorHandling && ((r.syncErrorThrown = !0), (r.syncErrorValue = o)),
            ta(r) ? r.error(o) : console.warn(o);
        }
      }),
      (r.prototype.forEach = function(r, o) {
        var e = this;
        return new (o = X(o))(function(o, t) {
          var n;
          n = e.subscribe(
            function(o) {
              try {
                r(o);
              } catch (e) {
                t(e), n && n.unsubscribe();
              }
            },
            t,
            o
          );
        });
      }),
      (r.prototype._subscribe = function(r) {
        var o = this.source;
        return o && o.subscribe(r);
      }),
      (r.prototype[l] = function() {
        return this;
      }),
      (r.prototype.pipe = function() {
        for (var r = [], o = 0; o < arguments.length; o++) r[o] = arguments[o];
        return 0 === r.length ? this : ub(r)(this);
      }),
      (r.prototype.toPromise = function(r) {
        var o = this;
        return new (r = X(r))(function(r, e) {
          var t;
          o.subscribe(
            function(r) {
              return (t = r);
            },
            function(r) {
              return e(r);
            },
            function() {
              return r(t);
            }
          );
        });
      }),
      (r.create = function(o) {
        return new r(o);
      }),
      r
    );
  })();
  function X(r) {
    if ((r || (r = c.Promise || Promise), !r)) throw new Error('no Promise impl found');
    return r;
  }
  function Y() {
    return Error.call(this), (this.message = 'object unsubscribed'), (this.name = 'ObjectUnsubscribedError'), this;
  }
  Y.prototype = Object.create(Error.prototype);
  var j = Y;
  var $ = (function(t) {
    function e(e, i) {
      var r = t.call(this) || this;
      return (r.subject = e), (r.subscriber = i), (r.closed = !1), r;
    }
    return (
      b(e, t),
      (e.prototype.unsubscribe = function() {
        if (!this.closed) {
          this.closed = !0;
          var t = this.subject,
            e = t.observers;
          if (((this.subject = null), e && 0 !== e.length && !t.isStopped && !t.closed)) {
            var i = e.indexOf(this.subscriber);
            -1 !== i && e.splice(i, 1);
          }
        }
      }),
      e
    );
  })(f);
  var wa = (function(r) {
    function t(t) {
      var e = r.call(this, t) || this;
      return (e.destination = t), e;
    }
    return b(t, r), t;
  })(g);
  var da = (function(r) {
    function t() {
      var t = r.call(this) || this;
      return (t.observers = []), (t.closed = !1), (t.isStopped = !1), (t.hasError = !1), (t.thrownError = null), t;
    }
    return (
      b(t, r),
      (t.prototype[q] = function() {
        return new wa(this);
      }),
      (t.prototype.lift = function(r) {
        var t = new ea(this, this);
        return (t.operator = r), t;
      }),
      (t.prototype.next = function(r) {
        if (this.closed) throw new j();
        if (!this.isStopped) for (var t = this.observers, e = t.length, o = t.slice(), i = 0; i < e; i++) o[i].next(r);
      }),
      (t.prototype.error = function(r) {
        if (this.closed) throw new j();
        (this.hasError = !0), (this.thrownError = r), (this.isStopped = !0);
        for (var t = this.observers, e = t.length, o = t.slice(), i = 0; i < e; i++) o[i].error(r);
        this.observers.length = 0;
      }),
      (t.prototype.complete = function() {
        if (this.closed) throw new j();
        this.isStopped = !0;
        for (var r = this.observers, t = r.length, e = r.slice(), o = 0; o < t; o++) e[o].complete();
        this.observers.length = 0;
      }),
      (t.prototype.unsubscribe = function() {
        (this.isStopped = !0), (this.closed = !0), (this.observers = null);
      }),
      (t.prototype._trySubscribe = function(t) {
        if (this.closed) throw new j();
        return r.prototype._trySubscribe.call(this, t);
      }),
      (t.prototype._subscribe = function(r) {
        if (this.closed) throw new j();
        return this.hasError
          ? (r.error(this.thrownError), f.EMPTY)
          : this.isStopped
          ? (r.complete(), f.EMPTY)
          : (this.observers.push(r), new $(this, r));
      }),
      (t.prototype.asObservable = function() {
        var r = new a();
        return (r.source = this), r;
      }),
      (t.create = function(r, t) {
        return new ea(r, t);
      }),
      t
    );
  })(a);
  var ea = (function(r) {
    function t(t, e) {
      var o = r.call(this) || this;
      return (o.destination = t), (o.source = e), o;
    }
    return (
      b(t, r),
      (t.prototype.next = function(r) {
        var t = this.destination;
        t && t.next && t.next(r);
      }),
      (t.prototype.error = function(r) {
        var t = this.destination;
        t && t.error && this.destination.error(r);
      }),
      (t.prototype.complete = function() {
        var r = this.destination;
        r && r.complete && this.destination.complete();
      }),
      (t.prototype._subscribe = function(r) {
        return this.source ? this.source.subscribe(r) : f.EMPTY;
      }),
      t
    );
  })(da);
  var Ka = (function(o) {
    function t(t, r) {
      return o.call(this) || this;
    }
    return (
      b(t, o),
      (t.prototype.schedule = function(o, t) {
        return void 0 === t && (t = 0), this;
      }),
      t
    );
  })(f);
  var Na = (function(t) {
    function i(i, e) {
      var n = t.call(this, i, e) || this;
      return (n.scheduler = i), (n.work = e), (n.pending = !1), n;
    }
    return (
      b(i, t),
      (i.prototype.schedule = function(t, i) {
        if ((void 0 === i && (i = 0), this.closed)) return this;
        this.state = t;
        var e = this.id,
          n = this.scheduler;
        return (
          null != e && (this.id = this.recycleAsyncId(n, e, i)),
          (this.pending = !0),
          (this.delay = i),
          (this.id = this.id || this.requestAsyncId(n, this.id, i)),
          this
        );
      }),
      (i.prototype.requestAsyncId = function(t, i, e) {
        return void 0 === e && (e = 0), setInterval(t.flush.bind(t, this), e);
      }),
      (i.prototype.recycleAsyncId = function(t, i, e) {
        if ((void 0 === e && (e = 0), null !== e && this.delay === e && !1 === this.pending)) return i;
        clearInterval(i);
      }),
      (i.prototype.execute = function(t, i) {
        if (this.closed) return new Error('executing a cancelled action');
        this.pending = !1;
        var e = this._execute(t, i);
        if (e) return e;
        !1 === this.pending && null != this.id && (this.id = this.recycleAsyncId(this.scheduler, this.id, null));
      }),
      (i.prototype._execute = function(t, i) {
        var e = !1,
          n = void 0;
        try {
          this.work(t);
        } catch (s) {
          (e = !0), (n = (!!s && s) || new Error(s));
        }
        if (e) return this.unsubscribe(), n;
      }),
      (i.prototype._unsubscribe = function() {
        var t = this.id,
          i = this.scheduler,
          e = i.actions,
          n = e.indexOf(this);
        (this.work = null),
          (this.state = null),
          (this.pending = !1),
          (this.scheduler = null),
          -1 !== n && e.splice(n, 1),
          null != t && (this.id = this.recycleAsyncId(i, t, null)),
          (this.delay = null);
      }),
      i
    );
  })(Ka);
  var Oa = (function(t) {
    function e(e, u) {
      var r = t.call(this, e, u) || this;
      return (r.scheduler = e), (r.work = u), r;
    }
    return (
      b(e, t),
      (e.prototype.schedule = function(e, u) {
        return (
          void 0 === u && (u = 0),
          u > 0
            ? t.prototype.schedule.call(this, e, u)
            : ((this.delay = u), (this.state = e), this.scheduler.flush(this), this)
        );
      }),
      (e.prototype.execute = function(e, u) {
        return u > 0 || this.closed ? t.prototype.execute.call(this, e, u) : this._execute(e, u);
      }),
      (e.prototype.requestAsyncId = function(e, u, r) {
        return (
          void 0 === r && (r = 0),
          (null !== r && r > 0) || (null === r && this.delay > 0)
            ? t.prototype.requestAsyncId.call(this, e, u, r)
            : e.flush(this)
        );
      }),
      e
    );
  })(Na);
  var ja = (function() {
    function e(r, t) {
      void 0 === t && (t = e.now), (this.SchedulerAction = r), (this.now = t);
    }
    return (
      (e.prototype.schedule = function(e, r, t) {
        return void 0 === r && (r = 0), new this.SchedulerAction(this, e).schedule(t, r);
      }),
      (e.now = function() {
        return Date.now();
      }),
      e
    );
  })();
  var Za = (function(e) {
    function t(r, i) {
      void 0 === i && (i = ja.now);
      var c =
        e.call(this, r, function() {
          return t.delegate && t.delegate !== c ? t.delegate.now() : i();
        }) || this;
      return (c.actions = []), (c.active = !1), (c.scheduled = void 0), c;
    }
    return (
      b(t, e),
      (t.prototype.schedule = function(r, i, c) {
        return (
          void 0 === i && (i = 0),
          t.delegate && t.delegate !== this ? t.delegate.schedule(r, i, c) : e.prototype.schedule.call(this, r, i, c)
        );
      }),
      (t.prototype.flush = function(e) {
        var t = this.actions;
        if (this.active) t.push(e);
        else {
          var r;
          this.active = !0;
          do {
            if ((r = e.execute(e.state, e.delay))) break;
          } while ((e = t.shift()));
          if (((this.active = !1), r)) {
            for (; (e = t.shift()); ) e.unsubscribe();
            throw r;
          }
        }
      }),
      t
    );
  })(ja);
  var _a = (function(e) {
    function r() {
      return (null !== e && e.apply(this, arguments)) || this;
    }
    return b(r, e), r;
  })(Za);
  var ab = new _a(Oa);
  var bb, db;
  var kb = new a(function(e) {
    return e.complete();
  });
  function ka(e) {
    return e ? nb(e) : kb;
  }
  function nb(e) {
    return new a(function($) {
      return e.schedule(function() {
        return $.complete();
      });
    });
  }
  function E() {
    for (var r = [], $ = 0; $ < arguments.length; $++) r[$] = arguments[$];
    var e = r[r.length - 1];
    switch ((qb(e) ? r.pop() : (e = void 0), r.length)) {
      case 0:
        return ka(e);
      case 1:
        return e ? t(r, e) : tb(r[0]);
      default:
        return t(r, e);
    }
  }
  function qb(e) {
    return e && 'function' == typeof e.schedule;
  }
  function t(r, e) {
    return e
      ? new a(function($) {
          var n = new f(),
            c = 0;
          return (
            n.add(
              e.schedule(function() {
                c !== r.length ? ($.next(r[c++]), $.closed || n.add(this.schedule())) : $.complete();
              })
            ),
            n
          );
        })
      : new a(G(r));
  }
  var G = function(r) {
    return function(e) {
      for (var s = 0, o = r.length; s < o && !e.closed; s++) e.next(r[s]);
      e.closed || e.complete();
    };
  };
  function tb(r) {
    var e = new a(function(e) {
      e.next(r), e.complete();
    });
    return (e._isScalar = !0), (e.value = r), e;
  }
  function w(r, e) {
    return e
      ? new a(function($) {
          return e.schedule(vb, 0, { error: r, subscriber: $ });
        })
      : new a(function(e) {
          return e.error(r);
        });
  }
  function vb(r) {
    var e = r.error;
    r.subscriber.error(e);
  }
  (function(e) {
    (e.NEXT = 'N'), (e.ERROR = 'E'), (e.COMPLETE = 'C');
  })(db || ((bb = db = {}), bb));
  var r = (function() {
    function e(e, t, r) {
      (this.kind = e), (this.value = t), (this.error = r), (this.hasValue = 'N' === e);
    }
    return (
      (e.prototype.observe = function(e) {
        switch (this.kind) {
          case 'N':
            return e.next && e.next(this.value);
          case 'E':
            return e.error && e.error(this.error);
          case 'C':
            return e.complete && e.complete();
        }
      }),
      (e.prototype.do = function(e, t, r) {
        switch (this.kind) {
          case 'N':
            return e && e(this.value);
          case 'E':
            return t && t(this.error);
          case 'C':
            return r && r();
        }
      }),
      (e.prototype.accept = function(e, t, r) {
        return e && 'function' == typeof e.next ? this.observe(e) : this.do(e, t, r);
      }),
      (e.prototype.toObservable = function() {
        switch (this.kind) {
          case 'N':
            return E(this.value);
          case 'E':
            return w(this.error);
          case 'C':
            return ka();
        }
        throw new Error('unexpected notification kind value');
      }),
      (e.createNext = function(t) {
        return void 0 !== t ? new e('N', t) : e.undefinedValueNotification;
      }),
      (e.createError = function(t) {
        return new e('E', void 0, t);
      }),
      (e.createComplete = function() {
        return e.completeNotification;
      }),
      (e.completeNotification = new e('C')),
      (e.undefinedValueNotification = new e('N', void 0)),
      e
    );
  })();
  var Jb = (function() {
    function e(e, s) {
      void 0 === s && (s = 0), (this.scheduler = e), (this.delay = s);
    }
    return (
      (e.prototype.call = function(e, s) {
        return s.subscribe(new D(e, this.scheduler, this.delay));
      }),
      e
    );
  })();
  var D = (function(e) {
    function s(s, r, t) {
      void 0 === t && (t = 0);
      var i = e.call(this, s) || this;
      return (i.scheduler = r), (i.delay = t), i;
    }
    return (
      b(s, e),
      (s.dispatch = function(e) {
        var s = e.notification,
          r = e.destination;
        s.observe(r), this.unsubscribe();
      }),
      (s.prototype.scheduleMessage = function(e) {
        this.destination.add(this.scheduler.schedule(s.dispatch, this.delay, new zb(e, this.destination)));
      }),
      (s.prototype._next = function(e) {
        this.scheduleMessage(r.createNext(e));
      }),
      (s.prototype._error = function(e) {
        this.scheduleMessage(r.createError(e)), this.unsubscribe();
      }),
      (s.prototype._complete = function() {
        this.scheduleMessage(r.createComplete()), this.unsubscribe();
      }),
      s
    );
  })(g);
  var zb = (function() {
    return function(e, s) {
      (this.notification = e), (this.destination = s);
    };
  })();
  var Ab = (function(e) {
    function t(t, r, i) {
      void 0 === t && (t = Number.POSITIVE_INFINITY), void 0 === r && (r = Number.POSITIVE_INFINITY);
      var n = e.call(this) || this;
      return (
        (n.scheduler = i),
        (n._events = []),
        (n._infiniteTimeWindow = !1),
        (n._bufferSize = t < 1 ? 1 : t),
        (n._windowTime = r < 1 ? 1 : r),
        r === Number.POSITIVE_INFINITY
          ? ((n._infiniteTimeWindow = !0), (n.next = n.nextInfiniteTimeWindow))
          : (n.next = n.nextTimeWindow),
        n
      );
    }
    return (
      b(t, e),
      (t.prototype.nextInfiniteTimeWindow = function(t) {
        var r = this._events;
        r.push(t), r.length > this._bufferSize && r.shift(), e.prototype.next.call(this, t);
      }),
      (t.prototype.nextTimeWindow = function(t) {
        this._events.push(new Bb(this._getNow(), t)), this._trimBufferThenGetEvents(), e.prototype.next.call(this, t);
      }),
      (t.prototype._subscribe = function(e) {
        var t,
          r = this._infiniteTimeWindow,
          i = r ? this._events : this._trimBufferThenGetEvents(),
          n = this.scheduler,
          o = i.length;
        if (this.closed) throw new j();
        if (
          (this.isStopped || this.hasError ? (t = f.EMPTY) : (this.observers.push(e), (t = new $(this, e))),
          n && e.add((e = new D(e, n))),
          r)
        )
          for (var s = 0; s < o && !e.closed; s++) e.next(i[s]);
        else for (s = 0; s < o && !e.closed; s++) e.next(i[s].value);
        return this.hasError ? e.error(this.thrownError) : this.isStopped && e.complete(), t;
      }),
      (t.prototype._getNow = function() {
        return (this.scheduler || ab).now();
      }),
      (t.prototype._trimBufferThenGetEvents = function() {
        for (
          var e = this._getNow(), t = this._bufferSize, r = this._windowTime, i = this._events, n = i.length, o = 0;
          o < n && !(e - i[o].time < r);

        )
          o++;
        return n > t && (o = Math.max(o, n - t)), o > 0 && i.splice(0, o), i;
      }),
      t
    );
  })(da);
  var Bb = (function() {
    return function(e, t) {
      (this.time = e), (this.value = t);
    };
  })();
  function Cb(r, t) {
    return function(e) {
      if ('function' != typeof r) throw new TypeError('argument is not a function. Are you looking for `mapTo()`?');
      return e.lift(new Db(r, t));
    };
  }
  var Db = (function() {
    function r(r, t) {
      (this.project = r), (this.thisArg = t);
    }
    return (
      (r.prototype.call = function(r, t) {
        return t.subscribe(new Gb(r, this.project, this.thisArg));
      }),
      r
    );
  })();
  var Gb = (function(r) {
    function t(t, e, o) {
      var i = r.call(this, t) || this;
      return (i.project = e), (i.count = 0), (i.thisArg = o || i), i;
    }
    return (
      b(t, r),
      (t.prototype._next = function(r) {
        var t;
        try {
          t = this.project.call(this.thisArg, r, this.count++);
        } catch (e) {
          return void this.destination.error(e);
        }
        this.destination.next(t);
      }),
      t
    );
  })(g);
  var K = function(r) {
    return function(e) {
      return (
        r
          .then(
            function(r) {
              e.closed || (e.next(r), e.complete());
            },
            function(r) {
              return e.error(r);
            }
          )
          .then(null, k),
        e
      );
    };
  };
  function qa() {
    return 'function' == typeof Symbol && Symbol.iterator ? Symbol.iterator : '@@iterator';
  }
  var p = qa();
  var M = function(r) {
    return function(e) {
      for (var o = r[p](); ; ) {
        var t = o.next();
        if (t.done) {
          e.complete();
          break;
        }
        if ((e.next(t.value), e.closed)) break;
      }
      return (
        'function' == typeof o.return &&
          e.add(function() {
            o.return && o.return();
          }),
        e
      );
    };
  };
  var N = function(e) {
    return function(r) {
      var b = e[l]();
      if ('function' != typeof b.subscribe)
        throw new TypeError('Provided object does not correctly implement Symbol.observable');
      return b.subscribe(r);
    };
  };
  var O = function(r) {
    return r && 'number' == typeof r.length && 'function' != typeof r;
  };
  function P(e) {
    return !!e && 'function' != typeof e.subscribe && 'function' == typeof e.then;
  }
  var ya = function(r) {
    if (r instanceof a)
      return function(e) {
        return r._isScalar ? (e.next(r.value), void e.complete()) : r.subscribe(e);
      };
    if (r && 'function' == typeof r[l]) return N(r);
    if (O(r)) return G(r);
    if (P(r)) return K(r);
    if (r && 'function' == typeof r[p]) return M(r);
    var e = W(r) ? 'an invalid object' : "'" + r + "'";
    throw new TypeError(
      'You provided ' + e + ' where a stream was expected. You can provide an Observable, Promise, Array, or Iterable.'
    );
  };
  function za(r, e) {
    if (!e) return r instanceof a ? r : new a(ya(r));
    if (null != r) {
      if (Aa(r)) return Ea(r, e);
      if (P(r)) return Ca(r, e);
      if (O(r)) return t(r, e);
      if (Ba(r) || 'string' == typeof r) return Da(r, e);
    }
    throw new TypeError(((null !== r && typeof r) || r) + ' is not observable');
  }
  function Aa(e) {
    return e && 'function' == typeof e[l];
  }
  function Ba(r) {
    return r && 'function' == typeof r[p];
  }
  function Ca(e, r) {
    return r
      ? new a(function(t) {
          var o = new f();
          return (
            o.add(
              r.schedule(function() {
                return e.then(
                  function(e) {
                    o.add(
                      r.schedule(function() {
                        t.next(e),
                          o.add(
                            r.schedule(function() {
                              return t.complete();
                            })
                          );
                      })
                    );
                  },
                  function(e) {
                    o.add(
                      r.schedule(function() {
                        return t.error(e);
                      })
                    );
                  }
                );
              })
            ),
            o
          );
        })
      : new a(K(e));
  }
  function Da(e, r) {
    if (!e) throw new Error('Iterable cannot be null');
    return r
      ? new a(function(t) {
          var o,
            $ = new f();
          return (
            $.add(function() {
              o && 'function' == typeof o.return && o.return();
            }),
            $.add(
              r.schedule(function() {
                (o = e[p]()),
                  $.add(
                    r.schedule(function() {
                      if (!t.closed) {
                        var e, r;
                        try {
                          var $ = o.next();
                          (e = $.value), (r = $.done);
                        } catch (p) {
                          return void t.error(p);
                        }
                        r ? t.complete() : (t.next(e), this.schedule());
                      }
                    })
                  );
              })
            ),
            $
          );
        })
      : new a(M(e));
  }
  function Ea(e, r) {
    return r
      ? new a(function(o) {
          var $ = new f();
          return (
            $.add(
              r.schedule(function() {
                var b = e[l]();
                $.add(
                  b.subscribe({
                    next: function(e) {
                      $.add(
                        r.schedule(function() {
                          return o.next(e);
                        })
                      );
                    },
                    error: function(e) {
                      $.add(
                        r.schedule(function() {
                          return o.error(e);
                        })
                      );
                    },
                    complete: function() {
                      $.add(
                        r.schedule(function() {
                          return o.complete();
                        })
                      );
                    },
                  })
                );
              })
            ),
            $
          );
        })
      : new a(N(e));
  }
  var Q = function() {
    return 'undefined' == typeof window ? sa : window;
  };
  var Ga = function() {
    return Q().scalecube || { clusters: {} };
  };
  var Ha = function(e) {
    var s = e.seedAddress,
      r = Q();
    (r.scalecube = r.scalecube || {}), (r.scalecube.clusters = r.scalecube.clusters || {});
    var i = Ga().clusters;
    return i[s] || (i[s] = { discoveries: [], allDiscoveredItems: [] }), i[s];
  };
  var Ia = function(e) {
    var s = e.cluster,
      r = e.address;
    return (
      (s.allDiscoveredItems = s.allDiscoveredItems.filter(function(e) {
        return e.address !== r;
      })),
      s.discoveries.forEach(function(e) {
        e.discoveredItems = e.discoveredItems.filter(function(e) {
          return e.address !== r;
        });
      }),
      (s.discoveries = s.discoveries.filter(function(e) {
        return e.address !== r;
      })),
      R({ discoveries: s.discoveries }),
      s
    );
  };
  var Ja = function(e) {
    var s = e.cluster,
      r = e.itemsToPublish,
      i = e.address,
      t = e.subjectNotifier;
    s.discoveries.forEach(function(e) {
      e.discoveredItems = e.discoveredItems.concat(r);
    });
    var c = (s.allDiscoveredItems || []).slice();
    return (
      s.discoveries.push({ address: i, discoveredItems: c, subjectNotifier: t }),
      (s.allDiscoveredItems = (s.allDiscoveredItems || []).concat(r)),
      R({ discoveries: s.discoveries }),
      s
    );
  };
  var R = function(e) {
    return e.discoveries.forEach(function(e) {
      return e && e.subjectNotifier && e.subjectNotifier.next(e.discoveredItems || []);
    });
  };
  var La = function(e, s) {
    return e + ' has been removed from ' + s;
  };
  var Ma = function(e) {
    var r = e.address,
      s = e.itemsToPublish,
      t = e.seedAddress,
      $ = Ha({ seedAddress: t }),
      o = new Ab(1);
    return (
      ($ = Ja({ cluster: $, address: r, itemsToPublish: s, subjectNotifier: o })),
      Object.freeze({
        destroy: function() {
          return ($ = Ia({ cluster: $, address: r })), o && o.complete(), Promise.resolve(La(r, t));
        },
        discoveredItems$: function() {
          return o.asObservable();
        },
      })
    );
  };
  var S = Object.freeze({
    route: function(e) {
      var r = e.message,
        t = (0, e.lookUp)({ qualifier: r.qualifier });
      return t && Array.isArray(t) && t.length > 0 ? t[0] : null;
    },
  });
  var h = 'microservice does not exists';
  var Pa = 'Message has not been provided';
  var Qa = '(serviceDefinition) is not defined';
  var Ra = '(serviceDefinition.serviceName) is not defined';
  var Sa = 'Message format error: data must be Array';
  var C = function(e) {
    return 'service ' + e + ' is not valid.';
  };
  var Ua = function(e) {
    return "service method '" + e + "' missing in the serviceDefinition";
  };
  var Va = function(e) {
    return "can't find services with the request: '" + JSON.stringify(e) + "'";
  };
  var Wa = function(e, r) {
    return 'asyncModel miss match, expect ' + e + ', but received ' + r;
  };
  var Xa = function(e) {
    return "Can't find method " + e.qualifier;
  };
  var Ya = function(e) {
    return 'Invalid method reference for ' + e;
  };
  var d = { REQUEST_RESPONSE: 'RequestResponse', REQUEST_STREAM: 'RequestStream' };
  var $a = function(e) {
    return e && 'object' == typeof e && e.constructor === Object;
  };
  var x = function(e) {
    return e && e instanceof Function;
  };
  var m = function(e) {
    var r = e.asyncModel,
      o = e.errorMessage,
      t = new Error(o);
    return console.warn(o), r === d.REQUEST_RESPONSE ? Promise.reject(t) : w(t);
  };
  var y = function(e) {
    return e.serviceName + '/' + e.methodName;
  };
  var cb = function(e) {
    var r,
      t = e.reference,
      $ = e.methodName,
      i = e.qualifier;
    if (x(t)) r = t;
    else if (x(t[$])) r = t[$].bind(t);
    else {
      if (!x(t.constructor[$])) throw new Error(Ya(i));
      r = t.constructor[$];
    }
    return r;
  };
  var z = function(e) {
    return !!e && eb(e.serviceName) && fb(e.methods);
  };
  var eb = function(e) {
    return 'string' == typeof e || (console.error(new Error('Service missing serviceName:string')), !1);
  };
  var fb = function(e) {
    return $a(e)
      ? Object.keys(e).every(function(r) {
          return gb({ methodData: e[r], methodName: r });
        })
      : (console.error(new Error('Service missing methods:object')), !1);
  };
  var gb = function(e) {
    var r = e.methodData,
      i = e.methodName;
    return (
      !!hb({ asyncModel: r.asyncModel }) ||
      (console.error(new Error('method ' + i + " doesn't contain valid  type (asyncModel)")), !1)
    );
  };
  var hb = function(e) {
    var r = e.asyncModel;
    return Object.values(d).includes(r);
  };
  var ib = function(e) {
    var r = e.serviceCall,
      i = e.serviceDefinition;
    if (!z(i)) {
      if (!i) throw new Error(Qa);
      if (!i.serviceName) throw new Error(Ra);
      throw new Error(C(i.serviceName));
    }
    return new Proxy({}, { get: jb({ serviceDefinition: i, serviceCall: r }) });
  };
  var jb = function(e) {
    var r = e.serviceCall,
      i = e.serviceDefinition;
    return function(e, t) {
      if (!i.methods[t]) throw new Error(Ua(t));
      var o = i.methods[t].asyncModel;
      return function() {
        for (var e = [], $ = 0; $ < arguments.length; $++) e[$] = arguments[$];
        var a = { qualifier: y({ serviceName: i.serviceName, methodName: t }), data: e };
        return r({ message: a, asyncModel: o, includeMessage: !1 });
      };
    };
  };
  var n = {};
  var lb =
      (n && n.__assign) ||
      function() {
        return (lb =
          Object.assign ||
          function(e) {
            for (var r, o = 1, $ = arguments.length; o < $; o++)
              for (var a in (r = arguments[o])) Object.prototype.hasOwnProperty.call(r, a) && (e[a] = r[a]);
            return e;
          }).apply(this, arguments);
      },
    _ = function(e) {
      var r = e.localService,
        o = e.asyncModel,
        $ = e.includeMessage,
        a = e.message,
        s = r.reference,
        l = r.asyncModel,
        t = s && s[r.methodName];
      return l !== o
        ? m({ asyncModel: d.REQUEST_STREAM, errorMessage: Wa(o, l) })
        : a.data && Array.isArray(a.data)
        ? t
          ? aa({ method: t, message: a }).pipe(ba({ includeMessage: $, message: a }))
          : m({ asyncModel: d.REQUEST_STREAM, errorMessage: '' + Xa(a) })
        : w(new Error(Sa));
    };
  n.localCall = _;
  var aa = function(e) {
    var r = e.method,
      o = e.message;
    return za(r.apply(void 0, o.data)).pipe();
  };
  n.invokeMethod = aa;
  var ba = function(e) {
    var r = e.includeMessage,
      o = e.message;
    return Cb(function(e) {
      return r ? lb({}, o, { data: e }) : e;
    });
  };
  n.addMessageToResponse = ba;
  var pb = function(r) {
    var e = r.router,
      o = r.microserviceContext,
      $ = r.message,
      t = r.asyncModel,
      s = e.route({ lookUp: o.serviceRegistry.lookUp, message: $ });
    if (!s) return m({ asyncModel: d.REQUEST_STREAM, errorMessage: Va($.qualifier) });
    var l = s.asyncModel;
    return l !== t
      ? m({
          asyncModel: d.REQUEST_STREAM,
          errorMessage: 'asyncModel is not correct, expected ' + t + ' but received ' + l,
        })
      : E({});
  };
  var ca = function(e) {
    var r = e.router,
      c = e.microserviceContext;
    return function(e) {
      var l = e.message,
        o = e.asyncModel,
        a = e.includeMessage;
      if (!l) return m({ asyncModel: o, errorMessage: Pa });
      var $ = c.methodRegistry.lookUp({ qualifier: l.qualifier }),
        t = $
          ? _({ localService: $, asyncModel: o, includeMessage: a, message: l })
          : pb({ router: r, microserviceContext: c, message: l, asyncModel: o });
      return o === d.REQUEST_RESPONSE ? t.toPromise() : t;
    };
  };
  var e = {};
  var B =
      (e && e.__assign) ||
      function() {
        return (B =
          Object.assign ||
          function(e) {
            for (var r, n = 1, t = arguments.length; n < t; n++)
              for (var i in (r = arguments[n])) Object.prototype.hasOwnProperty.call(r, i) && (e[i] = r[i]);
            return e;
          }).apply(this, arguments);
      },
    fa = function() {
      var e = {};
      return Object.freeze({
        lookUp: function(r) {
          var n = r.qualifier;
          if (!e) throw new Error(h);
          return e[n] || [];
        },
        createEndPoints: function(r) {
          var n = r.services,
            t = void 0 === n ? [] : n,
            i = r.address;
          if (!e) throw new Error(h);
          return ga({ services: t, address: i });
        },
        add: function(r) {
          var n = r.endpoints;
          return (e = ha({ serviceRegistryMap: e, endpoints: void 0 === n ? [] : n })), B({}, e);
        },
        destroy: function() {
          return (e = null), null;
        },
      });
    };
  e.createServiceRegistry = fa;
  var ga = function(e) {
    var r = e.services,
      n = void 0 === r ? [] : r,
      t = e.address;
    return n.reduce(function(e, r) {
      return e.concat(ia({ service: r, address: t }));
    }, []);
  };
  e.getEndpointsFromServices = ga;
  var ha = function(e) {
    var r = e.serviceRegistryMap,
      n = e.endpoints;
    return B(
      {},
      n.reduce(function(e, r) {
        var n;
        return B({}, e, (((n = {})[r.qualifier] = (e[r.qualifier] || []).concat([r])), n));
      }, r || {})
    );
  };
  e.getUpdatedServiceRegistry = ha;
  var ia = function(e) {
    var r = e.service,
      n = e.address,
      t = r.definition;
    if (!z(t)) throw new Error(C(t.serviceName));
    var i = t.serviceName,
      o = t.methods;
    return Object.keys(o).map(function(e) {
      return {
        qualifier: y({ serviceName: i, methodName: e }),
        serviceName: i,
        methodName: e,
        asyncModel: o[e].asyncModel,
        transport: 'window:/',
        uri: 'window://' + i + '/' + e,
        address: n,
      };
    });
  };
  e.getEndpointsFromService = ia;
  var i = {};
  var s =
      (i && i.__assign) ||
      function() {
        return (s =
          Object.assign ||
          function(e) {
            for (var r, t = 1, n = arguments.length; t < n; t++)
              for (var i in (r = arguments[t])) Object.prototype.hasOwnProperty.call(r, i) && (e[i] = r[i]);
            return e;
          }).apply(this, arguments);
      },
    la = function() {
      var e = {};
      return Object.freeze({
        lookUp: function(r) {
          var t = r.qualifier;
          if (!e) throw new Error(h);
          return e[t] || null;
        },
        add: function(r) {
          var t = r.services,
            n = void 0 === t ? [] : t,
            i = r.address;
          if (!e) throw new Error(h);
          var $ = ma({ services: n, address: i });
          return (e = na({ methodRegistryMap: e, references: $ })), s({}, e);
        },
        destroy: function() {
          return (e = null), null;
        },
      });
    };
  i.createMethodRegistry = la;
  var ma = function(e) {
    var r = e.services,
      t = void 0 === r ? [] : r,
      n = e.address;
    return t.reduce(function(e, r) {
      return e.concat(oa({ service: r, address: n }));
    }, []);
  };
  i.getReferenceFromServices = ma;
  var na = function(e) {
    var r = e.methodRegistryMap,
      t = e.references;
    return s(
      {},
      r,
      t.reduce(function(e, r) {
        var t;
        return s({}, e, (((t = {})[r.qualifier] = r), t));
      }, r || {})
    );
  };
  i.getUpdatedMethodRegistry = na;
  var oa = function(e) {
    var r = e.service,
      t = (e.address, []),
      n = r.definition,
      i = r.reference;
    if (!z(n)) throw new Error(C(n.serviceName));
    var $ = n.serviceName,
      o = n.methods;
    return (
      Object.keys(o).forEach(function(e) {
        var r,
          n = y({ serviceName: $, methodName: e });
        t.push({
          qualifier: n,
          serviceName: $,
          methodName: e,
          asyncModel: o[e].asyncModel,
          reference: ((r = {}), (r[e] = cb({ reference: i, methodName: e, qualifier: n })), r),
        });
      }),
      t
    );
  };
  i.getReferenceFromService = oa;
  var pa = Object.freeze({
    create: function(e) {
      var $SC1$$interop$default = Ta(sb);
      var r = e.services,
        t = e.seedAddress,
        i = void 0 === t ? 'defaultSeedAddress' : t,
        o = $SC1$$interop$default.d(),
        s = Eb(),
        c = s.methodRegistry,
        $ = s.serviceRegistry;
      r && Array.isArray(r) && c.add({ services: r, address: o });
      var a = r && Array.isArray(r) ? $.createEndPoints({ services: r, address: o }) : [],
        n = Ma({ address: o, itemsToPublish: a, seedAddress: i });
      return (
        n.discoveredItems$().subscribe(function(e) {
          return $.add({ endpoints: e });
        }),
        Object.freeze({
          createProxy: function(e) {
            var r = e.router,
              t = void 0 === r ? S : r,
              i = e.serviceDefinition;
            if (!s) throw new Error(h);
            return ib({ serviceCall: ca({ router: t, microserviceContext: s }), serviceDefinition: i });
          },
          createServiceCall: function(e) {
            var r = e.router,
              t = void 0 === r ? S : r;
            if (!s) throw new Error(h);
            var i = ca({ router: t, microserviceContext: s });
            return Object.freeze({
              requestStream: function(e) {
                return i({ message: e, asyncModel: d.REQUEST_STREAM, includeMessage: !0 });
              },
              requestResponse: function(e) {
                return i({ message: e, asyncModel: d.REQUEST_RESPONSE, includeMessage: !0 });
              },
            });
          },
          destroy: function() {
            if (!s) throw new Error(h);
            return (
              n && n.destroy(),
              Object.values(s).forEach(function(e) {
                return 'function' == typeof e.destroy && e.destroy();
              }),
              (s = null)
            );
          },
        })
      );
    },
  });
  var Eb = function() {
    return { serviceRegistry: fa(), methodRegistry: la() };
  };
  var Fb = (function() {
      function e() {
        (this.hello = function(e) {
          return new Promise(function(r, t) {
            e ? r('Hello ' + e) : t(new Error('please provide user to greet'));
          });
        }),
          (this.empty = null);
      }
      return (
        (e.prototype.greet$ = function(e) {
          return new a(function(r) {
            return e && Array.isArray(e) && 0 !== e.length
              ? (e.map(function(e) {
                  return r.next('greetings ' + e);
                }),
                function() {})
              : (r.error(new Error('please provide Array of greetings')), function() {});
          });
        }),
        e
      );
    })(),
    T = {
      serviceName: 'GreetingService',
      methods: { hello: { asyncModel: d.REQUEST_RESPONSE }, greet$: { asyncModel: d.REQUEST_STREAM } },
    };
  var Hb = { definition: T, reference: new Fb() },
    xb = pa.create({ services: [Hb] }),
    Ib = xb.createProxy({ serviceDefinition: T });
  Ib.hello('User').then(function(e) {
    console.info('result from greeting service', e);
  }),
    console.info('Microservices from @scalecube/scalecube-microservice', pa);
})();
