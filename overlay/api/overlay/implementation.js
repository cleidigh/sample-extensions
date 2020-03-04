/* eslint-disable object-shorthand */

// Get various parts of the WebExtension framework that we need.
var { ExtensionCommon } = ChromeUtils.import("resource://gre/modules/ExtensionCommon.jsm");

// You probably already know what this does.
var { Services } = ChromeUtils.import("resource://gre/modules/Services.jsm");

// ChromeUtils.import() works in experiments for core resource urls as it did
// in legacy add-ons. However, chrome:// urls that point to add-on resources no
// longer work, as the "chrome.manifest" file is no longer supported, which
// defined the root path for each add-on. Instead, ChromeUtils.import() needs
// a moz-extension:// url, which can access any resource in an add-on:
//
// moz-extension://<Add-On-UUID>/path/to/modue.jsm
//
// The add-on UUID is a random identifier generated on install for each add-on.
// The extension object of the WebExtension has a getURL() method, to get the
// required url:
//
// let mozExtensionUrl = extension.getURL("path/to/module.jsm");
//
// You can get the extension object from the context parameter passed to
// getAPI() of the WebExtension experiment implementation:
//
// let extension = context.extension;
//
// or you can generate the extension object from a given add-on ID as shown in
// the example below. This allows you to import JSM without context, for example
// inside another JSM.
//
var { ExtensionParent } = ChromeUtils.import("resource://gre/modules/ExtensionParent.jsm");
var OM = null;
var extension = null;

// This is the important part. It implements the functions and events defined in schema.json.
// The variable must have the same name you've been using so far, "overlay" in this case.
var overlay = class extends ExtensionCommon.ExtensionAPI {
  getAPI(context) {
    extension = context.extension;
    var { OverlayManager } = ChromeUtils.import(extension.getURL("api/overlay/OverlayManager.jsm"));

// To be notified of the extension going away, call callOnClose with any object that has a
    // close function, such as this one.
    context.callOnClose(this);
    OM = new OverlayManager({verbose: 0});
    
    return {
      overlay: {

        activate: async function(name) {
          OM.startObserving();
        },

        deactivate: async function(name) {
          OM.stopObserving();
        },

        register: async function(dst, overlay) {
          await OM.registerOverlay(dst, extension.getURL(overlay));
        }

      },
    };
  }

  close() {
    // This function is called if the extension is disabled or removed, or Thunderbird closes.
    // We registered it with callOnClose, above.
    console.log("Goodbye world!");
    OM.stopObserving();

    // Unload the JSM we imported above. This will cause Thunderbird to forget about the JSM, and
    // load it afresh next time `import` is called. (If you don't call `unload`, Thunderbird will
    // remember this version of the module and continue to use it, even if your extension receives
    // an update.) You should *always* unload JSMs provided by your extension.
    Cu.unload(extension.getURL("api/overlay/OverlayManager.jsm"));
  }
};
