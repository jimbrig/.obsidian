'use strict';

var obsidian = require('obsidian');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var obsidian__default = /*#__PURE__*/_interopDefaultLegacy(obsidian);

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

function __spreadArray(to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
}

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

var main = createCommonjsModule(function (module, exports) {

Object.defineProperty(exports, '__esModule', { value: true });



const DEFAULT_DAILY_NOTE_FORMAT = "YYYY-MM-DD";
const DEFAULT_WEEKLY_NOTE_FORMAT = "gggg-[W]ww";
const DEFAULT_MONTHLY_NOTE_FORMAT = "YYYY-MM";

function shouldUsePeriodicNotesSettings(periodicity) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const periodicNotes = window.app.plugins.getPlugin("periodic-notes");
    return periodicNotes && periodicNotes.settings?.[periodicity]?.enabled;
}
/**
 * Read the user settings for the `daily-notes` plugin
 * to keep behavior of creating a new note in-sync.
 */
function getDailyNoteSettings() {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { internalPlugins, plugins } = window.app;
        if (shouldUsePeriodicNotesSettings("daily")) {
            const { format, folder, template } = plugins.getPlugin("periodic-notes")?.settings?.daily || {};
            return {
                format: format || DEFAULT_DAILY_NOTE_FORMAT,
                folder: folder?.trim() || "",
                template: template?.trim() || "",
            };
        }
        const { folder, format, template } = internalPlugins.getPluginById("daily-notes")?.instance?.options || {};
        return {
            format: format || DEFAULT_DAILY_NOTE_FORMAT,
            folder: folder?.trim() || "",
            template: template?.trim() || "",
        };
    }
    catch (err) {
        console.info("No custom daily note settings found!", err);
    }
}
/**
 * Read the user settings for the `weekly-notes` plugin
 * to keep behavior of creating a new note in-sync.
 */
function getWeeklyNoteSettings() {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pluginManager = window.app.plugins;
        const calendarSettings = pluginManager.getPlugin("calendar")?.options;
        const periodicNotesSettings = pluginManager.getPlugin("periodic-notes")
            ?.settings?.weekly;
        if (shouldUsePeriodicNotesSettings("weekly")) {
            return {
                format: periodicNotesSettings.format || DEFAULT_WEEKLY_NOTE_FORMAT,
                folder: periodicNotesSettings.folder?.trim() || "",
                template: periodicNotesSettings.template?.trim() || "",
            };
        }
        const settings = calendarSettings || {};
        return {
            format: settings.weeklyNoteFormat || DEFAULT_WEEKLY_NOTE_FORMAT,
            folder: settings.weeklyNoteFolder?.trim() || "",
            template: settings.weeklyNoteTemplate?.trim() || "",
        };
    }
    catch (err) {
        console.info("No custom weekly note settings found!", err);
    }
}
/**
 * Read the user settings for the `periodic-notes` plugin
 * to keep behavior of creating a new note in-sync.
 */
function getMonthlyNoteSettings() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pluginManager = window.app.plugins;
    try {
        const settings = (shouldUsePeriodicNotesSettings("monthly") &&
            pluginManager.getPlugin("periodic-notes")?.settings?.monthly) ||
            {};
        return {
            format: settings.format || DEFAULT_MONTHLY_NOTE_FORMAT,
            folder: settings.folder?.trim() || "",
            template: settings.template?.trim() || "",
        };
    }
    catch (err) {
        console.info("No custom monthly note settings found!", err);
    }
}

// Credit: @creationix/path.js
function join(...partSegments) {
    // Split the inputs into a list of path commands.
    let parts = [];
    for (let i = 0, l = partSegments.length; i < l; i++) {
        parts = parts.concat(partSegments[i].split("/"));
    }
    // Interpret the path commands to get the new resolved path.
    const newParts = [];
    for (let i = 0, l = parts.length; i < l; i++) {
        const part = parts[i];
        // Remove leading and trailing slashes
        // Also remove "." segments
        if (!part || part === ".")
            continue;
        // Push new path segments.
        else
            newParts.push(part);
    }
    // Preserve the initial slash if there was one.
    if (parts[0] === "")
        newParts.unshift("");
    // Turn back into a single string path.
    return newParts.join("/");
}
function basename(fullPath) {
    let base = fullPath.substring(fullPath.lastIndexOf("/") + 1);
    if (base.lastIndexOf(".") != -1)
        base = base.substring(0, base.lastIndexOf("."));
    return base;
}
async function ensureFolderExists(path) {
    const dirs = path.replace(/\\/g, "/").split("/");
    dirs.pop(); // remove basename
    if (dirs.length) {
        const dir = join(...dirs);
        if (!window.app.vault.getAbstractFileByPath(dir)) {
            await window.app.vault.createFolder(dir);
        }
    }
}
async function getNotePath(directory, filename) {
    if (!filename.endsWith(".md")) {
        filename += ".md";
    }
    const path = obsidian__default['default'].normalizePath(join(directory, filename));
    await ensureFolderExists(path);
    return path;
}
async function getTemplateInfo(template) {
    const { metadataCache, vault } = window.app;
    const templatePath = obsidian__default['default'].normalizePath(template);
    if (templatePath === "/") {
        return Promise.resolve(["", null]);
    }
    try {
        const templateFile = metadataCache.getFirstLinkpathDest(templatePath, "");
        const contents = await vault.cachedRead(templateFile);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const IFoldInfo = window.app.foldManager.load(templateFile);
        return [contents, IFoldInfo];
    }
    catch (err) {
        console.error(`Failed to read the daily note template '${templatePath}'`, err);
        new obsidian__default['default'].Notice("Failed to read the daily note template");
        return ["", null];
    }
}

/**
 * dateUID is a way of weekly identifying daily/weekly/monthly notes.
 * They are prefixed with the granularity to avoid ambiguity.
 */
function getDateUID(date, granularity = "day") {
    const ts = date.clone().startOf(granularity).format();
    return `${granularity}-${ts}`;
}
function removeEscapedCharacters(format) {
    return format.replace(/\[[^\]]*\]/g, ""); // remove everything within brackets
}
/**
 * XXX: When parsing dates that contain both week numbers and months,
 * Moment choses to ignore the week numbers. For the week dateUID, we
 * want the opposite behavior. Strip the MMM from the format to patch.
 */
function isFormatAmbiguous(format, granularity) {
    if (granularity === "week") {
        const cleanFormat = removeEscapedCharacters(format);
        return (/w{1,2}/i.test(cleanFormat) &&
            (/M{1,4}/.test(cleanFormat) || /D{1,4}/.test(cleanFormat)));
    }
    return false;
}
function getDateFromFile(file, granularity) {
    return getDateFromFilename(file.basename, granularity);
}
function getDateFromPath(path, granularity) {
    return getDateFromFilename(basename(path), granularity);
}
function getDateFromFilename(filename, granularity) {
    const getSettings = {
        day: getDailyNoteSettings,
        week: getWeeklyNoteSettings,
        month: getMonthlyNoteSettings,
    };
    const format = getSettings[granularity]().format.split("/").pop();
    const noteDate = window.moment(filename, format, true);
    if (!noteDate.isValid()) {
        return null;
    }
    if (isFormatAmbiguous(format, granularity)) {
        if (granularity === "week") {
            const cleanFormat = removeEscapedCharacters(format);
            if (/w{1,2}/i.test(cleanFormat)) {
                return window.moment(filename, 
                // If format contains week, remove day & month formatting
                format.replace(/M{1,4}/g, "").replace(/D{1,4}/g, ""), false);
            }
        }
    }
    return noteDate;
}

class DailyNotesFolderMissingError extends Error {
}
/**
 * This function mimics the behavior of the daily-notes plugin
 * so it will replace {{date}}, {{title}}, and {{time}} with the
 * formatted timestamp.
 *
 * Note: it has an added bonus that it's not 'today' specific.
 */
async function createDailyNote(date) {
    const app = window.app;
    const { vault } = app;
    const moment = window.moment;
    const { template, format, folder } = getDailyNoteSettings();
    const [templateContents, IFoldInfo] = await getTemplateInfo(template);
    const filename = date.format(format);
    const normalizedPath = await getNotePath(folder, filename);
    try {
        const createdFile = await vault.create(normalizedPath, templateContents
            .replace(/{{\s*date\s*}}/gi, filename)
            .replace(/{{\s*time\s*}}/gi, moment().format("HH:mm"))
            .replace(/{{\s*title\s*}}/gi, filename)
            .replace(/{{\s*(date|time)\s*(([+-]\d+)([yqmwdhs]))?\s*(:.+?)?}}/gi, (_, _timeOrDate, calc, timeDelta, unit, momentFormat) => {
            const now = moment();
            const currentDate = date.clone().set({
                hour: now.get("hour"),
                minute: now.get("minute"),
                second: now.get("second"),
            });
            if (calc) {
                currentDate.add(parseInt(timeDelta, 10), unit);
            }
            if (momentFormat) {
                return currentDate.format(momentFormat.substring(1).trim());
            }
            return currentDate.format(format);
        })
            .replace(/{{\s*yesterday\s*}}/gi, date.clone().subtract(1, "day").format(format))
            .replace(/{{\s*tomorrow\s*}}/gi, date.clone().add(1, "d").format(format)));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        app.foldManager.save(createdFile, IFoldInfo);
        return createdFile;
    }
    catch (err) {
        console.error(`Failed to create file: '${normalizedPath}'`, err);
        new obsidian__default['default'].Notice("Unable to create new file.");
    }
}
function getDailyNote(date, dailyNotes) {
    return dailyNotes[getDateUID(date, "day")] ?? null;
}
function getAllDailyNotes() {
    /**
     * Find all daily notes in the daily note folder
     */
    const { vault } = window.app;
    const { folder } = getDailyNoteSettings();
    const dailyNotesFolder = vault.getAbstractFileByPath(obsidian__default['default'].normalizePath(folder));
    if (!dailyNotesFolder) {
        throw new DailyNotesFolderMissingError("Failed to find daily notes folder");
    }
    const dailyNotes = {};
    obsidian__default['default'].Vault.recurseChildren(dailyNotesFolder, (note) => {
        if (note instanceof obsidian__default['default'].TFile) {
            const date = getDateFromFile(note, "day");
            if (date) {
                const dateString = getDateUID(date, "day");
                dailyNotes[dateString] = note;
            }
        }
    });
    return dailyNotes;
}

class WeeklyNotesFolderMissingError extends Error {
}
function getDaysOfWeek() {
    const { moment } = window;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let weekStart = moment.localeData()._week.dow;
    const daysOfWeek = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
    ];
    while (weekStart) {
        daysOfWeek.push(daysOfWeek.shift());
        weekStart--;
    }
    return daysOfWeek;
}
function getDayOfWeekNumericalValue(dayOfWeekName) {
    return getDaysOfWeek().indexOf(dayOfWeekName.toLowerCase());
}
async function createWeeklyNote(date) {
    const { vault } = window.app;
    const { template, format, folder } = getWeeklyNoteSettings();
    const [templateContents, IFoldInfo] = await getTemplateInfo(template);
    const filename = date.format(format);
    const normalizedPath = await getNotePath(folder, filename);
    try {
        const createdFile = await vault.create(normalizedPath, templateContents
            .replace(/{{\s*(date|time)\s*(([+-]\d+)([yqmwdhs]))?\s*(:.+?)?}}/gi, (_, _timeOrDate, calc, timeDelta, unit, momentFormat) => {
            const now = window.moment();
            const currentDate = date.clone().set({
                hour: now.get("hour"),
                minute: now.get("minute"),
                second: now.get("second"),
            });
            if (calc) {
                currentDate.add(parseInt(timeDelta, 10), unit);
            }
            if (momentFormat) {
                return currentDate.format(momentFormat.substring(1).trim());
            }
            return currentDate.format(format);
        })
            .replace(/{{\s*title\s*}}/gi, filename)
            .replace(/{{\s*time\s*}}/gi, window.moment().format("HH:mm"))
            .replace(/{{\s*(sunday|monday|tuesday|wednesday|thursday|friday|saturday)\s*:(.*?)}}/gi, (_, dayOfWeek, momentFormat) => {
            const day = getDayOfWeekNumericalValue(dayOfWeek);
            return date.weekday(day).format(momentFormat.trim());
        }));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        window.app.foldManager.save(createdFile, IFoldInfo);
        return createdFile;
    }
    catch (err) {
        console.error(`Failed to create file: '${normalizedPath}'`, err);
        new obsidian__default['default'].Notice("Unable to create new file.");
    }
}
function getWeeklyNote(date, weeklyNotes) {
    return weeklyNotes[getDateUID(date, "week")] ?? null;
}
function getAllWeeklyNotes() {
    const weeklyNotes = {};
    if (!appHasWeeklyNotesPluginLoaded()) {
        return weeklyNotes;
    }
    const { vault } = window.app;
    const { folder } = getWeeklyNoteSettings();
    const weeklyNotesFolder = vault.getAbstractFileByPath(obsidian__default['default'].normalizePath(folder));
    if (!weeklyNotesFolder) {
        throw new WeeklyNotesFolderMissingError("Failed to find weekly notes folder");
    }
    obsidian__default['default'].Vault.recurseChildren(weeklyNotesFolder, (note) => {
        if (note instanceof obsidian__default['default'].TFile) {
            const date = getDateFromFile(note, "week");
            if (date) {
                const dateString = getDateUID(date, "week");
                weeklyNotes[dateString] = note;
            }
        }
    });
    return weeklyNotes;
}

class MonthlyNotesFolderMissingError extends Error {
}
/**
 * This function mimics the behavior of the daily-notes plugin
 * so it will replace {{date}}, {{title}}, and {{time}} with the
 * formatted timestamp.
 *
 * Note: it has an added bonus that it's not 'today' specific.
 */
async function createMonthlyNote(date) {
    const { vault } = window.app;
    const { template, format, folder } = getMonthlyNoteSettings();
    const [templateContents, IFoldInfo] = await getTemplateInfo(template);
    const filename = date.format(format);
    const normalizedPath = await getNotePath(folder, filename);
    try {
        const createdFile = await vault.create(normalizedPath, templateContents
            .replace(/{{\s*(date|time)\s*(([+-]\d+)([yqmwdhs]))?\s*(:.+?)?}}/gi, (_, _timeOrDate, calc, timeDelta, unit, momentFormat) => {
            const now = window.moment();
            const currentDate = date.clone().set({
                hour: now.get("hour"),
                minute: now.get("minute"),
                second: now.get("second"),
            });
            if (calc) {
                currentDate.add(parseInt(timeDelta, 10), unit);
            }
            if (momentFormat) {
                return currentDate.format(momentFormat.substring(1).trim());
            }
            return currentDate.format(format);
        })
            .replace(/{{\s*date\s*}}/gi, filename)
            .replace(/{{\s*time\s*}}/gi, window.moment().format("HH:mm"))
            .replace(/{{\s*title\s*}}/gi, filename));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        window.app.foldManager.save(createdFile, IFoldInfo);
        return createdFile;
    }
    catch (err) {
        console.error(`Failed to create file: '${normalizedPath}'`, err);
        new obsidian__default['default'].Notice("Unable to create new file.");
    }
}
function getMonthlyNote(date, monthlyNotes) {
    return monthlyNotes[getDateUID(date, "month")] ?? null;
}
function getAllMonthlyNotes() {
    const monthlyNotes = {};
    if (!appHasMonthlyNotesPluginLoaded()) {
        return monthlyNotes;
    }
    const { vault } = window.app;
    const { folder } = getMonthlyNoteSettings();
    const monthlyNotesFolder = vault.getAbstractFileByPath(obsidian__default['default'].normalizePath(folder));
    if (!monthlyNotesFolder) {
        throw new MonthlyNotesFolderMissingError("Failed to find monthly notes folder");
    }
    obsidian__default['default'].Vault.recurseChildren(monthlyNotesFolder, (note) => {
        if (note instanceof obsidian__default['default'].TFile) {
            const date = getDateFromFile(note, "month");
            if (date) {
                const dateString = getDateUID(date, "month");
                monthlyNotes[dateString] = note;
            }
        }
    });
    return monthlyNotes;
}

function appHasDailyNotesPluginLoaded() {
    const { app } = window;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dailyNotesPlugin = app.internalPlugins.plugins["daily-notes"];
    if (dailyNotesPlugin && dailyNotesPlugin.enabled) {
        return true;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const periodicNotes = app.plugins.getPlugin("periodic-notes");
    return periodicNotes && periodicNotes.settings?.daily?.enabled;
}
/**
 * XXX: "Weekly Notes" live in either the Calendar plugin or the periodic-notes plugin.
 * Check both until the weekly notes feature is removed from the Calendar plugin.
 */
function appHasWeeklyNotesPluginLoaded() {
    const { app } = window;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (app.plugins.getPlugin("calendar")) {
        return true;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const periodicNotes = app.plugins.getPlugin("periodic-notes");
    return periodicNotes && periodicNotes.settings?.weekly?.enabled;
}
function appHasMonthlyNotesPluginLoaded() {
    const { app } = window;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const periodicNotes = app.plugins.getPlugin("periodic-notes");
    return periodicNotes && periodicNotes.settings?.monthly?.enabled;
}
function getPeriodicNoteSettings(granularity) {
    const getSettings = {
        day: getDailyNoteSettings,
        week: getWeeklyNoteSettings,
        month: getMonthlyNoteSettings,
    }[granularity];
    return getSettings();
}
function createPeriodicNote(granularity, date) {
    const createFn = {
        day: createDailyNote,
        month: createMonthlyNote,
        week: createWeeklyNote,
    };
    return createFn[granularity](date);
}

exports.DEFAULT_DAILY_NOTE_FORMAT = DEFAULT_DAILY_NOTE_FORMAT;
exports.DEFAULT_MONTHLY_NOTE_FORMAT = DEFAULT_MONTHLY_NOTE_FORMAT;
exports.DEFAULT_WEEKLY_NOTE_FORMAT = DEFAULT_WEEKLY_NOTE_FORMAT;
exports.appHasDailyNotesPluginLoaded = appHasDailyNotesPluginLoaded;
exports.appHasMonthlyNotesPluginLoaded = appHasMonthlyNotesPluginLoaded;
exports.appHasWeeklyNotesPluginLoaded = appHasWeeklyNotesPluginLoaded;
exports.createDailyNote = createDailyNote;
exports.createMonthlyNote = createMonthlyNote;
exports.createPeriodicNote = createPeriodicNote;
exports.createWeeklyNote = createWeeklyNote;
exports.getAllDailyNotes = getAllDailyNotes;
exports.getAllMonthlyNotes = getAllMonthlyNotes;
exports.getAllWeeklyNotes = getAllWeeklyNotes;
exports.getDailyNote = getDailyNote;
exports.getDailyNoteSettings = getDailyNoteSettings;
exports.getDateFromFile = getDateFromFile;
exports.getDateFromPath = getDateFromPath;
exports.getDateUID = getDateUID;
exports.getMonthlyNote = getMonthlyNote;
exports.getMonthlyNoteSettings = getMonthlyNoteSettings;
exports.getPeriodicNoteSettings = getPeriodicNoteSettings;
exports.getTemplateInfo = getTemplateInfo;
exports.getWeeklyNote = getWeeklyNote;
exports.getWeeklyNoteSettings = getWeeklyNoteSettings;
});

// Unique ID creation requires a high quality random # generator. In the browser we therefore
// require the crypto API and do not support built-in fallback to lower quality random number
// generators (like Math.random()).
var getRandomValues;
var rnds8 = new Uint8Array(16);
function rng() {
  // lazy load so that environments that need to polyfill have a chance to do so
  if (!getRandomValues) {
    // getRandomValues needs to be invoked in a context where "this" is a Crypto implementation. Also,
    // find the complete implementation of crypto (msCrypto) on IE11.
    getRandomValues = typeof crypto !== 'undefined' && crypto.getRandomValues && crypto.getRandomValues.bind(crypto) || typeof msCrypto !== 'undefined' && typeof msCrypto.getRandomValues === 'function' && msCrypto.getRandomValues.bind(msCrypto);

    if (!getRandomValues) {
      throw new Error('crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported');
    }
  }

  return getRandomValues(rnds8);
}

var REGEX = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;

function validate(uuid) {
  return typeof uuid === 'string' && REGEX.test(uuid);
}

/**
 * Convert array of 16 byte values to UUID string format of the form:
 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
 */

var byteToHex = [];

for (var i = 0; i < 256; ++i) {
  byteToHex.push((i + 0x100).toString(16).substr(1));
}

