/**
 * Module dependencies.
 */

var FormData = require('form-data')
  , exec = require('child_process').exec;

/*
 * Copy URL to clipboard and notify the user.
 */

function handlePastieURL(url, isPublic) {
  pubStr = (isPublic === true) ? 'Public' : 'Private';

  if (!url) return;

  Clipboard.copy(url);

  if (typeof Alert.notify !== 'undefined') {
    Alert.notify({
      title: pubStr + " Pastie Created",
      subtitle: url,
      body: "The URL has been copied to your clipboard.",
      button: "Show",
      callback: function () {
        exec('/usr/bin/open "' + url + '"', function(err, stdout, stderr) {});
      }
    });
  } else {
    Alert.show(pubStr + ' Pastie Created', url, ['OK']);
  }
}

/**
 * Create a new pastie with the given `options`.
 */

function createPastie(options) {
  var isPublic = (typeof options.pub !== 'undefined') ? options.pub : true;
  
  Recipe.run(function(recipe) {
    var sel = (!recipe.selection.length)? new Range(0, recipe.length) : recipe.selection
      , output = ''
      , text = recipe.textInRange(sel)
      , form = new FormData();
    
    form.append('paste[body]', text);
    form.append('paste[authorization]', 'burger');
    form.append('paste[restricted]', (isPublic === true)? '0' : '1');
    form.submit('http://www.pastie.org/pastes', function(err, res) {
      if (err) {
       Alert.show('Failed to send to Pastie.', err.message, ['OK']);
       Alert.beep();
       return; 
      }
      
      if (res.statusCode !== 302) {
        Alert.show('Failed to send to Pastie. (' + res.statusCode + ')', '', ['OK']);
        return;
      }
  
      if (res.headers.location) {
       handlePastieURL(res.headers.location, isPublic); 
      }
    });
  });
}

/**
 * Hook up menu items.
 */

Hooks.addMenuItem('Text/Lines/Send to Pastie (Public)', 'control-command-shift-p', function() {
  createPastie({ pub: true });
});

Hooks.addMenuItem('Text/Lines/Send to Pastie (Private)', 'control-command-shift-o', function() {
  createPastie({ pub: false });
});