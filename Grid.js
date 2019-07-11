export default class Grid {
	constructor(domNode) {
		this.domNode = domNode;
		this.grid = [];
		this.currentRow = 0;
		this.currentColumn = 0;
		this.navigationDisabled = false;

		this.keyCode = Object.freeze({
			PAGEUP: 33,
			PAGEDOWN: 34,
			END: 35,
			HOME: 36,
			LEFT: 37,
			UP: 38,
			RIGHT: 39,
			DOWN: 40,
			CTRL: 17
		});
	}

	init() {
		this.grid = this.setUpGridModel();
		this.setUpBoundariesBehavior();
		this.addEventListeners();
		this.grid[0][0].setAttribute('tabindex', '0');
	}

	reinit() {
		this.grid = this.setUpGridModel();
		this.grid[0][0].setAttribute('tabindex', '0');
	}

	addEventListeners() {
		this.handleKeydown = this.handleKeydown.bind(this);
		this.handleClick = this.handleClick.bind(this);

		this.domNode.addEventListener('keydown', this.handleKeydown);
		this.domNode.addEventListener('click', this.handleClick);
	}

	handleKeydown(event) {
		if (!event || this.navigationDisabled) {
			return;
		}
		let preventEventActions = false;

		switch (event.keyCode) {
			case this.keyCode.UP:
				this.moveFocusTo(this.currentRow - 1, this.currentColumn);
				preventEventActions = true;
				break;

			case this.keyCode.DOWN:
				this.moveFocusTo(this.currentRow + 1, this.currentColumn);
				preventEventActions = true;
				break;

			case this.keyCode.LEFT:
				this.moveFocusTo(this.currentRow, this.currentColumn - 1);
				preventEventActions = true;
				break;

			case this.keyCode.RIGHT:
				this.moveFocusTo(this.currentRow, this.currentColumn + 1);
				preventEventActions = true;
				break;

			case this.keyCode.HOME:
				this.moveFocusTo(event.ctrlKey ? 0 : this.currentRow, 0);
				preventEventActions = true;
				break;

			case this.keyCode.END:
				this.moveFocusTo(
					event.ctrlKey ? (this.grid.length - 1) : this.currentRow,
					this.grid[this.currentRow].length - 1
				);
				preventEventActions = true;
				break;

			default:
				break;
		}

		if (preventEventActions) {
			event.stopPropagation();
			event.preventDefault();
		}
	}

	handleClick() {
		let cell;
		cell = this.findNodeInGrid(document.activeElement); // Chrome focus gridcell even if it has tabindex=-1
		this.moveFocusTo(cell.row, cell.col);
	}

	moveFocusTo(row, column) {
		// This is bounds logic if all ok we just move focus to requested X:Y
		let moveToRow = row;
		let moveToColumn = column;

		// Lets handle default behaviour until altering is required
		switch (this.rowsBounds) {
			case 'loop':
				moveToRow = this.rowLoop(row);
				break;
			default:
				moveToRow = this.rowStop(row);
		}

		switch (this.colsBounds) {
			case 'loop':
				moveToColumn = this.columnLoop(column);
				break;
			default:
				moveToColumn = this.columnStop(column);
		}

		// Altering requested position if Wrap options is enabled
		if (this.rowsBounds === 'wrap') {
			// if this last column in row move to the next row
			const alteredControl = this.rowWrap(column, row);
			if (alteredControl) {
				moveToColumn = alteredControl.alteredCol;
				moveToRow = alteredControl.alteredRow;
			}
		}

		if (this.colsBounds === 'wrap') {
			// if this row is last move to the first row and next column
			const alteredControl = this.columnWrap(column, row);
			if (alteredControl) {
				moveToColumn = alteredControl.alteredCol;
				moveToRow = alteredControl.alteredRow;
			}
		}

		Grid.blurCell(this.grid[this.currentRow][this.currentColumn]);
		Grid.focusCell(this.grid[moveToRow][moveToColumn]);

		this.currentRow = moveToRow;
		this.currentColumn = moveToColumn;
	}

	rowStop(row) {
		const rowLength = this.grid.length - 1;

		if (row < 0) {
			return 0;
		} else if (row > rowLength) {
			return rowLength;
		}

		return row;
	}

	rowLoop(row) {
		const rowLength = this.grid.length - 1;

		if (row < 0) {
			return rowLength;
		} else if (row > rowLength) {
			return 0;
		}

		return row;
	}

	rowWrap(column, row) {
		const colsTotal = this.grid[this.currentRow].length - 1;

		if (column < 0) {
			return {
				alteredRow: this.rowLoop(row - 1),
				alteredCol: this.columnLoop(column)
			};
		} else if (column > colsTotal) {
			return {
				alteredRow: this.rowLoop(row + 1),
				alteredCol: this.columnLoop(column)
			};
		}

		return null;
	}

	columnStop(column) {
		const colsLength = this.grid[this.currentRow].length - 1;

		if (column < 0) {
			return 0;
		} else if (column > colsLength) {
			return colsLength;
		}

		return column;
	}

	columnLoop(column) {
		const colsLength = this.grid[this.currentRow].length - 1;

		if (column < 0) {
			return colsLength;
		} else if (column > colsLength) {
			return 0;
		}

		return column;
	}

	columnWrap(column, row) {
		const rowLength = this.grid.length - 1;

		if (row < 0) {
			return {
				alteredRow: this.rowLoop(row),
				alteredCol: this.columnLoop(column - 1)
			};
		} else if (row > rowLength) {
			return {
				alteredRow: this.rowLoop(row),
				alteredCol: this.columnLoop(column + 1)
			};
		}

		return null;
	}

	static focusCell(domNode) {
		domNode.setAttribute('tabindex', '0');
		domNode.focus();
	}

	static blurCell(domNode) {
		domNode.setAttribute('tabindex', '-1');
	}

	findNodeInGrid(domNode) {
		for (let row = 0; row < this.grid.length; row++) {
			for (let col = 0; col < this.grid[row].length; col++) {
				if (this.grid[row][col] === domNode) {
					return { row, col };
				}
			}
		}
	}

	setUpGridModel() {
		const grid = [];

		// Make model with inactive cells
		this.domNode.querySelectorAll('[role=row]').forEach(row => {
			const cells = [];

			row.querySelectorAll('[role=gridcell]').forEach(cell => {
				// check if cell is not hidden
				if (cell.hasAttribute('data-roving-tab-target') || cell.hasAttribute('tabindex')) {
					cell.tabIndex = -1;
					cells.push(cell);
				} else {
					const focusableCell = cell.querySelector('[tabindex], [data-roving-tab-target]');
					if (focusableCell) {
						focusableCell.tabIndex = -1;
						cells.push(focusableCell);
					}
				}
			});

			if (cells.length) {
				grid.push(cells);
			}
		});

		return grid;
	}

	setUpBoundariesBehavior() {
		this.wrapRows = this.getSettingAttributeValue('data-wrap-rows');
		this.wrapCols = this.getSettingAttributeValue('data-wrap-cols');
		this.loopRows = this.getSettingAttributeValue('data-loop-rows');
		this.loopCols = this.getSettingAttributeValue('data-loop-cols');

		switch (true) {
			case this.wrapRows:
				this.rowsBounds = 'wrap';
				break;
			case this.loopRows:
				this.rowsBounds = 'loop';
				break;
			default:
				this.rowsBounds = 'stop';
		}

		switch (true) {
			case this.wrapCols:
				this.colsBounds = 'wrap';
				break;
			case this.loopCols:
				this.colsBounds = 'loop';
				break;
			default:
				this.colsBounds = 'stop';
		}
	}

	getSettingAttributeValue(attrName) {
		const attr = this.domNode.getAttribute(attrName);
		return attr && attr !== 'false';
	}

	destroy() {
		this.domNode.removeEventListener('keydown', this.handleKeydown);
		this.domNode.removeEventListener('click', this.handleClick);
		this.domNode.querySelectorAll('[data-roving-tab-target]').forEach(item => {
			item.tabIndex = 0;
		});
	}
}
