/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";

const {watchWindows, unloadWindow} = require("sdk/windows");

function appendNotification(message, type) {
  if (type == "plugin-hidden") {
    log(LOG_DEBUG, "killed notification");
    return;
  }
  return this._nopluginbar_appendNotification.apply(this, arguments);
}

watchWindows("chrome://browser/content/browser.xul", function(window) {
  const {gBrowser} = window;
  const getNotificationBox = gBrowser.getNotificationBox;
  gBrowser.getNotificationBox = function() {
    let rv = getNotificationBox.apply(gBrowser, arguments);
    if (rv && rv.appendNotification &&
        rv.appendNotification !== appendNotification) {
      rv._nopluginbar_appendNotification = rv.appendNotification;
      rv.appendNotification = appendNotification;
      unloadWindow(window, function() {
        rv.appendNotification = rv._nopluginbar_appendNotification;
      });
      log(LOG_DEBUG, "hijacked appendNotification");
    }
    return rv;
  };
  unloadWindow(window, function() {
    gBrowser.getNotificationBox = getNotificationBox;
  });
});

/* vim: set et ts=2 sw=2 : */
