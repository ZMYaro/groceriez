'use strict';

var GROCERIES_BOARD_ID = 'uO26DySr',
	GET_LIST_ID = '55a4080d3d59ac0e523f7992',
	MAYBE_LIST_ID = '55a407b199712e482a4a342d',
	TRELLO_BOARD_GET_URL = '/boards/' + GROCERIES_BOARD_ID,
	TRELLO_CARDS_GET_URL = '/boards/' + GROCERIES_BOARD_ID + '/cards';

var getList = [],
	maybeList = [],
	labels = [],
	authBtn,
	progressBar;

Array.from =
	Array.from ||
	function (arrLike) { return Array.prototype.slice.call(arrLike); };

window.onload = function () {
	authBtn = document.getElementById('auth-btn');
	progressBar = document.getElementById('progress-bar');
	
	var trelloAuthParams = {
		type: 'popup',
		name: 'GrocerieZ',
		persist: true,
		interactive: false,
		scope: {
			read: true,
			write: false,
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
};

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
		labels.push(labelCheckbox);
	});
	
	progressBar.value = 3;
	
	Trello.get(TRELLO_CARDS_GET_URL, {}, handleItemsSuccess, handleItemsFailure);
}
function handleItemsSuccess(items) {
	progressBar.value = 4;
	
	var getItems = [],
		maybeItems = [];
	
	items.forEach(function (item) {
		if (item.idList === GET_LIST_ID) {
			addCardToList(item, getItems);
		} else if (item.idList === MAYBE_LIST_ID) {
			addCardToList(item, maybeItems);
		}
	});
	
	getItems.sort((a, b) => a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1);
	maybeItems.sort((a, b) => a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1);
	
	setUpDOM(getItems, maybeItems);
}

function addCardToList(card, list) {
	list.push({
		name: card.name,
		labels: card.labels.map(label => label.name)
	});
}
function addItemToDOM(item, list) {
	var listItem = document.createElement('li');
	listItem.textContent = item.name;
	listItem.dataset.labels = JSON.stringify(item.labels);
	list.appendChild(listItem);
}

function setUpDOM(getItems, maybeItems) {
	progressBar.value = 5;
	
	getList = document.getElementById('get-list');
	maybeList = document.getElementById('maybe-list');
	
	getItems.forEach(function (item) {
		addItemToDOM(item, getList);
	});
	maybeItems.forEach(function (item) {
		addItemToDOM(item, maybeList);
	});
	
	progressBar.value = 6;
	
	// Hide the load bar and show the content.
	document.getElementById('load-card').style.display = 'none';
	document.getElementById('content-card').style.display = 'block';
}

function updateUI() {
	var activeLabels = [];
	
	labels.forEach((label) => {
		if (label.checked) {
			activeLabels.push(label.value);
		}
	});
	
	var combinedLists =
		Array.from(getList.children)
		.concat(Array.from(maybeList.children));
	for (var item of combinedLists) {
		// Start the item hidden.
		item.style.display = 'none';
		for (var label of JSON.parse(item.dataset.labels)) {
			if (activeLabels.indexOf(label) !== -1) {
				// If the label is active, show the item.
				item.style.removeProperty('display');
				break;
			}
		}
	}
}