function stringify(arr) {
  var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  // Note: Be careful editing this code!  It's been tuned for performance
  // and works in ways you may not expect. See https://github.com/uuidjs/uuid/pull/434
  var uuid = (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + '-' + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + '-' + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + '-' + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + '-' + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase(); // Consistency check for valid UUID.  If this throws, it's likely due to one
  // of the following:
  // - One or more input array values don't map to a hex octet (leading to
  // "undefined" in the uuid)
  // - Invalid input values for the RFC `version` or `variant` fields

  if (!validate(uuid)) {
    throw TypeError('Stringified UUID is invalid');
  }

  return uuid;
}

function v4(options, buf, offset) {
  options = options || {};
  var rnds = options.random || (options.rng || rng)(); // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`

  rnds[6] = rnds[6] & 0x0f | 0x40;
  rnds[8] = rnds[8] & 0x3f | 0x80; // Copy bytes to buffer, if provided

  if (buf) {
    offset = offset || 0;

    for (var i = 0; i < 16; ++i) {
      buf[offset + i] = rnds[i];
    }

    return buf;
  }

  return stringify(rnds);
}

var DEFAULT_SETTINGS = {
    openFileOnWrite: true,
    openDailyInNewPane: false,
    openFileOnWriteInNewPane: false,
    openFileWithoutWriteInNewPane: false,
    idField: "id",
    useUID: false,
};
var AdvancedURI = /** @class */ (function (_super) {
    __extends(AdvancedURI, _super);
    function AdvancedURI() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AdvancedURI.prototype.onload = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.loadSettings()];
                    case 1:
                        _a.sent();
                        this.addSettingTab(new SettingsTab(this.app, this));
                        this.addCommand({
                            id: "copy-uri-current-file",
                            name: "copy URI for file",
                            callback: function () { return _this.handleCopyFileURI(); }
                        });
                        this.addCommand({
                            id: "copy-uri-daily",
                            name: "copy URI for daily note",
                            callback: function () { return new EnterDataModal(_this).open(); }
                        });
                        this.addCommand({
                            id: "copy-uri-search-and-replace",
                            name: "copy URI for search and replace",
                            callback: function () {
                                var fileModal = new FileModal(_this, "Used file for search and replace");
                                fileModal.open();
                                fileModal.onChooseItem = function (filePath) {
                                    var searchModal = new SearchModal(_this);
                                    searchModal.open();
                                    searchModal.onChooseSuggestion = function (item) {
                                        new ReplaceModal(_this, item, filePath === null || filePath === void 0 ? void 0 : filePath.source).open();
                                    };
                                };
                            },
                        });
                        this.addCommand({
                            id: "copy-uri-command",
                            name: "copy URI for command",
                            callback: function () {
                                var fileModal = new FileModal(_this, "Select a file to be opened before executing the command");
                                fileModal.open();
                                fileModal.onChooseItem = function (item) {
                                    new CommandModal(_this, item === null || item === void 0 ? void 0 : item.source).open();
                                };
                            }
                        });
                        this.registerObsidianProtocolHandler("advanced-uri", function (e) { return __awaiter(_this, void 0, void 0, function () {
                            var parameters, parameter, index, extension;
                            var _a;
                            return __generator(this, function (_b) {
                                parameters = e;
                                for (parameter in parameters) {
                                    parameters[parameter] = decodeURIComponent(parameters[parameter]);
                                }
                                if (parameters.uid) {
                                    parameters.filepath = (_a = this.getFileFromUID(parameters.uid)) === null || _a === void 0 ? void 0 : _a.path;
                                    console.log(parameters.filepath);
                                }
                                else if (parameters.filepath) {
                                    parameters.filepath = obsidian.normalizePath(parameters.filepath);
                                    index = parameters.filepath.lastIndexOf(".");
                                    extension = parameters.filepath.substring(index < 0 ? parameters.filepath.length : index);
                                    if (extension === "") {
                                        parameters.filepath = parameters.filepath + ".md";
                                    }
                                }
                                if (parameters.workspace) {
                                    this.handleWorkspace(parameters.workspace);
                                }
                                else if (parameters.commandname || parameters.commandid) {
                                    this.handleCommand(parameters);
                                }
                                else if (parameters.filepath && parameters.data) {
                                    this.handleWrite(parameters);
                                }
                                else if (parameters.daily === "true") {
                                    this.handleDailyNote(parameters);
                                }
                                else if (parameters.filepath && parameters.heading) {
                                    this.app.workspace.openLinkText(parameters.filepath + "#" + parameters.heading, "");
                                }
                                else if (parameters.filepath && parameters.block) {
                                    this.app.workspace.openLinkText(parameters.filepath + "#^" + parameters.block, "");
                                }
                                else if ((parameters.search || parameters.searchregex) && parameters.replace) {
                                    this.handleSearchAndReplace(parameters);
                                }
                                else if (parameters.filepath) {
                                    this.handleOpen(parameters);
                                }
                                return [2 /*return*/];
                            });
                        }); });
                        this.registerEvent(this.app.workspace.on('file-menu', function (menu, _, source) {
                            if (source !== "pane-more-options") {
                                return;
                            }
                            var view = _this.app.workspace.getActiveViewOfType(obsidian.MarkdownView);
                            if (!view) {
                                return;
                            }
                            menu.addItem(function (item) {
                                item.setTitle("Copy Advanced URI").setIcon('link')
                                    .onClick(function (_) { return _this.handleCopyFileURI(); });
                            });
                        }));
                        return [2 /*return*/];
                }
            });
        });
    };
    AdvancedURI.prototype.getFileFromUID = function (uid) {
        var _this = this;
        var files = this.app.vault.getFiles();
        var idKey = this.settings.idField;
        return files.find(function (file) { var _a; return obsidian.parseFrontMatterEntry((_a = _this.app.metadataCache.getFileCache(file)) === null || _a === void 0 ? void 0 : _a.frontmatter, idKey) == uid; });
    };
    AdvancedURI.prototype.handleWorkspace = function (workspace) {
        var _a, _b, _c;
        var workspaces = (_c = (_b = (_a = this.app) === null || _a === void 0 ? void 0 : _a.internalPlugins) === null || _b === void 0 ? void 0 : _b.plugins) === null || _c === void 0 ? void 0 : _c.workspaces;
        if (!workspaces) {
            new obsidian.Notice("Cannot find Workspaces plugin. Please file an issue.");
        }
        else if (workspaces.enabled) {
            workspaces.instance.loadWorkspace(workspace);
        }
        else {
            new obsidian.Notice("Workspaces plugin is not enabled");
        }
    };
    AdvancedURI.prototype.handleCommand = function (parameters) {
        return __awaiter(this, void 0, void 0, function () {
            var view, editor, data, lines, rawCommands, command;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!parameters.filepath) return [3 /*break*/, 4];
                        if (!parameters.mode) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.app.workspace.openLinkText(parameters.filepath, "/", undefined, {
                                state: { mode: "source" }
                            })];
                    case 1:
                        _a.sent();
                        view = this.app.workspace.getActiveViewOfType(obsidian.MarkdownView);
                        if (view) {
                            editor = view.editor;
                            data = editor.getValue();
                            if (parameters.mode === "append") {
                                editor.setValue(data + "\n");
                                lines = editor.lineCount();
                                editor.setCursor({ ch: 0, line: lines });
                            }
                            else if (parameters.mode === "prepend") {
                                editor.setValue("\n" + data);
                                editor.setCursor({ ch: 0, line: 0 });
                            }
                            else if (parameters.mode === "overwrite") {
                                editor.setValue("");
                            }
                        }
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, this.app.workspace.openLinkText(parameters.filepath, "/")];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        if (parameters.commandid) {
                            this.app.commands.executeCommandById(parameters.commandid);
                        }
                        else if (parameters.commandname) {
                            rawCommands = this.app.commands.commands;
                            for (command in rawCommands) {
                                if (rawCommands[command].name === parameters.commandname) {
                                    if (rawCommands[command].callback) {
                                        rawCommands[command].callback();
                                    }
                                    else {
                                        rawCommands[command].checkCallback();
                                    }
                                    return [2 /*return*/];
                                }
                            }
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    AdvancedURI.prototype.handleSearchAndReplace = function (parameters) {
        return __awaiter(this, void 0, void 0, function () {
            var file, abstractFile, data, _a, pattern, flags, regex;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        console.log(parameters.filepath);
                        if (parameters.filepath) {
                            abstractFile = this.app.vault.getAbstractFileByPath(parameters.filepath);
                            if (abstractFile instanceof obsidian.TFile) {
                                file = abstractFile;
                            }
                        }
                        else {
                            file = this.app.workspace.getActiveFile();
                        }
                        if (!file) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.app.vault.read(file)];
                    case 1:
                        data = _b.sent();
                        if (parameters.searchregex) {
                            try {
                                _a = parameters.searchregex.match(/(\/?)(.+)\1([a-z]*)/i), pattern = _a[2], flags = _a[3];
                                regex = new RegExp(pattern, flags);
                                data = data.replace(regex, parameters.replace);
                            }
                            catch (error) {
                                new obsidian.Notice("Can't parse " + parameters.searchregex + " as RegEx");
                            }
                        }
                        else {
                            data = data.replaceAll(parameters.search, parameters.replace);
                        }
                        return [4 /*yield*/, this.writeAndOpenFile(file.path, data)];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        new obsidian.Notice("Cannot find file");
                        _b.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    AdvancedURI.prototype.handleWrite = function (parameters) {
        return __awaiter(this, void 0, void 0, function () {
            var path, file;
            return __generator(this, function (_a) {
                path = parameters.filepath;
                file = this.app.vault.getAbstractFileByPath(path);
                if (parameters.mode === "overwrite") {
                    this.writeAndOpenFile(path, parameters.data);
                }
                else if (parameters.mode === "prepend") {
                    if (file instanceof obsidian.TFile) {
                        this.prepend(file, parameters);
                    }
                    else {
                        this.prepend(path, parameters);
                    }
                }
                else if (parameters.mode === "append") {
                    if (file instanceof obsidian.TFile) {
                        this.append(file, parameters);
                    }
                    else {
                        this.append(path, parameters);
                    }
                }
                else if (file instanceof obsidian.TFile) {
                    new obsidian.Notice("File already exists");
                }
                else {
                    this.writeAndOpenFile(path, parameters.data);
                }
                return [2 /*return*/];
            });
        });
    };
    AdvancedURI.prototype.handleOpen = function (parameters) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.app.workspace.openLinkText(parameters.filepath, "", this.settings.openFileWithoutWriteInNewPane)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.setCursor(parameters.mode)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    AdvancedURI.prototype.handleDailyNote = function (parameters) {
        return __awaiter(this, void 0, void 0, function () {
            var moment, allDailyNotes, dailyNote;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!main.appHasDailyNotesPluginLoaded()) {
                            new obsidian.Notice("Daily notes plugin is not loaded");
                            return [2 /*return*/];
                        }
                        moment = window.moment(Date.now());
                        allDailyNotes = main.getAllDailyNotes();
                        dailyNote = main.getDailyNote(moment, allDailyNotes);
                        if (!(parameters.data && parameters.mode === "overwrite")) return [3 /*break*/, 1];
                        this.writeAndOpenFile(dailyNote.path, parameters.data);
                        return [3 /*break*/, 15];
                    case 1:
                        if (!(parameters.data && parameters.mode === "prepend")) return [3 /*break*/, 4];
                        if (!!dailyNote) return [3 /*break*/, 3];
                        return [4 /*yield*/, main.createDailyNote(moment)];
                    case 2:
                        dailyNote = _a.sent();
                        _a.label = 3;
                    case 3:
                        this.prepend(dailyNote, parameters);
                        return [3 /*break*/, 15];
                    case 4:
                        if (!(parameters.data && parameters.mode === "append")) return [3 /*break*/, 7];
                        if (!!dailyNote) return [3 /*break*/, 6];
                        return [4 /*yield*/, main.createDailyNote(moment)];
                    case 5:
                        dailyNote = _a.sent();
                        _a.label = 6;
                    case 6:
                        this.append(dailyNote, parameters);
                        return [3 /*break*/, 15];
                    case 7:
                        if (!(parameters.data && dailyNote)) return [3 /*break*/, 8];
                        new obsidian.Notice("File already exists");
                        return [3 /*break*/, 15];
                    case 8:
                        if (!parameters.data) return [3 /*break*/, 10];
                        return [4 /*yield*/, main.createDailyNote(moment)];
                    case 9:
                        dailyNote = _a.sent();
                        this.writeAndOpenFile(dailyNote.path, parameters.data);
                        return [3 /*break*/, 15];
                    case 10:
                        if (!!dailyNote) return [3 /*break*/, 12];
                        return [4 /*yield*/, main.createDailyNote(moment)];
                    case 11:
                        dailyNote = _a.sent();
                        _a.label = 12;
                    case 12: return [4 /*yield*/, this.app.workspace.openLinkText(dailyNote.path, "", this.settings.openDailyInNewPane)];
                    case 13:
                        _a.sent();
                        if (!parameters.mode) return [3 /*break*/, 15];
                        return [4 /*yield*/, this.setCursor(parameters.mode)];
                    case 14:
                        _a.sent();
                        _a.label = 15;
                    case 15: return [2 /*return*/];
                }
            });
        });
    };
    AdvancedURI.prototype.append = function (file, parameters) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var path, dataToWrite, line, data, lines, fileData;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!parameters.heading) return [3 /*break*/, 3];
                        if (!(file instanceof obsidian.TFile)) return [3 /*break*/, 2];
                        path = file.path;
                        line = (_a = this.getEndAndBeginningOfHeading(file, parameters.heading)) === null || _a === void 0 ? void 0 : _a.lastLine;
                        if (line === undefined)
                            return [2 /*return*/];
                        return [4 /*yield*/, this.app.vault.read(file)];
                    case 1:
                        data = _b.sent();
                        lines = data.split("\n");
                        lines.splice.apply(lines, __spreadArray([line, 0], parameters.data.split("\n")));
                        dataToWrite = lines.join("\n");
                        _b.label = 2;
                    case 2: return [3 /*break*/, 7];
                    case 3:
                        fileData = void 0;
                        if (!(file instanceof obsidian.TFile)) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.app.vault.read(file)];
                    case 4:
                        fileData = _b.sent();
                        path = file.path;
                        return [3 /*break*/, 6];
                    case 5:
                        path = file;
                        fileData = "";
                        _b.label = 6;
                    case 6:
                        dataToWrite = fileData + "\n" + parameters.data;
                        _b.label = 7;
                    case 7:
                        this.writeAndOpenFile(path, dataToWrite);
                        return [2 /*return*/];
                }
            });
        });
    };
    AdvancedURI.prototype.prepend = function (file, parameters) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var path, dataToWrite, line, data, lines, fileData;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!parameters.heading) return [3 /*break*/, 3];
                        if (!(file instanceof obsidian.TFile)) return [3 /*break*/, 2];
                        path = file.path;
                        line = (_a = this.getEndAndBeginningOfHeading(file, parameters.heading)) === null || _a === void 0 ? void 0 : _a.firstLine;
                        if (line === undefined)
                            return [2 /*return*/];
                        return [4 /*yield*/, this.app.vault.read(file)];
                    case 1:
                        data = _b.sent();
                        lines = data.split("\n");
                        lines.splice.apply(lines, __spreadArray([line, 0], parameters.data.split("\n")));
                        dataToWrite = lines.join("\n");
                        _b.label = 2;
                    case 2: return [3 /*break*/, 7];
                    case 3:
                        fileData = void 0;
                        if (!(file instanceof obsidian.TFile)) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.app.vault.read(file)];
                    case 4:
                        fileData = _b.sent();
                        path = file.path;
                        return [3 /*break*/, 6];
                    case 5:
                        path = file;
                        fileData = "";
                        _b.label = 6;
                    case 6:
                        dataToWrite = parameters.data + "\n" + fileData;
                        _b.label = 7;
                    case 7:
                        this.writeAndOpenFile(path, dataToWrite);
                        return [2 /*return*/];
                }
            });
        });
    };
    AdvancedURI.prototype.writeAndOpenFile = function (outputFileName, text) {
        return __awaiter(this, void 0, void 0, function () {
            var fileIsAlreadyOpened_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.app.vault.adapter.write(outputFileName, text)];
                    case 1:
                        _a.sent();
                        if (this.settings.openFileOnWrite) {
                            fileIsAlreadyOpened_1 = false;
                            this.app.workspace.iterateAllLeaves(function (leaf) {
                                var _a;
                                if (((_a = leaf.view.file) === null || _a === void 0 ? void 0 : _a.path) === outputFileName) {
                                    fileIsAlreadyOpened_1 = true;
                                }
                            });
                            if (!fileIsAlreadyOpened_1)
                                this.app.workspace.openLinkText(outputFileName, "", this.settings.openFileOnWriteInNewPane);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    AdvancedURI.prototype.getEndAndBeginningOfHeading = function (file, heading) {
        var _a, _b;
        var cache = this.app.metadataCache.getFileCache(file);
        var sections = cache.sections;
        var foundHeading = (_a = cache.headings) === null || _a === void 0 ? void 0 : _a.find(function (e) { return e.heading === heading; });
        if (foundHeading) {
            var foundSectionIndex = sections.findIndex(function (section) { return section.type === "heading" && section.position.start.line === foundHeading.position.start.line; });
            var restSections = sections.slice(foundSectionIndex + 1);
            var nextHeadingIndex = restSections === null || restSections === void 0 ? void 0 : restSections.findIndex(function (e) { return e.type === "heading"; });
            var lastSection = (_b = restSections[(nextHeadingIndex !== -1 ? nextHeadingIndex : restSections.length) - 1]) !== null && _b !== void 0 ? _b : sections[foundSectionIndex];
            var lastLine = lastSection.position.end.line + 1;
            return { "lastLine": lastLine, "firstLine": sections[foundSectionIndex].position.end.line + 1 };
        }
        else {
            new obsidian.Notice("Can't find heading");
        }
    };
    AdvancedURI.prototype.setCursor = function (mode) {
        return __awaiter(this, void 0, void 0, function () {
            var view, editor, viewState, lastLine, lastLineLength;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        view = this.app.workspace.getActiveViewOfType(obsidian.MarkdownView);
                        if (!view) return [3 /*break*/, 4];
                        editor = view.editor;
                        viewState = view.leaf.getViewState();
                        viewState.state.mode = "source";
                        if (!(mode === "append")) return [3 /*break*/, 2];
                        lastLine = editor.lastLine();
                        lastLineLength = editor.getLine(lastLine).length;
                        return [4 /*yield*/, view.leaf.setViewState(viewState, { focus: true })];
                    case 1:
                        _a.sent();
                        editor.setCursor({ ch: lastLineLength, line: lastLine });
                        return [3 /*break*/, 4];
                    case 2:
                        if (!(mode === "prepend")) return [3 /*break*/, 4];
                        return [4 /*yield*/, view.leaf.setViewState(viewState, { focus: true })];
                    case 3:
                        _a.sent();
                        editor.setCursor({ ch: 0, line: 0 });
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    AdvancedURI.prototype.handleCopyFileURI = function () {
        var _this = this;
        var view = this.app.workspace.getActiveViewOfType(obsidian.MarkdownView);
        if (!view)
            return;
        var pos = view.editor.getCursor();
        var cache = this.app.metadataCache.getFileCache(view.file);
        if (cache.headings) {
            for (var _i = 0, _a = cache.headings; _i < _a.length; _i++) {
                var heading = _a[_i];
                if (heading.position.start.line <= pos.line && heading.position.end.line >= pos.line) {
                    this.copyURI({
                        filepath: view.file.path,
                        heading: heading.heading
                    });
                    return;
                }
            }
        }
        if (cache.blocks) {
            for (var _b = 0, _c = Object.keys(cache.blocks); _b < _c.length; _b++) {
                var blockID = _c[_b];
                var block = cache.blocks[blockID];
                if (block.position.start.line <= pos.line && block.position.end.line >= pos.line) {
                    this.copyURI({
                        filepath: view.file.path,
                        block: blockID
                    });
                    return;
                }
            }
        }
        var fileModal = new FileModal(this, "Choose a file", false);
        fileModal.open();
        fileModal.onChooseItem = function (item, _) {
            new EnterDataModal(_this, item.source).open();
        };
    };
    AdvancedURI.prototype.copyURI = function (parameters) {
        return __awaiter(this, void 0, void 0, function () {
            var uri, file, _a, parameter, t;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        uri = "obsidian://advanced-uri?vault=" + this.app.vault.getName();
                        file = this.app.vault.getAbstractFileByPath(parameters.filepath);
                        if (!(this.settings.useUID && file instanceof obsidian.TFile)) return [3 /*break*/, 2];
                        parameters.filepath = undefined;
                        _a = parameters;
                        return [4 /*yield*/, this.getURIFromFile(file)];
                    case 1:
                        _a.uid = _b.sent();
                        _b.label = 2;
                    case 2:
                        for (parameter in parameters) {
                            if (parameters[parameter]) {
                                uri = uri + ("&" + parameter + "=" + encodeURIComponent(parameters[parameter]));
                            }
                        }
                        if (navigator.clipboard && navigator.permissions)
                            navigator.clipboard.writeText(encodeURI(uri));
                        else {
                            t = document.createElement("textarea");
                            t.value = encodeURI(uri),
                                t.style.top = "0",
                                t.style.left = "0",
                                t.style.position = "fixed",
                                document.body.appendChild(t);
                            try {
                                t.focus(),
                                    t.select(),
                                    document.execCommand("copy");
                            }
                            catch (e) { }
                            document.body.removeChild(t);
                        }
                        new obsidian.Notice("Advanced URI copied to your clipboard");
                        return [2 /*return*/];
                }
            });
        });
    };
    AdvancedURI.prototype.getURIFromFile = function (file) {
        return __awaiter(this, void 0, void 0, function () {
            var fileContent, frontmatter, uid, isYamlEmpty, splitContent, newFileContent;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.app.vault.read(file)];
                    case 1:
                        fileContent = _a.sent();
                        frontmatter = this.app.metadataCache.getFileCache(file).frontmatter;
                        uid = obsidian.parseFrontMatterEntry(frontmatter, this.settings.idField);
                        console.log(uid);
                        if (uid)
                            return [2 /*return*/, uid];
                        isYamlEmpty = ((!frontmatter || frontmatter.length === 0) && !fileContent.match(/^-{3}\s*\n*\r*-{3}/));
                        uid = v4();
                        splitContent = fileContent.split("\n");
                        if (isYamlEmpty) {
                            splitContent.unshift("---");
                            splitContent.unshift(this.settings.idField + ": " + uid);
                            splitContent.unshift("---");
                        }
                        else {
                            splitContent.splice(1, 0, this.settings.idField + ": " + uid);
                        }
                        newFileContent = splitContent.join("\n");
                        return [4 /*yield*/, this.app.vault.modify(file, newFileContent)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, uid];
                }
            });
        });
    };
    AdvancedURI.prototype.loadSettings = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _a = this;
                        _c = (_b = Object).assign;
                        _d = [DEFAULT_SETTINGS];
                        return [4 /*yield*/, this.loadData()];
                    case 1:
                        _a.settings = _c.apply(_b, _d.concat([_e.sent()]));
                        return [2 /*return*/];
                }
            });
        });
    };
    AdvancedURI.prototype.saveSettings = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.saveData(this.settings)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return AdvancedURI;
}(obsidian.Plugin));
var SettingsTab = /** @class */ (function (_super) {
    __extends(SettingsTab, _super);
    function SettingsTab(app, plugin) {
        var _this = _super.call(this, app, plugin) || this;
        _this.plugin = plugin;
        return _this;
    }
    SettingsTab.prototype.display = function () {
        var _this = this;
        var containerEl = this.containerEl;
        containerEl.empty();
        containerEl.createEl("h2", { text: this.plugin.manifest.name });
        new obsidian.Setting(containerEl)
            .setName("Open file on write")
            .addToggle(function (cb) { return cb.onChange(function (value) {
            _this.plugin.settings.openFileOnWrite = value;
            _this.plugin.saveSettings();
        }).setValue(_this.plugin.settings.openFileOnWrite); });
        new obsidian.Setting(containerEl)
            .setName("Open file on write in a new pane")
            .setDisabled(this.plugin.settings.openFileOnWrite)
            .addToggle(function (cb) { return cb.onChange(function (value) {
            _this.plugin.settings.openFileOnWriteInNewPane = value;
            _this.plugin.saveSettings();
        }).setValue(_this.plugin.settings.openFileOnWriteInNewPane); });
        new obsidian.Setting(containerEl)
            .setName("Open daily note in a new pane")
            .addToggle(function (cb) { return cb.onChange(function (value) {
            _this.plugin.settings.openDailyInNewPane = value;
            _this.plugin.saveSettings();
        }).setValue(_this.plugin.settings.openDailyInNewPane); });
        new obsidian.Setting(containerEl)
            .setName("Open file without write in new pane")
            .addToggle(function (cb) { return cb.onChange(function (value) {
            _this.plugin.settings.openFileWithoutWriteInNewPane = value;
            _this.plugin.saveSettings();
        }).setValue(_this.plugin.settings.openFileWithoutWriteInNewPane); });
        new obsidian.Setting(containerEl)
            .setName("Use UID instead of file paths")
            .addToggle(function (cb) { return cb.onChange(function (value) {
            _this.plugin.settings.useUID = value;
            _this.plugin.saveSettings();
        }).setValue(_this.plugin.settings.useUID); });
        new obsidian.Setting(containerEl)
            .setName("UID field in frontmatter")
            .addText(function (cb) { return cb.onChange(function (value) {
            _this.plugin.settings.idField = value;
            _this.plugin.saveSettings();
        }).setValue(_this.plugin.settings.idField); });
    };
    return SettingsTab;
}(obsidian.PluginSettingTab));
var EnterDataModal = /** @class */ (function (_super) {
    __extends(EnterDataModal, _super);
    function EnterDataModal(plugin, file) {
        var _this = _super.call(this, plugin.app) || this;
        //null if for normal write mode, its not associated with a special mode like "append" or "prepend"
        _this.modes = [null, "overwrite", "append", "prepend"];
        _this.plugin = plugin;
        _this.setPlaceholder("Type your data to be written to the file or leave it empty to just open it");
        _this.file = file;
        return _this;
    }
    EnterDataModal.prototype.getSuggestions = function (query) {
        var _this = this;
        if (query == "")
            query = null;
        var suggestions = [];
        var _loop_1 = function (mode) {
            if (!(mode === "overwrite" && !query)) {
                var display = void 0;
                if (query) {
                    if (mode) {
                        display = "Write \"" + query + "\" in " + mode + " mode";
                    }
                    else {
                        display = "Write \"" + query + "\"";
                    }
                }
                else {
                    if (mode) {
                        display = "Open in " + mode + " mode";
                    }
                    else {
                        display = "Open";
                    }
                }
                suggestions.push({
                    data: query,
                    display: display,
                    mode: mode,
                    func: function () {
                        if (_this.file) {
                            _this.plugin.copyURI({
                                filepath: _this.file,
                                data: query,
                                mode: mode
                            });
                        }
                        else {
                            _this.plugin.copyURI({
                                daily: "true",
                                data: query,
                                mode: mode
                            });
                        }
                    }
                });
            }
        };
        for (var _i = 0, _a = this.modes; _i < _a.length; _i++) {
            var mode = _a[_i];
            _loop_1(mode);
        }
        return suggestions;
    };
    EnterDataModal.prototype.renderSuggestion = function (value, el) {
        el.innerText = value.display;
    };
    EnterDataModal.prototype.onChooseSuggestion = function (item, _) {
        item.func();
    };
    return EnterDataModal;
}(obsidian.SuggestModal));
var FileModal = /** @class */ (function (_super) {
    __extends(FileModal, _super);
    function FileModal(plugin, placeHolder, allowNoFile) {
        if (allowNoFile === void 0) { allowNoFile = true; }
        var _this = _super.call(this, plugin.app) || this;
        _this.placeHolder = placeHolder;
        _this.allowNoFile = allowNoFile;
        _this.plugin = plugin;
        _this.setPlaceholder(_this.placeHolder);
        return _this;
    }
    FileModal.prototype.getItems = function () {
        var specialItems = [];
        if (this.allowNoFile) {
            specialItems.push({ display: "<Don't specify a file>", source: undefined });
        }
        var file = this.app.workspace.getActiveFile();
        if (file) {
            specialItems.push({ display: "<Current file>", source: file.path });
        }
        return __spreadArray(__spreadArray([], specialItems), this.app.vault.getFiles().map(function (e) { return { display: e.path, source: e.path }; }));
    };
    FileModal.prototype.getItemText = function (item) {
        return item.display;
    };
    FileModal.prototype.onChooseItem = function (item, evt) {
    };
    return FileModal;
}(obsidian.FuzzySuggestModal));
var CommandModal = /** @class */ (function (_super) {
    __extends(CommandModal, _super);
    function CommandModal(plugin, file) {
        var _this = _super.call(this, plugin.app) || this;
        _this.plugin = plugin;
        _this.file = file;
        return _this;
    }
    CommandModal.prototype.getItems = function () {
        var rawCommands = this.app.commands.commands;
        var commands = Object.keys(rawCommands).map(function (e) {
            return { id: rawCommands[e].id, name: rawCommands[e].name };
        });
        return commands;
    };
    CommandModal.prototype.getItemText = function (item) {
        return item.name;
    };
    CommandModal.prototype.onChooseItem = function (item, _) {
        this.plugin.copyURI({
            filepath: this.file,
            commandid: item.id
        });
    };
    return CommandModal;
}(obsidian.FuzzySuggestModal));
var SearchModal = /** @class */ (function (_super) {
    __extends(SearchModal, _super);
    function SearchModal(plugin) {
        var _this = _super.call(this, plugin.app) || this;
        _this.plugin = plugin;
        _this.setPlaceholder("Searched text. RegEx is supported");
        return _this;
    }
    SearchModal.prototype.getSuggestions = function (query) {
        if (query === "") {
            query = "...";
        }
        var regex;
        try {
            regex = new RegExp(query);
        }
        catch (error) { }
        return [
            {
                source: query,
                isRegEx: false,
                display: query
            },
            {
                source: query,
                display: regex ? "As RegEx: " + query : "Can't parse RegEx",
                isRegEx: true
            }
        ];
    };
    SearchModal.prototype.renderSuggestion = function (value, el) {
        el.innerText = value.display;
    };
    SearchModal.prototype.onChooseSuggestion = function (item, _) {
    };
    return SearchModal;
}(obsidian.SuggestModal));
var ReplaceModal = /** @class */ (function (_super) {
    __extends(ReplaceModal, _super);
    function ReplaceModal(plugin, search, filepath) {
        var _this = _super.call(this, plugin.app) || this;
        _this.search = search;
        _this.filepath = filepath;
        _this.plugin = plugin;
        _this.setPlaceholder("Replacement text");
        return _this;
    }
    ReplaceModal.prototype.getSuggestions = function (query) {
        if (query === "") {
            query = "...";
        }
        return [query];
    };
    ReplaceModal.prototype.renderSuggestion = function (value, el) {
        el.innerText = value;
    };
    ReplaceModal.prototype.onChooseSuggestion = function (item, _) {
        if (this.search.isRegEx) {
            this.plugin.copyURI({
                filepath: this.filepath,
                searchregex: this.search.source,
                replace: item
            });
        }
        else {
            this.plugin.copyURI({
                filepath: this.filepath,
                search: this.search.source,
                replace: item
            });
        }
    };
    return ReplaceModal;
}(obsidian.SuggestModal));

