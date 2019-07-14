# aria-grid

WAI ARIA 1.1 conf implementation of "Layout Grid" pattern.

## Specs

Please see all specs here http://w3c.github.io/aria-practices/#grid

https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/Row_Role

## Known limitations

It required "symmetrical" grid to work. So if you have 2 column in first row it should be 2 column all other rows.

It is cover all standard cases, but not cover real tables and grid with presentational elements like Calendar grid.

## Usage

You could initialize this component in this way:

```js
import Grid from './Grid.js';
document.querySelectorAll('[role="grid"]').forEach(grid => new Grid(grid).init())
```

### Markup

Roles `grid`, `row` and `gridcell` is required. 
Also all focusable elements should have `tabindex="-1"`, but it is not good from fault tolerance perspective. 
So it is done as progressive enhancement. We use `data-roving-tab-target` to convert item to `tabindex="-1"`.

```html
<div role="grid" data-wrap-cols="true">
	<div role="row" class="grid">
		<div role="gridcell" data-roving-tab-target>
			A
		</div>
		<div role="gridcell" data-roving-tab-target>
			B
		</div>
	</div>
</div>
```

### Grid with interactive elements

Move `data-roving-tab-target` from cell to focusable elements to make it focusable when focus moved to the cell. Ex:

```html
<div role="grid" data-wrap-cols="true">
	<div role="row" class="grid">
		<div role="gridcell" data-roving-tab-target>
			A
		</div>
		<div role="gridcell">
			<a data-roving-tab-target href="some.html">Help center</a>
		</div>
	</div>
</div>
```

## Options

Currently it implement 3 behaviour on column end:

1) Stop (default). Just stop when reach the end. Used when data is not the same type.
2) Loop `data-loop-cols` || `data-loop-rows`. Move to the start when reach the end. Used when row or column has the same type of data.
3) Wrap `data-wrap-cols` || `data-wrap-rows`. Move to the next row/col when reach the end. Used when columns and rows has the same type of data.

Ex:

```html
<div role="grid" data-wrap-cols="true" data-wrap-rows="true"></div>
```
