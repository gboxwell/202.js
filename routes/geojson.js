/*
 * GET geojson page.
 */

exports.list = function(req, res){
  res.render('geojson', { title: '200.js' });
};