module.exports = AdvancedURI;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXMiOlsibm9kZV9tb2R1bGVzL3RzbGliL3RzbGliLmVzNi5qcyIsIm5vZGVfbW9kdWxlcy9vYnNpZGlhbi1kYWlseS1ub3Rlcy1pbnRlcmZhY2UvZGlzdC9tYWluLmpzIiwibm9kZV9tb2R1bGVzL3V1aWQvZGlzdC9lc20tYnJvd3Nlci9ybmcuanMiLCJub2RlX21vZHVsZXMvdXVpZC9kaXN0L2VzbS1icm93c2VyL3JlZ2V4LmpzIiwibm9kZV9tb2R1bGVzL3V1aWQvZGlzdC9lc20tYnJvd3Nlci92YWxpZGF0ZS5qcyIsIm5vZGVfbW9kdWxlcy91dWlkL2Rpc3QvZXNtLWJyb3dzZXIvc3RyaW5naWZ5LmpzIiwibm9kZV9tb2R1bGVzL3V1aWQvZGlzdC9lc20tYnJvd3Nlci92NC5qcyIsIm1haW4udHMiXSwic291cmNlc0NvbnRlbnQiOlsiLyohICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbkNvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLlxyXG5cclxuUGVybWlzc2lvbiB0byB1c2UsIGNvcHksIG1vZGlmeSwgYW5kL29yIGRpc3RyaWJ1dGUgdGhpcyBzb2Z0d2FyZSBmb3IgYW55XHJcbnB1cnBvc2Ugd2l0aCBvciB3aXRob3V0IGZlZSBpcyBoZXJlYnkgZ3JhbnRlZC5cclxuXHJcblRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIgQU5EIFRIRSBBVVRIT1IgRElTQ0xBSU1TIEFMTCBXQVJSQU5USUVTIFdJVEhcclxuUkVHQVJEIFRPIFRISVMgU09GVFdBUkUgSU5DTFVESU5HIEFMTCBJTVBMSUVEIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZXHJcbkFORCBGSVRORVNTLiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SIEJFIExJQUJMRSBGT1IgQU5ZIFNQRUNJQUwsIERJUkVDVCxcclxuSU5ESVJFQ1QsIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFUyBPUiBBTlkgREFNQUdFUyBXSEFUU09FVkVSIFJFU1VMVElORyBGUk9NXHJcbkxPU1MgT0YgVVNFLCBEQVRBIE9SIFBST0ZJVFMsIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBORUdMSUdFTkNFIE9SXHJcbk9USEVSIFRPUlRJT1VTIEFDVElPTiwgQVJJU0lORyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBVU0UgT1JcclxuUEVSRk9STUFOQ0UgT0YgVEhJUyBTT0ZUV0FSRS5cclxuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogKi9cclxuLyogZ2xvYmFsIFJlZmxlY3QsIFByb21pc2UgKi9cclxuXHJcbnZhciBleHRlbmRTdGF0aWNzID0gZnVuY3Rpb24oZCwgYikge1xyXG4gICAgZXh0ZW5kU3RhdGljcyA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fFxyXG4gICAgICAgICh7IF9fcHJvdG9fXzogW10gfSBpbnN0YW5jZW9mIEFycmF5ICYmIGZ1bmN0aW9uIChkLCBiKSB7IGQuX19wcm90b19fID0gYjsgfSkgfHxcclxuICAgICAgICBmdW5jdGlvbiAoZCwgYikgeyBmb3IgKHZhciBwIGluIGIpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoYiwgcCkpIGRbcF0gPSBiW3BdOyB9O1xyXG4gICAgcmV0dXJuIGV4dGVuZFN0YXRpY3MoZCwgYik7XHJcbn07XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19leHRlbmRzKGQsIGIpIHtcclxuICAgIGlmICh0eXBlb2YgYiAhPT0gXCJmdW5jdGlvblwiICYmIGIgIT09IG51bGwpXHJcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNsYXNzIGV4dGVuZHMgdmFsdWUgXCIgKyBTdHJpbmcoYikgKyBcIiBpcyBub3QgYSBjb25zdHJ1Y3RvciBvciBudWxsXCIpO1xyXG4gICAgZXh0ZW5kU3RhdGljcyhkLCBiKTtcclxuICAgIGZ1bmN0aW9uIF9fKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gZDsgfVxyXG4gICAgZC5wcm90b3R5cGUgPSBiID09PSBudWxsID8gT2JqZWN0LmNyZWF0ZShiKSA6IChfXy5wcm90b3R5cGUgPSBiLnByb3RvdHlwZSwgbmV3IF9fKCkpO1xyXG59XHJcblxyXG5leHBvcnQgdmFyIF9fYXNzaWduID0gZnVuY3Rpb24oKSB7XHJcbiAgICBfX2Fzc2lnbiA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gX19hc3NpZ24odCkge1xyXG4gICAgICAgIGZvciAodmFyIHMsIGkgPSAxLCBuID0gYXJndW1lbnRzLmxlbmd0aDsgaSA8IG47IGkrKykge1xyXG4gICAgICAgICAgICBzID0gYXJndW1lbnRzW2ldO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBwIGluIHMpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocywgcCkpIHRbcF0gPSBzW3BdO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdDtcclxuICAgIH1cclxuICAgIHJldHVybiBfX2Fzc2lnbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19yZXN0KHMsIGUpIHtcclxuICAgIHZhciB0ID0ge307XHJcbiAgICBmb3IgKHZhciBwIGluIHMpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocywgcCkgJiYgZS5pbmRleE9mKHApIDwgMClcclxuICAgICAgICB0W3BdID0gc1twXTtcclxuICAgIGlmIChzICE9IG51bGwgJiYgdHlwZW9mIE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMgPT09IFwiZnVuY3Rpb25cIilcclxuICAgICAgICBmb3IgKHZhciBpID0gMCwgcCA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMocyk7IGkgPCBwLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmIChlLmluZGV4T2YocFtpXSkgPCAwICYmIE9iamVjdC5wcm90b3R5cGUucHJvcGVydHlJc0VudW1lcmFibGUuY2FsbChzLCBwW2ldKSlcclxuICAgICAgICAgICAgICAgIHRbcFtpXV0gPSBzW3BbaV1dO1xyXG4gICAgICAgIH1cclxuICAgIHJldHVybiB0O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19kZWNvcmF0ZShkZWNvcmF0b3JzLCB0YXJnZXQsIGtleSwgZGVzYykge1xyXG4gICAgdmFyIGMgPSBhcmd1bWVudHMubGVuZ3RoLCByID0gYyA8IDMgPyB0YXJnZXQgOiBkZXNjID09PSBudWxsID8gZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodGFyZ2V0LCBrZXkpIDogZGVzYywgZDtcclxuICAgIGlmICh0eXBlb2YgUmVmbGVjdCA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgUmVmbGVjdC5kZWNvcmF0ZSA9PT0gXCJmdW5jdGlvblwiKSByID0gUmVmbGVjdC5kZWNvcmF0ZShkZWNvcmF0b3JzLCB0YXJnZXQsIGtleSwgZGVzYyk7XHJcbiAgICBlbHNlIGZvciAodmFyIGkgPSBkZWNvcmF0b3JzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSBpZiAoZCA9IGRlY29yYXRvcnNbaV0pIHIgPSAoYyA8IDMgPyBkKHIpIDogYyA+IDMgPyBkKHRhcmdldCwga2V5LCByKSA6IGQodGFyZ2V0LCBrZXkpKSB8fCByO1xyXG4gICAgcmV0dXJuIGMgPiAzICYmIHIgJiYgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwga2V5LCByKSwgcjtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fcGFyYW0ocGFyYW1JbmRleCwgZGVjb3JhdG9yKSB7XHJcbiAgICByZXR1cm4gZnVuY3Rpb24gKHRhcmdldCwga2V5KSB7IGRlY29yYXRvcih0YXJnZXQsIGtleSwgcGFyYW1JbmRleCk7IH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fbWV0YWRhdGEobWV0YWRhdGFLZXksIG1ldGFkYXRhVmFsdWUpIHtcclxuICAgIGlmICh0eXBlb2YgUmVmbGVjdCA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgUmVmbGVjdC5tZXRhZGF0YSA9PT0gXCJmdW5jdGlvblwiKSByZXR1cm4gUmVmbGVjdC5tZXRhZGF0YShtZXRhZGF0YUtleSwgbWV0YWRhdGFWYWx1ZSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2F3YWl0ZXIodGhpc0FyZywgX2FyZ3VtZW50cywgUCwgZ2VuZXJhdG9yKSB7XHJcbiAgICBmdW5jdGlvbiBhZG9wdCh2YWx1ZSkgeyByZXR1cm4gdmFsdWUgaW5zdGFuY2VvZiBQID8gdmFsdWUgOiBuZXcgUChmdW5jdGlvbiAocmVzb2x2ZSkgeyByZXNvbHZlKHZhbHVlKTsgfSk7IH1cclxuICAgIHJldHVybiBuZXcgKFAgfHwgKFAgPSBQcm9taXNlKSkoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xyXG4gICAgICAgIGZ1bmN0aW9uIGZ1bGZpbGxlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvci5uZXh0KHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cclxuICAgICAgICBmdW5jdGlvbiByZWplY3RlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvcltcInRocm93XCJdKHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cclxuICAgICAgICBmdW5jdGlvbiBzdGVwKHJlc3VsdCkgeyByZXN1bHQuZG9uZSA/IHJlc29sdmUocmVzdWx0LnZhbHVlKSA6IGFkb3B0KHJlc3VsdC52YWx1ZSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTsgfVxyXG4gICAgICAgIHN0ZXAoKGdlbmVyYXRvciA9IGdlbmVyYXRvci5hcHBseSh0aGlzQXJnLCBfYXJndW1lbnRzIHx8IFtdKSkubmV4dCgpKTtcclxuICAgIH0pO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19nZW5lcmF0b3IodGhpc0FyZywgYm9keSkge1xyXG4gICAgdmFyIF8gPSB7IGxhYmVsOiAwLCBzZW50OiBmdW5jdGlvbigpIHsgaWYgKHRbMF0gJiAxKSB0aHJvdyB0WzFdOyByZXR1cm4gdFsxXTsgfSwgdHJ5czogW10sIG9wczogW10gfSwgZiwgeSwgdCwgZztcclxuICAgIHJldHVybiBnID0geyBuZXh0OiB2ZXJiKDApLCBcInRocm93XCI6IHZlcmIoMSksIFwicmV0dXJuXCI6IHZlcmIoMikgfSwgdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIChnW1N5bWJvbC5pdGVyYXRvcl0gPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXM7IH0pLCBnO1xyXG4gICAgZnVuY3Rpb24gdmVyYihuKSB7IHJldHVybiBmdW5jdGlvbiAodikgeyByZXR1cm4gc3RlcChbbiwgdl0pOyB9OyB9XHJcbiAgICBmdW5jdGlvbiBzdGVwKG9wKSB7XHJcbiAgICAgICAgaWYgKGYpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJHZW5lcmF0b3IgaXMgYWxyZWFkeSBleGVjdXRpbmcuXCIpO1xyXG4gICAgICAgIHdoaWxlIChfKSB0cnkge1xyXG4gICAgICAgICAgICBpZiAoZiA9IDEsIHkgJiYgKHQgPSBvcFswXSAmIDIgPyB5W1wicmV0dXJuXCJdIDogb3BbMF0gPyB5W1widGhyb3dcIl0gfHwgKCh0ID0geVtcInJldHVyblwiXSkgJiYgdC5jYWxsKHkpLCAwKSA6IHkubmV4dCkgJiYgISh0ID0gdC5jYWxsKHksIG9wWzFdKSkuZG9uZSkgcmV0dXJuIHQ7XHJcbiAgICAgICAgICAgIGlmICh5ID0gMCwgdCkgb3AgPSBbb3BbMF0gJiAyLCB0LnZhbHVlXTtcclxuICAgICAgICAgICAgc3dpdGNoIChvcFswXSkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAwOiBjYXNlIDE6IHQgPSBvcDsgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDQ6IF8ubGFiZWwrKzsgcmV0dXJuIHsgdmFsdWU6IG9wWzFdLCBkb25lOiBmYWxzZSB9O1xyXG4gICAgICAgICAgICAgICAgY2FzZSA1OiBfLmxhYmVsKys7IHkgPSBvcFsxXTsgb3AgPSBbMF07IGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgY2FzZSA3OiBvcCA9IF8ub3BzLnBvcCgpOyBfLnRyeXMucG9wKCk7IGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICBpZiAoISh0ID0gXy50cnlzLCB0ID0gdC5sZW5ndGggPiAwICYmIHRbdC5sZW5ndGggLSAxXSkgJiYgKG9wWzBdID09PSA2IHx8IG9wWzBdID09PSAyKSkgeyBfID0gMDsgY29udGludWU7IH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAob3BbMF0gPT09IDMgJiYgKCF0IHx8IChvcFsxXSA+IHRbMF0gJiYgb3BbMV0gPCB0WzNdKSkpIHsgXy5sYWJlbCA9IG9wWzFdOyBicmVhazsgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChvcFswXSA9PT0gNiAmJiBfLmxhYmVsIDwgdFsxXSkgeyBfLmxhYmVsID0gdFsxXTsgdCA9IG9wOyBicmVhazsgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0ICYmIF8ubGFiZWwgPCB0WzJdKSB7IF8ubGFiZWwgPSB0WzJdOyBfLm9wcy5wdXNoKG9wKTsgYnJlYWs7IH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAodFsyXSkgXy5vcHMucG9wKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgXy50cnlzLnBvcCgpOyBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBvcCA9IGJvZHkuY2FsbCh0aGlzQXJnLCBfKTtcclxuICAgICAgICB9IGNhdGNoIChlKSB7IG9wID0gWzYsIGVdOyB5ID0gMDsgfSBmaW5hbGx5IHsgZiA9IHQgPSAwOyB9XHJcbiAgICAgICAgaWYgKG9wWzBdICYgNSkgdGhyb3cgb3BbMV07IHJldHVybiB7IHZhbHVlOiBvcFswXSA/IG9wWzFdIDogdm9pZCAwLCBkb25lOiB0cnVlIH07XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCB2YXIgX19jcmVhdGVCaW5kaW5nID0gT2JqZWN0LmNyZWF0ZSA/IChmdW5jdGlvbihvLCBtLCBrLCBrMikge1xyXG4gICAgaWYgKGsyID09PSB1bmRlZmluZWQpIGsyID0gaztcclxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvLCBrMiwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGZ1bmN0aW9uKCkgeyByZXR1cm4gbVtrXTsgfSB9KTtcclxufSkgOiAoZnVuY3Rpb24obywgbSwgaywgazIpIHtcclxuICAgIGlmIChrMiA9PT0gdW5kZWZpbmVkKSBrMiA9IGs7XHJcbiAgICBvW2syXSA9IG1ba107XHJcbn0pO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fZXhwb3J0U3RhcihtLCBvKSB7XHJcbiAgICBmb3IgKHZhciBwIGluIG0pIGlmIChwICE9PSBcImRlZmF1bHRcIiAmJiAhT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG8sIHApKSBfX2NyZWF0ZUJpbmRpbmcobywgbSwgcCk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3ZhbHVlcyhvKSB7XHJcbiAgICB2YXIgcyA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBTeW1ib2wuaXRlcmF0b3IsIG0gPSBzICYmIG9bc10sIGkgPSAwO1xyXG4gICAgaWYgKG0pIHJldHVybiBtLmNhbGwobyk7XHJcbiAgICBpZiAobyAmJiB0eXBlb2Ygby5sZW5ndGggPT09IFwibnVtYmVyXCIpIHJldHVybiB7XHJcbiAgICAgICAgbmV4dDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAobyAmJiBpID49IG8ubGVuZ3RoKSBvID0gdm9pZCAwO1xyXG4gICAgICAgICAgICByZXR1cm4geyB2YWx1ZTogbyAmJiBvW2krK10sIGRvbmU6ICFvIH07XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIHRocm93IG5ldyBUeXBlRXJyb3IocyA/IFwiT2JqZWN0IGlzIG5vdCBpdGVyYWJsZS5cIiA6IFwiU3ltYm9sLml0ZXJhdG9yIGlzIG5vdCBkZWZpbmVkLlwiKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fcmVhZChvLCBuKSB7XHJcbiAgICB2YXIgbSA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBvW1N5bWJvbC5pdGVyYXRvcl07XHJcbiAgICBpZiAoIW0pIHJldHVybiBvO1xyXG4gICAgdmFyIGkgPSBtLmNhbGwobyksIHIsIGFyID0gW10sIGU7XHJcbiAgICB0cnkge1xyXG4gICAgICAgIHdoaWxlICgobiA9PT0gdm9pZCAwIHx8IG4tLSA+IDApICYmICEociA9IGkubmV4dCgpKS5kb25lKSBhci5wdXNoKHIudmFsdWUpO1xyXG4gICAgfVxyXG4gICAgY2F0Y2ggKGVycm9yKSB7IGUgPSB7IGVycm9yOiBlcnJvciB9OyB9XHJcbiAgICBmaW5hbGx5IHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBpZiAociAmJiAhci5kb25lICYmIChtID0gaVtcInJldHVyblwiXSkpIG0uY2FsbChpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZmluYWxseSB7IGlmIChlKSB0aHJvdyBlLmVycm9yOyB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gYXI7XHJcbn1cclxuXHJcbi8qKiBAZGVwcmVjYXRlZCAqL1xyXG5leHBvcnQgZnVuY3Rpb24gX19zcHJlYWQoKSB7XHJcbiAgICBmb3IgKHZhciBhciA9IFtdLCBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKylcclxuICAgICAgICBhciA9IGFyLmNvbmNhdChfX3JlYWQoYXJndW1lbnRzW2ldKSk7XHJcbiAgICByZXR1cm4gYXI7XHJcbn1cclxuXHJcbi8qKiBAZGVwcmVjYXRlZCAqL1xyXG5leHBvcnQgZnVuY3Rpb24gX19zcHJlYWRBcnJheXMoKSB7XHJcbiAgICBmb3IgKHZhciBzID0gMCwgaSA9IDAsIGlsID0gYXJndW1lbnRzLmxlbmd0aDsgaSA8IGlsOyBpKyspIHMgKz0gYXJndW1lbnRzW2ldLmxlbmd0aDtcclxuICAgIGZvciAodmFyIHIgPSBBcnJheShzKSwgayA9IDAsIGkgPSAwOyBpIDwgaWw7IGkrKylcclxuICAgICAgICBmb3IgKHZhciBhID0gYXJndW1lbnRzW2ldLCBqID0gMCwgamwgPSBhLmxlbmd0aDsgaiA8IGpsOyBqKyssIGsrKylcclxuICAgICAgICAgICAgcltrXSA9IGFbal07XHJcbiAgICByZXR1cm4gcjtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fc3ByZWFkQXJyYXkodG8sIGZyb20pIHtcclxuICAgIGZvciAodmFyIGkgPSAwLCBpbCA9IGZyb20ubGVuZ3RoLCBqID0gdG8ubGVuZ3RoOyBpIDwgaWw7IGkrKywgaisrKVxyXG4gICAgICAgIHRvW2pdID0gZnJvbVtpXTtcclxuICAgIHJldHVybiB0bztcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fYXdhaXQodikge1xyXG4gICAgcmV0dXJuIHRoaXMgaW5zdGFuY2VvZiBfX2F3YWl0ID8gKHRoaXMudiA9IHYsIHRoaXMpIDogbmV3IF9fYXdhaXQodik7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2FzeW5jR2VuZXJhdG9yKHRoaXNBcmcsIF9hcmd1bWVudHMsIGdlbmVyYXRvcikge1xyXG4gICAgaWYgKCFTeW1ib2wuYXN5bmNJdGVyYXRvcikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN5bWJvbC5hc3luY0l0ZXJhdG9yIGlzIG5vdCBkZWZpbmVkLlwiKTtcclxuICAgIHZhciBnID0gZ2VuZXJhdG9yLmFwcGx5KHRoaXNBcmcsIF9hcmd1bWVudHMgfHwgW10pLCBpLCBxID0gW107XHJcbiAgICByZXR1cm4gaSA9IHt9LCB2ZXJiKFwibmV4dFwiKSwgdmVyYihcInRocm93XCIpLCB2ZXJiKFwicmV0dXJuXCIpLCBpW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXM7IH0sIGk7XHJcbiAgICBmdW5jdGlvbiB2ZXJiKG4pIHsgaWYgKGdbbl0pIGlbbl0gPSBmdW5jdGlvbiAodikgeyByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKGEsIGIpIHsgcS5wdXNoKFtuLCB2LCBhLCBiXSkgPiAxIHx8IHJlc3VtZShuLCB2KTsgfSk7IH07IH1cclxuICAgIGZ1bmN0aW9uIHJlc3VtZShuLCB2KSB7IHRyeSB7IHN0ZXAoZ1tuXSh2KSk7IH0gY2F0Y2ggKGUpIHsgc2V0dGxlKHFbMF1bM10sIGUpOyB9IH1cclxuICAgIGZ1bmN0aW9uIHN0ZXAocikgeyByLnZhbHVlIGluc3RhbmNlb2YgX19hd2FpdCA/IFByb21pc2UucmVzb2x2ZShyLnZhbHVlLnYpLnRoZW4oZnVsZmlsbCwgcmVqZWN0KSA6IHNldHRsZShxWzBdWzJdLCByKTsgfVxyXG4gICAgZnVuY3Rpb24gZnVsZmlsbCh2YWx1ZSkgeyByZXN1bWUoXCJuZXh0XCIsIHZhbHVlKTsgfVxyXG4gICAgZnVuY3Rpb24gcmVqZWN0KHZhbHVlKSB7IHJlc3VtZShcInRocm93XCIsIHZhbHVlKTsgfVxyXG4gICAgZnVuY3Rpb24gc2V0dGxlKGYsIHYpIHsgaWYgKGYodiksIHEuc2hpZnQoKSwgcS5sZW5ndGgpIHJlc3VtZShxWzBdWzBdLCBxWzBdWzFdKTsgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19hc3luY0RlbGVnYXRvcihvKSB7XHJcbiAgICB2YXIgaSwgcDtcclxuICAgIHJldHVybiBpID0ge30sIHZlcmIoXCJuZXh0XCIpLCB2ZXJiKFwidGhyb3dcIiwgZnVuY3Rpb24gKGUpIHsgdGhyb3cgZTsgfSksIHZlcmIoXCJyZXR1cm5cIiksIGlbU3ltYm9sLml0ZXJhdG9yXSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXM7IH0sIGk7XHJcbiAgICBmdW5jdGlvbiB2ZXJiKG4sIGYpIHsgaVtuXSA9IG9bbl0gPyBmdW5jdGlvbiAodikgeyByZXR1cm4gKHAgPSAhcCkgPyB7IHZhbHVlOiBfX2F3YWl0KG9bbl0odikpLCBkb25lOiBuID09PSBcInJldHVyblwiIH0gOiBmID8gZih2KSA6IHY7IH0gOiBmOyB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2FzeW5jVmFsdWVzKG8pIHtcclxuICAgIGlmICghU3ltYm9sLmFzeW5jSXRlcmF0b3IpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJTeW1ib2wuYXN5bmNJdGVyYXRvciBpcyBub3QgZGVmaW5lZC5cIik7XHJcbiAgICB2YXIgbSA9IG9bU3ltYm9sLmFzeW5jSXRlcmF0b3JdLCBpO1xyXG4gICAgcmV0dXJuIG0gPyBtLmNhbGwobykgOiAobyA9IHR5cGVvZiBfX3ZhbHVlcyA9PT0gXCJmdW5jdGlvblwiID8gX192YWx1ZXMobykgOiBvW1N5bWJvbC5pdGVyYXRvcl0oKSwgaSA9IHt9LCB2ZXJiKFwibmV4dFwiKSwgdmVyYihcInRocm93XCIpLCB2ZXJiKFwicmV0dXJuXCIpLCBpW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXM7IH0sIGkpO1xyXG4gICAgZnVuY3Rpb24gdmVyYihuKSB7IGlbbl0gPSBvW25dICYmIGZ1bmN0aW9uICh2KSB7IHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7IHYgPSBvW25dKHYpLCBzZXR0bGUocmVzb2x2ZSwgcmVqZWN0LCB2LmRvbmUsIHYudmFsdWUpOyB9KTsgfTsgfVxyXG4gICAgZnVuY3Rpb24gc2V0dGxlKHJlc29sdmUsIHJlamVjdCwgZCwgdikgeyBQcm9taXNlLnJlc29sdmUodikudGhlbihmdW5jdGlvbih2KSB7IHJlc29sdmUoeyB2YWx1ZTogdiwgZG9uZTogZCB9KTsgfSwgcmVqZWN0KTsgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19tYWtlVGVtcGxhdGVPYmplY3QoY29va2VkLCByYXcpIHtcclxuICAgIGlmIChPYmplY3QuZGVmaW5lUHJvcGVydHkpIHsgT2JqZWN0LmRlZmluZVByb3BlcnR5KGNvb2tlZCwgXCJyYXdcIiwgeyB2YWx1ZTogcmF3IH0pOyB9IGVsc2UgeyBjb29rZWQucmF3ID0gcmF3OyB9XHJcbiAgICByZXR1cm4gY29va2VkO1xyXG59O1xyXG5cclxudmFyIF9fc2V0TW9kdWxlRGVmYXVsdCA9IE9iamVjdC5jcmVhdGUgPyAoZnVuY3Rpb24obywgdikge1xyXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG8sIFwiZGVmYXVsdFwiLCB7IGVudW1lcmFibGU6IHRydWUsIHZhbHVlOiB2IH0pO1xyXG59KSA6IGZ1bmN0aW9uKG8sIHYpIHtcclxuICAgIG9bXCJkZWZhdWx0XCJdID0gdjtcclxufTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2ltcG9ydFN0YXIobW9kKSB7XHJcbiAgICBpZiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSByZXR1cm4gbW9kO1xyXG4gICAgdmFyIHJlc3VsdCA9IHt9O1xyXG4gICAgaWYgKG1vZCAhPSBudWxsKSBmb3IgKHZhciBrIGluIG1vZCkgaWYgKGsgIT09IFwiZGVmYXVsdFwiICYmIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChtb2QsIGspKSBfX2NyZWF0ZUJpbmRpbmcocmVzdWx0LCBtb2QsIGspO1xyXG4gICAgX19zZXRNb2R1bGVEZWZhdWx0KHJlc3VsdCwgbW9kKTtcclxuICAgIHJldHVybiByZXN1bHQ7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2ltcG9ydERlZmF1bHQobW9kKSB7XHJcbiAgICByZXR1cm4gKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgPyBtb2QgOiB7IGRlZmF1bHQ6IG1vZCB9O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19jbGFzc1ByaXZhdGVGaWVsZEdldChyZWNlaXZlciwgcHJpdmF0ZU1hcCkge1xyXG4gICAgaWYgKCFwcml2YXRlTWFwLmhhcyhyZWNlaXZlcikpIHtcclxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiYXR0ZW1wdGVkIHRvIGdldCBwcml2YXRlIGZpZWxkIG9uIG5vbi1pbnN0YW5jZVwiKTtcclxuICAgIH1cclxuICAgIHJldHVybiBwcml2YXRlTWFwLmdldChyZWNlaXZlcik7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2NsYXNzUHJpdmF0ZUZpZWxkU2V0KHJlY2VpdmVyLCBwcml2YXRlTWFwLCB2YWx1ZSkge1xyXG4gICAgaWYgKCFwcml2YXRlTWFwLmhhcyhyZWNlaXZlcikpIHtcclxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiYXR0ZW1wdGVkIHRvIHNldCBwcml2YXRlIGZpZWxkIG9uIG5vbi1pbnN0YW5jZVwiKTtcclxuICAgIH1cclxuICAgIHByaXZhdGVNYXAuc2V0KHJlY2VpdmVyLCB2YWx1ZSk7XHJcbiAgICByZXR1cm4gdmFsdWU7XHJcbn1cclxuIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuXG52YXIgb2JzaWRpYW4gPSByZXF1aXJlKCdvYnNpZGlhbicpO1xuXG5jb25zdCBERUZBVUxUX0RBSUxZX05PVEVfRk9STUFUID0gXCJZWVlZLU1NLUREXCI7XG5jb25zdCBERUZBVUxUX1dFRUtMWV9OT1RFX0ZPUk1BVCA9IFwiZ2dnZy1bV113d1wiO1xuY29uc3QgREVGQVVMVF9NT05USExZX05PVEVfRk9STUFUID0gXCJZWVlZLU1NXCI7XG5cbmZ1bmN0aW9uIHNob3VsZFVzZVBlcmlvZGljTm90ZXNTZXR0aW5ncyhwZXJpb2RpY2l0eSkge1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG4gICAgY29uc3QgcGVyaW9kaWNOb3RlcyA9IHdpbmRvdy5hcHAucGx1Z2lucy5nZXRQbHVnaW4oXCJwZXJpb2RpYy1ub3Rlc1wiKTtcbiAgICByZXR1cm4gcGVyaW9kaWNOb3RlcyAmJiBwZXJpb2RpY05vdGVzLnNldHRpbmdzPy5bcGVyaW9kaWNpdHldPy5lbmFibGVkO1xufVxuLyoqXG4gKiBSZWFkIHRoZSB1c2VyIHNldHRpbmdzIGZvciB0aGUgYGRhaWx5LW5vdGVzYCBwbHVnaW5cbiAqIHRvIGtlZXAgYmVoYXZpb3Igb2YgY3JlYXRpbmcgYSBuZXcgbm90ZSBpbi1zeW5jLlxuICovXG5mdW5jdGlvbiBnZXREYWlseU5vdGVTZXR0aW5ncygpIHtcbiAgICB0cnkge1xuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuICAgICAgICBjb25zdCB7IGludGVybmFsUGx1Z2lucywgcGx1Z2lucyB9ID0gd2luZG93LmFwcDtcbiAgICAgICAgaWYgKHNob3VsZFVzZVBlcmlvZGljTm90ZXNTZXR0aW5ncyhcImRhaWx5XCIpKSB7XG4gICAgICAgICAgICBjb25zdCB7IGZvcm1hdCwgZm9sZGVyLCB0ZW1wbGF0ZSB9ID0gcGx1Z2lucy5nZXRQbHVnaW4oXCJwZXJpb2RpYy1ub3Rlc1wiKT8uc2V0dGluZ3M/LmRhaWx5IHx8IHt9O1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBmb3JtYXQ6IGZvcm1hdCB8fCBERUZBVUxUX0RBSUxZX05PVEVfRk9STUFULFxuICAgICAgICAgICAgICAgIGZvbGRlcjogZm9sZGVyPy50cmltKCkgfHwgXCJcIixcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogdGVtcGxhdGU/LnRyaW0oKSB8fCBcIlwiLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB7IGZvbGRlciwgZm9ybWF0LCB0ZW1wbGF0ZSB9ID0gaW50ZXJuYWxQbHVnaW5zLmdldFBsdWdpbkJ5SWQoXCJkYWlseS1ub3Rlc1wiKT8uaW5zdGFuY2U/Lm9wdGlvbnMgfHwge307XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBmb3JtYXQ6IGZvcm1hdCB8fCBERUZBVUxUX0RBSUxZX05PVEVfRk9STUFULFxuICAgICAgICAgICAgZm9sZGVyOiBmb2xkZXI/LnRyaW0oKSB8fCBcIlwiLFxuICAgICAgICAgICAgdGVtcGxhdGU6IHRlbXBsYXRlPy50cmltKCkgfHwgXCJcIixcbiAgICAgICAgfTtcbiAgICB9XG4gICAgY2F0Y2ggKGVycikge1xuICAgICAgICBjb25zb2xlLmluZm8oXCJObyBjdXN0b20gZGFpbHkgbm90ZSBzZXR0aW5ncyBmb3VuZCFcIiwgZXJyKTtcbiAgICB9XG59XG4vKipcbiAqIFJlYWQgdGhlIHVzZXIgc2V0dGluZ3MgZm9yIHRoZSBgd2Vla2x5LW5vdGVzYCBwbHVnaW5cbiAqIHRvIGtlZXAgYmVoYXZpb3Igb2YgY3JlYXRpbmcgYSBuZXcgbm90ZSBpbi1zeW5jLlxuICovXG5mdW5jdGlvbiBnZXRXZWVrbHlOb3RlU2V0dGluZ3MoKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcbiAgICAgICAgY29uc3QgcGx1Z2luTWFuYWdlciA9IHdpbmRvdy5hcHAucGx1Z2lucztcbiAgICAgICAgY29uc3QgY2FsZW5kYXJTZXR0aW5ncyA9IHBsdWdpbk1hbmFnZXIuZ2V0UGx1Z2luKFwiY2FsZW5kYXJcIik/Lm9wdGlvbnM7XG4gICAgICAgIGNvbnN0IHBlcmlvZGljTm90ZXNTZXR0aW5ncyA9IHBsdWdpbk1hbmFnZXIuZ2V0UGx1Z2luKFwicGVyaW9kaWMtbm90ZXNcIilcbiAgICAgICAgICAgID8uc2V0dGluZ3M/LndlZWtseTtcbiAgICAgICAgaWYgKHNob3VsZFVzZVBlcmlvZGljTm90ZXNTZXR0aW5ncyhcIndlZWtseVwiKSkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBmb3JtYXQ6IHBlcmlvZGljTm90ZXNTZXR0aW5ncy5mb3JtYXQgfHwgREVGQVVMVF9XRUVLTFlfTk9URV9GT1JNQVQsXG4gICAgICAgICAgICAgICAgZm9sZGVyOiBwZXJpb2RpY05vdGVzU2V0dGluZ3MuZm9sZGVyPy50cmltKCkgfHwgXCJcIixcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogcGVyaW9kaWNOb3Rlc1NldHRpbmdzLnRlbXBsYXRlPy50cmltKCkgfHwgXCJcIixcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qgc2V0dGluZ3MgPSBjYWxlbmRhclNldHRpbmdzIHx8IHt9O1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZm9ybWF0OiBzZXR0aW5ncy53ZWVrbHlOb3RlRm9ybWF0IHx8IERFRkFVTFRfV0VFS0xZX05PVEVfRk9STUFULFxuICAgICAgICAgICAgZm9sZGVyOiBzZXR0aW5ncy53ZWVrbHlOb3RlRm9sZGVyPy50cmltKCkgfHwgXCJcIixcbiAgICAgICAgICAgIHRlbXBsYXRlOiBzZXR0aW5ncy53ZWVrbHlOb3RlVGVtcGxhdGU/LnRyaW0oKSB8fCBcIlwiLFxuICAgICAgICB9O1xuICAgIH1cbiAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGNvbnNvbGUuaW5mbyhcIk5vIGN1c3RvbSB3ZWVrbHkgbm90ZSBzZXR0aW5ncyBmb3VuZCFcIiwgZXJyKTtcbiAgICB9XG59XG4vKipcbiAqIFJlYWQgdGhlIHVzZXIgc2V0dGluZ3MgZm9yIHRoZSBgcGVyaW9kaWMtbm90ZXNgIHBsdWdpblxuICogdG8ga2VlcCBiZWhhdmlvciBvZiBjcmVhdGluZyBhIG5ldyBub3RlIGluLXN5bmMuXG4gKi9cbmZ1bmN0aW9uIGdldE1vbnRobHlOb3RlU2V0dGluZ3MoKSB7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcbiAgICBjb25zdCBwbHVnaW5NYW5hZ2VyID0gd2luZG93LmFwcC5wbHVnaW5zO1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHNldHRpbmdzID0gKHNob3VsZFVzZVBlcmlvZGljTm90ZXNTZXR0aW5ncyhcIm1vbnRobHlcIikgJiZcbiAgICAgICAgICAgIHBsdWdpbk1hbmFnZXIuZ2V0UGx1Z2luKFwicGVyaW9kaWMtbm90ZXNcIik/LnNldHRpbmdzPy5tb250aGx5KSB8fFxuICAgICAgICAgICAge307XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBmb3JtYXQ6IHNldHRpbmdzLmZvcm1hdCB8fCBERUZBVUxUX01PTlRITFlfTk9URV9GT1JNQVQsXG4gICAgICAgICAgICBmb2xkZXI6IHNldHRpbmdzLmZvbGRlcj8udHJpbSgpIHx8IFwiXCIsXG4gICAgICAgICAgICB0ZW1wbGF0ZTogc2V0dGluZ3MudGVtcGxhdGU/LnRyaW0oKSB8fCBcIlwiLFxuICAgICAgICB9O1xuICAgIH1cbiAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGNvbnNvbGUuaW5mbyhcIk5vIGN1c3RvbSBtb250aGx5IG5vdGUgc2V0dGluZ3MgZm91bmQhXCIsIGVycik7XG4gICAgfVxufVxuXG4vLyBDcmVkaXQ6IEBjcmVhdGlvbml4L3BhdGguanNcbmZ1bmN0aW9uIGpvaW4oLi4ucGFydFNlZ21lbnRzKSB7XG4gICAgLy8gU3BsaXQgdGhlIGlucHV0cyBpbnRvIGEgbGlzdCBvZiBwYXRoIGNvbW1hbmRzLlxuICAgIGxldCBwYXJ0cyA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwLCBsID0gcGFydFNlZ21lbnRzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICBwYXJ0cyA9IHBhcnRzLmNvbmNhdChwYXJ0U2VnbWVudHNbaV0uc3BsaXQoXCIvXCIpKTtcbiAgICB9XG4gICAgLy8gSW50ZXJwcmV0IHRoZSBwYXRoIGNvbW1hbmRzIHRvIGdldCB0aGUgbmV3IHJlc29sdmVkIHBhdGguXG4gICAgY29uc3QgbmV3UGFydHMgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMCwgbCA9IHBhcnRzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICBjb25zdCBwYXJ0ID0gcGFydHNbaV07XG4gICAgICAgIC8vIFJlbW92ZSBsZWFkaW5nIGFuZCB0cmFpbGluZyBzbGFzaGVzXG4gICAgICAgIC8vIEFsc28gcmVtb3ZlIFwiLlwiIHNlZ21lbnRzXG4gICAgICAgIGlmICghcGFydCB8fCBwYXJ0ID09PSBcIi5cIilcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAvLyBQdXNoIG5ldyBwYXRoIHNlZ21lbnRzLlxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBuZXdQYXJ0cy5wdXNoKHBhcnQpO1xuICAgIH1cbiAgICAvLyBQcmVzZXJ2ZSB0aGUgaW5pdGlhbCBzbGFzaCBpZiB0aGVyZSB3YXMgb25lLlxuICAgIGlmIChwYXJ0c1swXSA9PT0gXCJcIilcbiAgICAgICAgbmV3UGFydHMudW5zaGlmdChcIlwiKTtcbiAgICAvLyBUdXJuIGJhY2sgaW50byBhIHNpbmdsZSBzdHJpbmcgcGF0aC5cbiAgICByZXR1cm4gbmV3UGFydHMuam9pbihcIi9cIik7XG59XG5mdW5jdGlvbiBiYXNlbmFtZShmdWxsUGF0aCkge1xuICAgIGxldCBiYXNlID0gZnVsbFBhdGguc3Vic3RyaW5nKGZ1bGxQYXRoLmxhc3RJbmRleE9mKFwiL1wiKSArIDEpO1xuICAgIGlmIChiYXNlLmxhc3RJbmRleE9mKFwiLlwiKSAhPSAtMSlcbiAgICAgICAgYmFzZSA9IGJhc2Uuc3Vic3RyaW5nKDAsIGJhc2UubGFzdEluZGV4T2YoXCIuXCIpKTtcbiAgICByZXR1cm4gYmFzZTtcbn1cbmFzeW5jIGZ1bmN0aW9uIGVuc3VyZUZvbGRlckV4aXN0cyhwYXRoKSB7XG4gICAgY29uc3QgZGlycyA9IHBhdGgucmVwbGFjZSgvXFxcXC9nLCBcIi9cIikuc3BsaXQoXCIvXCIpO1xuICAgIGRpcnMucG9wKCk7IC8vIHJlbW92ZSBiYXNlbmFtZVxuICAgIGlmIChkaXJzLmxlbmd0aCkge1xuICAgICAgICBjb25zdCBkaXIgPSBqb2luKC4uLmRpcnMpO1xuICAgICAgICBpZiAoIXdpbmRvdy5hcHAudmF1bHQuZ2V0QWJzdHJhY3RGaWxlQnlQYXRoKGRpcikpIHtcbiAgICAgICAgICAgIGF3YWl0IHdpbmRvdy5hcHAudmF1bHQuY3JlYXRlRm9sZGVyKGRpcik7XG4gICAgICAgIH1cbiAgICB9XG59XG5hc3luYyBmdW5jdGlvbiBnZXROb3RlUGF0aChkaXJlY3RvcnksIGZpbGVuYW1lKSB7XG4gICAgaWYgKCFmaWxlbmFtZS5lbmRzV2l0aChcIi5tZFwiKSkge1xuICAgICAgICBmaWxlbmFtZSArPSBcIi5tZFwiO1xuICAgIH1cbiAgICBjb25zdCBwYXRoID0gb2JzaWRpYW4ubm9ybWFsaXplUGF0aChqb2luKGRpcmVjdG9yeSwgZmlsZW5hbWUpKTtcbiAgICBhd2FpdCBlbnN1cmVGb2xkZXJFeGlzdHMocGF0aCk7XG4gICAgcmV0dXJuIHBhdGg7XG59XG5hc3luYyBmdW5jdGlvbiBnZXRUZW1wbGF0ZUluZm8odGVtcGxhdGUpIHtcbiAgICBjb25zdCB7IG1ldGFkYXRhQ2FjaGUsIHZhdWx0IH0gPSB3aW5kb3cuYXBwO1xuICAgIGNvbnN0IHRlbXBsYXRlUGF0aCA9IG9ic2lkaWFuLm5vcm1hbGl6ZVBhdGgodGVtcGxhdGUpO1xuICAgIGlmICh0ZW1wbGF0ZVBhdGggPT09IFwiL1wiKSB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoW1wiXCIsIG51bGxdKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgdGVtcGxhdGVGaWxlID0gbWV0YWRhdGFDYWNoZS5nZXRGaXJzdExpbmtwYXRoRGVzdCh0ZW1wbGF0ZVBhdGgsIFwiXCIpO1xuICAgICAgICBjb25zdCBjb250ZW50cyA9IGF3YWl0IHZhdWx0LmNhY2hlZFJlYWQodGVtcGxhdGVGaWxlKTtcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcbiAgICAgICAgY29uc3QgSUZvbGRJbmZvID0gd2luZG93LmFwcC5mb2xkTWFuYWdlci5sb2FkKHRlbXBsYXRlRmlsZSk7XG4gICAgICAgIHJldHVybiBbY29udGVudHMsIElGb2xkSW5mb107XG4gICAgfVxuICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihgRmFpbGVkIHRvIHJlYWQgdGhlIGRhaWx5IG5vdGUgdGVtcGxhdGUgJyR7dGVtcGxhdGVQYXRofSdgLCBlcnIpO1xuICAgICAgICBuZXcgb2JzaWRpYW4uTm90aWNlKFwiRmFpbGVkIHRvIHJlYWQgdGhlIGRhaWx5IG5vdGUgdGVtcGxhdGVcIik7XG4gICAgICAgIHJldHVybiBbXCJcIiwgbnVsbF07XG4gICAgfVxufVxuXG4vKipcbiAqIGRhdGVVSUQgaXMgYSB3YXkgb2Ygd2Vla2x5IGlkZW50aWZ5aW5nIGRhaWx5L3dlZWtseS9tb250aGx5IG5vdGVzLlxuICogVGhleSBhcmUgcHJlZml4ZWQgd2l0aCB0aGUgZ3JhbnVsYXJpdHkgdG8gYXZvaWQgYW1iaWd1aXR5LlxuICovXG5mdW5jdGlvbiBnZXREYXRlVUlEKGRhdGUsIGdyYW51bGFyaXR5ID0gXCJkYXlcIikge1xuICAgIGNvbnN0IHRzID0gZGF0ZS5jbG9uZSgpLnN0YXJ0T2YoZ3JhbnVsYXJpdHkpLmZvcm1hdCgpO1xuICAgIHJldHVybiBgJHtncmFudWxhcml0eX0tJHt0c31gO1xufVxuZnVuY3Rpb24gcmVtb3ZlRXNjYXBlZENoYXJhY3RlcnMoZm9ybWF0KSB7XG4gICAgcmV0dXJuIGZvcm1hdC5yZXBsYWNlKC9cXFtbXlxcXV0qXFxdL2csIFwiXCIpOyAvLyByZW1vdmUgZXZlcnl0aGluZyB3aXRoaW4gYnJhY2tldHNcbn1cbi8qKlxuICogWFhYOiBXaGVuIHBhcnNpbmcgZGF0ZXMgdGhhdCBjb250YWluIGJvdGggd2VlayBudW1iZXJzIGFuZCBtb250aHMsXG4gKiBNb21lbnQgY2hvc2VzIHRvIGlnbm9yZSB0aGUgd2VlayBudW1iZXJzLiBGb3IgdGhlIHdlZWsgZGF0ZVVJRCwgd2VcbiAqIHdhbnQgdGhlIG9wcG9zaXRlIGJlaGF2aW9yLiBTdHJpcCB0aGUgTU1NIGZyb20gdGhlIGZvcm1hdCB0byBwYXRjaC5cbiAqL1xuZnVuY3Rpb24gaXNGb3JtYXRBbWJpZ3VvdXMoZm9ybWF0LCBncmFudWxhcml0eSkge1xuICAgIGlmIChncmFudWxhcml0eSA9PT0gXCJ3ZWVrXCIpIHtcbiAgICAgICAgY29uc3QgY2xlYW5Gb3JtYXQgPSByZW1vdmVFc2NhcGVkQ2hhcmFjdGVycyhmb3JtYXQpO1xuICAgICAgICByZXR1cm4gKC93ezEsMn0vaS50ZXN0KGNsZWFuRm9ybWF0KSAmJlxuICAgICAgICAgICAgKC9NezEsNH0vLnRlc3QoY2xlYW5Gb3JtYXQpIHx8IC9EezEsNH0vLnRlc3QoY2xlYW5Gb3JtYXQpKSk7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbn1cbmZ1bmN0aW9uIGdldERhdGVGcm9tRmlsZShmaWxlLCBncmFudWxhcml0eSkge1xuICAgIHJldHVybiBnZXREYXRlRnJvbUZpbGVuYW1lKGZpbGUuYmFzZW5hbWUsIGdyYW51bGFyaXR5KTtcbn1cbmZ1bmN0aW9uIGdldERhdGVGcm9tUGF0aChwYXRoLCBncmFudWxhcml0eSkge1xuICAgIHJldHVybiBnZXREYXRlRnJvbUZpbGVuYW1lKGJhc2VuYW1lKHBhdGgpLCBncmFudWxhcml0eSk7XG59XG5mdW5jdGlvbiBnZXREYXRlRnJvbUZpbGVuYW1lKGZpbGVuYW1lLCBncmFudWxhcml0eSkge1xuICAgIGNvbnN0IGdldFNldHRpbmdzID0ge1xuICAgICAgICBkYXk6IGdldERhaWx5Tm90ZVNldHRpbmdzLFxuICAgICAgICB3ZWVrOiBnZXRXZWVrbHlOb3RlU2V0dGluZ3MsXG4gICAgICAgIG1vbnRoOiBnZXRNb250aGx5Tm90ZVNldHRpbmdzLFxuICAgIH07XG4gICAgY29uc3QgZm9ybWF0ID0gZ2V0U2V0dGluZ3NbZ3JhbnVsYXJpdHldKCkuZm9ybWF0LnNwbGl0KFwiL1wiKS5wb3AoKTtcbiAgICBjb25zdCBub3RlRGF0ZSA9IHdpbmRvdy5tb21lbnQoZmlsZW5hbWUsIGZvcm1hdCwgdHJ1ZSk7XG4gICAgaWYgKCFub3RlRGF0ZS5pc1ZhbGlkKCkpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGlmIChpc0Zvcm1hdEFtYmlndW91cyhmb3JtYXQsIGdyYW51bGFyaXR5KSkge1xuICAgICAgICBpZiAoZ3JhbnVsYXJpdHkgPT09IFwid2Vla1wiKSB7XG4gICAgICAgICAgICBjb25zdCBjbGVhbkZvcm1hdCA9IHJlbW92ZUVzY2FwZWRDaGFyYWN0ZXJzKGZvcm1hdCk7XG4gICAgICAgICAgICBpZiAoL3d7MSwyfS9pLnRlc3QoY2xlYW5Gb3JtYXQpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHdpbmRvdy5tb21lbnQoZmlsZW5hbWUsIFxuICAgICAgICAgICAgICAgIC8vIElmIGZvcm1hdCBjb250YWlucyB3ZWVrLCByZW1vdmUgZGF5ICYgbW9udGggZm9ybWF0dGluZ1xuICAgICAgICAgICAgICAgIGZvcm1hdC5yZXBsYWNlKC9NezEsNH0vZywgXCJcIikucmVwbGFjZSgvRHsxLDR9L2csIFwiXCIpLCBmYWxzZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG5vdGVEYXRlO1xufVxuXG5jbGFzcyBEYWlseU5vdGVzRm9sZGVyTWlzc2luZ0Vycm9yIGV4dGVuZHMgRXJyb3Ige1xufVxuLyoqXG4gKiBUaGlzIGZ1bmN0aW9uIG1pbWljcyB0aGUgYmVoYXZpb3Igb2YgdGhlIGRhaWx5LW5vdGVzIHBsdWdpblxuICogc28gaXQgd2lsbCByZXBsYWNlIHt7ZGF0ZX19LCB7e3RpdGxlfX0sIGFuZCB7e3RpbWV9fSB3aXRoIHRoZVxuICogZm9ybWF0dGVkIHRpbWVzdGFtcC5cbiAqXG4gKiBOb3RlOiBpdCBoYXMgYW4gYWRkZWQgYm9udXMgdGhhdCBpdCdzIG5vdCAndG9kYXknIHNwZWNpZmljLlxuICovXG5hc3luYyBmdW5jdGlvbiBjcmVhdGVEYWlseU5vdGUoZGF0ZSkge1xuICAgIGNvbnN0IGFwcCA9IHdpbmRvdy5hcHA7XG4gICAgY29uc3QgeyB2YXVsdCB9ID0gYXBwO1xuICAgIGNvbnN0IG1vbWVudCA9IHdpbmRvdy5tb21lbnQ7XG4gICAgY29uc3QgeyB0ZW1wbGF0ZSwgZm9ybWF0LCBmb2xkZXIgfSA9IGdldERhaWx5Tm90ZVNldHRpbmdzKCk7XG4gICAgY29uc3QgW3RlbXBsYXRlQ29udGVudHMsIElGb2xkSW5mb10gPSBhd2FpdCBnZXRUZW1wbGF0ZUluZm8odGVtcGxhdGUpO1xuICAgIGNvbnN0IGZpbGVuYW1lID0gZGF0ZS5mb3JtYXQoZm9ybWF0KTtcbiAgICBjb25zdCBub3JtYWxpemVkUGF0aCA9IGF3YWl0IGdldE5vdGVQYXRoKGZvbGRlciwgZmlsZW5hbWUpO1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGNyZWF0ZWRGaWxlID0gYXdhaXQgdmF1bHQuY3JlYXRlKG5vcm1hbGl6ZWRQYXRoLCB0ZW1wbGF0ZUNvbnRlbnRzXG4gICAgICAgICAgICAucmVwbGFjZSgve3tcXHMqZGF0ZVxccyp9fS9naSwgZmlsZW5hbWUpXG4gICAgICAgICAgICAucmVwbGFjZSgve3tcXHMqdGltZVxccyp9fS9naSwgbW9tZW50KCkuZm9ybWF0KFwiSEg6bW1cIikpXG4gICAgICAgICAgICAucmVwbGFjZSgve3tcXHMqdGl0bGVcXHMqfX0vZ2ksIGZpbGVuYW1lKVxuICAgICAgICAgICAgLnJlcGxhY2UoL3t7XFxzKihkYXRlfHRpbWUpXFxzKigoWystXVxcZCspKFt5cW13ZGhzXSkpP1xccyooOi4rPyk/fX0vZ2ksIChfLCBfdGltZU9yRGF0ZSwgY2FsYywgdGltZURlbHRhLCB1bml0LCBtb21lbnRGb3JtYXQpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG5vdyA9IG1vbWVudCgpO1xuICAgICAgICAgICAgY29uc3QgY3VycmVudERhdGUgPSBkYXRlLmNsb25lKCkuc2V0KHtcbiAgICAgICAgICAgICAgICBob3VyOiBub3cuZ2V0KFwiaG91clwiKSxcbiAgICAgICAgICAgICAgICBtaW51dGU6IG5vdy5nZXQoXCJtaW51dGVcIiksXG4gICAgICAgICAgICAgICAgc2Vjb25kOiBub3cuZ2V0KFwic2Vjb25kXCIpLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAoY2FsYykge1xuICAgICAgICAgICAgICAgIGN1cnJlbnREYXRlLmFkZChwYXJzZUludCh0aW1lRGVsdGEsIDEwKSwgdW5pdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobW9tZW50Rm9ybWF0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnREYXRlLmZvcm1hdChtb21lbnRGb3JtYXQuc3Vic3RyaW5nKDEpLnRyaW0oKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gY3VycmVudERhdGUuZm9ybWF0KGZvcm1hdCk7XG4gICAgICAgIH0pXG4gICAgICAgICAgICAucmVwbGFjZSgve3tcXHMqeWVzdGVyZGF5XFxzKn19L2dpLCBkYXRlLmNsb25lKCkuc3VidHJhY3QoMSwgXCJkYXlcIikuZm9ybWF0KGZvcm1hdCkpXG4gICAgICAgICAgICAucmVwbGFjZSgve3tcXHMqdG9tb3Jyb3dcXHMqfX0vZ2ksIGRhdGUuY2xvbmUoKS5hZGQoMSwgXCJkXCIpLmZvcm1hdChmb3JtYXQpKSk7XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG4gICAgICAgIGFwcC5mb2xkTWFuYWdlci5zYXZlKGNyZWF0ZWRGaWxlLCBJRm9sZEluZm8pO1xuICAgICAgICByZXR1cm4gY3JlYXRlZEZpbGU7XG4gICAgfVxuICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihgRmFpbGVkIHRvIGNyZWF0ZSBmaWxlOiAnJHtub3JtYWxpemVkUGF0aH0nYCwgZXJyKTtcbiAgICAgICAgbmV3IG9ic2lkaWFuLk5vdGljZShcIlVuYWJsZSB0byBjcmVhdGUgbmV3IGZpbGUuXCIpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIGdldERhaWx5Tm90ZShkYXRlLCBkYWlseU5vdGVzKSB7XG4gICAgcmV0dXJuIGRhaWx5Tm90ZXNbZ2V0RGF0ZVVJRChkYXRlLCBcImRheVwiKV0gPz8gbnVsbDtcbn1cbmZ1bmN0aW9uIGdldEFsbERhaWx5Tm90ZXMoKSB7XG4gICAgLyoqXG4gICAgICogRmluZCBhbGwgZGFpbHkgbm90ZXMgaW4gdGhlIGRhaWx5IG5vdGUgZm9sZGVyXG4gICAgICovXG4gICAgY29uc3QgeyB2YXVsdCB9ID0gd2luZG93LmFwcDtcbiAgICBjb25zdCB7IGZvbGRlciB9ID0gZ2V0RGFpbHlOb3RlU2V0dGluZ3MoKTtcbiAgICBjb25zdCBkYWlseU5vdGVzRm9sZGVyID0gdmF1bHQuZ2V0QWJzdHJhY3RGaWxlQnlQYXRoKG9ic2lkaWFuLm5vcm1hbGl6ZVBhdGgoZm9sZGVyKSk7XG4gICAgaWYgKCFkYWlseU5vdGVzRm9sZGVyKSB7XG4gICAgICAgIHRocm93IG5ldyBEYWlseU5vdGVzRm9sZGVyTWlzc2luZ0Vycm9yKFwiRmFpbGVkIHRvIGZpbmQgZGFpbHkgbm90ZXMgZm9sZGVyXCIpO1xuICAgIH1cbiAgICBjb25zdCBkYWlseU5vdGVzID0ge307XG4gICAgb2JzaWRpYW4uVmF1bHQucmVjdXJzZUNoaWxkcmVuKGRhaWx5Tm90ZXNGb2xkZXIsIChub3RlKSA9PiB7XG4gICAgICAgIGlmIChub3RlIGluc3RhbmNlb2Ygb2JzaWRpYW4uVEZpbGUpIHtcbiAgICAgICAgICAgIGNvbnN0IGRhdGUgPSBnZXREYXRlRnJvbUZpbGUobm90ZSwgXCJkYXlcIik7XG4gICAgICAgICAgICBpZiAoZGF0ZSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGRhdGVTdHJpbmcgPSBnZXREYXRlVUlEKGRhdGUsIFwiZGF5XCIpO1xuICAgICAgICAgICAgICAgIGRhaWx5Tm90ZXNbZGF0ZVN0cmluZ10gPSBub3RlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGRhaWx5Tm90ZXM7XG59XG5cbmNsYXNzIFdlZWtseU5vdGVzRm9sZGVyTWlzc2luZ0Vycm9yIGV4dGVuZHMgRXJyb3Ige1xufVxuZnVuY3Rpb24gZ2V0RGF5c09mV2VlaygpIHtcbiAgICBjb25zdCB7IG1vbWVudCB9ID0gd2luZG93O1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG4gICAgbGV0IHdlZWtTdGFydCA9IG1vbWVudC5sb2NhbGVEYXRhKCkuX3dlZWsuZG93O1xuICAgIGNvbnN0IGRheXNPZldlZWsgPSBbXG4gICAgICAgIFwic3VuZGF5XCIsXG4gICAgICAgIFwibW9uZGF5XCIsXG4gICAgICAgIFwidHVlc2RheVwiLFxuICAgICAgICBcIndlZG5lc2RheVwiLFxuICAgICAgICBcInRodXJzZGF5XCIsXG4gICAgICAgIFwiZnJpZGF5XCIsXG4gICAgICAgIFwic2F0dXJkYXlcIixcbiAgICBdO1xuICAgIHdoaWxlICh3ZWVrU3RhcnQpIHtcbiAgICAgICAgZGF5c09mV2Vlay5wdXNoKGRheXNPZldlZWsuc2hpZnQoKSk7XG4gICAgICAgIHdlZWtTdGFydC0tO1xuICAgIH1cbiAgICByZXR1cm4gZGF5c09mV2Vlaztcbn1cbmZ1bmN0aW9uIGdldERheU9mV2Vla051bWVyaWNhbFZhbHVlKGRheU9mV2Vla05hbWUpIHtcbiAgICByZXR1cm4gZ2V0RGF5c09mV2VlaygpLmluZGV4T2YoZGF5T2ZXZWVrTmFtZS50b0xvd2VyQ2FzZSgpKTtcbn1cbmFzeW5jIGZ1bmN0aW9uIGNyZWF0ZVdlZWtseU5vdGUoZGF0ZSkge1xuICAgIGNvbnN0IHsgdmF1bHQgfSA9IHdpbmRvdy5hcHA7XG4gICAgY29uc3QgeyB0ZW1wbGF0ZSwgZm9ybWF0LCBmb2xkZXIgfSA9IGdldFdlZWtseU5vdGVTZXR0aW5ncygpO1xuICAgIGNvbnN0IFt0ZW1wbGF0ZUNvbnRlbnRzLCBJRm9sZEluZm9dID0gYXdhaXQgZ2V0VGVtcGxhdGVJbmZvKHRlbXBsYXRlKTtcbiAgICBjb25zdCBmaWxlbmFtZSA9IGRhdGUuZm9ybWF0KGZvcm1hdCk7XG4gICAgY29uc3Qgbm9ybWFsaXplZFBhdGggPSBhd2FpdCBnZXROb3RlUGF0aChmb2xkZXIsIGZpbGVuYW1lKTtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBjcmVhdGVkRmlsZSA9IGF3YWl0IHZhdWx0LmNyZWF0ZShub3JtYWxpemVkUGF0aCwgdGVtcGxhdGVDb250ZW50c1xuICAgICAgICAgICAgLnJlcGxhY2UoL3t7XFxzKihkYXRlfHRpbWUpXFxzKigoWystXVxcZCspKFt5cW13ZGhzXSkpP1xccyooOi4rPyk/fX0vZ2ksIChfLCBfdGltZU9yRGF0ZSwgY2FsYywgdGltZURlbHRhLCB1bml0LCBtb21lbnRGb3JtYXQpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG5vdyA9IHdpbmRvdy5tb21lbnQoKTtcbiAgICAgICAgICAgIGNvbnN0IGN1cnJlbnREYXRlID0gZGF0ZS5jbG9uZSgpLnNldCh7XG4gICAgICAgICAgICAgICAgaG91cjogbm93LmdldChcImhvdXJcIiksXG4gICAgICAgICAgICAgICAgbWludXRlOiBub3cuZ2V0KFwibWludXRlXCIpLFxuICAgICAgICAgICAgICAgIHNlY29uZDogbm93LmdldChcInNlY29uZFwiKSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKGNhbGMpIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50RGF0ZS5hZGQocGFyc2VJbnQodGltZURlbHRhLCAxMCksIHVuaXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG1vbWVudEZvcm1hdCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBjdXJyZW50RGF0ZS5mb3JtYXQobW9tZW50Rm9ybWF0LnN1YnN0cmluZygxKS50cmltKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnREYXRlLmZvcm1hdChmb3JtYXQpO1xuICAgICAgICB9KVxuICAgICAgICAgICAgLnJlcGxhY2UoL3t7XFxzKnRpdGxlXFxzKn19L2dpLCBmaWxlbmFtZSlcbiAgICAgICAgICAgIC5yZXBsYWNlKC97e1xccyp0aW1lXFxzKn19L2dpLCB3aW5kb3cubW9tZW50KCkuZm9ybWF0KFwiSEg6bW1cIikpXG4gICAgICAgICAgICAucmVwbGFjZSgve3tcXHMqKHN1bmRheXxtb25kYXl8dHVlc2RheXx3ZWRuZXNkYXl8dGh1cnNkYXl8ZnJpZGF5fHNhdHVyZGF5KVxccyo6KC4qPyl9fS9naSwgKF8sIGRheU9mV2VlaywgbW9tZW50Rm9ybWF0KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBkYXkgPSBnZXREYXlPZldlZWtOdW1lcmljYWxWYWx1ZShkYXlPZldlZWspO1xuICAgICAgICAgICAgcmV0dXJuIGRhdGUud2Vla2RheShkYXkpLmZvcm1hdChtb21lbnRGb3JtYXQudHJpbSgpKTtcbiAgICAgICAgfSkpO1xuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuICAgICAgICB3aW5kb3cuYXBwLmZvbGRNYW5hZ2VyLnNhdmUoY3JlYXRlZEZpbGUsIElGb2xkSW5mbyk7XG4gICAgICAgIHJldHVybiBjcmVhdGVkRmlsZTtcbiAgICB9XG4gICAgY2F0Y2ggKGVycikge1xuICAgICAgICBjb25zb2xlLmVycm9yKGBGYWlsZWQgdG8gY3JlYXRlIGZpbGU6ICcke25vcm1hbGl6ZWRQYXRofSdgLCBlcnIpO1xuICAgICAgICBuZXcgb2JzaWRpYW4uTm90aWNlKFwiVW5hYmxlIHRvIGNyZWF0ZSBuZXcgZmlsZS5cIik7XG4gICAgfVxufVxuZnVuY3Rpb24gZ2V0V2Vla2x5Tm90ZShkYXRlLCB3ZWVrbHlOb3Rlcykge1xuICAgIHJldHVybiB3ZWVrbHlOb3Rlc1tnZXREYXRlVUlEKGRhdGUsIFwid2Vla1wiKV0gPz8gbnVsbDtcbn1cbmZ1bmN0aW9uIGdldEFsbFdlZWtseU5vdGVzKCkge1xuICAgIGNvbnN0IHdlZWtseU5vdGVzID0ge307XG4gICAgaWYgKCFhcHBIYXNXZWVrbHlOb3Rlc1BsdWdpbkxvYWRlZCgpKSB7XG4gICAgICAgIHJldHVybiB3ZWVrbHlOb3RlcztcbiAgICB9XG4gICAgY29uc3QgeyB2YXVsdCB9ID0gd2luZG93LmFwcDtcbiAgICBjb25zdCB7IGZvbGRlciB9ID0gZ2V0V2Vla2x5Tm90ZVNldHRpbmdzKCk7XG4gICAgY29uc3Qgd2Vla2x5Tm90ZXNGb2xkZXIgPSB2YXVsdC5nZXRBYnN0cmFjdEZpbGVCeVBhdGgob2JzaWRpYW4ubm9ybWFsaXplUGF0aChmb2xkZXIpKTtcbiAgICBpZiAoIXdlZWtseU5vdGVzRm9sZGVyKSB7XG4gICAgICAgIHRocm93IG5ldyBXZWVrbHlOb3Rlc0ZvbGRlck1pc3NpbmdFcnJvcihcIkZhaWxlZCB0byBmaW5kIHdlZWtseSBub3RlcyBmb2xkZXJcIik7XG4gICAgfVxuICAgIG9ic2lkaWFuLlZhdWx0LnJlY3Vyc2VDaGlsZHJlbih3ZWVrbHlOb3Rlc0ZvbGRlciwgKG5vdGUpID0+IHtcbiAgICAgICAgaWYgKG5vdGUgaW5zdGFuY2VvZiBvYnNpZGlhbi5URmlsZSkge1xuICAgICAgICAgICAgY29uc3QgZGF0ZSA9IGdldERhdGVGcm9tRmlsZShub3RlLCBcIndlZWtcIik7XG4gICAgICAgICAgICBpZiAoZGF0ZSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGRhdGVTdHJpbmcgPSBnZXREYXRlVUlEKGRhdGUsIFwid2Vla1wiKTtcbiAgICAgICAgICAgICAgICB3ZWVrbHlOb3Rlc1tkYXRlU3RyaW5nXSA9IG5vdGU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gd2Vla2x5Tm90ZXM7XG59XG5cbmNsYXNzIE1vbnRobHlOb3Rlc0ZvbGRlck1pc3NpbmdFcnJvciBleHRlbmRzIEVycm9yIHtcbn1cbi8qKlxuICogVGhpcyBmdW5jdGlvbiBtaW1pY3MgdGhlIGJlaGF2aW9yIG9mIHRoZSBkYWlseS1ub3RlcyBwbHVnaW5cbiAqIHNvIGl0IHdpbGwgcmVwbGFjZSB7e2RhdGV9fSwge3t0aXRsZX19LCBhbmQge3t0aW1lfX0gd2l0aCB0aGVcbiAqIGZvcm1hdHRlZCB0aW1lc3RhbXAuXG4gKlxuICogTm90ZTogaXQgaGFzIGFuIGFkZGVkIGJvbnVzIHRoYXQgaXQncyBub3QgJ3RvZGF5JyBzcGVjaWZpYy5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gY3JlYXRlTW9udGhseU5vdGUoZGF0ZSkge1xuICAgIGNvbnN0IHsgdmF1bHQgfSA9IHdpbmRvdy5hcHA7XG4gICAgY29uc3QgeyB0ZW1wbGF0ZSwgZm9ybWF0LCBmb2xkZXIgfSA9IGdldE1vbnRobHlOb3RlU2V0dGluZ3MoKTtcbiAgICBjb25zdCBbdGVtcGxhdGVDb250ZW50cywgSUZvbGRJbmZvXSA9IGF3YWl0IGdldFRlbXBsYXRlSW5mbyh0ZW1wbGF0ZSk7XG4gICAgY29uc3QgZmlsZW5hbWUgPSBkYXRlLmZvcm1hdChmb3JtYXQpO1xuICAgIGNvbnN0IG5vcm1hbGl6ZWRQYXRoID0gYXdhaXQgZ2V0Tm90ZVBhdGgoZm9sZGVyLCBmaWxlbmFtZSk7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgY3JlYXRlZEZpbGUgPSBhd2FpdCB2YXVsdC5jcmVhdGUobm9ybWFsaXplZFBhdGgsIHRlbXBsYXRlQ29udGVudHNcbiAgICAgICAgICAgIC5yZXBsYWNlKC97e1xccyooZGF0ZXx0aW1lKVxccyooKFsrLV1cXGQrKShbeXFtd2Roc10pKT9cXHMqKDouKz8pP319L2dpLCAoXywgX3RpbWVPckRhdGUsIGNhbGMsIHRpbWVEZWx0YSwgdW5pdCwgbW9tZW50Rm9ybWF0KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBub3cgPSB3aW5kb3cubW9tZW50KCk7XG4gICAgICAgICAgICBjb25zdCBjdXJyZW50RGF0ZSA9IGRhdGUuY2xvbmUoKS5zZXQoe1xuICAgICAgICAgICAgICAgIGhvdXI6IG5vdy5nZXQoXCJob3VyXCIpLFxuICAgICAgICAgICAgICAgIG1pbnV0ZTogbm93LmdldChcIm1pbnV0ZVwiKSxcbiAgICAgICAgICAgICAgICBzZWNvbmQ6IG5vdy5nZXQoXCJzZWNvbmRcIiksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmIChjYWxjKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudERhdGUuYWRkKHBhcnNlSW50KHRpbWVEZWx0YSwgMTApLCB1bml0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChtb21lbnRGb3JtYXQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY3VycmVudERhdGUuZm9ybWF0KG1vbWVudEZvcm1hdC5zdWJzdHJpbmcoMSkudHJpbSgpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBjdXJyZW50RGF0ZS5mb3JtYXQoZm9ybWF0KTtcbiAgICAgICAgfSlcbiAgICAgICAgICAgIC5yZXBsYWNlKC97e1xccypkYXRlXFxzKn19L2dpLCBmaWxlbmFtZSlcbiAgICAgICAgICAgIC5yZXBsYWNlKC97e1xccyp0aW1lXFxzKn19L2dpLCB3aW5kb3cubW9tZW50KCkuZm9ybWF0KFwiSEg6bW1cIikpXG4gICAgICAgICAgICAucmVwbGFjZSgve3tcXHMqdGl0bGVcXHMqfX0vZ2ksIGZpbGVuYW1lKSk7XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG4gICAgICAgIHdpbmRvdy5hcHAuZm9sZE1hbmFnZXIuc2F2ZShjcmVhdGVkRmlsZSwgSUZvbGRJbmZvKTtcbiAgICAgICAgcmV0dXJuIGNyZWF0ZWRGaWxlO1xuICAgIH1cbiAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYEZhaWxlZCB0byBjcmVhdGUgZmlsZTogJyR7bm9ybWFsaXplZFBhdGh9J2AsIGVycik7XG4gICAgICAgIG5ldyBvYnNpZGlhbi5Ob3RpY2UoXCJVbmFibGUgdG8gY3JlYXRlIG5ldyBmaWxlLlwiKTtcbiAgICB9XG59XG5mdW5jdGlvbiBnZXRNb250aGx5Tm90ZShkYXRlLCBtb250aGx5Tm90ZXMpIHtcbiAgICByZXR1cm4gbW9udGhseU5vdGVzW2dldERhdGVVSUQoZGF0ZSwgXCJtb250aFwiKV0gPz8gbnVsbDtcbn1cbmZ1bmN0aW9uIGdldEFsbE1vbnRobHlOb3RlcygpIHtcbiAgICBjb25zdCBtb250aGx5Tm90ZXMgPSB7fTtcbiAgICBpZiAoIWFwcEhhc01vbnRobHlOb3Rlc1BsdWdpbkxvYWRlZCgpKSB7XG4gICAgICAgIHJldHVybiBtb250aGx5Tm90ZXM7XG4gICAgfVxuICAgIGNvbnN0IHsgdmF1bHQgfSA9IHdpbmRvdy5hcHA7XG4gICAgY29uc3QgeyBmb2xkZXIgfSA9IGdldE1vbnRobHlOb3RlU2V0dGluZ3MoKTtcbiAgICBjb25zdCBtb250aGx5Tm90ZXNGb2xkZXIgPSB2YXVsdC5nZXRBYnN0cmFjdEZpbGVCeVBhdGgob2JzaWRpYW4ubm9ybWFsaXplUGF0aChmb2xkZXIpKTtcbiAgICBpZiAoIW1vbnRobHlOb3Rlc0ZvbGRlcikge1xuICAgICAgICB0aHJvdyBuZXcgTW9udGhseU5vdGVzRm9sZGVyTWlzc2luZ0Vycm9yKFwiRmFpbGVkIHRvIGZpbmQgbW9udGhseSBub3RlcyBmb2xkZXJcIik7XG4gICAgfVxuICAgIG9ic2lkaWFuLlZhdWx0LnJlY3Vyc2VDaGlsZHJlbihtb250aGx5Tm90ZXNGb2xkZXIsIChub3RlKSA9PiB7XG4gICAgICAgIGlmIChub3RlIGluc3RhbmNlb2Ygb2JzaWRpYW4uVEZpbGUpIHtcbiAgICAgICAgICAgIGNvbnN0IGRhdGUgPSBnZXREYXRlRnJvbUZpbGUobm90ZSwgXCJtb250aFwiKTtcbiAgICAgICAgICAgIGlmIChkYXRlKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZGF0ZVN0cmluZyA9IGdldERhdGVVSUQoZGF0ZSwgXCJtb250aFwiKTtcbiAgICAgICAgICAgICAgICBtb250aGx5Tm90ZXNbZGF0ZVN0cmluZ10gPSBub3RlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIG1vbnRobHlOb3Rlcztcbn1cblxuZnVuY3Rpb24gYXBwSGFzRGFpbHlOb3Rlc1BsdWdpbkxvYWRlZCgpIHtcbiAgICBjb25zdCB7IGFwcCB9ID0gd2luZG93O1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG4gICAgY29uc3QgZGFpbHlOb3Rlc1BsdWdpbiA9IGFwcC5pbnRlcm5hbFBsdWdpbnMucGx1Z2luc1tcImRhaWx5LW5vdGVzXCJdO1xuICAgIGlmIChkYWlseU5vdGVzUGx1Z2luICYmIGRhaWx5Tm90ZXNQbHVnaW4uZW5hYmxlZCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcbiAgICBjb25zdCBwZXJpb2RpY05vdGVzID0gYXBwLnBsdWdpbnMuZ2V0UGx1Z2luKFwicGVyaW9kaWMtbm90ZXNcIik7XG4gICAgcmV0dXJuIHBlcmlvZGljTm90ZXMgJiYgcGVyaW9kaWNOb3Rlcy5zZXR0aW5ncz8uZGFpbHk/LmVuYWJsZWQ7XG59XG4vKipcbiAqIFhYWDogXCJXZWVrbHkgTm90ZXNcIiBsaXZlIGluIGVpdGhlciB0aGUgQ2FsZW5kYXIgcGx1Z2luIG9yIHRoZSBwZXJpb2RpYy1ub3RlcyBwbHVnaW4uXG4gKiBDaGVjayBib3RoIHVudGlsIHRoZSB3ZWVrbHkgbm90ZXMgZmVhdHVyZSBpcyByZW1vdmVkIGZyb20gdGhlIENhbGVuZGFyIHBsdWdpbi5cbiAqL1xuZnVuY3Rpb24gYXBwSGFzV2Vla2x5Tm90ZXNQbHVnaW5Mb2FkZWQoKSB7XG4gICAgY29uc3QgeyBhcHAgfSA9IHdpbmRvdztcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuICAgIGlmIChhcHAucGx1Z2lucy5nZXRQbHVnaW4oXCJjYWxlbmRhclwiKSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcbiAgICBjb25zdCBwZXJpb2RpY05vdGVzID0gYXBwLnBsdWdpbnMuZ2V0UGx1Z2luKFwicGVyaW9kaWMtbm90ZXNcIik7XG4gICAgcmV0dXJuIHBlcmlvZGljTm90ZXMgJiYgcGVyaW9kaWNOb3Rlcy5zZXR0aW5ncz8ud2Vla2x5Py5lbmFibGVkO1xufVxuZnVuY3Rpb24gYXBwSGFzTW9udGhseU5vdGVzUGx1Z2luTG9hZGVkKCkge1xuICAgIGNvbnN0IHsgYXBwIH0gPSB3aW5kb3c7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcbiAgICBjb25zdCBwZXJpb2RpY05vdGVzID0gYXBwLnBsdWdpbnMuZ2V0UGx1Z2luKFwicGVyaW9kaWMtbm90ZXNcIik7XG4gICAgcmV0dXJuIHBlcmlvZGljTm90ZXMgJiYgcGVyaW9kaWNOb3Rlcy5zZXR0aW5ncz8ubW9udGhseT8uZW5hYmxlZDtcbn1cbmZ1bmN0aW9uIGdldFBlcmlvZGljTm90ZVNldHRpbmdzKGdyYW51bGFyaXR5KSB7XG4gICAgY29uc3QgZ2V0U2V0dGluZ3MgPSB7XG4gICAgICAgIGRheTogZ2V0RGFpbHlOb3RlU2V0dGluZ3MsXG4gICAgICAgIHdlZWs6IGdldFdlZWtseU5vdGVTZXR0aW5ncyxcbiAgICAgICAgbW9udGg6IGdldE1vbnRobHlOb3RlU2V0dGluZ3MsXG4gICAgfVtncmFudWxhcml0eV07XG4gICAgcmV0dXJuIGdldFNldHRpbmdzKCk7XG59XG5mdW5jdGlvbiBjcmVhdGVQZXJpb2RpY05vdGUoZ3JhbnVsYXJpdHksIGRhdGUpIHtcbiAgICBjb25zdCBjcmVhdGVGbiA9IHtcbiAgICAgICAgZGF5OiBjcmVhdGVEYWlseU5vdGUsXG4gICAgICAgIG1vbnRoOiBjcmVhdGVNb250aGx5Tm90ZSxcbiAgICAgICAgd2VlazogY3JlYXRlV2Vla2x5Tm90ZSxcbiAgICB9O1xuICAgIHJldHVybiBjcmVhdGVGbltncmFudWxhcml0eV0oZGF0ZSk7XG59XG5cbmV4cG9ydHMuREVGQVVMVF9EQUlMWV9OT1RFX0ZPUk1BVCA9IERFRkFVTFRfREFJTFlfTk9URV9GT1JNQVQ7XG5leHBvcnRzLkRFRkFVTFRfTU9OVEhMWV9OT1RFX0ZPUk1BVCA9IERFRkFVTFRfTU9OVEhMWV9OT1RFX0ZPUk1BVDtcbmV4cG9ydHMuREVGQVVMVF9XRUVLTFlfTk9URV9GT1JNQVQgPSBERUZBVUxUX1dFRUtMWV9OT1RFX0ZPUk1BVDtcbmV4cG9ydHMuYXBwSGFzRGFpbHlOb3Rlc1BsdWdpbkxvYWRlZCA9IGFwcEhhc0RhaWx5Tm90ZXNQbHVnaW5Mb2FkZWQ7XG5leHBvcnRzLmFwcEhhc01vbnRobHlOb3Rlc1BsdWdpbkxvYWRlZCA9IGFwcEhhc01vbnRobHlOb3Rlc1BsdWdpbkxvYWRlZDtcbmV4cG9ydHMuYXBwSGFzV2Vla2x5Tm90ZXNQbHVnaW5Mb2FkZWQgPSBhcHBIYXNXZWVrbHlOb3Rlc1BsdWdpbkxvYWRlZDtcbmV4cG9ydHMuY3JlYXRlRGFpbHlOb3RlID0gY3JlYXRlRGFpbHlOb3RlO1xuZXhwb3J0cy5jcmVhdGVNb250aGx5Tm90ZSA9IGNyZWF0ZU1vbnRobHlOb3RlO1xuZXhwb3J0cy5jcmVhdGVQZXJpb2RpY05vdGUgPSBjcmVhdGVQZXJpb2RpY05vdGU7XG5leHBvcnRzLmNyZWF0ZVdlZWtseU5vdGUgPSBjcmVhdGVXZWVrbHlOb3RlO1xuZXhwb3J0cy5nZXRBbGxEYWlseU5vdGVzID0gZ2V0QWxsRGFpbHlOb3RlcztcbmV4cG9ydHMuZ2V0QWxsTW9udGhseU5vdGVzID0gZ2V0QWxsTW9udGhseU5vdGVzO1xuZXhwb3J0cy5nZXRBbGxXZWVrbHlOb3RlcyA9IGdldEFsbFdlZWtseU5vdGVzO1xuZXhwb3J0cy5nZXREYWlseU5vdGUgPSBnZXREYWlseU5vdGU7XG5leHBvcnRzLmdldERhaWx5Tm90ZVNldHRpbmdzID0gZ2V0RGFpbHlOb3RlU2V0dGluZ3M7XG5leHBvcnRzLmdldERhdGVGcm9tRmlsZSA9IGdldERhdGVGcm9tRmlsZTtcbmV4cG9ydHMuZ2V0RGF0ZUZyb21QYXRoID0gZ2V0RGF0ZUZyb21QYXRoO1xuZXhwb3J0cy5nZXREYXRlVUlEID0gZ2V0RGF0ZVVJRDtcbmV4cG9ydHMuZ2V0TW9udGhseU5vdGUgPSBnZXRNb250aGx5Tm90ZTtcbmV4cG9ydHMuZ2V0TW9udGhseU5vdGVTZXR0aW5ncyA9IGdldE1vbnRobHlOb3RlU2V0dGluZ3M7XG5leHBvcnRzLmdldFBlcmlvZGljTm90ZVNldHRpbmdzID0gZ2V0UGVyaW9kaWNOb3RlU2V0dGluZ3M7XG5leHBvcnRzLmdldFRlbXBsYXRlSW5mbyA9IGdldFRlbXBsYXRlSW5mbztcbmV4cG9ydHMuZ2V0V2Vla2x5Tm90ZSA9IGdldFdlZWtseU5vdGU7XG5leHBvcnRzLmdldFdlZWtseU5vdGVTZXR0aW5ncyA9IGdldFdlZWtseU5vdGVTZXR0aW5ncztcbiIsIi8vIFVuaXF1ZSBJRCBjcmVhdGlvbiByZXF1aXJlcyBhIGhpZ2ggcXVhbGl0eSByYW5kb20gIyBnZW5lcmF0b3IuIEluIHRoZSBicm93c2VyIHdlIHRoZXJlZm9yZVxuLy8gcmVxdWlyZSB0aGUgY3J5cHRvIEFQSSBhbmQgZG8gbm90IHN1cHBvcnQgYnVpbHQtaW4gZmFsbGJhY2sgdG8gbG93ZXIgcXVhbGl0eSByYW5kb20gbnVtYmVyXG4vLyBnZW5lcmF0b3JzIChsaWtlIE1hdGgucmFuZG9tKCkpLlxudmFyIGdldFJhbmRvbVZhbHVlcztcbnZhciBybmRzOCA9IG5ldyBVaW50OEFycmF5KDE2KTtcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHJuZygpIHtcbiAgLy8gbGF6eSBsb2FkIHNvIHRoYXQgZW52aXJvbm1lbnRzIHRoYXQgbmVlZCB0byBwb2x5ZmlsbCBoYXZlIGEgY2hhbmNlIHRvIGRvIHNvXG4gIGlmICghZ2V0UmFuZG9tVmFsdWVzKSB7XG4gICAgLy8gZ2V0UmFuZG9tVmFsdWVzIG5lZWRzIHRvIGJlIGludm9rZWQgaW4gYSBjb250ZXh0IHdoZXJlIFwidGhpc1wiIGlzIGEgQ3J5cHRvIGltcGxlbWVudGF0aW9uLiBBbHNvLFxuICAgIC8vIGZpbmQgdGhlIGNvbXBsZXRlIGltcGxlbWVudGF0aW9uIG9mIGNyeXB0byAobXNDcnlwdG8pIG9uIElFMTEuXG4gICAgZ2V0UmFuZG9tVmFsdWVzID0gdHlwZW9mIGNyeXB0byAhPT0gJ3VuZGVmaW5lZCcgJiYgY3J5cHRvLmdldFJhbmRvbVZhbHVlcyAmJiBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzLmJpbmQoY3J5cHRvKSB8fCB0eXBlb2YgbXNDcnlwdG8gIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBtc0NyeXB0by5nZXRSYW5kb21WYWx1ZXMgPT09ICdmdW5jdGlvbicgJiYgbXNDcnlwdG8uZ2V0UmFuZG9tVmFsdWVzLmJpbmQobXNDcnlwdG8pO1xuXG4gICAgaWYgKCFnZXRSYW5kb21WYWx1ZXMpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignY3J5cHRvLmdldFJhbmRvbVZhbHVlcygpIG5vdCBzdXBwb3J0ZWQuIFNlZSBodHRwczovL2dpdGh1Yi5jb20vdXVpZGpzL3V1aWQjZ2V0cmFuZG9tdmFsdWVzLW5vdC1zdXBwb3J0ZWQnKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gZ2V0UmFuZG9tVmFsdWVzKHJuZHM4KTtcbn0iLCJleHBvcnQgZGVmYXVsdCAvXig/OlswLTlhLWZdezh9LVswLTlhLWZdezR9LVsxLTVdWzAtOWEtZl17M30tWzg5YWJdWzAtOWEtZl17M30tWzAtOWEtZl17MTJ9fDAwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMCkkL2k7IiwiaW1wb3J0IFJFR0VYIGZyb20gJy4vcmVnZXguanMnO1xuXG5mdW5jdGlvbiB2YWxpZGF0ZSh1dWlkKSB7XG4gIHJldHVybiB0eXBlb2YgdXVpZCA9PT0gJ3N0cmluZycgJiYgUkVHRVgudGVzdCh1dWlkKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgdmFsaWRhdGU7IiwiaW1wb3J0IHZhbGlkYXRlIGZyb20gJy4vdmFsaWRhdGUuanMnO1xuLyoqXG4gKiBDb252ZXJ0IGFycmF5IG9mIDE2IGJ5dGUgdmFsdWVzIHRvIFVVSUQgc3RyaW5nIGZvcm1hdCBvZiB0aGUgZm9ybTpcbiAqIFhYWFhYWFhYLVhYWFgtWFhYWC1YWFhYLVhYWFhYWFhYWFhYWFxuICovXG5cbnZhciBieXRlVG9IZXggPSBbXTtcblxuZm9yICh2YXIgaSA9IDA7IGkgPCAyNTY7ICsraSkge1xuICBieXRlVG9IZXgucHVzaCgoaSArIDB4MTAwKS50b1N0cmluZygxNikuc3Vic3RyKDEpKTtcbn1cblxuZnVuY3Rpb24gc3RyaW5naWZ5KGFycikge1xuICB2YXIgb2Zmc2V0ID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiAwO1xuICAvLyBOb3RlOiBCZSBjYXJlZnVsIGVkaXRpbmcgdGhpcyBjb2RlISAgSXQncyBiZWVuIHR1bmVkIGZvciBwZXJmb3JtYW5jZVxuICAvLyBhbmQgd29ya3MgaW4gd2F5cyB5b3UgbWF5IG5vdCBleHBlY3QuIFNlZSBodHRwczovL2dpdGh1Yi5jb20vdXVpZGpzL3V1aWQvcHVsbC80MzRcbiAgdmFyIHV1aWQgPSAoYnl0ZVRvSGV4W2FycltvZmZzZXQgKyAwXV0gKyBieXRlVG9IZXhbYXJyW29mZnNldCArIDFdXSArIGJ5dGVUb0hleFthcnJbb2Zmc2V0ICsgMl1dICsgYnl0ZVRvSGV4W2FycltvZmZzZXQgKyAzXV0gKyAnLScgKyBieXRlVG9IZXhbYXJyW29mZnNldCArIDRdXSArIGJ5dGVUb0hleFthcnJbb2Zmc2V0ICsgNV1dICsgJy0nICsgYnl0ZVRvSGV4W2FycltvZmZzZXQgKyA2XV0gKyBieXRlVG9IZXhbYXJyW29mZnNldCArIDddXSArICctJyArIGJ5dGVUb0hleFthcnJbb2Zmc2V0ICsgOF1dICsgYnl0ZVRvSGV4W2FycltvZmZzZXQgKyA5XV0gKyAnLScgKyBieXRlVG9IZXhbYXJyW29mZnNldCArIDEwXV0gKyBieXRlVG9IZXhbYXJyW29mZnNldCArIDExXV0gKyBieXRlVG9IZXhbYXJyW29mZnNldCArIDEyXV0gKyBieXRlVG9IZXhbYXJyW29mZnNldCArIDEzXV0gKyBieXRlVG9IZXhbYXJyW29mZnNldCArIDE0XV0gKyBieXRlVG9IZXhbYXJyW29mZnNldCArIDE1XV0pLnRvTG93ZXJDYXNlKCk7IC8vIENvbnNpc3RlbmN5IGNoZWNrIGZvciB2YWxpZCBVVUlELiAgSWYgdGhpcyB0aHJvd3MsIGl0J3MgbGlrZWx5IGR1ZSB0byBvbmVcbiAgLy8gb2YgdGhlIGZvbGxvd2luZzpcbiAgLy8gLSBPbmUgb3IgbW9yZSBpbnB1dCBhcnJheSB2YWx1ZXMgZG9uJ3QgbWFwIHRvIGEgaGV4IG9jdGV0IChsZWFkaW5nIHRvXG4gIC8vIFwidW5kZWZpbmVkXCIgaW4gdGhlIHV1aWQpXG4gIC8vIC0gSW52YWxpZCBpbnB1dCB2YWx1ZXMgZm9yIHRoZSBSRkMgYHZlcnNpb25gIG9yIGB2YXJpYW50YCBmaWVsZHNcblxuICBpZiAoIXZhbGlkYXRlKHV1aWQpKSB7XG4gICAgdGhyb3cgVHlwZUVycm9yKCdTdHJpbmdpZmllZCBVVUlEIGlzIGludmFsaWQnKTtcbiAgfVxuXG4gIHJldHVybiB1dWlkO1xufVxuXG5leHBvcnQgZGVmYXVsdCBzdHJpbmdpZnk7IiwiaW1wb3J0IHJuZyBmcm9tICcuL3JuZy5qcyc7XG5pbXBvcnQgc3RyaW5naWZ5IGZyb20gJy4vc3RyaW5naWZ5LmpzJztcblxuZnVuY3Rpb24gdjQob3B0aW9ucywgYnVmLCBvZmZzZXQpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIHZhciBybmRzID0gb3B0aW9ucy5yYW5kb20gfHwgKG9wdGlvbnMucm5nIHx8IHJuZykoKTsgLy8gUGVyIDQuNCwgc2V0IGJpdHMgZm9yIHZlcnNpb24gYW5kIGBjbG9ja19zZXFfaGlfYW5kX3Jlc2VydmVkYFxuXG4gIHJuZHNbNl0gPSBybmRzWzZdICYgMHgwZiB8IDB4NDA7XG4gIHJuZHNbOF0gPSBybmRzWzhdICYgMHgzZiB8IDB4ODA7IC8vIENvcHkgYnl0ZXMgdG8gYnVmZmVyLCBpZiBwcm92aWRlZFxuXG4gIGlmIChidWYpIHtcbiAgICBvZmZzZXQgPSBvZmZzZXQgfHwgMDtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMTY7ICsraSkge1xuICAgICAgYnVmW29mZnNldCArIGldID0gcm5kc1tpXTtcbiAgICB9XG5cbiAgICByZXR1cm4gYnVmO1xuICB9XG5cbiAgcmV0dXJuIHN0cmluZ2lmeShybmRzKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgdjQ7IiwiaW1wb3J0IHsgQXBwLCBDb21tYW5kLCBGdXp6eVN1Z2dlc3RNb2RhbCwgTWFya2Rvd25WaWV3LCBub3JtYWxpemVQYXRoLCBOb3RpY2UsIHBhcnNlRnJvbnRNYXR0ZXJFbnRyeSwgUGx1Z2luLCBQbHVnaW5TZXR0aW5nVGFiLCBTZXR0aW5nLCBTdWdnZXN0TW9kYWwsIFRGaWxlIH0gZnJvbSBcIm9ic2lkaWFuXCI7XG5pbXBvcnQgeyBhcHBIYXNEYWlseU5vdGVzUGx1Z2luTG9hZGVkLCBjcmVhdGVEYWlseU5vdGUsIGdldEFsbERhaWx5Tm90ZXMsIGdldERhaWx5Tm90ZSB9IGZyb20gXCJvYnNpZGlhbi1kYWlseS1ub3Rlcy1pbnRlcmZhY2VcIjtcbmltcG9ydCB7IHY0IGFzIHV1aWR2NCB9IGZyb20gJ3V1aWQnO1xuY29uc3QgREVGQVVMVF9TRVRUSU5HUzogQWR2YW5jZWRVUklTZXR0aW5ncyA9IHtcbiAgICBvcGVuRmlsZU9uV3JpdGU6IHRydWUsXG4gICAgb3BlbkRhaWx5SW5OZXdQYW5lOiBmYWxzZSxcbiAgICBvcGVuRmlsZU9uV3JpdGVJbk5ld1BhbmU6IGZhbHNlLFxuICAgIG9wZW5GaWxlV2l0aG91dFdyaXRlSW5OZXdQYW5lOiBmYWxzZSxcbiAgICBpZEZpZWxkOiBcImlkXCIsXG4gICAgdXNlVUlEOiBmYWxzZSxcbn07XG5cbmludGVyZmFjZSBBZHZhbmNlZFVSSVNldHRpbmdzIHtcbiAgICBvcGVuRmlsZU9uV3JpdGU6IGJvb2xlYW47XG4gICAgb3BlbkZpbGVPbldyaXRlSW5OZXdQYW5lOiBib29sZWFuO1xuICAgIG9wZW5EYWlseUluTmV3UGFuZTogYm9vbGVhbjtcbiAgICBvcGVuRmlsZVdpdGhvdXRXcml0ZUluTmV3UGFuZTogYm9vbGVhbjtcbiAgICBpZEZpZWxkOiBzdHJpbmc7XG4gICAgdXNlVUlEOiBib29sZWFuO1xufVxuXG5pbnRlcmZhY2UgUGFyYW1ldGVycyB7XG4gICAgd29ya3NwYWNlPzogc3RyaW5nO1xuICAgIGZpbGVwYXRoPzogc3RyaW5nO1xuICAgIGRhaWx5PzogXCJ0cnVlXCI7XG4gICAgZGF0YT86IHN0cmluZztcbiAgICBtb2RlPzogXCJvdmVyd3JpdGVcIiB8IFwiYXBwZW5kXCIgfCBcInByZXBlbmRcIjtcbiAgICBoZWFkaW5nPzogc3RyaW5nO1xuICAgIGJsb2NrPzogc3RyaW5nO1xuICAgIGNvbW1hbmRuYW1lPzogc3RyaW5nLFxuICAgIGNvbW1hbmRpZD86IHN0cmluZyxcbiAgICBzZWFyY2g/OiBzdHJpbmcsXG4gICAgc2VhcmNocmVnZXg/OiBzdHJpbmc7XG4gICAgcmVwbGFjZT86IHN0cmluZztcbiAgICB1aWQ/OiBzdHJpbmc7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFkdmFuY2VkVVJJIGV4dGVuZHMgUGx1Z2luIHtcbiAgICBzZXR0aW5nczogQWR2YW5jZWRVUklTZXR0aW5ncztcblxuICAgIGFzeW5jIG9ubG9hZCgpIHtcbiAgICAgICAgYXdhaXQgdGhpcy5sb2FkU2V0dGluZ3MoKTtcbiAgICAgICAgdGhpcy5hZGRTZXR0aW5nVGFiKG5ldyBTZXR0aW5nc1RhYih0aGlzLmFwcCwgdGhpcykpO1xuXG5cbiAgICAgICAgdGhpcy5hZGRDb21tYW5kKHtcbiAgICAgICAgICAgIGlkOiBcImNvcHktdXJpLWN1cnJlbnQtZmlsZVwiLFxuICAgICAgICAgICAgbmFtZTogXCJjb3B5IFVSSSBmb3IgZmlsZVwiLFxuICAgICAgICAgICAgY2FsbGJhY2s6ICgpID0+IHRoaXMuaGFuZGxlQ29weUZpbGVVUkkoKVxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmFkZENvbW1hbmQoe1xuICAgICAgICAgICAgaWQ6IFwiY29weS11cmktZGFpbHlcIixcbiAgICAgICAgICAgIG5hbWU6IFwiY29weSBVUkkgZm9yIGRhaWx5IG5vdGVcIixcbiAgICAgICAgICAgIGNhbGxiYWNrOiAoKSA9PiBuZXcgRW50ZXJEYXRhTW9kYWwodGhpcykub3BlbigpXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuYWRkQ29tbWFuZCh7XG4gICAgICAgICAgICBpZDogXCJjb3B5LXVyaS1zZWFyY2gtYW5kLXJlcGxhY2VcIixcbiAgICAgICAgICAgIG5hbWU6IFwiY29weSBVUkkgZm9yIHNlYXJjaCBhbmQgcmVwbGFjZVwiLFxuICAgICAgICAgICAgY2FsbGJhY2s6ICgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBmaWxlTW9kYWwgPSBuZXcgRmlsZU1vZGFsKHRoaXMsIFwiVXNlZCBmaWxlIGZvciBzZWFyY2ggYW5kIHJlcGxhY2VcIik7XG4gICAgICAgICAgICAgICAgZmlsZU1vZGFsLm9wZW4oKTtcbiAgICAgICAgICAgICAgICBmaWxlTW9kYWwub25DaG9vc2VJdGVtID0gKGZpbGVQYXRoOiBGaWxlTW9kYWxEYXRhKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHNlYXJjaE1vZGFsID0gbmV3IFNlYXJjaE1vZGFsKHRoaXMpO1xuICAgICAgICAgICAgICAgICAgICBzZWFyY2hNb2RhbC5vcGVuKCk7XG4gICAgICAgICAgICAgICAgICAgIHNlYXJjaE1vZGFsLm9uQ2hvb3NlU3VnZ2VzdGlvbiA9IChpdGVtOiBTZWFyY2hNb2RhbERhdGEpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBSZXBsYWNlTW9kYWwodGhpcywgaXRlbSwgZmlsZVBhdGg/LnNvdXJjZSkub3BlbigpO1xuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmFkZENvbW1hbmQoe1xuICAgICAgICAgICAgaWQ6IFwiY29weS11cmktY29tbWFuZFwiLFxuICAgICAgICAgICAgbmFtZTogXCJjb3B5IFVSSSBmb3IgY29tbWFuZFwiLFxuICAgICAgICAgICAgY2FsbGJhY2s6ICgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBmaWxlTW9kYWwgPSBuZXcgRmlsZU1vZGFsKHRoaXMsIFwiU2VsZWN0IGEgZmlsZSB0byBiZSBvcGVuZWQgYmVmb3JlIGV4ZWN1dGluZyB0aGUgY29tbWFuZFwiKTtcbiAgICAgICAgICAgICAgICBmaWxlTW9kYWwub3BlbigpO1xuICAgICAgICAgICAgICAgIGZpbGVNb2RhbC5vbkNob29zZUl0ZW0gPSAoaXRlbTogRmlsZU1vZGFsRGF0YSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBuZXcgQ29tbWFuZE1vZGFsKHRoaXMsIGl0ZW0/LnNvdXJjZSkub3BlbigpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG5cbiAgICAgICAgdGhpcy5yZWdpc3Rlck9ic2lkaWFuUHJvdG9jb2xIYW5kbGVyKFwiYWR2YW5jZWQtdXJpXCIsIGFzeW5jIChlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwYXJhbWV0ZXJzID0gZSBhcyB1bmtub3duIGFzIFBhcmFtZXRlcnM7XG5cbiAgICAgICAgICAgIGZvciAoY29uc3QgcGFyYW1ldGVyIGluIHBhcmFtZXRlcnMpIHtcbiAgICAgICAgICAgICAgICAocGFyYW1ldGVycyBhcyBhbnkpW3BhcmFtZXRlcl0gPSBkZWNvZGVVUklDb21wb25lbnQoKHBhcmFtZXRlcnMgYXMgYW55KVtwYXJhbWV0ZXJdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChwYXJhbWV0ZXJzLnVpZCkge1xuICAgICAgICAgICAgICAgIHBhcmFtZXRlcnMuZmlsZXBhdGggPSB0aGlzLmdldEZpbGVGcm9tVUlEKHBhcmFtZXRlcnMudWlkKT8ucGF0aDtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhwYXJhbWV0ZXJzLmZpbGVwYXRoKTtcblxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAocGFyYW1ldGVycy5maWxlcGF0aCkge1xuICAgICAgICAgICAgICAgIHBhcmFtZXRlcnMuZmlsZXBhdGggPSBub3JtYWxpemVQYXRoKHBhcmFtZXRlcnMuZmlsZXBhdGgpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGluZGV4ID0gcGFyYW1ldGVycy5maWxlcGF0aC5sYXN0SW5kZXhPZihcIi5cIik7XG4gICAgICAgICAgICAgICAgY29uc3QgZXh0ZW5zaW9uID0gcGFyYW1ldGVycy5maWxlcGF0aC5zdWJzdHJpbmcoaW5kZXggPCAwID8gcGFyYW1ldGVycy5maWxlcGF0aC5sZW5ndGggOiBpbmRleCk7XG5cbiAgICAgICAgICAgICAgICBpZiAoZXh0ZW5zaW9uID09PSBcIlwiKSB7XG4gICAgICAgICAgICAgICAgICAgIHBhcmFtZXRlcnMuZmlsZXBhdGggPSBwYXJhbWV0ZXJzLmZpbGVwYXRoICsgXCIubWRcIjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChwYXJhbWV0ZXJzLndvcmtzcGFjZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuaGFuZGxlV29ya3NwYWNlKHBhcmFtZXRlcnMud29ya3NwYWNlKTtcblxuICAgICAgICAgICAgfSBlbHNlIGlmIChwYXJhbWV0ZXJzLmNvbW1hbmRuYW1lIHx8IHBhcmFtZXRlcnMuY29tbWFuZGlkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5oYW5kbGVDb21tYW5kKHBhcmFtZXRlcnMpO1xuXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHBhcmFtZXRlcnMuZmlsZXBhdGggJiYgcGFyYW1ldGVycy5kYXRhKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5oYW5kbGVXcml0ZShwYXJhbWV0ZXJzKTtcblxuICAgICAgICAgICAgfSBlbHNlIGlmIChwYXJhbWV0ZXJzLmRhaWx5ID09PSBcInRydWVcIikge1xuICAgICAgICAgICAgICAgIHRoaXMuaGFuZGxlRGFpbHlOb3RlKHBhcmFtZXRlcnMpO1xuXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHBhcmFtZXRlcnMuZmlsZXBhdGggJiYgcGFyYW1ldGVycy5oZWFkaW5nKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hcHAud29ya3NwYWNlLm9wZW5MaW5rVGV4dChwYXJhbWV0ZXJzLmZpbGVwYXRoICsgXCIjXCIgKyBwYXJhbWV0ZXJzLmhlYWRpbmcsIFwiXCIpO1xuXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHBhcmFtZXRlcnMuZmlsZXBhdGggJiYgcGFyYW1ldGVycy5ibG9jaykge1xuICAgICAgICAgICAgICAgIHRoaXMuYXBwLndvcmtzcGFjZS5vcGVuTGlua1RleHQocGFyYW1ldGVycy5maWxlcGF0aCArIFwiI15cIiArIHBhcmFtZXRlcnMuYmxvY2ssIFwiXCIpO1xuXG4gICAgICAgICAgICB9IGVsc2UgaWYgKChwYXJhbWV0ZXJzLnNlYXJjaCB8fCBwYXJhbWV0ZXJzLnNlYXJjaHJlZ2V4KSAmJiBwYXJhbWV0ZXJzLnJlcGxhY2UpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmhhbmRsZVNlYXJjaEFuZFJlcGxhY2UocGFyYW1ldGVycyk7XG5cbiAgICAgICAgICAgIH0gZWxzZSBpZiAocGFyYW1ldGVycy5maWxlcGF0aCkge1xuICAgICAgICAgICAgICAgIHRoaXMuaGFuZGxlT3BlbihwYXJhbWV0ZXJzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5yZWdpc3RlckV2ZW50KFxuICAgICAgICAgICAgdGhpcy5hcHAud29ya3NwYWNlLm9uKCdmaWxlLW1lbnUnLCAobWVudSwgXywgc291cmNlKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHNvdXJjZSAhPT0gXCJwYW5lLW1vcmUtb3B0aW9uc1wiKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc3QgdmlldyA9IHRoaXMuYXBwLndvcmtzcGFjZS5nZXRBY3RpdmVWaWV3T2ZUeXBlKE1hcmtkb3duVmlldyk7XG4gICAgICAgICAgICAgICAgaWYgKCF2aWV3KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBtZW51LmFkZEl0ZW0oKGl0ZW0pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5zZXRUaXRsZShgQ29weSBBZHZhbmNlZCBVUklgKS5zZXRJY29uKCdsaW5rJylcbiAgICAgICAgICAgICAgICAgICAgICAgIC5vbkNsaWNrKChfKSA9PiB0aGlzLmhhbmRsZUNvcHlGaWxlVVJJKCkpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSkpO1xuICAgIH1cblxuICAgIGdldEZpbGVGcm9tVUlEKHVpZDogc3RyaW5nKTogVEZpbGUgfCB1bmRlZmluZWQge1xuICAgICAgICBjb25zdCBmaWxlcyA9IHRoaXMuYXBwLnZhdWx0LmdldEZpbGVzKCk7XG4gICAgICAgIGNvbnN0IGlkS2V5ID0gdGhpcy5zZXR0aW5ncy5pZEZpZWxkO1xuICAgICAgICByZXR1cm4gZmlsZXMuZmluZChmaWxlID0+IHBhcnNlRnJvbnRNYXR0ZXJFbnRyeSh0aGlzLmFwcC5tZXRhZGF0YUNhY2hlLmdldEZpbGVDYWNoZShmaWxlKT8uZnJvbnRtYXR0ZXIsIGlkS2V5KSA9PSB1aWQpO1xuICAgIH1cblxuICAgIGhhbmRsZVdvcmtzcGFjZSh3b3Jrc3BhY2U6IHN0cmluZykge1xuICAgICAgICBjb25zdCB3b3Jrc3BhY2VzID0gKHRoaXMuYXBwIGFzIGFueSk/LmludGVybmFsUGx1Z2lucz8ucGx1Z2lucz8ud29ya3NwYWNlcztcbiAgICAgICAgaWYgKCF3b3Jrc3BhY2VzKSB7XG4gICAgICAgICAgICBuZXcgTm90aWNlKFwiQ2Fubm90IGZpbmQgV29ya3NwYWNlcyBwbHVnaW4uIFBsZWFzZSBmaWxlIGFuIGlzc3VlLlwiKTtcblxuICAgICAgICB9IGVsc2UgaWYgKHdvcmtzcGFjZXMuZW5hYmxlZCkge1xuICAgICAgICAgICAgd29ya3NwYWNlcy5pbnN0YW5jZS5sb2FkV29ya3NwYWNlKHdvcmtzcGFjZSk7XG5cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG5ldyBOb3RpY2UoXCJXb3Jrc3BhY2VzIHBsdWdpbiBpcyBub3QgZW5hYmxlZFwiKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGFzeW5jIGhhbmRsZUNvbW1hbmQocGFyYW1ldGVyczogUGFyYW1ldGVycykge1xuICAgICAgICBpZiAocGFyYW1ldGVycy5maWxlcGF0aCkge1xuICAgICAgICAgICAgaWYgKHBhcmFtZXRlcnMubW9kZSkge1xuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuYXBwLndvcmtzcGFjZS5vcGVuTGlua1RleHQocGFyYW1ldGVycy5maWxlcGF0aCwgXCIvXCIsIHVuZGVmaW5lZCwge1xuICAgICAgICAgICAgICAgICAgICBzdGF0ZTogeyBtb2RlOiBcInNvdXJjZVwiIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBjb25zdCB2aWV3ID0gdGhpcy5hcHAud29ya3NwYWNlLmdldEFjdGl2ZVZpZXdPZlR5cGUoTWFya2Rvd25WaWV3KTtcbiAgICAgICAgICAgICAgICBpZiAodmlldykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlZGl0b3IgPSB2aWV3LmVkaXRvcjtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZGF0YSA9IGVkaXRvci5nZXRWYWx1ZSgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAocGFyYW1ldGVycy5tb2RlID09PSBcImFwcGVuZFwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlZGl0b3Iuc2V0VmFsdWUoZGF0YSArIFwiXFxuXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbGluZXMgPSBlZGl0b3IubGluZUNvdW50KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBlZGl0b3Iuc2V0Q3Vyc29yKHsgY2g6IDAsIGxpbmU6IGxpbmVzIH0pO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHBhcmFtZXRlcnMubW9kZSA9PT0gXCJwcmVwZW5kXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVkaXRvci5zZXRWYWx1ZShcIlxcblwiICsgZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBlZGl0b3Iuc2V0Q3Vyc29yKHsgY2g6IDAsIGxpbmU6IDAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocGFyYW1ldGVycy5tb2RlID09PSBcIm92ZXJ3cml0ZVwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlZGl0b3Iuc2V0VmFsdWUoXCJcIik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuYXBwLndvcmtzcGFjZS5vcGVuTGlua1RleHQocGFyYW1ldGVycy5maWxlcGF0aCwgXCIvXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChwYXJhbWV0ZXJzLmNvbW1hbmRpZCkge1xuICAgICAgICAgICAgKHRoaXMuYXBwIGFzIGFueSkuY29tbWFuZHMuZXhlY3V0ZUNvbW1hbmRCeUlkKHBhcmFtZXRlcnMuY29tbWFuZGlkKTtcbiAgICAgICAgfSBlbHNlIGlmIChwYXJhbWV0ZXJzLmNvbW1hbmRuYW1lKSB7XG4gICAgICAgICAgICBjb25zdCByYXdDb21tYW5kcyA9ICh0aGlzLmFwcCBhcyBhbnkpLmNvbW1hbmRzLmNvbW1hbmRzO1xuICAgICAgICAgICAgZm9yIChjb25zdCBjb21tYW5kIGluIHJhd0NvbW1hbmRzKSB7XG4gICAgICAgICAgICAgICAgaWYgKHJhd0NvbW1hbmRzW2NvbW1hbmRdLm5hbWUgPT09IHBhcmFtZXRlcnMuY29tbWFuZG5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJhd0NvbW1hbmRzW2NvbW1hbmRdLmNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByYXdDb21tYW5kc1tjb21tYW5kXS5jYWxsYmFjaygpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmF3Q29tbWFuZHNbY29tbWFuZF0uY2hlY2tDYWxsYmFjaygpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhc3luYyBoYW5kbGVTZWFyY2hBbmRSZXBsYWNlKHBhcmFtZXRlcnM6IFBhcmFtZXRlcnMpIHtcbiAgICAgICAgbGV0IGZpbGU6IFRGaWxlO1xuICAgICAgICBjb25zb2xlLmxvZyhwYXJhbWV0ZXJzLmZpbGVwYXRoKTtcbiAgICAgICAgaWYgKHBhcmFtZXRlcnMuZmlsZXBhdGgpIHtcblxuICAgICAgICAgICAgY29uc3QgYWJzdHJhY3RGaWxlID0gdGhpcy5hcHAudmF1bHQuZ2V0QWJzdHJhY3RGaWxlQnlQYXRoKHBhcmFtZXRlcnMuZmlsZXBhdGgpO1xuICAgICAgICAgICAgaWYgKGFic3RyYWN0RmlsZSBpbnN0YW5jZW9mIFRGaWxlKSB7XG4gICAgICAgICAgICAgICAgZmlsZSA9IGFic3RyYWN0RmlsZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZpbGUgPSB0aGlzLmFwcC53b3Jrc3BhY2UuZ2V0QWN0aXZlRmlsZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGZpbGUpIHtcbiAgICAgICAgICAgIGxldCBkYXRhID0gYXdhaXQgdGhpcy5hcHAudmF1bHQucmVhZChmaWxlKTtcbiAgICAgICAgICAgIGlmIChwYXJhbWV0ZXJzLnNlYXJjaHJlZ2V4KSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgWywgLCBwYXR0ZXJuLCBmbGFnc10gPSBwYXJhbWV0ZXJzLnNlYXJjaHJlZ2V4Lm1hdGNoKC8oXFwvPykoLispXFwxKFthLXpdKikvaSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlZ2V4ID0gbmV3IFJlZ0V4cChwYXR0ZXJuLCBmbGFncyk7XG4gICAgICAgICAgICAgICAgICAgIGRhdGEgPSBkYXRhLnJlcGxhY2UocmVnZXgsIHBhcmFtZXRlcnMucmVwbGFjZSk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgbmV3IE5vdGljZShgQ2FuJ3QgcGFyc2UgJHtwYXJhbWV0ZXJzLnNlYXJjaHJlZ2V4fSBhcyBSZWdFeGApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZGF0YSA9IGRhdGEucmVwbGFjZUFsbChwYXJhbWV0ZXJzLnNlYXJjaCwgcGFyYW1ldGVycy5yZXBsYWNlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgYXdhaXQgdGhpcy53cml0ZUFuZE9wZW5GaWxlKGZpbGUucGF0aCwgZGF0YSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBuZXcgTm90aWNlKFwiQ2Fubm90IGZpbmQgZmlsZVwiKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGFzeW5jIGhhbmRsZVdyaXRlKHBhcmFtZXRlcnM6IFBhcmFtZXRlcnMpIHtcbiAgICAgICAgY29uc3QgcGF0aCA9IHBhcmFtZXRlcnMuZmlsZXBhdGg7XG4gICAgICAgIGNvbnN0IGZpbGUgPSB0aGlzLmFwcC52YXVsdC5nZXRBYnN0cmFjdEZpbGVCeVBhdGgocGF0aCk7XG5cbiAgICAgICAgaWYgKHBhcmFtZXRlcnMubW9kZSA9PT0gXCJvdmVyd3JpdGVcIikge1xuICAgICAgICAgICAgdGhpcy53cml0ZUFuZE9wZW5GaWxlKHBhdGgsIHBhcmFtZXRlcnMuZGF0YSk7XG5cbiAgICAgICAgfSBlbHNlIGlmIChwYXJhbWV0ZXJzLm1vZGUgPT09IFwicHJlcGVuZFwiKSB7XG4gICAgICAgICAgICBpZiAoZmlsZSBpbnN0YW5jZW9mIFRGaWxlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wcmVwZW5kKGZpbGUsIHBhcmFtZXRlcnMpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnByZXBlbmQocGF0aCwgcGFyYW1ldGVycyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSBlbHNlIGlmIChwYXJhbWV0ZXJzLm1vZGUgPT09IFwiYXBwZW5kXCIpIHtcbiAgICAgICAgICAgIGlmIChmaWxlIGluc3RhbmNlb2YgVEZpbGUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmFwcGVuZChmaWxlLCBwYXJhbWV0ZXJzKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hcHBlbmQocGF0aCwgcGFyYW1ldGVycyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSBlbHNlIGlmIChmaWxlIGluc3RhbmNlb2YgVEZpbGUpIHtcbiAgICAgICAgICAgIG5ldyBOb3RpY2UoXCJGaWxlIGFscmVhZHkgZXhpc3RzXCIpO1xuXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLndyaXRlQW5kT3BlbkZpbGUocGF0aCwgcGFyYW1ldGVycy5kYXRhKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGFzeW5jIGhhbmRsZU9wZW4ocGFyYW1ldGVyczogUGFyYW1ldGVycykge1xuICAgICAgICBhd2FpdCB0aGlzLmFwcC53b3Jrc3BhY2Uub3BlbkxpbmtUZXh0KHBhcmFtZXRlcnMuZmlsZXBhdGgsIFwiXCIsIHRoaXMuc2V0dGluZ3Mub3BlbkZpbGVXaXRob3V0V3JpdGVJbk5ld1BhbmUpO1xuICAgICAgICBhd2FpdCB0aGlzLnNldEN1cnNvcihwYXJhbWV0ZXJzLm1vZGUpO1xuICAgIH1cblxuICAgIGFzeW5jIGhhbmRsZURhaWx5Tm90ZShwYXJhbWV0ZXJzOiBQYXJhbWV0ZXJzKSB7XG4gICAgICAgIGlmICghYXBwSGFzRGFpbHlOb3Rlc1BsdWdpbkxvYWRlZCgpKSB7XG4gICAgICAgICAgICBuZXcgTm90aWNlKFwiRGFpbHkgbm90ZXMgcGx1Z2luIGlzIG5vdCBsb2FkZWRcIik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbW9tZW50ID0gKHdpbmRvdyBhcyBhbnkpLm1vbWVudChEYXRlLm5vdygpKTtcbiAgICAgICAgY29uc3QgYWxsRGFpbHlOb3RlcyA9IGdldEFsbERhaWx5Tm90ZXMoKTtcbiAgICAgICAgbGV0IGRhaWx5Tm90ZSA9IGdldERhaWx5Tm90ZShtb21lbnQsIGFsbERhaWx5Tm90ZXMpO1xuXG4gICAgICAgIGlmIChwYXJhbWV0ZXJzLmRhdGEgJiYgcGFyYW1ldGVycy5tb2RlID09PSBcIm92ZXJ3cml0ZVwiKSB7XG4gICAgICAgICAgICB0aGlzLndyaXRlQW5kT3BlbkZpbGUoZGFpbHlOb3RlLnBhdGgsIHBhcmFtZXRlcnMuZGF0YSk7XG5cbiAgICAgICAgfSBlbHNlIGlmIChwYXJhbWV0ZXJzLmRhdGEgJiYgcGFyYW1ldGVycy5tb2RlID09PSBcInByZXBlbmRcIikge1xuICAgICAgICAgICAgaWYgKCFkYWlseU5vdGUpIHtcbiAgICAgICAgICAgICAgICBkYWlseU5vdGUgPSBhd2FpdCBjcmVhdGVEYWlseU5vdGUobW9tZW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMucHJlcGVuZChkYWlseU5vdGUsIHBhcmFtZXRlcnMpO1xuXG4gICAgICAgIH0gZWxzZSBpZiAocGFyYW1ldGVycy5kYXRhICYmIHBhcmFtZXRlcnMubW9kZSA9PT0gXCJhcHBlbmRcIikge1xuICAgICAgICAgICAgaWYgKCFkYWlseU5vdGUpIHtcbiAgICAgICAgICAgICAgICBkYWlseU5vdGUgPSBhd2FpdCBjcmVhdGVEYWlseU5vdGUobW9tZW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuYXBwZW5kKGRhaWx5Tm90ZSwgcGFyYW1ldGVycyk7XG5cbiAgICAgICAgfSBlbHNlIGlmIChwYXJhbWV0ZXJzLmRhdGEgJiYgZGFpbHlOb3RlKSB7XG4gICAgICAgICAgICBuZXcgTm90aWNlKFwiRmlsZSBhbHJlYWR5IGV4aXN0c1wiKTtcblxuICAgICAgICB9IGVsc2UgaWYgKHBhcmFtZXRlcnMuZGF0YSkge1xuICAgICAgICAgICAgZGFpbHlOb3RlID0gYXdhaXQgY3JlYXRlRGFpbHlOb3RlKG1vbWVudCk7XG4gICAgICAgICAgICB0aGlzLndyaXRlQW5kT3BlbkZpbGUoZGFpbHlOb3RlLnBhdGgsIHBhcmFtZXRlcnMuZGF0YSk7XG5cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmICghZGFpbHlOb3RlKSB7XG4gICAgICAgICAgICAgICAgZGFpbHlOb3RlID0gYXdhaXQgY3JlYXRlRGFpbHlOb3RlKG1vbWVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhd2FpdCB0aGlzLmFwcC53b3Jrc3BhY2Uub3BlbkxpbmtUZXh0KGRhaWx5Tm90ZS5wYXRoLCBcIlwiLCB0aGlzLnNldHRpbmdzLm9wZW5EYWlseUluTmV3UGFuZSk7XG4gICAgICAgICAgICBpZiAocGFyYW1ldGVycy5tb2RlKSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5zZXRDdXJzb3IocGFyYW1ldGVycy5tb2RlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgfVxuXG4gICAgYXN5bmMgYXBwZW5kKGZpbGU6IFRGaWxlIHwgc3RyaW5nLCBwYXJhbWV0ZXJzOiBQYXJhbWV0ZXJzKSB7XG4gICAgICAgIGxldCBwYXRoOiBzdHJpbmc7XG4gICAgICAgIGxldCBkYXRhVG9Xcml0ZTogc3RyaW5nO1xuICAgICAgICBpZiAocGFyYW1ldGVycy5oZWFkaW5nKSB7XG4gICAgICAgICAgICBpZiAoZmlsZSBpbnN0YW5jZW9mIFRGaWxlKSB7XG4gICAgICAgICAgICAgICAgcGF0aCA9IGZpbGUucGF0aDtcbiAgICAgICAgICAgICAgICBjb25zdCBsaW5lID0gdGhpcy5nZXRFbmRBbmRCZWdpbm5pbmdPZkhlYWRpbmcoZmlsZSwgcGFyYW1ldGVycy5oZWFkaW5nKT8ubGFzdExpbmU7XG4gICAgICAgICAgICAgICAgaWYgKGxpbmUgPT09IHVuZGVmaW5lZCkgcmV0dXJuO1xuXG4gICAgICAgICAgICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IHRoaXMuYXBwLnZhdWx0LnJlYWQoZmlsZSk7XG4gICAgICAgICAgICAgICAgY29uc3QgbGluZXMgPSBkYXRhLnNwbGl0KFwiXFxuXCIpO1xuXG4gICAgICAgICAgICAgICAgbGluZXMuc3BsaWNlKGxpbmUsIDAsIC4uLnBhcmFtZXRlcnMuZGF0YS5zcGxpdChcIlxcblwiKSk7XG4gICAgICAgICAgICAgICAgZGF0YVRvV3JpdGUgPSBsaW5lcy5qb2luKFwiXFxuXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgbGV0IGZpbGVEYXRhOiBzdHJpbmc7XG4gICAgICAgICAgICBpZiAoZmlsZSBpbnN0YW5jZW9mIFRGaWxlKSB7XG4gICAgICAgICAgICAgICAgZmlsZURhdGEgPSBhd2FpdCB0aGlzLmFwcC52YXVsdC5yZWFkKGZpbGUpO1xuICAgICAgICAgICAgICAgIHBhdGggPSBmaWxlLnBhdGg7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHBhdGggPSBmaWxlO1xuICAgICAgICAgICAgICAgIGZpbGVEYXRhID0gXCJcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRhdGFUb1dyaXRlID0gZmlsZURhdGEgKyBcIlxcblwiICsgcGFyYW1ldGVycy5kYXRhO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMud3JpdGVBbmRPcGVuRmlsZShwYXRoLCBkYXRhVG9Xcml0ZSk7XG4gICAgfVxuXG4gICAgYXN5bmMgcHJlcGVuZChmaWxlOiBURmlsZSB8IHN0cmluZywgcGFyYW1ldGVyczogUGFyYW1ldGVycykge1xuICAgICAgICBsZXQgcGF0aDogc3RyaW5nO1xuICAgICAgICBsZXQgZGF0YVRvV3JpdGU6IHN0cmluZztcbiAgICAgICAgaWYgKHBhcmFtZXRlcnMuaGVhZGluZykge1xuICAgICAgICAgICAgaWYgKGZpbGUgaW5zdGFuY2VvZiBURmlsZSkge1xuICAgICAgICAgICAgICAgIHBhdGggPSBmaWxlLnBhdGg7XG4gICAgICAgICAgICAgICAgY29uc3QgbGluZSA9IHRoaXMuZ2V0RW5kQW5kQmVnaW5uaW5nT2ZIZWFkaW5nKGZpbGUsIHBhcmFtZXRlcnMuaGVhZGluZyk/LmZpcnN0TGluZTtcbiAgICAgICAgICAgICAgICBpZiAobGluZSA9PT0gdW5kZWZpbmVkKSByZXR1cm47XG5cbiAgICAgICAgICAgICAgICBjb25zdCBkYXRhID0gYXdhaXQgdGhpcy5hcHAudmF1bHQucmVhZChmaWxlKTtcbiAgICAgICAgICAgICAgICBjb25zdCBsaW5lcyA9IGRhdGEuc3BsaXQoXCJcXG5cIik7XG5cbiAgICAgICAgICAgICAgICBsaW5lcy5zcGxpY2UobGluZSwgMCwgLi4ucGFyYW1ldGVycy5kYXRhLnNwbGl0KFwiXFxuXCIpKTtcbiAgICAgICAgICAgICAgICBkYXRhVG9Xcml0ZSA9IGxpbmVzLmpvaW4oXCJcXG5cIik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxldCBmaWxlRGF0YTogc3RyaW5nO1xuICAgICAgICAgICAgaWYgKGZpbGUgaW5zdGFuY2VvZiBURmlsZSkge1xuICAgICAgICAgICAgICAgIGZpbGVEYXRhID0gYXdhaXQgdGhpcy5hcHAudmF1bHQucmVhZChmaWxlKTtcbiAgICAgICAgICAgICAgICBwYXRoID0gZmlsZS5wYXRoO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBwYXRoID0gZmlsZTtcbiAgICAgICAgICAgICAgICBmaWxlRGF0YSA9IFwiXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkYXRhVG9Xcml0ZSA9IHBhcmFtZXRlcnMuZGF0YSArIFwiXFxuXCIgKyBmaWxlRGF0YTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLndyaXRlQW5kT3BlbkZpbGUocGF0aCwgZGF0YVRvV3JpdGUpO1xuICAgIH1cblxuICAgIGFzeW5jIHdyaXRlQW5kT3BlbkZpbGUob3V0cHV0RmlsZU5hbWU6IHN0cmluZywgdGV4dDogc3RyaW5nKSB7XG4gICAgICAgIGF3YWl0IHRoaXMuYXBwLnZhdWx0LmFkYXB0ZXIud3JpdGUob3V0cHV0RmlsZU5hbWUsIHRleHQpO1xuICAgICAgICBpZiAodGhpcy5zZXR0aW5ncy5vcGVuRmlsZU9uV3JpdGUpIHtcbiAgICAgICAgICAgIGxldCBmaWxlSXNBbHJlYWR5T3BlbmVkID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLmFwcC53b3Jrc3BhY2UuaXRlcmF0ZUFsbExlYXZlcyhsZWFmID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoKGxlYWYudmlldyBhcyBhbnkpLmZpbGU/LnBhdGggPT09IG91dHB1dEZpbGVOYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIGZpbGVJc0FscmVhZHlPcGVuZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKCFmaWxlSXNBbHJlYWR5T3BlbmVkKVxuICAgICAgICAgICAgICAgIHRoaXMuYXBwLndvcmtzcGFjZS5vcGVuTGlua1RleHQob3V0cHV0RmlsZU5hbWUsIFwiXCIsIHRoaXMuc2V0dGluZ3Mub3BlbkZpbGVPbldyaXRlSW5OZXdQYW5lKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldEVuZEFuZEJlZ2lubmluZ09mSGVhZGluZyhmaWxlOiBURmlsZSwgaGVhZGluZzogc3RyaW5nKTogeyBcImxhc3RMaW5lXCI6IG51bWJlciwgXCJmaXJzdExpbmVcIjogbnVtYmVyOyB9IHtcbiAgICAgICAgY29uc3QgY2FjaGUgPSB0aGlzLmFwcC5tZXRhZGF0YUNhY2hlLmdldEZpbGVDYWNoZShmaWxlKTtcbiAgICAgICAgY29uc3Qgc2VjdGlvbnMgPSBjYWNoZS5zZWN0aW9ucztcbiAgICAgICAgY29uc3QgZm91bmRIZWFkaW5nID0gY2FjaGUuaGVhZGluZ3M/LmZpbmQoZSA9PiBlLmhlYWRpbmcgPT09IGhlYWRpbmcpO1xuXG5cbiAgICAgICAgaWYgKGZvdW5kSGVhZGluZykge1xuICAgICAgICAgICAgY29uc3QgZm91bmRTZWN0aW9uSW5kZXggPSBzZWN0aW9ucy5maW5kSW5kZXgoc2VjdGlvbiA9PiBzZWN0aW9uLnR5cGUgPT09IFwiaGVhZGluZ1wiICYmIHNlY3Rpb24ucG9zaXRpb24uc3RhcnQubGluZSA9PT0gZm91bmRIZWFkaW5nLnBvc2l0aW9uLnN0YXJ0LmxpbmUpO1xuICAgICAgICAgICAgY29uc3QgcmVzdFNlY3Rpb25zID0gc2VjdGlvbnMuc2xpY2UoZm91bmRTZWN0aW9uSW5kZXggKyAxKTtcblxuICAgICAgICAgICAgY29uc3QgbmV4dEhlYWRpbmdJbmRleCA9IHJlc3RTZWN0aW9ucz8uZmluZEluZGV4KGUgPT4gZS50eXBlID09PSBcImhlYWRpbmdcIik7XG5cbiAgICAgICAgICAgIGNvbnN0IGxhc3RTZWN0aW9uID0gcmVzdFNlY3Rpb25zWyhuZXh0SGVhZGluZ0luZGV4ICE9PSAtMSA/IG5leHRIZWFkaW5nSW5kZXggOiByZXN0U2VjdGlvbnMubGVuZ3RoKSAtIDFdID8/IHNlY3Rpb25zW2ZvdW5kU2VjdGlvbkluZGV4XTtcbiAgICAgICAgICAgIGNvbnN0IGxhc3RMaW5lID0gbGFzdFNlY3Rpb24ucG9zaXRpb24uZW5kLmxpbmUgKyAxO1xuXG4gICAgICAgICAgICByZXR1cm4geyBcImxhc3RMaW5lXCI6IGxhc3RMaW5lLCBcImZpcnN0TGluZVwiOiBzZWN0aW9uc1tmb3VuZFNlY3Rpb25JbmRleF0ucG9zaXRpb24uZW5kLmxpbmUgKyAxIH07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBuZXcgTm90aWNlKFwiQ2FuJ3QgZmluZCBoZWFkaW5nXCIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgYXN5bmMgc2V0Q3Vyc29yKG1vZGU6IFBhcmFtZXRlcnNbXCJtb2RlXCJdKSB7XG4gICAgICAgIGNvbnN0IHZpZXcgPSB0aGlzLmFwcC53b3Jrc3BhY2UuZ2V0QWN0aXZlVmlld09mVHlwZShNYXJrZG93blZpZXcpO1xuICAgICAgICBpZiAodmlldykge1xuICAgICAgICAgICAgY29uc3QgZWRpdG9yID0gdmlldy5lZGl0b3I7XG5cbiAgICAgICAgICAgIGxldCB2aWV3U3RhdGUgPSB2aWV3LmxlYWYuZ2V0Vmlld1N0YXRlKCk7XG4gICAgICAgICAgICB2aWV3U3RhdGUuc3RhdGUubW9kZSA9IFwic291cmNlXCI7XG5cbiAgICAgICAgICAgIGlmIChtb2RlID09PSBcImFwcGVuZFwiKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbGFzdExpbmUgPSBlZGl0b3IubGFzdExpbmUoKTtcbiAgICAgICAgICAgICAgICBjb25zdCBsYXN0TGluZUxlbmd0aCA9IGVkaXRvci5nZXRMaW5lKGxhc3RMaW5lKS5sZW5ndGg7XG4gICAgICAgICAgICAgICAgYXdhaXQgdmlldy5sZWFmLnNldFZpZXdTdGF0ZSh2aWV3U3RhdGUsIHsgZm9jdXM6IHRydWUgfSk7XG5cbiAgICAgICAgICAgICAgICBlZGl0b3Iuc2V0Q3Vyc29yKHsgY2g6IGxhc3RMaW5lTGVuZ3RoLCBsaW5lOiBsYXN0TGluZSB9KTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobW9kZSA9PT0gXCJwcmVwZW5kXCIpIHtcbiAgICAgICAgICAgICAgICBhd2FpdCB2aWV3LmxlYWYuc2V0Vmlld1N0YXRlKHZpZXdTdGF0ZSwgeyBmb2N1czogdHJ1ZSB9KTtcblxuICAgICAgICAgICAgICAgIGVkaXRvci5zZXRDdXJzb3IoeyBjaDogMCwgbGluZTogMCB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGhhbmRsZUNvcHlGaWxlVVJJKCkge1xuICAgICAgICBjb25zdCB2aWV3ID0gdGhpcy5hcHAud29ya3NwYWNlLmdldEFjdGl2ZVZpZXdPZlR5cGUoTWFya2Rvd25WaWV3KTtcbiAgICAgICAgaWYgKCF2aWV3KSByZXR1cm47XG5cbiAgICAgICAgY29uc3QgcG9zID0gdmlldy5lZGl0b3IuZ2V0Q3Vyc29yKCk7XG4gICAgICAgIGNvbnN0IGNhY2hlID0gdGhpcy5hcHAubWV0YWRhdGFDYWNoZS5nZXRGaWxlQ2FjaGUodmlldy5maWxlKTtcbiAgICAgICAgaWYgKGNhY2hlLmhlYWRpbmdzKSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGhlYWRpbmcgb2YgY2FjaGUuaGVhZGluZ3MpIHtcbiAgICAgICAgICAgICAgICBpZiAoaGVhZGluZy5wb3NpdGlvbi5zdGFydC5saW5lIDw9IHBvcy5saW5lICYmIGhlYWRpbmcucG9zaXRpb24uZW5kLmxpbmUgPj0gcG9zLmxpbmUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb3B5VVJJKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVwYXRoOiB2aWV3LmZpbGUucGF0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGhlYWRpbmc6IGhlYWRpbmcuaGVhZGluZ1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoY2FjaGUuYmxvY2tzKSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGJsb2NrSUQgb2YgT2JqZWN0LmtleXMoY2FjaGUuYmxvY2tzKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGJsb2NrID0gY2FjaGUuYmxvY2tzW2Jsb2NrSURdO1xuICAgICAgICAgICAgICAgIGlmIChibG9jay5wb3NpdGlvbi5zdGFydC5saW5lIDw9IHBvcy5saW5lICYmIGJsb2NrLnBvc2l0aW9uLmVuZC5saW5lID49IHBvcy5saW5lKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29weVVSSSh7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlcGF0aDogdmlldy5maWxlLnBhdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICBibG9jazogYmxvY2tJRFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjb25zdCBmaWxlTW9kYWwgPSBuZXcgRmlsZU1vZGFsKHRoaXMsIFwiQ2hvb3NlIGEgZmlsZVwiLCBmYWxzZSk7XG4gICAgICAgIGZpbGVNb2RhbC5vcGVuKCk7XG4gICAgICAgIGZpbGVNb2RhbC5vbkNob29zZUl0ZW0gPSAoaXRlbSwgXykgPT4ge1xuICAgICAgICAgICAgbmV3IEVudGVyRGF0YU1vZGFsKHRoaXMsIGl0ZW0uc291cmNlKS5vcGVuKCk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgYXN5bmMgY29weVVSSShwYXJhbWV0ZXJzOiBQYXJhbWV0ZXJzKSB7XG4gICAgICAgIGxldCB1cmkgPSBgb2JzaWRpYW46Ly9hZHZhbmNlZC11cmk/dmF1bHQ9JHt0aGlzLmFwcC52YXVsdC5nZXROYW1lKCl9YDtcbiAgICAgICAgY29uc3QgZmlsZSA9IHRoaXMuYXBwLnZhdWx0LmdldEFic3RyYWN0RmlsZUJ5UGF0aChwYXJhbWV0ZXJzLmZpbGVwYXRoKTtcbiAgICAgICAgaWYgKHRoaXMuc2V0dGluZ3MudXNlVUlEICYmIGZpbGUgaW5zdGFuY2VvZiBURmlsZSkge1xuICAgICAgICAgICAgcGFyYW1ldGVycy5maWxlcGF0aCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIHBhcmFtZXRlcnMudWlkID0gYXdhaXQgdGhpcy5nZXRVUklGcm9tRmlsZShmaWxlKTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGNvbnN0IHBhcmFtZXRlciBpbiBwYXJhbWV0ZXJzKSB7XG4gICAgICAgICAgICBpZiAoKHBhcmFtZXRlcnMgYXMgYW55KVtwYXJhbWV0ZXJdKSB7XG4gICAgICAgICAgICAgICAgdXJpID0gdXJpICsgYCYke3BhcmFtZXRlcn09JHtlbmNvZGVVUklDb21wb25lbnQoKHBhcmFtZXRlcnMgYXMgYW55KVtwYXJhbWV0ZXJdKX1gO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG5hdmlnYXRvci5jbGlwYm9hcmQgJiYgbmF2aWdhdG9yLnBlcm1pc3Npb25zKVxuICAgICAgICAgICAgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQoZW5jb2RlVVJJKHVyaSkpO1xuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHZhciB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInRleHRhcmVhXCIpO1xuICAgICAgICAgICAgdC52YWx1ZSA9IGVuY29kZVVSSSh1cmkpLFxuICAgICAgICAgICAgICAgIHQuc3R5bGUudG9wID0gXCIwXCIsXG4gICAgICAgICAgICAgICAgdC5zdHlsZS5sZWZ0ID0gXCIwXCIsXG4gICAgICAgICAgICAgICAgdC5zdHlsZS5wb3NpdGlvbiA9IFwiZml4ZWRcIixcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHQpO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICB0LmZvY3VzKCksXG4gICAgICAgICAgICAgICAgICAgIHQuc2VsZWN0KCksXG4gICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmV4ZWNDb21tYW5kKFwiY29weVwiKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHsgfVxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZCh0KTtcbiAgICAgICAgfVxuICAgICAgICBuZXcgTm90aWNlKFwiQWR2YW5jZWQgVVJJIGNvcGllZCB0byB5b3VyIGNsaXBib2FyZFwiKTtcbiAgICB9XG5cbiAgICBhc3luYyBnZXRVUklGcm9tRmlsZShmaWxlOiBURmlsZSk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgICAgIGNvbnN0IGZpbGVDb250ZW50OiBzdHJpbmcgPSBhd2FpdCB0aGlzLmFwcC52YXVsdC5yZWFkKGZpbGUpO1xuICAgICAgICBjb25zdCBmcm9udG1hdHRlciA9IHRoaXMuYXBwLm1ldGFkYXRhQ2FjaGUuZ2V0RmlsZUNhY2hlKGZpbGUpLmZyb250bWF0dGVyO1xuICAgICAgICBsZXQgdWlkID0gcGFyc2VGcm9udE1hdHRlckVudHJ5KGZyb250bWF0dGVyLCB0aGlzLnNldHRpbmdzLmlkRmllbGQpO1xuICAgICAgICBjb25zb2xlLmxvZyh1aWQpO1xuICAgICAgICBpZiAodWlkKSByZXR1cm4gdWlkO1xuICAgICAgICBjb25zdCBpc1lhbWxFbXB0eTogYm9vbGVhbiA9ICgoIWZyb250bWF0dGVyIHx8IGZyb250bWF0dGVyLmxlbmd0aCA9PT0gMCkgJiYgIWZpbGVDb250ZW50Lm1hdGNoKC9eLXszfVxccypcXG4qXFxyKi17M30vKSk7XG4gICAgICAgIHVpZCA9IHV1aWR2NCgpO1xuICAgICAgICBsZXQgc3BsaXRDb250ZW50ID0gZmlsZUNvbnRlbnQuc3BsaXQoXCJcXG5cIik7XG4gICAgICAgIGlmIChpc1lhbWxFbXB0eSkge1xuICAgICAgICAgICAgc3BsaXRDb250ZW50LnVuc2hpZnQoXCItLS1cIik7XG4gICAgICAgICAgICBzcGxpdENvbnRlbnQudW5zaGlmdChgJHt0aGlzLnNldHRpbmdzLmlkRmllbGR9OiAke3VpZH1gKTtcbiAgICAgICAgICAgIHNwbGl0Q29udGVudC51bnNoaWZ0KFwiLS0tXCIpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgc3BsaXRDb250ZW50LnNwbGljZSgxLCAwLCBgJHt0aGlzLnNldHRpbmdzLmlkRmllbGR9OiAke3VpZH1gKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IG5ld0ZpbGVDb250ZW50ID0gc3BsaXRDb250ZW50LmpvaW4oXCJcXG5cIik7XG4gICAgICAgIGF3YWl0IHRoaXMuYXBwLnZhdWx0Lm1vZGlmeShmaWxlLCBuZXdGaWxlQ29udGVudCk7XG4gICAgICAgIHJldHVybiB1aWQ7XG4gICAgfVxuICAgIGFzeW5jIGxvYWRTZXR0aW5ncygpIHtcbiAgICAgICAgdGhpcy5zZXR0aW5ncyA9IE9iamVjdC5hc3NpZ24oREVGQVVMVF9TRVRUSU5HUywgYXdhaXQgdGhpcy5sb2FkRGF0YSgpKTtcbiAgICB9XG5cbiAgICBhc3luYyBzYXZlU2V0dGluZ3MoKSB7XG4gICAgICAgIGF3YWl0IHRoaXMuc2F2ZURhdGEodGhpcy5zZXR0aW5ncyk7XG4gICAgfVxufVxuY2xhc3MgU2V0dGluZ3NUYWIgZXh0ZW5kcyBQbHVnaW5TZXR0aW5nVGFiIHtcbiAgICBwbHVnaW46IEFkdmFuY2VkVVJJO1xuICAgIGNvbnN0cnVjdG9yKGFwcDogQXBwLCBwbHVnaW46IEFkdmFuY2VkVVJJKSB7XG4gICAgICAgIHN1cGVyKGFwcCwgcGx1Z2luKTtcbiAgICAgICAgdGhpcy5wbHVnaW4gPSBwbHVnaW47XG4gICAgfVxuXG4gICAgZGlzcGxheSgpOiB2b2lkIHtcbiAgICAgICAgbGV0IHsgY29udGFpbmVyRWwgfSA9IHRoaXM7XG4gICAgICAgIGNvbnRhaW5lckVsLmVtcHR5KCk7XG4gICAgICAgIGNvbnRhaW5lckVsLmNyZWF0ZUVsKFwiaDJcIiwgeyB0ZXh0OiB0aGlzLnBsdWdpbi5tYW5pZmVzdC5uYW1lIH0pO1xuXG4gICAgICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgICAgICAgLnNldE5hbWUoXCJPcGVuIGZpbGUgb24gd3JpdGVcIilcbiAgICAgICAgICAgIC5hZGRUb2dnbGUoY2IgPT4gY2Iub25DaGFuZ2UodmFsdWUgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLm9wZW5GaWxlT25Xcml0ZSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICAgICAgfSkuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3Mub3BlbkZpbGVPbldyaXRlKSk7XG5cbiAgICAgICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAgICAgICAuc2V0TmFtZShcIk9wZW4gZmlsZSBvbiB3cml0ZSBpbiBhIG5ldyBwYW5lXCIpXG4gICAgICAgICAgICAuc2V0RGlzYWJsZWQodGhpcy5wbHVnaW4uc2V0dGluZ3Mub3BlbkZpbGVPbldyaXRlKVxuICAgICAgICAgICAgLmFkZFRvZ2dsZShjYiA9PiBjYi5vbkNoYW5nZSh2YWx1ZSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3Mub3BlbkZpbGVPbldyaXRlSW5OZXdQYW5lID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgICAgICAgICB9KS5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy5vcGVuRmlsZU9uV3JpdGVJbk5ld1BhbmUpKTtcblxuICAgICAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgICAgICAgIC5zZXROYW1lKFwiT3BlbiBkYWlseSBub3RlIGluIGEgbmV3IHBhbmVcIilcbiAgICAgICAgICAgIC5hZGRUb2dnbGUoY2IgPT4gY2Iub25DaGFuZ2UodmFsdWUgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLm9wZW5EYWlseUluTmV3UGFuZSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICAgICAgfSkuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3Mub3BlbkRhaWx5SW5OZXdQYW5lKSk7XG5cbiAgICAgICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAgICAgICAuc2V0TmFtZShcIk9wZW4gZmlsZSB3aXRob3V0IHdyaXRlIGluIG5ldyBwYW5lXCIpXG4gICAgICAgICAgICAuYWRkVG9nZ2xlKGNiID0+IGNiLm9uQ2hhbmdlKHZhbHVlID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5vcGVuRmlsZVdpdGhvdXRXcml0ZUluTmV3UGFuZSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICAgICAgfSkuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3Mub3BlbkZpbGVXaXRob3V0V3JpdGVJbk5ld1BhbmUpKTtcblxuICAgICAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgICAgICAgIC5zZXROYW1lKFwiVXNlIFVJRCBpbnN0ZWFkIG9mIGZpbGUgcGF0aHNcIilcbiAgICAgICAgICAgIC5hZGRUb2dnbGUoY2IgPT4gY2Iub25DaGFuZ2UodmFsdWUgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLnVzZVVJRCA9IHZhbHVlO1xuICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICAgICAgfSkuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MudXNlVUlEKSk7XG5cbiAgICAgICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAgICAgICAuc2V0TmFtZShcIlVJRCBmaWVsZCBpbiBmcm9udG1hdHRlclwiKVxuICAgICAgICAgICAgLmFkZFRleHQoY2IgPT4gY2Iub25DaGFuZ2UodmFsdWUgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmlkRmllbGQgPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgICAgIH0pLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmlkRmllbGQpKTtcblxuICAgIH1cbn1cblxuaW50ZXJmYWNlIEVudGVyRGF0YSB7XG4gICAgbW9kZTogc3RyaW5nO1xuICAgIGRhdGE6IHN0cmluZyxcbiAgICBkaXNwbGF5OiBzdHJpbmcsXG4gICAgZnVuYzogRnVuY3Rpb24sXG59XG5cbmNsYXNzIEVudGVyRGF0YU1vZGFsIGV4dGVuZHMgU3VnZ2VzdE1vZGFsPEVudGVyRGF0YT4ge1xuICAgIHBsdWdpbjogQWR2YW5jZWRVUkk7XG4gICAgLy9udWxsIGlmIGZvciBub3JtYWwgd3JpdGUgbW9kZSwgaXRzIG5vdCBhc3NvY2lhdGVkIHdpdGggYSBzcGVjaWFsIG1vZGUgbGlrZSBcImFwcGVuZFwiIG9yIFwicHJlcGVuZFwiXG4gICAgbW9kZXMgPSBbbnVsbCwgXCJvdmVyd3JpdGVcIiwgXCJhcHBlbmRcIiwgXCJwcmVwZW5kXCJdO1xuICAgIGZpbGU6IHN0cmluZyB8IHVuZGVmaW5lZDtcblxuICAgIGNvbnN0cnVjdG9yKHBsdWdpbjogQWR2YW5jZWRVUkksIGZpbGU/OiBzdHJpbmcpIHtcbiAgICAgICAgc3VwZXIocGx1Z2luLmFwcCk7XG4gICAgICAgIHRoaXMucGx1Z2luID0gcGx1Z2luO1xuICAgICAgICB0aGlzLnNldFBsYWNlaG9sZGVyKFwiVHlwZSB5b3VyIGRhdGEgdG8gYmUgd3JpdHRlbiB0byB0aGUgZmlsZSBvciBsZWF2ZSBpdCBlbXB0eSB0byBqdXN0IG9wZW4gaXRcIik7XG4gICAgICAgIHRoaXMuZmlsZSA9IGZpbGU7XG4gICAgfVxuXG5cbiAgICBnZXRTdWdnZXN0aW9ucyhxdWVyeTogc3RyaW5nKTogRW50ZXJEYXRhW10ge1xuICAgICAgICBpZiAocXVlcnkgPT0gXCJcIikgcXVlcnkgPSBudWxsO1xuXG4gICAgICAgIGxldCBzdWdnZXN0aW9uczogRW50ZXJEYXRhW10gPSBbXTtcbiAgICAgICAgZm9yIChjb25zdCBtb2RlIG9mIHRoaXMubW9kZXMpIHtcbiAgICAgICAgICAgIGlmICghKG1vZGUgPT09IFwib3ZlcndyaXRlXCIgJiYgIXF1ZXJ5KSkge1xuICAgICAgICAgICAgICAgIGxldCBkaXNwbGF5OiBzdHJpbmc7XG4gICAgICAgICAgICAgICAgaWYgKHF1ZXJ5KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChtb2RlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5ID0gYFdyaXRlIFwiJHtxdWVyeX1cIiBpbiAke21vZGV9IG1vZGVgO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheSA9IGBXcml0ZSBcIiR7cXVlcnl9XCJgO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG1vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXkgPSBgT3BlbiBpbiAke21vZGV9IG1vZGVgO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheSA9IGBPcGVuYDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBzdWdnZXN0aW9ucy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogcXVlcnksXG4gICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6IGRpc3BsYXksXG4gICAgICAgICAgICAgICAgICAgIG1vZGU6IG1vZGUsXG4gICAgICAgICAgICAgICAgICAgIGZ1bmM6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmZpbGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5jb3B5VVJJKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZXBhdGg6IHRoaXMuZmlsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogcXVlcnksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZGU6IG1vZGUgYXMgUGFyYW1ldGVyc1tcIm1vZGVcIl1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uY29weVVSSSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhaWx5OiBcInRydWVcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogcXVlcnksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZGU6IG1vZGUgYXMgUGFyYW1ldGVyc1tcIm1vZGVcIl1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHN1Z2dlc3Rpb25zO1xuICAgIH1cblxuICAgIHJlbmRlclN1Z2dlc3Rpb24odmFsdWU6IEVudGVyRGF0YSwgZWw6IEhUTUxFbGVtZW50KTogdm9pZCB7XG4gICAgICAgIGVsLmlubmVyVGV4dCA9IHZhbHVlLmRpc3BsYXk7XG4gICAgfTtcblxuICAgIG9uQ2hvb3NlU3VnZ2VzdGlvbihpdGVtOiBFbnRlckRhdGEsIF86IE1vdXNlRXZlbnQgfCBLZXlib2FyZEV2ZW50KTogdm9pZCB7XG4gICAgICAgIGl0ZW0uZnVuYygpO1xuICAgIH07XG59XG5cbmludGVyZmFjZSBGaWxlTW9kYWxEYXRhIHtcbiAgICBzb3VyY2U6IHN0cmluZztcbiAgICBkaXNwbGF5OiBzdHJpbmc7XG59XG5cbmNsYXNzIEZpbGVNb2RhbCBleHRlbmRzIEZ1enp5U3VnZ2VzdE1vZGFsPEZpbGVNb2RhbERhdGE+IHtcbiAgICBwbHVnaW46IEFkdmFuY2VkVVJJO1xuICAgIGNvbnN0cnVjdG9yKHBsdWdpbjogQWR2YW5jZWRVUkksIHByaXZhdGUgcGxhY2VIb2xkZXI6IHN0cmluZywgcHJpdmF0ZSBhbGxvd05vRmlsZTogYm9vbGVhbiA9IHRydWUpIHtcbiAgICAgICAgc3VwZXIocGx1Z2luLmFwcCk7XG4gICAgICAgIHRoaXMucGx1Z2luID0gcGx1Z2luO1xuICAgICAgICB0aGlzLnNldFBsYWNlaG9sZGVyKHRoaXMucGxhY2VIb2xkZXIpO1xuICAgIH1cblxuICAgIGdldEl0ZW1zKCk6IEZpbGVNb2RhbERhdGFbXSB7XG4gICAgICAgIGxldCBzcGVjaWFsSXRlbXM6IEZpbGVNb2RhbERhdGFbXSA9IFtdO1xuICAgICAgICBpZiAodGhpcy5hbGxvd05vRmlsZSkge1xuICAgICAgICAgICAgc3BlY2lhbEl0ZW1zLnB1c2goeyBkaXNwbGF5OiBcIjxEb24ndCBzcGVjaWZ5IGEgZmlsZT5cIiwgc291cmNlOiB1bmRlZmluZWQgfSk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZmlsZSA9IHRoaXMuYXBwLndvcmtzcGFjZS5nZXRBY3RpdmVGaWxlKCk7XG4gICAgICAgIGlmIChmaWxlKSB7XG4gICAgICAgICAgICBzcGVjaWFsSXRlbXMucHVzaCh7IGRpc3BsYXk6IFwiPEN1cnJlbnQgZmlsZT5cIiwgc291cmNlOiBmaWxlLnBhdGggfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFsuLi5zcGVjaWFsSXRlbXMsIC4uLnRoaXMuYXBwLnZhdWx0LmdldEZpbGVzKCkubWFwKGUgPT4geyByZXR1cm4geyBkaXNwbGF5OiBlLnBhdGgsIHNvdXJjZTogZS5wYXRoIH07IH0pXTtcbiAgICB9XG5cbiAgICBnZXRJdGVtVGV4dChpdGVtOiBGaWxlTW9kYWxEYXRhKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIGl0ZW0uZGlzcGxheTtcbiAgICB9XG5cbiAgICBvbkNob29zZUl0ZW0oaXRlbTogRmlsZU1vZGFsRGF0YSwgZXZ0OiBNb3VzZUV2ZW50IHwgS2V5Ym9hcmRFdmVudCk6IHZvaWQge1xuXG4gICAgfVxufVxuXG5jbGFzcyBDb21tYW5kTW9kYWwgZXh0ZW5kcyBGdXp6eVN1Z2dlc3RNb2RhbDxDb21tYW5kPiB7XG4gICAgcGx1Z2luOiBBZHZhbmNlZFVSSTtcbiAgICBmaWxlOiBzdHJpbmc7XG4gICAgY29uc3RydWN0b3IocGx1Z2luOiBBZHZhbmNlZFVSSSwgZmlsZT86IHN0cmluZykge1xuICAgICAgICBzdXBlcihwbHVnaW4uYXBwKTtcbiAgICAgICAgdGhpcy5wbHVnaW4gPSBwbHVnaW47XG4gICAgICAgIHRoaXMuZmlsZSA9IGZpbGU7XG4gICAgfVxuXG4gICAgZ2V0SXRlbXMoKTogQ29tbWFuZFtdIHtcbiAgICAgICAgY29uc3QgcmF3Q29tbWFuZHMgPSAodGhpcy5hcHAgYXMgYW55KS5jb21tYW5kcy5jb21tYW5kcztcbiAgICAgICAgY29uc3QgY29tbWFuZHM6IENvbW1hbmRbXSA9IE9iamVjdC5rZXlzKHJhd0NvbW1hbmRzKS5tYXAoZSA9PiB7XG4gICAgICAgICAgICByZXR1cm4geyBpZDogcmF3Q29tbWFuZHNbZV0uaWQsIG5hbWU6IHJhd0NvbW1hbmRzW2VdLm5hbWUgfTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBjb21tYW5kcztcbiAgICB9XG5cbiAgICBnZXRJdGVtVGV4dChpdGVtOiBDb21tYW5kKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIGl0ZW0ubmFtZTtcbiAgICB9XG5cbiAgICBvbkNob29zZUl0ZW0oaXRlbTogQ29tbWFuZCwgXzogTW91c2VFdmVudCB8IEtleWJvYXJkRXZlbnQpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5wbHVnaW4uY29weVVSSSh7XG4gICAgICAgICAgICBmaWxlcGF0aDogdGhpcy5maWxlLFxuICAgICAgICAgICAgY29tbWFuZGlkOiBpdGVtLmlkXG4gICAgICAgIH0pO1xuICAgIH1cbn1cblxuaW50ZXJmYWNlIFNlYXJjaE1vZGFsRGF0YSB7XG4gICAgc291cmNlOiBzdHJpbmc7XG4gICAgZGlzcGxheTogc3RyaW5nO1xuICAgIGlzUmVnRXg6IGJvb2xlYW47XG59XG5cbmNsYXNzIFNlYXJjaE1vZGFsIGV4dGVuZHMgU3VnZ2VzdE1vZGFsPFNlYXJjaE1vZGFsRGF0YT4ge1xuICAgIHBsdWdpbjogQWR2YW5jZWRVUkk7XG5cbiAgICBjb25zdHJ1Y3RvcihwbHVnaW46IEFkdmFuY2VkVVJJKSB7XG4gICAgICAgIHN1cGVyKHBsdWdpbi5hcHApO1xuICAgICAgICB0aGlzLnBsdWdpbiA9IHBsdWdpbjtcbiAgICAgICAgdGhpcy5zZXRQbGFjZWhvbGRlcihcIlNlYXJjaGVkIHRleHQuIFJlZ0V4IGlzIHN1cHBvcnRlZFwiKTtcbiAgICB9XG5cblxuICAgIGdldFN1Z2dlc3Rpb25zKHF1ZXJ5OiBzdHJpbmcpOiBTZWFyY2hNb2RhbERhdGFbXSB7XG4gICAgICAgIGlmIChxdWVyeSA9PT0gXCJcIikge1xuICAgICAgICAgICAgcXVlcnkgPSBcIi4uLlwiO1xuICAgICAgICB9XG4gICAgICAgIGxldCByZWdleDogUmVnRXhwO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgcmVnZXggPSBuZXcgUmVnRXhwKHF1ZXJ5KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHsgfVxuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHNvdXJjZTogcXVlcnksXG4gICAgICAgICAgICAgICAgaXNSZWdFeDogZmFsc2UsXG4gICAgICAgICAgICAgICAgZGlzcGxheTogcXVlcnlcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgc291cmNlOiBxdWVyeSxcbiAgICAgICAgICAgICAgICBkaXNwbGF5OiByZWdleCA/IGBBcyBSZWdFeDogJHtxdWVyeX1gIDogYENhbid0IHBhcnNlIFJlZ0V4YCxcbiAgICAgICAgICAgICAgICBpc1JlZ0V4OiB0cnVlXG4gICAgICAgICAgICB9XG4gICAgICAgIF07XG4gICAgfVxuXG4gICAgcmVuZGVyU3VnZ2VzdGlvbih2YWx1ZTogU2VhcmNoTW9kYWxEYXRhLCBlbDogSFRNTEVsZW1lbnQpOiB2b2lkIHtcbiAgICAgICAgZWwuaW5uZXJUZXh0ID0gdmFsdWUuZGlzcGxheTtcbiAgICB9O1xuXG4gICAgb25DaG9vc2VTdWdnZXN0aW9uKGl0ZW06IFNlYXJjaE1vZGFsRGF0YSwgXzogTW91c2VFdmVudCB8IEtleWJvYXJkRXZlbnQpOiB2b2lkIHtcblxuICAgIH07XG59XG5cbmNsYXNzIFJlcGxhY2VNb2RhbCBleHRlbmRzIFN1Z2dlc3RNb2RhbDxzdHJpbmc+IHtcbiAgICBwbHVnaW46IEFkdmFuY2VkVVJJO1xuXG4gICAgY29uc3RydWN0b3IocGx1Z2luOiBBZHZhbmNlZFVSSSwgcHJpdmF0ZSBzZWFyY2g6IFNlYXJjaE1vZGFsRGF0YSwgcHJpdmF0ZSBmaWxlcGF0aDogc3RyaW5nKSB7XG4gICAgICAgIHN1cGVyKHBsdWdpbi5hcHApO1xuICAgICAgICB0aGlzLnBsdWdpbiA9IHBsdWdpbjtcbiAgICAgICAgdGhpcy5zZXRQbGFjZWhvbGRlcihcIlJlcGxhY2VtZW50IHRleHRcIik7XG4gICAgfVxuXG5cbiAgICBnZXRTdWdnZXN0aW9ucyhxdWVyeTogc3RyaW5nKTogc3RyaW5nW10ge1xuICAgICAgICBpZiAocXVlcnkgPT09IFwiXCIpIHtcbiAgICAgICAgICAgIHF1ZXJ5ID0gXCIuLi5cIjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gW3F1ZXJ5XTtcbiAgICB9XG5cbiAgICByZW5kZXJTdWdnZXN0aW9uKHZhbHVlOiBzdHJpbmcsIGVsOiBIVE1MRWxlbWVudCk6IHZvaWQge1xuICAgICAgICBlbC5pbm5lclRleHQgPSB2YWx1ZTtcbiAgICB9O1xuXG4gICAgb25DaG9vc2VTdWdnZXN0aW9uKGl0ZW06IHN0cmluZywgXzogTW91c2VFdmVudCB8IEtleWJvYXJkRXZlbnQpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuc2VhcmNoLmlzUmVnRXgpIHtcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLmNvcHlVUkkoe1xuICAgICAgICAgICAgICAgIGZpbGVwYXRoOiB0aGlzLmZpbGVwYXRoLFxuICAgICAgICAgICAgICAgIHNlYXJjaHJlZ2V4OiB0aGlzLnNlYXJjaC5zb3VyY2UsXG4gICAgICAgICAgICAgICAgcmVwbGFjZTogaXRlbVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5jb3B5VVJJKHtcbiAgICAgICAgICAgICAgICBmaWxlcGF0aDogdGhpcy5maWxlcGF0aCxcbiAgICAgICAgICAgICAgICBzZWFyY2g6IHRoaXMuc2VhcmNoLnNvdXJjZSxcbiAgICAgICAgICAgICAgICByZXBsYWNlOiBpdGVtXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgfTtcbn0iXSwibmFtZXMiOlsib2JzaWRpYW4iLCJub3JtYWxpemVQYXRoIiwiTWFya2Rvd25WaWV3IiwicGFyc2VGcm9udE1hdHRlckVudHJ5IiwiTm90aWNlIiwiVEZpbGUiLCJhcHBIYXNEYWlseU5vdGVzUGx1Z2luTG9hZGVkIiwiZ2V0QWxsRGFpbHlOb3RlcyIsImdldERhaWx5Tm90ZSIsImNyZWF0ZURhaWx5Tm90ZSIsInV1aWR2NCIsIlBsdWdpbiIsIlNldHRpbmciLCJQbHVnaW5TZXR0aW5nVGFiIiwiU3VnZ2VzdE1vZGFsIiwiRnV6enlTdWdnZXN0TW9kYWwiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJLGFBQWEsR0FBRyxTQUFTLENBQUMsRUFBRSxDQUFDLEVBQUU7QUFDbkMsSUFBSSxhQUFhLEdBQUcsTUFBTSxDQUFDLGNBQWM7QUFDekMsU0FBUyxFQUFFLFNBQVMsRUFBRSxFQUFFLEVBQUUsWUFBWSxLQUFLLElBQUksVUFBVSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQ3BGLFFBQVEsVUFBVSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsS0FBSyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxNQUFNLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQzFHLElBQUksT0FBTyxhQUFhLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQy9CLENBQUMsQ0FBQztBQUNGO0FBQ08sU0FBUyxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRTtBQUNoQyxJQUFJLElBQUksT0FBTyxDQUFDLEtBQUssVUFBVSxJQUFJLENBQUMsS0FBSyxJQUFJO0FBQzdDLFFBQVEsTUFBTSxJQUFJLFNBQVMsQ0FBQyxzQkFBc0IsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsK0JBQStCLENBQUMsQ0FBQztBQUNsRyxJQUFJLGFBQWEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDeEIsSUFBSSxTQUFTLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDLEVBQUU7QUFDM0MsSUFBSSxDQUFDLENBQUMsU0FBUyxHQUFHLENBQUMsS0FBSyxJQUFJLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ3pGLENBQUM7QUF1Q0Q7QUFDTyxTQUFTLFNBQVMsQ0FBQyxPQUFPLEVBQUUsVUFBVSxFQUFFLENBQUMsRUFBRSxTQUFTLEVBQUU7QUFDN0QsSUFBSSxTQUFTLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxPQUFPLEtBQUssWUFBWSxDQUFDLEdBQUcsS0FBSyxHQUFHLElBQUksQ0FBQyxDQUFDLFVBQVUsT0FBTyxFQUFFLEVBQUUsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUU7QUFDaEgsSUFBSSxPQUFPLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxPQUFPLENBQUMsRUFBRSxVQUFVLE9BQU8sRUFBRSxNQUFNLEVBQUU7QUFDL0QsUUFBUSxTQUFTLFNBQVMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLEVBQUUsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFO0FBQ25HLFFBQVEsU0FBUyxRQUFRLENBQUMsS0FBSyxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLEVBQUUsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFO0FBQ3RHLFFBQVEsU0FBUyxJQUFJLENBQUMsTUFBTSxFQUFFLEVBQUUsTUFBTSxDQUFDLElBQUksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQyxFQUFFO0FBQ3RILFFBQVEsSUFBSSxDQUFDLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLFVBQVUsSUFBSSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0FBQzlFLEtBQUssQ0FBQyxDQUFDO0FBQ1AsQ0FBQztBQUNEO0FBQ08sU0FBUyxXQUFXLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRTtBQUMzQyxJQUFJLElBQUksQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDckgsSUFBSSxPQUFPLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsT0FBTyxNQUFNLEtBQUssVUFBVSxLQUFLLENBQUMsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQUcsV0FBVyxFQUFFLE9BQU8sSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUM3SixJQUFJLFNBQVMsSUFBSSxDQUFDLENBQUMsRUFBRSxFQUFFLE9BQU8sVUFBVSxDQUFDLEVBQUUsRUFBRSxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFO0FBQ3RFLElBQUksU0FBUyxJQUFJLENBQUMsRUFBRSxFQUFFO0FBQ3RCLFFBQVEsSUFBSSxDQUFDLEVBQUUsTUFBTSxJQUFJLFNBQVMsQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDO0FBQ3RFLFFBQVEsT0FBTyxDQUFDLEVBQUUsSUFBSTtBQUN0QixZQUFZLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQ3pLLFlBQVksSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNwRCxZQUFZLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUN6QixnQkFBZ0IsS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsTUFBTTtBQUM5QyxnQkFBZ0IsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsT0FBTyxFQUFFLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxDQUFDO0FBQ3hFLGdCQUFnQixLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTO0FBQ2pFLGdCQUFnQixLQUFLLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxTQUFTO0FBQ2pFLGdCQUFnQjtBQUNoQixvQkFBb0IsSUFBSSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBRTtBQUNoSSxvQkFBb0IsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRTtBQUMxRyxvQkFBb0IsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFO0FBQ3pGLG9CQUFvQixJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUU7QUFDdkYsb0JBQW9CLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDMUMsb0JBQW9CLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENB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QUFFLEVBQUUsQ0FBQyxFQUFFO0FBQzlCLEVBQUUsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLEVBQUUsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3JELENBQUM7QUFDRDtBQUNBLFNBQVMsU0FBUyxDQUFDLEdBQUcsRUFBRTtBQUN4QixFQUFFLElBQUksTUFBTSxHQUFHLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsS0FBSyxTQUFTLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNyRjtBQUNBO0FBQ0EsRUFBRSxJQUFJLElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUMsR0FBRyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsU0FBUyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUMsR0FBRyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxTQUFTLENBQUMsR0FBRyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLFNBQVMsQ0FBQyxHQUFHLENB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
