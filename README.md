# ARIA FocusHighlighter

Highlight focus only in case where user use keyboard. So you could hide all `:focus` state for regular user.

0-dependency, vanilla JS, development oriented module.

This module designed as development component, not as copy-and-past module, so you should init it in you
project in you own way and use as extend point. It is not "just add water" component.

## Initialization

You could initialize this component in this way:

```js
const FocusHighlighter = require('FocusHighlighter');
new FocusHighlighter(document.querySelector('[data-js-highlighter]')).init();
```
