async function main() {
  // We defined this function in our schema.
  await browser.overlay.register("chrome://messenger/content/messenger.xul", "overlays/messenger.xul");        
  await browser.overlay.activate();
};

main();
