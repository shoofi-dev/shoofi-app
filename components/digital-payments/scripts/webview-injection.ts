import { digitalPaymentWebViewCSS } from '../styles/webview-styles';

// JavaScript code to inject CSS and fonts into the WebView
export const digitalPaymentInjectedJS = `
  (function() {
    // Add Google Fonts preconnect links
    var preconnect1 = document.createElement('link');
    preconnect1.rel = 'preconnect';
    preconnect1.href = 'https://fonts.googleapis.com';
    document.head.appendChild(preconnect1);
    
    var preconnect2 = document.createElement('link');
    preconnect2.rel = 'preconnect';
    preconnect2.href = 'https://fonts.gstatic.com';
    preconnect2.crossOrigin = 'anonymous';
    document.head.appendChild(preconnect2);
    
    // Add Tajawal font link
    var fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Tajawal:wght@200;300;400;500;700;800;900&display=swap';
    document.head.appendChild(fontLink);
    
    // Add custom CSS styles
    var style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = \`${digitalPaymentWebViewCSS}\`;
    document.head.appendChild(style);
    
    // Optional: Hide loading screen faster
    setTimeout(function() {
      var loadingElements = document.querySelectorAll('.loading, .spinner, .loader');
      loadingElements.forEach(function(el) {
        el.style.display = 'none';
      });
    }, 1000);
  })();
  true; // Required for iOS
`; 