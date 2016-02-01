// beacon_demo.js

function captureAnalyticsData(event) {
  return 'sample data';
}

window.addEventListener('unload', function(event) {
  var data = captureAnalyticsData(event);

  if (navigator.sendBeacon) {
	navigator.sendBeacon('/log', data);
  }
});
