'use strict';

var obsidian = require('obsidian');

function noop() { }
const identity = x => x;
function assign(tar, src) {
    // @ts-ignore
    for (const k in src)
        tar[k] = src[k];
    return tar;
}
function run(fn) {
    return fn();
}
function blank_object() {
    return Object.create(null);
}
function run_all(fns) {
    fns.forEach(run);
}
function is_function(thing) {
    return typeof thing === 'function';
}
function safe_not_equal(a, b) {
    return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
}
function is_empty(obj) {
    return Object.keys(obj).length === 0;
}
function create_slot(definition, ctx, $$scope, fn) {
    if (definition) {
        const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
        return definition[0](slot_ctx);
    }
}
function get_slot_context(definition, ctx, $$scope, fn) {
    return definition[1] && fn
        ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
        : $$scope.ctx;
}
function get_slot_changes(definition, $$scope, dirty, fn) {
    if (definition[2] && fn) {
        const lets = definition[2](fn(dirty));
        if ($$scope.dirty === undefined) {
            return lets;
        }
        if (typeof lets === 'object') {
            const merged = [];
            const len = Math.max($$scope.dirty.length, lets.length);
            for (let i = 0; i < len; i += 1) {
                merged[i] = $$scope.dirty[i] | lets[i];
            }
            return merged;
        }
        return $$scope.dirty | lets;
    }
    return $$scope.dirty;
}
function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
    const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
    if (slot_changes) {
        const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
        slot.p(slot_context, slot_changes);
    }
}
function action_destroyer(action_result) {
    return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
}

const is_client = typeof window !== 'undefined';
let now = is_client
    ? () => window.performance.now()
    : () => Date.now();
let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

const tasks = new Set();
function run_tasks(now) {
    tasks.forEach(task => {
        if (!task.c(now)) {
            tasks.delete(task);
            task.f();
        }
    });
    if (tasks.size !== 0)
        raf(run_tasks);
}
/**
 * Creates a new task that runs on each raf frame
 * until it returns a falsy value or is aborted
 */
function loop(callback) {
    let task;
    if (tasks.size === 0)
        raf(run_tasks);
    return {
        promise: new Promise(fulfill => {
            tasks.add(task = { c: callback, f: fulfill });
        }),
        abort() {
            tasks.delete(task);
        }
    };
}

function append(target, node) {
    target.appendChild(node);
}
function insert(target, node, anchor) {
    target.insertBefore(node, anchor || null);
}
function detach(node) {
    node.parentNode.removeChild(node);
}
function destroy_each(iterations, detaching) {
    for (let i = 0; i < iterations.length; i += 1) {
        if (iterations[i])
            iterations[i].d(detaching);
    }
}
function element(name) {
    return document.createElement(name);
}
function svg_element(name) {
    return document.createElementNS('http://www.w3.org/2000/svg', name);
}
function text(data) {
    return document.createTextNode(data);
}
function space() {
    return text(' ');
}
function empty() {
    return text('');
}
function listen(node, event, handler, options) {
    node.addEventListener(event, handler, options);
    return () => node.removeEventListener(event, handler, options);
}
function prevent_default(fn) {
    return function (event) {
        event.preventDefault();
        // @ts-ignore
        return fn.call(this, event);
    };
}
function stop_propagation(fn) {
    return function (event) {
        event.stopPropagation();
        // @ts-ignore
        return fn.call(this, event);
    };
}
function attr(node, attribute, value) {
    if (value == null)
        node.removeAttribute(attribute);
    else if (node.getAttribute(attribute) !== value)
        node.setAttribute(attribute, value);
}
function set_attributes(node, attributes) {
    // @ts-ignore
    const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
    for (const key in attributes) {
        if (attributes[key] == null) {
            node.removeAttribute(key);
        }
        else if (key === 'style') {
            node.style.cssText = attributes[key];
        }
        else if (key === '__value') {
            node.value = node[key] = attributes[key];
        }
        else if (descriptors[key] && descriptors[key].set) {
            node[key] = attributes[key];
        }
        else {
            attr(node, key, attributes[key]);
        }
    }
}
function set_custom_element_data(node, prop, value) {
    if (prop in node) {
        node[prop] = typeof node[prop] === 'boolean' && value === '' ? true : value;
    }
    else {
        attr(node, prop, value);
    }
}
function children(element) {
    return Array.from(element.childNodes);
}
function set_data(text, data) {
    data = '' + data;
    if (text.wholeText !== data)
        text.data = data;
}
function set_input_value(input, value) {
    input.value = value == null ? '' : value;
}
function set_style(node, key, value, important) {
    node.style.setProperty(key, value, important ? 'important' : '');
}
// unfortunately this can't be a constant as that wouldn't be tree-shakeable
// so we cache the result instead
let crossorigin;
function is_crossorigin() {
    if (crossorigin === undefined) {
        crossorigin = false;
        try {
            if (typeof window !== 'undefined' && window.parent) {
                void window.parent.document;
            }
        }
        catch (error) {
            crossorigin = true;
        }
    }
    return crossorigin;
}
function add_resize_listener(node, fn) {
    const computed_style = getComputedStyle(node);
    if (computed_style.position === 'static') {
        node.style.position = 'relative';
    }
    const iframe = element('iframe');
    iframe.setAttribute('style', 'display: block; position: absolute; top: 0; left: 0; width: 100%; height: 100%; ' +
        'overflow: hidden; border: 0; opacity: 0; pointer-events: none; z-index: -1;');
    iframe.setAttribute('aria-hidden', 'true');
    iframe.tabIndex = -1;
    const crossorigin = is_crossorigin();
    let unsubscribe;
    if (crossorigin) {
        iframe.src = "data:text/html,<script>onresize=function(){parent.postMessage(0,'*')}</script>";
        unsubscribe = listen(window, 'message', (event) => {
            if (event.source === iframe.contentWindow)
                fn();
        });
    }
    else {
        iframe.src = 'about:blank';
        iframe.onload = () => {
            unsubscribe = listen(iframe.contentWindow, 'resize', fn);
        };
    }
    append(node, iframe);
    return () => {
        if (crossorigin) {
            unsubscribe();
        }
        else if (unsubscribe && iframe.contentWindow) {
            unsubscribe();
        }
        detach(iframe);
    };
}
function toggle_class(element, name, toggle) {
    element.classList[toggle ? 'add' : 'remove'](name);
}
function custom_event(type, detail) {
    const e = document.createEvent('CustomEvent');
    e.initCustomEvent(type, false, false, detail);
    return e;
}
class HtmlTag {
    constructor(anchor = null) {
        this.a = anchor;
        this.e = this.n = null;
    }
    m(html, target, anchor = null) {
        if (!this.e) {
            this.e = element(target.nodeName);
            this.t = target;
            this.h(html);
        }
        this.i(anchor);
    }
    h(html) {
        this.e.innerHTML = html;
        this.n = Array.from(this.e.childNodes);
    }
    i(anchor) {
        for (let i = 0; i < this.n.length; i += 1) {
            insert(this.t, this.n[i], anchor);
        }
    }
    p(html) {
        this.d();
        this.h(html);
        this.i(this.a);
    }
    d() {
        this.n.forEach(detach);
    }
}

const active_docs = new Set();
let active = 0;
// https://github.com/darkskyapp/string-hash/blob/master/index.js
function hash(str) {
    let hash = 5381;
    let i = str.length;
    while (i--)
        hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
    return hash >>> 0;
}
function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
    const step = 16.666 / duration;
    let keyframes = '{\n';
    for (let p = 0; p <= 1; p += step) {
        const t = a + (b - a) * ease(p);
        keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
    }
    const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
    const name = `__svelte_${hash(rule)}_${uid}`;
    const doc = node.ownerDocument;
    active_docs.add(doc);
    const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
    const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
    if (!current_rules[name]) {
        current_rules[name] = true;
        stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
    }
    const animation = node.style.animation || '';
    node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
    active += 1;
    return name;
}
function delete_rule(node, name) {
    const previous = (node.style.animation || '').split(', ');
    const next = previous.filter(name
        ? anim => anim.indexOf(name) < 0 // remove specific animation
        : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
    );
    const deleted = previous.length - next.length;
    if (deleted) {
        node.style.animation = next.join(', ');
        active -= deleted;
        if (!active)
            clear_rules();
    }
}
function clear_rules() {
    raf(() => {
        if (active)
            return;
        active_docs.forEach(doc => {
            const stylesheet = doc.__svelte_stylesheet;
            let i = stylesheet.cssRules.length;
            while (i--)
                stylesheet.deleteRule(i);
            doc.__svelte_rules = {};
        });
        active_docs.clear();
    });
}

let current_component;
function set_current_component(component) {
    current_component = component;
}
function get_current_component() {
    if (!current_component)
        throw new Error('Function called outside component initialization');
    return current_component;
}
function beforeUpdate(fn) {
    get_current_component().$$.before_update.push(fn);
}
function onMount(fn) {
    get_current_component().$$.on_mount.push(fn);
}
function onDestroy(fn) {
    get_current_component().$$.on_destroy.push(fn);
}
function createEventDispatcher() {
    const component = get_current_component();
    return (type, detail) => {
        const callbacks = component.$$.callbacks[type];
        if (callbacks) {
            // TODO are there situations where events could be dispatched
            // in a server (non-DOM) environment?
            const event = custom_event(type, detail);
            callbacks.slice().forEach(fn => {
                fn.call(component, event);
            });
        }
    };
}
function setContext(key, context) {
    get_current_component().$$.context.set(key, context);
}
function getContext(key) {
    return get_current_component().$$.context.get(key);
}

const dirty_components = [];
const binding_callbacks = [];
const render_callbacks = [];
const flush_callbacks = [];
const resolved_promise = Promise.resolve();
let update_scheduled = false;
function schedule_update() {
    if (!update_scheduled) {
        update_scheduled = true;
        resolved_promise.then(flush);
    }
}
function tick() {
    schedule_update();
    return resolved_promise;
}
function add_render_callback(fn) {
    render_callbacks.push(fn);
}
function add_flush_callback(fn) {
    flush_callbacks.push(fn);
}
let flushing = false;
const seen_callbacks = new Set();
function flush() {
    if (flushing)
        return;
    flushing = true;
    do {
        // first, call beforeUpdate functions
        // and update components
        for (let i = 0; i < dirty_components.length; i += 1) {
            const component = dirty_components[i];
            set_current_component(component);
            update(component.$$);
        }
        set_current_component(null);
        dirty_components.length = 0;
        while (binding_callbacks.length)
            binding_callbacks.pop()();
        // then, once components are updated, call
        // afterUpdate functions. This may cause
        // subsequent updates...
        for (let i = 0; i < render_callbacks.length; i += 1) {
            const callback = render_callbacks[i];
            if (!seen_callbacks.has(callback)) {
                // ...so guard against infinite loops
                seen_callbacks.add(callback);
                callback();
            }
        }
        render_callbacks.length = 0;
    } while (dirty_components.length);
    while (flush_callbacks.length) {
        flush_callbacks.pop()();
    }
    update_scheduled = false;
    flushing = false;
    seen_callbacks.clear();
}
function update($$) {
    if ($$.fragment !== null) {
        $$.update();
        run_all($$.before_update);
        const dirty = $$.dirty;
        $$.dirty = [-1];
        $$.fragment && $$.fragment.p($$.ctx, dirty);
        $$.after_update.forEach(add_render_callback);
    }
}

let promise;
function wait() {
    if (!promise) {
        promise = Promise.resolve();
        promise.then(() => {
            promise = null;
        });
    }
    return promise;
}
function dispatch(node, direction, kind) {
    node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
}
const outroing = new Set();
let outros;
function group_outros() {
    outros = {
        r: 0,
        c: [],
        p: outros // parent group
    };
}
function check_outros() {
    if (!outros.r) {
        run_all(outros.c);
    }
    outros = outros.p;
}
function transition_in(block, local) {
    if (block && block.i) {
        outroing.delete(block);
        block.i(local);
    }
}
function transition_out(block, local, detach, callback) {
    if (block && block.o) {
        if (outroing.has(block))
            return;
        outroing.add(block);
        outros.c.push(() => {
            outroing.delete(block);
            if (callback) {
                if (detach)
                    block.d(1);
                callback();
            }
        });
        block.o(local);
    }
}
const null_transition = { duration: 0 };
function create_bidirectional_transition(node, fn, params, intro) {
    let config = fn(node, params);
    let t = intro ? 0 : 1;
    let running_program = null;
    let pending_program = null;
    let animation_name = null;
    function clear_animation() {
        if (animation_name)
            delete_rule(node, animation_name);
    }
    function init(program, duration) {
        const d = program.b - t;
        duration *= Math.abs(d);
        return {
            a: t,
            b: program.b,
            d,
            duration,
            start: program.start,
            end: program.start + duration,
            group: program.group
        };
    }
    function go(b) {
        const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
        const program = {
            start: now() + delay,
            b
        };
        if (!b) {
            // @ts-ignore todo: improve typings
            program.group = outros;
            outros.r += 1;
        }
        if (running_program || pending_program) {
            pending_program = program;
        }
        else {
            // if this is an intro, and there's a delay, we need to do
            // an initial tick and/or apply CSS animation immediately
            if (css) {
                clear_animation();
                animation_name = create_rule(node, t, b, duration, delay, easing, css);
            }
            if (b)
                tick(0, 1);
            running_program = init(program, duration);
            add_render_callback(() => dispatch(node, b, 'start'));
            loop(now => {
                if (pending_program && now > pending_program.start) {
                    running_program = init(pending_program, duration);
                    pending_program = null;
                    dispatch(node, running_program.b, 'start');
                    if (css) {
                        clear_animation();
                        animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                    }
                }
                if (running_program) {
                    if (now >= running_program.end) {
                        tick(t = running_program.b, 1 - t);
                        dispatch(node, running_program.b, 'end');
                        if (!pending_program) {
                            // we're done
                            if (running_program.b) {
                                // intro — we can tidy up immediately
                                clear_animation();
                            }
                            else {
                                // outro — needs to be coordinated
                                if (!--running_program.group.r)
                                    run_all(running_program.group.c);
                            }
                        }
                        running_program = null;
                    }
                    else if (now >= running_program.start) {
                        const p = now - running_program.start;
                        t = running_program.a + running_program.d * easing(p / running_program.duration);
                        tick(t, 1 - t);
                    }
                }
                return !!(running_program || pending_program);
            });
        }
    }
    return {
        run(b) {
            if (is_function(config)) {
                wait().then(() => {
                    // @ts-ignore
                    config = config();
                    go(b);
                });
            }
            else {
                go(b);
            }
        },
        end() {
            clear_animation();
            running_program = pending_program = null;
        }
    };
}

const globals = (typeof window !== 'undefined'
    ? window
    : typeof globalThis !== 'undefined'
        ? globalThis
        : global);
function outro_and_destroy_block(block, lookup) {
    transition_out(block, 1, 1, () => {
        lookup.delete(block.key);
    });
}
function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
    let o = old_blocks.length;
    let n = list.length;
    let i = o;
    const old_indexes = {};
    while (i--)
        old_indexes[old_blocks[i].key] = i;
    const new_blocks = [];
    const new_lookup = new Map();
    const deltas = new Map();
    i = n;
    while (i--) {
        const child_ctx = get_context(ctx, list, i);
        const key = get_key(child_ctx);
        let block = lookup.get(key);
        if (!block) {
            block = create_each_block(key, child_ctx);
            block.c();
        }
        else if (dynamic) {
            block.p(child_ctx, dirty);
        }
        new_lookup.set(key, new_blocks[i] = block);
        if (key in old_indexes)
            deltas.set(key, Math.abs(i - old_indexes[key]));
    }
    const will_move = new Set();
    const did_move = new Set();
    function insert(block) {
        transition_in(block, 1);
        block.m(node, next);
        lookup.set(block.key, block);
        next = block.first;
        n--;
    }
    while (o && n) {
        const new_block = new_blocks[n - 1];
        const old_block = old_blocks[o - 1];
        const new_key = new_block.key;
        const old_key = old_block.key;
        if (new_block === old_block) {
            // do nothing
            next = new_block.first;
            o--;
            n--;
        }
        else if (!new_lookup.has(old_key)) {
            // remove old block
            destroy(old_block, lookup);
            o--;
        }
        else if (!lookup.has(new_key) || will_move.has(new_key)) {
            insert(new_block);
        }
        else if (did_move.has(old_key)) {
            o--;
        }
        else if (deltas.get(new_key) > deltas.get(old_key)) {
            did_move.add(new_key);
            insert(new_block);
        }
        else {
            will_move.add(old_key);
            o--;
        }
    }
    while (o--) {
        const old_block = old_blocks[o];
        if (!new_lookup.has(old_block.key))
            destroy(old_block, lookup);
    }
    while (n)
        insert(new_blocks[n - 1]);
    return new_blocks;
}

function get_spread_update(levels, updates) {
    const update = {};
    const to_null_out = {};
    const accounted_for = { $$scope: 1 };
    let i = levels.length;
    while (i--) {
        const o = levels[i];
        const n = updates[i];
        if (n) {
            for (const key in o) {
                if (!(key in n))
                    to_null_out[key] = 1;
            }
            for (const key in n) {
                if (!accounted_for[key]) {
                    update[key] = n[key];
                    accounted_for[key] = 1;
                }
            }
            levels[i] = n;
        }
        else {
            for (const key in o) {
                accounted_for[key] = 1;
            }
        }
    }
    for (const key in to_null_out) {
        if (!(key in update))
            update[key] = undefined;
    }
    return update;
}
function get_spread_object(spread_props) {
    return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
}

function bind(component, name, callback) {
    const index = component.$$.props[name];
    if (index !== undefined) {
        component.$$.bound[index] = callback;
        callback(component.$$.ctx[index]);
    }
}
function create_component(block) {
    block && block.c();
}
function mount_component(component, target, anchor, customElement) {
    const { fragment, on_mount, on_destroy, after_update } = component.$$;
    fragment && fragment.m(target, anchor);
    if (!customElement) {
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
    }
    after_update.forEach(add_render_callback);
}
function destroy_component(component, detaching) {
    const $$ = component.$$;
    if ($$.fragment !== null) {
        run_all($$.on_destroy);
        $$.fragment && $$.fragment.d(detaching);
        // TODO null out other refs, including component.$$ (but need to
        // preserve final state?)
        $$.on_destroy = $$.fragment = null;
        $$.ctx = [];
    }
}
function make_dirty(component, i) {
    if (component.$$.dirty[0] === -1) {
        dirty_components.push(component);
        schedule_update();
        component.$$.dirty.fill(0);
    }
    component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
}
function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
    const parent_component = current_component;
    set_current_component(component);
    const $$ = component.$$ = {
        fragment: null,
        ctx: null,
        // state
        props,
        update: noop,
        not_equal,
        bound: blank_object(),
        // lifecycle
        on_mount: [],
        on_destroy: [],
        on_disconnect: [],
        before_update: [],
        after_update: [],
        context: new Map(parent_component ? parent_component.$$.context : options.context || []),
        // everything else
        callbacks: blank_object(),
        dirty,
        skip_bound: false
    };
    let ready = false;
    $$.ctx = instance
        ? instance(component, options.props || {}, (i, ret, ...rest) => {
            const value = rest.length ? rest[0] : ret;
            if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                if (!$$.skip_bound && $$.bound[i])
                    $$.bound[i](value);
                if (ready)
                    make_dirty(component, i);
            }
            return ret;
        })
        : [];
    $$.update();
    ready = true;
    run_all($$.before_update);
    // `false` as a special case of no DOM component
    $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
    if (options.target) {
        if (options.hydrate) {
            const nodes = children(options.target);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            $$.fragment && $$.fragment.l(nodes);
            nodes.forEach(detach);
        }
        else {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            $$.fragment && $$.fragment.c();
        }
        if (options.intro)
            transition_in(component.$$.fragment);
        mount_component(component, options.target, options.anchor, options.customElement);
        flush();
    }
    set_current_component(parent_component);
}
/**
 * Base class for Svelte components. Used when dev=false.
 */
class SvelteComponent {
    $destroy() {
        destroy_component(this, 1);
        this.$destroy = noop;
    }
    $on(type, callback) {
        const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
        callbacks.push(callback);
        return () => {
            const index = callbacks.indexOf(callback);
            if (index !== -1)
                callbacks.splice(index, 1);
        };
    }
    $set($$props) {
        if (this.$$set && !is_empty($$props)) {
            this.$$.skip_bound = true;
            this.$$set($$props);
            this.$$.skip_bound = false;
        }
    }
}

const subscriber_queue = [];
/**
 * Create a `Writable` store that allows both updating and reading by subscription.
 * @param {*=}value initial value
 * @param {StartStopNotifier=}start start and stop notifications for subscriptions
 */
function writable(value, start = noop) {
    let stop;
    const subscribers = [];
    function set(new_value) {
        if (safe_not_equal(value, new_value)) {
            value = new_value;
            if (stop) { // store is ready
                const run_queue = !subscriber_queue.length;
                for (let i = 0; i < subscribers.length; i += 1) {
                    const s = subscribers[i];
                    s[1]();
                    subscriber_queue.push(s, value);
                }
                if (run_queue) {
                    for (let i = 0; i < subscriber_queue.length; i += 2) {
                        subscriber_queue[i][0](subscriber_queue[i + 1]);
                    }
                    subscriber_queue.length = 0;
                }
            }
        }
    }
    function update(fn) {
        set(fn(value));
    }
    function subscribe(run, invalidate = noop) {
        const subscriber = [run, invalidate];
        subscribers.push(subscriber);
        if (subscribers.length === 1) {
            stop = start(set) || noop;
        }
        run(value);
        return () => {
            const index = subscribers.indexOf(subscriber);
            if (index !== -1) {
                subscribers.splice(index, 1);
            }
            if (subscribers.length === 0) {
                stop();
                stop = null;
            }
        };
    }
    return { set, update, subscribe };
}

const proc = require("process");
function isPositiveInteger(str) {
    const num = toInt(str);
    return num != Infinity && String(num) === str && num > 0;
}
function toInt(str) {
    return Math.floor(Number(str));
}
class ExtendedMap extends Map {
    get_or_default(key, defaultValue) {
        if (this.has(key)) {
            return this.get(key);
        }
        return defaultValue;
    }
    get_or_maybe_insert(key, newValue) {
        if (this.has(key)) {
            return this.get(key);
        }
        const value = newValue();
        if (value) {
            this.set(key, value);
        }
        return value;
    }
}
function getTokenPath() {
    let pathSep = "/";
    if (proc.platform == "win32") {
        pathSep = "\\";
    }
    return `.obsidian${pathSep}todoist-token`;
}
function getCurrentPageMdLink(app) {
    const vaultName = app.vault.adapter.getName();
    const currentView = app.workspace.activeLeaf.view;
    if (currentView.getViewType() != "markdown") {
        return "";
    }
    const filePath = app.workspace.activeLeaf.view.getState().file;
    return `[${filePath}](obsidian://open?vault=${encodeURIComponent(vaultName)}&file=${encodeURIComponent(filePath)})`;
}
const APP_CONTEXT_KEY = "obsidian_app";

const SettingsInstance = writable({
    fadeToggle: true,
    autoRefreshToggle: false,
    autoRefreshInterval: 60,
    renderDate: true,
    renderDateIcon: true,
    renderProject: true,
    renderProjectIcon: true,
    renderLabels: true,
    renderLabelsIcon: true,
    debugLogging: false,
});
class SettingsTab extends obsidian.PluginSettingTab {
    constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
    }
    display() {
        let { containerEl } = this;
        containerEl.empty();
        this.pluginMetadata();
        this.apiToken();
        this.fadeAnimationSettings();
        this.autoRefreshSettings();
        this.dateSettings();
        this.projectSettings();
        this.labelsSettings();
        this.debugLogging();
    }
    pluginMetadata() {
        const desc = document.createDocumentFragment();
        const span = document.createElement("span");
        span.innerText = "Read the ";
        const changelogLink = document.createElement("a");
        changelogLink.href =
            "https://github.com/jamiebrynes7/obsidian-todoist-plugin/releases";
        changelogLink.innerText = "changelog!";
        span.appendChild(changelogLink);
        desc.appendChild(span);
    }
    apiToken() {
        const desc = document.createDocumentFragment();
        desc.createEl("span", null, (span) => {
            span.innerText =
                "The Todoist API token to use when fetching tasks. You will need to restart Obsidian after setting this. You can find this token ";
            span.createEl("a", null, (link) => {
                link.href = "https://todoist.com/prefs/integrations";
                link.innerText = "here!";
            });
        });
        new obsidian.Setting(this.containerEl)
            .setName("Todoist API token")
            .setDesc(desc)
            .addTextArea(async (text) => {
            try {
                text.setValue(await this.app.vault.adapter.read(getTokenPath()));
            }
            catch (e) {
                /* Throw away read error if file does not exist. */
            }
            text.onChange(async (value) => {
                await this.app.vault.adapter.write(getTokenPath(), value);
            });
        });
    }
    fadeAnimationSettings() {
        new obsidian.Setting(this.containerEl)
            .setName("Task fade animation")
            .setDesc("Whether tasks should fade in and out when added or removed.")
            .addToggle((toggle) => {
            toggle.setValue(this.plugin.options.fadeToggle);
            toggle.onChange(async (value) => {
                this.plugin.writeOptions((old) => (old.fadeToggle = value));
            });
        });
    }
    autoRefreshSettings() {
        new obsidian.Setting(this.containerEl)
            .setName("Auto-refresh")
            .setDesc("Whether queries should auto-refresh at a set interval")
            .addToggle((toggle) => {
            toggle.setValue(this.plugin.options.autoRefreshToggle);
            toggle.onChange((value) => {
                this.plugin.writeOptions((old) => (old.autoRefreshToggle = value));
            });
        });
        new obsidian.Setting(this.containerEl)
            .setName("Auto-refresh interval")
            .setDesc("The interval (in seconds) that queries should auto-refresh by default. Integer numbers only.")
            .addText((setting) => {
            setting.setValue(`${this.plugin.options.autoRefreshInterval}`);
            setting.onChange(async (value) => {
                const newSetting = value.trim();
                if (newSetting.length == 0) {
                    return;
                }
                if (isPositiveInteger(newSetting)) {
                    await this.plugin.writeOptions((old) => (old.autoRefreshInterval = toInt(newSetting)));
                }
                else {
                    setting.setValue(`${this.plugin.options.autoRefreshInterval}`);
                }
            });
        });
    }
    dateSettings() {
        new obsidian.Setting(this.containerEl)
            .setName("Render dates")
            .setDesc("Whether dates should be rendered with tasks.")
            .addToggle((toggle) => {
            toggle.setValue(this.plugin.options.renderDate);
            toggle.onChange(async (value) => {
                await this.plugin.writeOptions((old) => (old.renderDate = value));
            });
        });
        new obsidian.Setting(this.containerEl)
            .setName("Render date icon")
            .setDesc("Whether rendered dates should include an icon.")
            .addToggle((setting) => {
            setting.setValue(this.plugin.options.renderDateIcon);
            setting.onChange(async (value) => {
                await this.plugin.writeOptions((old) => (old.renderDateIcon = value));
            });
        });
    }
    projectSettings() {
        new obsidian.Setting(this.containerEl)
            .setName("Render project & section")
            .setDesc("Whether projects & sections should be rendered with tasks.")
            .addToggle((setting) => {
            setting.setValue(this.plugin.options.renderProject);
            setting.onChange(async (value) => {
                await this.plugin.writeOptions((old) => (old.renderProject = value));
            });
        });
        new obsidian.Setting(this.containerEl)
            .setName("Render project & section icon")
            .setDesc("Whether rendered projects & sections should include an icon.")
            .addToggle((setting) => {
            setting.setValue(this.plugin.options.renderProjectIcon);
            setting.onChange(async (value) => {
                await this.plugin.writeOptions((old) => (old.renderProjectIcon = value));
            });
        });
    }
    labelsSettings() {
        new obsidian.Setting(this.containerEl)
            .setName("Render labels")
            .setDesc("Whether labels should be rendered with tasks.")
            .addToggle((setting) => {
            setting.setValue(this.plugin.options.renderLabels);
            setting.onChange(async (value) => {
                await this.plugin.writeOptions((old) => (old.renderLabels = value));
            });
        });
        new obsidian.Setting(this.containerEl)
            .setName("Render labels icon")
            .setDesc("Whether rendered labels should include an icon.")
            .addToggle((setting) => {
            setting.setValue(this.plugin.options.renderLabelsIcon);
            setting.onChange(async (value) => {
                await this.plugin.writeOptions((old) => (old.renderLabelsIcon = value));
            });
        });
    }
    debugLogging() {
        new obsidian.Setting(this.containerEl)
            .setName("Debug logging")
            .setDesc("Whether debug logging should be on or off.")
            .addToggle((toggle) => {
            toggle.setValue(this.plugin.options.debugLogging);
            toggle.onChange(async (value) => {
                await this.plugin.writeOptions((old) => (old.debugLogging = value));
            });
        });
    }
}

let settings = null;
SettingsInstance.subscribe((value) => (settings = value));
function debug(log) {
    if (!settings.debugLogging) {
        return;
    }
    if (isComplexLog(log)) {
        console.log(log.msg);
        console.log(log.context);
    }
    else {
        console.log(log);
    }
}
function isComplexLog(log) {
    return log.msg !== undefined;
}

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function createCommonjsModule(fn, basedir, module) {
	return module = {
		path: basedir,
		exports: {},
		require: function (path, base) {
			return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
		}
	}, fn(module, module.exports), module.exports;
}

function commonjsRequire () {
	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
}

var moment = createCommonjsModule(function (module, exports) {
(function (global, factory) {
    module.exports = factory() ;
}(commonjsGlobal, (function () {
    var hookCallback;

    function hooks() {
        return hookCallback.apply(null, arguments);
    }

    // This is done to register the method called with moment()
    // without creating circular dependencies.
    function setHookCallback(callback) {
        hookCallback = callback;
    }

    function isArray(input) {
        return (
            input instanceof Array ||
            Object.prototype.toString.call(input) === '[object Array]'
        );
    }

    function isObject(input) {
        // IE8 will treat undefined and null as object if it wasn't for
        // input != null
        return (
            input != null &&
            Object.prototype.toString.call(input) === '[object Object]'
        );
    }

    function hasOwnProp(a, b) {
        return Object.prototype.hasOwnProperty.call(a, b);
    }

    function isObjectEmpty(obj) {
        if (Object.getOwnPropertyNames) {
            return Object.getOwnPropertyNames(obj).length === 0;
        } else {
            var k;
            for (k in obj) {
                if (hasOwnProp(obj, k)) {
                    return false;
                }
            }
            return true;
        }
    }

    function isUndefined(input) {
        return input === void 0;
    }

    function isNumber(input) {
        return (
            typeof input === 'number' ||
            Object.prototype.toString.call(input) === '[object Number]'
        );
    }

    function isDate(input) {
        return (
            input instanceof Date ||
            Object.prototype.toString.call(input) === '[object Date]'
        );
    }

    function map(arr, fn) {
        var res = [],
            i;
        for (i = 0; i < arr.length; ++i) {
            res.push(fn(arr[i], i));
        }
        return res;
    }

    function extend(a, b) {
        for (var i in b) {
            if (hasOwnProp(b, i)) {
                a[i] = b[i];
            }
        }

        if (hasOwnProp(b, 'toString')) {
            a.toString = b.toString;
        }

        if (hasOwnProp(b, 'valueOf')) {
            a.valueOf = b.valueOf;
        }

        return a;
    }

    function createUTC(input, format, locale, strict) {
        return createLocalOrUTC(input, format, locale, strict, true).utc();
    }

    function defaultParsingFlags() {
        // We need to deep clone this object.
        return {
            empty: false,
            unusedTokens: [],
            unusedInput: [],
            overflow: -2,
            charsLeftOver: 0,
            nullInput: false,
            invalidEra: null,
            invalidMonth: null,
            invalidFormat: false,
            userInvalidated: false,
            iso: false,
            parsedDateParts: [],
            era: null,
            meridiem: null,
            rfc2822: false,
            weekdayMismatch: false,
        };
    }

    function getParsingFlags(m) {
        if (m._pf == null) {
            m._pf = defaultParsingFlags();
        }
        return m._pf;
    }

    var some;
    if (Array.prototype.some) {
        some = Array.prototype.some;
    } else {
        some = function (fun) {
            var t = Object(this),
                len = t.length >>> 0,
                i;

            for (i = 0; i < len; i++) {
                if (i in t && fun.call(this, t[i], i, t)) {
                    return true;
                }
            }

            return false;
        };
    }

    function isValid(m) {
        if (m._isValid == null) {
            var flags = getParsingFlags(m),
                parsedParts = some.call(flags.parsedDateParts, function (i) {
                    return i != null;
                }),
                isNowValid =
                    !isNaN(m._d.getTime()) &&
                    flags.overflow < 0 &&
                    !flags.empty &&
                    !flags.invalidEra &&
                    !flags.invalidMonth &&
                    !flags.invalidWeekday &&
                    !flags.weekdayMismatch &&
                    !flags.nullInput &&
                    !flags.invalidFormat &&
                    !flags.userInvalidated &&
                    (!flags.meridiem || (flags.meridiem && parsedParts));

            if (m._strict) {
                isNowValid =
                    isNowValid &&
                    flags.charsLeftOver === 0 &&
                    flags.unusedTokens.length === 0 &&
                    flags.bigHour === undefined;
            }

            if (Object.isFrozen == null || !Object.isFrozen(m)) {
                m._isValid = isNowValid;
            } else {
                return isNowValid;
            }
        }
        return m._isValid;
    }

    function createInvalid(flags) {
        var m = createUTC(NaN);
        if (flags != null) {
            extend(getParsingFlags(m), flags);
        } else {
            getParsingFlags(m).userInvalidated = true;
        }

        return m;
    }

    // Plugins that add properties should also add the key here (null value),
    // so we can properly clone ourselves.
    var momentProperties = (hooks.momentProperties = []),
        updateInProgress = false;

    function copyConfig(to, from) {
        var i, prop, val;

        if (!isUndefined(from._isAMomentObject)) {
            to._isAMomentObject = from._isAMomentObject;
        }
        if (!isUndefined(from._i)) {
            to._i = from._i;
        }
        if (!isUndefined(from._f)) {
            to._f = from._f;
        }
        if (!isUndefined(from._l)) {
            to._l = from._l;
        }
        if (!isUndefined(from._strict)) {
            to._strict = from._strict;
        }
        if (!isUndefined(from._tzm)) {
            to._tzm = from._tzm;
        }
        if (!isUndefined(from._isUTC)) {
            to._isUTC = from._isUTC;
        }
        if (!isUndefined(from._offset)) {
            to._offset = from._offset;
        }
        if (!isUndefined(from._pf)) {
            to._pf = getParsingFlags(from);
        }
        if (!isUndefined(from._locale)) {
            to._locale = from._locale;
        }

        if (momentProperties.length > 0) {
            for (i = 0; i < momentProperties.length; i++) {
                prop = momentProperties[i];
                val = from[prop];
                if (!isUndefined(val)) {
                    to[prop] = val;
                }
            }
        }

        return to;
    }

    // Moment prototype object
    function Moment(config) {
        copyConfig(this, config);
        this._d = new Date(config._d != null ? config._d.getTime() : NaN);
        if (!this.isValid()) {
            this._d = new Date(NaN);
        }
        // Prevent infinite loop in case updateOffset creates new moment
        // objects.
        if (updateInProgress === false) {
            updateInProgress = true;
            hooks.updateOffset(this);
            updateInProgress = false;
        }
    }

    function isMoment(obj) {
        return (
            obj instanceof Moment || (obj != null && obj._isAMomentObject != null)
        );
    }

    function warn(msg) {
        if (
            hooks.suppressDeprecationWarnings === false &&
            typeof console !== 'undefined' &&
            console.warn
        ) {
            console.warn('Deprecation warning: ' + msg);
        }
    }

    function deprecate(msg, fn) {
        var firstTime = true;

        return extend(function () {
            if (hooks.deprecationHandler != null) {
                hooks.deprecationHandler(null, msg);
            }
            if (firstTime) {
                var args = [],
                    arg,
                    i,
                    key;
                for (i = 0; i < arguments.length; i++) {
                    arg = '';
                    if (typeof arguments[i] === 'object') {
                        arg += '\n[' + i + '] ';
                        for (key in arguments[0]) {
                            if (hasOwnProp(arguments[0], key)) {
                                arg += key + ': ' + arguments[0][key] + ', ';
                            }
                        }
                        arg = arg.slice(0, -2); // Remove trailing comma and space
                    } else {
                        arg = arguments[i];
                    }
                    args.push(arg);
                }
                warn(
                    msg +
                        '\nArguments: ' +
                        Array.prototype.slice.call(args).join('') +
                        '\n' +
                        new Error().stack
                );
                firstTime = false;
            }
            return fn.apply(this, arguments);
        }, fn);
    }

    var deprecations = {};

    function deprecateSimple(name, msg) {
        if (hooks.deprecationHandler != null) {
            hooks.deprecationHandler(name, msg);
        }
        if (!deprecations[name]) {
            warn(msg);
            deprecations[name] = true;
        }
    }

    hooks.suppressDeprecationWarnings = false;
    hooks.deprecationHandler = null;

    function isFunction(input) {
        return (
            (typeof Function !== 'undefined' && input instanceof Function) ||
            Object.prototype.toString.call(input) === '[object Function]'
        );
    }

    function set(config) {
        var prop, i;
        for (i in config) {
            if (hasOwnProp(config, i)) {
                prop = config[i];
                if (isFunction(prop)) {
                    this[i] = prop;
                } else {
                    this['_' + i] = prop;
                }
            }
        }
        this._config = config;
        // Lenient ordinal parsing accepts just a number in addition to
        // number + (possibly) stuff coming from _dayOfMonthOrdinalParse.
        // TODO: Remove "ordinalParse" fallback in next major release.
        this._dayOfMonthOrdinalParseLenient = new RegExp(
            (this._dayOfMonthOrdinalParse.source || this._ordinalParse.source) +
                '|' +
                /\d{1,2}/.source
        );
    }

    function mergeConfigs(parentConfig, childConfig) {
        var res = extend({}, parentConfig),
            prop;
        for (prop in childConfig) {
            if (hasOwnProp(childConfig, prop)) {
                if (isObject(parentConfig[prop]) && isObject(childConfig[prop])) {
                    res[prop] = {};
                    extend(res[prop], parentConfig[prop]);
                    extend(res[prop], childConfig[prop]);
                } else if (childConfig[prop] != null) {
                    res[prop] = childConfig[prop];
                } else {
                    delete res[prop];
                }
            }
        }
        for (prop in parentConfig) {
            if (
                hasOwnProp(parentConfig, prop) &&
                !hasOwnProp(childConfig, prop) &&
                isObject(parentConfig[prop])
            ) {
                // make sure changes to properties don't modify parent config
                res[prop] = extend({}, res[prop]);
            }
        }
        return res;
    }

    function Locale(config) {
        if (config != null) {
            this.set(config);
        }
    }

    var keys;

    if (Object.keys) {
        keys = Object.keys;
    } else {
        keys = function (obj) {
            var i,
                res = [];
            for (i in obj) {
                if (hasOwnProp(obj, i)) {
                    res.push(i);
                }
            }
            return res;
        };
    }

    var defaultCalendar = {
        sameDay: '[Today at] LT',
        nextDay: '[Tomorrow at] LT',
        nextWeek: 'dddd [at] LT',
        lastDay: '[Yesterday at] LT',
        lastWeek: '[Last] dddd [at] LT',
        sameElse: 'L',
    };

    function calendar(key, mom, now) {
        var output = this._calendar[key] || this._calendar['sameElse'];
        return isFunction(output) ? output.call(mom, now) : output;
    }

    function zeroFill(number, targetLength, forceSign) {
        var absNumber = '' + Math.abs(number),
            zerosToFill = targetLength - absNumber.length,
            sign = number >= 0;
        return (
            (sign ? (forceSign ? '+' : '') : '-') +
            Math.pow(10, Math.max(0, zerosToFill)).toString().substr(1) +
            absNumber
        );
    }

    var formattingTokens = /(\[[^\[]*\])|(\\)?([Hh]mm(ss)?|Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Qo?|N{1,5}|YYYYYY|YYYYY|YYYY|YY|y{2,4}|yo?|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|kk?|mm?|ss?|S{1,9}|x|X|zz?|ZZ?|.)/g,
        localFormattingTokens = /(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g,
        formatFunctions = {},
        formatTokenFunctions = {};

    // token:    'M'
    // padded:   ['MM', 2]
    // ordinal:  'Mo'
    // callback: function () { this.month() + 1 }
    function addFormatToken(token, padded, ordinal, callback) {
        var func = callback;
        if (typeof callback === 'string') {
            func = function () {
                return this[callback]();
            };
        }
        if (token) {
            formatTokenFunctions[token] = func;
        }
        if (padded) {
            formatTokenFunctions[padded[0]] = function () {
                return zeroFill(func.apply(this, arguments), padded[1], padded[2]);
            };
        }
        if (ordinal) {
            formatTokenFunctions[ordinal] = function () {
                return this.localeData().ordinal(
                    func.apply(this, arguments),
                    token
                );
            };
        }
    }

    function removeFormattingTokens(input) {
        if (input.match(/\[[\s\S]/)) {
            return input.replace(/^\[|\]$/g, '');
        }
        return input.replace(/\\/g, '');
    }

    function makeFormatFunction(format) {
        var array = format.match(formattingTokens),
            i,
            length;

        for (i = 0, length = array.length; i < length; i++) {
            if (formatTokenFunctions[array[i]]) {
                array[i] = formatTokenFunctions[array[i]];
            } else {
                array[i] = removeFormattingTokens(array[i]);
            }
        }

        return function (mom) {
            var output = '',
                i;
            for (i = 0; i < length; i++) {
                output += isFunction(array[i])
                    ? array[i].call(mom, format)
                    : array[i];
            }
            return output;
        };
    }

    // format date using native date object
    function formatMoment(m, format) {
        if (!m.isValid()) {
            return m.localeData().invalidDate();
        }

        format = expandFormat(format, m.localeData());
        formatFunctions[format] =
            formatFunctions[format] || makeFormatFunction(format);

        return formatFunctions[format](m);
    }

    function expandFormat(format, locale) {
        var i = 5;

        function replaceLongDateFormatTokens(input) {
            return locale.longDateFormat(input) || input;
        }

        localFormattingTokens.lastIndex = 0;
        while (i >= 0 && localFormattingTokens.test(format)) {
            format = format.replace(
                localFormattingTokens,
                replaceLongDateFormatTokens
            );
            localFormattingTokens.lastIndex = 0;
            i -= 1;
        }

        return format;
    }

    var defaultLongDateFormat = {
        LTS: 'h:mm:ss A',
        LT: 'h:mm A',
        L: 'MM/DD/YYYY',
        LL: 'MMMM D, YYYY',
        LLL: 'MMMM D, YYYY h:mm A',
        LLLL: 'dddd, MMMM D, YYYY h:mm A',
    };

    function longDateFormat(key) {
        var format = this._longDateFormat[key],
            formatUpper = this._longDateFormat[key.toUpperCase()];

        if (format || !formatUpper) {
            return format;
        }

        this._longDateFormat[key] = formatUpper
            .match(formattingTokens)
            .map(function (tok) {
                if (
                    tok === 'MMMM' ||
                    tok === 'MM' ||
                    tok === 'DD' ||
                    tok === 'dddd'
                ) {
                    return tok.slice(1);
                }
                return tok;
            })
            .join('');

        return this._longDateFormat[key];
    }

    var defaultInvalidDate = 'Invalid date';

    function invalidDate() {
        return this._invalidDate;
    }

    var defaultOrdinal = '%d',
        defaultDayOfMonthOrdinalParse = /\d{1,2}/;

    function ordinal(number) {
        return this._ordinal.replace('%d', number);
    }

    var defaultRelativeTime = {
        future: 'in %s',
        past: '%s ago',
        s: 'a few seconds',
        ss: '%d seconds',
        m: 'a minute',
        mm: '%d minutes',
        h: 'an hour',
        hh: '%d hours',
        d: 'a day',
        dd: '%d days',
        w: 'a week',
        ww: '%d weeks',
        M: 'a month',
        MM: '%d months',
        y: 'a year',
        yy: '%d years',
    };

    function relativeTime(number, withoutSuffix, string, isFuture) {
        var output = this._relativeTime[string];
        return isFunction(output)
            ? output(number, withoutSuffix, string, isFuture)
            : output.replace(/%d/i, number);
    }

    function pastFuture(diff, output) {
        var format = this._relativeTime[diff > 0 ? 'future' : 'past'];
        return isFunction(format) ? format(output) : format.replace(/%s/i, output);
    }

    var aliases = {};

    function addUnitAlias(unit, shorthand) {
        var lowerCase = unit.toLowerCase();
        aliases[lowerCase] = aliases[lowerCase + 's'] = aliases[shorthand] = unit;
    }

    function normalizeUnits(units) {
        return typeof units === 'string'
            ? aliases[units] || aliases[units.toLowerCase()]
            : undefined;
    }

    function normalizeObjectUnits(inputObject) {
        var normalizedInput = {},
            normalizedProp,
            prop;

        for (prop in inputObject) {
            if (hasOwnProp(inputObject, prop)) {
                normalizedProp = normalizeUnits(prop);
                if (normalizedProp) {
                    normalizedInput[normalizedProp] = inputObject[prop];
                }
            }
        }

        return normalizedInput;
    }

    var priorities = {};

    function addUnitPriority(unit, priority) {
        priorities[unit] = priority;
    }

    function getPrioritizedUnits(unitsObj) {
        var units = [],
            u;
        for (u in unitsObj) {
            if (hasOwnProp(unitsObj, u)) {
                units.push({ unit: u, priority: priorities[u] });
            }
        }
        units.sort(function (a, b) {
            return a.priority - b.priority;
        });
        return units;
    }

    function isLeapYear(year) {
        return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    }

    function absFloor(number) {
        if (number < 0) {
            // -0 -> 0
            return Math.ceil(number) || 0;
        } else {
            return Math.floor(number);
        }
    }

    function toInt(argumentForCoercion) {
        var coercedNumber = +argumentForCoercion,
            value = 0;

        if (coercedNumber !== 0 && isFinite(coercedNumber)) {
            value = absFloor(coercedNumber);
        }

        return value;
    }

    function makeGetSet(unit, keepTime) {
        return function (value) {
            if (value != null) {
                set$1(this, unit, value);
                hooks.updateOffset(this, keepTime);
                return this;
            } else {
                return get(this, unit);
            }
        };
    }

    function get(mom, unit) {
        return mom.isValid()
            ? mom._d['get' + (mom._isUTC ? 'UTC' : '') + unit]()
            : NaN;
    }

    function set$1(mom, unit, value) {
        if (mom.isValid() && !isNaN(value)) {
            if (
                unit === 'FullYear' &&
                isLeapYear(mom.year()) &&
                mom.month() === 1 &&
                mom.date() === 29
            ) {
                value = toInt(value);
                mom._d['set' + (mom._isUTC ? 'UTC' : '') + unit](
                    value,
                    mom.month(),
                    daysInMonth(value, mom.month())
                );
            } else {
                mom._d['set' + (mom._isUTC ? 'UTC' : '') + unit](value);
            }
        }
    }

    // MOMENTS

    function stringGet(units) {
        units = normalizeUnits(units);
        if (isFunction(this[units])) {
            return this[units]();
        }
        return this;
    }

    function stringSet(units, value) {
        if (typeof units === 'object') {
            units = normalizeObjectUnits(units);
            var prioritized = getPrioritizedUnits(units),
                i;
            for (i = 0; i < prioritized.length; i++) {
                this[prioritized[i].unit](units[prioritized[i].unit]);
            }
        } else {
            units = normalizeUnits(units);
            if (isFunction(this[units])) {
                return this[units](value);
            }
        }
        return this;
    }

    var match1 = /\d/, //       0 - 9
        match2 = /\d\d/, //      00 - 99
        match3 = /\d{3}/, //     000 - 999
        match4 = /\d{4}/, //    0000 - 9999
        match6 = /[+-]?\d{6}/, // -999999 - 999999
        match1to2 = /\d\d?/, //       0 - 99
        match3to4 = /\d\d\d\d?/, //     999 - 9999
        match5to6 = /\d\d\d\d\d\d?/, //   99999 - 999999
        match1to3 = /\d{1,3}/, //       0 - 999
        match1to4 = /\d{1,4}/, //       0 - 9999
        match1to6 = /[+-]?\d{1,6}/, // -999999 - 999999
        matchUnsigned = /\d+/, //       0 - inf
        matchSigned = /[+-]?\d+/, //    -inf - inf
        matchOffset = /Z|[+-]\d\d:?\d\d/gi, // +00:00 -00:00 +0000 -0000 or Z
        matchShortOffset = /Z|[+-]\d\d(?::?\d\d)?/gi, // +00 -00 +00:00 -00:00 +0000 -0000 or Z
        matchTimestamp = /[+-]?\d+(\.\d{1,3})?/, // 123456789 123456789.123
        // any word (or two) characters or numbers including two/three word month in arabic.
        // includes scottish gaelic two word and hyphenated months
        matchWord = /[0-9]{0,256}['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFF07\uFF10-\uFFEF]{1,256}|[\u0600-\u06FF\/]{1,256}(\s*?[\u0600-\u06FF]{1,256}){1,2}/i,
        regexes;

    regexes = {};

    function addRegexToken(token, regex, strictRegex) {
        regexes[token] = isFunction(regex)
            ? regex
            : function (isStrict, localeData) {
                  return isStrict && strictRegex ? strictRegex : regex;
              };
    }

    function getParseRegexForToken(token, config) {
        if (!hasOwnProp(regexes, token)) {
            return new RegExp(unescapeFormat(token));
        }

        return regexes[token](config._strict, config._locale);
    }

    // Code from http://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
    function unescapeFormat(s) {
        return regexEscape(
            s
                .replace('\\', '')
                .replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g, function (
                    matched,
                    p1,
                    p2,
                    p3,
                    p4
                ) {
                    return p1 || p2 || p3 || p4;
                })
        );
    }

    function regexEscape(s) {
        return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    }

    var tokens = {};

    function addParseToken(token, callback) {
        var i,
            func = callback;
        if (typeof token === 'string') {
            token = [token];
        }
        if (isNumber(callback)) {
            func = function (input, array) {
                array[callback] = toInt(input);
            };
        }
        for (i = 0; i < token.length; i++) {
            tokens[token[i]] = func;
        }
    }

    function addWeekParseToken(token, callback) {
        addParseToken(token, function (input, array, config, token) {
            config._w = config._w || {};
            callback(input, config._w, config, token);
        });
    }

    function addTimeToArrayFromToken(token, input, config) {
        if (input != null && hasOwnProp(tokens, token)) {
            tokens[token](input, config._a, config, token);
        }
    }

    var YEAR = 0,
        MONTH = 1,
        DATE = 2,
        HOUR = 3,
        MINUTE = 4,
        SECOND = 5,
        MILLISECOND = 6,
        WEEK = 7,
        WEEKDAY = 8;

    function mod(n, x) {
        return ((n % x) + x) % x;
    }

    var indexOf;

    if (Array.prototype.indexOf) {
        indexOf = Array.prototype.indexOf;
    } else {
        indexOf = function (o) {
            // I know
            var i;
            for (i = 0; i < this.length; ++i) {
                if (this[i] === o) {
                    return i;
                }
            }
            return -1;
        };
    }

    function daysInMonth(year, month) {
        if (isNaN(year) || isNaN(month)) {
            return NaN;
        }
        var modMonth = mod(month, 12);
        year += (month - modMonth) / 12;
        return modMonth === 1
            ? isLeapYear(year)
                ? 29
                : 28
            : 31 - ((modMonth % 7) % 2);
    }

    // FORMATTING

    addFormatToken('M', ['MM', 2], 'Mo', function () {
        return this.month() + 1;
    });

    addFormatToken('MMM', 0, 0, function (format) {
        return this.localeData().monthsShort(this, format);
    });

    addFormatToken('MMMM', 0, 0, function (format) {
        return this.localeData().months(this, format);
    });

    // ALIASES

    addUnitAlias('month', 'M');

    // PRIORITY

    addUnitPriority('month', 8);

    // PARSING

    addRegexToken('M', match1to2);
    addRegexToken('MM', match1to2, match2);
    addRegexToken('MMM', function (isStrict, locale) {
        return locale.monthsShortRegex(isStrict);
    });
    addRegexToken('MMMM', function (isStrict, locale) {
        return locale.monthsRegex(isStrict);
    });

    addParseToken(['M', 'MM'], function (input, array) {
        array[MONTH] = toInt(input) - 1;
    });

    addParseToken(['MMM', 'MMMM'], function (input, array, config, token) {
        var month = config._locale.monthsParse(input, token, config._strict);
        // if we didn't find a month name, mark the date as invalid.
        if (month != null) {
            array[MONTH] = month;
        } else {
            getParsingFlags(config).invalidMonth = input;
        }
    });

    // LOCALES

    var defaultLocaleMonths = 'January_February_March_April_May_June_July_August_September_October_November_December'.split(
            '_'
        ),
        defaultLocaleMonthsShort = 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split(
            '_'
        ),
        MONTHS_IN_FORMAT = /D[oD]?(\[[^\[\]]*\]|\s)+MMMM?/,
        defaultMonthsShortRegex = matchWord,
        defaultMonthsRegex = matchWord;

    function localeMonths(m, format) {
        if (!m) {
            return isArray(this._months)
                ? this._months
                : this._months['standalone'];
        }
        return isArray(this._months)
            ? this._months[m.month()]
            : this._months[
                  (this._months.isFormat || MONTHS_IN_FORMAT).test(format)
                      ? 'format'
                      : 'standalone'
              ][m.month()];
    }

    function localeMonthsShort(m, format) {
        if (!m) {
            return isArray(this._monthsShort)
                ? this._monthsShort
                : this._monthsShort['standalone'];
        }
        return isArray(this._monthsShort)
            ? this._monthsShort[m.month()]
            : this._monthsShort[
                  MONTHS_IN_FORMAT.test(format) ? 'format' : 'standalone'
              ][m.month()];
    }

    function handleStrictParse(monthName, format, strict) {
        var i,
            ii,
            mom,
            llc = monthName.toLocaleLowerCase();
        if (!this._monthsParse) {
            // this is not used
            this._monthsParse = [];
            this._longMonthsParse = [];
            this._shortMonthsParse = [];
            for (i = 0; i < 12; ++i) {
                mom = createUTC([2000, i]);
                this._shortMonthsParse[i] = this.monthsShort(
                    mom,
                    ''
                ).toLocaleLowerCase();
                this._longMonthsParse[i] = this.months(mom, '').toLocaleLowerCase();
            }
        }

        if (strict) {
            if (format === 'MMM') {
                ii = indexOf.call(this._shortMonthsParse, llc);
                return ii !== -1 ? ii : null;
            } else {
                ii = indexOf.call(this._longMonthsParse, llc);
                return ii !== -1 ? ii : null;
            }
        } else {
            if (format === 'MMM') {
                ii = indexOf.call(this._shortMonthsParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._longMonthsParse, llc);
                return ii !== -1 ? ii : null;
            } else {
                ii = indexOf.call(this._longMonthsParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._shortMonthsParse, llc);
                return ii !== -1 ? ii : null;
            }
        }
    }

    function localeMonthsParse(monthName, format, strict) {
        var i, mom, regex;

        if (this._monthsParseExact) {
            return handleStrictParse.call(this, monthName, format, strict);
        }

        if (!this._monthsParse) {
            this._monthsParse = [];
            this._longMonthsParse = [];
            this._shortMonthsParse = [];
        }

        // TODO: add sorting
        // Sorting makes sure if one month (or abbr) is a prefix of another
        // see sorting in computeMonthsParse
        for (i = 0; i < 12; i++) {
            // make the regex if we don't have it already
            mom = createUTC([2000, i]);
            if (strict && !this._longMonthsParse[i]) {
                this._longMonthsParse[i] = new RegExp(
                    '^' + this.months(mom, '').replace('.', '') + '$',
                    'i'
                );
                this._shortMonthsParse[i] = new RegExp(
                    '^' + this.monthsShort(mom, '').replace('.', '') + '$',
                    'i'
                );
            }
            if (!strict && !this._monthsParse[i]) {
                regex =
                    '^' + this.months(mom, '') + '|^' + this.monthsShort(mom, '');
                this._monthsParse[i] = new RegExp(regex.replace('.', ''), 'i');
            }
            // test the regex
            if (
                strict &&
                format === 'MMMM' &&
                this._longMonthsParse[i].test(monthName)
            ) {
                return i;
            } else if (
                strict &&
                format === 'MMM' &&
                this._shortMonthsParse[i].test(monthName)
            ) {
                return i;
            } else if (!strict && this._monthsParse[i].test(monthName)) {
                return i;
            }
        }
    }

    // MOMENTS

    function setMonth(mom, value) {
        var dayOfMonth;

        if (!mom.isValid()) {
            // No op
            return mom;
        }

        if (typeof value === 'string') {
            if (/^\d+$/.test(value)) {
                value = toInt(value);
            } else {
                value = mom.localeData().monthsParse(value);
                // TODO: Another silent failure?
                if (!isNumber(value)) {
                    return mom;
                }
            }
        }

        dayOfMonth = Math.min(mom.date(), daysInMonth(mom.year(), value));
        mom._d['set' + (mom._isUTC ? 'UTC' : '') + 'Month'](value, dayOfMonth);
        return mom;
    }

    function getSetMonth(value) {
        if (value != null) {
            setMonth(this, value);
            hooks.updateOffset(this, true);
            return this;
        } else {
            return get(this, 'Month');
        }
    }

    function getDaysInMonth() {
        return daysInMonth(this.year(), this.month());
    }

    function monthsShortRegex(isStrict) {
        if (this._monthsParseExact) {
            if (!hasOwnProp(this, '_monthsRegex')) {
                computeMonthsParse.call(this);
            }
            if (isStrict) {
                return this._monthsShortStrictRegex;
            } else {
                return this._monthsShortRegex;
            }
        } else {
            if (!hasOwnProp(this, '_monthsShortRegex')) {
                this._monthsShortRegex = defaultMonthsShortRegex;
            }
            return this._monthsShortStrictRegex && isStrict
                ? this._monthsShortStrictRegex
                : this._monthsShortRegex;
        }
    }

    function monthsRegex(isStrict) {
        if (this._monthsParseExact) {
            if (!hasOwnProp(this, '_monthsRegex')) {
                computeMonthsParse.call(this);
            }
            if (isStrict) {
                return this._monthsStrictRegex;
            } else {
                return this._monthsRegex;
            }
        } else {
            if (!hasOwnProp(this, '_monthsRegex')) {
                this._monthsRegex = defaultMonthsRegex;
            }
            return this._monthsStrictRegex && isStrict
                ? this._monthsStrictRegex
                : this._monthsRegex;
        }
    }

    function computeMonthsParse() {
        function cmpLenRev(a, b) {
            return b.length - a.length;
        }

        var shortPieces = [],
            longPieces = [],
            mixedPieces = [],
            i,
            mom;
        for (i = 0; i < 12; i++) {
            // make the regex if we don't have it already
            mom = createUTC([2000, i]);
            shortPieces.push(this.monthsShort(mom, ''));
            longPieces.push(this.months(mom, ''));
            mixedPieces.push(this.months(mom, ''));
            mixedPieces.push(this.monthsShort(mom, ''));
        }
        // Sorting makes sure if one month (or abbr) is a prefix of another it
        // will match the longer piece.
        shortPieces.sort(cmpLenRev);
        longPieces.sort(cmpLenRev);
        mixedPieces.sort(cmpLenRev);
        for (i = 0; i < 12; i++) {
            shortPieces[i] = regexEscape(shortPieces[i]);
            longPieces[i] = regexEscape(longPieces[i]);
        }
        for (i = 0; i < 24; i++) {
            mixedPieces[i] = regexEscape(mixedPieces[i]);
        }

        this._monthsRegex = new RegExp('^(' + mixedPieces.join('|') + ')', 'i');
        this._monthsShortRegex = this._monthsRegex;
        this._monthsStrictRegex = new RegExp(
            '^(' + longPieces.join('|') + ')',
            'i'
        );
        this._monthsShortStrictRegex = new RegExp(
            '^(' + shortPieces.join('|') + ')',
            'i'
        );
    }

    // FORMATTING

    addFormatToken('Y', 0, 0, function () {
        var y = this.year();
        return y <= 9999 ? zeroFill(y, 4) : '+' + y;
    });

    addFormatToken(0, ['YY', 2], 0, function () {
        return this.year() % 100;
    });

    addFormatToken(0, ['YYYY', 4], 0, 'year');
    addFormatToken(0, ['YYYYY', 5], 0, 'year');
    addFormatToken(0, ['YYYYYY', 6, true], 0, 'year');

    // ALIASES

    addUnitAlias('year', 'y');

    // PRIORITIES

    addUnitPriority('year', 1);

    // PARSING

    addRegexToken('Y', matchSigned);
    addRegexToken('YY', match1to2, match2);
    addRegexToken('YYYY', match1to4, match4);
    addRegexToken('YYYYY', match1to6, match6);
    addRegexToken('YYYYYY', match1to6, match6);

    addParseToken(['YYYYY', 'YYYYYY'], YEAR);
    addParseToken('YYYY', function (input, array) {
        array[YEAR] =
            input.length === 2 ? hooks.parseTwoDigitYear(input) : toInt(input);
    });
    addParseToken('YY', function (input, array) {
        array[YEAR] = hooks.parseTwoDigitYear(input);
    });
    addParseToken('Y', function (input, array) {
        array[YEAR] = parseInt(input, 10);
    });

    // HELPERS

    function daysInYear(year) {
        return isLeapYear(year) ? 366 : 365;
    }

    // HOOKS

    hooks.parseTwoDigitYear = function (input) {
        return toInt(input) + (toInt(input) > 68 ? 1900 : 2000);
    };

    // MOMENTS

    var getSetYear = makeGetSet('FullYear', true);

    function getIsLeapYear() {
        return isLeapYear(this.year());
    }

    function createDate(y, m, d, h, M, s, ms) {
        // can't just apply() to create a date:
        // https://stackoverflow.com/q/181348
        var date;
        // the date constructor remaps years 0-99 to 1900-1999
        if (y < 100 && y >= 0) {
            // preserve leap years using a full 400 year cycle, then reset
            date = new Date(y + 400, m, d, h, M, s, ms);
            if (isFinite(date.getFullYear())) {
                date.setFullYear(y);
            }
        } else {
            date = new Date(y, m, d, h, M, s, ms);
        }

        return date;
    }

    function createUTCDate(y) {
        var date, args;
        // the Date.UTC function remaps years 0-99 to 1900-1999
        if (y < 100 && y >= 0) {
            args = Array.prototype.slice.call(arguments);
            // preserve leap years using a full 400 year cycle, then reset
            args[0] = y + 400;
            date = new Date(Date.UTC.apply(null, args));
            if (isFinite(date.getUTCFullYear())) {
                date.setUTCFullYear(y);
            }
        } else {
            date = new Date(Date.UTC.apply(null, arguments));
        }

        return date;
    }

    // start-of-first-week - start-of-year
    function firstWeekOffset(year, dow, doy) {
        var // first-week day -- which january is always in the first week (4 for iso, 1 for other)
            fwd = 7 + dow - doy,
            // first-week day local weekday -- which local weekday is fwd
            fwdlw = (7 + createUTCDate(year, 0, fwd).getUTCDay() - dow) % 7;

        return -fwdlw + fwd - 1;
    }

    // https://en.wikipedia.org/wiki/ISO_week_date#Calculating_a_date_given_the_year.2C_week_number_and_weekday
    function dayOfYearFromWeeks(year, week, weekday, dow, doy) {
        var localWeekday = (7 + weekday - dow) % 7,
            weekOffset = firstWeekOffset(year, dow, doy),
            dayOfYear = 1 + 7 * (week - 1) + localWeekday + weekOffset,
            resYear,
            resDayOfYear;

        if (dayOfYear <= 0) {
            resYear = year - 1;
            resDayOfYear = daysInYear(resYear) + dayOfYear;
        } else if (dayOfYear > daysInYear(year)) {
            resYear = year + 1;
            resDayOfYear = dayOfYear - daysInYear(year);
        } else {
            resYear = year;
            resDayOfYear = dayOfYear;
        }

        return {
            year: resYear,
            dayOfYear: resDayOfYear,
        };
    }

    function weekOfYear(mom, dow, doy) {
        var weekOffset = firstWeekOffset(mom.year(), dow, doy),
            week = Math.floor((mom.dayOfYear() - weekOffset - 1) / 7) + 1,
            resWeek,
            resYear;

        if (week < 1) {
            resYear = mom.year() - 1;
            resWeek = week + weeksInYear(resYear, dow, doy);
        } else if (week > weeksInYear(mom.year(), dow, doy)) {
            resWeek = week - weeksInYear(mom.year(), dow, doy);
            resYear = mom.year() + 1;
        } else {
            resYear = mom.year();
            resWeek = week;
        }

        return {
            week: resWeek,
            year: resYear,
        };
    }

    function weeksInYear(year, dow, doy) {
        var weekOffset = firstWeekOffset(year, dow, doy),
            weekOffsetNext = firstWeekOffset(year + 1, dow, doy);
        return (daysInYear(year) - weekOffset + weekOffsetNext) / 7;
    }

    // FORMATTING

    addFormatToken('w', ['ww', 2], 'wo', 'week');
    addFormatToken('W', ['WW', 2], 'Wo', 'isoWeek');

    // ALIASES

    addUnitAlias('week', 'w');
    addUnitAlias('isoWeek', 'W');

    // PRIORITIES

    addUnitPriority('week', 5);
    addUnitPriority('isoWeek', 5);

    // PARSING

    addRegexToken('w', match1to2);
    addRegexToken('ww', match1to2, match2);
    addRegexToken('W', match1to2);
    addRegexToken('WW', match1to2, match2);

    addWeekParseToken(['w', 'ww', 'W', 'WW'], function (
        input,
        week,
        config,
        token
    ) {
        week[token.substr(0, 1)] = toInt(input);
    });

    // HELPERS

    // LOCALES

    function localeWeek(mom) {
        return weekOfYear(mom, this._week.dow, this._week.doy).week;
    }

    var defaultLocaleWeek = {
        dow: 0, // Sunday is the first day of the week.
        doy: 6, // The week that contains Jan 6th is the first week of the year.
    };

    function localeFirstDayOfWeek() {
        return this._week.dow;
    }

    function localeFirstDayOfYear() {
        return this._week.doy;
    }

    // MOMENTS

    function getSetWeek(input) {
        var week = this.localeData().week(this);
        return input == null ? week : this.add((input - week) * 7, 'd');
    }

    function getSetISOWeek(input) {
        var week = weekOfYear(this, 1, 4).week;
        return input == null ? week : this.add((input - week) * 7, 'd');
    }

    // FORMATTING

    addFormatToken('d', 0, 'do', 'day');

    addFormatToken('dd', 0, 0, function (format) {
        return this.localeData().weekdaysMin(this, format);
    });

    addFormatToken('ddd', 0, 0, function (format) {
        return this.localeData().weekdaysShort(this, format);
    });

    addFormatToken('dddd', 0, 0, function (format) {
        return this.localeData().weekdays(this, format);
    });

    addFormatToken('e', 0, 0, 'weekday');
    addFormatToken('E', 0, 0, 'isoWeekday');

    // ALIASES

    addUnitAlias('day', 'd');
    addUnitAlias('weekday', 'e');
    addUnitAlias('isoWeekday', 'E');

    // PRIORITY
    addUnitPriority('day', 11);
    addUnitPriority('weekday', 11);
    addUnitPriority('isoWeekday', 11);

    // PARSING

    addRegexToken('d', match1to2);
    addRegexToken('e', match1to2);
    addRegexToken('E', match1to2);
    addRegexToken('dd', function (isStrict, locale) {
        return locale.weekdaysMinRegex(isStrict);
    });
    addRegexToken('ddd', function (isStrict, locale) {
        return locale.weekdaysShortRegex(isStrict);
    });
    addRegexToken('dddd', function (isStrict, locale) {
        return locale.weekdaysRegex(isStrict);
    });

    addWeekParseToken(['dd', 'ddd', 'dddd'], function (input, week, config, token) {
        var weekday = config._locale.weekdaysParse(input, token, config._strict);
        // if we didn't get a weekday name, mark the date as invalid
        if (weekday != null) {
            week.d = weekday;
        } else {
            getParsingFlags(config).invalidWeekday = input;
        }
    });

    addWeekParseToken(['d', 'e', 'E'], function (input, week, config, token) {
        week[token] = toInt(input);
    });

    // HELPERS

    function parseWeekday(input, locale) {
        if (typeof input !== 'string') {
            return input;
        }

        if (!isNaN(input)) {
            return parseInt(input, 10);
        }

        input = locale.weekdaysParse(input);
        if (typeof input === 'number') {
            return input;
        }

        return null;
    }

    function parseIsoWeekday(input, locale) {
        if (typeof input === 'string') {
            return locale.weekdaysParse(input) % 7 || 7;
        }
        return isNaN(input) ? null : input;
    }

    // LOCALES
    function shiftWeekdays(ws, n) {
        return ws.slice(n, 7).concat(ws.slice(0, n));
    }

    var defaultLocaleWeekdays = 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split(
            '_'
        ),
        defaultLocaleWeekdaysShort = 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_'),
        defaultLocaleWeekdaysMin = 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_'),
        defaultWeekdaysRegex = matchWord,
        defaultWeekdaysShortRegex = matchWord,
        defaultWeekdaysMinRegex = matchWord;

    function localeWeekdays(m, format) {
        var weekdays = isArray(this._weekdays)
            ? this._weekdays
            : this._weekdays[
                  m && m !== true && this._weekdays.isFormat.test(format)
                      ? 'format'
                      : 'standalone'
              ];
        return m === true
            ? shiftWeekdays(weekdays, this._week.dow)
            : m
            ? weekdays[m.day()]
            : weekdays;
    }

    function localeWeekdaysShort(m) {
        return m === true
            ? shiftWeekdays(this._weekdaysShort, this._week.dow)
            : m
            ? this._weekdaysShort[m.day()]
            : this._weekdaysShort;
    }

    function localeWeekdaysMin(m) {
        return m === true
            ? shiftWeekdays(this._weekdaysMin, this._week.dow)
            : m
            ? this._weekdaysMin[m.day()]
            : this._weekdaysMin;
    }

    function handleStrictParse$1(weekdayName, format, strict) {
        var i,
            ii,
            mom,
            llc = weekdayName.toLocaleLowerCase();
        if (!this._weekdaysParse) {
            this._weekdaysParse = [];
            this._shortWeekdaysParse = [];
            this._minWeekdaysParse = [];

            for (i = 0; i < 7; ++i) {
                mom = createUTC([2000, 1]).day(i);
                this._minWeekdaysParse[i] = this.weekdaysMin(
                    mom,
                    ''
                ).toLocaleLowerCase();
                this._shortWeekdaysParse[i] = this.weekdaysShort(
                    mom,
                    ''
                ).toLocaleLowerCase();
                this._weekdaysParse[i] = this.weekdays(mom, '').toLocaleLowerCase();
            }
        }

        if (strict) {
            if (format === 'dddd') {
                ii = indexOf.call(this._weekdaysParse, llc);
                return ii !== -1 ? ii : null;
            } else if (format === 'ddd') {
                ii = indexOf.call(this._shortWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            } else {
                ii = indexOf.call(this._minWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            }
        } else {
            if (format === 'dddd') {
                ii = indexOf.call(this._weekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._shortWeekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._minWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            } else if (format === 'ddd') {
                ii = indexOf.call(this._shortWeekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._weekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._minWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            } else {
                ii = indexOf.call(this._minWeekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._weekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._shortWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            }
        }
    }

    function localeWeekdaysParse(weekdayName, format, strict) {
        var i, mom, regex;

        if (this._weekdaysParseExact) {
            return handleStrictParse$1.call(this, weekdayName, format, strict);
        }

        if (!this._weekdaysParse) {
            this._weekdaysParse = [];
            this._minWeekdaysParse = [];
            this._shortWeekdaysParse = [];
            this._fullWeekdaysParse = [];
        }

        for (i = 0; i < 7; i++) {
            // make the regex if we don't have it already

            mom = createUTC([2000, 1]).day(i);
            if (strict && !this._fullWeekdaysParse[i]) {
                this._fullWeekdaysParse[i] = new RegExp(
                    '^' + this.weekdays(mom, '').replace('.', '\\.?') + '$',
                    'i'
                );
                this._shortWeekdaysParse[i] = new RegExp(
                    '^' + this.weekdaysShort(mom, '').replace('.', '\\.?') + '$',
                    'i'
                );
                this._minWeekdaysParse[i] = new RegExp(
                    '^' + this.weekdaysMin(mom, '').replace('.', '\\.?') + '$',
                    'i'
                );
            }
            if (!this._weekdaysParse[i]) {
                regex =
                    '^' +
                    this.weekdays(mom, '') +
                    '|^' +
                    this.weekdaysShort(mom, '') +
                    '|^' +
                    this.weekdaysMin(mom, '');
                this._weekdaysParse[i] = new RegExp(regex.replace('.', ''), 'i');
            }
            // test the regex
            if (
                strict &&
                format === 'dddd' &&
                this._fullWeekdaysParse[i].test(weekdayName)
            ) {
                return i;
            } else if (
                strict &&
                format === 'ddd' &&
                this._shortWeekdaysParse[i].test(weekdayName)
            ) {
                return i;
            } else if (
                strict &&
                format === 'dd' &&
                this._minWeekdaysParse[i].test(weekdayName)
            ) {
                return i;
            } else if (!strict && this._weekdaysParse[i].test(weekdayName)) {
                return i;
            }
        }
    }

    // MOMENTS

    function getSetDayOfWeek(input) {
        if (!this.isValid()) {
            return input != null ? this : NaN;
        }
        var day = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
        if (input != null) {
            input = parseWeekday(input, this.localeData());
            return this.add(input - day, 'd');
        } else {
            return day;
        }
    }

    function getSetLocaleDayOfWeek(input) {
        if (!this.isValid()) {
            return input != null ? this : NaN;
        }
        var weekday = (this.day() + 7 - this.localeData()._week.dow) % 7;
        return input == null ? weekday : this.add(input - weekday, 'd');
    }

    function getSetISODayOfWeek(input) {
        if (!this.isValid()) {
            return input != null ? this : NaN;
        }

        // behaves the same as moment#day except
        // as a getter, returns 7 instead of 0 (1-7 range instead of 0-6)
        // as a setter, sunday should belong to the previous week.

        if (input != null) {
            var weekday = parseIsoWeekday(input, this.localeData());
            return this.day(this.day() % 7 ? weekday : weekday - 7);
        } else {
            return this.day() || 7;
        }
    }

    function weekdaysRegex(isStrict) {
        if (this._weekdaysParseExact) {
            if (!hasOwnProp(this, '_weekdaysRegex')) {
                computeWeekdaysParse.call(this);
            }
            if (isStrict) {
                return this._weekdaysStrictRegex;
            } else {
                return this._weekdaysRegex;
            }
        } else {
            if (!hasOwnProp(this, '_weekdaysRegex')) {
                this._weekdaysRegex = defaultWeekdaysRegex;
            }
            return this._weekdaysStrictRegex && isStrict
                ? this._weekdaysStrictRegex
                : this._weekdaysRegex;
        }
    }

    function weekdaysShortRegex(isStrict) {
        if (this._weekdaysParseExact) {
            if (!hasOwnProp(this, '_weekdaysRegex')) {
                computeWeekdaysParse.call(this);
            }
            if (isStrict) {
                return this._weekdaysShortStrictRegex;
            } else {
                return this._weekdaysShortRegex;
            }
        } else {
            if (!hasOwnProp(this, '_weekdaysShortRegex')) {
                this._weekdaysShortRegex = defaultWeekdaysShortRegex;
            }
            return this._weekdaysShortStrictRegex && isStrict
                ? this._weekdaysShortStrictRegex
                : this._weekdaysShortRegex;
        }
    }

    function weekdaysMinRegex(isStrict) {
        if (this._weekdaysParseExact) {
            if (!hasOwnProp(this, '_weekdaysRegex')) {
                computeWeekdaysParse.call(this);
            }
            if (isStrict) {
                return this._weekdaysMinStrictRegex;
            } else {
                return this._weekdaysMinRegex;
            }
        } else {
            if (!hasOwnProp(this, '_weekdaysMinRegex')) {
                this._weekdaysMinRegex = defaultWeekdaysMinRegex;
            }
            return this._weekdaysMinStrictRegex && isStrict
                ? this._weekdaysMinStrictRegex
                : this._weekdaysMinRegex;
        }
    }

    function computeWeekdaysParse() {
        function cmpLenRev(a, b) {
            return b.length - a.length;
        }

        var minPieces = [],
            shortPieces = [],
            longPieces = [],
            mixedPieces = [],
            i,
            mom,
            minp,
            shortp,
            longp;
        for (i = 0; i < 7; i++) {
            // make the regex if we don't have it already
            mom = createUTC([2000, 1]).day(i);
            minp = regexEscape(this.weekdaysMin(mom, ''));
            shortp = regexEscape(this.weekdaysShort(mom, ''));
            longp = regexEscape(this.weekdays(mom, ''));
            minPieces.push(minp);
            shortPieces.push(shortp);
            longPieces.push(longp);
            mixedPieces.push(minp);
            mixedPieces.push(shortp);
            mixedPieces.push(longp);
        }
        // Sorting makes sure if one weekday (or abbr) is a prefix of another it
        // will match the longer piece.
        minPieces.sort(cmpLenRev);
        shortPieces.sort(cmpLenRev);
        longPieces.sort(cmpLenRev);
        mixedPieces.sort(cmpLenRev);

        this._weekdaysRegex = new RegExp('^(' + mixedPieces.join('|') + ')', 'i');
        this._weekdaysShortRegex = this._weekdaysRegex;
        this._weekdaysMinRegex = this._weekdaysRegex;

        this._weekdaysStrictRegex = new RegExp(
            '^(' + longPieces.join('|') + ')',
            'i'
        );
        this._weekdaysShortStrictRegex = new RegExp(
            '^(' + shortPieces.join('|') + ')',
            'i'
        );
        this._weekdaysMinStrictRegex = new RegExp(
            '^(' + minPieces.join('|') + ')',
            'i'
        );
    }

    // FORMATTING

    function hFormat() {
        return this.hours() % 12 || 12;
    }

    function kFormat() {
        return this.hours() || 24;
    }

    addFormatToken('H', ['HH', 2], 0, 'hour');
    addFormatToken('h', ['hh', 2], 0, hFormat);
    addFormatToken('k', ['kk', 2], 0, kFormat);

    addFormatToken('hmm', 0, 0, function () {
        return '' + hFormat.apply(this) + zeroFill(this.minutes(), 2);
    });

    addFormatToken('hmmss', 0, 0, function () {
        return (
            '' +
            hFormat.apply(this) +
            zeroFill(this.minutes(), 2) +
            zeroFill(this.seconds(), 2)
        );
    });

    addFormatToken('Hmm', 0, 0, function () {
        return '' + this.hours() + zeroFill(this.minutes(), 2);
    });

    addFormatToken('Hmmss', 0, 0, function () {
        return (
            '' +
            this.hours() +
            zeroFill(this.minutes(), 2) +
            zeroFill(this.seconds(), 2)
        );
    });

    function meridiem(token, lowercase) {
        addFormatToken(token, 0, 0, function () {
            return this.localeData().meridiem(
                this.hours(),
                this.minutes(),
                lowercase
            );
        });
    }

    meridiem('a', true);
    meridiem('A', false);

    // ALIASES

    addUnitAlias('hour', 'h');

    // PRIORITY
    addUnitPriority('hour', 13);

    // PARSING

    function matchMeridiem(isStrict, locale) {
        return locale._meridiemParse;
    }

    addRegexToken('a', matchMeridiem);
    addRegexToken('A', matchMeridiem);
    addRegexToken('H', match1to2);
    addRegexToken('h', match1to2);
    addRegexToken('k', match1to2);
    addRegexToken('HH', match1to2, match2);
    addRegexToken('hh', match1to2, match2);
    addRegexToken('kk', match1to2, match2);

    addRegexToken('hmm', match3to4);
    addRegexToken('hmmss', match5to6);
    addRegexToken('Hmm', match3to4);
    addRegexToken('Hmmss', match5to6);

    addParseToken(['H', 'HH'], HOUR);
    addParseToken(['k', 'kk'], function (input, array, config) {
        var kInput = toInt(input);
        array[HOUR] = kInput === 24 ? 0 : kInput;
    });
    addParseToken(['a', 'A'], function (input, array, config) {
        config._isPm = config._locale.isPM(input);
        config._meridiem = input;
    });
    addParseToken(['h', 'hh'], function (input, array, config) {
        array[HOUR] = toInt(input);
        getParsingFlags(config).bigHour = true;
    });
    addParseToken('hmm', function (input, array, config) {
        var pos = input.length - 2;
        array[HOUR] = toInt(input.substr(0, pos));
        array[MINUTE] = toInt(input.substr(pos));
        getParsingFlags(config).bigHour = true;
    });
    addParseToken('hmmss', function (input, array, config) {
        var pos1 = input.length - 4,
            pos2 = input.length - 2;
        array[HOUR] = toInt(input.substr(0, pos1));
        array[MINUTE] = toInt(input.substr(pos1, 2));
        array[SECOND] = toInt(input.substr(pos2));
        getParsingFlags(config).bigHour = true;
    });
    addParseToken('Hmm', function (input, array, config) {
        var pos = input.length - 2;
        array[HOUR] = toInt(input.substr(0, pos));
        array[MINUTE] = toInt(input.substr(pos));
    });
    addParseToken('Hmmss', function (input, array, config) {
        var pos1 = input.length - 4,
            pos2 = input.length - 2;
        array[HOUR] = toInt(input.substr(0, pos1));
        array[MINUTE] = toInt(input.substr(pos1, 2));
        array[SECOND] = toInt(input.substr(pos2));
    });

    // LOCALES

    function localeIsPM(input) {
        // IE8 Quirks Mode & IE7 Standards Mode do not allow accessing strings like arrays
        // Using charAt should be more compatible.
        return (input + '').toLowerCase().charAt(0) === 'p';
    }

    var defaultLocaleMeridiemParse = /[ap]\.?m?\.?/i,
        // Setting the hour should keep the time, because the user explicitly
        // specified which hour they want. So trying to maintain the same hour (in
        // a new timezone) makes sense. Adding/subtracting hours does not follow
        // this rule.
        getSetHour = makeGetSet('Hours', true);

    function localeMeridiem(hours, minutes, isLower) {
        if (hours > 11) {
            return isLower ? 'pm' : 'PM';
        } else {
            return isLower ? 'am' : 'AM';
        }
    }

    var baseConfig = {
        calendar: defaultCalendar,
        longDateFormat: defaultLongDateFormat,
        invalidDate: defaultInvalidDate,
        ordinal: defaultOrdinal,
        dayOfMonthOrdinalParse: defaultDayOfMonthOrdinalParse,
        relativeTime: defaultRelativeTime,

        months: defaultLocaleMonths,
        monthsShort: defaultLocaleMonthsShort,

        week: defaultLocaleWeek,

        weekdays: defaultLocaleWeekdays,
        weekdaysMin: defaultLocaleWeekdaysMin,
        weekdaysShort: defaultLocaleWeekdaysShort,

        meridiemParse: defaultLocaleMeridiemParse,
    };

    // internal storage for locale config files
    var locales = {},
        localeFamilies = {},
        globalLocale;

    function commonPrefix(arr1, arr2) {
        var i,
            minl = Math.min(arr1.length, arr2.length);
        for (i = 0; i < minl; i += 1) {
            if (arr1[i] !== arr2[i]) {
                return i;
            }
        }
        return minl;
    }

    function normalizeLocale(key) {
        return key ? key.toLowerCase().replace('_', '-') : key;
    }

    // pick the locale from the array
    // try ['en-au', 'en-gb'] as 'en-au', 'en-gb', 'en', as in move through the list trying each
    // substring from most specific to least, but move to the next array item if it's a more specific variant than the current root
    function chooseLocale(names) {
        var i = 0,
            j,
            next,
            locale,
            split;

        while (i < names.length) {
            split = normalizeLocale(names[i]).split('-');
            j = split.length;
            next = normalizeLocale(names[i + 1]);
            next = next ? next.split('-') : null;
            while (j > 0) {
                locale = loadLocale(split.slice(0, j).join('-'));
                if (locale) {
                    return locale;
                }
                if (
                    next &&
                    next.length >= j &&
                    commonPrefix(split, next) >= j - 1
                ) {
                    //the next array item is better than a shallower substring of this one
                    break;
                }
                j--;
            }
            i++;
        }
        return globalLocale;
    }

    function loadLocale(name) {
        var oldLocale = null,
            aliasedRequire;
        // TODO: Find a better way to register and load all the locales in Node
        if (
            locales[name] === undefined &&
            'object' !== 'undefined' &&
            module &&
            module.exports
        ) {
            try {
                oldLocale = globalLocale._abbr;
                aliasedRequire = commonjsRequire;
                aliasedRequire('./locale/' + name);
                getSetGlobalLocale(oldLocale);
            } catch (e) {
                // mark as not found to avoid repeating expensive file require call causing high CPU
                // when trying to find en-US, en_US, en-us for every format call
                locales[name] = null; // null means not found
            }
        }
        return locales[name];
    }

    // This function will load locale and then set the global locale.  If
    // no arguments are passed in, it will simply return the current global
    // locale key.
    function getSetGlobalLocale(key, values) {
        var data;
        if (key) {
            if (isUndefined(values)) {
                data = getLocale(key);
            } else {
                data = defineLocale(key, values);
            }

            if (data) {
                // moment.duration._locale = moment._locale = data;
                globalLocale = data;
            } else {
                if (typeof console !== 'undefined' && console.warn) {
                    //warn user if arguments are passed but the locale could not be set
                    console.warn(
                        'Locale ' + key + ' not found. Did you forget to load it?'
                    );
                }
            }
        }

        return globalLocale._abbr;
    }

    function defineLocale(name, config) {
        if (config !== null) {
            var locale,
                parentConfig = baseConfig;
            config.abbr = name;
            if (locales[name] != null) {
                deprecateSimple(
                    'defineLocaleOverride',
                    'use moment.updateLocale(localeName, config) to change ' +
                        'an existing locale. moment.defineLocale(localeName, ' +
                        'config) should only be used for creating a new locale ' +
                        'See http://momentjs.com/guides/#/warnings/define-locale/ for more info.'
                );
                parentConfig = locales[name]._config;
            } else if (config.parentLocale != null) {
                if (locales[config.parentLocale] != null) {
                    parentConfig = locales[config.parentLocale]._config;
                } else {
                    locale = loadLocale(config.parentLocale);
                    if (locale != null) {
                        parentConfig = locale._config;
                    } else {
                        if (!localeFamilies[config.parentLocale]) {
                            localeFamilies[config.parentLocale] = [];
                        }
                        localeFamilies[config.parentLocale].push({
                            name: name,
                            config: config,
                        });
                        return null;
                    }
                }
            }
            locales[name] = new Locale(mergeConfigs(parentConfig, config));

            if (localeFamilies[name]) {
                localeFamilies[name].forEach(function (x) {
                    defineLocale(x.name, x.config);
                });
            }

            // backwards compat for now: also set the locale
            // make sure we set the locale AFTER all child locales have been
            // created, so we won't end up with the child locale set.
            getSetGlobalLocale(name);

            return locales[name];
        } else {
            // useful for testing
            delete locales[name];
            return null;
        }
    }

    function updateLocale(name, config) {
        if (config != null) {
            var locale,
                tmpLocale,
                parentConfig = baseConfig;

            if (locales[name] != null && locales[name].parentLocale != null) {
                // Update existing child locale in-place to avoid memory-leaks
                locales[name].set(mergeConfigs(locales[name]._config, config));
            } else {
                // MERGE
                tmpLocale = loadLocale(name);
                if (tmpLocale != null) {
                    parentConfig = tmpLocale._config;
                }
                config = mergeConfigs(parentConfig, config);
                if (tmpLocale == null) {
                    // updateLocale is called for creating a new locale
                    // Set abbr so it will have a name (getters return
                    // undefined otherwise).
                    config.abbr = name;
                }
                locale = new Locale(config);
                locale.parentLocale = locales[name];
                locales[name] = locale;
            }

            // backwards compat for now: also set the locale
            getSetGlobalLocale(name);
        } else {
            // pass null for config to unupdate, useful for tests
            if (locales[name] != null) {
                if (locales[name].parentLocale != null) {
                    locales[name] = locales[name].parentLocale;
                    if (name === getSetGlobalLocale()) {
                        getSetGlobalLocale(name);
                    }
                } else if (locales[name] != null) {
                    delete locales[name];
                }
            }
        }
        return locales[name];
    }

    // returns locale data
    function getLocale(key) {
        var locale;

        if (key && key._locale && key._locale._abbr) {
            key = key._locale._abbr;
        }

        if (!key) {
            return globalLocale;
        }

        if (!isArray(key)) {
            //short-circuit everything else
            locale = loadLocale(key);
            if (locale) {
                return locale;
            }
            key = [key];
        }

        return chooseLocale(key);
    }

    function listLocales() {
        return keys(locales);
    }

    function checkOverflow(m) {
        var overflow,
            a = m._a;

        if (a && getParsingFlags(m).overflow === -2) {
            overflow =
                a[MONTH] < 0 || a[MONTH] > 11
                    ? MONTH
                    : a[DATE] < 1 || a[DATE] > daysInMonth(a[YEAR], a[MONTH])
                    ? DATE
                    : a[HOUR] < 0 ||
                      a[HOUR] > 24 ||
                      (a[HOUR] === 24 &&
                          (a[MINUTE] !== 0 ||
                              a[SECOND] !== 0 ||
                              a[MILLISECOND] !== 0))
                    ? HOUR
                    : a[MINUTE] < 0 || a[MINUTE] > 59
                    ? MINUTE
                    : a[SECOND] < 0 || a[SECOND] > 59
                    ? SECOND
                    : a[MILLISECOND] < 0 || a[MILLISECOND] > 999
                    ? MILLISECOND
                    : -1;

            if (
                getParsingFlags(m)._overflowDayOfYear &&
                (overflow < YEAR || overflow > DATE)
            ) {
                overflow = DATE;
            }
            if (getParsingFlags(m)._overflowWeeks && overflow === -1) {
                overflow = WEEK;
            }
            if (getParsingFlags(m)._overflowWeekday && overflow === -1) {
                overflow = WEEKDAY;
            }

            getParsingFlags(m).overflow = overflow;
        }

        return m;
    }

    // iso 8601 regex
    // 0000-00-00 0000-W00 or 0000-W00-0 + T + 00 or 00:00 or 00:00:00 or 00:00:00.000 + +00:00 or +0000 or +00)
    var extendedIsoRegex = /^\s*((?:[+-]\d{6}|\d{4})-(?:\d\d-\d\d|W\d\d-\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?::\d\d(?::\d\d(?:[.,]\d+)?)?)?)([+-]\d\d(?::?\d\d)?|\s*Z)?)?$/,
        basicIsoRegex = /^\s*((?:[+-]\d{6}|\d{4})(?:\d\d\d\d|W\d\d\d|W\d\d|\d\d\d|\d\d|))(?:(T| )(\d\d(?:\d\d(?:\d\d(?:[.,]\d+)?)?)?)([+-]\d\d(?::?\d\d)?|\s*Z)?)?$/,
        tzRegex = /Z|[+-]\d\d(?::?\d\d)?/,
        isoDates = [
            ['YYYYYY-MM-DD', /[+-]\d{6}-\d\d-\d\d/],
            ['YYYY-MM-DD', /\d{4}-\d\d-\d\d/],
            ['GGGG-[W]WW-E', /\d{4}-W\d\d-\d/],
            ['GGGG-[W]WW', /\d{4}-W\d\d/, false],
            ['YYYY-DDD', /\d{4}-\d{3}/],
            ['YYYY-MM', /\d{4}-\d\d/, false],
            ['YYYYYYMMDD', /[+-]\d{10}/],
            ['YYYYMMDD', /\d{8}/],
            ['GGGG[W]WWE', /\d{4}W\d{3}/],
            ['GGGG[W]WW', /\d{4}W\d{2}/, false],
            ['YYYYDDD', /\d{7}/],
            ['YYYYMM', /\d{6}/, false],
            ['YYYY', /\d{4}/, false],
        ],
        // iso time formats and regexes
        isoTimes = [
            ['HH:mm:ss.SSSS', /\d\d:\d\d:\d\d\.\d+/],
            ['HH:mm:ss,SSSS', /\d\d:\d\d:\d\d,\d+/],
            ['HH:mm:ss', /\d\d:\d\d:\d\d/],
            ['HH:mm', /\d\d:\d\d/],
            ['HHmmss.SSSS', /\d\d\d\d\d\d\.\d+/],
            ['HHmmss,SSSS', /\d\d\d\d\d\d,\d+/],
            ['HHmmss', /\d\d\d\d\d\d/],
            ['HHmm', /\d\d\d\d/],
            ['HH', /\d\d/],
        ],
        aspNetJsonRegex = /^\/?Date\((-?\d+)/i,
        // RFC 2822 regex: For details see https://tools.ietf.org/html/rfc2822#section-3.3
        rfc2822 = /^(?:(Mon|Tue|Wed|Thu|Fri|Sat|Sun),?\s)?(\d{1,2})\s(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s(\d{2,4})\s(\d\d):(\d\d)(?::(\d\d))?\s(?:(UT|GMT|[ECMP][SD]T)|([Zz])|([+-]\d{4}))$/,
        obsOffsets = {
            UT: 0,
            GMT: 0,
            EDT: -4 * 60,
            EST: -5 * 60,
            CDT: -5 * 60,
            CST: -6 * 60,
            MDT: -6 * 60,
            MST: -7 * 60,
            PDT: -7 * 60,
            PST: -8 * 60,
        };

    // date from iso format
    function configFromISO(config) {
        var i,
            l,
            string = config._i,
            match = extendedIsoRegex.exec(string) || basicIsoRegex.exec(string),
            allowTime,
            dateFormat,
            timeFormat,
            tzFormat;

        if (match) {
            getParsingFlags(config).iso = true;

            for (i = 0, l = isoDates.length; i < l; i++) {
                if (isoDates[i][1].exec(match[1])) {
                    dateFormat = isoDates[i][0];
                    allowTime = isoDates[i][2] !== false;
                    break;
                }
            }
            if (dateFormat == null) {
                config._isValid = false;
                return;
            }
            if (match[3]) {
                for (i = 0, l = isoTimes.length; i < l; i++) {
                    if (isoTimes[i][1].exec(match[3])) {
                        // match[2] should be 'T' or space
                        timeFormat = (match[2] || ' ') + isoTimes[i][0];
                        break;
                    }
                }
                if (timeFormat == null) {
                    config._isValid = false;
                    return;
                }
            }
            if (!allowTime && timeFormat != null) {
                config._isValid = false;
                return;
            }
            if (match[4]) {
                if (tzRegex.exec(match[4])) {
                    tzFormat = 'Z';
                } else {
                    config._isValid = false;
                    return;
                }
            }
            config._f = dateFormat + (timeFormat || '') + (tzFormat || '');
            configFromStringAndFormat(config);
        } else {
            config._isValid = false;
        }
    }

    function extractFromRFC2822Strings(
        yearStr,
        monthStr,
        dayStr,
        hourStr,
        minuteStr,
        secondStr
    ) {
        var result = [
            untruncateYear(yearStr),
            defaultLocaleMonthsShort.indexOf(monthStr),
            parseInt(dayStr, 10),
            parseInt(hourStr, 10),
            parseInt(minuteStr, 10),
        ];

        if (secondStr) {
            result.push(parseInt(secondStr, 10));
        }

        return result;
    }

    function untruncateYear(yearStr) {
        var year = parseInt(yearStr, 10);
        if (year <= 49) {
            return 2000 + year;
        } else if (year <= 999) {
            return 1900 + year;
        }
        return year;
    }

    function preprocessRFC2822(s) {
        // Remove comments and folding whitespace and replace multiple-spaces with a single space
        return s
            .replace(/\([^)]*\)|[\n\t]/g, ' ')
            .replace(/(\s\s+)/g, ' ')
            .replace(/^\s\s*/, '')
            .replace(/\s\s*$/, '');
    }

    function checkWeekday(weekdayStr, parsedInput, config) {
        if (weekdayStr) {
            // TODO: Replace the vanilla JS Date object with an independent day-of-week check.
            var weekdayProvided = defaultLocaleWeekdaysShort.indexOf(weekdayStr),
                weekdayActual = new Date(
                    parsedInput[0],
                    parsedInput[1],
                    parsedInput[2]
                ).getDay();
            if (weekdayProvided !== weekdayActual) {
                getParsingFlags(config).weekdayMismatch = true;
                config._isValid = false;
                return false;
            }
        }
        return true;
    }

    function calculateOffset(obsOffset, militaryOffset, numOffset) {
        if (obsOffset) {
            return obsOffsets[obsOffset];
        } else if (militaryOffset) {
            // the only allowed military tz is Z
            return 0;
        } else {
            var hm = parseInt(numOffset, 10),
                m = hm % 100,
                h = (hm - m) / 100;
            return h * 60 + m;
        }
    }

    // date and time from ref 2822 format
    function configFromRFC2822(config) {
        var match = rfc2822.exec(preprocessRFC2822(config._i)),
            parsedArray;
        if (match) {
            parsedArray = extractFromRFC2822Strings(
                match[4],
                match[3],
                match[2],
                match[5],
                match[6],
                match[7]
            );
            if (!checkWeekday(match[1], parsedArray, config)) {
                return;
            }

            config._a = parsedArray;
            config._tzm = calculateOffset(match[8], match[9], match[10]);

            config._d = createUTCDate.apply(null, config._a);
            config._d.setUTCMinutes(config._d.getUTCMinutes() - config._tzm);

            getParsingFlags(config).rfc2822 = true;
        } else {
            config._isValid = false;
        }
    }

    // date from 1) ASP.NET, 2) ISO, 3) RFC 2822 formats, or 4) optional fallback if parsing isn't strict
    function configFromString(config) {
        var matched = aspNetJsonRegex.exec(config._i);
        if (matched !== null) {
            config._d = new Date(+matched[1]);
            return;
        }

        configFromISO(config);
        if (config._isValid === false) {
            delete config._isValid;
        } else {
            return;
        }

        configFromRFC2822(config);
        if (config._isValid === false) {
            delete config._isValid;
        } else {
            return;
        }

        if (config._strict) {
            config._isValid = false;
        } else {
            // Final attempt, use Input Fallback
            hooks.createFromInputFallback(config);
        }
    }

    hooks.createFromInputFallback = deprecate(
        'value provided is not in a recognized RFC2822 or ISO format. moment construction falls back to js Date(), ' +
            'which is not reliable across all browsers and versions. Non RFC2822/ISO date formats are ' +
            'discouraged. Please refer to http://momentjs.com/guides/#/warnings/js-date/ for more info.',
        function (config) {
            config._d = new Date(config._i + (config._useUTC ? ' UTC' : ''));
        }
    );

    // Pick the first defined of two or three arguments.
    function defaults(a, b, c) {
        if (a != null) {
            return a;
        }
        if (b != null) {
            return b;
        }
        return c;
    }

    function currentDateArray(config) {
        // hooks is actually the exported moment object
        var nowValue = new Date(hooks.now());
        if (config._useUTC) {
            return [
                nowValue.getUTCFullYear(),
                nowValue.getUTCMonth(),
                nowValue.getUTCDate(),
            ];
        }
        return [nowValue.getFullYear(), nowValue.getMonth(), nowValue.getDate()];
    }

    // convert an array to a date.
    // the array should mirror the parameters below
    // note: all values past the year are optional and will default to the lowest possible value.
    // [year, month, day , hour, minute, second, millisecond]
    function configFromArray(config) {
        var i,
            date,
            input = [],
            currentDate,
            expectedWeekday,
            yearToUse;

        if (config._d) {
            return;
        }

        currentDate = currentDateArray(config);

        //compute day of the year from weeks and weekdays
        if (config._w && config._a[DATE] == null && config._a[MONTH] == null) {
            dayOfYearFromWeekInfo(config);
        }

        //if the day of the year is set, figure out what it is
        if (config._dayOfYear != null) {
            yearToUse = defaults(config._a[YEAR], currentDate[YEAR]);

            if (
                config._dayOfYear > daysInYear(yearToUse) ||
                config._dayOfYear === 0
            ) {
                getParsingFlags(config)._overflowDayOfYear = true;
            }

            date = createUTCDate(yearToUse, 0, config._dayOfYear);
            config._a[MONTH] = date.getUTCMonth();
            config._a[DATE] = date.getUTCDate();
        }

        // Default to current date.
        // * if no year, month, day of month are given, default to today
        // * if day of month is given, default month and year
        // * if month is given, default only year
        // * if year is given, don't default anything
        for (i = 0; i < 3 && config._a[i] == null; ++i) {
            config._a[i] = input[i] = currentDate[i];
        }

        // Zero out whatever was not defaulted, including time
        for (; i < 7; i++) {
            config._a[i] = input[i] =
                config._a[i] == null ? (i === 2 ? 1 : 0) : config._a[i];
        }

        // Check for 24:00:00.000
        if (
            config._a[HOUR] === 24 &&
            config._a[MINUTE] === 0 &&
            config._a[SECOND] === 0 &&
            config._a[MILLISECOND] === 0
        ) {
            config._nextDay = true;
            config._a[HOUR] = 0;
        }

        config._d = (config._useUTC ? createUTCDate : createDate).apply(
            null,
            input
        );
        expectedWeekday = config._useUTC
            ? config._d.getUTCDay()
            : config._d.getDay();

        // Apply timezone offset from input. The actual utcOffset can be changed
        // with parseZone.
        if (config._tzm != null) {
            config._d.setUTCMinutes(config._d.getUTCMinutes() - config._tzm);
        }

        if (config._nextDay) {
            config._a[HOUR] = 24;
        }

        // check for mismatching day of week
        if (
            config._w &&
            typeof config._w.d !== 'undefined' &&
            config._w.d !== expectedWeekday
        ) {
            getParsingFlags(config).weekdayMismatch = true;
        }
    }

    function dayOfYearFromWeekInfo(config) {
        var w, weekYear, week, weekday, dow, doy, temp, weekdayOverflow, curWeek;

        w = config._w;
        if (w.GG != null || w.W != null || w.E != null) {
            dow = 1;
            doy = 4;

            // TODO: We need to take the current isoWeekYear, but that depends on
            // how we interpret now (local, utc, fixed offset). So create
            // a now version of current config (take local/utc/offset flags, and
            // create now).
            weekYear = defaults(
                w.GG,
                config._a[YEAR],
                weekOfYear(createLocal(), 1, 4).year
            );
            week = defaults(w.W, 1);
            weekday = defaults(w.E, 1);
            if (weekday < 1 || weekday > 7) {
                weekdayOverflow = true;
            }
        } else {
            dow = config._locale._week.dow;
            doy = config._locale._week.doy;

            curWeek = weekOfYear(createLocal(), dow, doy);

            weekYear = defaults(w.gg, config._a[YEAR], curWeek.year);

            // Default to current week.
            week = defaults(w.w, curWeek.week);

            if (w.d != null) {
                // weekday -- low day numbers are considered next week
                weekday = w.d;
                if (weekday < 0 || weekday > 6) {
                    weekdayOverflow = true;
                }
            } else if (w.e != null) {
                // local weekday -- counting starts from beginning of week
                weekday = w.e + dow;
                if (w.e < 0 || w.e > 6) {
                    weekdayOverflow = true;
                }
            } else {
                // default to beginning of week
                weekday = dow;
            }
        }
        if (week < 1 || week > weeksInYear(weekYear, dow, doy)) {
            getParsingFlags(config)._overflowWeeks = true;
        } else if (weekdayOverflow != null) {
            getParsingFlags(config)._overflowWeekday = true;
        } else {
            temp = dayOfYearFromWeeks(weekYear, week, weekday, dow, doy);
            config._a[YEAR] = temp.year;
            config._dayOfYear = temp.dayOfYear;
        }
    }

    // constant that refers to the ISO standard
    hooks.ISO_8601 = function () {};

    // constant that refers to the RFC 2822 form
    hooks.RFC_2822 = function () {};

    // date from string and format string
    function configFromStringAndFormat(config) {
        // TODO: Move this to another part of the creation flow to prevent circular deps
        if (config._f === hooks.ISO_8601) {
            configFromISO(config);
            return;
        }
        if (config._f === hooks.RFC_2822) {
            configFromRFC2822(config);
            return;
        }
        config._a = [];
        getParsingFlags(config).empty = true;

        // This array is used to make a Date, either with `new Date` or `Date.UTC`
        var string = '' + config._i,
            i,
            parsedInput,
            tokens,
            token,
            skipped,
            stringLength = string.length,
            totalParsedInputLength = 0,
            era;

        tokens =
            expandFormat(config._f, config._locale).match(formattingTokens) || [];

        for (i = 0; i < tokens.length; i++) {
            token = tokens[i];
            parsedInput = (string.match(getParseRegexForToken(token, config)) ||
                [])[0];
            if (parsedInput) {
                skipped = string.substr(0, string.indexOf(parsedInput));
                if (skipped.length > 0) {
                    getParsingFlags(config).unusedInput.push(skipped);
                }
                string = string.slice(
                    string.indexOf(parsedInput) + parsedInput.length
                );
                totalParsedInputLength += parsedInput.length;
            }
            // don't parse if it's not a known token
            if (formatTokenFunctions[token]) {
                if (parsedInput) {
                    getParsingFlags(config).empty = false;
                } else {
                    getParsingFlags(config).unusedTokens.push(token);
                }
                addTimeToArrayFromToken(token, parsedInput, config);
            } else if (config._strict && !parsedInput) {
                getParsingFlags(config).unusedTokens.push(token);
            }
        }

        // add remaining unparsed input length to the string
        getParsingFlags(config).charsLeftOver =
            stringLength - totalParsedInputLength;
        if (string.length > 0) {
            getParsingFlags(config).unusedInput.push(string);
        }

        // clear _12h flag if hour is <= 12
        if (
            config._a[HOUR] <= 12 &&
            getParsingFlags(config).bigHour === true &&
            config._a[HOUR] > 0
        ) {
            getParsingFlags(config).bigHour = undefined;
        }

        getParsingFlags(config).parsedDateParts = config._a.slice(0);
        getParsingFlags(config).meridiem = config._meridiem;
        // handle meridiem
        config._a[HOUR] = meridiemFixWrap(
            config._locale,
            config._a[HOUR],
            config._meridiem
        );

        // handle era
        era = getParsingFlags(config).era;
        if (era !== null) {
            config._a[YEAR] = config._locale.erasConvertYear(era, config._a[YEAR]);
        }

        configFromArray(config);
        checkOverflow(config);
    }

    function meridiemFixWrap(locale, hour, meridiem) {
        var isPm;

        if (meridiem == null) {
            // nothing to do
            return hour;
        }
        if (locale.meridiemHour != null) {
            return locale.meridiemHour(hour, meridiem);
        } else if (locale.isPM != null) {
            // Fallback
            isPm = locale.isPM(meridiem);
            if (isPm && hour < 12) {
                hour += 12;
            }
            if (!isPm && hour === 12) {
                hour = 0;
            }
            return hour;
        } else {
            // this is not supposed to happen
            return hour;
        }
    }

    // date from string and array of format strings
    function configFromStringAndArray(config) {
        var tempConfig,
            bestMoment,
            scoreToBeat,
            i,
            currentScore,
            validFormatFound,
            bestFormatIsValid = false;

        if (config._f.length === 0) {
            getParsingFlags(config).invalidFormat = true;
            config._d = new Date(NaN);
            return;
        }

        for (i = 0; i < config._f.length; i++) {
            currentScore = 0;
            validFormatFound = false;
            tempConfig = copyConfig({}, config);
            if (config._useUTC != null) {
                tempConfig._useUTC = config._useUTC;
            }
            tempConfig._f = config._f[i];
            configFromStringAndFormat(tempConfig);

            if (isValid(tempConfig)) {
                validFormatFound = true;
            }

            // if there is any input that was not parsed add a penalty for that format
            currentScore += getParsingFlags(tempConfig).charsLeftOver;

            //or tokens
            currentScore += getParsingFlags(tempConfig).unusedTokens.length * 10;

            getParsingFlags(tempConfig).score = currentScore;

            if (!bestFormatIsValid) {
                if (
                    scoreToBeat == null ||
                    currentScore < scoreToBeat ||
                    validFormatFound
                ) {
                    scoreToBeat = currentScore;
                    bestMoment = tempConfig;
                    if (validFormatFound) {
                        bestFormatIsValid = true;
                    }
                }
            } else {
                if (currentScore < scoreToBeat) {
                    scoreToBeat = currentScore;
                    bestMoment = tempConfig;
                }
            }
        }

        extend(config, bestMoment || tempConfig);
    }

    function configFromObject(config) {
        if (config._d) {
            return;
        }

        var i = normalizeObjectUnits(config._i),
            dayOrDate = i.day === undefined ? i.date : i.day;
        config._a = map(
            [i.year, i.month, dayOrDate, i.hour, i.minute, i.second, i.millisecond],
            function (obj) {
                return obj && parseInt(obj, 10);
            }
        );

        configFromArray(config);
    }

    function createFromConfig(config) {
        var res = new Moment(checkOverflow(prepareConfig(config)));
        if (res._nextDay) {
            // Adding is smart enough around DST
            res.add(1, 'd');
            res._nextDay = undefined;
        }

        return res;
    }

    function prepareConfig(config) {
        var input = config._i,
            format = config._f;

        config._locale = config._locale || getLocale(config._l);

        if (input === null || (format === undefined && input === '')) {
            return createInvalid({ nullInput: true });
        }

        if (typeof input === 'string') {
            config._i = input = config._locale.preparse(input);
        }

        if (isMoment(input)) {
            return new Moment(checkOverflow(input));
        } else if (isDate(input)) {
            config._d = input;
        } else if (isArray(format)) {
            configFromStringAndArray(config);
        } else if (format) {
            configFromStringAndFormat(config);
        } else {
            configFromInput(config);
        }

        if (!isValid(config)) {
            config._d = null;
        }

        return config;
    }

    function configFromInput(config) {
        var input = config._i;
        if (isUndefined(input)) {
            config._d = new Date(hooks.now());
        } else if (isDate(input)) {
            config._d = new Date(input.valueOf());
        } else if (typeof input === 'string') {
            configFromString(config);
        } else if (isArray(input)) {
            config._a = map(input.slice(0), function (obj) {
                return parseInt(obj, 10);
            });
            configFromArray(config);
        } else if (isObject(input)) {
            configFromObject(config);
        } else if (isNumber(input)) {
            // from milliseconds
            config._d = new Date(input);
        } else {
            hooks.createFromInputFallback(config);
        }
    }

    function createLocalOrUTC(input, format, locale, strict, isUTC) {
        var c = {};

        if (format === true || format === false) {
            strict = format;
            format = undefined;
        }

        if (locale === true || locale === false) {
            strict = locale;
            locale = undefined;
        }

        if (
            (isObject(input) && isObjectEmpty(input)) ||
            (isArray(input) && input.length === 0)
        ) {
            input = undefined;
        }
        // object construction must be done this way.
        // https://github.com/moment/moment/issues/1423
        c._isAMomentObject = true;
        c._useUTC = c._isUTC = isUTC;
        c._l = locale;
        c._i = input;
        c._f = format;
        c._strict = strict;

        return createFromConfig(c);
    }

    function createLocal(input, format, locale, strict) {
        return createLocalOrUTC(input, format, locale, strict, false);
    }

    var prototypeMin = deprecate(
            'moment().min is deprecated, use moment.max instead. http://momentjs.com/guides/#/warnings/min-max/',
            function () {
                var other = createLocal.apply(null, arguments);
                if (this.isValid() && other.isValid()) {
                    return other < this ? this : other;
                } else {
                    return createInvalid();
                }
            }
        ),
        prototypeMax = deprecate(
            'moment().max is deprecated, use moment.min instead. http://momentjs.com/guides/#/warnings/min-max/',
            function () {
                var other = createLocal.apply(null, arguments);
                if (this.isValid() && other.isValid()) {
                    return other > this ? this : other;
                } else {
                    return createInvalid();
                }
            }
        );

    // Pick a moment m from moments so that m[fn](other) is true for all
    // other. This relies on the function fn to be transitive.
    //
    // moments should either be an array of moment objects or an array, whose
    // first element is an array of moment objects.
    function pickBy(fn, moments) {
        var res, i;
        if (moments.length === 1 && isArray(moments[0])) {
            moments = moments[0];
        }
        if (!moments.length) {
            return createLocal();
        }
        res = moments[0];
        for (i = 1; i < moments.length; ++i) {
            if (!moments[i].isValid() || moments[i][fn](res)) {
                res = moments[i];
            }
        }
        return res;
    }

    // TODO: Use [].sort instead?
    function min() {
        var args = [].slice.call(arguments, 0);

        return pickBy('isBefore', args);
    }

    function max() {
        var args = [].slice.call(arguments, 0);

        return pickBy('isAfter', args);
    }

    var now = function () {
        return Date.now ? Date.now() : +new Date();
    };

    var ordering = [
        'year',
        'quarter',
        'month',
        'week',
        'day',
        'hour',
        'minute',
        'second',
        'millisecond',
    ];

    function isDurationValid(m) {
        var key,
            unitHasDecimal = false,
            i;
        for (key in m) {
            if (
                hasOwnProp(m, key) &&
                !(
                    indexOf.call(ordering, key) !== -1 &&
                    (m[key] == null || !isNaN(m[key]))
                )
            ) {
                return false;
            }
        }

        for (i = 0; i < ordering.length; ++i) {
            if (m[ordering[i]]) {
                if (unitHasDecimal) {
                    return false; // only allow non-integers for smallest unit
                }
                if (parseFloat(m[ordering[i]]) !== toInt(m[ordering[i]])) {
                    unitHasDecimal = true;
                }
            }
        }

        return true;
    }

    function isValid$1() {
        return this._isValid;
    }

    function createInvalid$1() {
        return createDuration(NaN);
    }

    function Duration(duration) {
        var normalizedInput = normalizeObjectUnits(duration),
            years = normalizedInput.year || 0,
            quarters = normalizedInput.quarter || 0,
            months = normalizedInput.month || 0,
            weeks = normalizedInput.week || normalizedInput.isoWeek || 0,
            days = normalizedInput.day || 0,
            hours = normalizedInput.hour || 0,
            minutes = normalizedInput.minute || 0,
            seconds = normalizedInput.second || 0,
            milliseconds = normalizedInput.millisecond || 0;

        this._isValid = isDurationValid(normalizedInput);

        // representation for dateAddRemove
        this._milliseconds =
            +milliseconds +
            seconds * 1e3 + // 1000
            minutes * 6e4 + // 1000 * 60
            hours * 1000 * 60 * 60; //using 1000 * 60 * 60 instead of 36e5 to avoid floating point rounding errors https://github.com/moment/moment/issues/2978
        // Because of dateAddRemove treats 24 hours as different from a
        // day when working around DST, we need to store them separately
        this._days = +days + weeks * 7;
        // It is impossible to translate months into days without knowing
        // which months you are are talking about, so we have to store
        // it separately.
        this._months = +months + quarters * 3 + years * 12;

        this._data = {};

        this._locale = getLocale();

        this._bubble();
    }

    function isDuration(obj) {
        return obj instanceof Duration;
    }

    function absRound(number) {
        if (number < 0) {
            return Math.round(-1 * number) * -1;
        } else {
            return Math.round(number);
        }
    }

    // compare two arrays, return the number of differences
    function compareArrays(array1, array2, dontConvert) {
        var len = Math.min(array1.length, array2.length),
            lengthDiff = Math.abs(array1.length - array2.length),
            diffs = 0,
            i;
        for (i = 0; i < len; i++) {
            if (
                (dontConvert && array1[i] !== array2[i]) ||
                (!dontConvert && toInt(array1[i]) !== toInt(array2[i]))
            ) {
                diffs++;
            }
        }
        return diffs + lengthDiff;
    }

    // FORMATTING

    function offset(token, separator) {
        addFormatToken(token, 0, 0, function () {
            var offset = this.utcOffset(),
                sign = '+';
            if (offset < 0) {
                offset = -offset;
                sign = '-';
            }
            return (
                sign +
                zeroFill(~~(offset / 60), 2) +
                separator +
                zeroFill(~~offset % 60, 2)
            );
        });
    }

    offset('Z', ':');
    offset('ZZ', '');

    // PARSING

    addRegexToken('Z', matchShortOffset);
    addRegexToken('ZZ', matchShortOffset);
    addParseToken(['Z', 'ZZ'], function (input, array, config) {
        config._useUTC = true;
        config._tzm = offsetFromString(matchShortOffset, input);
    });

    // HELPERS

    // timezone chunker
    // '+10:00' > ['10',  '00']
    // '-1530'  > ['-15', '30']
    var chunkOffset = /([\+\-]|\d\d)/gi;

    function offsetFromString(matcher, string) {
        var matches = (string || '').match(matcher),
            chunk,
            parts,
            minutes;

        if (matches === null) {
            return null;
        }

        chunk = matches[matches.length - 1] || [];
        parts = (chunk + '').match(chunkOffset) || ['-', 0, 0];
        minutes = +(parts[1] * 60) + toInt(parts[2]);

        return minutes === 0 ? 0 : parts[0] === '+' ? minutes : -minutes;
    }

    // Return a moment from input, that is local/utc/zone equivalent to model.
    function cloneWithOffset(input, model) {
        var res, diff;
        if (model._isUTC) {
            res = model.clone();
            diff =
                (isMoment(input) || isDate(input)
                    ? input.valueOf()
                    : createLocal(input).valueOf()) - res.valueOf();
            // Use low-level api, because this fn is low-level api.
            res._d.setTime(res._d.valueOf() + diff);
            hooks.updateOffset(res, false);
            return res;
        } else {
            return createLocal(input).local();
        }
    }

    function getDateOffset(m) {
        // On Firefox.24 Date#getTimezoneOffset returns a floating point.
        // https://github.com/moment/moment/pull/1871
        return -Math.round(m._d.getTimezoneOffset());
    }

    // HOOKS

    // This function will be called whenever a moment is mutated.
    // It is intended to keep the offset in sync with the timezone.
    hooks.updateOffset = function () {};

    // MOMENTS

    // keepLocalTime = true means only change the timezone, without
    // affecting the local hour. So 5:31:26 +0300 --[utcOffset(2, true)]-->
    // 5:31:26 +0200 It is possible that 5:31:26 doesn't exist with offset
    // +0200, so we adjust the time as needed, to be valid.
    //
    // Keeping the time actually adds/subtracts (one hour)
    // from the actual represented time. That is why we call updateOffset
    // a second time. In case it wants us to change the offset again
    // _changeInProgress == true case, then we have to adjust, because
    // there is no such time in the given timezone.
    function getSetOffset(input, keepLocalTime, keepMinutes) {
        var offset = this._offset || 0,
            localAdjust;
        if (!this.isValid()) {
            return input != null ? this : NaN;
        }
        if (input != null) {
            if (typeof input === 'string') {
                input = offsetFromString(matchShortOffset, input);
                if (input === null) {
                    return this;
                }
            } else if (Math.abs(input) < 16 && !keepMinutes) {
                input = input * 60;
            }
            if (!this._isUTC && keepLocalTime) {
                localAdjust = getDateOffset(this);
            }
            this._offset = input;
            this._isUTC = true;
            if (localAdjust != null) {
                this.add(localAdjust, 'm');
            }
            if (offset !== input) {
                if (!keepLocalTime || this._changeInProgress) {
                    addSubtract(
                        this,
                        createDuration(input - offset, 'm'),
                        1,
                        false
                    );
                } else if (!this._changeInProgress) {
                    this._changeInProgress = true;
                    hooks.updateOffset(this, true);
                    this._changeInProgress = null;
                }
            }
            return this;
        } else {
            return this._isUTC ? offset : getDateOffset(this);
        }
    }

    function getSetZone(input, keepLocalTime) {
        if (input != null) {
            if (typeof input !== 'string') {
                input = -input;
            }

            this.utcOffset(input, keepLocalTime);

            return this;
        } else {
            return -this.utcOffset();
        }
    }

    function setOffsetToUTC(keepLocalTime) {
        return this.utcOffset(0, keepLocalTime);
    }

    function setOffsetToLocal(keepLocalTime) {
        if (this._isUTC) {
            this.utcOffset(0, keepLocalTime);
            this._isUTC = false;

            if (keepLocalTime) {
                this.subtract(getDateOffset(this), 'm');
            }
        }
        return this;
    }

    function setOffsetToParsedOffset() {
        if (this._tzm != null) {
            this.utcOffset(this._tzm, false, true);
        } else if (typeof this._i === 'string') {
            var tZone = offsetFromString(matchOffset, this._i);
            if (tZone != null) {
                this.utcOffset(tZone);
            } else {
                this.utcOffset(0, true);
            }
        }
        return this;
    }

    function hasAlignedHourOffset(input) {
        if (!this.isValid()) {
            return false;
        }
        input = input ? createLocal(input).utcOffset() : 0;

        return (this.utcOffset() - input) % 60 === 0;
    }

    function isDaylightSavingTime() {
        return (
            this.utcOffset() > this.clone().month(0).utcOffset() ||
            this.utcOffset() > this.clone().month(5).utcOffset()
        );
    }

    function isDaylightSavingTimeShifted() {
        if (!isUndefined(this._isDSTShifted)) {
            return this._isDSTShifted;
        }

        var c = {},
            other;

        copyConfig(c, this);
        c = prepareConfig(c);

        if (c._a) {
            other = c._isUTC ? createUTC(c._a) : createLocal(c._a);
            this._isDSTShifted =
                this.isValid() && compareArrays(c._a, other.toArray()) > 0;
        } else {
            this._isDSTShifted = false;
        }

        return this._isDSTShifted;
    }

    function isLocal() {
        return this.isValid() ? !this._isUTC : false;
    }

    function isUtcOffset() {
        return this.isValid() ? this._isUTC : false;
    }

    function isUtc() {
        return this.isValid() ? this._isUTC && this._offset === 0 : false;
    }

    // ASP.NET json date format regex
    var aspNetRegex = /^(-|\+)?(?:(\d*)[. ])?(\d+):(\d+)(?::(\d+)(\.\d*)?)?$/,
        // from http://docs.closure-library.googlecode.com/git/closure_goog_date_date.js.source.html
        // somewhat more in line with 4.4.3.2 2004 spec, but allows decimal anywhere
        // and further modified to allow for strings containing both week and day
        isoRegex = /^(-|\+)?P(?:([-+]?[0-9,.]*)Y)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)W)?(?:([-+]?[0-9,.]*)D)?(?:T(?:([-+]?[0-9,.]*)H)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)S)?)?$/;

    function createDuration(input, key) {
        var duration = input,
            // matching against regexp is expensive, do it on demand
            match = null,
            sign,
            ret,
            diffRes;

        if (isDuration(input)) {
            duration = {
                ms: input._milliseconds,
                d: input._days,
                M: input._months,
            };
        } else if (isNumber(input) || !isNaN(+input)) {
            duration = {};
            if (key) {
                duration[key] = +input;
            } else {
                duration.milliseconds = +input;
            }
        } else if ((match = aspNetRegex.exec(input))) {
            sign = match[1] === '-' ? -1 : 1;
            duration = {
                y: 0,
                d: toInt(match[DATE]) * sign,
                h: toInt(match[HOUR]) * sign,
                m: toInt(match[MINUTE]) * sign,
                s: toInt(match[SECOND]) * sign,
                ms: toInt(absRound(match[MILLISECOND] * 1000)) * sign, // the millisecond decimal point is included in the match
            };
        } else if ((match = isoRegex.exec(input))) {
            sign = match[1] === '-' ? -1 : 1;
            duration = {
                y: parseIso(match[2], sign),
                M: parseIso(match[3], sign),
                w: parseIso(match[4], sign),
                d: parseIso(match[5], sign),
                h: parseIso(match[6], sign),
                m: parseIso(match[7], sign),
                s: parseIso(match[8], sign),
            };
        } else if (duration == null) {
            // checks for null or undefined
            duration = {};
        } else if (
            typeof duration === 'object' &&
            ('from' in duration || 'to' in duration)
        ) {
            diffRes = momentsDifference(
                createLocal(duration.from),
                createLocal(duration.to)
            );

            duration = {};
            duration.ms = diffRes.milliseconds;
            duration.M = diffRes.months;
        }

        ret = new Duration(duration);

        if (isDuration(input) && hasOwnProp(input, '_locale')) {
            ret._locale = input._locale;
        }

        if (isDuration(input) && hasOwnProp(input, '_isValid')) {
            ret._isValid = input._isValid;
        }

        return ret;
    }

    createDuration.fn = Duration.prototype;
    createDuration.invalid = createInvalid$1;

    function parseIso(inp, sign) {
        // We'd normally use ~~inp for this, but unfortunately it also
        // converts floats to ints.
        // inp may be undefined, so careful calling replace on it.
        var res = inp && parseFloat(inp.replace(',', '.'));
        // apply sign while we're at it
        return (isNaN(res) ? 0 : res) * sign;
    }

    function positiveMomentsDifference(base, other) {
        var res = {};

        res.months =
            other.month() - base.month() + (other.year() - base.year()) * 12;
        if (base.clone().add(res.months, 'M').isAfter(other)) {
            --res.months;
        }

        res.milliseconds = +other - +base.clone().add(res.months, 'M');

        return res;
    }

    function momentsDifference(base, other) {
        var res;
        if (!(base.isValid() && other.isValid())) {
            return { milliseconds: 0, months: 0 };
        }

        other = cloneWithOffset(other, base);
        if (base.isBefore(other)) {
            res = positiveMomentsDifference(base, other);
        } else {
            res = positiveMomentsDifference(other, base);
            res.milliseconds = -res.milliseconds;
            res.months = -res.months;
        }

        return res;
    }

    // TODO: remove 'name' arg after deprecation is removed
    function createAdder(direction, name) {
        return function (val, period) {
            var dur, tmp;
            //invert the arguments, but complain about it
            if (period !== null && !isNaN(+period)) {
                deprecateSimple(
                    name,
                    'moment().' +
                        name +
                        '(period, number) is deprecated. Please use moment().' +
                        name +
                        '(number, period). ' +
                        'See http://momentjs.com/guides/#/warnings/add-inverted-param/ for more info.'
                );
                tmp = val;
                val = period;
                period = tmp;
            }

            dur = createDuration(val, period);
            addSubtract(this, dur, direction);
            return this;
        };
    }

    function addSubtract(mom, duration, isAdding, updateOffset) {
        var milliseconds = duration._milliseconds,
            days = absRound(duration._days),
            months = absRound(duration._months);

        if (!mom.isValid()) {
            // No op
            return;
        }

        updateOffset = updateOffset == null ? true : updateOffset;

        if (months) {
            setMonth(mom, get(mom, 'Month') + months * isAdding);
        }
        if (days) {
            set$1(mom, 'Date', get(mom, 'Date') + days * isAdding);
        }
        if (milliseconds) {
            mom._d.setTime(mom._d.valueOf() + milliseconds * isAdding);
        }
        if (updateOffset) {
            hooks.updateOffset(mom, days || months);
        }
    }

    var add = createAdder(1, 'add'),
        subtract = createAdder(-1, 'subtract');

    function isString(input) {
        return typeof input === 'string' || input instanceof String;
    }

    // type MomentInput = Moment | Date | string | number | (number | string)[] | MomentInputObject | void; // null | undefined
    function isMomentInput(input) {
        return (
            isMoment(input) ||
            isDate(input) ||
            isString(input) ||
            isNumber(input) ||
            isNumberOrStringArray(input) ||
            isMomentInputObject(input) ||
            input === null ||
            input === undefined
        );
    }

    function isMomentInputObject(input) {
        var objectTest = isObject(input) && !isObjectEmpty(input),
            propertyTest = false,
            properties = [
                'years',
                'year',
                'y',
                'months',
                'month',
                'M',
                'days',
                'day',
                'd',
                'dates',
                'date',
                'D',
                'hours',
                'hour',
                'h',
                'minutes',
                'minute',
                'm',
                'seconds',
                'second',
                's',
                'milliseconds',
                'millisecond',
                'ms',
            ],
            i,
            property;

        for (i = 0; i < properties.length; i += 1) {
            property = properties[i];
            propertyTest = propertyTest || hasOwnProp(input, property);
        }

        return objectTest && propertyTest;
    }

    function isNumberOrStringArray(input) {
        var arrayTest = isArray(input),
            dataTypeTest = false;
        if (arrayTest) {
            dataTypeTest =
                input.filter(function (item) {
                    return !isNumber(item) && isString(input);
                }).length === 0;
        }
        return arrayTest && dataTypeTest;
    }

    function isCalendarSpec(input) {
        var objectTest = isObject(input) && !isObjectEmpty(input),
            propertyTest = false,
            properties = [
                'sameDay',
                'nextDay',
                'lastDay',
                'nextWeek',
                'lastWeek',
                'sameElse',
            ],
            i,
            property;

        for (i = 0; i < properties.length; i += 1) {
            property = properties[i];
            propertyTest = propertyTest || hasOwnProp(input, property);
        }

        return objectTest && propertyTest;
    }

    function getCalendarFormat(myMoment, now) {
        var diff = myMoment.diff(now, 'days', true);
        return diff < -6
            ? 'sameElse'
            : diff < -1
            ? 'lastWeek'
            : diff < 0
            ? 'lastDay'
            : diff < 1
            ? 'sameDay'
            : diff < 2
            ? 'nextDay'
            : diff < 7
            ? 'nextWeek'
            : 'sameElse';
    }

    function calendar$1(time, formats) {
        // Support for single parameter, formats only overload to the calendar function
        if (arguments.length === 1) {
            if (!arguments[0]) {
                time = undefined;
                formats = undefined;
            } else if (isMomentInput(arguments[0])) {
                time = arguments[0];
                formats = undefined;
            } else if (isCalendarSpec(arguments[0])) {
                formats = arguments[0];
                time = undefined;
            }
        }
        // We want to compare the start of today, vs this.
        // Getting start-of-today depends on whether we're local/utc/offset or not.
        var now = time || createLocal(),
            sod = cloneWithOffset(now, this).startOf('day'),
            format = hooks.calendarFormat(this, sod) || 'sameElse',
            output =
                formats &&
                (isFunction(formats[format])
                    ? formats[format].call(this, now)
                    : formats[format]);

        return this.format(
            output || this.localeData().calendar(format, this, createLocal(now))
        );
    }

    function clone() {
        return new Moment(this);
    }

    function isAfter(input, units) {
        var localInput = isMoment(input) ? input : createLocal(input);
        if (!(this.isValid() && localInput.isValid())) {
            return false;
        }
        units = normalizeUnits(units) || 'millisecond';
        if (units === 'millisecond') {
            return this.valueOf() > localInput.valueOf();
        } else {
            return localInput.valueOf() < this.clone().startOf(units).valueOf();
        }
    }

    function isBefore(input, units) {
        var localInput = isMoment(input) ? input : createLocal(input);
        if (!(this.isValid() && localInput.isValid())) {
            return false;
        }
        units = normalizeUnits(units) || 'millisecond';
        if (units === 'millisecond') {
            return this.valueOf() < localInput.valueOf();
        } else {
            return this.clone().endOf(units).valueOf() < localInput.valueOf();
        }
    }

    function isBetween(from, to, units, inclusivity) {
        var localFrom = isMoment(from) ? from : createLocal(from),
            localTo = isMoment(to) ? to : createLocal(to);
        if (!(this.isValid() && localFrom.isValid() && localTo.isValid())) {
            return false;
        }
        inclusivity = inclusivity || '()';
        return (
            (inclusivity[0] === '('
                ? this.isAfter(localFrom, units)
                : !this.isBefore(localFrom, units)) &&
            (inclusivity[1] === ')'
                ? this.isBefore(localTo, units)
                : !this.isAfter(localTo, units))
        );
    }

    function isSame(input, units) {
        var localInput = isMoment(input) ? input : createLocal(input),
            inputMs;
        if (!(this.isValid() && localInput.isValid())) {
            return false;
        }
        units = normalizeUnits(units) || 'millisecond';
        if (units === 'millisecond') {
            return this.valueOf() === localInput.valueOf();
        } else {
            inputMs = localInput.valueOf();
            return (
                this.clone().startOf(units).valueOf() <= inputMs &&
                inputMs <= this.clone().endOf(units).valueOf()
            );
        }
    }

    function isSameOrAfter(input, units) {
        return this.isSame(input, units) || this.isAfter(input, units);
    }

    function isSameOrBefore(input, units) {
        return this.isSame(input, units) || this.isBefore(input, units);
    }

    function diff(input, units, asFloat) {
        var that, zoneDelta, output;

        if (!this.isValid()) {
            return NaN;
        }

        that = cloneWithOffset(input, this);

        if (!that.isValid()) {
            return NaN;
        }

        zoneDelta = (that.utcOffset() - this.utcOffset()) * 6e4;

        units = normalizeUnits(units);

        switch (units) {
            case 'year':
                output = monthDiff(this, that) / 12;
                break;
            case 'month':
                output = monthDiff(this, that);
                break;
            case 'quarter':
                output = monthDiff(this, that) / 3;
                break;
            case 'second':
                output = (this - that) / 1e3;
                break; // 1000
            case 'minute':
                output = (this - that) / 6e4;
                break; // 1000 * 60
            case 'hour':
                output = (this - that) / 36e5;
                break; // 1000 * 60 * 60
            case 'day':
                output = (this - that - zoneDelta) / 864e5;
                break; // 1000 * 60 * 60 * 24, negate dst
            case 'week':
                output = (this - that - zoneDelta) / 6048e5;
                break; // 1000 * 60 * 60 * 24 * 7, negate dst
            default:
                output = this - that;
        }

        return asFloat ? output : absFloor(output);
    }

    function monthDiff(a, b) {
        if (a.date() < b.date()) {
            // end-of-month calculations work correct when the start month has more
            // days than the end month.
            return -monthDiff(b, a);
        }
        // difference in months
        var wholeMonthDiff = (b.year() - a.year()) * 12 + (b.month() - a.month()),
            // b is in (anchor - 1 month, anchor + 1 month)
            anchor = a.clone().add(wholeMonthDiff, 'months'),
            anchor2,
            adjust;

        if (b - anchor < 0) {
            anchor2 = a.clone().add(wholeMonthDiff - 1, 'months');
            // linear across the month
            adjust = (b - anchor) / (anchor - anchor2);
        } else {
            anchor2 = a.clone().add(wholeMonthDiff + 1, 'months');
            // linear across the month
            adjust = (b - anchor) / (anchor2 - anchor);
        }

        //check for negative zero, return zero if negative zero
        return -(wholeMonthDiff + adjust) || 0;
    }

    hooks.defaultFormat = 'YYYY-MM-DDTHH:mm:ssZ';
    hooks.defaultFormatUtc = 'YYYY-MM-DDTHH:mm:ss[Z]';

    function toString() {
        return this.clone().locale('en').format('ddd MMM DD YYYY HH:mm:ss [GMT]ZZ');
    }

    function toISOString(keepOffset) {
        if (!this.isValid()) {
            return null;
        }
        var utc = keepOffset !== true,
            m = utc ? this.clone().utc() : this;
        if (m.year() < 0 || m.year() > 9999) {
            return formatMoment(
                m,
                utc
                    ? 'YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]'
                    : 'YYYYYY-MM-DD[T]HH:mm:ss.SSSZ'
            );
        }
        if (isFunction(Date.prototype.toISOString)) {
            // native implementation is ~50x faster, use it when we can
            if (utc) {
                return this.toDate().toISOString();
            } else {
                return new Date(this.valueOf() + this.utcOffset() * 60 * 1000)
                    .toISOString()
                    .replace('Z', formatMoment(m, 'Z'));
            }
        }
        return formatMoment(
            m,
            utc ? 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]' : 'YYYY-MM-DD[T]HH:mm:ss.SSSZ'
        );
    }

    /**
     * Return a human readable representation of a moment that can
     * also be evaluated to get a new moment which is the same
     *
     * @link https://nodejs.org/dist/latest/docs/api/util.html#util_custom_inspect_function_on_objects
     */
    function inspect() {
        if (!this.isValid()) {
            return 'moment.invalid(/* ' + this._i + ' */)';
        }
        var func = 'moment',
            zone = '',
            prefix,
            year,
            datetime,
            suffix;
        if (!this.isLocal()) {
            func = this.utcOffset() === 0 ? 'moment.utc' : 'moment.parseZone';
            zone = 'Z';
        }
        prefix = '[' + func + '("]';
        year = 0 <= this.year() && this.year() <= 9999 ? 'YYYY' : 'YYYYYY';
        datetime = '-MM-DD[T]HH:mm:ss.SSS';
        suffix = zone + '[")]';

        return this.format(prefix + year + datetime + suffix);
    }

    function format(inputString) {
        if (!inputString) {
            inputString = this.isUtc()
                ? hooks.defaultFormatUtc
                : hooks.defaultFormat;
        }
        var output = formatMoment(this, inputString);
        return this.localeData().postformat(output);
    }

    function from(time, withoutSuffix) {
        if (
            this.isValid() &&
            ((isMoment(time) && time.isValid()) || createLocal(time).isValid())
        ) {
            return createDuration({ to: this, from: time })
                .locale(this.locale())
                .humanize(!withoutSuffix);
        } else {
            return this.localeData().invalidDate();
        }
    }

    function fromNow(withoutSuffix) {
        return this.from(createLocal(), withoutSuffix);
    }

    function to(time, withoutSuffix) {
        if (
            this.isValid() &&
            ((isMoment(time) && time.isValid()) || createLocal(time).isValid())
        ) {
            return createDuration({ from: this, to: time })
                .locale(this.locale())
                .humanize(!withoutSuffix);
        } else {
            return this.localeData().invalidDate();
        }
    }

    function toNow(withoutSuffix) {
        return this.to(createLocal(), withoutSuffix);
    }

    // If passed a locale key, it will set the locale for this
    // instance.  Otherwise, it will return the locale configuration
    // variables for this instance.
    function locale(key) {
        var newLocaleData;

        if (key === undefined) {
            return this._locale._abbr;
        } else {
            newLocaleData = getLocale(key);
            if (newLocaleData != null) {
                this._locale = newLocaleData;
            }
            return this;
        }
    }

    var lang = deprecate(
        'moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.',
        function (key) {
            if (key === undefined) {
                return this.localeData();
            } else {
                return this.locale(key);
            }
        }
    );

    function localeData() {
        return this._locale;
    }

    var MS_PER_SECOND = 1000,
        MS_PER_MINUTE = 60 * MS_PER_SECOND,
        MS_PER_HOUR = 60 * MS_PER_MINUTE,
        MS_PER_400_YEARS = (365 * 400 + 97) * 24 * MS_PER_HOUR;

    // actual modulo - handles negative numbers (for dates before 1970):
    function mod$1(dividend, divisor) {
        return ((dividend % divisor) + divisor) % divisor;
    }

    function localStartOfDate(y, m, d) {
        // the date constructor remaps years 0-99 to 1900-1999
        if (y < 100 && y >= 0) {
            // preserve leap years using a full 400 year cycle, then reset
            return new Date(y + 400, m, d) - MS_PER_400_YEARS;
        } else {
            return new Date(y, m, d).valueOf();
        }
    }

    function utcStartOfDate(y, m, d) {
        // Date.UTC remaps years 0-99 to 1900-1999
        if (y < 100 && y >= 0) {
            // preserve leap years using a full 400 year cycle, then reset
            return Date.UTC(y + 400, m, d) - MS_PER_400_YEARS;
        } else {
            return Date.UTC(y, m, d);
        }
    }

    function startOf(units) {
        var time, startOfDate;
        units = normalizeUnits(units);
        if (units === undefined || units === 'millisecond' || !this.isValid()) {
            return this;
        }

        startOfDate = this._isUTC ? utcStartOfDate : localStartOfDate;

        switch (units) {
            case 'year':
                time = startOfDate(this.year(), 0, 1);
                break;
            case 'quarter':
                time = startOfDate(
                    this.year(),
                    this.month() - (this.month() % 3),
                    1
                );
                break;
            case 'month':
                time = startOfDate(this.year(), this.month(), 1);
                break;
            case 'week':
                time = startOfDate(
                    this.year(),
                    this.month(),
                    this.date() - this.weekday()
                );
                break;
            case 'isoWeek':
                time = startOfDate(
                    this.year(),
                    this.month(),
                    this.date() - (this.isoWeekday() - 1)
                );
                break;
            case 'day':
            case 'date':
                time = startOfDate(this.year(), this.month(), this.date());
                break;
            case 'hour':
                time = this._d.valueOf();
                time -= mod$1(
                    time + (this._isUTC ? 0 : this.utcOffset() * MS_PER_MINUTE),
                    MS_PER_HOUR
                );
                break;
            case 'minute':
                time = this._d.valueOf();
                time -= mod$1(time, MS_PER_MINUTE);
                break;
            case 'second':
                time = this._d.valueOf();
                time -= mod$1(time, MS_PER_SECOND);
                break;
        }

        this._d.setTime(time);
        hooks.updateOffset(this, true);
        return this;
    }

    function endOf(units) {
        var time, startOfDate;
        units = normalizeUnits(units);
        if (units === undefined || units === 'millisecond' || !this.isValid()) {
            return this;
        }

        startOfDate = this._isUTC ? utcStartOfDate : localStartOfDate;

        switch (units) {
            case 'year':
                time = startOfDate(this.year() + 1, 0, 1) - 1;
                break;
            case 'quarter':
                time =
                    startOfDate(
                        this.year(),
                        this.month() - (this.month() % 3) + 3,
                        1
                    ) - 1;
                break;
            case 'month':
                time = startOfDate(this.year(), this.month() + 1, 1) - 1;
                break;
            case 'week':
                time =
                    startOfDate(
                        this.year(),
                        this.month(),
                        this.date() - this.weekday() + 7
                    ) - 1;
                break;
            case 'isoWeek':
                time =
                    startOfDate(
                        this.year(),
                        this.month(),
                        this.date() - (this.isoWeekday() - 1) + 7
                    ) - 1;
                break;
            case 'day':
            case 'date':
                time = startOfDate(this.year(), this.month(), this.date() + 1) - 1;
                break;
            case 'hour':
                time = this._d.valueOf();
                time +=
                    MS_PER_HOUR -
                    mod$1(
                        time + (this._isUTC ? 0 : this.utcOffset() * MS_PER_MINUTE),
                        MS_PER_HOUR
                    ) -
                    1;
                break;
            case 'minute':
                time = this._d.valueOf();
                time += MS_PER_MINUTE - mod$1(time, MS_PER_MINUTE) - 1;
                break;
            case 'second':
                time = this._d.valueOf();
                time += MS_PER_SECOND - mod$1(time, MS_PER_SECOND) - 1;
                break;
        }

        this._d.setTime(time);
        hooks.updateOffset(this, true);
        return this;
    }

    function valueOf() {
        return this._d.valueOf() - (this._offset || 0) * 60000;
    }

    function unix() {
        return Math.floor(this.valueOf() / 1000);
    }

    function toDate() {
        return new Date(this.valueOf());
    }

    function toArray() {
        var m = this;
        return [
            m.year(),
            m.month(),
            m.date(),
            m.hour(),
            m.minute(),
            m.second(),
            m.millisecond(),
        ];
    }

    function toObject() {
        var m = this;
        return {
            years: m.year(),
            months: m.month(),
            date: m.date(),
            hours: m.hours(),
            minutes: m.minutes(),
            seconds: m.seconds(),
            milliseconds: m.milliseconds(),
        };
    }

    function toJSON() {
        // new Date(NaN).toJSON() === null
        return this.isValid() ? this.toISOString() : null;
    }

    function isValid$2() {
        return isValid(this);
    }

    function parsingFlags() {
        return extend({}, getParsingFlags(this));
    }

    function invalidAt() {
        return getParsingFlags(this).overflow;
    }

    function creationData() {
        return {
            input: this._i,
            format: this._f,
            locale: this._locale,
            isUTC: this._isUTC,
            strict: this._strict,
        };
    }

    addFormatToken('N', 0, 0, 'eraAbbr');
    addFormatToken('NN', 0, 0, 'eraAbbr');
    addFormatToken('NNN', 0, 0, 'eraAbbr');
    addFormatToken('NNNN', 0, 0, 'eraName');
    addFormatToken('NNNNN', 0, 0, 'eraNarrow');

    addFormatToken('y', ['y', 1], 'yo', 'eraYear');
    addFormatToken('y', ['yy', 2], 0, 'eraYear');
    addFormatToken('y', ['yyy', 3], 0, 'eraYear');
    addFormatToken('y', ['yyyy', 4], 0, 'eraYear');

    addRegexToken('N', matchEraAbbr);
    addRegexToken('NN', matchEraAbbr);
    addRegexToken('NNN', matchEraAbbr);
    addRegexToken('NNNN', matchEraName);
    addRegexToken('NNNNN', matchEraNarrow);

    addParseToken(['N', 'NN', 'NNN', 'NNNN', 'NNNNN'], function (
        input,
        array,
        config,
        token
    ) {
        var era = config._locale.erasParse(input, token, config._strict);
        if (era) {
            getParsingFlags(config).era = era;
        } else {
            getParsingFlags(config).invalidEra = input;
        }
    });

    addRegexToken('y', matchUnsigned);
    addRegexToken('yy', matchUnsigned);
    addRegexToken('yyy', matchUnsigned);
    addRegexToken('yyyy', matchUnsigned);
    addRegexToken('yo', matchEraYearOrdinal);

    addParseToken(['y', 'yy', 'yyy', 'yyyy'], YEAR);
    addParseToken(['yo'], function (input, array, config, token) {
        var match;
        if (config._locale._eraYearOrdinalRegex) {
            match = input.match(config._locale._eraYearOrdinalRegex);
        }

        if (config._locale.eraYearOrdinalParse) {
            array[YEAR] = config._locale.eraYearOrdinalParse(input, match);
        } else {
            array[YEAR] = parseInt(input, 10);
        }
    });

    function localeEras(m, format) {
        var i,
            l,
            date,
            eras = this._eras || getLocale('en')._eras;
        for (i = 0, l = eras.length; i < l; ++i) {
            switch (typeof eras[i].since) {
                case 'string':
                    // truncate time
                    date = hooks(eras[i].since).startOf('day');
                    eras[i].since = date.valueOf();
                    break;
            }

            switch (typeof eras[i].until) {
                case 'undefined':
                    eras[i].until = +Infinity;
                    break;
                case 'string':
                    // truncate time
                    date = hooks(eras[i].until).startOf('day').valueOf();
                    eras[i].until = date.valueOf();
                    break;
            }
        }
        return eras;
    }

    function localeErasParse(eraName, format, strict) {
        var i,
            l,
            eras = this.eras(),
            name,
            abbr,
            narrow;
        eraName = eraName.toUpperCase();

        for (i = 0, l = eras.length; i < l; ++i) {
            name = eras[i].name.toUpperCase();
            abbr = eras[i].abbr.toUpperCase();
            narrow = eras[i].narrow.toUpperCase();

            if (strict) {
                switch (format) {
                    case 'N':
                    case 'NN':
                    case 'NNN':
                        if (abbr === eraName) {
                            return eras[i];
                        }
                        break;

                    case 'NNNN':
                        if (name === eraName) {
                            return eras[i];
                        }
                        break;

                    case 'NNNNN':
                        if (narrow === eraName) {
                            return eras[i];
                        }
                        break;
                }
            } else if ([name, abbr, narrow].indexOf(eraName) >= 0) {
                return eras[i];
            }
        }
    }

    function localeErasConvertYear(era, year) {
        var dir = era.since <= era.until ? +1 : -1;
        if (year === undefined) {
            return hooks(era.since).year();
        } else {
            return hooks(era.since).year() + (year - era.offset) * dir;
        }
    }

    function getEraName() {
        var i,
            l,
            val,
            eras = this.localeData().eras();
        for (i = 0, l = eras.length; i < l; ++i) {
            // truncate time
            val = this.clone().startOf('day').valueOf();

            if (eras[i].since <= val && val <= eras[i].until) {
                return eras[i].name;
            }
            if (eras[i].until <= val && val <= eras[i].since) {
                return eras[i].name;
            }
        }

        return '';
    }

    function getEraNarrow() {
        var i,
            l,
            val,
            eras = this.localeData().eras();
        for (i = 0, l = eras.length; i < l; ++i) {
            // truncate time
            val = this.clone().startOf('day').valueOf();

            if (eras[i].since <= val && val <= eras[i].until) {
                return eras[i].narrow;
            }
            if (eras[i].until <= val && val <= eras[i].since) {
                return eras[i].narrow;
            }
        }

        return '';
    }

    function getEraAbbr() {
        var i,
            l,
            val,
            eras = this.localeData().eras();
        for (i = 0, l = eras.length; i < l; ++i) {
            // truncate time
            val = this.clone().startOf('day').valueOf();

            if (eras[i].since <= val && val <= eras[i].until) {
                return eras[i].abbr;
            }
            if (eras[i].until <= val && val <= eras[i].since) {
                return eras[i].abbr;
            }
        }

        return '';
    }

    function getEraYear() {
        var i,
            l,
            dir,
            val,
            eras = this.localeData().eras();
        for (i = 0, l = eras.length; i < l; ++i) {
            dir = eras[i].since <= eras[i].until ? +1 : -1;

            // truncate time
            val = this.clone().startOf('day').valueOf();

            if (
                (eras[i].since <= val && val <= eras[i].until) ||
                (eras[i].until <= val && val <= eras[i].since)
            ) {
                return (
                    (this.year() - hooks(eras[i].since).year()) * dir +
                    eras[i].offset
                );
            }
        }

        return this.year();
    }

    function erasNameRegex(isStrict) {
        if (!hasOwnProp(this, '_erasNameRegex')) {
            computeErasParse.call(this);
        }
        return isStrict ? this._erasNameRegex : this._erasRegex;
    }

    function erasAbbrRegex(isStrict) {
        if (!hasOwnProp(this, '_erasAbbrRegex')) {
            computeErasParse.call(this);
        }
        return isStrict ? this._erasAbbrRegex : this._erasRegex;
    }

    function erasNarrowRegex(isStrict) {
        if (!hasOwnProp(this, '_erasNarrowRegex')) {
            computeErasParse.call(this);
        }
        return isStrict ? this._erasNarrowRegex : this._erasRegex;
    }

    function matchEraAbbr(isStrict, locale) {
        return locale.erasAbbrRegex(isStrict);
    }

    function matchEraName(isStrict, locale) {
        return locale.erasNameRegex(isStrict);
    }

    function matchEraNarrow(isStrict, locale) {
        return locale.erasNarrowRegex(isStrict);
    }

    function matchEraYearOrdinal(isStrict, locale) {
        return locale._eraYearOrdinalRegex || matchUnsigned;
    }

    function computeErasParse() {
        var abbrPieces = [],
            namePieces = [],
            narrowPieces = [],
            mixedPieces = [],
            i,
            l,
            eras = this.eras();

        for (i = 0, l = eras.length; i < l; ++i) {
            namePieces.push(regexEscape(eras[i].name));
            abbrPieces.push(regexEscape(eras[i].abbr));
            narrowPieces.push(regexEscape(eras[i].narrow));

            mixedPieces.push(regexEscape(eras[i].name));
            mixedPieces.push(regexEscape(eras[i].abbr));
            mixedPieces.push(regexEscape(eras[i].narrow));
        }

        this._erasRegex = new RegExp('^(' + mixedPieces.join('|') + ')', 'i');
        this._erasNameRegex = new RegExp('^(' + namePieces.join('|') + ')', 'i');
        this._erasAbbrRegex = new RegExp('^(' + abbrPieces.join('|') + ')', 'i');
        this._erasNarrowRegex = new RegExp(
            '^(' + narrowPieces.join('|') + ')',
            'i'
        );
    }

    // FORMATTING

    addFormatToken(0, ['gg', 2], 0, function () {
        return this.weekYear() % 100;
    });

    addFormatToken(0, ['GG', 2], 0, function () {
        return this.isoWeekYear() % 100;
    });

    function addWeekYearFormatToken(token, getter) {
        addFormatToken(0, [token, token.length], 0, getter);
    }

    addWeekYearFormatToken('gggg', 'weekYear');
    addWeekYearFormatToken('ggggg', 'weekYear');
    addWeekYearFormatToken('GGGG', 'isoWeekYear');
    addWeekYearFormatToken('GGGGG', 'isoWeekYear');

    // ALIASES

    addUnitAlias('weekYear', 'gg');
    addUnitAlias('isoWeekYear', 'GG');

    // PRIORITY

    addUnitPriority('weekYear', 1);
    addUnitPriority('isoWeekYear', 1);

    // PARSING

    addRegexToken('G', matchSigned);
    addRegexToken('g', matchSigned);
    addRegexToken('GG', match1to2, match2);
    addRegexToken('gg', match1to2, match2);
    addRegexToken('GGGG', match1to4, match4);
    addRegexToken('gggg', match1to4, match4);
    addRegexToken('GGGGG', match1to6, match6);
    addRegexToken('ggggg', match1to6, match6);

    addWeekParseToken(['gggg', 'ggggg', 'GGGG', 'GGGGG'], function (
        input,
        week,
        config,
        token
    ) {
        week[token.substr(0, 2)] = toInt(input);
    });

    addWeekParseToken(['gg', 'GG'], function (input, week, config, token) {
        week[token] = hooks.parseTwoDigitYear(input);
    });

    // MOMENTS

    function getSetWeekYear(input) {
        return getSetWeekYearHelper.call(
            this,
            input,
            this.week(),
            this.weekday(),
            this.localeData()._week.dow,
            this.localeData()._week.doy
        );
    }

    function getSetISOWeekYear(input) {
        return getSetWeekYearHelper.call(
            this,
            input,
            this.isoWeek(),
            this.isoWeekday(),
            1,
            4
        );
    }

    function getISOWeeksInYear() {
        return weeksInYear(this.year(), 1, 4);
    }

    function getISOWeeksInISOWeekYear() {
        return weeksInYear(this.isoWeekYear(), 1, 4);
    }

    function getWeeksInYear() {
        var weekInfo = this.localeData()._week;
        return weeksInYear(this.year(), weekInfo.dow, weekInfo.doy);
    }

    function getWeeksInWeekYear() {
        var weekInfo = this.localeData()._week;
        return weeksInYear(this.weekYear(), weekInfo.dow, weekInfo.doy);
    }

    function getSetWeekYearHelper(input, week, weekday, dow, doy) {
        var weeksTarget;
        if (input == null) {
            return weekOfYear(this, dow, doy).year;
        } else {
            weeksTarget = weeksInYear(input, dow, doy);
            if (week > weeksTarget) {
                week = weeksTarget;
            }
            return setWeekAll.call(this, input, week, weekday, dow, doy);
        }
    }

    function setWeekAll(weekYear, week, weekday, dow, doy) {
        var dayOfYearData = dayOfYearFromWeeks(weekYear, week, weekday, dow, doy),
            date = createUTCDate(dayOfYearData.year, 0, dayOfYearData.dayOfYear);

        this.year(date.getUTCFullYear());
        this.month(date.getUTCMonth());
        this.date(date.getUTCDate());
        return this;
    }

    // FORMATTING

    addFormatToken('Q', 0, 'Qo', 'quarter');

    // ALIASES

    addUnitAlias('quarter', 'Q');

    // PRIORITY

    addUnitPriority('quarter', 7);

    // PARSING

    addRegexToken('Q', match1);
    addParseToken('Q', function (input, array) {
        array[MONTH] = (toInt(input) - 1) * 3;
    });

    // MOMENTS

    function getSetQuarter(input) {
        return input == null
            ? Math.ceil((this.month() + 1) / 3)
            : this.month((input - 1) * 3 + (this.month() % 3));
    }

    // FORMATTING

    addFormatToken('D', ['DD', 2], 'Do', 'date');

    // ALIASES

    addUnitAlias('date', 'D');

    // PRIORITY
    addUnitPriority('date', 9);

    // PARSING

    addRegexToken('D', match1to2);
    addRegexToken('DD', match1to2, match2);
    addRegexToken('Do', function (isStrict, locale) {
        // TODO: Remove "ordinalParse" fallback in next major release.
        return isStrict
            ? locale._dayOfMonthOrdinalParse || locale._ordinalParse
            : locale._dayOfMonthOrdinalParseLenient;
    });

    addParseToken(['D', 'DD'], DATE);
    addParseToken('Do', function (input, array) {
        array[DATE] = toInt(input.match(match1to2)[0]);
    });

    // MOMENTS

    var getSetDayOfMonth = makeGetSet('Date', true);

    // FORMATTING

    addFormatToken('DDD', ['DDDD', 3], 'DDDo', 'dayOfYear');

    // ALIASES

    addUnitAlias('dayOfYear', 'DDD');

    // PRIORITY
    addUnitPriority('dayOfYear', 4);

    // PARSING

    addRegexToken('DDD', match1to3);
    addRegexToken('DDDD', match3);
    addParseToken(['DDD', 'DDDD'], function (input, array, config) {
        config._dayOfYear = toInt(input);
    });

    // HELPERS

    // MOMENTS

    function getSetDayOfYear(input) {
        var dayOfYear =
            Math.round(
                (this.clone().startOf('day') - this.clone().startOf('year')) / 864e5
            ) + 1;
        return input == null ? dayOfYear : this.add(input - dayOfYear, 'd');
    }

    // FORMATTING

    addFormatToken('m', ['mm', 2], 0, 'minute');

    // ALIASES

    addUnitAlias('minute', 'm');

    // PRIORITY

    addUnitPriority('minute', 14);

    // PARSING

    addRegexToken('m', match1to2);
    addRegexToken('mm', match1to2, match2);
    addParseToken(['m', 'mm'], MINUTE);

    // MOMENTS

    var getSetMinute = makeGetSet('Minutes', false);

    // FORMATTING

    addFormatToken('s', ['ss', 2], 0, 'second');

    // ALIASES

    addUnitAlias('second', 's');

    // PRIORITY

    addUnitPriority('second', 15);

    // PARSING

    addRegexToken('s', match1to2);
    addRegexToken('ss', match1to2, match2);
    addParseToken(['s', 'ss'], SECOND);

    // MOMENTS

    var getSetSecond = makeGetSet('Seconds', false);

    // FORMATTING

    addFormatToken('S', 0, 0, function () {
        return ~~(this.millisecond() / 100);
    });

    addFormatToken(0, ['SS', 2], 0, function () {
        return ~~(this.millisecond() / 10);
    });

    addFormatToken(0, ['SSS', 3], 0, 'millisecond');
    addFormatToken(0, ['SSSS', 4], 0, function () {
        return this.millisecond() * 10;
    });
    addFormatToken(0, ['SSSSS', 5], 0, function () {
        return this.millisecond() * 100;
    });
    addFormatToken(0, ['SSSSSS', 6], 0, function () {
        return this.millisecond() * 1000;
    });
    addFormatToken(0, ['SSSSSSS', 7], 0, function () {
        return this.millisecond() * 10000;
    });
    addFormatToken(0, ['SSSSSSSS', 8], 0, function () {
        return this.millisecond() * 100000;
    });
    addFormatToken(0, ['SSSSSSSSS', 9], 0, function () {
        return this.millisecond() * 1000000;
    });

    // ALIASES

    addUnitAlias('millisecond', 'ms');

    // PRIORITY

    addUnitPriority('millisecond', 16);

    // PARSING

    addRegexToken('S', match1to3, match1);
    addRegexToken('SS', match1to3, match2);
    addRegexToken('SSS', match1to3, match3);

    var token, getSetMillisecond;
    for (token = 'SSSS'; token.length <= 9; token += 'S') {
        addRegexToken(token, matchUnsigned);
    }

    function parseMs(input, array) {
        array[MILLISECOND] = toInt(('0.' + input) * 1000);
    }

    for (token = 'S'; token.length <= 9; token += 'S') {
        addParseToken(token, parseMs);
    }

    getSetMillisecond = makeGetSet('Milliseconds', false);

    // FORMATTING

    addFormatToken('z', 0, 0, 'zoneAbbr');
    addFormatToken('zz', 0, 0, 'zoneName');

    // MOMENTS

    function getZoneAbbr() {
        return this._isUTC ? 'UTC' : '';
    }

    function getZoneName() {
        return this._isUTC ? 'Coordinated Universal Time' : '';
    }

    var proto = Moment.prototype;

    proto.add = add;
    proto.calendar = calendar$1;
    proto.clone = clone;
    proto.diff = diff;
    proto.endOf = endOf;
    proto.format = format;
    proto.from = from;
    proto.fromNow = fromNow;
    proto.to = to;
    proto.toNow = toNow;
    proto.get = stringGet;
    proto.invalidAt = invalidAt;
    proto.isAfter = isAfter;
    proto.isBefore = isBefore;
    proto.isBetween = isBetween;
    proto.isSame = isSame;
    proto.isSameOrAfter = isSameOrAfter;
    proto.isSameOrBefore = isSameOrBefore;
    proto.isValid = isValid$2;
    proto.lang = lang;
    proto.locale = locale;
    proto.localeData = localeData;
    proto.max = prototypeMax;
    proto.min = prototypeMin;
    proto.parsingFlags = parsingFlags;
    proto.set = stringSet;
    proto.startOf = startOf;
    proto.subtract = subtract;
    proto.toArray = toArray;
    proto.toObject = toObject;
    proto.toDate = toDate;
    proto.toISOString = toISOString;
    proto.inspect = inspect;
    if (typeof Symbol !== 'undefined' && Symbol.for != null) {
        proto[Symbol.for('nodejs.util.inspect.custom')] = function () {
            return 'Moment<' + this.format() + '>';
        };
    }
    proto.toJSON = toJSON;
    proto.toString = toString;
    proto.unix = unix;
    proto.valueOf = valueOf;
    proto.creationData = creationData;
    proto.eraName = getEraName;
    proto.eraNarrow = getEraNarrow;
    proto.eraAbbr = getEraAbbr;
    proto.eraYear = getEraYear;
    proto.year = getSetYear;
    proto.isLeapYear = getIsLeapYear;
    proto.weekYear = getSetWeekYear;
    proto.isoWeekYear = getSetISOWeekYear;
    proto.quarter = proto.quarters = getSetQuarter;
    proto.month = getSetMonth;
    proto.daysInMonth = getDaysInMonth;
    proto.week = proto.weeks = getSetWeek;
    proto.isoWeek = proto.isoWeeks = getSetISOWeek;
    proto.weeksInYear = getWeeksInYear;
    proto.weeksInWeekYear = getWeeksInWeekYear;
    proto.isoWeeksInYear = getISOWeeksInYear;
    proto.isoWeeksInISOWeekYear = getISOWeeksInISOWeekYear;
    proto.date = getSetDayOfMonth;
    proto.day = proto.days = getSetDayOfWeek;
    proto.weekday = getSetLocaleDayOfWeek;
    proto.isoWeekday = getSetISODayOfWeek;
    proto.dayOfYear = getSetDayOfYear;
    proto.hour = proto.hours = getSetHour;
    proto.minute = proto.minutes = getSetMinute;
    proto.second = proto.seconds = getSetSecond;
    proto.millisecond = proto.milliseconds = getSetMillisecond;
    proto.utcOffset = getSetOffset;
    proto.utc = setOffsetToUTC;
    proto.local = setOffsetToLocal;
    proto.parseZone = setOffsetToParsedOffset;
    proto.hasAlignedHourOffset = hasAlignedHourOffset;
    proto.isDST = isDaylightSavingTime;
    proto.isLocal = isLocal;
    proto.isUtcOffset = isUtcOffset;
    proto.isUtc = isUtc;
    proto.isUTC = isUtc;
    proto.zoneAbbr = getZoneAbbr;
    proto.zoneName = getZoneName;
    proto.dates = deprecate(
        'dates accessor is deprecated. Use date instead.',
        getSetDayOfMonth
    );
    proto.months = deprecate(
        'months accessor is deprecated. Use month instead',
        getSetMonth
    );
    proto.years = deprecate(
        'years accessor is deprecated. Use year instead',
        getSetYear
    );
    proto.zone = deprecate(
        'moment().zone is deprecated, use moment().utcOffset instead. http://momentjs.com/guides/#/warnings/zone/',
        getSetZone
    );
    proto.isDSTShifted = deprecate(
        'isDSTShifted is deprecated. See http://momentjs.com/guides/#/warnings/dst-shifted/ for more information',
        isDaylightSavingTimeShifted
    );

    function createUnix(input) {
        return createLocal(input * 1000);
    }

    function createInZone() {
        return createLocal.apply(null, arguments).parseZone();
    }

    function preParsePostFormat(string) {
        return string;
    }

    var proto$1 = Locale.prototype;

    proto$1.calendar = calendar;
    proto$1.longDateFormat = longDateFormat;
    proto$1.invalidDate = invalidDate;
    proto$1.ordinal = ordinal;
    proto$1.preparse = preParsePostFormat;
    proto$1.postformat = preParsePostFormat;
    proto$1.relativeTime = relativeTime;
    proto$1.pastFuture = pastFuture;
    proto$1.set = set;
    proto$1.eras = localeEras;
    proto$1.erasParse = localeErasParse;
    proto$1.erasConvertYear = localeErasConvertYear;
    proto$1.erasAbbrRegex = erasAbbrRegex;
    proto$1.erasNameRegex = erasNameRegex;
    proto$1.erasNarrowRegex = erasNarrowRegex;

    proto$1.months = localeMonths;
    proto$1.monthsShort = localeMonthsShort;
    proto$1.monthsParse = localeMonthsParse;
    proto$1.monthsRegex = monthsRegex;
    proto$1.monthsShortRegex = monthsShortRegex;
    proto$1.week = localeWeek;
    proto$1.firstDayOfYear = localeFirstDayOfYear;
    proto$1.firstDayOfWeek = localeFirstDayOfWeek;

    proto$1.weekdays = localeWeekdays;
    proto$1.weekdaysMin = localeWeekdaysMin;
    proto$1.weekdaysShort = localeWeekdaysShort;
    proto$1.weekdaysParse = localeWeekdaysParse;

    proto$1.weekdaysRegex = weekdaysRegex;
    proto$1.weekdaysShortRegex = weekdaysShortRegex;
    proto$1.weekdaysMinRegex = weekdaysMinRegex;

    proto$1.isPM = localeIsPM;
    proto$1.meridiem = localeMeridiem;

    function get$1(format, index, field, setter) {
        var locale = getLocale(),
            utc = createUTC().set(setter, index);
        return locale[field](utc, format);
    }

    function listMonthsImpl(format, index, field) {
        if (isNumber(format)) {
            index = format;
            format = undefined;
        }

        format = format || '';

        if (index != null) {
            return get$1(format, index, field, 'month');
        }

        var i,
            out = [];
        for (i = 0; i < 12; i++) {
            out[i] = get$1(format, i, field, 'month');
        }
        return out;
    }

    // ()
    // (5)
    // (fmt, 5)
    // (fmt)
    // (true)
    // (true, 5)
    // (true, fmt, 5)
    // (true, fmt)
    function listWeekdaysImpl(localeSorted, format, index, field) {
        if (typeof localeSorted === 'boolean') {
            if (isNumber(format)) {
                index = format;
                format = undefined;
            }

            format = format || '';
        } else {
            format = localeSorted;
            index = format;
            localeSorted = false;

            if (isNumber(format)) {
                index = format;
                format = undefined;
            }

            format = format || '';
        }

        var locale = getLocale(),
            shift = localeSorted ? locale._week.dow : 0,
            i,
            out = [];

        if (index != null) {
            return get$1(format, (index + shift) % 7, field, 'day');
        }

        for (i = 0; i < 7; i++) {
            out[i] = get$1(format, (i + shift) % 7, field, 'day');
        }
        return out;
    }

    function listMonths(format, index) {
        return listMonthsImpl(format, index, 'months');
    }

    function listMonthsShort(format, index) {
        return listMonthsImpl(format, index, 'monthsShort');
    }

    function listWeekdays(localeSorted, format, index) {
        return listWeekdaysImpl(localeSorted, format, index, 'weekdays');
    }

    function listWeekdaysShort(localeSorted, format, index) {
        return listWeekdaysImpl(localeSorted, format, index, 'weekdaysShort');
    }

    function listWeekdaysMin(localeSorted, format, index) {
        return listWeekdaysImpl(localeSorted, format, index, 'weekdaysMin');
    }

    getSetGlobalLocale('en', {
        eras: [
            {
                since: '0001-01-01',
                until: +Infinity,
                offset: 1,
                name: 'Anno Domini',
                narrow: 'AD',
                abbr: 'AD',
            },
            {
                since: '0000-12-31',
                until: -Infinity,
                offset: 1,
                name: 'Before Christ',
                narrow: 'BC',
                abbr: 'BC',
            },
        ],
        dayOfMonthOrdinalParse: /\d{1,2}(th|st|nd|rd)/,
        ordinal: function (number) {
            var b = number % 10,
                output =
                    toInt((number % 100) / 10) === 1
                        ? 'th'
                        : b === 1
                        ? 'st'
                        : b === 2
                        ? 'nd'
                        : b === 3
                        ? 'rd'
                        : 'th';
            return number + output;
        },
    });

    // Side effect imports

    hooks.lang = deprecate(
        'moment.lang is deprecated. Use moment.locale instead.',
        getSetGlobalLocale
    );
    hooks.langData = deprecate(
        'moment.langData is deprecated. Use moment.localeData instead.',
        getLocale
    );

    var mathAbs = Math.abs;

    function abs() {
        var data = this._data;

        this._milliseconds = mathAbs(this._milliseconds);
        this._days = mathAbs(this._days);
        this._months = mathAbs(this._months);

        data.milliseconds = mathAbs(data.milliseconds);
        data.seconds = mathAbs(data.seconds);
        data.minutes = mathAbs(data.minutes);
        data.hours = mathAbs(data.hours);
        data.months = mathAbs(data.months);
        data.years = mathAbs(data.years);

        return this;
    }

    function addSubtract$1(duration, input, value, direction) {
        var other = createDuration(input, value);

        duration._milliseconds += direction * other._milliseconds;
        duration._days += direction * other._days;
        duration._months += direction * other._months;

        return duration._bubble();
    }

    // supports only 2.0-style add(1, 's') or add(duration)
    function add$1(input, value) {
        return addSubtract$1(this, input, value, 1);
    }

    // supports only 2.0-style subtract(1, 's') or subtract(duration)
    function subtract$1(input, value) {
        return addSubtract$1(this, input, value, -1);
    }

    function absCeil(number) {
        if (number < 0) {
            return Math.floor(number);
        } else {
            return Math.ceil(number);
        }
    }

    function bubble() {
        var milliseconds = this._milliseconds,
            days = this._days,
            months = this._months,
            data = this._data,
            seconds,
            minutes,
            hours,
            years,
            monthsFromDays;

        // if we have a mix of positive and negative values, bubble down first
        // check: https://github.com/moment/moment/issues/2166
        if (
            !(
                (milliseconds >= 0 && days >= 0 && months >= 0) ||
                (milliseconds <= 0 && days <= 0 && months <= 0)
            )
        ) {
            milliseconds += absCeil(monthsToDays(months) + days) * 864e5;
            days = 0;
            months = 0;
        }

        // The following code bubbles up values, see the tests for
        // examples of what that means.
        data.milliseconds = milliseconds % 1000;

        seconds = absFloor(milliseconds / 1000);
        data.seconds = seconds % 60;

        minutes = absFloor(seconds / 60);
        data.minutes = minutes % 60;

        hours = absFloor(minutes / 60);
        data.hours = hours % 24;

        days += absFloor(hours / 24);

        // convert days to months
        monthsFromDays = absFloor(daysToMonths(days));
        months += monthsFromDays;
        days -= absCeil(monthsToDays(monthsFromDays));

        // 12 months -> 1 year
        years = absFloor(months / 12);
        months %= 12;

        data.days = days;
        data.months = months;
        data.years = years;

        return this;
    }

    function daysToMonths(days) {
        // 400 years have 146097 days (taking into account leap year rules)
        // 400 years have 12 months === 4800
        return (days * 4800) / 146097;
    }

    function monthsToDays(months) {
        // the reverse of daysToMonths
        return (months * 146097) / 4800;
    }

    function as(units) {
        if (!this.isValid()) {
            return NaN;
        }
        var days,
            months,
            milliseconds = this._milliseconds;

        units = normalizeUnits(units);

        if (units === 'month' || units === 'quarter' || units === 'year') {
            days = this._days + milliseconds / 864e5;
            months = this._months + daysToMonths(days);
            switch (units) {
                case 'month':
                    return months;
                case 'quarter':
                    return months / 3;
                case 'year':
                    return months / 12;
            }
        } else {
            // handle milliseconds separately because of floating point math errors (issue #1867)
            days = this._days + Math.round(monthsToDays(this._months));
            switch (units) {
                case 'week':
                    return days / 7 + milliseconds / 6048e5;
                case 'day':
                    return days + milliseconds / 864e5;
                case 'hour':
                    return days * 24 + milliseconds / 36e5;
                case 'minute':
                    return days * 1440 + milliseconds / 6e4;
                case 'second':
                    return days * 86400 + milliseconds / 1000;
                // Math.floor prevents floating point math errors here
                case 'millisecond':
                    return Math.floor(days * 864e5) + milliseconds;
                default:
                    throw new Error('Unknown unit ' + units);
            }
        }
    }

    // TODO: Use this.as('ms')?
    function valueOf$1() {
        if (!this.isValid()) {
            return NaN;
        }
        return (
            this._milliseconds +
            this._days * 864e5 +
            (this._months % 12) * 2592e6 +
            toInt(this._months / 12) * 31536e6
        );
    }

    function makeAs(alias) {
        return function () {
            return this.as(alias);
        };
    }

    var asMilliseconds = makeAs('ms'),
        asSeconds = makeAs('s'),
        asMinutes = makeAs('m'),
        asHours = makeAs('h'),
        asDays = makeAs('d'),
        asWeeks = makeAs('w'),
        asMonths = makeAs('M'),
        asQuarters = makeAs('Q'),
        asYears = makeAs('y');

    function clone$1() {
        return createDuration(this);
    }

    function get$2(units) {
        units = normalizeUnits(units);
        return this.isValid() ? this[units + 's']() : NaN;
    }

    function makeGetter(name) {
        return function () {
            return this.isValid() ? this._data[name] : NaN;
        };
    }

    var milliseconds = makeGetter('milliseconds'),
        seconds = makeGetter('seconds'),
        minutes = makeGetter('minutes'),
        hours = makeGetter('hours'),
        days = makeGetter('days'),
        months = makeGetter('months'),
        years = makeGetter('years');

    function weeks() {
        return absFloor(this.days() / 7);
    }

    var round = Math.round,
        thresholds = {
            ss: 44, // a few seconds to seconds
            s: 45, // seconds to minute
            m: 45, // minutes to hour
            h: 22, // hours to day
            d: 26, // days to month/week
            w: null, // weeks to month
            M: 11, // months to year
        };

    // helper function for moment.fn.from, moment.fn.fromNow, and moment.duration.fn.humanize
    function substituteTimeAgo(string, number, withoutSuffix, isFuture, locale) {
        return locale.relativeTime(number || 1, !!withoutSuffix, string, isFuture);
    }

    function relativeTime$1(posNegDuration, withoutSuffix, thresholds, locale) {
        var duration = createDuration(posNegDuration).abs(),
            seconds = round(duration.as('s')),
            minutes = round(duration.as('m')),
            hours = round(duration.as('h')),
            days = round(duration.as('d')),
            months = round(duration.as('M')),
            weeks = round(duration.as('w')),
            years = round(duration.as('y')),
            a =
                (seconds <= thresholds.ss && ['s', seconds]) ||
                (seconds < thresholds.s && ['ss', seconds]) ||
                (minutes <= 1 && ['m']) ||
                (minutes < thresholds.m && ['mm', minutes]) ||
                (hours <= 1 && ['h']) ||
                (hours < thresholds.h && ['hh', hours]) ||
                (days <= 1 && ['d']) ||
                (days < thresholds.d && ['dd', days]);

        if (thresholds.w != null) {
            a =
                a ||
                (weeks <= 1 && ['w']) ||
                (weeks < thresholds.w && ['ww', weeks]);
        }
        a = a ||
            (months <= 1 && ['M']) ||
            (months < thresholds.M && ['MM', months]) ||
            (years <= 1 && ['y']) || ['yy', years];

        a[2] = withoutSuffix;
        a[3] = +posNegDuration > 0;
        a[4] = locale;
        return substituteTimeAgo.apply(null, a);
    }

    // This function allows you to set the rounding function for relative time strings
    function getSetRelativeTimeRounding(roundingFunction) {
        if (roundingFunction === undefined) {
            return round;
        }
        if (typeof roundingFunction === 'function') {
            round = roundingFunction;
            return true;
        }
        return false;
    }

    // This function allows you to set a threshold for relative time strings
    function getSetRelativeTimeThreshold(threshold, limit) {
        if (thresholds[threshold] === undefined) {
            return false;
        }
        if (limit === undefined) {
            return thresholds[threshold];
        }
        thresholds[threshold] = limit;
        if (threshold === 's') {
            thresholds.ss = limit - 1;
        }
        return true;
    }

    function humanize(argWithSuffix, argThresholds) {
        if (!this.isValid()) {
            return this.localeData().invalidDate();
        }

        var withSuffix = false,
            th = thresholds,
            locale,
            output;

        if (typeof argWithSuffix === 'object') {
            argThresholds = argWithSuffix;
            argWithSuffix = false;
        }
        if (typeof argWithSuffix === 'boolean') {
            withSuffix = argWithSuffix;
        }
        if (typeof argThresholds === 'object') {
            th = Object.assign({}, thresholds, argThresholds);
            if (argThresholds.s != null && argThresholds.ss == null) {
                th.ss = argThresholds.s - 1;
            }
        }

        locale = this.localeData();
        output = relativeTime$1(this, !withSuffix, th, locale);

        if (withSuffix) {
            output = locale.pastFuture(+this, output);
        }

        return locale.postformat(output);
    }

    var abs$1 = Math.abs;

    function sign(x) {
        return (x > 0) - (x < 0) || +x;
    }

    function toISOString$1() {
        // for ISO strings we do not use the normal bubbling rules:
        //  * milliseconds bubble up until they become hours
        //  * days do not bubble at all
        //  * months bubble up until they become years
        // This is because there is no context-free conversion between hours and days
        // (think of clock changes)
        // and also not between days and months (28-31 days per month)
        if (!this.isValid()) {
            return this.localeData().invalidDate();
        }

        var seconds = abs$1(this._milliseconds) / 1000,
            days = abs$1(this._days),
            months = abs$1(this._months),
            minutes,
            hours,
            years,
            s,
            total = this.asSeconds(),
            totalSign,
            ymSign,
            daysSign,
            hmsSign;

        if (!total) {
            // this is the same as C#'s (Noda) and python (isodate)...
            // but not other JS (goog.date)
            return 'P0D';
        }

        // 3600 seconds -> 60 minutes -> 1 hour
        minutes = absFloor(seconds / 60);
        hours = absFloor(minutes / 60);
        seconds %= 60;
        minutes %= 60;

        // 12 months -> 1 year
        years = absFloor(months / 12);
        months %= 12;

        // inspired by https://github.com/dordille/moment-isoduration/blob/master/moment.isoduration.js
        s = seconds ? seconds.toFixed(3).replace(/\.?0+$/, '') : '';

        totalSign = total < 0 ? '-' : '';
        ymSign = sign(this._months) !== sign(total) ? '-' : '';
        daysSign = sign(this._days) !== sign(total) ? '-' : '';
        hmsSign = sign(this._milliseconds) !== sign(total) ? '-' : '';

        return (
            totalSign +
            'P' +
            (years ? ymSign + years + 'Y' : '') +
            (months ? ymSign + months + 'M' : '') +
            (days ? daysSign + days + 'D' : '') +
            (hours || minutes || seconds ? 'T' : '') +
            (hours ? hmsSign + hours + 'H' : '') +
            (minutes ? hmsSign + minutes + 'M' : '') +
            (seconds ? hmsSign + s + 'S' : '')
        );
    }

    var proto$2 = Duration.prototype;

    proto$2.isValid = isValid$1;
    proto$2.abs = abs;
    proto$2.add = add$1;
    proto$2.subtract = subtract$1;
    proto$2.as = as;
    proto$2.asMilliseconds = asMilliseconds;
    proto$2.asSeconds = asSeconds;
    proto$2.asMinutes = asMinutes;
    proto$2.asHours = asHours;
    proto$2.asDays = asDays;
    proto$2.asWeeks = asWeeks;
    proto$2.asMonths = asMonths;
    proto$2.asQuarters = asQuarters;
    proto$2.asYears = asYears;
    proto$2.valueOf = valueOf$1;
    proto$2._bubble = bubble;
    proto$2.clone = clone$1;
    proto$2.get = get$2;
    proto$2.milliseconds = milliseconds;
    proto$2.seconds = seconds;
    proto$2.minutes = minutes;
    proto$2.hours = hours;
    proto$2.days = days;
    proto$2.weeks = weeks;
    proto$2.months = months;
    proto$2.years = years;
    proto$2.humanize = humanize;
    proto$2.toISOString = toISOString$1;
    proto$2.toString = toISOString$1;
    proto$2.toJSON = toISOString$1;
    proto$2.locale = locale;
    proto$2.localeData = localeData;

    proto$2.toIsoString = deprecate(
        'toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)',
        toISOString$1
    );
    proto$2.lang = lang;

    // FORMATTING

    addFormatToken('X', 0, 0, 'unix');
    addFormatToken('x', 0, 0, 'valueOf');

    // PARSING

    addRegexToken('x', matchSigned);
    addRegexToken('X', matchTimestamp);
    addParseToken('X', function (input, array, config) {
        config._d = new Date(parseFloat(input) * 1000);
    });
    addParseToken('x', function (input, array, config) {
        config._d = new Date(toInt(input));
    });

    //! moment.js

    hooks.version = '2.29.1';

    setHookCallback(createLocal);

    hooks.fn = proto;
    hooks.min = min;
    hooks.max = max;
    hooks.now = now;
    hooks.utc = createUTC;
    hooks.unix = createUnix;
    hooks.months = listMonths;
    hooks.isDate = isDate;
    hooks.locale = getSetGlobalLocale;
    hooks.invalid = createInvalid;
    hooks.duration = createDuration;
    hooks.isMoment = isMoment;
    hooks.weekdays = listWeekdays;
    hooks.parseZone = createInZone;
    hooks.localeData = getLocale;
    hooks.isDuration = isDuration;
    hooks.monthsShort = listMonthsShort;
    hooks.weekdaysMin = listWeekdaysMin;
    hooks.defineLocale = defineLocale;
    hooks.updateLocale = updateLocale;
    hooks.locales = listLocales;
    hooks.weekdaysShort = listWeekdaysShort;
    hooks.normalizeUnits = normalizeUnits;
    hooks.relativeTimeRounding = getSetRelativeTimeRounding;
    hooks.relativeTimeThreshold = getSetRelativeTimeThreshold;
    hooks.calendarFormat = getCalendarFormat;
    hooks.prototype = proto;

    // currently HTML5 input type only supports 24-hour formats
    hooks.HTML5_FMT = {
        DATETIME_LOCAL: 'YYYY-MM-DDTHH:mm', // <input type="datetime-local" />
        DATETIME_LOCAL_SECONDS: 'YYYY-MM-DDTHH:mm:ss', // <input type="datetime-local" step="1" />
        DATETIME_LOCAL_MS: 'YYYY-MM-DDTHH:mm:ss.SSS', // <input type="datetime-local" step="0.001" />
        DATE: 'YYYY-MM-DD', // <input type="date" />
        TIME: 'HH:mm', // <input type="time" />
        TIME_SECONDS: 'HH:mm:ss', // <input type="time" step="1" />
        TIME_MS: 'HH:mm:ss.SSS', // <input type="time" step="0.001" />
        WEEK: 'GGGG-[W]WW', // <input type="week" />
        MONTH: 'YYYY-MM', // <input type="month" />
    };

    return hooks;

})));
});

const UnknownProject = {
    id: -1,
    parent_id: null,
    order: -1,
    name: "Unknown project",
};
const UnknownSection = {
    id: -1,
    project_id: -1,
    order: -1,
    name: "Unknown section",
};

class Task {
    constructor(raw) {
        this.id = raw.id;
        this.priority = raw.priority;
        this.content = raw.content;
        this.order = raw.order;
        this.projectID = raw.project_id;
        this.sectionID = raw.section_id != 0 ? raw.section_id : null;
        this.labelIDs = raw.label_ids;
        this.children = [];
        if (raw.due) {
            if (raw.due.datetime) {
                this.hasTime = true;
                this.rawDatetime = moment(raw.due.datetime);
                this.date = this.rawDatetime.calendar();
            }
            else {
                this.hasTime = false;
                this.rawDatetime = moment(raw.due.date);
                this.date = this.rawDatetime.calendar(Task.dateOnlyCalendarSpec);
            }
        }
    }
    count() {
        return 1 + this.children.reduce((sum, task) => sum + task.count(), 0);
    }
    isOverdue() {
        if (!this.rawDatetime) {
            return false;
        }
        if (this.hasTime) {
            return this.rawDatetime.isBefore();
        }
        return this.rawDatetime.clone().add(1, "day").isBefore();
    }
    compareTo(other, sorting_options) {
        for (let sort of sorting_options) {
            switch (sort) {
                case "priority":
                    // Higher priority comes first.
                    const diff = other.priority - this.priority;
                    if (diff == 0) {
                        continue;
                    }
                    return diff;
                case "date":
                    // We want to sort using the following criteria:
                    // 1. Any items without a datetime always are sorted after those with.
                    // 2. Any items on the same day without time always are sorted after those with.
                    if (this.rawDatetime && !other.rawDatetime) {
                        return -1;
                    }
                    else if (!this.rawDatetime && other.rawDatetime) {
                        return 1;
                    }
                    else if (!this.rawDatetime && !other.rawDatetime) {
                        continue;
                    }
                    // Now compare dates.
                    if (this.rawDatetime.isAfter(other.rawDatetime, "day")) {
                        return 1;
                    }
                    else if (this.rawDatetime.isBefore(other.rawDatetime, "day")) {
                        return -1;
                    }
                    // We are the same day, lets look at time.
                    if (this.hasTime && !other.hasTime) {
                        return -1;
                    }
                    else if (!this.hasTime && other.hasTime) {
                        return 1;
                    }
                    else if (!this.hasTime && !this.hasTime) {
                        continue;
                    }
                    return this.rawDatetime.isBefore(other.rawDatetime) ? -1 : 1;
            }
        }
        return this.order - other.order;
    }
    static buildTree(tasks) {
        const mapping = new Map();
        tasks.forEach((task) => mapping.set(task.id, new Task(task)));
        tasks.forEach((task) => {
            if (task.parent == null || !mapping.has(task.parent)) {
                return;
            }
            const self = mapping.get(task.id);
            const parent = mapping.get(task.parent);
            self.parent = parent;
            parent.children.push(self);
        });
        return Array.from(mapping.values()).filter((task) => task.parent == null);
    }
}
Task.dateOnlyCalendarSpec = {
    sameDay: "[Today]",
    nextDay: "[Tomorrow]",
    nextWeek: "dddd",
    lastDay: "[Yesterday]",
    lastWeek: "[Last] dddd",
    sameElse: "MMM Do",
};
class Project {
    constructor(raw) {
        this.projectID = raw.id;
        this.parentID = raw.parent_id;
        this.order = raw.order;
        this.tasks = [];
        this.subProjects = [];
        this.sections = [];
    }
    count() {
        return (this.tasks.reduce((sum, task) => sum + task.count(), 0) +
            this.subProjects.reduce((sum, prj) => sum + prj.count(), 0) +
            this.sections.reduce((sum, section) => sum + section.count(), 0));
    }
    sort() {
        this.subProjects = this.subProjects.sort((first, second) => first.order - second.order);
        this.sections = this.sections.sort((first, second) => first.order - second.order);
    }
    static buildProjectTree(tasks, metadata) {
        const projects = new ExtendedMap();
        const sections = new ExtendedMap();
        const unknownProject = {
            result: new Project(UnknownProject),
            tasks: [],
        };
        const unknownSection = {
            result: new Section(UnknownSection),
            tasks: [],
        };
        tasks.forEach((task) => {
            var _a, _b;
            const project = (_a = projects.get_or_maybe_insert(task.project_id, () => {
                const project = metadata.projects.get(task.project_id);
                if (project) {
                    return {
                        result: new Project(project),
                        tasks: [],
                    };
                }
                else {
                    return null;
                }
            })) !== null && _a !== void 0 ? _a : unknownProject;
            if (task.section_id != 0) {
                // The task has an associated section, so we file it under there.
                const section = (_b = sections.get_or_maybe_insert(task.section_id, () => {
                    const section = metadata.sections.get(task.section_id);
                    if (section) {
                        return {
                            result: new Section(section),
                            tasks: [],
                        };
                    }
                    else {
                        return null;
                    }
                })) !== null && _b !== void 0 ? _b : unknownSection;
                section.tasks.push(task);
                return;
            }
            project.tasks.push(task);
        });
        if (unknownProject.tasks.length > 0) {
            projects.set(unknownProject.result.projectID, unknownProject);
        }
        if (unknownSection.tasks.length > 0) {
            projects.set(unknownProject.result.projectID, unknownProject);
            sections.set(unknownSection.result.sectionID, unknownSection);
        }
        // Attach parents for projects.
        for (let project of projects.values()) {
            project.result.tasks = Task.buildTree(project.tasks);
            if (!project.result.parentID) {
                continue;
            }
            const parent = projects.get(project.result.parentID);
            if (parent) {
                parent.result.subProjects.push(project.result);
                project.result.parent = parent.result;
            }
        }
        // Attach parents for sections.
        for (let section of sections.values()) {
            section.result.tasks = Task.buildTree(section.tasks);
            const project = projects.get(section.result.projectID);
            project.result.sections.push(section.result);
        }
        projects.forEach((prj) => prj.result.sort());
        return Array.from(projects.values())
            .map((prj) => prj.result)
            .filter((prj) => prj.parent == null);
    }
}
class Section {
    constructor(raw) {
        this.sectionID = raw.id;
        this.projectID = raw.project_id;
        this.order = raw.order;
    }
    count() {
        return this.tasks.reduce((sum, task) => sum + task.count(), 0);
    }
}

class Result {
    static Capture(closure) {
        try {
            return Result.Ok(closure());
        }
        catch (e) {
            return Result.Err(e);
        }
    }
    static Ok(value) {
        let result = new Result();
        result.ok = value;
        return result;
    }
    static Err(err) {
        let result = new Result();
        result.error = err;
        return result;
    }
    static All(first, second, third) {
        if (first.isErr()) {
            return first.intoErr();
        }
        if (second.isErr()) {
            return second.intoErr();
        }
        if (third.isErr()) {
            return third.intoErr();
        }
        return Result.Ok([first.unwrap(), second.unwrap(), third.unwrap()]);
    }
    isOk() {
        return this.ok != null;
    }
    isErr() {
        return this.error != null;
    }
    unwrap() {
        if (!this.isOk()) {
            throw new Error("Called 'unwrap' on a Result with an error.");
        }
        return this.ok;
    }
    unwrapErr() {
        if (!this.isErr()) {
            throw new Error("Called 'unwrapErr' on a Result with a value.");
        }
        return this.error;
    }
    map(func) {
        if (this.isOk()) {
            return Result.Ok(func(this.ok));
        }
        else {
            return this.intoErr();
        }
    }
    unwrapOr(val) {
        return this.isOk() ? this.ok : val;
    }
    intoErr() {
        return Result.Err(this.error);
    }
}

class TodoistApi {
    constructor(token) {
        this.token = token;
        this.metadata = writable({
            projects: new ExtendedMap(),
            sections: new ExtendedMap(),
            labels: new ExtendedMap(),
        });
        this.metadata.subscribe((value) => (this.metadataInstance = value));
    }
    async createTask(content, options) {
        const url = "https://api.todoist.com/rest/v1/tasks";
        const data = Object.assign({ content: content }, (options !== null && options !== void 0 ? options : {}));
        try {
            const result = await fetch(url, {
                method: "POST",
                headers: new Headers({
                    Authorization: `Bearer ${this.token}`,
                    "Content-Type": "application/json",
                }),
                body: JSON.stringify(data),
            });
            if (result.ok) {
                return Result.Ok({});
            }
            else {
                return Result.Err(new Error("Failed to create task"));
            }
        }
        catch (e) {
            return Result.Err(e);
        }
    }
    async getTasks(filter) {
        let url = "https://api.todoist.com/rest/v1/tasks";
        if (filter) {
            url += `?filter=${encodeURIComponent(filter)}`;
        }
        debug(url);
        try {
            const result = await fetch(url, {
                headers: new Headers({
                    Authorization: `Bearer ${this.token}`,
                }),
            });
            if (result.ok) {
                const tasks = (await result.json());
                const tree = Task.buildTree(tasks);
                debug({
                    msg: "Built task tree",
                    context: tree,
                });
                return Result.Ok(tree);
            }
            else {
                return Result.Err(new Error(await result.text()));
            }
        }
        catch (e) {
            return Result.Err(e);
        }
    }
    async getTasksGroupedByProject(filter) {
        let url = "https://api.todoist.com/rest/v1/tasks";
        if (filter) {
            url += `?filter=${encodeURIComponent(filter)}`;
        }
        try {
            const result = await fetch(url, {
                headers: new Headers({
                    Authorization: `Bearer ${this.token}`,
                }),
            });
            if (result.ok) {
                // Force the metadata to update.
                const metadataResult = await this.fetchMetadata();
                if (metadataResult.isErr()) {
                    return Result.Err(metadataResult.unwrapErr());
                }
                const tasks = (await result.json());
                const tree = Project.buildProjectTree(tasks, this.metadataInstance);
                debug({
                    msg: "Built project tree",
                    context: tree,
                });
                return Result.Ok(tree);
            }
            else {
                return Result.Err(new Error(await result.text()));
            }
        }
        catch (e) {
            return Result.Err(e);
        }
    }
    async closeTask(id) {
        const url = `https://api.todoist.com/rest/v1/tasks/${id}/close`;
        debug(url);
        const result = await fetch(url, {
            headers: new Headers({
                Authorization: `Bearer ${this.token}`,
            }),
            method: "POST",
        });
        return result.ok;
    }
    async fetchMetadata() {
        const [projectResult, sectionResult, labelResult] = await Promise.all([this.getProjects(), this.getSections(), this.getLabels()]);
        const merged = Result.All(projectResult, sectionResult, labelResult);
        if (merged.isErr()) {
            return merged.intoErr();
        }
        const [projects, sections, labels] = merged.unwrap();
        this.metadata.update((metadata) => {
            metadata.projects.clear();
            metadata.sections.clear();
            metadata.labels.clear();
            projects.forEach((prj) => metadata.projects.set(prj.id, prj));
            sections.forEach((sect) => metadata.sections.set(sect.id, sect));
            labels.forEach((label) => metadata.labels.set(label.id, label.name));
            return metadata;
        });
        return Result.Ok({});
    }
    async getProjects() {
        const url = `https://api.todoist.com/rest/v1/projects`;
        try {
            const result = await fetch(url, {
                headers: new Headers({
                    Authorization: `Bearer ${this.token}`,
                }),
                method: "GET",
            });
            return result.ok
                ? Result.Ok((await result.json()))
                : Result.Err(new Error(await result.text()));
        }
        catch (e) {
            return Result.Err(e);
        }
    }
    async getSections() {
        const url = `https://api.todoist.com/rest/v1/sections`;
        try {
            const result = await fetch(url, {
                headers: new Headers({
                    Authorization: `Bearer ${this.token}`,
                }),
                method: "GET",
            });
            return result.ok
                ? Result.Ok((await result.json()))
                : Result.Err(new Error(await result.text()));
        }
        catch (e) {
            return Result.Err(e);
        }
    }
    async getLabels() {
        const url = `https://api.todoist.com/rest/v1/labels`;
        try {
            const result = await fetch(url, {
                headers: new Headers({
                    Authorization: `Bearer ${this.token}`,
                }),
                method: "GET",
            });
            return result.ok
                ? Result.Ok((await result.json()))
                : Result.Err(new Error(await result.text()));
        }
        catch (e) {
            return Result.Err(e);
        }
    }
}

/* src/modals/enterToken/EnterTokenModalContent.svelte generated by Svelte v3.38.2 */

function create_fragment$j(ctx) {
	let div4;
	let div2;
	let t4;
	let div3;
	let input;
	let t5;
	let button;
	let mounted;
	let dispose;

	return {
		c() {
			div4 = element("div");
			div2 = element("div");

			div2.innerHTML = `<div class="setting-item-name">Todoist token</div> 
    <div class="setting-item-description"><span>You can find the token
        <a href="https://todoist.com/prefs/integrations">here!</a></span></div>`;

			t4 = space();
			div3 = element("div");
			input = element("input");
			t5 = space();
			button = element("button");
			button.textContent = "Submit";
			attr(div2, "class", "setting-item-info");
			attr(input, "type", "text");
			attr(input, "placeholder", "API token");
			attr(div3, "class", "setting-item-control");
			attr(div4, "class", "setting-item");
			attr(button, "class", "mod-cta");
			set_style(button, "float", "right");
		},
		m(target, anchor) {
			insert(target, div4, anchor);
			append(div4, div2);
			append(div4, t4);
			append(div4, div3);
			append(div3, input);
			/*input_binding*/ ctx[2](input);
			insert(target, t5, anchor);
			insert(target, button, anchor);

			if (!mounted) {
				dispose = listen(button, "click", /*click_handler*/ ctx[3]);
				mounted = true;
			}
		},
		p: noop,
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(div4);
			/*input_binding*/ ctx[2](null);
			if (detaching) detach(t5);
			if (detaching) detach(button);
			mounted = false;
			dispose();
		}
	};
}

function instance$h($$self, $$props, $$invalidate) {
	let { onSubmit } = $$props;
	let tokenInput;

	function input_binding($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](() => {
			tokenInput = $$value;
			$$invalidate(1, tokenInput);
		});
	}

	const click_handler = () => onSubmit(tokenInput.value);

	$$self.$$set = $$props => {
		if ("onSubmit" in $$props) $$invalidate(0, onSubmit = $$props.onSubmit);
	};

	return [onSubmit, tokenInput, input_binding, click_handler];
}

class EnterTokenModalContent extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$h, create_fragment$j, safe_not_equal, { onSubmit: 0 });
	}
}

class TodoistApiTokenModal extends obsidian.Modal {
    constructor(app) {
        super(app);
        this.token = "";
        this.waitForClose = new Promise((resolve) => (this.resolvePromise = resolve));
        this.titleEl.innerText = "Setup Todoist API token";
        this.modalContent = new EnterTokenModalContent({
            target: this.contentEl,
            props: {
                onSubmit: (value) => {
                    this.token = value;
                    this.close();
                },
            },
        });
        this.open();
    }
    onClose() {
        super.onClose();
        this.modalContent.$destroy();
        this.resolvePromise();
    }
}

/* src/modals/createTask/CalendarPicker.svelte generated by Svelte v3.38.2 */

function add_css$9() {
	var style = element("style");
	style.id = "svelte-pcqw36-style";
	style.textContent = ".week.svelte-pcqw36.svelte-pcqw36{display:flex}.week-header.svelte-pcqw36.svelte-pcqw36{border-bottom:1px solid var(--background-modifier-border)}.day.svelte-pcqw36.svelte-pcqw36{width:14.28%;text-align:center;height:1.5em}.past-day.svelte-pcqw36.svelte-pcqw36{color:var(--text-muted)}.selected-day.svelte-pcqw36.svelte-pcqw36{background-color:var(--background-secondary);color:var(--text-accent)}.day.svelte-pcqw36.svelte-pcqw36:not(:empty):hover{background-color:var(--background-secondary)}.month-controls.svelte-pcqw36.svelte-pcqw36{display:flex;justify-content:center;width:100%;margin-bottom:10px}.control-button.svelte-pcqw36.svelte-pcqw36{color:var(--text-muted)}.control-button.svelte-pcqw36>svg.svelte-pcqw36{height:20px;width:20px}.current-month.svelte-pcqw36.svelte-pcqw36{margin:0 10px}";
	append(document.head, style);
}

function get_each_context$8(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[12] = list[i];
	return child_ctx;
}

function get_each_context_1$1(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[15] = list[i];
	return child_ctx;
}

function get_each_context_2(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[18] = list[i];
	return child_ctx;
}

// (130:4) {#each daysOfWeek as dow}
function create_each_block_2(ctx) {
	let div;
	let t_value = /*dow*/ ctx[18] + "";
	let t;

	return {
		c() {
			div = element("div");
			t = text(t_value);
			attr(div, "class", "day svelte-pcqw36");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			append(div, t);
		},
		p: noop,
		d(detaching) {
			if (detaching) detach(div);
		}
	};
}

// (143:8) {:else}
function create_else_block$4(ctx) {
	let div;

	return {
		c() {
			div = element("div");
			attr(div, "class", "day svelte-pcqw36");
		},
		m(target, anchor) {
			insert(target, div, anchor);
		},
		p: noop,
		d(detaching) {
			if (detaching) detach(div);
		}
	};
}

// (137:8) {#if day}
function create_if_block$7(ctx) {
	let div;
	let t_value = /*day*/ ctx[15].date() + "";
	let t;
	let div_class_value;
	let mounted;
	let dispose;

	function click_handler() {
		return /*click_handler*/ ctx[10](/*day*/ ctx[15]);
	}

	return {
		c() {
			div = element("div");
			t = text(t_value);

			attr(div, "class", div_class_value = "day " + ((/*selected*/ ctx[0]?.isSame(/*day*/ ctx[15], "day"))
			? "selected-day"
			: "") + " " + (moment().isAfter(/*day*/ ctx[15], "day")
			? "past-day"
			: "") + " svelte-pcqw36");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			append(div, t);

			if (!mounted) {
				dispose = listen(div, "click", click_handler);
				mounted = true;
			}
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;
			if (dirty & /*monthData*/ 8 && t_value !== (t_value = /*day*/ ctx[15].date() + "")) set_data(t, t_value);

			if (dirty & /*selected, monthData*/ 9 && div_class_value !== (div_class_value = "day " + ((/*selected*/ ctx[0]?.isSame(/*day*/ ctx[15], "day"))
			? "selected-day"
			: "") + " " + (moment().isAfter(/*day*/ ctx[15], "day")
			? "past-day"
			: "") + " svelte-pcqw36")) {
				attr(div, "class", div_class_value);
			}
		},
		d(detaching) {
			if (detaching) detach(div);
			mounted = false;
			dispose();
		}
	};
}

// (136:6) {#each week as day}
function create_each_block_1$1(ctx) {
	let if_block_anchor;

	function select_block_type(ctx, dirty) {
		if (/*day*/ ctx[15]) return create_if_block$7;
		return create_else_block$4;
	}

	let current_block_type = select_block_type(ctx);
	let if_block = current_block_type(ctx);

	return {
		c() {
			if_block.c();
			if_block_anchor = empty();
		},
		m(target, anchor) {
			if_block.m(target, anchor);
			insert(target, if_block_anchor, anchor);
		},
		p(ctx, dirty) {
			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
				if_block.p(ctx, dirty);
			} else {
				if_block.d(1);
				if_block = current_block_type(ctx);

				if (if_block) {
					if_block.c();
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			}
		},
		d(detaching) {
			if_block.d(detaching);
			if (detaching) detach(if_block_anchor);
		}
	};
}

// (134:2) {#each monthData as week}
function create_each_block$8(ctx) {
	let div;
	let t;
	let each_value_1 = /*week*/ ctx[12];
	let each_blocks = [];

	for (let i = 0; i < each_value_1.length; i += 1) {
		each_blocks[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
	}

	return {
		c() {
			div = element("div");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			t = space();
			attr(div, "class", "week svelte-pcqw36");
		},
		m(target, anchor) {
			insert(target, div, anchor);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(div, null);
			}

			append(div, t);
		},
		p(ctx, dirty) {
			if (dirty & /*selected, monthData, moment, dispatch*/ 41) {
				each_value_1 = /*week*/ ctx[12];
				let i;

				for (i = 0; i < each_value_1.length; i += 1) {
					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block_1$1(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(div, t);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value_1.length;
			}
		},
		d(detaching) {
			if (detaching) detach(div);
			destroy_each(each_blocks, detaching);
		}
	};
}

function create_fragment$i(ctx) {
	let div0;
	let span0;
	let t0;
	let span1;
	let t1_value = moment(`${/*year*/ ctx[1]}-${/*month*/ ctx[2] + 1}-01 00:00:00`).format("MMM YYYY") + "";
	let t1;
	let t2;
	let span2;
	let t3;
	let div2;
	let div1;
	let t4;
	let mounted;
	let dispose;
	let each_value_2 = /*daysOfWeek*/ ctx[4];
	let each_blocks_1 = [];

	for (let i = 0; i < each_value_2.length; i += 1) {
		each_blocks_1[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
	}

	let each_value = /*monthData*/ ctx[3];
	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block$8(get_each_context$8(ctx, each_value, i));
	}

	return {
		c() {
			div0 = element("div");
			span0 = element("span");
			span0.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="svelte-pcqw36"><path fill-rule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd"></path></svg>`;
			t0 = space();
			span1 = element("span");
			t1 = text(t1_value);
			t2 = space();
			span2 = element("span");
			span2.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="svelte-pcqw36"><path fill-rule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clip-rule="evenodd"></path><path fill-rule="evenodd" d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clip-rule="evenodd"></path></svg>`;
			t3 = space();
			div2 = element("div");
			div1 = element("div");

			for (let i = 0; i < each_blocks_1.length; i += 1) {
				each_blocks_1[i].c();
			}

			t4 = space();

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			attr(span0, "class", "control-button svelte-pcqw36");
			attr(span1, "class", "current-month svelte-pcqw36");
			attr(span2, "class", "control-button svelte-pcqw36");
			attr(div0, "class", "month-controls svelte-pcqw36");
			attr(div1, "class", "week week-header svelte-pcqw36");
			attr(div2, "class", "month-display");
		},
		m(target, anchor) {
			insert(target, div0, anchor);
			append(div0, span0);
			append(div0, t0);
			append(div0, span1);
			append(span1, t1);
			append(div0, t2);
			append(div0, span2);
			insert(target, t3, anchor);
			insert(target, div2, anchor);
			append(div2, div1);

			for (let i = 0; i < each_blocks_1.length; i += 1) {
				each_blocks_1[i].m(div1, null);
			}

			append(div2, t4);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(div2, null);
			}

			if (!mounted) {
				dispose = [
					listen(span0, "click", /*decrementMonth*/ ctx[6]),
					listen(span2, "click", /*incrementMonth*/ ctx[7])
				];

				mounted = true;
			}
		},
		p(ctx, [dirty]) {
			if (dirty & /*year, month*/ 6 && t1_value !== (t1_value = moment(`${/*year*/ ctx[1]}-${/*month*/ ctx[2] + 1}-01 00:00:00`).format("MMM YYYY") + "")) set_data(t1, t1_value);

			if (dirty & /*daysOfWeek*/ 16) {
				each_value_2 = /*daysOfWeek*/ ctx[4];
				let i;

				for (i = 0; i < each_value_2.length; i += 1) {
					const child_ctx = get_each_context_2(ctx, each_value_2, i);

					if (each_blocks_1[i]) {
						each_blocks_1[i].p(child_ctx, dirty);
					} else {
						each_blocks_1[i] = create_each_block_2(child_ctx);
						each_blocks_1[i].c();
						each_blocks_1[i].m(div1, null);
					}
				}

				for (; i < each_blocks_1.length; i += 1) {
					each_blocks_1[i].d(1);
				}

				each_blocks_1.length = each_value_2.length;
			}

			if (dirty & /*monthData, selected, moment, dispatch*/ 41) {
				each_value = /*monthData*/ ctx[3];
				let i;

				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context$8(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block$8(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(div2, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value.length;
			}
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(div0);
			if (detaching) detach(t3);
			if (detaching) detach(div2);
			destroy_each(each_blocks_1, detaching);
			destroy_each(each_blocks, detaching);
			mounted = false;
			run_all(dispose);
		}
	};
}

function instance$g($$self, $$props, $$invalidate) {
	let year;
	let month;
	let monthData;
	var _a, _b;
	
	const daysOfWeek = ["S", "M", "T", "W", "T", "F", "S"];
	let { selected } = $$props;
	const dispatch = createEventDispatcher();

	function getMonthData(month, year) {
		let monthData = [];
		let day = moment(`${year}-${month + 1}-01 00:00:00`);
		let week = [];

		// Pad the front of the data with empty days in a week before the 1st of the month.
		for (let i = 0; i < day.day(); i++) {
			week.push(null);
		}

		// Fill in the weeks.
		while (day.month() == month) {
			week.push(day);
			day = day.clone().add(1, "day");

			if (week.length == 7) {
				monthData.push(week);
				week = [];
			}
		}

		// Now pad the end of the month such that the week is full.
		if (week.length != 0) {
			while (week.length != 7) {
				week.push(null);
			}

			monthData.push(week);
		}

		return monthData;
	}

	function decrementMonth() {
		$$invalidate(2, month -= 1);

		if (month == -1) {
			$$invalidate(2, month = 11);
			$$invalidate(1, year -= 1);
		}
	}

	function incrementMonth() {
		$$invalidate(2, month += 1);

		if (month == 12) {
			$$invalidate(2, month = 0);
			$$invalidate(1, year += 1);
		}
	}

	const click_handler = day => dispatch("selectDate", day);

	$$self.$$set = $$props => {
		if ("selected" in $$props) $$invalidate(0, selected = $$props.selected);
	};

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*selected, _a*/ 257) {
			$$invalidate(1, year = $$invalidate(8, _a = selected === null || selected === void 0
			? void 0
			: selected.year()) !== null && _a !== void 0
			? _a
			: moment().year());
		}

		if ($$self.$$.dirty & /*selected, _b*/ 513) {
			$$invalidate(2, month = $$invalidate(9, _b = selected === null || selected === void 0
			? void 0
			: selected.month()) !== null && _b !== void 0
			? _b
			: moment().month());
		}

		if ($$self.$$.dirty & /*month, year*/ 6) {
			$$invalidate(3, monthData = getMonthData(month, year));
		}
	};

	return [
		selected,
		year,
		month,
		monthData,
		daysOfWeek,
		dispatch,
		decrementMonth,
		incrementMonth,
		_a,
		_b,
		click_handler
	];
}

class CalendarPicker extends SvelteComponent {
	constructor(options) {
		super();
		if (!document.getElementById("svelte-pcqw36-style")) add_css$9();
		init(this, options, instance$g, create_fragment$i, safe_not_equal, { selected: 0 });
	}
}

/* src/modals/createTask/DateSelector.svelte generated by Svelte v3.38.2 */

const { document: document_1$1, window: window_1 } = globals;

function add_css$8() {
	var style = element("style");
	style.id = "svelte-1o0yf8o-style";
	style.textContent = ".date-input.svelte-1o0yf8o{border:1px solid var(--background-primary-alt);background-color:var(--background-modifier-form-field);line-height:42px}.date-input.svelte-1o0yf8o:hover{border:1px solid var(--interactive-accent);background-color:var(--background-modifier-form-highlighted)}.date-preview.svelte-1o0yf8o{margin-left:1em}.reset-date-button.svelte-1o0yf8o{float:right;height:42px;width:20px;margin-right:10px}.date-placeholder.svelte-1o0yf8o{margin-left:1em;color:var(--text-muted)}.drawer-target.svelte-1o0yf8o{position:absolute;z-index:2;height:auto;background-color:var(--background-primary)}.specific-date-option.svelte-1o0yf8o{height:42px;line-height:42px;padding:0 20px}.specific-date-option.svelte-1o0yf8o:hover{background-color:var(--background-secondary)}.calendar-container.svelte-1o0yf8o{padding:20px;border-top:2px solid var(--background-modifier-border)}";
	append(document_1$1.head, style);
}

// (136:2) {:else}
function create_else_block$3(ctx) {
	let span;

	return {
		c() {
			span = element("span");
			span.textContent = "No date selected.";
			attr(span, "class", "date-placeholder svelte-1o0yf8o");
		},
		m(target, anchor) {
			insert(target, span, anchor);
		},
		p: noop,
		d(detaching) {
			if (detaching) detach(span);
		}
	};
}

// (121:2) {#if selected}
function create_if_block_1$5(ctx) {
	let span0;
	let t0_value = /*selected*/ ctx[0].format("MMM D, YYYY") + "";
	let t0;
	let t1;
	let span1;
	let mounted;
	let dispose;

	return {
		c() {
			span0 = element("span");
			t0 = text(t0_value);
			t1 = space();
			span1 = element("span");

			span1.innerHTML = `<svg width="100%" height="100%" viewBox="-2 -2 50 50" focusable="false" role="presentation"><path fill="currentColor" d="M34.923,37.251L24,26.328L13.077,37.251L9.436,33.61l10.923-10.923L9.436,11.765l3.641-3.641L24,19.047L34.923,8.124
          l3.641,3.641L27.641,22.688L38.564,33.61L34.923,37.251z"></path></svg>`;

			attr(span0, "class", "date-preview svelte-1o0yf8o");
			attr(span1, "class", "reset-date-button svelte-1o0yf8o");
		},
		m(target, anchor) {
			insert(target, span0, anchor);
			append(span0, t0);
			insert(target, t1, anchor);
			insert(target, span1, anchor);

			if (!mounted) {
				dispose = listen(span1, "click", stop_propagation(/*click_handler*/ ctx[8]));
				mounted = true;
			}
		},
		p(ctx, dirty) {
			if (dirty & /*selected*/ 1 && t0_value !== (t0_value = /*selected*/ ctx[0].format("MMM D, YYYY") + "")) set_data(t0, t0_value);
		},
		d(detaching) {
			if (detaching) detach(span0);
			if (detaching) detach(t1);
			if (detaching) detach(span1);
			mounted = false;
			dispose();
		}
	};
}

// (139:2) {#if drawerOpen}
function create_if_block$6(ctx) {
	let div3;
	let div0;
	let t1;
	let div1;
	let t3;
	let div2;
	let calendarpicker;
	let current;
	let mounted;
	let dispose;
	calendarpicker = new CalendarPicker({ props: { selected: /*selected*/ ctx[0] } });
	calendarpicker.$on("selectDate", /*selectDate_handler*/ ctx[12]);

	return {
		c() {
			div3 = element("div");
			div0 = element("div");
			div0.textContent = "Today";
			t1 = space();
			div1 = element("div");
			div1.textContent = "Tomorrow";
			t3 = space();
			div2 = element("div");
			create_component(calendarpicker.$$.fragment);
			attr(div0, "class", "specific-date-option svelte-1o0yf8o");
			attr(div1, "class", "specific-date-option svelte-1o0yf8o");
			attr(div2, "class", "calendar-container svelte-1o0yf8o");
			attr(div3, "class", "drawer-target svelte-1o0yf8o");
		},
		m(target, anchor) {
			insert(target, div3, anchor);
			append(div3, div0);
			append(div3, t1);
			append(div3, div1);
			append(div3, t3);
			append(div3, div2);
			mount_component(calendarpicker, div2, null);
			/*div3_binding*/ ctx[13](div3);
			current = true;

			if (!mounted) {
				dispose = [
					listen(div0, "click", /*click_handler_2*/ ctx[10]),
					listen(div1, "click", /*click_handler_3*/ ctx[11]),
					action_destroyer(/*resizeDrawer*/ ctx[7].call(null, div3))
				];

				mounted = true;
			}
		},
		p(ctx, dirty) {
			const calendarpicker_changes = {};
			if (dirty & /*selected*/ 1) calendarpicker_changes.selected = /*selected*/ ctx[0];
			calendarpicker.$set(calendarpicker_changes);
		},
		i(local) {
			if (current) return;
			transition_in(calendarpicker.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(calendarpicker.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(div3);
			destroy_component(calendarpicker);
			/*div3_binding*/ ctx[13](null);
			mounted = false;
			run_all(dispose);
		}
	};
}

function create_fragment$h(ctx) {
	let div0;
	let t;
	let div1;
	let current;
	let mounted;
	let dispose;

	function select_block_type(ctx, dirty) {
		if (/*selected*/ ctx[0]) return create_if_block_1$5;
		return create_else_block$3;
	}

	let current_block_type = select_block_type(ctx);
	let if_block0 = current_block_type(ctx);
	let if_block1 = /*drawerOpen*/ ctx[3] && create_if_block$6(ctx);

	return {
		c() {
			div0 = element("div");
			if_block0.c();
			t = space();
			div1 = element("div");
			if (if_block1) if_block1.c();
			attr(div0, "class", "date-input svelte-1o0yf8o");
			attr(div1, "class", "drawer-container");
		},
		m(target, anchor) {
			insert(target, div0, anchor);
			if_block0.m(div0, null);
			insert(target, t, anchor);
			insert(target, div1, anchor);
			if (if_block1) if_block1.m(div1, null);
			/*div1_binding*/ ctx[14](div1);
			current = true;

			if (!mounted) {
				dispose = [
					listen(window_1, "resize", /*trackPosition*/ ctx[6]),
					listen(window_1, "click", /*handleWindowClick*/ ctx[5]),
					listen(div0, "click", /*click_handler_1*/ ctx[9])
				];

				mounted = true;
			}
		},
		p(ctx, [dirty]) {
			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
				if_block0.p(ctx, dirty);
			} else {
				if_block0.d(1);
				if_block0 = current_block_type(ctx);

				if (if_block0) {
					if_block0.c();
					if_block0.m(div0, null);
				}
			}

			if (/*drawerOpen*/ ctx[3]) {
				if (if_block1) {
					if_block1.p(ctx, dirty);

					if (dirty & /*drawerOpen*/ 8) {
						transition_in(if_block1, 1);
					}
				} else {
					if_block1 = create_if_block$6(ctx);
					if_block1.c();
					transition_in(if_block1, 1);
					if_block1.m(div1, null);
				}
			} else if (if_block1) {
				group_outros();

				transition_out(if_block1, 1, 1, () => {
					if_block1 = null;
				});

				check_outros();
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block1);
			current = true;
		},
		o(local) {
			transition_out(if_block1);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(div0);
			if_block0.d();
			if (detaching) detach(t);
			if (detaching) detach(div1);
			if (if_block1) if_block1.d();
			/*div1_binding*/ ctx[14](null);
			mounted = false;
			run_all(dispose);
		}
	};
}

function isOutOfViewport$1(elem) {
	const bounding = elem.getBoundingClientRect();

	const out = {
		top: false,
		left: false,
		bottom: false,
		right: false,
		any: false
	};

	out.top = bounding.top < 0;
	out.left = bounding.left < 0;
	out.bottom = bounding.bottom > (window.innerHeight || document.documentElement.clientHeight);
	out.right = bounding.right > (window.innerWidth || document.documentElement.clientWidth);
	out.any = out.top || out.left || out.bottom || out.right;
	return out;
}

function instance$f($$self, $$props, $$invalidate) {
	
	let { selected = null } = $$props;
	let container = null;
	let target = null;
	let drawerOpen = false;

	function setDate(date) {
		$$invalidate(0, selected = date);
		$$invalidate(3, drawerOpen = false);
	}

	function handleWindowClick(ev) {
		if (!drawerOpen || !target) {
			return;
		}

		const eventPath = ev.composedPath();
		const eventTarget = eventPath.length > 0 ? eventPath[0] : ev.target;

		if (target.contains(eventTarget)) {
			return;
		}

		$$invalidate(3, drawerOpen = false);
	}

	function trackPosition() {
		if (!target || !container) {
			return;
		}

		const { height, width } = container.getBoundingClientRect();
		$$invalidate(2, target.style.minWidth = `${width}px`, target);
		$$invalidate(2, target.style.width = "auto", target);

		if (isOutOfViewport$1(target).bottom) {
			$$invalidate(2, target.style.bottom = `${height + 5}px`, target);
		}
	}

	const resizeDrawer = element => {
		$$invalidate(2, target = element);
		trackPosition();
	};

	const click_handler = () => {
		setDate(null);
	};

	const click_handler_1 = ev => {
		if (!drawerOpen) {
			ev.stopPropagation();
			$$invalidate(3, drawerOpen = true);
		}
	};

	const click_handler_2 = () => {
		setDate(moment());
	};

	const click_handler_3 = () => {
		setDate(moment().add(1, "day"));
	};

	const selectDate_handler = ev => setDate(ev.detail);

	function div3_binding($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](() => {
			target = $$value;
			$$invalidate(2, target);
		});
	}

	function div1_binding($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](() => {
			container = $$value;
			$$invalidate(1, container);
		});
	}

	$$self.$$set = $$props => {
		if ("selected" in $$props) $$invalidate(0, selected = $$props.selected);
	};

	return [
		selected,
		container,
		target,
		drawerOpen,
		setDate,
		handleWindowClick,
		trackPosition,
		resizeDrawer,
		click_handler,
		click_handler_1,
		click_handler_2,
		click_handler_3,
		selectDate_handler,
		div3_binding,
		div1_binding
	];
}

class DateSelector extends SvelteComponent {
	constructor(options) {
		super();
		if (!document_1$1.getElementById("svelte-1o0yf8o-style")) add_css$8();
		init(this, options, instance$f, create_fragment$h, safe_not_equal, { selected: 0 });
	}
}

/* node_modules/svelte-select/src/Item.svelte generated by Svelte v3.38.2 */

function add_css$7() {
	var style = element("style");
	style.id = "svelte-bdnybl-style";
	style.textContent = ".item.svelte-bdnybl{cursor:default;height:var(--height, 42px);line-height:var(--height, 42px);padding:var(--itemPadding, 0 20px);color:var(--itemColor, inherit);text-overflow:ellipsis;overflow:hidden;white-space:nowrap}.groupHeader.svelte-bdnybl{text-transform:var(--groupTitleTextTransform, uppercase)}.groupItem.svelte-bdnybl{padding-left:var(--groupItemPaddingLeft, 40px)}.item.svelte-bdnybl:active{background:var(--itemActiveBackground, #b9daff)}.item.active.svelte-bdnybl{background:var(--itemIsActiveBG, #007aff);color:var(--itemIsActiveColor, #fff)}.item.first.svelte-bdnybl{border-radius:var(--itemFirstBorderRadius, 4px 4px 0 0)}.item.hover.svelte-bdnybl:not(.active){background:var(--itemHoverBG, #e7f2ff)}";
	append(document.head, style);
}

function create_fragment$g(ctx) {
	let div;
	let raw_value = /*getOptionLabel*/ ctx[0](/*item*/ ctx[1], /*filterText*/ ctx[2]) + "";
	let div_class_value;

	return {
		c() {
			div = element("div");
			attr(div, "class", div_class_value = "item " + /*itemClasses*/ ctx[3] + " svelte-bdnybl");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			div.innerHTML = raw_value;
		},
		p(ctx, [dirty]) {
			if (dirty & /*getOptionLabel, item, filterText*/ 7 && raw_value !== (raw_value = /*getOptionLabel*/ ctx[0](/*item*/ ctx[1], /*filterText*/ ctx[2]) + "")) div.innerHTML = raw_value;
			if (dirty & /*itemClasses*/ 8 && div_class_value !== (div_class_value = "item " + /*itemClasses*/ ctx[3] + " svelte-bdnybl")) {
				attr(div, "class", div_class_value);
			}
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(div);
		}
	};
}

function instance$e($$self, $$props, $$invalidate) {
	let { isActive = false } = $$props;
	let { isFirst = false } = $$props;
	let { isHover = false } = $$props;
	let { getOptionLabel = undefined } = $$props;
	let { item = undefined } = $$props;
	let { filterText = "" } = $$props;
	let itemClasses = "";

	$$self.$$set = $$props => {
		if ("isActive" in $$props) $$invalidate(4, isActive = $$props.isActive);
		if ("isFirst" in $$props) $$invalidate(5, isFirst = $$props.isFirst);
		if ("isHover" in $$props) $$invalidate(6, isHover = $$props.isHover);
		if ("getOptionLabel" in $$props) $$invalidate(0, getOptionLabel = $$props.getOptionLabel);
		if ("item" in $$props) $$invalidate(1, item = $$props.item);
		if ("filterText" in $$props) $$invalidate(2, filterText = $$props.filterText);
	};

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*isActive, isFirst, isHover, item*/ 114) {
			{
				const classes = [];

				if (isActive) {
					classes.push("active");
				}

				if (isFirst) {
					classes.push("first");
				}

				if (isHover) {
					classes.push("hover");
				}

				if (item.isGroupHeader) {
					classes.push("groupHeader");
				}

				if (item.isGroupItem) {
					classes.push("groupItem");
				}

				$$invalidate(3, itemClasses = classes.join(" "));
			}
		}
	};

	return [getOptionLabel, item, filterText, itemClasses, isActive, isFirst, isHover];
}

class Item extends SvelteComponent {
	constructor(options) {
		super();
		if (!document.getElementById("svelte-bdnybl-style")) add_css$7();

		init(this, options, instance$e, create_fragment$g, safe_not_equal, {
			isActive: 4,
			isFirst: 5,
			isHover: 6,
			getOptionLabel: 0,
			item: 1,
			filterText: 2
		});
	}
}

/* node_modules/svelte-select/src/VirtualList.svelte generated by Svelte v3.38.2 */

function add_css$6() {
	var style = element("style");
	style.id = "svelte-p6ehlv-style";
	style.textContent = "svelte-virtual-list-viewport.svelte-p6ehlv{position:relative;overflow-y:auto;-webkit-overflow-scrolling:touch;display:block}svelte-virtual-list-contents.svelte-p6ehlv,svelte-virtual-list-row.svelte-p6ehlv{display:block}svelte-virtual-list-row.svelte-p6ehlv{overflow:hidden}";
	append(document.head, style);
}

function get_each_context$7(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[23] = list[i];
	return child_ctx;
}

const get_default_slot_changes = dirty => ({
	item: dirty & /*visible*/ 32,
	i: dirty & /*visible*/ 32,
	hoverItemIndex: dirty & /*hoverItemIndex*/ 2
});

const get_default_slot_context = ctx => ({
	item: /*row*/ ctx[23].data,
	i: /*row*/ ctx[23].index,
	hoverItemIndex: /*hoverItemIndex*/ ctx[1]
});

// (160:57) Missing template
function fallback_block(ctx) {
	let t;

	return {
		c() {
			t = text("Missing template");
		},
		m(target, anchor) {
			insert(target, t, anchor);
		},
		d(detaching) {
			if (detaching) detach(t);
		}
	};
}

// (158:2) {#each visible as row (row.index)}
function create_each_block$7(key_1, ctx) {
	let svelte_virtual_list_row;
	let t;
	let current;
	const default_slot_template = /*#slots*/ ctx[15].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[14], get_default_slot_context);
	const default_slot_or_fallback = default_slot || fallback_block();

	return {
		key: key_1,
		first: null,
		c() {
			svelte_virtual_list_row = element("svelte-virtual-list-row");
			if (default_slot_or_fallback) default_slot_or_fallback.c();
			t = space();
			set_custom_element_data(svelte_virtual_list_row, "class", "svelte-p6ehlv");
			this.first = svelte_virtual_list_row;
		},
		m(target, anchor) {
			insert(target, svelte_virtual_list_row, anchor);

			if (default_slot_or_fallback) {
				default_slot_or_fallback.m(svelte_virtual_list_row, null);
			}

			append(svelte_virtual_list_row, t);
			current = true;
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;

			if (default_slot) {
				if (default_slot.p && (!current || dirty & /*$$scope, visible, hoverItemIndex*/ 16418)) {
					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[14], dirty, get_default_slot_changes, get_default_slot_context);
				}
			}
		},
		i(local) {
			if (current) return;
			transition_in(default_slot_or_fallback, local);
			current = true;
		},
		o(local) {
			transition_out(default_slot_or_fallback, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(svelte_virtual_list_row);
			if (default_slot_or_fallback) default_slot_or_fallback.d(detaching);
		}
	};
}

function create_fragment$f(ctx) {
	let svelte_virtual_list_viewport;
	let svelte_virtual_list_contents;
	let each_blocks = [];
	let each_1_lookup = new Map();
	let svelte_virtual_list_viewport_resize_listener;
	let current;
	let mounted;
	let dispose;
	let each_value = /*visible*/ ctx[5];
	const get_key = ctx => /*row*/ ctx[23].index;

	for (let i = 0; i < each_value.length; i += 1) {
		let child_ctx = get_each_context$7(ctx, each_value, i);
		let key = get_key(child_ctx);
		each_1_lookup.set(key, each_blocks[i] = create_each_block$7(key, child_ctx));
	}

	return {
		c() {
			svelte_virtual_list_viewport = element("svelte-virtual-list-viewport");
			svelte_virtual_list_contents = element("svelte-virtual-list-contents");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			set_style(svelte_virtual_list_contents, "padding-top", /*top*/ ctx[6] + "px");
			set_style(svelte_virtual_list_contents, "padding-bottom", /*bottom*/ ctx[7] + "px");
			set_custom_element_data(svelte_virtual_list_contents, "class", "svelte-p6ehlv");
			set_style(svelte_virtual_list_viewport, "height", /*height*/ ctx[0]);
			set_custom_element_data(svelte_virtual_list_viewport, "class", "svelte-p6ehlv");
			add_render_callback(() => /*svelte_virtual_list_viewport_elementresize_handler*/ ctx[18].call(svelte_virtual_list_viewport));
		},
		m(target, anchor) {
			insert(target, svelte_virtual_list_viewport, anchor);
			append(svelte_virtual_list_viewport, svelte_virtual_list_contents);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(svelte_virtual_list_contents, null);
			}

			/*svelte_virtual_list_contents_binding*/ ctx[16](svelte_virtual_list_contents);
			/*svelte_virtual_list_viewport_binding*/ ctx[17](svelte_virtual_list_viewport);
			svelte_virtual_list_viewport_resize_listener = add_resize_listener(svelte_virtual_list_viewport, /*svelte_virtual_list_viewport_elementresize_handler*/ ctx[18].bind(svelte_virtual_list_viewport));
			current = true;

			if (!mounted) {
				dispose = listen(svelte_virtual_list_viewport, "scroll", /*handle_scroll*/ ctx[8]);
				mounted = true;
			}
		},
		p(ctx, [dirty]) {
			if (dirty & /*$$scope, visible, hoverItemIndex*/ 16418) {
				each_value = /*visible*/ ctx[5];
				group_outros();
				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, svelte_virtual_list_contents, outro_and_destroy_block, create_each_block$7, null, get_each_context$7);
				check_outros();
			}

			if (!current || dirty & /*top*/ 64) {
				set_style(svelte_virtual_list_contents, "padding-top", /*top*/ ctx[6] + "px");
			}

			if (!current || dirty & /*bottom*/ 128) {
				set_style(svelte_virtual_list_contents, "padding-bottom", /*bottom*/ ctx[7] + "px");
			}

			if (!current || dirty & /*height*/ 1) {
				set_style(svelte_virtual_list_viewport, "height", /*height*/ ctx[0]);
			}
		},
		i(local) {
			if (current) return;

			for (let i = 0; i < each_value.length; i += 1) {
				transition_in(each_blocks[i]);
			}

			current = true;
		},
		o(local) {
			for (let i = 0; i < each_blocks.length; i += 1) {
				transition_out(each_blocks[i]);
			}

			current = false;
		},
		d(detaching) {
			if (detaching) detach(svelte_virtual_list_viewport);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].d();
			}

			/*svelte_virtual_list_contents_binding*/ ctx[16](null);
			/*svelte_virtual_list_viewport_binding*/ ctx[17](null);
			svelte_virtual_list_viewport_resize_listener();
			mounted = false;
			dispose();
		}
	};
}

function instance$d($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	let { items = undefined } = $$props;
	let { height = "100%" } = $$props;
	let { itemHeight = 40 } = $$props;
	let { hoverItemIndex = 0 } = $$props;
	let { start = 0 } = $$props;
	let { end = 0 } = $$props;

	// local state
	let height_map = [];

	let rows;
	let viewport;
	let contents;
	let viewport_height = 0;
	let visible;
	let mounted;
	let top = 0;
	let bottom = 0;
	let average_height;

	async function refresh(items, viewport_height, itemHeight) {
		const { scrollTop } = viewport;
		await tick(); // wait until the DOM is up to date
		let content_height = top - scrollTop;
		let i = start;

		while (content_height < viewport_height && i < items.length) {
			let row = rows[i - start];

			if (!row) {
				$$invalidate(10, end = i + 1);
				await tick(); // render the newly visible row
				row = rows[i - start];
			}

			const row_height = height_map[i] = itemHeight || row.offsetHeight;
			content_height += row_height;
			i += 1;
		}

		$$invalidate(10, end = i);
		const remaining = items.length - end;
		average_height = (top + content_height) / end;
		$$invalidate(7, bottom = remaining * average_height);
		height_map.length = items.length;
		$$invalidate(3, viewport.scrollTop = 0, viewport);
	}

	async function handle_scroll() {
		const { scrollTop } = viewport;
		const old_start = start;

		for (let v = 0; v < rows.length; v += 1) {
			height_map[start + v] = itemHeight || rows[v].offsetHeight;
		}

		let i = 0;
		let y = 0;

		while (i < items.length) {
			const row_height = height_map[i] || average_height;

			if (y + row_height > scrollTop) {
				$$invalidate(9, start = i);
				$$invalidate(6, top = y);
				break;
			}

			y += row_height;
			i += 1;
		}

		while (i < items.length) {
			y += height_map[i] || average_height;
			i += 1;
			if (y > scrollTop + viewport_height) break;
		}

		$$invalidate(10, end = i);
		const remaining = items.length - end;
		average_height = y / end;
		while (i < items.length) height_map[i++] = average_height;
		$$invalidate(7, bottom = remaining * average_height);

		// prevent jumping if we scrolled up into unknown territory
		if (start < old_start) {
			await tick();
			let expected_height = 0;
			let actual_height = 0;

			for (let i = start; i < old_start; i += 1) {
				if (rows[i - start]) {
					expected_height += height_map[i];
					actual_height += itemHeight || rows[i - start].offsetHeight;
				}
			}

			const d = actual_height - expected_height;
			viewport.scrollTo(0, scrollTop + d);
		}
	} // TODO if we overestimated the space these
	// rows would occupy we may need to add some

	// more. maybe we can just call handle_scroll again?
	// trigger initial refresh
	onMount(() => {
		rows = contents.getElementsByTagName("svelte-virtual-list-row");
		$$invalidate(13, mounted = true);
	});

	function svelte_virtual_list_contents_binding($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](() => {
			contents = $$value;
			$$invalidate(4, contents);
		});
	}

	function svelte_virtual_list_viewport_binding($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](() => {
			viewport = $$value;
			$$invalidate(3, viewport);
		});
	}

	function svelte_virtual_list_viewport_elementresize_handler() {
		viewport_height = this.offsetHeight;
		$$invalidate(2, viewport_height);
	}

	$$self.$$set = $$props => {
		if ("items" in $$props) $$invalidate(11, items = $$props.items);
		if ("height" in $$props) $$invalidate(0, height = $$props.height);
		if ("itemHeight" in $$props) $$invalidate(12, itemHeight = $$props.itemHeight);
		if ("hoverItemIndex" in $$props) $$invalidate(1, hoverItemIndex = $$props.hoverItemIndex);
		if ("start" in $$props) $$invalidate(9, start = $$props.start);
		if ("end" in $$props) $$invalidate(10, end = $$props.end);
		if ("$$scope" in $$props) $$invalidate(14, $$scope = $$props.$$scope);
	};

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*items, start, end*/ 3584) {
			$$invalidate(5, visible = items.slice(start, end).map((data, i) => {
				return { index: i + start, data };
			}));
		}

		if ($$self.$$.dirty & /*mounted, items, viewport_height, itemHeight*/ 14340) {
			// whenever `items` changes, invalidate the current heightmap
			if (mounted) refresh(items, viewport_height, itemHeight);
		}
	};

	return [
		height,
		hoverItemIndex,
		viewport_height,
		viewport,
		contents,
		visible,
		top,
		bottom,
		handle_scroll,
		start,
		end,
		items,
		itemHeight,
		mounted,
		$$scope,
		slots,
		svelte_virtual_list_contents_binding,
		svelte_virtual_list_viewport_binding,
		svelte_virtual_list_viewport_elementresize_handler
	];
}

class VirtualList extends SvelteComponent {
	constructor(options) {
		super();
		if (!document.getElementById("svelte-p6ehlv-style")) add_css$6();

		init(this, options, instance$d, create_fragment$f, safe_not_equal, {
			items: 11,
			height: 0,
			itemHeight: 12,
			hoverItemIndex: 1,
			start: 9,
			end: 10
		});
	}
}

/* node_modules/svelte-select/src/List.svelte generated by Svelte v3.38.2 */

function add_css$5() {
	var style = element("style");
	style.id = "svelte-ux0sbr-style";
	style.textContent = ".listContainer.svelte-ux0sbr{box-shadow:var(--listShadow, 0 2px 3px 0 rgba(44, 62, 80, 0.24));border-radius:var(--listBorderRadius, 4px);max-height:var(--listMaxHeight, 250px);overflow-y:auto;background:var(--listBackground, #fff)}.virtualList.svelte-ux0sbr{height:var(--virtualListHeight, 200px)}.listGroupTitle.svelte-ux0sbr{color:var(--groupTitleColor, #8f8f8f);cursor:default;font-size:var(--groupTitleFontSize, 12px);font-weight:var(--groupTitleFontWeight, 600);height:var(--height, 42px);line-height:var(--height, 42px);padding:var(--groupTitlePadding, 0 20px);text-overflow:ellipsis;overflow-x:hidden;white-space:nowrap;text-transform:var(--groupTitleTextTransform, uppercase)}.empty.svelte-ux0sbr{text-align:var(--listEmptyTextAlign, center);padding:var(--listEmptyPadding, 20px 0);color:var(--listEmptyColor, #78848F)}";
	append(document.head, style);
}

function get_each_context$6(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[34] = list[i];
	child_ctx[36] = i;
	return child_ctx;
}

// (210:0) {#if isVirtualList}
function create_if_block_3$3(ctx) {
	let div;
	let virtuallist;
	let current;

	virtuallist = new VirtualList({
			props: {
				items: /*items*/ ctx[4],
				itemHeight: /*itemHeight*/ ctx[7],
				$$slots: {
					default: [
						create_default_slot,
						({ item, i }) => ({ 34: item, 36: i }),
						({ item, i }) => [0, (item ? 8 : 0) | (i ? 32 : 0)]
					]
				},
				$$scope: { ctx }
			}
		});

	return {
		c() {
			div = element("div");
			create_component(virtuallist.$$.fragment);
			attr(div, "class", "listContainer virtualList svelte-ux0sbr");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			mount_component(virtuallist, div, null);
			/*div_binding*/ ctx[20](div);
			current = true;
		},
		p(ctx, dirty) {
			const virtuallist_changes = {};
			if (dirty[0] & /*items*/ 16) virtuallist_changes.items = /*items*/ ctx[4];
			if (dirty[0] & /*itemHeight*/ 128) virtuallist_changes.itemHeight = /*itemHeight*/ ctx[7];

			if (dirty[0] & /*Item, filterText, getOptionLabel, selectedValue, optionIdentifier, hoverItemIndex, items*/ 4918 | dirty[1] & /*$$scope, item, i*/ 104) {
				virtuallist_changes.$$scope = { dirty, ctx };
			}

			virtuallist.$set(virtuallist_changes);
		},
		i(local) {
			if (current) return;
			transition_in(virtuallist.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(virtuallist.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(div);
			destroy_component(virtuallist);
			/*div_binding*/ ctx[20](null);
		}
	};
}

// (213:2) <VirtualList {items} {itemHeight} let:item let:i>
function create_default_slot(ctx) {
	let div;
	let switch_instance;
	let current;
	let mounted;
	let dispose;
	var switch_value = /*Item*/ ctx[2];

	function switch_props(ctx) {
		return {
			props: {
				item: /*item*/ ctx[34],
				filterText: /*filterText*/ ctx[12],
				getOptionLabel: /*getOptionLabel*/ ctx[5],
				isFirst: isItemFirst(/*i*/ ctx[36]),
				isActive: isItemActive(/*item*/ ctx[34], /*selectedValue*/ ctx[8], /*optionIdentifier*/ ctx[9]),
				isHover: isItemHover(/*hoverItemIndex*/ ctx[1], /*item*/ ctx[34], /*i*/ ctx[36], /*items*/ ctx[4])
			}
		};
	}

	if (switch_value) {
		switch_instance = new switch_value(switch_props(ctx));
	}

	function mouseover_handler() {
		return /*mouseover_handler*/ ctx[18](/*i*/ ctx[36]);
	}

	function click_handler(...args) {
		return /*click_handler*/ ctx[19](/*item*/ ctx[34], /*i*/ ctx[36], ...args);
	}

	return {
		c() {
			div = element("div");
			if (switch_instance) create_component(switch_instance.$$.fragment);
			attr(div, "class", "listItem");
		},
		m(target, anchor) {
			insert(target, div, anchor);

			if (switch_instance) {
				mount_component(switch_instance, div, null);
			}

			current = true;

			if (!mounted) {
				dispose = [
					listen(div, "mouseover", mouseover_handler),
					listen(div, "click", click_handler)
				];

				mounted = true;
			}
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;
			const switch_instance_changes = {};
			if (dirty[1] & /*item*/ 8) switch_instance_changes.item = /*item*/ ctx[34];
			if (dirty[0] & /*filterText*/ 4096) switch_instance_changes.filterText = /*filterText*/ ctx[12];
			if (dirty[0] & /*getOptionLabel*/ 32) switch_instance_changes.getOptionLabel = /*getOptionLabel*/ ctx[5];
			if (dirty[1] & /*i*/ 32) switch_instance_changes.isFirst = isItemFirst(/*i*/ ctx[36]);
			if (dirty[0] & /*selectedValue, optionIdentifier*/ 768 | dirty[1] & /*item*/ 8) switch_instance_changes.isActive = isItemActive(/*item*/ ctx[34], /*selectedValue*/ ctx[8], /*optionIdentifier*/ ctx[9]);
			if (dirty[0] & /*hoverItemIndex, items*/ 18 | dirty[1] & /*item, i*/ 40) switch_instance_changes.isHover = isItemHover(/*hoverItemIndex*/ ctx[1], /*item*/ ctx[34], /*i*/ ctx[36], /*items*/ ctx[4]);

			if (switch_value !== (switch_value = /*Item*/ ctx[2])) {
				if (switch_instance) {
					group_outros();
					const old_component = switch_instance;

					transition_out(old_component.$$.fragment, 1, 0, () => {
						destroy_component(old_component, 1);
					});

					check_outros();
				}

				if (switch_value) {
					switch_instance = new switch_value(switch_props(ctx));
					create_component(switch_instance.$$.fragment);
					transition_in(switch_instance.$$.fragment, 1);
					mount_component(switch_instance, div, null);
				} else {
					switch_instance = null;
				}
			} else if (switch_value) {
				switch_instance.$set(switch_instance_changes);
			}
		},
		i(local) {
			if (current) return;
			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
			current = true;
		},
		o(local) {
			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(div);
			if (switch_instance) destroy_component(switch_instance);
			mounted = false;
			run_all(dispose);
		}
	};
}

// (232:0) {#if !isVirtualList}
function create_if_block$5(ctx) {
	let div;
	let current;
	let each_value = /*items*/ ctx[4];
	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block$6(get_each_context$6(ctx, each_value, i));
	}

	const out = i => transition_out(each_blocks[i], 1, 1, () => {
		each_blocks[i] = null;
	});

	let each_1_else = null;

	if (!each_value.length) {
		each_1_else = create_else_block_1$2(ctx);
	}

	return {
		c() {
			div = element("div");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			if (each_1_else) {
				each_1_else.c();
			}

			attr(div, "class", "listContainer svelte-ux0sbr");
		},
		m(target, anchor) {
			insert(target, div, anchor);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(div, null);
			}

			if (each_1_else) {
				each_1_else.m(div, null);
			}

			/*div_binding_1*/ ctx[23](div);
			current = true;
		},
		p(ctx, dirty) {
			if (dirty[0] & /*getGroupHeaderLabel, items, handleHover, handleClick, Item, filterText, getOptionLabel, selectedValue, optionIdentifier, hoverItemIndex, noOptionsMessage, hideEmptyState*/ 32630) {
				each_value = /*items*/ ctx[4];
				let i;

				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context$6(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
						transition_in(each_blocks[i], 1);
					} else {
						each_blocks[i] = create_each_block$6(child_ctx);
						each_blocks[i].c();
						transition_in(each_blocks[i], 1);
						each_blocks[i].m(div, null);
					}
				}

				group_outros();

				for (i = each_value.length; i < each_blocks.length; i += 1) {
					out(i);
				}

				check_outros();

				if (!each_value.length && each_1_else) {
					each_1_else.p(ctx, dirty);
				} else if (!each_value.length) {
					each_1_else = create_else_block_1$2(ctx);
					each_1_else.c();
					each_1_else.m(div, null);
				} else if (each_1_else) {
					each_1_else.d(1);
					each_1_else = null;
				}
			}
		},
		i(local) {
			if (current) return;

			for (let i = 0; i < each_value.length; i += 1) {
				transition_in(each_blocks[i]);
			}

			current = true;
		},
		o(local) {
			each_blocks = each_blocks.filter(Boolean);

			for (let i = 0; i < each_blocks.length; i += 1) {
				transition_out(each_blocks[i]);
			}

			current = false;
		},
		d(detaching) {
			if (detaching) detach(div);
			destroy_each(each_blocks, detaching);
			if (each_1_else) each_1_else.d();
			/*div_binding_1*/ ctx[23](null);
		}
	};
}

// (254:2) {:else}
function create_else_block_1$2(ctx) {
	let if_block_anchor;
	let if_block = !/*hideEmptyState*/ ctx[10] && create_if_block_2$3(ctx);

	return {
		c() {
			if (if_block) if_block.c();
			if_block_anchor = empty();
		},
		m(target, anchor) {
			if (if_block) if_block.m(target, anchor);
			insert(target, if_block_anchor, anchor);
		},
		p(ctx, dirty) {
			if (!/*hideEmptyState*/ ctx[10]) {
				if (if_block) {
					if_block.p(ctx, dirty);
				} else {
					if_block = create_if_block_2$3(ctx);
					if_block.c();
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}
		},
		d(detaching) {
			if (if_block) if_block.d(detaching);
			if (detaching) detach(if_block_anchor);
		}
	};
}

// (255:4) {#if !hideEmptyState}
function create_if_block_2$3(ctx) {
	let div;
	let t;

	return {
		c() {
			div = element("div");
			t = text(/*noOptionsMessage*/ ctx[11]);
			attr(div, "class", "empty svelte-ux0sbr");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			append(div, t);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*noOptionsMessage*/ 2048) set_data(t, /*noOptionsMessage*/ ctx[11]);
		},
		d(detaching) {
			if (detaching) detach(div);
		}
	};
}

// (237:4) { :else }
function create_else_block$2(ctx) {
	let div;
	let switch_instance;
	let t;
	let current;
	let mounted;
	let dispose;
	var switch_value = /*Item*/ ctx[2];

	function switch_props(ctx) {
		return {
			props: {
				item: /*item*/ ctx[34],
				filterText: /*filterText*/ ctx[12],
				getOptionLabel: /*getOptionLabel*/ ctx[5],
				isFirst: isItemFirst(/*i*/ ctx[36]),
				isActive: isItemActive(/*item*/ ctx[34], /*selectedValue*/ ctx[8], /*optionIdentifier*/ ctx[9]),
				isHover: isItemHover(/*hoverItemIndex*/ ctx[1], /*item*/ ctx[34], /*i*/ ctx[36], /*items*/ ctx[4])
			}
		};
	}

	if (switch_value) {
		switch_instance = new switch_value(switch_props(ctx));
	}

	function mouseover_handler_1() {
		return /*mouseover_handler_1*/ ctx[21](/*i*/ ctx[36]);
	}

	function click_handler_1(...args) {
		return /*click_handler_1*/ ctx[22](/*item*/ ctx[34], /*i*/ ctx[36], ...args);
	}

	return {
		c() {
			div = element("div");
			if (switch_instance) create_component(switch_instance.$$.fragment);
			t = space();
			attr(div, "class", "listItem");
		},
		m(target, anchor) {
			insert(target, div, anchor);

			if (switch_instance) {
				mount_component(switch_instance, div, null);
			}

			append(div, t);
			current = true;

			if (!mounted) {
				dispose = [
					listen(div, "mouseover", mouseover_handler_1),
					listen(div, "click", click_handler_1)
				];

				mounted = true;
			}
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;
			const switch_instance_changes = {};
			if (dirty[0] & /*items*/ 16) switch_instance_changes.item = /*item*/ ctx[34];
			if (dirty[0] & /*filterText*/ 4096) switch_instance_changes.filterText = /*filterText*/ ctx[12];
			if (dirty[0] & /*getOptionLabel*/ 32) switch_instance_changes.getOptionLabel = /*getOptionLabel*/ ctx[5];
			if (dirty[0] & /*items, selectedValue, optionIdentifier*/ 784) switch_instance_changes.isActive = isItemActive(/*item*/ ctx[34], /*selectedValue*/ ctx[8], /*optionIdentifier*/ ctx[9]);
			if (dirty[0] & /*hoverItemIndex, items*/ 18) switch_instance_changes.isHover = isItemHover(/*hoverItemIndex*/ ctx[1], /*item*/ ctx[34], /*i*/ ctx[36], /*items*/ ctx[4]);

			if (switch_value !== (switch_value = /*Item*/ ctx[2])) {
				if (switch_instance) {
					group_outros();
					const old_component = switch_instance;

					transition_out(old_component.$$.fragment, 1, 0, () => {
						destroy_component(old_component, 1);
					});

					check_outros();
				}

				if (switch_value) {
					switch_instance = new switch_value(switch_props(ctx));
					create_component(switch_instance.$$.fragment);
					transition_in(switch_instance.$$.fragment, 1);
					mount_component(switch_instance, div, t);
				} else {
					switch_instance = null;
				}
			} else if (switch_value) {
				switch_instance.$set(switch_instance_changes);
			}
		},
		i(local) {
			if (current) return;
			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
			current = true;
		},
		o(local) {
			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(div);
			if (switch_instance) destroy_component(switch_instance);
			mounted = false;
			run_all(dispose);
		}
	};
}

// (235:4) {#if item.isGroupHeader && !item.isSelectable}
function create_if_block_1$4(ctx) {
	let div;
	let t_value = /*getGroupHeaderLabel*/ ctx[6](/*item*/ ctx[34]) + "";
	let t;

	return {
		c() {
			div = element("div");
			t = text(t_value);
			attr(div, "class", "listGroupTitle svelte-ux0sbr");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			append(div, t);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*getGroupHeaderLabel, items*/ 80 && t_value !== (t_value = /*getGroupHeaderLabel*/ ctx[6](/*item*/ ctx[34]) + "")) set_data(t, t_value);
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(div);
		}
	};
}

// (234:2) {#each items as item, i}
function create_each_block$6(ctx) {
	let current_block_type_index;
	let if_block;
	let if_block_anchor;
	let current;
	const if_block_creators = [create_if_block_1$4, create_else_block$2];
	const if_blocks = [];

	function select_block_type(ctx, dirty) {
		if (/*item*/ ctx[34].isGroupHeader && !/*item*/ ctx[34].isSelectable) return 0;
		return 1;
	}

	current_block_type_index = select_block_type(ctx);
	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

	return {
		c() {
			if_block.c();
			if_block_anchor = empty();
		},
		m(target, anchor) {
			if_blocks[current_block_type_index].m(target, anchor);
			insert(target, if_block_anchor, anchor);
			current = true;
		},
		p(ctx, dirty) {
			let previous_block_index = current_block_type_index;
			current_block_type_index = select_block_type(ctx);

			if (current_block_type_index === previous_block_index) {
				if_blocks[current_block_type_index].p(ctx, dirty);
			} else {
				group_outros();

				transition_out(if_blocks[previous_block_index], 1, 1, () => {
					if_blocks[previous_block_index] = null;
				});

				check_outros();
				if_block = if_blocks[current_block_type_index];

				if (!if_block) {
					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
					if_block.c();
				} else {
					if_block.p(ctx, dirty);
				}

				transition_in(if_block, 1);
				if_block.m(if_block_anchor.parentNode, if_block_anchor);
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o(local) {
			transition_out(if_block);
			current = false;
		},
		d(detaching) {
			if_blocks[current_block_type_index].d(detaching);
			if (detaching) detach(if_block_anchor);
		}
	};
}

function create_fragment$e(ctx) {
	let t;
	let if_block1_anchor;
	let current;
	let mounted;
	let dispose;
	let if_block0 = /*isVirtualList*/ ctx[3] && create_if_block_3$3(ctx);
	let if_block1 = !/*isVirtualList*/ ctx[3] && create_if_block$5(ctx);

	return {
		c() {
			if (if_block0) if_block0.c();
			t = space();
			if (if_block1) if_block1.c();
			if_block1_anchor = empty();
		},
		m(target, anchor) {
			if (if_block0) if_block0.m(target, anchor);
			insert(target, t, anchor);
			if (if_block1) if_block1.m(target, anchor);
			insert(target, if_block1_anchor, anchor);
			current = true;

			if (!mounted) {
				dispose = listen(window, "keydown", /*handleKeyDown*/ ctx[15]);
				mounted = true;
			}
		},
		p(ctx, dirty) {
			if (/*isVirtualList*/ ctx[3]) {
				if (if_block0) {
					if_block0.p(ctx, dirty);

					if (dirty[0] & /*isVirtualList*/ 8) {
						transition_in(if_block0, 1);
					}
				} else {
					if_block0 = create_if_block_3$3(ctx);
					if_block0.c();
					transition_in(if_block0, 1);
					if_block0.m(t.parentNode, t);
				}
			} else if (if_block0) {
				group_outros();

				transition_out(if_block0, 1, 1, () => {
					if_block0 = null;
				});

				check_outros();
			}

			if (!/*isVirtualList*/ ctx[3]) {
				if (if_block1) {
					if_block1.p(ctx, dirty);

					if (dirty[0] & /*isVirtualList*/ 8) {
						transition_in(if_block1, 1);
					}
				} else {
					if_block1 = create_if_block$5(ctx);
					if_block1.c();
					transition_in(if_block1, 1);
					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
				}
			} else if (if_block1) {
				group_outros();

				transition_out(if_block1, 1, 1, () => {
					if_block1 = null;
				});

				check_outros();
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block0);
			transition_in(if_block1);
			current = true;
		},
		o(local) {
			transition_out(if_block0);
			transition_out(if_block1);
			current = false;
		},
		d(detaching) {
			if (if_block0) if_block0.d(detaching);
			if (detaching) detach(t);
			if (if_block1) if_block1.d(detaching);
			if (detaching) detach(if_block1_anchor);
			mounted = false;
			dispose();
		}
	};
}

function isItemActive(item, selectedValue, optionIdentifier) {
	return selectedValue && selectedValue[optionIdentifier] === item[optionIdentifier];
}

function isItemFirst(itemIndex) {
	return itemIndex === 0;
}

function isItemHover(hoverItemIndex, item, itemIndex, items) {
	return hoverItemIndex === itemIndex || items.length === 1;
}

function instance$c($$self, $$props, $$invalidate) {
	const dispatch = createEventDispatcher();
	let { container = undefined } = $$props;
	let { Item: Item$1 = Item } = $$props;
	let { isVirtualList = false } = $$props;
	let { items = [] } = $$props;

	let { getOptionLabel = (option, filterText) => {
		if (option) return option.isCreator
		? `Create \"${filterText}\"`
		: option.label;
	} } = $$props;

	let { getGroupHeaderLabel = option => {
		return option.label;
	} } = $$props;

	let { itemHeight = 40 } = $$props;
	let { hoverItemIndex = 0 } = $$props;
	let { selectedValue = undefined } = $$props;
	let { optionIdentifier = "value" } = $$props;
	let { hideEmptyState = false } = $$props;
	let { noOptionsMessage = "No options" } = $$props;
	let { isMulti = false } = $$props;
	let { activeItemIndex = 0 } = $$props;
	let { filterText = "" } = $$props;
	let isScrollingTimer = 0;
	let isScrolling = false;
	let prev_items;

	onMount(() => {
		if (items.length > 0 && !isMulti && selectedValue) {
			const _hoverItemIndex = items.findIndex(item => item[optionIdentifier] === selectedValue[optionIdentifier]);

			if (_hoverItemIndex) {
				$$invalidate(1, hoverItemIndex = _hoverItemIndex);
			}
		}

		scrollToActiveItem("active");

		container.addEventListener(
			"scroll",
			() => {
				clearTimeout(isScrollingTimer);

				isScrollingTimer = setTimeout(
					() => {
						isScrolling = false;
					},
					100
				);
			},
			false
		);
	});

	onDestroy(() => {
		
	}); // clearTimeout(isScrollingTimer);

	beforeUpdate(() => {
		if (items !== prev_items && items.length > 0) {
			$$invalidate(1, hoverItemIndex = 0);
		}

		// if (prev_activeItemIndex && activeItemIndex > -1) {
		//   hoverItemIndex = activeItemIndex;
		//   scrollToActiveItem('active');
		// }
		// if (prev_selectedValue && selectedValue) {
		//   scrollToActiveItem('active');
		//   if (items && !isMulti) {
		//     const hoverItemIndex = items.findIndex((item) => item[optionIdentifier] === selectedValue[optionIdentifier]);
		//     if (hoverItemIndex) {
		//       hoverItemIndex = hoverItemIndex;
		//     }
		//   }
		// }
		prev_items = items;
	});

	function handleSelect(item) {
		if (item.isCreator) return;
		dispatch("itemSelected", item);
	}

	function handleHover(i) {
		if (isScrolling) return;
		$$invalidate(1, hoverItemIndex = i);
	}

	function handleClick(args) {
		const { item, i, event } = args;
		event.stopPropagation();
		if (selectedValue && !isMulti && selectedValue[optionIdentifier] === item[optionIdentifier]) return closeList();

		if (item.isCreator) {
			dispatch("itemCreated", filterText);
		} else {
			$$invalidate(16, activeItemIndex = i);
			$$invalidate(1, hoverItemIndex = i);
			handleSelect(item);
		}
	}

	function closeList() {
		dispatch("closeList");
	}

	async function updateHoverItem(increment) {
		if (isVirtualList) return;
		let isNonSelectableItem = true;

		while (isNonSelectableItem) {
			if (increment > 0 && hoverItemIndex === items.length - 1) {
				$$invalidate(1, hoverItemIndex = 0);
			} else if (increment < 0 && hoverItemIndex === 0) {
				$$invalidate(1, hoverItemIndex = items.length - 1);
			} else {
				$$invalidate(1, hoverItemIndex = hoverItemIndex + increment);
			}

			isNonSelectableItem = items[hoverItemIndex].isGroupHeader && !items[hoverItemIndex].isSelectable;
		}

		await tick();
		scrollToActiveItem("hover");
	}

	function handleKeyDown(e) {
		switch (e.key) {
			case "ArrowDown":
				e.preventDefault();
				items.length && updateHoverItem(1);
				break;
			case "ArrowUp":
				e.preventDefault();
				items.length && updateHoverItem(-1);
				break;
			case "Enter":
				e.preventDefault();
				if (items.length === 0) break;
				const hoverItem = items[hoverItemIndex];
				if (selectedValue && !isMulti && selectedValue[optionIdentifier] === hoverItem[optionIdentifier]) {
					closeList();
					break;
				}
				if (hoverItem.isCreator) {
					dispatch("itemCreated", filterText);
				} else {
					$$invalidate(16, activeItemIndex = hoverItemIndex);
					handleSelect(items[hoverItemIndex]);
				}
				break;
			case "Tab":
				e.preventDefault();
				if (items.length === 0) break;
				if (selectedValue && selectedValue[optionIdentifier] === items[hoverItemIndex][optionIdentifier]) return closeList();
				$$invalidate(16, activeItemIndex = hoverItemIndex);
				handleSelect(items[hoverItemIndex]);
				break;
		}
	}

	function scrollToActiveItem(className) {
		if (isVirtualList || !container) return;
		let offsetBounding;
		const focusedElemBounding = container.querySelector(`.listItem .${className}`);

		if (focusedElemBounding) {
			offsetBounding = container.getBoundingClientRect().bottom - focusedElemBounding.getBoundingClientRect().bottom;
		}

		$$invalidate(0, container.scrollTop -= offsetBounding, container);
	}

	
	
	const mouseover_handler = i => handleHover(i);
	const click_handler = (item, i, event) => handleClick({ item, i, event });

	function div_binding($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](() => {
			container = $$value;
			$$invalidate(0, container);
		});
	}

	const mouseover_handler_1 = i => handleHover(i);
	const click_handler_1 = (item, i, event) => handleClick({ item, i, event });

	function div_binding_1($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](() => {
			container = $$value;
			$$invalidate(0, container);
		});
	}

	$$self.$$set = $$props => {
		if ("container" in $$props) $$invalidate(0, container = $$props.container);
		if ("Item" in $$props) $$invalidate(2, Item$1 = $$props.Item);
		if ("isVirtualList" in $$props) $$invalidate(3, isVirtualList = $$props.isVirtualList);
		if ("items" in $$props) $$invalidate(4, items = $$props.items);
		if ("getOptionLabel" in $$props) $$invalidate(5, getOptionLabel = $$props.getOptionLabel);
		if ("getGroupHeaderLabel" in $$props) $$invalidate(6, getGroupHeaderLabel = $$props.getGroupHeaderLabel);
		if ("itemHeight" in $$props) $$invalidate(7, itemHeight = $$props.itemHeight);
		if ("hoverItemIndex" in $$props) $$invalidate(1, hoverItemIndex = $$props.hoverItemIndex);
		if ("selectedValue" in $$props) $$invalidate(8, selectedValue = $$props.selectedValue);
		if ("optionIdentifier" in $$props) $$invalidate(9, optionIdentifier = $$props.optionIdentifier);
		if ("hideEmptyState" in $$props) $$invalidate(10, hideEmptyState = $$props.hideEmptyState);
		if ("noOptionsMessage" in $$props) $$invalidate(11, noOptionsMessage = $$props.noOptionsMessage);
		if ("isMulti" in $$props) $$invalidate(17, isMulti = $$props.isMulti);
		if ("activeItemIndex" in $$props) $$invalidate(16, activeItemIndex = $$props.activeItemIndex);
		if ("filterText" in $$props) $$invalidate(12, filterText = $$props.filterText);
	};

	return [
		container,
		hoverItemIndex,
		Item$1,
		isVirtualList,
		items,
		getOptionLabel,
		getGroupHeaderLabel,
		itemHeight,
		selectedValue,
		optionIdentifier,
		hideEmptyState,
		noOptionsMessage,
		filterText,
		handleHover,
		handleClick,
		handleKeyDown,
		activeItemIndex,
		isMulti,
		mouseover_handler,
		click_handler,
		div_binding,
		mouseover_handler_1,
		click_handler_1,
		div_binding_1
	];
}

class List extends SvelteComponent {
	constructor(options) {
		super();
		if (!document.getElementById("svelte-ux0sbr-style")) add_css$5();

		init(
			this,
			options,
			instance$c,
			create_fragment$e,
			safe_not_equal,
			{
				container: 0,
				Item: 2,
				isVirtualList: 3,
				items: 4,
				getOptionLabel: 5,
				getGroupHeaderLabel: 6,
				itemHeight: 7,
				hoverItemIndex: 1,
				selectedValue: 8,
				optionIdentifier: 9,
				hideEmptyState: 10,
				noOptionsMessage: 11,
				isMulti: 17,
				activeItemIndex: 16,
				filterText: 12
			},
			[-1, -1]
		);
	}
}

/* node_modules/svelte-select/src/Selection.svelte generated by Svelte v3.38.2 */

function add_css$4() {
	var style = element("style");
	style.id = "svelte-ch6bh7-style";
	style.textContent = ".selection.svelte-ch6bh7{text-overflow:ellipsis;overflow-x:hidden;white-space:nowrap}";
	append(document.head, style);
}

function create_fragment$d(ctx) {
	let div;
	let raw_value = /*getSelectionLabel*/ ctx[0](/*item*/ ctx[1]) + "";

	return {
		c() {
			div = element("div");
			attr(div, "class", "selection svelte-ch6bh7");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			div.innerHTML = raw_value;
		},
		p(ctx, [dirty]) {
			if (dirty & /*getSelectionLabel, item*/ 3 && raw_value !== (raw_value = /*getSelectionLabel*/ ctx[0](/*item*/ ctx[1]) + "")) div.innerHTML = raw_value;		},
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(div);
		}
	};
}

function instance$b($$self, $$props, $$invalidate) {
	let { getSelectionLabel = undefined } = $$props;
	let { item = undefined } = $$props;

	$$self.$$set = $$props => {
		if ("getSelectionLabel" in $$props) $$invalidate(0, getSelectionLabel = $$props.getSelectionLabel);
		if ("item" in $$props) $$invalidate(1, item = $$props.item);
	};

	return [getSelectionLabel, item];
}

class Selection extends SvelteComponent {
	constructor(options) {
		super();
		if (!document.getElementById("svelte-ch6bh7-style")) add_css$4();
		init(this, options, instance$b, create_fragment$d, safe_not_equal, { getSelectionLabel: 0, item: 1 });
	}
}

/* node_modules/svelte-select/src/MultiSelection.svelte generated by Svelte v3.38.2 */

function add_css$3() {
	var style = element("style");
	style.id = "svelte-14r1jr2-style";
	style.textContent = ".multiSelectItem.svelte-14r1jr2.svelte-14r1jr2{background:var(--multiItemBG, #EBEDEF);margin:var(--multiItemMargin, 5px 5px 0 0);border-radius:var(--multiItemBorderRadius, 16px);height:var(--multiItemHeight, 32px);line-height:var(--multiItemHeight, 32px);display:flex;cursor:default;padding:var(--multiItemPadding, 0 10px 0 15px);max-width:100%}.multiSelectItem_label.svelte-14r1jr2.svelte-14r1jr2{margin:var(--multiLabelMargin, 0 5px 0 0);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.multiSelectItem.svelte-14r1jr2.svelte-14r1jr2:hover,.multiSelectItem.active.svelte-14r1jr2.svelte-14r1jr2{background-color:var(--multiItemActiveBG, #006FFF);color:var(--multiItemActiveColor, #fff)}.multiSelectItem.disabled.svelte-14r1jr2.svelte-14r1jr2:hover{background:var(--multiItemDisabledHoverBg, #EBEDEF);color:var(--multiItemDisabledHoverColor, #C1C6CC)}.multiSelectItem_clear.svelte-14r1jr2.svelte-14r1jr2{border-radius:var(--multiClearRadius, 50%);background:var(--multiClearBG, #52616F);min-width:var(--multiClearWidth, 16px);max-width:var(--multiClearWidth, 16px);height:var(--multiClearHeight, 16px);position:relative;top:var(--multiClearTop, 8px);text-align:var(--multiClearTextAlign, center);padding:var(--multiClearPadding, 1px)}.multiSelectItem_clear.svelte-14r1jr2.svelte-14r1jr2:hover,.active.svelte-14r1jr2 .multiSelectItem_clear.svelte-14r1jr2{background:var(--multiClearHoverBG, #fff)}.multiSelectItem_clear.svelte-14r1jr2:hover svg.svelte-14r1jr2,.active.svelte-14r1jr2 .multiSelectItem_clear svg.svelte-14r1jr2{fill:var(--multiClearHoverFill, #006FFF)}.multiSelectItem_clear.svelte-14r1jr2 svg.svelte-14r1jr2{fill:var(--multiClearFill, #EBEDEF);vertical-align:top}";
	append(document.head, style);
}

function get_each_context$5(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[9] = list[i];
	child_ctx[11] = i;
	return child_ctx;
}

// (23:2) {#if !isDisabled && !multiFullItemClearable}
function create_if_block$4(ctx) {
	let div;
	let mounted;
	let dispose;

	function click_handler(...args) {
		return /*click_handler*/ ctx[6](/*i*/ ctx[11], ...args);
	}

	return {
		c() {
			div = element("div");
			div.innerHTML = `<svg width="100%" height="100%" viewBox="-2 -2 50 50" focusable="false" role="presentation" class="svelte-14r1jr2"><path d="M34.923,37.251L24,26.328L13.077,37.251L9.436,33.61l10.923-10.923L9.436,11.765l3.641-3.641L24,19.047L34.923,8.124 l3.641,3.641L27.641,22.688L38.564,33.61L34.923,37.251z"></path></svg>`;
			attr(div, "class", "multiSelectItem_clear svelte-14r1jr2");
		},
		m(target, anchor) {
			insert(target, div, anchor);

			if (!mounted) {
				dispose = listen(div, "click", click_handler);
				mounted = true;
			}
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;
		},
		d(detaching) {
			if (detaching) detach(div);
			mounted = false;
			dispose();
		}
	};
}

// (18:0) {#each selectedValue as value, i}
function create_each_block$5(ctx) {
	let div1;
	let div0;
	let raw_value = /*getSelectionLabel*/ ctx[4](/*value*/ ctx[9]) + "";
	let t0;
	let t1;
	let div1_class_value;
	let mounted;
	let dispose;
	let if_block = !/*isDisabled*/ ctx[2] && !/*multiFullItemClearable*/ ctx[3] && create_if_block$4(ctx);

	function click_handler_1(...args) {
		return /*click_handler_1*/ ctx[7](/*i*/ ctx[11], ...args);
	}

	return {
		c() {
			div1 = element("div");
			div0 = element("div");
			t0 = space();
			if (if_block) if_block.c();
			t1 = space();
			attr(div0, "class", "multiSelectItem_label svelte-14r1jr2");

			attr(div1, "class", div1_class_value = "multiSelectItem " + (/*activeSelectedValue*/ ctx[1] === /*i*/ ctx[11]
			? "active"
			: "") + " " + (/*isDisabled*/ ctx[2] ? "disabled" : "") + " svelte-14r1jr2");
		},
		m(target, anchor) {
			insert(target, div1, anchor);
			append(div1, div0);
			div0.innerHTML = raw_value;
			append(div1, t0);
			if (if_block) if_block.m(div1, null);
			append(div1, t1);

			if (!mounted) {
				dispose = listen(div1, "click", click_handler_1);
				mounted = true;
			}
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;
			if (dirty & /*getSelectionLabel, selectedValue*/ 17 && raw_value !== (raw_value = /*getSelectionLabel*/ ctx[4](/*value*/ ctx[9]) + "")) div0.innerHTML = raw_value;
			if (!/*isDisabled*/ ctx[2] && !/*multiFullItemClearable*/ ctx[3]) {
				if (if_block) {
					if_block.p(ctx, dirty);
				} else {
					if_block = create_if_block$4(ctx);
					if_block.c();
					if_block.m(div1, t1);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}

			if (dirty & /*activeSelectedValue, isDisabled*/ 6 && div1_class_value !== (div1_class_value = "multiSelectItem " + (/*activeSelectedValue*/ ctx[1] === /*i*/ ctx[11]
			? "active"
			: "") + " " + (/*isDisabled*/ ctx[2] ? "disabled" : "") + " svelte-14r1jr2")) {
				attr(div1, "class", div1_class_value);
			}
		},
		d(detaching) {
			if (detaching) detach(div1);
			if (if_block) if_block.d();
			mounted = false;
			dispose();
		}
	};
}

function create_fragment$c(ctx) {
	let each_1_anchor;
	let each_value = /*selectedValue*/ ctx[0];
	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block$5(get_each_context$5(ctx, each_value, i));
	}

	return {
		c() {
			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			each_1_anchor = empty();
		},
		m(target, anchor) {
			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(target, anchor);
			}

			insert(target, each_1_anchor, anchor);
		},
		p(ctx, [dirty]) {
			if (dirty & /*activeSelectedValue, isDisabled, multiFullItemClearable, handleClear, getSelectionLabel, selectedValue*/ 63) {
				each_value = /*selectedValue*/ ctx[0];
				let i;

				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context$5(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block$5(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value.length;
			}
		},
		i: noop,
		o: noop,
		d(detaching) {
			destroy_each(each_blocks, detaching);
			if (detaching) detach(each_1_anchor);
		}
	};
}

function instance$a($$self, $$props, $$invalidate) {
	const dispatch = createEventDispatcher();
	let { selectedValue = [] } = $$props;
	let { activeSelectedValue = undefined } = $$props;
	let { isDisabled = false } = $$props;
	let { multiFullItemClearable = false } = $$props;
	let { getSelectionLabel = undefined } = $$props;

	function handleClear(i, event) {
		event.stopPropagation();
		dispatch("multiItemClear", { i });
	}

	const click_handler = (i, event) => handleClear(i, event);
	const click_handler_1 = (i, event) => multiFullItemClearable ? handleClear(i, event) : {};

	$$self.$$set = $$props => {
		if ("selectedValue" in $$props) $$invalidate(0, selectedValue = $$props.selectedValue);
		if ("activeSelectedValue" in $$props) $$invalidate(1, activeSelectedValue = $$props.activeSelectedValue);
		if ("isDisabled" in $$props) $$invalidate(2, isDisabled = $$props.isDisabled);
		if ("multiFullItemClearable" in $$props) $$invalidate(3, multiFullItemClearable = $$props.multiFullItemClearable);
		if ("getSelectionLabel" in $$props) $$invalidate(4, getSelectionLabel = $$props.getSelectionLabel);
	};

	return [
		selectedValue,
		activeSelectedValue,
		isDisabled,
		multiFullItemClearable,
		getSelectionLabel,
		handleClear,
		click_handler,
		click_handler_1
	];
}

class MultiSelection extends SvelteComponent {
	constructor(options) {
		super();
		if (!document.getElementById("svelte-14r1jr2-style")) add_css$3();

		init(this, options, instance$a, create_fragment$c, safe_not_equal, {
			selectedValue: 0,
			activeSelectedValue: 1,
			isDisabled: 2,
			multiFullItemClearable: 3,
			getSelectionLabel: 4
		});
	}
}

function isOutOfViewport(elem) {
  const bounding = elem.getBoundingClientRect();
  const out = {};

  out.top = bounding.top < 0;
  out.left = bounding.left < 0;
  out.bottom = bounding.bottom > (window.innerHeight || document.documentElement.clientHeight);
  out.right = bounding.right > (window.innerWidth || document.documentElement.clientWidth);
  out.any = out.top || out.left || out.bottom || out.right;

  return out;
}

function debounce(func, wait, immediate) {
  let timeout;

  return function executedFunction() {
    let context = this;
    let args = arguments;

    let later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };

    let callNow = immediate && !timeout;

    clearTimeout(timeout);

    timeout = setTimeout(later, wait);

    if (callNow) func.apply(context, args);
  };
}

/* node_modules/svelte-select/src/ClearIcon.svelte generated by Svelte v3.38.2 */

function create_fragment$b(ctx) {
	let svg;
	let path;

	return {
		c() {
			svg = svg_element("svg");
			path = svg_element("path");
			attr(path, "fill", "currentColor");
			attr(path, "d", "M34.923,37.251L24,26.328L13.077,37.251L9.436,33.61l10.923-10.923L9.436,11.765l3.641-3.641L24,19.047L34.923,8.124\n    l3.641,3.641L27.641,22.688L38.564,33.61L34.923,37.251z");
			attr(svg, "width", "100%");
			attr(svg, "height", "100%");
			attr(svg, "viewBox", "-2 -2 50 50");
			attr(svg, "focusable", "false");
			attr(svg, "role", "presentation");
		},
		m(target, anchor) {
			insert(target, svg, anchor);
			append(svg, path);
		},
		p: noop,
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(svg);
		}
	};
}

class ClearIcon extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, null, create_fragment$b, safe_not_equal, {});
	}
}

/* node_modules/svelte-select/src/Select.svelte generated by Svelte v3.38.2 */

const { document: document_1 } = globals;

function add_css$2() {
	var style = element("style");
	style.id = "svelte-17qb5ew-style";
	style.textContent = ".selectContainer.svelte-17qb5ew.svelte-17qb5ew{--padding:0 16px;border:var(--border, 1px solid #d8dbdf);border-radius:var(--borderRadius, 3px);height:var(--height, 42px);position:relative;display:flex;align-items:center;padding:var(--padding);background:var(--background, #fff)}.selectContainer.svelte-17qb5ew input.svelte-17qb5ew{cursor:default;border:none;color:var(--inputColor, #3f4f5f);height:var(--height, 42px);line-height:var(--height, 42px);padding:var(--inputPadding, var(--padding));width:100%;background:transparent;font-size:var(--inputFontSize, 14px);letter-spacing:var(--inputLetterSpacing, -0.08px);position:absolute;left:var(--inputLeft, 0)}.selectContainer.svelte-17qb5ew input.svelte-17qb5ew::placeholder{color:var(--placeholderColor, #78848f);opacity:var(--placeholderOpacity, 1)}.selectContainer.svelte-17qb5ew input.svelte-17qb5ew:focus{outline:none}.selectContainer.svelte-17qb5ew.svelte-17qb5ew:hover{border-color:var(--borderHoverColor, #b2b8bf)}.selectContainer.focused.svelte-17qb5ew.svelte-17qb5ew{border-color:var(--borderFocusColor, #006fe8)}.selectContainer.disabled.svelte-17qb5ew.svelte-17qb5ew{background:var(--disabledBackground, #ebedef);border-color:var(--disabledBorderColor, #ebedef);color:var(--disabledColor, #c1c6cc)}.selectContainer.disabled.svelte-17qb5ew input.svelte-17qb5ew::placeholder{color:var(--disabledPlaceholderColor, #c1c6cc);opacity:var(--disabledPlaceholderOpacity, 1)}.selectedItem.svelte-17qb5ew.svelte-17qb5ew{line-height:var(--height, 42px);height:var(--height, 42px);overflow-x:hidden;padding:var(--selectedItemPadding, 0 20px 0 0)}.selectedItem.svelte-17qb5ew.svelte-17qb5ew:focus{outline:none}.clearSelect.svelte-17qb5ew.svelte-17qb5ew{position:absolute;right:var(--clearSelectRight, 10px);top:var(--clearSelectTop, 11px);bottom:var(--clearSelectBottom, 11px);width:var(--clearSelectWidth, 20px);color:var(--clearSelectColor, #c5cacf);flex:none !important}.clearSelect.svelte-17qb5ew.svelte-17qb5ew:hover{color:var(--clearSelectHoverColor, #2c3e50)}.selectContainer.focused.svelte-17qb5ew .clearSelect.svelte-17qb5ew{color:var(--clearSelectFocusColor, #3f4f5f)}.indicator.svelte-17qb5ew.svelte-17qb5ew{position:absolute;right:var(--indicatorRight, 10px);top:var(--indicatorTop, 11px);width:var(--indicatorWidth, 20px);height:var(--indicatorHeight, 20px);color:var(--indicatorColor, #c5cacf)}.indicator.svelte-17qb5ew svg.svelte-17qb5ew{display:inline-block;fill:var(--indicatorFill, currentcolor);line-height:1;stroke:var(--indicatorStroke, currentcolor);stroke-width:0}.spinner.svelte-17qb5ew.svelte-17qb5ew{position:absolute;right:var(--spinnerRight, 10px);top:var(--spinnerLeft, 11px);width:var(--spinnerWidth, 20px);height:var(--spinnerHeight, 20px);color:var(--spinnerColor, #51ce6c);animation:svelte-17qb5ew-rotate 0.75s linear infinite}.spinner_icon.svelte-17qb5ew.svelte-17qb5ew{display:block;height:100%;transform-origin:center center;width:100%;position:absolute;top:0;bottom:0;left:0;right:0;margin:auto;-webkit-transform:none}.spinner_path.svelte-17qb5ew.svelte-17qb5ew{stroke-dasharray:90;stroke-linecap:round}.multiSelect.svelte-17qb5ew.svelte-17qb5ew{display:flex;padding:var(--multiSelectPadding, 0 35px 0 16px);height:auto;flex-wrap:wrap;align-items:stretch}.multiSelect.svelte-17qb5ew>.svelte-17qb5ew{flex:1 1 50px}.selectContainer.multiSelect.svelte-17qb5ew input.svelte-17qb5ew{padding:var(--multiSelectInputPadding, 0);position:relative;margin:var(--multiSelectInputMargin, 0)}.hasError.svelte-17qb5ew.svelte-17qb5ew{border:var(--errorBorder, 1px solid #ff2d55);background:var(--errorBackground, #fff)}@keyframes svelte-17qb5ew-rotate{100%{transform:rotate(360deg)}}";
	append(document_1.head, style);
}

// (827:2) {#if Icon}
function create_if_block_7$1(ctx) {
	let switch_instance;
	let switch_instance_anchor;
	let current;
	const switch_instance_spread_levels = [/*iconProps*/ ctx[18]];
	var switch_value = /*Icon*/ ctx[17];

	function switch_props(ctx) {
		let switch_instance_props = {};

		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
		}

		return { props: switch_instance_props };
	}

	if (switch_value) {
		switch_instance = new switch_value(switch_props());
	}

	return {
		c() {
			if (switch_instance) create_component(switch_instance.$$.fragment);
			switch_instance_anchor = empty();
		},
		m(target, anchor) {
			if (switch_instance) {
				mount_component(switch_instance, target, anchor);
			}

			insert(target, switch_instance_anchor, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const switch_instance_changes = (dirty[0] & /*iconProps*/ 262144)
			? get_spread_update(switch_instance_spread_levels, [get_spread_object(/*iconProps*/ ctx[18])])
			: {};

			if (switch_value !== (switch_value = /*Icon*/ ctx[17])) {
				if (switch_instance) {
					group_outros();
					const old_component = switch_instance;

					transition_out(old_component.$$.fragment, 1, 0, () => {
						destroy_component(old_component, 1);
					});

					check_outros();
				}

				if (switch_value) {
					switch_instance = new switch_value(switch_props());
					create_component(switch_instance.$$.fragment);
					transition_in(switch_instance.$$.fragment, 1);
					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
				} else {
					switch_instance = null;
				}
			} else if (switch_value) {
				switch_instance.$set(switch_instance_changes);
			}
		},
		i(local) {
			if (current) return;
			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
			current = true;
		},
		o(local) {
			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(switch_instance_anchor);
			if (switch_instance) destroy_component(switch_instance, detaching);
		}
	};
}

// (831:2) {#if isMulti && selectedValue && selectedValue.length > 0}
function create_if_block_6$1(ctx) {
	let switch_instance;
	let switch_instance_anchor;
	let current;
	var switch_value = /*MultiSelection*/ ctx[7];

	function switch_props(ctx) {
		return {
			props: {
				selectedValue: /*selectedValue*/ ctx[0],
				getSelectionLabel: /*getSelectionLabel*/ ctx[13],
				activeSelectedValue: /*activeSelectedValue*/ ctx[25],
				isDisabled: /*isDisabled*/ ctx[10],
				multiFullItemClearable: /*multiFullItemClearable*/ ctx[9]
			}
		};
	}

	if (switch_value) {
		switch_instance = new switch_value(switch_props(ctx));
		switch_instance.$on("multiItemClear", /*handleMultiItemClear*/ ctx[29]);
		switch_instance.$on("focus", /*handleFocus*/ ctx[32]);
	}

	return {
		c() {
			if (switch_instance) create_component(switch_instance.$$.fragment);
			switch_instance_anchor = empty();
		},
		m(target, anchor) {
			if (switch_instance) {
				mount_component(switch_instance, target, anchor);
			}

			insert(target, switch_instance_anchor, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const switch_instance_changes = {};
			if (dirty[0] & /*selectedValue*/ 1) switch_instance_changes.selectedValue = /*selectedValue*/ ctx[0];
			if (dirty[0] & /*getSelectionLabel*/ 8192) switch_instance_changes.getSelectionLabel = /*getSelectionLabel*/ ctx[13];
			if (dirty[0] & /*activeSelectedValue*/ 33554432) switch_instance_changes.activeSelectedValue = /*activeSelectedValue*/ ctx[25];
			if (dirty[0] & /*isDisabled*/ 1024) switch_instance_changes.isDisabled = /*isDisabled*/ ctx[10];
			if (dirty[0] & /*multiFullItemClearable*/ 512) switch_instance_changes.multiFullItemClearable = /*multiFullItemClearable*/ ctx[9];

			if (switch_value !== (switch_value = /*MultiSelection*/ ctx[7])) {
				if (switch_instance) {
					group_outros();
					const old_component = switch_instance;

					transition_out(old_component.$$.fragment, 1, 0, () => {
						destroy_component(old_component, 1);
					});

					check_outros();
				}

				if (switch_value) {
					switch_instance = new switch_value(switch_props(ctx));
					switch_instance.$on("multiItemClear", /*handleMultiItemClear*/ ctx[29]);
					switch_instance.$on("focus", /*handleFocus*/ ctx[32]);
					create_component(switch_instance.$$.fragment);
					transition_in(switch_instance.$$.fragment, 1);
					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
				} else {
					switch_instance = null;
				}
			} else if (switch_value) {
				switch_instance.$set(switch_instance_changes);
			}
		},
		i(local) {
			if (current) return;
			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
			current = true;
		},
		o(local) {
			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(switch_instance_anchor);
			if (switch_instance) destroy_component(switch_instance, detaching);
		}
	};
}

// (852:2) {:else}
function create_else_block_1$1(ctx) {
	let input_1;
	let mounted;
	let dispose;

	let input_1_levels = [
		/*_inputAttributes*/ ctx[26],
		{ placeholder: /*placeholderText*/ ctx[28] },
		{ style: /*inputStyles*/ ctx[15] }
	];

	let input_1_data = {};

	for (let i = 0; i < input_1_levels.length; i += 1) {
		input_1_data = assign(input_1_data, input_1_levels[i]);
	}

	return {
		c() {
			input_1 = element("input");
			set_attributes(input_1, input_1_data);
			toggle_class(input_1, "svelte-17qb5ew", true);
		},
		m(target, anchor) {
			insert(target, input_1, anchor);
			/*input_1_binding_1*/ ctx[63](input_1);
			set_input_value(input_1, /*filterText*/ ctx[1]);

			if (!mounted) {
				dispose = [
					listen(input_1, "focus", /*handleFocus*/ ctx[32]),
					listen(input_1, "input", /*input_1_input_handler_1*/ ctx[64])
				];

				mounted = true;
			}
		},
		p(ctx, dirty) {
			set_attributes(input_1, input_1_data = get_spread_update(input_1_levels, [
				dirty[0] & /*_inputAttributes*/ 67108864 && /*_inputAttributes*/ ctx[26],
				dirty[0] & /*placeholderText*/ 268435456 && { placeholder: /*placeholderText*/ ctx[28] },
				dirty[0] & /*inputStyles*/ 32768 && { style: /*inputStyles*/ ctx[15] }
			]));

			if (dirty[0] & /*filterText*/ 2 && input_1.value !== /*filterText*/ ctx[1]) {
				set_input_value(input_1, /*filterText*/ ctx[1]);
			}

			toggle_class(input_1, "svelte-17qb5ew", true);
		},
		d(detaching) {
			if (detaching) detach(input_1);
			/*input_1_binding_1*/ ctx[63](null);
			mounted = false;
			run_all(dispose);
		}
	};
}

// (843:2) {#if isDisabled}
function create_if_block_5$1(ctx) {
	let input_1;
	let mounted;
	let dispose;

	let input_1_levels = [
		/*_inputAttributes*/ ctx[26],
		{ placeholder: /*placeholderText*/ ctx[28] },
		{ style: /*inputStyles*/ ctx[15] },
		{ disabled: true }
	];

	let input_1_data = {};

	for (let i = 0; i < input_1_levels.length; i += 1) {
		input_1_data = assign(input_1_data, input_1_levels[i]);
	}

	return {
		c() {
			input_1 = element("input");
			set_attributes(input_1, input_1_data);
			toggle_class(input_1, "svelte-17qb5ew", true);
		},
		m(target, anchor) {
			insert(target, input_1, anchor);
			/*input_1_binding*/ ctx[61](input_1);
			set_input_value(input_1, /*filterText*/ ctx[1]);

			if (!mounted) {
				dispose = [
					listen(input_1, "focus", /*handleFocus*/ ctx[32]),
					listen(input_1, "input", /*input_1_input_handler*/ ctx[62])
				];

				mounted = true;
			}
		},
		p(ctx, dirty) {
			set_attributes(input_1, input_1_data = get_spread_update(input_1_levels, [
				dirty[0] & /*_inputAttributes*/ 67108864 && /*_inputAttributes*/ ctx[26],
				dirty[0] & /*placeholderText*/ 268435456 && { placeholder: /*placeholderText*/ ctx[28] },
				dirty[0] & /*inputStyles*/ 32768 && { style: /*inputStyles*/ ctx[15] },
				{ disabled: true }
			]));

			if (dirty[0] & /*filterText*/ 2 && input_1.value !== /*filterText*/ ctx[1]) {
				set_input_value(input_1, /*filterText*/ ctx[1]);
			}

			toggle_class(input_1, "svelte-17qb5ew", true);
		},
		d(detaching) {
			if (detaching) detach(input_1);
			/*input_1_binding*/ ctx[61](null);
			mounted = false;
			run_all(dispose);
		}
	};
}

// (862:2) {#if !isMulti && showSelectedItem}
function create_if_block_4$2(ctx) {
	let div;
	let switch_instance;
	let current;
	let mounted;
	let dispose;
	var switch_value = /*Selection*/ ctx[6];

	function switch_props(ctx) {
		return {
			props: {
				item: /*selectedValue*/ ctx[0],
				getSelectionLabel: /*getSelectionLabel*/ ctx[13]
			}
		};
	}

	if (switch_value) {
		switch_instance = new switch_value(switch_props(ctx));
	}

	return {
		c() {
			div = element("div");
			if (switch_instance) create_component(switch_instance.$$.fragment);
			attr(div, "class", "selectedItem svelte-17qb5ew");
		},
		m(target, anchor) {
			insert(target, div, anchor);

			if (switch_instance) {
				mount_component(switch_instance, div, null);
			}

			current = true;

			if (!mounted) {
				dispose = listen(div, "focus", /*handleFocus*/ ctx[32]);
				mounted = true;
			}
		},
		p(ctx, dirty) {
			const switch_instance_changes = {};
			if (dirty[0] & /*selectedValue*/ 1) switch_instance_changes.item = /*selectedValue*/ ctx[0];
			if (dirty[0] & /*getSelectionLabel*/ 8192) switch_instance_changes.getSelectionLabel = /*getSelectionLabel*/ ctx[13];

			if (switch_value !== (switch_value = /*Selection*/ ctx[6])) {
				if (switch_instance) {
					group_outros();
					const old_component = switch_instance;

					transition_out(old_component.$$.fragment, 1, 0, () => {
						destroy_component(old_component, 1);
					});

					check_outros();
				}

				if (switch_value) {
					switch_instance = new switch_value(switch_props(ctx));
					create_component(switch_instance.$$.fragment);
					transition_in(switch_instance.$$.fragment, 1);
					mount_component(switch_instance, div, null);
				} else {
					switch_instance = null;
				}
			} else if (switch_value) {
				switch_instance.$set(switch_instance_changes);
			}
		},
		i(local) {
			if (current) return;
			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
			current = true;
		},
		o(local) {
			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(div);
			if (switch_instance) destroy_component(switch_instance);
			mounted = false;
			dispose();
		}
	};
}

// (871:2) {#if showSelectedItem && isClearable && !isDisabled && !isWaiting}
function create_if_block_3$2(ctx) {
	let div;
	let switch_instance;
	let current;
	let mounted;
	let dispose;
	var switch_value = /*ClearIcon*/ ctx[23];

	function switch_props(ctx) {
		return {};
	}

	if (switch_value) {
		switch_instance = new switch_value(switch_props());
	}

	return {
		c() {
			div = element("div");
			if (switch_instance) create_component(switch_instance.$$.fragment);
			attr(div, "class", "clearSelect svelte-17qb5ew");
		},
		m(target, anchor) {
			insert(target, div, anchor);

			if (switch_instance) {
				mount_component(switch_instance, div, null);
			}

			current = true;

			if (!mounted) {
				dispose = listen(div, "click", prevent_default(/*handleClear*/ ctx[24]));
				mounted = true;
			}
		},
		p(ctx, dirty) {
			if (switch_value !== (switch_value = /*ClearIcon*/ ctx[23])) {
				if (switch_instance) {
					group_outros();
					const old_component = switch_instance;

					transition_out(old_component.$$.fragment, 1, 0, () => {
						destroy_component(old_component, 1);
					});

					check_outros();
				}

				if (switch_value) {
					switch_instance = new switch_value(switch_props());
					create_component(switch_instance.$$.fragment);
					transition_in(switch_instance.$$.fragment, 1);
					mount_component(switch_instance, div, null);
				} else {
					switch_instance = null;
				}
			}
		},
		i(local) {
			if (current) return;
			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
			current = true;
		},
		o(local) {
			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(div);
			if (switch_instance) destroy_component(switch_instance);
			mounted = false;
			dispose();
		}
	};
}

// (877:2) {#if showIndicator || (showChevron && !selectedValue || (!isSearchable && !isDisabled && !isWaiting && ((showSelectedItem && !isClearable) || !showSelectedItem)))}
function create_if_block_1$3(ctx) {
	let div;

	function select_block_type_1(ctx, dirty) {
		if (/*indicatorSvg*/ ctx[22]) return create_if_block_2$2;
		return create_else_block$1;
	}

	let current_block_type = select_block_type_1(ctx);
	let if_block = current_block_type(ctx);

	return {
		c() {
			div = element("div");
			if_block.c();
			attr(div, "class", "indicator svelte-17qb5ew");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			if_block.m(div, null);
		},
		p(ctx, dirty) {
			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block) {
				if_block.p(ctx, dirty);
			} else {
				if_block.d(1);
				if_block = current_block_type(ctx);

				if (if_block) {
					if_block.c();
					if_block.m(div, null);
				}
			}
		},
		d(detaching) {
			if (detaching) detach(div);
			if_block.d();
		}
	};
}

// (881:6) {:else}
function create_else_block$1(ctx) {
	let svg;
	let path;

	return {
		c() {
			svg = svg_element("svg");
			path = svg_element("path");
			attr(path, "d", "M4.516 7.548c0.436-0.446 1.043-0.481 1.576 0l3.908 3.747\n            3.908-3.747c0.533-0.481 1.141-0.446 1.574 0 0.436 0.445 0.408 1.197 0\n            1.615-0.406 0.418-4.695 4.502-4.695 4.502-0.217 0.223-0.502\n            0.335-0.787 0.335s-0.57-0.112-0.789-0.335c0\n            0-4.287-4.084-4.695-4.502s-0.436-1.17 0-1.615z");
			attr(svg, "width", "100%");
			attr(svg, "height", "100%");
			attr(svg, "viewBox", "0 0 20 20");
			attr(svg, "focusable", "false");
			attr(svg, "class", "svelte-17qb5ew");
		},
		m(target, anchor) {
			insert(target, svg, anchor);
			append(svg, path);
		},
		p: noop,
		d(detaching) {
			if (detaching) detach(svg);
		}
	};
}

// (879:6) {#if indicatorSvg}
function create_if_block_2$2(ctx) {
	let html_tag;
	let html_anchor;

	return {
		c() {
			html_anchor = empty();
			html_tag = new HtmlTag(html_anchor);
		},
		m(target, anchor) {
			html_tag.m(/*indicatorSvg*/ ctx[22], target, anchor);
			insert(target, html_anchor, anchor);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*indicatorSvg*/ 4194304) html_tag.p(/*indicatorSvg*/ ctx[22]);
		},
		d(detaching) {
			if (detaching) detach(html_anchor);
			if (detaching) html_tag.d();
		}
	};
}

// (898:2) {#if isWaiting}
function create_if_block$3(ctx) {
	let div;

	return {
		c() {
			div = element("div");
			div.innerHTML = `<svg class="spinner_icon svelte-17qb5ew" viewBox="25 25 50 50"><circle class="spinner_path svelte-17qb5ew" cx="50" cy="50" r="20" fill="none" stroke="currentColor" stroke-width="5" stroke-miterlimit="10"></circle></svg>`;
			attr(div, "class", "spinner svelte-17qb5ew");
		},
		m(target, anchor) {
			insert(target, div, anchor);
		},
		d(detaching) {
			if (detaching) detach(div);
		}
	};
}

function create_fragment$a(ctx) {
	let div;
	let t0;
	let t1;
	let t2;
	let t3;
	let t4;
	let t5;
	let div_class_value;
	let current;
	let mounted;
	let dispose;
	let if_block0 = /*Icon*/ ctx[17] && create_if_block_7$1(ctx);
	let if_block1 = /*isMulti*/ ctx[8] && /*selectedValue*/ ctx[0] && /*selectedValue*/ ctx[0].length > 0 && create_if_block_6$1(ctx);

	function select_block_type(ctx, dirty) {
		if (/*isDisabled*/ ctx[10]) return create_if_block_5$1;
		return create_else_block_1$1;
	}

	let current_block_type = select_block_type(ctx);
	let if_block2 = current_block_type(ctx);
	let if_block3 = !/*isMulti*/ ctx[8] && /*showSelectedItem*/ ctx[27] && create_if_block_4$2(ctx);
	let if_block4 = /*showSelectedItem*/ ctx[27] && /*isClearable*/ ctx[16] && !/*isDisabled*/ ctx[10] && !/*isWaiting*/ ctx[5] && create_if_block_3$2(ctx);
	let if_block5 = (/*showIndicator*/ ctx[20] || (/*showChevron*/ ctx[19] && !/*selectedValue*/ ctx[0] || !/*isSearchable*/ ctx[14] && !/*isDisabled*/ ctx[10] && !/*isWaiting*/ ctx[5] && (/*showSelectedItem*/ ctx[27] && !/*isClearable*/ ctx[16] || !/*showSelectedItem*/ ctx[27]))) && create_if_block_1$3(ctx);
	let if_block6 = /*isWaiting*/ ctx[5] && create_if_block$3();

	return {
		c() {
			div = element("div");
			if (if_block0) if_block0.c();
			t0 = space();
			if (if_block1) if_block1.c();
			t1 = space();
			if_block2.c();
			t2 = space();
			if (if_block3) if_block3.c();
			t3 = space();
			if (if_block4) if_block4.c();
			t4 = space();
			if (if_block5) if_block5.c();
			t5 = space();
			if (if_block6) if_block6.c();
			attr(div, "class", div_class_value = "selectContainer " + /*containerClasses*/ ctx[21] + " svelte-17qb5ew");
			attr(div, "style", /*containerStyles*/ ctx[12]);
			toggle_class(div, "hasError", /*hasError*/ ctx[11]);
			toggle_class(div, "multiSelect", /*isMulti*/ ctx[8]);
			toggle_class(div, "disabled", /*isDisabled*/ ctx[10]);
			toggle_class(div, "focused", /*isFocused*/ ctx[4]);
		},
		m(target, anchor) {
			insert(target, div, anchor);
			if (if_block0) if_block0.m(div, null);
			append(div, t0);
			if (if_block1) if_block1.m(div, null);
			append(div, t1);
			if_block2.m(div, null);
			append(div, t2);
			if (if_block3) if_block3.m(div, null);
			append(div, t3);
			if (if_block4) if_block4.m(div, null);
			append(div, t4);
			if (if_block5) if_block5.m(div, null);
			append(div, t5);
			if (if_block6) if_block6.m(div, null);
			/*div_binding*/ ctx[65](div);
			current = true;

			if (!mounted) {
				dispose = [
					listen(window, "click", /*handleWindowClick*/ ctx[33]),
					listen(window, "keydown", /*handleKeyDown*/ ctx[31]),
					listen(window, "resize", /*getPosition*/ ctx[30]),
					listen(div, "click", /*handleClick*/ ctx[34])
				];

				mounted = true;
			}
		},
		p(ctx, dirty) {
			if (/*Icon*/ ctx[17]) {
				if (if_block0) {
					if_block0.p(ctx, dirty);

					if (dirty[0] & /*Icon*/ 131072) {
						transition_in(if_block0, 1);
					}
				} else {
					if_block0 = create_if_block_7$1(ctx);
					if_block0.c();
					transition_in(if_block0, 1);
					if_block0.m(div, t0);
				}
			} else if (if_block0) {
				group_outros();

				transition_out(if_block0, 1, 1, () => {
					if_block0 = null;
				});

				check_outros();
			}

			if (/*isMulti*/ ctx[8] && /*selectedValue*/ ctx[0] && /*selectedValue*/ ctx[0].length > 0) {
				if (if_block1) {
					if_block1.p(ctx, dirty);

					if (dirty[0] & /*isMulti, selectedValue*/ 257) {
						transition_in(if_block1, 1);
					}
				} else {
					if_block1 = create_if_block_6$1(ctx);
					if_block1.c();
					transition_in(if_block1, 1);
					if_block1.m(div, t1);
				}
			} else if (if_block1) {
				group_outros();

				transition_out(if_block1, 1, 1, () => {
					if_block1 = null;
				});

				check_outros();
			}

			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block2) {
				if_block2.p(ctx, dirty);
			} else {
				if_block2.d(1);
				if_block2 = current_block_type(ctx);

				if (if_block2) {
					if_block2.c();
					if_block2.m(div, t2);
				}
			}

			if (!/*isMulti*/ ctx[8] && /*showSelectedItem*/ ctx[27]) {
				if (if_block3) {
					if_block3.p(ctx, dirty);

					if (dirty[0] & /*isMulti, showSelectedItem*/ 134217984) {
						transition_in(if_block3, 1);
					}
				} else {
					if_block3 = create_if_block_4$2(ctx);
					if_block3.c();
					transition_in(if_block3, 1);
					if_block3.m(div, t3);
				}
			} else if (if_block3) {
				group_outros();

				transition_out(if_block3, 1, 1, () => {
					if_block3 = null;
				});

				check_outros();
			}

			if (/*showSelectedItem*/ ctx[27] && /*isClearable*/ ctx[16] && !/*isDisabled*/ ctx[10] && !/*isWaiting*/ ctx[5]) {
				if (if_block4) {
					if_block4.p(ctx, dirty);

					if (dirty[0] & /*showSelectedItem, isClearable, isDisabled, isWaiting*/ 134284320) {
						transition_in(if_block4, 1);
					}
				} else {
					if_block4 = create_if_block_3$2(ctx);
					if_block4.c();
					transition_in(if_block4, 1);
					if_block4.m(div, t4);
				}
			} else if (if_block4) {
				group_outros();

				transition_out(if_block4, 1, 1, () => {
					if_block4 = null;
				});

				check_outros();
			}

			if (/*showIndicator*/ ctx[20] || (/*showChevron*/ ctx[19] && !/*selectedValue*/ ctx[0] || !/*isSearchable*/ ctx[14] && !/*isDisabled*/ ctx[10] && !/*isWaiting*/ ctx[5] && (/*showSelectedItem*/ ctx[27] && !/*isClearable*/ ctx[16] || !/*showSelectedItem*/ ctx[27]))) {
				if (if_block5) {
					if_block5.p(ctx, dirty);
				} else {
					if_block5 = create_if_block_1$3(ctx);
					if_block5.c();
					if_block5.m(div, t5);
				}
			} else if (if_block5) {
				if_block5.d(1);
				if_block5 = null;
			}

			if (/*isWaiting*/ ctx[5]) {
				if (if_block6) ; else {
					if_block6 = create_if_block$3();
					if_block6.c();
					if_block6.m(div, null);
				}
			} else if (if_block6) {
				if_block6.d(1);
				if_block6 = null;
			}

			if (!current || dirty[0] & /*containerClasses*/ 2097152 && div_class_value !== (div_class_value = "selectContainer " + /*containerClasses*/ ctx[21] + " svelte-17qb5ew")) {
				attr(div, "class", div_class_value);
			}

			if (!current || dirty[0] & /*containerStyles*/ 4096) {
				attr(div, "style", /*containerStyles*/ ctx[12]);
			}

			if (dirty[0] & /*containerClasses, hasError*/ 2099200) {
				toggle_class(div, "hasError", /*hasError*/ ctx[11]);
			}

			if (dirty[0] & /*containerClasses, isMulti*/ 2097408) {
				toggle_class(div, "multiSelect", /*isMulti*/ ctx[8]);
			}

			if (dirty[0] & /*containerClasses, isDisabled*/ 2098176) {
				toggle_class(div, "disabled", /*isDisabled*/ ctx[10]);
			}

			if (dirty[0] & /*containerClasses, isFocused*/ 2097168) {
				toggle_class(div, "focused", /*isFocused*/ ctx[4]);
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block0);
			transition_in(if_block1);
			transition_in(if_block3);
			transition_in(if_block4);
			current = true;
		},
		o(local) {
			transition_out(if_block0);
			transition_out(if_block1);
			transition_out(if_block3);
			transition_out(if_block4);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(div);
			if (if_block0) if_block0.d();
			if (if_block1) if_block1.d();
			if_block2.d();
			if (if_block3) if_block3.d();
			if (if_block4) if_block4.d();
			if (if_block5) if_block5.d();
			if (if_block6) if_block6.d();
			/*div_binding*/ ctx[65](null);
			mounted = false;
			run_all(dispose);
		}
	};
}

function instance$9($$self, $$props, $$invalidate) {
	let showSelectedItem;
	let placeholderText;
	const dispatch = createEventDispatcher();
	let { container = undefined } = $$props;
	let { input = undefined } = $$props;
	let { Item: Item$1 = Item } = $$props;
	let { Selection: Selection$1 = Selection } = $$props;
	let { MultiSelection: MultiSelection$1 = MultiSelection } = $$props;
	let { isMulti = false } = $$props;
	let { multiFullItemClearable = false } = $$props;
	let { isDisabled = false } = $$props;
	let { isCreatable = false } = $$props;
	let { isFocused = false } = $$props;
	let { selectedValue = undefined } = $$props;
	let { filterText = "" } = $$props;
	let { placeholder = "Select..." } = $$props;
	let { items = [] } = $$props;
	let { itemFilter = (label, filterText, option) => label.toLowerCase().includes(filterText.toLowerCase()) } = $$props;
	let { groupBy = undefined } = $$props;
	let { groupFilter = groups => groups } = $$props;
	let { isGroupHeaderSelectable = false } = $$props;

	let { getGroupHeaderLabel = option => {
		return option.label;
	} } = $$props;

	let { getOptionLabel = (option, filterText) => {
		return option.isCreator
		? `Create \"${filterText}\"`
		: option.label;
	} } = $$props;

	let { optionIdentifier = "value" } = $$props;
	let { loadOptions = undefined } = $$props;
	let { hasError = false } = $$props;
	let { containerStyles = "" } = $$props;

	let { getSelectionLabel = option => {
		if (option) return option.label;
	} } = $$props;

	let { createGroupHeaderItem = groupValue => {
		return { value: groupValue, label: groupValue };
	} } = $$props;

	let { createItem = filterText => {
		return { value: filterText, label: filterText };
	} } = $$props;

	let { isSearchable = true } = $$props;
	let { inputStyles = "" } = $$props;
	let { isClearable = true } = $$props;
	let { isWaiting = false } = $$props;
	let { listPlacement = "auto" } = $$props;
	let { listOpen = false } = $$props;
	let { list = undefined } = $$props;
	let { isVirtualList = false } = $$props;
	let { loadOptionsInterval = 300 } = $$props;
	let { noOptionsMessage = "No options" } = $$props;
	let { hideEmptyState = false } = $$props;
	let { filteredItems = [] } = $$props;
	let { inputAttributes = {} } = $$props;
	let { listAutoWidth = true } = $$props;
	let { itemHeight = 40 } = $$props;
	let { Icon = undefined } = $$props;
	let { iconProps = {} } = $$props;
	let { showChevron = false } = $$props;
	let { showIndicator = false } = $$props;
	let { containerClasses = "" } = $$props;
	let { indicatorSvg = undefined } = $$props;
	let { ClearIcon: ClearIcon$1 = ClearIcon } = $$props;
	let target;
	let activeSelectedValue;
	let originalItemsClone;
	let prev_selectedValue;
	let prev_listOpen;
	let prev_filterText;
	let prev_isFocused;
	let prev_filteredItems;

	async function resetFilter() {
		await tick();
		$$invalidate(1, filterText = "");
	}

	let getItemsHasInvoked = false;

	const getItems = debounce(
		async () => {
			getItemsHasInvoked = true;
			$$invalidate(5, isWaiting = true);

			let res = await loadOptions(filterText).catch(err => {
				console.warn("svelte-select loadOptions error :>> ", err);
				dispatch("error", { type: "loadOptions", details: err });
			});

			if (res && !res.cancelled) {
				if (res) {
					$$invalidate(35, items = [...res]);
					dispatch("loaded", { items });
				} else {
					$$invalidate(35, items = []);
				}

				$$invalidate(5, isWaiting = false);
				$$invalidate(4, isFocused = true);
				$$invalidate(37, listOpen = true);
			}
		},
		loadOptionsInterval
	);

	let _inputAttributes = {};

	beforeUpdate(() => {
		if (isMulti && selectedValue && selectedValue.length > 1) {
			checkSelectedValueForDuplicates();
		}

		if (!isMulti && selectedValue && prev_selectedValue !== selectedValue) {
			if (!prev_selectedValue || JSON.stringify(selectedValue[optionIdentifier]) !== JSON.stringify(prev_selectedValue[optionIdentifier])) {
				dispatch("select", selectedValue);
			}
		}

		if (isMulti && JSON.stringify(selectedValue) !== JSON.stringify(prev_selectedValue)) {
			if (checkSelectedValueForDuplicates()) {
				dispatch("select", selectedValue);
			}
		}

		if (container && listOpen !== prev_listOpen) {
			if (listOpen) {
				loadList();
			} else {
				removeList();
			}
		}

		if (filterText !== prev_filterText) {
			if (filterText.length > 0) {
				$$invalidate(4, isFocused = true);
				$$invalidate(37, listOpen = true);

				if (loadOptions) {
					getItems();
				} else {
					loadList();
					$$invalidate(37, listOpen = true);

					if (isMulti) {
						$$invalidate(25, activeSelectedValue = undefined);
					}
				}
			} else {
				setList([]);
			}

			if (list) {
				list.$set({ filterText });
			}
		}

		if (isFocused !== prev_isFocused) {
			if (isFocused || listOpen) {
				handleFocus();
			} else {
				resetFilter();
				if (input) input.blur();
			}
		}

		if (prev_filteredItems !== filteredItems) {
			let _filteredItems = [...filteredItems];

			if (isCreatable && filterText) {
				const itemToCreate = createItem(filterText);
				itemToCreate.isCreator = true;

				const existingItemWithFilterValue = _filteredItems.find(item => {
					return item[optionIdentifier] === itemToCreate[optionIdentifier];
				});

				let existingSelectionWithFilterValue;

				if (selectedValue) {
					if (isMulti) {
						existingSelectionWithFilterValue = selectedValue.find(selection => {
							return selection[optionIdentifier] === itemToCreate[optionIdentifier];
						});
					} else if (selectedValue[optionIdentifier] === itemToCreate[optionIdentifier]) {
						existingSelectionWithFilterValue = selectedValue;
					}
				}

				if (!existingItemWithFilterValue && !existingSelectionWithFilterValue) {
					_filteredItems = [..._filteredItems, itemToCreate];
				}
			}

			setList(_filteredItems);
		}

		prev_selectedValue = selectedValue;
		prev_listOpen = listOpen;
		prev_filterText = filterText;
		prev_isFocused = isFocused;
		prev_filteredItems = filteredItems;
	});

	function checkSelectedValueForDuplicates() {
		let noDuplicates = true;

		if (selectedValue) {
			const ids = [];
			const uniqueValues = [];

			selectedValue.forEach(val => {
				if (!ids.includes(val[optionIdentifier])) {
					ids.push(val[optionIdentifier]);
					uniqueValues.push(val);
				} else {
					noDuplicates = false;
				}
			});

			if (!noDuplicates) $$invalidate(0, selectedValue = uniqueValues);
		}

		return noDuplicates;
	}

	function findItem(selection) {
		let matchTo = selection
		? selection[optionIdentifier]
		: selectedValue[optionIdentifier];

		return items.find(item => item[optionIdentifier] === matchTo);
	}

	function updateSelectedValueDisplay(items) {
		if (!items || items.length === 0 || items.some(item => typeof item !== "object")) return;

		if (!selectedValue || (isMulti
		? selectedValue.some(selection => !selection || !selection[optionIdentifier])
		: !selectedValue[optionIdentifier])) return;

		if (Array.isArray(selectedValue)) {
			$$invalidate(0, selectedValue = selectedValue.map(selection => findItem(selection) || selection));
		} else {
			$$invalidate(0, selectedValue = findItem() || selectedValue);
		}
	}

	async function setList(items) {
		await tick();
		if (!listOpen) return;
		if (list) return list.$set({ items });
		if (loadOptions && getItemsHasInvoked && items.length > 0) loadList();
	}

	function handleMultiItemClear(event) {
		const { detail } = event;
		const itemToRemove = selectedValue[detail ? detail.i : selectedValue.length - 1];

		if (selectedValue.length === 1) {
			$$invalidate(0, selectedValue = undefined);
		} else {
			$$invalidate(0, selectedValue = selectedValue.filter(item => {
				return item !== itemToRemove;
			}));
		}

		dispatch("clear", itemToRemove);
		getPosition();
	}

	async function getPosition() {
		await tick();
		if (!target || !container) return;
		const { top, height, width } = container.getBoundingClientRect();
		target.style["min-width"] = `${width}px`;
		target.style.width = `${listAutoWidth ? "auto" : "100%"}`;
		target.style.left = "0";

		if (listPlacement === "top") {
			target.style.bottom = `${height + 5}px`;
		} else {
			target.style.top = `${height + 5}px`;
		}

		target = target;

		if (listPlacement === "auto" && isOutOfViewport(target).bottom) {
			target.style.top = ``;
			target.style.bottom = `${height + 5}px`;
		}

		target.style.visibility = "";
	}

	function handleKeyDown(e) {
		if (!isFocused) return;

		switch (e.key) {
			case "ArrowDown":
				e.preventDefault();
				$$invalidate(37, listOpen = true);
				$$invalidate(25, activeSelectedValue = undefined);
				break;
			case "ArrowUp":
				e.preventDefault();
				$$invalidate(37, listOpen = true);
				$$invalidate(25, activeSelectedValue = undefined);
				break;
			case "Tab":
				if (!listOpen) $$invalidate(4, isFocused = false);
				break;
			case "Backspace":
				if (!isMulti || filterText.length > 0) return;
				if (isMulti && selectedValue && selectedValue.length > 0) {
					handleMultiItemClear(activeSelectedValue !== undefined
					? activeSelectedValue
					: selectedValue.length - 1);

					if (activeSelectedValue === 0 || activeSelectedValue === undefined) break;

					$$invalidate(25, activeSelectedValue = selectedValue.length > activeSelectedValue
					? activeSelectedValue - 1
					: undefined);
				}
				break;
			case "ArrowLeft":
				if (list) list.$set({ hoverItemIndex: -1 });
				if (!isMulti || filterText.length > 0) return;
				if (activeSelectedValue === undefined) {
					$$invalidate(25, activeSelectedValue = selectedValue.length - 1);
				} else if (selectedValue.length > activeSelectedValue && activeSelectedValue !== 0) {
					$$invalidate(25, activeSelectedValue -= 1);
				}
				break;
			case "ArrowRight":
				if (list) list.$set({ hoverItemIndex: -1 });
				if (!isMulti || filterText.length > 0 || activeSelectedValue === undefined) return;
				if (activeSelectedValue === selectedValue.length - 1) {
					$$invalidate(25, activeSelectedValue = undefined);
				} else if (activeSelectedValue < selectedValue.length - 1) {
					$$invalidate(25, activeSelectedValue += 1);
				}
				break;
		}
	}

	function handleFocus() {
		$$invalidate(4, isFocused = true);
		if (input) input.focus();
	}

	function removeList() {
		resetFilter();
		$$invalidate(25, activeSelectedValue = undefined);
		if (!list) return;
		list.$destroy();
		$$invalidate(36, list = undefined);
		if (!target) return;
		if (target.parentNode) target.parentNode.removeChild(target);
		target = undefined;
		$$invalidate(36, list);
		target = target;
	}

	function handleWindowClick(event) {
		if (!container) return;

		const eventTarget = event.path && event.path.length > 0
		? event.path[0]
		: event.target;

		if (container.contains(eventTarget)) return;
		$$invalidate(4, isFocused = false);
		$$invalidate(37, listOpen = false);
		$$invalidate(25, activeSelectedValue = undefined);
		if (input) input.blur();
	}

	function handleClick() {
		if (isDisabled) return;
		$$invalidate(4, isFocused = true);
		$$invalidate(37, listOpen = !listOpen);
	}

	function handleClear() {
		$$invalidate(0, selectedValue = undefined);
		$$invalidate(37, listOpen = false);
		dispatch("clear", selectedValue);
		handleFocus();
	}

	async function loadList() {
		await tick();
		if (target && list) return;

		const data = {
			Item: Item$1,
			filterText,
			optionIdentifier,
			noOptionsMessage,
			hideEmptyState,
			isVirtualList,
			selectedValue,
			isMulti,
			getGroupHeaderLabel,
			items: filteredItems,
			itemHeight
		};

		if (getOptionLabel) {
			data.getOptionLabel = getOptionLabel;
		}

		target = document.createElement("div");

		Object.assign(target.style, {
			position: "absolute",
			"z-index": 2,
			visibility: "hidden"
		});

		$$invalidate(36, list);
		target = target;
		if (container) container.appendChild(target);
		$$invalidate(36, list = new List({ target, props: data }));

		list.$on("itemSelected", event => {
			const { detail } = event;

			if (detail) {
				const item = Object.assign({}, detail);

				if (!item.isGroupHeader || item.isSelectable) {
					if (isMulti) {
						$$invalidate(0, selectedValue = selectedValue ? selectedValue.concat([item]) : [item]);
					} else {
						$$invalidate(0, selectedValue = item);
					}

					resetFilter();
					(($$invalidate(0, selectedValue), $$invalidate(48, optionIdentifier)), $$invalidate(8, isMulti));

					setTimeout(() => {
						$$invalidate(37, listOpen = false);
						$$invalidate(25, activeSelectedValue = undefined);
					});
				}
			}
		});

		list.$on("itemCreated", event => {
			const { detail } = event;

			if (isMulti) {
				$$invalidate(0, selectedValue = selectedValue || []);
				$$invalidate(0, selectedValue = [...selectedValue, createItem(detail)]);
			} else {
				$$invalidate(0, selectedValue = createItem(detail));
			}

			dispatch("itemCreated", detail);
			$$invalidate(1, filterText = "");
			$$invalidate(37, listOpen = false);
			$$invalidate(25, activeSelectedValue = undefined);
			resetFilter();
		});

		list.$on("closeList", () => {
			$$invalidate(37, listOpen = false);
		});

		($$invalidate(36, list), target = target);
		getPosition();
	}

	onMount(() => {
		if (isFocused) input.focus();
		if (listOpen) loadList();

		if (items && items.length > 0) {
			$$invalidate(60, originalItemsClone = JSON.stringify(items));
		}
	});

	onDestroy(() => {
		removeList();
	});

	function input_1_binding($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](() => {
			input = $$value;
			$$invalidate(3, input);
		});
	}

	function input_1_input_handler() {
		filterText = this.value;
		$$invalidate(1, filterText);
	}

	function input_1_binding_1($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](() => {
			input = $$value;
			$$invalidate(3, input);
		});
	}

	function input_1_input_handler_1() {
		filterText = this.value;
		$$invalidate(1, filterText);
	}

	function div_binding($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](() => {
			container = $$value;
			$$invalidate(2, container);
		});
	}

	$$self.$$set = $$props => {
		if ("container" in $$props) $$invalidate(2, container = $$props.container);
		if ("input" in $$props) $$invalidate(3, input = $$props.input);
		if ("Item" in $$props) $$invalidate(39, Item$1 = $$props.Item);
		if ("Selection" in $$props) $$invalidate(6, Selection$1 = $$props.Selection);
		if ("MultiSelection" in $$props) $$invalidate(7, MultiSelection$1 = $$props.MultiSelection);
		if ("isMulti" in $$props) $$invalidate(8, isMulti = $$props.isMulti);
		if ("multiFullItemClearable" in $$props) $$invalidate(9, multiFullItemClearable = $$props.multiFullItemClearable);
		if ("isDisabled" in $$props) $$invalidate(10, isDisabled = $$props.isDisabled);
		if ("isCreatable" in $$props) $$invalidate(40, isCreatable = $$props.isCreatable);
		if ("isFocused" in $$props) $$invalidate(4, isFocused = $$props.isFocused);
		if ("selectedValue" in $$props) $$invalidate(0, selectedValue = $$props.selectedValue);
		if ("filterText" in $$props) $$invalidate(1, filterText = $$props.filterText);
		if ("placeholder" in $$props) $$invalidate(41, placeholder = $$props.placeholder);
		if ("items" in $$props) $$invalidate(35, items = $$props.items);
		if ("itemFilter" in $$props) $$invalidate(42, itemFilter = $$props.itemFilter);
		if ("groupBy" in $$props) $$invalidate(43, groupBy = $$props.groupBy);
		if ("groupFilter" in $$props) $$invalidate(44, groupFilter = $$props.groupFilter);
		if ("isGroupHeaderSelectable" in $$props) $$invalidate(45, isGroupHeaderSelectable = $$props.isGroupHeaderSelectable);
		if ("getGroupHeaderLabel" in $$props) $$invalidate(46, getGroupHeaderLabel = $$props.getGroupHeaderLabel);
		if ("getOptionLabel" in $$props) $$invalidate(47, getOptionLabel = $$props.getOptionLabel);
		if ("optionIdentifier" in $$props) $$invalidate(48, optionIdentifier = $$props.optionIdentifier);
		if ("loadOptions" in $$props) $$invalidate(49, loadOptions = $$props.loadOptions);
		if ("hasError" in $$props) $$invalidate(11, hasError = $$props.hasError);
		if ("containerStyles" in $$props) $$invalidate(12, containerStyles = $$props.containerStyles);
		if ("getSelectionLabel" in $$props) $$invalidate(13, getSelectionLabel = $$props.getSelectionLabel);
		if ("createGroupHeaderItem" in $$props) $$invalidate(50, createGroupHeaderItem = $$props.createGroupHeaderItem);
		if ("createItem" in $$props) $$invalidate(51, createItem = $$props.createItem);
		if ("isSearchable" in $$props) $$invalidate(14, isSearchable = $$props.isSearchable);
		if ("inputStyles" in $$props) $$invalidate(15, inputStyles = $$props.inputStyles);
		if ("isClearable" in $$props) $$invalidate(16, isClearable = $$props.isClearable);
		if ("isWaiting" in $$props) $$invalidate(5, isWaiting = $$props.isWaiting);
		if ("listPlacement" in $$props) $$invalidate(52, listPlacement = $$props.listPlacement);
		if ("listOpen" in $$props) $$invalidate(37, listOpen = $$props.listOpen);
		if ("list" in $$props) $$invalidate(36, list = $$props.list);
		if ("isVirtualList" in $$props) $$invalidate(53, isVirtualList = $$props.isVirtualList);
		if ("loadOptionsInterval" in $$props) $$invalidate(54, loadOptionsInterval = $$props.loadOptionsInterval);
		if ("noOptionsMessage" in $$props) $$invalidate(55, noOptionsMessage = $$props.noOptionsMessage);
		if ("hideEmptyState" in $$props) $$invalidate(56, hideEmptyState = $$props.hideEmptyState);
		if ("filteredItems" in $$props) $$invalidate(38, filteredItems = $$props.filteredItems);
		if ("inputAttributes" in $$props) $$invalidate(57, inputAttributes = $$props.inputAttributes);
		if ("listAutoWidth" in $$props) $$invalidate(58, listAutoWidth = $$props.listAutoWidth);
		if ("itemHeight" in $$props) $$invalidate(59, itemHeight = $$props.itemHeight);
		if ("Icon" in $$props) $$invalidate(17, Icon = $$props.Icon);
		if ("iconProps" in $$props) $$invalidate(18, iconProps = $$props.iconProps);
		if ("showChevron" in $$props) $$invalidate(19, showChevron = $$props.showChevron);
		if ("showIndicator" in $$props) $$invalidate(20, showIndicator = $$props.showIndicator);
		if ("containerClasses" in $$props) $$invalidate(21, containerClasses = $$props.containerClasses);
		if ("indicatorSvg" in $$props) $$invalidate(22, indicatorSvg = $$props.indicatorSvg);
		if ("ClearIcon" in $$props) $$invalidate(23, ClearIcon$1 = $$props.ClearIcon);
	};

	$$self.$$.update = () => {
		if ($$self.$$.dirty[0] & /*isDisabled*/ 1024) ;

		if ($$self.$$.dirty[1] & /*items*/ 16) {
			updateSelectedValueDisplay(items);
		}

		if ($$self.$$.dirty[0] & /*selectedValue, isMulti*/ 257 | $$self.$$.dirty[1] & /*optionIdentifier*/ 131072) {
			{
				if (typeof selectedValue === "string") {
					$$invalidate(0, selectedValue = {
						[optionIdentifier]: selectedValue,
						label: selectedValue
					});
				} else if (isMulti && Array.isArray(selectedValue) && selectedValue.length > 0) {
					$$invalidate(0, selectedValue = selectedValue.map(item => typeof item === "string"
					? { value: item, label: item }
					: item));
				}
			}
		}

		if ($$self.$$.dirty[1] & /*noOptionsMessage, list*/ 16777248) {
			{
				if (noOptionsMessage && list) list.$set({ noOptionsMessage });
			}
		}

		if ($$self.$$.dirty[0] & /*selectedValue, filterText*/ 3) {
			$$invalidate(27, showSelectedItem = selectedValue && filterText.length === 0);
		}

		if ($$self.$$.dirty[0] & /*selectedValue*/ 1 | $$self.$$.dirty[1] & /*placeholder*/ 1024) {
			$$invalidate(28, placeholderText = selectedValue ? "" : placeholder);
		}

		if ($$self.$$.dirty[0] & /*isSearchable*/ 16384 | $$self.$$.dirty[1] & /*inputAttributes*/ 67108864) {
			{
				$$invalidate(26, _inputAttributes = Object.assign(
					{
						autocomplete: "off",
						autocorrect: "off",
						spellcheck: false
					},
					inputAttributes
				));

				if (!isSearchable) {
					$$invalidate(26, _inputAttributes.readonly = true, _inputAttributes);
				}
			}
		}

		if ($$self.$$.dirty[0] & /*filterText, isMulti, selectedValue*/ 259 | $$self.$$.dirty[1] & /*items, loadOptions, originalItemsClone, optionIdentifier, itemFilter, getOptionLabel, groupBy, createGroupHeaderItem, isGroupHeaderSelectable, groupFilter*/ 537884688) {
			{
				let _filteredItems;
				let _items = items;

				if (items && items.length > 0 && typeof items[0] !== "object") {
					_items = items.map((item, index) => {
						return { index, value: item, label: item };
					});
				}

				if (loadOptions && filterText.length === 0 && originalItemsClone) {
					_filteredItems = JSON.parse(originalItemsClone);
					_items = JSON.parse(originalItemsClone);
				} else {
					_filteredItems = loadOptions
					? filterText.length === 0 ? [] : _items
					: _items.filter(item => {
							let keepItem = true;

							if (isMulti && selectedValue) {
								keepItem = !selectedValue.some(value => {
									return value[optionIdentifier] === item[optionIdentifier];
								});
							}

							if (!keepItem) return false;
							if (filterText.length < 1) return true;
							return itemFilter(getOptionLabel(item, filterText), filterText, item);
						});
				}

				if (groupBy) {
					const groupValues = [];
					const groups = {};

					_filteredItems.forEach(item => {
						const groupValue = groupBy(item);

						if (!groupValues.includes(groupValue)) {
							groupValues.push(groupValue);
							groups[groupValue] = [];

							if (groupValue) {
								groups[groupValue].push(Object.assign(createGroupHeaderItem(groupValue, item), {
									id: groupValue,
									isGroupHeader: true,
									isSelectable: isGroupHeaderSelectable
								}));
							}
						}

						groups[groupValue].push(Object.assign({ isGroupItem: !!groupValue }, item));
					});

					const sortedGroupedItems = [];

					groupFilter(groupValues).forEach(groupValue => {
						sortedGroupedItems.push(...groups[groupValue]);
					});

					$$invalidate(38, filteredItems = sortedGroupedItems);
				} else {
					$$invalidate(38, filteredItems = _filteredItems);
				}
			}
		}
	};

	return [
		selectedValue,
		filterText,
		container,
		input,
		isFocused,
		isWaiting,
		Selection$1,
		MultiSelection$1,
		isMulti,
		multiFullItemClearable,
		isDisabled,
		hasError,
		containerStyles,
		getSelectionLabel,
		isSearchable,
		inputStyles,
		isClearable,
		Icon,
		iconProps,
		showChevron,
		showIndicator,
		containerClasses,
		indicatorSvg,
		ClearIcon$1,
		handleClear,
		activeSelectedValue,
		_inputAttributes,
		showSelectedItem,
		placeholderText,
		handleMultiItemClear,
		getPosition,
		handleKeyDown,
		handleFocus,
		handleWindowClick,
		handleClick,
		items,
		list,
		listOpen,
		filteredItems,
		Item$1,
		isCreatable,
		placeholder,
		itemFilter,
		groupBy,
		groupFilter,
		isGroupHeaderSelectable,
		getGroupHeaderLabel,
		getOptionLabel,
		optionIdentifier,
		loadOptions,
		createGroupHeaderItem,
		createItem,
		listPlacement,
		isVirtualList,
		loadOptionsInterval,
		noOptionsMessage,
		hideEmptyState,
		inputAttributes,
		listAutoWidth,
		itemHeight,
		originalItemsClone,
		input_1_binding,
		input_1_input_handler,
		input_1_binding_1,
		input_1_input_handler_1,
		div_binding
	];
}

class Select extends SvelteComponent {
	constructor(options) {
		super();
		if (!document_1.getElementById("svelte-17qb5ew-style")) add_css$2();

		init(
			this,
			options,
			instance$9,
			create_fragment$a,
			safe_not_equal,
			{
				container: 2,
				input: 3,
				Item: 39,
				Selection: 6,
				MultiSelection: 7,
				isMulti: 8,
				multiFullItemClearable: 9,
				isDisabled: 10,
				isCreatable: 40,
				isFocused: 4,
				selectedValue: 0,
				filterText: 1,
				placeholder: 41,
				items: 35,
				itemFilter: 42,
				groupBy: 43,
				groupFilter: 44,
				isGroupHeaderSelectable: 45,
				getGroupHeaderLabel: 46,
				getOptionLabel: 47,
				optionIdentifier: 48,
				loadOptions: 49,
				hasError: 11,
				containerStyles: 12,
				getSelectionLabel: 13,
				createGroupHeaderItem: 50,
				createItem: 51,
				isSearchable: 14,
				inputStyles: 15,
				isClearable: 16,
				isWaiting: 5,
				listPlacement: 52,
				listOpen: 37,
				list: 36,
				isVirtualList: 53,
				loadOptionsInterval: 54,
				noOptionsMessage: 55,
				hideEmptyState: 56,
				filteredItems: 38,
				inputAttributes: 57,
				listAutoWidth: 58,
				itemHeight: 59,
				Icon: 17,
				iconProps: 18,
				showChevron: 19,
				showIndicator: 20,
				containerClasses: 21,
				indicatorSvg: 22,
				ClearIcon: 23,
				handleClear: 24
			},
			[-1, -1, -1]
		);
	}

	get handleClear() {
		return this.$$.ctx[24];
	}
}

/* src/modals/createTask/LabelSelector.svelte generated by Svelte v3.38.2 */

function create_fragment$9(ctx) {
	let select;
	let updating_selectedValue;
	let current;

	function select_selectedValue_binding(value) {
		/*select_selectedValue_binding*/ ctx[3](value);
	}

	let select_props = {
		items: /*labels*/ ctx[1],
		isMulti: true,
		placeholder: "Select labels...",
		noOptionsMessage: "No labels."
	};

	if (/*selected*/ ctx[0] !== void 0) {
		select_props.selectedValue = /*selected*/ ctx[0];
	}

	select = new Select({ props: select_props });
	binding_callbacks.push(() => bind(select, "selectedValue", select_selectedValue_binding));

	return {
		c() {
			create_component(select.$$.fragment);
		},
		m(target, anchor) {
			mount_component(select, target, anchor);
			current = true;
		},
		p(ctx, [dirty]) {
			const select_changes = {};
			if (dirty & /*labels*/ 2) select_changes.items = /*labels*/ ctx[1];

			if (!updating_selectedValue && dirty & /*selected*/ 1) {
				updating_selectedValue = true;
				select_changes.selectedValue = /*selected*/ ctx[0];
				add_flush_callback(() => updating_selectedValue = false);
			}

			select.$set(select_changes);
		},
		i(local) {
			if (current) return;
			transition_in(select.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(select.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(select, detaching);
		}
	};
}

function createLabelOptions(metadata) {
	return Array.from(metadata.labels).sort(([,first_name], [,second_name]) => first_name.localeCompare(second_name)).map(([id, label]) => {
		return { value: id, label };
	});
}

function instance$8($$self, $$props, $$invalidate) {
	let labels;
	
	
	let { selected } = $$props;
	let { metadata } = $$props;

	function select_selectedValue_binding(value) {
		selected = value;
		$$invalidate(0, selected);
	}

	$$self.$$set = $$props => {
		if ("selected" in $$props) $$invalidate(0, selected = $$props.selected);
		if ("metadata" in $$props) $$invalidate(2, metadata = $$props.metadata);
	};

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*metadata*/ 4) {
			$$invalidate(1, labels = createLabelOptions(metadata));
		}
	};

	return [selected, labels, metadata, select_selectedValue_binding];
}

class LabelSelector extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$8, create_fragment$9, safe_not_equal, { selected: 0, metadata: 2 });
	}
}

/* src/modals/createTask/PriorityPicker.svelte generated by Svelte v3.38.2 */

function add_css$1() {
	var style = element("style");
	style.id = "svelte-wz2flg-style";
	style.textContent = ".priority-container.svelte-wz2flg.svelte-wz2flg{display:flex;height:42px}.priority-option.svelte-wz2flg.svelte-wz2flg{width:25%;height:42px;text-align:center;border:1px solid var(--background-modifier-border);background:var(--background-modifier-form-field)}.priority-option.svelte-wz2flg>span.svelte-wz2flg{line-height:42px}.priority-selected.svelte-wz2flg.svelte-wz2flg{border:1px solid var(--interactive-accent);background:var(--background-modifier-form-field-highlighted)}.priority-container.svelte-wz2flg .priority-option.svelte-wz2flg:first-child{border-radius:10px 0 0 10px}.priority-container.svelte-wz2flg .priority-option.svelte-wz2flg:last-child{border-radius:0 10px 10px 0}";
	append(document.head, style);
}

function get_each_context$4(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[3] = list[i];
	return child_ctx;
}

// (57:2) {#each options as option}
function create_each_block$4(ctx) {
	let div;
	let span;
	let t0_value = /*option*/ ctx[3].label + "";
	let t0;
	let t1;
	let div_class_value;
	let mounted;
	let dispose;

	function click_handler() {
		return /*click_handler*/ ctx[2](/*option*/ ctx[3]);
	}

	return {
		c() {
			div = element("div");
			span = element("span");
			t0 = text(t0_value);
			t1 = space();
			attr(span, "class", "svelte-wz2flg");

			attr(div, "class", div_class_value = "priority-option " + (/*option*/ ctx[3].value == /*selected*/ ctx[0]
			? "priority-selected"
			: "") + " priority-" + /*option*/ ctx[3].label + " svelte-wz2flg");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			append(div, span);
			append(span, t0);
			append(div, t1);

			if (!mounted) {
				dispose = listen(div, "click", click_handler);
				mounted = true;
			}
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;

			if (dirty & /*selected*/ 1 && div_class_value !== (div_class_value = "priority-option " + (/*option*/ ctx[3].value == /*selected*/ ctx[0]
			? "priority-selected"
			: "") + " priority-" + /*option*/ ctx[3].label + " svelte-wz2flg")) {
				attr(div, "class", div_class_value);
			}
		},
		d(detaching) {
			if (detaching) detach(div);
			mounted = false;
			dispose();
		}
	};
}

function create_fragment$8(ctx) {
	let div;
	let each_value = /*options*/ ctx[1];
	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
	}

	return {
		c() {
			div = element("div");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			attr(div, "class", "priority-container svelte-wz2flg");
		},
		m(target, anchor) {
			insert(target, div, anchor);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(div, null);
			}
		},
		p(ctx, [dirty]) {
			if (dirty & /*options, selected*/ 3) {
				each_value = /*options*/ ctx[1];
				let i;

				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context$4(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block$4(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(div, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value.length;
			}
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(div);
			destroy_each(each_blocks, detaching);
		}
	};
}

function instance$7($$self, $$props, $$invalidate) {
	let { selected } = $$props;

	// Note: Priority is defined in the Todoist API opposite to that in the UI.
	// In the UI priority 4 = lowest, in the API 1 is the lowest.
	const options = [
		{ label: "4", value: 1 },
		{ label: "3", value: 2 },
		{ label: "2", value: 3 },
		{ label: "1", value: 4 }
	];

	const click_handler = option => {
		$$invalidate(0, selected = option.value);
	};

	$$self.$$set = $$props => {
		if ("selected" in $$props) $$invalidate(0, selected = $$props.selected);
	};

	return [selected, options, click_handler];
}

class PriorityPicker extends SvelteComponent {
	constructor(options) {
		super();
		if (!document.getElementById("svelte-wz2flg-style")) add_css$1();
		init(this, options, instance$7, create_fragment$8, safe_not_equal, { selected: 0 });
	}
}

/* src/modals/createTask/ProjectSelector.svelte generated by Svelte v3.38.2 */

function create_fragment$7(ctx) {
	let select;
	let updating_selectedValue;
	let current;

	function select_selectedValue_binding(value) {
		/*select_selectedValue_binding*/ ctx[3](value);
	}

	let select_props = {
		items: /*projectTree*/ ctx[1],
		isClearable: false,
		placeholder: "Select project or section"
	};

	if (/*selected*/ ctx[0] !== void 0) {
		select_props.selectedValue = /*selected*/ ctx[0];
	}

	select = new Select({ props: select_props });
	binding_callbacks.push(() => bind(select, "selectedValue", select_selectedValue_binding));

	return {
		c() {
			create_component(select.$$.fragment);
		},
		m(target, anchor) {
			mount_component(select, target, anchor);
			current = true;
		},
		p(ctx, [dirty]) {
			const select_changes = {};
			if (dirty & /*projectTree*/ 2) select_changes.items = /*projectTree*/ ctx[1];

			if (!updating_selectedValue && dirty & /*selected*/ 1) {
				updating_selectedValue = true;
				select_changes.selectedValue = /*selected*/ ctx[0];
				add_flush_callback(() => updating_selectedValue = false);
			}

			select.$set(select_changes);
		},
		i(local) {
			if (current) return;
			transition_in(select.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(select.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(select, detaching);
		}
	};
}

function instance$6($$self, $$props, $$invalidate) {
	let projectTree;
	
	
	
	let { selected } = $$props;
	let { metadata } = $$props;

	function createProjectTree(metadata) {
		const projects = new Map();

		for (const project of metadata.projects.values()) {
			if (!projects.has(project.id)) {
				projects.set(project.id, { subProjects: [], sections: [] });
			}

			if (project.parent_id) {
				if (projects.has(project.parent_id)) {
					const data = projects.get(project.parent_id);
					data.subProjects.push(project.id);
				} else {
					projects.set(project.parent_id, { subProjects: [project.id], sections: [] });
				}
			}
		}

		for (const section of metadata.sections.values()) {
			const data = projects.get(section.project_id);
			data.sections.push(section.id);
		}

		// Now generate the value/label combos
		const topLevelProjects = Array.from(metadata.projects.values()).filter(prj => prj.parent_id == null).sort((prj1, prj2) => prj1.order - prj2.order);

		const options = [];

		function descendPrjTree(id, depth, chain) {
			let prjName = metadata.projects.get(id).name;
			let nextChain = chain + prjName + " > ";

			options.push({
				value: { type: "Project", id },
				label: chain + " " + prjName
			});

			let children = projects.get(id);

			if (children === null || children === void 0
			? void 0
			: children.sections) {
				for (const sectionId of children.sections) {
					let section = metadata.sections.get(sectionId);

					options.push({
						value: { type: "Section", id: section.id },
						label: nextChain + section.name
					});
				}
			}

			if (children === null || children === void 0
			? void 0
			: children.subProjects) {
				for (const childProject of children.subProjects) {
					descendPrjTree(childProject, depth + 1, nextChain);
				}
			}
		}

		for (const prj of topLevelProjects) {
			descendPrjTree(prj.id, 0, "");
		}

		if (selected == null) {
			$$invalidate(0, selected = options.find(opt => opt.label == " Inbox" && opt.value.type == "Project"));
		}

		return options;
	}

	function select_selectedValue_binding(value) {
		selected = value;
		$$invalidate(0, selected);
	}

	$$self.$$set = $$props => {
		if ("selected" in $$props) $$invalidate(0, selected = $$props.selected);
		if ("metadata" in $$props) $$invalidate(2, metadata = $$props.metadata);
	};

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*metadata*/ 4) {
			$$invalidate(1, projectTree = createProjectTree(metadata));
		}
	};

	return [selected, projectTree, metadata, select_selectedValue_binding];
}

class ProjectSelector extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$6, create_fragment$7, safe_not_equal, { selected: 0, metadata: 2 });
	}
}

/* src/modals/createTask/CreateTaskModalContent.svelte generated by Svelte v3.38.2 */

function add_css() {
	var style = element("style");
	style.id = "svelte-1efem5i-style";
	style.textContent = "button.svelte-1efem5i.svelte-1efem5i{float:right;margin-top:20px}.select.svelte-1efem5i.svelte-1efem5i{--border:1px solid var(--background-primary-alt);--borderHoverColor:var(--interactive-accent);--borderFocusColor:var(--interactive-accent);--background:var(--background-modifier-form-field);--listBackground:var(--background-primary);--itemIsActiveBG:var(--background-secondary);--itemIsActiveColor:var(--text-normal);--itemHoverBG:var(--background-secondary);--itemColor:var(--text-normal);--multiItemBG:var(--background-secondary);--multiItemActiveColor:var(--text-normal);--multiItemActiveBG:var(--background-secondary-alt);margin-top:0.5em;display:flex;align-items:center}.select.svelte-1efem5i>span.svelte-1efem5i{width:4em}.select.svelte-1efem5i>div.svelte-1efem5i{flex-grow:1}input.svelte-1efem5i.svelte-1efem5i{width:100%;margin-bottom:0.5em;line-height:42px}";
	append(document.head, style);
}

function create_fragment$6(ctx) {
	let input;
	let t0;
	let div8;
	let div1;
	let span0;
	let t2;
	let div0;
	let projectselector;
	let updating_selected;
	let updating_metadata;
	let t3;
	let div3;
	let span1;
	let t5;
	let div2;
	let labelselector;
	let updating_selected_1;
	let updating_metadata_1;
	let t6;
	let div5;
	let span2;
	let t8;
	let div4;
	let dateselector;
	let updating_selected_2;
	let t9;
	let div7;
	let span3;
	let t11;
	let div6;
	let prioritypicker;
	let updating_selected_3;
	let t12;
	let button;
	let t13;
	let button_disabled_value;
	let current;
	let mounted;
	let dispose;

	function projectselector_selected_binding(value) {
		/*projectselector_selected_binding*/ ctx[13](value);
	}

	function projectselector_metadata_binding(value) {
		/*projectselector_metadata_binding*/ ctx[14](value);
	}

	let projectselector_props = {};

	if (/*activeProject*/ ctx[2] !== void 0) {
		projectselector_props.selected = /*activeProject*/ ctx[2];
	}

	if (/*metadata*/ ctx[6] !== void 0) {
		projectselector_props.metadata = /*metadata*/ ctx[6];
	}

	projectselector = new ProjectSelector({ props: projectselector_props });
	binding_callbacks.push(() => bind(projectselector, "selected", projectselector_selected_binding));
	binding_callbacks.push(() => bind(projectselector, "metadata", projectselector_metadata_binding));

	function labelselector_selected_binding(value) {
		/*labelselector_selected_binding*/ ctx[15](value);
	}

	function labelselector_metadata_binding(value) {
		/*labelselector_metadata_binding*/ ctx[16](value);
	}

	let labelselector_props = {};

	if (/*activeLabels*/ ctx[1] !== void 0) {
		labelselector_props.selected = /*activeLabels*/ ctx[1];
	}

	if (/*metadata*/ ctx[6] !== void 0) {
		labelselector_props.metadata = /*metadata*/ ctx[6];
	}

	labelselector = new LabelSelector({ props: labelselector_props });
	binding_callbacks.push(() => bind(labelselector, "selected", labelselector_selected_binding));
	binding_callbacks.push(() => bind(labelselector, "metadata", labelselector_metadata_binding));

	function dateselector_selected_binding(value) {
		/*dateselector_selected_binding*/ ctx[17](value);
	}

	let dateselector_props = {};

	if (/*date*/ ctx[3] !== void 0) {
		dateselector_props.selected = /*date*/ ctx[3];
	}

	dateselector = new DateSelector({ props: dateselector_props });
	binding_callbacks.push(() => bind(dateselector, "selected", dateselector_selected_binding));

	function prioritypicker_selected_binding(value) {
		/*prioritypicker_selected_binding*/ ctx[18](value);
	}

	let prioritypicker_props = {};

	if (/*priority*/ ctx[4] !== void 0) {
		prioritypicker_props.selected = /*priority*/ ctx[4];
	}

	prioritypicker = new PriorityPicker({ props: prioritypicker_props });
	binding_callbacks.push(() => bind(prioritypicker, "selected", prioritypicker_selected_binding));

	return {
		c() {
			input = element("input");
			t0 = space();
			div8 = element("div");
			div1 = element("div");
			span0 = element("span");
			span0.textContent = "Project";
			t2 = space();
			div0 = element("div");
			create_component(projectselector.$$.fragment);
			t3 = space();
			div3 = element("div");
			span1 = element("span");
			span1.textContent = "Labels";
			t5 = space();
			div2 = element("div");
			create_component(labelselector.$$.fragment);
			t6 = space();
			div5 = element("div");
			span2 = element("span");
			span2.textContent = "Date";
			t8 = space();
			div4 = element("div");
			create_component(dateselector.$$.fragment);
			t9 = space();
			div7 = element("div");
			span3 = element("span");
			span3.textContent = "Priority";
			t11 = space();
			div6 = element("div");
			create_component(prioritypicker.$$.fragment);
			t12 = space();
			button = element("button");
			t13 = text("Add");
			attr(input, "type", "text");
			attr(input, "placeholder", "What to do?");
			attr(input, "class", "svelte-1efem5i");
			attr(span0, "class", "svelte-1efem5i");
			attr(div0, "class", "svelte-1efem5i");
			attr(div1, "class", "select svelte-1efem5i");
			attr(span1, "class", "svelte-1efem5i");
			attr(div2, "class", "svelte-1efem5i");
			attr(div3, "class", "select svelte-1efem5i");
			attr(span2, "class", "svelte-1efem5i");
			attr(div4, "class", "svelte-1efem5i");
			attr(div5, "class", "select svelte-1efem5i");
			attr(span3, "class", "svelte-1efem5i");
			attr(div6, "class", "svelte-1efem5i");
			attr(div7, "class", "select svelte-1efem5i");
			button.disabled = button_disabled_value = (/*value*/ ctx[0]?.length ?? 0) == 0;
			attr(button, "class", "svelte-1efem5i");
		},
		m(target, anchor) {
			insert(target, input, anchor);
			/*input_binding*/ ctx[11](input);
			set_input_value(input, /*value*/ ctx[0]);
			insert(target, t0, anchor);
			insert(target, div8, anchor);
			append(div8, div1);
			append(div1, span0);
			append(div1, t2);
			append(div1, div0);
			mount_component(projectselector, div0, null);
			append(div8, t3);
			append(div8, div3);
			append(div3, span1);
			append(div3, t5);
			append(div3, div2);
			mount_component(labelselector, div2, null);
			append(div8, t6);
			append(div8, div5);
			append(div5, span2);
			append(div5, t8);
			append(div5, div4);
			mount_component(dateselector, div4, null);
			append(div8, t9);
			append(div8, div7);
			append(div7, span3);
			append(div7, t11);
			append(div7, div6);
			mount_component(prioritypicker, div6, null);
			insert(target, t12, anchor);
			insert(target, button, anchor);
			append(button, t13);
			current = true;

			if (!mounted) {
				dispose = [
					listen(input, "input", /*input_input_handler*/ ctx[12]),
					listen(button, "click", /*triggerClose*/ ctx[7])
				];

				mounted = true;
			}
		},
		p(ctx, [dirty]) {
			if (dirty & /*value*/ 1 && input.value !== /*value*/ ctx[0]) {
				set_input_value(input, /*value*/ ctx[0]);
			}

			const projectselector_changes = {};

			if (!updating_selected && dirty & /*activeProject*/ 4) {
				updating_selected = true;
				projectselector_changes.selected = /*activeProject*/ ctx[2];
				add_flush_callback(() => updating_selected = false);
			}

			if (!updating_metadata && dirty & /*metadata*/ 64) {
				updating_metadata = true;
				projectselector_changes.metadata = /*metadata*/ ctx[6];
				add_flush_callback(() => updating_metadata = false);
			}

			projectselector.$set(projectselector_changes);
			const labelselector_changes = {};

			if (!updating_selected_1 && dirty & /*activeLabels*/ 2) {
				updating_selected_1 = true;
				labelselector_changes.selected = /*activeLabels*/ ctx[1];
				add_flush_callback(() => updating_selected_1 = false);
			}

			if (!updating_metadata_1 && dirty & /*metadata*/ 64) {
				updating_metadata_1 = true;
				labelselector_changes.metadata = /*metadata*/ ctx[6];
				add_flush_callback(() => updating_metadata_1 = false);
			}

			labelselector.$set(labelselector_changes);
			const dateselector_changes = {};

			if (!updating_selected_2 && dirty & /*date*/ 8) {
				updating_selected_2 = true;
				dateselector_changes.selected = /*date*/ ctx[3];
				add_flush_callback(() => updating_selected_2 = false);
			}

			dateselector.$set(dateselector_changes);
			const prioritypicker_changes = {};

			if (!updating_selected_3 && dirty & /*priority*/ 16) {
				updating_selected_3 = true;
				prioritypicker_changes.selected = /*priority*/ ctx[4];
				add_flush_callback(() => updating_selected_3 = false);
			}

			prioritypicker.$set(prioritypicker_changes);

			if (!current || dirty & /*value*/ 1 && button_disabled_value !== (button_disabled_value = (/*value*/ ctx[0]?.length ?? 0) == 0)) {
				button.disabled = button_disabled_value;
			}
		},
		i(local) {
			if (current) return;
			transition_in(projectselector.$$.fragment, local);
			transition_in(labelselector.$$.fragment, local);
			transition_in(dateselector.$$.fragment, local);
			transition_in(prioritypicker.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(projectselector.$$.fragment, local);
			transition_out(labelselector.$$.fragment, local);
			transition_out(dateselector.$$.fragment, local);
			transition_out(prioritypicker.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(input);
			/*input_binding*/ ctx[11](null);
			if (detaching) detach(t0);
			if (detaching) detach(div8);
			destroy_component(projectselector);
			destroy_component(labelselector);
			destroy_component(dateselector);
			destroy_component(prioritypicker);
			if (detaching) detach(t12);
			if (detaching) detach(button);
			mounted = false;
			run_all(dispose);
		}
	};
}

function instance$5($$self, $$props, $$invalidate) {
	var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
		function adopt(value) {
			return value instanceof P
			? value
			: new P(function (resolve) {
						resolve(value);
					});
		}

		return new (P || (P = Promise))(function (resolve, reject) {
				function fulfilled(value) {
					try {
						step(generator.next(value));
					} catch(e) {
						reject(e);
					}
				}

				function rejected(value) {
					try {
						step(generator["throw"](value));
					} catch(e) {
						reject(e);
					}
				}

				function step(result) {
					result.done
					? resolve(result.value)
					: adopt(result.value).then(fulfilled, rejected);
				}

				step((generator = generator.apply(thisArg, _arguments || [])).next());
			});
	};

	
	
	
	let { api } = $$props;
	let { close } = $$props;
	let { value } = $$props;
	let { initialCursorPosition } = $$props;
	let activeLabels = null;
	let activeProject = null;
	let date = null;
	let priority = 1;
	let inputEl;
	let metadata;
	api.metadata.subscribe(value => $$invalidate(6, metadata = value));

	onMount(() => __awaiter(void 0, void 0, void 0, function* () {
		yield tick();
		inputEl.focus();

		if (typeof initialCursorPosition != "undefined") {
			inputEl.setSelectionRange(initialCursorPosition, initialCursorPosition);
			$$invalidate(5, inputEl.scrollLeft = 0, inputEl);
		}
	}));

	function triggerClose() {
		return __awaiter(this, void 0, void 0, function* () {
			let opts = { priority };

			if (activeLabels) {
				opts.label_ids = activeLabels.map(label => label.value);
			}

			if (activeProject) {
				if (activeProject.value.type == "Project") {
					opts.project_id = activeProject.value.id;
				} else {
					opts.section_id = activeProject.value.id;
				}
			}

			if (date) {
				opts.due_date = date.format("YYYY-MM-DD");
			}

			const result = yield api.createTask(value, opts);

			if (result.isOk()) {
				close();
				new obsidian.Notice("Task created successfully.");
			} else {
				new obsidian.Notice(`Failed to create task: '${result.unwrapErr().message}'`);
			}
		});
	}

	function input_binding($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](() => {
			inputEl = $$value;
			$$invalidate(5, inputEl);
		});
	}

	function input_input_handler() {
		value = this.value;
		$$invalidate(0, value);
	}

	function projectselector_selected_binding(value) {
		activeProject = value;
		$$invalidate(2, activeProject);
	}

	function projectselector_metadata_binding(value) {
		metadata = value;
		$$invalidate(6, metadata);
	}

	function labelselector_selected_binding(value) {
		activeLabels = value;
		$$invalidate(1, activeLabels);
	}

	function labelselector_metadata_binding(value) {
		metadata = value;
		$$invalidate(6, metadata);
	}

	function dateselector_selected_binding(value) {
		date = value;
		$$invalidate(3, date);
	}

	function prioritypicker_selected_binding(value) {
		priority = value;
		$$invalidate(4, priority);
	}

	$$self.$$set = $$props => {
		if ("api" in $$props) $$invalidate(8, api = $$props.api);
		if ("close" in $$props) $$invalidate(9, close = $$props.close);
		if ("value" in $$props) $$invalidate(0, value = $$props.value);
		if ("initialCursorPosition" in $$props) $$invalidate(10, initialCursorPosition = $$props.initialCursorPosition);
	};

	return [
		value,
		activeLabels,
		activeProject,
		date,
		priority,
		inputEl,
		metadata,
		triggerClose,
		api,
		close,
		initialCursorPosition,
		input_binding,
		input_input_handler,
		projectselector_selected_binding,
		projectselector_metadata_binding,
		labelselector_selected_binding,
		labelselector_metadata_binding,
		dateselector_selected_binding,
		prioritypicker_selected_binding
	];
}

class CreateTaskModalContent extends SvelteComponent {
	constructor(options) {
		super();
		if (!document.getElementById("svelte-1efem5i-style")) add_css();

		init(this, options, instance$5, create_fragment$6, safe_not_equal, {
			api: 8,
			close: 9,
			value: 0,
			initialCursorPosition: 10
		});
	}
}

class CreateTaskModal extends obsidian.Modal {
    constructor(app, api, initialValue, initialCursorPosition) {
        super(app);
        this.titleEl.innerText = "Create new Todoist task";
        this.modalContent = new CreateTaskModalContent({
            target: this.contentEl,
            props: {
                api: api,
                close: () => this.close(),
                value: initialValue,
                initialCursorPosition: initialCursorPosition,
            },
        });
        this.open();
    }
    onClose() {
        super.onClose();
        this.modalContent.$destroy();
    }
}

const possibleSortingOptions = ["date", "priority"];
function parseQuery(query) {
    if (!query.hasOwnProperty("name")) {
        return Result.Err(new Error("Missing 'name' field in query."));
    }
    if (!query.hasOwnProperty("filter")) {
        return Result.Err(new Error("Missing 'filter' field in query"));
    }
    if (query.hasOwnProperty("autorefresh") &&
        (isNaN(query.autorefresh) || query.autorefresh < 0)) {
        return Result.Err(new Error("'autorefresh' field must be a positive number."));
    }
    if (query.hasOwnProperty("sorting")) {
        if (!Array.isArray(query.sorting)) {
            return Result.Err(new Error("'sorting' field must be an array of strings within the set ['date', 'priority']."));
        }
        const sorting = query.sorting;
        for (const element of sorting) {
            if (!(typeof element == "string") ||
                possibleSortingOptions.indexOf(element) == -1) {
                return Result.Err(new Error("'sorting' field must be an array of strings within the set ['date', 'priority']."));
            }
        }
    }
    if (query.hasOwnProperty("group") && typeof query.group != "boolean") {
        return Result.Err(new Error("'group' field must be a boolean."));
    }
    return Result.Ok(query);
}

/* src/ui/NoTaskDisplay.svelte generated by Svelte v3.38.2 */

function create_fragment$5(ctx) {
	let div;

	return {
		c() {
			div = element("div");
			div.innerHTML = `<p>Nothing to-do! Sit back and relax.</p>`;
			attr(div, "class", "todoist-success");
		},
		m(target, anchor) {
			insert(target, div, anchor);
		},
		p: noop,
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(div);
		}
	};
}

class NoTaskDisplay extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, null, create_fragment$5, safe_not_equal, {});
	}
}

function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
    const o = +getComputedStyle(node).opacity;
    return {
        delay,
        duration,
        easing,
        css: t => `opacity: ${t * o}`
    };
}

function showTaskContext(app, taskCtx, position) {
    new obsidian.Menu(app)
        .addItem((menuItem) => menuItem
        .setTitle("Complete task")
        .setIcon("check-small")
        .onClick(async () => taskCtx.onClickTask(taskCtx.task)))
        .addItem((menuItem) => menuItem
        .setTitle("Open task in Todoist (app)")
        .setIcon("popup-open")
        .onClick(() => {
        openExternal(`todoist://task?id=${taskCtx.task.id}`);
    }))
        .addItem((menuItem) => menuItem
        .setTitle("Open task in Todoist (web)")
        .setIcon("popup-open")
        .onClick(() => openExternal(`https://todoist.com/app/project/${taskCtx.task.projectID}/task/${taskCtx.task.id}`)))
        .showAtPosition(position);
}
const openExternal = async (url) => {
    try {
        await electronOpenExternal(url);
    }
    catch (_a) {
        new obsidian.Notice("Failed to open in external application.");
    }
};
const electronOpenExternal = (() => {
    return require("electron").shell.openExternal;
})();

/* src/ui/TaskRenderer.svelte generated by Svelte v3.38.2 */

function get_each_context$3(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[15] = list[i];
	child_ctx[17] = i;
	return child_ctx;
}

// (98:4) {#if settings.renderProject && renderProject}
function create_if_block_6(ctx) {
	let div;
	let t0;
	let t1_value = /*metadata*/ ctx[0].projects.get_or_default(/*todo*/ ctx[6].projectID, UnknownProject).name + "";
	let t1;
	let t2;
	let if_block0 = /*settings*/ ctx[1].renderProjectIcon && create_if_block_8();
	let if_block1 = /*todo*/ ctx[6].sectionID && create_if_block_7(ctx);

	return {
		c() {
			div = element("div");
			if (if_block0) if_block0.c();
			t0 = space();
			t1 = text(t1_value);
			t2 = space();
			if (if_block1) if_block1.c();
			attr(div, "class", "task-project");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			if (if_block0) if_block0.m(div, null);
			append(div, t0);
			append(div, t1);
			append(div, t2);
			if (if_block1) if_block1.m(div, null);
		},
		p(ctx, dirty) {
			if (/*settings*/ ctx[1].renderProjectIcon) {
				if (if_block0) ; else {
					if_block0 = create_if_block_8();
					if_block0.c();
					if_block0.m(div, t0);
				}
			} else if (if_block0) {
				if_block0.d(1);
				if_block0 = null;
			}

			if (dirty & /*metadata, todo*/ 65 && t1_value !== (t1_value = /*metadata*/ ctx[0].projects.get_or_default(/*todo*/ ctx[6].projectID, UnknownProject).name + "")) set_data(t1, t1_value);

			if (/*todo*/ ctx[6].sectionID) {
				if (if_block1) {
					if_block1.p(ctx, dirty);
				} else {
					if_block1 = create_if_block_7(ctx);
					if_block1.c();
					if_block1.m(div, null);
				}
			} else if (if_block1) {
				if_block1.d(1);
				if_block1 = null;
			}
		},
		d(detaching) {
			if (detaching) detach(div);
			if (if_block0) if_block0.d();
			if (if_block1) if_block1.d();
		}
	};
}

// (100:8) {#if settings.renderProjectIcon}
function create_if_block_8(ctx) {
	let svg;
	let path;

	return {
		c() {
			svg = svg_element("svg");
			path = svg_element("path");
			attr(path, "fill-rule", "evenodd");
			attr(path, "d", "M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 2h10v7h-2l-1 2H8l-1-2H5V5z");
			attr(path, "clip-rule", "evenodd");
			attr(svg, "class", "task-project-icon");
			attr(svg, "xmlns", "http://www.w3.org/2000/svg");
			attr(svg, "viewBox", "0 0 20 20");
			attr(svg, "fill", "currentColor");
		},
		m(target, anchor) {
			insert(target, svg, anchor);
			append(svg, path);
		},
		d(detaching) {
			if (detaching) detach(svg);
		}
	};
}

// (113:8) {#if todo.sectionID}
function create_if_block_7(ctx) {
	let t0;
	let t1_value = /*metadata*/ ctx[0].sections.get_or_default(/*todo*/ ctx[6].sectionID, UnknownSection).name + "";
	let t1;

	return {
		c() {
			t0 = text("|\n          ");
			t1 = text(t1_value);
		},
		m(target, anchor) {
			insert(target, t0, anchor);
			insert(target, t1, anchor);
		},
		p(ctx, dirty) {
			if (dirty & /*metadata, todo*/ 65 && t1_value !== (t1_value = /*metadata*/ ctx[0].sections.get_or_default(/*todo*/ ctx[6].sectionID, UnknownSection).name + "")) set_data(t1, t1_value);
		},
		d(detaching) {
			if (detaching) detach(t0);
			if (detaching) detach(t1);
		}
	};
}

// (119:4) {#if settings.renderDate && todo.date}
function create_if_block_4$1(ctx) {
	let div;
	let t0;
	let t1_value = /*todo*/ ctx[6].date + "";
	let t1;
	let div_class_value;
	let if_block = /*settings*/ ctx[1].renderDateIcon && create_if_block_5();

	return {
		c() {
			div = element("div");
			if (if_block) if_block.c();
			t0 = space();
			t1 = text(t1_value);
			attr(div, "class", div_class_value = "task-date " + (/*todo*/ ctx[6].isOverdue() ? "task-overdue" : ""));
		},
		m(target, anchor) {
			insert(target, div, anchor);
			if (if_block) if_block.m(div, null);
			append(div, t0);
			append(div, t1);
		},
		p(ctx, dirty) {
			if (/*settings*/ ctx[1].renderDateIcon) {
				if (if_block) ; else {
					if_block = create_if_block_5();
					if_block.c();
					if_block.m(div, t0);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}

			if (dirty & /*todo*/ 64 && t1_value !== (t1_value = /*todo*/ ctx[6].date + "")) set_data(t1, t1_value);

			if (dirty & /*todo*/ 64 && div_class_value !== (div_class_value = "task-date " + (/*todo*/ ctx[6].isOverdue() ? "task-overdue" : ""))) {
				attr(div, "class", div_class_value);
			}
		},
		d(detaching) {
			if (detaching) detach(div);
			if (if_block) if_block.d();
		}
	};
}

// (121:8) {#if settings.renderDateIcon}
function create_if_block_5(ctx) {
	let svg;
	let path;

	return {
		c() {
			svg = svg_element("svg");
			path = svg_element("path");
			attr(path, "fill-rule", "evenodd");
			attr(path, "d", "M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z");
			attr(path, "clip-rule", "evenodd");
			attr(svg, "class", "task-calendar-icon");
			attr(svg, "xmlns", "http://www.w3.org/2000/svg");
			attr(svg, "viewBox", "0 0 20 20");
			attr(svg, "fill", "currentColor");
		},
		m(target, anchor) {
			insert(target, svg, anchor);
			append(svg, path);
		},
		d(detaching) {
			if (detaching) detach(svg);
		}
	};
}

// (136:4) {#if settings.renderLabels && todo.labelIDs.length > 0}
function create_if_block_1$2(ctx) {
	let div;
	let t;
	let if_block = /*settings*/ ctx[1].renderLabelsIcon && create_if_block_3$1();
	let each_value = /*todo*/ ctx[6].labelIDs;
	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
	}

	return {
		c() {
			div = element("div");
			if (if_block) if_block.c();
			t = space();

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			attr(div, "class", "task-labels");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			if (if_block) if_block.m(div, null);
			append(div, t);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(div, null);
			}
		},
		p(ctx, dirty) {
			if (/*settings*/ ctx[1].renderLabelsIcon) {
				if (if_block) ; else {
					if_block = create_if_block_3$1();
					if_block.c();
					if_block.m(div, t);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}

			if (dirty & /*todo, metadata*/ 65) {
				each_value = /*todo*/ ctx[6].labelIDs;
				let i;

				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context$3(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block$3(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(div, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value.length;
			}
		},
		d(detaching) {
			if (detaching) detach(div);
			if (if_block) if_block.d();
			destroy_each(each_blocks, detaching);
		}
	};
}

// (138:8) {#if settings.renderLabelsIcon}
function create_if_block_3$1(ctx) {
	let svg;
	let path;

	return {
		c() {
			svg = svg_element("svg");
			path = svg_element("path");
			attr(path, "fill-rule", "evenodd");
			attr(path, "d", "M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z");
			attr(path, "clip-rule", "evenodd");
			attr(svg, "class", "task-labels-icon");
			attr(svg, "xmlns", "http://www.w3.org/2000/svg");
			attr(svg, "viewBox", "0 0 20 20");
			attr(svg, "fill", "currentColor");
		},
		m(target, anchor) {
			insert(target, svg, anchor);
			append(svg, path);
		},
		d(detaching) {
			if (detaching) detach(svg);
		}
	};
}

// (151:68) {#if i != todo.labelIDs.length - 1}
function create_if_block_2$1(ctx) {
	let t;

	return {
		c() {
			t = text(",");
		},
		m(target, anchor) {
			insert(target, t, anchor);
		},
		d(detaching) {
			if (detaching) detach(t);
		}
	};
}

// (150:8) {#each todo.labelIDs as labelID, i}
function create_each_block$3(ctx) {
	let t_value = /*metadata*/ ctx[0].labels.get_or_default(/*labelID*/ ctx[15], "Unknown label") + "";
	let t;
	let if_block_anchor;
	let if_block = /*i*/ ctx[17] != /*todo*/ ctx[6].labelIDs.length - 1 && create_if_block_2$1();

	return {
		c() {
			t = text(t_value);
			if (if_block) if_block.c();
			if_block_anchor = empty();
		},
		m(target, anchor) {
			insert(target, t, anchor);
			if (if_block) if_block.m(target, anchor);
			insert(target, if_block_anchor, anchor);
		},
		p(ctx, dirty) {
			if (dirty & /*metadata, todo*/ 65 && t_value !== (t_value = /*metadata*/ ctx[0].labels.get_or_default(/*labelID*/ ctx[15], "Unknown label") + "")) set_data(t, t_value);

			if (/*i*/ ctx[17] != /*todo*/ ctx[6].labelIDs.length - 1) {
				if (if_block) ; else {
					if_block = create_if_block_2$1();
					if_block.c();
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}
		},
		d(detaching) {
			if (detaching) detach(t);
			if (if_block) if_block.d(detaching);
			if (detaching) detach(if_block_anchor);
		}
	};
}

// (158:2) {#if todo.children.length != 0}
function create_if_block$2(ctx) {
	let tasklist;
	let current;

	tasklist = new TaskList({
			props: {
				tasks: /*todo*/ ctx[6].children,
				settings: /*settings*/ ctx[1],
				api: /*api*/ ctx[2],
				sorting: /*sorting*/ ctx[3],
				renderProject: /*renderProject*/ ctx[4]
			}
		});

	return {
		c() {
			create_component(tasklist.$$.fragment);
		},
		m(target, anchor) {
			mount_component(tasklist, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const tasklist_changes = {};
			if (dirty & /*todo*/ 64) tasklist_changes.tasks = /*todo*/ ctx[6].children;
			if (dirty & /*settings*/ 2) tasklist_changes.settings = /*settings*/ ctx[1];
			if (dirty & /*api*/ 4) tasklist_changes.api = /*api*/ ctx[2];
			if (dirty & /*sorting*/ 8) tasklist_changes.sorting = /*sorting*/ ctx[3];
			if (dirty & /*renderProject*/ 16) tasklist_changes.renderProject = /*renderProject*/ ctx[4];
			tasklist.$set(tasklist_changes);
		},
		i(local) {
			if (current) return;
			transition_in(tasklist.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(tasklist.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(tasklist, detaching);
		}
	};
}

function create_fragment$4(ctx) {
	let li;
	let div1;
	let input;
	let input_disabled_value;
	let t0;
	let div0;
	let div1_class_value;
	let t1;
	let div2;
	let t2;
	let t3;
	let t4;
	let li_class_value;
	let li_transition;
	let current;
	let mounted;
	let dispose;
	let if_block0 = /*settings*/ ctx[1].renderProject && /*renderProject*/ ctx[4] && create_if_block_6(ctx);
	let if_block1 = /*settings*/ ctx[1].renderDate && /*todo*/ ctx[6].date && create_if_block_4$1(ctx);
	let if_block2 = /*settings*/ ctx[1].renderLabels && /*todo*/ ctx[6].labelIDs.length > 0 && create_if_block_1$2(ctx);
	let if_block3 = /*todo*/ ctx[6].children.length != 0 && create_if_block$2(ctx);

	return {
		c() {
			li = element("li");
			div1 = element("div");
			input = element("input");
			t0 = space();
			div0 = element("div");
			t1 = space();
			div2 = element("div");
			if (if_block0) if_block0.c();
			t2 = space();
			if (if_block1) if_block1.c();
			t3 = space();
			if (if_block2) if_block2.c();
			t4 = space();
			if (if_block3) if_block3.c();
			input.disabled = input_disabled_value = !/*isCompletable*/ ctx[8];
			attr(input, "data-line", "1");
			attr(input, "class", "task-list-item-checkbox");
			attr(input, "type", "checkbox");
			attr(div0, "class", "todoist-task-content");
			attr(div1, "class", div1_class_value = getPriorityClass(/*todo*/ ctx[6].priority));
			attr(div2, "class", "task-metadata");
			attr(li, "class", li_class_value = "task-list-item " + (/*todo*/ ctx[6].isOverdue() ? "task-overdue" : "") + "\n          " + (/*todo*/ ctx[6].hasTime ? "has-time" : "has-no-time"));
		},
		m(target, anchor) {
			insert(target, li, anchor);
			append(li, div1);
			append(div1, input);
			append(div1, t0);
			append(div1, div0);
			/*div0_binding*/ ctx[11](div0);
			append(li, t1);
			append(li, div2);
			if (if_block0) if_block0.m(div2, null);
			append(div2, t2);
			if (if_block1) if_block1.m(div2, null);
			append(div2, t3);
			if (if_block2) if_block2.m(div2, null);
			append(li, t4);
			if (if_block3) if_block3.m(li, null);
			current = true;

			if (!mounted) {
				dispose = [
					listen(input, "click", prevent_default(/*click_handler*/ ctx[10])),
					listen(li, "mouseup", /*onClickTaskContainer*/ ctx[9])
				];

				mounted = true;
			}
		},
		p(new_ctx, [dirty]) {
			ctx = new_ctx;

			if (!current || dirty & /*isCompletable*/ 256 && input_disabled_value !== (input_disabled_value = !/*isCompletable*/ ctx[8])) {
				input.disabled = input_disabled_value;
			}

			if (!current || dirty & /*todo*/ 64 && div1_class_value !== (div1_class_value = getPriorityClass(/*todo*/ ctx[6].priority))) {
				attr(div1, "class", div1_class_value);
			}

			if (/*settings*/ ctx[1].renderProject && /*renderProject*/ ctx[4]) {
				if (if_block0) {
					if_block0.p(ctx, dirty);
				} else {
					if_block0 = create_if_block_6(ctx);
					if_block0.c();
					if_block0.m(div2, t2);
				}
			} else if (if_block0) {
				if_block0.d(1);
				if_block0 = null;
			}

			if (/*settings*/ ctx[1].renderDate && /*todo*/ ctx[6].date) {
				if (if_block1) {
					if_block1.p(ctx, dirty);
				} else {
					if_block1 = create_if_block_4$1(ctx);
					if_block1.c();
					if_block1.m(div2, t3);
				}
			} else if (if_block1) {
				if_block1.d(1);
				if_block1 = null;
			}

			if (/*settings*/ ctx[1].renderLabels && /*todo*/ ctx[6].labelIDs.length > 0) {
				if (if_block2) {
					if_block2.p(ctx, dirty);
				} else {
					if_block2 = create_if_block_1$2(ctx);
					if_block2.c();
					if_block2.m(div2, null);
				}
			} else if (if_block2) {
				if_block2.d(1);
				if_block2 = null;
			}

			if (/*todo*/ ctx[6].children.length != 0) {
				if (if_block3) {
					if_block3.p(ctx, dirty);

					if (dirty & /*todo*/ 64) {
						transition_in(if_block3, 1);
					}
				} else {
					if_block3 = create_if_block$2(ctx);
					if_block3.c();
					transition_in(if_block3, 1);
					if_block3.m(li, null);
				}
			} else if (if_block3) {
				group_outros();

				transition_out(if_block3, 1, 1, () => {
					if_block3 = null;
				});

				check_outros();
			}

			if (!current || dirty & /*todo*/ 64 && li_class_value !== (li_class_value = "task-list-item " + (/*todo*/ ctx[6].isOverdue() ? "task-overdue" : "") + "\n          " + (/*todo*/ ctx[6].hasTime ? "has-time" : "has-no-time"))) {
				attr(li, "class", li_class_value);
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block3);

			add_render_callback(() => {
				if (!li_transition) li_transition = create_bidirectional_transition(
					li,
					fade,
					{
						duration: /*settings*/ ctx[1].fadeToggle ? 400 : 0
					},
					true
				);

				li_transition.run(1);
			});

			current = true;
		},
		o(local) {
			transition_out(if_block3);

			if (!li_transition) li_transition = create_bidirectional_transition(
				li,
				fade,
				{
					duration: /*settings*/ ctx[1].fadeToggle ? 400 : 0
				},
				false
			);

			li_transition.run(0);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(li);
			/*div0_binding*/ ctx[11](null);
			if (if_block0) if_block0.d();
			if (if_block1) if_block1.d();
			if (if_block2) if_block2.d();
			if (if_block3) if_block3.d();
			if (detaching && li_transition) li_transition.end();
			mounted = false;
			run_all(dispose);
		}
	};
}

function getPriorityClass(priority) {
	switch (priority) {
		case 1:
			return "todoist-p4";
		case 2:
			return "todoist-p3";
		case 3:
			return "todoist-p2";
		case 4:
			return "todoist-p1";
	}
}

function instance$4($$self, $$props, $$invalidate) {
	let isCompletable;

	var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
		function adopt(value) {
			return value instanceof P
			? value
			: new P(function (resolve) {
						resolve(value);
					});
		}

		return new (P || (P = Promise))(function (resolve, reject) {
				function fulfilled(value) {
					try {
						step(generator.next(value));
					} catch(e) {
						reject(e);
					}
				}

				function rejected(value) {
					try {
						step(generator["throw"](value));
					} catch(e) {
						reject(e);
					}
				}

				function step(result) {
					result.done
					? resolve(result.value)
					: adopt(result.value).then(fulfilled, rejected);
				}

				step((generator = generator.apply(thisArg, _arguments || [])).next());
			});
	};

	
	
	
	let { metadata } = $$props;
	let { settings } = $$props;
	let { api } = $$props;
	let { sorting } = $$props;
	let { renderProject } = $$props;
	let { onClickTask } = $$props;
	let { todo } = $$props;
	const app = getContext(APP_CONTEXT_KEY);
	let taskContentEl;

	onMount(() => __awaiter(void 0, void 0, void 0, function* () {
		yield renderMarkdown(todo.content);
	}));

	function renderMarkdown(content) {
		return __awaiter(this, void 0, void 0, function* () {
			// Escape leading '#' or '-' so they aren't rendered as headers/bullets.
			if (content.startsWith("#") || content.startsWith("-")) {
				content = `\\${content}`;
			}

			// A task starting with '*' signifies that it cannot be completed, so we should strip it from the front of the task.
			if (content.startsWith("*")) {
				content = content.substr(1);
			}

			yield obsidian.MarkdownRenderer.renderMarkdown(content, taskContentEl, "", null);

			// Remove the wrapping '<p>' tag to force it to inline.
			const markdownContent = taskContentEl.querySelector("p");

			if (markdownContent) {
				markdownContent.parentElement.removeChild(markdownContent);
				$$invalidate(7, taskContentEl.innerHTML += markdownContent.innerHTML, taskContentEl);
			}
		});
	}

	function onClickTaskContainer(evt) {
		if (evt.button == 2) {
			evt.stopPropagation();
			evt.preventDefault();
			showTaskContext(app, { task: todo, onClickTask }, { x: evt.pageX, y: evt.pageY });
		}
	}

	const click_handler = async () => {
		await onClickTask(todo);
	};

	function div0_binding($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](() => {
			taskContentEl = $$value;
			$$invalidate(7, taskContentEl);
		});
	}

	$$self.$$set = $$props => {
		if ("metadata" in $$props) $$invalidate(0, metadata = $$props.metadata);
		if ("settings" in $$props) $$invalidate(1, settings = $$props.settings);
		if ("api" in $$props) $$invalidate(2, api = $$props.api);
		if ("sorting" in $$props) $$invalidate(3, sorting = $$props.sorting);
		if ("renderProject" in $$props) $$invalidate(4, renderProject = $$props.renderProject);
		if ("onClickTask" in $$props) $$invalidate(5, onClickTask = $$props.onClickTask);
		if ("todo" in $$props) $$invalidate(6, todo = $$props.todo);
	};

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*todo*/ 64) {
			$$invalidate(8, isCompletable = !todo.content.startsWith("*"));
		}
	};

	return [
		metadata,
		settings,
		api,
		sorting,
		renderProject,
		onClickTask,
		todo,
		taskContentEl,
		isCompletable,
		onClickTaskContainer,
		click_handler,
		div0_binding
	];
}

class TaskRenderer extends SvelteComponent {
	constructor(options) {
		super();

		init(this, options, instance$4, create_fragment$4, safe_not_equal, {
			metadata: 0,
			settings: 1,
			api: 2,
			sorting: 3,
			renderProject: 4,
			onClickTask: 5,
			todo: 6
		});
	}
}

/* src/ui/TaskList.svelte generated by Svelte v3.38.2 */

function get_each_context$2(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[12] = list[i];
	return child_ctx;
}

// (58:27) 
function create_if_block_1$1(ctx) {
	let notaskdisplay;
	let current;
	notaskdisplay = new NoTaskDisplay({});

	return {
		c() {
			create_component(notaskdisplay.$$.fragment);
		},
		m(target, anchor) {
			mount_component(notaskdisplay, target, anchor);
			current = true;
		},
		p: noop,
		i(local) {
			if (current) return;
			transition_in(notaskdisplay.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(notaskdisplay.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(notaskdisplay, detaching);
		}
	};
}

// (45:0) {#if todos.length != 0}
function create_if_block$1(ctx) {
	let ul;
	let each_blocks = [];
	let each_1_lookup = new Map();
	let current;
	let each_value = /*todos*/ ctx[6];
	const get_key = ctx => /*todo*/ ctx[12].id;

	for (let i = 0; i < each_value.length; i += 1) {
		let child_ctx = get_each_context$2(ctx, each_value, i);
		let key = get_key(child_ctx);
		each_1_lookup.set(key, each_blocks[i] = create_each_block$2(key, child_ctx));
	}

	return {
		c() {
			ul = element("ul");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			attr(ul, "class", "contains-task-list");
		},
		m(target, anchor) {
			insert(target, ul, anchor);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(ul, null);
			}

			current = true;
		},
		p(ctx, dirty) {
			if (dirty & /*onClickTask, metadata, settings, api, sorting, renderProject, todos*/ 239) {
				each_value = /*todos*/ ctx[6];
				group_outros();
				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, ul, outro_and_destroy_block, create_each_block$2, null, get_each_context$2);
				check_outros();
			}
		},
		i(local) {
			if (current) return;

			for (let i = 0; i < each_value.length; i += 1) {
				transition_in(each_blocks[i]);
			}

			current = true;
		},
		o(local) {
			for (let i = 0; i < each_blocks.length; i += 1) {
				transition_out(each_blocks[i]);
			}

			current = false;
		},
		d(detaching) {
			if (detaching) detach(ul);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].d();
			}
		}
	};
}

// (47:4) {#each todos as todo (todo.id)}
function create_each_block$2(key_1, ctx) {
	let first;
	let taskrenderer;
	let current;

	taskrenderer = new TaskRenderer({
			props: {
				onClickTask: /*onClickTask*/ ctx[7],
				metadata: /*metadata*/ ctx[5],
				settings: /*settings*/ ctx[0],
				api: /*api*/ ctx[1],
				sorting: /*sorting*/ ctx[2],
				renderProject: /*renderProject*/ ctx[3],
				todo: /*todo*/ ctx[12]
			}
		});

	return {
		key: key_1,
		first: null,
		c() {
			first = empty();
			create_component(taskrenderer.$$.fragment);
			this.first = first;
		},
		m(target, anchor) {
			insert(target, first, anchor);
			mount_component(taskrenderer, target, anchor);
			current = true;
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;
			const taskrenderer_changes = {};
			if (dirty & /*metadata*/ 32) taskrenderer_changes.metadata = /*metadata*/ ctx[5];
			if (dirty & /*settings*/ 1) taskrenderer_changes.settings = /*settings*/ ctx[0];
			if (dirty & /*api*/ 2) taskrenderer_changes.api = /*api*/ ctx[1];
			if (dirty & /*sorting*/ 4) taskrenderer_changes.sorting = /*sorting*/ ctx[2];
			if (dirty & /*renderProject*/ 8) taskrenderer_changes.renderProject = /*renderProject*/ ctx[3];
			if (dirty & /*todos*/ 64) taskrenderer_changes.todo = /*todo*/ ctx[12];
			taskrenderer.$set(taskrenderer_changes);
		},
		i(local) {
			if (current) return;
			transition_in(taskrenderer.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(taskrenderer.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(first);
			destroy_component(taskrenderer, detaching);
		}
	};
}

function create_fragment$3(ctx) {
	let current_block_type_index;
	let if_block;
	let if_block_anchor;
	let current;
	const if_block_creators = [create_if_block$1, create_if_block_1$1];
	const if_blocks = [];

	function select_block_type(ctx, dirty) {
		if (/*todos*/ ctx[6].length != 0) return 0;
		if (/*renderNoTaskInfo*/ ctx[4]) return 1;
		return -1;
	}

	if (~(current_block_type_index = select_block_type(ctx))) {
		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
	}

	return {
		c() {
			if (if_block) if_block.c();
			if_block_anchor = empty();
		},
		m(target, anchor) {
			if (~current_block_type_index) {
				if_blocks[current_block_type_index].m(target, anchor);
			}

			insert(target, if_block_anchor, anchor);
			current = true;
		},
		p(ctx, [dirty]) {
			let previous_block_index = current_block_type_index;
			current_block_type_index = select_block_type(ctx);

			if (current_block_type_index === previous_block_index) {
				if (~current_block_type_index) {
					if_blocks[current_block_type_index].p(ctx, dirty);
				}
			} else {
				if (if_block) {
					group_outros();

					transition_out(if_blocks[previous_block_index], 1, 1, () => {
						if_blocks[previous_block_index] = null;
					});

					check_outros();
				}

				if (~current_block_type_index) {
					if_block = if_blocks[current_block_type_index];

					if (!if_block) {
						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
						if_block.c();
					} else {
						if_block.p(ctx, dirty);
					}

					transition_in(if_block, 1);
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				} else {
					if_block = null;
				}
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o(local) {
			transition_out(if_block);
			current = false;
		},
		d(detaching) {
			if (~current_block_type_index) {
				if_blocks[current_block_type_index].d(detaching);
			}

			if (detaching) detach(if_block_anchor);
		}
	};
}

function instance$3($$self, $$props, $$invalidate) {
	let todos;

	var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
		function adopt(value) {
			return value instanceof P
			? value
			: new P(function (resolve) {
						resolve(value);
					});
		}

		return new (P || (P = Promise))(function (resolve, reject) {
				function fulfilled(value) {
					try {
						step(generator.next(value));
					} catch(e) {
						reject(e);
					}
				}

				function rejected(value) {
					try {
						step(generator["throw"](value));
					} catch(e) {
						reject(e);
					}
				}

				function step(result) {
					result.done
					? resolve(result.value)
					: adopt(result.value).then(fulfilled, rejected);
				}

				step((generator = generator.apply(thisArg, _arguments || [])).next());
			});
	};

	
	
	
	let { tasks } = $$props;
	let { settings } = $$props;
	let { api } = $$props;
	let { sorting } = $$props;
	let { renderProject = true } = $$props;
	let { renderNoTaskInfo = true } = $$props;
	let metadata = null;
	const metadataUnsub = api.metadata.subscribe(value => $$invalidate(5, metadata = value));

	onDestroy(() => {
		metadataUnsub();
	});

	let tasksPendingClose = [];

	function onClickTask(task) {
		return __awaiter(this, void 0, void 0, function* () {
			tasksPendingClose.push(task.id);
			$$invalidate(9, tasksPendingClose);

			if (yield api.closeTask(task.id)) {
				tasks.filter(otherTask => otherTask.id == task.id);
				$$invalidate(8, tasks);
			}

			tasksPendingClose.filter(id => id == task.id);
			$$invalidate(9, tasksPendingClose);
		});
	}

	$$self.$$set = $$props => {
		if ("tasks" in $$props) $$invalidate(8, tasks = $$props.tasks);
		if ("settings" in $$props) $$invalidate(0, settings = $$props.settings);
		if ("api" in $$props) $$invalidate(1, api = $$props.api);
		if ("sorting" in $$props) $$invalidate(2, sorting = $$props.sorting);
		if ("renderProject" in $$props) $$invalidate(3, renderProject = $$props.renderProject);
		if ("renderNoTaskInfo" in $$props) $$invalidate(4, renderNoTaskInfo = $$props.renderNoTaskInfo);
	};

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*tasks, tasksPendingClose, sorting*/ 772) {
			$$invalidate(6, todos = tasks.filter(task => !tasksPendingClose.includes(task.id)).sort((first, second) => first.compareTo(second, sorting)));
		}
	};

	return [
		settings,
		api,
		sorting,
		renderProject,
		renderNoTaskInfo,
		metadata,
		todos,
		onClickTask,
		tasks,
		tasksPendingClose
	];
}

class TaskList extends SvelteComponent {
	constructor(options) {
		super();

		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
			tasks: 8,
			settings: 0,
			api: 1,
			sorting: 2,
			renderProject: 3,
			renderNoTaskInfo: 4
		});
	}
}

/* src/ui/GroupedTaskList.svelte generated by Svelte v3.38.2 */

function get_each_context$1(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[6] = list[i];
	return child_ctx;
}

function get_each_context_1(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[9] = list[i];
	return child_ctx;
}

// (30:2) {#each project.sections as section (section.sectionID)}
function create_each_block_1(key_1, ctx) {
	let div;
	let p;
	let t0_value = /*metadata*/ ctx[4].sections.get_or_default(/*section*/ ctx[9].sectionID, UnknownSection).name + "";
	let t0;
	let t1;
	let tasklist;
	let current;

	tasklist = new TaskList({
			props: {
				tasks: /*section*/ ctx[9].tasks,
				settings: /*settings*/ ctx[2],
				api: /*api*/ ctx[1],
				sorting: /*sorting*/ ctx[3],
				renderProject: false,
				renderNoTaskInfo: false
			}
		});

	return {
		key: key_1,
		first: null,
		c() {
			div = element("div");
			p = element("p");
			t0 = text(t0_value);
			t1 = space();
			create_component(tasklist.$$.fragment);
			attr(p, "class", "todoist-section-title");
			attr(div, "class", "todoist-section");
			this.first = div;
		},
		m(target, anchor) {
			insert(target, div, anchor);
			append(div, p);
			append(p, t0);
			append(div, t1);
			mount_component(tasklist, div, null);
			current = true;
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;
			if ((!current || dirty & /*metadata, project*/ 17) && t0_value !== (t0_value = /*metadata*/ ctx[4].sections.get_or_default(/*section*/ ctx[9].sectionID, UnknownSection).name + "")) set_data(t0, t0_value);
			const tasklist_changes = {};
			if (dirty & /*project*/ 1) tasklist_changes.tasks = /*section*/ ctx[9].tasks;
			if (dirty & /*settings*/ 4) tasklist_changes.settings = /*settings*/ ctx[2];
			if (dirty & /*api*/ 2) tasklist_changes.api = /*api*/ ctx[1];
			if (dirty & /*sorting*/ 8) tasklist_changes.sorting = /*sorting*/ ctx[3];
			tasklist.$set(tasklist_changes);
		},
		i(local) {
			if (current) return;
			transition_in(tasklist.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(tasklist.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(div);
			destroy_component(tasklist);
		}
	};
}

// (45:2) {#each project.subProjects as childProj (childProj.projectID)}
function create_each_block$1(key_1, ctx) {
	let first;
	let groupedtasklist;
	let current;

	groupedtasklist = new GroupedTaskList({
			props: {
				project: /*childProj*/ ctx[6],
				settings: /*settings*/ ctx[2],
				api: /*api*/ ctx[1],
				sorting: /*sorting*/ ctx[3]
			}
		});

	return {
		key: key_1,
		first: null,
		c() {
			first = empty();
			create_component(groupedtasklist.$$.fragment);
			this.first = first;
		},
		m(target, anchor) {
			insert(target, first, anchor);
			mount_component(groupedtasklist, target, anchor);
			current = true;
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;
			const groupedtasklist_changes = {};
			if (dirty & /*project*/ 1) groupedtasklist_changes.project = /*childProj*/ ctx[6];
			if (dirty & /*settings*/ 4) groupedtasklist_changes.settings = /*settings*/ ctx[2];
			if (dirty & /*api*/ 2) groupedtasklist_changes.api = /*api*/ ctx[1];
			if (dirty & /*sorting*/ 8) groupedtasklist_changes.sorting = /*sorting*/ ctx[3];
			groupedtasklist.$set(groupedtasklist_changes);
		},
		i(local) {
			if (current) return;
			transition_in(groupedtasklist.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(groupedtasklist.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(first);
			destroy_component(groupedtasklist, detaching);
		}
	};
}

function create_fragment$2(ctx) {
	let div;
	let p;
	let t0_value = /*metadata*/ ctx[4].projects.get_or_default(/*project*/ ctx[0].projectID, UnknownProject).name + "";
	let t0;
	let t1;
	let tasklist;
	let t2;
	let each_blocks_1 = [];
	let each0_lookup = new Map();
	let t3;
	let each_blocks = [];
	let each1_lookup = new Map();
	let current;

	tasklist = new TaskList({
			props: {
				tasks: /*project*/ ctx[0].tasks,
				settings: /*settings*/ ctx[2],
				api: /*api*/ ctx[1],
				sorting: /*sorting*/ ctx[3],
				renderProject: false,
				renderNoTaskInfo: false
			}
		});

	let each_value_1 = /*project*/ ctx[0].sections;
	const get_key = ctx => /*section*/ ctx[9].sectionID;

	for (let i = 0; i < each_value_1.length; i += 1) {
		let child_ctx = get_each_context_1(ctx, each_value_1, i);
		let key = get_key(child_ctx);
		each0_lookup.set(key, each_blocks_1[i] = create_each_block_1(key, child_ctx));
	}

	let each_value = /*project*/ ctx[0].subProjects;
	const get_key_1 = ctx => /*childProj*/ ctx[6].projectID;

	for (let i = 0; i < each_value.length; i += 1) {
		let child_ctx = get_each_context$1(ctx, each_value, i);
		let key = get_key_1(child_ctx);
		each1_lookup.set(key, each_blocks[i] = create_each_block$1(key, child_ctx));
	}

	return {
		c() {
			div = element("div");
			p = element("p");
			t0 = text(t0_value);
			t1 = space();
			create_component(tasklist.$$.fragment);
			t2 = space();

			for (let i = 0; i < each_blocks_1.length; i += 1) {
				each_blocks_1[i].c();
			}

			t3 = space();

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			attr(p, "class", "todoist-project-title");
			attr(div, "class", "todoist-project");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			append(div, p);
			append(p, t0);
			append(div, t1);
			mount_component(tasklist, div, null);
			append(div, t2);

			for (let i = 0; i < each_blocks_1.length; i += 1) {
				each_blocks_1[i].m(div, null);
			}

			append(div, t3);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(div, null);
			}

			current = true;
		},
		p(ctx, [dirty]) {
			if ((!current || dirty & /*metadata, project*/ 17) && t0_value !== (t0_value = /*metadata*/ ctx[4].projects.get_or_default(/*project*/ ctx[0].projectID, UnknownProject).name + "")) set_data(t0, t0_value);
			const tasklist_changes = {};
			if (dirty & /*project*/ 1) tasklist_changes.tasks = /*project*/ ctx[0].tasks;
			if (dirty & /*settings*/ 4) tasklist_changes.settings = /*settings*/ ctx[2];
			if (dirty & /*api*/ 2) tasklist_changes.api = /*api*/ ctx[1];
			if (dirty & /*sorting*/ 8) tasklist_changes.sorting = /*sorting*/ ctx[3];
			tasklist.$set(tasklist_changes);

			if (dirty & /*project, settings, api, sorting, metadata, UnknownSection*/ 31) {
				each_value_1 = /*project*/ ctx[0].sections;
				group_outros();
				each_blocks_1 = update_keyed_each(each_blocks_1, dirty, get_key, 1, ctx, each_value_1, each0_lookup, div, outro_and_destroy_block, create_each_block_1, t3, get_each_context_1);
				check_outros();
			}

			if (dirty & /*project, settings, api, sorting*/ 15) {
				each_value = /*project*/ ctx[0].subProjects;
				group_outros();
				each_blocks = update_keyed_each(each_blocks, dirty, get_key_1, 1, ctx, each_value, each1_lookup, div, outro_and_destroy_block, create_each_block$1, null, get_each_context$1);
				check_outros();
			}
		},
		i(local) {
			if (current) return;
			transition_in(tasklist.$$.fragment, local);

			for (let i = 0; i < each_value_1.length; i += 1) {
				transition_in(each_blocks_1[i]);
			}

			for (let i = 0; i < each_value.length; i += 1) {
				transition_in(each_blocks[i]);
			}

			current = true;
		},
		o(local) {
			transition_out(tasklist.$$.fragment, local);

			for (let i = 0; i < each_blocks_1.length; i += 1) {
				transition_out(each_blocks_1[i]);
			}

			for (let i = 0; i < each_blocks.length; i += 1) {
				transition_out(each_blocks[i]);
			}

			current = false;
		},
		d(detaching) {
			if (detaching) detach(div);
			destroy_component(tasklist);

			for (let i = 0; i < each_blocks_1.length; i += 1) {
				each_blocks_1[i].d();
			}

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].d();
			}
		}
	};
}

function instance$2($$self, $$props, $$invalidate) {
	
	
	
	let { project } = $$props;
	let { api } = $$props;
	let { settings } = $$props;
	let { sorting } = $$props;
	let metadata = null;
	const metadataUnsub = api.metadata.subscribe(value => $$invalidate(4, metadata = value));

	onDestroy(() => {
		metadataUnsub();
	});

	$$self.$$set = $$props => {
		if ("project" in $$props) $$invalidate(0, project = $$props.project);
		if ("api" in $$props) $$invalidate(1, api = $$props.api);
		if ("settings" in $$props) $$invalidate(2, settings = $$props.settings);
		if ("sorting" in $$props) $$invalidate(3, sorting = $$props.sorting);
	};

	return [project, api, settings, sorting, metadata];
}

class GroupedTaskList extends SvelteComponent {
	constructor(options) {
		super();

		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
			project: 0,
			api: 1,
			settings: 2,
			sorting: 3
		});
	}
}

/* src/ui/ErrorDisplay.svelte generated by Svelte v3.38.2 */

function create_fragment$1(ctx) {
	let div;
	let p;
	let t1;
	let code;
	let t2;

	return {
		c() {
			div = element("div");
			p = element("p");
			p.textContent = "Oh no, something went wrong!";
			t1 = space();
			code = element("code");
			t2 = text(/*error*/ ctx[0]);
			attr(div, "class", "todoist-error");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			append(div, p);
			append(div, t1);
			append(div, code);
			append(code, t2);
		},
		p(ctx, [dirty]) {
			if (dirty & /*error*/ 1) set_data(t2, /*error*/ ctx[0]);
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(div);
		}
	};
}

function instance$1($$self, $$props, $$invalidate) {
	let { error = null } = $$props;

	$$self.$$set = $$props => {
		if ("error" in $$props) $$invalidate(0, error = $$props.error);
	};

	return [error];
}

class ErrorDisplay extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$1, create_fragment$1, safe_not_equal, { error: 0 });
	}
}

/* src/ui/TodoistQuery.svelte generated by Svelte v3.38.2 */

function get_each_context(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[15] = list[i];
	return child_ctx;
}

// (117:0) {#if fetchedOnce}
function create_if_block(ctx) {
	let show_if;
	let current_block_type_index;
	let if_block;
	let if_block_anchor;
	let current;
	const if_block_creators = [create_if_block_1, create_if_block_4, create_else_block_2];
	const if_blocks = [];

	function select_block_type(ctx, dirty) {
		if (/*query*/ ctx[0].group) return 0;
		if (dirty & /*tasks*/ 8) show_if = !!/*tasks*/ ctx[3].isOk();
		if (show_if) return 1;
		return 2;
	}

	current_block_type_index = select_block_type(ctx, -1);
	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

	return {
		c() {
			if_block.c();
			if_block_anchor = empty();
		},
		m(target, anchor) {
			if_blocks[current_block_type_index].m(target, anchor);
			insert(target, if_block_anchor, anchor);
			current = true;
		},
		p(ctx, dirty) {
			let previous_block_index = current_block_type_index;
			current_block_type_index = select_block_type(ctx, dirty);

			if (current_block_type_index === previous_block_index) {
				if_blocks[current_block_type_index].p(ctx, dirty);
			} else {
				group_outros();

				transition_out(if_blocks[previous_block_index], 1, 1, () => {
					if_blocks[previous_block_index] = null;
				});

				check_outros();
				if_block = if_blocks[current_block_type_index];

				if (!if_block) {
					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
					if_block.c();
				} else {
					if_block.p(ctx, dirty);
				}

				transition_in(if_block, 1);
				if_block.m(if_block_anchor.parentNode, if_block_anchor);
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o(local) {
			transition_out(if_block);
			current = false;
		},
		d(detaching) {
			if_blocks[current_block_type_index].d(detaching);
			if (detaching) detach(if_block_anchor);
		}
	};
}

// (140:2) {:else}
function create_else_block_2(ctx) {
	let errordisplay;
	let current;

	errordisplay = new ErrorDisplay({
			props: { error: /*tasks*/ ctx[3].unwrapErr() }
		});

	return {
		c() {
			create_component(errordisplay.$$.fragment);
		},
		m(target, anchor) {
			mount_component(errordisplay, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const errordisplay_changes = {};
			if (dirty & /*tasks*/ 8) errordisplay_changes.error = /*tasks*/ ctx[3].unwrapErr();
			errordisplay.$set(errordisplay_changes);
		},
		i(local) {
			if (current) return;
			transition_in(errordisplay.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(errordisplay.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(errordisplay, detaching);
		}
	};
}

// (134:25) 
function create_if_block_4(ctx) {
	let tasklist;
	let current;

	tasklist = new TaskList({
			props: {
				tasks: /*tasks*/ ctx[3].unwrap(),
				settings: /*settings*/ ctx[2],
				api: /*api*/ ctx[1],
				sorting: /*query*/ ctx[0].sorting ?? []
			}
		});

	return {
		c() {
			create_component(tasklist.$$.fragment);
		},
		m(target, anchor) {
			mount_component(tasklist, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const tasklist_changes = {};
			if (dirty & /*tasks*/ 8) tasklist_changes.tasks = /*tasks*/ ctx[3].unwrap();
			if (dirty & /*settings*/ 4) tasklist_changes.settings = /*settings*/ ctx[2];
			if (dirty & /*api*/ 2) tasklist_changes.api = /*api*/ ctx[1];
			if (dirty & /*query*/ 1) tasklist_changes.sorting = /*query*/ ctx[0].sorting ?? [];
			tasklist.$set(tasklist_changes);
		},
		i(local) {
			if (current) return;
			transition_in(tasklist.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(tasklist.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(tasklist, detaching);
		}
	};
}

// (118:2) {#if query.group}
function create_if_block_1(ctx) {
	let show_if;
	let current_block_type_index;
	let if_block;
	let if_block_anchor;
	let current;
	const if_block_creators = [create_if_block_2, create_else_block_1];
	const if_blocks = [];

	function select_block_type_1(ctx, dirty) {
		if (dirty & /*groupedTasks*/ 16) show_if = !!/*groupedTasks*/ ctx[4].isOk();
		if (show_if) return 0;
		return 1;
	}

	current_block_type_index = select_block_type_1(ctx, -1);
	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

	return {
		c() {
			if_block.c();
			if_block_anchor = empty();
		},
		m(target, anchor) {
			if_blocks[current_block_type_index].m(target, anchor);
			insert(target, if_block_anchor, anchor);
			current = true;
		},
		p(ctx, dirty) {
			let previous_block_index = current_block_type_index;
			current_block_type_index = select_block_type_1(ctx, dirty);

			if (current_block_type_index === previous_block_index) {
				if_blocks[current_block_type_index].p(ctx, dirty);
			} else {
				group_outros();

				transition_out(if_blocks[previous_block_index], 1, 1, () => {
					if_blocks[previous_block_index] = null;
				});

				check_outros();
				if_block = if_blocks[current_block_type_index];

				if (!if_block) {
					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
					if_block.c();
				} else {
					if_block.p(ctx, dirty);
				}

				transition_in(if_block, 1);
				if_block.m(if_block_anchor.parentNode, if_block_anchor);
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o(local) {
			transition_out(if_block);
			current = false;
		},
		d(detaching) {
			if_blocks[current_block_type_index].d(detaching);
			if (detaching) detach(if_block_anchor);
		}
	};
}

// (131:4) {:else}
function create_else_block_1(ctx) {
	let errordisplay;
	let current;

	errordisplay = new ErrorDisplay({
			props: {
				error: /*groupedTasks*/ ctx[4].unwrapErr()
			}
		});

	return {
		c() {
			create_component(errordisplay.$$.fragment);
		},
		m(target, anchor) {
			mount_component(errordisplay, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const errordisplay_changes = {};
			if (dirty & /*groupedTasks*/ 16) errordisplay_changes.error = /*groupedTasks*/ ctx[4].unwrapErr();
			errordisplay.$set(errordisplay_changes);
		},
		i(local) {
			if (current) return;
			transition_in(errordisplay.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(errordisplay.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(errordisplay, detaching);
		}
	};
}

// (119:4) {#if groupedTasks.isOk()}
function create_if_block_2(ctx) {
	let show_if;
	let current_block_type_index;
	let if_block;
	let if_block_anchor;
	let current;
	const if_block_creators = [create_if_block_3, create_else_block];
	const if_blocks = [];

	function select_block_type_2(ctx, dirty) {
		if (dirty & /*groupedTasks*/ 16) show_if = !!(/*groupedTasks*/ ctx[4].unwrap().length == 0);
		if (show_if) return 0;
		return 1;
	}

	current_block_type_index = select_block_type_2(ctx, -1);
	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

	return {
		c() {
			if_block.c();
			if_block_anchor = empty();
		},
		m(target, anchor) {
			if_blocks[current_block_type_index].m(target, anchor);
			insert(target, if_block_anchor, anchor);
			current = true;
		},
		p(ctx, dirty) {
			let previous_block_index = current_block_type_index;
			current_block_type_index = select_block_type_2(ctx, dirty);

			if (current_block_type_index === previous_block_index) {
				if_blocks[current_block_type_index].p(ctx, dirty);
			} else {
				group_outros();

				transition_out(if_blocks[previous_block_index], 1, 1, () => {
					if_blocks[previous_block_index] = null;
				});

				check_outros();
				if_block = if_blocks[current_block_type_index];

				if (!if_block) {
					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
					if_block.c();
				} else {
					if_block.p(ctx, dirty);
				}

				transition_in(if_block, 1);
				if_block.m(if_block_anchor.parentNode, if_block_anchor);
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o(local) {
			transition_out(if_block);
			current = false;
		},
		d(detaching) {
			if_blocks[current_block_type_index].d(detaching);
			if (detaching) detach(if_block_anchor);
		}
	};
}

// (122:6) {:else}
function create_else_block(ctx) {
	let each_blocks = [];
	let each_1_lookup = new Map();
	let each_1_anchor;
	let current;
	let each_value = /*groupedTasks*/ ctx[4].unwrap();
	const get_key = ctx => /*project*/ ctx[15].projectID;

	for (let i = 0; i < each_value.length; i += 1) {
		let child_ctx = get_each_context(ctx, each_value, i);
		let key = get_key(child_ctx);
		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
	}

	return {
		c() {
			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			each_1_anchor = empty();
		},
		m(target, anchor) {
			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(target, anchor);
			}

			insert(target, each_1_anchor, anchor);
			current = true;
		},
		p(ctx, dirty) {
			if (dirty & /*groupedTasks, settings, api, query*/ 23) {
				each_value = /*groupedTasks*/ ctx[4].unwrap();
				group_outros();
				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, outro_and_destroy_block, create_each_block, each_1_anchor, get_each_context);
				check_outros();
			}
		},
		i(local) {
			if (current) return;

			for (let i = 0; i < each_value.length; i += 1) {
				transition_in(each_blocks[i]);
			}

			current = true;
		},
		o(local) {
			for (let i = 0; i < each_blocks.length; i += 1) {
				transition_out(each_blocks[i]);
			}

			current = false;
		},
		d(detaching) {
			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].d(detaching);
			}

			if (detaching) detach(each_1_anchor);
		}
	};
}

// (120:6) {#if groupedTasks.unwrap().length == 0}
function create_if_block_3(ctx) {
	let notaskdisplay;
	let current;
	notaskdisplay = new NoTaskDisplay({});

	return {
		c() {
			create_component(notaskdisplay.$$.fragment);
		},
		m(target, anchor) {
			mount_component(notaskdisplay, target, anchor);
			current = true;
		},
		p: noop,
		i(local) {
			if (current) return;
			transition_in(notaskdisplay.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(notaskdisplay.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(notaskdisplay, detaching);
		}
	};
}

// (123:8) {#each groupedTasks.unwrap() as project (project.projectID)}
function create_each_block(key_1, ctx) {
	let first;
	let groupedtasklist;
	let current;

	groupedtasklist = new GroupedTaskList({
			props: {
				project: /*project*/ ctx[15],
				settings: /*settings*/ ctx[2],
				api: /*api*/ ctx[1],
				sorting: /*query*/ ctx[0].sorting ?? []
			}
		});

	return {
		key: key_1,
		first: null,
		c() {
			first = empty();
			create_component(groupedtasklist.$$.fragment);
			this.first = first;
		},
		m(target, anchor) {
			insert(target, first, anchor);
			mount_component(groupedtasklist, target, anchor);
			current = true;
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;
			const groupedtasklist_changes = {};
			if (dirty & /*groupedTasks*/ 16) groupedtasklist_changes.project = /*project*/ ctx[15];
			if (dirty & /*settings*/ 4) groupedtasklist_changes.settings = /*settings*/ ctx[2];
			if (dirty & /*api*/ 2) groupedtasklist_changes.api = /*api*/ ctx[1];
			if (dirty & /*query*/ 1) groupedtasklist_changes.sorting = /*query*/ ctx[0].sorting ?? [];
			groupedtasklist.$set(groupedtasklist_changes);
		},
		i(local) {
			if (current) return;
			transition_in(groupedtasklist.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(groupedtasklist.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(first);
			destroy_component(groupedtasklist, detaching);
		}
	};
}

function create_fragment(ctx) {
	let h4;
	let t0;
	let t1;
	let button;
	let svg;
	let path;
	let svg_class_value;
	let t2;
	let br;
	let t3;
	let if_block_anchor;
	let current;
	let mounted;
	let dispose;
	let if_block = /*fetchedOnce*/ ctx[5] && create_if_block(ctx);

	return {
		c() {
			h4 = element("h4");
			t0 = text(/*title*/ ctx[7]);
			t1 = space();
			button = element("button");
			svg = svg_element("svg");
			path = svg_element("path");
			t2 = space();
			br = element("br");
			t3 = space();
			if (if_block) if_block.c();
			if_block_anchor = empty();
			attr(h4, "class", "todoist-query-title");
			attr(path, "fill-rule", "evenodd");
			attr(path, "d", "M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z");
			attr(path, "clip-rule", "evenodd");
			attr(svg, "class", svg_class_value = /*fetching*/ ctx[6] ? "todoist-refresh-spin" : "");
			attr(svg, "width", "20px");
			attr(svg, "height", "20px");
			attr(svg, "viewBox", "0 0 20 20");
			attr(svg, "fill", "currentColor");
			attr(svg, "xmlns", "http://www.w3.org/2000/svg");
			attr(button, "class", "todoist-refresh-button");
			button.disabled = /*fetching*/ ctx[6];
		},
		m(target, anchor) {
			insert(target, h4, anchor);
			append(h4, t0);
			insert(target, t1, anchor);
			insert(target, button, anchor);
			append(button, svg);
			append(svg, path);
			insert(target, t2, anchor);
			insert(target, br, anchor);
			insert(target, t3, anchor);
			if (if_block) if_block.m(target, anchor);
			insert(target, if_block_anchor, anchor);
			current = true;

			if (!mounted) {
				dispose = listen(button, "click", /*click_handler*/ ctx[12]);
				mounted = true;
			}
		},
		p(ctx, [dirty]) {
			if (!current || dirty & /*title*/ 128) set_data(t0, /*title*/ ctx[7]);

			if (!current || dirty & /*fetching*/ 64 && svg_class_value !== (svg_class_value = /*fetching*/ ctx[6] ? "todoist-refresh-spin" : "")) {
				attr(svg, "class", svg_class_value);
			}

			if (!current || dirty & /*fetching*/ 64) {
				button.disabled = /*fetching*/ ctx[6];
			}

			if (/*fetchedOnce*/ ctx[5]) {
				if (if_block) {
					if_block.p(ctx, dirty);

					if (dirty & /*fetchedOnce*/ 32) {
						transition_in(if_block, 1);
					}
				} else {
					if_block = create_if_block(ctx);
					if_block.c();
					transition_in(if_block, 1);
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			} else if (if_block) {
				group_outros();

				transition_out(if_block, 1, 1, () => {
					if_block = null;
				});

				check_outros();
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o(local) {
			transition_out(if_block);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(h4);
			if (detaching) detach(t1);
			if (detaching) detach(button);
			if (detaching) detach(t2);
			if (detaching) detach(br);
			if (detaching) detach(t3);
			if (if_block) if_block.d(detaching);
			if (detaching) detach(if_block_anchor);
			mounted = false;
			dispose();
		}
	};
}

function instance($$self, $$props, $$invalidate) {
	let taskCount;
	let title;

	var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
		function adopt(value) {
			return value instanceof P
			? value
			: new P(function (resolve) {
						resolve(value);
					});
		}

		return new (P || (P = Promise))(function (resolve, reject) {
				function fulfilled(value) {
					try {
						step(generator.next(value));
					} catch(e) {
						reject(e);
					}
				}

				function rejected(value) {
					try {
						step(generator["throw"](value));
					} catch(e) {
						reject(e);
					}
				}

				function step(result) {
					result.done
					? resolve(result.value)
					: adopt(result.value).then(fulfilled, rejected);
				}

				step((generator = generator.apply(thisArg, _arguments || [])).next());
			});
	};

	
	
	
	
	let { query } = $$props;
	let { api } = $$props;
	let { app } = $$props;
	setContext(APP_CONTEXT_KEY, app);
	let settings = null;
	let autoRefreshIntervalId = null;
	let fetchedOnce = false;

	const settingsUnsub = SettingsInstance.subscribe(value => {
		$$invalidate(2, settings = value);
	});

	let tasks = Result.Ok([]);
	let groupedTasks = Result.Ok([]);
	let fetching = false;

	onMount(() => __awaiter(void 0, void 0, void 0, function* () {
		yield fetchTodos();
	}));

	onDestroy(() => {
		settingsUnsub();

		if (autoRefreshIntervalId != null) {
			clearInterval(autoRefreshIntervalId);
		}
	});

	function fetchTodos() {
		return __awaiter(this, void 0, void 0, function* () {
			if (fetching) {
				return;
			}

			try {
				$$invalidate(6, fetching = true);

				if (query.group) {
					$$invalidate(4, groupedTasks = yield api.getTasksGroupedByProject(query.filter));
				} else {
					$$invalidate(3, tasks = yield api.getTasks(query.filter));
				}

				$$invalidate(5, fetchedOnce = true);
			} finally {
				$$invalidate(6, fetching = false);
			}
		});
	}

	const click_handler = async () => {
		await fetchTodos();
	};

	$$self.$$set = $$props => {
		if ("query" in $$props) $$invalidate(0, query = $$props.query);
		if ("api" in $$props) $$invalidate(1, api = $$props.api);
		if ("app" in $$props) $$invalidate(9, app = $$props.app);
	};

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*query, autoRefreshIntervalId, settings*/ 1029) {
			{
				if (query === null || query === void 0
				? void 0
				: query.autorefresh) {
					// First, if query.autorefresh is set.. we always use that value.
					if (autoRefreshIntervalId == null) {
						$$invalidate(10, autoRefreshIntervalId = window.setInterval(
							() => __awaiter(void 0, void 0, void 0, function* () {
								yield fetchTodos();
							}),
							query.autorefresh * 1000
						));
					}
				} else {
					// Otherwise we use the settings value.
					if (autoRefreshIntervalId != null) {
						clearInterval(autoRefreshIntervalId);
						$$invalidate(10, autoRefreshIntervalId = null);
					}

					if (settings.autoRefreshToggle) {
						$$invalidate(10, autoRefreshIntervalId = window.setInterval(
							() => __awaiter(void 0, void 0, void 0, function* () {
								yield fetchTodos();
							}),
							settings.autoRefreshInterval * 1000
						));
					}
				}
			}
		}

		if ($$self.$$.dirty & /*query, groupedTasks, tasks*/ 25) {
			$$invalidate(11, taskCount = query.group
			? groupedTasks.map(prjs => prjs.reduce((sum, prj) => sum + prj.count(), 0)).unwrapOr(0)
			: tasks.map(tasks => tasks.reduce((sum, task) => sum + task.count(), 0)).unwrapOr(0));
		}

		if ($$self.$$.dirty & /*query, taskCount*/ 2049) {
			$$invalidate(7, title = query.name.replace("{task_count}", `${taskCount}`));
		}
	};

	return [
		query,
		api,
		settings,
		tasks,
		groupedTasks,
		fetchedOnce,
		fetching,
		title,
		fetchTodos,
		app,
		autoRefreshIntervalId,
		taskCount,
		click_handler
	];
}

class TodoistQuery extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance, create_fragment, safe_not_equal, { query: 0, api: 1, app: 9 });
	}
}

class QueryInjector {
    constructor(app) {
        this.app = app;
        this.pendingQueries = [];
    }
    onNewBlock(el, ctx) {
        const node = el.querySelector('code[class*="language-todoist"]');
        if (!node) {
            return;
        }
        debug({
            msg: "Found Todoist query.",
            context: node,
        });
        const pendingQuery = {
            node: node,
            ctx: ctx,
        };
        if (typeof this.api == "undefined") {
            this.pendingQueries.push(pendingQuery);
            return;
        }
        this.injectQuery(pendingQuery);
    }
    setApi(api) {
        this.api = api;
        while (this.pendingQueries.length > 0) {
            this.injectQuery(this.pendingQueries[0]);
            this.pendingQueries.splice(0, 1);
        }
    }
    injectQuery(pendingQuery) {
        let query = null;
        try {
            query = parseQuery(JSON.parse(pendingQuery.node.innerText));
        }
        catch (e) {
            query = Result.Err(new Error(`Query was not valid JSON: ${e.message}.`));
        }
        debug({
            msg: "Parsed query",
            context: query,
        });
        const parent = pendingQuery.node.parentElement;
        const root = parent.parentElement;
        root.removeChild(parent);
        const child = new InjectedQuery(root, (root) => {
            if (query.isOk()) {
                return new TodoistQuery({
                    target: root,
                    props: {
                        query: query.unwrap(),
                        api: this.api,
                        app: this.app,
                    },
                });
            }
            else {
                return new ErrorDisplay({
                    target: root,
                    props: {
                        error: query.unwrapErr(),
                    },
                });
            }
        });
        pendingQuery.ctx.addChild(child);
    }
}
class InjectedQuery extends obsidian.MarkdownRenderChild {
    constructor(container, createComp) {
        super(container);
        this.createComp = createComp;
        this.containerEl = container;
    }
    onload() {
        this.component = this.createComp(this.containerEl);
    }
    onunload() {
        if (this.component) {
            this.component.$destroy();
        }
    }
}

class TodoistPlugin extends obsidian.Plugin {
    constructor(app, pluginManifest) {
        super(app, pluginManifest);
        this.options = null;
        this.api = null;
        SettingsInstance.subscribe((value) => {
            debug({
                msg: "Settings changed",
                context: value,
            });
            this.options = value;
        });
        this.queryInjector = new QueryInjector(app);
    }
    async onload() {
        this.registerMarkdownPostProcessor(this.queryInjector.onNewBlock.bind(this.queryInjector));
        this.addSettingTab(new SettingsTab(this.app, this));
        this.addCommand({
            id: "todoist-refresh-metadata",
            name: "Refresh Metadata",
            callback: async () => {
                if (this.api != null) {
                    debug("Refreshing metadata");
                    const result = await this.api.fetchMetadata();
                    if (result.isErr()) {
                        console.error(result.unwrapErr());
                    }
                }
            },
        });
        this.addCommand({
            id: "todoist-add-task",
            name: "Add Todoist task",
            callback: () => {
                new CreateTaskModal(this.app, this.api, window.getSelection().toString());
            },
        });
        this.addCommand({
            id: "todoist-add-task-current-page",
            name: "Add Todoist task with the current page",
            callback: () => {
                const currentSelection = window.getSelection().toString();
                new CreateTaskModal(this.app, this.api, `${currentSelection} ${getCurrentPageMdLink(this.app)}`, currentSelection.length);
            },
        });
        const tokenPath = getTokenPath();
        try {
            const token = await this.app.vault.adapter.read(tokenPath);
            this.api = new TodoistApi(token);
        }
        catch (e) {
            const tokenModal = new TodoistApiTokenModal(this.app);
            await tokenModal.waitForClose;
            const token = tokenModal.token;
            if (token.length == 0) {
                alert("Provided token was empty, please enter it in the settings and restart Obsidian.");
                return;
            }
            await this.app.vault.adapter.write(tokenPath, token);
            this.api = new TodoistApi(token);
        }
        this.queryInjector.setApi(this.api);
        const result = await this.api.fetchMetadata();
        if (result.isErr()) {
            console.error(result.unwrapErr());
        }
        await this.loadOptions();
    }
    async loadOptions() {
        const options = await this.loadData();
        SettingsInstance.update((old) => {
            return Object.assign(Object.assign({}, old), (options || {}));
        });
        await this.saveData(this.options);
    }
    async writeOptions(changeOpts) {
        SettingsInstance.update((old) => {
            changeOpts(old);
            return old;
        });
        await this.saveData(this.options);
    }
}

module.exports = TodoistPlugin;