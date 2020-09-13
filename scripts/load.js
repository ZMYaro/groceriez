'use strict';

var GROCERIES_BOARD_ID = 'uO26DySr',
	GET_LIST_ID = '55a4080d3d59ac0e523f7992',
	MAYBE_LIST_ID = '55a407b199712e482a4a342d',
	TRELLO_BOARD_GET_URL = '/boards/' + GROCERIES_BOARD_ID,
	TRELLO_CARDS_GET_URL = '/boards/' + GROCERIES_BOARD_ID + '/cards';

var getItems = [],
	maybeItems = [],
	labelToggles = [],
	authBtn,
	progressBar;

getItems.id = GET_LIST_ID;
maybeItems.id = MAYBE_LIST_ID;

Array.from =
	Array.from ||
	function (arrLike) { return Array.prototype.slice.call(arrLike); };

window.addEventListener('load', function () {
	authBtn = document.getElementById('auth-btn');
	progressBar = document.getElementById('progress-bar');
	
	var trelloAuthParams = {
		type: 'popup',
		name: 'GrocerieZ',
		persist: true,
		interactive: false,
		scope: {
			read: true,
			write: true,
			account: false
		},
		expiration: 'never',
		success: handleAuthSuccess,
		error: function () {
			// If silent auth fails, try interactive auth.
			trelloAuthParams.interactive = true;
			authBtn.onclick = function () {
				authBtn.disabled = true;
				progressBar.value = 0;
				
				Trello.authorize(trelloAuthParams);
			};
			authBtn.style.display = 'inline-block';
		}
	};
	
	Trello.authorize(trelloAuthParams);
});

function handleAuthFailure(err) {
	if (typeof(err) !== 'undefined') {
		console.error(err);
	}
	alert('Failed to authorize :(');
}
function handleBoardFailure(err) {
	if (typeof(err) !== 'undefined') {
		console.error(err);
	}
	alert('Failed to get items board :(');
}
function handleItemsFailure(err) {
	if (typeof(err) !== 'undefined') {
		console.error(err);
	}
	alert('Failed to get items list :(');
}
function handleAuthSuccess() {
	authBtn.style.display = 'none';
	progressBar.value = 1;
	
	Trello.get(TRELLO_BOARD_GET_URL, {}, handleBoardSuccess, handleBoardFailure);
}
function handleBoardSuccess(board) {
	progressBar.value = 2;
	
	var labelNames = Object.values(board.labelNames)
		.filter(label => label !== '')
		.sort((a, b) => a.toLowerCase() < b.toLowerCase() ? -1 : 1);
	
	var labelsContainer = document.getElementById('labels');
	labelNames.forEach((labelText) => {
		var listItem = document.createElement('li'),
			labelElement = document.createElement('label'),
			labelCheckbox = document.createElement('input');
		
		labelCheckbox.type = 'checkbox';
		labelCheckbox.style.float = 'right';
		labelCheckbox.value = labelText;
		labelCheckbox.checked = true;
		labelCheckbox.onchange = updateUI;
		
		labelElement.setAttribute('role', 'button');
		labelElement.appendChild(labelCheckbox);
		labelElement.insertAdjacentHTML('beforeend', labelText);
		
		listItem.appendChild(labelElement);
		labelsContainer.appendChild(listItem);
		labelToggles.push(labelCheckbox);
	});
	
	progressBar.value = 3;
	
	Trello.get(TRELLO_CARDS_GET_URL, {}, handleItemsSuccess, handleItemsFailure);
}
function handleItemsSuccess(items) {
	progressBar.value = 4;
	
	items.forEach(function (item) {
		if (item.idList === GET_LIST_ID) {
			addCardToList(item, getItems);
		} else if (item.idList === MAYBE_LIST_ID) {
			addCardToList(item, maybeItems);
		} else if (item.idList === CART_LIST_ID) {
			addCardToList(item, cartItems);
		}
	});
	
	getItems.sort((a, b) => a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1);
	maybeItems.sort((a, b) => a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1);
	cartItems.sort((a, b) => a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1);
	
	setUpDOM();
}

function addCardToList(card, list) {
	list.push({
		id: card.id,
		name: card.name,
		elem: undefined,
		labels: card.labels
			.map(label => label.name)
			.sort((a, b) => a.toLowerCase() < b.toLowerCase() ? -1 : 1)
	});
}
function addItemToDOM(item, list) {
	var listItem = document.createElement('li'),
		actionBtn = document.createElement('button');
	listItem.textContent = item.name;
	listItem.dataset.labels = JSON.stringify(item.labels);
	actionBtn.innerHTML = (list === cartItems.elem ? CART_REMOVE_ICON_SVG : CART_ADD_ICON_SVG);
	actionBtn.onclick = (list === cartItems.elem ? () => initRemoveFromCart(item) : () => initAddToCart(item));
	actionBtn.style.float = 'right';
	listItem.appendChild(actionBtn);
	list.appendChild(listItem);
	
	item.elem = listItem;
	item.actionBtn = actionBtn;
}

function setUpDOM() {
	progressBar.value = 5;
	
	getItems.elem = document.getElementById('get-list');
	maybeItems.elem = document.getElementById('maybe-list');
	
	getItems.forEach(function (item) {
		addItemToDOM(item, getItems.elem);
		item.originalList = getItems;
	});
	maybeItems.forEach(function (item) {
		addItemToDOM(item, maybeItems.elem);
		item.originalList = maybeItems;
	});
	cartItems.forEach(function (item) {
		addItemToDOM(item, cartItems.elem);
		item.originalList = getItems;
	});
	
	progressBar.value = 6;
	
	// Hide the load bar and show the content.
	document.getElementById('load-card').style.display = 'none';
	document.getElementById('content-card').style.display = 'block';
	document.getElementById('cart-card').style.display = 'block';
}

function updateUI() {
	var activeLabels = [];
	labelToggles.forEach((label) => {
		if (label.checked) {
			activeLabels.push(label.value);
		}
	});
	
	var combinedItems = getItems.concat(maybeItems);
	for (var item of combinedItems) {
		// Start the item hidden.
		item.elem.style.display = 'none';
		for (var label of item.labels) {
			if (activeLabels.indexOf(label) !== -1) {
				// If the label is active, show the item.
				item.elem.style.removeProperty('display');
				break;
			}
		}
	}
}