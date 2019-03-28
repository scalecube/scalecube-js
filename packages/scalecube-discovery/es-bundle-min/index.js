(function() {
  var ea = this;
  var e = {};
  function D(r) {
    for (; r; ) {
      var e = r,
        o = e.closed,
        t = e.destination,
        $ = e.isStopped;
      if (o || $) return !1;
      r = t && t instanceof f ? t : null;
    }
    return !0;
  }
  var $ = function(t, e) {
    return ($ =
      Object.setPrototypeOf ||
      ({ __proto__: [] } instanceof Array &&
        function(t, e) {
          t.__proto__ = e;
        }) ||
      function(t, e) {
        for (var r in e) e.hasOwnProperty(r) && (t[r] = e[r]);
      })(t, e);
  };
  function a(t, e) {
    function r() {
      this.constructor = t;
    }
    $(t, e), (t.prototype = null === e ? Object.create(e) : ((r.prototype = e.prototype), new r()));
  }
  var ja = function() {
    return (
      (ja =
        Object.assign ||
        function(t) {
          for (var e, r = 1, o = arguments.length; r < o; r++)
            for (var n in (e = arguments[r])) Object.prototype.hasOwnProperty.call(e, n) && (t[n] = e[n]);
          return t;
        }),
      ja.apply(this, arguments)
    );
  };
  function o(t) {
    return this instanceof o ? ((this.v = t), this) : new o(t);
  }
  function l(n) {
    return 'function' == typeof n;
  }
  var aa = !1,
    b = {
      Promise: void 0,
      set useDeprecatedSynchronousErrorHandling(r) {
        r && new Error().stack;
        aa = r;
      },
      get useDeprecatedSynchronousErrorHandling() {
        return aa;
      },
    };
  function h(r) {
    setTimeout(function() {
      throw r;
    });
  }
  var j = {
    closed: !0,
    next: function(r) {},
    error: function(r) {
      if (b.useDeprecatedSynchronousErrorHandling) throw r;
      h(r);
    },
    complete: function() {},
  };
  var F =
    Array.isArray ||
    function(r) {
      return r && 'number' == typeof r.length;
    };
  function G(t) {
    return null !== t && 'object' == typeof t;
  }
  function t(r) {
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
  t.prototype = Object.create(Error.prototype);
  var k = t;
  var d = (function() {
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
          if (l(n))
            try {
              n.call(this);
            } catch (p) {
              (t = !0), (r = p instanceof k ? v(p.errors) : [p]);
            }
          if (F(o))
            for (e = -1, u = o.length; ++e < u; ) {
              var c = o[e];
              if (G(c))
                try {
                  c.unsubscribe();
                } catch (p) {
                  (t = !0), (r = r || []), p instanceof k ? (r = r.concat(v(p.errors))) : r.push(p);
                }
            }
          if (t) throw new k(r);
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
  function v(r) {
    return r.reduce(function(r, t) {
      return r.concat(t instanceof k ? t.errors : t);
    }, []);
  }
  var i = 'function' == typeof Symbol ? Symbol('rxSubscriber') : '@@rxSubscriber_' + Math.random();
  var f = (function(r) {
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
          s.destination = j;
          break;
        case 1:
          if (!e) {
            s.destination = j;
            break;
          }
          if ('object' == typeof e) {
            e instanceof t
              ? ((s.syncErrorThrowable = e.syncErrorThrowable), (s.destination = e), e.add(s))
              : ((s.syncErrorThrowable = !0), (s.destination = new n(s, e)));
            break;
          }
        default:
          (s.syncErrorThrowable = !0), (s.destination = new n(s, e, o, i));
      }
      return s;
    }
    return (
      a(t, r),
      (t.prototype[i] = function() {
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
  })(d);
  var n = (function(r) {
    function t(t, e, o, i) {
      var s,
        n = r.call(this) || this;
      n._parentSubscriber = t;
      var c = n;
      return (
        l(e)
          ? (s = e)
          : e &&
            ((s = e.next),
            (o = e.error),
            (i = e.complete),
            e !== j &&
              ((c = Object.create(e)),
              l(c.unsubscribe) && n.add(c.unsubscribe.bind(c)),
              (c.unsubscribe = n.unsubscribe.bind(n)))),
        (n._context = c),
        (n._next = s),
        (n._error = o),
        (n._complete = i),
        n
      );
    }
    return (
      a(t, r),
      (t.prototype.next = function(r) {
        if (!this.isStopped && this._next) {
          var t = this._parentSubscriber;
          b.useDeprecatedSynchronousErrorHandling && t.syncErrorThrowable
            ? this.__tryOrSetError(t, this._next, r) && this.unsubscribe()
            : this.__tryOrUnsub(this._next, r);
        }
      }),
      (t.prototype.error = function(r) {
        if (!this.isStopped) {
          var t = this._parentSubscriber,
            e = b.useDeprecatedSynchronousErrorHandling;
          if (this._error)
            e && t.syncErrorThrowable
              ? (this.__tryOrSetError(t, this._error, r), this.unsubscribe())
              : (this.__tryOrUnsub(this._error, r), this.unsubscribe());
          else if (t.syncErrorThrowable)
            e ? ((t.syncErrorValue = r), (t.syncErrorThrown = !0)) : h(r), this.unsubscribe();
          else {
            if ((this.unsubscribe(), e)) throw r;
            h(r);
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
            b.useDeprecatedSynchronousErrorHandling && t.syncErrorThrowable
              ? (this.__tryOrSetError(t, e), this.unsubscribe())
              : (this.__tryOrUnsub(e), this.unsubscribe());
          } else this.unsubscribe();
        }
      }),
      (t.prototype.__tryOrUnsub = function(r, t) {
        try {
          r.call(this._context, t);
        } catch (e) {
          if ((this.unsubscribe(), b.useDeprecatedSynchronousErrorHandling)) throw e;
          h(e);
        }
      }),
      (t.prototype.__tryOrSetError = function(r, t, e) {
        if (!b.useDeprecatedSynchronousErrorHandling) throw new Error('bad call');
        try {
          t.call(this._context, e);
        } catch (o) {
          return b.useDeprecatedSynchronousErrorHandling
            ? ((r.syncErrorValue = o), (r.syncErrorThrown = !0), !0)
            : (h(o), !0);
        }
        return !1;
      }),
      (t.prototype._unsubscribe = function() {
        var r = this._parentSubscriber;
        (this._context = null), (this._parentSubscriber = null), r.unsubscribe();
      }),
      t
    );
  })(f);
  function H(r, e, $) {
    if (r) {
      if (r instanceof f) return r;
      if (r[i]) return r[i]();
    }
    return r || e || $ ? new f(r, e, $) : new f(j);
  }
  var K = ('function' == typeof Symbol && Symbol.observable) || '@@observable';
  function R(r) {
    return r
      ? 1 === r.length
        ? r[0]
        : function(e) {
            return r.reduce(function(r, e) {
              return e(r);
            }, e);
          }
      : V;
  }
  function V() {}
  var c = (function() {
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
          n = H(r, o, e);
        if (
          (t
            ? n.add(t.call(n, this.source))
            : n.add(
                this.source || (b.useDeprecatedSynchronousErrorHandling && !n.syncErrorThrowable)
                  ? this._subscribe(n)
                  : this._trySubscribe(n)
              ),
          b.useDeprecatedSynchronousErrorHandling &&
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
          b.useDeprecatedSynchronousErrorHandling && ((r.syncErrorThrown = !0), (r.syncErrorValue = o)),
            D(r) ? r.error(o) : console.warn(o);
        }
      }),
      (r.prototype.forEach = function(r, o) {
        var e = this;
        return new (o = p(o))(function(o, t) {
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
      (r.prototype[K] = function() {
        return this;
      }),
      (r.prototype.pipe = function() {
        for (var r = [], o = 0; o < arguments.length; o++) r[o] = arguments[o];
        return 0 === r.length ? this : R(r)(this);
      }),
      (r.prototype.toPromise = function(r) {
        var o = this;
        return new (r = p(r))(function(r, e) {
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
  function p(r) {
    if ((r || (r = b.Promise || Promise), !r)) throw new Error('no Promise impl found');
    return r;
  }
  function q() {
    return Error.call(this), (this.message = 'object unsubscribed'), (this.name = 'ObjectUnsubscribedError'), this;
  }
  q.prototype = Object.create(Error.prototype);
  var g = q;
  var u = (function(t) {
    function e(e, i) {
      var r = t.call(this) || this;
      return (r.subject = e), (r.subscriber = i), (r.closed = !1), r;
    }
    return (
      a(e, t),
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
  })(d);
  var E = (function(r) {
    function t(t) {
      var e = r.call(this, t) || this;
      return (e.destination = t), e;
    }
    return a(t, r), t;
  })(f);
  var r = (function(r) {
    function t() {
      var t = r.call(this) || this;
      return (t.observers = []), (t.closed = !1), (t.isStopped = !1), (t.hasError = !1), (t.thrownError = null), t;
    }
    return (
      a(t, r),
      (t.prototype[i] = function() {
        return new E(this);
      }),
      (t.prototype.lift = function(r) {
        var t = new s(this, this);
        return (t.operator = r), t;
      }),
      (t.prototype.next = function(r) {
        if (this.closed) throw new g();
        if (!this.isStopped) for (var t = this.observers, e = t.length, o = t.slice(), i = 0; i < e; i++) o[i].next(r);
      }),
      (t.prototype.error = function(r) {
        if (this.closed) throw new g();
        (this.hasError = !0), (this.thrownError = r), (this.isStopped = !0);
        for (var t = this.observers, e = t.length, o = t.slice(), i = 0; i < e; i++) o[i].error(r);
        this.observers.length = 0;
      }),
      (t.prototype.complete = function() {
        if (this.closed) throw new g();
        this.isStopped = !0;
        for (var r = this.observers, t = r.length, e = r.slice(), o = 0; o < t; o++) e[o].complete();
        this.observers.length = 0;
      }),
      (t.prototype.unsubscribe = function() {
        (this.isStopped = !0), (this.closed = !0), (this.observers = null);
      }),
      (t.prototype._trySubscribe = function(t) {
        if (this.closed) throw new g();
        return r.prototype._trySubscribe.call(this, t);
      }),
      (t.prototype._subscribe = function(r) {
        if (this.closed) throw new g();
        return this.hasError
          ? (r.error(this.thrownError), d.EMPTY)
          : this.isStopped
          ? (r.complete(), d.EMPTY)
          : (this.observers.push(r), new u(this, r));
      }),
      (t.prototype.asObservable = function() {
        var r = new c();
        return (r.source = this), r;
      }),
      (t.create = function(r, t) {
        return new s(r, t);
      }),
      t
    );
  })(c);
  var s = (function(r) {
    function t(t, e) {
      var o = r.call(this) || this;
      return (o.destination = t), (o.source = e), o;
    }
    return (
      a(t, r),
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
        return this.source ? this.source.subscribe(r) : d.EMPTY;
      }),
      t
    );
  })(r);
  var C = (function(o) {
    function t(t, r) {
      return o.call(this) || this;
    }
    return (
      a(t, o),
      (t.prototype.schedule = function(o, t) {
        return void 0 === t && (t = 0), this;
      }),
      t
    );
  })(d);
  var I = (function(t) {
    function i(i, e) {
      var n = t.call(this, i, e) || this;
      return (n.scheduler = i), (n.work = e), (n.pending = !1), n;
    }
    return (
      a(i, t),
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
  })(C);
  var J = (function(t) {
    function e(e, u) {
      var r = t.call(this, e, u) || this;
      return (r.scheduler = e), (r.work = u), r;
    }
    return (
      a(e, t),
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
  })(I);
  var w = (function() {
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
  var L = (function(e) {
    function t(r, i) {
      void 0 === i && (i = w.now);
      var c =
        e.call(this, r, function() {
          return t.delegate && t.delegate !== c ? t.delegate.now() : i();
        }) || this;
      return (c.actions = []), (c.active = !1), (c.scheduled = void 0), c;
    }
    return (
      a(t, e),
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
  })(w);
  var M = (function(e) {
    function r() {
      return (null !== e && e.apply(this, arguments)) || this;
    }
    return a(r, e), r;
  })(L);
  var N = new M(J);
  var O, P;
  var Q = new c(function(e) {
    return e.complete();
  });
  function x(e) {
    return e ? S(e) : Q;
  }
  function S(e) {
    return new c(function($) {
      return e.schedule(function() {
        return $.complete();
      });
    });
  }
  function T() {
    for (var r = [], $ = 0; $ < arguments.length; $++) r[$] = arguments[$];
    var e = r[r.length - 1];
    switch ((U(e) ? r.pop() : (e = void 0), r.length)) {
      case 0:
        return x(e);
      case 1:
        return e ? y(r, e) : X(r[0]);
      default:
        return y(r, e);
    }
  }
  function U(e) {
    return e && 'function' == typeof e.schedule;
  }
  function y(r, e) {
    return e
      ? new c(function($) {
          var n = new d(),
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
      : new c(W(r));
  }
  var W = function(r) {
    return function(e) {
      for (var s = 0, o = r.length; s < o && !e.closed; s++) e.next(r[s]);
      e.closed || e.complete();
    };
  };
  function X(r) {
    var e = new c(function(e) {
      e.next(r), e.complete();
    });
    return (e._isScalar = !0), (e.value = r), e;
  }
  function Y(r, e) {
    return e
      ? new c(function($) {
          return e.schedule(Z, 0, { error: r, subscriber: $ });
        })
      : new c(function(e) {
          return e.error(r);
        });
  }
  function Z(r) {
    var e = r.error;
    r.subscriber.error(e);
  }
  (function(e) {
    (e.NEXT = 'N'), (e.ERROR = 'E'), (e.COMPLETE = 'C');
  })(P || ((O = P = {}), O));
  var m = (function() {
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
            return T(this.value);
          case 'E':
            return Y(this.error);
          case 'C':
            return x();
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
  var la = (function() {
    function e(e, s) {
      void 0 === s && (s = 0), (this.scheduler = e), (this.delay = s);
    }
    return (
      (e.prototype.call = function(e, s) {
        return s.subscribe(new A(e, this.scheduler, this.delay));
      }),
      e
    );
  })();
  var A = (function(e) {
    function s(s, r, t) {
      void 0 === t && (t = 0);
      var i = e.call(this, s) || this;
      return (i.scheduler = r), (i.delay = t), i;
    }
    return (
      a(s, e),
      (s.dispatch = function(e) {
        var s = e.notification,
          r = e.destination;
        s.observe(r), this.unsubscribe();
      }),
      (s.prototype.scheduleMessage = function(e) {
        this.destination.add(this.scheduler.schedule(s.dispatch, this.delay, new ba(e, this.destination)));
      }),
      (s.prototype._next = function(e) {
        this.scheduleMessage(m.createNext(e));
      }),
      (s.prototype._error = function(e) {
        this.scheduleMessage(m.createError(e)), this.unsubscribe();
      }),
      (s.prototype._complete = function() {
        this.scheduleMessage(m.createComplete()), this.unsubscribe();
      }),
      s
    );
  })(f);
  var ba = (function() {
    return function(e, s) {
      (this.notification = e), (this.destination = s);
    };
  })();
  var ca = (function(e) {
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
      a(t, e),
      (t.prototype.nextInfiniteTimeWindow = function(t) {
        var r = this._events;
        r.push(t), r.length > this._bufferSize && r.shift(), e.prototype.next.call(this, t);
      }),
      (t.prototype.nextTimeWindow = function(t) {
        this._events.push(new da(this._getNow(), t)), this._trimBufferThenGetEvents(), e.prototype.next.call(this, t);
      }),
      (t.prototype._subscribe = function(e) {
        var t,
          r = this._infiniteTimeWindow,
          i = r ? this._events : this._trimBufferThenGetEvents(),
          n = this.scheduler,
          o = i.length;
        if (this.closed) throw new g();
        if (
          (this.isStopped || this.hasError ? (t = d.EMPTY) : (this.observers.push(e), (t = new u(this, e))),
          n && e.add((e = new A(e, n))),
          r)
        )
          for (var s = 0; s < o && !e.closed; s++) e.next(i[s]);
        else for (s = 0; s < o && !e.closed; s++) e.next(i[s].value);
        return this.hasError ? e.error(this.thrownError) : this.isStopped && e.complete(), t;
      }),
      (t.prototype._getNow = function() {
        return (this.scheduler || N).now();
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
  })(r);
  var da = (function() {
    return function(e, t) {
      (this.time = e), (this.value = t);
    };
  })();
  var B = function() {
    return 'undefined' == typeof window ? ea : window;
  };
  var fa = function() {
    return B().scalecube || { clusters: {} };
  };
  var ga = function(e) {
    var s = e.seedAddress,
      r = B();
    (r.scalecube = r.scalecube || {}), (r.scalecube.clusters = r.scalecube.clusters || {});
    var t = fa().clusters;
    return t[s] || (t[s] = { discoveries: [], allDiscoveredItems: [] }), t[s];
  };
  var ha = function(e) {
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
      z({ discoveries: s.discoveries }),
      s
    );
  };
  var ia = function(e) {
    var s = e.cluster,
      r = e.itemsToPublish,
      t = e.address,
      o = e.subjectNotifier;
    s.discoveries.forEach(function(e) {
      e.discoveredItems = e.discoveredItems.concat(r);
    });
    var i = (s.allDiscoveredItems || []).slice();
    return (
      s.discoveries.push({ address: t, discoveredItems: i, subjectNotifier: o }),
      (s.allDiscoveredItems = (s.allDiscoveredItems || []).concat(r)),
      z({ discoveries: s.discoveries }),
      s
    );
  };
  var z = function(e) {
    return e.discoveries.forEach(function(e) {
      return e && e.subjectNotifier && e.subjectNotifier.next(e.discoveredItems || []);
    });
  };
  var _ = function(e, s) {
    return e + ' has been removed from ' + s;
  };
  var ka = function(e) {
    var r = e.address,
      s = e.itemsToPublish,
      t = e.seedAddress,
      $ = ga({ seedAddress: t }),
      o = new ca(1);
    return (
      ($ = ia({ cluster: $, address: r, itemsToPublish: s, subjectNotifier: o })),
      Object.freeze({
        destroy: function() {
          return ($ = ha({ cluster: $, address: r })), o && o.complete(), Promise.resolve(_(r, t));
        },
        discoveredItems$: function() {
          return o.asObservable();
        },
      })
    );
  };
  e.default = ka;
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    module.exports = e;
  } else if (typeof define === 'function' && define.amd) {
    define(function() {
      return e;
    });
  } else {
    this['discovery'] = e;
  }
})();
