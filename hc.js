function registerHealthCheck(myurl) {
    if (typeof window.registerHealthcheckResult === 'function') {
        window.registerHealthcheckResult(myurl, true, 'File loaded successfully');
        console.log('Healthcheck registered for ' + myurl);
    } else {
        console.warn('registerHealthcheckResult not available for ' + myurl);
    }
}

(function() {
  const myURL = document.currentScript && document.currentScript.src ? document.currentScript.src : window.location.href;
  if (typeof window.registerHealthcheckResult === 'function') {
    window.registerHealthcheckResult(myURL, true, 'File loaded successfully');
    console.log('Healthcheck registered for ' + myURL);
  } else {
    console.warn('registerHealthcheckResult not available for ' + myURL);
  }
})();