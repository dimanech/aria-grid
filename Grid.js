export default class Grid {
	constructor(domNode) {
		this.domNode = domNode;
		this.wrapRows = this.getSetting('data-wrap-rows') || false;
		this.wrapCols = this.getSetting('data-wrap-cols') || false;

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
		this.addEventListeners();
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
		let moveToRow = row;
		let moveToCol = column;

		if (this.wrapRows) {
			if (row < 0) {
				moveToRow = this.grid.length - 1;
			} else if (row > this.grid.length - 1) {
				moveToRow = 0;
			}
		} else {
			if (row < 0) {
				moveToRow = 0;
			} else if (row > this.grid.length - 1) {
				moveToRow = this.grid.length - 1;
			}
		}

		if (this.wrapCols) {
			if (column < 0) {
				moveToCol = this.grid[this.currentRow].length - 1;
			} else if (column > this.grid[this.currentRow].length - 1) {
				moveToCol = 0;
			}
		} else {
			if (column < 0) {
				moveToCol = 0;
			} else if (column > this.grid[this.currentRow].length - 1) {
				moveToCol = this.grid[this.currentRow].length - 1;
			}
		}

		this.focusCell(this.grid[moveToRow][moveToCol]);
		this.blurCell(this.grid[this.currentRow][this.currentColumn]);

		this.currentRow = moveToRow;
		this.currentColumn = moveToCol;
	}

	focusCell(domNode) {
		domNode.setAttribute('tabindex', '0');
		domNode.focus();
	}

	blurCell(domNode) {
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

		this.domNode.querySelectorAll('[role=row]').forEach(row => {
			const cells = [];

			row.querySelectorAll('[role=gridcell]').forEach(cell => {
				// check if cell is not hidden
				if (cell.hasAttribute('tabindex')) {
					cells.push(cell);
				} else {
					const focusableCell = cell.querySelector('[tabindex]');

					if (focusableCell) {
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

	getSetting(attrName) {
		const attr = this.domNode.getAttribute(attrName);
		return attr && attr === 'true';
	}

	destroy() {
		this.domNode.removeEventListener('keydown', this.handleKeydown);
		this.domNode.removeEventListener('click', this.handleClick);
	}
}
